import { test } from "node:test";
import assert from "node:assert/strict";
import { buscar, convertirPais, normalizar, parsearCsv } from "./datos.ts";

test("parsearCsv respeta comillas con comas y comillas dobles", () => {
  assert.deepEqual(parsearCsv('a,b\n"x, y",2'), [{ a: "x, y", b: "2" }]);
  assert.deepEqual(parsearCsv('a,b\r\n"di ""hola""",\r\n'), [{ a: 'di "hola"', b: "" }]);
});

const nav = (o: Record<string, string>) => ({
  ident: "", name: "", type: "VOR", frequency_khz: "", latitude_deg: "20", longitude_deg: "-103",
  elevation_ft: "5000", iso_country: "MX", dme_frequency_khz: "", magnetic_variation_deg: "", ...o,
});
const navaids = [
  nav({ ident: "GDL", name: "Guadalajara", type: "VOR-DME", frequency_khz: "117500", magnetic_variation_deg: "5.2" }),
  nav({ ident: "LEN", name: "León", type: "VOR", frequency_khz: "113900", dme_frequency_khz: "1100000" }),
  nav({ ident: "QRO", name: "Querétaro", type: "VORTAC", frequency_khz: "114300" }),
  nav({ ident: "SOL", name: "Solo VOR", type: "VOR", frequency_khz: "112000" }),
  nav({ ident: "ND", name: "Un NDB", type: "NDB", frequency_khz: "350" }),
  nav({ ident: "TAC", name: "Un TACAN", type: "TACAN", frequency_khz: "" }),
  nav({ ident: "LAX", name: "Los Angeles", type: "VORTAC", frequency_khz: "113600", iso_country: "US" }),
];
const apt = (o: Record<string, string>) => ({
  id: "1", ident: "", type: "medium_airport", name: "", latitude_deg: "20.5", longitude_deg: "-103.3",
  elevation_ft: "5016", iso_country: "MX", gps_code: "", icao_code: "", ...o,
});
const aeropuertos = [
  apt({ id: "1", ident: "MMGL", gps_code: "MMGL", type: "large_airport", name: "Guadalajara" }),
  apt({ id: "2", ident: "MX-0001", type: "heliport", name: "Helipuerto Torre" }),
  apt({ id: "3", ident: "MMXX", type: "closed", name: "Cerrado" }),
  apt({ id: "4", ident: "MX-9999", type: "small_airport", name: "Pista sin código" }),
  apt({ id: "5", ident: "KLAX", gps_code: "KLAX", type: "large_airport", iso_country: "US" }),
];
const pistas = [
  { airport_ref: "1", le_ident: "10", he_ident: "28", le_latitude_deg: "20.52", le_longitude_deg: "-103.32", he_latitude_deg: "20.52", he_longitude_deg: "-103.29", width_ft: "148" },
  { airport_ref: "1", le_ident: "02", he_ident: "20", le_latitude_deg: "", le_longitude_deg: "", he_latitude_deg: "", he_longitude_deg: "", width_ft: "100" },
];
const frecuencias = [{ airport_ref: "1", type: "TWR", frequency_mhz: "118.1" }];

const datos = convertirPais("MX", navaids, aeropuertos, pistas, frecuencias);

test("convertirPais guarda VOR, VOR-DME y VORTAC del país y descarta NDB y TACAN", () => {
  assert.deepEqual(datos.vors.map((v) => v.ident).sort(), ["GDL", "LEN", "QRO", "SOL"]);
  const gdl = datos.vors.find((v) => v.ident === "GDL")!;
  assert.equal(gdl.mhz, 117.5);
  assert.equal(gdl.decl, 5.2);
  assert.equal(gdl.elevFt, 5000);
  assert.equal(gdl.dme, true);
  assert.equal(datos.vors.find((v) => v.ident === "QRO")!.dme, true);
  assert.equal(datos.vors.find((v) => v.ident === "LEN")!.dme, true);
  assert.equal(datos.vors.find((v) => v.ident === "SOL")!.dme, false);
});

test("convertirPais guarda aeropuertos con código, helipuertos, pistas y frecuencias", () => {
  assert.deepEqual(datos.aeropuertos.map((a) => a.icao).sort(), ["MMGL", "MX-0001"]);
  const gdl = datos.aeropuertos.find((a) => a.icao === "MMGL")!;
  assert.equal(gdl.helipuerto, false);
  assert.equal(gdl.pistas.length, 1);
  assert.equal(gdl.pistas[0].a, "10");
  assert.equal(gdl.pistas[0].anchoFt, 148);
  assert.deepEqual(gdl.com, [{ tipo: "TWR", mhz: 118.1 }]);
  assert.equal(datos.aeropuertos.find((a) => a.icao === "MX-0001")!.helipuerto, true);
});

test("normalizar quita acentos y mayúsculas", () => {
  assert.equal(normalizar("León QUERÉTARO"), "leon queretaro");
});

test("buscar ignora acentos y pone primero el ident exacto", () => {
  assert.equal(buscar(datos, "Leon").vors[0].nombre, "León");
  assert.equal(buscar(datos, "gdl").vors[0].ident, "GDL");
  assert.equal(buscar(datos, "guadalajara").aeropuertos[0].icao, "MMGL");
  const r = buscar({ vors: [{ ...datos.vors[0], ident: "XGDL", nombre: "x" }, ...datos.vors], aeropuertos: [] }, "gdl");
  assert.equal(r.vors[0].ident, "GDL");
  assert.equal(r.vors[1].ident, "XGDL");
});
