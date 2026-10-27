import { Usuario } from "./Usuario.js";

export class Cliente extends Usuario {
  #ciudad;
  #telefono;
  #direccion;
  #barrio;
  /**
   * Valida contacto, entrega y autorización antes de aceptar al cliente.
   * @param {Object} datos Nombre, correo, teléfono, ciudad, dirección y barrio.
   * @param {boolean} datos.consent Autorización explícita, debe ser true.
   */
  constructor({
    fullName,
    email,
    phone,
    city,
    address,
    neighborhood,
    consent,
  }) {
    super(fullName, email);
    if (consent !== true)
      throw new Error("Autoriza el uso de tus datos para tramitar el pedido");
    if (typeof phone !== "string" || !/^\+?[\d ()-]{7,20}$/.test(phone))
      throw new Error("Teléfono inválido");
    for (const [label, value, limit] of [
      ["Ciudad", city, 100],
      ["Dirección", address, 150],
      ["Barrio", neighborhood, 100],
    ]) {
      if (
        typeof value !== "string" ||
        value.trim().length < 2 ||
        value.length > limit
      )
        throw new Error(`${label} inválida`);
    }
    this.#ciudad = city.trim();
    this.#telefono = phone.trim();
    this.#direccion = address.trim();
    this.#barrio = neighborhood.trim();
  }
  get ciudad() {
    return this.#ciudad;
  }
  get direccion() {
    return this.#direccion;
  }
  get barrio() {
    return this.#barrio;
  }
  /**
   * Especializa la descripción heredada con el rol y la ciudad de entrega.
   * @returns {string} Presentación del cliente.
   */
  presentarse() {
    return `Cliente: ${super.presentarse()} (${this.ciudad})`;
  }
  /**
   * Expone solo los datos de contacto necesarios para registrar el pedido.
   * @returns {Object} Identidad, teléfono y dirección; sin datos del pago.
   */
  toJSON() {
    return {
      fullName: this.nombre,
      email: this.correo,
      phone: this.#telefono,
      address: this.direccion,
    };
  }
}
