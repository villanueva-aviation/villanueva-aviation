import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarRecto, avanzarRecto, type EvaluacionRecto } from "./evaluadorRecto.ts";
import { simularRecto } from "./simular.ts";
import { avisoRecto, ordenRecto, pasoRecto, semaforoRecto, textoPasoRecto, type PasoRecto } from "./vozRecto.ts";
import { briefingRecto, explicarRecto, listaPasosRecto, paraGuardarRecto, queHacerRecto, repetirRecto } from "./explicacionRecto.ts";

/** Avanza la simulación hasta el segundo t (o el final). */
const hasta = (ms: Muestra[], t = Infinity): { ev: EvaluacionRecto; m: Muestra } => {
  let ev = armarRecto(ms[0]);
  let m = ms[0];
  for (const x of ms.slice(1)) {
    if (x.t > t) break;
    ev = avanzarRecto(ev, x);
    m = x;
  }
  return { ev, m };
};

test("los pasos siguen el tramo", () => {
  const ms = simularRecto();
  const p = (t: number) => {
    const { ev, m } = hasta(ms, t);
    return pasoRecto(ev, m);
  };
  assert.equal(p(2), "estabiliza");
  assert.equal(p(15), "manten");
  assert.equal(p(75), "mitad");
  assert.equal(p(Infinity), "terminado");
});

test("la orden de mantener dice los números del objetivo", () => {
  const { ev } = hasta(simularRecto(), 15);
  assert.equal(ordenRecto("estabiliza", "manten", ev, "es"), "Mantén 3,500 pies, rumbo 090 y 95 nudos durante dos minutos.");
});

test("el aviso del rumbo dice hacia dónde se va", () => {
  const { ev, m } = hasta(simularRecto(), 15);
  const aviso = avisoRecto(ev, { ...m, rumbo: 99 }, "practica", "es");
  assert.ok(aviso && aviso.texto.includes("Te vas a la derecha"), JSON.stringify(aviso));
});

test("sin tramo no hay semáforo", () => {
  const { ev, m } = hasta(simularRecto(), 2);
  assert.equal(ev.fase, "armado");
  assert.deepEqual(semaforoRecto(ev, m), { altitud: "gris", rumbo: "gris", velocidad: "gris", bola: "gris" });
});

test("la explicación nombra la caída", () => {
  const { ev } = hasta(simularRecto({ deriva: { campo: "altitud", valor: -150, desde: 30, segundos: 6 } }));
  const r = ev.resultado!;
  assert.ok(explicarRecto(r, "es").some((l) => l.tipo === "mal" && l.texto.startsWith("Perdiste 150 ft")));
  assert.equal(repetirRecto(r, "es"), "Repite: recto y nivelado");
});

test("en inglés no hay español", () => {
  const ms = simularRecto({ deriva: { campo: "rumbo", valor: 15, desde: 30, segundos: 6 } });
  const { ev } = hasta(ms);
  const medio = hasta(ms, 15).ev;
  const pasos: PasoRecto[] = ["estabiliza", "manten", "mitad", "terminado", "invalido"];
  const textos = [
    ...briefingRecto("en"),
    ...pasos.flatMap((p) => [
      ...listaPasosRecto(p, "en").map((x) => x.nombre),
      queHacerRecto(p, "en"),
      textoPasoRecto(p, medio, "en"),
      ordenRecto(null, p, p === "invalido" ? { ...medio, fase: "invalido", motivo: "Pausaste el simulador: el intento no se califica." } : medio, "en") ?? "",
    ]),
    ...explicarRecto(ev.resultado!, "en").map((l) => l.texto),
    repetirRecto(ev.resultado!, "en") ?? "",
  ];
  for (const t of textos) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
});

test("lo guardado no trae muestras y cabe", () => {
  const { ev } = hasta(simularRecto({ deriva: { campo: "velocidad", valor: 12, desde: 30, segundos: 6 } }));
  const g = paraGuardarRecto(ev.resultado!);
  assert.equal("muestras" in g, false);
  for (const s of Object.values(g.series)) assert.ok(s.length > 0 && s.length <= 300, String(s.length));
  assert.ok(JSON.stringify(g).length < 200000);
});
