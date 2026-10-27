import { MedioPago } from "./MedioPago.js";
/** Valida el formato de un celular ficticio sin efectuar cargos. */
export class PagoNequi extends MedioPago {
  #telefono;
  constructor({ phone = "" } = {}) {
    super("Nequi");
    this.#telefono = phone;
  }
  /**
   * Valida los datos o la confirmación requeridos por este medio.
   * @returns {boolean} true cuando la validación termina correctamente.
   * @throws {Error} Si faltan datos o no son válidos.
   */
  validarDatos() {
    if (!/^3\d{9}$/.test(this.#telefono))
      throw new Error("Indica un celular ficticio de 10 dígitos para Nequi");
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
