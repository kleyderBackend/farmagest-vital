import { pool } from "../../../config/db";
import type { QueryExecutor, SaleDateRangeInput } from "../sales.type";

export async function getTotalSold(
  data: SaleDateRangeInput = {},
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    SELECT
      COALESCE(SUM(total), 0) AS total_sold,
      COUNT(*)::int AS sales_count
    FROM orders
    WHERE status = 'completed'
      AND ($1::date IS NULL OR order_date::date >= $1::date)
      AND ($2::date IS NULL OR order_date::date <= $2::date)
    `,
    [data.startDate ?? null, data.endDate ?? null],
  );

  return result.rows[0];
}
