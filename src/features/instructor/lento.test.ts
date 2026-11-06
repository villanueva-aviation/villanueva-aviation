import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarLento, avanzarLento, type EvaluacionLento } from "./evaluadorLento.ts";
import { briefingLento, explicarLento, listaPasosLento, masFalladoLento, paraGuardarLento, queHacerLento, repetirLento } from "./explicacionLento.ts";
import { traducirAviso, traducirMotivo } from "./idiomaInstructor.ts";
import { simularLento } from "./simular.ts";
import { avisoLento, ordenLento, pasoLento, semaforoLento, textoPasoLento, type PasoLento } from "./vozLento.ts";

/** Avanza hasta que se cumpla `parar` (o el final) y devuelve la evaluación y la muestra. */
const hasta = (ms: Muestra[], parar: (ev: EvaluacionLento, m: Muestra) => boolean = () => false) => {
  let ev = armarLento(ms[0]);
  let m = ms[0];
  for (const x of ms.slice(1)) {
    ev = avanzarLento(ev, x);
    m = x;
    if (parar(ev, m)) break;
  }
  return { ev, m };
};
const enFase = (f: EvaluacionLento["fase"], ms = simularLento()) => hasta(ms, (ev) => ev.fase === f);

const limpio = hasta(simularLento()).ev.resultado!;
const conPerdida = hasta(simularLento({ perdidaEn: 30 })).ev.resultado!;
const sinSalida = hasta(simularLento({ sinSalida: true })).ev.resultado!;
const sinVirajes = hasta(simularLento({ sinSegundo: true })).ev.resultado!;
const { ev: evRecto, m: mRecto } = hasta(simularLento(), (ev, m) => ev.fase === "recto" && m.t - ev.objetivo!.t > 5);
const { ev: evViraje, m: mViraje } = hasta(simularLento(), (ev) => ev.fase === "viraje1" && Math.abs(ev.giro) > 40);
const { ev: evTrasIzquierda } = enFase("viraje2");
const TODOS: PasoLento[] = ["sube", "reduce", "recto", "vira1", "vira2", "sal", "terminado", "invalido"];

test("los pasos siguen la maniobra", () => {
  const vistos: PasoLento[] = [];
  let ev = armarLento(simularLento()[0]);
  for (const m of simularLento()) {
    ev = avanzarLento(ev, m);
    const p = pasoLento(ev, m)!;
    if (vistos[vistos.length - 1] !== p) vistos.push(p);
  }
  assert.deepEqual(vistos, ["reduce", "recto", "vira1", "vira2", "sal", "terminado"]);
  const bajo = { ...simularLento()[0], agl: 1200 };
  assert.equal(pasoLento(armarLento(bajo), bajo), "sube");
});

test("la orden solo sale al cambiar de paso", () => {
  assert.equal(ordenLento("recto", "recto", evRecto, "es"), null);
  assert.ok(ordenLento("reduce", "recto", evRecto, "es"));
  assert.equal(ordenLento("sal", "terminado", evRecto, "es"), null);
});

test("vira2 nombra el lado contrario al primero", () => {
  assert.match(textoPasoLento("vira2", evTrasIzquierda, "es"), /derecha/);
  assert.match(textoPasoLento("vira2", evTrasIzquierda, "en"), /right/);
});

test("el aviso de pérdida gana a cualquier otro, también en checkride", () => {
  const a = avisoLento(evRecto, { ...mRecto, perdida: true, altitud: 3590 }, "checkride", "es")!;
  assert.equal(a.clave, "perdida");
  assert.equal(a.nivel, "rojo");
  assert.equal(avisoLento(evRecto, { ...mRecto, altitud: 3590 }, "practica", "es")!.clave.startsWith("altitud"), true);
});

test("en el viraje no se avisa de rumbo, y en recto la inclinación va en gris", () => {
  assert.equal(semaforoLento(evRecto, mRecto).inclinacion, "gris");
  assert.equal(semaforoLento(evRecto, mRecto).altitud, "verde");
  assert.equal(semaforoLento(evViraje, mViraje).rumbo, "gris");
  assert.equal(semaforoLento(evViraje, mViraje).inclinacion, "verde");
  assert.equal(avisoLento(evViraje, { ...mViraje, rumbo: mViraje.rumbo + 120 }, "practica", "es"), null);
});

test("abajo de la banda el aviso de velocidad pide nariz abajo y potencia", () => {
  const a = avisoLento(evRecto, { ...mRecto, velocidad: 53 }, "practica", "es")!;
  assert.ok(a.clave.startsWith("velocidad"), a.clave);
  assert.match(a.texto, /potencia/);
});

test("la explicación menciona el aviso de pérdida y repetir lo pide primero", () => {
  assert.ok(explicarLento(conPerdida, "es").some((l) => l.tipo === "mal" && /pérdida/.test(l.texto)));
  assert.match(repetirLento(conPerdida, "es")!, /pérdida/);
  assert.equal(repetirLento(limpio, "es"), null);
  assert.ok(explicarLento(limpio, "es").every((l) => l.tipo === "bien"));
  assert.match(repetirLento(sinSalida, "es")!, /potencia/);
});

test("sin los dos virajes, la explicación y repetir lo dicen (no hablan de la salida)", () => {
  const mal = explicarLento(sinVirajes, "es").filter((l) => l.tipo === "mal").map((l) => l.texto);
  assert.ok(mal.some((t) => /dos virajes/.test(t)), mal.join(" | "));
  assert.ok(!mal.some((t) => /potencia/.test(t)), mal.join(" | "));
  assert.match(repetirLento(sinVirajes, "es")!, /virajes/);
  assert.equal(traducirAviso("No completaste los dos virajes.", "en"), "You didn't complete both turns.");
});

test("masFallado usa el aviso de pérdida antes que los campos", () => {
  assert.match(masFalladoLento([limpio, conPerdida], "es")!, /pérdida/);
  assert.equal(masFalladoLento([limpio], "es"), null);
});

test("lista de pasos y briefing", () => {
  assert.deepEqual(listaPasosLento("vira1", "es").map((p) => p.estado), ["hecho", "hecho", "actual", "pendiente", "pendiente"]);
  const b = briefingLento("es").join(" ");
  for (const s of ["1,500", "55", "65", "flaps", "pérdida"]) assert.ok(b.includes(s), s);
});

test("en inglés no hay español", () => {
  const motivo = armarLento(simularLento({ viejo: true })[0]).motivo!;
  const textos = [
    ...briefingLento("en"),
    traducirMotivo(motivo, "en"),
    traducirAviso("No saliste del vuelo lento con potencia.", "en"),
    traducirAviso("No completaste los dos virajes.", "en"),
    masFalladoLento([conPerdida], "en") ?? "",
    ...[limpio, conPerdida, sinSalida, sinVirajes].flatMap((r) => [...explicarLento(r, "en").map((l) => l.texto), repetirLento(r, "en") ?? ""]),
    ...TODOS.map((p) => textoPasoLento(p, evTrasIzquierda, "en") + queHacerLento(p, "en")),
    ...listaPasosLento("sal", "en").map((p) => p.nombre),
    avisoLento(evRecto, { ...mRecto, perdida: true }, "practica", "en")!.texto,
  ];
  for (const t of textos) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
});

test("paraGuardar no lleva muestras y reduce las series", () => {
  const g = paraGuardarLento(limpio);
  assert.equal("muestras" in g, false);
  assert.ok(g.series.altitud.length > 0 && g.series.altitud.length <= 300);
});
