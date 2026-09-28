import { pool } from "../../../config/db";
import type { UpdateProductInput } from "../products.type";

export async function updateProduct(data: UpdateProductInput) {
  const result = await pool.query(
    `
    UPDATE products
    SET
      category_id = COALESCE($2, category_id),
      name = COALESCE($3, name),
      presentation = COALESCE($4, presentation),
      description = COALESCE($5, description),
      sale_price = COALESCE($6, sale_price),
      current_stock = COALESCE($7, current_stock),
      minimum_stock = COALESCE($8, minimum_stock),
      expiration_date = COALESCE($9, expiration_date),
      image_url = COALESCE($10, image_url),
      is_available = COALESCE($11, is_available),
      is_active = COALESCE($12, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $1
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
      data.productId,
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
    ],
  );

  return result.rows[0];
}

export async function deactivateProduct(productId: number) {
  const result = await pool.query(
    `
    UPDATE products
    SET
      is_active = FALSE,
      is_available = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $1
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
    [productId],
  );

  return result.rows[0];
}
