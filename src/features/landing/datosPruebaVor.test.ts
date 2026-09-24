import { test } from "node:test";
import assert from "node:assert/strict";
import { DESVIACION_INICIAL, OPCIONES, PUNTOS_POR_LADO, desviacionTras } from "./datosPruebaVor.ts";

test("hay exactamente una respuesta correcta", () => {
  assert.equal(OPCIONES.filter((o) => o.correcta).length, 1);
});

test("la respuesta correcta es virar hacia la aguja y la centra", () => {
  const correcta = OPCIONES.find((o) => o.correcta)!;
  assert.equal(correcta.clave, "derecha");
  assert.equal(desviacionTras(correcta.clave), 0);
});

test("ninguna decisión equivocada acerca la aguja al centro", () => {
  for (const o of OPCIONES.filter((x) => !x.correcta)) {
    assert.ok(desviacionTras(o.clave) >= DESVIACION_INICIAL, o.clave);
  }
});

test("virar contra la aguja la lleva casi al tope, sin salirse de la escala", () => {
  const d = desviacionTras("izquierda");
  assert.ok(d > DESVIACION_INICIAL);
  assert.ok(d <= PUNTOS_POR_LADO);
});

test("el OBS no mueve al avión: la aguja no cambia", () => {
  assert.equal(desviacionTras("obs"), DESVIACION_INICIAL);
});

test("sin decisión la aguja está en su desviación inicial", () => {
  assert.equal(desviacionTras(null), DESVIACION_INICIAL);
});

// Ninguna explicación puede dejar a la persona sin saber qué hacer después.
test("cada opción trae título y explicación", () => {
  for (const o of OPCIONES) {
    assert.ok(o.titulo.length > 0 && o.explicacion.length > 40, o.clave);
  }
});
