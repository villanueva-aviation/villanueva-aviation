// Matemática pura del ATIS: alcance de radio, sintonía, mezcla de audio y posición en el loop.
import type { AeropuertoAtis } from "./datos.ts";
import type { Atis } from "./generado.ts";

export type Com = { mhz: number; escucha: boolean; volumen: number | null }; // volumen 0..1
export type Posicion = { lat: number; lon: number; aglFt: number };
export type Mezcla = { voz: number; ruido: number; tremolo: number }; // ganancias; tremolo = profundidad (0 = ninguno)

const RADIO_TIERRA_NM = 3440.065;
const TOLERANCIA_MHZ = 0.005; // 5 kHz
export const PAUSA_LOOP_SEG = 2; // silencio al final de cada vuelta del loop (cargarAudio lo deja en el buffer)
const rad = (g: number) => (g * Math.PI) / 180;

// Haversine.
export function distanciaNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * RADIO_TIERRA_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Línea de vista a 50 ft de antena en tierra.
export function alcanceNm(aglFt: number): number {
  return 1.23 * (Math.sqrt(Math.max(0, aglFt)) + Math.sqrt(50));
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mezclaPorDistancia(distNm: number, alcance: number, volumenCom: number | null): Mezcla | null {
  const f = distNm / alcance;
  if (f > 1) return null;
  const t = Math.min(1, Math.max(0, (f - 0.4) / 0.5)); // 0 limpio (<=40 %), 1 sucio (>=90 %)
  const vol = volumenCom ?? 1;
  return { voz: lerp(0.8, 0.55, t) * vol, ruido: lerp(0.012, 0.05, t) * vol, tremolo: lerp(0, 0.35, t) };
}

export function sintonizado(com: Com, pos: Posicion, aeropuertos: AeropuertoAtis[]): { ap: AeropuertoAtis; distNm: number } | null {
  if (!com.escucha) return null;
  const alcance = alcanceNm(pos.aglFt);
  let mejor: { ap: AeropuertoAtis; distNm: number } | null = null;
  for (const ap of aeropuertos) {
    // 1e-9 absorbe el error de punto flotante justo en 5 kHz.
    if (!ap.atisMhz.some((m) => Math.abs(m - com.mhz) < TOLERANCIA_MHZ + 1e-9)) continue;
    const distNm = distanciaNm(pos, ap);
    if (distNm > alcance) continue;
    if (!mejor || distNm < mejor.distNm) mejor = { ap, distNm };
  }
  return mejor;
}

// Segundos dentro del loop (duración + pausa de 2 s).
export function offsetLoop(ahoraMs: number, inicioMs: number, duracionSeg: number): number {
  const periodo = duracionSeg + PAUSA_LOOP_SEG;
  return (((ahoraMs - inicioMs) / 1000) % periodo + periodo) % periodo;
}

// El ATIS que espera entra si no suena nada, o en la pausa del final del loop que suena.
// faseMs: hora de la fase 0 de ese loop (la del METAR al sintonizar; la del cambio tras un cambio de letra).
export function entraSiguiente(sonando: boolean, ahoraMs: number, faseMs: number, duracionSeg: number): boolean {
  return !sonando || offsetLoop(ahoraMs, faseMs, duracionSeg) >= duracionSeg;
}

export function debeCambiar(actual: Atis | null, nuevo: Atis): boolean {
  return !actual || actual.icao !== nuevo.icao || actual.letra !== nuevo.letra;
}
