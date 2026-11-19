import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ESCENAS } from "./escenas.ts";
import { flattenTemas } from "./moduleContent.ts";
import { pasosDeTema } from "../features/academia/lecturaScroll.ts";

test("cada tema de Fundamentos tiene un visual por paso", () => {
  for (const tema of flattenTemas("fundamentos")!) {
    assert.equal(ESCENAS[tema.id]?.length, pasosDeTema(tema).length, tema.id);
  }
});

test("cada tema de Aerodinámica tiene un clip por paso", () => {
  for (const tema of flattenTemas("aerodinamica")!) {
    const visuales = ESCENAS[tema.id] ?? [];
    assert.equal(visuales.length, pasosDeTema(tema).length, tema.id);
    assert.ok(visuales.every((v) => v.tipo === "clip"), tema.id);
  }
});

test("cada tema de Navegación II tiene un clip por paso", () => {
  for (const tema of flattenTemas("navegacion-2")!) {
    const visuales = ESCENAS[tema.id] ?? [];
    assert.equal(visuales.length, pasosDeTema(tema).length, tema.id);
    assert.ok(visuales.every((v) => v.tipo === "clip"), tema.id);
  }
});

test("cada tema de Meteorología tiene un clip por paso", () => {
  for (const tema of flattenTemas("meteorologia")!) {
    const visuales = ESCENAS[tema.id] ?? [];
    assert.equal(visuales.length, pasosDeTema(tema).length, tema.id);
    assert.ok(visuales.every((v) => v.tipo === "clip"), tema.id);
  }
});

test("cada tema de Navegación I tiene un clip por paso", () => {
  for (const tema of flattenTemas("navegacion")!) {
    const visuales = ESCENAS[tema.id] ?? [];
    assert.equal(visuales.length, pasosDeTema(tema).length, tema.id);
    assert.ok(visuales.every((v) => v.tipo === "clip"), tema.id);
  }
});

test("cada archivo de las escenas existe en public/", () => {
  for (const [id, visuales] of Object.entries(ESCENAS))
    for (const v of visuales) {
      const rutas = v.tipo === "foto" ? [v.src] : v.tipo === "clip" ? [v.mp4, v.webm, v.poster] : [v.poster];
      for (const r of rutas) assert.ok(existsSync(join("public", r)), `${id}: ${r}`);
    }
});

test("cada visual describe lo que enseña y sus marcas caen dentro de la imagen", () => {
  for (const visuales of Object.values(ESCENAS))
    for (const v of visuales) {
      assert.ok(v.alt.trim().length >= 10, v.alt);
      const puntos = "marcas" in v ? (v.marcas ?? []).flatMap((m) => (m.tipo === "flecha" ? [m.desde, m.hasta] : [m.en])) : [];
      for (const [x, y] of puntos) assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100, `${x},${y}`);
    }
});

test("el avión 3D solo aparece en superficies y ejes", () => {
  for (const [id, visuales] of Object.entries(ESCENAS))
    if (visuales.some((v) => v.tipo === "avion3d")) assert.ok(["fundamentos-tema5", "fundamentos-tema6"].includes(id), id);
});

test("los textos de las escenas no usan palabras prohibidas", () => {
  const todo = JSON.stringify(ESCENAS).toLowerCase();
  for (const p of ["certificado", "cfi", "licencia", "curso oficial", "afac", "con ia", "garmin"]) assert.ok(!todo.includes(p), p);
});
