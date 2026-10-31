import {
    createProductImage,
    formatProductPrice,
    getAvailableProducts,
    getCategories,
} from "./catalog-api.js?v=3";
import { addToCart, setCatalogProducts, updateCartBadges } from "./cart.js?v=5";
import { products as sampleProducts } from "./products.js";

const productsContainer = document.getElementById("products-container");
const productsHeading = document.getElementById("products-heading");
const categoryMenu = document.getElementById("category-menu");
const categoriesContainer = document.getElementById("categorias");
const isProductsPage = document.body.dataset.catalogPage === "products";
const isDemoCatalog = new URLSearchParams(window.location.search).get("modo") === "demo";
const productDetailsUrl = (id) => {
    const currentPath = window.location.pathname.replace(/\\/g, "/");
    const pathPrefix = currentPath.includes("/frontends/ecommerce/")
        ? "."
        : currentPath.includes("/frontends/")
            ? "./ecommerce"
            : "./frontends/ecommerce";

    return `${pathPrefix}/details.html?id=${encodeURIComponent(id)}${isDemoCatalog ? "&modo=demo" : ""}`;
};
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

const sampleCategoryNames = {
    Medicines: "Medicamentos", "Personal Care": "Cuidado personal", Vitamins: "Vitaminas",
    Baby: "Bebés", Hygiene: "Higiene", Beauty: "Belleza",
};
const mockProducts = sampleProducts.map((product) => ({
    ...product,
    id: -product.id,
    categoryId: `sample-${product.category}`,
    category: sampleCategoryNames[product.category] || product.category,
    imageUrl: product.image,
    description: "Producto de muestra. Precio y disponibilidad por confirmar.",
    available: false,
    isMock: true,
}));
const categoriesFromProducts = (items) => [...new Map(items.map((product) => [
    String(product.categoryId), { id: product.categoryId, name: product.category },
])).values()];
let products = mockProducts;
let categories = categoriesFromProducts(mockProducts);
let selectedCategory = "";
let loading = false;
const catalogStatus = document.createElement("p");
catalogStatus.className = "catalog-status";
catalogStatus.setAttribute("role", "status");
catalogStatus.setAttribute("aria-live", "polite");
productsContainer.before(catalogStatus);
const retryButton = document.createElement("button");
retryButton.type = "button";
retryButton.className = "catalog-retry";
retryButton.textContent = "Reintentar";
retryButton.hidden = true;
catalogStatus.after(retryButton);
const demoLink = document.createElement("a");
demoLink.href = new URL("../ecommerce/products.html?modo=demo", import.meta.url).href;
demoLink.textContent = "Probar compra simulada";
demoLink.className = "catalog-demo-link";
retryButton.after(demoLink);
window.addEventListener("cartmessage", (event) => {
    catalogStatus.hidden = false;
    catalogStatus.textContent = event.detail;
});

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
        `<li><a href="#productos" data-category="">${isProductsPage ? "Todos los productos" : "Productos destacados"}</a></li>`,
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
            ${product.isMock ? `<button type="button" disabled>Producto de muestra</button>` : `
            <a href="${escapeHtml(productDetailsUrl(product.id))}">Detalles</a>
            <button type="button" data-add-to-cart="${product.id}">Añadir al carrito</button>
            `}
        </div>
    </article>
`;

const renderProducts = () => {
    const visibleProducts = selectedCategory
        ? products.filter((product) => String(product.categoryId) === selectedCategory)
        : isProductsPage
            ? products
            : products.slice(0, 4);
    const selectedCategoryName = categories.find(
        (category) => String(category.id) === selectedCategory,
    )?.name;

    productsHeading.textContent = selectedCategoryName || (isProductsPage ? "Todos los productos" : "Productos destacados");
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
    if (!product || product.isMock) return;
    if (!addToCart(button.dataset.addToCart, 1, product)) return;

    button.textContent = "Añadido";
    updateCartBadges();
    window.setTimeout(() => {
        if (button.isConnected) button.textContent = "Añadir al carrito";
    }, 1200);
});

const loadCatalog = async () => {
    if (loading) return;
    loading = true;
    retryButton.hidden = true;
    catalogStatus.textContent = "Cargando el catálogo. Mientras tanto, mostramos productos de ejemplo; sus precios son ilustrativos.";
    productsContainer.setAttribute("aria-busy", "true");

    try {
        const [realProducts, realCategories] = await Promise.all([
            getAvailableProducts(),
            getCategories().catch(() => null),
        ]);
        const selectedName = categories.find((category) => String(category.id) === selectedCategory)?.name;
        products = realProducts;
        categories = realCategories || categoriesFromProducts(realProducts);
        selectedCategory = String(categories.find((category) => category.name === selectedName)?.id ?? "");
        setCatalogProducts(products);
        renderCategories();
        renderProducts();
        catalogStatus.textContent = isDemoCatalog ? "Simulación académica: productos ficticios, sin cobros ni pedidos a la farmacia." : "";
        catalogStatus.hidden = !isDemoCatalog;
        demoLink.textContent = isDemoCatalog ? "Volver al catálogo real" : "Probar compra simulada";
        if (isDemoCatalog) demoLink.href = new URL("../ecommerce/products.html", import.meta.url).href;
    } catch (error) {
        catalogStatus.textContent = "El catálogo está tardando en responder. Sigues viendo productos de ejemplo; reintenta para consultar precios y disponibilidad reales.";
        retryButton.hidden = false;
    } finally {
        loading = false;
        productsContainer.setAttribute("aria-busy", "false");
    }
};

updateCartBadges();
renderCategories();
renderProducts();
retryButton.addEventListener("click", loadCatalog);
loadCatalog();
