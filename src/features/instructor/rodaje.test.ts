import { test } from "node:test";
import assert from "node:assert/strict";
import { puntoMasCercano, rutaRodaje, type DatosCalles } from "./rodaje.ts";

// Grafo sintético (NO son datos reales de MMGL): puntos 0-1-2-3 en línea (calles P2, P, P1), punto 4 aislado y el estacionamiento 0 pegado al punto 0.
// 0.01° de lon ≈ 0.56 NM a esta latitud.
const lon = (x: number) => -103 + x;
const P = (x: number, y = 0) => ({ lat: 20 + y, lon: lon(x) });
const datos = (extra: Partial<DatosCalles> = {}): DatosCalles => ({
  nombres: ["P2", "P", "P1", "A"],
  puntos: [P(0), P(0.01), P(0.02), P(0.03), P(0.015, 0.002)],
  estacionamientos: [{ ...P(-0.005), nombre: "GA 1" }],
  tramos: [
    { inicio: 0, fin: 1, tipo: 1, nombre: 0 },
    { inicio: 1, fin: 2, tipo: 1, nombre: 1 },
    { inicio: 2, fin: 3, tipo: 1, nombre: 2 },
    { inicio: 0, fin: 0, tipo: 3, nombre: -1 }, // estacionamiento 0 -> punto 0
  ],
  ...extra,
});

test("ruta más corta con nombres sin repetir los seguidos", () => {
  const d = datos({ tramos: [...datos().tramos, { inicio: 1, fin: 2, tipo: 1, nombre: 1 }] });
  assert.deepEqual(rutaRodaje(d, { estacionamiento: 0 }, 3), ["P2", "P", "P1"]);
  assert.deepEqual(rutaRodaje(d, { punto: 1 }, 3), ["P", "P1"]);
});

test("nunca pasa por un tramo de pista, aunque sea más corto", () => {
  const d = datos({ tramos: [...datos().tramos, { inicio: 0, fin: 3, tipo: 2, nombre: 3 }] });
  assert.deepEqual(rutaRodaje(d, { punto: 0 }, 3), ["P2", "P", "P1"]);
});

test("si solo hay pista, no hay ruta", () => {
  const d = datos({ tramos: [{ inicio: 0, fin: 3, tipo: 2, nombre: 3 }] });
  assert.equal(rutaRodaje(d, { punto: 0 }, 3), null);
});

test("el camino de menor distancia gana aunque tenga más tramos", () => {
  // El punto 4 está muy desviado al norte: el desvío 0-4-3 es más largo que 0-1-2-3
  const largo = datos({
    puntos: [P(0), P(0.01), P(0.02), P(0.03), P(0.015, 0.05)],
    tramos: [
      { inicio: 0, fin: 4, tipo: 1, nombre: 3 },
      { inicio: 4, fin: 3, tipo: 1, nombre: 3 },
      { inicio: 0, fin: 1, tipo: 1, nombre: 0 },
      { inicio: 1, fin: 2, tipo: 1, nombre: 1 },
      { inicio: 2, fin: 3, tipo: 1, nombre: 2 },
    ],
  });
  assert.deepEqual(rutaRodaje(largo, { punto: 0 }, 3), ["P2", "P", "P1"]);
  const corto = datos({
    puntos: [P(0), P(0.01), P(0.02), P(0.03), P(0.015, 0.0005)],
    tramos: [
      { inicio: 0, fin: 4, tipo: 1, nombre: 3 },
      { inicio: 4, fin: 3, tipo: 1, nombre: 3 },
      { inicio: 0, fin: 1, tipo: 1, nombre: 0 },
      { inicio: 1, fin: 3, tipo: 1, nombre: 1 },
    ],
  });
  // 0-1-3 mide 0.03; 0-4-3 mide algo más por el desvío: gana P2, P
  assert.deepEqual(rutaRodaje(corto, { punto: 0 }, 3), ["P2", "P"]);
});

test("tramos sin nombre no aparecen y los nombres repetidos seguidos se juntan", () => {
  const d = datos({
    nombres: ["P"],
    tramos: [
      { inicio: 0, fin: 1, tipo: 1, nombre: 0 },
      { inicio: 1, fin: 2, tipo: 1, nombre: -1 },
      { inicio: 2, fin: 3, tipo: 1, nombre: 0 },
    ],
  });
  assert.deepEqual(rutaRodaje(d, { punto: 0 }, 3), ["P"]);
});

test("origen igual al destino da lista vacía; índices malos o sin camino dan null", () => {
  assert.deepEqual(rutaRodaje(datos(), { punto: 3 }, 3), []);
  assert.equal(rutaRodaje(datos(), { punto: 99 }, 3), null);
  assert.equal(rutaRodaje(datos(), { punto: 0 }, 99), null);
  assert.equal(rutaRodaje(datos(), { estacionamiento: 5 }, 3), null);
  assert.equal(rutaRodaje(datos(), { punto: 4 }, 3), null); // el punto 4 está aislado
});

test("puntoMasCercano", () => {
  const d = datos();
  assert.equal(puntoMasCercano(d, 20, lon(0.0295)), 3);
  assert.equal(puntoMasCercano({ ...d, puntos: [] }, 20, -103), null);
});
