import { apiRequest, requireAdminSession } from "./api.js";

const page = document.body.dataset.page;

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminMessage");

  if (!messageBox) {
    alert(message);
    return;
  }

  messageBox.textContent = message;
  messageBox.className = `admin-message ${type}`;
}

function renderCategories(categories) {
  const tableBody = document.getElementById("categoriesTableBody");

  if (!tableBody) {
    return;
  }

  if (categories.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No hay categorías registradas.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = categories
    .map(
      (category) => `
        <tr>
          <td>CAT-${String(category.category_id).padStart(3, "0")}</td>
          <td>${category.name}</td>
          <td>${category.description || "Sin descripción"}</td>
          <td>
            <span class="status ${category.is_active ? "active" : "warning"}">
              ${category.is_active ? "Activa" : "Inactiva"}
            </span>
          </td>
          <td>
            <a class="table-action" href="./edit-category.html?id=${category.category_id}">Editar</a>
          </td>
        </tr>
      `,
    )
    .join("");
}

function updateCategorySummary(categories) {
  const total = document.getElementById("totalCategories");
  const active = document.getElementById("activeCategories");
  const inactive = document.getElementById("inactiveCategories");

  if (!total) {
    return;
  }

  total.textContent = categories.length;
  active.textContent = categories.filter((category) => category.is_active).length;
  inactive.textContent = categories.filter((category) => !category.is_active).length;
}

async function loadCategoriesPage() {
  try {
    const response = await apiRequest("/categories", { auth: false });
    const categories = response.data?.categories || [];
    renderCategories(categories);
    updateCategorySummary(categories);
  } catch (error) {
    renderCategories([]);
    showMessage(error.message, "error");
  }
}

async function loadCategoryForEdit() {
  const categoryId = new URLSearchParams(window.location.search).get("id");

  if (!categoryId) {
    showMessage("Categoría no seleccionada", "error");
    return;
  }

  try {
    const response = await apiRequest(`/categories/${categoryId}`, {
      auth: false,
    });
    const category = response.data?.category;

    document.getElementById("name").value = category.name || "";
    document.getElementById("description").value = category.description || "";
    document.querySelector('[name="isActive"]').checked = category.is_active;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleCategoryForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
  };

  if (page === "edit-category") {
    payload.isActive = formData.get("isActive") === "on";
  }

  try {
    if (page === "edit-category") {
      const categoryId = new URLSearchParams(window.location.search).get("id");
      await apiRequest(`/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showMessage("Categoría actualizada con éxito");
      return;
    }

    await apiRequest("/categories/creted-categorie", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage("Categoría creada con éxito");
    form.reset();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deactivateCategory() {
  const categoryId = new URLSearchParams(window.location.search).get("id");

  if (!categoryId) {
    return;
  }

  const confirmDelete = confirm("¿Quieres desactivar esta categoría?");

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/categories/${categoryId}`, { method: "DELETE" });
    window.location.href = "./categories.html";
  } catch (error) {
    showMessage(error.message, "error");
  }
}

if (page && page.includes("categor")) {
  requireAdminSession();
}

if (page === "categories") {
  loadCategoriesPage();
}

if (page === "edit-category") {
  loadCategoryForEdit();
}

document
  .getElementById("categoryForm")
  ?.addEventListener("submit", handleCategoryForm);

document
  .getElementById("deactivateCategory")
  ?.addEventListener("click", deactivateCategory);
