// Uso: node --experimental-strip-types tools/atis-datos/generar.ts MX
import { mkdirSync, writeFileSync } from "node:fs";
import { armarAeropuertos } from "../../src/features/atis/datos.ts";
import { leerCsv } from "./csv.ts";

const BASE = "https://davidmegginson.github.io/ourairports-data/";

const pais = process.argv[2];
if (!pais) throw new Error("Falta el código de país, p. ej. MX");
const bajar = async (n: string) => leerCsv(await (await fetch(BASE + n)).text());
const [apts, pistas, frec] = await Promise.all([bajar("airports.csv"), bajar("runways.csv"), bajar("airport-frequencies.csv")]);
const datos = armarAeropuertos(apts, pistas, frec, pais);
mkdirSync("public/data/atis", { recursive: true });
writeFileSync(`public/data/atis/${pais}.json`, JSON.stringify(datos));
console.log(`${pais}: ${datos.length} aeropuertos`);
