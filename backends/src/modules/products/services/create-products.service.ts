import { validateExpirationDate } from "../utils/validate-expiration-date";
import { executeSaleTransaction } from "../../sales/repositories/transaction.repository";
import { recordMovementService } from "../../inventory/services/record-movement.service";
import { findCategoryById } from "../../categories/repositories/find-category.repository";
import { createProduct } from "../repositories/create-product.repository";
import type { CreateProductInput } from "../products.type";

export async function createProductService(data: CreateProductInput, userId: number) {
  const {
    categoryId,
    name,
    presentation,
    description,
    salePrice,
    currentStock,
    minimumStock,
    expirationDate,
    imageUrl,
    isAvailable,
  } = data;

  if (!categoryId || Number.isNaN(categoryId)) {
    throw new Error("La categoria es obligatoria");
  }

  if (!name || salePrice === undefined || salePrice === null) {
    throw new Error("El nombre y el precio del producto son obligatorios");
  }

  if (salePrice <= 0 || !Number.isFinite(salePrice)) {
    throw new Error(
      "El precio del producto debe ser un valor numerico mayor que cero",
    );
  }

  if (
    currentStock !== undefined &&
    (currentStock < 0 || !Number.isSafeInteger(currentStock))
  ) {
    throw new Error(
      "El stock del producto debe ser un valor numerico y no puede ser negativo",
    );
  }

  if (
    minimumStock !== undefined &&
    (minimumStock < 0 || !Number.isSafeInteger(minimumStock))
  ) {
    throw new Error(
      "El stock minimo del producto debe ser un valor numerico y no puede ser negativo",
    );
  }

  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new Error("La categoria no existe");
  }

  const productData: CreateProductInput = {
    categoryId,
    name,
    salePrice,
  };

  if (presentation !== undefined) {
    productData.presentation = presentation;
  }

  if (description !== undefined) {
    productData.description = description;
  }

  if (currentStock !== undefined) {
    productData.currentStock = currentStock;
  }

  if (minimumStock !== undefined) {
    productData.minimumStock = minimumStock;
  }

  if (expirationDate !== undefined) {
    productData.expirationDate = expirationDate;
  }

  if (imageUrl !== undefined) {
    productData.imageUrl = imageUrl;
  }

  if (isAvailable !== undefined) {
    productData.isAvailable = isAvailable;
  }

  if (data.expirationDate !== undefined) validateExpirationDate(data.expirationDate);
  return executeSaleTransaction(async (db) => {
    const product = await createProduct(productData, db);
    await recordMovementService({ productId: Number(product.product_id), userId, type: "in", quantity: Number(product.current_stock), reason: "Inventario inicial" }, db);
    return product;
  });
}
