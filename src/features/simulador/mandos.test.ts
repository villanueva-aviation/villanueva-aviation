import { test } from "node:test";
import assert from "node:assert/strict";
import { H135 } from "./ficha.ts";
import { aObjetivos, aplicarRaton, avanzarTeclado, MANTENER, tocados, type Mandos } from "./mandos.ts";

const cerca = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const m0: Mandos = { cx: 0, cy: 0, colectivo: 0.5, pedales: 0 };
const durante = (m: Mandos, teclas: string[], s: number) => {
  for (let i = 0; i < Math.round(s / 0.02); i++) m = avanzarTeclado(m, new Set(teclas), 0.02);
  return m;
};

test("las flechas mueven el cíclico y al soltar vuelve a 0 sin pasarse", () => {
  const a = durante(m0, ["ArrowLeft"], 0.5);
  cerca(a.cx, -0.75);
  cerca(durante(a, [], 0.5).cx, 0);
});

test("el cíclico adelante/atrás se queda donde lo dejas (hace de compensador)", () => {
  const a = durante(m0, ["ArrowUp"], 0.5);
  cerca(a.cy, 0.75);
  cerca(durante(a, [], 1).cy, 0.75);
  cerca(durante(a, ["KeyC"], 0.02).cy, 0);
});

test("el colectivo con Re Pág se queda donde lo dejas", () => {
  const a = durante(m0, ["PageUp"], 1);
  cerca(a.colectivo, 0.8);
  cerca(durante(a, [], 1).colectivo, 0.8);
  cerca(durante(m0, ["PageDown"], 5).colectivo, 0);
});

test("pedales con Z/X vuelven a 0 al soltar y C centra el cíclico", () => {
  const a = durante(m0, ["KeyX"], 0.24);
  cerca(a.pedales, 0.48);
  cerca(durante(a, [], 0.5).pedales, 0);
  cerca(durante({ ...m0, cx: 0.6, cy: -0.4 }, ["KeyC", MANTENER], 0.02).cx, 0);
});

test("con el ratón o las palancas táctiles (MANTENER) el cíclico no vuelve solo al centro", () => {
  const a = durante({ ...m0, cx: 0.4, pedales: 0.3 }, [MANTENER], 1);
  cerca(a.cx, 0.4);
  cerca(a.pedales, 0.3);
});

test("ratón: 0.004 por píxel, rueda 0.02 por clic, botón derecho = pedales", () => {
  cerca(aplicarRaton(m0, 100, 0, 0, false).cx, 0.4);
  cerca(aplicarRaton(m0, 0, -100, 0, false).cy, 0.4);
  cerca(aplicarRaton(m0, 0, 0, 3, false).colectivo, 0.56);
  const p = aplicarRaton(m0, 100, 0, 0, true);
  cerca(p.pedales, 0.4);
  cerca(p.cx, 0);
  cerca(aplicarRaton(m0, 1000, 0, 0, false).cx, 1);
});

test("aObjetivos convierte a grados de la ficha", () => {
  assert.equal(aObjetivos({ ...m0, cy: 1 }, H135).cabeceo, -20);
  assert.equal(aObjetivos({ ...m0, cy: -1 }, H135).cabeceo, 15);
  assert.equal(aObjetivos({ ...m0, cx: 1 }, H135).inclinacion, 30);
  assert.equal(aObjetivos(m0, H135).colectivo, 0.5);
});

test("tocados marca solo el eje que cambió", () => {
  assert.deepEqual(tocados(m0, { ...m0, cx: 0.1 }), { lat: true, lon: false, col: false, ped: false });
  assert.deepEqual(tocados(m0, { ...m0, colectivo: 0.502 }), { lat: false, lon: false, col: true, ped: false });
  assert.deepEqual(tocados(m0, { ...m0 }), { lat: false, lon: false, col: false, ped: false });
  assert.deepEqual(tocados(m0, { ...m0, cy: -0.05, colectivo: 0.6 }), { lat: false, lon: true, col: true, ped: false });
});
