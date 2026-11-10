import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarFalla, armarSoloFalla, avanzarFalla, PLANEO_KT, type EvaluacionFalla, type ResultadoFalla } from "./evaluadorFalla.ts";
import { briefingFalla, explicarFalla, ordenFalla, pasoFalla } from "./textosFalla.ts";
import { simularFalla } from "./simular.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3): { ev: EvaluacionFalla; ordenes: string[] } => {
  let ev = armarFalla(ms[0], nivel);
  const ordenes: string[] = [];
  for (const x of ms.slice(1)) {
    const antes = pasoFalla(ev, x);
    ev = avanzarFalla(ev, x);
    const o = ordenFalla(antes, pasoFalla(ev, x), ev, "es");
    if (o) ordenes.push(o);
  }
  return { ev, ordenes };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoFalla => {
  const { ev } = correr(ms, nivel);
  assert.equal(ev.fase, "terminado", ev.motivo);
  return ev.resultado!;
};
const malas = (r: ResultadoFalla, idioma: "es" | "en" = "es") => explicarFalla(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("una falla bien manejada aprueba: ralentí rápido, 68 kt, checklist y recupera a 1,000 ft", () => {
  const r = calificar(simularFalla());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.ok(r.reaccionSeg < 3, String(r.reaccionSeg));
  assert.ok(Math.abs(r.recuperaAgl - 1000) < 30, String(r.recuperaAgl));
  assert.deepEqual(r.faltan, []);
  assert.equal(PLANEO_KT, 68);
  assert.equal(r.maniobra, "falla-motor");
});

test("el instructor da la falla, el checklist, la recuperación y el ascenso", () => {
  const { ordenes } = correr(simularFalla());
  assert.equal(ordenes[0], "Falla de motor.");
  assert.ok(ordenes[1].startsWith("Planea a 68 nudos") && ordenes[1].includes("bomba auxiliar"), ordenes[1]);
  assert.equal(ordenes[2], "Recupera: potencia completa.");
  assert.ok(ordenes[3].startsWith("Asciende entre 70 y 74 nudos"), ordenes[3]);
  assert.equal(ordenes.length, 4, ordenes.join(" | "));
});

test("reaccionar lento: 4.5 s reprueba en Difícil y pasa en Fácil", () => {
  const ms = simularFalla({ reaccion: 3 });
  const r = calificar(ms, 3);
  assert.equal(r.elementos["1"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Tardaste 4.5 s en poner ralentí")), malas(r).join(" | "));
  assert.equal(calificar(ms, 1).elementos["1"], "S");
});

test("planear rápido reprueba el planeo", () => {
  const r = calificar(simularFalla({ kt: 80 }));
  assert.equal(r.elementos["2"], "NS");
  assert.ok(malas(r).some((x) => x.includes("80 kt") && x.includes("68")), malas(r).join(" | "));
});

test("lo que falta del checklist se nombra", () => {
  const r = calificar(simularFalla({ sinChecklist: ["bomba", "magnetos"] }));
  assert.equal(r.elementos["3"], "NS");
  assert.deepEqual(r.faltan, ["bomba", "magnetos"]);
  assert.ok(malas(r).some((x) => x === "Te faltó del checklist: bomba auxiliar encendida, magnetos en ambos."), malas(r).join(" | "));
});

test("lector anterior a v1.5: selector y bomba no se califican", () => {
  const ms = simularFalla({ sinChecklist: ["bomba", "selector"] }).map(({ selector: _s, bomba: _b, ...m }) => m as Muestra);
  const r = calificar(ms);
  assert.deepEqual(r.faltan, []);
  assert.equal(r.elementos["3"], "S");
});

test("recuperar antes de la orden, o abajo de 500 ft, reprueba la recuperación", () => {
  const antes = calificar(simularFalla({ recuperaAgl: 300 }));
  assert.equal(antes.elementos["4"], "NS");
  assert.equal(antes.recuperoAntes, true);
  assert.ok(malas(antes).some((x) => x.includes("antes de la orden")), malas(antes).join(" | "));
  const tarde = calificar(simularFalla({ retraso: 6 }));
  assert.equal(tarde.elementos["4"], "NS");
  assert.ok(tarde.recuperaAgl < 1000);
  assert.ok(malas(tarde).some((x) => x.startsWith("Tardaste 6 s en dar potencia completa")), malas(tarde).join(" | "));
  const bajo = calificar(simularFalla({ retraso: 45 }), 1);
  assert.ok(bajo.recuperaAgl < 500, String(bajo.recuperaAgl));
  assert.ok(malas(bajo).some((x) => x.includes("nunca bajes de 500")), malas(bajo).join(" | "));
});

test("ascender lento reprueba el ascenso", () => {
  const r = calificar(simularFalla({ ascenso: 62 }));
  assert.equal(r.elementos["5"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Ascendiste a 62 kt")), malas(r).join(" | "));
});

test("sin ralentí en 15 s se anula; se arma en el aire, sin lector viejo", () => {
  const { ev } = correr(simularFalla({ sinRalenti: true }));
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo ?? "", /ralentí/);
  const m = simularFalla()[0];
  assert.equal(armarSoloFalla(null, m), true);
  assert.equal(armarSoloFalla(null, { ...m, enTierra: true }), false);
  assert.equal(armarFalla({ ...m, acelerador: undefined }).fase, "invalido");
});

test("abajo de 2,000 ft AGL no da la falla", () => {
  const ms = simularFalla().map((m) => ({ ...m, agl: m.agl - 300 }));
  const { ev } = correr(ms.slice(0, 80));
  assert.equal(ev.fase, "armado");
  assert.equal(pasoFalla(ev, ms[79]), "sube");
});

test("registrada; briefing con los números; inglés sin acentos", () => {
  assert.equal(MANIOBRAS["falla-motor"].id, "falla-motor");
  const b = briefingFalla("es", 3).join(" ");
  for (const x of ["68", "1,000", "500", "2,000", "3 s", "70 y 74", "bomba auxiliar"]) assert.ok(b.includes(x), x);
  const r = calificar(simularFalla({ reaccion: 3, kt: 80, sinChecklist: ["mezcla"], recuperaAgl: 300 }));
  for (const l of [...briefingFalla("en", 1), ...malas(r, "en")]) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
});
