import { pool } from "../../../config/db";

export async function listCustomers() {
  const result = await pool.query(
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

  return result.rows;
}
