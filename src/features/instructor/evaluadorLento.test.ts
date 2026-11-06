import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarLento, armarSoloLento, avanzarLento, desvioLento, TOLERANCIA_LENTO, type EvaluacionLento } from "./evaluadorLento.ts";
import { simularLento } from "./simular.ts";

/** Avanza la simulación hasta el segundo t (o el final). */
const hasta = (ms: Muestra[], t = Infinity): { ev: EvaluacionLento; m: Muestra } => {
  let ev = armarLento(ms[0]);
  let m = ms[0];
  for (const x of ms.slice(1)) {
    if (x.t > t) break;
    ev = avanzarLento(ev, x);
    m = x;
  }
  return { ev, m };
};

const base = simularLento()[0];
const obj = { altitud: 3500, rumbo: 90, velocidad: 55 };

test("vuelo lento limpio: pasa por todas las fases y aprueba", () => {
  const { ev } = hasta(simularLento());
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.aprobado, true);
  assert.equal(ev.resultado!.salio, true);
  assert.equal(ev.resultado!.primerLado, "izquierda");
  assert.deepEqual(Object.values(ev.resultado!.elementos), ["S", "S", "S", "S"]);
  assert.equal(ev.resultado!.calificacion, 100);
});

test("el objetivo se toma en la banda de velocidad, no antes", () => {
  const ms = simularLento();
  const { ev } = hasta(ms);
  const t0 = ev.resultado!.objetivo.t;
  assert.ok(ms.find((m) => m.t === t0)!.velocidad <= 65);
  assert.equal(ev.resultado!.objetivo.altitud, 3500);
});

test("velocidad +10/−0: 1 kt abajo del objetivo queda fuera, 9 arriba queda dentro", () => {
  assert.ok(desvioLento({ ...base, velocidad: 54 }, obj, "velocidad") < -TOLERANCIA_LENTO.velocidad);
  assert.ok(Math.abs(desvioLento({ ...base, velocidad: 64 }, obj, "velocidad")) <= TOLERANCIA_LENTO.velocidad);
});

test("lector viejo: no arma y pide actualizar", () => {
  const m = simularLento({ viejo: true })[0];
  assert.equal(m.perdida, undefined);
  assert.equal(armarLento(m).fase, "invalido");
  assert.match(armarLento(m).motivo!, /Descargas/);
  // Se arma una sola vez, para que el programa diga el motivo; ya anulado, no se vuelve a armar en cada muestra.
  assert.equal(armarSoloLento(null, m), true);
  assert.equal(armarSoloLento(armarLento(m), m), false);
  assert.equal(armarSoloLento(null, base), true);
});

test("un cuadro de aviso de pérdida basta para no pasar", () => {
  const r = hasta(simularLento({ perdidaEn: 30 })).ev.resultado!;
  assert.equal(r.aprobado, false);
  assert.equal(r.elementos["PA.VII.A.S4"], "NS");
  assert.equal(r.perdidas.length, 1);
});

test("abajo de 1,500 AGL: no empieza; si baja, S2 NS", () => {
  assert.equal(hasta(simularLento({ aglDesde: { t: 0, agl: 1200 } })).ev.fase, "armado");
  const r = hasta(simularLento({ aglDesde: { t: 50, agl: 1400 } })).ev.resultado!;
  assert.equal(r.bajo, true);
  assert.equal(r.elementos["PA.VII.A.S2"], "NS");
  assert.equal(r.aprobado, false);
});

test("el segundo viraje al mismo lado no cuenta", () => {
  assert.equal(hasta(simularLento({ segundoLado: "izquierda" })).ev.fase, "viraje2");
});

test("sin salida con potencia termina a los 30 s y no pasa", () => {
  const { ev } = hasta(simularLento({ sinSalida: true }));
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.salio, false);
  assert.equal(ev.resultado!.aprobado, false);
  assert.ok(ev.resultado!.avisos.includes("No saliste del vuelo lento con potencia."));
});

test("volar a 50 kt deja S3 NS", () => {
  assert.equal(hasta(simularLento({ velocidadKt: 50 })).ev.fase, "armado"); // pasa por la banda sin quedarse: nunca toma el objetivo
  const r = hasta(simularLento({ caidaKt: { desde: 30, segundos: 8, kt: 50 } })).ev.resultado!;
  assert.equal(r.elementos["PA.VII.A.S3"], "NS");
  assert.ok(r.peor.velocidad <= -5, String(r.peor.velocidad));
});

test("pausa a media maniobra anula", () => {
  const ms = simularLento().map((m) => (m.t >= 60 ? { ...m, pausa: true } : m));
  const { ev } = hasta(ms);
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo!, /Pausaste/);
});
