/** Base abstracta; identidad y correo nunca se modifican sin validar. */
export class Usuario {
  #nombre;
  #correo;
  /**
   * Valida la identidad común de las subclases; no admite instanciación directa.
   * @param {string} nombre Nombre de la persona.
   * @param {string} correo Correo que se normaliza a minúsculas.
   * @throws {TypeError|Error} Si se instancia la base o la identidad es inválida.
   */
  constructor(nombre, correo) {
    if (new.target === Usuario)
      throw new TypeError("Usuario es una clase abstracta");
    if (
      typeof nombre !== "string" ||
      nombre.trim().length < 2 ||
      nombre.length > 200
    )
      throw new Error("Indica tu nombre completo");
    if (
      typeof correo !== "string" ||
      correo.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
    )
      throw new Error("Correo inválido");
    this.#nombre = nombre.trim();
    this.#correo = correo.trim().toLowerCase();
  }
  get nombre() {
    return this.#nombre;
  }
  get correo() {
    return this.#correo;
  }
  /**
   * Describe la identidad; las subclases pueden especializar este comportamiento.
   * @returns {string} Nombre validado.
   */
  presentarse() {
    return this.nombre;
  }
}
