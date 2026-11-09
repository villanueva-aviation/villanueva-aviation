import { test } from "node:test";
import assert from "node:assert/strict";
import { nivelDe, sugerirNivel, tolFinal, tolLento, tolRecto, tolViraje } from "./nivel.ts";

test("tolerancias por nivel: Difícil es el ACS de hoy", () => {
  assert.deepEqual(tolViraje(3), { altitudFt: 100, velocidadKt: 10, inclinacionGrados: 5, rumboSalidaGrados: 10, bola: 0.25, nsSeg: 3, giroMin: 330 });
  assert.deepEqual(tolViraje(1), { altitudFt: 200, velocidadKt: 20, inclinacionGrados: 10, rumboSalidaGrados: 20, bola: 0.5, nsSeg: 6, giroMin: 300 });
  assert.equal(tolViraje(2).inclinacionGrados, 7);
  assert.equal(tolViraje(2).bola, 0.375);
  assert.deepEqual(tolRecto(1), { altitudFt: 200, rumboGrados: 20, velocidadKt: 20, bola: 0.5, nsSeg: 6, duracionSeg: 60 });
  assert.equal(tolRecto(2).duracionSeg, 90);
  assert.deepEqual(tolLento(3), { altitudFt: 100, rumboGrados: 10, inclinacionGrados: 10, velocidadMasKt: 10, bola: 0.25, nsSeg: 3 });
  assert.equal(tolLento(1).velocidadMasKt, 20);
  assert.deepEqual(tolFinal(1), { menos: 10, mas: 15 });
  assert.deepEqual(tolFinal(2), { menos: 7, mas: 12 });
  assert.deepEqual(tolFinal(3), { menos: 5, mas: 10 });
});

test("sin nivel (intentos viejos) cuenta como Difícil", () => {
  assert.equal(nivelDe(undefined), 3);
  assert.equal(nivelDe({}), 3);
  assert.equal(nivelDe({ nivel: 1 }), 1);
  assert.equal(nivelDe({ nivel: 7 }), 3);
});

const i = (nivel: number | undefined, aprobado: boolean, modo: "practica" | "checkride" = "practica") => ({ modo, aprobado, detalle: nivel === undefined ? {} : { nivel } });

test("sugerirNivel: dos prácticas aprobadas seguidas en el nivel actual suben uno", () => {
  assert.equal(sugerirNivel([i(1, true), i(1, true)], 1), 2);
  assert.equal(sugerirNivel([i(2, true), i(2, true)], 2), 3);
  assert.equal(sugerirNivel([i(3, true), i(3, true)], 3), null);
  assert.equal(sugerirNivel([i(1, true), i(1, false), i(1, true)], 1), null);
  assert.equal(sugerirNivel([i(1, true), i(2, true)], 2), null);
  assert.equal(sugerirNivel([i(1, true), i(1, true, "checkride")], 1), null);
  assert.equal(sugerirNivel([i(1, true)], 1), null);
});
