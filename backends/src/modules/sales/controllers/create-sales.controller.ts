import type { Request, Response } from "express";
import type { CreateSaleServiceInput } from "../sales.type";
import { createSaleService } from "../services/create-sales.service";

function mapSaleItems(items: any[]) {
  return items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
  }));
}

export async function checkoutSaleController(req: Request, res: Response) {
  try {
    const { customer, delivery, notes, items } = req.body;

    if (!customer || typeof customer !== "object") {
      return res.status(400).json({
        status: "fail",
        message: "Los datos del cliente son obligatorios",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "La venta debe tener al menos un producto",
      });
    }

    const saleData: CreateSaleServiceInput = {
      customer,
      items: mapSaleItems(items),
    };

    if (delivery !== undefined) {
      saleData.delivery = delivery;
    }

    if (notes !== undefined) {
      saleData.notes = notes;
    }

    const sale = await createSaleService(saleData);

    return res.status(201).json({
      status: "success",
      message: "Compra creada con exito",
      data: { sale },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo finalizar la compra",
      error: error.message,
    });
  }
}

export async function createSaleController(req: Request, res: Response) {
  try {
    const { customerId, customer, delivery, notes, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "La venta debe tener al menos un producto",
      });
    }

    const saleData: CreateSaleServiceInput = {
      items: mapSaleItems(items),
    };

    if (customerId !== undefined && customerId !== null) {
      const parsedCustomerId = Number(customerId);

      if (Number.isNaN(parsedCustomerId)) {
        return res.status(400).json({
          status: "fail",
          message: "El cliente debe ser un valor numerico valido",
        });
      }

      saleData.customerId = parsedCustomerId;
    }

    if (customer !== undefined) {
      saleData.customer = customer;
    }

    if (delivery !== undefined) {
      saleData.delivery = delivery;
    }

    if (saleData.customerId === undefined && saleData.customer === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "Los datos del cliente son obligatorios",
      });
    }

    if (notes !== undefined) {
      saleData.notes = notes;
    }

    const sale = await createSaleService(saleData);

    return res.status(201).json({
      status: "success",
      message: "Venta creada con exito",
      data: { sale },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo crear la venta",
      error: error.message,
    });
  }
}
