import { recordMovementService } from "../../inventory/services/record-movement.service";
import {
  createSale,
  createSaleItem,
  updateSaleTotal,
} from "../repositories/create-sale.repository";
import {
  createCheckoutCustomer,
  findCustomerByEmail,
  findCustomerById,
} from "../repositories/customer.repository";
import {
  decrementProductStock,
  findProductForSale,
} from "../repositories/stock-sale.repository";
import { executeSaleTransaction } from "../repositories/transaction.repository";
import type {
  CreateSaleInput,
  CreateSaleServiceInput,
  SaleProductRow,
} from "../sales.type";

/** Servicio de ventas: valida reglas y coordina la transacción SQL. */
export class VentaService {
  static #validarVencimiento(product: SaleProductRow) {
    if (!product.expiration_date) {
      return;
    }

    const dateValue = product.expiration_date as string | Date;
    const expirationDate = dateValue instanceof Date
      ? new Date(dateValue)
      : new Date(`${dateValue.slice(0, 10)}T00:00:00`);
    expirationDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expirationDate < today) {
      throw new Error(`El producto ${product.name} esta vencido`);
    }
  }

  static async crear(data: CreateSaleServiceInput) {
    const { customerId, customer: customerData, delivery, items, notes } = data;

    if (customerData) {
      const { fullName, phone, email, address } = customerData;
      if (typeof fullName !== "string" || !fullName.trim() || fullName.length > 200 ||
        typeof phone !== "string" || !phone.trim() || phone.length > 20 ||
        typeof email !== "string" || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (address !== undefined && (typeof address !== "string" || address.length > 150))) {
        throw new Error("Los datos del cliente no son válidos");
      }
      customerData.email = email.trim().toLowerCase();
    }
    if (delivery && Object.entries(delivery).some(([key, value]) => {
      const limits: Record<string, number> = { address: 180, neighborhood: 100, city: 100, note: 2000 };
      return !(key in limits) || (value !== undefined && (typeof value !== "string" || value.length > limits[key]!));
    })) {
      throw new Error("Los datos de entrega no son válidos");
    }
    if (notes !== undefined && (typeof notes !== "string" || notes.length > 2000)) throw new Error("Las notas no son válidas");

    if (!customerId && !customerData) {
      throw new Error("Los datos del cliente son obligatorios");
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      throw new Error("La venta debe tener al menos un producto");
    }
    if (new Set(items.map((item) => Number(item.productId))).size !== items.length) {
      throw new Error("No repitas productos; modifica la cantidad de la línea existente");
    }
    if (data.checkoutQuote && (data.checkoutQuote.items.length !== items.length || data.checkoutQuote.expiresAt <= Date.now())) {
      throw new Error("El carrito o la cotización cambiaron; vuelve a cotizar");
    }

    return executeSaleTransaction(async (client) => {
      let customer = null;

      if (customerId !== undefined) {
        if (!customerId || Number.isNaN(customerId)) {
          throw new Error("El cliente es obligatorio");
        }

        customer = await findCustomerById(customerId, client);
      }

      if (!customer && customerData) {
        const { fullName, phone, email, address } = customerData;

        if (!fullName || !phone || !email) {
          throw new Error("Nombre, telefono y correo del cliente son obligatorios");
        }

        customer = await findCustomerByEmail(email, client);

        if (!customer) {
          const newCustomer = {
            fullName,
            phone,
            email,
          };

          if (address !== undefined) {
            Object.assign(newCustomer, { address });
          }

          customer = await createCheckoutCustomer(newCustomer, client);
        }
      }

      if (!customer) {
        throw new Error("El cliente no existe");
      }

      const saleData: CreateSaleInput = {
        customerId: customer.customer_id,
        status: "pending",
      };

      if (delivery?.address !== undefined) {
        saleData.deliveryAddress = delivery.address;
      } else if (customerData?.address !== undefined) {
        saleData.deliveryAddress = customerData.address;
      }

      if (delivery?.neighborhood !== undefined) {
        saleData.deliveryNeighborhood = delivery.neighborhood;
      }

      if (delivery?.city !== undefined) {
        saleData.deliveryCity = delivery.city;
      }

      if (delivery?.note !== undefined) {
        saleData.deliveryNote = delivery.note;
      }

      if (notes !== undefined) {
        saleData.notes = notes;
      }
      if (data.checkoutQuote) {
        const quote = data.checkoutQuote;
        saleData.notes = [notes || "", `Envío: ${quote.envio} COP; comisión ${quote.metodo}: ${quote.comision} COP. Validación de pago simulada; pago real pendiente. Consentimiento de datos: v1. Tasa: ${quote.tasa} ${quote.moneda}/COP (${quote.fechaTasa}, ${quote.fuenteTasa}).`].join(" | ").slice(0, 2000);
      }

      const sale = await createSale(saleData, client);

      let total = 0;
      const saleItems = [];

      for (const item of [...items].sort((a, b) => Number(a.productId) - Number(b.productId))) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);

        if (!Number.isSafeInteger(productId) || productId <= 0) {
          throw new Error("El producto es obligatorio");
        }

        if (!quantity || Number.isNaN(quantity) || quantity <= 0 || !Number.isSafeInteger(quantity)) {
          throw new Error("La cantidad debe ser mayor que cero");
        }

        const product = await findProductForSale(productId, client);

        if (!product) {
          throw new Error("El producto no existe");
        }

        if (!product.is_active || !product.is_available) {
          throw new Error(`El producto ${product.name} no esta disponible`);
        }

        this.#validarVencimiento(product);

        if (Number(product.current_stock) < quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }

        const unitPrice = Number(product.sale_price);
        if (data.checkoutQuote) {
          const quoted = data.checkoutQuote.items.find((entry) => entry.productId === productId);
          if (!quoted || quoted.quantity !== quantity || quoted.price !== unitPrice) throw new Error("El precio o las cantidades cambiaron; vuelve a cotizar");
        }
        const subtotal = unitPrice * quantity;

        const saleItem = await createSaleItem(
          {
            saleId: sale.order_id,
            productId,
            quantity,
            unitPrice,
            subtotal,
          },
          client,
        );

        const updatedStock = await decrementProductStock(productId, quantity, client);

        if (!updatedStock) {
          throw new Error(`No se pudo descontar stock de ${product.name}`);
        }

        await recordMovementService({ productId, userId: data.userId ?? null, type: "out", quantity, reason: `Pedido FV-${String(sale.order_id).padStart(6, "0")}` }, client);
        total += subtotal;
        saleItems.push(saleItem);
      }

      if (data.checkoutQuote) {
        if (Math.abs(data.checkoutQuote.subtotal - total) > 0.01) throw new Error("El subtotal cambió; vuelve a cotizar");
        total += data.checkoutQuote.envio + data.checkoutQuote.comision;
      }
      const updatedSale = await updateSaleTotal(sale.order_id, total, client);

      return {
        ...updatedSale,
        customer,
        items: saleItems,
      };
    });
  }
}

// Adaptador para conservar los controladores y módulos existentes.
export const createSaleService = (data: CreateSaleServiceInput) => VentaService.crear(data);
