import { pool } from "../../../config/db";

const productSelect = `
  SELECT
    p.product_id,
    p.category_id,
    c.name AS category_name,
    p.name,
    p.presentation,
    p.description,
    p.sale_price,
    p.current_stock,
    p.minimum_stock,
    p.expiration_date,
    p.image_url,
    p.is_available,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM products p
  INNER JOIN categories c ON c.category_id = p.category_id
`;

export async function listProducts() {
  const [rows]: any = await pool.query(
    `
    ${productSelect}
    ORDER BY p.name ASC
    `,
  );

  return rows;
}

export async function listActiveProducts() {
  const [rows]: any = await pool.query(
    `
    ${productSelect}
    WHERE p.is_active = TRUE
    ORDER BY p.name ASC
    `,
  );

  return rows;
}

export async function listAvailableProducts() {
  const [rows]: any = await pool.query(
    `
    ${productSelect}
    WHERE p.is_active = TRUE
      AND p.is_available = TRUE
    ORDER BY p.name ASC
    `,
  );

  return rows;
}

export async function listProductsByCategory(categoryId: number) {
  const [rows]: any = await pool.query(
    `
    ${productSelect}
    WHERE p.category_id = ?
      AND p.is_active = TRUE
    ORDER BY p.name ASC
    `,
    [categoryId],
  );

  return rows;
}