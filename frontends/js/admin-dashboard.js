import {
  apiRequest,
  formatCurrency,
  formatDate,
  getUser,
  requireAdminSession,
} from "./api.js";

requireAdminSession();

function setupThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const savedTheme = localStorage.getItem("farmagestAdminTheme") || "dark";

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
    localStorage.setItem("farmagestAdminTheme", nextTheme);
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
      window.location.href = "/frontends/dashboards/auth/login.html";
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
loadDashboard();
