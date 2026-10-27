import { Transaccion } from "../models/Transaccion.js";

/** Servicio de aplicación: ServicioHistorial; aislado del DOM y de las credenciales de la base. */
export class ServicioHistorial {
  #storage;
  #key = "farmagest-transacciones-v1";
  /**
   * Inyecta el almacenamiento de recibos.
   * @param {Storage} storage Implementación compatible con localStorage.
   */
  constructor(storage) {
    this.#storage = storage;
  }
  /**
   * Reconstruye hasta cien recibos válidos, descartando entradas corruptas.
   * @returns {Transaccion[]} Recibos del más reciente al más antiguo.
   */
  listar() {
    try {
      const data = JSON.parse(this.#storage.getItem(this.#key) || "[]");
      if (!Array.isArray(data)) return [];
      return data.slice(0, 100).flatMap((item) => {
        try {
          return [Transaccion.desdeJSON(item)];
        } catch {
          return [];
        }
      });
    } catch {
      return [];
    }
  }
  /**
   * Guarda un recibo sin duplicar su UUID y limita el historial a cien registros.
   * @param {Transaccion} transaccion Recibo validado, sin datos de contacto ni bancarios.
   * @returns {void}
   * @throws {Error} Si el recibo o el almacenamiento no son válidos.
   */
  guardar(transaccion) {
    if (!(transaccion instanceof Transaccion))
      throw new Error("Solo se guardan transacciones válidas");
    const records = [
      transaccion,
      ...this.listar().filter((item) => item.id !== transaccion.id),
    ].slice(0, 100);
    this.#storage.setItem(
      this.#key,
      JSON.stringify(records.map((item) => item.toJSON())),
    );
  }
}
