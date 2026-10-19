import { test } from "node:test";
import assert from "node:assert/strict";
import { AEROPUERTOS, RUTAS, bloque, millas } from "./redRutas.ts";

test("distancias ortodrómicas conocidas", () => {
  assert.ok(Math.abs(millas("MMGL", "KJFK") - 1930) < 10);
  assert.ok(Math.abs(millas("EGLL", "LEMD") - 673) < 10);
  assert.equal(Math.round(millas("MMGL", "MMGL")), 0);
});

test("la vuelta al mundo cierra en Guadalajara, en 18 tramos encadenados y al alcance del 737", () => {
  const vuelta = RUTAS.filter((r) => r.red === "vuelta");
  assert.equal(vuelta.length, 18);
  assert.equal(vuelta[0].desde, "MMGL");
  assert.equal(vuelta.at(-1)!.hasta, "MMGL");
  vuelta.slice(1).forEach((r, i) => assert.equal(r.desde, vuelta[i].hasta));
  vuelta.forEach((r) => assert.ok(millas(r.desde, r.hasta) < 2500, `${r.desde}-${r.hasta}`));
});

test("cada ruta usa aeropuertos conocidos", () => {
  RUTAS.forEach((r) => assert.ok(AEROPUERTOS[r.desde] && AEROPUERTOS[r.hasta], `${r.desde}-${r.hasta}`));
});

test("tiempo de bloque", () => {
  assert.equal(bloque({ id: 0, red: "vuelta", desde: "MMGL", hasta: "KJFK" }), "4 h 42");
});
