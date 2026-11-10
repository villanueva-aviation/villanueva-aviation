import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { altitudAsignada, armarAltitud, avanzarAltitud, type EvaluacionAltitud, type ResultadoAltitud } from "./evaluadorAltitud.ts";
import { avisoAltitud, briefingAltitud, explicarAltitud, ordenAltitud, paraGuardarAltitud, pasoAltitud } from "./textosAltitud.ts";
import { simularAltitud } from "./simular.ts";
import { traducirMotivo } from "./idiomaInstructor.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3, hasta = Infinity): { ev: EvaluacionAltitud; m: Muestra } => {
  let ev = armarAltitud(ms[0], nivel);
  let m = ms[0];
  for (const x of ms.slice(1)) {
    if (x.t > hasta) break;
    ev = avanzarAltitud(ev, x);
    m = x;
  }
  return { ev, m };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoAltitud => correr(ms, nivel).ev.resultado!;
const malas = (r: ResultadoAltitud, idioma: "es" | "en" = "es") => explicarAltitud(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("la altitud asignada es redonda (de 500 en 500), alterna, y nunca baja de 1,500 ft sobre el terreno", () => {
  assert.deepEqual(altitudAsignada(7000, 2500), { altitud: 7500, sube: true });
  assert.deepEqual(altitudAsignada(7500, 3000), { altitud: 7000, sube: false });
  assert.deepEqual(altitudAsignada(7500, 1800), { altitud: 8000, sube: true }, "bajar lo dejaría a 1,300 ft AGL");
  for (let a = 3000; a < 12000; a += 137) assert.equal(altitudAsignada(a, 4000).altitud % 500, 0);
});

test("un ascenso limpio entre 70 y 74 kt aprueba", () => {
  const r = calificar(simularAltitud());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.objetivo.altitudFinal, 7500);
  assert.equal(r.objetivo.sube, true);
  assert.ok(Math.abs(r.altitudAlNivelar) < 20, String(r.altitudAlNivelar));
});

test("un descenso limpio entre 90 y 95 kt aprueba", () => {
  const r = calificar(simularAltitud({ baja: true }));
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.objetivo.altitudFinal, 7000);
});

test("te pasas de la altitud: dónde nivelaste, dónde debías y que niveles 50 ft antes", () => {
  const r = calificar(simularAltitud({ pasarse: 140 }));
  assert.equal(r.aprobado, false);
  const l = malas(r).find((x) => x.startsWith("Nivelaste"));
  assert.ok(l, malas(r).join(" | "));
  assert.match(l, /Nivelaste en 7,640 y debías quedar en 7,500: te pasaste 140 ft/);
  assert.match(l, /50 ft antes/);
});

test("te quedas corto: lo dice", () => {
  const l = malas(calificar(simularAltitud({ pasarse: -140 }))).find((x) => x.startsWith("Nivelaste"));
  assert.ok(l);
  assert.match(l, /en 7,360 y debías quedar en 7,500: te quedaste corto 140 ft/);
});

test("subir a 80 kt: 6 kt sobre la banda reprueba en Difícil, no en Fácil, y explica cómo corregir", () => {
  const ms = simularAltitud({ kt: 80 });
  assert.equal(calificar(ms, 1).aprobado, true);
  const r = calificar(ms, 3);
  assert.equal(r.aprobado, false);
  assert.ok(malas(r).some((x) => /Subiste a 80 kt: sube un poco la nariz para quedar entre 70 y 74/.test(x)), malas(r).join(" | "));
});

test("dentro de la banda no hay desvío de velocidad", () => {
  for (const kt of [70, 74]) assert.equal(calificar(simularAltitud({ kt })).peor.velocidad, 0, String(kt));
});

test("bajar a 100 kt: reprueba en Difícil y lo explica", () => {
  const r = calificar(simularAltitud({ baja: true, kt: 101 }));
  assert.equal(r.aprobado, false);
  assert.ok(malas(r).some((x) => /Bajaste a 101 kt/.test(x)), malas(r).join(" | "));
});

test("ir en sentido contrario anula, también en inglés", () => {
  const { ev } = correr(simularAltitud({ contrario: true }));
  assert.equal(ev.fase, "invalido");
  assert.doesNotMatch(traducirMotivo(ev.motivo!, "en"), /[áéíóúñ¿¡]/);
  assert.notEqual(traducirMotivo(ev.motivo!, "en"), ev.motivo);
});

test("las órdenes: altitud, banda y rumbo al empezar; mantener al nivelar", () => {
  const ms = simularAltitud();
  const a = correr(ms, 3, 6);
  assert.equal(pasoAltitud(a.ev, a.m), "cambia");
  assert.equal(ordenAltitud("estabiliza", "cambia", a.ev, "es"), "Asciende a 7,500 pies, entre 70 y 74 nudos. Mantén rumbo 090.");
  const b = correr(simularAltitud({ baja: true }), 3, 6);
  assert.equal(ordenAltitud("estabiliza", "cambia", b.ev, "es"), "Desciende a 7,000 pies, entre 90 y 95 nudos. Mantén rumbo 090.");
  const c = correr(ms, 3, ms.at(-1)!.t - 9);
  assert.equal(pasoAltitud(c.ev, c.m), "manten");
  assert.equal(ordenAltitud("cambia", "manten", c.ev, "es"), "Mantén 7,500 pies.");
});

test("en práctica avisa si sube rápido", () => {
  const ms = simularAltitud({ kt: 85 });
  const { ev, m } = correr(ms, 3, 25);
  assert.match(avisoAltitud(ev, m, "practica", "es")?.texto ?? "", /nariz/);
});

test("en inglés, sin acentos", () => {
  const rs = [calificar(simularAltitud({ pasarse: 140 })), calificar(simularAltitud({ kt: 85 })), calificar(simularAltitud({ baja: true, kt: 101, pasarse: -140 }))];
  for (const r of rs) for (const t of explicarAltitud(r, "en").map((l) => l.texto)) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  for (const t of briefingAltitud("en", 1)) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  assert.doesNotMatch(ordenAltitud("estabiliza", "cambia", correr(simularAltitud(), 3, 6).ev, "en")!, /[áéíóúñ¿¡]/);
});

test("guardado sin muestras; registrada como maniobra", () => {
  assert.equal("muestras" in (paraGuardarAltitud(calificar(simularAltitud())) as object), false);
  assert.equal(MANIOBRAS["ascensos-descensos"].titulo.es, "Ascensos y descensos C172");
});
