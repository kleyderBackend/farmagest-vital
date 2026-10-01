import {
  createProductImage,
  formatProductPrice,
  getAvailableProducts,
  getCategories,
} from "./catalog-api.js";
import { addToCart, updateCartBadges } from "./cart.js?v=2";

const productsContainer = document.getElementById("products-container");
const productsHeading = document.getElementById("products-heading");
const categoryMenu = document.getElementById("category-menu");
const categoriesContainer = document.getElementById("categorias");

if (!productsContainer || !productsHeading || !categoryMenu || !categoriesContainer) {
  throw new Error("Faltan contenedores necesarios para mostrar el catálogo.");
}

let products = [];
let categories = [];

const iconByCategory = {
  medicamento: "fa-pills",
  vitamina: "fa-capsules",
  cuidado: "fa-pump-soap",
  bebe: "fa-baby",
  bebé: "fa-baby",
  higiene: "fa-soap",
  belleza: "fa-spa",
};

const getCategoryIcon = (name) => {
  const normalizedName = name.toLowerCase();
  const matchedKey = Object.keys(iconByCategory).find((key) =>
    normalizedName.includes(key),
  );

  return iconByCategory[matchedKey] ?? "fa-prescription-bottle-medical";
};

const renderLoading = () => {
  productsContainer.innerHTML = `
    <article class="product-card">
      <h3>Cargando productos...</h3>
      <p>Estamos consultando el catálogo disponible.</p>
    </article>
  `;
};

const renderError = (message) => {
  productsContainer.innerHTML = `
    <article class="product-card">
      <h3>No se pudo cargar el catálogo</h3>
      <p>${message}</p>
    </article>
  `;
};

const renderCategoryControls = () => {
  const options = categories.filter((category) =>
    products.some((product) => product.categoryId === category.id),
  );

  categoryMenu.innerHTML = [
    `<li><a href="#productos" data-category-id="">Productos destacados</a></li>`,
    ...options.map(
      (category) =>
        `<li><a href="#productos" data-category-id="${category.id}">${category.name}</a></li>`,
    ),
  ].join("");

  categoriesContainer.innerHTML = options
    .map(
      (category) => `
        <a href="#productos" class="categorie" data-category-id="${category.id}">
          <i class="fa-solid ${getCategoryIcon(category.name)}"></i>
          <span>${category.name}</span>
        </a>
      `,
    )
    .join("");
};

const createProductCard = (product) => `
  <article class="product-card">
    <img src="${createProductImage(product)}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <small>${product.category}</small>
    <p>${product.description}</p>
    <strong>${formatProductPrice(product.price)}</strong>
    <div class="actions">
      <a href="./ecommerce/details.html?id=${product.id}">
        <button type="button">Detalles</button>
      </a>
      <button type="button" data-add-to-cart="${product.id}">
        Añadir al carrito
      </button>
    </div>
  </article>
`;

const renderProducts = (categoryId = "") => {
  const selectedCategoryId = Number(categoryId);
  const visibleProducts = categoryId
    ? products.filter((product) => product.categoryId === selectedCategoryId)
    : products.slice(0, 4);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  productsHeading.textContent = selectedCategory?.name ?? "Productos destacados";
  productsContainer.innerHTML =
    visibleProducts.length > 0
      ? visibleProducts.map(createProductCard).join("")
      : `<article class="product-card"><h3>No hay productos disponibles</h3><p>Esta categoría no tiene productos activos por ahora.</p></article>`;

  document.querySelectorAll("[data-category-id]").forEach((link) => {
    if (link.dataset.categoryId === String(categoryId)) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const bindCategoryFilter = (container) => {
  container.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-category-id]");

    if (!link) return;

    renderProducts(link.dataset.categoryId);

    const dropdown = categoryMenu.closest("details");
    if (dropdown) dropdown.open = false;
  });
};

const loadCatalog = async () => {
  renderLoading();

  try {
    const [backendProducts, backendCategories] = await Promise.all([
      getAvailableProducts(),
      getCategories(),
    ]);

    products = backendProducts;
    categories = backendCategories;

    renderCategoryControls();
    renderProducts();
  } catch (error) {
    renderError(error.message);
  }
};

bindCategoryFilter(categoryMenu);
bindCategoryFilter(categoriesContainer);
updateCartBadges();
loadCatalog();

productsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;

  const product = products.find(
    (item) => item.id === Number(button.dataset.addToCart),
  );
  const added = addToCart(product);
  if (!added) return;

  button.textContent = "Añadido";
  updateCartBadges();
  window.setTimeout(() => {
    if (button.isConnected) button.textContent = "Añadir al carrito";
  }, 1200);
});
