import { test } from "node:test";
import assert from "node:assert/strict";
import { aEspanol, nombresAtis, paraVoz } from "./nombres.ts";

const our = [
  { ident: "SAEZ", name: "Ministro Pistarini International Airport", municipality: "Buenos Aires", iso_country: "AR" },
  { ident: "SABE", name: "Jorge Newbery Airpark", municipality: "Buenos Aires", iso_country: "AR" },
  { ident: "SKRG", name: "José María Córdova International Airport", municipality: "Rionegro", iso_country: "CO" },
  { ident: "MMGL", name: "Don Miguel Hidalgo y Costilla Guadalajara International Airport", municipality: "Guadalajara", iso_country: "MX" },
  { ident: "EGLL", name: "London Heathrow Airport", municipality: "London", iso_country: "GB" },
];
const mx = { MMGL: { es: "Aeropuerto Internacional de Guadalajara", en: "Guadalajara International Airport" } };
const v = (icao: string, nombre = "x") => ({ icao, nombre });

test("latam: la ciudad compartida usa el nombre de OurAirports; sola, la regla de la ciudad; los fijos mandan", () => {
  const our2 = [...our,
    { ident: "SAZA", name: "Ciudad Foo International Airport", municipality: "Buenos Aires", iso_country: "AR" },
    { ident: "SAZB", name: "Bar Airpark", municipality: "Buenos Aires", iso_country: "AR" },
    { ident: "SAZC", name: "Baz Airport", municipality: "Tandil", iso_country: "AR" }];
  const { nombres } = nombresAtis([v("SAEZ"), v("SABE"), v("SKRG"), v("SAZA"), v("SAZB"), v("SAZC")], our2);
  assert.deepEqual(nombres.SAZA, { es: "Aeropuerto Internacional Ciudad Foo", en: "Ciudad Foo International Airport" });
  assert.deepEqual(nombres.SAZB, { es: "Aeropuerto Bar Airpark", en: "Bar Airpark" });
  assert.deepEqual(nombres.SAZC, { es: "Aeropuerto de Tandil", en: "Tandil Airport" });
  assert.deepEqual(nombres.SAEZ, { es: "Aeropuerto Internacional de Ezeiza", en: "Ezeiza International Airport" });
  assert.deepEqual(nombres.SABE, { es: "Aeroparque Jorge Newbery", en: "Jorge Newbery Airfield" });
  assert.deepEqual(nombres.SKRG, { es: "Aeropuerto Internacional José María Córdova", en: "José María Córdova International Airport" });
});

test("nombres para la voz: sin «/» ni paréntesis; MX.json no se toca", () => {
  assert.equal(paraVoz("Foo / Bar (Baz) Airport"), "Foo, Bar Baz Airport");
  assert.equal(paraVoz("Foo Airport (Bar), X"), "Foo Airport Bar, X");
  assert.equal(paraVoz("Foo/Bar"), "Foo, Bar");
  const our2 = [...our, { ident: "SKZZ", name: "Foo / Bar (Baz) Airport", municipality: "Cali", iso_country: "CO" },
    { ident: "SKZY", name: "Otro Airport", municipality: "Cali", iso_country: "CO" }];
  assert.deepEqual(nombresAtis([v("SKZZ"), v("SKZY")], our2).nombres.SKZZ, { es: "Aeropuerto Foo, Bar Baz", en: "Foo, Bar Baz Airport" });
  assert.deepEqual(nombresAtis([v("EGZZ", "Foo/Bar (Intl)")], our).nombres.EGZZ, { en: "Foo, Bar International" });
  const raro = { MMZZ: { es: "Aeropuerto (raro)", en: "Odd / Airport" } };
  assert.deepEqual(nombresAtis([v("MMZZ")], our, raro).nombres.MMZZ, raro.MMZZ);
});

test("un aeropuerto de MX.json conserva sus nombres", () => {
  const { nombres } = nombresAtis([v("MMGL")], our, mx);
  assert.deepEqual(nombres.MMGL, mx.MMGL);
});

test("faa y oaci: el nombre de OurAirports, solo en inglés", () => {
  assert.deepEqual(nombresAtis([v("EGLL")], our).nombres.EGLL, { en: "London Heathrow Airport" });
});

test("fuera de OurAirports: nombre de MSFS con abreviaturas expandidas", () => {
  assert.deepEqual(nombresAtis([v("KZZZ", "Foo Intl")], our).nombres.KZZZ, { en: "Foo International" });
  assert.deepEqual(nombresAtis([v("SAZZ", "Bar Rgnl")], our).nombres.SAZZ, { es: "Aeropuerto Bar Regional", en: "Bar Regional" });
});

test("repetidos y caracteres", () => {
  const r = nombresAtis([v("MMGL"), v("EGLL")], our, mx);
  assert.deepEqual(r.repetidos, []);
  const suma = ["Aeropuerto Internacional de Guadalajara", "Guadalajara International Airport", "London Heathrow Airport"]
    .reduce((t, s) => t + s.length + 1, 0);
  assert.equal(r.caracteres, suma);
  const dup = nombresAtis([v("EGLL"), v("EGKK", "Foo")], [...our, { ident: "EGKK", name: "London Heathrow Airport", municipality: "", iso_country: "GB" }]);
  assert.deepEqual(dup.repetidos, ["London Heathrow Airport"]);
});

test("los de MX.json que faltan en el volcado conservan sus nombres", () => {
  const r = nombresAtis([v("EGLL")], our, mx);
  assert.deepEqual(r.nombres.MMGL, mx.MMGL);
  assert.equal(r.caracteres, "Aeropuerto Internacional de Guadalajara".length + 1 + "Guadalajara International Airport".length + 1 + "London Heathrow Airport".length + 1);
});

test("una abreviatura heredada del prototipo (toString) no se confunde con una palabra", () => {
  assert.deepEqual(nombresAtis([v("KZZZ", "toString Intl")], our).nombres.KZZZ, { en: "toString International" });
});

test("aEspanol: acentos, internacional, aeropuerto, base aérea y nombre suelto", () => {
  assert.equal(aEspanol("José María Córdova International Airport"), "Aeropuerto Internacional José María Córdova");
  assert.equal(aEspanol("Felipe Ángeles International Airport"), "Aeropuerto Internacional Felipe Ángeles");
  assert.equal(aEspanol("Mundo Maya International"), "Aeropuerto Internacional Mundo Maya");
  assert.equal(aEspanol("Enrique Olaya Herrera Airport"), "Aeropuerto Enrique Olaya Herrera");
  assert.equal(aEspanol("Valle de La Pascua Airport"), "Aeropuerto Valle de La Pascua");
  assert.equal(aEspanol("El Libertador Airbase"), "Base Aérea El Libertador");
  assert.equal(aEspanol("Augusto Vergara"), "Aeropuerto Augusto Vergara");
  assert.equal(aEspanol("Óscar Álvarez Air Base"), "Base Aérea Óscar Álvarez");
  assert.equal(aEspanol("Aeropuerto Internacional de Foo"), "Aeropuerto Internacional de Foo");
  assert.deepEqual(nombresAtis([v("MPPA", "Howard AFB")], our).nombres.MPPA, { es: "Base Aérea Howard", en: "Howard Air Force Base" });
});
