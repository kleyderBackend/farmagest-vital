import { MedioPago } from "./MedioPago.js";
/** Exige reconocer que la transferencia está pendiente de verificación. */
export class PagoTransferencia extends MedioPago {
  #confirmacion;
  constructor({ acknowledgePendingTransfer = false } = {}) {
    super("Transferencia");
    this.#confirmacion = acknowledgePendingTransfer;
  }
  /**
   * Valida los datos o la confirmación requeridos por este medio.
   * @returns {boolean} true cuando la validación termina correctamente.
   * @throws {Error} Si faltan datos o no son válidos.
   */
  validarDatos() {
    if (this.#confirmacion !== true)
      throw new Error("Confirma que la transferencia queda pendiente de verificación por la farmacia");
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
