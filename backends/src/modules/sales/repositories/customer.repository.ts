import { pool } from "../../../config/db";
import type { QueryExecutor } from "../sales.type";

export async function findCustomerById(
  customerId: number,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
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

export async function findCustomerByEmail(
  email: string,
  db: QueryExecutor = pool,
) {
  const result = await db.query(
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

export async function createCheckoutCustomer(
  data: {
    fullName: string;
    phone: string;
    email: string;
    address?: string;
  },
  db: QueryExecutor = pool,
) {
  const result = await db.query(
    `
    INSERT INTO customers (
      full_name,
      phone,
      email,
      address
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      address = COALESCE(EXCLUDED.address, customers.address),
      updated_at = CURRENT_TIMESTAMP
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
