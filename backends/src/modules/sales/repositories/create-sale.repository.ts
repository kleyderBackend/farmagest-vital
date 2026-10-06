import { pool } from "../../../config/db";
import type {
  CreateSaleInput,
  CreateSaleItemInput,
  QueryExecutor,
} from "../sales.type";

export async function createSale(
  data: CreateSaleInput,
  db: QueryExecutor = pool,
) {
  const [result]: any = await db.query(
    `
    INSERT INTO orders (
      customer_id,
      total,
      status,
      notes
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      data.customerId,
      data.total ?? 0,
      data.status ?? "completed",
      data.notes ?? null,
    ],
  );

  const [rows]: any = await db.query(
    `
    SELECT
      order_id,
      customer_id,
      order_date,
      total,
      status,
      notes,
      created_at,
      updated_at
    FROM orders
    WHERE order_id = ?
    `,
    [result.insertId],
  );

  return rows[0];
}

export async function createSaleItem(
  data: CreateSaleItemInput,
  db: QueryExecutor = pool,
) {
  const [result]: any = await db.query(
    `
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.saleId,
      data.productId,
      data.quantity,
      data.unitPrice,
      data.subtotal,
    ],
  );

  const [rows]: any = await db.query(
    `
    SELECT
      order_item_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    FROM order_items
    WHERE order_item_id = ?
    `,
    [result.insertId],
  );

  return rows[0];
}

export async function updateSaleTotal(
  saleId: number,
  total: number,
  db: QueryExecutor = pool,
) {
  await db.query(
    `
    UPDATE orders
    SET
      total = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE order_id = ?
    `,
    [total, saleId],
  );

  const [rows]: any = await db.query(
    `
    SELECT
      order_id,
      customer_id,
      order_date,
      total,
      status,
      notes,
      created_at,
      updated_at
    FROM orders
    WHERE order_id = ?
    `,
    [saleId],
  );

  return rows[0];
}
