import { apiRequest, formatCurrency, requireAdminSession } from "./api.js?v=2";
import { expirationStatus, escapeHtml } from "./inventory-utils.js";

async function loadReports() {
  const [productResponse, orderResponse] = await Promise.all([apiRequest("/products"), apiRequest("/orders")]);
  const products = productResponse.data.products.filter((product) => product.is_active);
  const orders = orderResponse.data.orders;
  const low = products.filter((product) => Number(product.current_stock) <= Number(product.minimum_stock));
  const soon = products.filter((product) => expirationStatus(product.expiration_date) === "soon");
  const expired = products.filter((product) => expirationStatus(product.expiration_date) === "expired");
  const delivered = orders.filter((order) => ["delivered", "completed"].includes(order.status));
  document.getElementById("reportProducts").textContent = products.length;
  document.getElementById("reportOrders").textContent = orders.length;
  document.getElementById("reportLowStock").textContent = low.length;
  document.getElementById("reportExpiring").textContent = soon.length;
  document.getElementById("reportDelivered").textContent = formatCurrency(delivered.reduce((sum, order) => sum + Number(order.total), 0));
  document.getElementById("reportAlerts").innerHTML = [...new Set([...low, ...soon, ...expired])].map((product) =>
    `<tr><td>${escapeHtml(product.name)}</td><td>${Number(product.current_stock)}</td><td>${Number(product.minimum_stock)}</td><td>${escapeHtml(product.expiration_date?.slice(0, 10) || "Sin fecha")}</td></tr>`,
  ).join("") || '<tr><td colspan="4">No hay alertas de inventario.</td></tr>';
}
if (requireAdminSession()) loadReports().catch((error) => {
  const message = document.getElementById("adminMessage");
  message.textContent = error.message;
  message.className = "admin-message error";
});
