// Formato del ATIS según el prefijo OACI del aeropuerto.
export type Formato = "mx" | "latam" | "faa" | "oaci";

const LATAM = ["MG", "MH", "MN", "MR", "MS", "MP", "MU", "MD", "SK", "SV", "SE", "SP", "SL", "SC", "SA", "SU", "SG"];
const FAA2 = ["PA", "PH", "PG", "TJ"];

export function formatoDe(icao: string): Formato {
  const p = icao.toUpperCase();
  if (p.startsWith("MM")) return "mx";
  if (LATAM.includes(p.slice(0, 2))) return "latam";
  if (FAA2.includes(p.slice(0, 2)) || p.startsWith("K")) return "faa";
  return "oaci";
}
