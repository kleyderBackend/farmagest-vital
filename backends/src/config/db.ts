import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || "farma_vital",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  connectionLimit: 2,
  waitForConnections: true,
  queueLimit: 0,
});

export async function testConnection() {
  try {
    const [rows]: any = await pool.query('SELECT NOW() AS fecha');
    console.log('✅ Conexión exitosa:', rows[0].fecha);
  } catch (err: any) {
    console.error('❌ Error de conexión:', err.message);
  }
}