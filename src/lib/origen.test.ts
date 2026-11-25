import { test } from "node:test";
import assert from "node:assert/strict";
import { recordarOrigen, refParaCuenta } from "./origen.ts";

const AHORA = Date.parse("2026-11-26T12:00:00Z");
const almacen = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
};

test("guarda el ref válido del enlace y no guarda basura", () => {
  const a = almacen();
  recordarOrigen("?ref=Reel-Viento", AHORA, a);
  assert.deepEqual(JSON.parse(a.getItem("va-origen")!), { ref: "reel-viento", t: AHORA });
  recordarOrigen("?ref=<script>", AHORA + 1, a);
  recordarOrigen("?code=abc", AHORA + 2, a);
  assert.equal(JSON.parse(a.getItem("va-origen")!).ref, "reel-viento");
});

test("cuenta nueva sin ref: toma el origen guardado", () => {
  const creada = new Date(AHORA - 5 * 60_000).toISOString();
  assert.equal(refParaCuenta({ ref: "reel-qnh", t: AHORA - 86_400_000 }, creada, undefined, AHORA), "reel-qnh");
});

test("no marca cuentas viejas, ya marcadas, ni orígenes vencidos", () => {
  const nueva = new Date(AHORA - 5 * 60_000).toISOString();
  const vieja = new Date(AHORA - 2 * 3_600_000).toISOString();
  const origen = { ref: "reel-vor", t: AHORA - 60_000 };
  assert.equal(refParaCuenta(origen, vieja, undefined, AHORA), null);
  assert.equal(refParaCuenta(origen, nueva, "reel-paso", AHORA), null);
  assert.equal(refParaCuenta({ ref: "reel-vor", t: AHORA - 31 * 86_400_000 }, nueva, undefined, AHORA), null);
  assert.equal(refParaCuenta(null, nueva, undefined, AHORA), null);
});
