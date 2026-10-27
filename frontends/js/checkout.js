import { CheckoutUI } from "./ui/CheckoutUI.js";

new CheckoutUI().iniciar().catch((error) => {
  const message = document.getElementById("checkoutMessage");
  if (message) { message.textContent = error.message; message.hidden = false; message.className = "checkout-message error"; }
});
