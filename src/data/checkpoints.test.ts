import test from "node:test";
import assert from "node:assert/strict";
import {
  MODULE_CHECKPOINTS,
  TEMAS_POR_CHECKPOINT,
  checkpointsDeModulo,
  flattenTemas,
} from "./moduleContent.ts";
import { TEMA_PUNTOS } from "./temaPuntos.ts";

test("cada id de checkpoint resuelve a una pregunta real del banco del módulo", () => {
  for (const [slug, ids] of Object.entries(MODULE_CHECKPOINTS)) {
    const resueltos = checkpointsDeModulo(slug);
    assert.equal(
      resueltos.length,
      ids.length,
      `${slug}: ${ids.length - resueltos.length} id(s) sin pregunta en el banco`,
    );
  }
});

test("ninguna comprobación cae más allá del último tema del módulo", () => {
  for (const slug of Object.keys(MODULE_CHECKPOINTS)) {
    const temas = flattenTemas(slug) ?? [];
    for (const c of checkpointsDeModulo(slug)) {
      assert.ok(
        c.despuesDeTema < temas.length,
        `${slug}: comprobación tras el tema ${c.despuesDeTema + 1}, pero solo hay ${temas.length}`,
      );
    }
  }
});

test("las comprobaciones van cada TEMAS_POR_CHECKPOINT temas, sin repetir pregunta", () => {
  for (const slug of Object.keys(MODULE_CHECKPOINTS)) {
    const cs = checkpointsDeModulo(slug);
    cs.forEach((c, i) => {
      assert.equal(c.despuesDeTema, (i + 1) * TEMAS_POR_CHECKPOINT - 1, `${slug}: posición ${i}`);
    });
    const ids = cs.map((c) => c.pregunta.id);
    assert.equal(new Set(ids).size, ids.length, `${slug}: pregunta repetida entre comprobaciones`);
  }
});

test("todo módulo con lecciones de texto tiene al menos una comprobación", () => {
  for (const slug of Object.keys(MODULE_CHECKPOINTS)) {
    const temas = flattenTemas(slug) ?? [];
    if (temas.length < TEMAS_POR_CHECKPOINT) continue;
    assert.ok(checkpointsDeModulo(slug).length > 0, `${slug}: sin comprobaciones`);
  }
});

test("cada clave de TEMA_PUNTOS corresponde a un tema real", () => {
  const ids = new Set(
    Object.keys(MODULE_CHECKPOINTS).flatMap((slug) => (flattenTemas(slug) ?? []).map((t) => t.id)),
  );
  for (const id of Object.keys(TEMA_PUNTOS)) {
    assert.ok(ids.has(id), `TEMA_PUNTOS["${id}"] no corresponde a ningún tema`);
  }
});

test("los puntos llegan al tema por flattenTemas", () => {
  for (const slug of Object.keys(MODULE_CHECKPOINTS)) {
    for (const t of flattenTemas(slug) ?? []) {
      if (!TEMA_PUNTOS[t.id]) continue;
      assert.ok(t.clave && t.puntos?.length, `${t.id}: los puntos no se fusionaron`);
    }
  }
});
