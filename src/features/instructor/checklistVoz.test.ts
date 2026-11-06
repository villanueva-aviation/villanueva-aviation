import { test } from "node:test";
import assert from "node:assert/strict";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";
import { ES_V15 } from "./revisionSim.ts";

const PUNTOS = CHECKLIST_VOZ_C172.flatMap((s) => s.puntos);

test("el C172 tiene 80 puntos en 11 secciones", () => {
  assert.equal(CHECKLIST_VOZ_C172.length, 11);
  assert.equal(PUNTOS.length, 80);
});

test("37 se revisan hoy, 15 con v1.5 y 28 solo por voz", () => {
  assert.equal(PUNTOS.filter((p) => p.revisa && !ES_V15.has(p.revisa)).length, 37);
  assert.equal(PUNTOS.filter((p) => p.revisa && ES_V15.has(p.revisa)).length, 15);
  assert.equal(PUNTOS.filter((p) => !p.revisa).length, 28);
});

test("los ids no se repiten", () => {
  assert.equal(new Set(PUNTOS.map((p) => p.id)).size, 80);
});

test("cada punto y cada seccion tiene claves sin acentos", () => {
  for (const c of [...CHECKLIST_VOZ_C172, ...PUNTOS]) {
    assert.ok(c.claves.length > 0, c.id);
    for (const k of c.claves) assert.match(k, /^[a-z0-9 ]+$/, `${c.id}: ${k}`);
  }
});
