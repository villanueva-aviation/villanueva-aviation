import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Muestra } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { AVISO_REPORTE, textosReporte, traducirAviso, traducirMotivo } from "./idiomaInstructor.ts";

/** Cada motivo con el que el evaluador puede anular un intento. */
function motivos(): string[] {
  const muestras = simularManiobra();
  const base = muestras[0];
  const armado = armar(crearEvaluacion(), base);
  const siguiente = (cambio: Partial<Muestra>) => avanzar(armado, { ...muestras[1], ...cambio }).motivo!;
  return [
    siguiente({ pausa: true }),
    siguiente({ slew: true }),
    siguiente({ tasa: 2 }),
    siguiente({ t: base.t + 3 }),
    siguiente({ titulo: "Cessna 152" }),
    armar(crearEvaluacion(), { ...base, enTierra: true }).motivo!,
  ];
}

test("cada motivo del evaluador tiene inglés", () => {
  const lista = motivos();
  assert.equal(lista.filter(Boolean).length, 6, JSON.stringify(lista));
  for (const m of lista) {
    const en = traducirMotivo(m, "en");
    assert.notEqual(en, m);
    assert.doesNotMatch(en, /[áéíóúñ]|intento/i, en);
  }
});

test("en español los motivos no cambian", () => {
  for (const m of motivos()) assert.equal(traducirMotivo(m), m);
});

test("el aviso de altura tiene inglés", () => {
  assert.equal(
    traducirAviso("Bajaste de 1500 ft sobre el terreno: haz la maniobra más alto.", "en"),
    "You went below 1500 ft above the ground: fly the maneuver higher.",
  );
});

test("textos del reporte en inglés sin imitar formularios", () => {
  const en = textosReporte("en");
  assert.equal(en.aviso, "Simulator practice. Not an official document and does not replace an exam before an aviation authority.");
  assert.equal(en.titulo(false), "PRACTICE CHECKRIDE — NOT PASSED");
  assert.equal(en.titulo(true), "PRACTICE CHECKRIDE — PASSED");
  assert.doesNotMatch(JSON.stringify(en), /Disapproval|FAA|certif/i);
  assert.equal(textosReporte("es").aviso, AVISO_REPORTE);
  assert.equal(textosReporte().titulo(false), "AVISO DE NO APROBACIÓN");
});
