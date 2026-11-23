// Uso: node --experimental-strip-types tools/atis-nombres/generar.ts <volcado.json>
// Arma public/data/atis/nombres.json con los aeropuertos del volcado de MSFS (lector --volcar).
import { readFileSync, writeFileSync } from "node:fs";
import { leerCsv } from "../atis-datos/csv.ts";
import { nombresAtis } from "../../src/features/atis/nombres.ts";

const archivo = process.argv[2];
if (!archivo) throw new Error("Falta el volcado: ... generar.ts <volcado.json>");
const volcado = JSON.parse(readFileSync(archivo, "utf-8")) as { icao: string; nombre: string }[];
const ourAirports = leerCsv(await (await fetch("https://davidmegginson.github.io/ourairports-data/airports.csv")).text());
const mx = Object.fromEntries((JSON.parse(readFileSync("public/data/atis/MX.json", "utf-8")) as { icao: string; nombreEs: string; nombreEn: string }[])
  .map((a) => [a.icao, { es: a.nombreEs, en: a.nombreEn }]));
const r = nombresAtis(volcado, ourAirports, mx);
writeFileSync("public/data/atis/nombres.json", JSON.stringify(r.nombres, null, 1));
console.log(`aeropuertos: ${Object.keys(r.nombres).length}\nrepetidos: ${r.repetidos.length}\ncaracteres: ${r.caracteres}`);
if (r.repetidos.length) console.log(r.repetidos.slice(0, 30).join("\n"));
