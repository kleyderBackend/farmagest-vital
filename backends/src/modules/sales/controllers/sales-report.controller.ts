import type { Request, Response } from "express";
import { getTotalSoldService } from "../services/sales-report.service";

export async function getTotalSoldController(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const totalSold = await getTotalSoldService(
      typeof startDate === "string" ? startDate : undefined,
      typeof endDate === "string" ? endDate : undefined,
    );

    return res.status(200).json({
      status: "success",
      message: "Total vendido calculado con exito",
      data: { totalSold },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo calcular el total vendido",
      error: error.message,
    });
  }
}
