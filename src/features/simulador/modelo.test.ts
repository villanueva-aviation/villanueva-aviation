import { test } from "node:test";
import assert from "node:assert/strict";
import { H135 } from "./ficha.ts";
import { enPlataforma, paso, potenciaRequerida, sigma, type Estado, type Objetivos, type Viento } from "./modelo.ts";

const DT = 0.02;
const CALMA: Viento = { dir: 0, kt: 0 };
const volar = (e: Estado, o: Objetivos, s: number, viento = CALMA, suelo = -1000) => {
  for (let i = 0; i < s / DT; i++) e = paso(e, o, H135, viento, suelo, DT);
  return e;
};
// Vuelo recto y nivelado de equilibrio a `ias` y `alt`.
const crucero = (ias: number, alt: number): { e: Estado; o: Objetivos } => {
  const tas = ias / Math.sqrt(sigma(alt));
  const cabeceo = 5 - tas / 8;
  const colectivo = potenciaRequerida(H135, ias) / sigma(alt) ** 1.2;
  const e: Estado = { lat: 20, lon: -103, altFt: alt, ias, gs: tas, vs: 0, cabeceo, inclinacion: 0, rumboV: 0, track: 0, vLat: 0, colectivo, enTierra: false, bola: 0 };
  return { e, o: { cabeceo, inclinacion: 0, colectivo, pedales: 0 } };
};

test("crucero estable a 120 kt y 5,000 ft durante 60 s", () => {
  const { e, o } = crucero(120, 5000);
  const f = volar(e, o, 60);
  assert.ok(Math.abs(f.altFt - 5000) <= 50, `alt ${f.altFt}`);
  assert.ok(Math.abs(f.ias - 120) <= 3, `ias ${f.ias}`);
});

test("viraje coordinado de 25° a 120 kt: entre 3.8 y 4.6 °/s", () => {
  const { e, o } = crucero(120, 5000);
  const a = volar(e, { ...o, inclinacion: 25 }, 5);
  const b = volar(a, { ...o, inclinacion: 25 }, 10);
  const rot = (((b.rumboV - a.rumboV) % 360) + 360) % 360 / 10;
  assert.ok(rot >= 3.8 && rot <= 4.6, `rot ${rot}`);
});

test("cabeceo −20° sostenido no pasa de 1.05·VNE", () => {
  const { e } = crucero(120, 10000);
  const f = volar(e, { cabeceo: -20, inclinacion: 0, colectivo: 1, pedales: 0 }, 120);
  assert.ok(f.ias <= 1.05 * 150 + 0.01, `ias ${f.ias}`);
  assert.ok(f.ias > 140, `ias ${f.ias}`);
});

test("despega de la plataforma con colectivo 0.7 y sube", () => {
  const e = enPlataforma(20, -103, 0, 90);
  assert.equal(e.enTierra, true);
  const f = volar(e, { cabeceo: 0, inclinacion: 0, colectivo: 0.7, pedales: 0 }, 30, CALMA, 0);
  assert.equal(f.enTierra, false);
  assert.ok(f.vs > 300, `vs ${f.vs}`);
  assert.ok(f.altFt > 50, `alt ${f.altFt}`);
});

test("en tierra con colectivo 0.3 no se mueve", () => {
  const e = enPlataforma(20, -103, 5016, 90);
  const f = volar(e, { cabeceo: -10, inclinacion: 10, colectivo: 0.3, pedales: 1 }, 10, { dir: 270, kt: 20 }, 5016);
  assert.equal(f.enTierra, true);
  assert.equal(f.altFt, 5016);
  assert.equal(f.lat, 20);
  assert.equal(f.lon, -103);
  assert.equal(f.rumboV, 90);
});

test("viento 270/20 con rumbo 360 a 100 kt: track ≈ 011", () => {
  const { e, o } = crucero(100, 0);
  const f = volar(e, o, 5, { dir: 270, kt: 20 });
  assert.ok(Math.abs(f.track - 11.3) < 1, `track ${f.track}`);
  assert.ok(Math.abs(f.gs - Math.hypot(100, 20)) < 1, `gs ${f.gs}`);
});

test("techo: a 22,000 ft con colectivo 1 y 70 kt sube menos de 300 ft/min", () => {
  const { e, o } = crucero(70, 22000);
  const f = volar(e, { ...o, colectivo: 1 }, 20);
  assert.ok(f.vs < 300, `vs ${f.vs}`);
});

test("suelo de respaldo: no baja de 5,016 ft", () => {
  const { e, o } = crucero(60, 5100);
  const f = volar(e, { ...o, colectivo: 0 }, 60, CALMA, 5016);
  assert.ok(f.altFt >= 5016, `alt ${f.altFt}`);
  assert.equal(f.enTierra, true);
});
