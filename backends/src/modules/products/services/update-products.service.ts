import { validateExpirationDate } from "../utils/validate-expiration-date";
import { executeSaleTransaction } from "../../sales/repositories/transaction.repository";
import { recordMovementService } from "../../inventory/services/record-movement.service";
import { findCategoryById } from "../../categories/repositories/find-category.repository";
import { findProductById, findProductByName } from "../repositories/find-product.repository";
import {
  deactivateProduct,
  updateProduct,
} from "../repositories/update-product.repository";
import type { UpdateProductInput } from "../products.type";
import { findStockForUpdate } from "../../inventory/repositories/stock.repository";

export async function updateProductService(data: UpdateProductInput, userId: number, reason?: string) {
  const existingProduct = await findProductById(data.productId);

  if (!existingProduct) {
    throw new Error("El producto no existe");
  }

  if (data.categoryId !== undefined) {
    const category = await findCategoryById(data.categoryId);

    if (!category) {
      throw new Error("La categoria no existe");
    }
  }

  if (data.name !== undefined) {
    const productWithSameName = await findProductByName(data.name);

    if (
      productWithSameName &&
      productWithSameName.product_id !== data.productId
    ) {
      throw new Error("Ya existe un producto con ese nombre");
    }
  }

  if (
    data.salePrice !== undefined &&
    (data.salePrice <= 0 || !Number.isFinite(data.salePrice))
  ) {
    throw new Error("El precio del producto debe ser un valor numerico mayor que cero");
  }

  if (
    data.currentStock !== undefined &&
    (data.currentStock < 0 || !Number.isSafeInteger(data.currentStock))
  ) {
    throw new Error("El stock del producto debe ser un valor numerico y no puede ser negativo");
  }

  if (
    data.minimumStock !== undefined &&
    (data.minimumStock < 0 || !Number.isSafeInteger(data.minimumStock))
  ) {
    throw new Error("El stock minimo del producto debe ser un valor numerico y no puede ser negativo");
  }


  if (data.expirationDate !== undefined) {
    const existingDate = existingProduct.expiration_date instanceof Date
      ? `${existingProduct.expiration_date.getFullYear()}-${String(existingProduct.expiration_date.getMonth() + 1).padStart(2, "0")}-${String(existingProduct.expiration_date.getDate()).padStart(2, "0")}`
      : String(existingProduct.expiration_date || "").slice(0, 10);
    if (data.expirationDate !== existingDate) validateExpirationDate(data.expirationDate);
  }
  return executeSaleTransaction(async (db) => {
    const stock = await findStockForUpdate(data.productId, db);
    if (!stock) throw new Error("El producto no existe");
    const before = Number(stock.current_stock);
    const product = await updateProduct(data, db);
    const after = Number(product.current_stock);
    if (after !== before) {
      if (!reason || reason.trim().length < 3 || reason.length > 500) throw new Error("Indica un motivo de 3 a 500 caracteres para ajustar el stock");
      await recordMovementService({ productId: data.productId, userId, type: "adjustment", quantity: after - before, reason: `${reason.trim()} (${before} → ${after})` }, db);
    }

    return product;
  });
}

export async function deactivateProductService(productId: number) {
  const existingProduct = await findProductById(productId);

  if (!existingProduct) {
    throw new Error("El producto no existe");
  }

  const product = await deactivateProduct(productId);

  if (!product) {
    throw new Error("No se pudo desactivar el producto");
  }

  return product;
}
