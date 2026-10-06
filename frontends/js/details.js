import { createProductImage, formatProductPrice, getAvailableProducts, getProductById } from "./catalog-api.js";
import { addToCart, setCatalogProducts, updateCartBadges } from "./cart.js?v=2";

const root = document.getElementById("product-detail-root");
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const renderProduct = (product, relatedProducts) => {
  const image = escapeHtml(createProductImage(product));
  const category = escapeHtml(product.category);
  const name = escapeHtml(product.name);
  const description = escapeHtml(product.description);
  const available = product.available && product.stock > 0;

  root.innerHTML = `
    <section class="product-showcase">
      <div class="gallery-panel">
        <div class="thumbs"><button class="thumb active" type="button" aria-label="Vista del producto"><img src="${image}" alt="" /></button></div>
        <div class="main-visual" aria-label="Imagen principal del producto">
          <img src="${image}" alt="${name}" />
          <span class="zoom-hint"><i class="fa-solid fa-magnifying-glass"></i> Imagen del producto</span>
        </div>
      </div>
      <div class="product-summary">
        <span class="meta-tag">${category}</span>
        <h1>${name}</h1>
        <div class="price-row"><strong>${formatProductPrice(product.price)}</strong><span>por presentación</span></div>
        <div class="stock-row"><span class="status ${available ? "good" : "unavailable"}">${available ? `Disponible · ${product.stock} unidades` : "No disponible"}</span></div>
        <p class="description-copy">${description}</p>
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
          <button type="button" class="btn-secondary" data-buy-current>Comprar ahora</button>
        </div>
      </div>
    </section>
    <section class="detail-tabs-panel">
      <div class="detail-tabs" role="tablist" aria-label="Información del producto">
        <button class="tab active" type="button" role="tab" aria-selected="true" aria-controls="description-panel">Descripción</button>
        <button class="tab" type="button" role="tab" aria-selected="false" aria-controls="information-panel" tabindex="-1">Información del producto</button>
      </div>
      <div class="tab-content active" id="description-panel" role="tabpanel"><div class="tab-panel"><h3>Descripción</h3><p>${description}</p></div></div>
      <div class="tab-content" id="information-panel" role="tabpanel" hidden><div class="tab-panel"><h3>Información del producto</h3><div class="info-grid">
        <div><span>Categoría</span><strong>${category}</strong></div>
        <div><span>Presentación</span><strong>${escapeHtml(product.presentation)}</strong></div>
        <div><span>Disponibilidad</span><strong>${available ? "Disponible" : "No disponible"}</strong></div>
      </div></div></div>
    </section>
    <aside class="related-panel">
      <div class="related-header"><i class="fa-solid fa-arrows-rotate"></i><h3>Productos relacionados</h3></div>
      <div class="related-grid">${relatedProducts.map((item) => `
        <article class="mini-card">
          <img src="${escapeHtml(createProductImage(item))}" alt="${escapeHtml(item.name)}" loading="lazy" />
          <h4>${escapeHtml(item.name)}</h4>
          <strong>${formatProductPrice(item.price)}</strong>
          <a href="./details.html?id=${item.id}">Ver producto</a>
          <button type="button" data-add-to-cart="${item.id}">Añadir al carrito</button>
        </article>`).join("")}</div>
    </aside>
  `;

  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === tab.getAttribute("aria-controls");
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
  }));

  let quantity = 1;
  const quantityDisplay = root.querySelector("#product-quantity");
  root.querySelectorAll("[data-quantity-step]").forEach((button) => button.addEventListener("click", () => {
    quantity = Math.max(1, Math.min(product.stock, quantity + Number(button.dataset.quantityStep)));
    quantityDisplay.textContent = String(quantity);
  }));

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart], [data-add-current], [data-buy-current]");
    if (!button) return;
    const item = button.dataset.addToCart
      ? relatedProducts.find((related) => related.id === Number(button.dataset.addToCart))
      : product;
    if (!item || !addToCart(item.id, item === product ? quantity : 1, item)) {
      button.textContent = "No disponible";
      return;
    }
    updateCartBadges();
    if (button.hasAttribute("data-buy-current")) {
      window.location.href = "./carrito.html";
      return;
    }
    const label = button.textContent;
    button.textContent = "Añadido";
    window.setTimeout(() => { if (button.isConnected) button.textContent = label; }, 1200);
  });
};

const loadProduct = async () => {
  if (!root) return;
  root.innerHTML = `<p role="status">Cargando producto...</p>`;
  try {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!Number.isInteger(id) || id < 1) throw new Error("El identificador del producto no es válido.");
    const [product, products] = await Promise.all([
      getProductById(id),
      getAvailableProducts().catch(() => []),
    ]);
    if (!product) throw new Error("No se encontró el producto solicitado.");
    setCatalogProducts([...products, product]);
    renderProduct(product, products.filter((item) => item.id !== product.id).slice(0, 4));
  } catch (error) {
    root.innerHTML = `<p role="alert">${escapeHtml(error.message || "No se pudo cargar el producto desde el backend.")}</p>`;
  }
};

updateCartBadges();
loadProduct();