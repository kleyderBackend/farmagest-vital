import assert from "node:assert/strict";
import { test } from "node:test";
import { Producto } from "../js/models/Producto.js";
import { Carrito } from "../js/models/Carrito.js";
import { Usuario } from "../js/models/Usuario.js";
import { Cliente } from "../js/models/Cliente.js";
import { MedioPago } from "../js/models/pagos/MedioPago.js";
import { FabricaPago } from "../js/services/FabricaPago.js";
import { ServicioDivisas } from "../js/services/ServicioDivisas.js";
import { ServicioClima } from "../js/services/ServicioClima.js";
import { ServicioEnvio } from "../js/services/ServicioEnvio.js";
import { ServicioCotizacion } from "../js/services/ServicioCotizacion.js";
import { ServicioHistorial } from "../js/services/ServicioHistorial.js";
import { ServicioCatalogo } from "../js/services/ServicioCatalogo.js";
import { HttpJSON } from "../js/services/HttpJSON.js";
import { Checkout } from "../js/services/Checkout.js";
import { Transaccion } from "../js/models/Transaccion.js";
import { Cotizacion } from "../js/models/Cotizacion.js";

const producto = (demo = true, overrides = {}) => new Producto({ id: 1, name: "Producto de prueba", price: 10000, stock: 5, available: true, isDemo: demo, ...overrides });
const carrito = (demo = true) => new Carrito().agregar(producto(demo), 2);
const opciones = { ciudad: "Bogotá", moneda: "USD", metodo: "card" };
const cliente = { fullName: "Cliente de prueba", email: "prueba@example.com", phone: "3000000000", city: "Bogotá", address: "Dirección ficticia", neighborhood: "Barrio de prueba", consent: true,
  method: "card", currency: "USD", payment: { lastFour: "1234", expiry: "2099-12" } };
const memoria = () => {
  const entries = new Map();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), entries };
};
const cotizador = () => new ServicioCotizacion(new ServicioDivisas({ consultar: async () => {
  throw new Error("Servicio caído");
} }), new ServicioEnvio(new ServicioClima({ consultar: async () => { throw new Error("Servicio caído"); } })));

test("Producto protege estado privado y no permite precios o cantidades inválidos", () => {
  const product = producto();
  assert.deepEqual(Object.keys(product), []);
  assert.throws(() => { product.price = -2; }, TypeError);
  assert.throws(() => product.cambiarPrecio(-1));
  assert.throws(() => product.validarCantidad(6), /Stock/);
  product.reservar(2);
  assert.equal(product.stock, 3);
  const copy = product.toJSON(); copy.stock = 500;
  assert.equal(product.stock, 3);
});

test("Carrito compone líneas, controla stock y no mezcla demo con productos reales", () => {
  const cart = carrito();
  assert.equal(cart.subtotal, 20000);
  assert.throws(() => cart.agregar(producto(), -1));
  assert.throws(() => cart.agregar(producto(), 4), /Stock/);
  assert.throws(() => cart.agregar(producto(false)), /Vacía/);
  const external = cart.items; external[0].cambiarCantidad(1);
  assert.equal(cart.cantidad, 2);
  cart.cambiarCantidad(1, 99); assert.equal(cart.cantidad, 5);
  const restored = Carrito.desdeJSON(JSON.parse(JSON.stringify(cart)));
  assert.equal(restored.subtotal, 50000);
  cart.quitar(1); assert.equal(cart.cantidad, 0);
});

test("Cliente hereda de Usuario, valida correo y exige consentimiento", () => {
  assert.throws(() => new Usuario("Nombre", "test@example.com"), /abstracta/);
  const user = new Cliente(cliente);
  assert.equal(user instanceof Usuario, true);
  assert.match(user.presentarse(), /Cliente:/);
  assert.throws(() => new Cliente({ ...cliente, consent: false }), /Autoriza/);
  assert.throws(() => new Cliente({ ...cliente, email: "incorrecto" }), /Correo/);
});

test("el modelo resuelve subtotales decimales y límites al ajustar unidades", () => {
  const cart = new Carrito().agregar(producto(true, { price: 10.15, stock: 3 }));
  cart.ajustarCantidad(1, -1);
  assert.equal(cart.cantidad, 1);
  cart.ajustarCantidad(1, 1);
  assert.equal(cart.items[0].subtotal, 20.3);
  cart.ajustarCantidad(1, 10);
  assert.equal(cart.cantidad, 3);
  assert.equal(cart.subtotal, 30.45);
  assert.throws(() => cart.ajustarCantidad(1, 0.5), /variación/);
  assert.throws(() => cart.ajustarCantidad(1, 0), /variación/);
  assert.equal(cart.cantidad, 3);
});

test("recuperación del carrito conserva líneas válidas e informa cada descarte", () => {
  const valid = carrito().toJSON()[0];
  const restored = Carrito.desdeJSON([valid, null, { ...valid, quantity: 99 }, { ...valid, quantity: 0 }]);
  assert.equal(restored.cantidad, 2);
  assert.equal(restored.advertencias.length, 3);
  assert.match(restored.advertencias[1], /Línea 3.*Stock/);
  const external = restored.advertencias;
  external.length = 0;
  assert.equal(restored.advertencias.length, 3);
  assert.equal(Carrito.desdeJSON({}).advertencias.length, 1);
  assert.equal(Carrito.desdeJSON(restored.toJSON()).advertencias.length, 0);
});

test("contra entrega y transferencia exigen confirmación explícita del pago pendiente", () => {
  for (const [tipo, datos] of [["cash", { confirmOnDelivery: true }], ["transfer", { acknowledgePendingTransfer: true }]]) {
    assert.throws(() => FabricaPago.crear(tipo).procesar(10000), /Confirma/);
    const campo = Object.keys(datos)[0];
    assert.throws(() => FabricaPago.crear(tipo, { [campo]: "true" }).procesar(10000), /Confirma/);
    const medio = FabricaPago.crear(tipo, datos);
    assert.equal(medio.validarDatos(), true);
    assert.deepEqual(medio.procesar(10000), { metodo: medio.nombre, comision: 0, simulado: true });
  }
});

test("el mismo procesar aplica polimorfismo a Tarjeta, PSE y Nequi", () => {
  assert.throws(() => new MedioPago("Base"), /abstracta/);
  const medios = [FabricaPago.crear("card", cliente.payment), FabricaPago.crear("pse", { bank: "bancolombia", accountType: "ahorros" }), FabricaPago.crear("nequi", { phone: "3000000000" })];
  assert.deepEqual(medios.map((medio) => medio.procesar(100000).comision), [2900, 1500, 0]);
  for (const medio of medios) assert.equal(medio.procesar(10000).simulado, true);
  assert.throws(() => FabricaPago.crear("card", { lastFour: "1234", expiry: "2000-01" }).procesar(1000), /vencida/);
  assert.throws(() => FabricaPago.crear("pse").procesar(1000));
  assert.throws(() => FabricaPago.crear("nequi", { phone: "incorrecto" }).procesar(1000));
});

test("las divisas usan API y caché; el fallo devuelve una tasa marcada como respaldo", async () => {
  let requests = 0;
  const divisas = new ServicioDivisas({ consultar: async () => { requests++; return { result: "success", base_code: "USD", rates: { USD: 1, COP: 4000, EUR: 0.9 }, time_last_update_unix: 1700000000 }; } });
  assert.equal((await divisas.consultar("USD")).tasa, 1 / 4000);
  assert.equal((await divisas.consultar("EUR")).tasa, 0.9 / 4000);
  assert.equal(requests, 1);
  const fallback = await new ServicioDivisas({ consultar: async () => { throw new Error("Fallo"); } }).consultar("USD");
  assert.equal(fallback.respaldo, true);
  assert.match(fallback.fuente, /ilustrativo/);
});

test("el clima modifica el envío y los fallos no bloquean la cotización", async () => {
  const clima = new ServicioClima({ consultar: async () => ({ current: { precipitation: 2, weather_code: 61 } }) });
  const envio = new ServicioEnvio(clima);
  const quote = await envio.cotizar("Medellín", 20000);
  assert.equal(quote.km, 0); assert.equal(quote.costo, 7000);
  assert.equal((await envio.cotizar("Medellín", 250000)).costo, 0);
  const fallback = new ServicioEnvio(new ServicioClima({ consultar: async () => { throw new Error("Fallo"); } }));
  const backup = await fallback.cotizar("Medellín", 20000);
  assert.equal(backup.costo, 5000); assert.equal(backup.respaldo, true);
  assert.throws(() => ServicioEnvio.destino("Ciudad inexistente"));
});

test("HTTP aplica tiempo límite y rechaza respuestas de error", async () => {
  const bound = new HttpJSON(function () {
    assert.equal(this, globalThis);
    return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
  });
  assert.deepEqual(await bound.consultar("https://example.com"), { ok: true });
  const hanging = new HttpJSON(() => new Promise(() => {}));
  await assert.rejects(hanging.consultar("https://example.com", 5), /agotado/);
  await assert.rejects(new HttpJSON(async () => ({ ok: false, status: 503 })).consultar("https://example.com"), /503/);
});

test("el catálogo JSON crea instancias Producto y no consulta el backend en demo", async () => {
  const service = new ServicioCatalogo(() => { throw new Error("No se consulta backend"); }, { consultar: async () => [producto().toJSON()] });
  const items = await service.listar(true);
  assert.equal(items[0] instanceof Producto, true);
  assert.equal(items[0].isDemo, true);
  assert.equal((await service.buscar(1, true)).id, 1);
});

test("cotización se invalida al cambiar cantidades, moneda, ciudad o al vencer", async () => {
  const cart = carrito(), quote = await cotizador().cotizar(cart, opciones);
  assert.equal(quote.coincide(cart, opciones), true);
  assert.equal(quote.coincide(cart, { ...opciones, moneda: "EUR" }), false);
  assert.equal(quote.coincide(cart, { ...opciones, ciudad: "Cali" }), false);
  assert.equal(quote.coincide(cart, { ...opciones, metodo: "pse" }), false);
  const vencida = new Cotizacion({ ...quote.toJSON(), expiresAt: Date.now() - 1 });
  assert.equal(vencida.coincide(cart, opciones), false);
  cart.cambiarCantidad(1, 3); assert.equal(quote.coincide(cart, opciones), false);
});

test("simulación completa guarda recibo inmutable sin datos personales o bancarios", async () => {
  const storage = memoria(), historial = new ServicioHistorial(storage);
  const checkout = new Checkout({ request: () => { throw new Error("No enviar un pedido demo"); }, historial, cotizador: cotizador() });
  const cart = carrito(), quote = await checkout.cotizar(cart, opciones);
  const result = await checkout.confirmar(cart, cliente, quote);
  assert.equal(result.pedido, null);
  assert.equal(result.transaccion.toJSON().estado, "simulada");
  const original = result.transaccion.toJSON();
  const modified = result.transaccion.toJSON(); modified.cotizacion.total = 1;
  assert.equal(result.transaccion.total, original.cotizacion.total);
  const loaded = historial.listar()[0];
  assert.equal(loaded instanceof Transaccion, true);
  assert.deepEqual(loaded.toJSON(), original);
  const raw = [...storage.entries.values()][0];
  assert.doesNotMatch(raw, /1234|prueba@example.com|3000000000|Dirección ficticia|lastFour|expiry/);
});

test("pedido real envía solo datos autorizados, token y productos; nunca datos de pago", async () => {
  const cart = carrito(false), cotizacion = await cotizador().cotizar(cart, opciones);
  const calls = [];
  const checkout = new Checkout({ historial: new ServicioHistorial(memoria()), request: async (path, options) => {
    calls.push({ path, body: JSON.parse(options.body) });
    if (path === "/sales/quote") return { data: { cotizacion: cotizacion.toJSON(), token: "firma-servidor" } };
    return { data: { sale: { order_id: 7, total: cotizacion.total } } };
  } });
  const quote = await checkout.cotizar(cart, opciones);
  const result = await checkout.confirmar(cart, cliente, quote);
  assert.equal(result.pedido, "FV-000007");
  assert.equal(result.transaccion.toJSON().estado, "pedido_pendiente");
  assert.equal(calls[1].body.quoteToken, "firma-servidor");
  assert.equal(calls[1].body.consent, true);
  assert.doesNotMatch(JSON.stringify(calls), /1234|2099|lastFour|expiry|nequiPhone/);
});

test("fallo del backend conserva carrito y no inventa una transacción exitosa", async () => {
  const cart = carrito(false), cotizacion = await cotizador().cotizar(cart, opciones);
  const historial = new ServicioHistorial(memoria());
  const checkout = new Checkout({ historial, request: async () => { throw new Error("Backend caído"); } });
  await assert.rejects(checkout.confirmar(cart, cliente, { cotizacion, demo: false, token: "token" }), /Backend/);
  assert.equal(cart.cantidad, 2); assert.equal(historial.listar().length, 0);
});

test("historial con almacenamiento bloqueado no convierte una compra confirmada en fallo", async () => {
  const checkout = new Checkout({ request: () => {}, historial: { guardar() { throw new Error("Sin espacio"); } }, cotizador: cotizador() });
  const cart = carrito(); const quote = await checkout.cotizar(cart, opciones);
  const result = await checkout.confirmar(cart, cliente, quote);
  assert.equal(result.transaccion instanceof Transaccion, true);
  assert.match(result.advertencia, /no permitió/);
});
