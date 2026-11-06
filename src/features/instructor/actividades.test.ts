import { test } from "node:test";
import assert from "node:assert/strict";
import { ACTIVIDADES, estadoActividad } from "./actividades.ts";

test("orden y acceso del menú", () => {
  assert.deepEqual(ACTIVIDADES.map((a) => [a.id, a.acceso]), [
    ["clase", "exclusivo"], ["recto-nivelado", "gratis"], ["vuelo-lento", "exclusivo"], ["perdidas", "exclusivo"], ["viraje-escarpado", "gratis"],
  ]);
});

test("estado de cada opción", () => {
  const ve = ACTIVIDADES.find((a) => a.id === "viraje-escarpado")!;
  assert.equal(estadoActividad(ve, false), "abierta");
  assert.equal(estadoActividad({ ...ve, acceso: "exclusivo" }, false), "candado");
  assert.equal(estadoActividad({ ...ve, acceso: "exclusivo" }, true), "abierta");
  assert.equal(estadoActividad(ACTIVIDADES[0], true), "proximamente");
});

test("en inglés no hay español", () => {
  for (const a of ACTIVIDADES) assert.doesNotMatch(`${a.nombre.en} ${a.detalle.en}`, /[áéíóúñ¿¡]/, a.id);
});
