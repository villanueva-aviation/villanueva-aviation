import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { ES_V15, revisar, ventana } from "./revisionSim.ts";
import { AVIONES_VOZ } from "../../data/checklistVozAviones.ts";

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

test("las velocidades esperan 45 s y el ralenti 30 s", () => {
  assert.deepEqual(ventana("vel-aproximacion"), { antes: 0, despues: 45 });
  assert.deepEqual(ventana("vel-ascenso"), { antes: 0, despues: 45 });
  assert.deepEqual(ventana("ralenti"), { antes: 0, despues: 30 });
});

const C152 = { elevacionFt: null, limites: AVIONES_VOZ.c152.limites };
const ARROW = { elevacionFt: null, limites: AVIONES_VOZ.arrow.limites };

test("rpm de la prueba de motor por avion: 1,800 en el C172, 1,700 en el C152, 2,000 en el Arrow", () => {
  assert.equal(revisar("rpm-prueba", [con({ rpm: 1800 })], sin)?.ok, true);
  assert.equal(revisar("rpm-prueba", [con({ rpm: 1700 })], C152)?.ok, true);
  assert.equal(revisar("rpm-prueba", [con({ rpm: 1850 })], C152)?.ok, false);
  assert.equal(revisar("rpm-prueba", [con({ rpm: 2000 })], ARROW)?.ok, true);
  assert.equal(revisar("rpm-prueba", [con({ rpm: 1800 })], ARROW)?.ok, false);
});

test("magnetos: caida de 140 cumple en el C172 y no en el C152; 170 cumple en el Arrow", () => {
  const ms = (caida: number) => mags([[true, true, 2000], [true, false, 2000 - caida], [true, true, 2000], [false, true, 2000 - caida], [true, true, 2000]]);
  assert.equal(revisar("magnetos", ms(140), sin)?.ok, true);
  assert.equal(revisar("magnetos", ms(140), C152)?.ok, false);
  assert.equal(revisar("magnetos", ms(170), ARROW)?.ok, true);
  assert.equal(revisar("magnetos", ms(170), sin)?.ok, false);
});

test("velocidades por avion: ascenso, crucero y aproximacion", () => {
  const vuelo = (c: Partial<Muestra>) => [con({ enTierra: false, ...c })];
  assert.equal(revisar("vel-ascenso", vuelo({ velocidad: 62 }), C152)?.ok, true);
  assert.equal(revisar("vel-ascenso", vuelo({ velocidad: 62 }), sin)?.ok, false);
  assert.equal(revisar("vel-ascenso", vuelo({ velocidad: 92 }), ARROW)?.ok, true);
  assert.equal(revisar("potencia-crucero", [con({ rpm: 2000 })], C152)?.ok, true);
  assert.equal(revisar("potencia-crucero", [con({ rpm: 2000 })], sin)?.ok, false);
  assert.equal(revisar("vel-aproximacion", vuelo({ velocidad: 75, flaps: 3 }), ARROW)?.ok, true);
  assert.equal(revisar("vel-aproximacion", vuelo({ velocidad: 75, flaps: 0 }), ARROW)?.ok, false);
  assert.equal(revisar("vel-aproximacion", vuelo({ velocidad: 58, flaps: 2 }), C152)?.ok, true);
});

test("freno de estacionamiento quitado", () => {
  assert.equal(revisar("freno-quitado", [con({ freno: false })], ARROW)?.ok, true);
  assert.equal(revisar("freno-quitado", [con({ freno: true })], ARROW)?.ok, false);
});

test("tren arriba y abajo con la palanca", () => {
  assert.equal(revisar("tren-arriba", [con({ tren: false })], ARROW)?.ok, true);
  assert.equal(revisar("tren-arriba", [con({ tren: true })], ARROW)?.ok, false);
  assert.equal(revisar("tren-abajo", [con({ tren: true })], ARROW)?.ok, true);
});

test("acelerador media pulgada, 1,000 rpm, calentamiento y acelerador atras", () => {
  assert.equal(revisar("acelerador-media", [con({ acelerador: 22 })], sin)?.ok, true);
  assert.equal(revisar("acelerador-media", [con({ acelerador: 30 })], sin)?.ok, false);
  assert.equal(revisar("rpm-1000", [con({ rpm: 1000, acelerador: 8 })], sin)?.ok, true);
  assert.equal(revisar("rpm-1000", [con({ rpm: 1200 })], sin)?.ok, false);
  assert.equal(revisar("rpm-calentamiento", [con({ rpm: 1450 })], sin)?.ok, true);
  assert.equal(revisar("rpm-calentamiento", [con({ rpm: 1200 })], sin)?.ok, false);
  assert.equal(revisar("acelerador-cerrado", [con({ acelerador: 2 })], sin)?.ok, true);
  assert.equal(revisar("acelerador-cerrado", [con({ acelerador: 10 })], sin)?.ok, false);
});
