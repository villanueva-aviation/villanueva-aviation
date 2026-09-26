import assert from "node:assert/strict";
import { test } from "node:test";
import { comoSeVuela, diferencia, entradaEspera, generarSituacion, norm, SECTORES } from "./esperas.ts";

test("caso contrastado con calculadores externos: alejamiento 100°, giros a la derecha, llegas con 050° es gota", () => {
  assert.equal(entradaEspera(50, 100, "derecha"), "gota");
});

test("figura de la FAA: espera al este del VOR (radial 090), giros a la derecha; 020-090 gota, 090-200 paralela, 200-020 directa", () => {
  for (const rumbo of [30, 50, 80]) assert.equal(entradaEspera(rumbo, 90, "derecha"), "gota", `rumbo ${rumbo}`);
  for (const rumbo of [100, 150, 190]) assert.equal(entradaEspera(rumbo, 90, "derecha"), "paralela", `rumbo ${rumbo}`);
  for (const rumbo of [210, 270, 340, 10]) assert.equal(entradaEspera(rumbo, 90, "derecha"), "directa", `rumbo ${rumbo}`);
});

test("una espera a la izquierda refleja las entradas", () => {
  // Espejo de la figura anterior: 090 - diferencia
  assert.equal(entradaEspera(norm(90 + 50), 90, "izquierda"), "gota");
  assert.equal(entradaEspera(norm(90 - 50), 90, "izquierda"), "paralela");
  assert.equal(entradaEspera(norm(90 - 180), 90, "izquierda"), "directa");
});

test("llegar con el mismo rumbo del acercamiento (recorriendo el tramo de acercamiento) es directa", () => {
  assert.equal(entradaEspera(270, 90, "derecha"), "directa");
  assert.equal(diferencia(270, 90, "derecha"), 180);
});

test("los sectores miden 70, 110 y 180 grados y cubren la circunferencia sin huecos", () => {
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
    for (const f of [0, 110, 290, 360]) assert.ok(Math.abs(d - f) >= 10, `d=${d} pegado a ${f}`);
  }
});

test("la entrada paralela gira hacia el lado de la espera: a la izquierda si los giros son a la derecha", () => {
  assert.match(comoSeVuela("paralela", "derecha"), /giras a la izquierda/);
  assert.match(comoSeVuela("paralela", "izquierda"), /giras a la derecha/);
  assert.match(comoSeVuela("gota", "derecha"), /giras a la derecha/);
});
