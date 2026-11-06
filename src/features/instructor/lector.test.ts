import { test } from "node:test";
import assert from "node:assert/strict";
import { LECTOR_INICIAL, recibir } from "./lector.ts";
import { simularManiobra } from "./simular.ts";

const [base] = simularManiobra();
const m = (t: number) => ({ ...base, t });
const casi = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("toma solo las muestras nuevas y recuerda la última", () => {
  const a = recibir(LECTOR_INICIAL, m(10), [], 0);
  assert.deepEqual(a.lote.map((x) => x.t), [10]);
  const b = recibir(a.estado, m(10.3), [m(9.9), m(10), m(10.1), m(10.3)], 300);
  assert.deepEqual(b.lote.map((x) => x.t), [10.1, 10.3]);
  assert.equal(b.estado.desde, 10.3);
});

test("si el lector se reinicia (su reloj vuelve a cero) no se congela y el tiempo sigue avanzando", () => {
  const antes = recibir(LECTOR_INICIAL, m(140), [], 0).estado;
  // 5 s después responde el lector nuevo, con su reloj en 1.2 s.
  const r = recibir(antes, m(1.2), [], 5000);
  assert.equal(r.lote.length, 1);
  casi(r.lote[0].t, 145);
  assert.equal(r.estado.desde, 1.2, "al lector se le pide con su propio reloj");
  const s = recibir(r.estado, m(1.3), [m(1.3)], 5100);
  casi(s.lote[0].t, 145.1);
});
