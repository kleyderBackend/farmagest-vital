import { apiRequest, formatCurrency, formatDate, requireAdminSession } from "./api.js";

requireAdminSession();

function renderRows(targetId, html, emptyColspan) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  target.innerHTML =
    html ||
    `<tr><td colspan="${emptyColspan}">No hay información para mostrar.</td></tr>`;
}

async function loadDashboard() {
  try {
    const response = await apiRequest("/products", { auth: false });
    const products = response.data?.products || [];

    const productsCount = document.getElementById("dashboardProductsCount");
    if (productsCount) {
      productsCount.textContent = products.length;
    }

    const lowStockProducts = products
      .filter((product) => Number(product.current_stock) <= Number(product.minimum_stock))
      .slice(0, 5);

    renderRows(
      "dashboardLowStockBody",
      lowStockProducts
        .map(
          (product) => `
            <tr>
              <td>${product.name}</td>
              <td>${product.current_stock}</td>
              <td>${product.minimum_stock}</td>
            </tr>
          `,
        )
        .join(""),
      3,
    );

    renderRows(
      "dashboardRecentProductsBody",
      products
        .slice(0, 5)
        .map(
          (product) => `
            <tr>
              <td>PRD-${String(product.product_id).padStart(3, "0")}</td>
              <td>${product.name}</td>
              <td>${product.category_name || "Sin categoría"}</td>
              <td>${product.current_stock}</td>
              <td>${formatCurrency(product.sale_price)}</td>
              <td>${formatDate(product.created_at)}</td>
            </tr>
          `,
        )
        .join(""),
      6,
    );
  } catch {
    renderRows("dashboardLowStockBody", "", 3);
    renderRows("dashboardRecentProductsBody", "", 6);
  }
}

loadDashboard();
