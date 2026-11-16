import { test } from "node:test";
import assert from "node:assert/strict";
import { entradaEspera } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { armarInterceptacion, avanzarInterceptacion, type EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import { alejamientoSiguiente, generarLlegada, norm180, norm360, radialEsperaDe, type Llegada } from "./navIfr.ts";
import { pasoInterceptacion, textoInterceptacion, textoPasoInterceptacion } from "./textosInterceptacion.ts";
import { autorizacionLlegada } from "./textosLlegada.ts";

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
