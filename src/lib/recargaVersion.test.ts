import { test } from "node:test";
import assert from "node:assert/strict";
import { debeRecargar } from "./recargaVersion.ts";

test("recarga si nunca se había recargado", () => {
  assert.equal(debeRecargar(null, 1_000_000), true);
});

test("no recarga dos veces seguidas (evita un ciclo si el archivo de verdad falta)", () => {
  assert.equal(debeRecargar(1_000_000, 1_005_000), false);
});

test("vuelve a recargar si pasó más de un minuto (otra publicación)", () => {
  assert.equal(debeRecargar(1_000_000, 1_061_000), true);
});
