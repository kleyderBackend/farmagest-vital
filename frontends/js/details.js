import { products } from "./products.js?v=3";
import { addToCart, updateCartBadges } from "./cart.js?v=1";

const root = document.getElementById("product-detail-root");

if (!root) {
  throw new Error("El contenedor del detalle no existe en la página.");
}

const params = new URLSearchParams(window.location.search);
const selectedId = Number(params.get("id") ?? 1);
const product = products.find((item) => item.id === selectedId) ?? products[0];

const relatedProducts = products
  .filter((item) => item.id !== product.id)
  .slice(0, 4);

const categoryLabels = {
  Medicines: "Medicamentos",
  Vitamins: "Vitaminas",
  "Personal Care": "Cuidado personal",
  Baby: "Bebés",
  Hygiene: "Higiene",
  Beauty: "Belleza",
};

const descriptionTranslations = {
  "Analgesic and antipyretic.": "Analgésico y antipirético.",
  "Antibiotic medicine.": "Medicamento antibiótico.",
  "Analgesic and anti-inflammatory.": "Analgésico y antiinflamatorio.",
  "Vitamin C supplement.": "Suplemento de vitamina C.",
  "Medicine used to reduce stomach acid.": "Medicamento para reducir la acidez estomacal.",
  "Medicine used to treat high blood pressure.": "Medicamento para tratar la presión arterial alta.",
  "Liquid soap for skin care.": "Jabón líquido para el cuidado de la piel.",
  "Shampoo for daily use.": "Champú para uso diario.",
  "Disposable diapers for babies.": "Pañales desechables para bebé.",
  "Cream for baby skin care.": "Crema para el cuidado de la piel del bebé.",
  "Toothpaste for oral hygiene.": "Pasta dental para la higiene bucal.",
  "Toothbrush for daily oral hygiene.": "Cepillo dental para la higiene diaria.",
  "Broad-spectrum sunscreen.": "Protector solar de amplio espectro.",
  "Moisturizer for facial skin care.": "Crema hidratante para el cuidado facial.",
};

const getCategoryLabel = (category) => categoryLabels[category] ?? category;
const getDescription = (item) =>
  descriptionTranslations[item.description] ?? item.description;

const createProductImage = (item) => {
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
      <text x="50%" y="46%" text-anchor="middle" font-size="24" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#1f2d3d">${getCategoryLabel(item.category)}</text>
      <text x="50%" y="58%" text-anchor="middle" font-size="36" font-family="Segoe UI, Arial, sans-serif" font-weight="800" fill="#0f8f64">${item.name}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const renderRelatedProduct = (item) => {
  const colorMap = ["blue", "green", "orange", "teal"];
  const colorClass = colorMap[Math.abs(item.id) % colorMap.length];

  return `
    <article class="mini-card">
      <div class="mini-visual ${colorClass}">
        <img src="${createProductImage(item)}" alt="${item.name}" />
      </div>
      <h4>${item.name}</h4>
      <strong>$${item.price.toLocaleString("es-CO")}</strong>
      <button type="button" data-add-to-cart="${item.id}">Añadir al carrito</button>
    </article>
  `;
};

root.innerHTML = `
  <section class="product-showcase">
    <div class="gallery-panel">
      <div class="thumbs">
        <button class="thumb active" type="button" aria-label="Vista 1">
          <img src="${createProductImage(product)}" alt="Vista 1 del producto" />
        </button>
        <button class="thumb" type="button" aria-label="Vista 2">
          <img src="${createProductImage(product)}" alt="Vista 2 del producto" />
        </button>
        <button class="thumb" type="button" aria-label="Vista 3">
          <img src="${createProductImage(product)}" alt="Vista 3 del producto" />
        </button>
        <button class="thumb" type="button" aria-label="Vista 4">
          <img src="${createProductImage(product)}" alt="Vista 4 del producto" />
        </button>
      </div>

      <div class="main-visual" aria-label="Imagen principal del producto">
        <img src="${createProductImage(product)}" alt="${product.name}" />
        <span class="zoom-hint"><i class="fa-solid fa-magnifying-glass"></i> Imagen del producto</span>
      </div>
    </div>

    <div class="product-summary">
      <span class="meta-tag">${getCategoryLabel(product.category)}</span>
      <h1>${product.name}</h1>

      <div class="price-row">
        <strong>$${product.price.toLocaleString("es-CO")}</strong>
        <span>por presentación</span>
      </div>

      <div class="stock-row">
        <span class="status good"><i class="fa-solid fa-circle-check"></i> ${product.available ? "Disponible" : "No disponible"}</span>
      </div>

      <p class="description-copy">${getDescription(product)}</p>

      <div class="quantity-block">
        <label>Cantidad</label>
        <div class="quantity-control">
          <button type="button" data-quantity-step="-1" aria-label="Disminuir cantidad">-</button>
          <span id="product-quantity" aria-live="polite">1</span>
          <button type="button" data-quantity-step="1" aria-label="Aumentar cantidad">+</button>
        </div>
      </div>

      <div class="action-row">
        <button type="button" class="btn-primary" data-add-current>Añadir al carrito</button>
        <button type="button" class="btn-secondary" data-buy-current>Comprar Ahora</button>
      </div>

      <div class="feature-strip">
        <div>
          <i class="fa-solid fa-truck-fast"></i>
          <span>Envío rápido</span>
          <small>Entre 24 y 48 horas</small>
        </div>
        <div>
          <i class="fa-solid fa-shield-heart"></i>
          <span>Productos originales</span>
          <small>Garantizados</small>
        </div>
        <div>
          <i class="fa-solid fa-headset"></i>
          <span>Atención al cliente</span>
          <small>Todos los días</small>
        </div>
      </div>
    </div>
  </section>

  <section class="detail-tabs-panel">
    <div class="detail-tabs" role="tablist" aria-label="Información del producto">
      <button class="tab active" id="description-tab" type="button" role="tab" aria-selected="true" aria-controls="description-panel" tabindex="0">Descripción</button>
      <button class="tab" id="information-tab" type="button" role="tab" aria-selected="false" aria-controls="information-panel" tabindex="-1">Información del producto</button>
    </div>

    <div class="tab-content active" id="description-panel" role="tabpanel" aria-labelledby="description-tab" tabindex="0">
      <div class="tab-panel">
        <h3>Descripción</h3>
        <p>${getDescription(product)}</p>
      </div>
    </div>

    <div class="tab-content" id="information-panel" role="tabpanel" aria-labelledby="information-tab" tabindex="0" hidden>
      <div class="tab-panel">
        <h3>Información del producto</h3>
        <div class="info-grid">
          <div><span>Categoría</span><strong>${getCategoryLabel(product.category)}</strong></div>
          <div><span>Presentación</span><strong>${product.presentation}</strong></div>
          <div><span>Disponibilidad</span><strong>${product.available ? "Disponible" : "No disponible"}</strong></div>
        </div>
      </div>
    </div>
  </section>

  <aside class="related-panel">
    <div class="related-header">
      <i class="fa-solid fa-arrows-rotate"></i>
      <h3>Productos relacionados</h3>
    </div>

    <div class="related-grid">
      ${relatedProducts.map(renderRelatedProduct).join("")}
    </div>
  </aside>
`;

const tabs = [...root.querySelectorAll('[role="tab"]')];
const panels = [...root.querySelectorAll('[role="tabpanel"]')];

const activateTab = (selectedTab) => {
  tabs.forEach((tab) => {
    const isActive = tab === selectedTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.id === selectedTab.getAttribute("aria-controls");
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === index) return;

    event.preventDefault();
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex]);
  });
});

const quantityDisplay = root.querySelector("#product-quantity");
let selectedQuantity = 1;

root.querySelectorAll("[data-quantity-step]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedQuantity = Math.max(
      1,
      Math.min(product.stock, selectedQuantity + Number(button.dataset.quantityStep)),
    );
    quantityDisplay.textContent = String(selectedQuantity);
  });
});

root.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart], [data-add-current]");
  const buyButton = event.target.closest("[data-buy-current]");
  const button = addButton ?? buyButton;
  if (!button) return;

  const productId = button.dataset.addToCart ?? product.id;
  const quantity = button.hasAttribute("data-add-current") || buyButton
    ? selectedQuantity
    : 1;
  const added = addToCart(productId, quantity);

  if (!added) {
    button.textContent = "No disponible";
    return;
  }

  updateCartBadges();
  if (buyButton) {
    window.location.href = "./carrito.html";
    return;
  }

  const originalText = button.textContent;
  button.textContent = "Añadido";
  window.setTimeout(() => {
    if (button.isConnected) button.textContent = originalText;
  }, 1200);
});
