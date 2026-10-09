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
    WHERE status <> 'cancelled'
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

export async function getIncomeByHour(date: string, db: QueryExecutor = pool) {
  const [rows]: any = await db.query(
    `
    SELECT
      HOUR(order_date) AS sale_hour,
      COALESCE(SUM(total), 0) AS total_sold,
      COUNT(*) AS sales_count
    FROM orders
    WHERE status <> 'cancelled'
      AND DATE(order_date) = DATE(?)
    GROUP BY HOUR(order_date)
    ORDER BY sale_hour ASC
    `,
    [date],
  );

  return rows;
}

export async function getIncomeByDay(
  data: SaleDateRangeInput = {},
  db: QueryExecutor = pool,
) {
  const [rows]: any = await db.query(
    `
    SELECT
      DATE(order_date) AS sale_date,
      COALESCE(SUM(total), 0) AS total_sold,
      COUNT(*) AS sales_count
    FROM orders
    WHERE status <> 'cancelled'
      AND (? IS NULL OR DATE(order_date) >= DATE(?))
      AND (? IS NULL OR DATE(order_date) <= DATE(?))
    GROUP BY DATE(order_date)
    ORDER BY sale_date ASC
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
