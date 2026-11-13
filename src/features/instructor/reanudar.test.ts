import { test } from "node:test";
import assert from "node:assert/strict";
import { AEROPUERTO_PRUEBA as A } from "./aeropuertoSim.ts";
import { crearChecklist } from "./checklistVoz.ts";
import { AVIONES_VOZ } from "../../data/checklistVozAviones.ts";
import type { ResultadoComun } from "./maniobras.ts";
import { crearGrabador } from "./recorrido.ts";
import { alMuestrearRepaso, crearRepaso, ponerVor, type EstadoRepaso } from "./repaso.ts";
import { leerReanudable, paraReanudar, VIGENCIA_MS } from "./reanudar.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { elegirVor } from "./vorSim.ts";

const ms = simularVuelo().map((m) => ({ ...m, navMhz: 117.5, navObs: 0, navRadial: 0, navDesv: 0, navDesde: 2 as const, navDme: 3, navTieneDme: true, navSenal: true, gpsNav: false }));
const VOR = elegirVor({ ident: "GDL", region: "MM", lat: A.lat, lon: A.lon, mhz: 117.5, dme: true }, ms[0]);
const res = (n: number): ResultadoComun => ({ aprobado: true, calificacion: 90, elementos: {}, avisos: [], muestras: ms.slice(0, n) });

/** La lección hasta la muestra `hasta`, con un ejercicio ya calificado. */
function enVuelo(hasta: number): EstadoRepaso {
  let e = ponerVor(crearRepaso("practica", Array(3).fill("espera"), 2, "ifr"), VOR);
  for (const m of ms.slice(0, hasta)) e = alMuestrearRepaso(e, m, A, "es", () => 0).estado;
  return { ...e, hechas: e.hechas.map((h, i) => (i === 0 ? { ...h, resultado: res(500), intentoId: "x" } : h)) };
}

const guardar = (e: EstadoRepaso, en = 1000) =>
  paraReanudar({
    clave: "ifr-4", en, sesionId: "s1", modo: "practica", repaso: e, cl: crearChecklist(AVIONES_VOZ.c172.secciones), grabador: crearGrabador(true),
    resultados: [{ maniobra: "espera", resultado: res(500) }], espera: null, llegada: null, primeraUsada: true, rutaPrimera: null, tramos: undefined, primero: null, dichos: ["arranque"], respondidas: ["a"],
  });

test("reanudar: los tramos de las lecciones IFR 1 y 2 y el primero, ya dicho en tierra, vuelven igual", () => {
  const i = ms.findIndex((m) => !m.enTierra && m.agl > 1500);
  const tramos = [{ desde: true, tipo: "pasada" as const }, { desde: false, tipo: "pasada" as const, esperarNm: 3 }];
  const primero = { tipo: "pasada" as const, radial: 150, desde: true, curso: 150, referencia: 290 };
  const g = leerReanudable(JSON.stringify({ ...guardar(enVuelo(i)), tramos, primero, primeraUsada: false }), "ifr-4", 2000)!;
  assert.deepEqual(g.tramos, tramos);
  assert.deepEqual(g.primero, primero);
  assert.equal(g.primeraUsada, false);
});

test("reanudar: una lección guardada antes del vuelo encadenado se lee sin tramos ni primero", () => {
  const i = ms.findIndex((m) => !m.enTierra && m.agl > 1500);
  const { primeraUsada: _, tramos: __, primero: ___, ...resto } = guardar(enVuelo(i));
  const g = leerReanudable(JSON.stringify({ ...resto, esperaUsada: true }), "ifr-4", 2000)!;
  assert.ok(g);
  assert.equal(g.tramos, undefined);
  assert.equal(g.primero, null);
  assert.equal(g.primeraUsada, true, "la espera ya usada sigue usada");
});

test("reanudar: una lección en vuelo vuelve igual, sin las muestras de los resultados (solo la primera y la última)", () => {
  const i = ms.findIndex((m) => !m.enTierra && m.agl > 1500);
  const e = enVuelo(i);
  const g = leerReanudable(JSON.stringify(guardar(e)), "ifr-4", 2000)!;
  assert.ok(g);
  assert.equal(g.repaso.etapa, e.etapa);
  assert.equal(g.repaso.hechas[0].intentoId, "x");
  assert.equal(g.repaso.hechas[0].resultado!.muestras.length, 2);
  assert.equal(g.resultados[0].resultado.muestras.length, 2);
  assert.deepEqual(g.dichos, ["arranque"]);
});

test("reanudar: la muestra de antes de recargar no cuenta, así el hueco de la recarga no anula la lección", () => {
  const i = ms.findIndex((m) => !m.enTierra && m.agl > 1500);
  const g = leerReanudable(JSON.stringify(guardar(enVuelo(i))), "ifr-4", 2000)!;
  // 40 s después, en el aire: sin reanudar sería «Se perdió la conexión con el simulador».
  const despues = { ...ms[i + 40], t: ms[i].t + 40 };
  assert.equal(alMuestrearRepaso(enVuelo(i), despues, A, "es", () => 0).estado.etapa, "invalido", "sin reanudar, el hueco anula");
  const r = alMuestrearRepaso(g.repaso, despues, A, "es", () => 0);
  assert.notEqual(r.estado.etapa, "invalido", r.estado.motivo);
});

test("reanudar: otra lección, vencida, terminada o texto roto → nada", () => {
  const i = ms.findIndex((m) => !m.enTierra && m.agl > 1500);
  const texto = JSON.stringify(guardar(enVuelo(i)));
  assert.equal(leerReanudable(texto, "ifr-3", 2000), null);
  assert.equal(leerReanudable(texto, "ifr-4", 1000 + VIGENCIA_MS + 1), null);
  assert.equal(leerReanudable(JSON.stringify(guardar({ ...enVuelo(i), etapa: "terminado" })), "ifr-4", 2000), null);
  assert.equal(leerReanudable("{roto", "ifr-4", 2000), null);
  assert.equal(leerReanudable(null, "ifr-4", 2000), null);
});
