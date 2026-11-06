// El aeropuerto más cercano, como lo manda el lector v1.4 (datos del propio simulador).
import type { Muestra } from "./evaluador.ts";
import { aNm, difAngulo } from "../home/navGeo.ts";

export type TipoFrecuencia = "atis" | "rodaje" | "torre" | "autorizacion" | "aproximacion" | "salida" | "unicom" | "otra";
/** Umbral de un extremo de pista; rumboV es el rumbo verdadero de aterrizaje/despegue por ese extremo. */
export type Extremo = { ident: string; rumboV: number; lat: number; lon: number };
export type Pista = { extremos: [Extremo, Extremo]; largoFt: number; anchoFt: number };
export type Aeropuerto = {
  icao: string;
  nombre: string;
  lat: number;
  lon: number;
  elevacionFt: number;
  pistas: Pista[];
  frecuencias: { tipo: TipoFrecuencia; mhz: number; nombre: string }[];
};

const FT = 3.28084;
const M_NM = 1852;
const RAD = Math.PI / 180;
// Tipos del SDK de MSFS (SIMCONNECT_FREQUENCY_TYPE, sin confirmar en vivo).
const TIPOS: Record<number, TipoFrecuencia> = { 1: "atis", 3: "unicom", 5: "rodaje", 6: "torre", 7: "autorizacion", 8: "aproximacion", 9: "salida" };
const DESIGNADORES = ["", "L", "R", "C"];

const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
const norm = (r: number) => ((r % 360) + 360) % 360;

/** Punto a `metros` de (lat, lon) hacia `rumbo` verdadero. */
function mover(lat: number, lon: number, rumbo: number, metros: number) {
  const nm = metros / M_NM;
  return { lat: lat + (nm * Math.cos(rumbo * RAD)) / 60, lon: lon + (nm * Math.sin(rumbo * RAD)) / 60 / Math.cos(lat * RAD) };
}

export function leerAeropuerto(crudo: unknown): Aeropuerto | null {
  if (!crudo || typeof crudo !== "object") return null;
  const c = crudo as Record<string, unknown>;
  if (typeof c.icao !== "string" || !c.icao) return null;
  const pistas: Pista[] = [];
  for (const p of Array.isArray(c.pistas) ? (c.pistas as Record<string, unknown>[]) : []) {
    const n1 = num(p.n1), n2 = num(p.n2);
    if (n1 < 1 || n1 > 36 || n2 < 1 || n2 > 36) continue;
    const rumbo = norm(num(p.rumboV)), largoM = num(p.largoM);
    const ident = (n: number, d: number) => String(n).padStart(2, "0") + (DESIGNADORES[d] ?? "");
    const a = mover(num(p.lat), num(p.lon), rumbo, -largoM / 2);
    const b = mover(num(p.lat), num(p.lon), rumbo, largoM / 2);
    pistas.push({
      extremos: [
        { ident: ident(n1, num(p.d1)), rumboV: rumbo, ...a },
        { ident: ident(n2, num(p.d2)), rumboV: norm(rumbo + 180), ...b },
      ],
      largoFt: largoM * FT,
      anchoFt: num(p.anchoM) * FT,
    });
  }
  const frecuencias = (Array.isArray(c.frecuencias) ? (c.frecuencias as Record<string, unknown>[]) : []).map((f) => ({
    tipo: TIPOS[num(f.tipo)] ?? "otra",
    mhz: Math.round(num(f.hz) / 1000) / 1000,
    nombre: typeof f.nombre === "string" ? f.nombre : "",
  }));
  return {
    icao: c.icao,
    nombre: typeof c.nombre === "string" ? c.nombre : "",
    lat: num(c.lat),
    lon: num(c.lon),
    elevacionFt: num(c.altM) * FT,
    pistas,
    frecuencias,
  };
}

/** La inversa de leerAeropuerto, en la forma cruda del lector. La usa el vuelo simulado. */
export function aCrudo(a: Aeropuerto): unknown {
  const tipo = (t: TipoFrecuencia) => Number(Object.keys(TIPOS).find((k) => TIPOS[Number(k)] === t) ?? 0);
  const partes = (ident: string) => ({ n: parseInt(ident, 10), d: Math.max(0, DESIGNADORES.indexOf(ident.slice(2))) });
  return {
    icao: a.icao,
    nombre: a.nombre,
    lat: a.lat,
    lon: a.lon,
    altM: a.elevacionFt / FT,
    pistas: a.pistas.map(({ extremos: [e1, e2], largoFt, anchoFt }) => {
      const p1 = partes(e1.ident), p2 = partes(e2.ident);
      return {
        lat: (e1.lat + e2.lat) / 2, lon: (e1.lon + e2.lon) / 2, rumboV: e1.rumboV,
        largoM: largoFt / FT, anchoM: anchoFt / FT, n1: p1.n, d1: p1.d, n2: p2.n, d2: p2.d,
      };
    }),
    frecuencias: a.frecuencias.map((f) => ({ tipo: tipo(f.tipo), hz: Math.round(f.mhz * 1e6), nombre: f.nombre })),
  };
}

/** Ident del extremo de la pista que tiene al avión encima y alineado (±30°); null si no hay. */
export function pistaBajo(m: Pick<Muestra, "lat" | "lon" | "rumboV">, a: Aeropuerto): string | null {
  if (m.lat === undefined || m.lon === undefined || m.rumboV === undefined) return null;
  for (const { extremos, largoFt, anchoFt } of a.pistas) {
    const [e1, e2] = extremos;
    const p = aNm(m.lat, m.lon, (e1.lat + e2.lat) / 2, (e1.lon + e2.lon) / 2);
    const h = e1.rumboV * RAD;
    const adelante = (p.x * Math.sin(h) + p.y * Math.cos(h)) * M_NM;
    const lado = (p.x * Math.cos(h) - p.y * Math.sin(h)) * M_NM;
    if (Math.abs(lado) > anchoFt / FT / 2 + 15 || Math.abs(adelante) > largoFt / FT / 2 + 60) continue;
    for (const e of extremos) if (Math.abs(difAngulo(m.rumboV, e.rumboV)) <= 30) return e.ident;
    // Atravesado sobre esta pista: puede ir alineado con otra que la cruza.
  }
  return null;
}

/** MMGL aproximado, para pruebas y simulación: el aeropuerto real sale del simulador. */
export const AEROPUERTO_PRUEBA: Aeropuerto = leerAeropuerto({
  icao: "MMGL",
  nombre: "Guadalajara",
  lat: 20.5218,
  lon: -103.3112,
  altM: 5016 / FT,
  pistas: [
    { lat: 20.5218, lon: -103.3112, rumboV: 112, largoM: 13123 / FT, anchoM: 148 / FT, n1: 11, d1: 2, n2: 29, d2: 1 },
    { lat: 20.53, lon: -103.305, rumboV: 20, largoM: 5900 / FT, anchoM: 98 / FT, n1: 2, d1: 0, n2: 20, d2: 0 },
  ],
  frecuencias: [
    { tipo: 6, hz: 118100000, nombre: "Torre" },
    { tipo: 5, hz: 121900000, nombre: "Rodaje" },
  ],
})!;
