import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Muestra, type Resultado } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { folio, insigniaManiobraGanada, paraGuardar, puedeMandar, resumenProgreso, type IntentoManiobra } from "./reglasIntentos.ts";

const calificar = (muestras: Muestra[]): Resultado => muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0])).resultado!;

const intento = (r: Resultado, created_at: string, modo: "practica" | "checkride" = "practica"): IntentoManiobra => ({
  id: created_at, user_id: "u", maniobra: "viraje-escarpado", avion: "C172", modo,
  calificacion: r.calificacion, aprobado: r.aprobado, elementos: r.elementos, detalle: paraGuardar(r),
  revision: "sin_mandar", revisado_at: null, created_at,
});

test("solo se manda un checkride aprobado sin mandar", () => {
  assert.equal(puedeMandar({ modo: "checkride", aprobado: true, revision: "sin_mandar" }), true);
  assert.equal(puedeMandar({ modo: "practica", aprobado: true, revision: "sin_mandar" }), false);
  assert.equal(puedeMandar({ modo: "checkride", aprobado: false, revision: "sin_mandar" }), false);
  assert.equal(puedeMandar({ modo: "checkride", aprobado: true, revision: "mandado" }), false);
});

test("la insignia sale solo con un intento aprobado por el fundador", () => {
  const m = "viraje-escarpado";
  assert.equal(insigniaManiobraGanada([{ maniobra: m, revision: "mandado" }, { maniobra: m, revision: "no_aprobado" }], m), false);
  assert.equal(insigniaManiobraGanada([{ maniobra: "otra", revision: "aprobado" }], m), false);
  assert.equal(insigniaManiobraGanada([{ maniobra: m, revision: "aprobado" }], m), true);
});

test("folio del reporte", () => {
  assert.equal(folio("7f3k2611-aaaa-bbbb"), "VA-7F3K-2611");
});

test("resumen numera por fecha y encuentra la tolerancia mas fallada", () => {
  const caida = calificar(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } }));
  const caida2 = calificar(simularManiobra({ caidaAltitud: { lado: 1, ft: 160, segundos: 2, enGrados: 120 } }));
  const limpio = calificar(simularManiobra());
  const r = resumenProgreso([
    intento(limpio, "2026-11-05T12:00:00Z", "checkride"),
    intento(caida, "2026-11-05T10:00:00Z"),
    intento(caida2, "2026-11-05T11:00:00Z"),
  ]);
  assert.deepEqual(r.intentos.map((i) => i.n), [1, 2, 3]);
  assert.deepEqual(r.intentos.map((i) => i.calificacion), [caida.calificacion, caida2.calificacion, 100]);
  assert.equal(r.intentos[2].modo, "checkride");
  assert.equal(r.mejor, 100);
  assert.equal(r.masFallada, "altitud");
});

test("resumen vacio", () => {
  assert.deepEqual(resumenProgreso([]), { intentos: [], mejor: null, masFallada: null });
});

test("lo guardado cambia las muestras por series cortas por lado", () => {
  const r = calificar(simularManiobra());
  const g = paraGuardar(r);
  assert.equal("muestras" in g, false);
  assert.equal(g.series.length, 2);
  for (const lado of g.series) for (const campo of ["altitud", "velocidad", "inclinacion", "bola"] as const) {
    assert.ok(lado[campo].length > 0 && lado[campo].length <= 300);
  }
  assert.equal(g.calificacion, 100);
});
