import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Resultado } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { briefing, debriefing, listaPasos, queHacer, type Material } from "./briefing.ts";
import type { IntentoSesion } from "./sesion.ts";
import { ALTURA_SEGURA_AGL, TOLERANCIAS } from "./virajeEscarpado.ts";

const SIN_ACENTOS = /[áéíóúñ]/;
const muestras = simularManiobra();
const base: Resultado = muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0])).resultado!;
const con = (modo: "practica" | "checkride", calificacion: number): IntentoSesion => ({ modo, resultado: { ...base, calificacion }, id: null });
const MATERIAL: Material[] = [{ titulo: { es: "Checklist del C172", en: "C172 checklist" }, to: "/checklist-c172", exclusivo: false }];

test("el briefing usa las tolerancias", () => {
  const texto = briefing().join(" ");
  assert.ok(texto.includes(`±${TOLERANCIAS.altitudFt} ft`), texto);
  assert.ok(texto.includes(`${ALTURA_SEGURA_AGL.toLocaleString("en-US")} ft`), texto);
  assert.equal(briefing().length, 9);
});

test("en inglés no hay español", () => {
  for (const l of [...briefing("en"), ...listaPasos(null, "en").map((p) => p.nombre), queHacer("viraje1", "en"), queHacer("bajo", "en")]) {
    assert.doesNotMatch(l, SIN_ACENTOS, l);
  }
});

test("lista de pasos", () => {
  assert.deepEqual(
    listaPasos("nivelar1").map((p) => p.estado),
    ["hecho", "hecho", "hecho", "actual", "pendiente", "pendiente"],
  );
  assert.equal(listaPasos("despejado")[2].estado, "actual");
  assert.equal(listaPasos("entre")[4].estado, "actual");
  assert.ok(listaPasos("terminado").every((p) => p.estado === "hecho"));
});

test("qué hacer al nivelar", () => {
  assert.equal(queHacer("nivelar1"), "Empieza a nivelar unos 20° antes del rumbo de entrada y quita la presión atrás.");
  assert.equal(queHacer(null), "");
});

test("debriefing sin intentos", () => {
  const d = debriefing([], MATERIAL);
  assert.deepEqual(d.lineas, ["Hiciste 0 intentos calificados en esta sesión."]);
  assert.equal(d.material.length, 1);
});

test("debriefing compara", () => {
  const texto = debriefing([con("practica", 70), con("practica", 80), con("checkride", 90)], MATERIAL).lineas.join(" ");
  assert.ok(texto.includes("El mejor: 90 de 100 (intento 3)"), texto);
  assert.ok(texto.includes("El más bajo: 70 de 100 (intento 1)"), texto);
  assert.ok(texto.includes("pasaste de 70 a 90"), texto);
  assert.ok(texto.includes("Vas mejorando."), texto);
  assert.ok(texto.includes("Checkride: aprobado, 90 de 100."), texto);
});

test("debriefing en inglés y material en español avisado", () => {
  const d = debriefing([con("practica", 70), con("checkride", 90)], MATERIAL, "en");
  for (const l of d.lineas) assert.doesNotMatch(l, SIN_ACENTOS, l);
  assert.ok(d.material.every((m) => m.titulo.endsWith(" (in Spanish)")));
});
