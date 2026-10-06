import { getProductById } from "./catalog-api.js";

const storageKey = "farmagest-vital-cart";
const productCache = new Map();

const readCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(storedCart)) return [];

    return storedCart.filter(
      (item) =>
        Number.isInteger(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
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
    const product = productCache.get(entry.productId) ?? entry.product;
    return product ? [{ ...product, quantity: entry.quantity }] : [];
  });

export const setCatalogProducts = (products) => {
  products.forEach((product) => productCache.set(product.id, product));
};

export const hydrateCart = async () => {
  const cart = readCart();

  await Promise.all(
    cart.map(async (entry) => {
      if (productCache.has(entry.productId)) return;

      try {
        const product = await getProductById(entry.productId);
        productCache.set(product.id, product);
        entry.product = product;
      } catch {
        if (entry.product) productCache.set(entry.productId, entry.product);
        return;
      }
    }),
  );

  const validCart = cart.filter(
    (entry) => productCache.has(entry.productId) || entry.product,
  );
  localStorage.setItem(storageKey, JSON.stringify(validCart));
  return getCartItems();
};

export const getCartCount = () =>
  readCart().reduce((total, item) => total + item.quantity, 0);

export const addToCart = (productId, quantity = 1, catalogProduct) => {
  const id = Number(productId);
  const product = catalogProduct ?? productCache.get(id);
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));

  if (!product || product.id !== id || !product.available || product.stock < 1) {
    return false;
  }

  productCache.set(id, product);

  const cart = readCart();
  const existingItem = cart.find((item) => item.productId === id);
  const newQuantity = Math.min(
    product.stock,
    (existingItem?.quantity ?? 0) + amount,
  );

  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.product = product;
  } else {
    cart.push({ productId: id, quantity: newQuantity, product });
  }

  saveCart(cart);
  return true;
};

export const setCartQuantity = (productId, quantity) => {
  const id = Number(productId);
  const cart = readCart();
  const item = cart.find((entry) => entry.productId === id);
  const product = productCache.get(id) ?? item?.product;
  const amount = Math.floor(Number(quantity));

  if (!item || !product) return;
  if (amount < 1) {
    saveCart(cart.filter((entry) => entry.productId !== id));
    return;
  }

  item.quantity = Math.min(amount, product.stock);
  item.product = product;
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
