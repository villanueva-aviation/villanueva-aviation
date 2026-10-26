import { test } from "node:test";
import assert from "node:assert/strict";
import { MISIONES, misionCompleta, misionInicial } from "./misiones.ts";
import { ACADEMIA_MODULOS } from "./academia.ts";

test("las misiones cubren cada lectura e interactivo del módulo exactamente una vez", () => {
  for (const [slug, misiones] of Object.entries(MISIONES)) {
    const modulo = ACADEMIA_MODULOS.find((m) => m.slug === slug);
    assert.ok(modulo, `no existe el módulo ${slug}`);
    const esperadas = modulo.actividades.filter((a) => a.tipo === "leccion" || a.tipo === "interactividad").map((a) => a.id);
    const usadas = misiones.flatMap((m) => [...m.temas, ...m.interactivos]);
    assert.deepEqual([...usadas].sort(), [...esperadas].sort(), `${slug}: faltan o sobran actividades`);
    for (const m of misiones) {
      for (const id of m.temas) assert.equal(modulo.actividades.find((a) => a.id === id)?.tipo, "leccion", `${m.id}: ${id}`);
      for (const id of m.interactivos) assert.equal(modulo.actividades.find((a) => a.id === id)?.tipo, "interactividad", `${m.id}: ${id}`);
    }
  }
});

test("cada misión tiene lectura, pasos en el simulador y preguntas válidas", () => {
  for (const misiones of Object.values(MISIONES)) {
    assert.equal(new Set(misiones.map((m) => m.id)).size, misiones.length, "ids de misión repetidos");
    for (const m of misiones) {
      assert.ok(m.temas.length > 0 && m.enSimulador.length > 0 && m.preguntas.length > 0, m.id);
      for (const p of m.preguntas) assert.ok(p.correcta >= 0 && p.correcta < p.opciones.length, p.id);
    }
  }
});

test("la misión inicial es la primera sin terminar", () => {
  const misiones = MISIONES.fundamentos;
  const hechas = new Set([...misiones[0].temas, ...misiones[0].interactivos, "fundamentos-tema2"]);
  const completada = (id: string) => hechas.has(id);
  assert.equal(misionCompleta(misiones[0], completada), true);
  assert.equal(misionCompleta(misiones[1], completada), false); // falta su interactivo
  assert.equal(misionInicial(misiones, completada), 1);
  assert.equal(misionInicial(misiones, () => false), 0);
  assert.equal(misionInicial(misiones, () => true), misiones.length - 1);
});
