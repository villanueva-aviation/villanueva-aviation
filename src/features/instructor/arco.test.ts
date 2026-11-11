import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { avanzarArco, iniciarArco, MOTIVO_SIN_DME, type EvaluacionArco } from "./evaluadorArco.ts";
import { generarArco, type EjercicioArco } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import { briefingArco } from "./textosArco.ts";

// Simulador local: solo importan el radial, el DME y el rumbo. Arco de 10 NM del radial 090 al 150, alejándose al entrar.
const EJ: EjercicioArco = { radioNm: 10, desde: 90, hasta: 150, sentido: 1, alejandose: true };
const base = (t: number, radial: number, dme: number, rumbo: number, extra: Partial<Muestra> = {}): Muestra => ({
  t, inclinacion: 0, altitud: 5000, velocidad: 100, rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 330, navRadial: ((radial % 360) + 360) % 360, navDesv: 0, navDesde: 1, navDme: dme,
  navTieneDme: true, navSenal: true, gpsNav: false, ...extra,
});

type Paso = [radial: number, dme: number, rumbo: number];
/** Alejándose por el 090 desde 3 NM hasta 9.6. */
const hacia = (): Paso[] => Array.from({ length: 237 }, (_, k): Paso => [90, 3 + (k * 100) / 3600, 90]);
/** El arco del 090 al 140, con `dme(k)`. */
const arco = (dme: (k: number) => number = () => 10): Paso[] => Array.from({ length: 313 }, (_, k): Paso => [90 + k * 0.16, dme(k), 180]);
/** La salida: del radial 140 al 150 (más `pasa` grados al otro lado) y centrado 35 s. */
function salida(pasa = 0): Paso[] {
  const out: Paso[] = Array.from({ length: 30 }, (_, k): Paso => [140 + (k * 10) / 29, 9.8, 300]);
  for (let k = 1; k <= pasa; k++) out.push([150 + k, 9.6, 340]);
  for (let k = pasa; k > 0; k--) out.push([150 + k, 9.5, 320]);
  return [...out, ...Array.from({ length: 35 }, (): Paso => [150, 9.3, 330])];
}
function volar(pasos: Paso[], nivel: Nivel = 2): EvaluacionArco {
  let e = iniciarArco(base(0, ...pasos[0]), nivel, EJ, { intento: 0, examen: false });
  pasos.slice(1).forEach((p, i) => (e = avanzarArco(e, base(i + 1, ...p))));
  return e;
}

test("perfecto: radial, arco a ±0.3 NM y salida centrada → 100", () => {
  const e = volar([...hacia(), ...arco((k) => 10 + 0.3 * Math.sin(k / 20)), ...salida()]);
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
  assert.equal(r.salida?.aprobado, true);
  assert.deepEqual(r.fuera, { entrada: [], distancia: [], salida: [] });
});

test("un tramo del arco a 10.8 NM: error en medio con su extremo, no en fácil", () => {
  const dme = (k: number) => (k >= 150 && k < 180 ? 10.8 : 10);
  const medio = volar([...hacia(), ...arco(dme), ...salida()], 2).resultado!;
  assert.equal(medio.fuera.distancia.length, 1);
  assert.equal(medio.extremos[0], 10.8);
  assert.equal(volar([...hacia(), ...arco(dme), ...salida()], 1).resultado!.fuera.distancia.length, 0);
});

test("pasarse a 10.7 NM al entrar al arco alejándose: error de entrada en medio", () => {
  const dme = (k: number) => (k < 20 ? 10 + k * 0.035 : k < 40 ? 10.7 - (k - 20) * 0.035 : 10);
  const r = volar([...hacia(), ...arco(dme), ...salida()], 2).resultado!;
  assert.equal(r.fuera.entrada.length, 1);
  assert.ok(r.sobrepasoEntrada > 0.6);
});

test("un VOR sin DME no se arma: anulado con su motivo", () => {
  const e = iniciarArco(base(0, 90, 3, 90, { navTieneDme: false }), 2, EJ, { intento: 0, examen: false });
  assert.equal(e.fase, "invalido");
  assert.equal(e.motivo, MOTIVO_SIN_DME);
});

test("pasarse 1.5 puntos al salir al radial: error de salida en medio", () => {
  const r = volar([...hacia(), ...arco(), ...salida(3)], 2).resultado!;
  assert.equal(r.fuera.salida.length > 0, true);
  assert.equal(r.aprobado, false);
});

test("generarArco: radio 4 NM más allá (o más acá, lejos) y salida a 60°", () => {
  const cerca = generarArco(93, 3, () => 0.1);
  assert.equal(cerca.desde, 90);
  assert.equal(cerca.radioNm, 7);
  assert.equal(cerca.alejandose, true);
  assert.equal(Math.abs(((cerca.hasta - 90 + 540) % 360) - 180), 60);
  const lejos = generarArco(93, 22);
  assert.equal(lejos.radioNm, 18);
  assert.equal(lejos.alejandose, false);
});

test("el briefing del arco en inglés no tiene caracteres del español", () => {
  for (const l of briefingArco("en")) assert.doesNotMatch(l, /[áéíóúñ¿¡]/i);
});

test("el briefing del arco dice «1 milla», no «1 millas», en fácil", () => {
  assert.ok(briefingArco("es", 1).some((l) => l.includes("dentro de 1 milla.")));
  assert.ok(briefingArco("en", 1).some((l) => l.includes("within 1 mile.")));
  assert.ok(briefingArco("es", 2).some((l) => l.includes("dentro de 0.5 millas.")));
});
