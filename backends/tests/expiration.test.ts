import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error The frontend is plain JavaScript.
import { expirationStatus } from "../../frontends/js/inventory-utils.js";

test("vencimientos distingue fechas pasadas, hoy, límite de 30 días y fechas lejanas", () => {
  const today = new Date(2026, 9, 15, 12);
  assert.equal(expirationStatus("2026-10-14", today), "expired");
  assert.equal(expirationStatus("2026-10-15", today), "soon");
  assert.equal(expirationStatus("2026-11-14", today), "soon");
  assert.equal(expirationStatus("2026-11-15", today), "valid");
  assert.equal(expirationStatus(null, today), "none");
});
