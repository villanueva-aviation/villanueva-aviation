// Modelo de vuelo estabilizado (opción A): el cíclico pide una actitud y el helicóptero la toma solo.
// ponytail: modelo de equilibrio, no de rotor. La opción B (sin estabilización) va como otra función `paso`
// que no amortigua la actitud; se agrega cuando Erik la pida.
import type { Ficha } from "./ficha.ts";

export type Estado = {
  lat: number;
  lon: number;
  altFt: number;
  ias: number; // kt
  gs: number; // kt
  vs: number; // ft/min
  cabeceo: number; // grados, + nariz arriba
  inclinacion: number; // grados, + a la derecha
  rumboV: number; // rumbo verdadero
  track: number; // verdadero
  vLat: number; // kt hacia la derecha (vuelo lateral a baja velocidad)
  colectivo: number; // 0..1
  enTierra: boolean;
  bola: number; // -1..1, + = bola a la derecha
};
export type Objetivos = { cabeceo: number; inclinacion: number; colectivo: number; pedales: number };
export type Viento = { dir: number; kt: number }; // de donde viene, verdadero

const RAD = Math.PI / 180;
const NM_POR_GRADO = 60;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const hacia = (v: number, obj: number, tau: number, dt: number) => v + (obj - v) * Math.min(1, dt / tau);
const mezcla = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);

export function sigma(altFt: number): number {
  return Math.max(0.05, 1 - 6.875e-6 * altFt) ** 4.256;
}

/** Curva en U: mucha potencia en estacionario, mínima a `vPreqMin`, y vuelve a subir hacia VNE. */
export function potenciaRequerida(f: Ficha, ias: number): number {
  const v = Math.max(0, ias);
  if (v < f.vPreqMin) return f.preqMin + (f.preqHover - f.preqMin) * (1 - v / f.vPreqMin) ** 2;
  return f.preqMin + (f.preqVne - f.preqMin) * ((v - f.vPreqMin) / (f.vne - f.vPreqMin)) ** 2;
}

/** TAS hacia la que tiende el helicóptero con un cabeceo dado: 5° arriba = estacionario. */
export function velocidadEquilibrio(cabeceo: number): number {
  return Math.max(0, (5 - cabeceo) * 8);
}

export function paso(e: Estado, o: Objetivos, f: Ficha, viento: Viento, sueloFt: number, dt: number): Estado {
  const s = sigma(e.altFt);
  const raiz = Math.sqrt(s);

  // 1. Actitud.
  const cabeceo = hacia(e.cabeceo, clamp(o.cabeceo, -f.cabeceoMax, f.cabeceoArribaMax), f.tauActitud, dt);
  const inclinacion = hacia(e.inclinacion, clamp(o.inclinacion, -f.inclinacionMax, f.inclinacionMax), f.tauActitud, dt);

  // 3. Vertical (antes que la velocidad para saber si sigue en tierra).
  const vsObjetivo = (o.colectivo * s ** 1.2 - potenciaRequerida(f, e.ias)) * f.kVs;
  const enTierra = e.enTierra && vsObjetivo <= 0;

  // 2. Velocidad.
  let tas = e.ias / raiz;
  tas = enTierra ? hacia(tas, 0, 1, dt) : Math.min(hacia(tas, velocidadEquilibrio(cabeceo), f.tauVel, dt), (1.05 * f.vne) / raiz);
  const ias = tas * raiz;
  let vs = enTierra ? 0 : hacia(e.vs, vsObjetivo, f.tauVs, dt);

  // 4. Guiñada y 5. lateral.
  let rumboV = e.rumboV;
  let vLat = 0;
  let bola = 0;
  if (!enTierra) {
    const coordinado = (1091 * Math.tan(inclinacion * RAD)) / Math.max(tas, 1) + o.pedales * 3;
    // Par del rotor: subir colectivo gira la nariz a la izquierda (rotor horario visto desde arriba). Acotado a ±1/s.
    const lento = o.pedales * 30 - clamp((o.colectivo - e.colectivo) / dt, -1, 1) * 20;
    rumboV = (rumboV + mezcla(lento, coordinado, (tas - 30) / 15) * dt + 360) % 360;
    if (tas > 45) bola = o.pedales * 0.5;
    if (tas < 40) vLat = hacia(e.vLat, inclinacion * 1.5, 2, dt);
  }

  // 6. Posición.
  let { lat, lon } = e;
  let gs = 0;
  let track = e.track;
  if (!enTierra) {
    const h = rumboV * RAD;
    const haciaViento = (viento.dir + 180) * RAD;
    const este = tas * Math.sin(h) + vLat * Math.cos(h) + viento.kt * Math.sin(haciaViento);
    const norte = tas * Math.cos(h) - vLat * Math.sin(h) + viento.kt * Math.cos(haciaViento);
    gs = Math.hypot(este, norte);
    if (gs > 0.1) track = (Math.atan2(este, norte) / RAD + 360) % 360;
    lat += (norte * dt) / 3600 / NM_POR_GRADO;
    lon += (este * dt) / 3600 / (NM_POR_GRADO * Math.cos(lat * RAD));
  }

  // 7. Suelo.
  let altFt = e.altFt + (vs / 60) * dt;
  let tierra = enTierra;
  if (altFt <= sueloFt && vs <= 0) {
    altFt = sueloFt;
    vs = 0;
    tierra = true;
  }

  return { lat, lon, altFt, ias, gs, vs, cabeceo, inclinacion, rumboV, track, vLat, colectivo: o.colectivo, enTierra: tierra, bola };
}

export function enPlataforma(lat: number, lon: number, elevFt: number, rumboV: number): Estado {
  return { lat, lon, altFt: elevFt, ias: 0, gs: 0, vs: 0, cabeceo: 5, inclinacion: 0, rumboV, track: rumboV, vLat: 0, colectivo: 0, enTierra: true, bola: 0 };
}
