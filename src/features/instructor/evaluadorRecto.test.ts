import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarRecto, avanzarRecto } from "./evaluadorRecto.ts";
import { simularRecto } from "./simular.ts";

const correr = (ms: Muestra[]) => ms.slice(1).reduce(avanzarRecto, armarRecto(ms[0]));

test("un vuelo estable de 2 minutos aprueba con 100", () => {
  const ev = correr(simularRecto());
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.aprobado, true);
  assert.equal(ev.resultado!.calificacion, 100);
  assert.equal(Math.round(ev.resultado!.objetivo.altitud), 3500);
});

test("no empieza mientras el avión sigue subiendo", () => {
  const ms = simularRecto({ subidaSeg: 30 });
  const ev = correr(ms);
  assert.ok(ev.resultado!.objetivo.t >= ms[0].t + 30, String(ev.resultado!.objetivo.t));
});

test("el rumbo cruza el norte sin error", () => {
  const ev = correr(simularRecto({ rumbo: 358, deriva: { campo: "rumbo", valor: 6, desde: 20, segundos: 10 } }));
  assert.equal(Math.round(ev.resultado!.peor.rumbo), 6);
  assert.equal(ev.resultado!.ns.rumbo, false);
});

test("una caída de 150 ft por 6 s es NS en altitud", () => {
  const ev = correr(simularRecto({ deriva: { campo: "altitud", valor: -150, desde: 30, segundos: 6 } }));
  assert.equal(ev.resultado!.elementos["1"], "NS");
  assert.equal(ev.resultado!.aprobado, false);
  assert.ok(ev.resultado!.calificacion < 100);
});

test("una pausa a media maniobra anula el intento", () => {
  const ev = correr(simularRecto({ pausaEn: 40 }));
  assert.equal(ev.fase, "invalido");
  assert.equal(ev.motivo, "Pausaste el simulador: el intento no se califica.");
});

test("termina a los 120 s del objetivo", () => {
  const r = correr(simularRecto()).resultado!;
  const dur = r.muestras.at(-1)!.t - r.objetivo.t;
  assert.ok(dur >= 120 && dur < 121, String(dur));
});
