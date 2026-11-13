import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import {
  armarInterceptacion, avanzarInterceptacion, iniciarInterceptacion, responderTipo, type EvaluacionInterceptacion,
} from "./evaluadorInterceptacion.ts";
import { tramosDe, type Ejercicio, type TipoTramo } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import {
  avisoInterceptacion, briefingInterceptacion, briefingRutaPasada, explicarInterceptacion, instruccionTramo, masFalladoInterceptacion,
  ordenInterceptacion, pasoInterceptacion, PREGUNTA_TIPO, repetirInterceptacion, textoPasoInterceptacion, type PasoInterceptacion,
} from "./textosInterceptacion.ts";

// Simulador local. Alejándose por el radial 090 (curso 090); el radial del avión = 090 + desvío en grados. Empieza a 3 NM.
const EJ: Ejercicio = { tipo: "normal", radial: 90, desde: true, curso: 90, referencia: 60 };
const en = (t: number, radial: number, rumbo: number, dme = 3): Muestra => ({
  t, inclinacion: 0, altitud: 5000, velocidad: 100, rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 90, navRadial: ((radial % 360) + 360) % 360, navDesv: 0, navDesde: 2, navDme: dme,
  navTieneDme: true, navSenal: true, gpsNav: false,
});
const base = (t: number, desv: number, rumbo: number, dme = 3): Muestra => en(t, 90 + desv, rumbo, dme);

type Punto = [desv: number, rumbo: number, dme?: number];
/** Un vuelo de un segundo por muestra; contesta `dicho` al empezar (null: no contesta). */
function volar(perfil: Punto[], nivel: Nivel = 2, ej: Ejercicio = EJ, dicho: TipoTramo | null = "normal"): EvaluacionInterceptacion {
  const [d0, r0, m0] = perfil[0];
  let e = iniciarInterceptacion(en(0, ej.radial + d0, r0, m0), nivel, ej, { intento: 0, examen: false });
  if (dicho) e = responderTipo(e, dicho);
  perfil.slice(1).forEach(([d, r, dme], i) => (e = avanzarInterceptacion(e, en(i + 1, ej.radial + d, r, dme))));
  return e;
}
const rampa = (de: number, a: number, rumbo: number, dme?: number): Punto[] => {
  const out: Punto[] = [];
  const paso = de > a ? -1 : 1;
  for (let d = de; paso > 0 ? d <= a : d >= a; d += paso) out.push([d, rumbo, dme]);
  return out;
};
const quieto = (desv: number, rumbo: number, seg: number, dme?: number) => Array.from({ length: seg }, (): Punto => [desv, rumbo, dme]);
/** Sigue segundo a segundo desde la última muestra (un salto de tiempo cuenta como pausa y anula). */
function seguir(e: EvaluacionInterceptacion, puntos: [radial: number, rumbo: number, dme?: number][]): EvaluacionInterceptacion {
  for (const [radial, rumbo, dme] of puntos) e = avanzarInterceptacion(e, en(e.previo.t + 1, radial, rumbo, dme));
  return e;
}
const repetir = <T,>(n: number, f: (k: number) => T): T[] => Array.from({ length: n }, (_, k) => f(k));
/** A las 8 NM: termina el alejamiento. */
const FIN: Punto = [0, 90, 8.1];
const PERFECTA: Punto[] = [...rampa(20, 0, 60), ...quieto(0, 90, 35), FIN];

test("NAV1 en otro VOR a mitad del ejercicio: no se califica contra esa estación y se anula a los 10 s", () => {
  let e = iniciarInterceptacion(base(0, 20, 60), 2, EJ, { intento: 0, examen: false });
  // Otra estación: su radial cae justo en el curso, pero no es el VOR del ejercicio.
  for (let t = 1; t <= 12; t++) e = avanzarInterceptacion(e, { ...base(t, 0, 90), navMhz: 115.3 });
  assert.equal(e.cruce, null);
  assert.equal(e.fase, "invalido");
});

test("alejamiento normal: centrado y a 8 NM termina con 100", () => {
  const sin = volar(PERFECTA.slice(0, -1));
  assert.equal(sin.fase, "establecido", "sin llegar a 8 NM sigue en curso");
  const e = volar(PERFECTA);
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
  assert.equal(r.dicho, "normal");
  assert.equal(r.elementos["4"], "S");
  assert.deepEqual(r.fuera, { identificar: [], sobrepaso: [], corto: [], interceptar: [] });
});

test("alejamiento que empieza a 10 NM termina a 14, no al armarse", () => {
  let e = volar([[20, 60, 10], ...rampa(20, 0, 60, 10), ...quieto(0, 90, 5, 10.5)]);
  assert.equal(e.finNm, 14);
  assert.notEqual(e.fase, "terminado");
  e = seguir(e, [[90, 90, 14.1]]);
  assert.equal(e.fase, "terminado");
});

test("acercamiento termina al pasar el VOR", () => {
  const TO: Ejercicio = { tipo: "normal", radial: 90, desde: false, curso: 270, referencia: 60 };
  const e = volar([...rampa(10, 0, 240, 5), ...quieto(0, 270, 20, 3), [0, 270, 1.5], [180, 270, 0.6]], 2, TO);
  assert.equal(e.fase, "terminado");
  assert.deepEqual(e.resultado!.fuera.interceptar, []);
});

test("pasarse 1.4 puntos: error en medio, nota en fácil", () => {
  const vuelo: Punto[] = [...rampa(20, 0, 60), [-1, 100], [-2, 100], [-2.8, 100], [-2, 80], [-1, 80], ...quieto(0, 90, 35), FIN];
  const medio = volar(vuelo, 2).resultado!;
  assert.equal(medio.aprobado, false);
  assert.equal(medio.fuera.sobrepaso.length, 1);
  assert.ok(Math.abs(medio.fuera.sobrepaso[0].peor - 1.4) < 0.01, `peor ${medio.fuera.sobrepaso[0].peor}`);
  const facil = volar(vuelo, 1).resultado!;
  assert.equal(facil.aprobado, true);
  assert.equal(facil.calificacion, 90);
});

test("quedarse corto 40 s a 2.2 puntos con el rumbo del curso: error en medio, no en fácil", () => {
  const vuelo = [...rampa(20, 5, 60), ...quieto(4.4, 90, 40), ...rampa(4, 0, 70), ...quieto(0, 90, 35), FIN];
  const medio = volar(vuelo, 2).resultado!;
  assert.equal(medio.aprobado, false);
  assert.equal(medio.fuera.corto.length, 1);
  const facil = volar(vuelo, 1).resultado!;
  assert.equal(facil.fuera.corto.length, 0);
});

test("entrar a 60° es nota, no error", () => {
  const r = volar([...rampa(60, 0, 30), ...quieto(0, 90, 35), FIN]).resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 90);
  assert.ok(r.angulo !== null && r.angulo > 55);
});

test("no llega al radial antes de las 8 NM → error de interceptar", () => {
  const r = volar([[20, 60], ...quieto(20, 60, 5), [20, 60, 8.1]]).resultado!;
  assert.equal(r.aprobado, false);
  assert.equal(r.fuera.interceptar.length, 1);
});

test("dice ruta pasada en una normal → identificar NS y 65", () => {
  const r = volar(PERFECTA, 2, EJ, "pasada").resultado!;
  assert.equal(r.elementos["4"], "NS");
  assert.equal(r.calificacion, 65);
  assert.equal(r.aprobado, false);
});

test("nunca contesta → identificar NS, el tramo termina igual", () => {
  const e = volar(PERFECTA, 2, EJ, null);
  assert.equal(e.fase, "terminado");
  assert.equal(e.resultado!.dicho, null);
  assert.equal(e.resultado!.fuera.identificar.length, 1);
});

test("responderTipo solo cuenta la primera respuesta", () => {
  let e = iniciarInterceptacion(base(0, 20, 60), 2, EJ, { intento: 0, examen: false });
  assert.equal(e.preguntar, true);
  e = responderTipo(e, "pasada");
  e = responderTipo(e, "normal");
  assert.equal(e.dicho, "pasada");
  assert.equal(e.preguntar, false);
});

// Ruta pasada: en el radial 290 a 3 NM le piden el 150 (queda atrás). Vuela al 150 hasta quedar al través (radial 230).
const PASADA_AL: Ejercicio = { tipo: "pasada", radial: 150, desde: true, curso: 150, referencia: 290 };
const PASADA_AC: Ejercicio = { tipo: "pasada", radial: 150, desde: false, curso: 330, referencia: 290 };

test("ruta pasada de alejamiento: nada se mide hasta el al través", () => {
  let e = iniciarInterceptacion(en(0, 290, 150), 2, PASADA_AL, { intento: 0, examen: false });
  assert.equal(e.fase, "reposicionando");
  e = seguir(e, repetir(50, (k) => [289 - k, 150]));
  assert.equal(e.fase, "reposicionando");
  assert.deepEqual(e.angulos, []);
  assert.equal(e.corto.desde, null);
  assert.equal(e.medirDesde, null);
  e = seguir(e, [[230, 150]]);
  assert.equal(e.atraves, true);
  assert.equal(e.medirDesde, 51);
  assert.equal(e.fase, "interceptando");
});

test("ruta pasada de acercamiento: se mide desde el al través + 60 s", () => {
  let e = iniciarInterceptacion(en(0, 290, 150, 8), 2, PASADA_AC, { intento: 0, examen: false });
  e = seguir(e, [[285, 150, 7.9]]);
  assert.equal(e.fase, "reposicionando", "no pasa la estación por empezar del otro lado");
  e = seguir(e, [[230, 150, 6]]);
  assert.equal(e.medirDesde, 62);
  e = seguir(e, repetir(58, () => [225, 150, 6]));
  assert.equal(e.previo.t, 60);
  assert.equal(e.fase, "reposicionando");
  e = seguir(e, [[220, 60, 6], [220, 60, 6]]);
  assert.equal(e.fase, "interceptando");
});

test("esperarNm 3: espera sin ejercicio y lo genera a las 3 NM con el radial de ese momento", () => {
  const ctx = { intento: 2, examen: false, tramos: tramosDe(2, false) };
  let e = armarInterceptacion(en(0, 300, 120, 1), 2, ctx);
  assert.equal(e.fase, "esperando");
  assert.equal(e.ejercicio, null);
  assert.equal(e.preguntar, false);
  e = seguir(e, [[300, 120, 2], [300, 120, 2.9]]);
  assert.equal(e.fase, "esperando");
  e = seguir(e, [[47, 120, 3.1]]);
  assert.equal(e.fase, "reposicionando");
  assert.equal(e.ejercicio!.referencia, 47);
  assert.equal(e.ejercicio!.tipo, "pasada");
  assert.equal(e.inicio.t, 3);
  assert.equal(e.preguntar, true);
});

test("ctx.primero en el intento 0 se usa tal cual; en el 1, no", () => {
  const primero: Ejercicio = { tipo: "normal", radial: 310, desde: true, curso: 310, referencia: 290 };
  const tramos = tramosDe(1, false);
  assert.deepEqual(armarInterceptacion(en(0, 300, 290, 1.5), 2, { intento: 0, examen: false, tramos, primero }).ejercicio, primero);
  const otro = armarInterceptacion(en(0, 90, 270, 8), 2, { intento: 1, examen: false, tramos, primero }).ejercicio!;
  assert.equal(otro.desde, false);
  assert.equal(otro.referencia, 90);
});

test("dentro del cono (1.5 NM) la barra al otro lado no cuenta como pasarse", () => {
  const r = volar([...rampa(20, 0, 60), ...quieto(-6, 90, 5, 1.5), ...quieto(0, 90, 35), FIN]).resultado!;
  assert.equal(r.fuera.sobrepaso.length, 0);
  assert.equal(r.aprobado, true);
});

test("15 min sin cruzar → termina con error de interceptar", () => {
  const r = volar([[20, 60], ...quieto(20, 0, 910)]).resultado!;
  assert.equal(r.aprobado, false);
  assert.equal(r.fuera.interceptar.length, 1);
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

test("el segundo tramo de la lección 1 es un acercamiento normal", () => {
  const e = armarInterceptacion(base(0, 0, 90, 8), 2, { intento: 1, examen: false, tramos: tramosDe(1, false) });
  assert.equal(e.ejercicio!.desde, false);
  assert.equal(e.ejercicio!.tipo, "normal");
});

// Lo que dice el instructor.
const PRACTICA = { intento: 0, examen: false };

test("la instrucción no dice el tipo ni el curso", () => {
  for (const idioma of ["es", "en"] as const)
    for (const tipo of ["normal", "pasada"] as const) {
      const s = instruccionTramo({ tipo, radial: 150, desde: true, curso: 150, referencia: 290 }, "GDL", idioma, false);
      assert.doesNotMatch(s, /normal|pasada|passed|behind|OBS/i);
    }
  assert.equal(instruccionTramo({ tipo: "normal", radial: 310, desde: true, curso: 310, referencia: 290 }, "GDL", "es", true), "Después del despegue, aléjate por el radial 310 de GDL.");
  assert.equal(instruccionTramo({ tipo: "pasada", radial: 40, desde: false, curso: 220, referencia: 200 }, "GDL", "es", false), "Acércate por el radial 040 de GDL.");
  assert.equal(instruccionTramo({ tipo: "normal", radial: 40, desde: false, curso: 220, referencia: 60 }, "GDL", "en", false), "Proceed inbound on the 040 radial of GDL.");
});

test("la orden al empezar es la instrucción, sin el tipo; la pregunta la hace la página", () => {
  const e = iniciarInterceptacion(en(0, 290, 150), 2, PASADA_AL, PRACTICA);
  assert.equal(pasoInterceptacion(e, null), "intercepta");
  const orden = ordenInterceptacion(null, "intercepta", e, "es")!;
  assert.match(orden, /^Aléjate por el radial 150\./);
  assert.doesNotMatch(orden, /ruta pasada|normal/i);
  assert.equal(PREGUNTA_TIPO.es, "¿Interceptación normal o ruta pasada?");
  // En pantalla la pregunta se queda mientras no conteste.
  assert.match(textoPasoInterceptacion("intercepta", e, "es"), /¿Interceptación normal o ruta pasada\?/);
});

test("respondida en práctica: confirma o corrige con los grados; en el examen calla", () => {
  const e = iniciarInterceptacion(en(0, 290, 150), 2, PASADA_AL, PRACTICA);
  const mal = responderTipo(e, "normal");
  assert.equal(pasoInterceptacion(mal, null), "respondida");
  assert.equal(ordenInterceptacion("intercepta", "respondida", mal, "es"), "Es ruta pasada: el 150 queda a 140°, atrás de ti.");
  assert.equal(ordenInterceptacion("intercepta", "respondida", mal, "en"), "It's a passed route: the 150 is 140 degrees away, behind you.");
  assert.equal(ordenInterceptacion("intercepta", "respondida", responderTipo(e, "pasada"), "es"), "Correcto: ruta pasada.");
  const normal = responderTipo(iniciarInterceptacion(base(0, 20, 60), 2, EJ, PRACTICA), "pasada");
  assert.equal(ordenInterceptacion("intercepta", "respondida", normal, "es"), "Es normal: el 090 queda a 30°, adelante de ti.");
  const examen = responderTipo(iniciarInterceptacion(en(0, 290, 150), 2, PASADA_AL, { intento: 0, examen: true }), "normal");
  assert.equal(ordenInterceptacion("intercepta", "respondida", examen, "es"), null);
});

test("esperando y mantén dicen la distancia", () => {
  const e = armarInterceptacion(en(0, 300, 120, 1), 2, { intento: 2, examen: false, tramos: tramosDe(2, false) });
  assert.equal(pasoInterceptacion(e, null), "espera");
  assert.equal(ordenInterceptacion(null, "espera", e, "es"), "Sigue alejándote; a las 3 millas te doy el siguiente radial.");
  const m = volar([...rampa(20, 0, 60), ...quieto(0, 90, 5)]);
  assert.equal(pasoInterceptacion(m, null), "manten");
  assert.equal(ordenInterceptacion("respondida", "manten", m, "es"), "Barra centrada: mantenla hasta las 8 millas.");
});

test("el aviso del OBS espera a que conteste", () => {
  const e = iniciarInterceptacion(en(0, 290, 150), 2, PASADA_AL, PRACTICA);
  const m = { ...en(1, 285, 150), navObs: 0 };
  assert.equal(avisoInterceptacion(e, m, "practica", "es"), null);
  assert.equal(avisoInterceptacion(responderTipo(e, "pasada"), m, "practica", "es")?.clave, "obs");
});

test("explicar: identificación fallida, sin respuesta, y un resultado viejo sin tipo", () => {
  const dijo = volar(PERFECTA, 2, EJ, "pasada").resultado!;
  assert.ok(explicarInterceptacion(dijo, "es").some((l) => l.tipo === "mal" && l.texto === "Dijiste ruta pasada; era normal."));
  const nada = volar(PERFECTA, 2, EJ, null).resultado!;
  assert.ok(explicarInterceptacion(nada, "es").some((l) => l.texto === "No dijiste si era normal o ruta pasada."));
  const bien = volar(PERFECTA).resultado!;
  const viejo = { ...bien, ejercicio: { caso: "alejandose", radial: 90, desde: true, curso: 90 }, fuera: { interceptar: [], sobrepaso: [], corto: [] }, dicho: undefined } as unknown as typeof bien;
  assert.deepEqual(explicarInterceptacion(viejo, "es").map((l) => l.tipo), ["bien"]);
  assert.equal(masFalladoInterceptacion([viejo, dijo], "es"), "Lo que más se te complicó fue decir si era normal o ruta pasada.");
  // El vuelo encadenado no repite tramos.
  assert.equal(repetirInterceptacion(dijo, "es"), null);
});

test("textos en inglés sin caracteres del español", () => {
  const e = responderTipo(iniciarInterceptacion(en(0, 290, 150), 2, PASADA_AL, PRACTICA), "normal");
  const pasos: PasoInterceptacion[] = ["intercepta", "respondida", "manten"];
  const textos = [
    ...briefingInterceptacion("en"), ...briefingRutaPasada("en"), PREGUNTA_TIPO.en,
    ...pasos.map((p) => textoPasoInterceptacion(p, e, "en")), ordenInterceptacion("intercepta", "respondida", e, "en")!,
    ...explicarInterceptacion(volar(PERFECTA, 2, EJ, null).resultado!, "en").map((l) => l.texto),
  ];
  for (const linea of textos) assert.doesNotMatch(linea, /[áéíóúñ¿¡]/i);
});

// Revisión final: un simulador cinemático (VOR en el origen, x este, y norte, NM; viraje estándar de 3°/s).
const radialDe = (x: number, y: number) => (((Math.atan2(x, y) * 180) / Math.PI) + 360) % 360;
const n180 = (g: number) => ((((g + 180) % 360) + 360) % 360) - 180;
const enXY = (t: number, x: number, y: number, rumbo: number, kt: number): Muestra => ({ ...en(t, radialDe(x, y), rumbo, Math.hypot(x, y)), velocidad: kt });

/** Ruta pasada de acercamiento volada como dice la tarjeta (regla de 1 minuto), desde 8 NM en el R-290. */
function unMinuto(radial: number, kt: number): EvaluacionInterceptacion {
  const gs = kt / 3600;
  let [x, y, rumbo, t] = [8 * Math.sin((290 * Math.PI) / 180), 8 * Math.cos((290 * Math.PI) / 180), 290, 0];
  const ej: Ejercicio = { tipo: "pasada", radial, desde: false, curso: (radial + 180) % 360, referencia: 290 };
  let e = responderTipo(iniciarInterceptacion(enXY(0, x, y, rumbo, kt), 2, ej, { intento: 0, examen: false }), "pasada");
  let [fase, reloj, meta] = ["vira", -1, radial];
  while (e.fase !== "terminado" && e.fase !== "invalido" && t < 2000) {
    const r = radialDe(x, y);
    if (fase === "vira" && Math.abs(n180(r - (radial + 180))) >= 90) [fase, reloj] = ["minuto", t];
    else if (fase === "minuto" && t - reloj >= 60) [fase, meta] = ["corta", (radial - 90 * Math.sign(n180(r - radial)) + 360) % 360];
    else if (fase === "corta" && Math.abs(n180(r - radial)) <= 10) [fase, meta] = ["adentro", (radial + 180) % 360];
    else if (fase === "adentro") meta = (radial + 180 + Math.max(-30, Math.min(30, 3 * n180(r - radial))) + 360) % 360;
    const d = n180(meta - rumbo);
    rumbo = (rumbo + Math.sign(d) * Math.min(3, Math.abs(d)) + 360) % 360;
    x += gs * Math.sin((rumbo * Math.PI) / 180);
    y += gs * Math.cos((rumbo * Math.PI) / 180);
    e = avanzarInterceptacion(e, enXY(++t, x, y, rumbo, kt));
  }
  return e;
}

test("ruta pasada de acercamiento con la regla de 1 minuto a 80 y 90 kt: llega al radial dentro de las 2 NM y aprueba", () => {
  for (const kt of [80, 90])
    for (const radial of [130, 150, 170]) {
      const e = unMinuto(radial, kt);
      assert.equal(e.fase, "terminado", `${kt} kt R-${radial}: ${e.motivo}`);
      assert.deepEqual(e.resultado!.fuera.interceptar, [], `${kt} kt R-${radial}`);
      assert.equal(e.resultado!.aprobado, true, `${kt} kt R-${radial}: ${JSON.stringify(e.resultado!.elementos)}`);
    }
});

test("dentro del cono, a menos de media milla, no se da por llegado al radial", () => {
  const ej: Ejercicio = { tipo: "normal", radial: 90, desde: false, curso: 270, referencia: 60 };
  let e = iniciarInterceptacion(en(0, 80, 270, 0.3), 2, ej, { intento: 0, examen: false });
  e = seguir(e, [[90, 270, 0.3]]);
  assert.equal(e.cruce, null);
});

test("a 0.8 puntos del lado de la estación por 30 s cuenta como llegar al radial (como antes del vuelo encadenado)", () => {
  const e = volar([...rampa(20, 2, 60), ...quieto(1.6, 90, 35), FIN]);
  assert.equal(e.fase, "terminado");
  assert.deepEqual(e.resultado!.fuera.interceptar, []);
});

test("el primer tramo dicho en tierra se cambia en el aire si ya no es del tipo que toca", () => {
  const tramos = [{ desde: true, tipo: "normal" as const }];
  // En tierra la referencia era el 290: el 330 era normal. En el aire va por el 200: el 330 queda a 130°.
  const primero: Ejercicio = { tipo: "normal", radial: 330, desde: true, curso: 330, referencia: 290 };
  const otro = armarInterceptacion(en(0, 200, 200), 2, { intento: 0, examen: false, tramos, primero });
  assert.equal(otro.ejercicio!.tipo, "normal");
  assert.ok(Math.abs(n180(otro.ejercicio!.radial - 200)) <= 90, String(otro.ejercicio!.radial));
  // Si sigue siendo normal desde donde va, se queda el que oyó en tierra.
  const igual = armarInterceptacion(en(0, 300, 300), 2, { intento: 0, examen: false, tramos, primero });
  assert.equal(igual.ejercicio!.radial, 330);
});
