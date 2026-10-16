import { test } from "node:test";
import assert from "node:assert/strict";
import { aPantalla, difAngulo, rumbo } from "./navGeo.ts";

const cerca = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("rumbos cardinales", () => {
  cerca(rumbo({ x: 0, y: 0 }, { x: 0, y: 10 }), 0);
  cerca(rumbo({ x: 0, y: 0 }, { x: 10, y: 0 }), 90);
  cerca(rumbo({ x: 0, y: 0 }, { x: 0, y: -10 }), 180);
  cerca(rumbo({ x: 0, y: 0 }, { x: -10, y: 0 }), 270);
});

test("la diferencia de ángulos toma el camino corto", () => {
  assert.equal(difAngulo(350, 10), 20);
  assert.equal(difAngulo(10, 350), -20);
  assert.equal(difAngulo(90, 270), -180);
});

test("con rumbo hacia arriba, lo que está adelante queda arriba del avión", () => {
  const centro = { x: 300, y: 400 };
  // Volando al este (090): un punto 10 NM al este queda justo arriba; uno al sur queda a la derecha.
  const adelante = aPantalla({ x: 10, y: 0 }, { x: 0, y: 0 }, 90, centro, 5);
  cerca(adelante.x, 300);
  cerca(adelante.y, 350);
  const sur = aPantalla({ x: 0, y: -10 }, { x: 0, y: 0 }, 90, centro, 5);
  cerca(sur.x, 350);
  cerca(sur.y, 400);
});
