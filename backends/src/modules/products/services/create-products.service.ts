import { findCategoryById } from "../../categories/repositories/find-category.repository";
import { createProduct } from "../repositories/create-product.repository";
import type { CreateProductInput } from "../products.type";

export async function createProductService(data: CreateProductInput) {
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

  if (salePrice <= 0 || Number.isNaN(salePrice)) {
    throw new Error(
      "El precio del producto debe ser un valor numerico mayor que cero",
    );
  }

  if (
    currentStock !== undefined &&
    (currentStock < 0 || Number.isNaN(currentStock))
  ) {
    throw new Error(
      "El stock del producto debe ser un valor numerico y no puede ser negativo",
    );
  }

  if (
    minimumStock !== undefined &&
    (minimumStock < 0 || Number.isNaN(minimumStock))
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

  const newProduct = await createProduct(productData);

  return newProduct;
}
