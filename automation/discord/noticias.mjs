// Publica titulares de aviación (solo título + enlace, sin copiar el texto) en Discord.
// Uso: DISCORD_WEBHOOK_NOTICIAS=<url> node automation/discord/noticias.mjs   (sin variable = solo imprime)
const FUENTES = [
  { nombre: "Aviacionline", url: "https://www.aviacionline.com/rss.xml", max: 2, solo: "/espanol/" },
  { nombre: "AVweb", url: "https://www.avweb.com/feed/", max: 1 },
];
const VENTANA_H = 24; // igual al intervalo del cron: sin traslape no hay repetidos (ponytail: un retraso del cron puede omitir una nota)
const OMITIR = /violad|abuso|sexual|asesin|suicid|\brape|\bkill|murder/i; // titulares sensibles no van al canal

const decodificar = (s) =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .trim();
const campo = (bloque, tag) => decodificar(bloque.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? "");

const lineas = [];
for (const f of FUENTES) {
  try {
    const res = await fetch(f.url, { headers: { "user-agent": "Mozilla/5.0 VillanuevaAviationBot" } });
    if (!res.ok) continue;
    const items = (await res.text()).split("<item").slice(1);
    const nuevos = items
      .map((b) => ({ titulo: campo(b, "title"), link: campo(b, "link"), fecha: new Date(campo(b, "pubDate")) }))
      .filter((n) => n.titulo && n.link && (Date.now() - n.fecha) / 36e5 <= VENTANA_H)
      .filter((n) => !f.solo || n.link.includes(f.solo))
      .filter((n) => !OMITIR.test(n.titulo))
      .slice(0, f.max);
    for (const n of nuevos) lineas.push(`📰 **${n.titulo}** · ${f.nombre}\n<${n.link}>`);
  } catch {} // ponytail: una fuente caída no detiene a las demás
}

if (!lineas.length) {
  console.log("Sin noticias nuevas.");
  process.exit(0);
}
const content = lineas.join("\n\n");
const url = process.env.DISCORD_WEBHOOK_NOTICIAS;
if (!url) {
  console.log(content);
  process.exit(0);
}
const r = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
});
if (!r.ok) {
  console.error("Discord respondió", r.status);
  process.exit(1);
}
console.log("Publicadas:", lineas.length);
