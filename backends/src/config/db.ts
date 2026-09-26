import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || undefined,
  max: 2,
  idleTimeoutMillis: 30000,
});

export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() AS fecha');
    console.log('✅ Conexión exitosa:', res.rows[0].fecha);
  } catch (err:any) {
    console.error('❌ Error de conexión:', err.message);
  }
}