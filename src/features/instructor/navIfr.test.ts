import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { desvioGrados, distanciaConsejo, generarTramo, norm180, norm360, pasoEstacion, puntos, referenciaTramo, tipoDe, tipoDicho, tramosDe, type Ejercicio } from "./navIfr.ts";
import type { VorElegido } from "./vorSim.ts";
import { tolInterceptacion } from "./nivel.ts";

test("norm180 deja los grados entre -180 y 180", () => {
  assert.equal(norm180(190), -170);
  assert.equal(norm180(-190), 170);
  assert.equal(norm180(20), 20);
});

test("desvío alrededor del 360: curso 350 y el avión en el radial 010 son 20°, con signo contrario en TO", () => {
  const desde: Ejercicio = { tipo: "normal", radial: 350, desde: true, curso: 350, referencia: 330 };
  const hacia: Ejercicio = { tipo: "normal", radial: 350, desde: false, curso: 170, referencia: 330 };
  assert.equal(desvioGrados(desde, 10), 20);
  assert.equal(desvioGrados(hacia, 10), -20);
  assert.equal(desvioGrados(desde, 340), -10);
});

test("un punto de la barra son 2 grados", () => {
  assert.equal(puntos(-3), -1.5);
});

test("tramosDe: lección 1 alterna alejamiento y acercamiento, todo normal", () => {
  assert.deepEqual(tramosDe(1, false), [
    { desde: true, tipo: "normal" }, { desde: false, tipo: "normal" }, { desde: true, tipo: "normal" }, { desde: false, tipo: "normal" },
  ]);
  assert.deepEqual(tramosDe(1, true), [{ desde: true, tipo: "normal" }, { desde: false, tipo: "normal" }]);
});

test("tramosDe: lección 2 son rutas pasadas y el alejamiento tras el VOR espera 3 NM", () => {
  assert.deepEqual(tramosDe(2, false), [
    { desde: true, tipo: "pasada" }, { desde: false, tipo: "pasada" }, { desde: true, tipo: "pasada", esperarNm: 3 }, { desde: false, tipo: "pasada" },
  ]);
});

test("tramosDe: el examen de la lección 2 mezcla una normal y una pasada", () => {
  assert.deepEqual(tramosDe(2, true, () => 0.1).map((t) => t.tipo), ["pasada", "normal"]);
  assert.deepEqual(tramosDe(2, true, () => 0.9).map((t) => t.tipo), ["normal", "pasada"]);
  assert.deepEqual(tramosDe(2, true, () => 0.9).map((t) => t.desde), [true, false]);
});

test("generarTramo: normal a 20–60°, pasada a 120–160°, en decenas, lejos de la frontera de 90°", () => {
  for (const ref of [0, 7, 95, 183, 290, 355])
    for (let k = 0; k < 50; k++) {
      let i = 0;
      const azar = () => (k * 0.137 + ref * 0.01 + i++ * 0.31) % 1;
      const n = generarTramo({ desde: true, tipo: "normal" }, ref, azar);
      const p = generarTramo({ desde: false, tipo: "pasada" }, ref, azar);
      const dn = Math.abs(norm180(n.radial - ref));
      const dp = Math.abs(norm180(p.radial - ref));
      assert.ok(dn >= 15 && dn <= 65, `normal ${n.radial} ref ${ref}`);
      assert.ok(dp >= 115 && dp <= 165, `pasada ${p.radial} ref ${ref}`);
      assert.equal(n.radial % 10, 0);
      assert.equal(p.radial % 10, 0);
      assert.equal(tipoDe(n.radial, ref), "normal");
      assert.equal(tipoDe(p.radial, ref), "pasada");
    }
});

test("generarTramo: curso FROM = radial, TO = radial + 180; guarda tipo y referencia", () => {
  assert.deepEqual(generarTramo({ desde: true, tipo: "normal" }, 290, () => 0), { tipo: "normal", radial: 310, desde: true, curso: 310, referencia: 290 });
  const p = generarTramo({ desde: false, tipo: "pasada" }, 290, () => 0.99);
  assert.equal(p.tipo, "pasada");
  assert.equal(p.curso, norm360(p.radial + 180));
});

test("tipoDe: el ejemplo de Erik y el cruce del 360", () => {
  assert.equal(tipoDe(200, 290), "normal");
  assert.equal(tipoDe(20, 290), "normal");
  assert.equal(tipoDe(150, 290), "pasada");
  assert.equal(tipoDe(10, 350), "normal");
  assert.equal(tipoDe(170, 350), "pasada");
});

const VOR: VorElegido = { ident: "GDL", region: "MM", lat: 20.5, lon: -103.3, mhz: 117.6, dme: true, decl: 0 };
const enPos = (lat: number, rumbo: number, navRadial?: number): Muestra => ({
  t: 0, inclinacion: 0, altitud: 5000, velocidad: 0, rumbo, bola: 0, agl: 0, peso: 2300, enTierra: true, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", lat, lon: -103.3, navRadial,
});

test("referenciaTramo: cerca del VOR, la pista; lejos, el radial del avión", () => {
  // 0.5 NM al norte del VOR.
  assert.equal(referenciaTramo(enPos(20.5 + 0.5 / 60, 200), VOR, 290), 290);
  assert.equal(referenciaTramo(enPos(20.5 + 0.5 / 60, 285), VOR), 285);
  // 10 NM al norte: el radial del lector, o el de la posición (≈ 360) si no hay.
  assert.equal(referenciaTramo(enPos(20.5 + 10 / 60, 285, 47), VOR, 290), 47);
  const r = referenciaTramo(enPos(20.5 + 10 / 60, 285), VOR, 290);
  assert.ok(Math.abs(norm180(r - 0)) < 1, `por posición ${r}`);
});

test("tipoDicho: normal, ruta pasada y en inglés; dos o ninguna → null", () => {
  assert.equal(tipoDicho("normal", "es"), "normal");
  assert.equal(tipoDicho("es una ruta pasada", "es"), "pasada");
  assert.equal(tipoDicho("pasado", "es"), "pasada");
  assert.equal(tipoDicho("passed route", "en"), "pasada");
  assert.equal(tipoDicho("it's behind", "en"), "pasada");
  assert.equal(tipoDicho("normal o pasada", "es"), null);
  assert.equal(tipoDicho("no sé", "es"), null);
});

test("consejo por distancia: menos de 5 NM cerca, más de 15 lejos", () => {
  assert.equal(distanciaConsejo(3), "cerca");
  assert.equal(distanciaConsejo(20), "lejos");
  assert.equal(distanciaConsejo(10), null);
});

test("tolerancias de interceptación por nivel", () => {
  assert.equal(tolInterceptacion(2).sobrepasoPuntos, 1);
  assert.equal(tolInterceptacion(1).sobrepasoPuntos, 1.5);
  assert.equal(tolInterceptacion(3).cortoSeg, 20);
  assert.equal(tolInterceptacion(2).establecidoPuntos, 1);
});

test("pasoEstacion: del otro lado a partir de 100°, de regreso a 80° o menos (histéresis)", () => {
  assert.equal(pasoEstacion(false, 90 + 95, 90), false);
  assert.equal(pasoEstacion(false, 90 + 100, 90), true);
  assert.equal(pasoEstacion(true, 90 + 85, 90), true);
  assert.equal(pasoEstacion(true, 90 + 80, 90), false);
  assert.equal(pasoEstacion(false, 350 + 150, 350), true);
});
