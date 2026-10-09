import {
  apiRequest,
  formatCurrency,
  formatDate,
  requireAdminSession,
} from "./api.js";

const page = document.body.dataset.page;
const statuses = {
  pending: "Pendiente",
  processing: "En proceso",
  preparing: "Preparando",
  on_the_way: "En camino",
  completed: "Completada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminMessage");

  if (!messageBox) {
    alert(message);
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

function getStatusLabel(status) {
  return statuses[status] || "Sin estado";
}

function syncSaleStatus(status) {
  setDetailValue("saleStatus", getStatusLabel(status));

  const statusSelect = document.getElementById("saleStatusSelect");
  const updateButton = document.getElementById("updateSaleStatus");

  if (statusSelect) {
    let statusOption = [...statusSelect.options].find(
      (option) => option.value === status,
    );

    if (!statusOption && statuses[status]) {
      statusOption = new Option(
        `${getStatusLabel(status)} (estado actual)`,
        status,
      );
      statusOption.disabled = true;
      statusSelect.add(statusOption);
    }

    statusSelect.value = statusOption ? status : "pending";
  }

  if (updateButton) {
    updateButton.disabled = false;
  }
}

function renderSales(sales) {
  const tableBody = document.getElementById("salesTableBody");

  if (!tableBody) {
    return;
  }

  if (sales.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No hay ventas para mostrar.</td></tr>';
    return;
  }

  tableBody.innerHTML = sales
    .map((sale) => {
      const statusClass = sale.status === "cancelled" ? "warning" : "active";

      return `
        <tr>
          <td>VTA-${String(sale.order_id).padStart(3, "0")}</td>
          <td>${escapeHtml(sale.customer_name || "Cliente")}</td>
          <td>${escapeHtml(formatDate(sale.order_date))}</td>
          <td>${escapeHtml(formatCurrency(sale.total))}</td>
          <td><span class="status ${statusClass}">${escapeHtml(getStatusLabel(sale.status))}</span></td>
          <td><a class="table-action" href="./sale-details.html?id=${encodeURIComponent(sale.order_id)}">Ver detalle</a></td>
        </tr>
      `;
    })
    .join("");
}

function updateSalesSummary(sales) {
  const total = document.getElementById("totalSales");
  const totalSold = document.getElementById("totalSold");
  const pending = document.getElementById("pendingSales");

  total.textContent = sales.length;
  totalSold.textContent = formatCurrency(
    sales.reduce(
      (sum, sale) =>
        sale.status === "cancelled" ? sum : sum + Number(sale.total || 0),
      0,
    ),
  );
  pending.textContent = sales.filter((sale) =>
    ["pending", "processing", "preparing", "on_the_way"].includes(sale.status),
  ).length;
}

async function loadSales() {
  const startDate = document.getElementById("startDate")?.value;
  const endDate = document.getElementById("endDate")?.value;

  if (startDate && endDate && startDate > endDate) {
    showMessage("La fecha inicial no puede ser posterior a la fecha final.", "error");
    return;
  }

  const query = new URLSearchParams();
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);
  const queryString = query.toString();

  try {
    const path = queryString ? `/sales/range?${queryString}` : "/sales";
    const response = await apiRequest(path);
    const sales = response.data?.sales || [];
    renderSales(sales);
    updateSalesSummary(sales);
    showMessage("", "success");
  } catch (error) {
    if (error.message.startsWith("No hay ventas registradas")) {
      renderSales([]);
      updateSalesSummary([]);
      showMessage("", "success");
      return;
    }

    renderSales([]);
    updateSalesSummary([]);
    showMessage(error.message, "error");
  }
}

function setDetailValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "No disponible";
  }
}

function renderSaleItems(items) {
  const tableBody = document.getElementById("saleItemsBody");
  tableBody.innerHTML = items.length > 0
    ? items.map((item) => `
        <tr>
          <td>${escapeHtml(item.product_name || "Producto")}</td>
          <td>${escapeHtml(item.presentation || "Sin presentación")}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(formatCurrency(item.unit_price))}</td>
          <td>${escapeHtml(formatCurrency(item.subtotal))}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="5">Esta venta no tiene productos asociados.</td></tr>';
}

async function loadSaleDetails() {
  const saleId = new URLSearchParams(window.location.search).get("id");

  if (!saleId || !/^\d+$/.test(saleId)) {
    showMessage("Selecciona una venta válida para consultar su detalle.", "error");
    return;
  }

  try {
    const response = await apiRequest(`/sales/${encodeURIComponent(saleId)}`);
    const sale = response.data?.sale;

    if (!sale) {
      throw new Error("No se encontraron los datos de esta venta.");
    }

    document.getElementById("saleTitle").textContent =
      `Venta VTA-${String(sale.order_id).padStart(3, "0")}`;
    syncSaleStatus(sale.status);
    setDetailValue("saleDate", formatDate(sale.order_date));
    setDetailValue("saleTotal", formatCurrency(sale.total));
    setDetailValue("saleNotes", sale.notes);
    setDetailValue("customerName", sale.customer_name);
    setDetailValue("customerEmail", sale.customer_email);
    setDetailValue("customerPhone", sale.customer_phone);
    renderSaleItems(sale.items || []);
    document.getElementById("saleDetails").hidden = false;
    document.getElementById("saleItemsSection").hidden = false;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function updateSaleStatus(event) {
  event.preventDefault();

  const saleId = new URLSearchParams(window.location.search).get("id");
  const statusSelect = document.getElementById("saleStatusSelect");
  const updateButton = document.getElementById("updateSaleStatus");
  const status = statusSelect?.value;

  if (!saleId || !/^\d+$/.test(saleId) || !status) {
    showMessage("No se pudo identificar la venta o el estado seleccionado.", "error");
    return;
  }

  updateButton.disabled = true;

  try {
    const response = await apiRequest(`/orders/${encodeURIComponent(saleId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const updatedStatus = response.data?.order?.status || status;
    syncSaleStatus(updatedStatus);
    showMessage("El estado del pedido se actualizó correctamente.");
  } catch (error) {
    showMessage(error.message, "error");
    updateButton.disabled = false;
  }
}

if (requireAdminSession()) {
  if (page === "sales") {
    document
      .getElementById("applySalesFilters")
      ?.addEventListener("click", loadSales);
    loadSales();
  }

  if (page === "sale-details") {
    document
      .getElementById("saleStatusForm")
      ?.addEventListener("submit", updateSaleStatus);
    loadSaleDetails();
  }
}
