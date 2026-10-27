import { HttpJSON } from "./HttpJSON.js";

/** Servicio de aplicación: ServicioDivisas; aislado del DOM y de las credenciales de la base. */
export class ServicioDivisas {
  static URL = "https://open.er-api.com/v6/latest/USD";
  #http;
  #cache;
  constructor(http = new HttpJSON()) {
    this.#http = http;
  }
  /**
   * Obtiene una tasa por COP; usa caché de una hora o respaldo ilustrativo informado.
   * @param {string} [moneda="COP"] COP, USD o EUR.
   * @returns {Promise<{moneda: string, tasa: number, fecha: string, fuente: string, respaldo: boolean}>} Tasa y procedencia.
   */
  async consultar(moneda = "COP") {
    if (!["COP", "USD", "EUR"].includes(moneda))
      throw new Error("Moneda no soportada");
    try {
      if (!this.#cache || Date.now() - this.#cache.guardada > 3600000) {
        const data = await this.#http.consultar(ServicioDivisas.URL);
        if (
          data.result !== "success" ||
          data.base_code !== "USD" ||
          ![data.rates?.COP, data.rates?.EUR, data.rates?.USD].every(
            (rate) => Number.isFinite(rate) && rate > 0,
          )
        )
          throw new Error("Tasas inválidas");
        this.#cache = {
          rates: {
            COP: data.rates.COP,
            USD: data.rates.USD,
            EUR: data.rates.EUR,
          },
          fecha: new Date(data.time_last_update_unix * 1000).toISOString(),
          guardada: Date.now(),
        };
      }
      return Object.freeze({
        moneda,
        tasa: this.#cache.rates[moneda] / this.#cache.rates.COP,
        fecha: this.#cache.fecha,
        fuente: "ExchangeRate-API",
        respaldo: false,
      });
    } catch {
      const rates = { COP: 4200, USD: 1, EUR: 0.92 };
      return Object.freeze({
        moneda,
        tasa: rates[moneda] / rates.COP,
        fecha: new Date().toISOString(),
        fuente: "Respaldo ilustrativo (no es una tasa vigente)",
        respaldo: true,
      });
    }
  }
}
