import { test } from "node:test";
import assert from "node:assert/strict";
import { descartar, encolar, escogerVoz, RITMO, siguiente, type Pieza } from "./colaVoz.ts";

const orden = (texto: string): Pieza => ({ tipo: "orden", texto });
const aviso = (clave: string, texto = "Ojo con tu altitud"): Pieza => ({ tipo: "aviso", texto, clave });

test("una orden no corta lo que se está diciendo", () => {
  const r = encolar([], orden("Nivele"));
  assert.equal(r.cortar, false);
  assert.deepEqual(r.cola, [orden("Nivele")]);
});

test("anulado corta y vacía la cola", () => {
  const anulado: Pieza = { tipo: "anulado", texto: "Intento anulado." };
  const r = encolar([orden("a"), orden("b")], anulado);
  assert.equal(r.cortar, true);
  assert.deepEqual(r.cola, [anulado]);
});

test("solo espera el aviso más nuevo", () => {
  const r = encolar(encolar([orden("a")], aviso("altitud-ambar--")).cola, aviso("velocidad-ambar-+", "Revisa tu velocidad"));
  assert.deepEqual(r.cola, [orden("a"), aviso("velocidad-ambar-+", "Revisa tu velocidad")]);
});

test("un aviso que ya no aplica se descarta al llegarle el turno", () => {
  const r = siguiente([aviso("altitud-ambar--"), orden("Nivele")], null);
  assert.deepEqual(r.pieza, orden("Nivele"));
  assert.deepEqual(r.cola, []);
});

test("un aviso vigente sí se dice", () => {
  assert.deepEqual(siguiente([aviso("altitud-ambar--")], "altitud-ambar--").pieza, aviso("altitud-ambar--"));
});

test("la orden de un paso nuevo reemplaza la del paso que no se alcanzó a decir", () => {
  const paso = (texto: string): Pieza => ({ tipo: "orden", texto, clave: "paso" });
  const r = encolar([orden("a"), paso("Despeje el área.")], paso("Área despejada."));
  assert.equal(r.cortar, false);
  assert.deepEqual(r.cola, [orden("a"), paso("Área despejada.")]);
});

test("descartar quita lo que falta de una clave sin tocar lo demás", () => {
  const brief = (texto: string): Pieza => ({ tipo: "orden", texto, clave: "briefing" });
  assert.deepEqual(descartar([brief("2"), orden("Nivele"), brief("3")], "briefing"), [orden("Nivele")]);
});

const VOCES = [
  { name: "Microsoft Sabina", lang: "es-MX" },
  { name: "Microsoft Dalia Online (Natural)", lang: "es-MX" },
];

test("escoge la Natural de es-MX", () => {
  assert.equal(escogerVoz(VOCES, "es", null)?.name, "Microsoft Dalia Online (Natural)");
});

test("respeta la voz elegida del idioma", () => {
  assert.equal(escogerVoz(VOCES, "es", "Microsoft Sabina")?.name, "Microsoft Sabina");
});

test("sin voz en inglés devuelve null", () => {
  assert.equal(escogerVoz(VOCES, "en", null), null);
  assert.equal(escogerVoz(VOCES, "en", "Microsoft Sabina"), null);
});

test("ritmos de la voz", () => {
  assert.deepEqual(RITMO, { lenta: 0.85, normal: 1, rapida: 1.15 });
});
