// Voz en vivo (Azure) de UNA parte del D-ATIS real. Solo convierte texto que ella misma sacó del D-ATIS:
// el hash h debe coincidir con el del texto, si no responde 404 (no es un TTS abierto).
import { armarDatis, vivosDe, type EntradaDatis } from "../../../src/features/atis/datis.ts";
import { bajarDatis } from "../../../src/features/atis/fuenteDatis.ts";

type Env = { AZURE_SPEECH_KEY?: string; AZURE_SPEECH_REGION?: string };
type Deps = {
  bajar: () => Promise<EntradaDatis[]>;
  sintetizar: (texto: string, env: Env) => Promise<ArrayBuffer>;
  cache: { match(k: string): Promise<Response | undefined>; put(k: string, r: Response): Promise<void> };
};

const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const sintetizar = async (texto: string, env: Env): Promise<ArrayBuffer> => {
  const ssml = `<speak version="1.0" xml:lang="en-US"><voice name="en-US-ChristopherNeural"><prosody rate="-8%">${escapar(texto)}</prosody></voice></speak>`;
  const r = await fetch(`https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY!,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });
  if (!r.ok) throw new Error(`Azure ${r.status}`);
  const audio = await r.arrayBuffer();
  if (!audio.byteLength) throw new Error("Azure devolvió un cuerpo vacío");
  return audio;
};

const texto = (cuerpo: string, status: number) => new Response(cuerpo, { status, headers: { "content-type": "text/plain; charset=utf-8" } });

export async function responderVoz(q: URLSearchParams, env: Env, deps: Deps): Promise<Response> {
  const icao = (q.get("icao") ?? "").toUpperCase();
  const tipo = q.get("tipo") ?? "";
  const nTxt = q.get("n") ?? "";
  const h = q.get("h") ?? "";
  if (!/^[A-Z0-9]{3,4}$/.test(icao) || !["combined", "arr", "dep"].includes(tipo) || !/^\d+$/.test(nTxt) || !/^[0-9a-f]{8}$/.test(h)) return texto("Solicitud inválida", 400);
  const n = Number(nTxt);

  const llave = `https://cache.local/atis-voz/${icao}/${tipo}/${h}`;
  const guardada = await deps.cache.match(llave);
  if (guardada) return guardada;

  let vivo;
  try {
    const entrada = (await deps.bajar()).find((e) => e.airport === icao && e.type === tipo);
    vivo = entrada && vivosDe(armarDatis(entrada, null, Date.now()))[n];
  } catch {
    return texto("D-ATIS no disponible", 502);
  }
  if (!vivo || vivo.h !== h) return texto("No encontrado", 404);
  if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) return texto("Voz no disponible", 503);

  let audio: ArrayBuffer;
  // El motivo (p. ej. «Azure 401») ayuda a diagnosticar desde afuera; nunca lleva la clave.
  try { audio = await deps.sintetizar(vivo.texto, env); } catch (e) {
    return texto(`Voz no disponible (${e instanceof Error ? e.message : "error"})`, 503);
  }
  const r = new Response(audio, { headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=10800" } });
  // El audio ya se pagó: si la caché falla, se devuelve igual (un 500 haría que la página lo pague otra vez).
  try { await deps.cache.put(llave, r.clone()); } catch { /* sin caché esta vez */ }
  return r;
}

export const onRequestGet = ({ request, env }: { request: Request; env: Env }) =>
  responderVoz(new URL(request.url).searchParams, env, {
    bajar: bajarDatis,
    sintetizar,
    // caches.default es global de Cloudflare; sin los tipos de Workers se declara a mano.
    cache: (globalThis as unknown as { caches: { default: Deps["cache"] } }).caches.default,
  });
