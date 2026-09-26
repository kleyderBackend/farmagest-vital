import { pool } from "../../../config/db";

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    "SELECT user_id, email FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
}

export async function createUser(data: {
  fullName: string;
  email: string;
  passwordHash: string;
  role: "admin" | "staff";
}) {
  const result = await pool.query(
    `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, full_name, email, role, is_active, created_at
    `,
    [data.fullName, data.email, data.passwordHash, data.role]
  );

  return result.rows[0];
}
