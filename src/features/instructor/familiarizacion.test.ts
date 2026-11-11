import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarFamiliarizacion, armarSoloFamiliarizacion, avanzarFamiliarizacion, TAREAS, type EvaluacionFamiliarizacion } from "./evaluadorFamiliarizacion.ts";
import { briefingFamiliarizacion, explicarFamiliarizacion, listaPasosFamiliarizacion, ordenFamiliarizacion, pasoFamiliarizacion, semaforoFamiliarizacion } from "./textosFamiliarizacion.ts";
import { simularFamiliarizacion } from "./simular.ts";
import { MANIOBRAS } from "./maniobras.ts";

const correr = (ms: Muestra[]): { ev: EvaluacionFamiliarizacion; ordenes: string[] } => {
  let ev = armarFamiliarizacion(ms[0]);
  const ordenes: string[] = [];
  for (const x of ms.slice(1)) {
    const antes = pasoFamiliarizacion(ev, x);
    ev = avanzarFamiliarizacion(ev, x);
    const o = ordenFamiliarizacion(antes, pasoFamiliarizacion(ev, x), ev, "es");
    if (o) ordenes.push(o);
  }
  return { ev, ordenes };
};

test("los 8 movimientos en orden terminan la lección, aprobada", () => {
  const { ev, ordenes } = correr(simularFamiliarizacion());
  assert.equal(ev.fase, "terminado", ev.motivo);
  const r = ev.resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
  assert.deepEqual(r.tareas.map((x) => x.id), TAREAS.map((x) => x.id));
  assert.ok(r.tareas.every((x) => x.seg > 0 && x.seg < 12), JSON.stringify(r.tareas));
  // Una orden por parte: 6 movimientos de ida y vuelta y 2 de potencia.
  assert.equal(ordenes.length, 14, ordenes.join(" | "));
  assert.ok(ordenes[0].startsWith("Alabeo"), ordenes[0]);
  assert.ok(ordenes[1].startsWith("Bien. Ahora nivela"), ordenes[1]);
  assert.equal(r.maniobra, "familiarizacion");
});

test("si falta un movimiento se queda esperándolo", () => {
  const ms = simularFamiliarizacion({ omitir: "guinada-der" });
  const { ev } = correr(ms);
  assert.equal(ev.fase, "tareas");
  assert.equal(pasoFamiliarizacion(ev, ms[ms.length - 1]), "guinada-der:0");
  const luces = semaforoFamiliarizacion(ev, ms[ms.length - 1]);
  assert.deepEqual(luces, { alabeo: "verde", cabeceo: "verde", guinada: "ambar", potencia: "gris" });
  assert.deepEqual(listaPasosFamiliarizacion("guinada-der:0", "es").map((x) => x.estado), ["hecho", "hecho", "actual", "pendiente"]);
});

test("el alabeo cuenta solo hacia el lado que se pidió", () => {
  const { ev } = correr(simularFamiliarizacion({ alReves: true }));
  // Primero a la derecha: no cuenta; luego a la izquierda sí, y a la derecha ya no la vuelve a hacer.
  assert.notEqual(ev.fase, "terminado");
  assert.equal(ev.hechas[0]?.id, "alabeo-izq");
  assert.equal(ev.k, 1);
});

test("sin cabeceo del lector, anulada; se arma sola nivelado", () => {
  const m = simularFamiliarizacion()[0];
  assert.equal(armarFamiliarizacion({ ...m, cabeceo: undefined }).fase, "invalido");
  assert.equal(armarSoloFamiliarizacion(null, m), true);
});

test("registrada; briefing sin tolerancias; inglés sin acentos", () => {
  assert.equal(MANIOBRAS["familiarizacion"].id, "familiarizacion");
  const b = briefingFamiliarizacion("es").join(" ");
  for (const x of ["alerones", "elevador", "pedales", "acelerador", "20°", "5°", "compensador"]) assert.ok(b.includes(x), x);
  const { ev } = correr(simularFamiliarizacion());
  const en = [...briefingFamiliarizacion("en"), ...explicarFamiliarizacion(ev.resultado!, "en").map((l) => l.texto)];
  for (const l of en) assert.doesNotMatch(l, /[áéíóúñ¿¡]/);
  assert.ok(explicarFamiliarizacion(ev.resultado!, "es").every((l) => l.tipo === "bien"));
});
