import { MedioPago } from "./MedioPago.js";
/** Valida banco y tipo de cuenta de prueba; aplica una comisión académica fija. */
export class PagoPSE extends MedioPago {
  #banco;
  #tipo;
  constructor({ bank = "", accountType = "" } = {}) {
    super("PSE");
    this.#banco = bank;
    this.#tipo = accountType;
  }
  /**
   * Valida los datos o la confirmación requeridos por este medio.
   * @returns {boolean} true cuando la validación termina correctamente.
   * @throws {Error} Si faltan datos o no son válidos.
   */
  validarDatos() {
    if (
      !["bancolombia", "davivienda", "bancobogota"].includes(this.#banco) ||
      !["ahorros", "corriente"].includes(this.#tipo)
    )
      throw new Error("Selecciona banco y tipo de cuenta de prueba");
    return true;
  }
  /**
   * Calcula la comisión académica sin efectuar un pago bancario.
   * @returns {number} Comisión en COP.
   */
  calcularComision() {
    return 1500;
  }
}
