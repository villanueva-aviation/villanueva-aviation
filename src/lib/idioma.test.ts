import { test } from "node:test";
import assert from "node:assert/strict";
import { esIngles, parDeIdioma, rutaEnOtroIdioma } from "./idioma.ts";

test("detecta las rutas en inglés sin confundir otras que empiezan con /en", () => {
  assert.equal(esIngles("/en"), true);
  assert.equal(esIngles("/en/coaching"), true);
  assert.equal(esIngles("/entrenador-esperas"), false);
  assert.equal(esIngles("/empieza"), false);
});

test("el selector lleva a la página equivalente o a la portada del otro idioma", () => {
  assert.equal(rutaEnOtroIdioma("/asesorias"), "/en/coaching");
  assert.equal(rutaEnOtroIdioma("/en/coaching"), "/asesorias");
  assert.equal(rutaEnOtroIdioma("/academia"), "/en");
  assert.equal(rutaEnOtroIdioma("/en/no-existe"), "/");
});

test("hreflang solo para páginas con par", () => {
  assert.deepEqual(parDeIdioma("/"), { es: "/", en: "/en" });
  assert.deepEqual(parDeIdioma("/en/legal"), { es: "/legal", en: "/en/legal" });
  assert.equal(parDeIdioma("/academia"), null);
});
