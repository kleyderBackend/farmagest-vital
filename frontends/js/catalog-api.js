import { apiRequest, formatCurrency } from "./api.js";

export const normalizeProduct = (product) => ({
  id: Number(product.product_id ?? product.id),
  categoryId: Number(product.category_id ?? product.categoryId),
  category: product.category_name ?? product.category ?? "Sin categoría",
  name: product.name ?? "Producto sin nombre",
  presentation: product.presentation ?? "Presentación no especificada",
  description: product.description ?? "Producto disponible en Farmagest Vital.",
  price: Number(product.sale_price ?? product.price ?? 0),
  stock: Number(product.current_stock ?? product.stock ?? 0),
  minimumStock: Number(product.minimum_stock ?? product.minimumStock ?? 0),
  expirationDate: product.expiration_date ?? product.expirationDate ?? null,
  imageUrl: product.image_url ?? product.imageUrl ?? "",
  available: Boolean(product.is_available ?? product.available),
});

export const normalizeCategory = (category) => ({
  id: Number(category.category_id ?? category.id),
  name: category.name ?? category.name_category ?? "Sin nombre",
  description: category.description ?? category.description_category ?? "",
  isActive: Boolean(category.is_active ?? category.isActive ?? true),
});

export async function getAvailableProducts() {
  const response = await apiRequest("/products/available", { auth: false });
  return (response.data?.products ?? []).map(normalizeProduct);
}

export async function getProductById(productId) {
  const response = await apiRequest(`/products/${productId}`, { auth: false });
  return normalizeProduct(response.data?.product ?? response.product);
}

export async function getCategories() {
  const response = await apiRequest("/categories/active", { auth: false });
  return (response.data?.categories ?? [])
    .map(normalizeCategory)
    .filter((category) => category.isActive);
}

export function formatProductPrice(value) {
  return formatCurrency(value).replace(/\s/g, " ");
}

export function createProductImage(product) {
  if (product.imageUrl) {
    return product.imageUrl;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#dff9f0"/>
          <stop offset="100%" stop-color="#ebf7ff"/>
        </linearGradient>
      </defs>
      <rect width="800" height="520" rx="36" fill="url(#bg)"/>
      <circle cx="650" cy="120" r="90" fill="#9ee7c5" opacity="0.8"/>
      <circle cx="180" cy="420" r="120" fill="#b6e0ff" opacity="0.8"/>
      <rect x="120" y="170" width="560" height="180" rx="32" fill="rgba(255,255,255,0.82)"/>
      <text x="50%" y="46%" text-anchor="middle" font-size="24" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#1f2d3d">${product.category}</text>
      <text x="50%" y="58%" text-anchor="middle" font-size="36" font-family="Segoe UI, Arial, sans-serif" font-weight="800" fill="#0f8f64">${product.name}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
