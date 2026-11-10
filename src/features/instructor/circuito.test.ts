import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarCircuito, armarSoloCircuito, avanzarCircuito, PATRON_AGL, type EvaluacionCircuito, type ResultadoCircuito } from "./evaluadorCircuito.ts";
import { briefingCircuito, explicarCircuito, ordenCircuito, pasoCircuito } from "./textosCircuito.ts";
import { simularCircuito } from "./simular.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3): { ev: EvaluacionCircuito; pasos: string[] } => {
  let ev = armarCircuito(ms[0], nivel);
  const pasos: string[] = [];
  for (const x of ms.slice(1)) {
    const antes = pasoCircuito(ev, x);
    ev = avanzarCircuito(ev, x);
    const ahora = pasoCircuito(ev, x);
    const o = ordenCircuito(antes, ahora, ev, "es");
    if (o) pasos.push(o);
  }
  return { ev, pasos };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoCircuito => {
  const { ev } = correr(ms, nivel);
  assert.equal(ev.fase, "terminado", ev.motivo);
  return ev.resultado!;
};
const malas = (r: ResultadoCircuito, idioma: "es" | "en" = "es") => explicarCircuito(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("un circuito limpio aprueba: rota a 55, circuito a 1,000 ft AGL, toque suave", () => {
  const r = calificar(simularCircuito());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.ok(Math.abs(r.rotacionKt! - 55) < 1, String(r.rotacionKt));
  assert.equal(r.patron, 5000 + PATRON_AGL);
  assert.equal(r.rumboPista, 200);
  assert.equal(r.lado, "izquierda");
  assert.ok(Math.abs(r.toqueFpm! - 300) < 1, String(r.toqueFpm));
  assert.equal(Object.keys(r.elementos).length, 7);
  assert.equal(r.maniobra, "toques-despegues");
});

test("por la derecha también vale", () => {
  const r = calificar(simularCircuito({ derecha: true }));
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.lado, "derecha");
});

test("el instructor dice cada pierna en orden, con la altitud del circuito", () => {
  const { pasos } = correr(simularCircuito());
  assert.equal(pasos.length, 5, pasos.join(" | "));
  assert.ok(pasos[0].startsWith("Ascenso: entre 70 y 74 nudos"), pasos[0]);
  assert.ok(pasos[1].startsWith("Viento cruzado"), pasos[1]);
  assert.ok(pasos[2].includes("6,000 pies") && pasos[2].includes("90 nudos"), pasos[2]);
  assert.ok(pasos[3].startsWith("Base"), pasos[3]);
  assert.ok(pasos[4].includes("entre 65 y 70 nudos"), pasos[4]);
});

test("rotar tarde reprueba la rotación", () => {
  const r = calificar(simularCircuito({ vr: 70 }));
  assert.equal(r.elementos["1"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Rotaste a 70 kt")), malas(r).join(" | "));
});

test("ascender rápido reprueba el ascenso", () => {
  const r = calificar(simularCircuito({ ascenso: 82 }));
  assert.equal(r.elementos["2"], "NS");
  assert.ok(malas(r).some((x) => x.includes("82 kt") && x.includes("entre 70 y 74")), malas(r).join(" | "));
});

test("altitud de circuito: 180 ft arriba reprueba en Difícil y pasa en Fácil", () => {
  const ms = simularCircuito({ pasarseFt: 180 });
  const r = calificar(ms, 3);
  assert.equal(r.elementos["3"], "NS");
  assert.ok(malas(r).some((x) => x.includes("6,180") && x.includes("6,000")), malas(r).join(" | "));
  assert.equal(calificar(ms, 1).elementos["3"], "S");
});

test("viento en cola rápido reprueba la velocidad", () => {
  const r = calificar(simularCircuito({ cola: 105 }));
  assert.equal(r.elementos["4"], "NS");
  assert.ok(malas(r).some((x) => x.includes("105 kt") && x.includes("90")), malas(r).join(" | "));
});

test("virar con 40° reprueba la inclinación", () => {
  const r = calificar(simularCircuito({ incl: 40 }));
  assert.equal(r.elementos["5"], "NS");
  assert.ok(malas(r).some((x) => x.includes("40°") && x.includes("30°")), malas(r).join(" | "));
});

test("final rápida reprueba: «En final llegaste a 78 kt»", () => {
  const r = calificar(simularCircuito({ final: 78 }));
  assert.equal(r.elementos["6"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("En final llegaste a 78 kt") && x.includes("65–70")), malas(r).join(" | "));
});

test("toque duro reprueba; el límite depende del nivel", () => {
  const r = calificar(simularCircuito({ toqueFpm: 700 }));
  assert.equal(r.elementos["7"], "NS");
  assert.ok(malas(r).some((x) => x.includes("700 ft/min")), malas(r).join(" | "));
  assert.equal(calificar(simularCircuito({ toqueFpm: 550 }), 1).elementos["7"], "S");
  assert.equal(calificar(simularCircuito({ toqueFpm: 550 }), 3).elementos["7"], "NS");
});

test("se arma en la carrera; ya en el aire bajo también, sin rotación medida", () => {
  const ms = simularCircuito();
  assert.equal(armarSoloCircuito(null, ms[0]), true, "carrera a 30 kt");
  assert.equal(armarSoloCircuito(null, { ...ms[0], gs: 10, velocidad: 10 }), false, "rodando lento");
  const aire = ms.findIndex((m) => !m.enTierra && m.agl > 100);
  assert.equal(armarSoloCircuito(null, ms[aire]), true);
  assert.equal(armarSoloCircuito(null, { ...ms[aire], agl: 900 }), false, "ya muy arriba");
  const r = calificar(ms.slice(aire));
  assert.equal(r.rotacionKt, null);
  assert.equal(r.elementos["1"], "S");
  assert.ok(explicarCircuito(r, "es").every((l) => !l.texto.startsWith("Rotaste")));
});

test("tocar tierra antes de base anula", () => {
  const ms = simularCircuito();
  const cola = ms.findIndex((m, i) => i > 0 && Math.abs(((m.rumbo - 20 + 540) % 360) - 180) < 3 && !m.enTierra);
  const roto = [...ms.slice(0, cola + 1), { ...ms[cola + 1], enTierra: true, agl: 0 }];
  const { ev } = correr(roto);
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo ?? "", /antes de/);
});

test("registrada como maniobra; briefing con los números", () => {
  assert.equal(MANIOBRAS["toques-despegues"].id, "toques-despegues");
  const b = briefingCircuito("es", 3).join(" ");
  for (const x of ["55", "70 y 74", "1,000", "90", "65 y 70", "30°"]) assert.ok(b.includes(x), x);
  for (const l of [...briefingCircuito("en", 1), ...malas(calificar(simularCircuito({ final: 78, vr: 70 })), "en")]) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
});
