import { pool } from "../../../config/db";
import type { CreateCustomerInput } from "../customers.type";

export async function createCustomer(data: CreateCustomerInput) {
  const result = await pool.query(
    `
    INSERT INTO customers (
      full_name,
      phone,
      email,
      address
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      customer_id,
      full_name,
      phone,
      email,
      address,
      created_at,
      updated_at
    `,
    [data.fullName, data.phone, data.email, data.address ?? null],
  );

  return result.rows[0];
}
