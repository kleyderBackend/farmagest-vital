import { apiRequest, formatCurrency } from "./api.js";
import {
  clearCart,
  getCartItems,
  hydrateCart,
  updateCartBadges,
} from "./cart.js?v=2";

const form = document.getElementById("formShop");
const summaryProducts = document.getElementById("checkoutSummaryProducts");
const subtotalElement = document.getElementById("checkoutSubtotal");
const deliveryElement = document.getElementById("checkoutDelivery");
const totalElement = document.getElementById("checkoutTotal");
const submitButton = document.getElementById("btnCreateSale");
const messageBox = document.getElementById("checkoutMessage");

const deliveryCost = 0;

const showMessage = (message, type = "success") => {
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `checkout-message ${type}`;
  messageBox.hidden = false;
};

const setSubmitState = (isLoading) => {
  if (!submitButton) return;

  submitButton.disabled = isLoading;
  submitButton.innerHTML = isLoading
    ? `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Procesando...`
    : `<i class="fa-solid fa-lock" aria-hidden="true"></i> Finalizar compra`;
};

const renderSummary = () => {
  const items = getCartItems();
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0,
  );
  const total = subtotal + deliveryCost;

  if (!summaryProducts || !subtotalElement || !deliveryElement || !totalElement) {
    return;
  }

  if (items.length === 0) {
    summaryProducts.innerHTML = `
      <p class="summary-empty">
        Tu carrito está vacío. Agrega productos antes de finalizar la compra.
      </p>
    `;
  } else {
    summaryProducts.innerHTML = items
      .map(
        (item) => `
          <article class="summary-product">
            <div>
              <h3>${item.name}</h3>
              <p>${item.presentation}</p>
              <small>Cantidad: ${item.quantity}</small>
            </div>
            <strong>${formatCurrency(Number(item.price) * Number(item.quantity))}</strong>
          </article>
        `,
      )
      .join("");
  }

  subtotalElement.textContent = formatCurrency(subtotal);
  deliveryElement.textContent = deliveryCost === 0 ? "Gratis" : formatCurrency(deliveryCost);
  totalElement.textContent = formatCurrency(total);
};

const buildCheckoutPayload = (formData) => {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const neighborhood = String(formData.get("neighborhood") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const deliveryNote = String(formData.get("deliveryNote") || "").trim();
  const paymentMethod = String(formData.get("paymentMethod") || "cash");
  const items = getCartItems();

  return {
    customer: {
      fullName,
      email,
      phone,
      address: [address, neighborhood, city].filter(Boolean).join(", "),
    },
    notes: [
      deliveryNote && `Entrega: ${deliveryNote}`,
      `Método de pago: ${paymentMethod === "cash" ? "Contra entrega" : "Transferencia"}`,
    ]
      .filter(Boolean)
      .join(" | "),
    items: items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
  };
};

const handleCheckout = async (event) => {
  event.preventDefault();
  await hydrateCart();

  const items = getCartItems();

  if (items.length === 0) {
    showMessage("Agrega productos al carrito antes de finalizar la compra.", "error");
    return;
  }

  const payload = buildCheckoutPayload(new FormData(form));

  try {
    setSubmitState(true);
    await apiRequest("/sales/checkout", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });

    clearCart();
    renderSummary();
    updateCartBadges();
    form.reset();
    showMessage("Compra finalizada con éxito. Nos comunicaremos contigo para confirmar la entrega.");
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setSubmitState(false);
  }
};

form?.addEventListener("submit", handleCheckout);
window.addEventListener("cartchange", renderSummary);
window.addEventListener("storage", (event) => {
  if (event.key === "farmagest-vital-cart") renderSummary();
});

hydrateCart().then(() => {
  renderSummary();
  updateCartBadges();
});
