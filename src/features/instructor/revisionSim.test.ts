import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { ES_V15, revisar, ventana } from "./revisionSim.ts";

const base: Muestra = { ...simularVuelo()[0], avionica: false, selector: 1, valvula: true, bomba: false, autopiloto: false, trim: 0 };
const con = (c: Partial<Muestra>): Muestra => ({ ...base, ...c });
const sin = { elevacionFt: null };

test("acelerador un cuarto: 12 cumple, 25 no", () => {
  assert.equal(revisar("acelerador-cuarto", [con({ acelerador: 12 })], sin)?.ok, true);
  assert.equal(revisar("acelerador-cuarto", [con({ acelerador: 25 })], sin)?.ok, false);
});

test("mezcla del aeropuerto: a 5,016 ft pide empobrecida", () => {
  const ctx = { elevacionFt: 5016 };
  assert.equal(revisar("mezcla-aeropuerto", [con({ mezcla: 90 })], ctx)?.ok, true);
  assert.equal(revisar("mezcla-aeropuerto", [con({ mezcla: 100 })], ctx)?.ok, false);
});

test("mezcla del aeropuerto: a 20 ft pide rica", () => {
  const ctx = { elevacionFt: 20 };
  assert.equal(revisar("mezcla-aeropuerto", [con({ mezcla: 90 })], ctx)?.ok, true);
  assert.equal(revisar("mezcla-aeropuerto", [con({ mezcla: 70 })], ctx)?.ok, false);
});

test("altimetro a 0.02 del QNH cumple, a 0.05 no", () => {
  assert.equal(revisar("altimetro", [con({ altimetro: 30.03, qnh: 30.01 })], sin)?.ok, true);
  assert.equal(revisar("altimetro", [con({ altimetro: 30.06, qnh: 30.01 })], sin)?.ok, false);
});

test("ralenti: 1,000 rpm con acelerador cerrado cumple, 1,100 no", () => {
  assert.equal(revisar("ralenti", [con({ acelerador: 0, rpm: 1000 })], sin)?.ok, true);
  assert.equal(revisar("ralenti", [con({ acelerador: 0, rpm: 1100 })], sin)?.ok, false);
});

test("velocidad de aproximacion depende de los flaps", () => {
  assert.equal(revisar("vel-aproximacion", [con({ velocidad: 68, flaps: 2, enTierra: false })], sin)?.ok, true);
  assert.equal(revisar("vel-aproximacion", [con({ velocidad: 62, flaps: 0, enTierra: false })], sin)?.ok, false);
});

const mags = (pasos: [boolean, boolean, number][]) =>
  pasos.map(([izq, der, rpm], i) => con({ t: i, magIzq: izq, magDer: der, rpm, motor: true }));

test("magnetos: caidas de 100 y 120 cumplen", () => {
  const ms = mags([[true, true, 1800], [true, false, 1700], [true, true, 1800], [false, true, 1680], [true, true, 1800]]);
  assert.equal(revisar("magnetos", ms, sin)?.ok, true);
});

test("magnetos: caida de 180 no cumple y dice cuanto", () => {
  const ms = mags([[true, true, 1800], [true, false, 1620], [true, true, 1800], [false, true, 1700], [true, true, 1800]]);
  const r = revisar("magnetos", ms, sin);
  assert.equal(r?.ok, false);
  assert.ok(r?.detalle?.includes("180"));
});

test("magnetos: sin ver el derecho no cumple", () => {
  const ms = mags([[true, true, 1800], [true, false, 1700], [true, true, 1800]]);
  assert.equal(revisar("magnetos", ms, sin)?.ok, false);
});

test("sin el campo v1.5 regresa null", () => {
  const { avionica: _, ...viejo } = base;
  assert.equal(revisar("avionica-on", [viejo], sin), null);
});

test("ES_V15 tiene 9 revisiones", () => {
  assert.equal(ES_V15.size, 9);
});

test("ventana del arranque es 30 s", () => {
  assert.deepEqual(ventana("arranque-motor"), { antes: 0, despues: 30 });
  assert.deepEqual(ventana("magnetos"), { antes: 15, despues: 30 });
  assert.deepEqual(ventana("freno"), { antes: 0, despues: 10 });
});

test("trim de despegue calibrado en MSFS: 7.4 cumple, 20 y -5 no", () => {
  assert.equal(revisar("trim-despegue", [con({ trim: 7.4 })], sin)?.ok, true);
  assert.equal(revisar("trim-despegue", [con({ trim: 20 })], sin)?.ok, false);
  assert.equal(revisar("trim-despegue", [con({ trim: -5 })], sin)?.ok, false);
});
