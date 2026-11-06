import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Resultado } from "./evaluador.ts";
import { simularManiobra, simularRecto } from "./simular.ts";
import { ACTIVIDADES } from "./actividades.ts";
import { armarRecto, avanzarRecto } from "./evaluadorRecto.ts";
import { masFalladoRecto, repetirRecto } from "./explicacionRecto.ts";
import { briefing, debriefing, listaPasos, queHacer, vozDebriefing, type Material } from "./briefing.ts";
import { BANCO } from "./bancoPreguntas.ts";
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

test("debriefing con todos los intentos iguales no repite mejor y más bajo", () => {
  const es = debriefing([con("practica", 90), con("checkride", 90)], MATERIAL).lineas.join(" ");
  assert.ok(es.includes("Los 2 intentos sacaron 90 de 100."), es);
  assert.doesNotMatch(es, /El mejor|El más bajo/);
  const en = debriefing([con("practica", 90), con("checkride", 90)], MATERIAL, "en").lineas.join(" ");
  assert.ok(en.includes("All 2 attempts scored 90 out of 100."), en);
});

const noAprobado = (modo: "practica" | "checkride"): IntentoSesion => ({ modo, resultado: { ...base, calificacion: 60, aprobado: false }, id: null });

test("el debriefing suma las preguntas y la voz las dice en Solo lo necesario", () => {
  const intentos = [con("practica", 70), noAprobado("checkride")];
  const d = debriefing(intentos, MATERIAL, "es", [{ id: BANCO[0].id, correcta: false }]);
  assert.ok(d.lineas.includes("Preguntas: 0 de 1 correctas."));
  assert.ok(d.lineas.at(-1)!.startsWith("Repite"));
  assert.ok(vozDebriefing(d.lineas, intentos, "necesario").includes("Preguntas: 0 de 1 correctas."));
});

test("en Detallado la voz no repite el «Repite» que ya dijo el checkride", () => {
  const intentos = [con("practica", 70), noAprobado("checkride")];
  const d = debriefing(intentos, MATERIAL);
  assert.ok(d.lineas.at(-1)!.startsWith("Repite"), "la pantalla sí lo muestra");
  assert.deepEqual(vozDebriefing(d.lineas, intentos, "detallado"), d.lineas.slice(0, -1));
  // Si lo último fue práctica, su comentario no dijo «Repite»: el debriefing sí lo dice.
  const practica = [con("checkride", 90), noAprobado("practica")];
  const p = debriefing(practica, MATERIAL);
  assert.ok(p.lineas.at(-1)!.startsWith("Repite"), p.lineas.join(" | "));
  assert.deepEqual(vozDebriefing(p.lineas, practica, "detallado"), p.lineas);
});

test("en Solo lo necesario la voz lee la primera línea y la del checkride", () => {
  const intentos = [con("practica", 70), con("checkride", 90)];
  const d = debriefing(intentos, MATERIAL);
  assert.deepEqual(vozDebriefing(d.lineas, intentos, "necesario"), [d.lineas[0], "Checkride: aprobado, 90 de 100."]);
});

test("el debriefing de recto y nivelado nombra el intento calificado", () => {
  const ms = simularRecto({ deriva: { campo: "altitud", valor: -150, desde: 30, segundos: 6 } });
  const r = ms.slice(1).reduce(avanzarRecto, armarRecto(ms[0])).resultado!;
  const op = { masFallado: masFalladoRecto, repetir: repetirRecto, calificado: ACTIVIDADES.find((a) => a.id === "recto-nivelado")!.calificado };
  const intentos: IntentoSesion[] = [{ modo: "checkride", resultado: r, id: null }];
  const d = debriefing(intentos, MATERIAL, "es", [], op);
  assert.ok(d.lineas.some((l) => l.startsWith("Intento calificado: no aprobado")), d.lineas.join("\n"));
  assert.equal(d.lineas.at(-1), "Repite: recto y nivelado");
  assert.ok(vozDebriefing(d.lineas, intentos, "necesario").some((l) => l.startsWith("Intento calificado:")));
});