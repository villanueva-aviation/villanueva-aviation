import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { AEROPUERTO_PRUEBA as A } from "./aeropuertoSim.ts";
import { aNm } from "../home/navGeo.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { enZona, sortear, zonaRepaso, type Zona } from "./repaso.ts";

const BASE = simularVuelo()[0];
const dist = (lat: number, lon: number) => Math.hypot(aNm(lat, lon, A.lat, A.lon).x, aNm(lat, lon, A.lat, A.lon).y);
/** Una muestra en el aire a `nm` del centro de la zona hacia el norte, a `agl` sobre el terreno. */
const enAire = (z: Zona, nm: number, agl: number): Muestra => ({ ...BASE, lat: z.lat + nm / 60, lon: z.lon, agl, enTierra: false });

test("sorteo: 4, todas las disponibles al menos una vez, nunca dos seguidas iguales", () => {
  for (let k = 0; k < 200; k++) {
    const s = sortear(["viraje-escarpado", "recto-nivelado", "vuelo-lento"]);
    assert.equal(s.length, 4);
    assert.equal(new Set(s).size, 3);
    for (let i = 1; i < 4; i++) assert.notEqual(s[i], s[i - 1]);
  }
  assert.deepEqual(sortear(["recto-nivelado"], 2, () => 0), ["recto-nivelado", "recto-nivelado"]);
});

test("zona en MMGL: Cajititlán o Chapala", () => {
  const caji = zonaRepaso(A, () => 0)!;
  assert.equal(caji.nombre.es, "Cajititlán");
  assert.ok(Math.abs(dist(caji.lat, caji.lon) - 5) < 0.1);
  assert.ok(caji.lat < A.lat, "al sur");
  const chapala = zonaRepaso(A, () => 0.99)!;
  assert.equal(chapala.nombre.es, "Chapala");
  assert.equal(chapala.radioNm, 5);
  assert.ok(Math.abs(dist(chapala.lat, chapala.lon) - 15) < 0.1);
});

test("otro aeropuerto: 10 NM al través de la pista más larga; sin aeropuerto, null", () => {
  const z = zonaRepaso({ ...A, icao: "MMXX" }, () => 0)!;
  assert.ok(Math.abs(dist(z.lat, z.lon) - 10) < 0.1);
  assert.equal(z.radioNm, 3);
  // la pista más larga va a 112°: la zona queda a 202°
  assert.equal(z.nombre.es, "la zona a 10 millas al rumbo 200");
  assert.equal(z.nombre.en, "the area 10 miles out on heading 200");
  assert.equal(zonaRepaso(null), null);
});

test("en la zona: dentro del radio y a 1,500 ft AGL o más", () => {
  const z = zonaRepaso(A, () => 0)!;
  assert.equal(enZona(enAire(z, 1, 1600), z), true);
  assert.equal(enZona(enAire(z, 1, 1200), z), false);
  assert.equal(enZona(enAire(z, 4, 2000), z), false);
  assert.equal(enZona({ ...BASE, lat: undefined, lon: undefined, agl: 2000 }, z), false);
});
