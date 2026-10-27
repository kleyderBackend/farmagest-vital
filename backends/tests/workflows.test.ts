import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../src/config/db";
import { app } from "../app";
import { createMovementService } from "../src/modules/inventory/services/create-movement.service";
import { updateOrderStatusService, trackOrderByCodeService } from "../src/modules/orders/services/order.service";
import { createSaleService } from "../src/modules/sales/services/create-sales.service";
import { validateTransition } from "../src/modules/orders/utils/order-policy";
import { registerUser } from "../src/modules/auth/register/register.service";
import { updateUserService } from "../src/modules/users/services/update-user.service";
import { CheckoutQuoteService } from "../src/modules/sales/services/checkout-quote.service";
import type { CheckoutQuote } from "../src/modules/sales/checkout.type";

// A transactional test double: tests exercise services, repositories and HTTP handlers.
// It deliberately rejects unknown SQL. Real database checks remain a separate integration step.
let state: any;
let failure = "";
let transactionQueue = Promise.resolve();
const originalQuery = pool.query;
const originalConnection = pool.getConnection;
const previousSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = "farmagest-test-secret-only";

async function query(sql: string, values: any[] = []): Promise<[any, any]> {
  const q = sql.replace(/\s+/g, " ").trim().toLowerCase();
  if (failure && q.includes(failure)) throw new Error("Fallo simulado de persistencia");
  const rows = (data: any) => [structuredClone(data), []] as [any, any];
  if (q.startsWith("select") && q.includes("from products")) return rows(state.products.filter((p: any) => p.product_id === Number(values[0])));
  if (q.startsWith("select") && q.includes("from customers")) return rows(state.customers.filter((c: any) => q.includes("email =") ? c.email === values[0] : c.customer_id === Number(values[0])));
  if (q.startsWith("select") && q.includes("from users")) {
    if (q.includes("role = 'admin'")) return rows(state.users.filter((u: any) => u.role === "admin" && u.is_active));
    const users = state.users.filter((u: any) => q.includes("email =") ? u.email === values[0] : u.user_id === Number(values[0]));
    return rows(users.map((user: any) => {
      const result = { ...user };
      if (!q.includes("password_hash")) delete result.password_hash;
      return result;
    }));
  }
  if (q.startsWith("select") && q.includes("from order_items")) return rows(state.items.filter((i: any) => q.includes("order_item_id =") ? i.order_item_id === values[0] : i.order_id === values[0]));
  if (q.startsWith("select") && q.includes("from orders")) {
    return rows(state.orders.filter((o: any) => o.order_id === values[0]).map((o: any) => ({ ...o,
      customer_email: state.customers[0].email, customer_name: "Cliente de prueba", customer_phone: "123", customer_address: "Dirección privada" })));
  }
  if (q.startsWith("insert into inventory_movements")) {
    state.movements.push({ productId: values[0], userId: values[1], type: values[2], quantity: values[3], reason: values[4] });
    return rows({ insertId: state.movements.length });
  }
  if (q.startsWith("insert into users")) {
    const user_id = state.users.length + 1;
    state.users.push({ user_id, full_name: values[0], email: values[1], password_hash: values[2], role: values[3], is_active: values[4] });
    return rows({ insertId: user_id });
  }
  if (q.startsWith("update users")) {
    const user = state.users.find((u: any) => u.user_id === values[5]);
    Object.assign(user, { full_name: values[0], email: values[1], role: values[2], is_active: values[3] });
    if (values[4]) user.password_hash = values[4];
    return rows({ affectedRows: 1 });
  }
  if (q.startsWith("insert into orders")) {
    const order_id = state.orders.length + 1;
    state.orders.push({ order_id, customer_id: values[0], total: values[1], status: values[2] });
    return rows({ insertId: order_id });
  }
  if (q.startsWith("insert into order_items")) {
    const order_item_id = state.items.length + 1;
    state.items.push({ order_item_id, order_id: values[0], product_id: values[1], quantity: values[2], unit_price: values[3], subtotal: values[4] });
    return rows({ insertId: order_item_id });
  }
  if (q.startsWith("update products")) {
    const product = state.products.find((p: any) => p.product_id === Number(values[1]));
    if (q.includes("current_stock -")) product.current_stock -= Number(values[0]);
    else if (q.includes("current_stock +")) product.current_stock += Number(values[0]);
    else product.current_stock = Number(values[0]);
    return rows({ affectedRows: 1 });
  }
  if (q.startsWith("update orders")) {
    const order = state.orders.find((o: any) => o.order_id === values[1]);
    if (q.includes("set status")) order.status = values[0];
    else order.total = values[0];
    return rows({ affectedRows: 1 });
  }
  throw new Error(`SQL no previsto en la prueba: ${q}`);
}

pool.query = query;
pool.getConnection = async () => {
  let unlock!: () => void;
  const previous = transactionQueue;
  transactionQueue = new Promise<void>((resolve) => { unlock = resolve; });
  await previous;
  const snapshot = structuredClone(state);
  return { query, beginTransaction: async () => {}, commit: async () => {},
    rollback: async () => { state = snapshot; }, release: () => unlock() };
};

beforeEach(() => {
  failure = "";
  state = {
    products: [{ product_id: 1, name: "Producto", current_stock: 10, minimum_stock: 2, sale_price: "1000", is_active: true, is_available: true, expiration_date: null }],
    users: [{ user_id: 1, role: "admin", is_active: true, email: "admin@test.example" }],
    customers: [{ customer_id: 1, email: "cliente@test.example" }],
    orders: [{ order_id: 1, customer_id: 1, status: "pending", total: 2000 }],
    items: [{ order_item_id: 1, order_id: 1, product_id: 1, quantity: 2 }], movements: [],
  };
});
after(() => {
  pool.query = originalQuery;
  pool.getConnection = originalConnection;
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

test("entradas, salidas y ajustes registran responsable y stock final", async () => {
  const base = { productId: 1, userId: 1, reason: "Conteo físico" };
  await createMovementService({ ...base, type: "in", quantity: 3 });
  await createMovementService({ ...base, type: "out", quantity: 2 });
  await createMovementService({ ...base, type: "adjustment", quantity: 0 });
  assert.equal(state.products[0].current_stock, 0);
  assert.equal(state.movements.length, 3);
  assert.equal(state.movements[2].quantity, 11);
  assert.match(state.movements[2].reason, /11 → 0/);
  assert.equal(state.movements[2].userId, 1);
});

test("rechaza stock insuficiente y cantidades fraccionarias sin cambios", async () => {
  const base = { productId: 1, userId: 1, reason: "Salida de prueba", type: "out" as const };
  await assert.rejects(createMovementService({ ...base, quantity: 11 }), /insuficiente/);
  await assert.rejects(createMovementService({ ...base, quantity: 0.5 }), /cantidad entera/);
  assert.equal(state.products[0].current_stock, 10);
  assert.equal(state.movements.length, 0);
});

test("un fallo al guardar el movimiento revierte el stock", async () => {
  failure = "insert into inventory_movements";
  await assert.rejects(createMovementService({ productId: 1, userId: 1, reason: "Prueba rollback", type: "in", quantity: 2 }));
  assert.equal(state.products[0].current_stock, 10);
});

test("cancelaciones repetidas y concurrentes devuelven stock una sola vez", async () => {
  await Promise.all([1, 2].map(() => updateOrderStatusService({ orderId: 1, userId: 1, status: "cancelled" })));
  assert.equal(state.products[0].current_stock, 12);
  assert.equal(state.movements.length, 1);
  assert.equal(state.orders[0].status, "cancelled");
  await assert.rejects(updateOrderStatusService({ orderId: 1, userId: 1, status: "preparing" }), /no está permitido/);
});

test("fallo durante cancelación revierte pedido, stock y movimientos", async () => {
  failure = "update orders";
  await assert.rejects(updateOrderStatusService({ orderId: 1, userId: 1, status: "cancelled" }));
  assert.equal(state.products[0].current_stock, 10);
  assert.equal(state.orders[0].status, "pending");
  assert.equal(state.movements.length, 0);
});

test("solo permite avanzar por los estados definidos", () => {
  validateTransition("pending", "preparing");
  validateTransition("processing", "on_the_way");
  validateTransition("on_the_way", "delivered");
  assert.throws(() => validateTransition("pending", "delivered"));
  assert.throws(() => validateTransition("delivered", "cancelled"));
});

test("checkout usa precio del servidor, descuenta stock y registra salida", async () => {
  const result = await createSaleService({ customerId: 1, items: [{ productId: 1, quantity: 3 }] });
  assert.equal(result.total, 3000);
  assert.equal(state.products[0].current_stock, 7);
  assert.equal(state.movements[0].type, "out");
  assert.equal(state.movements[0].userId, null);
});

test("checkout sin stock o con producto vencido no deja pedidos parciales", async () => {
  await assert.rejects(createSaleService({ customerId: 1, items: [{ productId: 1, quantity: 11 }] }), /insuficiente/);
  state.products[0].expiration_date = "2000-01-01";
  await assert.rejects(createSaleService({ customerId: 1, items: [{ productId: 1, quantity: 1 }] }), /vencido/);
  assert.equal(state.orders.length, 1);
  assert.equal(state.products[0].current_stock, 10);
});

test("un producto que vence hoy todavía puede comprarse", async () => {
  const today = new Date();
  state.products[0].expiration_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const result = await createSaleService({ customerId: 1, items: [{ productId: 1, quantity: 1 }] });
  assert.equal(result.total, 1000);
});

const signedQuoteData = (): CheckoutQuote => ({
  subtotal: 2000, envio: 5000, comision: 203, total: 7203, tasa: 0.00025, moneda: "USD", ciudad: "Bogotá", metodo: "card",
  fechaTasa: new Date().toISOString(), fuenteTasa: "Prueba", expiresAt: Date.now() + 600000,
  items: [{ productId: 1, quantity: 2, price: 1000 }],
});

test("cotización firmada exige firma, ámbito, vigencia y ciudad correctos", () => {
  const quote = signedQuoteData();
  const token = jwt.sign({ scope: "checkout-quote", quote }, process.env.JWT_SECRET!);
  assert.equal(CheckoutQuoteService.verificar(token, "Bogota").total, 7203);
  assert.throws(() => CheckoutQuoteService.verificar(token, "Cali"));
  assert.throws(() => CheckoutQuoteService.verificar(token + "modificado", "Bogotá"));
  assert.throws(() => CheckoutQuoteService.verificar(jwt.sign({ scope: "other", quote }, process.env.JWT_SECRET!), "Bogotá"));
  assert.throws(() => CheckoutQuoteService.verificar(jwt.sign({ scope: "checkout-quote", quote: { ...quote, expiresAt: 1 } }, process.env.JWT_SECRET!), "Bogotá"));
});

test("pedido con cotización agrega envío y comisión calculados por el servidor", async () => {
  const result = await createSaleService({ customerId: 1, items: [{ productId: 1, quantity: 2 }], checkoutQuote: signedQuoteData() });
  assert.equal(result.total, 7203);
  assert.equal(state.products[0].current_stock, 8);
  assert.match(state.orders[1].status, /pending/);
});

test("cambio de precio después de cotizar revierte el pedido sin descontar stock", async () => {
  state.products[0].sale_price = "1500";
  await assert.rejects(createSaleService({ customerId: 1, items: [{ productId: 1, quantity: 2 }], checkoutQuote: signedQuoteData() }), /precio/);
  assert.equal(state.products[0].current_stock, 10);
  assert.equal(state.orders.length, 1);
  assert.equal(state.movements.length, 0);
});

test("seguimiento exige coincidencia del correo", async () => {
  assert.equal(await trackOrderByCodeService("FV-000001", "otro@test.example"), null);
  assert.equal((await trackOrderByCodeService("FV-000001", "CLIENTE@test.example"))?.order_id, 1);
});

test("usuarios rechaza roles y contraseñas inválidas y protege al propio admin", async () => {
  await assert.rejects(registerUser({ fullName: "Test", email: "test@example.com", password: "corta" }), /inválidos/);
  await assert.rejects(updateUserService({ userId: 1, actorId: 1, fullName: "Admin", email: "admin@test.example", role: "staff", isActive: true }), /propia cuenta/);
});

test("crea y edita un usuario conservando el hash cuando no cambia la contraseña", async () => {
  const user = await registerUser({ fullName: "Personal", email: "PERSONAL@test.example", password: "contraseña de prueba", isActive: false });
  assert.equal(user.email, "personal@test.example");
  assert.equal(user.password_hash, undefined);
  assert.equal(user.is_active, false);
  const savedHash = state.users[1].password_hash;
  assert.equal(await bcrypt.compare("contraseña de prueba", savedHash), true);
  await updateUserService({ userId: 2, actorId: 1, fullName: "Personal actualizado", email: "personal@test.example", role: "staff", isActive: true });
  assert.equal(state.users[1].is_active, true);
  assert.equal(state.users[1].password_hash, savedHash);
});

test("HTTP protege usuarios, registro, inventario y datos de seguimiento", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/api`;
  try {
    for (const route of ["/users", "/inventory"]) assert.equal((await fetch(base + route)).status, 401);
    assert.equal((await fetch(base + "/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "admin" }) })).status, 401);
    assert.equal((await fetch(base + "/orders/tracking/FV-000001")).status, 401);
    const missing = await fetch(base + "/orders/tracking/FV-000001", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.equal(missing.status, 400);
    const wrong = await fetch(base + "/orders/tracking/FV-000001", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "other@test.example" }) });
    assert.equal(wrong.status, 404);
    const response = await fetch(base + "/orders/tracking/FV-000001", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "cliente@test.example" }) });
    const tracking: any = (await response.json()).data.tracking;
    assert.equal(response.status, 200);
    assert.equal(tracking.customerEmail, undefined);
    assert.equal(tracking.customerPhone, undefined);
    const token = jwt.sign({ userId: "1", role: "admin" }, process.env.JWT_SECRET!);
    state.users[0].role = "staff";
    assert.equal((await fetch(base + "/users", { headers: { Authorization: `Bearer ${token}` } })).status, 403);
    state.users[0].is_active = false;
    assert.equal((await fetch(base + "/inventory", { headers: { Authorization: `Bearer ${token}` } })).status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("HTTP checkout exige consentimiento y firma antes de registrar el pedido", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/sales/checkout`;
  const quoteToken = jwt.sign({ scope: "checkout-quote", quote: signedQuoteData() }, process.env.JWT_SECRET!);
  const body = {
    customer: { fullName: "Cliente de prueba", email: "cliente@test.example", phone: "3000000000" },
    delivery: { city: "Bogotá", address: "Dirección de prueba" },
    items: [{ productId: 1, quantity: 2 }],
    quoteToken,
    consent: true,
  };
  const send = (data: unknown) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  try {
    assert.equal((await send({ ...body, consent: false })).status, 400);
    assert.equal((await send({ ...body, quoteToken: quoteToken + "alterado" })).status, 400);
    assert.equal((await send({ ...body, items: [...body.items, ...body.items] })).status, 400);
    assert.equal(state.orders.length, 1);
    const response = await send(body);
    const result: any = await response.json();
    assert.equal(response.status, 201);
    assert.equal(result.data.sale.total, 7203);
    assert.equal(result.data.sale.status, "pending");
    assert.equal(result.data.sale.customer, undefined);
    assert.equal(state.products[0].current_stock, 8);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
