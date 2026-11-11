import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarInterceptacion, avanzarInterceptacion, iniciarInterceptacion, type EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import type { Ejercicio } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import { MANIOBRAS } from "./maniobras.ts";
import { briefingInterceptacion } from "./textosInterceptacion.ts";

// Simulador local: alejándose por el radial 090 (curso 090); el radial del avión = 090 + desvío en grados.
const EJ: Ejercicio = { caso: "alejandose", radial: 90, desde: true, curso: 90 };
const base = (t: number, desv: number, rumbo: number, dme = 10): Muestra => ({
  t, inclinacion: 0, altitud: 5000, velocidad: 100, rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 90, navRadial: (90 + desv + 360) % 360, navDesv: 0, navDesde: 2, navDme: dme,
  navTieneDme: true, navSenal: true, gpsNav: false,
});

/** Un vuelo de un segundo por muestra: cada tramo da el desvío y el rumbo de cada segundo. */
function volar(perfil: [desv: number, rumbo: number, dme?: number][], nivel: Nivel = 2): EvaluacionInterceptacion {
  const [d0, r0, m0] = perfil[0];
  let e = iniciarInterceptacion(base(0, d0, r0, m0), nivel, EJ, { intento: 0, examen: false });
  perfil.slice(1).forEach(([d, r, dme], i) => (e = avanzarInterceptacion(e, base(i + 1, d, r, dme))));
  return e;
}
const rampa = (de: number, a: number, rumbo: number, dme?: number): [number, number, number?][] => {
  const out: [number, number, number?][] = [];
  const paso = de > a ? -1 : 1;
  for (let d = de; paso > 0 ? d <= a : d >= a; d += paso) out.push([d, rumbo, dme]);
  return out;
};
const quieto = (desv: number, rumbo: number, seg: number, dme?: number) => Array.from({ length: seg }, (): [number, number, number?] => [desv, rumbo, dme]);

test("NAV1 en otro VOR a mitad del ejercicio: no se califica contra esa estación y se anula a los 10 s", () => {
  let e = iniciarInterceptacion(base(0, 20, 60), 2, EJ, { intento: 0, examen: false });
  // Otra estación: su radial cae justo en el curso, pero no es el VOR del ejercicio.
  for (let t = 1; t <= 12; t++) e = avanzarInterceptacion(e, { ...base(t, 0, 90), navMhz: 115.3 });
  assert.equal(e.cruce, null);
  assert.equal(e.fase, "invalido");
});

test("perfecta: entra a 30°, cruza y se queda centrada 30 s → 100 sin tramos", () => {
  const e = volar([...rampa(20, 0, 60), ...quieto(0, 90, 35)]);
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
  assert.deepEqual(r.fuera, { sobrepaso: [], corto: [], interceptar: [] });
});

test("pasarse 1.4 puntos: error en medio, nota en fácil", () => {
  const vuelo: [number, number, number?][] = [...rampa(20, 0, 60), [-1, 100], [-2, 100], [-2.8, 100], [-2, 80], [-1, 80], ...quieto(0, 90, 35)];
  const medio = volar(vuelo, 2).resultado!;
  assert.equal(medio.aprobado, false);
  assert.equal(medio.fuera.sobrepaso.length, 1);
  assert.ok(Math.abs(medio.fuera.sobrepaso[0].peor - 1.4) < 0.01, `peor ${medio.fuera.sobrepaso[0].peor}`);
  const facil = volar(vuelo, 1).resultado!;
  assert.equal(facil.aprobado, true);
  assert.equal(facil.calificacion, 90);
});

test("quedarse corto 40 s a 2.2 puntos con el rumbo del curso: error en medio, no en fácil", () => {
  const vuelo = [...rampa(20, 5, 60), ...quieto(4.4, 90, 40), ...rampa(4, 0, 70), ...quieto(0, 90, 35)];
  const medio = volar(vuelo, 2).resultado!;
  assert.equal(medio.aprobado, false);
  assert.equal(medio.fuera.corto.length, 1);
  const facil = volar(vuelo, 1).resultado!;
  assert.equal(facil.fuera.corto.length, 0);
});

test("entrar a 60° es nota, no error", () => {
  const r = volar([...rampa(60, 0, 30), ...quieto(0, 90, 35)]).resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 90);
  assert.ok(r.angulo !== null && r.angulo > 55);
});

test("lector anterior a v1.6 (sin navRadial): anulado con el motivo del lector", () => {
  const { navRadial: _, ...vieja } = base(1, 10, 60);
  const e = avanzarInterceptacion(volar([[20, 60]]), vieja);
  assert.equal(e.fase, "invalido");
  assert.match(e.motivo!, /v1\.6/);
  assert.equal(armarInterceptacion(vieja, 2, { intento: 0, examen: false }).fase, "invalido");
});

test("la barra manejada por el GPS anula", () => {
  const e = avanzarInterceptacion(volar([[20, 60]]), { ...base(1, 19, 60), gpsNav: true });
  assert.equal(e.fase, "invalido");
  assert.match(e.motivo!, /GPS/);
});

test("más de 10 s sin señal del VOR anula", () => {
  let e = volar([[20, 60]]);
  for (let t = 1; t <= 12; t++) e = avanzarInterceptacion(e, { ...base(t, 20, 60), navSenal: false });
  assert.equal(e.fase, "invalido");
});

test("sobre la estación (DME 0.4) la barra al otro lado no cuenta como pasarse", () => {
  const r = volar([...rampa(20, 0, 60), ...quieto(-6, 90, 5, 0.4), ...quieto(0, 90, 35)]).resultado!;
  assert.equal(r.fuera.sobrepaso.length, 0);
  assert.equal(r.aprobado, true);
});

test("sin establecerse en 8 minutos: error en interceptar", () => {
  const r = volar([[20, 60], ...quieto(20, 0, 490)]).resultado!;
  assert.equal(r.aprobado, false);
  assert.equal(r.fuera.interceptar.length, 1);
});

test("el segundo intento de práctica es acercándose", () => {
  const e = armarInterceptacion(base(0, 0, 90), 2, { intento: 1, examen: false });
  assert.equal(e.ejercicio.caso, "acercandose");
  assert.equal(e.ejercicio.desde, false);
  assert.equal(armarInterceptacion(base(0, 0, 90), 2, { intento: 0, examen: true, casos: ["acercandose-amplio", "alejandose"] }).ejercicio.caso, "acercandose-amplio");
});

test("el examen de interceptación va en medio como mínimo", () => {
  assert.equal(MANIOBRAS["interceptar-radial"].nivelExamen?.(1), 2);
  assert.equal(MANIOBRAS["interceptar-radial"].nivelExamen?.(3), 3);
});

test("el briefing en inglés no tiene caracteres del español", () => {
  for (const linea of briefingInterceptacion("en")) assert.doesNotMatch(linea, /[áéíóúñ¿¡]/i);
});
