import { test } from "node:test";
import assert from "node:assert/strict";
import { generarSituacion } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { avanzarEspera, armarEspera, responderEntrada, type EvaluacionEspera } from "./evaluadorEspera.ts";
import { MANIOBRAS } from "./maniobras.ts";
import { entradaDicha, entradasValidas, entradaVolada, inventarEspera, type DatosEspera } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import { briefingEspera } from "./textosEspera.ts";
import type { VorElegido } from "./vorSim.ts";

// Simulador local: VOR en 0,0 (declinación 0), 100 kt, una muestra por segundo. x al este, y al norte, en NM.
const VOR = { ident: "TST", region: "", lat: 0, lon: 0, mhz: 113.1, dme: true, decl: 0 } as VorElegido;
const RAD = Math.PI / 180;
const n360 = (g: number) => ((g % 360) + 360) % 360;

type Tramo = [seg: number, tasa: number]; // tasa en °/s: + derecha, − izquierda, 0 recto
type Avion = { x: number; y: number; rumbo: number };

function volarTramos(avion: Avion, tramos: Tramo[], t0: number): Muestra[] {
  const out: Muestra[] = [];
  let t = t0;
  for (const [seg, tasa] of tramos) {
    for (let k = 0; k < seg; k++) {
      avion.rumbo = n360(avion.rumbo + tasa);
      avion.x += (100 / 3600) * Math.sin(avion.rumbo * RAD);
      avion.y += (100 / 3600) * Math.cos(avion.rumbo * RAD);
      out.push(muestra(t++, avion, tasa === 0 ? 0 : 20 * Math.sign(tasa)));
    }
  }
  return out;
}

function muestra(t: number, a: Avion, inclinacion: number): Muestra {
  return {
    t, inclinacion, altitud: 5000, velocidad: 100, rumbo: a.rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
    titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 270, navRadial: n360(Math.atan2(a.x, a.y) / RAD), navDesv: 0, navDesde: 1,
    navDme: Math.hypot(a.x, a.y), navTieneDme: true, navSenal: true, gpsNav: false, lat: a.y / 60, lon: a.x / 60,
  };
}

// Espera sobre el VOR: acercamiento 270, giros a la derecha, alejamiento 090 (radial 090).
const ESPERA: DatosEspera = { acercamiento: 270, giros: "derecha", tramoSeg: 60, carta: false };

/** Llega por el radial 090 desde 8 NM, entrada directa y dos vueltas con tramos de `tramo` segundos. */
function esperaDirecta(tramo = 60): Muestra[] {
  const a: Avion = { x: 8, y: 0, rumbo: 270 };
  const llegada = volarTramos(a, [[288, 0]], 0);
  const vuelta: Tramo[] = [[1, 0], [60, 3], [tramo, 0], [60, 3], [tramo, 0]];
  return [muestra(-1, { x: 8.03, y: 0, rumbo: 270 }, 0), ...llegada, ...volarTramos(a, [...vuelta, ...vuelta, [40, 0]], 288)];
}

function volar(ms: Muestra[], nivel: Nivel = 2, responder: string | null = "directa"): EvaluacionEspera {
  let e = armarEspera(ms[0], nivel, { intento: 0, examen: false, estacion: VOR, espera: ESPERA });
  for (const m of ms.slice(1)) {
    e = avanzarEspera(e, m);
    if (e.preguntar && responder) e = responderEntrada(e, responder as "directa", m.rumbo);
  }
  return e;
}

test("entradaDicha: lágrima, teardrop, parallel; dos distintas o nada → null", () => {
  assert.equal(entradaDicha("Voy a hacer una lágrima", "es"), "gota");
  assert.equal(entradaDicha("teardrop", "en"), "gota");
  assert.equal(entradaDicha("tear drop entry", "en"), "gota");
  assert.equal(entradaDicha("parallel", "en"), "paralela");
  assert.equal(entradaDicha("Directa", "es"), "directa");
  assert.equal(entradaDicha("directa o paralela", "es"), null);
  assert.equal(entradaDicha("", "es"), null);
});

test("entradaDicha: «voy directo» y «en paralelo» también cuentan", () => {
  assert.equal(entradaDicha("Voy directo", "es"), "directa");
  assert.equal(entradaDicha("Entrada en paralelo", "es"), "paralela");
});

test("entradasValidas: a 3° de la frontera de 110° valen paralela y directa", () => {
  const v = entradasValidas([197 - 5, 197, 197 + 5], 90, "derecha");
  assert.ok(v.includes("paralela"));
  assert.ok(v.includes("directa"));
  assert.equal(v.length, 2);
});

test("entradaVolada: directa, paralela, gota y sin tramo recto (espera a la derecha, alejamiento 090)", () => {
  const de = (rumbo: number, tramos: Tramo[]) => volarTramos({ x: 0, y: 0, rumbo }, tramos, 0);
  assert.equal(entradaVolada(de(270, [[5, 0], [60, 3], [60, 0], [60, 3]]), 90, "derecha"), "directa");
  assert.equal(entradaVolada(de(150, [[3, 0], [20, -3], [60, 0], [70, -3]]), 90, "derecha"), "paralela");
  assert.equal(entradaVolada(de(50, [[2, 5], [60, 0], [70, 3]]), 90, "derecha"), "gota");
  assert.equal(entradaVolada(de(270, [[200, 3]]), 90, "derecha"), null);
});

test("entradaVolada: un tramo largo en el rumbo de llegada antes de virar no la vuelve gota", () => {
  const ms = volarTramos({ x: 0, y: 0, rumbo: 270 }, [[40, 0], [60, 3], [60, 0], [60, 3]], 0);
  assert.equal(entradaVolada(ms, 90, "derecha"), "directa");
});

test("espera completa: directa dicha y volada, tramos de 60 s, virajes a 3°/s → 100", () => {
  const e = volar(esperaDirecta());
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.deepEqual(r.fuera, { dicha: [], volada: [], tramo: [], acercamiento: [], virajes: [], distancia: [] });
  assert.equal(r.volada, "directa");
  assert.equal(r.correcta, "directa");
  assert.deepEqual(r.tramos, [59]);
  assert.ok(e.acerc.length >= 5, "se calificó el acercamiento");
  assert.equal(r.tasas.length, 4);
  for (const x of r.tasas) assert.ok(Math.abs(x - 3) < 0.01);
  assert.ok(r.maxDistancia > 1.5 && r.maxDistancia < 2.5);
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
});

test("tramos de 75 s: error en el tramo en medio, no en fácil", () => {
  const medio = volar(esperaDirecta(75), 2).resultado!;
  assert.equal(medio.fuera.tramo.length, 1);
  assert.equal(medio.calificacion, 80);
  assert.equal(volar(esperaDirecta(75), 1).resultado!.fuera.tramo.length, 0);
});

test("sin respuesta a la pregunta: error en la entrada dicha", () => {
  const r = volar(esperaDirecta(), 2, null).resultado!;
  assert.equal(r.fuera.dicha.length, 1);
  assert.equal(r.dicha, null);
});

test("armada a 2 NM: posicionando y sin preguntar hasta pasar 6 NM", () => {
  const a: Avion = { x: 2, y: 0, rumbo: 90 };
  const ms = [muestra(0, a, 0), ...volarTramos(a, [[140, 0]], 1)]; // llega a 5.9 NM
  let e = volar(ms);
  assert.equal(e.fase, "posicionando");
  assert.equal(e.preguntar, false);
  e = volar([...ms, ...volarTramos(a, [[10, 0]], 141)]);
  assert.equal(e.fase, "llegando");
  assert.equal(e.ejercicio.llegada, 90);
});

test("preguntar se enciende a 120 s del fijo y una sola vez", () => {
  const ms = esperaDirecta().slice(0, 289);
  let e = armarEspera(ms[0], 2, { intento: 0, examen: false, estacion: VOR, espera: ESPERA });
  let veces = 0;
  let distancia = 0;
  for (const m of ms.slice(1)) {
    const antes = e.preguntar;
    e = avanzarEspera(e, m);
    if (e.preguntar && !antes) {
      veces++;
      distancia = m.navDme!;
      e = responderEntrada(e, "directa", m.rumbo);
    }
  }
  assert.equal(veces, 1);
  assert.ok(distancia <= 3.34 && distancia > 3.3, String(distancia));
  assert.equal(e.dicha, "directa");
});

test("inventarEspera coincide con generarSituacion: acercamiento = alejamiento + 180", () => {
  const azar = () => {
    const v = [0.3, 0.5, 0.1, 0.6];
    let k = 0;
    return () => v[k++ % v.length];
  };
  const s = generarSituacion(azar());
  const d = inventarEspera(azar());
  assert.equal(d.acercamiento, n360(s.alejamiento + 180));
  assert.equal(d.giros, s.giros);
  assert.equal(d.tramoSeg, 60);
  assert.equal(d.carta, false);
});

test("el examen de la espera va en medio como mínimo y el briefing en inglés no tiene caracteres del español", () => {
  assert.equal(MANIOBRAS.espera.nivelExamen?.(1), 2);
  for (const l of briefingEspera("en")) assert.doesNotMatch(l, /[áéíóúñ¿¡]/i);
});
