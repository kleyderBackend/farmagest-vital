import { ServicioDivisas } from "./ServicioDivisas.js";
import { ServicioEnvio } from "./ServicioEnvio.js";
import { FabricaPago } from "./FabricaPago.js";
import { Cotizacion } from "../models/Cotizacion.js";

/** Servicio de aplicación: ServicioCotizacion; aislado del DOM y de las credenciales de la base. */
export class ServicioCotizacion {
  #divisas;
  #envio;
  constructor(divisas = new ServicioDivisas(), envio = new ServicioEnvio()) {
    this.#divisas = divisas;
    this.#envio = envio;
  }
  /**
   * Coordina clima, envío, divisas y comisión; fija su resultado por diez minutos.
   * @param {Carrito} carrito Pedido con productos disponibles.
   * @param {{ciudad: string, metodo: string, moneda: string}} opciones Selecciones del cliente.
   * @returns {Promise<Cotizacion>} Instantánea con importes, productos y tasa.
   */
  async cotizar(carrito, { ciudad, metodo, moneda }) {
    if (!carrito.cantidad) throw new Error("El carrito está vacío");
    const [divisas, envio] = await Promise.all([
      this.#divisas.consultar(moneda),
      this.#envio.cotizar(ciudad, carrito.subtotal),
    ]);
    const comision = FabricaPago.crear(metodo).calcularComision(
      carrito.subtotal + envio.costo,
    );
    return new Cotizacion({
      subtotal: carrito.subtotal,
      envio: envio.costo,
      comision,
      tasa: divisas.tasa,
      moneda,
      fechaTasa: divisas.fecha,
      ciudad: envio.ciudad,
      metodo,
      fuenteTasa: divisas.fuente,
      respaldoDivisas: divisas.respaldo,
      respaldoClima: envio.respaldo,
      llueve: envio.llueve,
      km: envio.km,
      expiresAt: Date.now() + 600000,
      items: carrito.items
        .map((item) => ({
          productId: item.producto.id,
          quantity: item.cantidad,
          price: item.producto.price,
        }))
        .sort((a, b) => a.productId - b.productId),
    });
  }
}
