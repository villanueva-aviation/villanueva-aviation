import { test } from "node:test";
import assert from "node:assert/strict";
import { calificarRespuesta, lineasPreguntas, normalizar, siguientePregunta, type Pregunta } from "./preguntas.ts";

test("los números con palabras pasan a cifras", () => {
  assert.equal(normalizar("Cuarenta nudos", "es"), "40 nudos");
  assert.equal(normalizar("cuarenta y cinco grados", "es"), "45 grados");
  assert.equal(normalizar("ciento cinco", "es"), "105");
  assert.equal(normalizar("mil quinientos pies", "es"), "1500 pies");
  assert.equal(normalizar("dieciséis", "es"), "16");
  assert.equal(normalizar("Forty knots", "en"), "40 knots");
  assert.equal(normalizar("one hundred five", "en"), "105");
  assert.equal(normalizar("fifteen hundred feet", "en"), "1500 feet");
  assert.equal(normalizar("¡Áreas, despejadas!", "es"), "areas despejadas");
});

test("los dígitos dichos uno por uno se juntan, como un rumbo", () => {
  assert.equal(normalizar("rumbo dos siete cero", "es"), "rumbo 270");
  assert.equal(normalizar("heading two seven zero", "en"), "heading 270");
  assert.equal(normalizar("40kt", "es"), "40 kt");
});

const VS0: Pregunta = {
  id: "t-vs0",
  tema: "c172",
  es: { pregunta: "¿Cuál es la Vs0?", respuesta: "40 nudos.", aceptadas: ["40"] },
  en: { pregunta: "What is Vs0?", respuesta: "40 knots.", aceptadas: ["40"] },
};

test("acepta la respuesta dicha de varias formas", () => {
  for (const d of ["40", "cuarenta nudos", "son 40 kt", "Cuarenta."]) assert.ok(calificarRespuesta(d, VS0, "es"), d);
  assert.ok(calificarRespuesta("forty knots", VS0, "en"));
});

test("no confunde 140 o 400 con 40", () => {
  for (const d of ["140", "400", "ciento cuarenta", "", "no sé"]) assert.equal(calificarRespuesta(d, VS0, "es"), false, d);
});

test("no repite una pregunta hasta agotar el tema, y luego vuelve a empezar", () => {
  const b = [VS0, { ...VS0, id: "t-2" }, { ...VS0, id: "t-3", tema: "viraje-escarpado" as const }];
  assert.equal(siguientePregunta(b, ["c172"], ["t-vs0"], () => 0)?.id, "t-2");
  assert.ok(["t-vs0", "t-2"].includes(siguientePregunta(b, ["c172"], ["t-vs0", "t-2"], () => 0)!.id));
  assert.equal(siguientePregunta(b, ["viraje-escarpado"], [], () => 0)?.id, "t-3");
  assert.equal(siguientePregunta([], ["c172"], []), null);
});

test("las líneas del debriefing cuentan y listan las falladas con su respuesta", () => {
  const l = lineasPreguntas([{ id: "t-vs0", correcta: false }, { id: "t-vs0", correcta: true }], [VS0], "es");
  assert.equal(l[0], "Preguntas: 1 de 2 correctas.");
  assert.ok(l.some((x) => x.includes("¿Cuál es la Vs0?") && x.includes("40 nudos.")));
  assert.equal(lineasPreguntas([], [VS0], "en").length, 0);
  assert.equal(lineasPreguntas([{ id: "t-vs0", correcta: true }], [VS0], "en")[0], "Questions: 1 of 1 correct.");
});
