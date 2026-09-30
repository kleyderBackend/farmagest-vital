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

function validateProductExpiration(product: SaleProductRow) {
  if (!product.expiration_date) {
    return;
  }

  const expirationDate = new Date(product.expiration_date);
  expirationDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expirationDate < today) {
    throw new Error(`El producto ${product.name} esta vencido`);
  }
}

export async function createSaleService(data: CreateSaleServiceInput) {
  const { customerId, customer: customerData, items, notes } = data;

  if (!customerId && !customerData) {
    throw new Error("Los datos del cliente son obligatorios");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("La venta debe tener al menos un producto");
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
      status: "completed",
    };

    if (notes !== undefined) {
      saleData.notes = notes;
    }

    const sale = await createSale(saleData, client);

    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!productId || Number.isNaN(productId)) {
        throw new Error("El producto es obligatorio");
      }

      if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
        throw new Error("La cantidad debe ser mayor que cero");
      }

      const product = await findProductForSale(productId, client);

      if (!product) {
        throw new Error("El producto no existe");
      }

      if (!product.is_active || !product.is_available) {
        throw new Error(`El producto ${product.name} no esta disponible`);
      }

      validateProductExpiration(product);

      if (Number(product.current_stock) < quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const unitPrice = Number(product.sale_price);
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

      total += subtotal;
      saleItems.push(saleItem);
    }

    const updatedSale = await updateSaleTotal(sale.order_id, total, client);

    return {
      ...updatedSale,
      customer,
      items: saleItems,
    };
  });
}
