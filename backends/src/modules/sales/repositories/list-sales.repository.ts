import { pool } from "../../../config/db";
import type { QueryExecutor, SaleDateRangeInput } from "../sales.type";

export async function listSales(db: QueryExecutor = pool) {
  const result = await db.query(
    `
    SELECT
      o.order_id,
      o.customer_id,
      c.full_name AS customer_name,
      o.order_date,
      o.total,
      o.status,
      o.notes,
      o.created_at,
      o.updated_at
    FROM orders o
    INNER JOIN customers c
      ON c.customer_id = o.customer_id
    ORDER BY o.order_date DESC
    `,
  );

  return result.rows;
}

export async function listSalesByDateRange(
  data: SaleDateRangeInput,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    SELECT
      o.order_id,
      o.customer_id,
      c.full_name AS customer_name,
      o.order_date,
      o.total,
      o.status,
      o.notes,
      o.created_at,
      o.updated_at
    FROM orders o
    INNER JOIN customers c
      ON c.customer_id = o.customer_id
    WHERE ($1::date IS NULL OR o.order_date::date >= $1::date)
      AND ($2::date IS NULL OR o.order_date::date <= $2::date)
    ORDER BY o.order_date DESC
    `,
    [data.startDate ?? null, data.endDate ?? null],
  );

  return result.rows;
}
