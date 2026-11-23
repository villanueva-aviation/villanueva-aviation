import { test } from "node:test";
import assert from "node:assert/strict";
import { estadoIvao, estadoVatsim, estadoVigente, fuente, type IvaoAtc, type VatsimEstacion } from "./red.ts";

const MMGL = { icao: "MMGL", lat: 20.5218, lon: -103.3112 };

const vat = (callsign: string, facility: number, extra: Partial<VatsimEstacion> = {}): VatsimEstacion =>
  ({ callsign, facility, visual_range: 50, text_atis: null, ...extra });
const ivao = (callsign: string, position: string, extra: Partial<IvaoAtc> = {}): IvaoAtc =>
  ({ callsign, atcSession: { position }, lastTrack: null, ...extra });
const VOZ = "ts-1.eu-west-2.ivao.aero/MMGL_TWR";

test("fuente: sin red siempre genera", () => {
  assert.equal(fuente("ninguna", null), "generado");
  assert.equal(fuente("ninguna", { atc: true, atis: { lineas: ["x"], letra: "A" } }), "generado");
});

test("fuente: sin datos de la red se supone que hay controlador", () => {
  assert.equal(fuente("ivao", null), "sin-letra");
});

test("fuente: ATIS de la red → cliente; ATC sin ATIS → sin letra; nadie → generado", () => {
  assert.equal(fuente("vatsim", { atc: true, atis: { lineas: ["x"], letra: "A" } }), "cliente");
  assert.equal(fuente("vatsim", { atc: true, atis: null }), "sin-letra");
  assert.equal(fuente("ivao", { atc: false, atis: null }), "generado");
});

test("VATSIM: estación MMGL_ATIS da su texto y su letra", () => {
  const datos = { controllers: [], atis: [vat("MMGL_ATIS", 4, { atis_code: "C", text_atis: ["MMGL INFO C ..."] })] };
  assert.deepEqual(estadoVatsim(datos, [], MMGL), { atc: true, atis: { lineas: ["MMGL INFO C ..."], letra: "C" } });
});

test("VATSIM: variantes MMGL_D_ATIS también cuentan", () => {
  const datos = { controllers: [], atis: [vat("MMGL_D_ATIS", 4, { atis_code: "C", text_atis: ["MMGL INFO C ..."] })] };
  assert.deepEqual(estadoVatsim(datos, [], MMGL), { atc: true, atis: { lineas: ["MMGL INFO C ..."], letra: "C" } });
});

test("VATSIM: torre del aeropuerto sin ATIS", () => {
  assert.deepEqual(estadoVatsim({ controllers: [vat("MMGL_TWR", 4)], atis: [] }, [], MMGL), { atc: true, atis: null });
});

test("VATSIM: un prefijo parecido no cuenta", () => {
  assert.deepEqual(estadoVatsim({ controllers: [vat("MMGLX_TWR", 4)], atis: [] }, [], MMGL), { atc: false, atis: null });
});

test("VATSIM: centro con transceptor dentro de su alcance cuenta, lejos no", () => {
  const datos = { controllers: [vat("MMFR_CTR", 6, { visual_range: 300 })], atis: [] };
  const en = (lat: number) => [{ callsign: "MMFR_CTR", transceivers: [{ latDeg: lat, lonDeg: -103.3 }] }];
  assert.equal(estadoVatsim(datos, en(21.4), MMGL).atc, true); // ~53 NM
  assert.equal(estadoVatsim(datos, en(27.0), MMGL).atc, false); // ~390 NM
  assert.equal(estadoVatsim(datos, [], MMGL).atc, false); // sin posición
});

test("VATSIM: un centro de otro país no cuenta aunque su alcance llegue (Houston, 600 NM, visto en vivo)", () => {
  const datos = { controllers: [vat("HOU_46_CTR", 6, { visual_range: 600 })], atis: [] };
  const trans = [{ callsign: "HOU_46_CTR", transceivers: [{ latDeg: 27.0, lonDeg: -100.0 }] }];
  assert.equal(estadoVatsim(datos, trans, MMGL).atc, false);
});

test("IVAO: un centro de otro país no cuenta aunque esté cerca", () => {
  const pos = { latitude: 22.19, longitude: -103.3112 };
  assert.equal(estadoIvao({ clients: { atcs: [ivao("KZHU_CTR", "CTR", { lastTrack: pos })] } }, MMGL).atc, false);
});

test("IVAO: la torre con ATIS da sus líneas sin la del servidor de voz", () => {
  const w = { clients: { atcs: [ivao("MMGL_TWR", "TWR", { atis: { lines: [VOZ, "Guadalajara ATIS Information FOXTROT ..."], revision: "F" } })] } };
  assert.deepEqual(estadoIvao(w, MMGL), { atc: true, atis: { lineas: ["Guadalajara ATIS Information FOXTROT ..."], letra: "F" } });
});

test("IVAO: TWR gana a GND", () => {
  const w = { clients: { atcs: [
    ivao("MMGL_GND", "GND", { atis: { lines: [VOZ, "GND atis"], revision: "A" } }),
    ivao("MMGL_TWR", "TWR", { atis: { lines: [VOZ, "TWR atis"], revision: "B" } }),
  ] } };
  assert.deepEqual(estadoIvao(w, MMGL).atis, { lineas: ["TWR atis"], letra: "B" });
});

test("IVAO: ATIS que solo trae la línea del servidor de voz no es ATIS", () => {
  const w = { clients: { atcs: [ivao("MMGL_TWR", "TWR", { atis: { lines: [VOZ], revision: "Z" } })] } };
  assert.deepEqual(estadoIvao(w, MMGL), { atc: true, atis: null });
});

test("IVAO: centro a 100 NM cuenta (150 NM), aproximación a 100 NM no (60 NM), sin posición no", () => {
  const pos = { latitude: 22.19, longitude: -103.3112 };
  assert.equal(estadoIvao({ clients: { atcs: [ivao("MMFR_CTR", "CTR", { lastTrack: pos })] } }, MMGL).atc, true);
  assert.equal(estadoIvao({ clients: { atcs: [ivao("MMFR_APP", "APP", { lastTrack: pos })] } }, MMGL).atc, false);
  assert.equal(estadoIvao({ clients: { atcs: [ivao("MMGL_APP", "APP")] } }, MMGL).atc, true); // prefijo, sin posición
  assert.equal(estadoIvao({ clients: { atcs: [ivao("MMTO_APP", "APP")] } }, MMGL).atc, false);
});

test("VATSIM: estación ATIS sin texto sigue siendo ATIS de la red (su voz suena en vPilot)", () => {
  const datos = { controllers: [], atis: [vat("MMGL_ATIS", 4, { atis_code: null, text_atis: null })] };
  assert.deepEqual(estadoVatsim(datos, [], MMGL), { atc: true, atis: { lineas: [], letra: null } });
});

test("estadoVigente: respuesta reciente se usa; vieja se descarta; esperando la primera", () => {
  const estado = { atc: false, atis: null };
  assert.deepEqual(estadoVigente({ estado, recibidoMs: 1_000, fallo: false }, 60_000), estado);
  // Vieja (más de 2 minutos): mientras llega la nueva no se sabe nada → esperar.
  assert.equal(estadoVigente({ estado, recibidoMs: 1_000, fallo: false }, 200_000), "esperando");
  assert.equal(estadoVigente({ estado: null, recibidoMs: 0, fallo: false }, 5_000), "esperando");
  // Falló y lo último es viejo o no hay nada: ante la duda hay controlador → null (fuente da sin-letra).
  assert.equal(estadoVigente({ estado, recibidoMs: 1_000, fallo: true }, 200_000), null);
  assert.equal(estadoVigente({ estado: null, recibidoMs: 0, fallo: true }, 5_000), null);
  // Falló pero lo último es reciente: se usa.
  assert.deepEqual(estadoVigente({ estado, recibidoMs: 50_000, fallo: true }, 60_000), estado);
});

const KLAX = { icao: "KLAX", lat: 33.9425, lon: -118.408 };
const PANC = { icao: "PANC", lat: 61.1744, lon: -149.996 };
const CYVR = { icao: "CYVR", lat: 49.1947, lon: -123.1792 };
const MGGT = { icao: "MGGT", lat: 14.5833, lon: -90.5275 };

test("VATSIM mundial: LAX_TWR cuenta en KLAX y ANC_TWR en PANC (EE. UU. sin la K)", () => {
  assert.equal(estadoVatsim({ controllers: [vat("LAX_TWR", 4)], atis: [] }, [], KLAX).atc, true);
  assert.equal(estadoVatsim({ controllers: [vat("ANC_TWR", 4)], atis: [] }, [], PANC).atc, true);
  assert.equal(estadoVatsim({ controllers: [vat("SFO_TWR", 4)], atis: [] }, [], KLAX).atc, false);
});

test("VATSIM mundial: centro LAX_CTR a ~50 NM cuenta en KLAX", () => {
  const datos = { controllers: [vat("LAX_CTR", 6, { visual_range: 600 })], atis: [] };
  const trans = [{ callsign: "LAX_CTR", transceivers: [{ latDeg: 34.7, lonDeg: -118.4 }] }];
  assert.equal(estadoVatsim(datos, trans, KLAX).atc, true);
});

test("IVAO mundial: CZVR_CTR a ~100 NM cuenta en CYVR; MMFR_CTR cerca de MGGT no", () => {
  const w = (cs: string, lat: number, lon: number) => ({ clients: { atcs: [ivao(cs, "CTR", { lastTrack: { latitude: lat, longitude: lon } })] } });
  assert.equal(estadoIvao(w("CZVR_CTR", 50.85, -123.18), CYVR).atc, true);
  assert.equal(estadoIvao(w("MMFR_CTR", 16.25, -90.5), MGGT).atc, false);
});

test("mundial: centros vistos en vivo (TOR_CTR en Canadá, KZLA_CTR de IVAO en EE. UU.) cuentan por distancia", () => {
  const cyyz = { icao: "CYYZ", lat: 43.6772, lon: -79.6306 };
  const datos = { controllers: [vat("TOR_CTR", 6, { visual_range: 600 })], atis: [] };
  const trans = [{ callsign: "TOR_CTR", transceivers: [{ latDeg: 44.5, lonDeg: -79.6 }] }];
  assert.equal(estadoVatsim(datos, trans, cyyz).atc, true);
  const pos = { latitude: 34.5, longitude: -118.0 };
  assert.equal(estadoIvao({ clients: { atcs: [ivao("KZLA_CTR", "CTR", { lastTrack: pos })] } }, KLAX).atc, true);
  assert.equal(estadoIvao({ clients: { atcs: [ivao("KZLA_CTR", "CTR", { lastTrack: pos })] } }, MMGL).atc, false);
});

test("IVAO mundial: KSCT_APP a ~40 NM cuenta en KLAX (EE. UU. es región de una letra)", () => {
  const pos = { latitude: 34.6, longitude: -118.408 };
  assert.equal(estadoIvao({ clients: { atcs: [ivao("KSCT_APP", "APP", { lastTrack: pos })] } }, KLAX).atc, true);
});

test("mundial: prefijos que no son OACI fuera de México y Latinoamérica (LON_S_CTR en EGLL); Houston sigue fuera de MMGL", () => {
  const egll = { icao: "EGLL", lat: 51.4706, lon: -0.4619 };
  const datos = { controllers: [vat("LON_S_CTR", 6, { visual_range: 300 })], atis: [] };
  const trans = [{ callsign: "LON_S_CTR", transceivers: [{ latDeg: 51.9, lonDeg: -0.5 }] }];
  assert.equal(estadoVatsim(datos, trans, egll).atc, true);
  const cerca = { latitude: 22.19, longitude: -103.3112 };
  assert.equal(estadoIvao({ clients: { atcs: [ivao("HOU_CTR", "CTR", { lastTrack: cerca })] } }, MMGL).atc, false);
  assert.equal(estadoIvao({ clients: { atcs: [ivao("KZHU_CTR", "CTR", { lastTrack: cerca })] } }, MMGL).atc, false);
});

test("mundial: torres con prefijo raro cuentan a menos de 10 NM (SY_TWR en YSSY, FAI_TWR en PAFA), lejos no", () => {
  const yssy = { icao: "YSSY", lat: -33.9461, lon: 151.1772 };
  const pafa = { icao: "PAFA", lat: 64.8151, lon: -147.8561 };
  const en = (lat: number, lon: number) => [{ callsign: "SY_TWR", transceivers: [{ latDeg: lat, lonDeg: lon }] }];
  const sy = { controllers: [vat("SY_TWR", 4)], atis: [] };
  assert.equal(estadoVatsim(sy, en(-33.95, 151.18), yssy).atc, true);
  assert.equal(estadoVatsim(sy, en(-33.45, 151.18), yssy).atc, false); // ~30 NM
  const fai = (lat: number) => ({ clients: { atcs: [ivao("FAI_TWR", "TWR", { lastTrack: { latitude: lat, longitude: -147.85 } })] } });
  assert.equal(estadoIvao(fai(64.82), pafa).atc, true);
  assert.equal(estadoIvao(fai(65.3), pafa).atc, false); // ~29 NM
});
