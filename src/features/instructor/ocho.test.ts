import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarOcho, armarSoloOcho, avanzarOcho, pivote, type EvaluacionOcho, type ResultadoOcho } from "./evaluadorOcho.ts";
import { briefingOcho, explicarOcho, ordenOcho, pasoOcho, textoPasoOcho } from "./textosOcho.ts";
import { simularOcho } from "./simular.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3): { ev: EvaluacionOcho; ordenes: string[] } => {
  let ev = armarOcho(ms[0], nivel);
  const ordenes: string[] = [];
  for (const x of ms.slice(1)) {
    const antes = pasoOcho(ev, x);
    ev = avanzarOcho(ev, x);
    const o = ordenOcho(antes, pasoOcho(ev, x), ev, "es");
    if (o) ordenes.push(o);
  }
  return { ev, ordenes };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoOcho => {
  const { ev } = correr(ms, nivel);
  assert.equal(ev.fase, "terminado", ev.motivo);
  return ev.resultado!;
};
const malas = (r: ResultadoOcho, idioma: "es" | "en" = "es") => explicarOcho(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("altura pivote: GS² / 11.3", () => {
  assert.equal(Math.round(pivote(90)), 717);
  assert.equal(Math.round(pivote(100)), 885);
});

test("a la altura pivote el pilón no se mueve del ala y aprueba", () => {
  const r = calificar(simularOcho());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.ok(Math.abs(r.peor.ala) < 2, String(r.peor.ala));
  assert.equal(r.lado, "derecha");
  assert.ok(Math.abs(r.cruceSeg - 4) < 0.3, String(r.cruceSeg));
  assert.equal(Math.round(r.objetivo.pivote), 717);
  assert.equal(r.maniobra, "ocho-pilones");
});

test("el instructor pide el primer pilón, el cruce y el segundo", () => {
  const { ordenes } = correr(simularOcho());
  assert.ok(ordenes[0].startsWith("Vuela entre los dos pilones"), ordenes.join(" | "));
  assert.ok(ordenes[1].startsWith("Primer pilón"), ordenes[1]);
  assert.ok(ordenes[2].startsWith("Alas niveladas entre los pilones"), ordenes[2]);
  assert.ok(ordenes[3].startsWith("Segundo pilón"), ordenes[3]);
  assert.equal(ordenes.length, 4, ordenes.join(" | "));
});

test("arriba de la altura pivote el pilón se adelanta: reprueba y dice que baje", () => {
  const r = calificar(simularOcho({ altoFt: 250 }));
  assert.equal(r.elementos["2"], "NS");
  assert.ok(r.fuera.ala[0].peor > 10, JSON.stringify(r.fuera.ala));
  assert.ok(malas(r).some((x) => x.startsWith("El pilón se te adelantó") && x.includes("baja")), malas(r).join(" | "));
  assert.equal(calificar(simularOcho({ altoFt: 150 }), 1).elementos["2"], "S", "150 ft arriba: en Fácil ±20° alcanza");
});

test("abajo de la altura pivote el pilón se queda atrás: dice que suba", () => {
  const r = calificar(simularOcho({ altoFt: -250 }));
  assert.equal(r.elementos["2"], "NS");
  assert.ok(r.fuera.ala[0].peor < -10, JSON.stringify(r.fuera.ala));
  assert.ok(malas(r).some((x) => x.startsWith("El pilón se te quedó") && x.includes("sube")), malas(r).join(" | "));
});

test("sin tramo recto entre pilones reprueba el cruce", () => {
  const r = calificar(simularOcho({ cruce: 1 }));
  assert.equal(r.elementos["3"], "NS");
  assert.ok(malas(r).some((x) => x.includes("necesitas al menos 3 s")), malas(r).join(" | "));
});

test("velocidad e inclinación máxima de 45°", () => {
  assert.equal(calificar(simularOcho({ kt2: 105 })).elementos["1"], "NS");
  const r = calificar(simularOcho({ incl1: 55, incl2: 55 }));
  assert.equal(r.elementos["4"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Inclinaste hasta 55°")), malas(r).join(" | "));
});

test("la segunda vuelta al mismo lado anula", () => {
  const { ev } = correr(simularOcho({ mismoLado: true }));
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo ?? "", /lado contrario/);
});

test("lejos de la altura pivote no empieza y dice cuál es; sin velocidad sobre el suelo, anulada", () => {
  const ms = simularOcho().map((m) => ({ ...m, agl: m.agl + 400 }));
  const { ev } = correr(ms);
  assert.equal(ev.fase, "armado");
  assert.equal(pasoOcho(ev, ms[ms.length - 1]), "altura");
  assert.match(textoPasoOcho("altura", ev, "es"), /90 kt.*717 pies/);
  assert.equal(armarOcho({ ...ms[0], gs: undefined }).fase, "invalido");
  assert.equal(armarSoloOcho(null, simularOcho()[0]), true);
});

test("registrada; briefing; inglés sin acentos", () => {
  assert.equal(MANIOBRAS["ocho-pilones"].id, "ocho-pilones");
  const b = briefingOcho("es", 3).join(" ");
  for (const x of ["altura pivote", "717", "885", "±10 kt", "45°", "baja", "sube"]) assert.ok(b.includes(x), x);
  const r = calificar(simularOcho({ altoFt: 250, cruce: 1, incl1: 55 }));
  for (const l of [...briefingOcho("en", 1), ...malas(r, "en"), textoPasoOcho("altura", correr(simularOcho()).ev, "en")]) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
});
