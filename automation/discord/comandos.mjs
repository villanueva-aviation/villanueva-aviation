// Registra los comandos de barra /metar y /taf en el servidor de Discord (una sola vez, o al cambiarlos).
// Uso (en tu propia terminal, con tus datos; nunca los pegues en un chat):
//   DISCORD_APP_ID=<id de la aplicación> DISCORD_BOT_TOKEN=<token del bot> node automation/discord/comandos.mjs
// Opcional: DISCORD_GUILD_ID (por defecto el servidor de Villanueva Aviation).
const { DISCORD_APP_ID, DISCORD_BOT_TOKEN } = process.env;
const GUILD = process.env.DISCORD_GUILD_ID ?? "1536556089837883453";

if (!DISCORD_APP_ID || !DISCORD_BOT_TOKEN) {
  console.error("Faltan DISCORD_APP_ID y/o DISCORD_BOT_TOKEN (ver el comentario de arriba).");
  process.exit(1);
}

const icao = { type: 3, name: "icao", description: "Código OACI de 4 letras (ej. MMGL)", required: true, min_length: 4, max_length: 4 };
const comandos = [
  {
    name: "metar",
    description: "Reporte del tiempo actual (METAR) decodificado en español",
    options: [icao, { type: 4, name: "pista", description: "Número de pista en uso, para calcular el viento cruzado (ej. 28)", min_value: 1, max_value: 36 }],
  },
  { name: "taf", description: "Pronóstico (TAF) de un aeropuerto, por periodos", options: [icao] },
];

// PUT sustituye la lista completa: lo que no esté aquí se elimina. Los comandos de servidor aparecen al instante.
const r = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_ID}/guilds/${GUILD}/commands`, {
  method: "PUT",
  headers: { "content-type": "application/json", authorization: `Bot ${DISCORD_BOT_TOKEN}` },
  body: JSON.stringify(comandos),
});
if (!r.ok) {
  console.error("Discord respondió", r.status, await r.text());
  process.exit(1);
}
console.log("Comandos registrados:", (await r.json()).map((c) => `/${c.name}`).join(", "));
