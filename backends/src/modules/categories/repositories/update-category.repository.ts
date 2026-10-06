import { pool } from "../../../config/db";
import type { UpdateCategoryInput } from "../categories.type";

export async function updateCategory(data: UpdateCategoryInput) {
  // 1. Ejecutamos el UPDATE usando '?'
  await pool.query(
    `
    UPDATE categories
    SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      is_active = COALESCE(?, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = ?
    `,
    [data.name ?? null, data.description ?? null, data.isActive ?? null, data.categoryId],
  );

  // 2. Consultamos y devolvemos la categoría actualizada
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
    [data.categoryId]
  );

  return rows[0];
}

export async function deactivateCategory(categoryId: number) {
  // 1. Ejecutamos la desactivación usando '?'
  await pool.query(
    `
    UPDATE categories
    SET
      is_active = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = ?
    `,
    [categoryId],
  );

  // 2. Consultamos y devolvemos el registro actualizado
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
    [categoryId]
  );

  return rows[0];
}