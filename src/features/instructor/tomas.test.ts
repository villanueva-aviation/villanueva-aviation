import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import type { FaseVuelo } from "./fasesVuelo.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { calificarTomas, crearTomas, medirTomas, type Tomas } from "./tomas.ts";

const BASE = simularVuelo()[0];
type Paso = { fase: FaseVuelo; regreso?: boolean } & Partial<Muestra>;
/** Pasa una serie de muestras por medirTomas, con su fase y si ya va de regreso. */
const medir = (pasos: Paso[]): Tomas => {
  let t = crearTomas();
  let previo: Muestra | null = null;
  pasos.forEach(({ fase, regreso = false, ...m }, i) => {
    const mu: Muestra = { ...BASE, t: i, ...m };
    t = medirTomas(t, previo, mu, fase, regreso);
    previo = mu;
  });
  return t;
};
const carrera = (kt: number): Paso[] => [
  { fase: "carrera-despegue", enTierra: true, velocidad: kt - 3 },
  { fase: "carrera-despegue", enTierra: false, velocidad: kt },
  { fase: "carrera-despegue", enTierra: false, velocidad: kt + 2 },
];
const ascenso = (kts: number[]): Paso[] =>
  kts.map((v, i) => ({ fase: "vuelo", enTierra: false, velocidad: v, vs: 600, agl: 200 + (i * 800) / Math.max(1, kts.length - 1) }));
const final = (kts: number[]): Paso[] =>
  kts.map((v, i) => ({ fase: "vuelo", regreso: true, enTierra: false, velocidad: v, vs: -500, agl: 500 - (i * 450) / Math.max(1, kts.length - 1) }));

test("rotación a 57 kt vale; a 45 kt no", () => {
  assert.equal(medir(carrera(57)).rotacionKt, 57);
  assert.equal(calificarTomas(medir(carrera(57))).despegue.rotacion, true);
  assert.equal(calificarTomas(medir(carrera(45))).despegue.rotacion, false);
});

test("ascenso a Vy: 72–78 kt vale, 90 kt no, sin ascenso es null", () => {
  assert.equal(calificarTomas(medir(ascenso([72, 74, 76, 78]))).despegue.vy, true);
  assert.equal(calificarTomas(medir(ascenso([90, 90, 90]))).despegue.vy, false);
  assert.equal(calificarTomas(medir(carrera(57))).despegue.vy, null);
});

test("Vy solo cuenta antes de pasar 1000 ft AGL la primera vez", () => {
  const t = medir([...ascenso([74, 74]), { fase: "vuelo", enTierra: false, velocidad: 74, vs: 500, agl: 1100 }, ...ascenso([100, 100])]);
  assert.equal(calificarTomas(t).despegue.vy, true);
});

test("final: 63–72 kt vale; un cuadro a 78 kt no; sin regreso no se mide", () => {
  assert.equal(calificarTomas(medir(final([63, 66, 72]))).aterrizaje.final, true);
  assert.equal(calificarTomas(medir(final([65, 78, 65]))).aterrizaje.final, false);
  const sinRegreso = final([65, 65]).map((p) => ({ ...p, regreso: false }));
  assert.equal(calificarTomas(medir(sinRegreso)).aterrizaje.final, null);
});

test("en pista: lo pone la página; sin dato es null", () => {
  assert.equal(calificarTomas(crearTomas()).aterrizaje.enPista, null);
  assert.equal(calificarTomas({ ...crearTomas(), tocoEnPista: false }).aterrizaje.enPista, false);
});
