import { Producto } from "./Producto.js";
import { ItemCarrito } from "./ItemCarrito.js";

export class Carrito {
  #items = new Map();
  #advertencias = [];
  get advertencias() {
    return [...this.#advertencias];
  }
  /**
   * Obtiene copias de las líneas para impedir cambios externos sobre el carrito.
   * @returns {ItemCarrito[]} Líneas independientes del estado interno.
   */
  get items() {
    return [...this.#items.values()].map(
      (item) => new ItemCarrito(item.producto, item.cantidad),
    );
  }
  get cantidad() {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }
  /**
   * Suma los subtotales de las líneas con redondeo a dos decimales.
   * @returns {number} Subtotal del pedido en COP.
   */
  get subtotal() {
    return (
      Math.round(
        this.items.reduce((sum, item) => sum + item.subtotal, 0) * 100,
      ) / 100
    );
  }
  get esDemo() {
    return (
      this.items.length > 0 && this.items.every((item) => item.producto.isDemo)
    );
  }
  /**
   * Agrega unidades sin mezclar catálogo real y demo ni superar existencias.
   * @param {Producto|Object} producto Producto validable.
   * @param {number} [cantidad=1] Unidades adicionales.
   * @returns {Carrito} Esta instancia para encadenar operaciones.
   */
  agregar(producto, cantidad = 1) {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) throw new Error("La cantidad debe ser un entero positivo");
    producto = Producto.desdeJSON(producto);
    if (this.items.some((item) => item.producto.isDemo !== producto.isDemo))
      throw new Error(
        "Vacía el carrito antes de cambiar entre catálogo real y demostración",
      );
    const current = this.#items.get(producto.id);
    const next = (current?.cantidad || 0) + cantidad;
    this.#items.set(producto.id, new ItemCarrito(producto, next));
    return this;
  }
  /**
   * Cambia unidades y limita el pedido al stock disponible; cero elimina la línea.
   * @param {number} id Identificador del producto.
   * @param {number} cantidad Cantidad entera solicitada.
   * @returns {void}
   */
  cambiarCantidad(id, cantidad) {
    if (!Number.isSafeInteger(cantidad)) throw new Error("Cantidad inválida");
    const item = this.#items.get(Number(id));
    if (!item) return;
    if (cantidad < 1) {
      this.quitar(id);
      return;
    }
    item.cambiarCantidad(Math.min(cantidad, item.producto.stock));
  }
  /**
   * Ajusta unidades conservando al menos una; la eliminación es una acción aparte.
   * @param {number} id Identificador del producto.
   * @param {number} variacion Entero distinto de cero, positivo o negativo.
   * @returns {void}
   * @throws {Error} Si la variación no es un entero válido.
   */
  ajustarCantidad(id, variacion) {
    if (!Number.isSafeInteger(variacion) || variacion === 0)
      throw new Error("La variación debe ser un entero distinto de cero");
    const item = this.#items.get(Number(id));
    if (!item) return;
    this.cambiarCantidad(id, Math.max(1, item.cantidad + variacion));
  }
  /**
   * Elimina una línea por su producto.
   * @param {number} id Identificador del producto.
   * @returns {void}
   */
  quitar(id) {
    this.#items.delete(Number(id));
  }
  /**
   * Retira todas las líneas del pedido.
   * @returns {void}
   */
  vaciar() {
    this.#items.clear();
  }
  /**
   * Serializa las líneas para almacenamiento local.
   * @returns {Object[]} Copias serializables de las líneas.
   */
  toJSON() {
    return this.items.map((item) => item.toJSON());
  }
  /**
   * Recupera líneas válidas y registra advertencias por cada descarte.
   * @param {unknown} data Contenido deserializado del almacenamiento.
   * @returns {Carrito} Carrito recuperado; consultar advertencias para los descartes.
   */
  static desdeJSON(data) {
    const cart = new Carrito();
    if (!Array.isArray(data)) {
      cart.#advertencias.push("No se pudo recuperar el carrito: el contenido guardado no es una lista");
      return cart;
    }
    if (data.length > 100)
      cart.#advertencias.push("Solo se recuperaron las primeras 100 líneas del carrito");
    for (const [indice, item] of data.slice(0, 100).entries()) {
      try {
        cart.agregar(Producto.desdeJSON(item?.product), Number(item?.quantity));
      } catch (error) {
        cart.#advertencias.push(`Línea ${indice + 1} descartada: ${error instanceof Error ? error.message : "datos inválidos"}`);
      }
    }
    return cart;
  }
}
