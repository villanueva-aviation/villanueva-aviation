import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../../functions/api/wx/[tipo].ts";

// fetch falso: aviationweather y metar.vatsim.net nunca se llaman de verdad.
function conFetch(respuestas: Record<string, () => Response>) {
  const pedidos: string[] = [];
  globalThis.fetch = (async (url: string) => {
    pedidos.push(String(url));
    const host = new URL(String(url)).host;
    return (respuestas[host] ?? (() => { throw new Error("sin red"); }))();
  }) as typeof fetch;
  return pedidos;
}
const pedir = async (tipo: string, ids: string) =>
  onRequestGet({ params: { tipo }, request: new Request(`https://x/api/wx/${tipo}?ids=${ids}`) });

test("wx: sin METAR en aviationweather usa el de metar.vatsim.net", async () => {
  const pedidos = conFetch({
    "aviationweather.gov": () => new Response("[]"),
    "metar.vatsim.net": () => new Response("YBAF 270032Z AUTO 06012KT 9999 // SCT033 24/22 Q1021\n"),
  });
  const r = await pedir("metar", "ybaf");
  const [m] = await r.json();
  assert.equal(r.status, 200);
  assert.equal(m.icaoId, "YBAF");
  assert.equal(m.altim, 1021);
  assert.equal(pedidos[1], "https://metar.vatsim.net/YBAF");
});

test("wx: con METAR de aviationweather no pide respaldo; 204 y respaldo vacío o caído dan []", async () => {
  let pedidos = conFetch({ "aviationweather.gov": () => new Response('[{"icaoId":"YBBN"}]') });
  assert.deepEqual(await (await pedir("metar", "YBBN")).json(), [{ icaoId: "YBBN" }]);
  assert.equal(pedidos.length, 1);
  pedidos = conFetch({ "aviationweather.gov": () => new Response(null, { status: 204 }), "metar.vatsim.net": () => new Response("") });
  assert.deepEqual(await (await pedir("metar", "ZZZZ")).json(), []);
  conFetch({ "aviationweather.gov": () => new Response("[]") }); // VATSIM sin red
  assert.deepEqual(await (await pedir("metar", "ZZZZ")).json(), []);
  // Otra estación en la respuesta del respaldo no se acepta; el TAF nunca pide respaldo.
  conFetch({ "aviationweather.gov": () => new Response("[]"), "metar.vatsim.net": () => new Response("YBBN 270030Z 07012KT 9999 Q1021") });
  assert.deepEqual(await (await pedir("metar", "YBAF")).json(), []);
  pedidos = conFetch({ "aviationweather.gov": () => new Response("[]") });
  assert.deepEqual(await (await pedir("taf", "YBAF")).json(), []);
  assert.equal(pedidos.length, 1);
});

test("wx: aviationweather caído sigue siendo 502", async () => {
  conFetch({ "aviationweather.gov": () => new Response("x", { status: 500 }) });
  assert.equal((await pedir("metar", "YBAF")).status, 502);
});
