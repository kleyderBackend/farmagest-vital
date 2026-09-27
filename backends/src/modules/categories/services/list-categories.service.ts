import {
  listActiveCategories,
  listCategories,
} from "../repositories/list-categories.repository";

export async function listCategoriesService() {
  return listCategories();
}

export async function listActiveCategoriesService() {
  return listActiveCategories();
}
