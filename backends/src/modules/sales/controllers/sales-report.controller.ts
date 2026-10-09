import type { Request, Response } from "express";
import {
  getIncomeByDayService,
  getIncomeByHourService,
  getTotalSoldService,
} from "../services/sales-report.service";

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

export async function getIncomeByHourController(req: Request, res: Response) {
  try {
    const { date } = req.query;

    if (typeof date !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "La fecha es obligatoria",
      });
    }

    const hourlyIncome = await getIncomeByHourService(date);

    return res.status(200).json({
      status: "success",
      message: "Ingresos por hora calculados con exito",
      data: { hourlyIncome },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudieron calcular los ingresos por hora",
      error: error.message,
    });
  }
}

export async function getIncomeByDayController(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const dailyIncome = await getIncomeByDayService(
      typeof startDate === "string" ? startDate : undefined,
      typeof endDate === "string" ? endDate : undefined,
    );

    return res.status(200).json({
      status: "success",
      message: "Ingresos por dia calculados con exito",
      data: { dailyIncome },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudieron calcular los ingresos por dia",
      error: error.message,
    });
  }
}
