import { pool } from "../../../config/db";
import type {
  OrderStatus,
  QueryExecutor,
  UpdateOrderDeliveryInput,
} from "../orders.type";

const orderSelect = `
  SELECT
    o.order_id,
    o.customer_id,
    c.full_name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    c.address AS customer_address,
    o.order_date,
    o.total,
    o.status,
    o.delivery_address,
    o.delivery_neighborhood,
    o.delivery_city,
    o.delivery_note,
    o.notes,
    o.created_at,
    o.updated_at
  FROM orders o
  INNER JOIN customers c
    ON c.customer_id = o.customer_id
`;

export async function listOrders(db: QueryExecutor = pool) {
  const [rows]: any = await db.query(
    `
    ${orderSelect}
    ORDER BY o.order_date DESC
    `,
  );

  return rows;
}

export async function findOrderById(orderId: number, db: QueryExecutor = pool) {
  const [rows]: any = await db.query(
    `
    ${orderSelect}
    WHERE o.order_id = ?
    `,
    [orderId],
  );

  const order = rows[0];

  if (!order) {
    return null;
  }

  const [itemRows]: any = await db.query(
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
    [orderId],
  );

  return {
    ...order,
    items: itemRows,
  };
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  db: QueryExecutor = pool,
) {
  await db.query(
    `
    UPDATE orders
    SET
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE order_id = ?
    `,
    [status, orderId],
  );

  return findOrderById(orderId, db);
}

export async function updateOrderDelivery(
  data: UpdateOrderDeliveryInput,
  db: QueryExecutor = pool,
) {
  await db.query(
    `
    UPDATE orders
    SET
      delivery_address = COALESCE(?, delivery_address),
      delivery_neighborhood = COALESCE(?, delivery_neighborhood),
      delivery_city = COALESCE(?, delivery_city),
      delivery_note = COALESCE(?, delivery_note),
      updated_at = CURRENT_TIMESTAMP
    WHERE order_id = ?
    `,
    [
      data.deliveryAddress ?? null,
      data.deliveryNeighborhood ?? null,
      data.deliveryCity ?? null,
      data.deliveryNote ?? null,
      data.orderId,
    ],
  );

  return findOrderById(data.orderId, db);
}
