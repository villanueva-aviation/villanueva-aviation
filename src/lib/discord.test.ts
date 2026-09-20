import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../../functions/api/discord.ts";
import { firmaValida } from "./discordFirma.ts";
import { embedMetar, embedTaf } from "./climaTexto.ts";
import type { Metar, Taf } from "./clima.ts";

// Datos reales de aviationweather.gov (MMGL) recortados.
const METAR: Metar = {
  icaoId: "MMGL", name: "Guadalajara Arpt, GT, MX", obsTime: 1789944120, temp: 28, dewp: 16, wdir: 120, wspd: 3,
  visib: 8, altim: 1018.7, elev: 1531, fltCat: "VFR",
  rawOb: "METAR MMGL 202242Z 12003KT 8SM FEW020CB SCT080 SCT300 28/16 A3008 RMK 8/363 CB/NE/NW",
  clouds: [{ cover: "FEW", base: 2000 }, { cover: "SCT", base: 8000 }, { cover: "SCT", base: 30000 }],
};
const TAF: Taf = {
  icaoId: "MMGL", name: "Guadalajara Arpt", validTimeFrom: 1789948800, validTimeTo: 1790035200,
  rawTAF: "TAF MMGL 202259Z 2100/2200 25010KT P6SM BKN020CB TEMPO 2100/2104 4SM TSRA BKN015CB",
  fcsts: [
    { timeFrom: 1789948800, timeTo: 1789970400, fcstChange: null, wdir: 250, wspd: 10, visib: "6+", wxString: null, clouds: [{ cover: "BKN", base: 2000, type: "CB" }] },
    { timeFrom: 1789948800, timeTo: 1789963200, fcstChange: "TEMPO", wdir: null, wspd: null, visib: 4, wxString: "TSRA", clouds: [{ cover: "BKN", base: 1500, type: "CB" }] },
  ],
};

// Un par de claves Ed25519 de prueba, y una petición firmada como lo hace Discord.
const par = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]) as CryptoKeyPair;
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const CLAVE_PUBLICA = hex(await crypto.subtle.exportKey("raw", par.publicKey));

async function firmar(cuerpo: string, ts = String(Math.floor(Date.now() / 1000))) {
  const firma = await crypto.subtle.sign("Ed25519", par.privateKey, new TextEncoder().encode(ts + cuerpo));
  return { "x-signature-ed25519": hex(firma), "x-signature-timestamp": ts };
}

async function llamar(interaccion: unknown, encabezados?: Record<string, string>) {
  const cuerpo = JSON.stringify(interaccion);
  const request = new Request("https://ejemplo.test/api/discord", {
    method: "POST", body: cuerpo, headers: encabezados ?? (await firmar(cuerpo)),
  });
  return onRequestPost({ request, env: { DISCORD_PUBLIC_KEY: CLAVE_PUBLICA } });
}

function simularClima(metar: unknown, taf: unknown) {
  globalThis.fetch = (async (url: string | URL | Request) => {
    const u = String(url);
    const datos = u.includes("/metar") ? metar : taf;
    return datos === null ? new Response(null, { status: 204 }) : new Response(JSON.stringify([datos]));
  }) as typeof fetch;
}

test("firma: acepta la válida y rechaza cuerpo alterado, firma ajena y timestamp viejo", async () => {
  const cuerpo = '{"type":1}';
  const h = await firmar(cuerpo);
  assert.equal(await firmaValida(cuerpo, h["x-signature-ed25519"], h["x-signature-timestamp"], CLAVE_PUBLICA), true);
  assert.equal(await firmaValida('{"type":2}', h["x-signature-ed25519"], h["x-signature-timestamp"], CLAVE_PUBLICA), false);
  assert.equal(await firmaValida(cuerpo, "0".repeat(128), h["x-signature-timestamp"], CLAVE_PUBLICA), false);
  const vieja = await firmar(cuerpo, String(Math.floor(Date.now() / 1000) - 3600));
  assert.equal(await firmaValida(cuerpo, vieja["x-signature-ed25519"], vieja["x-signature-timestamp"], CLAVE_PUBLICA), false);
});

test("endpoint: sin firma válida responde 401; PING responde PONG", async () => {
  assert.equal((await llamar({ type: 1 }, { "x-signature-ed25519": "0".repeat(128), "x-signature-timestamp": "1" })).status, 401);
  const r = await llamar({ type: 1 });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { type: 1 });
});

test("/metar devuelve un embed decodificado con viento en la pista", async () => {
  simularClima(METAR, TAF);
  const r = await llamar({ type: 2, data: { name: "metar", options: [{ name: "icao", value: "mmgl" }, { name: "pista", value: 28 }] } });
  const { type, data } = await r.json();
  assert.equal(type, 4);
  const e = data.embeds[0];
  assert.match(e.title, /METAR MMGL · Guadalajara Arpt/);
  assert.match(e.description, /\*\*VFR\*\*/);
  const nombres = e.fields.map((f: { name: string }) => f.name);
  assert.ok(nombres.includes("Altitud de densidad") && nombres.includes("Viento en la pista 28"));
});

test("/taf devuelve un embed con un campo por periodo", async () => {
  simularClima(METAR, TAF);
  const r = await llamar({ type: 2, data: { name: "taf", options: [{ name: "icao", value: "MMGL" }] } });
  const e = (await r.json()).data.embeds[0];
  assert.equal(e.fields.length, 2);
  assert.match(e.fields[1].name, /Temporal/);
  assert.match(e.fields[1].value, /Tormenta con lluvia/);
});

test("errores: código inválido y estación sin reporte son mensajes efímeros", async () => {
  simularClima(null, null);
  const malo = await (await llamar({ type: 2, data: { name: "metar", options: [{ name: "icao", value: "../x" }] } })).json();
  assert.equal(malo.data.flags, 64);
  const vacio = await (await llamar({ type: 2, data: { name: "metar", options: [{ name: "icao", value: "ZZZZ" }] } })).json();
  assert.equal(vacio.data.flags, 64);
  assert.match(vacio.data.content, /No hay METAR/);
});

test("límites de Discord: los embeds respetan los tamaños máximos", () => {
  const largo: Taf = { ...TAF, fcsts: Array.from({ length: 30 }, () => TAF.fcsts[0]) };
  for (const e of [embedMetar(METAR, 28), embedTaf(largo, "x")]) {
    assert.ok(e.title.length <= 256 && e.description.length <= 4096);
    assert.ok(e.fields.length <= 25);
    for (const f of e.fields) assert.ok(f.name.length <= 256 && f.value.length <= 1024);
  }
});
