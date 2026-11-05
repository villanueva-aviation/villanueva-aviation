import { test } from "node:test";
import assert from "node:assert/strict";
import { ELEMENTOS_ACS, MANIOBRAS, vaPorPeso } from "./virajeEscarpado.ts";

test("Va interpola por peso y se limita en los extremos", () => {
  assert.equal(vaPorPeso(2550), 105);
  assert.equal(vaPorPeso(2200), 98);
  assert.equal(vaPorPeso(1900), 90);
  assert.equal(vaPorPeso(2375), 101.5);
  assert.equal(vaPorPeso(3000), 105);
  assert.equal(vaPorPeso(1500), 90);
});

test("los elementos ACS son cinco, S1 a S5", () => {
  assert.deepEqual(
    ELEMENTOS_ACS.map((e) => e.codigo),
    ["PA.V.A.S1", "PA.V.A.S2", "PA.V.A.S3", "PA.V.A.S4", "PA.V.A.S5"],
  );
});

test("el viraje escarpado es gratis", () => {
  assert.equal(MANIOBRAS.find((m) => m.id === "viraje-escarpado")?.acceso, "gratis");
});
