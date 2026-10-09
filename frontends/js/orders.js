import { apiRequest, formatCurrency, formatDate } from "./api.js";

const form = document.getElementById("trackingForm");
const input = document.getElementById("trackingCode");
const button = document.getElementById("trackingButton");
const message = document.getElementById("trackingMessage");
const result = document.getElementById("trackingResult");

const statusMap = {
  pending: {
    label: "Pendiente",
    description: "Recibimos tu solicitud y está lista para revisión.",
    step: 1,
  },
  processing: {
    label: "En preparación",
    description: "Estamos preparando los productos de tu compra.",
    step: 2,
  },
  preparing: {
    label: "En preparación",
    description: "Estamos preparando los productos de tu compra.",
    step: 2,
  },
  on_the_way: {
    label: "En camino",
    description: "Tu pedido va en curso para ser entregado.",
    step: 3,
  },
  completed: {
    label: "Entregada",
    description: "Tu pedido fue entregado correctamente.",
    step: 4,
  },
  delivered: {
    label: "Entregada",
    description: "Tu pedido fue entregado correctamente.",
    step: 4,
  },
  cancelled: {
    label: "Cancelada",
    description: "Esta compra fue cancelada.",
    step: 0,
  },
};

function normalizeOrderCode(value) {
  return String(value || "").trim().toUpperCase();
}

function showMessage(text, type = "info") {
  if (!message) return;

  message.textContent = text;
  message.className = `tracking-message ${type}`;
  message.hidden = false;
}

function clearMessage() {
  if (!message) return;

  message.textContent = "";
  message.hidden = true;
}

function setLoading(isLoading) {
  if (!button || !input) return;

  button.disabled = isLoading;
  input.disabled = isLoading;
  button.textContent = isLoading ? "Consultando..." : "Consultar";
}

function getStatusData(status) {
  return statusMap[status] || {
    label: "En revisión",
    description: "La compra está registrada y pendiente de actualización.",
    step: 1,
  };
}

function buildStepClass(currentStep, step) {
  const classes = [];

  if (currentStep >= step) {
    classes.push("is-active");
  }

  if (currentStep > step) {
    classes.push("is-complete");
  }

  return classes.join(" ");
}

function renderItems(items = []) {
  if (!items.length) {
    return `<p class="tracking-empty">No hay productos registrados en esta compra.</p>`;
  }

  return items
    .map(
      (item) => `
        <article class="tracking-item">
          <div>
            <strong>${item.product_name}</strong>
            <span>${item.presentation || "Presentación no registrada"}</span>
          </div>
          <p>${Number(item.quantity)} x ${formatCurrency(item.unit_price)}</p>
          <b>${formatCurrency(item.subtotal)}</b>
        </article>
      `,
    )
    .join("");
}

function renderTracking(tracking) {
  if (!result) return;

  const status = getStatusData(tracking.status);
  const isCancelled = tracking.status === "cancelled";
  const delivery = tracking.delivery || {};
  const deliveryAddress = [
    delivery.address,
    delivery.neighborhood,
    delivery.city,
  ]
    .filter(Boolean)
    .join(", ");

  result.innerHTML = `
    <div class="tracking-result-header">
      <div>
        <span>Pedido</span>
        <h2>${tracking.orderCode}</h2>
      </div>
      <strong class="tracking-status ${tracking.status}">
        ${status.label}
      </strong>
    </div>

    <p class="tracking-status-text">${status.description}</p>

    <div class="tracking-summary">
      <div>
        <span>Cliente</span>
        <strong>${tracking.customerName}</strong>
      </div>
      <div>
        <span>Fecha</span>
        <strong>${formatDate(tracking.orderDate)}</strong>
      </div>
      <div>
        <span>Total</span>
        <strong>${formatCurrency(tracking.total)}</strong>
      </div>
    </div>

    <div class="tracking-delivery">
      <span>Dirección de entrega</span>
      <strong>${deliveryAddress || "No registrada"}</strong>
      ${delivery.note ? `<p>${delivery.note}</p>` : ""}
    </div>

    <div class="tracking-timeline ${isCancelled ? "is-cancelled" : ""}">
      <div class="${buildStepClass(status.step, 1)}">
        <span></span>
        <p>Recibida</p>
      </div>
      <div class="${buildStepClass(status.step, 2)}">
        <span></span>
        <p>Preparación</p>
      </div>
      <div class="${buildStepClass(status.step, 3)}">
        <span></span>
        <p>En camino</p>
      </div>
      <div class="${buildStepClass(status.step, 4)}">
        <span></span>
        <p>Entregada</p>
      </div>
    </div>

    <div class="tracking-items">
      <h3>Productos de la compra</h3>
      ${renderItems(tracking.items)}
    </div>
  `;
  result.hidden = false;
}

async function handleTracking(event) {
  event.preventDefault();

  const code = normalizeOrderCode(input?.value);

  if (!code) {
    showMessage("Escribe el número de pedido para consultar.", "error");
    return;
  }

  try {
    setLoading(true);
    clearMessage();

    const response = await apiRequest(`/orders/tracking/${encodeURIComponent(code)}`, {
      auth: false,
    });

    renderTracking(response.data.tracking);
    localStorage.setItem("farmagest-last-order", response.data.tracking.orderCode);
    showMessage("Compra encontrada correctamente.", "success");
  } catch (error) {
    if (result) result.hidden = true;
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function hydrateInitialCode() {
  if (!input) return;

  const params = new URLSearchParams(window.location.search);
  const queryCode = params.get("pedido");
  const lastOrderCode = localStorage.getItem("farmagest-last-order");
  const initialCode = queryCode || lastOrderCode;

  if (initialCode) {
    input.value = normalizeOrderCode(initialCode);
  }
}

hydrateInitialCode();
form?.addEventListener("submit", handleTracking);
