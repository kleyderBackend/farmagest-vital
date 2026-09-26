import { pool } from "../../../config/db";

export async function findAuthUserByEmail(email: string) {
  const result = await pool.query(
    `
    SELECT user_id, full_name, email, password_hash, role, is_active
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}
