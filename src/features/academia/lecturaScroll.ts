// Lógica pura de la lectura con scroll: qué paso está en pantalla y qué temas ya se leyeron.
// El componente (LeccionScroll) solo mide posiciones con getBoundingClientRect y llama a esto.
import type { Tema } from "../../data/moduleContent.ts";

export interface PasoTexto {
  titulo?: string;
  texto: string;
}

/** Cada tema se lee en pasos: la idea clave y cada punto; sin puntos, el texto completo es uno solo. */
export function pasosDeTema(tema: Tema): PasoTexto[] {
  if (tema.clave && tema.puntos) return [{ texto: tema.clave }, ...tema.puntos.map((p) => ({ titulo: p.titulo, texto: p.texto }))];
  return [{ texto: tema.texto }];
}

/** El último paso cuyo borde superior ya cruzó la mitad de la pantalla (0 si ninguno). */
export function pasoActivo(tops: number[], mitad: number): number {
  let activo = 0;
  tops.forEach((top, i) => {
    if (top <= mitad) activo = i;
  });
  return activo;
}

/** Posiciones de un tema relativas a la ventana: inicio del primer paso, fin del último y borde superior del último. */
export interface MedidaTema {
  id: string;
  arriba: number;
  abajo: number;
  topUltimo: number;
}

/**
 * Un tema cuenta como leído cuando estuvo en pantalla alguna vez y su último paso ya quedó arriba de la mitad.
 * Exigir que haya estado en pantalla evita marcar la lectura de una misión nueva que se monta arriba de la vista.
 */
export function leidosAhora(medidas: MedidaTema[], alto: number, vistos: ReadonlySet<string>): { vistos: Set<string>; leidos: string[] } {
  const nuevos = new Set(vistos);
  for (const m of medidas) if (m.arriba < alto && m.abajo > 0) nuevos.add(m.id);
  const leidos = medidas.filter((m) => nuevos.has(m.id) && m.topUltimo < alto / 2).map((m) => m.id);
  return { vistos: nuevos, leidos };
}
