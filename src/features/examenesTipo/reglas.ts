import type { AreaExamen, PreguntaTipo } from "../../data/examenesTipo.ts";

export interface ResultadoGuardado {
  score: number;
  passed: boolean;
  /** Fecha ISO del último intento. */
  fecha?: string;
}

function barajar<T>(lista: T[], rand: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Cambia el orden de las opciones sin perder cuál es la correcta. */
function barajarOpciones(p: PreguntaTipo, rand: () => number): PreguntaTipo {
  const orden = barajar(p.opciones.map((_, i) => i), rand);
  return { ...p, opciones: orden.map((i) => p.opciones[i]), correcta: orden.indexOf(p.correcta) };
}

/**
 * Arma un intento de `n` preguntas: cada área aporta en proporción a su tamaño en el banco (al menos una),
 * así ningún intento sale con puras velocidades. El orden de preguntas y opciones cambia en cada intento.
 */
export function armarIntento(banco: PreguntaTipo[], n: number, rand: () => number = Math.random): PreguntaTipo[] {
  if (banco.length <= n) return barajar(banco, rand).map((p) => barajarOpciones(p, rand));

  const porArea = new Map<AreaExamen, PreguntaTipo[]>();
  for (const p of banco) porArea.set(p.area, [...(porArea.get(p.area) ?? []), p]);

  const elegidas: PreguntaTipo[] = [];
  const sobrantes: PreguntaTipo[] = [];
  for (const preguntas of porArea.values()) {
    const cuota = Math.max(1, Math.floor((preguntas.length / banco.length) * n));
    const mezcladas = barajar(preguntas, rand);
    elegidas.push(...mezcladas.slice(0, cuota));
    sobrantes.push(...mezcladas.slice(cuota));
  }
  const faltan = n - elegidas.length;
  const intento = faltan > 0 ? [...elegidas, ...barajar(sobrantes, rand).slice(0, faltan)] : elegidas.slice(0, n);
  return barajar(intento, rand).map((p) => barajarOpciones(p, rand));
}

/** Áreas con menos del mínimo de aciertos, de la más débil a la menos débil. */
export function areasAReforzar(preguntas: PreguntaTipo[], aciertos: boolean[], minimo: number): AreaExamen[] {
  const cuenta = new Map<AreaExamen, { bien: number; total: number }>();
  preguntas.forEach((p, i) => {
    const c = cuenta.get(p.area) ?? { bien: 0, total: 0 };
    cuenta.set(p.area, { bien: c.bien + (aciertos[i] ? 1 : 0), total: c.total + 1 });
  });
  return [...cuenta.entries()]
    .map(([area, c]) => ({ area, pct: (c.bien / c.total) * 100 }))
    .filter((a) => a.pct < minimo)
    .sort((a, b) => a.pct - b.pct)
    .map((a) => a.area);
}

/** Cuándo puede volver a presentar: null si ya puede. Aprobado no tiene espera (puede repasar cuando quiera). */
export function proximoIntento(guardado: ResultadoGuardado | null, esperaHoras: number, ahora = new Date()): Date | null {
  if (!guardado || guardado.passed || !guardado.fecha) return null;
  const libre = new Date(new Date(guardado.fecha).getTime() + esperaHoras * 3_600_000);
  return libre > ahora ? libre : null;
}

/** Lo que se guarda tras un intento: la insignia aprobada no se pierde por un repaso con menos puntos. */
export function combinarResultado(anterior: ResultadoGuardado | null, score: number, passed: boolean, fecha: string): ResultadoGuardado {
  if (anterior?.passed) return { score: Math.max(anterior.score, score), passed: true, fecha: anterior.fecha };
  return { score, passed, fecha };
}
