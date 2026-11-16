import { test } from "node:test";
import assert from "node:assert/strict";
import { continuarLectura, LECTOR_INICIAL, recibir } from "./lector.ts";
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

test("simulador congelado: en el aire con velocidad y la posición igual 5 s → cuenta como pausa", () => {
  const aire = (t: number, lat: number) => ({ ...base, t, lat, lon: -103.3, velocidad: 130, enTierra: false });
  let e = LECTOR_INICIAL;
  const pausas: boolean[] = [];
  for (let t = 1; t <= 12; t++) {
    const r = recibir(e, aire(t, t <= 3 ? 20 + t / 1000 : 20.003), [], t * 1000);
    e = r.estado;
    pausas.push(r.lote[0].pausa);
  }
  // Quieto desde t = 3: pausa a partir de t = 8.
  assert.deepEqual(pausas.map((p, i) => (p ? i + 1 : 0)).filter(Boolean), [8, 9, 10, 11, 12]);
  // Se mueve otra vez: deja de ser pausa.
  assert.equal(recibir(e, aire(13, 20.004), [], 13000).lote[0].pausa, false);
  // En tierra, parado, no es pausa.
  let g = LECTOR_INICIAL;
  let ultimo = false;
  for (let t = 1; t <= 12; t++) {
    const r = recibir(g, { ...base, t, lat: 20, lon: -103.3, velocidad: 0, enTierra: true }, [], t * 1000);
    g = r.estado;
    ultimo = r.lote[0].pausa;
  }
  assert.equal(ultimo, false);
});

test("al reanudar una lección, el tiempo sigue desde lo guardado aunque el lector se haya reiniciado (15/11: se perdió la ruta)", () => {
  // Guardada en t = 12816 a los 1,000 ms; la página se recargó y el lector nuevo va en 60 s, 30 s después.
  const e = continuarLectura(LECTOR_INICIAL, 12816, 1000);
  const r = recibir(e, m(60), [], 31000);
  casi(r.lote[0].t, 12846);
  casi(recibir(r.estado, m(61), [m(61)], 32000).lote[0].t, 12847);
  // Lector sin reiniciar (su reloj ya va adelante de lo guardado): no cambia nada.
  const vivo = recibir(LECTOR_INICIAL, m(12900), [], 0).estado;
  assert.equal(continuarLectura(vivo, 12816, 1000), vivo);
});
