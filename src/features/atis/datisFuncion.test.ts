import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { armarDatis, vivosDe, type EntradaDatis } from "./datis.ts";
import { onRequestGet as real } from "../../../functions/api/atis/real.ts";
import { responderVoz } from "../../../functions/api/atis/voz.ts";
import { bajarDatis } from "./fuenteDatis.ts";

const muestra: EntradaDatis[] = JSON.parse(readFileSync(new URL("./datis.muestra.json", import.meta.url), "utf8"));
const kjfk = muestra.find((e) => e.airport === "KJFK")!;
const vivos = vivosDe(armarDatis(kjfk, null, Date.now()));
const ENV = { AZURE_SPEECH_KEY: "k", AZURE_SPEECH_REGION: "r" };

const pedirReal = async (icao: string, fuente: () => Response) => {
  const f = globalThis.fetch;
  globalThis.fetch = (async () => fuente()) as typeof fetch;
  try { return await real({ request: new Request("https://x/api/atis/real?icao=" + icao) }); } finally { globalThis.fetch = f; }
};

test("real: ICAO raro 400; KJFK una entrada; sin D-ATIS []; fuente caída 502", async () => {
  const ok = () => new Response(JSON.stringify(muestra));
  assert.equal((await pedirReal("K_FK", ok)).status, 400);
  const r = await pedirReal("kjfk", ok);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("cache-control"), "public, max-age=60");
  assert.equal((await r.json() as unknown[]).length, 1);
  assert.deepEqual(await (await pedirReal("MMGL", ok)).json(), []);
  assert.equal((await pedirReal("KJFK", () => new Response("x", { status: 500 }))).status, 502);
});

const armar = () => {
  const almacen = new Map<string, Response>();
  let llamadas = 0; const textos: string[] = [];
  const deps = {
    bajar: async () => muestra,
    sintetizar: async (t: string) => { llamadas++; textos.push(t); return new Uint8Array([1, 2, 3]).buffer; },
    cache: { match: async (k: string) => almacen.get(k)?.clone(), put: async (k: string, r: Response) => { almacen.set(k, r); } },
  };
  return { deps, textos, llamadas: () => llamadas };
};
const q = (o: Record<string, string>) => new URLSearchParams({ icao: "KJFK", tipo: "combined", n: "0", h: vivos[0].h, ...o });

test("voz: n y h correctos dan audio/mpeg con el texto del D-ATIS; la segunda sale de la caché", async () => {
  const { deps, textos, llamadas } = armar();
  const r = await responderVoz(q({}), ENV, deps);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "audio/mpeg");
  assert.equal(r.headers.get("cache-control"), "public, max-age=10800");
  assert.deepEqual(textos, [vivos[0].texto]);
  assert.equal((await responderVoz(q({}), ENV, deps)).status, 200);
  assert.equal(llamadas(), 1);
});

test("voz: h ajeno o n fuera de rango 404 sin sintetizar; parámetros malos 400", async () => {
  const { deps, llamadas } = armar();
  assert.equal((await responderVoz(q({ h: "deadbeef" }), ENV, deps)).status, 404);
  assert.equal((await responderVoz(q({ n: "99" }), ENV, deps)).status, 404);
  assert.equal(llamadas(), 0);
  for (const mal of [{ tipo: "xyz" }, { n: "-1" }, { n: "x" }, { h: "ZZ" }, { icao: "K_" }]) assert.equal((await responderVoz(q(mal), ENV, deps)).status, 400);
});

test("voz: sin secretos o con Azure caído 503", async () => {
  const { deps } = armar();
  assert.equal((await responderVoz(q({}), {}, deps)).status, 503);
  const roto = { ...deps, sintetizar: async () => { throw new Error("Azure 500"); } };
  assert.equal((await responderVoz(q({}), ENV, roto)).status, 503);
});

test("voz: si la caché falla al guardar, igual devuelve el audio ya pagado", async () => {
  const { deps, llamadas } = armar();
  const r = await responderVoz(q({}), ENV, { ...deps, cache: { ...deps.cache, put: async () => { throw new Error("caché caída"); } } });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "audio/mpeg");
  assert.equal(llamadas(), 1);
});

test("bajarDatis: la consulta a atis.info lleva tiempo límite", async () => {
  const f = globalThis.fetch;
  let senal: unknown;
  globalThis.fetch = (async (_u: unknown, init?: RequestInit) => { senal = init?.signal; return new Response("[]"); }) as typeof fetch;
  try { await bajarDatis(); } finally { globalThis.fetch = f; }
  assert.ok(senal instanceof AbortSignal);
});
