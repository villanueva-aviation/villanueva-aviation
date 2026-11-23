// Uso: node --experimental-strip-types tools/atis-piezas/generar.ts --proveedor azure|edge [--solo <clave>] [--forzar]
// edge necesita EDGE_TTS (ruta al ejecutable edge-tts); azure necesita AZURE_SPEECH_KEY y AZURE_SPEECH_REGION.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { promisify } from "node:util";
import { textoDePieza, todasLasPiezas, type Idioma } from "../../src/features/atis/frases.ts";
import type { AeropuertoAtis, Nombres } from "../../src/features/atis/datos.ts";

const ejecutar = promisify(execFile);
const VOCES: Record<Idioma, { voz: string; lang: string }> = {
  es: { voz: "es-MX-JorgeNeural", lang: "es-MX" },
  en: { voz: "en-US-ChristopherNeural", lang: "en-US" },
};

const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const proveedor = arg("proveedor");
const solo = arg("solo");
const forzar = process.argv.includes("--forzar");
if (proveedor !== "azure" && proveedor !== "edge") { console.error("Falta --proveedor azure|edge"); process.exit(1); }

const { AZURE_SPEECH_KEY: llave, AZURE_SPEECH_REGION: region, EDGE_TTS: edge } = process.env;
if (proveedor === "azure" && (!llave || !region)) { console.error("Faltan las variables AZURE_SPEECH_KEY y AZURE_SPEECH_REGION."); process.exit(1); }
if (proveedor === "edge" && !edge) { console.error("Falta la variable EDGE_TTS con la ruta a edge-tts."); process.exit(1); }

const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

async function sintetizar(idioma: Idioma, texto: string, archivo: string) {
  const { voz, lang } = VOCES[idioma];
  if (proveedor === "edge") {
    await ejecutar(edge!, ["--voice", voz, "--rate=-8%", "--text", texto, "--write-media", archivo]);
    return;
  }
  const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${voz}"><prosody rate="-8%">${escapar(texto)}</prosody></voice></speak>`;
  let r: Response;
  // El nivel gratis (F0) permite ~20 peticiones por minuto: ante 429 se espera y se reintenta.
  for (let intento = 1; ; intento++) {
    r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": llave!,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      },
      body: ssml,
    });
    if (r.status !== 429 || intento === 8) break;
    const seg = Number(r.headers.get("retry-after")) || 15;
    console.log(`Azure pide esperar ${seg} s…`);
    await new Promise((listo) => setTimeout(listo, seg * 1000));
  }
  if (!r.ok) throw new Error(`Azure ${r.status}: ${await r.text()}`);
  const audio = Buffer.from(await r.arrayBuffer());
  if (!audio.length) throw new Error("Azure devolvió un cuerpo vacío");
  writeFileSync(archivo, audio);
}

// nombres.json (mundo) si existe; si no, los nombres de MX.json, con las mismas claves de siempre.
const leer = (r: string) => JSON.parse(readFileSync(r, "utf8"));
const nombres: Nombres = existsSync("public/data/atis/nombres.json")
  ? leer("public/data/atis/nombres.json")
  : Object.fromEntries((leer("public/data/atis/MX.json") as AeropuertoAtis[]).map((a) => [a.icao, { es: a.nombreEs ?? undefined, en: a.nombreEn! }]));
const aeropuertos: AeropuertoAtis[] = Object.entries(nombres).map(([icao, n]) =>
  ({ icao, nombreEs: n.es ?? null, nombreEn: n.en, nombreSim: n.en, lat: 0, lon: 0, elevFt: 0, atisMhz: [], pistas: [] }));
const piezas = todasLasPiezas(nombres).filter((p) => !solo || p.clave === solo);
let hechas = 0, saltadas = 0, fallidas = 0;
for (const p of piezas) {
  const texto = textoDePieza(p, aeropuertos);
  if (texto === null) { console.error(`Sin texto: ${p.idioma}/${p.clave}`); fallidas++; continue; }
  mkdirSync(`public/atis/piezas/${p.idioma}`, { recursive: true });
  const archivo = `public/atis/piezas/${p.idioma}/${p.clave}.mp3`;
  if (!forzar && existsSync(archivo) && statSync(archivo).size > 0) { saltadas++; continue; }
  // Se escribe a un .tmp y se renombra al terminar, para no dejar archivos truncados que la próxima corrida salte.
  const tmp = archivo + ".tmp";
  try {
    await sintetizar(p.idioma, texto, tmp);
    if (statSync(tmp).size === 0) throw new Error("archivo vacío");
    renameSync(tmp, archivo); hechas++;
  } catch (e) { rmSync(tmp, { force: true }); fallidas++; console.error(`Falló ${p.idioma}/${p.clave}: ${(e as Error).message.split("\n")[0]}`); }
}
console.log(`Piezas: ${piezas.length} | hechas ${hechas}, saltadas ${saltadas}, fallidas ${fallidas}`);
if (fallidas) process.exit(1);
