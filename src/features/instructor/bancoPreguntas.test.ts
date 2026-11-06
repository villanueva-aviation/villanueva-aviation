import { test } from "node:test";
import assert from "node:assert/strict";
import { BANCO } from "./bancoPreguntas.ts";
import { calificarRespuesta, normalizar } from "./preguntas.ts";

test("15 a 20 preguntas por tema", () => {
  for (const t of ["viraje-escarpado", "c172"] as const) {
    const n = BANCO.filter((p) => p.tema === t).length;
    assert.ok(n >= 15 && n <= 20, `${t}: ${n}`);
  }
});

test("ids únicos y textos completos en los dos idiomas", () => {
  assert.equal(new Set(BANCO.map((p) => p.id)).size, BANCO.length);
  for (const p of BANCO) for (const i of ["es", "en"] as const) {
    assert.ok(p[i].pregunta && p[i].respuesta && p[i].aceptadas.length, `${p.id} ${i}`);
  }
});

test("la respuesta que dice el instructor se califica como correcta", () => {
  for (const p of BANCO) for (const i of ["es", "en"] as const) assert.ok(calificarRespuesta(p[i].respuesta, p, i), `${p.id} ${i}`);
});

test("en inglés no hay español", () => {
  for (const p of BANCO) assert.doesNotMatch(`${p.en.pregunta} ${p.en.respuesta}`, /[áéíóúñ¿¡]/, p.id);
});

test("las preguntas no se aceptan con un sí o un no", () => {
  for (const p of BANCO) for (const i of ["es", "en"] as const) for (const a of p[i].aceptadas) {
    assert.ok(!["si", "no", "yes"].includes(normalizar(a, i)), `${p.id}: ${a}`);
  }
});
