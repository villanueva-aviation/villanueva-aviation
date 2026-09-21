// Publica el "reto de la semana" en #capturas. Node 20+, sin dependencias.
// Uso: DISCORD_WEBHOOK_RETO=<url> node automation/discord/reto.mjs   (sin variable = solo imprime)
import { readFileSync } from "node:fs";

const retos = JSON.parse(readFileSync(new URL("./retos.json", import.meta.url), "utf8"));
const SITIO = "https://villanueva-aviation.pages.dev";

// Un reto por semana, en orden; al acabar la lista vuelve a empezar.
const semana = Math.floor(Date.now() / (7 * 86_400_000));
const r = retos[semana % retos.length];

const content = [
  `✈️ **Reto de la semana · ${r.titulo}**`,
  r.texto,
  r.extra && r.extra.replaceAll("{SITIO}", SITIO),
  "📸 Publica tu captura en este canal con #retosemanal. El lunes siguiente sale un reto nuevo.",
].filter(Boolean).join("\n\n");

const url = process.env.DISCORD_WEBHOOK_RETO;
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
console.log("Publicado:", r.titulo);
