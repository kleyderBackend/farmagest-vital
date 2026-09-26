import {
  clearCart,
  formatPrice,
  getCartItems,
  removeFromCart,
  setCartQuantity,
  updateCartBadges,
} from "./cart.js?v=1";

const cartRoot = document.getElementById("cart-root");

if (!cartRoot) {
  throw new Error("No se encontró el contenedor del carrito.");
}

const renderCart = () => {
  const items = getCartItems();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <article class="cart-line" data-cart-item="${item.id}">
                <div class="cart-line-copy">
                  <h2>${item.name}</h2>
                  <p>${item.presentation}</p>
                  <strong>${formatPrice(item.price)} <span>por presentación</span></strong>
                </div>
                <div class="cart-line-actions">
                  <div class="cart-quantity" aria-label="Cantidad">
                    <button type="button" data-quantity-change="-1" data-product-id="${item.id}" aria-label="Quitar una unidad">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-quantity-change="1" data-product-id="${item.id}" aria-label="Añadir una unidad">+</button>
                  </div>
                  <strong class="cart-line-total">${formatPrice(item.price * item.quantity)}</strong>
                  <button class="cart-remove" type="button" data-remove-product="${item.id}">Eliminar</button>
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
        <p>El total se actualiza al cambiar las cantidades.</p>
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
    const currentQuantity = getCartItems().find((item) => item.id === productId)?.quantity;
    if (currentQuantity) {
      setCartQuantity(
        productId,
        Math.max(1, currentQuantity + Number(quantityButton.dataset.quantityChange)),
      );
    }
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
renderCart();
