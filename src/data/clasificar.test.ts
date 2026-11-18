import { test } from "node:test";
import assert from "node:assert/strict";
import { CLASIFICAR } from "./clasificar.ts";
import { MISIONES } from "./misiones.ts";
import { HOTSPOT_SETS } from "../features/academia/hotspots.ts";

test("cada ejercicio de clasificar tiene al menos 2 columnas, 2 tarjetas por columna y tarjetas únicas", () => {
  for (const [id, c] of Object.entries(CLASIFICAR)) {
    assert.ok(c.columnas.length >= 2, id);
    c.columnas.forEach((_, k) => assert.ok(c.tarjetas.filter((t) => t.columna === k).length >= 2, `${id} columna ${k}`));
    for (const t of c.tarjetas) assert.ok(t.columna >= 0 && t.columna < c.columnas.length, `${id}: ${t.texto}`);
    assert.equal(new Set(c.tarjetas.map((t) => t.texto)).size, c.tarjetas.length, id);
  }
});

test("las tarjetas no vienen agrupadas por columna (dos seguidas de la misma columna, como mucho)", () => {
  for (const [id, c] of Object.entries(CLASIFICAR)) {
    c.tarjetas.forEach((t, i) => {
      if (i >= 2) assert.ok(!(t.columna === c.tarjetas[i - 1].columna && t.columna === c.tarjetas[i - 2].columna), `${id} #${i}`);
    });
  }
});

test("las misiones solo apuntan a ejercicios y diagramas que existen", () => {
  for (const [slug, misiones] of Object.entries(MISIONES)) {
    for (const m of misiones) {
      if (m.clasificar) assert.ok(CLASIFICAR[m.clasificar], `${slug}/${m.id}: ${m.clasificar}`);
      if (m.puntos) assert.ok(HOTSPOT_SETS[m.puntos], `${slug}/${m.id}: ${m.puntos}`);
    }
  }
});
