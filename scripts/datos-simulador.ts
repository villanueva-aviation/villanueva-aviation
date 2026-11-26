// Baja los CSV de OurAirports y escribe public/data/sim/{ISO}.json y paises.json.
// Correr: node --experimental-strip-types scripts/datos-simulador.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { convertirPais, parsearCsv, type Pais } from "../src/features/simulador/datos.ts";

const BASE = "https://davidmegginson.github.io/ourairports-data/";
const bajar = async (n: string) => {
  const r = await fetch(BASE + n);
  if (!r.ok) throw new Error(`${n}: ${r.status}`);
  return parsearCsv(await r.text());
};

const [navaids, aeropuertos, pistas, frecuencias] = await Promise.all(
  ["navaids.csv", "airports.csv", "runways.csv", "airport-frequencies.csv"].map(bajar),
);

// 5 decimales ≈ 1 m: suficiente y la mitad del peso.
const redondear = (_: string, v: unknown) => (typeof v === "number" ? Math.round(v * 1e5) / 1e5 : v);

const salida = "public/data/sim";
mkdirSync(salida, { recursive: true });
const isos = [...new Set(navaids.map((n) => n.iso_country))].filter(Boolean).sort();
const paises: Pais[] = [];
for (const iso of isos) {
  const datos = convertirPais(iso, navaids, aeropuertos, pistas, frecuencias);
  if (!datos.vors.length) continue;
  let json = JSON.stringify(datos, redondear);
  // ponytail: países enormes (EE. UU.) se quedan solo con aeropuertos que tienen frecuencia; filtro más fino si hace falta.
  if (json.length > 1.5e6) json = JSON.stringify({ ...datos, aeropuertos: datos.aeropuertos.filter((a) => a.com.length) }, redondear);
  writeFileSync(`${salida}/${iso}.json`, json);
  paises.push({ iso, vors: datos.vors.length });
}
writeFileSync(`${salida}/paises.json`, JSON.stringify(paises));
console.log(`${paises.length} países`);
