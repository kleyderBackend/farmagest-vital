import { pool } from "../../../config/db";

export async function findCategoryById(categoryId: number) {
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
    WHERE category_id = $1
    `,
    [categoryId],
  );

  return result.rows[0];
}

export async function findCategoryByName(name: string) {
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
    WHERE LOWER(name) = LOWER($1)
    `,
    [name],
  );

  return result.rows[0];
}
