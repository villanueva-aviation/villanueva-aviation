import { virajeEstablecido, type Campo, type Resultado } from "./evaluador.ts";
import { nivelDe, tolViraje, type Nivel } from "./nivel.ts";
import { serie } from "./explicacion.ts";
import type { CodigoAcs } from "./virajeEscarpado.ts";

export type Revision = "sin_mandar" | "mandado" | "aprobado" | "no_aprobado";
export type Serie = { t: number; v: number }[];
export type SeriesLado = Record<Campo, Serie>;
/** Lo que se guarda en `detalle`: el resultado sin las muestras crudas, con una serie corta por lado y campo. */
export type ResultadoGuardado = Omit<Resultado, "muestras"> & { series: SeriesLado[] };

export interface IntentoManiobra {
  id: string;
  user_id: string;
  maniobra: string;
  avion: string;
  modo: "practica" | "checkride";
  calificacion: number;
  aprobado: boolean;
  elementos: Record<CodigoAcs, "S" | "NS">;
  detalle: ResultadoGuardado;
  revision: Revision;
  revisado_at: string | null;
  created_at: string;
  /** Sesión de una hora del programa; null en los intentos de la página. */
  sesion_id: string | null;
}

export type ResumenSesion = {
  sesionId: string;
  email: string | null;
  inicio: string;
  intentos: number;
  checkride: { calificacion: number; aprobado: boolean } | null;
  /** Los niveles de las prácticas de la sesión, de Fácil a Difícil. */
  niveles: Nivel[];
  /** La lección del vuelo completo (repaso general) que agrupa los intentos de la sesión. */
  leccion: { nombre: string; modo: "practica" | "checkride"; calificacion: number; aprobado: boolean; nivel: Nivel } | null;
};

/** Renglones de intentos_maniobra que son una lección entera, no una maniobra. */
export const LECCIONES_GUARDADAS: Record<string, string> = { "repaso-general": "Repaso general" };

/** Una fila por sesión del programa, la más nueva primero. Los intentos sin sesión no cuentan. */
export function agruparSesiones(intentos: (IntentoManiobra & { email: string | null })[]): ResumenSesion[] {
  const porSesion = new Map<string, ResumenSesion>();
  for (const i of [...intentos].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    if (!i.sesion_id) continue;
    const s = porSesion.get(i.sesion_id) ?? { sesionId: i.sesion_id, email: i.email, inicio: i.created_at, intentos: 0, checkride: null, niveles: [], leccion: null };
    const leccion = LECCIONES_GUARDADAS[i.maniobra];
    if (leccion) s.leccion = { nombre: leccion, modo: i.modo, calificacion: i.calificacion, aprobado: i.aprobado, nivel: nivelDe(i.detalle) };
    else {
      s.intentos++;
      if (i.modo === "checkride") s.checkride = { calificacion: i.calificacion, aprobado: i.aprobado };
      else if (!s.niveles.includes(nivelDe(i.detalle))) s.niveles = [...s.niveles, nivelDe(i.detalle)].sort();
    }
    porSesion.set(i.sesion_id, s);
  }
  return [...porSesion.values()].sort((a, b) => b.inicio.localeCompare(a.inicio));
}

export function puedeMandar(i: Pick<IntentoManiobra, "modo" | "aprobado" | "revision">): boolean {
  return i.modo === "checkride" && i.aprobado && i.revision === "sin_mandar";
}

export function insigniaManiobraGanada(intentos: Pick<IntentoManiobra, "maniobra" | "revision">[], maniobra: string): boolean {
  return intentos.some((i) => i.maniobra === maniobra && i.revision === "aprobado");
}

export function folio(id: string): string {
  return `VA-${id.slice(0, 4)}-${id.slice(4, 8)}`.toUpperCase();
}

const NOMBRE_FALLA = {
  altitud: "altitud",
  velocidad: "velocidad",
  inclinacion: "inclinación",
  bola: "coordinación",
  rumbo: "rumbo de salida",
} as const;

export function resumenProgreso(intentos: IntentoManiobra[]): {
  intentos: { n: number; calificacion: number; modo: string }[];
  mejor: number | null;
  masFallada: string | null;
} {
  const orden = [...intentos].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const cuenta = new Map<keyof typeof NOMBRE_FALLA, number>();
  for (const i of orden) for (const l of i.detalle.lados) {
    for (const c of Object.keys(NOMBRE_FALLA) as (keyof typeof NOMBRE_FALLA)[]) if (l.ns[c]) cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
  }
  let masFallada: string | null = null;
  let max = 0;
  for (const [c, n] of cuenta) if (n > max) [max, masFallada] = [n, NOMBRE_FALLA[c]];
  return {
    intentos: orden.map((i, k) => ({ n: k + 1, calificacion: i.calificacion, modo: i.modo })),
    mejor: orden.length ? Math.max(...orden.map((i) => i.calificacion)) : null,
    masFallada,
  };
}

/** Series de cada lado, desde su entrada hasta la entrada del siguiente (o el final). */
export function paraGuardar(r: Resultado): ResultadoGuardado {
  const { muestras, ...resto } = r;
  const giroMin = tolViraje(r.nivel).giroMin;
  const series = r.lados.map((l, k) => {
    const fin = r.lados[k + 1]?.entrada.t ?? Infinity;
    const tramo = muestras.filter((m) => m.t >= l.entrada.t && m.t < fin);
    return {
      altitud: serie(tramo, "altitud", l.entrada.altitud),
      velocidad: serie(tramo, "velocidad", l.entrada.velocidad),
      inclinacion: serie(virajeEstablecido(tramo, giroMin), "inclinacion", 0),
      bola: serie(virajeEstablecido(tramo, giroMin), "bola", 0),
    };
  });
  return { ...resto, series };
}
