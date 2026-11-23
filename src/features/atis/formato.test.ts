import { test } from "node:test";
import assert from "node:assert/strict";
import { formatoDe } from "./formato.ts";

test("formatoDe por prefijo OACI", () => {
  assert.equal(formatoDe("MMGL"), "mx");
  for (const i of ["SKRG", "SAEZ", "MROC", "SKXX"]) assert.equal(formatoDe(i), "latam", i);
  for (const i of ["KLAX", "PANC", "PHNL", "TJSJ"]) assert.equal(formatoDe(i), "faa", i);
  for (const i of ["EGLL", "LEMD", "SBGR", "CYVR", "PKMJ"]) assert.equal(formatoDe(i), "oaci", i);
});
