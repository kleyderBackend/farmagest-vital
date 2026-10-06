import { products } from "./products.js?v=3";

const storageKey = "farmagest-vital-cart";

const readCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(storedCart)) return [];

    return storedCart.filter(
      (item) =>
        Number.isInteger(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        products.some((product) => product.id === item.productId),
    );
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(storageKey, JSON.stringify(cart));
  updateCartBadges();
  window.dispatchEvent(new CustomEvent("cartchange"));
};

export const getCartItems = () =>
  readCart().flatMap((entry) => {
    const product = products.find((item) => item.id === entry.productId);
    return product ? [{ ...product, quantity: entry.quantity }] : [];
  });

export const getCartCount = () =>
  readCart().reduce((total, item) => total + item.quantity, 0);

export const addToCart = (productId, quantity = 1) => {
  const product = products.find((item) => item.id === Number(productId));
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));

  if (!product || !product.available || product.stock < 1) return false;

  const cart = readCart();
  const existingItem = cart.find((item) => item.productId === product.id);
  const newQuantity = Math.min(
    product.stock,
    (existingItem?.quantity ?? 0) + amount,
  );

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.push({ productId: product.id, quantity: newQuantity });
  }

  saveCart(cart);
  return true;
};

export const setCartQuantity = (productId, quantity) => {
  const product = products.find((item) => item.id === Number(productId));
  const cart = readCart();
  const item = cart.find((entry) => entry.productId === Number(productId));
  const amount = Math.floor(Number(quantity));

  if (!item || !product) return;
  if (amount < 1) {
    saveCart(cart.filter((entry) => entry.productId !== product.id));
    return;
  }

  item.quantity = Math.min(amount, product.stock);
  saveCart(cart);
};

export const removeFromCart = (productId) => {
  saveCart(readCart().filter((item) => item.productId !== Number(productId)));
};

export const clearCart = () => saveCart([]);

export const updateCartBadges = () => {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
    badge.setAttribute("aria-label", `${count} productos en el carrito`);
  });
};

export const formatPrice = (price) =>
  `$${price.toLocaleString("es-CO")}`;

window.addEventListener("storage", (event) => {
  if (event.key === storageKey) updateCartBadges();
});

document.addEventListener("DOMContentLoaded", updateCartBadges);
updateCartBadges();
