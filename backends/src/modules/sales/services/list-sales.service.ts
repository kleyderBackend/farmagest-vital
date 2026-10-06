import {
  listSales,
  listSalesByDateRange,
} from "../repositories/list-sales.repository";
import type { SaleDateRangeInput } from "../sales.type";

export async function listSalesService() {
  return listSales();
}

export async function listSalesByDateRangeService(
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

  return listSalesByDateRange(filters);
}
