import { test } from "node:test";
import assert from "node:assert/strict";
import { reindexarLecciones } from "./migrarProgreso.ts";
import { ACADEMIA_MODULOS } from "../../data/academia.ts";

test("mueve las lecciones que cambiaron de módulo", () => {
  const { completadas, cambio } = reindexarLecciones({
    navegacion: ["navegacion-tema1", "navegacion-tema14", "navegacion-tema26"],
  });
  assert.equal(cambio, true);
  assert.deepEqual(completadas["navegacion"], ["navegacion-tema1"]);
  assert.deepEqual(completadas["navegacion-2"], ["navegacion-tema14", "navegacion-tema26"]);
});

// Correr la migración dos veces no debe cambiar nada la segunda: si no, cada
// carga de la página escribiría en Supabase sin motivo.
test("es idempotente", () => {
  const primera = reindexarLecciones({ navegacion: ["navegacion-tema1", "navegacion-tema20"] });
  const segunda = reindexarLecciones(primera.completadas);
  assert.equal(segunda.cambio, false);
  assert.deepEqual(segunda.completadas, primera.completadas);
});

// interactividad-1 existe en todos los módulos: moverlo sería adivinar.
test("no toca los ids que no son únicos", () => {
  const { completadas, cambio } = reindexarLecciones({
    navegacion: ["interactividad-1", "practica-1", "evaluacion-1"],
  });
  assert.equal(cambio, false);
  assert.deepEqual(completadas["navegacion"], ["interactividad-1", "practica-1", "evaluacion-1"]);
});

test("no pierde ni duplica nada", () => {
  const entrada = {
    navegacion: ["navegacion-tema1", "navegacion-tema14", "interactividad-1"],
    meteorologia: ["meteorologia-tema1"],
  };
  const { completadas } = reindexarLecciones(entrada);
  const antes = Object.values(entrada).flat().sort();
  const despues = Object.values(completadas).flat().sort();
  assert.deepEqual(despues, antes);
});

test("el módulo vacío sobrevive a la migración", () => {
  const { completadas, cambio } = reindexarLecciones({ navegacion: [] });
  assert.equal(cambio, false);
  assert.deepEqual(completadas, { navegacion: [] });
});

// La migración solo funciona si los ids de lección son únicos en toda la
// Academia. Si algún día dejan de serlo, hay que enterarse aquí y no en
// producción, moviendo el progreso de alguien al módulo equivocado.
test("los ids de lección son únicos en toda la Academia", () => {
  const visto = new Map<string, string>();
  for (const modulo of ACADEMIA_MODULOS) {
    for (const actividad of modulo.actividades) {
      if (actividad.tipo !== "leccion") continue;
      const previo = visto.get(actividad.id);
      assert.equal(previo, undefined, `"${actividad.id}" está en ${previo} y en ${modulo.slug}`);
      visto.set(actividad.id, modulo.slug);
    }
  }
});
