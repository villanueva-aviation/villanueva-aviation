import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarS, armarSoloS, avanzarS, type EvaluacionS, type ResultadoS } from "./evaluadorS.ts";
import { briefingS, explicarS, ordenS, pasoS } from "./textosS.ts";
import { simularS } from "./simular.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3): { ev: EvaluacionS; ordenes: string[] } => {
  let ev = armarS(ms[0], nivel);
  const ordenes: string[] = [];
  for (const x of ms.slice(1)) {
    const antes = pasoS(ev, x);
    ev = avanzarS(ev, x);
    const o = ordenS(antes, pasoS(ev, x), ev, "es");
    if (o) ordenes.push(o);
  }
  return { ev, ordenes };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoS => {
  const { ev } = correr(ms, nivel);
  assert.equal(ev.fase, "terminado", ev.motivo);
  return ev.resultado!;
};
const malas = (r: ResultadoS, idioma: "es" | "en" = "es") => explicarS(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("una «S» limpia aprueba: dos semicírculos iguales y alas niveladas sobre el camino", () => {
  const r = calificar(simularS());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.lado, "derecha");
  assert.equal(r.cruces.length, 2);
  assert.ok(r.cruces.every((c) => Math.abs(c.inclinacion) < 1 && Math.abs(c.rumbo) < 3), JSON.stringify(r.cruces));
  // 90 kt a 30°: radio de unos 1,250 ft (la segunda suma el medio segundo recto sobre el camino)
  assert.ok(r.profundidadFt.every((d) => Math.abs(d - 1250) < 100), String(r.profundidadFt));
  assert.equal(r.maniobra, "s-camino");
});

test("el instructor pide el cruce, cada curva y el segundo cruce", () => {
  const { ordenes } = correr(simularS());
  assert.ok(ordenes[0].startsWith("Busca un camino recto"), ordenes.join(" | "));
  assert.ok(ordenes[1].startsWith("Primera curva"), ordenes[1]);
  assert.ok(ordenes[2].startsWith("Alas niveladas sobre el camino"), ordenes[2]);
  assert.equal(ordenes.length, 3, ordenes.join(" | "));
});

test("curvas distintas reprueban la simetría y dicen cuánto se alejó cada una", () => {
  const r = calificar(simularS({ incl2: 42 }));
  assert.equal(r.elementos["5"], "NS");
  assert.ok(r.profundidadFt[1] < 0.75 * r.profundidadFt[0], String(r.profundidadFt));
  assert.ok(malas(r).some((x) => x.includes("la primera se alejó") && x.includes("la segunda")), malas(r).join(" | "));
});

test("cruzar inclinado reprueba las alas al cruzar", () => {
  const r = calificar(simularS({ sinNivelar: true }));
  assert.equal(r.elementos["3"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Cruzaste el camino con 30° de inclinación")), malas(r).join(" | "));
});

test("terminar la curva corta cruza fuera de la perpendicular", () => {
  const r = calificar(simularS({ giro1: 160 }));
  assert.equal(r.elementos["4"], "NS");
  assert.ok(Math.abs(r.peor.rumbo) >= 20, String(r.peor.rumbo));
  assert.ok(malas(r).some((x) => x.startsWith("Cruzaste el camino a") && x.includes("de la perpendicular")), malas(r).join(" | "));
});

test("altitud, velocidad e inclinación máxima de 45°", () => {
  const alto = calificar(simularS({ subeFt: 180 }));
  assert.equal(alto.elementos["1"], "NS");
  assert.equal(calificar(simularS({ subeFt: 180 }), 1).elementos["1"], "S");
  assert.equal(calificar(simularS({ kt2: 105 })).elementos["2"], "NS");
  const r = calificar(simularS({ incl1: 55, incl2: 55 }));
  assert.equal(r.elementos["6"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Inclinaste hasta 55°")), malas(r).join(" | "));
});

test("la segunda curva al mismo lado anula", () => {
  const { ev } = correr(simularS({ mismoLado: true }));
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo ?? "", /lado contrario/);
});

test("fuera de 600–1,000 ft AGL no empieza; sin posición del lector, anulada", () => {
  const ms = simularS().map((m) => ({ ...m, agl: m.agl + 400 }));
  const { ev } = correr(ms);
  assert.equal(ev.fase, "armado");
  assert.equal(pasoS(ev, ms[ms.length - 1]), "altura");
  assert.equal(armarS({ ...ms[0], lat: undefined }).fase, "invalido");
  assert.equal(armarSoloS(null, simularS()[0]), true);
});

test("registrada; briefing; inglés sin acentos", () => {
  assert.equal(MANIOBRAS["s-camino"].id, "s-camino");
  const b = briefingS("es", 3).join(" ");
  for (const x of ["600", "1,000", "±100", "±10 kt", "45°", "perpendicular"]) assert.ok(b.includes(x), x);
  const r = calificar(simularS({ incl2: 42, sinNivelar: true, giro1: 160, subeFt: 180 }));
  for (const l of [...briefingS("en", 1), ...malas(r, "en")]) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
});
