import { pool } from "../../../config/db";

export async function findProductById(productId: number) {
  const result = await pool.query(
    `
    SELECT
      p.product_id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.presentation,
      p.description,
      p.sale_price,
      p.current_stock,
      p.minimum_stock,
      p.expiration_date,
      p.image_url,
      p.is_available,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    INNER JOIN categories c ON c.category_id = p.category_id
    WHERE p.product_id = $1
    `,
    [productId],
  );

  return result.rows[0];
}

export async function findProductByName(name: string) {
  const result = await pool.query(
    `
    SELECT
      p.product_id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.presentation,
      p.description,
      p.sale_price,
      p.current_stock,
      p.minimum_stock,
      p.expiration_date,
      p.image_url,
      p.is_available,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    INNER JOIN categories c ON c.category_id = p.category_id
    WHERE LOWER(p.name) = LOWER($1)
    `,
    [name],
  );

  return result.rows[0];
}
