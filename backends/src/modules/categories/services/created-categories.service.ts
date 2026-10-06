import type { CreateCategoryInput } from "../categories.type";
import { createCategory } from "../repositories/create-category.repository";
import { findCategoryByName } from "../repositories/find-category.repository";

export async function createCategoryService(data: CreateCategoryInput) {
  const { name, description } = data;

  if (!name) {
    throw new Error("El nombre de la categoria es obligatorio");
  }

  const existingCategory = await findCategoryByName(name);

  if (existingCategory) {
    throw new Error("La categoria ya existe");
  }

  const categoryData: CreateCategoryInput = {
    name,
  };

  if (description !== undefined) {
    categoryData.description = description;
  }

  const newCategory = await createCategory(categoryData);

  return newCategory;
}
