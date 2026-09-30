import { pool } from "../../../config/db";

export async function findCustomerById(customerId: number) {
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
    WHERE customer_id = $1
    `,
    [customerId],
  );

  return result.rows[0];
}

export async function findCustomerByEmail(email: string) {
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
    WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
}
