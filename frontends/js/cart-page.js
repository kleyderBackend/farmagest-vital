import {
  clearCart,
  formatPrice,
  getCartModel,
  hydrateCart,
  removeFromCart,
  adjustCartQuantity,
  updateCartBadges,
} from "./cart.js?v=3";
import { escapeHtml } from "./inventory-utils.js";

const cartRoot = document.getElementById("cart-root");

if (!cartRoot) {
  throw new Error("No se encontró el contenedor del carrito.");
}

const cartMessage = document.createElement("p");
cartMessage.setAttribute("role", "alert");
cartMessage.hidden = true;
cartRoot.before(cartMessage);
window.addEventListener("cartmessage", (event) => {
  cartMessage.textContent = event.detail;
  cartMessage.hidden = false;
});

const renderCart = () => {
  const model = getCartModel();
  const items = model.items;
  const itemCount = model.cantidad;
  const total = model.subtotal;

  if (items.length === 0) {
    cartRoot.innerHTML = `
      <section class="cart-empty">
        <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i>
        <h2>Tu carrito está vacío</h2>
        <p>Explora el catálogo y añade los productos que necesitas.</p>
        <a class="cart-continue" href="../index.html#productos">Ver productos</a>
      </section>
    `;
    updateCartBadges();
    return;
  }

  cartRoot.innerHTML = `
    <div class="cart-layout">
      <section class="cart-items" aria-label="Productos en el carrito">
        ${items
          .map(
            (item) => `
              <article class="cart-line" data-cart-item="${item.producto.id}">
                <div class="cart-line-copy">
                  <h2>${escapeHtml(item.producto.name)}</h2>
                  <p>${escapeHtml(item.producto.presentation)}</p>
                  <strong>${formatPrice(item.producto.price)} <span>por presentación</span></strong>
                </div>
                <div class="cart-line-actions">
                  <div class="cart-quantity" aria-label="Cantidad">
                    <button type="button" data-quantity-change="-1" data-product-id="${item.producto.id}" aria-label="Quitar una unidad">−</button>
                    <span>${item.cantidad}</span>
                    <button type="button" data-quantity-change="1" data-product-id="${item.producto.id}" aria-label="Añadir una unidad">+</button>
                  </div>
                  <strong class="cart-line-total">${formatPrice(item.subtotal)}</strong>
                  <button class="cart-remove" type="button" data-remove-product="${item.producto.id}">Eliminar</button>
                </div>
              </article>
            `,
          )
          .join("")}
      </section>

      <aside class="cart-summary">
        <h2>Resumen</h2>
        <div><span>Presentaciones</span><strong>${itemCount}</strong></div>
        <div class="cart-total"><span>Total</span><strong>${formatPrice(total)}</strong></div>
        <p>${model.esDemo ? "Carrito de demostración. No genera pedidos ni cobros reales." : "El envío y la comisión se cotizan al finalizar."}</p>
        <a class="cart-checkout" href="./formularyOfShoip.html">
          <i class="fa-solid fa-credit-card" aria-hidden="true"></i>
          Finalizar compra
        </a>
        <button type="button" data-clear-cart>Vaciar carrito</button>
      </aside>
    </div>
  `;

  updateCartBadges();
};

cartRoot.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity-change]");
  const removeButton = event.target.closest("[data-remove-product]");
  const clearButton = event.target.closest("[data-clear-cart]");

  if (quantityButton) {
    const productId = Number(quantityButton.dataset.productId);
    adjustCartQuantity(productId, Number(quantityButton.dataset.quantityChange));
    renderCart();
    return;
  }

  if (removeButton) {
    removeFromCart(removeButton.dataset.removeProduct);
    renderCart();
    return;
  }

  if (clearButton) {
    clearCart();
    renderCart();
  }
});

window.addEventListener("cartchange", renderCart);
window.addEventListener("storage", (event) => {
  if (event.key === "farmagest-vital-cart") renderCart();
});
hydrateCart().then(renderCart);
