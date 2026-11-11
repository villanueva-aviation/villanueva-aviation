import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarAlrededor, armarSoloAlrededor, avanzarAlrededor, circulo, type EvaluacionAlrededor, type ResultadoAlrededor } from "./evaluadorAlrededor.ts";
import { briefingAlrededor, explicarAlrededor, ordenAlrededor, pasoAlrededor } from "./textosAlrededor.ts";
import { simularAlrededor } from "./simular.ts";
import { MANIOBRAS } from "./maniobras.ts";
import type { Nivel } from "./nivel.ts";

const correr = (ms: Muestra[], nivel: Nivel = 3): { ev: EvaluacionAlrededor; ordenes: string[] } => {
  let ev = armarAlrededor(ms[0], nivel);
  const ordenes: string[] = [];
  for (const x of ms.slice(1)) {
    const antes = pasoAlrededor(ev, x);
    ev = avanzarAlrededor(ev, x);
    const o = ordenAlrededor(antes, pasoAlrededor(ev, x), ev, "es");
    if (o) ordenes.push(o);
  }
  return { ev, ordenes };
};
const calificar = (ms: Muestra[], nivel: Nivel = 3): ResultadoAlrededor => {
  const { ev } = correr(ms, nivel);
  assert.equal(ev.fase, "terminado", ev.motivo);
  return ev.resultado!;
};
const malas = (r: ResultadoAlrededor, idioma: "es" | "en" = "es") => explicarAlrededor(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("el círculo de mínimos cuadrados encuentra centro y radio", () => {
  const ps = [0, 60, 120, 200, 260].map((g) => ({ x: 2 + 0.5 * Math.sin((g * Math.PI) / 180), y: -1 + 0.5 * Math.cos((g * Math.PI) / 180) }));
  const f = circulo(ps)!;
  assert.ok(Math.abs(f.c.x - 2) < 1e-9 && Math.abs(f.c.y + 1) < 1e-9 && Math.abs(f.r - 0.5) < 1e-9, JSON.stringify(f));
  assert.equal(circulo(ps.slice(0, 2)), null);
});

test("sin viento, dos círculos a la misma distancia aprueban", () => {
  const r = calificar(simularAlrededor());
  assert.equal(r.aprobado, true, malas(r).join(" | "));
  assert.equal(r.vueltas.length, 2);
  // 90 kt a 30°: radio de unos 1,240 ft
  assert.ok(r.vueltas.every((v) => Math.abs(v.radioFt - 1240) < 50 && v.variacionPct < 3), JSON.stringify(r.vueltas));
  assert.equal(r.lado, "derecha");
  assert.equal(r.maniobra, "ocho-alrededor");
});

test("el instructor pide el primer pilón, el cruce y el segundo", () => {
  const { ordenes } = correr(simularAlrededor());
  assert.ok(ordenes[0].startsWith("Vuela entre los dos pilones"), ordenes.join(" | "));
  assert.ok(ordenes[1].startsWith("Primer pilón"), ordenes[1]);
  assert.ok(ordenes[2].startsWith("Alas niveladas entre los pilones"), ordenes[2]);
  assert.ok(ordenes[3].startsWith("Segundo pilón"), ordenes[3]);
  assert.equal(ordenes.length, 4, ordenes.join(" | "));
});

test("con viento y la inclinación fija la distancia cambia: reprueba y dice cuánto", () => {
  const r = calificar(simularAlrededor({ vientoKt: 15 }));
  assert.equal(r.elementos["3"], "NS");
  assert.ok(r.peor.radio > 20, String(r.peor.radio));
  assert.ok(malas(r).some((x) => x.startsWith("La distancia al pilón no fue constante") && x.includes("viento")), malas(r).join(" | "));
  assert.equal(calificar(simularAlrededor()).elementos["3"], "S");
  assert.equal(calificar(simularAlrededor({ vientoKt: 10 })).elementos["3"], "NS", "10 kt sin corregir no pasa en Difícil");
  assert.equal(calificar(simularAlrededor({ vientoKt: 10 }), 1).elementos["3"], "S", "en Fácil sí");
});

test("altitud, velocidad, cruce e inclinación máxima de 45°", () => {
  assert.equal(calificar(simularAlrededor({ subeFt: 180 })).elementos["1"], "NS");
  assert.equal(calificar(simularAlrededor({ subeFt: 180 }), 1).elementos["1"], "S");
  assert.equal(calificar(simularAlrededor({ kt2: 105 })).elementos["2"], "NS");
  const c = calificar(simularAlrededor({ cruce: 1 }));
  assert.equal(c.elementos["4"], "NS");
  assert.ok(malas(c).some((x) => x.includes("necesitas al menos 3 s")), malas(c).join(" | "));
  const r = calificar(simularAlrededor({ incl1: 55, incl2: 55 }));
  assert.equal(r.elementos["5"], "NS");
  assert.ok(malas(r).some((x) => x.startsWith("Inclinaste hasta 55°")), malas(r).join(" | "));
});

test("la segunda vuelta al mismo lado anula", () => {
  const { ev } = correr(simularAlrededor({ mismoLado: true }));
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo ?? "", /lado contrario/);
});

test("fuera de 600–1,000 ft AGL no empieza; sin posición del lector, anulada", () => {
  const ms = simularAlrededor().map((m) => ({ ...m, agl: m.agl + 400 }));
  const { ev } = correr(ms);
  assert.equal(ev.fase, "armado");
  assert.equal(pasoAlrededor(ev, ms[ms.length - 1]), "altura");
  assert.equal(armarAlrededor({ ...ms[0], lat: undefined }).fase, "invalido");
  assert.equal(armarSoloAlrededor(null, simularAlrededor()[0]), true);
});

test("registrada; briefing; inglés sin acentos", () => {
  assert.equal(MANIOBRAS["ocho-alrededor"].id, "ocho-alrededor");
  const b = briefingAlrededor("es", 3).join(" ");
  for (const x of ["600", "1,000", "±100", "±10 kt", "±10%", "45°", "misma distancia"]) assert.ok(b.includes(x), x);
  const r = calificar(simularAlrededor({ vientoKt: 15, cruce: 1, incl1: 55, subeFt: 180 }));
  for (const l of [...briefingAlrededor("en", 1), ...malas(r, "en")]) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
});
