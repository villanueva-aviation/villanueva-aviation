import { test } from "node:test";
import assert from "node:assert/strict";
import { CARTAS_RED, LECCIONES_RED, SLUG_RUTA_RED, leccionRed } from "./rutaRed.ts";
import { AUDIO_SETS, FRASEOLOGIA_AUTORIZACION_IFR } from "./fraseologiaATC.ts";

const IDS = ["antes-de-conectarte", "plan-de-vuelo", "carta-sid", "autorizacion", "sid-garmin", "sid-fms", "ruta-llegada", "aproximacion"];

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// "garmin": el sitio no usa la marca (regla vigente de instrumentos sin marca).
const PROHIBIDAS = /habilitacion|licencia|certificad[oa]|certificacion|horas validas|garmin/;

function textosDe(l: (typeof LECCIONES_RED)[number]): string[] {
  return [
    l.titulo,
    l.resumen,
    ...l.temas.flatMap((t) => [t.titulo, t.texto, t.clave ?? "", ...(t.puntos ?? []).flatMap((p) => [p.titulo, p.texto])]),
    ...l.practica.flatMap((q) => [q.pregunta, ...q.opciones]),
  ];
}

test("slug de la ruta", () => {
  assert.equal(SLUG_RUTA_RED, "listo-para-red");
});

test("8 lecciones en el orden del temario, numeradas 1 a 8 sin repetir", () => {
  assert.equal(LECCIONES_RED.length, 8);
  assert.deepEqual(LECCIONES_RED.map((l) => l.id), IDS);
  assert.deepEqual(LECCIONES_RED.map((l) => l.numero), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(new Set(LECCIONES_RED.map((l) => l.id)).size, 8);
});

test("cada lección tiene al menos 3 temas y 3 preguntas válidas", () => {
  for (const l of LECCIONES_RED) {
    assert.ok(l.temas.length >= 3, `${l.id}: menos de 3 temas`);
    assert.ok(l.practica.length >= 3, `${l.id}: menos de 3 preguntas`);
    for (const q of l.practica) {
      assert.ok(Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length, `${l.id}/${q.id}: correcta fuera de rango`);
    }
  }
  const temaIds = LECCIONES_RED.flatMap((l) => l.temas.map((t) => t.id));
  const preguntaIds = LECCIONES_RED.flatMap((l) => l.practica.map((q) => q.id));
  assert.equal(new Set(temaIds).size, temaIds.length, "ids de tema repetidos");
  assert.equal(new Set(preguntaIds).size, preguntaIds.length, "ids de pregunta repetidos");
});

test("videoId es null o un id de YouTube", () => {
  for (const l of LECCIONES_RED) {
    assert.ok(l.videoId === null || /^[A-Za-z0-9_-]{11}$/.test(l.videoId), `${l.id}: videoId inválido`);
  }
});

test("ningún texto usa palabras prohibidas", () => {
  const cartas = FRASEOLOGIA_AUTORIZACION_IFR.flatMap((c) => [c.situacion, c.callout, ...c.elementos.map((e) => e.descripcion)]);
  for (const texto of [...LECCIONES_RED.flatMap(textosDe), ...cartas]) {
    assert.doesNotMatch(sinAcentos(texto), PROHIBIDAS, texto.slice(0, 80));
  }
});

test("todo procedimiento citado existe en CARTAS_RED", () => {
  const conocidos = new Set(CARTAS_RED.map((c) => c.procedimiento));
  // SID/STAR: nombre de 5 letras + número y letra opcional (LONKU 1D, OVALI 1, DARAN 3A).
  // Aproximaciones: "RNP Y Rwy 05R" y similares.
  const patron = /\b[A-Z]{5} \d[A-Z]?\b|\b(?:RNP|RNAV|VOR) [A-Z] Rwy \d{2}[LRC]?\b/g;
  const textos = [...LECCIONES_RED.flatMap(textosDe), ...FRASEOLOGIA_AUTORIZACION_IFR.flatMap((c) => [c.situacion, c.callout])];
  let citados = 0;
  for (const texto of textos) {
    for (const nombre of texto.match(patron) ?? []) {
      citados++;
      assert.ok(conocidos.has(nombre), `"${nombre}" no está en CARTAS_RED`);
    }
  }
  assert.ok(citados > 0, "las lecciones deberían citar procedimientos");
});

test("cada carta trae vigencia y fuente", () => {
  assert.ok(CARTAS_RED.length >= 3);
  for (const c of CARTAS_RED) {
    assert.ok(c.vigencia.trim() && c.fuente.trim(), c.procedimiento);
  }
  for (const tipo of ["SID", "STAR", "APP"] as const) {
    assert.ok(CARTAS_RED.some((c) => c.tipo === tipo), `falta una carta ${tipo}`);
  }
});

test("la lección de autorización usa la tanda de audios de autorización IFR", () => {
  assert.equal(leccionRed("autorizacion")?.audioSetId, "autorizacion-ifr");
  assert.equal(AUDIO_SETS["autorizacion-ifr"], FRASEOLOGIA_AUTORIZACION_IFR);
  assert.equal(FRASEOLOGIA_AUTORIZACION_IFR.length, 4);
  for (const c of FRASEOLOGIA_AUTORIZACION_IFR) {
    assert.equal(c.audioUrl, undefined);
    assert.ok(c.elementos.length >= 5, c.callout);
    c.elementos.forEach((e) => assert.ok(e.palabrasClave.length > 0, e.descripcion));
  }
  assert.equal(leccionRed("no-existe"), undefined);
});
