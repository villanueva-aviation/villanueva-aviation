import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Muestra } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { traducirAviso, traducirMotivo } from "./idiomaInstructor.ts";

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
