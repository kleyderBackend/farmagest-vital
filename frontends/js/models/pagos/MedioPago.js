/** Contrato abstracto de validación y comisión para medios de pago simulados. */
export class MedioPago {
  #nombre;
  constructor(nombre) {
    if (new.target === MedioPago) throw new TypeError("MedioPago es abstracta");
    this.#nombre = nombre;
  }
  get nombre() {
    return this.#nombre;
  }
  /**
   * Exige una implementación concreta de la validación.
   * @abstract
   * @returns {boolean} La subclase debe devolver true o lanzar un error.
   */
  validarDatos() {
    throw new Error("El medio debe implementar validarDatos");
  }
  /**
   * Calcula la comisión académica sin efectuar un pago bancario.
   * @abstract
   * @returns {number} Comisión en COP.
   */
  calcularComision() {
    throw new Error("El medio debe implementar calcularComision");
  }
  /**
   * Valida el medio y produce un resultado simulado e inmutable.
   * @param {number} monto Base positiva en COP.
   * @returns {{metodo: string, comision: number, simulado: boolean}} Resultado sin credenciales.
   * @throws {Error} Si el monto o los datos no son válidos.
   */
  procesar(monto) {
    if (!Number.isFinite(monto) || monto <= 0)
      throw new Error("El monto debe ser positivo");
    if (this.validarDatos() !== true)
      throw new Error("El medio de pago no confirmó la validación de sus datos");
    return Object.freeze({
      metodo: this.nombre,
      comision: this.calcularComision(monto),
      simulado: true,
    });
  }
}
