import { test } from "node:test";
import assert from "node:assert/strict";
import { CANDADO_NUEVO, candadoAbiertoDeInicio, capituloDeUrl, etapaInicial, responderCandado } from "./reglas.ts";
import type { Bloque } from "./motor.ts";

test("candado: bien a la primera abre", () => {
  assert.deepEqual(responderCandado(CANDADO_NUEVO, 2, 2), { fallos: 0, abierto: true, elegida: 2 });
});

test("candado: un fallo deja reintentar; el segundo abre", () => {
  const uno = responderCandado(CANDADO_NUEVO, 0, 2);
  assert.deepEqual(uno, { fallos: 1, abierto: false, elegida: 0 });
  assert.deepEqual(responderCandado(uno, 1, 2), { fallos: 2, abierto: true, elegida: 1 });
});

test("candado: ya abierto no cambia", () => {
  const abierto = { fallos: 0, abierto: true, elegida: 2 };
  assert.equal(responderCandado(abierto, 0, 2), abierto);
});

const lect = (...ids: string[]): Bloque => ({ tipo: "lectura", temas: ids.map((id) => ({ id, titulo: id, texto: id })) });
const cand: Bloque = { tipo: "candado", pregunta: { id: "q", pregunta: "?", opciones: ["a", "b"], correcta: 0 } };
const cierre: Bloque = { tipo: "cierre" };

test("candadoAbiertoDeInicio: abierto si el tema que sigue ya se leyó", () => {
  const bloques = [lect("a"), cand, lect("b"), cierre];
  assert.equal(
    candadoAbiertoDeInicio(bloques, 1, (id) => id === "a" || id === "b"),
    true,
  );
  assert.equal(
    candadoAbiertoDeInicio(bloques, 1, (id) => id === "a"),
    false,
  );
});

test("candadoAbiertoDeInicio: al final del capítulo, abierto si todo el capítulo se leyó", () => {
  const bloques = [lect("a", "b"), cand, cand, cierre];
  assert.equal(
    candadoAbiertoDeInicio(bloques, 2, () => true),
    true,
  );
  assert.equal(
    candadoAbiertoDeInicio(bloques, 2, (id) => id === "a"),
    false,
  );
});

test("capituloDeUrl: ?capitulo manda, ?mision es el enlace viejo, lo inválido cae en el inicial", () => {
  assert.equal(capituloDeUrl("2", null, 6, 0), 1);
  assert.equal(capituloDeUrl(null, "3", 6, 0), 2);
  assert.equal(capituloDeUrl("2", "5", 6, 0), 1);
  assert.equal(capituloDeUrl("99", null, 6, 4), 4);
  assert.equal(capituloDeUrl("abc", null, 6, 4), 4);
  assert.equal(capituloDeUrl("0", null, 6, 4), 4);
  assert.equal(capituloDeUrl(null, null, 6, 4), 4);
});

test("etapaInicial: leccion, interactividad y misiones llevan a la lección", () => {
  const etapas = ["introduccion", "leccion", "practica", "evaluacion", "proyecto"];
  for (const e of ["leccion", "interactividad", "misiones"]) assert.equal(etapaInicial(e, etapas), "leccion");
  assert.equal(etapaInicial("practica", etapas), "practica");
  assert.equal(etapaInicial("otra", etapas), "introduccion");
  assert.equal(etapaInicial(null, etapas), "introduccion");
});
