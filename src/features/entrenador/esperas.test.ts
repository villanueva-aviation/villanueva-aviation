import assert from "node:assert/strict";
import { test } from "node:test";
import { diferencia, entradaEspera, generarSituacion, norm, SECTORES } from "./esperas.ts";

test("ejemplo de la FAA: espera al este del VOR (radial 090), giros a la derecha", () => {
  assert.equal(entradaEspera(230, 90, "derecha"), "gota");
  assert.equal(entradaEspera(300, 90, "derecha"), "paralela");
  assert.equal(entradaEspera(120, 90, "derecha"), "directa");
});

test("una espera a la izquierda refleja las entradas", () => {
  // Espejo de los tres ejemplos anteriores: 090 - diferencia
  assert.equal(entradaEspera(norm(90 - 140), 90, "izquierda"), "gota");
  assert.equal(entradaEspera(norm(90 - 210), 90, "izquierda"), "paralela");
  assert.equal(entradaEspera(norm(90 - 30), 90, "izquierda"), "directa");
});

test("llegar con el rumbo de alejamiento es directa; con el de acercamiento es gota/paralela según el lado", () => {
  assert.equal(entradaEspera(90, 90, "derecha"), "directa");
  assert.equal(diferencia(270, 90, "derecha"), 180);
});

test("los sectores miden 180, 70 y 110 grados y cubren la circunferencia sin huecos", () => {
  const anchos = Object.fromEntries(SECTORES.map((s) => [s.entrada, s.hasta - s.desde]));
  assert.deepEqual(anchos, { directa: 180, gota: 70, paralela: 110 });
  const cuenta = { directa: 0, gota: 0, paralela: 0 };
  for (let d = 0; d < 360; d++) cuenta[entradaEspera(d, 0, "derecha")]++;
  assert.deepEqual(cuenta, { directa: 180, gota: 70, paralela: 110 });
});

test("generarSituacion: rumbos múltiplos de 5 y nunca pegados a una frontera", () => {
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < 500; i++) {
    const s = generarSituacion(azar);
    assert.equal(s.rumbo % 5, 0);
    assert.equal(s.alejamiento % 10, 0);
    const d = diferencia(s.rumbo, s.alejamiento, s.giros);
    for (const f of [110, 180, 290]) assert.ok(Math.abs(d - f) >= 10, `d=${d} pegado a ${f}`);
  }
});
