import { apiRequest, formatCurrency, formatDate, requireAdminSession } from "./api.js";

requireAdminSession();

const EXPIRATION_ALERT_DAYS = 30;

function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  const dateText = String(value).slice(0, 10);
  const [year, month, day] = dateText.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDaysUntilExpiration(value) {
  const expirationDate = parseDateOnly(value);

  if (!expirationDate) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round((expirationDate - today) / (24 * 60 * 60 * 1000));
}

function getProductStatus(product) {
  const daysUntilExpiration = getDaysUntilExpiration(product.expiration_date);

  if (daysUntilExpiration !== null && daysUntilExpiration < 0) {
    return { className: "expired", label: "Vencido" };
  }

  if (
    daysUntilExpiration !== null &&
    daysUntilExpiration <= EXPIRATION_ALERT_DAYS
  ) {
    return { className: "warning", label: "Por vencer" };
  }

  if (Number(product.current_stock) <= Number(product.minimum_stock)) {
    return { className: "warning", label: "Stock bajo" };
  }

  if (!product.is_available) {
    return { className: "inactive", label: "No disponible" };
  }

  return { className: "active", label: "Disponible" };
}

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
        .map((product) => {
          const status = getProductStatus(product);

          return `
            <tr>
              <td>PRD-${String(product.product_id).padStart(3, "0")}</td>
              <td>${product.name}</td>
              <td>${product.category_name || "Sin categoría"}</td>
              <td>${product.current_stock}</td>
              <td>${formatCurrency(product.sale_price)}</td>
              <td>${formatDate(product.expiration_date)}</td>
              <td><span class="status ${status.className}">${status.label}</span></td>
            </tr>
          `;
        })
        .join(""),
      7,
    );
  } catch {
    renderRows("dashboardLowStockBody", "", 3);
    renderRows("dashboardRecentProductsBody", "", 7);
  }
}

loadDashboard();
