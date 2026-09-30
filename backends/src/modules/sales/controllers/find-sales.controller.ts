import type { Request, Response } from "express";
import {
  findSaleByIdService,
  findSalesByDateService,
} from "../services/find-sales.service";

export async function findSaleByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de venta invalido",
      });
    }

    const saleId = Number(id);

    if (Number.isNaN(saleId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de venta invalido",
      });
    }

    const sale = await findSaleByIdService(saleId);

    if (!sale) {
      return res.status(404).json({
        status: "fail",
        message: "La venta no existe",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Venta encontrada con exito",
      data: { sale },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo buscar la venta",
      error: error.message,
    });
  }
}

export async function findSalesByDateController(req: Request, res: Response) {
  try {
    const { date } = req.params;

    if (!date || Array.isArray(date)) {
      return res.status(400).json({
        status: "fail",
        message: "La fecha es obligatoria",
      });
    }

    const sales = await findSalesByDateService(date);

    if (sales.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No hay ventas registradas en esta fecha",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Ventas encontradas con exito",
      data: { sales },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudieron buscar las ventas por fecha",
      error: error.message,
    });
  }
}
