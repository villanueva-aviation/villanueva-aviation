import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarLento, avanzarLento, type ResultadoLento } from "./evaluadorLento.ts";
import { briefingLento, explicarLento } from "./explicacionLento.ts";
import { ordenLento } from "./vozLento.ts";
import { simularLento } from "./simular.ts";

const calificar = (ms: Muestra[]): ResultadoLento => ms.slice(1).reduce(avanzarLento, armarLento(ms[0])).resultado!;
const malas = (r: ResultadoLento, idioma: "es" | "en" = "es") => explicarLento(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto);

test("rumbo en el tramo recto: dice el tramo, el rumbo que debía y al que llegó, y cómo corregir", () => {
  const r = calificar(simularLento({ derivaRecto: -20 }));
  const l = malas(r).find((x) => x.startsWith("En el tramo recto"));
  assert.ok(l, malas(r).join(" | "));
  // El objetivo se toma con la deriva ya empezada: 089 o 090.
  assert.match(l, /te fuiste (19|20)° a la izquierda: debías mantener rumbo 0(89|90) y llegaste a 070/);
  assert.match(l, /pie derecho/);
});

test("rumbo al salir por el segundo viraje: dice dónde lo dejó el viraje", () => {
  const r = calificar(simularLento({ giro1: 120 }));
  assert.equal(Math.round(r.rumboAlSalir!), -30);
  const l = malas(r).find((x) => x.startsWith("Al salir"));
  assert.ok(l, malas(r).join(" | "));
  assert.match(l, /rumbo de entrada, 090, y llegaste a 060 \(30° a la izquierda\)/);
  assert.match(l, /segundo viraje te dejó en 060/);
  assert.ok(!malas(r).some((x) => x.startsWith("En el tramo recto")), "el recto estuvo bien");
});

test("rumbo al salir por la potencia: el avión se va a la izquierda, pie derecho", () => {
  const r = calificar(simularLento({ derivaSalida: -25 }));
  const l = malas(r).find((x) => x.startsWith("Al salir"));
  assert.ok(l, malas(r).join(" | "));
  assert.match(l, /potencia completa/);
  assert.match(l, /pie derecho/);
  assert.ok(Math.abs(r.rumboAlSalir!) < 5);
});

test("en inglés, sin acentos", () => {
  for (const r of [calificar(simularLento({ derivaRecto: 25 })), calificar(simularLento({ giro1: 120 })), calificar(simularLento({ derivaSalida: 25 }))]) {
    for (const t of malas(r, "en")) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  }
});

test("un intento guardado antes de este cambio (sin inicioSalida) sigue explicándose", () => {
  const { inicioSalida: _, rumboAlSalir: __, ...viejo } = calificar(simularLento({ giro1: 120 }));
  assert.ok(malas(viejo as ResultadoLento).some((x) => x.includes("rumbo")));
});

test("el briefing y la orden de salida dicen que al salir se vuelve al rumbo de entrada", () => {
  assert.ok(briefingLento("es", 1).some((l) => l.includes("rumbo ±20° en el tramo recto y al salir")));
  const ms = simularLento();
  let ev = armarLento(ms[0]);
  for (const m of ms.slice(1, 400)) ev = avanzarLento(ev, m);
  assert.match(ordenLento("vira2", "sal", ev, "es")!, /en rumbo 090/);
});
