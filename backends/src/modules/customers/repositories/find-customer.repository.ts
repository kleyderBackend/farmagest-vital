import { pool } from "../../../config/db";

export async function findCustomerById(customerId: number) {
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
    WHERE customer_id = ?
    `,
    [customerId],
  );

  return rows[0];
}

export async function findCustomerByEmail(email: string) {
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
    WHERE email = ?
    `,
    [email],
  );

  return rows[0];
}
