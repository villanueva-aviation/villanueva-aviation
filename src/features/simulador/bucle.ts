// Estado completo del simulador y un paso fijo de física (DT). Puro: lo usa useSimulador a 50 Hz.
import { H135 } from "./ficha.ts";
import type { Vor } from "./datos.ts";
import { aObjetivos, avanzarTeclado, tocados, type Mandos, type Teclas } from "./mandos.ts";
import { enPlataforma, paso, potenciaRequerida, sigma, type Estado, type Viento } from "./modelo.ts";
import { AP_APAGADO, pilotar, type EstadoAp, type Selecciones } from "./piloto.ts";
import { guiaGps, guiaVor, recibirNav, type Guia } from "./radios.ts";

export const DT = 0.02;
const MAX_REAL = 0.1;

export type Par = [number, number]; // activa, en espera
export type Sim = {
  e: Estado;
  mandos: Mandos;
  previos: Mandos; // mandos del paso anterior, para saber qué eje tocó el piloto
  ap: EstadoAp;
  sel: Selecciones;
  radios: { com1: Par; nav1: Par; nav2: Par; obs: number };
  fuente: "vor" | "gps";
  gps: { lat: number; lon: number; ident: string; curso: number } | null; // curso verdadero del directo
  viento: Viento;
  pausa: boolean;
  motor: boolean; // apagado: el colectivo no hace nada (la lección termina al apagar en la plataforma)
  t: number;
};

export function pasosPendientes(acumulado: number, dtReal: number): { pasos: number; resto: number } {
  const total = acumulado + Math.min(Math.max(0, dtReal), MAX_REAL);
  const pasos = Math.floor(total / DT + 1e-9);
  return { pasos, resto: Math.max(0, total - pasos * DT) };
}

/** Guía para el AP con la fuente elegida (null si no hay señal o no hay directo). */
export function guiaActual(s: Sim, vors: Vor[]): Guia | null {
  if (s.fuente === "gps") return s.gps && guiaGps(s.e, s.gps, s.gps.curso);
  const l = recibirNav(s.radios.nav1[0], s.radios.obs, s.e, vors);
  return l && guiaVor(l, s.radios.obs);
}

export function avanzar(s: Sim, teclas: Teclas, vors: Vor[], suelo: (lat: number, lon: number) => number | null, sueloRespaldoFt: number, decl: number): Sim {
  if (s.pausa) return s;
  let mandos = avanzarTeclado(s.mandos, teclas, DT);
  // Tocar = una tecla de ese eje apretada, o un cambio hecho por ratón o palanca táctil desde el paso anterior.
  // La vuelta sola de las flechas al centro no cuenta.
  const fuera = tocados(s.previos, s.mandos);
  const t = (...c: string[]) => c.some((k) => teclas.has(k));
  const toc = {
    lat: fuera.lat || t("ArrowLeft", "ArrowRight", "KeyC"),
    lon: fuera.lon || t("ArrowUp", "ArrowDown", "KeyC"),
    col: fuera.col || t("PageUp", "PageDown"),
  };
  const { ap, objetivos } = pilotar(s.ap, s.e, s.sel, guiaActual(s, vors), aObjetivos(mandos, H135), toc, H135, decl, DT);
  // Mientras el AP manda un eje, la palanca lo sigue: al apagarlo no hay salto.
  if (ap.ap) {
    if (ap.lat !== "ATT") mandos = { ...mandos, cx: objetivos.inclinacion / H135.inclinacionMax };
    if (ap.ias) mandos = { ...mandos, cy: objetivos.cabeceo < 0 ? -objetivos.cabeceo / H135.cabeceoMax : -objetivos.cabeceo / H135.cabeceoArribaMax };
    if (ap.vert !== "ATT") mandos = { ...mandos, colectivo: objetivos.colectivo };
  }
  // Sin motor el colectivo se queda abajo (también si el AP lo pedía): al encender no hay salto.
  if (!s.motor) mandos = { ...mandos, colectivo: 0 };
  const e = paso(s.e, s.motor ? objetivos : { ...objetivos, colectivo: 0 }, H135, s.viento, suelo(s.e.lat, s.e.lon) ?? sueloRespaldoFt, DT);
  return { ...s, e, mandos, previos: mandos, ap, t: s.t + DT };
}

/** Enciende o apaga el motor; solo en tierra. */
export function alternarMotor(s: Sim): Sim {
  return s.e.enTierra ? { ...s, motor: !s.motor } : s;
}

/** En el aire: `radial` magnético desde la estación (sin él, al sur verdadero); rumbo hacia ella. */
export type EnElAire = { vor: Vor; distNm: number; altFt: number; radial?: number };

export function inicio(lugar: { lat: number; lon: number; elevFt: number; rumboV: number }, enElAire?: EnElAire): Sim {
  let e = enPlataforma(lugar.lat, lugar.lon, lugar.elevFt, lugar.rumboV);
  let mandos: Mandos = { cx: 0, cy: 0, colectivo: 0, pedales: 0 };
  let decl = 0;
  if (enElAire) {
    // En el radial elegido, con rumbo hacia el VOR, en crucero de 90 kt.
    const { vor, distNm, altFt } = enElAire;
    decl = vor.decl;
    const desde = enElAire.radial === undefined ? 180 : (((enElAire.radial + decl) % 360) + 360) % 360; // verdadero
    const rumboV = (desde + 180) % 360;
    const RAD = Math.PI / 180;
    const s = sigma(altFt);
    const ias = 90;
    const cabeceo = 5 - ias / Math.sqrt(s) / 8;
    const colectivo = potenciaRequerida(H135, ias) / s ** 1.2;
    const lat = vor.lat + (distNm * Math.cos(desde * RAD)) / 60;
    const lon = vor.lon + (distNm * Math.sin(desde * RAD)) / 60 / Math.cos(vor.lat * RAD);
    e = { ...e, lat, lon, altFt, ias, gs: ias / Math.sqrt(s), cabeceo, rumboV, track: rumboV, colectivo, enTierra: false };
    mandos = { cx: 0, cy: -cabeceo / H135.cabeceoMax, colectivo, pedales: 0 };
  }
  const nav = enElAire?.vor.mhz ?? 108;
  return {
    e,
    mandos,
    previos: mandos,
    ap: AP_APAGADO,
    sel: { hdg: Math.round((e.rumboV - decl + 360) % 360) || 360, altSel: Math.round(e.altFt / 100) * 100 + 1000, vsSel: 500, iasSel: 90 },
    radios: { com1: [118.1, 121.9], nav1: [nav, 108], nav2: [108, 108], obs: Math.round((e.rumboV - decl + 360) % 360) || 360 },
    fuente: "vor",
    gps: null,
    viento: { dir: 0, kt: 0 },
    pausa: false,
    motor: true,
    t: 0,
  };
}
