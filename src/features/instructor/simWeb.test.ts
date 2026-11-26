import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { anulaPorAp, esSimWeb, TITULO_SIM_WEB } from "./simWeb.ts";

const m = (x: Partial<Muestra> = {}): Muestra => ({
  t: 0, inclinacion: 0, altitud: 8000, velocidad: 90, rumbo: 0, bola: 0, agl: 3000, peso: 5500,
  enTierra: false, slew: false, tasa: 1, pausa: false, titulo: TITULO_SIM_WEB, autopiloto: true, ...x,
});

test("el título del simulador web cabe en la columna avion (20)", () => {
  assert.ok(TITULO_SIM_WEB.length <= 20);
  assert.equal(esSimWeb(m()), true);
  assert.equal(esSimWeb(m({ titulo: "Cessna Skyhawk" })), false);
});

test("anulaPorAp: solo web, checkride, AP que mueve y en el aire", () => {
  assert.equal(anulaPorAp(m(), "checkride"), true);
  assert.equal(anulaPorAp(m(), "practica"), false);
  assert.equal(anulaPorAp(m({ enTierra: true }), "checkride"), false);
  assert.equal(anulaPorAp(m({ autopiloto: false }), "checkride"), false);
  assert.equal(anulaPorAp(m({ titulo: "Cessna Skyhawk" }), "checkride"), false);
});
