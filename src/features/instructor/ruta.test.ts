import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { avanzarRuta, iniciarRuta, type EvaluacionRuta } from "./evaluadorRuta.ts";
import { generarRuta, type EjercicioRuta } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import type { VorElegido } from "./vorSim.ts";
import { MANIOBRAS } from "./maniobras.ts";
import { briefingRuta } from "./textosRuta.ts";

// Simulador local: VOR en 0,0 (declinación 0); el avión en el radial `radial` a `nm` millas. `desv`: grados de error del radial.
const VOR = { ident: "TST", region: "", lat: 0, lon: 0, mhz: 113.1, dme: true, decl: 0 } as VorElegido;
const EJ: EjercicioRuta = { entrada: 90, salida: 180, giro: 90 };
const RAD = Math.PI / 180;
const base = (t: number, radial: number, nm: number, rumbo: number, extra: Partial<Muestra> = {}): Muestra => ({
  t, inclinacion: 0, altitud: 5000, velocidad: 100, rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 270, navRadial: ((radial % 360) + 360) % 360, navDesv: 0, navDesde: 1, navDme: nm,
  navTieneDme: true, navSenal: true, gpsNav: false, lat: (nm / 60) * Math.cos(radial * RAD), lon: (nm / 60) * Math.sin(radial * RAD), ...extra,
});

type Paso = [radial: number, nm: number, rumbo: number];
/** Acercándose por el radial 090 desde `de` NM, `desv(t)` grados de error; luego se aleja por el 180. */
function ida(de: number, desv: (k: number) => number = () => 0): Paso[] {
  const out: Paso[] = [];
  for (let k = 0, nm = de; nm > 0.05; k++, nm -= 100 / 3600) out.push([90 + desv(k), nm, 270]);
  return out;
}
function vuelta(seg: number, desv: (k: number) => number = () => 0): Paso[] {
  return Array.from({ length: seg }, (_, k): Paso => [180 + desv(k), 0.1 + (k * 100) / 3600, 180]);
}
function volar(pasos: Paso[], nivel: Nivel = 2, estacion: VorElegido | undefined = VOR): EvaluacionRuta {
  let e = iniciarRuta(base(0, ...pasos[0]), nivel, () => EJ, { intento: 0, examen: false, estacion });
  pasos.slice(1).forEach((p, i) => (e = avanzarRuta(e, base(i + 1, ...p))));
  return e;
}

test("perfecta: se acerca centrado, pasa la estación, se establece en la salida y la sostiene 2 min → 100", () => {
  const e = volar([...ida(10), ...vuelta(220)]);
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
  assert.deepEqual(r.fuera, { acercamiento: [], alejamiento: [] });
});

test("armada a 1.5 NM queda posicionando, sin calificar, hasta pasar 5 NM", () => {
  // 100 s alejándose desde 1.5 NM: llega a 4.3 NM.
  const lejos: Paso[] = Array.from({ length: 100 }, (_, k): Paso => [90, 1.5 + (k * 100) / 3600, 90]);
  const e = volar(lejos);
  assert.equal(e.fase, "posicionando");
  const sigue = volar([...lejos, ...Array.from({ length: 10 }, (): Paso => [90, 5.2, 270])]);
  assert.equal(sigue.fase, "acercandose");
  assert.equal(sigue.ejercicio?.entrada, 90);
});

test("se sale 1.6 puntos 40 s en la ida: error en medio, no en fácil", () => {
  const desv = (k: number) => (k >= 60 && k < 100 ? 3.2 : 0);
  const medio = volar([...ida(10, desv), ...vuelta(220)], 2).resultado!;
  assert.equal(medio.aprobado, false);
  assert.equal(medio.fuera.acercamiento.length, 1);
  assert.ok(Math.abs(Math.abs(medio.fuera.acercamiento[0].peor) - 1.6) < 0.01);
  assert.equal(volar([...ida(10, desv), ...vuelta(220)], 1).resultado!.fuera.acercamiento.length, 0);
});

test("tarda 200 s en establecerse en la salida: error en medio, no en fácil", () => {
  const tarde = (k: number) => (k < 200 ? 10 : 0);
  const medio = volar([...ida(10), ...vuelta(340, tarde)], 2).resultado!;
  assert.equal(medio.fuera.alejamiento.length, 1);
  const facil = volar([...ida(10), ...vuelta(340, tarde)], 1).resultado!;
  assert.equal(facil.fuera.alejamiento.length, 0);
});

test("el radial que oscila 85°↔95° sobre la estación no cuenta dos pasos", () => {
  const oscila: Paso[] = Array.from({ length: 20 }, (_, k): Paso => [90 + (k % 2 ? 85 : 95), 0.3, 270]);
  const e = volar([...ida(10), ...oscila]);
  assert.equal(e.fase, "acercandose");
  const despues = volar([...ida(10), [90 + 120, 0.2, 270], ...oscila]);
  assert.equal(despues.fase, "alejandose");
});

test("deriva constante de 0.7 puntos dentro de tolerancia: nota, 90", () => {
  const r = volar([...ida(10, () => 1.4), ...vuelta(220)]).resultado!;
  assert.equal(r.aprobado, true);
  assert.deepEqual(r.notas, ["deriva"]);
  assert.equal(r.calificacion, 90);
});

test("otra frecuencia en NAV1 más de 10 s: anulado", () => {
  let e = iniciarRuta(base(0, 90, 10, 270), 2, () => EJ, { intento: 0, examen: false, estacion: VOR });
  for (let t = 1; t <= 12; t++) e = avanzarRuta(e, base(t, 90, 10, 270, { navMhz: 115.3 }));
  assert.equal(e.fase, "invalido");
});

test("generarRuta: entrada redondeada y salida girada desde el curso de acercamiento", () => {
  assert.deepEqual(generarRuta(93, 90, () => 0.9), { entrada: 90, salida: 180, giro: 90 });
  assert.equal(generarRuta(93, 90, () => 0.1).salida, 0);
});

test("el examen de la ruta va en medio como mínimo y el briefing en inglés no tiene caracteres del español", () => {
  assert.equal(MANIOBRAS["ruta-vor"].nivelExamen?.(1), 2);
  for (const l of briefingRuta("en")) assert.doesNotMatch(l, /[áéíóúñ¿¡]/i);
});
