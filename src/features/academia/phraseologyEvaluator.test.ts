import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluarRespuesta } from "./phraseologyEvaluator.ts";

test("marca dicho:true cuando la palabra clave aparece en el transcript", () => {
  const elementos = [{ descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] }];
  const resultado = evaluarRespuesta("torre xb vla listo para despegar", elementos);
  assert.equal(resultado[0].dicho, true);
});

test("marca dicho:false cuando ninguna palabra clave aparece", () => {
  const elementos = [{ descripcion: "Pista", palabrasClave: ["pista 20", "pista veinte"] }];
  const resultado = evaluarRespuesta("torre xb vla listo para despegar", elementos);
  assert.equal(resultado[0].dicho, false);
});

test("ignora mayúsculas y acentos al comparar", () => {
  const elementos = [{ descripcion: "Posición", palabrasClave: ["posición"] }];
  const resultado = evaluarRespuesta("TORRE XB VLA POSICION DIEZ MILLAS", elementos);
  assert.equal(resultado[0].dicho, true);
});

test("transcript vacío marca todos los elementos como no dichos, sin lanzar error", () => {
  const elementos = [
    { descripcion: "Torre", palabrasClave: ["torre"] },
    { descripcion: "Identificación", palabrasClave: ["xb vla"] },
  ];
  const resultado = evaluarRespuesta("", elementos);
  assert.deepEqual(resultado.map((r) => r.dicho), [false, false]);
});
