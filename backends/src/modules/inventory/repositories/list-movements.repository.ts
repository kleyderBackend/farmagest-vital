import { pool } from "../../../config/db";

export async function listMovements() {
  const [rows]: any = await pool.query(
    `
    SELECT m.*, p.name AS product_name, u.full_name AS user_name
    FROM inventory_movements m
    INNER JOIN products p ON p.product_id = m.product_id
    LEFT JOIN users u ON u.user_id = m.user_id
    ORDER BY m.movement_id DESC
    LIMIT 500
    `,
  );
  return rows;
}
