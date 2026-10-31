import { getProductById } from "./catalog-api.js?v=3";
import { Producto } from "./models/Producto.js";
import { Carrito } from "./models/Carrito.js";
import { AlmacenCarrito } from "./services/AlmacenCarrito.js";

const store = new AlmacenCarrito(localStorage);
const products = new Map();
const key = (product) => (product.isDemo ? "demo:" : "real:") + product.id;
const notify = (error) => window.dispatchEvent(new CustomEvent("cartmessage", { detail: error.message }));
const save = (cart) => {
  store.guardar(cart);
  updateCartBadges();
  window.dispatchEvent(new CustomEvent("cartchange"));
};
export const getCartModel = () => store.cargar();
export const getCartItems = () => getCartModel().items.map((item) => ({ ...item.producto.toJSON(), quantity: item.cantidad }));
export const getCartCount = () => getCartModel().cantidad;
export const setCatalogProducts = (items) => items.forEach((item) => {
  const product = Producto.desdeJSON(item);
  products.set(key(product), product);
});
export const hydrateCart = async () => {
  const advertencias = store.cargar().advertencias;
  const old = getCartItems();
  const next = await Promise.all(old.map(async (entry) => {
    try { return { productId: entry.id, quantity: entry.quantity, product: (await getProductById(entry.id, { demo: entry.isDemo })).toJSON() }; }
    catch { return { productId: entry.id, quantity: entry.quantity, product: entry }; }
  }));
  store.guardar(Carrito.desdeJSON(next));
  if (advertencias.length) notify(new Error(advertencias.join(". ")));
  return getCartItems();
};
export const addToCart = (id, quantity = 1, catalogProduct) => {
  try {
    const product = catalogProduct || products.get("real:" + Number(id)) || products.get("demo:" + Number(id));
    if (!product || product.isMock) return false;
    const cart = getCartModel();
    cart.agregar(product, Number(quantity));
    save(cart);
    return true;
  } catch (error) { notify(error); return false; }
};
export const setCartQuantity = (id, quantity) => {
  try { const cart = getCartModel(); cart.cambiarCantidad(Number(id), Number(quantity)); save(cart); }
  catch (error) { notify(error); }
};
/** Persiste el ajuste resuelto por el dominio y comunica sus errores a la vista. */
export const adjustCartQuantity = (id, variation) => {
  try {
    const cart = getCartModel();
    cart.ajustarCantidad(Number(id), Number(variation));
    save(cart);
  } catch (error) { notify(error); }
};
export const removeFromCart = (id) => { const cart = getCartModel(); cart.quitar(id); save(cart); };
export const clearCart = () => save(new Carrito());
export const updateCartBadges = () => document.querySelectorAll("[data-cart-count]").forEach((badge) => {
  const count = getCartCount(); badge.textContent = String(count); badge.hidden = count === 0;
  badge.setAttribute("aria-label", count + " productos en el carrito");
});
export const formatPrice = (price) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price);
window.addEventListener("storage", (event) => { if (event.key === AlmacenCarrito.KEY) updateCartBadges(); });
document.addEventListener("DOMContentLoaded", updateCartBadges);
updateCartBadges();
