import assert from "node:assert/strict";
import { test } from "node:test";
import { distanciaNm, formatoDuracion, resumenAventura } from "./calculos.ts";
import type { VueloAventura } from "./aventura.ts";

test("distanciaNm: Guadalajara a Ciudad de México ronda las 248 NM", () => {
  const nm = distanciaNm(20.5233, -103.3101, 19.4363, -99.0721);
  assert.ok(nm >= 245 && nm <= 251, `salió ${nm}`);
});

test("distanciaNm: el mismo punto es cero", () => {
  assert.equal(distanciaNm(20.5, -103.3, 20.5, -103.3), 0);
});

test("formatoDuracion", () => {
  assert.equal(formatoDuracion(45), "45 min");
  assert.equal(formatoDuracion(125), "2 h 05 min");
  assert.equal(formatoDuracion(60), "1 h 00 min");
});

test("resumenAventura cuenta cada aeropuerto una sola vez", () => {
  const v = (o: string, d: string, minutos: number, nm: number) =>
    ({ origen_icao: o, destino_icao: d, minutos, distancia_nm: nm }) as VueloAventura;
  const r = resumenAventura([v("MMGL", "MMMX", 60, 285), v("MMMX", "MMPB", 20, 60)]);
  assert.deepEqual(r, { vuelos: 2, aeropuertos: 3, minutos: 80, nm: 345 });
});
