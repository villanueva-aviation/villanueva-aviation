import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CAMPOS,
  altitud,
  digitos,
  generarAutorizacion,
  readback,
  revisar,
  textoAutorizacion,
  vueloEnGrupos,
  type Autorizacion,
  type Campo,
  type Salida,
} from "./autorizaciones.ts";
import { SALIDAS_USA } from "../../data/autorizacionesUsa.ts";

const SALIDA: Salida = {
  icao: "KXXX",
  ciudad: "Prueba",
  sids: [
    { nombre: "ORCKA5", dicho: "Orcka five", subida: { tipo: "via" }, minutos: 10, frecuencias: ["124.3", "125.2"], transiciones: [{ fijo: "TRM", dicho: "Thermal" }] },
    { nombre: "LOOP7", dicho: "Loop seven", subida: { tipo: "mantener", pies: 5000 }, minutos: 3, frecuencias: ["126.8"], transiciones: [{ fijo: "GMN", dicho: "Gorman" }] },
  ],
};

const A: Autorizacion = {
  salida: SALIDA,
  indicativo: { codigo: "AMX412", dicho: "Aeromexico four twelve" },
  destino: { icao: "MMMX", dicho: "Mexico City" },
  sid: SALIDA.sids[0],
  transicion: SALIDA.sids[0].transiciones[0],
  esperar: 350,
  frecuencia: "124.3",
  squawk: "4521",
};

const copia = (c: Partial<Record<Campo, string>>) => ({ ...Object.fromEntries(CAMPOS.map((k) => [k, ""])), ...c }) as Record<Campo, string>;

test("números como en la radio", () => {
  assert.equal(digitos("124.3"), "one two four point three");
  assert.equal(digitos("1290"), "one two niner zero");
  assert.equal(vueloEnGrupos(412), "four twelve");
  assert.equal(vueloEnGrupos(1241), "twelve forty-one");
  assert.equal(vueloEnGrupos(350 + 1), "three fifty-one");
  assert.equal(altitud(5000), "five thousand");
  assert.equal(altitud(10000), "one zero thousand");
  assert.equal(altitud(4500), "four thousand five hundred");
});

test("el texto sigue el orden de la FAA", () => {
  assert.equal(
    textoAutorizacion(A),
    "Aeromexico four twelve, cleared to Mexico City airport via the Orcka five departure, Thermal transition, then as filed. " +
      "Climb via SID, expect flight level three five zero one zero minutes after departure. " +
      "Departure frequency one two four point three, squawk four five two one.",
  );
  assert.match(textoAutorizacion({ ...A, sid: SALIDA.sids[1], transicion: SALIDA.sids[1].transiciones[0], frecuencia: "126.8" }), /Maintain five thousand, expect flight level three five zero three minutes after departure\. Departure frequency one two six point eight/);
  assert.match(readback(A), /^Cleared to MMMX via the ORCKA5 departure, TRM transition.*squawk 4521, AMX412\.$/);
});

test("acepta las formas en que se anota en la libreta", () => {
  const bien = revisar(A, copia({ limite: "mmmx", sid: "Orcka Five", transicion: "trm", altitud: "CVS", esperar: "350", frecuencia: "124.30", squawk: "4521" }));
  assert.ok(CAMPOS.every((c) => bien[c]), JSON.stringify(bien));
  const otra = revisar(A, copia({ limite: "México City", sid: "orcka 5", altitud: "via sid", esperar: "FL350", frecuencia: "124,3" }));
  assert.ok(otra.limite && otra.sid && otra.altitud && otra.esperar && otra.frecuencia);
  assert.ok(revisar(A, copia({ esperar: "35000" })).esperar);
});

test("rechaza lo que está mal o vacío", () => {
  const mal = revisar(A, copia({ limite: "MMGL", sid: "ORCKA4", transicion: "GMN", altitud: "5000", esperar: "330", frecuencia: "124.35", squawk: "4512" }));
  assert.ok(CAMPOS.every((c) => !mal[c]), JSON.stringify(mal));
  const vacio = revisar(A, copia({}));
  assert.ok(CAMPOS.every((c) => !vacio[c]));
});

test("altitud con 'maintain': acepta 5000, 5,000 y 50", () => {
  const b = { ...A, sid: SALIDA.sids[1], transicion: SALIDA.sids[1].transiciones[0] };
  for (const v of ["5000", "5,000", "50", "5"]) assert.ok(revisar(b, copia({ altitud: v })).altitud, v);
  assert.ok(!revisar(b, copia({ altitud: "via sid" })).altitud);
});

test("el generador da squawks válidos e indicativos que se pueden decir", () => {
  for (let i = 0; i < 2000; i++) {
    const a = generarAutorizacion([SALIDA]);
    assert.match(a.squawk, /^[1-6][0-7]{3}$/);
    assert.notEqual(a.squawk, "1200");
    assert.ok(!/undefined|zero/.test(a.indicativo.dicho), a.indicativo.dicho);
    assert.ok(a.sid.transiciones.includes(a.transicion));
    assert.ok(a.sid.frecuencias.includes(a.frecuencia));
  }
});

test("acepta el SID y la transición como se oyen", () => {
  const r = revisar(A, copia({ sid: "orcka five", transicion: "Thermal" }));
  assert.ok(r.sid && r.transicion);
});

test("los datos de la FAA están completos y el número del SID coincide con como se dice", () => {
  for (const s of SALIDAS_USA)
    for (const sid of s.sids) {
      assert.ok(sid.frecuencias.length && sid.transiciones.length, sid.nombre);
      assert.ok(sid.frecuencias.every((f) => /^1[1-3]\d\.\d{1,3}$/.test(f)), sid.nombre);
      const n = Number(sid.nombre.at(-1));
      assert.ok(sid.dicho.endsWith(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][n]), sid.nombre);
    }
});
