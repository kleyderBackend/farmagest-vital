import { pool } from "../../../config/db";
import type { QueryExecutor } from "../sales.type";

export async function findSaleById(saleId: number, db: QueryExecutor = pool) {
  const [saleRows]: any = await db.query(
    `
    SELECT
      o.order_id,
      o.customer_id,
      c.full_name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      o.order_date,
      o.total,
      o.status,
      o.notes,
      o.created_at,
      o.updated_at
    FROM orders o
    INNER JOIN customers c
      ON c.customer_id = o.customer_id
    WHERE o.order_id = ?
    `,
    [saleId],
  );

  const sale = saleRows[0];

  if (!sale) {
    return null;
  }

  const [detailRows]: any = await db.query(
    `
    SELECT
      oi.order_item_id,
      oi.order_id,
      oi.product_id,
      p.name AS product_name,
      p.presentation,
      oi.quantity,
      oi.unit_price,
      oi.subtotal
    FROM order_items oi
    INNER JOIN products p
      ON p.product_id = oi.product_id
    WHERE oi.order_id = ?
    ORDER BY oi.order_item_id ASC
    `,
    [saleId],
  );

  return {
    ...sale,
    items: detailRows,
  };
}

export async function findSalesByDate(date: string, db: QueryExecutor = pool) {
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
    WHERE DATE(o.order_date) = DATE(?)
    ORDER BY o.order_date DESC
    `,
    [date],
  );

  return rows;
}
