const storageKey = "farmagest-vital-cart";

const normalizeCartProduct = (product) => ({
  id: Number(product.id),
  name: product.name,
  presentation: product.presentation || "Presentación no especificada",
  price: Number(product.price || 0),
  stock: Number(product.stock || 0),
  available: Boolean(product.available),
});

const isValidCartEntry = (item) =>
  Number.isInteger(item.productId) &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0 &&
  item.product &&
  Number(item.product.id) === Number(item.productId);

const readCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(storedCart)) return [];

    return storedCart.filter(isValidCartEntry);
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
  readCart().map((entry) => ({
    ...entry.product,
    quantity: entry.quantity,
  }));

export const getCartCount = () =>
  readCart().reduce((total, item) => total + item.quantity, 0);

export const addToCart = (product, quantity = 1) => {
  if (!product || !product.available || product.stock < 1) return false;

  const cartProduct = normalizeCartProduct(product);
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  const cart = readCart();
  const existingItem = cart.find((item) => item.productId === cartProduct.id);
  const newQuantity = Math.min(
    cartProduct.stock,
    (existingItem?.quantity ?? 0) + amount,
  );

  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.product = cartProduct;
  } else {
    cart.push({
      productId: cartProduct.id,
      quantity: newQuantity,
      product: cartProduct,
    });
  }

  saveCart(cart);
  return true;
};

export const setCartQuantity = (productId, quantity) => {
  const cart = readCart();
  const item = cart.find((entry) => entry.productId === Number(productId));
  const amount = Math.floor(Number(quantity));

  if (!item) return;
  if (amount < 1) {
    saveCart(cart.filter((entry) => entry.productId !== Number(productId)));
    return;
  }

  item.quantity = Math.min(amount, Number(item.product.stock || 1));
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
  `$${Number(price || 0).toLocaleString("es-CO")}`;

window.addEventListener("storage", (event) => {
  if (event.key === storageKey) updateCartBadges();
});

document.addEventListener("DOMContentLoaded", updateCartBadges);
updateCartBadges();
