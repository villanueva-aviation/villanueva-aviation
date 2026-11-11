import { test } from "node:test";
import assert from "node:assert/strict";
import { destino, figuraEspera, puntosArco } from "./figurasMapa.ts";

const VOR = { lat: 20.5, lon: -103.3 };
const RAD = Math.PI / 180;
/** Millas y rumbo verdadero desde el VOR, en el mismo plano local que `destino`. */
const polar = ([lat, lon]: [number, number]) => {
  const y = (lat - VOR.lat) * 60;
  const x = (lon - VOR.lon) * 60 * Math.cos(VOR.lat * RAD);
  return { nm: Math.hypot(x, y), rumbo: ((Math.atan2(x, y) / RAD) + 360) % 360 };
};
/** Rayo hacia el este: ¿cuántos lados cruza? */
function dentro(p: [number, number], poligono: [number, number][]): boolean {
  let si = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [ya, xa] = poligono[i];
    const [yb, xb] = poligono[j];
    if (ya > p[0] !== yb > p[0] && p[1] < ((xb - xa) * (p[0] - ya)) / (yb - ya) + xa) si = !si;
  }
  return si;
}

test("puntosArco: un punto cada 2°, todos a la distancia del arco, en los dos sentidos", () => {
  const sube = puntosArco(VOR, 10, 90, 150, 1, 0);
  assert.equal(sube.length, 31);
  for (const p of sube) assert.ok(Math.abs(polar(p).nm - 10) < 0.01);
  assert.ok(Math.abs(polar(sube[0]).rumbo - 90) < 0.01);
  assert.ok(Math.abs(polar(sube[30]).rumbo - 150) < 0.01);
  const baja = puntosArco(VOR, 10, 90, 30, -1, 0);
  assert.equal(baja.length, 31);
  assert.ok(Math.abs(polar(baja[15]).rumbo - 60) < 0.01);
});

test("puntosArco: la declinación gira el arco al verdadero", () => {
  assert.ok(Math.abs(polar(puntosArco(VOR, 8, 0, 60, 1, 5)[0]).rumbo - 5) < 0.01);
});

test("figuraEspera: acercamiento 270 a la derecha queda al este del VOR y al norte del radial 090; la gota cubre a quien llega con rumbo 060", () => {
  const f = figuraEspera(VOR, { acercamiento: 270, giros: "derecha", tramoSeg: 60 }, 0);
  assert.ok(f.pista.length > 10);
  // Al este del VOR (el viraje en el fijo pasa medio millas más allá) y al norte del radial 090.
  const este = f.pista.map((p) => polar(p).nm * Math.sin(polar(p).rumbo * RAD));
  assert.ok(este.every((x) => x >= -0.51));
  assert.ok(este.some((x) => x < -0.45), "el viraje del fijo se abre más allá del fijo");
  assert.ok(Math.max(...este) > 2.1 && Math.max(...este) < 2.2, "el tramo de un minuto y el viraje del otro extremo");
  assert.ok(este.reduce((a, x) => a + x, 0) / este.length > 0.5);
  assert.ok(f.pista.every(([lat]) => lat >= VOR.lat - 1e-9));
  assert.ok(f.pista.some(([lat]) => lat > VOR.lat + 0.9 / 60), "el alejamiento va a 1 NM al norte");
  assert.equal(f.sectores.length, 3);
  const gota = f.sectores.find((s) => s.entrada === "gota")!;
  const desde240 = destino(VOR.lat, VOR.lon, 240, 1.5);
  assert.ok(dentro(desde240, gota.poligono));
  assert.ok(!dentro(desde240, f.sectores.find((s) => s.entrada === "directa")!.poligono));
});
