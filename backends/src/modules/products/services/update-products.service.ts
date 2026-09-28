import { findCategoryById } from "../../categories/repositories/find-category.repository";
import { findProductById, findProductByName } from "../repositories/find-product.repository";
import {
  deactivateProduct,
  updateProduct,
} from "../repositories/update-product.repository";
import type { UpdateProductInput } from "../products.type";

export async function updateProductService(data: UpdateProductInput) {
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
    (data.salePrice <= 0 || Number.isNaN(data.salePrice))
  ) {
    throw new Error("El precio del producto debe ser un valor numerico mayor que cero");
  }

  if (
    data.currentStock !== undefined &&
    (data.currentStock < 0 || Number.isNaN(data.currentStock))
  ) {
    throw new Error("El stock del producto debe ser un valor numerico y no puede ser negativo");
  }

  if (
    data.minimumStock !== undefined &&
    (data.minimumStock < 0 || Number.isNaN(data.minimumStock))
  ) {
    throw new Error("El stock minimo del producto debe ser un valor numerico y no puede ser negativo");
  }

  const product = await updateProduct(data);

  if (!product) {
    throw new Error("No se pudo actualizar el producto");
  }

  return product;
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
