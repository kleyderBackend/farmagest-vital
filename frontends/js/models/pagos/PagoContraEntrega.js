import { MedioPago } from "./MedioPago.js";
/** Exige reconocer que el pago se realizará al recibir el pedido. */
export class PagoContraEntrega extends MedioPago {
  #confirmacion;
  constructor({ confirmOnDelivery = false } = {}) {
    super("Contra entrega");
    this.#confirmacion = confirmOnDelivery;
  }
  /**
   * Valida los datos o la confirmación requeridos por este medio.
   * @returns {boolean} true cuando la validación termina correctamente.
   * @throws {Error} Si faltan datos o no son válidos.
   */
  validarDatos() {
    if (this.#confirmacion !== true)
      throw new Error("Confirma que el pago contra entrega queda pendiente hasta recibir el pedido");
    return true;
  }
  /**
   * Calcula la comisión académica sin efectuar un pago bancario.
   * @returns {number} Comisión en COP.
   */
  calcularComision() {
    return 0;
  }
}
