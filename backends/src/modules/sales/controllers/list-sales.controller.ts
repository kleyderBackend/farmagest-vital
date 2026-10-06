import type { Request, Response } from "express";
import {
  listSalesByDateRangeService,
  listSalesService,
} from "../services/list-sales.service";

export async function listSalesController(_req: Request, res: Response) {
  try {
    const sales = await listSalesService();

    if (sales.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No hay ventas registradas",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Ventas encontradas con exito",
      data: { sales },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function listSalesByDateRangeController(
  req: Request,
  res: Response,
) {
  try {
    const { startDate, endDate } = req.query;

    const sales = await listSalesByDateRangeService(
      typeof startDate === "string" ? startDate : undefined,
      typeof endDate === "string" ? endDate : undefined,
    );

    if (sales.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No hay ventas registradas en este rango",
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
      message: "No se pudieron listar las ventas por rango",
      error: error.message,
    });
  }
}
