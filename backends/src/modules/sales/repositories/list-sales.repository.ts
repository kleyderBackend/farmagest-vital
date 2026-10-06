import { pool } from "../../../config/db";
import type { QueryExecutor, SaleDateRangeInput } from "../sales.type";

export async function listSales(db: QueryExecutor = pool) {
  const [rows]: any = await db.query(
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

  return rows;
}

export async function listSalesByDateRange(
  data: SaleDateRangeInput,
  db: QueryExecutor = pool,
) {
  const [rows]: any = await db.query(
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
    WHERE (? IS NULL OR DATE(o.order_date) >= DATE(?))
      AND (? IS NULL OR DATE(o.order_date) <= DATE(?))
    ORDER BY o.order_date DESC
    `,
    [
      data.startDate ?? null,
      data.startDate ?? null,
      data.endDate ?? null,
      data.endDate ?? null,
    ],
  );

  return rows;
}
