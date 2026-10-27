import { Carrito } from "../models/Carrito.js";

/** Servicio de aplicación: AlmacenCarrito; aislado del DOM y de las credenciales de la base. */
export class AlmacenCarrito {
  static KEY = "farmagest-vital-cart";
  #storage;
  /**
   * Recibe el almacenamiento para poder sustituirlo en pruebas.
   * @param {Storage} storage Implementación compatible con localStorage.
   */
  constructor(storage) {
    this.#storage = storage;
  }
  /**
   * Reconstruye el carrito desde JSON; tolera datos corruptos o lectura bloqueada.
   * @returns {Carrito} Estado válido recuperado.
   */
  cargar() {
    try {
      return Carrito.desdeJSON(
        JSON.parse(this.#storage.getItem(AlmacenCarrito.KEY) || "[]"),
      );
    } catch {
      return new Carrito();
    }
  }
  /**
   * Persiste solo la representación serializable del dominio.
   * @param {Carrito} carrito Pedido que se guardará.
   * @returns {void}
   * @throws {Error} Si el almacenamiento rechaza la escritura.
   */
  guardar(carrito) {
    this.#storage.setItem(AlmacenCarrito.KEY, JSON.stringify(carrito.toJSON()));
  }
}
