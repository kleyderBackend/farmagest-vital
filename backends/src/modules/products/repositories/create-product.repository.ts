import { pool } from "../../../config/db";
import type { CreateProductInput } from "../products.type";

export async function createProduct(data: CreateProductInput) {
  const result = await pool.query(
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING
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

  return result.rows[0];
}
