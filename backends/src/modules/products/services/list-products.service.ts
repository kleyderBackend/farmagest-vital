import { findCategoryById } from "../../categories/repositories/find-category.repository";
import {
  listAvailableProducts,
  listActiveProducts,
  listProducts,
  listProductsByCategory,
} from "../repositories/list-products.repository";

export async function listAvailableProductService() {
  return listAvailableProducts();
}

export async function listActiveProductService() {
  return listActiveProducts();
}

export async function listProductService() {
  return listProducts();
}

export async function listProductsByCategoryService(id: number) {
  const category = await findCategoryById(id);
  if (!category) {
    throw new Error("La categoria no existe");
  }

  return listProductsByCategory(id);
}
