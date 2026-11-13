import { test } from "node:test";
import assert from "node:assert/strict";
import { AEROPUERTO_PRUEBA, aCrudo, leerAeropuerto, pistaBajo, pistaProbable } from "./aeropuertoSim.ts";

const crudo = {
  icao: "MMGL", nombre: "Guadalajara", lat: 20.5218, lon: -103.3112, altM: 1528,
  pistas: [{ lat: 20.5218, lon: -103.3112, rumboV: 112, largoM: 4000, anchoM: 45, n1: 11, d1: 2, n2: 29, d2: 1 }],
  frecuencias: [{ tipo: 6, hz: 118100000, nombre: "TOWER" }],
};

test("leerAeropuerto convierte unidades e idents", () => {
  const a = leerAeropuerto(crudo)!;
  assert.ok(Math.abs(a.elevacionFt - 5013) <= 1, String(a.elevacionFt));
  assert.deepEqual(a.pistas[0].extremos.map((e) => e.ident), ["11R", "29L"]);
  assert.equal(a.pistas[0].extremos[1].rumboV, 292);
  assert.ok(Math.abs(a.pistas[0].largoFt - 13123) <= 1, String(a.pistas[0].largoFt));
  assert.deepEqual({ tipo: a.frecuencias[0].tipo, mhz: a.frecuencias[0].mhz }, { tipo: "torre", mhz: 118.1 });
});

test("leerAeropuerto rechaza basura", () => {
  assert.equal(leerAeropuerto(null), null);
  assert.equal(leerAeropuerto({}), null);
  assert.equal(leerAeropuerto("x"), null);
});

test("pistaBajo reconoce el extremo por el rumbo", () => {
  const a = leerAeropuerto(crudo)!;
  const centro = { lat: 20.5218, lon: -103.3112 };
  assert.equal(pistaBajo({ ...centro, rumboV: 112 }, a), "11R");
  assert.equal(pistaBajo({ ...centro, rumboV: 292 }, a), "29L");
  assert.equal(pistaBajo({ ...centro, rumboV: 200 }, a), null);
});

test("pistaBajo en el cruce de dos pistas", () => {
  const cruzada = { ...crudo.pistas[0], rumboV: 20, n1: 2, d1: 0, n2: 20, d2: 0 };
  const a = leerAeropuerto({ ...crudo, pistas: [cruzada, crudo.pistas[0]] })!;
  assert.equal(pistaBajo({ lat: 20.5218, lon: -103.3112, rumboV: 112 }, a), "11R");
  assert.equal(pistaBajo({ lat: 20.5218, lon: -103.3112, rumboV: 200 }, a), "20");
});

test("pistaBajo fuera de la pista", () => {
  const a = leerAeropuerto(crudo)!;
  // 300 m al norte-noreste del eje (perpendicular a 112° es 22°).
  const d = 300 / 1852 / 60;
  const lat = 20.5218 + d * Math.cos((22 * Math.PI) / 180);
  const lon = -103.3112 + (d * Math.sin((22 * Math.PI) / 180)) / Math.cos((20.5218 * Math.PI) / 180);
  assert.equal(pistaBajo({ lat, lon, rumboV: 112 }, a), null);
});

test("aCrudo es la inversa", () => {
  const a = leerAeropuerto(aCrudo(AEROPUERTO_PRUEBA))!;
  const idents = (x: typeof a) => x.pistas.map((p) => p.extremos.map((e) => e.ident));
  assert.deepEqual(idents(a), idents(AEROPUERTO_PRUEBA));
  assert.deepEqual(a.frecuencias, AEROPUERTO_PRUEBA.frecuencias);
  assert.ok(Math.abs(a.elevacionFt - AEROPUERTO_PRUEBA.elevacionFt) <= 1);
});

test("pistaProbable: el rumbo magnético del umbral más cercano al avión", () => {
  const [e11, e29] = AEROPUERTO_PRUEBA.pistas[0].extremos;
  // Parado junto al umbral de la 29, de lado (rumbo 200 magnético, 205 verdadero: declinación +5).
  const m = {
    t: 0, inclinacion: 0, altitud: 5016, velocidad: 0, rumbo: 200, rumboV: 205, bola: 0, agl: 0, peso: 2300, enTierra: true, slew: false, tasa: 1,
    pausa: false, titulo: "C172", lat: e29.lat + 0.001, lon: e29.lon,
  };
  assert.equal(pistaProbable(m, AEROPUERTO_PRUEBA), e29.rumboV - 5);
  assert.equal(pistaProbable({ ...m, lat: e11.lat - 0.001, lon: e11.lon }, AEROPUERTO_PRUEBA), e11.rumboV - 5);
  assert.equal(pistaProbable({ ...m, lat: undefined }, AEROPUERTO_PRUEBA), null);
});
