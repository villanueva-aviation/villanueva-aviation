import { test } from "node:test";
import assert from "node:assert/strict";
import type { AeropuertoAtis } from "./datos.ts";
import type { Atis } from "./generado.ts";
import { pausaTras } from "./motorAudio.ts";
import { alcanceNm, debeCambiar, distanciaNm, entraSiguiente, mezclaPorDistancia, offsetLoop, sintonizado } from "./radio.ts";

const cerca = (a: number, b: number, tol: number) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);
const ap = (icao: string, lat: number, lon: number, atisMhz = [127.9]): AeropuertoAtis =>
  ({ icao, nombreEs: icao, nombreEn: icao, lat, lon, elevFt: 0, atisMhz, pistas: [] });

test("distanciaNm: un grado de latitud son ~60 NM", () => {
  cerca(distanciaNm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 }), 60.04, 0.05);
});

test("alcanceNm", () => {
  cerca(alcanceNm(0), 8.7, 0.05);
  cerca(alcanceNm(5000), 95.67, 0.05);
});

test("mezclaPorDistancia", () => {
  assert.deepEqual(mezclaPorDistancia(10, 100, null), { voz: 0.8, ruido: 0.012, tremolo: 0 });
  assert.deepEqual(mezclaPorDistancia(95, 100, null), { voz: 0.55, ruido: 0.05, tremolo: 0.35 });
  const m = mezclaPorDistancia(65, 100, null)!;
  cerca(m.voz, 0.675, 0.001); cerca(m.ruido, 0.031, 0.001); cerca(m.tremolo, 0.175, 0.001);
  assert.equal(mezclaPorDistancia(101, 100, null), null);
  const h = mezclaPorDistancia(10, 100, 0.5)!;
  cerca(h.voz, 0.4, 1e-9); cerca(h.ruido, 0.006, 1e-9); assert.equal(h.tremolo, 0);
});

test("sintonizado: tolerancia de frecuencia", () => {
  const mmgl = ap("MMGL", 20.52, -103.31);
  const pos = { lat: 20.52, lon: -103.31, aglFt: 0 };
  const com = (mhz: number, escucha = true) => ({ mhz, escucha, volumen: null });
  assert.equal(sintonizado(com(127.9), pos, [mmgl])?.ap.icao, "MMGL");
  assert.equal(sintonizado(com(127.905), pos, [mmgl])?.ap.icao, "MMGL");
  assert.equal(sintonizado(com(127.91), pos, [mmgl]), null);
  assert.equal(sintonizado(com(127.9, false), pos, [mmgl]), null);
});

test("sintonizado: gana el más cercano dentro de alcance", () => {
  const lejos = ap("LEJO", 1, 0); // ~60 NM
  const near = ap("CERC", 20 / 60, 0); // ~20 NM
  const com = { mhz: 127.9, escucha: true, volumen: null };
  const alto = { lat: 0, lon: 0, aglFt: 5000 }; // alcance ~95
  const r = sintonizado(com, alto, [lejos, near])!;
  assert.equal(r.ap.icao, "CERC");
  cerca(r.distNm, 20, 0.1);
  assert.equal(sintonizado(com, { lat: 0, lon: 0, aglFt: 0 }, [lejos, near]), null);
});

test("offsetLoop", () => {
  assert.equal(offsetLoop(1_000_000 + 100_000, 1_000_000, 30), 4);
});

test("entraSiguiente: el segundo cambio de letra también cae en la pausa", () => {
  // Loop de 10 s + 2 s de pausa, fase 0 en la hora del METAR (0).
  assert.equal(entraSiguiente(false, 5_000, 0, 10), true); // nada suena: entra ya
  assert.equal(entraSiguiente(true, 5_000, 0, 10), false); // a media voz
  assert.equal(entraSiguiente(true, 10_500, 0, 10), true); // primer cambio, en la pausa
  // Tras el cambio la fase 0 es 10 500. A los 22 500 la nueva va a 12 s = inicio: no hay pausa.
  assert.equal(entraSiguiente(true, 22_500, 10_500, 10), false);
  assert.equal(entraSiguiente(true, 21_000, 10_500, 10), true); // segundo cambio, en su pausa
});

test("debeCambiar", () => {
  const a: Atis = { icao: "MMGL", letra: "A", inicioMs: 0, partes: [] };
  assert.equal(debeCambiar(null, a), true);
  assert.equal(debeCambiar(a, { ...a, inicioMs: 5 }), false);
  assert.equal(debeCambiar(a, { ...a, letra: "B" }), true);
  assert.equal(debeCambiar(a, { ...a, icao: "MMMX" }), true);
});

test("pausaTras", () => {
  assert.equal(pausaTras("dos,"), 0.22);
  assert.equal(pausaTras("Delta."), 0.45);
});
