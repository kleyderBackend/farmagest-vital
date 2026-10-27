import { MedioPago } from "./MedioPago.js";

/** Solo pide los últimos cuatro dígitos ficticios. Nunca recibe PAN completo ni CVV. */
/** Valida cuatro dígitos ficticios y vencimiento; aplica comisión académica del 2,9 %. */
export class PagoTarjeta extends MedioPago {
  #ultimos;
  #vencimiento;
  constructor({ lastFour = "", expiry = "" } = {}) {
    super("Tarjeta");
    this.#ultimos = lastFour;
    this.#vencimiento = expiry;
  }
  /**
   * Valida los datos o la confirmación requeridos por este medio.
   * @returns {boolean} true cuando la validación termina correctamente.
   * @throws {Error} Si faltan datos o no son válidos.
   */
  validarDatos() {
    if (!/^\d{4}$/.test(this.#ultimos))
      throw new Error("Indica cuatro dígitos de una tarjeta ficticia");
    if (!/^\d{4}-\d{2}$/.test(this.#vencimiento))
      throw new Error("Indica el vencimiento de prueba");
    const [year, month] = this.#vencimiento.split("-").map(Number);
    const today = new Date();
    if (
      month < 1 ||
      month > 12 ||
      new Date(year, month, 1) <=
        new Date(today.getFullYear(), today.getMonth(), 1)
    )
      throw new Error("La tarjeta ficticia está vencida");
    return true;
  }
  /**
   * Calcula la comisión académica sin efectuar un pago bancario.
   * @param {number} monto Base de cálculo en COP.
   * @returns {number} Comisión en COP.
   */
  calcularComision(monto) {
    return Math.round(monto * 0.029);
  }
}
