import { test } from "node:test";
import assert from "node:assert/strict";
import { entradaEspera } from "../entrenador/esperas.ts";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";
import { crearChecklist } from "./checklistVoz.ts";
import { debriefingRepaso } from "./debriefingRepaso.ts";
import type { Muestra } from "./evaluador.ts";
import { LECCIONES_IFR, leccionIfrDe, lineaEjercicios } from "./lecciones.ts";
import type { ResultadoComun } from "./maniobras.ts";
import {
  alResultado, anularLlegada, crearRepaso, esLlegada, llegadaEmpezada, llegadasDe, maniobrasDe, PARTES_LLEGADA, type EstadoRepaso,
} from "./repaso.ts";
import type { VorElegido } from "./vorSim.ts";
import { armarArco, avanzarArco } from "./evaluadorArco.ts";
import { armarEspera, avanzarEspera } from "./evaluadorEspera.ts";
import { armarInterceptacion, avanzarInterceptacion, type EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import { alejamientoSiguiente, generarLlegada, norm180, norm360, radialEsperaDe, type Llegada } from "./navIfr.ts";
import { pasoInterceptacion, textoInterceptacion, textoPasoInterceptacion } from "./textosInterceptacion.ts";
import { pasoEspera } from "./textosEspera.ts";
import { autorizacionLlegada, briefingLlegada, ordenDespegue, pideRepetir } from "./textosLlegada.ts";

// Lección IFR 5: la llegada (spec 2026-11-16).

test("generarLlegada: R1 a 20–40° del avión, arco de 8–10 NM acercándose hasta 30–60° más allá", () => {
  for (const x of [0, 0.2, 0.5, 0.8, 0.99]) {
    const ll = generarLlegada(300, 9000, undefined, () => x);
    const d1 = Math.abs(norm180(ll.r1 - 300));
    assert.ok([20, 30, 40].includes(d1), String(d1));
    assert.ok(ll.arco.radioNm >= 8 && ll.arco.radioNm <= 10);
    assert.equal(ll.arco.desde, ll.r1);
    assert.equal(ll.arco.alejandose, false);
    assert.equal(ll.arco.saleAlejandose, false);
    assert.ok([30, 40, 50, 60].includes(Math.abs(norm180(ll.arco.hasta - ll.r1))));
    assert.equal(ll.espera.altitudFt, 9000);
    assert.equal(ll.espera.carta, false);
    assert.equal(ll.espera.tramoSeg, 60);
  }
});

test("generarLlegada: la espera da la entrada sorteada llegando por R2, nunca sobre R2, y cambia de entrada", () => {
  for (let radial = 0; radial < 360; radial += 10)
    for (const anterior of [undefined, ...(["directa", "paralela", "gota"] as const)]) {
      const prev = anterior && generarLlegada(radial, 9000, undefined, () => 0.5);
      const ll = generarLlegada(radial, 9000, prev && { ...prev, entrada: anterior }, Math.random);
      const r2 = ll.arco.hasta;
      assert.ok(Math.abs(norm180(radialEsperaDe(ll) - r2)) >= 30);
      for (const d of [-10, 0, 10]) assert.equal(entradaEspera(norm360(r2 + 180 + d), radialEsperaDe(ll), ll.espera.giros), ll.entrada);
      if (anterior) assert.notEqual(ll.entrada, anterior);
    }
});

test("alejamientoSiguiente: sigue de largo por R2", () => {
  const ll = generarLlegada(300, 9000, undefined, () => 0);
  assert.equal(alejamientoSiguiente(ll), norm360(ll.arco.hasta + 180));
});

// ── Tarea 2: la interceptación de la lección 5 ──
const muestraNav = (t: number, radial: number, dme: number, rumbo: number): Muestra => ({
  t, inclinacion: 0, altitud: 9000, velocidad: 110, rumbo, bola: 0, agl: 4000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 117.3, navObs: 0, navRadial: norm360(radial), navDesv: 0, navDesde: 1, navDme: dme,
  navTieneDme: true, navSenal: true, gpsNav: false,
});
const CTX5 = { intento: 0, examen: false, llegadas: [] as Llegada[], vor: "GDL", altitudFt: 9000 };

/** Alejándose por el 290 hasta las 15 NM: ya con la llegada sorteada. */
function conLlegada(): EvaluacionInterceptacion {
  const e = armarInterceptacion(muestraNav(0, 290, 12, 290), 2, CTX5);
  return avanzarInterceptacion(e, muestraNav(1, 290, 15.1, 290));
}
/** Del 290 hasta R1 entre 15 y 13 NM, y por R1 hasta `hastaNm`. `llega`: false = se queda 10° antes de R1. */
function aLaLlegada(e: EvaluacionInterceptacion, hastaNm: number, llega = true): EvaluacionInterceptacion {
  const r1 = e.llegada!.r1;
  const dif = norm180(r1 - 290);
  const curso = norm360(r1 + 180);
  let t = 2;
  for (let k = 1; k <= 60; k++) e = avanzarInterceptacion(e, muestraNav(t++, 290 + (llega ? dif : dif - Math.sign(dif) * 10) * (k / 60), 15 - (2 * k) / 60, curso + Math.sign(dif) * 30));
  for (let dme = 13; dme > hastaNm && e.fase !== "terminado"; dme -= 0.03)
    e = avanzarInterceptacion(e, muestraNav(t++, llega ? r1 : r1 - Math.sign(dif) * 10, dme, curso));
  return e;
}

test("lección 5: la interceptación espera las 15 NM, sin pregunta", () => {
  const e = armarInterceptacion(muestraNav(0, 290, 12, 290), 2, CTX5);
  assert.equal(e.fase, "esperando");
  assert.equal(e.paraLlegada, true);
  assert.equal(textoInterceptacion("espera", e, "es"), "Sigue alejándote; a las 15 millas te doy la llegada.");
});

test("lección 5: a las 15 NM sortea la llegada e intercepta R1 acercándose, sin pregunta", () => {
  const e = conLlegada();
  assert.ok(e.llegada);
  assert.equal(e.ejercicio!.radial, e.llegada!.r1);
  assert.equal(e.ejercicio!.desde, false);
  assert.equal(e.ejercicio!.tipo, "normal");
  assert.equal(e.preguntar, false);
  assert.match(textoInterceptacion("intercepta", e, "es"), /^Autorizado a GDL: intercepta el radial /);
  assert.equal(pasoInterceptacion(e, null), "autorizada");
  assert.doesNotMatch(textoPasoInterceptacion(pasoInterceptacion(e, null), e, "es"), /ruta pasada/);
});

test("lección 5: termina a radio + 1 NM; establecido = aprobado sin error de identificar", () => {
  const e0 = conLlegada();
  const e = aLaLlegada(e0, 0);
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.deepEqual(r.fuera.identificar, []);
  assert.deepEqual(r.fuera.interceptar, []);
  assert.equal(r.aprobado, true, JSON.stringify(r.fuera));
  assert.deepEqual(r.llegada, e0.llegada);
  assert.ok(r.dmeFin! <= e0.llegada!.arco.radioNm + 1 && r.dmeFin! > e0.llegada!.arco.radioNm + 0.9);
});

test("lección 5: llegar a radio + 1 NM sin cruzar R1 es error de interceptar", () => {
  const e = aLaLlegada(conLlegada(), 0, false);
  assert.equal(e.fase, "terminado");
  assert.equal(e.resultado!.fuera.interceptar.length, 1);
  assert.deepEqual(e.resultado!.fuera.identificar, []);
});

test("autorizacionLlegada en español y en inglés", () => {
  const ll: Llegada = {
    r1: 240,
    arco: { radioNm: 8, desde: 240, hasta: 200, sentido: -1, alejandose: false, saleAlejandose: false },
    espera: { acercamiento: 220, giros: "derecha", tramoSeg: 60, carta: false, altitudFt: 9000 },
    entrada: "paralela",
  };
  assert.equal(
    autorizacionLlegada(ll, "GDL", "es"),
    "Autorizado a GDL: intercepta el radial 240 acercándote, únete al arco de 8 millas hasta el radial 200, acércate a GDL y espera al noreste en el radial 040, virajes a la derecha, mantén 9,000 pies.",
  );
  assert.equal(
    autorizacionLlegada(ll, "GDL", "en"),
    "Cleared to GDL: intercept the 240 radial inbound, join the 8 mile arc to the 200 radial, proceed inbound to GDL and hold northeast on the 040 radial, right turns, maintain 9,000 feet.",
  );
});

// ── Tarea 3: el arco y la espera de la lección 5 ──
const LL = generarLlegada(300, 9000, undefined, () => 0);
/** Acercándose por `radial` (curso radial + 180) a `dme` NM. */
const acercandose = (t: number, radial: number, dme: number) => muestraNav(t, radial, dme, norm360(radial + 180));

test("lección 5: el arco arranca con el de la llegada, hacia el arco y con la pregunta del lado", () => {
  const e = armarArco(acercandose(0, LL.r1, LL.arco.radioNm + 1), 2, { intento: 1, examen: false, llegadas: [LL] });
  assert.equal(e.fase, "hacia-arco");
  assert.deepEqual(e.ejercicio, LL.arco);
  assert.equal(e.preguntar, true);
});

test("lección 5: el arco armado ya adentro del radio termina con error de entrada", () => {
  let e = armarArco(acercandose(0, LL.r1, LL.arco.radioNm - 1.5), 2, { intento: 1, examen: false, llegadas: [LL] });
  for (let t = 1; t <= 120 && e.fase !== "terminado"; t++) e = avanzarArco(e, acercandose(t, LL.r1, LL.arco.radioNm - 1.5 - t * 0.03));
  assert.equal(e.fase, "terminado");
  assert.ok(e.resultado!.fuera.entrada.length > 0);
});

test("lección 5: la espera llega por R2 con la espera de la llegada y pregunta la entrada", () => {
  const r2 = LL.arco.hasta;
  let e = armarEspera(acercandose(0, r2, 9), 2, { intento: 2, examen: false, llegadas: [LL], altitudFt: 9000 });
  assert.equal(e.ejercicio.llegada, r2);
  assert.equal(e.ejercicio.acercamiento, LL.espera.acercamiento);
  assert.equal(e.ejercicio.giros, LL.espera.giros);
  assert.equal(e.fase, "llegando");
  for (let t = 1; t <= 200 && pasoEspera(e, null) !== "pregunta"; t++) e = avanzarEspera(e, acercandose(t, r2, 9 - t * 0.03));
  assert.equal(pasoEspera(e, null), "pregunta");
});

// ── Tarea 4: la lección y el encadenado ──
const L5 = LECCIONES_IFR[4];
const resL = (aprobado: boolean, llegada?: Llegada): ResultadoComun =>
  ({ aprobado, calificacion: aprobado ? 100 : 65, elementos: {}, avisos: [], muestras: [], ...(llegada ? { llegada } : {}) }) as ResultadoComun;
const enVuelo = (modo: "practica" | "checkride", actual: number): EstadoRepaso => ({
  ...crearRepaso(modo, maniobrasDe(L5, Math.random, modo), 2, "ifr"),
  etapa: "maniobra", actual, vor: { ident: "GDL" } as VorElegido,
});

test("lección 5: disponible, con DME, 2 llegadas en práctica y 1 en examen", () => {
  assert.equal(L5.disponible, true);
  assert.equal(L5.requiereDme, true);
  assert.equal(L5.llegada, true);
  assert.equal(leccionIfrDe("5"), L5);
  assert.deepEqual(maniobrasDe(L5, Math.random, "practica"), [...PARTES_LLEGADA, ...PARTES_LLEGADA]);
  assert.deepEqual(maniobrasDe(L5, Math.random, "checkride"), PARTES_LLEGADA);
  assert.equal(lineaEjercicios(L5, false, "es"), "Son 2 llegadas seguidas, con recordatorios y consejos.");
  assert.equal(lineaEjercicios(L5, false, "en"), "2 arrivals in a row, with reminders and tips.");
  assert.equal(lineaEjercicios(L5, true, "es"), "Es 1 llegada calificada, sin consejos.");
  assert.equal(lineaEjercicios(L5, true, "en"), "One graded arrival, no tips.");
});

test("esLlegada: solo el sorteo de la lección 5", () => {
  assert.equal(esLlegada(maniobrasDe(L5)), true);
  for (const n of [1, 3, 4]) assert.equal(esLlegada(maniobrasDe(LECCIONES_IFR[n - 1])), false);
});

test("lección 5: una parte no aprobada no se repite; entre partes no se dice nada", () => {
  const r = alResultado(enVuelo("practica", 0), resL(false, LL), null, "es");
  assert.equal(r.estado.actual, 1);
  assert.deepEqual(r.decir, []);
  assert.deepEqual(llegadasDe(r.estado), [LL]);
});

test("lección 5: al terminar la espera de la llegada 1 manda alejarse por el radial que sigue de largo", () => {
  let e = enVuelo("practica", 0);
  e = alResultado(e, resL(true, LL), null, "es").estado;
  e = alResultado(e, resL(true), null, "es").estado;
  const r = alResultado(e, resL(true), null, "es");
  assert.equal(r.estado.actual, 3);
  const x = String(alejamientoSiguiente(LL) || 360).padStart(3, "0");
  assert.deepEqual(r.decir, [`Llegada 1 terminada. Aléjate por el radial ${x} de GDL; a las 15 millas te doy la siguiente llegada.`]);
});

test("anularLlegada: en práctica regresa al principio de la llegada; en examen anula", () => {
  let e = enVuelo("practica", 3);
  e = alResultado(e, resL(true, LL), null, "es").estado;
  const r = anularLlegada(e, "Se perdió la señal del VOR por más de 10 segundos.", "es");
  assert.equal(r.estado.actual, 3);
  assert.equal(r.estado.hechas[3].resultado, null);
  assert.deepEqual(r.decir, ["Se anuló la llegada: Se perdió la señal del VOR por más de 10 segundos. Aléjate de GDL por donde vas; a las 15 millas te doy otra."]);
  const x = anularLlegada(enVuelo("checkride", 1), "Se perdió la señal del VOR por más de 10 segundos.", "es");
  assert.equal(x.estado.etapa, "invalido");
  assert.match(x.estado.motivo ?? "", /señal/);
});

test("llegadaEmpezada: con la autorización ya dada o después de la interceptación", () => {
  assert.equal(llegadaEmpezada(enVuelo("practica", 0), null), false);
  assert.equal(llegadaEmpezada(enVuelo("practica", 3), {}), false);
  assert.equal(llegadaEmpezada(enVuelo("practica", 1), null), true);
  assert.equal(llegadaEmpezada(enVuelo("practica", 0), { llegada: LL }), true);
});

test("debriefing de la lección 5: cada llegada aprobada solo si sus tres partes aprueban", () => {
  let e = enVuelo("practica", 0);
  for (const r of [resL(true, LL), resL(true), resL(true), resL(true, LL), resL(false), resL(true)]) e = alResultado(e, r, null, "es").estado;
  const nav = debriefingRepaso({ ...e, etapa: "terminado" }, crearChecklist(CHECKLIST_VOZ_C172), "es").partes.find((p) => p.titulo === "Navegación")!;
  assert.ok(nav.bien.includes("Llegada 1: aprobada"));
  assert.ok(nav.repetir.includes("Llegada 2: no aprobada"));
});

// ── Tarea 5: textos de la llegada ──
test("ordenDespegue: aléjate por el radial de la pista y a las 15 millas la llegada", () => {
  assert.equal(ordenDespegue(290, "GDL", 9000, "es"), "Después del despegue, aléjate por el radial 290 de GDL y sube a 9,000 pies. A las 15 millas te doy la llegada.");
  assert.equal(ordenDespegue(290, "GDL", 9000, "en"), "After takeoff, proceed outbound on the 290 radial of GDL and climb to 9,000 feet. At 15 miles I'll give you the arrival.");
});

test("pideRepetir: «repite» y sus variantes, no el checklist", () => {
  for (const x of ["repite", "Repita por favor", "repítela", "otra vez la autorización", "repetir autorización"]) assert.equal(pideRepetir(x, "es"), true, x);
  for (const x of ["say again", "Repeat the clearance"]) assert.equal(pideRepetir(x, "en"), true, x);
  for (const x of ["checklist antes del despegue", "derecha", "flaps arriba"]) assert.equal(pideRepetir(x, "es"), false, x);
});

test("briefingLlegada: 4 líneas, el inglés sin acentos y sin palabras prohibidas", () => {
  for (const idioma of ["es", "en"] as const) {
    const b = briefingLlegada(idioma);
    assert.equal(b.length, 4);
    for (const l of b) assert.doesNotMatch(l, /oficial|certific|licencia|official|license/i);
  }
  for (const l of briefingLlegada("en")) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
});
