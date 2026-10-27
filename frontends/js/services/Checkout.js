import { Cliente } from "../models/Cliente.js";
import { Cotizacion } from "../models/Cotizacion.js";
import { Transaccion } from "../models/Transaccion.js";
import { FabricaPago } from "./FabricaPago.js";
import { ServicioCotizacion } from "./ServicioCotizacion.js";
import { ServicioEnvio } from "./ServicioEnvio.js";

/** Caso de uso: coordina dominio y servicios sin depender del DOM. */
export class Checkout {
  #request;
  #cotizador;
  #historial;
  #ocupado = false;
  /**
   * Inyecta los adaptadores HTTP, cotización e historial.
   * @param {Object} dependencias Función request y servicios del caso de uso.
   */
  constructor({ request, historial, cotizador = new ServicioCotizacion() }) {
    this.#request = request;
    this.#historial = historial;
    this.#cotizador = cotizador;
  }
  /**
   * Cotiza la demo localmente o exige una cotización firmada para productos reales.
   * @param {Carrito} carrito Pedido vigente.
   * @param {Object} opciones Ciudad, método y moneda.
   * @returns {Promise<Object>} Cotización, token opcional y origen demo.
   */
  async cotizar(carrito, opciones) {
    if (!carrito.cantidad) throw new Error("Agrega productos al carrito");
    if (carrito.esDemo)
      return {
        cotizacion: await this.#cotizador.cotizar(carrito, opciones),
        token: null,
        demo: true,
      };
    const response = await this.#request("/sales/quote", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        items: carrito.items.map((item) => ({
          productId: item.producto.id,
          quantity: item.cantidad,
        })),
        city: opciones.ciudad,
        method: opciones.metodo,
        currency: opciones.moneda,
      }),
    });
    return {
      cotizacion: new Cotizacion(response.data.cotizacion),
      token: response.data.token,
      demo: false,
    };
  }
  /**
   * Valida el pedido y emite un recibo; nunca transmite los campos del medio de pago.
   * @param {Carrito} carrito Pedido que se confirmará.
   * @param {Object} datos Contacto, consentimiento y datos de prueba del pago.
   * @param {Object} cotizada Resultado vigente de cotizar().
   * @returns {Promise<Object>} Transacción, número de pedido opcional y advertencia de almacenamiento.
   * @throws {Error} Si la validación o el backend rechazan el pedido.
   */
  async confirmar(carrito, datos, cotizada) {
    if (this.#ocupado) throw new Error("El pedido ya se está procesando");
    this.#ocupado = true;
    try {
      const cliente = new Cliente(datos);
      const opciones = {
        ciudad: ServicioEnvio.destino(cliente.ciudad).nombre,
        metodo: datos.method,
        moneda: datos.currency,
      };
      if (
        !cotizada ||
        cotizada.demo !== carrito.esDemo ||
        !cotizada.cotizacion.coincide(carrito, opciones)
      )
        throw new Error(
          "El pedido cambió o la cotización venció. Vuelve a cotizar",
        );
      const quote = cotizada.cotizacion.toJSON();
      const pago = FabricaPago.crear(datos.method, datos.payment).procesar(
        quote.subtotal + quote.envio,
      );
      // Validate the complete receipt before creating any backend side effects.
      let transaccion = Transaccion.crear({
        carrito,
        cotizacion: cotizada.cotizacion,
        pago,
      });
      let pedido = null;
      if (!carrito.esDemo) {
        if (!cotizada.token)
          throw new Error("Falta la cotización firmada por el servidor");
        const response = await this.#request("/sales/checkout", {
          method: "POST",
          auth: false,
          body: JSON.stringify({
            customer: cliente.toJSON(),
            delivery: {
              address: cliente.direccion,
              neighborhood: cliente.barrio,
              city: opciones.ciudad,
              note: String(datos.note || "").slice(0, 1000),
            },
            consent: true,
            quoteToken: cotizada.token,
            items: carrito.items.map((item) => ({
              productId: item.producto.id,
              quantity: item.cantidad,
            })),
          }),
        });
        const id = Number(response.data?.sale?.order_id);
        if (!Number.isSafeInteger(id) || id < 1)
          throw new Error(
            "Respuesta de pedido inválida. Revisa su estado antes de repetir",
          );
        pedido = `FV-${String(id).padStart(6, "0")}`;
        transaccion = Transaccion.desdeJSON({
          ...transaccion.toJSON(),
          pedido,
          estado: "pedido_pendiente",
        });
      }
      let advertencia = "";
      try {
        this.#historial.guardar(transaccion);
      } catch {
        advertencia =
          "El recibo se generó, pero el navegador no permitió guardar el historial. Descárgalo ahora.";
      }
      return { transaccion, pedido, advertencia };
    } finally {
      this.#ocupado = false;
    }
  }
}
