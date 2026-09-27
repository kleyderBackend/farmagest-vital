import type { UpdateCategoryInput } from "../categories.type";
import { findCategoryById, findCategoryByName } from "../repositories/find-category.repository";
import {
  deactivateCategory,
  updateCategory,
} from "../repositories/update-category.repository";

export async function updateCategoryService(data: UpdateCategoryInput) {
  const existingCategory = await findCategoryById(data.categoryId);

  if (!existingCategory) {
    throw new Error("La categoria no existe");
  }

  if (data.name !== undefined) {
    const categoryWithSameName = await findCategoryByName(data.name);

    if (
      categoryWithSameName &&
      categoryWithSameName.category_id !== data.categoryId
    ) {
      throw new Error("Ya existe una categoria con ese nombre");
    }
  }

  const updatedCategory = await updateCategory(data);

  if (!updatedCategory) {
    throw new Error("No se pudo actualizar la categoria");
  }

  return updatedCategory;
}

export async function deactivateCategoryService(categoryId: number) {
  const existingCategory = await findCategoryById(categoryId);

  if (!existingCategory) {
    throw new Error("La categoria no existe");
  }

  const category = await deactivateCategory(categoryId);

  if (!category) {
    throw new Error("No se pudo desactivar la categoria");
  }

  return category;
}
