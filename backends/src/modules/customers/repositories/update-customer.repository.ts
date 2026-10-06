import { pool } from "../../../config/db";
import type { UpdateCustomerInput } from "../customers.type";

export async function updateCustomer(data: UpdateCustomerInput) {
  await pool.query(
    `
    UPDATE customers
    SET
      full_name = COALESCE(?, full_name),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      address = COALESCE(?, address),
      updated_at = CURRENT_TIMESTAMP
    WHERE customer_id = ?
    `,
    [
      data.fullName ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.address ?? null,
      data.customerId,
    ],
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
    [data.customerId],
  );

  return rows[0];
}
