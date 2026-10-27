import { ServicioClima } from "./ServicioClima.js";

/** Servicio de aplicación: ServicioEnvio; aislado del DOM y de las credenciales de la base. */
export class ServicioEnvio {
  static #destinos = [
    { nombre: "Medellín", lat: 6.2442, lon: -75.5812 },
    { nombre: "Bogotá", lat: 4.711, lon: -74.0721 },
    { nombre: "Cali", lat: 3.4516, lon: -76.532 },
    { nombre: "Barranquilla", lat: 10.9639, lon: -74.7964 },
    { nombre: "Cartagena", lat: 10.391, lon: -75.4794 },
    { nombre: "Bucaramanga", lat: 7.1193, lon: -73.1227 },
    { nombre: "Pereira", lat: 4.8143, lon: -75.6946 },
    { nombre: "Madrid", lat: 40.4168, lon: -3.7038 },
    { nombre: "Nueva York", lat: 40.7128, lon: -74.006 },
  ];
  #clima;
  constructor(clima = new ServicioClima()) {
    this.#clima = clima;
  }
  static get destinos() {
    return this.#destinos.map((item) => ({ ...item }));
  }
  /**
   * Resuelve una ciudad admitida ignorando tildes y mayúsculas.
   * @param {string} nombre Ciudad seleccionada.
   * @returns {{nombre: string, lat: number, lon: number}} Copia del destino.
   * @throws {Error} Si la ciudad no está en el listado.
   */
  static destino(nombre) {
    const normalized = String(nombre)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
    const destino = this.destinos.find(
      (item) =>
        item.nombre
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() === normalized,
    );
    if (!destino)
      throw new Error(
        "Selecciona una ciudad del listado para cotizar el envío",
      );
    return destino;
  }
  /**
   * Calcula la distancia en línea recta desde Medellín mediante Haversine.
   * @param {{lat: number, lon: number}} destino Coordenadas de destino.
   * @returns {number} Distancia en kilómetros.
   */
  distancia(destino) {
    const origen = ServicioEnvio.#destinos[0];
    const rad = (value) => (value * Math.PI) / 180;
    const dLat = rad(destino.lat - origen.lat),
      dLon = rad(destino.lon - origen.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(origen.lat)) *
        Math.cos(rad(destino.lat)) *
        Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }
  /**
   * Calcula envío ilustrativo, recargo por lluvia y exención por subtotal.
   * @param {string} ciudad Ciudad admitida.
   * @param {number} subtotal Importe positivo del carrito en COP.
   * @returns {Promise<Object>} Costo COP, distancia, ciudad, clima y respaldo.
   */
  async cotizar(ciudad, subtotal) {
    if (!Number.isFinite(subtotal) || subtotal <= 0)
      throw new Error("Agrega productos antes de cotizar");
    const destino = ServicioEnvio.destino(ciudad);
    const clima = await this.#clima.consultar(destino);
    const km = Math.round(this.distancia(destino) * 10) / 10;
    const base = subtotal >= 250000 ? 0 : Math.round(5000 + km * 35);
    return Object.freeze({
      ciudad: destino.nombre,
      km,
      costo: base === 0 ? 0 : base + (clima.llueve ? 2000 : 0),
      ...clima,
      origen: "Medellín",
      tarifa: "Tarifa académica ilustrativa",
    });
  }
}
