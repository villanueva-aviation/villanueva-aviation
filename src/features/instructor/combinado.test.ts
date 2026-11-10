import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarCombinado, avanzarCombinado, INCLINACION_COMBINADO, type EvaluacionCombinado, type ResultadoCombinado } from "./evaluadorCombinado.ts";
import { avisoCombinado, briefingCombinado, explicarCombinado, ordenCombinado, paraGuardarCombinado, pasoCombinado } from "./textosCombinado.ts";
import { simularCombinado } from "./simular.ts";
import { traducirMotivo } from "./idiomaInstructor.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3, hasta = Infinity): { ev: EvaluacionCombinado; m: Muestra } => {
  let ev = armarCombinado(ms[0], nivel);
  let m = ms[0];
  for (const x of ms.slice(1)) {
    if (x.t > hasta) break;
    ev = avanzarCombinado(ev, x);
    m = x;
  }
  return { ev, m };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoCombinado => correr(ms, nivel).ev.resultado!;
const malas = (r: ResultadoCombinado, idioma: "es" | "en" = "es") => explicarCombinado(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("15° de inclinación", () => assert.equal(INCLINACION_COMBINADO, 15));

test("un viraje ascendiendo limpio aprueba: rumbo 240 por la derecha, 7,500 ft", () => {
  const r = calificar(simularCombinado());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.objetivo.rumboFinal, 240);
  assert.equal(r.objetivo.lado, "derecha");
  assert.equal(r.objetivo.altitudFinal, 7500);
  assert.equal(r.objetivo.sube, true);
  assert.ok(Math.abs(r.rumboAlNivelar) < 5, String(r.rumboAlNivelar));
  assert.ok(Math.abs(r.altitudAlNivelar) < 20, String(r.altitudAlNivelar));
});

test("un viraje descendiendo limpio aprueba", () => {
  const r = calificar(simularCombinado({ baja: true }));
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.objetivo.altitudFinal, 7000);
});

test("llegar primero al rumbo: nivela alas y sigue subiendo; llegar primero a la altitud: nivela y sigue virando", () => {
  const ms = simularCombinado({ fpm: 1200 }); // llega a la altitud antes que al rumbo
  const r = calificar(ms);
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  const ms2 = simularCombinado({ fpm: 300 }); // llega al rumbo antes que a la altitud
  const r2 = calificar(ms2);
  assert.equal(r2.aprobado, true, malas(r2).join(" | "));
});

test("las órdenes: viraje con altitud y banda; al nivelar uno, sigue con el otro; al final mantener los dos", () => {
  const ms = simularCombinado({ fpm: 300 });
  const a = correr(ms, 3, 6);
  assert.equal(pasoCombinado(a.ev, a.m), "vira");
  assert.equal(ordenCombinado("estabiliza", "vira", a.ev, "es"), "Vira por la derecha al rumbo 240 ascendiendo a 7,500 pies, entre 70 y 74 nudos, con 15 grados de inclinación.");
  let ev = armarCombinado(ms[0]);
  let paso = pasoCombinado(ev, ms[0]);
  const ordenes: string[] = [];
  for (const m of ms.slice(1)) {
    ev = avanzarCombinado(ev, m);
    const ahora = pasoCombinado(ev, m);
    const o = ordenCombinado(paso, ahora, ev, "es");
    if (o) ordenes.push(o);
    paso = ahora;
  }
  assert.ok(ordenes.includes("Rumbo 240: alas niveladas y sigue ascendiendo a 7,500 pies."), ordenes.join(" | "));
  assert.ok(ordenes.includes("Mantén rumbo 240 y 7,500 pies."), ordenes.join(" | "));
  const b = simularCombinado({ fpm: 1200 });
  let ev2 = armarCombinado(b[0]);
  let p2 = pasoCombinado(ev2, b[0]);
  const ord2: string[] = [];
  for (const m of b.slice(1)) {
    ev2 = avanzarCombinado(ev2, m);
    const ahora = pasoCombinado(ev2, m);
    const o = ordenCombinado(p2, ahora, ev2, "es");
    if (o) ord2.push(o);
    p2 = ahora;
  }
  assert.ok(ord2.includes("7,500 pies: nivela y sigue virando al 240."), ord2.join(" | "));
});

test("inclinar a 30°: reprueba y dice que con 15° basta", () => {
  const r = calificar(simularCombinado({ incl: 30 }));
  assert.equal(r.aprobado, false);
  assert.ok(malas(r).some((x) => /Inclinaste hasta 30°: con 15° basta/.test(x)), malas(r).join(" | "));
});

test("pasarse del rumbo: dónde niveló y que empiece unos 8° antes", () => {
  const r = calificar(simularCombinado({ pasarse: 20 }));
  assert.equal(r.aprobado, false);
  assert.ok(malas(r).some((x) => /Nivelaste alas en 260 y debías quedar en 240: te pasaste 20°/.test(x) && /8° antes/.test(x)), malas(r).join(" | "));
});

test("pasarse de la altitud: dónde niveló y que empiece 50 ft antes", () => {
  const r = calificar(simularCombinado({ pasarseFt: 140 }));
  assert.equal(r.aprobado, false);
  assert.ok(malas(r).some((x) => /Nivelaste en 7,640 y debías quedar en 7,500: te pasaste 140 ft/.test(x)), malas(r).join(" | "));
});

test("subir a 80 kt: reprueba en Difícil, no en Fácil", () => {
  const ms = simularCombinado({ kt: 80 });
  assert.equal(calificar(ms, 1).aprobado, true, malas(calificar(ms, 1)).join(" | "));
  const r = calificar(ms, 3);
  assert.equal(r.aprobado, false);
  assert.ok(malas(r).some((x) => /Subiste a 80 kt: sube un poco la nariz/.test(x)), malas(r).join(" | "));
});

test("virar al lado contrario o irse en sentido contrario anula", () => {
  assert.equal(correr(simularCombinado({ ladoContrario: true })).ev.fase, "invalido");
  const { ev } = correr(simularCombinado({ contrario: true }));
  assert.equal(ev.fase, "invalido");
  assert.notEqual(traducirMotivo(ev.motivo!, "en"), ev.motivo);
});

test("en práctica avisa si se pasa de inclinación", () => {
  const { ev, m } = correr(simularCombinado({ incl: 30 }), 3, 20);
  assert.match(avisoCombinado(ev, m, "practica", "es")?.texto ?? "", /15 grados/);
});

test("en inglés, sin acentos", () => {
  const rs = [calificar(simularCombinado({ incl: 30 })), calificar(simularCombinado({ pasarse: 20, pasarseFt: 140 })), calificar(simularCombinado({ baja: true, kt: 101 }))];
  for (const r of rs) for (const t of explicarCombinado(r, "en").map((l) => l.texto)) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  for (const t of briefingCombinado("en", 1)) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  assert.doesNotMatch(ordenCombinado("estabiliza", "vira", correr(simularCombinado(), 3, 6).ev, "en")!, /[áéíóúñ¿¡]/);
});

test("guardado sin muestras; registrada como maniobra", () => {
  assert.equal("muestras" in (paraGuardarCombinado(calificar(simularCombinado())) as object), false);
  assert.equal(MANIOBRAS["virajes-ascendiendo"].titulo.es, "Virajes ascendiendo y descendiendo C172");
});
