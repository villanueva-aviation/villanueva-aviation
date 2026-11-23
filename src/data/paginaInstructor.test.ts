import { test } from "node:test";
import assert from "node:assert/strict";
import { botonInstructor, PAGINA_INSTRUCTOR, PROXIMAMENTE } from "./paginaInstructor.ts";

test("sin sesión: crea cuenta y vuelve al viraje", () => {
  assert.deepEqual(botonInstructor(false), {
    texto: "Crea tu cuenta y prueba el viraje escarpado gratis",
    to: "/ingresar?from=%2Finstructor%2Fviraje-escarpado",
  });
});

test("con sesión: directo a la maniobra", () => {
  assert.deepEqual(botonInstructor(true), { texto: "Prueba el viraje escarpado", to: "/instructor/viraje-escarpado" });
});

test("próximamente: 11 nombres VFR únicos sin el repaso, 5 IFR sin el checkride", () => {
  assert.equal(new Set(PROXIMAMENTE.vfr).size, PROXIMAMENTE.vfr.length);
  assert.equal(PROXIMAMENTE.vfr[0], "Familiarización");
  assert.ok(!PROXIMAMENTE.vfr.includes("Repaso general"));
  assert.equal(PROXIMAMENTE.vfr.length, 11); // 14 − 2 duplicadas − repaso
  assert.deepEqual(PROXIMAMENTE.ifr, ["Interceptación de radiales", "Rutas pasadas", "Arcos DME", "Patrones de espera", "Vuelo mezclado"]);
});

test("textos: beta presente y ninguna palabra prohibida", () => {
  const todo = JSON.stringify(PAGINA_INSTRUCTOR).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  assert.match(todo, /beta/);
  assert.doesNotMatch(todo, /certificad|cfi\b|licencia|certified|curso oficial|examen de la afac|con ia\b|garmin/);
});
