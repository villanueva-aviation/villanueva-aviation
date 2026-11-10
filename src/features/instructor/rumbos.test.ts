import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarRumbos, avanzarRumbos, rumboAsignado, type EvaluacionRumbos, type ResultadoRumbos } from "./evaluadorRumbos.ts";
import { avisoRumbos, briefingRumbos, explicarRumbos, ordenRumbos, paraGuardarRumbos, pasoRumbos } from "./textosRumbos.ts";
import { simularRumbos } from "./simular.ts";
import { traducirMotivo } from "./idiomaInstructor.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3, hasta = Infinity): { ev: EvaluacionRumbos; m: Muestra } => {
  let ev = armarRumbos(ms[0], nivel);
  let m = ms[0];
  for (const x of ms.slice(1)) {
    if (x.t > hasta) break;
    ev = avanzarRumbos(ev, x);
    m = x;
  }
  return { ev, m };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoRumbos => correr(ms, nivel).ev.resultado!;
const malas = (r: ResultadoRumbos, idioma: "es" | "en" = "es") => explicarRumbos(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("el rumbo asignado es redondo, de 30 en 30, y el viraje va de 75° a 195°", () => {
  assert.deepEqual(rumboAsignado(90), { rumbo: 240, lado: "derecha", giro: 150 });
  assert.deepEqual(rumboAsignado(240), { rumbo: 150, lado: "izquierda", giro: 90 });
  for (let r = 0; r < 360; r += 7) {
    const a = rumboAsignado(r);
    assert.equal(a.rumbo % 30, 0, `desde ${r}`);
    assert.ok(a.giro >= 75 && a.giro <= 195, `desde ${r}: ${a.giro}`);
  }
});

test("un viraje limpio al rumbo asignado aprueba", () => {
  const r = calificar(simularRumbos());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.objetivo.rumboFinal, 240);
  assert.equal(r.objetivo.lado, "derecha");
  assert.ok(Math.abs(r.rumboAlNivelar) < 3, String(r.rumboAlNivelar));
  assert.ok(Math.abs(r.peor.inclinacion) < 2, String(r.peor.inclinacion));
});

test("te pasas del rumbo: dice dónde nivelaste, dónde debías y que empieces a nivelar 15° antes", () => {
  const r = calificar(simularRumbos({ pasarse: 25 }));
  assert.equal(r.aprobado, false);
  const l = malas(r).find((x) => x.startsWith("Nivelaste"));
  assert.ok(l, malas(r).join(" | "));
  assert.match(l, /Nivelaste en 265 y debías quedar en 240: te pasaste 25°/);
  assert.match(l, /15° antes/);
});

test("te quedas corto: lo dice y cómo corregir", () => {
  const l = malas(calificar(simularRumbos({ pasarse: -25 }))).find((x) => x.startsWith("Nivelaste"));
  assert.ok(l);
  assert.match(l, /en 215 y debías quedar en 240: te quedaste corto 25°/);
});

test("el nivel cambia la tolerancia del rumbo: 15° de más pasa en Fácil, no en Difícil", () => {
  assert.equal(calificar(simularRumbos({ pasarse: 15 }), 1).aprobado, true);
  assert.equal(calificar(simularRumbos({ pasarse: 15 }), 3).aprobado, false);
});

test("40° de inclinación: falla la inclinación y lo explica", () => {
  const r = calificar(simularRumbos({ incl: 40 }));
  assert.equal(r.fuera.inclinacion.length > 0, true);
  assert.ok(malas(r).some((x) => /Inclinaste hasta 40°/.test(x)), malas(r).join(" | "));
});

test("perder 150 ft en el viraje: Difícil reprueba, Fácil no", () => {
  const ms = simularRumbos({ perdidaFt: 150 });
  assert.equal(calificar(ms, 3).aprobado, false);
  assert.equal(calificar(ms, 1).aprobado, true);
  assert.ok(malas(calificar(ms, 3)).some((x) => x.startsWith("Perdiste 150 ft")));
});

test("virar al lado contrario anula el intento, también en inglés", () => {
  const { ev } = correr(simularRumbos({ ladoContrario: true }));
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo!, /lado contrario/);
  assert.doesNotMatch(traducirMotivo(ev.motivo!, "en"), /[áéíóúñ¿¡]/);
  assert.notEqual(traducirMotivo(ev.motivo!, "en"), ev.motivo);
});

test("las órdenes: el rumbo y el lado al empezar, y mantener al nivelar", () => {
  const ms = simularRumbos();
  const a = correr(ms, 3, 6);
  assert.equal(pasoRumbos(a.ev, a.m), "vira");
  assert.equal(ordenRumbos("estabiliza", "vira", a.ev, "es"), "Vira por la derecha al rumbo 240, con 30 grados de inclinación. Mantén 3,500 pies.");
  const b = correr(ms, 3, ms.at(-1)!.t - 10); // 5 s después de nivelar
  assert.equal(pasoRumbos(b.ev, b.m), "manten");
  assert.equal(ordenRumbos("vira", "manten", b.ev, "es"), "Mantén rumbo 240.");
});

test("en práctica avisa si se pasa de 30° de inclinación", () => {
  const ms = simularRumbos({ incl: 40 });
  const { ev, m } = correr(ms, 3, 14);
  const a = avisoRumbos(ev, m, "practica", "es");
  assert.ok(a, "sin aviso");
  assert.match(a.texto, /30 grados/);
});

test("en inglés, sin acentos", () => {
  const rs = [calificar(simularRumbos({ pasarse: 25 })), calificar(simularRumbos({ incl: 40, perdidaFt: 150 })), calificar(simularRumbos({ pasarse: -25 }))];
  for (const r of rs) for (const t of explicarRumbos(r, "en").map((l) => l.texto)) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  for (const t of briefingRumbos("en", 1)) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  const a = correr(simularRumbos(), 3, 6);
  assert.doesNotMatch(ordenRumbos("estabiliza", "vira", a.ev, "en")!, /[áéíóúñ¿¡]/);
});

test("guardado sin muestras; registrada como maniobra con su hoja", () => {
  const g = paraGuardarRumbos(calificar(simularRumbos())) as Record<string, unknown>;
  assert.equal("muestras" in g, false);
  assert.equal(MANIOBRAS["virajes-rumbos"].titulo.es, "Virajes a rumbos C172");
});
