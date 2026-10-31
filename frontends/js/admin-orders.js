import {
  apiRequest,
  formatCurrency,
  formatDate,
  requireAdminSession,
} from "./api.js?v=2";
import { configureStatusSelect } from "./order-status.js";

const statuses = {
  pending: "Pendiente",
  preparing: "Preparando",
  on_the_way: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

let cachedOrders = [];
let selectedOrderId = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminMessage");

  if (!messageBox) {
    return;
  }

  if (!message) {
    messageBox.textContent = "";
    messageBox.className = "admin-message";
    return;
  }

  messageBox.textContent = message;
  messageBox.className = `admin-message ${type}`;
}

function getOrderCode(orderId) {
  return `FV-${String(orderId).padStart(6, "0")}`;
}

function getStatusLabel(status) {
  return statuses[status] || "Sin estado";
}

function getStatusClass(status) {
  if (status === "cancelled") return "warning";
  if (status === "delivered") return "active";
  return "info";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "No disponible";
}

function updateSummary(orders) {
  setText("totalOrders", orders.length);
  setText(
    "activeOrders",
    orders.filter((order) =>
      ["pending", "preparing", "on_the_way"].includes(order.status),
    ).length,
  );
  setText(
    "deliveredOrders",
    orders.filter((order) => order.status === "delivered").length,
  );
  setText(
    "cancelledOrders",
    orders.filter((order) => order.status === "cancelled").length,
  );
}

function renderOrders(orders) {
  const tableBody = document.getElementById("ordersTableBody");

  if (!tableBody) return;

  if (orders.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">No hay pedidos para mostrar.</td></tr>';
    return;
  }

  tableBody.innerHTML = orders
    .map(
      (order) => `
        <tr>
          <td>${escapeHtml(getOrderCode(order.order_id))}</td>
          <td>${escapeHtml(order.customer_name || "Cliente")}</td>
          <td>${escapeHtml(formatDate(order.order_date))}</td>
          <td>${escapeHtml(formatCurrency(order.total))}</td>
          <td>${escapeHtml(order.delivery_city || "Sin ciudad")}</td>
          <td><span class="status ${getStatusClass(order.status)}">${escapeHtml(getStatusLabel(order.status))}</span></td>
          <td>
            <button class="table-action" type="button" data-order-detail="${escapeHtml(order.order_id)}">
              Gestionar
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function applyFilters() {
  const status = document.getElementById("orderStatusFilter")?.value || "";
  const search = (document.getElementById("orderSearch")?.value || "")
    .trim()
    .toLowerCase();

  let orders = [...cachedOrders];

  if (status) {
    orders = orders.filter((order) => order.status === status);
  }

  if (search) {
    orders = orders.filter((order) => {
      const searchable = [
        getOrderCode(order.order_id),
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.delivery_city,
        order.delivery_neighborhood,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    });
  }

  renderOrders(orders);
}

function renderItems(items = []) {
  const tableBody = document.getElementById("orderItemsBody");

  if (!tableBody) return;

  tableBody.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.product_name || "Producto")}</td>
              <td>${escapeHtml(item.presentation || "Sin presentación")}</td>
              <td>${escapeHtml(item.quantity)}</td>
              <td>${escapeHtml(formatCurrency(item.unit_price))}</td>
              <td>${escapeHtml(formatCurrency(item.subtotal))}</td>
            </tr>
          `,
        )
        .join("")
    : '<tr><td colspan="5">Este pedido no tiene productos asociados.</td></tr>';
}

function fillDeliveryForm(order) {
  document.getElementById("deliveryAddress").value =
    order.delivery_address || order.customer_address || "";
  document.getElementById("deliveryNeighborhood").value =
    order.delivery_neighborhood || "";
  document.getElementById("deliveryCity").value = order.delivery_city || "";
  document.getElementById("deliveryNote").value = order.delivery_note || "";
}

async function loadOrderDetails(orderId) {
  try {
    const response = await apiRequest(`/orders/${encodeURIComponent(orderId)}`);
    const order = response.data?.order;

    if (!order) {
      throw new Error("No se encontró el pedido seleccionado.");
    }

    selectedOrderId = order.order_id;
    document.getElementById("orderDetailTitle").textContent =
      `Pedido ${getOrderCode(order.order_id)}`;
    setText("orderCustomer", order.customer_name);
    setText("orderEmail", order.customer_email);
    setText("orderPhone", order.customer_phone);
    setText("orderTotal", formatCurrency(order.total));
    document.getElementById("orderStatusSelect").value = order.status;
    configureStatusSelect(document.getElementById("orderStatusSelect"), order.status);
    fillDeliveryForm(order);
    renderItems(order.items || []);
    document.getElementById("orderDetails").hidden = false;
    document.getElementById("orderItemsSection").hidden = false;
    showMessage("");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadOrders() {
  try {
    const response = await apiRequest("/orders");
    cachedOrders = response.data?.orders || [];
    updateSummary(cachedOrders);
    applyFilters();
    showMessage("");
  } catch (error) {
    if (error.message.startsWith("No hay pedidos")) {
      cachedOrders = [];
      updateSummary([]);
      renderOrders([]);
      showMessage("");
      return;
    }

    showMessage(error.message, "error");
    renderOrders([]);
    updateSummary([]);
  }
}

async function updateStatus(event) {
  event.preventDefault();

  if (!selectedOrderId) {
    showMessage("Selecciona un pedido antes de actualizar el estado.", "error");
    return;
  }

  const status = document.getElementById("orderStatusSelect").value;

  try {
    await apiRequest(`/orders/${encodeURIComponent(selectedOrderId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    showMessage("Estado actualizado correctamente.");
    await loadOrders();
    await loadOrderDetails(selectedOrderId);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function updateDelivery(event) {
  event.preventDefault();

  if (!selectedOrderId) {
    showMessage("Selecciona un pedido antes de actualizar la entrega.", "error");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const payload = {
    deliveryAddress: String(formData.get("deliveryAddress") || "").trim(),
    deliveryNeighborhood: String(formData.get("deliveryNeighborhood") || "").trim(),
    deliveryCity: String(formData.get("deliveryCity") || "").trim(),
    deliveryNote: String(formData.get("deliveryNote") || "").trim(),
  };

  try {
    await apiRequest(`/orders/${encodeURIComponent(selectedOrderId)}/delivery`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    showMessage("Datos de entrega actualizados correctamente.");
    await loadOrders();
    await loadOrderDetails(selectedOrderId);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

if (requireAdminSession()) {
  loadOrders();
  document.getElementById("applyOrderFilters")?.addEventListener("click", applyFilters);
  document.getElementById("orderSearch")?.addEventListener("input", applyFilters);
  document.getElementById("orderStatusForm")?.addEventListener("submit", updateStatus);
  document
    .getElementById("orderDeliveryForm")
    ?.addEventListener("submit", updateDelivery);
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-order-detail]");
    if (button) loadOrderDetails(button.dataset.orderDetail);
  });
}
