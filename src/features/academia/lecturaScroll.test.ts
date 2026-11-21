import { test } from "node:test";
import assert from "node:assert/strict";
import { leidosAhora, pasoActivo, pasosDeTema } from "./lecturaScroll.ts";

test("pasosDeTema: la clave y cada punto son un paso", () => {
  const tema = { id: "t", titulo: "T", texto: "largo", clave: "K", puntos: [{ titulo: "A", texto: "a" }, { titulo: "B", texto: "b" }] };
  assert.deepEqual(pasosDeTema(tema), [{ texto: "K" }, { titulo: "A", texto: "a" }, { titulo: "B", texto: "b" }]);
});

test("pasosDeTema: sin puntos, el texto completo es un solo paso", () => {
  assert.deepEqual(pasosDeTema({ id: "t", titulo: "T", texto: "largo" }), [{ texto: "largo" }]);
});

test("pasoActivo: el último paso que ya cruzó la mitad", () => {
  assert.equal(pasoActivo([100, 500, 900], 400), 0);
  assert.equal(pasoActivo([100, 500, 900], 600), 1);
  assert.equal(pasoActivo([500, 900], 400), 0);
  assert.equal(pasoActivo([-900, -500, -100], 400), 2);
});

test("leidosAhora: en pantalla y con el último paso arriba de la mitad, se marca", () => {
  const r = leidosAhora([{ id: "a", arriba: -200, abajo: 500, topUltimo: 300 }], 800, new Set());
  assert.deepEqual(r.leidos, ["a"]);
});

test("leidosAhora: en pantalla pero el último paso abajo de la mitad, solo queda visto", () => {
  const r = leidosAhora([{ id: "a", arriba: 100, abajo: 1400, topUltimo: 1000 }], 800, new Set());
  assert.deepEqual(r.leidos, []);
  assert.ok(r.vistos.has("a"));
});

test("leidosAhora: un tema que nunca entró en pantalla no se marca (cambio de misión estando abajo)", () => {
  const r = leidosAhora([{ id: "a", arriba: -3000, abajo: -1500, topUltimo: -1800 }], 800, new Set());
  assert.deepEqual(r.leidos, []);
  assert.equal(r.vistos.size, 0);
});

test("leidosAhora: visto antes y ya arriba de la pantalla se marca (salto con la tecla Fin)", () => {
  const r = leidosAhora([{ id: "a", arriba: -3000, abajo: -1500, topUltimo: -1800 }], 800, new Set(["a"]));
  assert.deepEqual(r.leidos, ["a"]);
});
