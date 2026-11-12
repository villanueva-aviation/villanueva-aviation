import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarEspera, avanzarEspera, responderEntrada, type EvaluacionEspera } from "./evaluadorEspera.ts";
import type { DatosEspera } from "./navIfr.ts";
import { pasosHsi } from "./pasosHsi.ts";
import type { VorElegido } from "./vorSim.ts";

// El mismo simulador de espera.test.ts: VOR en 0,0, 100 kt, una muestra por segundo.
const VOR = { ident: "TST", region: "", lat: 0, lon: 0, mhz: 113.1, dme: true, decl: 0 } as VorElegido;
const RAD = Math.PI / 180;
const n360 = (g: number) => ((g % 360) + 360) % 360;
type Avion = { x: number; y: number; rumbo: number };
function volarTramos(a: Avion, tramos: [number, number][], t0: number): Muestra[] {
  const out: Muestra[] = [];
  let t = t0;
  for (const [seg, tasa] of tramos)
    for (let k = 0; k < seg; k++) {
      a.rumbo = n360(a.rumbo + tasa);
      a.x += (100 / 3600) * Math.sin(a.rumbo * RAD);
      a.y += (100 / 3600) * Math.cos(a.rumbo * RAD);
      out.push(muestra(t++, a, tasa === 0 ? 0 : 20 * Math.sign(tasa)));
    }
  return out;
}
const muestra = (t: number, a: Avion, inclinacion: number): Muestra => ({
  t, inclinacion, altitud: 5000, velocidad: 100, rumbo: a.rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 270, navRadial: n360(Math.atan2(a.x, a.y) / RAD), navDesv: 0, navDesde: 1,
  navDme: Math.hypot(a.x, a.y), navTieneDme: true, navSenal: true, gpsNav: false, lat: a.y / 60, lon: a.x / 60,
});
const ESPERA: DatosEspera = { acercamiento: 270, giros: "derecha", tramoSeg: 60, carta: false };

/** Entrada directa por el radial 090; devuelve la evaluación y la muestra tras `n` muestras. */
function directa(n: number, responder = true): [EvaluacionEspera, Muestra] {
  const a: Avion = { x: 8, y: 0, rumbo: 270 };
  const vuelta: [number, number][] = [[1, 0], [60, 3], [60, 0], [60, 3], [60, 0]];
  const ms = [muestra(-1, { x: 8.03, y: 0, rumbo: 270 }, 0), ...volarTramos(a, [[288, 0], ...vuelta, ...vuelta, [40, 0]], 0)].slice(0, n);
  let e = armarEspera(ms[0], 2, { intento: 2, examen: false, estacion: VOR, espera: ESPERA, llegada: 90 });
  for (const m of ms.slice(1)) {
    e = avanzarEspera(e, m);
    if (e.preguntar && responder) e = responderEntrada(e, "directa", m.rumbo);
  }
  return [e, ms[ms.length - 1]];
}
const estados = (p: ReturnType<typeof pasosHsi>) => p!.map((x) => x.estado);

test("pasos HSI: no salen antes de decir la entrada ni en el examen", () => {
  assert.equal(pasosHsi(...directa(200, false), "es"), null);
  const [e, m] = directa(200);
  assert.equal(pasosHsi({ ...e, examen: true }, m, "es"), null);
});

test("pasos HSI de la directa con los números del ejercicio; el CRS ya puesto se tacha", () => {
  const p = pasosHsi(...directa(200), "es")!;
  assert.deepEqual(p.map((x) => x.texto), [
    "CRS en 270 (inbound) y mariposa en 090 (outbound).",
    "Sobre la estación, vira a la derecha al 090.",
    "Al través (cambia la flechita), cronómetro 1 minuto. Si no se distingue, al terminar el viraje.",
    "Pasado el minuto, vira hacia el lado del CDI hasta el 270.",
    "Sobre la estación, vira de nuevo al 090.",
  ]);
  assert.deepEqual(estados(p), ["hecho", "actual", "pendiente", "pendiente", "pendiente"]);
  for (const x of pasosHsi(...directa(200), "en")!) assert.doesNotMatch(x.texto, /[áéíóúñ¿¡]/i);
});

test("pasos HSI: se tachan conforme vuela la entrada", () => {
  // Nivelado en el alejamiento (cruce ≈ 288, viraje de 60 s): vira al 090 hecho, cronómetro en curso.
  assert.deepEqual(estados(pasosHsi(...directa(370), "es")), ["hecho", "hecho", "actual", "pendiente", "pendiente"]);
  // Virando de regreso: el minuto ya pasó.
  assert.deepEqual(estados(pasosHsi(...directa(420), "es")), ["hecho", "hecho", "hecho", "actual", "pendiente"]);
  // De nuevo sobre la estación: todo hecho.
  assert.deepEqual(estados(pasosHsi(...directa(560), "es")), ["hecho", "hecho", "hecho", "hecho", "hecho"]);
});

test("pasos HSI de la gota: la mariposa 30° hacia el lado de la espera", () => {
  const m = muestra(0, { x: 0.5, y: 0, rumbo: 90 }, 0);
  const e = { ...armarEspera(m, 2, { intento: 0, examen: false, estacion: VOR, espera: ESPERA }), dicha: "gota" as const };
  const p = pasosHsi(e, m, "es")!;
  assert.equal(p[1].texto, "Mariposa en 060 (outbound 090 −30°).");
  assert.equal(p.length, 7);
});
