// Si un punto del checklist se ve hecho en el simulador. Lo usa el checklist por voz después de oír cada punto.
import type { Muestra } from "./evaluador.ts";

export type Revision =
  | "freno" | "acelerador-cuarto" | "mezcla-corte" | "mezcla-rica" | "mezcla-aeropuerto" | "mezcla-empobrecida"
  | "master-on" | "master-off" | "beacon-on" | "nav-on" | "taxi-on" | "aterrizaje-on" | "aterrizaje-off"
  | "strobe-on" | "strobe-off" | "arranque-motor" | "corte-motor" | "magnetos" | "magnetos-off"
  | "flaps-arriba" | "flaps-despegue" | "altimetro" | "rpm-prueba" | "ralenti" | "xpdr-alt"
  | "vel-ascenso" | "potencia-crucero" | "vel-aproximacion"
  // v1.5
  | "avionica-on" | "avionica-off" | "selector-ambos" | "selector-tanque" | "valvula-abierta"
  | "bomba-on" | "bomba-off" | "autopiloto-off" | "trim-despegue"
  // C152 y Arrow
  | "acelerador-media" | "rpm-1000" | "rpm-calentamiento" | "acelerador-cerrado" | "tren-arriba" | "tren-abajo" | "freno-quitado"
  | "rpm-800" | "acelerador-completo" | "valvula-cerrada";

export const ES_V15: ReadonlySet<Revision> = new Set<Revision>([
  "avionica-on", "avionica-off", "selector-ambos", "selector-tanque", "valvula-abierta",
  "bomba-on", "bomba-off", "autopiloto-off", "trim-despegue", "valvula-cerrada",
]);

/** Lo que cambia de un avión a otro. Rangos [mín, máx]. */
export type Limites = {
  rpmPrueba: [number, number];
  caidaMag: number;
  velAscenso: [number, number];
  crucero: [number, number];
  aproximacion: { flaps: [number, number]; limpio: [number, number] };
};
export const LIMITES_C172: Limites = {
  rpmPrueba: [1700, 1900],
  caidaMag: 150,
  velAscenso: [65, 85],
  crucero: [2100, 2700],
  aproximacion: { flaps: [60, 70], limpio: [65, 75] },
};

export type ContextoRevision = { elevacionFt: number | null; limites?: Limites };
export type Revisado = { ok: boolean; detalle?: string };

// En el C172 de MSFS la marca de despegue lee 7.4 % (Erik, 2026-11-06); se acepta ±10.
export const TRIM_DESPEGUE = { min: -2.6, max: 17.4 };
const AEROPUERTO_ALTO_FT = 3000;
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

type Regla = (m: Muestra, elevFt: number, l: Limites) => boolean | undefined;

const ESTADO: Record<Exclude<Revision, "magnetos">, Regla> = {
  freno: (m) => m.freno,
  "freno-quitado": (m) => no(m.freno),
  "rpm-800": (m) => entre(m.rpm, 650, 950),
  "acelerador-completo": (m) => (m.acelerador === undefined ? undefined : m.acelerador >= 95),
  "valvula-cerrada": (m) => no(m.valvula),
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
  "rpm-prueba": (m, _, l) => entre(m.rpm, ...l.rpmPrueba),
  ralenti: (m) => y(m.acelerador === undefined ? undefined : m.acelerador < 5, entre(m.rpm, -Infinity, 1050)),
  "xpdr-alt": (m) => (m.xpdrModo === undefined ? undefined : m.xpdrModo === 4),
  "vel-ascenso": (m, _, l) => !m.enTierra && (entre(m.velocidad, ...l.velAscenso) as boolean),
  "potencia-crucero": (m, _, l) => entre(m.rpm, ...l.crucero),
  "vel-aproximacion": (m, _, l) => (m.flaps === undefined ? undefined : entre(m.velocidad, ...(m.flaps > 0 ? l.aproximacion.flaps : l.aproximacion.limpio))),
  "avionica-on": (m) => m.avionica,
  "avionica-off": (m) => no(m.avionica),
  "selector-ambos": (m) => (m.selector === undefined ? undefined : m.selector === 1),
  "selector-tanque": (m) => (m.selector === undefined ? undefined : m.selector === 2 || m.selector === 3),
  "valvula-abierta": (m) => m.valvula,
  "bomba-on": (m) => m.bomba,
  "bomba-off": (m) => no(m.bomba),
  "autopiloto-off": (m) => no(m.autopiloto),
  "trim-despegue": (m) => entre(m.trim, TRIM_DESPEGUE.min, TRIM_DESPEGUE.max),
  "acelerador-media": (m) => entre(m.acelerador, 5, 25),
  "rpm-1000": (m) => entre(m.rpm, -Infinity, 1050),
  "rpm-calentamiento": (m) => entre(m.rpm, 1350, 1550),
  "acelerador-cerrado": (m) => (m.acelerador === undefined ? undefined : m.acelerador < 5),
  // GEAR HANDLE POSITION: verdadero es abajo.
  "tren-arriba": (m) => no(m.tren),
  "tren-abajo": (m) => m.tren,
};

/** Cada magneto solo, la caída contra la última rpm con los dos, y al final los dos encendidos. */
function magnetos(ms: Muestra[], caidaMax: number): Revisado | null {
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
  const ok = caidaIzq <= caidaMax && caidaDer <= caidaMax && Math.abs(caidaIzq - caidaDer) <= DIFERENCIA_MAX;
  return ok ? { ok } : { ok, detalle: `caída izq ${caidaIzq} RPM, der ${caidaDer} RPM` };
}

/** null si las muestras no traen el campo (lector viejo): el punto queda solo por voz. */
export function revisar(r: Revision, muestras: Muestra[], ctx: ContextoRevision): Revisado | null {
  if (!muestras.length) return null;
  const l = ctx.limites ?? LIMITES_C172;
  if (r === "magnetos") return magnetos(muestras, l.caidaMag);
  const regla = ESTADO[r];
  const elev = ctx.elevacionFt ?? muestras[0].altitud - muestras[0].agl;
  if (regla(muestras[muestras.length - 1], elev, l) === undefined) return null;
  return { ok: muestras.some((m) => regla(m, elev, l) === true) };
}
