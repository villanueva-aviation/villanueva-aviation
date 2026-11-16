import { test } from "node:test";
import assert from "node:assert/strict";
import { entradaEspera } from "../entrenador/esperas.ts";
import { alejamientoSiguiente, generarLlegada, norm180, norm360, radialEsperaDe } from "./navIfr.ts";

// Lección IFR 5: la llegada (spec 2026-11-16).

test("generarLlegada: R1 a 20–40° del avión, arco de 8–10 NM acercándose hasta 30–60° más allá", () => {
  for (const x of [0, 0.2, 0.5, 0.8, 0.99]) {
    const ll = generarLlegada(300, 9000, undefined, () => x);
    const d1 = Math.abs(norm180(ll.r1 - 300));
    assert.ok([20, 30, 40].includes(d1), String(d1));
    assert.ok(ll.arco.radioNm >= 8 && ll.arco.radioNm <= 10);
    assert.equal(ll.arco.desde, ll.r1);
    assert.equal(ll.arco.alejandose, false);
    assert.equal(ll.arco.saleAlejandose, false);
    assert.ok([30, 40, 50, 60].includes(Math.abs(norm180(ll.arco.hasta - ll.r1))));
    assert.equal(ll.espera.altitudFt, 9000);
    assert.equal(ll.espera.carta, false);
    assert.equal(ll.espera.tramoSeg, 60);
  }
});

test("generarLlegada: la espera da la entrada sorteada llegando por R2, nunca sobre R2, y cambia de entrada", () => {
  for (let radial = 0; radial < 360; radial += 10)
    for (const anterior of [undefined, ...(["directa", "paralela", "gota"] as const)]) {
      const prev = anterior && generarLlegada(radial, 9000, undefined, () => 0.5);
      const ll = generarLlegada(radial, 9000, prev && { ...prev, entrada: anterior }, Math.random);
      const r2 = ll.arco.hasta;
      assert.ok(Math.abs(norm180(radialEsperaDe(ll) - r2)) >= 30);
      for (const d of [-10, 0, 10]) assert.equal(entradaEspera(norm360(r2 + 180 + d), radialEsperaDe(ll), ll.espera.giros), ll.entrada);
      if (anterior) assert.notEqual(ll.entrada, anterior);
    }
});

test("alejamientoSiguiente: sigue de largo por R2", () => {
  const ll = generarLlegada(300, 9000, undefined, () => 0);
  assert.equal(alejamientoSiguiente(ll), norm360(ll.arco.hasta + 180));
});
