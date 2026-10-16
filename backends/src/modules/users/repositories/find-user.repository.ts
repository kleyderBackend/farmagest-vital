import { pool } from "../../../config/db";
import type { QueryExecutor } from "../../sales/sales.type";

export async function findUserById(userId: number | string, db: QueryExecutor = pool, lock = false) {
  const [rows]: any = await db.query(
    `
    SELECT user_id, full_name, email, role, is_active
    FROM users
    WHERE user_id = ?
    ${lock ? "FOR UPDATE" : ""}
    `,
    [userId],
  );
  return rows[0];
}

export async function findActiveAdminsForUpdate(db: QueryExecutor) {
  const [rows]: any = await db.query(
    `
    SELECT user_id
    FROM users
    WHERE role = 'admin' AND is_active = TRUE
    ORDER BY user_id
    FOR UPDATE
    `,
  );
  return rows;
}
