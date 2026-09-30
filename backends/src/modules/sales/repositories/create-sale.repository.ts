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
  const result = await db.query(
    `
    INSERT INTO orders (
      customer_id,
      total,
      status,
      notes
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      order_id,
      customer_id,
      order_date,
      total,
      status,
      notes,
      created_at,
      updated_at
    `,
    [
      data.customerId,
      data.total ?? 0,
      data.status ?? "completed",
      data.notes ?? null,
    ],
  );

  return result.rows[0];
}

export async function createSaleItem(
  data: CreateSaleItemInput,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      order_item_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    `,
    [
      data.saleId,
      data.productId,
      data.quantity,
      data.unitPrice,
      data.subtotal,
    ],
  );

  return result.rows[0];
}

export async function updateSaleTotal(
  saleId: number,
  total: number,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    UPDATE orders
    SET
      total = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE order_id = $1
    RETURNING
      order_id,
      customer_id,
      order_date,
      total,
      status,
      notes,
      created_at,
      updated_at
    `,
    [saleId, total],
  );

  return result.rows[0];
}
