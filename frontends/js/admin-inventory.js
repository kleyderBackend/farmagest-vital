import { apiRequest, formatDate, requireAdminSession } from "./api.js?v=2";
import { expirationStatus, escapeHtml } from "./inventory-utils.js";

const message = document.getElementById("adminMessage");
const form = document.getElementById("movementForm");
const labels = { in: "Entrada", out: "Salida", adjustment: "Ajuste" };
let products = [];

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `admin-message ${type}`;
}

function renderStock() {
  const search = document.getElementById("inventorySearch").value.trim().toLowerCase();
  const filter = document.getElementById("stockFilter").value;
  const filtered = products.filter((product) => {
    const expiration = expirationStatus(product.expiration_date);
    const low = Number(product.current_stock) <= Number(product.minimum_stock);
    return product.name.toLowerCase().includes(search) &&
      (!filter || (filter === "low" ? low : expiration === filter));
  });
  document.getElementById("inventoryTableBody").innerHTML = filtered.map((product) => {
    const expiration = expirationStatus(product.expiration_date);
    const low = Number(product.current_stock) <= Number(product.minimum_stock);
    return `<tr><td>${escapeHtml(product.name)}</td><td>${Number(product.current_stock)}</td>
      <td>${Number(product.minimum_stock)}</td><td>${product.expiration_date ? escapeHtml(formatDate(product.expiration_date)) : "Sin fecha"}</td>
      <td>${!product.is_active ? "Inactivo · " : ""}${low ? "Stock bajo · " : ""}${({ expired: "Vencido", soon: "Vence en 30 días", valid: "Vigente", none: "Sin fecha" })[expiration]}</td></tr>`;
  }).join("") || '<tr><td colspan="5">No hay productos para este filtro.</td></tr>';
}

async function loadInventory() {
  const [productResponse, movementResponse] = await Promise.all([apiRequest("/products"), apiRequest("/inventory")]);
  products = productResponse.data.products;
  const select = document.getElementById("movementProduct");
  const selected = select.value;
  select.replaceChildren(new Option("Selecciona un producto", ""));
  products.forEach((product) => select.add(new Option(`${product.name} (${product.current_stock})`, product.product_id)));
  select.value = selected;
  renderStock();
  document.getElementById("movementsTableBody").innerHTML = movementResponse.data.movements.map((movement) =>
    `<tr><td>${escapeHtml(formatDate(movement.movement_date))}</td><td>${escapeHtml(movement.product_name)}</td>
      <td>${labels[movement.movement_type] || "Movimiento"}</td><td>${Number(movement.quantity)}</td>
      <td>${escapeHtml(movement.reason)}</td><td>${escapeHtml(movement.user_name || "Compra en línea")}</td></tr>`,
  ).join("") || '<tr><td colspan="6">Todavía no hay movimientos.</td></tr>';
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const data = new FormData(form);
    await apiRequest("/inventory", { method: "POST", body: JSON.stringify({
      productId: Number(data.get("productId")), type: data.get("type"),
      quantity: Number(data.get("quantity")), reason: String(data.get("reason")).trim(),
    }) });
    form.reset();
    await loadInventory();
    showMessage("Movimiento registrado con éxito", "success");
  } catch (error) { showMessage(error.message); }
  finally { button.disabled = false; }
});
document.getElementById("inventorySearch").addEventListener("input", renderStock);
document.getElementById("stockFilter").addEventListener("change", renderStock);
if (requireAdminSession()) loadInventory().catch((error) => showMessage(error.message));
