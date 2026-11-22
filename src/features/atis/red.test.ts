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
