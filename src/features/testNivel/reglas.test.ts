import { test } from "node:test";
import assert from "node:assert/strict";
import { areaMasDebil, filaResultado, fuenteDeEnlace, nivelTest, resumenPorArea, AREAS_TEST, type RespuestaTest } from "./reglas.ts";

test("los cortes de nivel con 12 preguntas", () => {
  assert.equal(nivelTest(0, 12), "Principiante");
  assert.equal(nivelTest(3, 12), "Principiante");
  assert.equal(nivelTest(4, 12), "Base");
  assert.equal(nivelTest(6, 12), "Base");
  assert.equal(nivelTest(7, 12), "Intermedio");
  assert.equal(nivelTest(9, 12), "Intermedio");
  assert.equal(nivelTest(10, 12), "Avanzado");
  assert.equal(nivelTest(12, 12), "Avanzado");
});

test("sin preguntas no truena", () => {
  assert.equal(nivelTest(0, 0), "Principiante");
});

const resp = (area: (typeof AREAS_TEST)[number], aciertos: boolean[]): RespuestaTest[] => aciertos.map((acierto) => ({ area, acierto }));

test("el área más débil es la que más preguntas falló", () => {
  const todas = [
    ...resp("Fundamentos", [true, true]),
    ...resp("Meteorología", [true, false]),
    ...resp("Navegación", [false, false]),
    ...resp("Comunicaciones", [true, true]),
    ...resp("Instrumentos", [true, true]),
    ...resp("IFR", [true, false]),
  ];
  assert.equal(areaMasDebil(resumenPorArea(todas)), "Navegación");
});

test("sin fallos no hay área débil", () => {
  const todas = AREAS_TEST.flatMap((a) => resp(a, [true, true]));
  assert.equal(areaMasDebil(resumenPorArea(todas)), null);
});

test("la fuente del enlace solo acepta texto simple", () => {
  assert.equal(fuenteDeEnlace("?ref=Reel1"), "reel1");
  assert.equal(fuenteDeEnlace("?ref=historia_ig-oct"), "historia_ig-oct");
  assert.equal(fuenteDeEnlace(""), null);
  assert.equal(fuenteDeEnlace("?ref=<script>"), null);
  assert.equal(fuenteDeEnlace(`?ref=${"a".repeat(41)}`), null);
});

test("la fila guardada solo trae aciertos, nivel y áreas", () => {
  const todas = [...resp("Navegación", [false, false]), ...AREAS_TEST.filter((a) => a !== "Navegación").flatMap((a) => resp(a, [true, true]))];
  const fila = filaResultado(todas, 12, "reel1");
  assert.deepEqual(Object.keys(fila).sort(), ["aciertos", "areas", "fuente", "nivel"]);
  assert.equal(fila.aciertos, 10);
  assert.equal(fila.nivel, "Avanzado");
  assert.equal(fila.areas["Navegación"], 0);
  assert.equal(fila.areas["IFR"], 2);
});
