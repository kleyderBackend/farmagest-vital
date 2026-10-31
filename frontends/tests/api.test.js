import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveApiUrl, LOCAL_API_URL, PRODUCTION_API_URL } from "../js/api-config.js";
const local = { protocol: "http:", hostname: "localhost" };
const published = { protocol: "https:", hostname: "kleyderbackend.github.io" };

test("la API distingue local, Apache, IPv6 y la web publicada", () => {
  for (const hostname of ["localhost", "127.0.0.1", "[::1]"]) {
    assert.equal(resolveApiUrl({ ...local, hostname }), LOCAL_API_URL);
  }
  assert.equal(resolveApiUrl(published), PRODUCTION_API_URL);
  assert.equal(resolveApiUrl(local, PRODUCTION_API_URL), PRODUCTION_API_URL);
});
test("la web pública ignora localhost obsoleto y preferencias inválidas", () => {
  for (const url of [LOCAL_API_URL, "http://[::1]:3000/api", "javascript:alert(1)", "no-url", "https://user:secret@example.com/api"]) {
    assert.equal(resolveApiUrl(published, url), PRODUCTION_API_URL);
  }
  assert.equal(resolveApiUrl(local, "no-url"), LOCAL_API_URL);
  assert.equal(resolveApiUrl(local, "http://localhost:4000/api/"), "http://localhost:4000/api");
});
test("los errores de red no cambian de base y el seguimiento envía correo sin token", async () => {
  const previous = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  const data = new Map([["token", "local-token"]]);
  globalThis.window = { location: local };
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, removeItem: key => data.delete(key) };
  const requests = [];
  try {
    const { apiRequest, getUser } = await import("../js/api.js?test=local");
    globalThis.fetch = async (url, options) => {
      requests.push({ url, options });
      throw new TypeError("Network error");
    };
    await assert.rejects(apiRequest("/orders/tracking/FV-000002", { auth: false, method: "POST", body: JSON.stringify({ email: "test@example.com" }) }), { code: "API_UNAVAILABLE" });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, LOCAL_API_URL + "/orders/tracking/FV-000002");
    assert.equal(requests[0].options.headers.Authorization, undefined);
    assert.equal(JSON.parse(requests[0].options.body).email, "test@example.com");
    assert.equal(requests[0].options.auth, undefined);
    globalThis.fetch = async () => new Response(JSON.stringify({ message: "Correo o pedido incorrecto" }), { status: 404 });
    await assert.rejects(apiRequest("/orders/tracking/2", { auth: false }), /Correo o pedido incorrecto/);
    data.set("user", "broken-json");
    assert.equal(getUser(), null);
    assert.equal(data.has("token"), false);
  } finally {
    Object.assign(globalThis, previous);
  }
});
test("Render informa sus fallos sin recomendar localhost y respeta cancelación", async () => {
  const previous = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  globalThis.window = { location: published };
  globalThis.localStorage = { getItem: () => null };
  globalThis.fetch = async () => { throw new TypeError("Network error"); };
  try {
    const { apiRequest } = await import("../js/api.js?test=render");
    await assert.rejects(apiRequest("/products", { auth: false }), { code: "API_UNAVAILABLE" });
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = async (_url, { signal }) => { throw signal.reason; };
    await assert.rejects(apiRequest("/products", { signal: controller.signal }), { name: "AbortError" });
    globalThis.fetch = async () => new Response("not-json");
    await assert.rejects(apiRequest("/products"), /respuesta inválida/);
  } finally {
    Object.assign(globalThis, previous);
  }
});
