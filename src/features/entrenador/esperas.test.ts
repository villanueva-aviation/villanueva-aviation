import assert from "node:assert/strict";
import { test } from "node:test";
import { comoSeVuela, diferencia, entradaEspera, generarSituacion, norm, SECTORES } from "./esperas.ts";

test("ejemplo de la FAA: espera al este del VOR (radial 090), giros a la derecha", () => {
  assert.equal(entradaEspera(230, 90, "derecha"), "gota");
  assert.equal(entradaEspera(160, 90, "derecha"), "paralela");
  assert.equal(entradaEspera(340, 90, "derecha"), "directa");
});

test("una espera a la izquierda refleja las entradas", () => {
  // Espejo de los tres ejemplos anteriores: 090 - diferencia
  assert.equal(entradaEspera(norm(90 - 140), 90, "izquierda"), "gota");
  assert.equal(entradaEspera(norm(90 - 70), 90, "izquierda"), "paralela");
  assert.equal(entradaEspera(norm(90 - 250), 90, "izquierda"), "directa");
});

test("regla por el rumbo de acercamiento (espera a la derecha): derecha directa, izquierda hasta 70° gota, más de 70° paralela", () => {
  const acercamiento = 270; // curso de alejamiento 090
  assert.equal(entradaEspera(acercamiento + 40, 90, "derecha"), "directa"); // 40° a la derecha
  assert.equal(entradaEspera(acercamiento - 40, 90, "derecha"), "gota"); // 40° a la izquierda
  assert.equal(entradaEspera(acercamiento - 110, 90, "derecha"), "paralela"); // 110° a la izquierda
});

test("llegar con el mismo rumbo del acercamiento (dentro del patrón) es directa", () => {
  assert.equal(entradaEspera(275, 90, "derecha"), "directa");
  assert.equal(diferencia(270, 90, "derecha"), 180);
});

test("los sectores miden 180, 70 y 110 grados y cubren la circunferencia sin huecos", () => {
  const anchos = Object.fromEntries(SECTORES.map((s) => [s.entrada, s.hasta - s.desde]));
  assert.deepEqual(anchos, { directa: 180, gota: 70, paralela: 110 });
  const cuenta = { directa: 0, gota: 0, paralela: 0 };
  for (let d = 0; d < 360; d++) cuenta[entradaEspera(d, 0, "derecha")]++;
  assert.deepEqual(cuenta, { directa: 180, gota: 70, paralela: 110 });
});

test("directa equivale a que un giro en el sentido de la espera hasta el rumbo de alejamiento sea menor de 180°", () => {
  for (let rumbo = 0; rumbo < 360; rumbo += 5) {
    const giroDerecha = norm(90 - rumbo); // giro a la derecha desde el rumbo de llegada hasta OC=090
    const esperado = giroDerecha > 0 && giroDerecha < 180;
    if (giroDerecha === 0 || giroDerecha === 180) continue; // fronteras
    assert.equal(entradaEspera(rumbo, 90, "derecha") === "directa", esperado, `rumbo ${rumbo}`);
  }
});

test("generarSituacion: rumbos múltiplos de 5 y nunca pegados a una frontera", () => {
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < 500; i++) {
    const s = generarSituacion(azar);
    assert.equal(s.rumbo % 5, 0);
    assert.equal(s.alejamiento % 10, 0);
    const d = diferencia(s.rumbo, s.alejamiento, s.giros);
    for (const f of [0, 110, 180, 360]) assert.ok(Math.abs(d - f) >= 10, `d=${d} pegado a ${f}`);
  }
});

test("la entrada paralela gira hacia el lado de la espera: a la izquierda si los giros son a la derecha", () => {
  assert.match(comoSeVuela("paralela", "derecha"), /giras a la izquierda/);
  assert.match(comoSeVuela("paralela", "izquierda"), /giras a la derecha/);
  assert.match(comoSeVuela("gota", "derecha"), /giras a la derecha/);
});
