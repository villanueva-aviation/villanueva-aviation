import { test } from "node:test";
import assert from "node:assert/strict";
import { TEORIA_IFR } from "./teoriaIfr.ts";

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// Las reglas del sitio: nada que suene a escuela certificada, sin «con IA» y sin la marca de la aviónica.
const PROHIBIDAS = /instructor certificado|\bcfi\b|licencia|certificad[oa]|certified|curso oficial|examen de la afac|con ia\b|garmin/;

const temas = Object.values(TEORIA_IFR);
const textos = (idioma: "es" | "en") => temas.flatMap((t) => [t.titulo[idioma], ...t.secciones.flatMap((s) => [s.titulo[idioma], s.texto[idioma]])]);

test("la teoría de interceptación cubre las 6 secciones", () => {
  assert.equal(TEORIA_IFR.interceptacion.secciones.length, 6);
});

test("ningún texto usa palabras prohibidas", () => {
  for (const x of [...textos("es"), ...textos("en")]) assert.doesNotMatch(sinAcentos(x), PROHIBIDAS, x.slice(0, 80));
});

test("el inglés no lleva caracteres del español", () => {
  for (const x of textos("en")) assert.doesNotMatch(x, /[áéíóúñ¿¡]/i, x.slice(0, 80));
});

test("cada dibujo del HSI tiene la barra dentro de la escala", () => {
  for (const t of temas) for (const s of t.secciones) if (s.hsi) assert.ok(s.hsi.desviacion >= -10 && s.hsi.desviacion <= 10, s.titulo.es);
});
