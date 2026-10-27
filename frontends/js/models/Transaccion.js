/** Recibo inmutable. Su lista blanca nunca almacena datos bancarios ni de contacto. */
export class Transaccion {
  #datos;
  /**
   * Valida importes y crea un recibo privado usando una lista blanca de campos.
   * @param {Object} data Identificador, fecha, estado, productos y cotización.
   * @throws {Error} Si faltan productos o no coinciden subtotales y conversión.
   */
  constructor(data) {
    if (
      typeof data.id !== "string" ||
      !data.id ||
      data.id.length > 100 ||
      !Number.isFinite(Date.parse(data.fecha)) ||
      !["simulada", "pedido_pendiente"].includes(data.estado)
    )
      throw new Error("Transacción inválida");
    const quote = data.cotizacion;
    if (!quote || typeof quote !== "object")
      throw new Error("Falta la cotización del recibo");
    if (
      ![
        quote.subtotal,
        quote.envio,
        quote.comision,
        quote.total,
        quote.tasa,
        quote.convertido,
      ].every(Number.isFinite) ||
      quote.subtotal <= 0 ||
      quote.envio < 0 ||
      quote.comision < 0 ||
      quote.tasa <= 0 ||
      Math.abs(quote.total - quote.subtotal - quote.envio - quote.comision) >
        0.01 ||
      Math.abs(
        quote.convertido - Math.round(quote.total * quote.tasa * 100) / 100,
      ) > 0.01 ||
      !["COP", "USD", "EUR"].includes(quote.moneda) ||
      !Number.isFinite(Date.parse(quote.fechaTasa))
    )
      throw new Error("Importes del recibo inválidos");
    if (
      !Array.isArray(data.items) ||
      !data.items.length ||
      data.items.length > 100
    )
      throw new Error("El recibo requiere productos");
    const items = data.items.map((item) => {
      if (
        !Number.isSafeInteger(item.id) ||
        item.id < 1 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        !Number.isFinite(item.price) ||
        item.price <= 0
      )
        throw new Error("Producto del recibo inválido");
      return {
        id: item.id,
        name: String(item.name).slice(0, 200),
        quantity: item.quantity,
        price: item.price,
      };
    });
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    if (Math.abs(subtotal - quote.subtotal) > 0.01)
      throw new Error("El subtotal del recibo no coincide");
    this.#datos = {
      id: data.id,
      fecha: data.fecha,
      estado: data.estado,
      pedido: data.pedido ? String(data.pedido).slice(0, 30) : null,
      metodo: String(data.metodo).slice(0, 40),
      items,
      cotizacion: {
        subtotal: quote.subtotal,
        envio: quote.envio,
        comision: quote.comision,
        total: quote.total,
        moneda: quote.moneda,
        tasa: quote.tasa,
        convertido: quote.convertido,
        fechaTasa: quote.fechaTasa,
        fuenteTasa: String(quote.fuenteTasa),
        respaldoDivisas: Boolean(quote.respaldoDivisas),
        respaldoClima: Boolean(quote.respaldoClima),
        ciudad: String(quote.ciudad),
        km: Number(quote.km),
        llueve: Boolean(quote.llueve),
      },
    };
  }
  get id() {
    return this.#datos.id;
  }
  get total() {
    return this.#datos.cotizacion.total;
  }
  /**
   * Devuelve una copia completa sin identidad, contacto ni credenciales bancarias.
   * @returns {Object} Recibo serializable, independiente del original.
   */
  toJSON() {
    return JSON.parse(JSON.stringify(this.#datos));
  }
  /**
   * Reconstruye y vuelve a validar un recibo previamente serializado.
   * @param {Object} data Recibo guardado.
   * @returns {Transaccion} Instancia con estado encapsulado.
   */
  static desdeJSON(data) {
    return new Transaccion(data);
  }
  /**
   * Emite un recibo único con la tasa cotizada y la comisión validada.
   * @param {Object} datos Carrito, cotización, resultado simulado del pago y pedido opcional.
   * @returns {Transaccion} Recibo de simulación o pedido pendiente de pago.
   * @throws {Error} Si venció la cotización o cambió la comisión.
   */
  static crear({ carrito, cotizacion, pago, pedido = null }) {
    if (cotizacion.vencida)
      throw new Error("La cotización venció; vuelve a cotizar");
    const quote = cotizacion.toJSON();
    if (pago.comision !== quote.comision)
      throw new Error("La comisión cambió; vuelve a cotizar");
    return new Transaccion({
      id: globalThis.crypto.randomUUID(),
      fecha: new Date().toISOString(),
      estado: pedido ? "pedido_pendiente" : "simulada",
      pedido,
      metodo: pago.metodo,
      cotizacion: quote,
      items: carrito.items.map((item) => ({
        id: item.producto.id,
        name: item.producto.name,
        quantity: item.cantidad,
        price: item.producto.price,
      })),
    });
  }
}
