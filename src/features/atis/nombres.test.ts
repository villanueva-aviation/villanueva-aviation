import { test } from "node:test";
import assert from "node:assert/strict";
import { nombresAtis } from "./nombres.ts";

const our = [
  { ident: "SAEZ", name: "Ministro Pistarini International Airport", municipality: "Buenos Aires", iso_country: "AR" },
  { ident: "SABE", name: "Jorge Newbery Airpark", municipality: "Buenos Aires", iso_country: "AR" },
  { ident: "SKRG", name: "José María Córdova International Airport", municipality: "Rionegro", iso_country: "CO" },
  { ident: "MMGL", name: "Don Miguel Hidalgo y Costilla Guadalajara International Airport", municipality: "Guadalajara", iso_country: "MX" },
  { ident: "EGLL", name: "London Heathrow Airport", municipality: "London", iso_country: "GB" },
];
const mx = { MMGL: { es: "Aeropuerto Internacional de Guadalajara", en: "Guadalajara International Airport" } };
const v = (icao: string, nombre = "x") => ({ icao, nombre });

test("latam: la ciudad compartida usa el nombre de OurAirports; sola, la regla de la ciudad", () => {
  const { nombres } = nombresAtis([v("SAEZ"), v("SABE"), v("SKRG")], our);
  assert.deepEqual(nombres.SAEZ, { es: "Ministro Pistarini International Airport", en: "Ministro Pistarini International Airport" });
  assert.deepEqual(nombres.SABE, { es: "Jorge Newbery Airpark", en: "Jorge Newbery Airpark" });
  assert.deepEqual(nombres.SKRG, { es: "Aeropuerto Internacional de Rionegro", en: "Rionegro International Airport" });
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
  assert.deepEqual(nombresAtis([v("SAZZ", "Bar Rgnl")], our).nombres.SAZZ, { es: "Bar Regional", en: "Bar Regional" });
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
