import { executeSaleTransaction } from "../../sales/repositories/transaction.repository";
import { findStockForUpdate, updateStock } from "../repositories/stock.repository";
import { recordMovementService } from "./record-movement.service";
import type { CreateMovementInput } from "../inventory.type";

export async function createMovementService(data: CreateMovementInput) {
  if (!Number.isSafeInteger(data.productId) || data.productId <= 0 ||
    !["in", "out", "adjustment"].includes(data.type) ||
    !Number.isSafeInteger(data.quantity) || data.quantity < 0 ||
    (data.type !== "adjustment" && data.quantity === 0) ||
    typeof data.reason !== "string" || data.reason.trim().length < 3 || data.reason.length > 500) {
    throw new Error("Indica producto, tipo, cantidad entera y un motivo de 3 a 500 caracteres");
  }

  return executeSaleTransaction(async (db) => {
    const product = await findStockForUpdate(data.productId, db);
    if (!product) throw new Error("El producto no existe");

    const before = Number(product.current_stock);
    const after = data.type === "adjustment"
      ? data.quantity
      : before + (data.type === "in" ? data.quantity : -data.quantity);
    if (after < 0) throw new Error("Stock insuficiente");
    if (!Number.isSafeInteger(after) || after > 2147483647) throw new Error("Stock fuera de rango");

    await updateStock(data.productId, after, db);
    await recordMovementService({
      productId: data.productId,
      userId: data.userId,
      type: data.type,
      quantity: after - before,
      reason: `${data.reason.trim()} (${before} → ${after})`,
    }, db);

    return { productId: data.productId, previousStock: before, currentStock: after };
  });
}
