// Nombres hablados del mundo: de los aeropuertos que MSFS vuelca con ATIS y de OurAirports.
import { NOMBRES_FIJOS, nombres, type Nombres } from "./datos.ts";
import { formatoDe } from "./formato.ts";

// El nombre corto de MSFS, sin abreviaturas, para leerlo en voz alta.
const ABREVIATURAS: Record<string, string> = {
  Intl: "International", Rgnl: "Regional", Muni: "Municipal", AB: "Air Base", Apt: "Airport", Arpt: "Airport",
  Natl: "National", Fld: "Field", Mem: "Memorial",
};
const expandir = (s: string) => s.trim().replace(/[A-Za-z]+\.?/g, (w) => ABREVIATURAS[w.replace(/\.$/, "")] ?? w);

export function nombresAtis(
  volcado: { icao: string; nombre: string }[],
  ourAirports: Record<string, string>[],
  mx: Nombres = {}, // los de MX.json: ya estan grabados, no cambian
): { nombres: Nombres; repetidos: string[]; caracteres: number } {
  const our = new Map(ourAirports.map((a) => [a.ident, a]));
  const ciudad = (icao: string) => { const a = our.get(icao); return a?.municipality ? `${a.iso_country}/${a.municipality}` : ""; };
  const porCiudad = new Map<string, number>();
  for (const { icao } of volcado) if (ciudad(icao)) porCiudad.set(ciudad(icao), (porCiudad.get(ciudad(icao)) ?? 0) + 1);

  const salida: Nombres = {};
  for (const { icao, nombre } of volcado) {
    const a = our.get(icao);
    const f = formatoDe(icao);
    const habla = f === "mx" || f === "latam";
    if (mx[icao]) salida[icao] = mx[icao];
    else if (!a) { const n = expandir(nombre); salida[icao] = habla ? { es: n, en: n } : { en: n }; }
    else if (habla && ciudad(icao) && porCiudad.get(ciudad(icao)) === 1) salida[icao] = NOMBRES_FIJOS[icao] ?? nombres(a.name, a.municipality);
    else salida[icao] = habla ? { es: a.name, en: a.name } : { en: a.name };
  }

  const usos = new Map<string, number>();
  let caracteres = 0;
  for (const n of Object.values(salida)) {
    usos.set(n.en, (usos.get(n.en) ?? 0) + 1);
    caracteres += n.en.length + 1 + (n.es ? n.es.length + 1 : 0);
  }
  return { nombres: salida, repetidos: [...usos].filter(([, c]) => c > 1).map(([n]) => n), caracteres };
}
