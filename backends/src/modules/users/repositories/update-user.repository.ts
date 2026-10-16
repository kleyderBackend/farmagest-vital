import { pool } from "../../../config/db";
import type { QueryExecutor } from "../../sales/sales.type";
import type { UpdateUserRecord } from "../users.type";
import { findUserById } from "./find-user.repository";

export async function updateUser(data: UpdateUserRecord, db: QueryExecutor = pool) {
  await db.query(
    `
    UPDATE users
    SET full_name = ?, email = ?, role = ?, is_active = ?,
        password_hash = COALESCE(?, password_hash), updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
    `,
    [data.fullName, data.email, data.role, data.isActive, data.passwordHash, data.userId],
  );
  return findUserById(data.userId, db);
}
