import { pool } from "../../../config/db";

export async function findAuthUserByEmail(email: string) {
  const [rows]: any = await pool.query(
    `
    SELECT user_id, full_name, email, password_hash, role, is_active
    FROM users
    WHERE email = ?
    `,
    [email]
  );

  return rows[0];
}