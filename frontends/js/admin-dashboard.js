import {
  API_BASE_URL,
  formatCurrency,
  formatDate,
  getToken,
  getUser,
  requireAdminSession,
} from "./api.js";

requireAdminSession();

function setupThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const themeStorageKey = "farmagestAdminThemeV2";
  const savedTheme = localStorage.getItem(themeStorageKey) || "light";

  function applyTheme(theme) {
    document.body.dataset.theme = theme;

    if (!toggle) {
      return;
    }

    const isLight = theme === "light";
    toggle.setAttribute(
      "aria-label",
      isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro",
    );
    toggle.querySelector("span").textContent = isLight ? "☀" : "☾";
  }

  applyTheme(savedTheme);

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

function getInitials(name = "Administrador") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function setupAccountMenu() {
  const menu = document.querySelector("[data-account-menu]");
  const toggle = document.querySelector("[data-account-toggle]");
  const panel = document.querySelector("[data-account-panel]");
  const logoutButton = document.querySelector("[data-logout-button]");
  const user = getUser();

  if (!menu || !toggle || !panel) {
    return;
  }

  const displayName = user?.fullName || user?.full_name || "Administrador";
  const role = user?.role || "admin";

  document.querySelectorAll("[data-account-initials]").forEach((target) => {
    target.textContent = getInitials(displayName);
  });

  const accountName = document.querySelector("[data-account-name]");
  const accountRole = document.querySelector("[data-account-role]");

  if (accountName) {
    accountName.textContent = displayName;
  }

  if (accountRole) {
    accountRole.textContent = role === "admin" ? "Administrador" : "Staff";
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = new URL("../dashboards/auth/login.html", import.meta.url).href;
    });
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function renderStockCards(products) {
  const target = document.getElementById("dashboardLowStockBody");

  if (!target) {
    return;
  }

  if (!products.length) {
    target.innerHTML = `<article class="stock-card is-empty">No hay productos con stock bajo.</article>`;
    return;
  }

  target.innerHTML = products
    .map(
      (product) => `
        <article class="stock-card">
          <div class="stock-card__thumb" aria-hidden="true">
            <span></span>
          </div>
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <span>
              <i></i>
              ${Number(product.current_stock || 0)} en stock
            </span>
          </div>
        </article>
      `,
    )
    .join("");
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateRange(days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1));

  return {
    startDate: getLocalDateString(startDate),
    endDate: getLocalDateString(endDate),
  };
}

function setText(id, value) {
  const target = document.getElementById(id);

  if (target) {
    target.textContent = value;
  }
}

function calculateInventoryValue(products) {
  return products.reduce(
    (total, product) =>
      total + Number(product.sale_price || 0) * Number(product.current_stock || 0),
    0,
  );
}

function formatCompactCurrency(value) {
  const numericValue = Number(value || 0);

  if (numericValue >= 1000) {
    return `$${Math.round(numericValue / 1000)}k`;
  }

  return formatCurrency(numericValue);
}

function buildChartPath(points) {
  if (points.length === 1) {
    const point = points[0];
    return `M${point.x} ${point.y}`;
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

function buildDailyIncomeRows(rows, startDate, endDate) {
  const rowsByDate = new Map(
    rows.map((row) => [getLocalDateString(new Date(row.sale_date)), row]),
  );
  const result = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (cursor <= end) {
    const key = getLocalDateString(cursor);
    const row = rowsByDate.get(key);

    result.push({
      sale_date: key,
      total_sold: row?.total_sold || 0,
      sales_count: row?.sales_count || 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

function renderIncomeChart(rows) {
  const target = document.getElementById("dashboardIncomeChart");

  if (!target) {
    return;
  }

  if (!rows.length) {
    target.innerHTML = `<p class="line-chart__empty">No hay ingresos registrados hoy.</p>`;
    return;
  }

  const width = 720;
  const height = 250;
  const paddingX = 32;
  const topY = 22;
  const bottomY = 214;
  const maxValue = Math.max(...rows.map((row) => Number(row.total_sold || 0)), 1);
  const points = rows.map((row, index) => {
    const x =
      rows.length === 1
        ? width / 2
        : paddingX + (index * (width - paddingX * 2)) / (rows.length - 1);
    const value = Number(row.total_sold || 0);
    const y = bottomY - (value / maxValue) * (bottomY - topY);

    return {
      x: Math.round(x),
      y: Math.round(y),
      value,
      date: row.sale_date,
    };
  });
  const linePath = buildChartPath(points);
  const areaPath =
    points.length === 1
      ? `M${points[0].x - 40} ${bottomY} L${points[0].x} ${points[0].y} L${points[0].x + 40} ${bottomY} Z`
      : `${linePath} L${points.at(-1).x} ${bottomY} L${points[0].x} ${bottomY} Z`;

  target.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Ingresos reales por dia">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#5f8edb" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#5f8edb" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="line-chart__area" d="${areaPath}" />
      <path class="line-chart__line" d="${linePath}" />
      <g class="line-chart__points">
        ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" />`).join("")}
      </g>
      <g class="line-chart__labels">
        ${points
          .map(
            (point) =>
              `<text x="${Math.max(8, point.x - 18)}" y="${Math.max(14, point.y - 12)}">${formatCompactCurrency(point.value)}</text>`,
          )
          .join("")}
        ${points
          .map(
            (point) =>
              `<text x="${Math.max(8, point.x - 18)}" y="238">${formatShortDate(point.date)}</text>`,
          )
          .join("")}
      </g>
    </svg>
  `;
}

async function fetchDashboardJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = getToken();

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error || data?.message || "No se pudo consultar el backend";
    throw new Error(message);
  }

  return data;
}

async function loadSalesMetrics() {
  const today = getLocalDateString();
  const { startDate, endDate } = getDateRange(7);

  try {
    const salesTotalResponse = await fetchDashboardJson("/sales/total-sold");
    const incomeTodayResponse = await fetchDashboardJson(
      `/sales/total-sold?startDate=${today}&endDate=${today}`,
    );
    const dailyIncomeResponse = await fetchDashboardJson(
      `/sales/daily-income?startDate=${startDate}&endDate=${endDate}`,
    );

    const salesCount = salesTotalResponse.data?.totalSold?.sales_count || 0;
    const incomeToday = incomeTodayResponse.data?.totalSold?.total_sold || 0;

    setText("dashboardSalesTotal", Number(salesCount));
    setText("dashboardIncomeToday", formatCurrency(incomeToday));
    renderIncomeChart(
      buildDailyIncomeRows(dailyIncomeResponse.data?.dailyIncome || [], startDate, endDate),
    );
  } catch {
    setText("dashboardSalesTotal", 0);
    setText("dashboardIncomeToday", formatCurrency(0));
    renderIncomeChart([]);
  }
}

async function loadDashboard() {
  try {
    const response = await fetchDashboardJson("/products", { auth: false });
    const products = response.data?.products || [];

    setText("dashboardProductsCount", products.length);
    setText("dashboardInventoryValue", formatCurrency(calculateInventoryValue(products)));

    const lowStockProducts = products
      .filter((product) => Number(product.current_stock) <= Number(product.minimum_stock))
      .slice(0, 5);

    renderStockCards(lowStockProducts);

    renderRows(
      "dashboardRecentProductsBody",
      products
        .slice(0, 5)
        .map(
          (product) => `
            <tr>
              <td>PRD-${String(product.product_id).padStart(3, "0")}</td>
              <td>${escapeHtml(product.name)}</td>
              <td>${escapeHtml(product.category_name || "Sin categoria")}</td>
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
    renderStockCards([]);
    renderRows("dashboardRecentProductsBody", "", 6);
  }
}

setupThemeToggle();
setupAccountMenu();
loadSalesMetrics();
loadDashboard();
