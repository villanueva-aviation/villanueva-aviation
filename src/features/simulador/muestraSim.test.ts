import { test } from "node:test";
import assert from "node:assert/strict";
import { difAngulo } from "../home/navGeo.ts";
import { TITULO_SIM_WEB } from "../instructor/simWeb.ts";
import { inicio, type Sim } from "./bucle.ts";
import type { AeropuertoSim, Vor } from "./datos.ts";
import { aAeropuerto, aeropuertoCercano, aMuestra, apMueve, aVorSim } from "./muestraSim.ts";
import { AP_APAGADO, pulsar } from "./piloto.ts";
import { recibirNav } from "./radios.ts";

const gdl = { lat: 20.5218, lon: -103.3112, elevFt: 5016, rumboV: 100 };
const vor: Vor = { ident: "GDL", nombre: "Guadalajara", lat: 20.5234, lon: -103.312, mhz: 117.3, dme: true, decl: 7.3, elevFt: 5016 };
const enAire = (): Sim => inicio(gdl, { vor, distNm: 10, altFt: 8000 });

test("apMueve: solo los modos que mueven el helicóptero", () => {
  const e = enAire().e;
  const sel = enAire().sel;
  assert.equal(apMueve(AP_APAGADO), false);
  const att = pulsar(AP_APAGADO, "AP", e, sel);
  assert.equal(att.ap, true);
  assert.equal(apMueve(att), false);
  assert.equal(apMueve(pulsar(att, "HDG", e, sel)), true);
  assert.equal(apMueve(pulsar(att, "ALT", e, sel)), true);
  assert.equal(apMueve(pulsar(att, "IAS", e, sel)), true);
});

test("aMuestra: en el aire al sur del VOR GDL, con NAV1 sintonizado", () => {
  const s = enAire();
  const m = aMuestra(s, { t: 12.5, sueloFt: 5000, decl: 7.3, vors: [vor] });
  const l = recibirNav(s.radios.nav1[0], s.radios.obs, s.e, [vor])!;
  assert.equal(m.t, 12.5);
  assert.ok(Math.abs(difAngulo(m.rumbo, (s.e.rumboV - 7.3 + 360) % 360)) < 1e-9);
  assert.equal(m.agl, s.e.altFt - 5000);
  assert.equal(m.altitud, s.e.altFt);
  assert.equal(m.velocidad, s.e.ias);
  assert.equal(m.titulo, TITULO_SIM_WEB);
  assert.equal(m.tasa, 1);
  assert.equal(m.slew, false);
  assert.equal(m.pausa, false);
  assert.equal(m.enTierra, false);
  assert.equal(m.motor, true);
  assert.equal(m.lat, s.e.lat);
  assert.equal(m.rumboV, s.e.rumboV);
  assert.equal(m.navMhz, 117.3);
  assert.equal(m.navSenal, true);
  assert.equal(m.navRadial, l.radial);
  assert.equal(m.navDesde, l.desde ? 2 : 1);
  assert.equal(m.navTieneDme, true);
  assert.equal(m.navDme, l.dmeNm);
  assert.equal(m.gpsNav, false);
  assert.equal(m.autopiloto, false);
});

test("aMuestra: GPS como fuente y AP en HDG", () => {
  const s = enAire();
  const m = aMuestra({ ...s, fuente: "gps", ap: pulsar(s.ap, "HDG", s.e, s.sel) }, { t: 0, sueloFt: 5000, decl: 7.3, vors: [vor] });
  assert.equal(m.gpsNav, true);
  assert.equal(m.autopiloto, true);
});

test("aMuestra: sin señal (otra frecuencia)", () => {
  const s = enAire();
  const m = aMuestra({ ...s, radios: { ...s.radios, nav1: [110.5, 108] } }, { t: 0, sueloFt: 5000, decl: 7.3, vors: [vor] });
  assert.equal(m.navSenal, false);
  assert.equal(m.navDesde, 0);
  // Como el lector de MSFS: números aunque no haya señal (undefined = «lector viejo» y anula al instante).
  assert.equal(m.navRadial, 0);
  assert.equal(m.navDesv, 0);
  assert.equal(m.navDme, 0);
});

const mmgl: AeropuertoSim = {
  icao: "MMGL",
  nombre: "Guadalajara",
  lat: 20.5218,
  lon: -103.3112,
  elevFt: 5016,
  helipuerto: false,
  pistas: [
    { a: "11", b: "29", latA: 20.5256, lonA: -103.3290, latB: 20.5180, lonB: -103.2934, anchoFt: 148 },
    { a: "H1", b: "", latA: 20.52, lonA: -103.31, latB: 20.52, lonB: -103.31, anchoFt: 50 },
  ],
  com: [
    { tipo: "TWR", mhz: 118.1 },
    { tipo: "GND", mhz: 121.9 },
    { tipo: "ATIS", mhz: 127.65 },
    { tipo: "APP", mhz: 119.1 },
    { tipo: "CTAF", mhz: 122.8 },
  ],
};

test("aAeropuerto: pistas con extremos opuestos, sin helipuertos, y frecuencias por tipo", () => {
  const a = aAeropuerto(mmgl);
  assert.equal(a.icao, "MMGL");
  assert.equal(a.elevacionFt, 5016);
  assert.equal(a.pistas.length, 1);
  const [e1, e2] = a.pistas[0].extremos;
  assert.equal(e1.ident, "11");
  assert.equal(e2.ident, "29");
  assert.ok(Math.abs(Math.abs(difAngulo(e1.rumboV, e2.rumboV)) - 180) < 1);
  assert.ok(a.pistas[0].largoFt > 10000 && a.pistas[0].largoFt < 14000);
  assert.equal(a.pistas[0].anchoFt, 148);
  assert.deepEqual(
    a.frecuencias.map((f) => f.tipo),
    ["torre", "rodaje", "atis", "aproximacion", "otra"],
  );
  assert.equal(a.frecuencias[0].mhz, 118.1);
});

test("aeropuertoCercano: el más cercano a 5 NM o menos", () => {
  const lejos: AeropuertoSim = { ...mmgl, icao: "MMLJ", lat: 21, lon: -104 };
  assert.equal(aeropuertoCercano([lejos, mmgl], 20.53, -103.31)?.icao, "MMGL");
  assert.equal(aeropuertoCercano([lejos, mmgl], 22, -103.31), null);
});

test("aVorSim conserva ident, posición, frecuencia y DME", () => {
  assert.deepEqual(aVorSim(vor), { ident: "GDL", region: "", lat: vor.lat, lon: vor.lon, mhz: 117.3, dme: true });
});
