import { products } from "./products.js?v=3";
import { addToCart, updateCartBadges } from "./cart.js?v=1";
const productsContainer = document.getElementById("products-container");
const productsHeading = document.getElementById("products-heading");
const categoryMenu = document.getElementById("category-menu");
const categoriesContainer = document.getElementById("categorias");

if (!productsContainer || !productsHeading || !categoryMenu || !categoriesContainer) {
    throw new Error("Faltan contenedores necesarios para mostrar el catálogo.");
}

const categoryLabels = {
    Medicines: "Medicamentos",
    Vitamins: "Vitaminas",
    "Personal Care": "Cuidado personal",
    Baby: "Bebés",
    Hygiene: "Higiene",
    Beauty: "Belleza",
};

const getCategoryLabel = (category) => categoryLabels[category] ?? category;

const createProductImage = (product) => {
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
            <defs>
                <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#dff9f0"/>
                    <stop offset="100%" stop-color="#ebf7ff"/>
                </linearGradient>
            </defs>
            <rect width="800" height="520" rx="36" fill="url(#bg)"/>
            <circle cx="650" cy="120" r="90" fill="#9ee7c5" opacity="0.8"/>
            <circle cx="180" cy="420" r="120" fill="#b6e0ff" opacity="0.8"/>
            <rect x="120" y="170" width="560" height="180" rx="32" fill="rgba(255,255,255,0.8)"/>
            <text x="50%" y="46%" text-anchor="middle" font-size="24" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#1f2d3d">${product.category}</text>
            <text x="50%" y="58%" text-anchor="middle" font-size="36" font-family="Segoe UI, Arial, sans-serif" font-weight="800" fill="#0f8f64">${product.name}</text>
        </svg>
    `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const featuredProducts = products
  .filter((product) => product.featured)
  .slice(0, 4);

const categories = [...new Set(products.map((product) => product.category))];

categoryMenu.innerHTML = [
    `<li><a href="#productos" data-category="">Productos destacados</a></li>`,
    ...categories.map(
        (category) =>
            `<li><a href="#productos" data-category="${category}">${getCategoryLabel(category)}</a></li>`,
    ),
].join("");

const createProductCard = (product) => {
  const imageSrc = createProductImage(product);

    return `
        <article class="product-card">

            <img 
                src="${imageSrc}" 
                alt="${product.name}"
            >

            <h3>${product.name}</h3>

            <small>${product.category}</small>

            <p>${product.description}</p>

            <strong>$${product.price.toLocaleString("es-CO")}</strong>

            <div class="actions">
                <a href="details.html?id=${product.id}">
                    <button>Detalles</button>
                </a>
                <button type="button" data-add-to-cart="${product.id}">
                    Añadir al carrito
                </button>
            </div>

        </article>
    `;
};

const renderProducts = (category = "") => {
    const visibleProducts = category
        ? products.filter((product) => product.category === category)
        : featuredProducts;

    productsHeading.textContent = category
        ? getCategoryLabel(category)
        : "Productos destacados";
    productsContainer.innerHTML = visibleProducts.map(createProductCard).join("");

    document.querySelectorAll("[data-category]").forEach((link) => {
        if (link.dataset.category === category) {
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

        renderProducts(link.dataset.category);

        const dropdown = categoryMenu.closest("details");
        if (dropdown) dropdown.open = false;
    });
};

bindCategoryFilter(categoryMenu);
bindCategoryFilter(categoriesContainer);
renderProducts();

productsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) return;

    const added = addToCart(button.dataset.addToCart);
    if (!added) return;

    button.textContent = "Añadido";
    updateCartBadges();
    window.setTimeout(() => {
        if (button.isConnected) button.textContent = "Añadir al carrito";
    }, 1200);
});
