import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { crearEstado, esperado, type ContextoAtc, type Elemento } from "./atcMmgl.ts";
import { calificar, crearHabla, distanciaAlPunto, hablar, muestrearHabla, zonaDicha, type EstadoHabla } from "./colacion.ts";

const el = (tipo: Elemento["tipo"], valor: string): Elemento => ({ tipo, valor });
const faltan = (esp: Elemento[], dicho: string) => calificar(esp, dicho).faltan.map((x) => x.tipo);
const ctx = (extra: Partial<ContextoAtc> = {}): ContextoAtc => ({
  matricula: "XB-VNA", zona: "Cajititlán", qnhInHg: 30.02, vientoDir: 270, vientoKt: 8, codigo: "4521",
  rutaSalida: ["P2", "P", "P1"], rutaRegreso: ["P1", "P", "P2"], puntoEspera: null, pista: null, ...extra,
});
const mu = (t: number, o: Partial<Muestra> = {}): Muestra => ({
  t, inclinacion: 0, altitud: 5000, velocidad: 0, rumbo: 0, bola: 0, agl: 0, peso: 2200, enTierra: true, slew: false, tasa: 1, pausa: false, titulo: "Skyhawk", ...o,
});

test("pista: número y lado, dichos de varias maneras", () => {
  const p = [el("pista", "29L")];
  for (const ok of ["pista dos nueve izquierda", "pista 2-9 izquierda", "pista 29 izquierda", "veintinueve izquierda", "pista 29L", "dos nueve left"])
    assert.deepEqual(faltan(p, ok), [], ok);
  for (const mal of ["pista dos nueve", "pista dos nueve derecha", "pista uno uno izquierda", "pista veintinueve"]) assert.deepEqual(faltan(p, mal), ["pista"], mal);
});

test("QNH: cuatro dígitos, sueltos o juntos, aunque haya otros números alrededor", () => {
  const q = [el("qnh", "3002")];
  for (const ok of ["qnh tres cero cero dos", "QNH 3-0-0-2", "qnh 3002", "pista dos nueve izquierda qnh tres cero cero dos"])
    assert.deepEqual(faltan(q, ok), [], ok);
  for (const mal of ["qnh tres cero cero tres", "qnh tres cero cero", "qnh dos nueve nueve dos"]) assert.deepEqual(faltan(q, mal), ["qnh"], mal);
});

test("código de transponder: cuatro dígitos", () => {
  const k = [el("codigo", "4521")];
  assert.deepEqual(faltan(k, "código cuatro cinco dos uno"), []);
  assert.deepEqual(faltan(k, "squawk 4-5-2-1"), []);
  assert.deepEqual(faltan(k, "código cuatro cinco dos"), ["codigo"]);
});

test("punto de espera: la calle final, en alfabeto o con la letra", () => {
  const p = [el("punto-espera", "P1")];
  for (const ok of ["vía papa dos papa papa uno", "punto de espera papa 1", "P1", "papa uno"]) assert.deepEqual(faltan(p, ok), [], ok);
  for (const mal of ["papa dos", "papa", "papa 12"]) assert.deepEqual(faltan(p, mal), ["punto-espera"], mal);
});

test("matrícula: completa o las últimas tres letras", () => {
  const m = [el("matricula", "XB-VNA")];
  for (const ok of ["x-ray bravo victor november alpha", "xray bravo victor november alfa", "victor november alpha", "torre victor november alfa pista"])
    assert.deepEqual(faltan(m, ok), [], ok);
  for (const mal of ["victor november", "bravo november alpha", "torre guadalajara", "victor alpha november"]) assert.deepEqual(faltan(m, mal), ["matricula"], mal);
});

test("punto VFR: las zonas valen una por otra; área de trabajo vale cualquiera; Pirámide solo Pirámide", () => {
  assert.deepEqual(faltan([el("punto-vfr", "Cajititlán")], "en Cajititlán 5 millas al sur"), []);
  assert.deepEqual(faltan([el("punto-vfr", "Cajititlán")], "en Chapala"), []);
  assert.deepEqual(faltan([el("punto-vfr", "Cajititlán")], "en Pirámide"), ["punto-vfr"]);
  assert.deepEqual(faltan([el("punto-vfr", "área de trabajo")], "establecido en el área de trabajo"), []);
  assert.deepEqual(faltan([el("punto-vfr", "área de trabajo")], "sobre Chapala"), []);
  assert.deepEqual(faltan([el("punto-vfr", "Pirámide")], "notifico Pirámide"), []);
  assert.deepEqual(faltan([el("punto-vfr", "Pirámide")], "notifico Cajititlán"), ["punto-vfr"]);
});

test("frecuencia: dicha con palabras, en cifras o con «punto»", () => {
  const f = [el("frecuencia", "134.1")];
  for (const ok of ["contacto rampa uno tres cuatro punto uno", "rampa 134.1", "uno tres cuatro uno", "ciento treinta y cuatro punto uno"]) assert.deepEqual(faltan(f, ok), [], ok);
  for (const mal of ["rampa uno tres cuatro punto cinco", "rampa uno uno ocho punto uno"]) assert.deepEqual(faltan(f, mal), ["frecuencia"], mal);
});

test("zonaDicha", () => {
  assert.equal(zonaDicha("vuelo local a Chapala"), "Chapala");
  assert.equal(zonaDicha("zona de Cajititlán"), "Cajititlán");
  assert.equal(zonaDicha("zona de trabajo"), null);
});

const COM = { atis: 127.9, terr: 121.9, rampa: 134.1, torre: 118.1 };
const MAT = "X-ray Bravo Victor November Alpha";
const di = (h: EstadoHabla, texto: string, com1: number | null, c = ctx(), t = 0) => hablar(h, texto, com1, c, t);
const textos = (d: { texto: string }[]) => d.map((x) => x.texto);

test("la frecuencia manda: en otra frecuencia nadie contesta y queda anotado", () => {
  const h = crearHabla({ ...crearEstado(), etapa: "terrestre-llamada" });
  const r = di(h, "Terrestre, victor november alpha, vuelo local a Chapala", COM.torre, ctx(), 7);
  assert.deepEqual(r.decir, []);
  assert.equal(r.habla.atc.etapa, "terrestre-llamada");
  assert.deepEqual(r.habla.atc.notas.map((n) => n.tipo), ["fuera-de-frecuencia"]);
  assert.equal(r.habla.atc.notas[0].t, 7);
});

test("botón apretado sin palabras no hace nada", () => {
  const h = crearHabla({ ...crearEstado(), etapa: "terrestre-llamada" });
  const r = di(h, "   ", COM.terr);
  assert.deepEqual(r.decir, []);
  assert.equal(r.habla.repeticiones, 0);
});

test("pide lo que falta una sola vez y después sigue", () => {
  const h = crearHabla({ ...crearEstado(), etapa: "regreso-colacion" });
  const a = di(h, "pista dos nueve izquierda, notifico Pirámide", COM.torre);
  assert.deepEqual(textos(a.decir), [`${MAT}, colacione QNH.`]);
  assert.equal(a.habla.atc.etapa, "regreso-colacion");
  // Lo ya dicho cuenta: solo falta el QNH
  const b = di(a.habla, "QNH tres cero cero dos", COM.torre);
  assert.equal(b.habla.atc.etapa, "piramide");
  assert.equal(b.habla.atc.registros.at(-1)!.completa, true);
  // Si vuelve a faltar, sigue y queda anotado
  const c2 = di(a.habla, "afirmativo", COM.torre);
  assert.equal(c2.habla.atc.etapa, "piramide");
  assert.deepEqual(c2.habla.atc.registros.at(-1), { etapa: "regreso-colacion", completa: false, faltaron: ["qnh"] });
  assert.deepEqual(c2.habla.atc.notas.map((n) => n.detalle), ["qnh"]);
});

test("pide varias cosas juntas; en las llamadas dice «indique»", () => {
  const colacion = di(crearHabla({ ...crearEstado(), etapa: "rampa-colacion" }), "papa uno", COM.rampa);
  assert.deepEqual(textos(colacion.decir), [`${MAT}, colacione pista y matrícula.`]);
  const llamada = di(crearHabla({ ...crearEstado(), etapa: "terrestre-llamada" }), "Terrestre, victor november alpha", COM.terr);
  assert.deepEqual(textos(llamada.decir), [`${MAT}, indique punto de reporte.`]);
});

test("si no entiende nada: «repita», y a la segunda sigue como si lo hubiera oído", () => {
  const h = crearHabla({ ...crearEstado(), etapa: "rampa-llamada" });
  const a = di(h, "eh buenas tardes", COM.rampa);
  assert.deepEqual(textos(a.decir), [`${MAT}, repita.`]);
  assert.equal(a.decir[0].quien, "rampa");
  assert.equal(a.habla.atc.etapa, "rampa-llamada");
  const b = di(a.habla, "mmm no se", COM.rampa);
  assert.equal(b.habla.atc.etapa, "rampa-colacion");
  assert.match(b.decir[0].texto, /ruede vía Papa 2, Papa, Papa 1/);
  assert.deepEqual(b.habla.atc.notas.map((n) => n.tipo), ["ininteligible"]);
  assert.equal(b.habla.repeticiones, 0);
});

test("en el rodaje, hablar en 118.1 pasa a Torre sin esperar a Rampa", () => {
  const h = crearHabla({ ...crearEstado(), etapa: "rodando" });
  const r = di(h, "Torre, victor november alpha, en punto de espera papa uno", COM.torre);
  assert.match(r.decir[0].texto, /autorizado a despegar, salida por el Sierra Eco/);
  assert.equal(r.habla.atc.etapa, "torre-despegue-colacion");
  // En 134.1 no hay nada que decirle a Rampa en rodando
  assert.deepEqual(di(h, "Rampa, victor november alpha", COM.rampa).decir, []);
});

test("sin COM1 (lector que no lo manda) no se puede comprobar y el ATC contesta", () => {
  const h = crearHabla({ ...crearEstado(), etapa: "rampa-llamada" });
  assert.equal(di(h, "Rampa, victor november alpha", null).habla.atc.etapa, "rampa-colacion");
});

test("distanciaAlPunto: lejos del punto que nombra el reporte", () => {
  const sobre = distanciaAlPunto("establecido en Cajititlán", "Cajititlán", { lat: 20.5218 - 5 / 60, lon: -103.3111 })!;
  assert.equal(sobre.punto, "Cajititlán");
  assert.ok(sobre.nm < 0.1);
  const lejos = distanciaAlPunto("en el área de trabajo", "Chapala", { lat: 20.5218 - 5 / 60, lon: -103.3111 })!;
  assert.equal(lejos.punto, "Chapala");
  assert.ok(lejos.nm > 9);
  assert.equal(distanciaAlPunto("hola", "Chapala", { lat: 20, lon: -103 }), null);
});

test("un reporte a más de 2 NM del punto queda anotado, sin corregir", () => {
  let h = crearHabla({ ...crearEstado(), etapa: "zona" });
  h = { ...h, atc: { ...h.atc, pos: { lat: 20.5218 - 9 / 60, lon: -103.3111 } } };
  const r = di(h, "Torre, victor november alpha, establecido en Cajititlán", COM.torre);
  assert.equal(r.habla.atc.etapa, "regreso-llamada");
  assert.deepEqual(r.habla.atc.notas.map((n) => n.tipo), ["reporte-lejos"]);
  assert.match(r.habla.atc.notas[0].detalle!, /Cajititlán: 4\.\d NM/);
});

test("vuelo completo por voz, con la zona que pidió el cadete", () => {
  let h = crearHabla(crearEstado());
  const c = ctx({ zona: "Cajititlán" });
  const dichos: string[] = [];
  const hablarYa = (texto: string, com1: number) => {
    const r = hablar(h, texto, com1, c, 0);
    h = r.habla;
    dichos.push(...textos(r.decir));
    return r;
  };
  h = muestrearHabla(h, mu(0, { com1: COM.terr }), c).habla;
  assert.equal(h.atc.etapa, "terrestre-llamada");
  const t1 = hablarYa("Guadalajara Terrestre, X-ray Bravo Victor November Alpha, Cessna 172 en plataforma de aviación general, con información Alpha, solicito vuelo VFR local a Chapala", COM.terr);
  assert.match(t1.decir[0].texto, /autorizado VFR local a Chapala, código 4-5-2-1/);
  hablarYa("código cuatro cinco dos uno, contacto Rampa uno tres cuatro punto uno, victor november alpha", COM.terr);
  hablarYa("Rampa, victor november alpha, en plataforma de aviación general, listo para rodar", COM.rampa);
  hablarYa("pista dos nueve izquierda, vía papa dos, papa, papa uno, victor november alpha", COM.rampa);
  assert.equal(h.atc.etapa, "rodando");
  hablarYa("Torre Guadalajara, victor november alpha, en punto de espera papa uno, listo para salida", COM.torre);
  hablarYa("pista dos nueve izquierda, autorizado a despegar, victor november alpha", COM.torre);
  hablarYa("Torre, victor november alpha, establecido en el área de trabajo", COM.torre);
  hablarYa("Torre Guadalajara, victor november alpha, nos encontramos en Chapala, 15 millas al sur sureste, solicitando datos de aproximación y aterrizaje", COM.torre);
  hablarYa("pista dos nueve izquierda, qnh tres cero cero dos, notifico Pirámide", COM.torre);
  hablarYa("victor november alpha, Pirámide", COM.torre);
  hablarYa("viento en cola izquierdo, victor november alpha", COM.torre);
  assert.equal(h.atc.etapa, "cola-reportada");
  assert.ok(dichos.some((x) => /vía Papa 2, Papa, Papa 1/.test(x)));
  assert.ok(dichos.some((x) => /QNH 3-0-0-2, proceda a Pirámide/.test(x)));
  assert.equal(h.atc.registros.every((r) => r.completa), true, JSON.stringify(h.atc.registros.filter((r) => !r.completa)));
  assert.equal(h.atc.notas.length, 0, JSON.stringify(h.atc.notas));
});

test("esperado y calificar se corresponden: la colación perfecta de cada etapa califica completa", () => {
  const c = ctx();
  const perfecta: Record<string, string> = {
    "terrestre-colacion": "cuatro cinco dos uno, rampa uno tres cuatro punto uno, victor november alpha",
    "rampa-colacion": "pista dos nueve izquierda, papa dos papa papa uno, victor november alpha",
    "torre-despegue-colacion": "pista dos nueve izquierda, victor november alpha",
    "regreso-colacion": "pista dos nueve izquierda, qnh tres cero cero dos, notifico Pirámide",
  };
  for (const [etapa, texto] of Object.entries(perfecta))
    assert.deepEqual(calificar(esperado(etapa as never, c), texto).faltan, [], etapa);
});
