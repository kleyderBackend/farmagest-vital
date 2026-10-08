import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

export async function initPostgresDatabase() {
  if (!process.env.DATABASE_URL) return;

  const sqlPath = fileURLToPath(new URL("./postgres.sql", import.meta.url));
  const sql = await readFile(sqlPath, "utf8");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await pool.query(sql);
    console.log("✅ Base de datos Postgres inicializada");
  } finally {
    await pool.end();
  }
}
