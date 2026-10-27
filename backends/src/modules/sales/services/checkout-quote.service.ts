import jwt from "jsonwebtoken";
import { findProductById } from "../../products/repositories/find-product.repository";
import type { CheckoutQuote } from "../checkout.type";
// @ts-expect-error Shared ES model used by the browser and Node.js.
import { Carrito } from "../../../../../frontends/js/models/Carrito.js";
// @ts-expect-error Shared ES model used by the browser and Node.js.
import { Producto } from "../../../../../frontends/js/models/Producto.js";
// @ts-expect-error Shared quotation rules; credentials and SQL remain in the backend.
import { ServicioCotizacion } from "../../../../../frontends/js/services/ServicioCotizacion.js";
// @ts-expect-error Shared destination registry.
import { ServicioEnvio } from "../../../../../frontends/js/services/ServicioEnvio.js";

export class CheckoutQuoteService {
  static #cotizador = new ServicioCotizacion();

  static async cotizar(data: { items: Array<{ productId: number; quantity: number }>; city: string; method: string; currency: string }) {
    if (!Array.isArray(data.items) || !data.items.length || data.items.length > 100) throw new Error("El carrito debe tener de 1 a 100 líneas");
    const cart = new Carrito();
    const seen = new Set<number>();
    for (const item of data.items) {
      if (!item || !Number.isSafeInteger(item.productId) || item.productId < 1 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || seen.has(item.productId)) throw new Error("Productos o cantidades inválidos");
      seen.add(item.productId);
      const row = await findProductById(item.productId);
      if (!row) throw new Error("El producto no existe");
      cart.agregar(Producto.desdeJSON(row), item.quantity);
    }
    const cotizacion = await this.#cotizador.cotizar(cart, { ciudad: data.city, metodo: data.method, moneda: data.currency });
    const summary = cotizacion.toJSON();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no está configurado");
    const token = jwt.sign({ scope: "checkout-quote", quote: summary }, secret, { expiresIn: "10m" });
    return { cotizacion: summary, token };
  }

  static verificar(token: unknown, city: string): CheckoutQuote {
    if (typeof token !== "string" || token.length > 40000) throw new Error("Cotiza el pedido antes de confirmar");
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no está configurado");
    let decoded;
    try { decoded = jwt.verify(token, secret) as jwt.JwtPayload; }
    catch { throw new Error("La cotización venció o es inválida; vuelve a cotizar"); }
    if (decoded.scope !== "checkout-quote" || !decoded.quote || decoded.quote.expiresAt <= Date.now() || decoded.quote.ciudad !== ServicioEnvio.destino(city).nombre) {
      throw new Error("La cotización no corresponde al destino del pedido");
    }
    return decoded.quote as CheckoutQuote;
  }
}
