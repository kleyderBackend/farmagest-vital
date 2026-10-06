import { pool } from "../../../config/db";

export async function findUserByEmail(email: string) {
  const [rows]: any = await pool.query(
    "SELECT user_id, email FROM users WHERE email = ?",
    [email]
  );

  return rows[0];
}

export async function createUser(data: {
  fullName: string;
  email: string;
  passwordHash: string;
  role: "admin" | "staff";
}) {
  // 1. Ejecutamos la inserción con los comodines '?'
  const [result]: any = await pool.query(
    `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
    `,
    [data.fullName, data.email, data.passwordHash, data.role]
  );

  // 2. Obtenemos el ID del registro recién insertado
  const userId = result.insertId;

  // 3. Consultamos el usuario para devolverlo con los campos solicitados
  const [rows]: any = await pool.query(
    `
    SELECT user_id, full_name, email, role, is_active, created_at
    FROM users
    WHERE user_id = ?
    `,
    [userId]
  );

  return rows[0];
}