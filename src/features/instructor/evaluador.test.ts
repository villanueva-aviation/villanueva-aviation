import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Evaluacion, type Muestra } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";

const correr = (muestras: Muestra[]): Evaluacion => muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0]));

test("maniobra perfecta aprueba con 100", () => {
  const ev = correr(simularManiobra());
  assert.equal(ev.fase, "terminado");
  const r = ev.resultado!;
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
  assert.ok(Object.values(r.elementos).every((e) => e === "S"));
  assert.deepEqual(r.lados.map((l) => l.lado), ["izquierda", "derecha"]);
});

test("caida de 130 ft por 6 s reprueba S5", () => {
  const r = correr(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } })).resultado!;
  assert.equal(r.elementos["PA.V.A.S5"], "NS");
  assert.equal(r.lados[0].ns.altitud, true);
  assert.equal(r.lados[0].fuera.altitud.length, 1);
  assert.equal(Math.round(r.lados[0].peor.altitud), -130);
  assert.equal(r.aprobado, false);
});

test("exceso breve no reprueba", () => {
  const r = correr(simularManiobra({ caidaAltitud: { lado: 0, ft: 120, segundos: 1, enGrados: 90 } })).resultado!;
  assert.equal(r.elementos["PA.V.A.S5"], "S");
  assert.ok(r.calificacion < 100);
});

test("exceso mayor a 1.5 veces reprueba aunque sea breve", () => {
  const r = correr(simularManiobra({ caidaAltitud: { lado: 0, ft: 160, segundos: 0.2, enGrados: 90 } })).resultado!;
  assert.equal(r.elementos["PA.V.A.S5"], "NS");
});

test("sin limpieza reprueba S1", () => {
  const r = correr(simularManiobra({ limpieza: false })).resultado!;
  assert.equal(r.elementos["PA.V.A.S1"], "NS");
  assert.equal(r.aprobado, false);
});

test("entrada sobre Va reprueba S2", () => {
  const r = correr(simularManiobra({ velocidadEntrada: 110 })).resultado!;
  assert.equal(r.elementos["PA.V.A.S2"], "NS");
});

test("dos virajes al mismo lado no completan S4", () => {
  const ev = correr(simularManiobra({ lados: ["izquierda", "izquierda"] }));
  assert.equal(ev.fase, "entre");
  assert.equal(ev.resultado, undefined);
});

test("sobreinclinacion 52 por 3.5 s reprueba", () => {
  const r = correr(simularManiobra({ sobreInclinacion: { lado: 1, grados: 52, segundos: 3.5 } })).resultado!;
  assert.equal(r.lados[1].ns.inclinacion, true);
  assert.equal(r.elementos["PA.V.A.S5"], "NS");
});

test("rumbo cruza 360 sin romper el conteo", () => {
  const ev = correr(simularManiobra({ rumboInicial: 350 }));
  assert.equal(ev.fase, "terminado");
  for (const lado of ev.resultado!.lados) assert.ok(Math.abs(lado.rumboSalida) < 1, `rumboSalida ${lado.rumboSalida}`);
});

test("hueco de muestras invalida", () => {
  const muestras = simularManiobra();
  const entrada = muestras.findIndex((m) => Math.abs(m.inclinacion) > 30);
  const t0 = muestras[entrada + 50].t;
  const ev = correr(muestras.filter((m) => m.t <= t0 || m.t > t0 + 3));
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo!, /conexión/);
});

test("slew invalida", () => {
  const muestras = simularManiobra();
  const i = muestras.findIndex((m) => Math.abs(m.inclinacion) > 30) + 20;
  muestras[i] = { ...muestras[i], slew: true };
  const ev = correr(muestras);
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo!, /slew/i);
});

test("entrada abortada regresa a armado", () => {
  const base: Muestra = {
    t: 0, inclinacion: 0, altitud: 3500, velocidad: 95, rumbo: 90, bola: 0, agl: 2500, peso: 2550,
    enTierra: false, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
  };
  const muestras: Muestra[] = [];
  for (let i = 0; i < 100; i++) muestras.push({ ...base, t: i / 10 });
  for (let i = 0; i < 20; i++) muestras.push({ ...base, t: 10 + i / 10, inclinacion: 35, rumbo: 90 + i });
  for (let i = 0; i < 50; i++) muestras.push({ ...base, t: 12 + i / 10, rumbo: 110 });
  const ev = correr(muestras);
  assert.equal(ev.fase, "armado");
  assert.equal(ev.resultado, undefined);
});

test("no se arma en tierra", () => {
  const [m] = simularManiobra();
  const ev = armar(crearEvaluacion(), { ...m, enTierra: true });
  assert.equal(ev.fase, "invalido");
  assert.match(ev.motivo!, /Despega/);
});

test("otro avion invalida", () => {
  const ev = correr(simularManiobra().map((m) => ({ ...m, titulo: "Cessna 152" })));
  assert.equal(ev.fase, "invalido");
});

test("aviso bajo 1500 AGL", () => {
  const r = correr(simularManiobra().map((m) => ({ ...m, agl: 1200 }))).resultado!;
  assert.equal(r.avisos.length, 1);
  assert.equal(r.aprobado, true);
});
