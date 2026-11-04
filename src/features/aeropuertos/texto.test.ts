import assert from "node:assert/strict";
import { test } from "node:test";
import { nb } from "./texto.ts";

const N = " ";

test("une miles y unidades", () => {
  assert.equal(nb("ascienda y mantenga 12 000 pies"), `ascienda y mantenga 12${N}000${N}pies`);
  assert.equal(nb("3.9 % hasta 10 000 ft, máximo 210 kt"), `3.9${N}% hasta 10${N}000${N}ft, máximo 210${N}kt`);
  assert.equal(nb("Ocotlán, ~31 NM"), `Ocotlán, ~31${N}NM`);
});

test("no toca lo que no es cifra con unidad", () => {
  for (const s of ["radial 108 de GDL hasta 8 DME", "viento 110 grados 8 nudos", "pista 05R, frecuencia 120.8 y 4521"]) assert.equal(nb(s), s);
});
