import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { declinacion, distanciaVor, elegirVor, leerVors, vorsCercanos, type VorSim } from "./vorSim.ts";

const muestra = (x: Partial<Muestra> = {}): Muestra => ({
  t: 0, inclinacion: 0, altitud: 6500, velocidad: 100, rumbo: 90, bola: 0, agl: 1500, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk", lat: 20.52, lon: -103.31, ...x,
});

const vor = (ident: string, lat: number, lon: number, dme = true): VorSim => ({ ident, region: "MM", lat, lon, mhz: 117.5, dme });

test("leerVors se queda con los VOR bien formados", () => {
  const vs = leerVors([{ ident: "GDL", region: "MM", lat: 20.52, lon: -103.31, mhz: 117.5, dme: true }, { ident: 3 }, null]);
  assert.equal(vs.length, 1);
  assert.equal(vs[0].ident, "GDL");
  assert.deepEqual(leerVors(null), []);
});

test("vorsCercanos: a 60 NM o menos, del más cercano al más lejano; más de 40 NM es vuelo largo", () => {
  const cerca = vor("GDL", 20.52, -103.31);
  const lejos = vor("TLC", 19.34, -99.57);
  const a45 = vor("X45", 20.52 + 45 / 60, -103.31);
  const r = vorsCercanos([a45, lejos, cerca], 20.52, -103.31);
  assert.deepEqual(r.map((v) => v.ident), ["GDL", "X45"]);
  assert.equal(r[0].largo, false);
  assert.equal(r[1].largo, true);
  assert.ok(Math.abs(r[1].nm - 45) < 0.1);
});

test("declinacion: verdadero menos magnético, entre -180 y 180", () => {
  assert.equal(declinacion(muestra({ rumbo: 350, rumboV: 5 })), 15);
  assert.equal(declinacion(muestra({ rumbo: 10, rumboV: 5 })), -5);
  assert.equal(declinacion(muestra({ rumboV: undefined })), 0);
});

test("elegirVor guarda la declinación del momento", () => {
  const v = elegirVor(vor("GDL", 20.52, -103.31), muestra({ rumbo: 90, rumboV: 95 }));
  assert.equal(v.decl, 5);
  assert.equal(v.ident, "GDL");
});

test("distanciaVor: millas por lat/lon; sin posición, null", () => {
  const m = { lat: 20.1, lon: -103 } as Muestra;
  const d = distanciaVor(m, { lat: 20, lon: -103 });
  assert.ok(d !== null && Math.abs(d - 6) < 0.05, `d ${d}`);
  assert.equal(distanciaVor({} as Muestra, { lat: 20, lon: -103 }), null);
});
