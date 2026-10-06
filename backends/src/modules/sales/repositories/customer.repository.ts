import { pool } from "../../../config/db";
import type { QueryExecutor } from "../sales.type";

export async function findCustomerById(
  customerId: number,
  db: QueryExecutor = pool,
) {
  const [rows]: any = await db.query(
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

export async function findCustomerByEmail(
  email: string,
  db: QueryExecutor = pool,
) {
  const [rows]: any = await db.query(
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

export async function createCheckoutCustomer(
  data: {
    fullName: string;
    phone: string;
    email: string;
    address?: string;
  },
  db: QueryExecutor = pool,
) {
  await db.query(
    `
    INSERT INTO customers (
      full_name,
      phone,
      email,
      address
    )
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      phone = VALUES(phone),
      address = COALESCE(VALUES(address), customers.address),
      updated_at = CURRENT_TIMESTAMP
    `,
    [data.fullName, data.phone, data.email, data.address ?? null],
  );

  const [rows]: any = await db.query(
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
    [data.email],
  );

  return rows[0];
}
