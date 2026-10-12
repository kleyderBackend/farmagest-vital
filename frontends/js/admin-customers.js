import { apiRequest, requireAdminSession } from "./api.js";

let cachedCustomers = [];

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

  if (!messageBox) return;

  if (!message) {
    messageBox.textContent = "";
    messageBox.className = "admin-message";
    return;
  }

  messageBox.textContent = message;
  messageBox.className = `admin-message ${type}`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateSummary(customers) {
  const withAddress = customers.filter((customer) =>
    String(customer.address || "").trim(),
  ).length;

  setText("totalCustomers", customers.length);
  setText("customersWithAddress", withAddress);
  setText("customersWithoutAddress", customers.length - withAddress);
}

function renderCustomers(customers) {
  const tableBody = document.getElementById("customersTableBody");

  if (!tableBody) return;

  if (customers.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No hay clientes para mostrar.</td></tr>';
    return;
  }

  tableBody.innerHTML = customers
    .map(
      (customer) => `
        <tr>
          <td>${escapeHtml(customer.full_name)}</td>
          <td>${escapeHtml(customer.email)}</td>
          <td>${escapeHtml(customer.phone)}</td>
          <td>${escapeHtml(customer.address || "Sin dirección")}</td>
          <td>
            <button class="table-action" type="button" data-customer-edit="${escapeHtml(customer.customer_id)}">
              Editar
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function applySearch() {
  const search = (document.getElementById("customerSearch")?.value || "")
    .trim()
    .toLowerCase();

  if (!search) {
    renderCustomers(cachedCustomers);
    return;
  }

  const customers = cachedCustomers.filter((customer) => {
    const searchable = [
      customer.full_name,
      customer.email,
      customer.phone,
      customer.address,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(search);
  });

  renderCustomers(customers);
}

function fillCustomerForm(customer) {
  document.getElementById("customerId").value = customer.customer_id;
  document.getElementById("fullName").value = customer.full_name || "";
  document.getElementById("email").value = customer.email || "";
  document.getElementById("phone").value = customer.phone || "";
  document.getElementById("address").value = customer.address || "";
  document.getElementById("selectedCustomerText").textContent =
    `Editando a ${customer.full_name}`;
}

async function loadCustomers() {
  try {
    const response = await apiRequest("/customers");
    cachedCustomers = response.data?.customers || [];
    updateSummary(cachedCustomers);
    applySearch();
    showMessage("");
  } catch (error) {
    if (error.message.startsWith("No hay clientes")) {
      cachedCustomers = [];
      updateSummary([]);
      renderCustomers([]);
      showMessage("");
      return;
    }

    showMessage(error.message, "error");
    renderCustomers([]);
    updateSummary([]);
  }
}

async function handleCustomerForm(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const customerId = formData.get("customerId");

  if (!customerId) {
    showMessage("Selecciona un cliente antes de guardar.", "error");
    return;
  }

  const payload = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
  };

  try {
    const response = await apiRequest(`/customers/${encodeURIComponent(customerId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const updatedCustomer = response.data?.customer || payload;
    showMessage("Cliente actualizado correctamente.");
    await loadCustomers();
    fillCustomerForm(updatedCustomer);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

if (requireAdminSession()) {
  loadCustomers();
  document.getElementById("customerSearch")?.addEventListener("input", applySearch);
  document.getElementById("customerForm")?.addEventListener("submit", handleCustomerForm);
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-customer-edit]");
    if (!button) return;

    const customer = cachedCustomers.find(
      (item) => Number(item.customer_id) === Number(button.dataset.customerEdit),
    );

    if (customer) fillCustomerForm(customer);
  });
}
