// Publica el "dato del día" (+ METAR de MMGL) en Discord. Node 20+, sin dependencias.
// Uso: DISCORD_WEBHOOK=<url> node automation/discord/post.mjs   (sin variable = solo imprime)
import { readFileSync } from "node:fs";

const datos = JSON.parse(readFileSync(new URL("./datos.json", import.meta.url), "utf8"));
const SITIO = "https://villanueva-aviation.pages.dev";
const ICAO = "MMGL";

// Un dato por día, en orden; al acabar la lista vuelve a empezar.
const dia = Math.floor(Date.now() / 86_400_000);
const dato = datos[dia % datos.length];

let metar = "";
try {
  const r = await fetch(`https://aviationweather.gov/api/data/metar?ids=${ICAO}&format=raw`);
  if (r.ok) metar = (await r.text()).trim();
} catch {} // ponytail: si falla el METAR, se publica solo el dato

const lunes = new Date().getUTCDay() === 1;
const partes = [
  `💡 **Dato del día · ${dato.tema}**`,
  dato.texto,
  metar && `📡 **METAR ${ICAO} ahora:** \`${metar}\`\n¿Sabes leerlo? Practica en ${SITIO}/academia`,
  lunes && `📅 **Nueva semana:** sigue tu formación en ${SITIO}/academia`,
].filter(Boolean);
const content = partes.join("\n\n");

const url = process.env.DISCORD_WEBHOOK;
if (!url) {
  console.log(content);
  process.exit(0);
}
const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
});
if (!res.ok) {
  console.error("Discord respondió", res.status);
  process.exit(1);
}
console.log("Publicado:", dato.tema);
