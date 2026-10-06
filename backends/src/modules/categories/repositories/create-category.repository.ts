import { pool } from "../../../config/db";
import type { CreateCategoryInput } from "../categories.type";

export async function createCategory(data: CreateCategoryInput) {
  // 1. Ejecutamos la inserción con los comodines '?'
  const [result]: any = await pool.query(
    `
    INSERT INTO categories (
      name,
      description
    )
    VALUES (?, ?)
    `,
    [data.name, data.description ?? null],
  );

  // 2. Obtenemos el ID de la categoría recién creada
  const categoryId = result.insertId;

  // 3. Consultamos y devolvemos el registro completo
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