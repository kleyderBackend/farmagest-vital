import { pool } from "../../../config/db";
import type { QueryExecutor, SaleDateRangeInput } from "../sales.type";

export async function getTotalSold(
  data: SaleDateRangeInput = {},
  db: QueryExecutor = pool,
) {
  const [rows]: any = await db.query(
    `
    SELECT
      COALESCE(SUM(total), 0) AS total_sold,
      COUNT(*) AS sales_count
    FROM orders
    WHERE status = 'completed'
      AND (? IS NULL OR DATE(order_date) >= DATE(?))
      AND (? IS NULL OR DATE(order_date) <= DATE(?))
    `,
    [
      data.startDate ?? null,
      data.startDate ?? null,
      data.endDate ?? null,
      data.endDate ?? null,
    ],
  );

  return rows[0];
}
