// Los VOR que manda el lector v1.6 (los del propio simulador, sin localizadores). Puro.
import type { Muestra } from "./evaluador.ts";
import { aNm } from "../home/navGeo.ts";

export type VorSim = { ident: string; region: string; lat: number; lon: number; mhz: number; dme: boolean };
/** `decl`: grados, verdadero − magnético, medidos en el avión al elegir el VOR (para dibujar los radiales). */
export type VorElegido = VorSim & { decl: number };

const esVor = (x: unknown): x is VorSim => {
  const v = x as VorSim | null;
  return !!v && typeof v.ident === "string" && typeof v.lat === "number" && typeof v.lon === "number" && typeof v.mhz === "number";
};

export function leerVors(crudo: unknown): VorSim[] {
  if (!Array.isArray(crudo)) return [];
  return crudo.filter(esVor).map((v) => ({ ident: v.ident, region: typeof v.region === "string" ? v.region : "", lat: v.lat, lon: v.lon, mhz: v.mhz, dme: v.dme === true }));
}

/** A `maxNm` o menos, el más cercano primero. A más de 40 NM la lección es un vuelo largo. */
export function vorsCercanos(vors: VorSim[], lat: number, lon: number, maxNm = 60): (VorSim & { nm: number; largo: boolean })[] {
  return vors
    .map((v) => {
      const d = aNm(v.lat, v.lon, lat, lon);
      const nm = Math.hypot(d.x, d.y);
      return { ...v, nm, largo: nm > 40 };
    })
    .filter((v) => v.nm <= maxNm)
    .sort((a, b) => a.nm - b.nm);
}

const norm180 = (g: number) => ((((g + 180) % 360) + 360) % 360) - 180;

export const declinacion = (m: Muestra): number => (m.rumboV === undefined ? 0 : norm180(m.rumboV - m.rumbo));

/** Millas del avión al VOR por lat/lon; sirve también con un VOR sin DME. Sin posición, null. */
export function distanciaVor(m: Muestra, v: { lat: number; lon: number }): number | null {
  if (m.lat === undefined || m.lon === undefined) return null;
  const d = aNm(v.lat, v.lon, m.lat, m.lon);
  return Math.hypot(d.x, d.y);
}

/** Cono de silencio: a menos de esto del VOR la aguja no vale; manda la posición (Erik, 2026-11-11). */
export const CONO_NM = 2;

/** El radial magnético del avión desde el VOR, por lat/lon. Sin posición, null. */
export function radialPorPosicion(m: Muestra, v: VorElegido): number | null {
  if (m.lat === undefined || m.lon === undefined) return null;
  const d = aNm(m.lat, m.lon, v.lat, v.lon);
  return (((Math.atan2(d.x, d.y) * 180) / Math.PI - v.decl) % 360 + 360) % 360;
}

/** Dentro del cono, con el VOR sintonizado: la muestra con señal y el radial por posición. Fuera, la misma muestra. */
export function conCono(m: Muestra, v: VorElegido | undefined): Muestra {
  if (!v || m.navMhz === undefined || Math.abs(m.navMhz - v.mhz) >= 0.03) return m;
  const d = distanciaVor(m, v);
  const r = radialPorPosicion(m, v);
  return d !== null && d < CONO_NM && r !== null ? { ...m, navSenal: true, navRadial: r } : m;
}

/** Los arcos piden DME: los VOR sin él se ven pero no se pueden elegir. */
export const vorsParaLeccion = <T extends VorSim>(cercanos: T[], requiereDme: boolean): (T & { apto: boolean })[] =>
  cercanos.map((v) => ({ ...v, apto: !requiereDme || v.dme }));

export const elegirVor = (v: VorSim, m: Muestra): VorElegido => ({ ...v, decl: declinacion(m) });
