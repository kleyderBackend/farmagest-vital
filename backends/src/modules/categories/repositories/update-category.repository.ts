import { pool } from "../../../config/db";
import type { UpdateCategoryInput } from "../categories.type";

export async function updateCategory(data: UpdateCategoryInput) {
  const result = await pool.query(
    `
    UPDATE categories
    SET
      name = COALESCE($2, name),
      description = COALESCE($3, description),
      is_active = COALESCE($4, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = $1
    RETURNING
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    `,
    [data.categoryId, data.name ?? null, data.description ?? null, data.isActive ?? null],
  );

  return result.rows[0];
}

export async function deactivateCategory(categoryId: number) {
  const result = await pool.query(
    `
    UPDATE categories
    SET
      is_active = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = $1
    RETURNING
      category_id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    `,
    [categoryId],
  );

  return result.rows[0];
}
