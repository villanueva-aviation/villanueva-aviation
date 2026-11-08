import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import {
  adelantarATorre, alMuestrear, calleHablada, codigoTransponder, completarEtapa, crearEstado, enPista, esperado, frecuenciaCerca,
  frecuenciaDeEtapa, frecuenciaHablada, ininteligible, matriculaHablada, qnhDigitos, qnhHablado, textoAtis,
  type ContextoAtc, type EstadoAtc, type Etapa,
} from "./atcMmgl.ts";

const UMBRAL = { ident: "29L", rumboV: 290, lat: 20, lon: -103 };
const ctx = (extra: Partial<ContextoAtc> = {}): ContextoAtc => ({
  matricula: "XB-VNA", zona: "Cajititlán", qnhInHg: 30.02, vientoDir: 270, vientoKt: 8, codigo: "4521",
  rutaSalida: ["P2", "P", "P1"], rutaRegreso: ["P1", "P", "P2"], puntoEspera: { lat: 20.01, lon: -103.01 }, pista: UMBRAL, ...extra,
});
const mu = (t: number, o: Partial<Muestra> = {}): Muestra => ({
  t, inclinacion: 0, altitud: 5000, velocidad: 0, rumbo: 0, bola: 0, agl: 0, peso: 2200, enTierra: true, slew: false, tasa: 1, pausa: false, titulo: "Skyhawk", ...o,
});
/** Posición en el plano de la pista (s, l en NM) a lat/lon. */
const en = (s: number, l: number) => {
  const r = (290 * Math.PI) / 180;
  const x = s * Math.sin(r) - l * Math.cos(r);
  const y = s * Math.cos(r) + l * Math.sin(r);
  return { lat: 20 + y / 60, lon: -103 + x / 60 / Math.cos((20 * Math.PI) / 180) };
};
const textos = (d: { texto: string }[]) => d.map((x) => x.texto);

test("textos con el alfabeto fonético, QNH, calles y frecuencias", () => {
  assert.equal(matriculaHablada("XB-VNA"), "X-ray Bravo Victor November Alpha");
  assert.equal(qnhDigitos(30.02), "3002");
  assert.equal(qnhDigitos(29.92), "2992");
  assert.equal(qnhHablado(30.02), "QNH 3-0-0-2");
  assert.equal(calleHablada("P2"), "Papa 2");
  assert.equal(calleHablada("P"), "Papa");
  assert.equal(calleHablada("A12"), "Alpha 12");
  assert.equal(frecuenciaHablada(134.1), "uno tres cuatro punto uno");
  assert.equal(frecuenciaHablada(118.1), "uno uno ocho punto uno");
});

test("código de transponder octal que nunca es uno reservado", () => {
  assert.equal(codigoTransponder(() => 0.99), "7777");
  // 1,2,0,0 (1200) se rechaza y la siguiente tanda da 7777
  const valores = [0.13, 0.26, 0.0, 0.0, 0.99, 0.99, 0.99, 0.99];
  let k = 0;
  assert.equal(codigoTransponder(() => valores[k++]), "7777");
  for (let i = 0; i < 300; i++) {
    const c = codigoTransponder();
    assert.match(c, /^[0-7]{4}$/);
    assert.ok(!["1200", "7500", "7600", "7700"].includes(c));
  }
});

test("frecuencias: el COM1 manda; sin COM1 no se puede comprobar", () => {
  assert.equal(frecuenciaCerca(121.9, 121.9), true);
  assert.equal(frecuenciaCerca(118.1, 121.9), false);
  assert.equal(frecuenciaCerca(null, 121.9), true);
  assert.equal(frecuenciaDeEtapa("atis"), 127.9);
  assert.equal(frecuenciaDeEtapa("terrestre-colacion"), 121.9);
  assert.equal(frecuenciaDeEtapa("rodando"), 134.1);
  assert.equal(frecuenciaDeEtapa("viento-cola"), 118.1);
  assert.equal(frecuenciaDeEtapa("fin"), null);
});

test("elementos obligatorios por etapa", () => {
  const c = ctx();
  const tipos = (e: Etapa) => esperado(e, c).map((x) => x.tipo);
  assert.deepEqual(tipos("terrestre-llamada"), ["matricula", "punto-vfr"]);
  assert.deepEqual(tipos("terrestre-colacion"), ["codigo", "frecuencia", "matricula"]);
  assert.deepEqual(tipos("rampa-colacion"), ["pista", "punto-espera", "matricula"]);
  assert.deepEqual(tipos("regreso-colacion"), ["pista", "qnh", "punto-vfr"]);
  assert.deepEqual(esperado("regreso-colacion", c).find((x) => x.tipo === "qnh"), { tipo: "qnh", valor: "3002" });
  assert.deepEqual(esperado("terrestre-colacion", c).find((x) => x.tipo === "frecuencia"), { tipo: "frecuencia", valor: "134.1" });
  assert.deepEqual(tipos("atis"), []);
  assert.deepEqual(tipos("base"), []);
});

test("el ATIS dice pista, viento y QNH del simulador", () => {
  const t = textoAtis(ctx());
  assert.match(t, /2-9 izquierda/);
  assert.match(t, /viento 2-7-0 grados 8 nudos/);
  assert.match(t, /QNH 3-0-0-2/);
});

test("del ATIS a Terrestre cuando el COM1 llega a 121.9", () => {
  let s = alMuestrear(crearEstado(), mu(0, { com1: 127.9 }), ctx());
  assert.equal(s.estado.etapa, "atis");
  s = alMuestrear(s.estado, mu(1, { com1: 121.9 }), ctx());
  assert.equal(s.estado.etapa, "terrestre-llamada");
});

const llevar = (hasta: Etapa, c = ctx()): EstadoAtc => {
  let e = crearEstado();
  e = { ...e, etapa: "terrestre-llamada" };
  while (e.etapa !== hasta) {
    if (e.etapa === "rodando") e = { ...e, etapa: "torre-llamada" };
    else if (e.etapa === "cola-reportada") e = { ...e, etapa: "autorizado" };
    else if (["base", "final", "autorizado"].includes(e.etapa)) e = { ...e, etapa: "rampa-regreso-llamada" };
    else e = completarEtapa(e, c, [], 0).estado;
  }
  return e;
};

test("recorrido de salida: textos de Erik", () => {
  const c = ctx();
  let s = completarEtapa({ ...crearEstado(), etapa: "terrestre-llamada" }, c, [], 10);
  assert.match(s.decir[0].texto, /^X-ray Bravo Victor November Alpha, Guadalajara Terrestre, autorizado VFR local a Cajititlán, código 4-5-2-1, contacte Rampa uno tres cuatro punto uno\.$/);
  assert.equal(s.decir[0].quien, "terrestre");
  assert.equal(s.estado.etapa, "terrestre-colacion");
  assert.deepEqual(s.estado.ordenFrecuencia, { mhz: 134.1, t: 10, avisada: false });
  s = completarEtapa(s.estado, c, [], 12);
  assert.equal(s.estado.etapa, "rampa-llamada");
  s = completarEtapa(s.estado, c, [], 20);
  assert.deepEqual(textos(s.decir), ["X-ray Bravo Victor November Alpha, pista 2-9 izquierda, ruede vía Papa 2, Papa, Papa 1."]);
  assert.equal(s.decir[0].quien, "rampa");
  s = completarEtapa(s.estado, c, [], 25);
  assert.equal(s.estado.etapa, "rodando");
  s = completarEtapa(s.estado, c, [], 26); // en rodando no hay llamada esperada
  assert.deepEqual(s.decir, []);
  assert.equal(s.estado.etapa, "rodando");
});

test("sin datos de calles Rampa dice «ruede a punto de espera pista …»", () => {
  const s = completarEtapa({ ...crearEstado(), etapa: "rampa-llamada" }, ctx({ rutaSalida: null }), [], 0);
  assert.equal(s.decir[0].texto, "X-ray Bravo Victor November Alpha, ruede a punto de espera pista 2-9 izquierda.");
});

test("Rampa pasa a Torre cerca de P1, no al salir de la plataforma", () => {
  const c = ctx();
  const e = llevar("rodando", c);
  const lejos = alMuestrear(e, mu(100, { lat: 20.05, lon: -103.05, com1: 134.1 }), c);
  assert.equal(lejos.estado.etapa, "rodando");
  assert.deepEqual(lejos.decir, []);
  const cerca = alMuestrear(lejos.estado, mu(160, { lat: 20.0101, lon: -103.0101, com1: 134.1 }), c);
  assert.equal(cerca.estado.etapa, "torre-llamada");
  assert.deepEqual(textos(cerca.decir), ["X-ray Bravo Victor November Alpha, contacte Torre uno uno ocho punto uno."]);
  assert.equal(cerca.decir[0].quien, "rampa");
  assert.deepEqual(cerca.estado.ordenFrecuencia, { mhz: 118.1, t: 160, avisada: false });
});

test("sin posición de P1 no se adelanta solo, pero adelantarATorre lo permite", () => {
  const e = llevar("rodando");
  assert.equal(alMuestrear(e, mu(1, { lat: 20.01, lon: -103.01 }), ctx({ puntoEspera: null })).estado.etapa, "rodando");
  assert.equal(adelantarATorre(e).etapa, "torre-llamada");
  assert.equal(adelantarATorre({ ...e, etapa: "zona" }).etapa, "zona");
});

test("despegue y regreso: textos de Erik", () => {
  const c = ctx();
  let s = completarEtapa(llevar("torre-llamada", c), c, [], 0);
  assert.equal(s.decir[0].texto, "X-ray Bravo Victor November Alpha, pista 2-9 izquierda, viento 2-7-0 grados 8 nudos, autorizado a despegar, salida por el Sierra Eco, notifique establecido en el área de trabajo.");
  s = completarEtapa(s.estado, c, [], 1);
  assert.equal(s.estado.etapa, "zona");
  s = completarEtapa(s.estado, c, [], 2);
  assert.equal(s.estado.etapa, "regreso-llamada");
  s = completarEtapa(s.estado, c, [], 3);
  assert.equal(s.decir[0].texto, "X-ray Bravo Victor November Alpha, pista 2-9 izquierda, viento 2-7-0 grados 8 nudos, QNH 3-0-0-2, proceda a Pirámide, notifique Pirámide.");
  s = completarEtapa(s.estado, c, [], 4);
  s = completarEtapa(s.estado, c, [], 5);
  assert.equal(s.decir[0].texto, "X-ray Bravo Victor November Alpha, incorpórese a viento en cola izquierdo pista 2-9 izquierda, notifique viento en cola.");
  assert.equal(s.estado.etapa, "viento-cola");
  s = completarEtapa(s.estado, c, [], 6);
  assert.equal(s.estado.etapa, "cola-reportada");
});

test("geometría: s y l respecto a la cabecera 29L", () => {
  const p = enPista(en(-1, 0.8), UMBRAL);
  assert.ok(Math.abs(p.s + 1) < 0.01 && Math.abs(p.l - 0.8) < 0.01);
});

test("circuito izquierdo: base, final y autorizado a aterrizar", () => {
  const c = ctx();
  let e = llevar("cola-reportada", c);
  const paso = (t: number, s: number, l: number, o: Partial<Muestra> = {}) => {
    const r = alMuestrear(e, mu(t, { ...en(s, l), enTierra: false, velocidad: 80, com1: 118.1, ...o }), c);
    e = r.estado;
    return r;
  };
  // Saliendo de Pirámide (4 NM al sur): todavía no estuvo en viento en cola, no hay «vire a base»
  assert.deepEqual(paso(1, -1.4, 3.8).decir, []);
  assert.equal(e.etapa, "cola-reportada");
  // Viento en cola: a la izquierda, después de la cabecera (en el sentido del aterrizaje)
  assert.deepEqual(paso(2, 1.5, 1).decir, []);
  assert.deepEqual(paso(3, 0.1, 1).decir, []);
  assert.deepEqual(textos(paso(4, -0.6, 1).decir), ["X-ray Bravo Victor November Alpha, vire a base."]);
  assert.equal(e.etapa, "base");
  assert.deepEqual(paso(5, -0.8, 1.5).decir, []);
  assert.deepEqual(textos(paso(6, -1.5, 0.7).decir), ["X-ray Bravo Victor November Alpha, vire a final."]);
  assert.equal(e.etapa, "final");
  assert.deepEqual(textos(paso(7, -1.2, 0.2).decir), ["X-ray Bravo Victor November Alpha, autorizado a aterrizar pista 2-9 izquierda, viento 2-7-0 grados 8 nudos."]);
  assert.equal(e.etapa, "autorizado");
  // En el aire todavía: no sale de pista
  assert.deepEqual(paso(8, -0.1, 0).decir, []);
  // Toma: en tierra y ya despacio
  assert.deepEqual(paso(9, 0.5, 0, { enTierra: true, velocidad: 30, gs: 30 }).decir.map((d) => d.texto), ["X-ray Bravo Victor November Alpha, abandone pista vía Papa 1, contacte Rampa uno tres cuatro punto uno."]);
  assert.equal(e.etapa, "rampa-regreso-llamada");
});

test("directo a final alineado: Torre autoriza a aterrizar sin base", () => {
  const c = ctx();
  const r = alMuestrear(llevar("cola-reportada", c), mu(1, { ...en(-3, 0.1), enTierra: false, com1: 118.1 }), c);
  assert.equal(r.estado.etapa, "autorizado");
});

test("sin el umbral de la pista no hay circuito por geometría", () => {
  const c = ctx({ pista: null });
  const r = alMuestrear(llevar("cola-reportada", c), mu(1, { ...en(-3, 0.1), enTierra: false }), c);
  assert.equal(r.estado.etapa, "cola-reportada");
});

test("de regreso Torre pasa directo a Rampa y Rampa rueda a la plataforma", () => {
  const c = ctx();
  let s = completarEtapa(llevar("rampa-regreso-llamada", c), c, [], 0);
  assert.equal(s.decir[0].texto, "X-ray Bravo Victor November Alpha, ruede a plataforma de aviación general vía Papa 1, Papa, Papa 2.");
  s = completarEtapa(s.estado, c, [], 1);
  assert.equal(s.estado.etapa, "fin");
});

test("lo que falta queda anotado; ininteligible actúa como si lo hubiera oído", () => {
  const c = ctx();
  const e = llevar("rampa-colacion", c);
  const faltan = esperado("rampa-colacion", c).filter((x) => x.tipo === "pista");
  const s = completarEtapa(e, c, faltan, 50);
  assert.deepEqual(s.estado.registros.at(-1), { etapa: "rampa-colacion", completa: false, faltaron: ["pista"] });
  assert.deepEqual(s.estado.notas.at(-1), { etapa: "rampa-colacion", tipo: "faltante", detalle: "pista", t: 50 });
  const i = ininteligible(e, c, 60);
  assert.equal(i.estado.etapa, "rodando");
  assert.deepEqual(i.estado.notas.map((n) => n.tipo), ["ininteligible"]);
  assert.equal(i.estado.registros.at(-1)!.completa, false);
  assert.deepEqual(ininteligible({ ...e, etapa: "rodando" }, c, 1).decir, []);
});

test("a los 20 s sin cambiar de frecuencia el instructor avisa, una sola vez", () => {
  const c = ctx();
  const s0 = completarEtapa({ ...crearEstado(), etapa: "terrestre-llamada" }, c, [], 100);
  const a = alMuestrear(s0.estado, mu(110, { com1: 121.9 }), c);
  assert.deepEqual(a.decir, []);
  const b = alMuestrear(a.estado, mu(120, { com1: 121.9 }), c);
  assert.deepEqual(textos(b.decir), ["Revisa tu frecuencia: te pidieron cambiar a uno tres cuatro punto uno."]);
  assert.equal(b.decir[0].quien, "instructor");
  assert.equal(b.estado.notas.at(-1)!.tipo, "frecuencia-tarde");
  const d = alMuestrear(b.estado, mu(150, { com1: 121.9 }), c);
  assert.deepEqual(d.decir, []);
  // Si cambia a tiempo, no se avisa
  const ok = alMuestrear(a.estado, mu(115, { com1: 134.1 }), c);
  assert.equal(ok.estado.ordenFrecuencia, null);
  assert.deepEqual(alMuestrear(ok.estado, mu(200, { com1: 134.1 }), c).decir, []);
});
