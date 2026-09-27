import {
  findCategoryById,
  findCategoryByName,
} from "../repositories/find-category.repository";

export async function findCategoryByIdService(categoryId: number) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new Error("La categoria no existe");
  }

  return category;
}
export async function findCategoryByNameService(name: string) {
  const nameCategory = await findCategoryByName(name);

  if (!nameCategory) {
    throw new Error("El nombre de la categoria no existe");
  }

  return nameCategory;
}
