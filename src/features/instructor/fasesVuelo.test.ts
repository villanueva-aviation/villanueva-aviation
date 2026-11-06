import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { AEROPUERTO_PRUEBA, type Aeropuerto } from "./aeropuertoSim.ts";
import { armarVuelo, avanzarVuelo, type EvaluacionVuelo, type FaseVuelo } from "./fasesVuelo.ts";
import { simularVuelo } from "./simularVuelo.ts";

/** Pasa las muestras por el evaluador; `aero(i)` es el aeropuerto que manda el lector en la muestra i. */
const hasta = (ms: Muestra[], aero: (i: number) => Aeropuerto | null = () => AEROPUERTO_PRUEBA) => {
  let ev: EvaluacionVuelo = armarVuelo(ms[0], aero(0));
  const fases: FaseVuelo[] = [ev.fase];
  for (let i = 1; i < ms.length; i++) {
    ev = avanzarVuelo(ev, ms[i], aero(i));
    if (ev.fase !== fases[fases.length - 1]) fases.push(ev.fase);
  }
  return { ev, fases };
};
const de = (ev: EvaluacionVuelo, tipo: string) => ev.eventos.filter((e) => e.tipo === tipo);

test("vuelo completo: fases en orden y pistas", () => {
  const ms = simularVuelo();
  assert.ok(ms[ms.length - 1].t - ms[0].t < 15 * 60, "dura menos de 15 min");
  const { ev, fases } = hasta(ms);
  assert.deepEqual(fases, ["rampa", "rodaje", "carrera-despegue", "vuelo", "carrera-aterrizaje", "rodaje-regreso", "terminado"]);
  assert.equal(de(ev, "despegue")[0].pista, "11R");
  assert.equal(de(ev, "aterrizaje")[0].pista, "11R");
  assert.equal(de(ev, "motor-encendido").length, 1);
  assert.equal(de(ev, "motor-apagado").length, 1);
  assert.ok(ev.maxDistNm >= 5, String(ev.maxDistNm));
});

test("un rebote de 0.5 s no es aterrizaje", () => {
  const { ev } = hasta(simularVuelo({ rebote: true }));
  assert.equal(de(ev, "aterrizaje").length, 1);
  assert.equal(de(ev, "toque-y-despegue").length, 0);
  assert.equal(ev.fase, "terminado");
});

test("cruzar una pista a 10 kt sigue siendo rodaje", () => {
  const { ev, fases } = hasta(simularVuelo({ cruzarPista: true }));
  assert.equal(fases.filter((f) => f === "carrera-despegue").length, 1);
  assert.equal(de(ev, "despegue")[0].pista, "11R");
});

test("el aeropuerto del vuelo es el de salida", () => {
  const ms = simularVuelo();
  const otro: Aeropuerto = { ...AEROPUERTO_PRUEBA, icao: "MMZZ" };
  const { ev } = hasta(ms, (i) => (i < ms.length / 2 ? AEROPUERTO_PRUEBA : otro));
  assert.equal(ev.aeropuerto?.icao, "MMGL");
});

// MMMX, a ~250 NM: lo que mandaría un lector que no ha refrescado desde el vuelo anterior.
const LEJOS: Aeropuerto = { ...AEROPUERTO_PRUEBA, icao: "MMMX", lat: 19.4361, lon: -99.0719 };

test("un aeropuerto viejo en rampa se cambia por el de salida", () => {
  const ms = simularVuelo();
  const { ev } = hasta(ms, (i) => (ms[i].t < 15 ? LEJOS : AEROPUERTO_PRUEBA));
  assert.equal(ev.aeropuerto?.icao, "MMGL");
  assert.equal(de(ev, "despegue")[0].pista, "11R");
});

test("el aeropuerto que llega tarde se toma antes del despegue", () => {
  const ms = simularVuelo();
  const { ev } = hasta(ms, (i) => (ms[i].t < 40 ? null : AEROPUERTO_PRUEBA));
  assert.equal(ev.aeropuerto?.icao, "MMGL");
  assert.equal(de(ev, "despegue")[0].pista, "11R");
});

test("un aeropuerto lejano no se toma", () => {
  const { ev } = hasta(simularVuelo(), () => LEJOS);
  assert.equal(ev.aeropuerto, null);
  assert.equal(ev.fase, "terminado");
});

test("despegar con menos de 30 kt sobre el suelo (viento de frente) sí es despegue", () => {
  const ms = simularVuelo().map((m) => ({ ...m, gs: Math.min(m.gs ?? 0, 28) }));
  const { ev, fases } = hasta(ms);
  assert.ok(fases.includes("vuelo"), fases.join(","));
  assert.equal(de(ev, "despegue")[0].pista, "11R");
  assert.equal(ev.fase, "terminado");
});

test("un hueco anota sin conexión y sigue", () => {
  const { ev } = hasta(simularVuelo({ hueco: { en: 200, seg: 5 } }));
  const h = de(ev, "sin-conexion");
  assert.equal(h.length, 1);
  assert.ok(Math.abs((h[0].seg ?? 0) - 5) < 0.2, String(h[0].seg));
  assert.equal(ev.fase, "terminado");
});

test("sin aeropuerto las fases avanzan", () => {
  const { ev } = hasta(simularVuelo(), () => null);
  assert.equal(ev.fase, "terminado");
  assert.equal(de(ev, "despegue")[0].pista, null);
});

test("toque y despegue", () => {
  const { ev } = hasta(simularVuelo({ tocarYDespegar: true }));
  const tipos = ev.eventos.map((e) => e.tipo).filter((t) => t === "aterrizaje" || t === "toque-y-despegue");
  assert.deepEqual(tipos, ["aterrizaje", "toque-y-despegue", "aterrizaje"]);
  assert.equal(ev.fase, "terminado");
});

test("anula con slew, no con pausa", () => {
  const ms = simularVuelo();
  const i = ms.findIndex((m) => !m.enTierra) + 100;
  const { ev } = hasta(ms.slice(0, i));
  assert.equal(ev.fase, "vuelo");
  const pausa = avanzarVuelo(ev, { ...ms[i], pausa: true }, AEROPUERTO_PRUEBA);
  assert.equal(pausa.fase, "vuelo");
  const slew = avanzarVuelo(ev, { ...ms[i], slew: true }, AEROPUERTO_PRUEBA);
  assert.equal(slew.fase, "invalido");
  assert.match(slew.motivo ?? "", /slew/);
});

test("no arma en el aire, con lector viejo, ni en otro avión", () => {
  const m = simularVuelo()[0];
  assert.equal(armarVuelo({ ...m, lat: undefined }, null).motivo, "Tu lector es de una versión anterior: baja el nuevo de Descargas para las lecciones.");
  assert.equal(armarVuelo({ ...m, titulo: "Piper Cub" }, null).motivo, "En esta versión las lecciones son en el C172 y tu avión es «Piper Cub».");
  assert.equal(armarVuelo({ ...m, enTierra: false }, null).motivo, "Empieza en tierra, detenido en la plataforma.");
  assert.equal(armarVuelo({ ...m, gs: 5 }, null).motivo, "Empieza en tierra, detenido en la plataforma.");
  assert.equal(armarVuelo(m, null).fase, "rampa");
});

test("apagar el motor sobre la pista no termina", () => {
  const ms = simularVuelo();
  const i = ms.findIndex((m, j) => j > 0 && m.enTierra && !ms[j - 1].enTierra) + 40; // ya frenando sobre la 11R
  const { ev } = hasta(ms.slice(0, i));
  const sobre11 = { ...ms[i], t: ms[i].t + 0.1, gs: 0, velocidad: 0, motor: false, rpm: 0 };
  let e = avanzarVuelo(ev, sobre11, AEROPUERTO_PRUEBA);
  e = avanzarVuelo(e, { ...sobre11, t: sobre11.t + 5 }, AEROPUERTO_PRUEBA);
  assert.equal(e.fase, "rodaje-regreso");
});
