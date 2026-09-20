// Comandos de barra de Discord (/metar y /taf), atendidos por Interactions Endpoint URL:
// Discord llama a esta dirección en cada comando, así que no hace falta un bot encendido 24/7.
import { firmaValida } from "../../src/lib/discordFirma.ts";
import { embedMetar, embedTaf } from "../../src/lib/climaTexto.ts";
import type { Metar, Taf } from "../../src/lib/clima.ts";

interface Env {
  DISCORD_PUBLIC_KEY?: string;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json; charset=utf-8" } });

// Solo lo ve quien escribió el comando (flags 64): para errores, no llenan el canal.
const efimero = (contenido: string) => json({ type: 4, data: { content: contenido, flags: 64 } });

async function consultar<T>(tipo: "metar" | "taf", icao: string): Promise<T | null> {
  const r = await fetch(`https://aviationweather.gov/api/data/${tipo}?ids=${icao}&format=json`, {
    headers: { "user-agent": "VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)" },
  });
  if (r.status === 204) return null;
  if (!r.ok) throw new Error("servicio");
  const datos = await r.json();
  return Array.isArray(datos) ? ((datos[0] as T) ?? null) : null;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.DISCORD_PUBLIC_KEY) return new Response("Falta DISCORD_PUBLIC_KEY", { status: 500 });

  const cuerpo = await request.text();
  const firmada = await firmaValida(
    cuerpo,
    request.headers.get("x-signature-ed25519"),
    request.headers.get("x-signature-timestamp"),
    env.DISCORD_PUBLIC_KEY,
  );
  if (!firmada) return new Response("Firma inválida", { status: 401 });

  let i: { type: number; data?: { name?: string; options?: { name: string; value: unknown }[] } };
  try {
    i = JSON.parse(cuerpo);
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  if (i.type === 1) return json({ type: 1 }); // PING: así Discord valida la dirección
  if (i.type !== 2) return efimero("Ese tipo de interacción no está soportado.");

  const opciones = Object.fromEntries((i.data?.options ?? []).map((o) => [o.name, o.value]));
  const icao = String(opciones.icao ?? "").toUpperCase();
  const pista = Number(opciones.pista);
  if (!/^[A-Z0-9]{4}$/.test(icao)) return efimero("El código OACI tiene 4 letras, por ejemplo `MMGL` (Guadalajara).");

  try {
    if (i.data?.name === "metar") {
      const m = await consultar<Metar>("metar", icao);
      if (!m) return efimero(`No hay METAR reciente para \`${icao}\`. Revisa el código o prueba con \`/taf\`.`);
      return json({ type: 4, data: { embeds: [embedMetar(m, pista >= 1 && pista <= 36 ? pista : null)] } });
    }
    if (i.data?.name === "taf") {
      const t = await consultar<Taf>("taf", icao);
      if (!t) return efimero(`No hay TAF para \`${icao}\`. Algunos aeropuertos no publican pronóstico.`);
      return json({ type: 4, data: { embeds: [embedTaf(t, t.name)] } });
    }
  } catch {
    return efimero("No pude consultar el servicio del clima. Inténtalo de nuevo en un momento.");
  }
  return efimero("Comando desconocido.");
};
