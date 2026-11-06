import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Muestra, type Resultado } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { explicar, repetir, serie } from "./explicacion.ts";

const calificar = (muestras: Muestra[]): Resultado => muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0])).resultado!;
const caida = () => calificar(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } }));

test("la caida de 130 ft pide presion atras", () => {
  const mal = explicar(caida()).filter((l) => l.tipo === "mal");
  assert.ok(mal.some((l) => l.texto.includes("presión atrás") && l.texto.includes("130")), JSON.stringify(mal));
});

test("la sobreinclinacion pide detener el alabeo", () => {
  const r = calificar(simularManiobra({ sobreInclinacion: { lado: 1, grados: 52, segundos: 3.5 } }));
  assert.ok(explicar(r).some((l) => l.tipo === "mal" && l.texto.includes("Detén el alabeo")));
});

test("la maniobra perfecta solo tiene lineas bien", () => {
  const r = calificar(simularManiobra());
  const lineas = explicar(r);
  assert.ok(lineas.length > 0);
  assert.ok(lineas.every((l) => l.tipo === "bien"), JSON.stringify(lineas));
  assert.equal(repetir(r), null);
});

test("falla del lado izquierdo pide repetir ese viraje", () => {
  assert.equal(repetir(caida()), "Repite: viraje izquierdo");
});

test("la serie de altitud se reduce y conserva el extremo", () => {
  const r = caida();
  const s = serie(r.muestras, "altitud", r.lados[0].entrada.altitud, 300);
  assert.ok(s.length <= 300, `largo ${s.length}`);
  assert.equal(Math.round(Math.min(...s.map((p) => p.v))), -130);
});

test("en inglés: limpieza y repetir", () => {
  const r = calificar(simularManiobra({ limpieza: false }));
  assert.equal(explicar(r, "en")[0].texto, "You didn't do clearing turns before entering: look for traffic with a turn of at least 90°.");
  const dos = calificar(
    simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 }, sobreInclinacion: { lado: 1, grados: 52, segundos: 3.5 } }),
  );
  assert.equal(repetir(dos, "en"), "Repeat: both turns");
  assert.equal(repetir(caida(), "en"), "Repeat: left turn");
  for (const l of explicar(dos, "en")) assert.doesNotMatch(l.texto, /[áéíóúñ]/, l.texto);
});
