import { test } from "node:test";
import assert from "node:assert/strict";
import { CASOS_PRACTICA, casosExamen, deltaRadial, desvioGrados, distanciaConsejo, generarEjercicio, norm180, pasoEstacion, puntos, type Ejercicio } from "./navIfr.ts";
import { tolInterceptacion } from "./nivel.ts";

test("norm180 deja los grados entre -180 y 180", () => {
  assert.equal(norm180(190), -170);
  assert.equal(norm180(-190), 170);
  assert.equal(norm180(20), 20);
});

test("desvío alrededor del 360: curso 350 y el avión en el radial 010 son 20°, con signo contrario en TO", () => {
  const desde: Ejercicio = { caso: "alejandose", radial: 350, desde: true, curso: 350 };
  const hacia: Ejercicio = { caso: "acercandose", radial: 350, desde: false, curso: 170 };
  assert.equal(desvioGrados(desde, 10), 20);
  assert.equal(desvioGrados(hacia, 10), -20);
  assert.equal(desvioGrados(desde, 340), -10);
});

test("un punto de la barra son 2 grados", () => {
  assert.equal(puntos(-3), -1.5);
});

test("cada caso de práctica da un curso múltiplo de 10 y el sentido que le toca", () => {
  for (const caso of CASOS_PRACTICA) {
    const ej = generarEjercicio(caso, 90, 10, 90, () => 0.2);
    assert.equal(ej.caso, caso);
    assert.equal(ej.curso % 10, 0);
    assert.equal(ej.radial % 10, 0);
    assert.equal(ej.desde, ej.curso === ej.radial);
    if (caso === "contrario") assert.ok(Math.abs(norm180(ej.curso - 90)) > 90, `contrario: curso ${ej.curso}`);
    if (caso.startsWith("alejandose")) assert.equal(ej.desde, true);
    if (caso.startsWith("acercandose")) assert.equal(ej.desde, false);
  }
});

test("la diferencia de radial deja unas 2.5 NM de separación, entre 15 y 60 grados; amplio suma 30 hasta 90", () => {
  assert.equal(deltaRadial(2, false), 60);
  assert.equal(deltaRadial(20, false), 15);
  assert.equal(deltaRadial(2, true), 90);
  assert.equal(generarEjercicio("alejandose", 90, 2, 90, () => 0.1).radial, 150);
  assert.equal(generarEjercicio("alejandose", 90, 2, 90, () => 0.9).radial, 30);
});

test("el examen trae una interceptación alejándose y una acercándose", () => {
  const [a, b] = casosExamen(() => 0.1);
  assert.ok(a.startsWith("alejandose"));
  assert.ok(b.startsWith("acercandose"));
});

test("consejo por distancia: menos de 5 NM cerca, más de 15 lejos", () => {
  assert.equal(distanciaConsejo(3), "cerca");
  assert.equal(distanciaConsejo(20), "lejos");
  assert.equal(distanciaConsejo(10), null);
});

test("tolerancias de interceptación por nivel", () => {
  assert.equal(tolInterceptacion(2).sobrepasoPuntos, 1);
  assert.equal(tolInterceptacion(1).sobrepasoPuntos, 1.5);
  assert.equal(tolInterceptacion(3).cortoSeg, 20);
  assert.equal(tolInterceptacion(2).establecidoPuntos, 1);
});

test("pasoEstacion: del otro lado a partir de 100°, de regreso a 80° o menos (histéresis)", () => {
  assert.equal(pasoEstacion(false, 90 + 95, 90), false);
  assert.equal(pasoEstacion(false, 90 + 100, 90), true);
  assert.equal(pasoEstacion(true, 90 + 85, 90), true);
  assert.equal(pasoEstacion(true, 90 + 80, 90), false);
  assert.equal(pasoEstacion(false, 350 + 150, 350), true);
});
