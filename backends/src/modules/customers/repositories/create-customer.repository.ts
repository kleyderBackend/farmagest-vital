import { pool } from "../../../config/db";
import type { CreateCustomerInput } from "../customers.type";

export async function createCustomer(data: CreateCustomerInput) {
  const [result]: any = await pool.query(
    `
    INSERT INTO customers (
      full_name,
      phone,
      email,
      address
    )
    VALUES (?, ?, ?, ?)
    `,
    [data.fullName, data.phone, data.email, data.address ?? null],
  );

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
    [result.insertId],
  );

  return rows[0];
}
