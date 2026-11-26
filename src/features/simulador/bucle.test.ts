import { test } from "node:test";
import assert from "node:assert/strict";
import { aNm, rumbo } from "../home/navGeo.ts";
import { avanzar, inicio, pasosPendientes } from "./bucle.ts";
import type { Vor } from "./datos.ts";

const nada = new Set<string>();
const sinSuelo = () => null;
const gdl = { lat: 20.5218, lon: -103.3112, elevFt: 5016, rumboV: 100 };
const vor: Vor = { ident: "GDL", nombre: "Guadalajara", lat: 20.5234, lon: -103.312, mhz: 117.3, dme: true, decl: 7.3, elevFt: 5016 };

test("pasosPendientes acota el tiempo real a 0.1 s (pestaña oculta)", () => {
  assert.deepEqual(pasosPendientes(0, 5), { pasos: 5, resto: 0 });
  const r = pasosPendientes(0.015, 0.01);
  assert.equal(r.pasos, 1);
  assert.ok(Math.abs(r.resto - 0.005) < 1e-9);
});

test("en la plataforma sin teclas se queda quieto en tierra", () => {
  let s = inicio(gdl);
  assert.equal(s.e.enTierra, true);
  for (let i = 0; i < 200; i++) s = avanzar(s, nada, [vor], sinSuelo, 5016, 7.3);
  assert.equal(s.e.enTierra, true);
  const d = aNm(s.e.lat, s.e.lon, gdl.lat, gdl.lon);
  assert.ok(Math.hypot(d.x, d.y) * 1852 < 10);
});

test("en el aire empieza a 10 NM del VOR con rumbo hacia él", () => {
  const s = inicio(gdl, { vor, distNm: 10, altFt: 8000 });
  const p = aNm(s.e.lat, s.e.lon, vor.lat, vor.lon);
  assert.ok(Math.abs(Math.hypot(p.x, p.y) - 10) <= 0.1);
  const alVor = rumbo(p, { x: 0, y: 0 });
  assert.ok(Math.abs(alVor - s.e.rumboV) <= 1, `${alVor} vs ${s.e.rumboV}`);
  assert.equal(s.e.altFt, 8000);
  assert.equal(s.e.enTierra, false);
  assert.equal(s.radios.nav1[0], 117.3);
});

test("en el aire sin tocar nada sostiene más o menos la altitud y la velocidad", () => {
  let s = inicio(gdl, { vor, distNm: 10, altFt: 8000 });
  const ias = s.e.ias;
  for (let i = 0; i < 30 / 0.02; i++) s = avanzar(s, nada, [vor], sinSuelo, 5016, 7.3);
  assert.ok(Math.abs(s.e.altFt - 8000) < 100, `alt ${s.e.altFt}`);
  assert.ok(Math.abs(s.e.ias - ias) < 5, `ias ${s.e.ias}`);
});

test("sin terreno el suelo es el de respaldo", () => {
  let s = inicio(gdl, { vor, distNm: 10, altFt: 5300 });
  s = { ...s, mandos: { ...s.mandos, colectivo: 0 } };
  for (let i = 0; i < 60 / 0.02; i++) s = avanzar(s, nada, [vor], sinSuelo, 5016, 7.3);
  assert.equal(s.e.altFt, 5016);
  assert.equal(s.e.enTierra, true);
});

test("en pausa no avanza", () => {
  const s = { ...inicio(gdl, { vor, distNm: 10, altFt: 8000 }), pausa: true };
  assert.equal(avanzar(s, nada, [vor], sinSuelo, 5016, 7.3), s);
});

test("NAV con el AP vuela el radial del NAV1", () => {
  let s = inicio(gdl, { vor, distNm: 10, altFt: 8000 });
  // Rumbo al VOR desde el sur: radial 180 magnético aprox. Curso 360 TO.
  s = { ...s, radios: { ...s.radios, obs: Math.round((s.e.rumboV - 7.3 + 360) % 360) } };
  s = { ...s, ap: { ...s.ap, ap: true, lat: "NAV", vert: "ALT", ref: { cabeceo: 0, inclinacion: 0, altFt: 8000 } } };
  for (let i = 0; i < 60 / 0.02; i++) s = avanzar(s, nada, [vor], sinSuelo, 5016, 7.3);
  assert.equal(s.ap.lat, "NAV");
  assert.equal(s.ap.aviso, null);
});
