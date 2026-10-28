import { apiRequest, formatCurrency } from "../api.js";
import { getCartModel, hydrateCart, clearCart } from "../cart.js?v=4";
import { escapeHtml } from "../inventory-utils.js";
import { Checkout } from "../services/Checkout.js";
import { ServicioHistorial } from "../services/ServicioHistorial.js";
import { ServicioEnvio } from "../services/ServicioEnvio.js";

/** Presentación: lee formularios y muestra modelos; no calcula reglas del negocio. */
export class CheckoutUI {
  #form;
  #checkout;
  #historial;
  #quote = null;
  #revision = 0;
  #busy = false;
  #cotizando = false;
  #receipt = null;
  #completado = false;
  constructor() {
    this.#form = document.getElementById("formShop");
    this.#historial = new ServicioHistorial(localStorage);
    this.#checkout = new Checkout({
      request: apiRequest,
      historial: this.#historial,
    });
  }
  mensaje(text, type = "error") {
    const target = document.getElementById("checkoutMessage");
    target.textContent = text;
    target.className = `checkout-message ${type}`;
    target.hidden = !text;
  }
  opciones() {
    return {
      ciudad: this.#form.elements.city.value,
      metodo: this.#form.elements.paymentMethod.value,
      moneda: this.#form.elements.currency.value,
    };
  }
  invalidar() {
    this.#revision++;
    this.#quote = null;
    if (!this.#busy && getCartModel().cantidad) this.#completado = false;
    document.getElementById("quoteStatus").textContent =
      "Cotiza el pedido para conocer envío, comisión y conversión.";
    this.render();
  }
  pagos() {
    const method = this.#form.elements.paymentMethod.value;
    document.querySelectorAll("[data-payment-fields]").forEach((section) => {
      const active = section.dataset.paymentFields === method;
      section.hidden = !active;
      section.querySelectorAll("input, select").forEach((field) => {
        field.disabled = !active || this.#busy;
        field.required = active;
      });
    });
  }
  /**
   * Presenta importes calculados por Carrito y Cotizacion; no aplica tarifas ni comisiones.
   * @returns {void}
   */
  render() {
    const cart = getCartModel();
    const receipt = this.#receipt?.toJSON();
    const completed = this.#completado && receipt;
    document.getElementById("checkoutLayout").hidden = Boolean(completed);
    document.getElementById("checkoutTitle").textContent = completed
      ? receipt.pedido ? `Pedido ${receipt.pedido} registrado` : "Simulación completada"
      : "Datos para completar tu pedido";
    const backLink = document.getElementById("checkoutBackLink");
    backLink.href = completed
      ? receipt.estado === "simulada" ? "./products.html?modo=demo" : "./products.html"
      : "./carrito.html";
    backLink.textContent = completed ? "Volver al catálogo" : "Volver al carrito";
    if (completed) {
      document.getElementById("btnCreateSale").disabled = true;
      document.getElementById("quoteButton").disabled = true;
      return;
    }
    const data = this.#quote?.cotizacion.toJSON();
    document.getElementById("checkoutSummaryProducts").innerHTML =
      cart.items
        .map(
          (item) =>
            `<article class="summary-product"><div><h3>${escapeHtml(item.producto.name)}</h3><p>${escapeHtml(item.producto.presentation)}</p><small>Cantidad: ${item.cantidad}</small></div><strong>${formatCurrency(item.subtotal)}</strong></article>`,
        )
        .join("") ||
      '<p class="summary-empty">El carrito está vacío. Agrega productos desde el catálogo real o la demostración.</p>';
    document.getElementById("checkoutSubtotal").textContent = formatCurrency(
      cart.subtotal,
    );
    document.getElementById("checkoutDelivery").textContent = data
      ? formatCurrency(data.envio)
      : "Por cotizar";
    document.getElementById("checkoutCommission").textContent = data
      ? formatCurrency(data.comision)
      : "Por cotizar";
    document.getElementById("checkoutTotal").textContent = data
      ? formatCurrency(data.total)
      : "Por cotizar";
    document.getElementById("checkoutConverted").textContent = data
      ? new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: data.moneda,
        }).format(data.convertido)
      : "Por cotizar";
    document.getElementById("purchaseMode").textContent = !cart.cantidad
      ? "Carrito vacío. El recibo y el historial permanecen disponibles debajo del formulario."
      : cart.esDemo
        ? "Simulación académica: no se enviará un pedido ni se realizará un cobro."
        : "Pedido a la farmacia: la validación de pago es simulada; el pago real queda pendiente.";
    const submit = document.getElementById("btnCreateSale");
    submit.textContent = this.#busy
      ? "Procesando…"
      : !cart.cantidad
        ? "Confirmar compra"
        : cart.esDemo
          ? "Simular compra"
          : "Registrar pedido (pago pendiente)";
    submit.disabled = this.#busy || !this.#quote || !cart.cantidad;
    document.getElementById("quoteButton").disabled =
      this.#busy || this.#cotizando || !cart.cantidad;
    this.pagos();
  }
  /**
   * Lee las opciones de la vista y solicita la cotización al caso de uso.
   * @returns {Promise<void>} Actualización de la vista o aviso de error.
   */
  async cotizar() {
    if (this.#busy || this.#cotizando || this.#completado) return;
    this.#cotizando = true;
    this.#quote = null;
    const revision = ++this.#revision;
    this.render();
    document.getElementById("quoteStatus").textContent =
      "Consultando envío, clima y tasa de cambio…";
    try {
      await hydrateCart();
      const quote = await this.#checkout.cotizar(
        getCartModel(),
        this.opciones(),
      );
      if (revision !== this.#revision) return;
      this.#quote = quote;
      const data = quote.cotizacion.toJSON();
      document.getElementById("quoteStatus").textContent =
        `${data.km} km desde Medellín. ${data.llueve ? "Incluye recargo ilustrativo por lluvia." : "Sin recargo por lluvia."} ${data.respaldoClima ? "Clima no disponible: se aplicó respaldo sin lluvia." : "Clima: Open-Meteo."} Tasa: ${data.fuenteTasa}, ${new Date(data.fechaTasa).toLocaleDateString("es-CO")}. Vigencia: 10 minutos.`;
      this.mensaje(
        "Cotización lista. Revisa el total antes de confirmar.",
        "success",
      );
    } catch (error) {
      if (revision === this.#revision) {
        document.getElementById("quoteStatus").textContent =
          "No se pudo cotizar. Puedes reintentar; no se registró ningún pedido.";
        this.mensaje(error.message);
      }
    } finally {
      this.#cotizando = false;
      this.render();
    }
  }
  /**
   * Traduce el formulario a datos de entrada y presenta el recibo del caso de uso.
   * @param {SubmitEvent} event Envío del formulario.
   * @returns {Promise<void>} Resultado mostrado en la interfaz.
   */
  async confirmar(event) {
    event.preventDefault();
    if (this.#busy || this.#completado) return;
    if (!this.#form.reportValidity()) return;
    this.#busy = true;
    const fields = new FormData(this.#form);
    this.#form
      .querySelectorAll("input,select,textarea,button")
      .forEach((field) => {
        field.disabled = true;
      });
    this.render();
    try {
      const result = await this.#checkout.confirmar(
        getCartModel(),
        {
          fullName: fields.get("fullName"),
          email: fields.get("email"),
          phone: fields.get("phone"),
          city: fields.get("city"),
          address: fields.get("address"),
          neighborhood: fields.get("neighborhood"),
          consent: fields.get("consent") === "on",
          note: fields.get("deliveryNote"),
          method: fields.get("paymentMethod"),
          currency: fields.get("currency"),
          payment: {
            confirmOnDelivery: fields.get("confirmOnDelivery") === "on",
            acknowledgePendingTransfer: fields.get("acknowledgePendingTransfer") === "on",
            lastFour: fields.get("lastFour"),
            expiry: fields.get("expiry"),
            bank: fields.get("bank"),
            accountType: fields.get("accountType"),
            phone: fields.get("nequiPhone"),
          },
        },
        this.#quote,
      );
      this.#receipt = result.transaccion;
      this.#completado = true;
      // Do not offer a second submission after a successful backend response, even if storage is full.
      this.#quote = null;
      let warning = result.advertencia;
      try {
        if (result.pedido)
          localStorage.setItem("farmagest-last-order", result.pedido);
        clearCart();
      } catch {
        warning +=
          " No se pudo limpiar el carrito local; evita repetir el pedido.";
      }
      this.recibo(result.transaccion);
      this.historial();
      this.#form.reset();
      this.mensaje(
        `${result.pedido ? `Pedido ${result.pedido} registrado; pago pendiente.` : "Simulación completada: no se realizó ningún cobro ni se envió un pedido."} ${warning}`,
        warning ? "error" : "success",
      );
      document
        .getElementById("receiptSection")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      this.mensaje(error.message);
    } finally {
      this.#busy = false;
      this.#form
        .querySelectorAll("input,select,textarea,button")
        .forEach((field) => {
          field.disabled = false;
        });
      this.render();
    }
  }
  /**
   * Presenta una instantánea del recibo sin recalcular su tasa ni sus importes.
   * @param {Transaccion} transaction Recibo validado del caso de uso o historial.
   * @returns {void}
   */
  recibo(transaction) {
    const data = transaction.toJSON(),
      quote = data.cotizacion;
    const conversion = quote.moneda === "COP" ? "" : ` / ${new Intl.NumberFormat("es-CO", { style: "currency", currency: quote.moneda }).format(quote.convertido)}`;
    const target = document.getElementById("receiptContent");
    target.innerHTML = `<p><strong>${data.estado === "simulada" ? "COMPRA SIMULADA - SIN COBRO" : "PEDIDO REGISTRADO - PAGO PENDIENTE"}</strong></p>
      <dl class="receipt-grid"><div><dt>Identificador</dt><dd>${escapeHtml(data.id)}</dd></div><div><dt>Fecha</dt><dd>${escapeHtml(new Date(data.fecha).toLocaleString("es-CO"))}</dd></div>
      <div><dt>Pedido</dt><dd>${escapeHtml(data.pedido || "Simulación local")}</dd></div><div><dt>Medio validado (simulado)</dt><dd>${escapeHtml(data.metodo)}</dd></div></dl>
      <ul>${data.items.map((item) => `<li>${escapeHtml(item.name)} · ${item.quantity} × ${formatCurrency(item.price)}</li>`).join("")}</ul>
      <p>Subtotal: ${formatCurrency(quote.subtotal)} · Envío: ${formatCurrency(quote.envio)} · Comisión ilustrativa: ${formatCurrency(quote.comision)}</p>
      <p><strong>Total: ${formatCurrency(quote.total)}</strong>${conversion}</p>
      <p>Tasa fijada: ${escapeHtml(quote.tasa)} ${escapeHtml(quote.moneda)}/COP. Fuente: ${escapeHtml(quote.fuenteTasa)}. Fecha: ${escapeHtml(new Date(quote.fechaTasa).toLocaleString("es-CO"))}. ${quote.respaldoClima ? "Clima de respaldo." : "Clima consultado."}</p>`;
    document.getElementById("receiptSection").hidden = false;
    document.getElementById("newPurchaseLink").href = data.estado === "simulada"
      ? "./products.html?modo=demo" : "./products.html";
  }
  historial() {
    const target = document.getElementById("transactionHistory");
    target.replaceChildren();
    const transactions = this.#historial.listar();
    if (!transactions.length) {
      target.textContent = "Aún no hay recibos guardados en este navegador.";
      return;
    }
    for (const transaction of transactions) {
      const data = transaction.toJSON();
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${new Date(data.fecha).toLocaleString("es-CO")} · ${data.pedido || "Simulación"} · ${formatCurrency(transaction.total)}`;
      button.addEventListener("click", () => {
        this.#receipt = transaction;
        this.#completado = !getCartModel().cantidad;
        this.recibo(transaction);
        this.render();
        document.getElementById("receiptSection").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      target.append(button);
    }
  }
  descargar() {
    if (!this.#receipt) return;
    const blob = new Blob([JSON.stringify(this.#receipt.toJSON(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = `recibo-${this.#receipt.id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  /**
   * Conecta eventos y recupera el estado sin ejecutar reglas monetarias en la vista.
   * @returns {Promise<void>} Interfaz lista para la interacción.
   */
  async iniciar() {
    if (!this.#form) return;
    const city = this.#form.elements.city;
    for (const destination of ServicioEnvio.destinos)
      city.add(new Option(destination.nombre, destination.nombre));
    this.#form.addEventListener("submit", (event) => this.confirmar(event));
    for (const field of ["city", "currency", "paymentMethod"]) {
      const element = this.#form.elements[field];
      // RadioNodeList has no addEventListener.
      const controls = element instanceof Element ? [element] : [...element];
      controls.forEach((control) =>
        control.addEventListener("change", () => {
          this.invalidar();
          this.pagos();
        }),
      );
    }
    document
      .getElementById("quoteButton")
      .addEventListener("click", () => this.cotizar());
    document
      .getElementById("downloadReceipt")
      .addEventListener("click", () => this.descargar());
    window.addEventListener("cartchange", () => this.invalidar());
    window.addEventListener("cartmessage", (event) => this.mensaje(event.detail));
    window.addEventListener("storage", () => {
      this.invalidar();
      this.historial();
    });
    this.render();
    this.historial();
    await hydrateCart();
    if (!getCartModel().cantidad) {
      const last = this.#historial.listar()[0];
      if (last) {
        this.#receipt = last;
        this.#completado = true;
        this.recibo(last);
      }
    }
    this.render();
  }
}
