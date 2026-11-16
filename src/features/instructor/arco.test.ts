import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarArco, avanzarArco, iniciarArco, MOTIVO_SIN_DME, responderLado, type EvaluacionArco } from "./evaluadorArco.ts";
import { ladoDicho, REGRESO_NM, type EjercicioArco } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import { avisoArco, briefingArco, explicarArco, textoPasoArco } from "./textosArco.ts";
import { subeA } from "./textosInterceptacion.ts";

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
function volar(pasos: Paso[], nivel: Nivel = 2, lado: "derecha" | "izquierda" | null = "derecha"): EvaluacionArco {
  let e = iniciarArco(base(0, ...pasos[0]), nivel, EJ, { intento: 0, examen: false });
  if (lado) e = responderLado(e, lado);
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
  assert.deepEqual(r.fuera, { entrada: [], distancia: [], salida: [], identificar: [] });
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

test("el briefing del arco en inglés no tiene caracteres del español", () => {
  for (const l of briefingArco("en")) assert.doesNotMatch(l, /[áéíóúñ¿¡]/i);
});

test("el briefing del arco dice «1 milla», no «1 millas», en fácil", () => {
  assert.ok(briefingArco("es", 1).some((l) => l.includes("dentro de 1 milla.")));
  assert.ok(briefingArco("en", 1).some((l) => l.includes("within 1 mile.")));
  assert.ok(briefingArco("es", 2).some((l) => l.includes("dentro de 0.5 millas.")));
});

test("altitud de la lección: el arco no pide mantener la del despegue mientras sube a la de la lección", () => {
  const alt = (t: number, a: number) => base(t, 90, 3, 90, { altitud: a });
  let e = iniciarArco(alt(0, 5900), 2, EJ, { intento: 0, examen: false, altitudFt: 9000 });
  assert.equal(avisoArco(e, alt(1, 7000), "practica", "es"), null, "subiendo no hay aviso");
  e = avanzarArco(e, alt(1, 9000));
  assert.equal(avisoArco(e, alt(2, 8500), "practica", "es")?.texto, "Mantén 9,000 pies");
  assert.equal(avisoArco(iniciarArco(alt(0, 5900), 2, EJ, { intento: 0, examen: false }), alt(1, 6500), "practica", "en")?.texto, "Hold 5,900 feet");
});

test("en tierra, la lección de arcos dice a qué altitud subir", () => {
  assert.equal(subeA(9000, "es"), "Después del despegue, sube a 9,000 pies.");
  assert.equal(subeA(9000, "en"), "After takeoff, climb to 9,000 feet.");
});

// Lección 3 encadenada (Erik, 2026-11-16): salida, regreso, salida, regreso.
const sigue = (e: EvaluacionArco, pasos: Paso[], t0: number) => pasos.reduce((x, p, i) => avanzarArco(x, base(t0 + i + 1, ...p)), e);

test("ejercicio 1, de salida: arma ya, con el arco 4 NM más allá, pregunta el lado y sale alejándose", () => {
  const e = armarArco(base(0, 293, 2, 290), 2, { intento: 0, examen: false });
  assert.equal(e.fase, "hacia-arco");
  assert.equal(e.preguntar, true);
  const ej = e.ejercicio!;
  assert.equal(ej.desde, 290);
  assert.equal(ej.radioNm, 6);
  assert.equal(ej.alejandose, true);
  assert.equal(ej.saleAlejandose, true);
  const giro = Math.abs(((ej.hasta - 290 + 540) % 360) - 180);
  assert.ok([30, 40, 50, 60].includes(giro), String(giro));
});

test("ejercicio 2, de regreso: espera las 10 NM, pide un radial de acercamiento y, ya en él, da el arco 3 NM más acá", () => {
  let e = armarArco(base(0, 300, 7, 300), 2, { intento: 1, examen: false });
  assert.equal(e.fase, "esperando");
  assert.equal(e.ejercicio, null);
  assert.equal(e.preguntar, false);
  e = sigue(e, [[300, 9, 300]], 0);
  assert.equal(e.fase, "esperando");
  e = sigue(e, [[300, REGRESO_NM, 300]], 1);
  assert.equal(e.fase, "posicionando");
  const r = e.posicion!.ejercicio!.radial;
  assert.equal(Math.abs(((r - 300 + 540) % 360) - 180), 30);
  assert.equal(e.posicion!.ejercicio!.desde, false);
  // Ya sobre el radial, acercándose: el arco.
  e = sigue(e, [[r, 10.6, (r + 180) % 360]], 2);
  assert.equal(e.fase, "hacia-arco");
  assert.equal(e.preguntar, true);
  assert.equal(e.ejercicio!.desde, r);
  assert.equal(e.ejercicio!.radioNm, 7);
  assert.equal(e.ejercicio!.alejandose, false);
  assert.equal(e.ejercicio!.saleAlejandose, false);
});

test("ejercicio 3, de salida tras un regreso: espera a pasar la estación y alejarse 2 NM", () => {
  let e = armarArco(base(0, 150, 6, 330), 2, { intento: 2, examen: false });
  assert.equal(e.fase, "esperando");
  e = sigue(e, [[150, 3, 330], [150, 0.4, 330], [330, 1.2, 330]], 0);
  assert.equal(e.fase, "esperando");
  e = sigue(e, [[330, 2.1, 330]], 3);
  assert.equal(e.fase, "hacia-arco");
  assert.equal(e.ejercicio!.desde, 330);
  assert.equal(e.ejercicio!.radioNm, 6);
  assert.equal(e.ejercicio!.saleAlejandose, true);
});

test("arco de salida: la salida al radial final es alejándose por él", () => {
  const ej: EjercicioArco = { ...EJ, saleAlejandose: true };
  let e = responderLado(iniciarArco(base(0, ...hacia()[0]), 2, ej, { intento: 0, examen: false }), "derecha");
  const fuera: Paso[] = [...Array.from({ length: 30 }, (_, k): Paso => [140 + (k * 10) / 29, 10, 120]), ...Array.from({ length: 35 }, (): Paso => [150, 10.3, 150])];
  e = sigue(e, [...hacia(), ...arco(), ...fuera], 0);
  assert.equal(e.fase, "terminado");
  assert.equal(e.resultado!.salida!.ejercicio.desde, true);
  assert.equal(e.resultado!.salida!.ejercicio.curso, 150);
  assert.equal(e.resultado!.aprobado, true);
});

test("la pregunta del lado: la primera respuesta cuenta; mal o sin contestar es error de identificar", () => {
  const vuelo = [...hacia(), ...arco(), ...salida()];
  const mal = volar(vuelo, 2, "izquierda").resultado!;
  assert.equal(mal.fuera.identificar.length, 1);
  assert.equal(mal.calificacion, 65);
  assert.equal(mal.aprobado, false);
  assert.ok(explicarArco(mal, "es").some((l) => l.texto === "Dijiste que virabas a la izquierda; era a la derecha."));
  const nada = volar(vuelo, 2, null).resultado!;
  assert.equal(nada.fuera.identificar.length, 1);
  assert.ok(explicarArco(nada, "en").some((l) => l.texto === "You didn't say which way you'd turn onto the arc."));
  let e = iniciarArco(base(0, 90, 3, 90), 2, EJ, { intento: 0, examen: false });
  e = responderLado(responderLado(e, "derecha"), "izquierda");
  assert.equal(e.dicho, "derecha");
  assert.equal(e.preguntar, false);
});

test("ladoDicho: derecha o izquierda, en los dos idiomas; las dos o ninguna, null", () => {
  assert.equal(ladoDicho("a la derecha", "es"), "derecha");
  assert.equal(ladoDicho("Izquierda", "es"), "izquierda");
  assert.equal(ladoDicho("turn left", "en"), "izquierda");
  assert.equal(ladoDicho("right", "en"), "derecha");
  assert.equal(ladoDicho("derecha o izquierda", "es"), null);
  assert.equal(ladoDicho("no sé", "es"), null);
});

test("la orden del arco no dice el lado: eso lo identifica el cadete", () => {
  const salida = iniciarArco(base(0, 90, 3, 90), 2, { ...EJ, saleAlejandose: true }, { intento: 0, examen: false, vor: "GDL" });
  assert.equal(textoPasoArco("radial", salida, "es"), "Aléjate por el radial 090 hasta el arco de 10 millas de GDL; síguelo hasta el radial 150 y aléjate por él: curso 150.");
  const regreso = iniciarArco(base(0, 90, 12, 270), 2, { radioNm: 8, desde: 90, hasta: 150, sentido: 1, alejandose: false, saleAlejandose: false }, { intento: 1, examen: false });
  const en = textoPasoArco("radial", regreso, "en");
  assert.equal(en, "Fly inbound on the 090 radial to the 8 mile arc; follow it to the 150 radial and fly inbound on it: course 330.");
  for (const x of [textoPasoArco("radial", salida, "es"), en]) assert.doesNotMatch(x, /derecha|izquierda|right|left/i);
});
