/** Consultas con tiempo límite y errores explícitos; no conoce la interfaz. */
export class HttpJSON {
  #fetch;
  constructor(fetcher = globalThis.fetch) {
    this.#fetch = fetcher.bind(globalThis);
  }
  /**
   * Obtiene JSON con cancelación y tiempo límite; rechaza errores HTTP.
   * @param {string} url Dirección del servicio o archivo JSON.
   * @param {number} [timeout=6000] Tiempo límite en milisegundos.
   * @returns {Promise<Object>} Respuesta JSON del servicio.
   * @throws {Error} Ante tiempo agotado, estado HTTP de error o JSON inválido.
   */
  async consultar(url, timeout = 6000) {
    const controller = new AbortController();
    let timer;
    try {
      const response = await Promise.race([
        this.#fetch(url, { signal: controller.signal }),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error("Tiempo de consulta agotado"));
          }, timeout);
        }),
      ]);
      if (!response.ok)
        throw new Error(`Servicio no disponible (${response.status})`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }
}
