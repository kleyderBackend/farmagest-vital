import { pool } from "../../../config/db";
import type { UpdateCustomerInput } from "../customers.type";

export async function updateCustomer(data: UpdateCustomerInput) {
  const result = await pool.query(
    `
    UPDATE customers
    SET
      full_name = COALESCE($2, full_name),
      phone = COALESCE($3, phone),
      email = COALESCE($4, email),
      address = COALESCE($5, address),
      updated_at = CURRENT_TIMESTAMP
    WHERE customer_id = $1
    RETURNING
      customer_id,
      full_name,
      phone,
      email,
      address,
      created_at,
      updated_at
    `,
    [
      data.customerId,
      data.fullName ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.address ?? null,
    ],
  );

  return result.rows[0];
}
