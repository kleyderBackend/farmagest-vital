import { pool } from "../../../config/db";

export async function findCategoryById(categoryId: number) {
  const [rows]: any = await pool.query(
    `
    SELECT
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE category_id = ?
    `,
    [categoryId],
  );

  return rows[0];
}

export async function findCategoryByName(name: string) {
  const [rows]: any = await pool.query(
    `
    SELECT
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE LOWER(name) = LOWER(?)
    `,
    [name],
  );

  return rows[0];
}