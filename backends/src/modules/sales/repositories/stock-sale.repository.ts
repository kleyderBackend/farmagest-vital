import { pool } from "../../../config/db";
import type { QueryExecutor } from "../sales.type";

export async function findProductForSale(
  productId: number,
  db: QueryExecutor = pool,
) {
  const [rows]: any = await db.query(
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
    WHERE product_id = ?
    FOR UPDATE
    `,
    [productId],
  );

  return rows[0];
}

export async function decrementProductStock(
  productId: number,
  quantity: number,
  db: QueryExecutor = pool,
) {
  const [result]: any = await db.query(
    `
    UPDATE products
    SET
      current_stock = current_stock - ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
      AND current_stock >= ?
    `,
    [quantity, productId, quantity],
  );

  if (result.affectedRows === 0) {
    return undefined;
  }

  const [rows]: any = await db.query(
    `
    SELECT
      product_id,
      name,
      current_stock,
      minimum_stock,
      is_available,
      is_active,
      updated_at
    FROM products
    WHERE product_id = ?
    `,
    [productId],
  );

  return rows[0];
}
