import { test } from "node:test";
import assert from "node:assert/strict";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";
import { crearChecklist, type Checklist } from "./checklistVoz.ts";
import type { ResultadoComun } from "./maniobras.ts";
import { crearRepaso, type EstadoRepaso } from "./repaso.ts";
import { debriefingRepaso, paraGuardarRepaso } from "./debriefingRepaso.ts";

const res = (aprobado: boolean, calificacion = aprobado ? 90 : 50): ResultadoComun => ({ aprobado, calificacion, elementos: {}, avisos: [], muestras: [] });
const SORTEO = ["recto-nivelado", "viraje-escarpado", "vuelo-lento", "recto-nivelado"] as const;

/** Checklist con todas las secciones leídas y todo dicho, salvo lo que cambie `cambiar`. */
function checklist(cambiar?: (cl: Checklist) => void): Checklist {
  const cl = crearChecklist(CHECKLIST_VOZ_C172);
  cl.leidas = cl.secciones.map((s) => s.id);
  for (const s of cl.secciones) cl.puntos[s.id] = cl.puntos[s.id].map(() => ({ estado: "dicho" }));
  cambiar?.(cl);
  return cl;
}
const saltado = (cl: Checklist) => (cl.puntos["arranque"][0] = { estado: "saltado" });
const noHecho = (cl: Checklist) => (cl.puntos["arranque"][1] = { estado: "no-hecho" });

function repaso(modo: "practica" | "checkride", resultados: (ResultadoComun | null)[]): EstadoRepaso {
  const e = crearRepaso(modo, [...SORTEO]);
  return {
    ...e,
    etapa: "terminado",
    hechas: e.hechas.map((h, i) => ({ ...h, resultado: resultados[i] ?? null, intentoId: resultados[i] ? `id${i}` : null })),
    tomas: { ...e.tomas, rotacionKt: 57, vy: { suma: 74 * 3, n: 3 }, final: { min: 63, max: 70, n: 5 }, tocoEnPista: true },
    zona: { nombre: { es: "Cajititlán", en: "Cajititlan" }, lat: 20.44, lon: -103.31, radioNm: 3 },
  };
}
const CUATRO = [res(true), res(true), res(true), res(true)];
const parte = (d: ReturnType<typeof debriefingRepaso>, id: string) => d.partes.find((p) => p.id === id)!;

test("checkride aprobado: 4 aprobadas y sin saltados", () => {
  assert.equal(debriefingRepaso(repaso("checkride", CUATRO), checklist(), "es").aprobado, true);
});

test("checkride no aprobado: un punto saltado, una no aprobada, una sin volar o una sección sin leer", () => {
  assert.equal(debriefingRepaso(repaso("checkride", CUATRO), checklist(saltado), "es").aprobado, false);
  assert.equal(debriefingRepaso(repaso("checkride", [res(true), res(false), res(true), res(true)]), checklist(), "es").aprobado, false);
  assert.equal(debriefingRepaso(repaso("checkride", [res(true), res(true), null, null]), checklist(), "es").aprobado, false);
  const sinApagado = checklist((cl) => (cl.leidas = cl.leidas.filter((s) => s !== "apagado")));
  assert.equal(debriefingRepaso(repaso("checkride", CUATRO), sinApagado, "es").aprobado, false);
  assert.ok(parte(debriefingRepaso(repaso("checkride", CUATRO), sinApagado, "es"), "checklist").repetir.some((r) => r.includes("Apagado")));
});

test("práctica: sin aprobado", () => {
  assert.equal(debriefingRepaso(repaso("practica", CUATRO), checklist(), "es").aprobado, null);
});

test("checklist: dicho pero no hecho va a repetir y no reprueba por sí solo", () => {
  const d = debriefingRepaso(repaso("checkride", CUATRO), checklist(noHecho), "es");
  assert.equal(d.aprobado, true);
  assert.equal(parte(d, "checklist").repetir.length, 1);
});

test("partes en orden; maniobras con título y calificación; no voladas dicen «No se voló»", () => {
  const d = debriefingRepaso(repaso("practica", [res(true, 92), res(false, 61), null, null]), checklist(), "es");
  assert.deepEqual(d.partes.map((p) => p.id), ["checklist", "despegue", "maniobras", "aterrizaje"]);
  const m = parte(d, "maniobras");
  assert.deepEqual(m.bien, ["Recto y nivelado: 92/100"]);
  assert.deepEqual(m.repetir, ["Viraje escarpado: 61/100", "Vuelo lento: No se voló", "Recto y nivelado: No se voló"]);
  const en = parte(debriefingRepaso(repaso("practica", [null]), checklist(), "en"), "maniobras");
  assert.ok(en.repetir.includes("Steep turn: Not flown"), en.repetir.join(" | "));
});

test("despegue y aterrizaje dentro de tolerancia van a lo que salió bien", () => {
  const d = debriefingRepaso(repaso("practica", CUATRO), checklist(), "es");
  assert.equal(parte(d, "despegue").repetir.length, 0);
  assert.equal(parte(d, "despegue").bien.length, 2);
  assert.equal(parte(d, "aterrizaje").repetir.length, 0);
  const malo = repaso("practica", CUATRO);
  malo.tomas = { ...malo.tomas, rotacionKt: 45, final: { min: 60, max: 80, n: 4 }, tocoEnPista: false };
  const dm = debriefingRepaso(malo, checklist(), "es");
  assert.equal(parte(dm, "despegue").repetir.length, 1);
  assert.equal(parte(dm, "aterrizaje").repetir.length, 2);
});

test("textos en inglés sin acentos, también con puntos saltados", () => {
  const d = debriefingRepaso(repaso("checkride", [res(true), res(false), null, null]), checklist((cl) => { saltado(cl); noHecho(cl); cl.leidas = []; }), "en");
  for (const p of d.partes) for (const t of [p.titulo, ...p.bien, ...p.repetir]) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
});

test("lo que se guarda", () => {
  const g = paraGuardarRepaso(repaso("checkride", [res(true, 90), res(false, 60), null, null]), checklist(saltado));
  assert.equal(g.calificacion, 75);
  assert.equal(g.aprobado, false);
  assert.deepEqual(g.elementos, { checklist: "NS", despegue: "S", maniobras: "NS", aterrizaje: "S" });
  const det = g.detalle as { maniobras: { id: string; calificacion: number | null; aprobado: boolean | null; intentoId: string | null }[]; zona: string; checklist: { saltados: string[] } };
  assert.deepEqual(det.maniobras[1], { id: "viraje-escarpado", calificacion: 60, aprobado: false, intentoId: "id1" });
  assert.deepEqual(det.maniobras[2], { id: "vuelo-lento", calificacion: null, aprobado: null, intentoId: null });
  assert.equal(det.zona, "Cajititlán");
  assert.equal(det.checklist.saltados.length, 1);
  assert.equal(paraGuardarRepaso(repaso("practica", CUATRO), checklist()).aprobado, false);
  assert.equal(paraGuardarRepaso(repaso("practica", [null]), checklist()).calificacion, 0);
});
