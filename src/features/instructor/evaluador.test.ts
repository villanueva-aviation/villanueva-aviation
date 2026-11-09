import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, armarSolo, avanzar, avanzarLote, crearEvaluacion, lectorViejoChecklist, type Evaluacion, type Muestra } from "./evaluador.ts";
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

test("un Skyhawk sin '172' en el título sí cuenta como C172", () => {
  const [m] = simularManiobra();
  assert.equal(armarSolo(null, { ...m, titulo: "Cessna Skyhawk G1000 Villanueva Aviation 2026 XB-VNA" }), true);
});

test("un lote con muestras repetidas o viejas da lo mismo que una por una", () => {
  const muestras = simularManiobra();
  const unaPorUna = correr(muestras);
  let ev = armar(crearEvaluacion(), muestras[0]);
  // Lotes de 10 (un poll por segundo con la pestaña oculta), cada uno repitiendo las 3 últimas del anterior.
  for (let i = 0; i < muestras.length; i += 10) ev = avanzarLote(ev, muestras.slice(Math.max(0, i - 3), i + 10));
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.calificacion, unaPorUna.resultado!.calificacion);
  assert.equal(ev.resultado!.muestras.length, unaPorUna.resultado!.muestras.length);
});

test("se arma solo en el aire y nivelado, y no borra un resultado", () => {
  const [m] = simularManiobra();
  assert.equal(armarSolo(null, m), true);
  assert.equal(armarSolo(null, { ...m, enTierra: true }), false);
  assert.equal(armarSolo(null, { ...m, inclinacion: 20 }), false);
  assert.equal(armarSolo(null, { ...m, pausa: true }), false);
  assert.equal(armarSolo(null, { ...m, slew: true }), false);
  assert.equal(armarSolo(null, { ...m, tasa: 4 }), false);
  assert.equal(armarSolo(null, { ...m, titulo: "Cessna 152" }), false);
  // Después de una pausa se vuelve a armar solo; después de un resultado, no.
  assert.equal(armarSolo({ fase: "invalido", motivo: "Pausaste", interno: crearEvaluacion().interno }, m), true);
  assert.equal(armarSolo(correr(simularManiobra()), m), false);
  assert.equal(armarSolo(armar(crearEvaluacion(), m), m), false);
});

test("armado mucho rato no acumula muestras de más ni cambia la calificación", () => {
  const maniobra = simularManiobra();
  const [m] = maniobra;
  // 20 minutos subiendo y nivelado antes de la maniobra.
  const espera: Muestra[] = [];
  for (let i = 0; i < 12000; i++) espera.push({ ...m, t: i / 10, altitud: 1500 + i / 6 });
  const desfase = 1200;
  const todo = [...espera, ...maniobra.map((x) => ({ ...x, t: x.t + desfase }))];
  const armadoLargo = espera.reduce(avanzar, armar(crearEvaluacion(), espera[0]));
  assert.ok(armadoLargo.interno.historial.length < 1400, `historial ${armadoLargo.interno.historial.length}`);
  const ev = correr(todo);
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.calificacion, correr(maniobra).resultado!.calificacion);
});

test("aviso bajo 1500 AGL", () => {
  const r = correr(simularManiobra().map((m) => ({ ...m, agl: 1200 }))).resultado!;
  assert.equal(r.avisos.length, 1);
  assert.equal(r.aprobado, true);
});

test("viraje a 32° que nunca llega a 40° reprueba la inclinación", () => {
  const ev = correr(simularManiobra({ inclinacion: 32 }));
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.lados[0].ns.inclinacion, true);
  assert.equal(ev.resultado!.elementos["PA.V.A.S5"], "NS");
});

test("viraje corto: se descarta y guarda cuántos grados llevaba y el rumbo de entrada", () => {
  const ev = correr(simularManiobra({ angulo: 318, lados: ["izquierda"] }));
  assert.equal(ev.fase, "armado");
  const d = ev.interno.descartado!;
  assert.equal(d.motivo, "corto");
  assert.equal(Math.round(d.grados), 318);
  assert.ok(Math.abs(d.rumbo - 90) < 1.5, String(d.rumbo));
});

test("segundo viraje al mismo lado: se descarta con motivo lado", () => {
  const ev = correr(simularManiobra({ lados: ["izquierda", "izquierda"] }));
  assert.equal(ev.interno.descartado?.motivo, "lado");
});

const correrNivel = (muestras: Muestra[], nivel: 1 | 2 | 3): Evaluacion => muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0], nivel));

test("Fácil: un 360° de 318° sí cuenta y el resultado dice su nivel", () => {
  const ev = correrNivel(simularManiobra({ angulo: 318 }), 1);
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.nivel, 1);
  assert.equal(ev.resultado!.nivel, 1);
  assert.equal(correrNivel(simularManiobra({ angulo: 318 }), 3).fase, "armado");
});

test("Fácil: perder 150 ft por 6 s no reprueba; en Difícil sí", () => {
  const caida = { caidaAltitud: { lado: 0 as const, ft: 150, segundos: 6, enGrados: 90 } };
  assert.equal(correrNivel(simularManiobra(caida), 1).resultado!.elementos["PA.V.A.S5"], "S");
  assert.equal(correrNivel(simularManiobra(caida), 3).resultado!.elementos["PA.V.A.S5"], "NS");
  assert.equal(correr(simularManiobra(caida)).resultado!.nivel, 3);
});

test("lectorViejoChecklist distingue v1.4 de v1.5", () => {
  const base = simularManiobra()[0];
  assert.equal(lectorViejoChecklist({ ...base, lat: 1 }), true);
  assert.equal(lectorViejoChecklist({ ...base, lat: 1, avionica: false }), false);
});
