import { Producto } from "../models/Producto.js";
import { HttpJSON } from "./HttpJSON.js";

/** Servicio de aplicación: ServicioCatalogo; aislado del DOM y de las credenciales de la base. */
export class ServicioCatalogo {
  #solicitar;
  #http;
  #demo;
  constructor(solicitar, http = new HttpJSON()) {
    this.#solicitar = solicitar;
    this.#http = http;
  }
  /**
   * Carga JSON ficticio o API real y reconstruye productos con estado privado.
   * @param {boolean} [demo=false] Selecciona el catálogo académico independiente.
   * @returns {Promise<Producto[]>} Productos del origen solicitado.
   */
  async listar(demo = false) {
    if (demo) {
      if (!this.#demo) {
        const data = await this.#http.consultar(
          new URL("../../data/productos.json", import.meta.url).href,
        );
        if (!Array.isArray(data))
          throw new Error("Catálogo de demostración inválido");
        this.#demo = data;
      }
      return this.#demo.map((item) =>
        Producto.desdeJSON({ ...item, isDemo: true }),
      );
    }
    const response = await this.#solicitar("/products/available", {
      auth: false,
    });
    return (response.data?.products || []).map((item) =>
      Producto.desdeJSON(item),
    );
  }
  /**
   * Busca un producto en el origen indicado sin sustituir fallos reales por datos demo.
   * @param {number} id Identificador del producto.
   * @param {boolean} [demo=false] Origen de demostración.
   * @returns {Promise<Producto>} Producto validado.
   */
  async buscar(id, demo = false) {
    if (demo) {
      const product = (await this.listar(true)).find(
        (item) => item.id === Number(id),
      );
      if (!product) throw new Error("Producto de demostración no encontrado");
      return product;
    }
    const response = await this.#solicitar(`/products/${Number(id)}`, {
      auth: false,
    });
    return Producto.desdeJSON(response.data?.product ?? response.product);
  }
}
