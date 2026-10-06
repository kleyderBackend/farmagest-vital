import { pool } from "../../../config/db";
import type { CreateProductInput } from "../products.type";

export async function createProduct(data: CreateProductInput) {
  // 1. Ejecutamos la inserción usando '?'
  const [result]: any = await pool.query(
    `
    INSERT INTO products (
      category_id,
      name,
      presentation,
      description,
      sale_price,
      current_stock,
      minimum_stock,
      expiration_date,
      image_url,
      is_available
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.categoryId,
      data.name,
      data.presentation ?? null,
      data.description ?? null,
      data.salePrice,
      data.currentStock ?? 0,
      data.minimumStock ?? 0,
      data.expirationDate ?? null,
      data.imageUrl ?? null,
      data.isAvailable ?? true,
    ],
  );

  // 2. Obtenemos el ID generado
  const productId = result.insertId;

  // 3. Consultamos y devolvemos el producto insertado
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