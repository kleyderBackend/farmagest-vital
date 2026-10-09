import {
  getIncomeByDay,
  getIncomeByHour,
  getTotalSold,
} from "../repositories/sales-report.repository";
import type { SaleDateRangeInput } from "../sales.type";

export async function getTotalSoldService(startDate?: string, endDate?: string) {
  const filters: SaleDateRangeInput = {};

  if (startDate !== undefined) {
    filters.startDate = startDate;
  }

  if (endDate !== undefined) {
    filters.endDate = endDate;
  }

  return getTotalSold(filters);
}

export async function getIncomeByHourService(date: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La fecha debe tener formato YYYY-MM-DD");
  }

  return getIncomeByHour(date);
}

export async function getIncomeByDayService(
  startDate?: string,
  endDate?: string,
) {
  const filters: SaleDateRangeInput = {};

  if (startDate !== undefined) {
    filters.startDate = startDate;
  }

  if (endDate !== undefined) {
    filters.endDate = endDate;
  }

  return getIncomeByDay(filters);
}
