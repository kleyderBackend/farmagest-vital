import { HttpJSON } from "./HttpJSON.js";

/** Servicio de aplicación: ServicioClima; aislado del DOM y de las credenciales de la base. */
export class ServicioClima {
  static URL = "https://api.open-meteo.com/v1/forecast";
  #http;
  #cache = new Map();
  constructor(http = new HttpJSON()) {
    this.#http = http;
  }
  /**
   * Consulta lluvia con caché de diez minutos; ante fallo devuelve un respaldo sin recargo.
   * @param {{lat: number, lon: number}} destino Coordenadas públicas de la ciudad.
   * @returns {Promise<{llueve: boolean, fuente: string, respaldo: boolean}>} Clima y procedencia.
   */
  async consultar({ lat, lon }) {
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    )
      throw new Error("Coordenadas inválidas");
    const key = `${lat},${lon}`;
    const cached = this.#cache.get(key);
    if (cached && Date.now() - cached.guardada < 600000)
      return cached.resultado;
    try {
      const url = new URL(ServicioClima.URL);
      url.search = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: "precipitation,weather_code",
        timezone: "auto",
      }).toString();
      const data = await this.#http.consultar(url.href);
      const precipitation = data.current?.precipitation;
      const code = data.current?.weather_code;
      if (
        !Number.isFinite(precipitation) ||
        precipitation < 0 ||
        !Number.isInteger(code)
      )
        throw new Error("Clima inválido");
      const resultado = Object.freeze({
        llueve: precipitation > 0 || (code >= 51 && code <= 99),
        fuente: "Open-Meteo",
        respaldo: false,
      });
      this.#cache.set(key, { guardada: Date.now(), resultado });
      return resultado;
    } catch {
      return Object.freeze({
        llueve: false,
        fuente: "Clima no disponible: sin recargo por lluvia",
        respaldo: true,
      });
    }
  }
}
