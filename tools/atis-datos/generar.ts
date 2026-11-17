// Uso: node --experimental-strip-types tools/atis-datos/generar.ts MX
import { mkdirSync, writeFileSync } from "node:fs";
import { armarAeropuertos } from "../../src/features/atis/datos.ts";

const BASE = "https://davidmegginson.github.io/ourairports-data/";

// Divide el CSV respetando comillas (campos con comas y "" escapadas).
function leerCsv(texto: string): Record<string, string>[] {
  const filas: string[][] = [];
  let fila: string[] = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.length > 1 || fila[0] !== "") filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cab.map((h, i) => [h, f[i] ?? ""])));
}

const pais = process.argv[2];
if (!pais) throw new Error("Falta el código de país, p. ej. MX");
const bajar = async (n: string) => leerCsv(await (await fetch(BASE + n)).text());
const [apts, pistas, frec] = await Promise.all([bajar("airports.csv"), bajar("runways.csv"), bajar("airport-frequencies.csv")]);
const datos = armarAeropuertos(apts, pistas, frec, pais);
mkdirSync("public/data/atis", { recursive: true });
writeFileSync(`public/data/atis/${pais}.json`, JSON.stringify(datos));
console.log(`${pais}: ${datos.length} aeropuertos`);
