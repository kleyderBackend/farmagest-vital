import { pool } from "../../../config/db";
import type { CreateCategoryInput } from "../categories.type";

export async function createCategory(data: CreateCategoryInput) {
  const result = await pool.query(
    `
    INSERT INTO categories (
      name,
      description
    )
    VALUES ($1, $2)
    RETURNING
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    `,
    [data.name, data.description ?? null],
  );

  return result.rows[0];
}
