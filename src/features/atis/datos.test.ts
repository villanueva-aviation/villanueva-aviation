import { test } from "node:test";
import assert from "node:assert/strict";
import { armarAeropuertos, extremos, nombres } from "./datos.ts";

const fila11R = {
  le_ident: "11R", he_ident: "29L", length_ft: "13123", closed: "0",
  le_heading_degT: "113", he_heading_degT: "293",
  le_latitude_deg: "", le_longitude_deg: "", he_latitude_deg: "", he_longitude_deg: "",
};
const fila11L = {
  le_ident: "11L", he_ident: "29R", length_ft: "13123", closed: "0",
  le_heading_degT: "", he_heading_degT: "",
  le_latitude_deg: "20.531017", le_longitude_deg: "-103.32666",
  he_latitude_deg: "20.518005", he_longitude_deg: "-103.29567",
};

test("nombres: internacional y genérico", () => {
  assert.deepEqual(nombres("Guadalajara International Airport", "Guadalajara"), {
    es: "Aeropuerto Internacional de Guadalajara", en: "Guadalajara International Airport",
  });
  assert.deepEqual(nombres("Some Field", "Tepic"), { es: "Aeropuerto de Tepic", en: "Tepic Airport" });
});

test("extremos: usa rumbos verdaderos del CSV", () => {
  assert.deepEqual(extremos(fila11R), [
    { ident: "11R", rumboV: 113, largoFt: 13123 },
    { ident: "29L", rumboV: 293, largoFt: 13123 },
  ]);
});

test("extremos: calcula el rumbo desde coordenadas si faltan", () => {
  const [a, b] = extremos(fila11L);
  assert.ok(Math.abs(a.rumboV - 113) <= 1, `${a.rumboV}`);
  assert.ok(Math.abs(b.rumboV - 293) <= 1, `${b.rumboV}`);
});

test("extremos: pista cerrada no da extremos", () => {
  assert.deepEqual(extremos({ ...fila11R, closed: "1" }), []);
});

test("armarAeropuertos: filtra país y exige ATIS", () => {
  const apt = (ident: string, iso: string) => ({
    ident, name: "Guadalajara International Airport", municipality: "Guadalajara",
    latitude_deg: "20.52", longitude_deg: "-103.31", elevation_ft: "5016", iso_country: iso,
  });
  const pistas = [
    { airport_ident: "MMGL", ...fila11R },
    { airport_ident: "MMGL", ...fila11L },
  ];
  const frec = [
    { airport_ident: "MMGL", type: "ATIS", frequency_mhz: "127.9" },
    { airport_ident: "MMGL", type: "TWR", frequency_mhz: "118.1" },
    { airport_ident: "MMXX", type: "TWR", frequency_mhz: "118.1" },
    { airport_ident: "KAAA", type: "ATIS", frequency_mhz: "120.0" },
  ];
  const r = armarAeropuertos([apt("MMGL", "MX"), apt("MMXX", "MX"), apt("KAAA", "US")], pistas, frec, "MX");
  assert.equal(r.length, 1);
  assert.equal(r[0].icao, "MMGL");
  assert.deepEqual(r[0].atisMhz, [127.9]);
  assert.equal(r[0].pistas.length, 4);
  assert.equal(r[0].elevFt, 5016);
});
