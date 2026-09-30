import { pool } from "../../../config/db";
import type { QueryExecutor } from "../sales.type";

export async function findProductForSale(
  productId: number,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    SELECT
      product_id,
      name,
      sale_price,
      current_stock,
      is_available,
      is_active,
      expiration_date
    FROM products
    WHERE product_id = $1
    FOR UPDATE
    `,
    [productId],
  );

  return result.rows[0];
}

export async function decrementProductStock(
  productId: number,
  quantity: number,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    UPDATE products
    SET
      current_stock = current_stock - $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $1
      AND current_stock >= $2
    RETURNING
      product_id,
      name,
      current_stock,
      minimum_stock,
      is_available,
      is_active,
      updated_at
    `,
    [productId, quantity],
  );

  return result.rows[0];
}
