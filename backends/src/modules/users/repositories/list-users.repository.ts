import { pool } from "../../../config/db";

export async function listUsers() {
  const [rows]: any = await pool.query(
    `
    SELECT user_id, full_name, email, role, is_active, created_at
    FROM users
    ORDER BY user_id
    `,
  );
  return rows;
}
