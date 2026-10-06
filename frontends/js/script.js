import {
    createProductImage,
    formatProductPrice,
    getAvailableProducts,
    getCategories,
} from "./catalog-api.js";
import { addToCart, setCatalogProducts, updateCartBadges } from "./cart.js?v=2";

const productsContainer = document.getElementById("products-container");
const productsHeading = document.getElementById("products-heading");
const categoryMenu = document.getElementById("category-menu");
const categoriesContainer = document.getElementById("categorias");
const categoryIcons = [
    "fa-pills",
    "fa-pump-soap",
    "fa-capsules",
    "fa-baby",
    "fa-soap",
    "fa-spa",
];

if (!productsContainer || !productsHeading || !categoryMenu || !categoriesContainer) {
    throw new Error("Faltan contenedores necesarios para mostrar el catálogo.");
}

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);

let products = [];
let categories = [];
let selectedCategory = "";

const renderCategories = () => {
    const categoryLinks = categories.map((category, index) => {
        const id = String(category.id);
        const name = escapeHtml(category.name);
        const icon = categoryIcons[index % categoryIcons.length];

        return {
            tile: `<a href="#productos" class="categorie" data-category="${id}"><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${name}</span></a>`,
            menu: `<li><a href="#productos" data-category="${id}">${name}</a></li>`,
        };
    });

    categoriesContainer.innerHTML = categoryLinks.map(({ tile }) => tile).join("");
    categoryMenu.innerHTML = [
        `<li><a href="#productos" data-category="">Productos destacados</a></li>`,
        ...categoryLinks.map(({ menu }) => menu),
    ].join("");
};

const createProductCard = (product) => `
    <article class="product-card">
        <img src="${escapeHtml(createProductImage(product))}" alt="${escapeHtml(product.name)}" loading="lazy">
        <h3>${escapeHtml(product.name)}</h3>
        <small>${escapeHtml(product.category)}</small>
        <p>${escapeHtml(product.description)}</p>
        <strong>${formatProductPrice(product.price)}</strong>
        <div class="actions">
            <a href="./ecommerce/details.html?id=${product.id}">Detalles</a>
            <button type="button" data-add-to-cart="${product.id}">Añadir al carrito</button>
        </div>
    </article>
`;

const renderProducts = () => {
    const visibleProducts = selectedCategory
        ? products.filter((product) => String(product.categoryId) === selectedCategory)
        : products.slice(0, 4);
    const selectedCategoryName = categories.find(
        (category) => String(category.id) === selectedCategory,
    )?.name;

    productsHeading.textContent = selectedCategoryName || "Productos destacados";
    productsContainer.innerHTML = visibleProducts.length
        ? visibleProducts.map(createProductCard).join("")
        : `<p role="status">No hay productos disponibles en esta categoría.</p>`;

    document.querySelectorAll("[data-category]").forEach((link) => {
        if (link.dataset.category === selectedCategory) {
            link.setAttribute("aria-current", "true");
        } else {
            link.removeAttribute("aria-current");
        }
    });
};

const bindCategoryFilter = (container) => {
    container.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-category]");
        if (!link) return;

        selectedCategory = link.dataset.category;
        renderProducts();

        const dropdown = categoryMenu.closest("details");
        if (dropdown) dropdown.open = false;
    });
};

bindCategoryFilter(categoryMenu);
bindCategoryFilter(categoriesContainer);

productsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) return;

    const product = products.find((item) => item.id === Number(button.dataset.addToCart));
    if (!addToCart(button.dataset.addToCart, 1, product)) return;

    button.textContent = "Añadido";
    updateCartBadges();
    window.setTimeout(() => {
        if (button.isConnected) button.textContent = "Añadir al carrito";
    }, 1200);
});

const loadCatalog = async () => {
    productsHeading.textContent = "Cargando catálogo...";
    productsContainer.innerHTML = `<p role="status">Consultando productos disponibles...</p>`;

    try {
        [products, categories] = await Promise.all([
            getAvailableProducts(),
            getCategories(),
        ]);
        setCatalogProducts(products);
        renderCategories();
        renderProducts();
    } catch (error) {
        productsHeading.textContent = "Catálogo no disponible";
        productsContainer.innerHTML = `<p role="alert">${escapeHtml(error.message || "No se pudo conectar con el backend.")}</p>`;
    }
};

updateCartBadges();
loadCatalog();
