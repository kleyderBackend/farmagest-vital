import { pool } from "../../../config/db";

export async function listCustomers() {
  const [rows]: any = await pool.query(
    `
    SELECT
      customer_id,
      full_name,
      phone,
      email,
      address,
      created_at,
      updated_at
    FROM customers
    ORDER BY created_at DESC
    `,
  );

  return rows;
}
