import { Producto } from "./Producto.js";

/** Composición: una línea tiene un producto y controla su cantidad. */
export class ItemCarrito {
  #producto;
  #cantidad;
  /**
   * Compone una línea con una copia defensiva del producto.
   * @param {Producto|Object} producto Producto disponible.
   * @param {number} [cantidad=1] Unidades iniciales.
   */
  constructor(producto, cantidad = 1) {
    this.#producto = Producto.desdeJSON(producto);
    this.cambiarCantidad(cantidad);
  }
  get producto() {
    return Producto.desdeJSON(this.#producto);
  }
  get cantidad() {
    return this.#cantidad;
  }
  /**
   * Calcula el importe de la línea con redondeo monetario.
   * @returns {number} Precio por unidades, en COP.
   */
  get subtotal() {
    return Math.round(this.#producto.price * this.cantidad * 100) / 100;
  }
  /**
   * Modifica las unidades usando las reglas de disponibilidad del producto.
   * @param {number} cantidad Entero positivo que no supera el stock.
   * @returns {void}
   */
  cambiarCantidad(cantidad) {
    this.#producto.validarCantidad(cantidad);
    this.#cantidad = cantidad;
  }
  /**
   * Serializa la línea para reconstruirla posteriormente.
   * @returns {Object} Producto, identificador y cantidad.
   */
  toJSON() {
    return {
      productId: this.#producto.id,
      quantity: this.cantidad,
      product: this.#producto.toJSON(),
    };
  }
}
