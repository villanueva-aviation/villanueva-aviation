import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCESO_REPASO, LECCIONES, REPASO, estadoLeccion } from "./lecciones.ts";

test("14 lecciones en el orden de la escuela y solo el repaso disponible", () => {
  assert.equal(LECCIONES.length, 14);
  assert.deepEqual(LECCIONES.map((l) => l.numero), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  assert.equal(LECCIONES[0].nombre.es, "Familiarización");
  assert.equal(LECCIONES[7].nombre.es, "«S» sobre un camino");
  assert.equal(LECCIONES[12].nombre.es, "Repaso general");
  assert.equal(LECCIONES[12].nombre.en, "General review");
  assert.equal(LECCIONES[13].nombre.es, "Toques y despegues");
  assert.deepEqual(LECCIONES.filter((l) => l.disponible).map((l) => l.numero), [REPASO]);
  for (const l of LECCIONES) assert.doesNotMatch(l.nombre.en, /[áéíóúñ¿¡«»]/);
});

test("acceso al repaso: por ahora solo el fundador", () => {
  const r = LECCIONES[REPASO - 1];
  assert.equal(ACCESO_REPASO, "fundador");
  assert.equal(estadoLeccion(LECCIONES[0], { fundador: true, exclusivo: true }), "proximamente");
  assert.equal(estadoLeccion(r, { fundador: true, exclusivo: false }), "abierta");
  assert.equal(estadoLeccion(r, { fundador: false, exclusivo: true }), "candado");
  assert.equal(estadoLeccion(r, { fundador: false, exclusivo: false }), "candado");
});
