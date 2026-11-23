import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../../../functions/api/atis/red.ts";

const pedir = (q: string) => onRequestGet({ request: new Request("https://x/api/atis/red?" + q) });

test("función de la red: ICAO con cifras pasa; lat/lon en blanco o ICAO raro dan 400", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ clients: { atcs: [] } }))) as typeof fetch;
  try {
    assert.equal((await pedir("icao=IL48&red=ivao&lat=40.1&lon=-88.2")).status, 200);
    assert.equal((await pedir("icao=00A&red=ivao&lat=40.1&lon=-88.2")).status, 200);
    assert.equal((await pedir("icao=MMGL&red=ivao&lat=%20&lon=-103.3")).status, 400);
    assert.equal((await pedir("icao=MMGL&red=ivao&lat=20.5&lon=%20%20")).status, 400);
    assert.equal((await pedir("icao=MM_GL&red=ivao&lat=20.5&lon=-103.3")).status, 400);
  } finally {
    globalThis.fetch = real;
  }
});
