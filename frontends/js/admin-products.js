import {
  apiRequest,
  formatCurrency,
  formatDate,
  requireAdminSession,
} from "./api.js";

const page = document.body.dataset.page;
let cachedProducts = [];
const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const maxImageSize = 1024 * 1024;

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminMessage");

  if (!messageBox) {
    alert(message);
    return;
  }

  messageBox.textContent = message;
  messageBox.className = `admin-message ${type}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () =>
      reject(new Error("No se pudo leer la imagen seleccionada")),
    );
    reader.readAsDataURL(file);
  });
}

function updateImagePreview(source) {
  const preview = document.getElementById("imagePreview");

  if (!preview) {
    return;
  }

  if (!source) {
    preview.hidden = true;
    preview.removeAttribute("src");
    return;
  }

  preview.src = source;
  preview.hidden = false;
}

async function syncSelectedImage() {
  const fileInput = document.getElementById("imageFile");
  const imageUrlInput = document.getElementById("imageUrl");
  const file = fileInput?.files?.[0];

  if (!file) {
    return;
  }

  if (!allowedImageTypes.includes(file.type)) {
    fileInput.value = "";
    throw new Error("La imagen debe estar en formato PNG, JPG o WEBP");
  }

  if (file.size > maxImageSize) {
    fileInput.value = "";
    throw new Error("La imagen no debe superar 1 MB");
  }

  const imageDataUrl = await fileToDataUrl(file);

  if (imageUrlInput) {
    imageUrlInput.value = imageDataUrl;
  }

  updateImagePreview(imageDataUrl);
}

async function getProductPayload(form) {
  await syncSelectedImage();

  const formData = new FormData(form);
  const payload = {
    categoryId: Number(formData.get("categoryId")),
    name: String(formData.get("name") || "").trim(),
    salePrice: Number(formData.get("salePrice")),
  };

  const optionalFields = [
    "presentation",
    "description",
    "expirationDate",
  ];

  optionalFields.forEach((field) => {
    const value = String(formData.get(field) || "").trim();
    if (value) {
      payload[field] = value;
    }
  });

  const imageUrl = String(formData.get("imageUrl") || "").trim();

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }

  const currentStock = formData.get("currentStock");
  const minimumStock = formData.get("minimumStock");

  if (currentStock !== null && currentStock !== "") {
    payload.currentStock = Number(currentStock);
  }

  if (minimumStock !== null && minimumStock !== "") {
    payload.minimumStock = Number(minimumStock);
  }

  payload.isAvailable = formData.get("isAvailable") === "on";

  return payload;
}

async function loadCategoriesSelect(selectedCategoryId) {
  const selects = document.querySelectorAll("[data-categories-select]");

  if (selects.length === 0) {
    return;
  }

  const response = await apiRequest("/categories", { auth: false });
  const categories = response.data?.categories || [];

  selects.forEach((select) => {
    const firstOption = select.dataset.placeholder || "Selecciona una categoría";
    select.innerHTML = `<option value="">${firstOption}</option>`;

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.category_id;
      option.textContent = category.name;

      if (Number(selectedCategoryId) === Number(category.category_id)) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  });
}

function renderProducts(products) {
  const tableBody = document.getElementById("productsTableBody");

  if (!tableBody) {
    return;
  }

  if (products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">No hay productos registrados.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products
    .map((product) => {
      const isLowStock =
        Number(product.current_stock) <= Number(product.minimum_stock);
      const statusClass = isLowStock ? "warning" : "active";
      const statusLabel = isLowStock ? "Stock bajo" : "Disponible";

      return `
        <tr>
          <td>PRD-${String(product.product_id).padStart(3, "0")}</td>
          <td>${product.name}</td>
          <td>${product.category_name || "Sin categoría"}</td>
          <td>${formatCurrency(product.sale_price)}</td>
          <td>${product.current_stock}</td>
          <td><span class="status ${statusClass}">${statusLabel}</span></td>
          <td>
            <a class="table-action" href="./edit-product.html?id=${product.product_id}">Editar</a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function updateProductSummary(products) {
  const total = document.getElementById("totalProducts");
  const available = document.getElementById("availableProducts");
  const lowStock = document.getElementById("lowStockProducts");
  const expireSoon = document.getElementById("expireSoonProducts");

  if (!total) {
    return;
  }

  const lowStockCount = products.filter(
    (product) => Number(product.current_stock) <= Number(product.minimum_stock),
  ).length;

  total.textContent = products.length;
  available.textContent = products.filter((product) => product.is_available).length;
  lowStock.textContent = lowStockCount;
  expireSoon.textContent = products.filter((product) => product.expiration_date).length;
}

async function loadProductsPage() {
  try {
    await loadCategoriesSelect();
    const response = await apiRequest("/products", { auth: false });
    const products = response.data?.products || [];
    cachedProducts = products;
    renderProducts(cachedProducts);
    updateProductSummary(cachedProducts);
  } catch (error) {
    renderProducts([]);
    showMessage(error.message, "error");
  }
}

function applyProductFilters() {
  const categoryId = document.getElementById("filterCategory")?.value;
  const status = document.getElementById("filterStatus")?.value;

  let products = [...cachedProducts];

  if (categoryId) {
    products = products.filter(
      (product) => Number(product.category_id) === Number(categoryId),
    );
  }

  if (status === "Disponibles") {
    products = products.filter((product) => product.is_available);
  }

  if (status === "No disponibles") {
    products = products.filter((product) => !product.is_available);
  }

  if (status === "Stock bajo") {
    products = products.filter(
      (product) => Number(product.current_stock) <= Number(product.minimum_stock),
    );
  }

  renderProducts(products);
}

async function loadProductForEdit() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    showMessage("Producto no seleccionado", "error");
    return;
  }

  try {
    const response = await apiRequest(`/products/${productId}`, { auth: false });
    const product = response.data?.product;
    await loadCategoriesSelect(product.category_id);

    document.getElementById("name").value = product.name || "";
    document.getElementById("presentation").value = product.presentation || "";
    document.getElementById("salePrice").value = product.sale_price || "";
    document.getElementById("currentStock").value = product.current_stock ?? "";
    document.getElementById("minimumStock").value = product.minimum_stock ?? "";
    document.getElementById("expirationDate").value = product.expiration_date
      ? product.expiration_date.slice(0, 10)
      : "";
    document.getElementById("imageUrl").value = product.image_url || "";
    updateImagePreview(product.image_url || "");
    document.getElementById("description").value = product.description || "";
    document.querySelector('[name="isAvailable"]').checked =
      product.is_available;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function handleProductForm(event) {
  event.preventDefault();

  const form = event.currentTarget;

  try {
    const payload = await getProductPayload(form);

    if (page === "edit-product") {
      const productId = new URLSearchParams(window.location.search).get("id");
      await apiRequest(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showMessage("Producto actualizado con éxito");
      return;
    }

    await apiRequest("/products/created-products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage("Producto creado con éxito");
    form.reset();
    updateImagePreview("");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deactivateProduct() {
  const productId = new URLSearchParams(window.location.search).get("id");

  if (!productId) {
    return;
  }

  const confirmDelete = confirm("¿Quieres desactivar este producto?");

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/products/${productId}`, { method: "DELETE" });
    window.location.href = "./products.html";
  } catch (error) {
    showMessage(error.message, "error");
  }
}

if (page && page.includes("product")) {
  requireAdminSession();
}

if (page === "products") {
  loadProductsPage();
}

if (page === "create-product") {
  loadCategoriesSelect().catch((error) => showMessage(error.message, "error"));
}

if (page === "edit-product") {
  loadProductForEdit();
}

document
  .getElementById("productForm")
  ?.addEventListener("submit", handleProductForm);

document
  .getElementById("deactivateProduct")
  ?.addEventListener("click", deactivateProduct);

document
  .getElementById("applyProductFilters")
  ?.addEventListener("click", applyProductFilters);

document.getElementById("imageFile")?.addEventListener("change", async () => {
  try {
    await syncSelectedImage();
  } catch (error) {
    showMessage(error.message, "error");
    updateImagePreview(document.getElementById("imageUrl")?.value || "");
  }
});
