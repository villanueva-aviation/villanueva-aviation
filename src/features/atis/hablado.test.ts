import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { leerDatis, type EntradaDatis } from "./datis.ts";
import { CONTRACCIONES, hablado } from "./hablado.ts";

const muestra: EntradaDatis[] = JSON.parse(
  readFileSync(new URL("./datis.muestra.json", import.meta.url), "utf8"),
);

test("hablado: pistas, contracciones y calles", () => {
  assert.equal(hablado("RY 31L PAPI OTS."), "Runway three one left PAPI out of service.");
  assert.equal(hablado("RWY 4R, 22L CLSD."), "Runway four right, two two left closed.");
  assert.equal(hablado("BIRD ACTIVITY VICINITY ARPT."), "Bird activity vicinity airport.");
  assert.equal(hablado("TWY B CLSD BTN TWY A AND TWY C."), "Taxiway Bravo closed between taxiway Alpha and taxiway Charlie.");
  assert.equal(hablado("CTC L A GC ON 121.75 FOR PUSH."), "Contact L A ground control on one two one point seven five for push.");
  assert.equal(hablado("APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L."), "Approach in use I L S runway three one right, visual approach runway three one left.");
  assert.equal(hablado("-SN"), "Light snow.");
});
test("hablado: puntuación suelta, alturas, N/S/E/W y números", () => {
  assert.equal(hablado("DEPG RWY 3R ;."), "Departing runway three right.");
  assert.equal(hablado("N OF ARPT, RNAV RWY 9 3000 FT."), "North of airport, R NAV runway nine three thousand feet.");
  assert.equal(hablado("TWY S CLSD."), "Taxiway Sierra closed.");
  assert.equal(hablado("RNAV X 33L, DEP 24L."), "R NAV X three three left, departure two four left.");
});
test("hablado: en las 89 entradas de la muestra no queda ninguna contracción de la lista", () => {
  for (const e of muestra) for (const o of leerDatis(e).resto) {
    const fuera = hablado(o).split(/[\s,.]+/).filter((w) => w.toUpperCase() in CONTRACCIONES && w === w.toUpperCase());
    assert.deepEqual(fuera, [], `${e.airport}: ${o}`);
  }
});
test("hablado: THSD y HND son miles y cientos", () => {
  assert.equal(hablado("RWY 28C ARR PLAN TO H/S OF TWY Z, 9 THSD 6 HND TEN FT AVBL."), "Runway two eight center arrival plan to H S of taxiway Zulu, nine thousand six hundred ten feet available.");
});
