import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCESO_REPASO, LECCIONES, REPASO, claveLeccion, estadoLeccion, leccionDe } from "./lecciones.ts";

test("14 lecciones en el orden de la escuela", () => {
  assert.equal(LECCIONES.length, 14);
  assert.deepEqual(LECCIONES.map((l) => l.numero), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  assert.equal(LECCIONES[0].nombre.es, "Familiarización");
  assert.equal(LECCIONES[7].nombre.es, "«S» sobre un camino");
  assert.equal(LECCIONES[12].nombre.es, "Repaso general");
  assert.equal(LECCIONES[12].nombre.en, "General review");
  assert.equal(LECCIONES[13].nombre.es, "Toques y despegues");
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

test("2 y 3 (recto y nivelado) y 7 (vuelo lento) se abren con su maniobra, con la misma regla de acceso", () => {
  assert.deepEqual(LECCIONES.filter((l) => l.disponible).map((l) => l.numero), [2, 3, 4, 5, 6, 7, REPASO, 14]);
  assert.equal(LECCIONES[13].maniobra, "toques-despegues");
  assert.equal(LECCIONES[3].maniobra, "virajes-rumbos");
  assert.equal(LECCIONES[4].maniobra, "ascensos-descensos");
  assert.equal(LECCIONES[5].maniobra, "virajes-ascendiendo");
  assert.equal(LECCIONES[1].maniobra, "recto-nivelado");
  assert.equal(LECCIONES[2].maniobra, "recto-nivelado");
  assert.equal(LECCIONES[6].maniobra, "vuelo-lento");
  assert.equal(LECCIONES[REPASO - 1].maniobra, undefined);
  assert.equal(estadoLeccion(LECCIONES[6], { fundador: true, exclusivo: false }), "abierta");
  assert.equal(estadoLeccion(LECCIONES[6], { fundador: false, exclusivo: true }), "candado");
});

test("cada lección se guarda con su clave; el repaso conserva la de antes", () => {
  assert.equal(claveLeccion(LECCIONES[REPASO - 1]), "repaso-general");
  assert.equal(claveLeccion(LECCIONES[6]), "leccion-7");
  assert.equal(leccionDe(undefined), LECCIONES[REPASO - 1]);
  assert.equal(leccionDe("7"), LECCIONES[6]);
  assert.equal(leccionDe("8"), null, "no disponible");
  assert.equal(leccionDe("x"), null);
});
