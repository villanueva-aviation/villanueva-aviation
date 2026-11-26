// Radios del simulador: recepción de VOR con alcance por línea de vista, DME, reglas de frecuencia y GPS directo.
// Signos como `desviacion` en RosaHSI: positivo = el curso queda a la derecha (la barra se va a la derecha).
import { aNm, difAngulo, rumbo } from "../home/navGeo.ts";
import type { AeropuertoSim, Vor } from "./datos.ts";

export type Posicion = { lat: number; lon: number; altFt: number };
export type LecturaNav = { vor: Vor; radial: number; desvGrados: number; desde: boolean; dmeNm: number | null; distNm: number };
export type Guia = { curso: number; xtkNm: number; distNm: number };

const RAD = Math.PI / 180;
const FT_POR_NM = 6076;

export function alcanceNm(altFt: number, elevVorFt: number): number {
  return Math.min(130, 1.23 * Math.sqrt(Math.max(0, altFt - elevVorFt)));
}

export function recibirNav(mhz: number, obs: number, pos: Posicion, vors: Vor[]): LecturaNav | null {
  let mejor: { vor: Vor; dist: number; radialV: number } | null = null;
  for (const vor of vors) {
    if (Math.abs(vor.mhz - mhz) > 0.001) continue;
    const p = aNm(pos.lat, pos.lon, vor.lat, vor.lon);
    const dist = Math.hypot(p.x, p.y);
    if (dist > alcanceNm(pos.altFt, vor.elevFt) || (mejor && dist >= mejor.dist)) continue;
    mejor = { vor, dist, radialV: rumbo({ x: 0, y: 0 }, p) };
  }
  if (!mejor) return null;
  const { vor, dist } = mejor;
  const radial = (mejor.radialV - vor.decl + 360) % 360;
  const desde = Math.abs(difAngulo(radial, obs)) < 90;
  const desvGrados = desde ? difAngulo(radial, obs) : -difAngulo(radial, (obs + 180) % 360);
  const dmeNm = vor.dme ? Math.hypot(dist, Math.max(0, pos.altFt - vor.elevFt) / FT_POR_NM) : null;
  return { vor, radial, desvGrados, desde, dmeNm, distNm: dist };
}

export function ajustarFrecuencia(mhz: number, banda: "nav" | "com"): number {
  const [paso, min, max, dec] = banda === "nav" ? [0.05, 108, 117.95, 100] : [0.025, 118, 136.975, 1000];
  const canal = Math.round((mhz - min) / paso) * paso + min;
  return Math.round(Math.min(max, Math.max(min, canal)) * dec) / dec;
}

/** Estación que transmite en `mhz` (la más cercana a 60 NM o menos), p. ej. «MMGL TWR». */
export function nombreCom(mhz: number, aeropuertos: AeropuertoSim[], pos: Posicion): string | null {
  let mejor: { nombre: string; dist: number } | null = null;
  for (const a of aeropuertos) {
    const com = a.com.find((c) => Math.abs(c.mhz - mhz) < 0.003);
    if (!com) continue;
    const p = aNm(a.lat, a.lon, pos.lat, pos.lon);
    const dist = Math.hypot(p.x, p.y);
    if (dist <= 60 && (!mejor || dist < mejor.dist)) mejor = { nombre: `${a.icao} ${com.tipo}`, dist };
  }
  return mejor?.nombre ?? null;
}

/** Línea que llega a `destino` con rumbo verdadero `cursoDesde`. */
export function guiaGps(pos: Posicion, destino: { lat: number; lon: number }, cursoDesde: number): Guia {
  const p = aNm(pos.lat, pos.lon, destino.lat, destino.lon);
  const c = cursoDesde * RAD;
  const aLaDerecha = p.x * Math.cos(c) - p.y * Math.sin(c);
  return { curso: cursoDesde, xtkNm: -aLaDerecha, distNm: Math.hypot(p.x, p.y) };
}

/** El curso de la guía es verdadero, como en `guiaGps`. */
export function guiaVor(l: LecturaNav, obs: number): Guia {
  return { curso: (obs + l.vor.decl + 360) % 360, xtkNm: l.distNm * Math.sin(l.desvGrados * RAD), distNm: l.distNm };
}

/** Puntos de la barra del HSI: VOR 1 punto = 2°, GPS 1 punto = 0.4 NM, acotado a ±5. */
export function puntos(g: Guia, fuente: "vor" | "gps", desvGrados?: number): number {
  const p = fuente === "vor" ? (desvGrados ?? 0) / 2 : g.xtkNm / 0.4;
  return Math.max(-5, Math.min(5, p));
}
