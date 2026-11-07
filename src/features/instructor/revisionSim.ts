// Si un punto del checklist se ve hecho en el simulador. Lo usa el checklist por voz después de oír cada punto.
import type { Muestra } from "./evaluador.ts";

export type Revision =
  | "freno" | "acelerador-cuarto" | "mezcla-corte" | "mezcla-rica" | "mezcla-aeropuerto" | "mezcla-empobrecida"
  | "master-on" | "master-off" | "beacon-on" | "nav-on" | "taxi-on" | "aterrizaje-on" | "aterrizaje-off"
  | "strobe-on" | "strobe-off" | "arranque-motor" | "corte-motor" | "magnetos" | "magnetos-off"
  | "flaps-arriba" | "flaps-despegue" | "altimetro" | "rpm-1800" | "ralenti" | "xpdr-alt"
  | "vel-ascenso" | "potencia-crucero" | "vel-aproximacion"
  // v1.5
  | "avionica-on" | "avionica-off" | "selector-ambos" | "selector-tanque" | "valvula-abierta"
  | "bomba-on" | "bomba-off" | "autopiloto-off" | "trim-despegue";

export const ES_V15: ReadonlySet<Revision> = new Set<Revision>([
  "avionica-on", "avionica-off", "selector-ambos", "selector-tanque", "valvula-abierta",
  "bomba-on", "bomba-off", "autopiloto-off", "trim-despegue",
]);

export type ContextoRevision = { elevacionFt: number | null };
export type Revisado = { ok: boolean; detalle?: string };

// En el C172 de MSFS la marca de despegue lee 7.4 % (Erik, 2026-11-06); se acepta ±10.
export const TRIM_DESPEGUE = { min: -2.6, max: 17.4 };
const AEROPUERTO_ALTO_FT = 3000;
const CAIDA_MAX = 150;
const DIFERENCIA_MAX = 50;

const VENTANAS: Partial<Record<Revision, { antes: number; despues: number }>> = {
  "arranque-motor": { antes: 0, despues: 30 },
  magnetos: { antes: 15, despues: 30 },
  // Volando, la velocidad tarda en quedar en el rango (Erik, prueba en vivo 2026-11-06).
  "vel-ascenso": { antes: 0, despues: 45 },
  "vel-aproximacion": { antes: 0, despues: 45 },
  ralenti: { antes: 0, despues: 30 },
};

/** Segundos antes y después de oír el punto en que se busca. Por defecto {antes: 0, despues: 10}. */
export function ventana(r: Revision): { antes: number; despues: number } {
  return VENTANAS[r] ?? { antes: 0, despues: 10 };
}

const entre = (x: number | undefined, a: number, b: number) => (x === undefined ? undefined : x >= a && x <= b);
const no = (x: boolean | undefined) => (x === undefined ? undefined : !x);
const y = (a: boolean | undefined, b: boolean | undefined) => (a === undefined || b === undefined ? undefined : a && b);

type Regla = (m: Muestra, elevFt: number) => boolean | undefined;

const ESTADO: Record<Exclude<Revision, "magnetos">, Regla> = {
  freno: (m) => m.freno,
  "acelerador-cuarto": (m) => entre(m.acelerador, 5, 20),
  "mezcla-corte": (m) => (m.mezcla === undefined ? undefined : m.mezcla < 5),
  "mezcla-rica": (m) => (m.mezcla === undefined ? undefined : m.mezcla > 80),
  "mezcla-empobrecida": (m) => (m.mezcla === undefined ? undefined : m.mezcla < 95),
  "mezcla-aeropuerto": (m, e) => (m.mezcla === undefined ? undefined : e >= AEROPUERTO_ALTO_FT ? m.mezcla < 95 : m.mezcla > 80),
  "master-on": (m) => m.master,
  "master-off": (m) => no(m.master),
  "beacon-on": (m) => m.luzBeacon,
  "nav-on": (m) => m.luzNav,
  "taxi-on": (m) => m.luzTaxi,
  "aterrizaje-on": (m) => m.luzAterrizaje,
  "aterrizaje-off": (m) => no(m.luzAterrizaje),
  "strobe-on": (m) => m.luzStrobe,
  "strobe-off": (m) => no(m.luzStrobe),
  "arranque-motor": (m) => m.motor,
  "corte-motor": (m) => y(m.mezcla === undefined ? undefined : m.mezcla < 5, no(m.motor)),
  "magnetos-off": (m) => y(no(m.magIzq), no(m.magDer)),
  "flaps-arriba": (m) => (m.flaps === undefined ? undefined : m.flaps === 0),
  "flaps-despegue": (m) => entre(m.flaps, 0, 1),
  altimetro: (m) => (m.altimetro === undefined || m.qnh === undefined ? undefined : Math.abs(m.altimetro - m.qnh) <= 0.02 + 1e-9),
  "rpm-1800": (m) => entre(m.rpm, 1700, 1900),
  ralenti: (m) => y(m.acelerador === undefined ? undefined : m.acelerador < 5, entre(m.rpm, -Infinity, 1050)),
  "xpdr-alt": (m) => (m.xpdrModo === undefined ? undefined : m.xpdrModo === 4),
  "vel-ascenso": (m) => !m.enTierra && m.velocidad >= 65 && m.velocidad <= 85,
  "potencia-crucero": (m) => entre(m.rpm, 2100, 2700),
  "vel-aproximacion": (m) => (m.flaps === undefined ? undefined : m.flaps > 0 ? entre(m.velocidad, 60, 70) : entre(m.velocidad, 65, 75)),
  "avionica-on": (m) => m.avionica,
  "avionica-off": (m) => no(m.avionica),
  "selector-ambos": (m) => (m.selector === undefined ? undefined : m.selector === 1),
  "selector-tanque": (m) => (m.selector === undefined ? undefined : m.selector === 2 || m.selector === 3),
  "valvula-abierta": (m) => m.valvula,
  "bomba-on": (m) => m.bomba,
  "bomba-off": (m) => no(m.bomba),
  "autopiloto-off": (m) => no(m.autopiloto),
  "trim-despegue": (m) => entre(m.trim, TRIM_DESPEGUE.min, TRIM_DESPEGUE.max),
};

/** Cada magneto solo, la caída contra la última rpm con los dos, y al final los dos encendidos. */
function magnetos(ms: Muestra[]): Revisado | null {
  if (ms.some((m) => m.magIzq === undefined || m.magDer === undefined || m.rpm === undefined)) return null;
  const primero = ms.findIndex((m) => m.magIzq !== m.magDer);
  if (primero < 0) return { ok: false };
  const previa = ms.slice(0, primero).reverse().find((m) => m.magIzq && m.magDer);
  const base = previa?.rpm ?? ms[primero].rpm!;
  const solo = (izq: boolean) => ms.filter((m) => m.magIzq === izq && m.magDer === !izq);
  const izq = solo(true);
  const der = solo(false);
  const ultimoSolo = ms.reduce((k, m, i) => (m.magIzq !== m.magDer ? i : k), -1);
  const despues = ms.slice(ultimoSolo + 1).some((m) => m.magIzq && m.magDer);
  if (!izq.length || !der.length || !despues) return { ok: false };
  const caidaIzq = Math.round(base - Math.min(...izq.map((m) => m.rpm!)));
  const caidaDer = Math.round(base - Math.min(...der.map((m) => m.rpm!)));
  const ok = caidaIzq <= CAIDA_MAX && caidaDer <= CAIDA_MAX && Math.abs(caidaIzq - caidaDer) <= DIFERENCIA_MAX;
  return ok ? { ok } : { ok, detalle: `caída izq ${caidaIzq} RPM, der ${caidaDer} RPM` };
}

/** null si las muestras no traen el campo (lector viejo): el punto queda solo por voz. */
export function revisar(r: Revision, muestras: Muestra[], ctx: ContextoRevision): Revisado | null {
  if (!muestras.length) return null;
  if (r === "magnetos") return magnetos(muestras);
  const regla = ESTADO[r];
  const elev = ctx.elevacionFt ?? muestras[0].altitud - muestras[0].agl;
  if (regla(muestras[muestras.length - 1], elev) === undefined) return null;
  return { ok: muestras.some((m) => regla(m, elev) === true) };
}
