import { test } from "node:test";
import assert from "node:assert/strict";
import { ajustarFrecuencia, alcanceNm, guiaGps, recibirNav } from "./radios.ts";
import type { Vor } from "./datos.ts";

const cerca = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b} ±${tol}`);
const vor = (o: Partial<Vor> = {}): Vor => ({ ident: "TST", nombre: "Prueba", lat: 20, lon: -100, mhz: 117.5, dme: true, decl: 0, elevFt: 0, ...o });
// Punto a `nm` millas del VOR en el radial verdadero `rad`.
const enRadial = (v: Vor, rad: number, nm: number, altFt = 5000) => {
  const r = (rad * Math.PI) / 180;
  return { lat: v.lat + (nm * Math.cos(r)) / 60, lon: v.lon + (nm * Math.sin(r)) / (60 * Math.cos((v.lat * Math.PI) / 180)), altFt };
};

test("radial 090 al este del VOR, FROM con OBS 090 y TO con OBS 270", () => {
  const v = vor();
  const l = recibirNav(117.5, 90, enRadial(v, 90, 10), [v])!;
  cerca(l.radial, 90, 0.5);
  assert.equal(l.desde, true);
  cerca(l.desvGrados, 0, 0.5);
  assert.equal(recibirNav(117.5, 270, enRadial(v, 90, 10), [v])!.desde, false);
});

test("desviación: en el radial 095 con OBS 090 el curso queda a la izquierda", () => {
  const v = vor();
  cerca(recibirNav(117.5, 90, enRadial(v, 95, 10), [v])!.desvGrados, -5, 0.3);
  cerca(recibirNav(117.5, 90, enRadial(v, 85, 10), [v])!.desvGrados, 5, 0.3);
  // TO: OBS 270 en el radial 085 (al norte de la línea), el curso queda a la izquierda.
  cerca(recibirNav(117.5, 270, enRadial(v, 85, 10), [v])!.desvGrados, -5, 0.3);
});

test("el radial es magnético: declinación 5° este", () => {
  const v = vor({ decl: 5 });
  cerca(recibirNav(117.5, 85, enRadial(v, 90, 10), [v])!.radial, 85, 0.5);
});

test("alcance por línea de vista", () => {
  const v = vor();
  cerca(alcanceNm(5000, 0), 87, 1);
  assert.equal(alcanceNm(100000, 0), 130);
  assert.equal(recibirNav(117.5, 90, enRadial(v, 90, 80, 1000), [v]), null);
  assert.ok(recibirNav(117.5, 90, enRadial(v, 90, 60, 5000), [v]));
  assert.equal(recibirNav(113.0, 90, enRadial(v, 90, 10), [v]), null);
});

test("dos VOR con la misma frecuencia: recibe el más cercano", () => {
  const a = vor({ ident: "AAA" });
  const b = vor({ ident: "BBB", lat: 20 + 60 / 60 });
  // 20 NM al sur de A, 80 de B.
  const l = recibirNav(117.5, 0, enRadial(a, 180, 20, 9000), [b, a])!;
  assert.equal(l.vor.ident, "AAA");
});

test("DME: oblicua si el VOR tiene DME, null si no", () => {
  const v = vor();
  const l = recibirNav(117.5, 90, enRadial(v, 90, 10, 6076 * 3), [v])!;
  cerca(l.distNm, 10, 0.05);
  cerca(l.dmeNm!, Math.hypot(10, 3), 0.05);
  assert.equal(recibirNav(117.5, 90, enRadial(vor({ dme: false }), 90, 10), [vor({ dme: false })])!.dmeNm, null);
});

test("ajustarFrecuencia lleva al canal válido más cercano", () => {
  assert.equal(ajustarFrecuencia(117.97, "nav"), 117.95);
  assert.equal(ajustarFrecuencia(107, "nav"), 108);
  assert.equal(ajustarFrecuencia(118.012, "com"), 118.0);
  assert.equal(ajustarFrecuencia(140, "com"), 136.975);
  assert.equal(ajustarFrecuencia(121.9, "com"), 121.9);
});

test("guiaGps: 1 NM al este de una línea al norte → curso a la izquierda", () => {
  const destino = { lat: 20 + 10 / 60, lon: -100 };
  const pos = { lat: 20, lon: -100 + 1 / (60 * Math.cos((20 * Math.PI) / 180)), altFt: 5000 };
  const g = guiaGps(pos, destino, 360);
  cerca(g.xtkNm, -1, 0.05);
  cerca(g.distNm, 10, 0.1);
  assert.equal(g.curso, 360);
});

test("guiaVor da el curso verdadero (OBS + declinación) y el xtk con el signo de la barra", async () => {
  const { guiaVor } = await import("./radios.ts");
  const v = vor({ decl: 5 });
  const l = recibirNav(117.5, 85, enRadial(v, 95, 10), [v])!;
  const g = guiaVor(l, 85);
  assert.equal(g.curso, 90);
  cerca(g.xtkNm, -10 * Math.sin((5 * Math.PI) / 180), 0.05);
});
