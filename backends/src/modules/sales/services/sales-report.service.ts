import { getTotalSold } from "../repositories/sales-report.repository";
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
