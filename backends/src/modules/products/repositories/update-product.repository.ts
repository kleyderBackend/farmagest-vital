import { pool } from "../../../config/db";
import type { UpdateProductInput } from "../products.type";

export async function updateProduct(data: UpdateProductInput) {
  // 1. Ejecutamos el UPDATE usando '?'
  await pool.query(
    `
    UPDATE products
    SET
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      presentation = COALESCE(?, presentation),
      description = COALESCE(?, description),
      sale_price = COALESCE(?, sale_price),
      current_stock = COALESCE(?, current_stock),
      minimum_stock = COALESCE(?, minimum_stock),
      expiration_date = COALESCE(?, expiration_date),
      image_url = COALESCE(?, image_url),
      is_available = COALESCE(?, is_available),
      is_active = COALESCE(?, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
    `,
    [
      data.categoryId ?? null,
      data.name ?? null,
      data.presentation ?? null,
      data.description ?? null,
      data.salePrice ?? null,
      data.currentStock ?? null,
      data.minimumStock ?? null,
      data.expirationDate ?? null,
      data.imageUrl ?? null,
      data.isAvailable ?? null,
      data.isActive ?? null,
      data.productId,
    ],
  );

  // 2. Consultamos y devolvemos el producto actualizado
  const [rows]: any = await pool.query(
    `
    SELECT
      product_id,
      category_id,
      name,
      presentation,
      description,
      sale_price,
      current_stock,
      minimum_stock,
      expiration_date,
      image_url,
      is_available,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE product_id = ?
    `,
    [data.productId]
  );

  return rows[0];
}

export async function deactivateProduct(productId: number) {
  // 1. Ejecutamos la desactivación usando '?'
  await pool.query(
    `
    UPDATE products
    SET
      is_active = FALSE,
      is_available = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
    `,
    [productId],
  );

  // 2. Consultamos y devolvemos el producto actualizado
  const [rows]: any = await pool.query(
    `
    SELECT
      product_id,
      category_id,
      name,
      presentation,
      description,
      sale_price,
      current_stock,
      minimum_stock,
      expiration_date,
      image_url,
      is_available,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE product_id = ?
    `,
    [productId]
  );

  return rows[0];
}