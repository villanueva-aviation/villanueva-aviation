import type { VueloAventura } from "./aventura.ts";

const RADIO_TIERRA_NM = 3440.065;
const aRad = (grados: number) => (grados * Math.PI) / 180;

/** Distancia ortodrómica en millas náuticas: la línea recta sobre la Tierra, no la ruta volada. */
export function distanciaNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = aRad(lat2 - lat1);
  const dLon = aRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * RADIO_TIERRA_NM * Math.asin(Math.sqrt(a)));
}

export function resumenAventura(vuelos: VueloAventura[]) {
  const aeropuertos = new Set<string>();
  let minutos = 0;
  let nm = 0;
  for (const v of vuelos) {
    aeropuertos.add(v.origen_icao);
    aeropuertos.add(v.destino_icao);
    minutos += v.minutos;
    nm += v.distancia_nm;
  }
  return { vuelos: vuelos.length, aeropuertos: aeropuertos.size, minutos, nm };
}

/** 125 -> "2 h 05 min" */
export function formatoDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h === 0 ? `${m} min` : `${h} h ${String(m).padStart(2, "0")} min`;
}
