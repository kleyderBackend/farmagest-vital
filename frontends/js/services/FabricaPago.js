import { PagoTarjeta } from "../models/pagos/PagoTarjeta.js";
import { PagoPSE } from "../models/pagos/PagoPSE.js";
import { PagoNequi } from "../models/pagos/PagoNequi.js";
import { PagoContraEntrega } from "../models/pagos/PagoContraEntrega.js";
import { PagoTransferencia } from "../models/pagos/PagoTransferencia.js";

/** Servicio de aplicación: FabricaPago; aislado del DOM y de las credenciales de la base. */
export class FabricaPago {
  static #tipos = new Map([
    ["card", PagoTarjeta],
    ["pse", PagoPSE],
    ["nequi", PagoNequi],
    ["cash", PagoContraEntrega],
    ["transfer", PagoTransferencia],
  ]);
  /**
   * Selecciona una subclase a través del registro de medios admitidos.
   * @param {string} tipo cash, transfer, card, pse o nequi.
   * @param {Object} [datos={}] Datos ficticios o confirmaciones del medio.
   * @returns {MedioPago} Implementación concreta del contrato de pago.
   * @throws {Error} Si el tipo no está registrado.
   */
  static crear(tipo, datos = {}) {
    const Tipo = this.#tipos.get(tipo);
    if (!Tipo) throw new Error("Medio de pago inválido");
    return new Tipo(datos);
  }
}
