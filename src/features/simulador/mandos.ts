// Mandos del piloto: teclado, ratón y palancas táctiles llevados a cíclico, colectivo y pedales.
import type { Ficha } from "./ficha.ts";
import type { Objetivos } from "./modelo.ts";

export type Mandos = { cx: number; cy: number; colectivo: number; pedales: number }; // cx, cy, pedales -1..1 (cy + = adelante); colectivo 0..1
export type Teclas = Set<string>; // KeyboardEvent.code

/** Tecla ficticia: el ratón o las palancas táctiles mandan, así que el cíclico y los pedales no vuelven solos al centro. */
export const MANTENER = "Mantener";

const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v));
const alCentro = (v: number, d: number) => (v > 0 ? Math.max(0, v - d) : Math.min(0, v + d));

function eje(v: number, menos: boolean, mas: boolean, vel: number, regreso: number, dt: number, mantener: boolean) {
  if (menos !== mas) return clamp(v + (mas ? vel : -vel) * dt);
  return mantener ? v : alCentro(v, regreso * dt);
}

export function avanzarTeclado(m: Mandos, teclas: Teclas, dt: number): Mandos {
  const t = (c: string) => teclas.has(c);
  const mantener = t(MANTENER);
  const centrar = t("KeyC");
  return {
    cx: centrar ? 0 : eje(m.cx, t("ArrowLeft"), t("ArrowRight"), 1.5, 2, dt, mantener),
    // Adelante/atrás no regresa solo: hace de compensador para sostener la velocidad.
    cy: centrar ? 0 : eje(m.cy, t("ArrowDown"), t("ArrowUp"), 1.5, 2, dt, true),
    colectivo: clamp(m.colectivo + ((t("PageUp") ? 0.3 : 0) - (t("PageDown") ? 0.3 : 0)) * dt, 0, 1),
    pedales: eje(m.pedales, t("KeyZ"), t("KeyX"), 2, 2, dt, mantener),
  };
}

/** `dy` negativo = ratón hacia adelante = cíclico adelante. `rueda` en clics, + = subir colectivo. */
export function aplicarRaton(m: Mandos, dx: number, dy: number, rueda: number, botonDerecho: boolean): Mandos {
  return {
    cx: botonDerecho ? m.cx : clamp(m.cx + dx * 0.004),
    cy: clamp(m.cy - dy * 0.004),
    colectivo: clamp(m.colectivo + rueda * 0.02, 0, 1),
    pedales: botonDerecho ? clamp(m.pedales + dx * 0.004) : m.pedales,
  };
}

export function aObjetivos(m: Mandos, f: Ficha): Objetivos {
  return {
    cabeceo: -m.cy * (m.cy > 0 ? f.cabeceoMax : f.cabeceoArribaMax),
    inclinacion: m.cx * f.inclinacionMax,
    colectivo: m.colectivo,
    pedales: m.pedales,
  };
}

/** Ejes que cambiaron entre dos lecturas (cualquier cambio, por pequeño que sea). */
export function tocados(antes: Mandos, ahora: Mandos): { lat: boolean; lon: boolean; col: boolean; ped: boolean } {
  const c = (a: number, b: number) => Math.abs(a - b) > 1e-6;
  return { lat: c(antes.cx, ahora.cx), lon: c(antes.cy, ahora.cy), col: c(antes.colectivo, ahora.colectivo), ped: c(antes.pedales, ahora.pedales) };
}
