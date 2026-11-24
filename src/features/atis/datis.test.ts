import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { datisPara, emitidoMs, huella, leerDatis, vigenteDatis, type EntradaDatis } from "./datis.ts";

const muestra: EntradaDatis[] = JSON.parse(
  readFileSync(new URL("./datis.muestra.json", import.meta.url), "utf8"),
);
const deLaMuestra = (airport: string, type: string) => {
  const e = muestra.find((x) => x.airport === airport && x.type === type);
  assert.ok(e, `${airport} ${type} no está en la muestra`);
  return e;
};

const KJFK: EntradaDatis = { airport: "KJFK", type: "combined", code: "H", time: "0451", updatedAt: "2026-11-24T05:26:29Z",
  datis: "JFK ATIS INFO H 0451Z. 35011G22KT 10SM BKN095 BKN120 11/M01 A3008 (THREE ZERO ZERO EIGHT). APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L. DEPG RY 31L. NOTAMS, . RWY 4R, 22L CLSD. RY 31L PAPI OTS. NUM CRANES OPERATING AT JFK. BIRD ACTIVITY VICINITY ARPT. READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS. ...ADVS YOU HAVE INFO H." };

test("leerDatis: encabezado, METAR y resto de KJFK", () => {
  const l = leerDatis(KJFK);
  assert.equal(l.letra, "H"); assert.equal(l.hora, "0451"); assert.equal(l.especial, false);
  assert.equal(l.metar, "35011G22KT 10SM BKN095 BKN120 11/M01 A3008");
  assert.equal(l.rmk, null);
  assert.deepEqual(l.resto, ["APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L.", "DEPG RY 31L.", "NOTAMS.", "RWY 4R, 22L CLSD.",
    "RY 31L PAPI OTS.", "NUM CRANES OPERATING AT JFK.", "BIRD ACTIVITY VICINITY ARPT.", "READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS."]);
});

test("leerDatis: RMK aparte y encabezado SPECIAL", () => {
  const lax = leerDatis(deLaMuestra("KLAX", "combined"));
  assert.equal(lax.metar, "32003KT 10SM SCT250 17/11 A3016");
  assert.equal(lax.rmk, "AO2 SLP213 T01720106");
  assert.equal(lax.especial, false);
  const dtw = leerDatis(deLaMuestra("KDTW", "dep"));
  assert.equal(dtw.especial, true);
  assert.equal(dtw.letra, "R");
  assert.equal(dtw.metar, "32007KT 10SM SCT022 00/M04 A3037");
  assert.equal(dtw.rmk, "AO2 T00001039");
  assert.equal(dtw.resto[0], "DEPG RWY 3R ;.");
});

test("leerDatis: las 89 entradas de la muestra tienen letra igual a code, hora igual a time y METAR con altímetro", () => {
  assert.equal(muestra.length, 89);
  for (const e of muestra) { const l = leerDatis(e); assert.equal(l.letra, e.code); assert.equal(l.hora, e.time); assert.match(l.metar ?? "", /\bA\d{4}$/); }
});

test("leerDatis: sin encabezado ni altímetro usa code/time y todo va a resto", () => {
  const l = leerDatis({ ...KJFK, datis: "TEXTO LIBRE. OTRA COSA. ...ADVS YOU HAVE INFO H." });
  assert.equal(l.letra, "H"); assert.equal(l.hora, "0451"); assert.equal(l.metar, null);
  assert.deepEqual(l.resto, ["TEXTO LIBRE.", "OTRA COSA."]);
});

test("vigenteDatis: 89 min sí, 91 no; 2350 emitido visto a las 0010 del día siguiente vale", () => {
  const e = { ...KJFK, time: "0451" };
  const base = Date.UTC(2026, 10, 24, 4, 51);
  assert.equal(vigenteDatis(e, base + 89 * 60_000), true);
  assert.equal(vigenteDatis(e, base + 91 * 60_000), false);
  assert.equal(vigenteDatis(e, base + 90 * 60_000), false);
  assert.equal(vigenteDatis(e, base + 90 * 60_000 - 1000), true);
  assert.equal(vigenteDatis(e, base - 2 * 60_000), true); // emitido 2 min "en el futuro"
  const noche = { ...KJFK, time: "2350" };
  const visto = Date.UTC(2026, 10, 25, 0, 10);
  assert.equal(emitidoMs("2350", visto), Date.UTC(2026, 10, 24, 23, 50));
  assert.equal(vigenteDatis(noche, visto), true);
});

test("datisPara: combined gana; DEP en el nombre da dep; otro nombre o null da arr", () => {
  const arr = { ...KJFK, type: "arr" as const }, dep = { ...KJFK, type: "dep" as const }, comb = KJFK;
  assert.equal(datisPara([arr, dep, comb], "X DEP"), comb);
  assert.equal(datisPara([arr, dep], "DTW_DEP_ATIS"), dep);
  assert.equal(datisPara([arr, dep], "DTW_ATIS"), arr);
  assert.equal(datisPara([arr, dep], null), arr);
  assert.equal(datisPara([], null), null);
});

test("huella: estable y distinta con un carácter de diferencia", () => {
  assert.equal(huella("ABC"), huella("ABC")); assert.notEqual(huella("ABC"), huella("ABD")); assert.match(huella("x"), /^[0-9a-f]{8}$/);
});
