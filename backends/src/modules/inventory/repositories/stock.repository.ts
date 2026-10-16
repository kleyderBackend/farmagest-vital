import { pool } from "../../../config/db";
import type { QueryExecutor } from "../../sales/sales.type";

export async function findStockForUpdate(productId: number, db: QueryExecutor = pool) {
  const [rows]: any = await db.query(
    `
    SELECT product_id, current_stock
    FROM products
    WHERE product_id = ?
    FOR UPDATE
    `,
    [productId],
  );
  return rows[0];
}

export async function updateStock(productId: number, stock: number, db: QueryExecutor = pool) {
  await db.query(
    `
    UPDATE products
    SET current_stock = ?, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
    `,
    [stock, productId],
  );
}

export async function incrementStock(productId: number, quantity: number, db: QueryExecutor = pool) {
  await db.query(
    `
    UPDATE products
    SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
    `,
    [quantity, productId],
  );
}
