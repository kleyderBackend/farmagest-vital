/** Fotografía inmutable de precios, envío, comisión y tasa de cambio. */
export class Cotizacion {
  #datos;
  /**
   * Congela precios, cargos y tasa en una copia defensiva con vencimiento.
   * @param {Object} datos Importes COP, moneda, tasa, productos y expiresAt en milisegundos.
   * @throws {Error} Si los importes, la moneda o la fecha de la tasa son inválidos.
   */
  constructor(datos) {
    const {
      subtotal,
      envio,
      comision,
      tasa,
      moneda,
      fechaTasa,
      ciudad,
      metodo,
      items,
      expiresAt,
    } = datos;
    if (
      ![subtotal, envio, comision, tasa, expiresAt].every(Number.isFinite) ||
      subtotal <= 0 ||
      envio < 0 ||
      comision < 0 ||
      tasa <= 0 ||
      !["COP", "USD", "EUR"].includes(moneda) ||
      !Number.isFinite(Date.parse(fechaTasa)) ||
      !Array.isArray(items) ||
      !items.length
    )
      throw new Error("Cotización inválida");
    this.#datos = JSON.parse(
      JSON.stringify({
        subtotal,
        envio,
        comision,
        tasa,
        moneda,
        fechaTasa,
        ciudad,
        metodo,
        items,
        expiresAt,
        fuenteTasa: String(datos.fuenteTasa),
        respaldoDivisas: Boolean(datos.respaldoDivisas),
        respaldoClima: Boolean(datos.respaldoClima),
        llueve: Boolean(datos.llueve),
        km: Number(datos.km),
      }),
    );
  }
  /**
   * Suma subtotal, envío y comisión sin consultar servicios externos.
   * @returns {number} Total en COP redondeado a dos decimales.
   */
  get total() {
    return (
      Math.round(
        (this.#datos.subtotal + this.#datos.envio + this.#datos.comision) * 100,
      ) / 100
    );
  }
  /**
   * Convierte el total con la tasa fijada en esta cotización.
   * @returns {number} Total en la moneda elegida, con dos decimales.
   */
  get convertido() {
    return Math.round(this.total * this.#datos.tasa * 100) / 100;
  }
  get vencida() {
    return Date.now() >= this.#datos.expiresAt;
  }
  /**
   * Entrega una copia de la cotización incluyendo los totales calculados.
   * @returns {Object} Instantánea serializable.
   */
  toJSON() {
    return JSON.parse(
      JSON.stringify({
        ...this.#datos,
        total: this.total,
        convertido: this.convertido,
      }),
    );
  }
  /**
   * Verifica vigencia y coincidencia del pedido antes de confirmar.
   * @param {Carrito} carrito Pedido que se intenta confirmar.
   * @param {Object} opciones Destino, medio de pago y moneda seleccionados.
   * @returns {boolean} Si mantiene productos, cantidades, precios y opciones cotizadas.
   */
  coincide(carrito, { ciudad, metodo, moneda }) {
    const fingerprint = carrito.items
      .map((item) => ({
        productId: item.producto.id,
        quantity: item.cantidad,
        price: item.producto.price,
      }))
      .sort((a, b) => a.productId - b.productId);
    return (
      !this.vencida &&
      ciudad === this.#datos.ciudad &&
      metodo === this.#datos.metodo &&
      moneda === this.#datos.moneda &&
      JSON.stringify(fingerprint) === JSON.stringify(this.#datos.items)
    );
  }
}
