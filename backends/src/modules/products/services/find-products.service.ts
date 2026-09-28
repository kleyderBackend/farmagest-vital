import {
  findProductById,
  findProductByName,
} from "../repositories/find-product.repository";

export async function findProductByIdService(id: number) {
  const product = await findProductById(id);
  if (!product) {
    throw new Error("El producto no existe");
  }
  return product;
}

export async function findProductByNameService(name: string) {
  const nameProducts = await findProductByName(name);
  if (!nameProducts) {
    throw new Error("El nombre del producto no existe");
  }

  return nameProducts;
}
