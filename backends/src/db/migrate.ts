import { pool } from "../config/db";

export async function migrateDatabase() {
  // Public checkout movements have no internal operator. Keep the FK for staff actions.
  await pool.query(process.env.DATABASE_URL
    ? "ALTER TABLE inventory_movements ALTER COLUMN user_id DROP NOT NULL"
    : "ALTER TABLE inventory_movements MODIFY COLUMN user_id INT NULL");
}
