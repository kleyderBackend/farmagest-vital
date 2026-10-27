/** Producto del catálogo: protege precio y existencias; no conoce el DOM ni APIs. */
export class Producto {
  #id;
  #nombre;
  #precio;
  #stock;
  #datos;

  /**
   * Inicializa un producto y valida precio y stock antes de guardar su estado privado.
   * @param {Object} data Datos normalizados del catálogo.
   * @throws {Error} Si faltan identidad o nombre, o los importes son inválidos.
   */
  constructor(data) {
    if (!Number.isSafeInteger(Number(data.id)) || Number(data.id) < 1)
      throw new Error("Producto inválido");
    if (typeof data.name !== "string" || !data.name.trim())
      throw new Error("El producto necesita nombre");
    this.#id = Number(data.id);
    this.#nombre = data.name.trim();
    this.cambiarPrecio(Number(data.price));
    this.ajustarStock(Number(data.stock));
    this.#datos = Object.freeze({
      categoryId: Number(data.categoryId || 1),
      category: String(data.category || "Medicamentos"),
      presentation: String(data.presentation || "Unidad"),
      description: String(data.description || ""),
      imageUrl: String(data.imageUrl || ""),
      expirationDate: data.expirationDate
        ? String(data.expirationDate).slice(0, 10)
        : null,
      active: data.active !== false,
      available: data.available !== false,
      isDemo: data.isDemo === true,
    });
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#nombre;
  }
  get price() {
    return this.#precio;
  }
  get stock() {
    return this.#stock;
  }
  get categoryId() {
    return this.#datos.categoryId;
  }
  get category() {
    return this.#datos.category;
  }
  get presentation() {
    return this.#datos.presentation;
  }
  get description() {
    return this.#datos.description;
  }
  get imageUrl() {
    return this.#datos.imageUrl;
  }
  get expirationDate() {
    return this.#datos.expirationDate;
  }
  get isDemo() {
    return this.#datos.isDemo;
  }
  get available() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return (
      this.#datos.active &&
      this.#datos.available &&
      this.#stock > 0 &&
      (!this.expirationDate || this.expirationDate >= today)
    );
  }
  get precioFormateado() {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(this.price);
  }
  /**
   * Actualiza el precio unitario en COP, redondeado a dos decimales.
   * @param {number} price Precio positivo y finito.
   * @returns {void}
   */
  cambiarPrecio(price) {
    if (!Number.isFinite(price) || price <= 0 || price > 99999999)
      throw new Error("El precio debe ser positivo y finito");
    this.#precio = Math.round(price * 100) / 100;
  }
  /**
   * Fija las existencias disponibles sin admitir fracciones ni valores negativos.
   * @param {number} stock Unidades enteras disponibles.
   * @returns {void}
   */
  ajustarStock(stock) {
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647)
      throw new Error("Stock inválido");
    this.#stock = stock;
  }
  /**
   * Comprueba disponibilidad, vencimiento y existencias para una cantidad.
   * @param {number} quantity Unidades enteras positivas.
   * @returns {void}
   * @throws {Error} Si el producto no puede venderse o no alcanza el stock.
   */
  validarCantidad(quantity) {
    if (!Number.isSafeInteger(quantity) || quantity < 1)
      throw new Error("La cantidad debe ser un entero positivo");
    if (!this.available || quantity > this.stock)
      throw new Error(`Stock insuficiente para ${this.name}`);
  }
  /**
   * Descuenta unidades del objeto después de validar su disponibilidad.
   * @param {number} quantity Unidades que se reservan.
   * @returns {void}
   */
  reservar(quantity) {
    this.validarCantidad(quantity);
    this.#stock -= quantity;
  }
  /**
   * Devuelve una copia serializable del catálogo, sin exponer los campos privados.
   * @returns {Object} Datos normalizados del producto.
   */
  toJSON() {
    return {
      ...this.#datos,
      id: this.id,
      name: this.name,
      price: this.price,
      stock: this.stock,
    };
  }
  /**
   * Reconstruye una instancia desde API, JSON o un Producto, sin compartir estado.
   * @param {Object|Producto} data Producto de origen.
   * @returns {Producto} Copia validada con campos privados.
   */
  static desdeJSON(data) {
    if (data instanceof Producto) return new Producto(data.toJSON());
    if (!data || typeof data !== "object")
      throw new Error("Producto no encontrado");
    return new Producto({
      id: data.product_id ?? data.id,
      name: data.name,
      price: Number(data.sale_price ?? data.price),
      stock: Number(data.current_stock ?? data.stock),
      categoryId: data.category_id ?? data.categoryId,
      category: data.category_name ?? data.category,
      presentation: data.presentation,
      description: data.description,
      imageUrl: data.image_url ?? data.imageUrl,
      expirationDate: data.expiration_date ?? data.expirationDate,
      available: ![false, 0, "0"].includes(data.is_available ?? data.available),
      active: ![false, 0, "0"].includes(data.is_active ?? data.active),
      isDemo: data.isDemo,
    });
  }
}
