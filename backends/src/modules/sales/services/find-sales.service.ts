import {
  findSaleById,
  findSalesByDate,
} from "../repositories/find-sale.repository";

export async function findSaleByIdService(saleId: number) {
  if (!saleId || Number.isNaN(saleId)) {
    throw new Error("ID de venta invalido");
  }

  return findSaleById(saleId);
}

export async function findSalesByDateService(date: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("La fecha debe tener formato YYYY-MM-DD");
  }

  return findSalesByDate(date);
}
