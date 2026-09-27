import { pool } from "../../../config/db";

export async function listCategories() {
  const result = await pool.query(
    `
    SELECT
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    ORDER BY name ASC
    `,
  );

  return result.rows;
}

export async function listActiveCategories() {
  const result = await pool.query(
    `
    SELECT
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE is_active = TRUE
    ORDER BY name ASC
    `,
  );

  return result.rows;
}
