// Reglas de la lección estilo Rise: el candado (nadie se queda atorado), el capítulo de la URL y los enlaces viejos.
import type { Bloque } from "./motor.ts";

export interface EstadoCandado {
  fallos: number;
  abierto: boolean;
  elegida: number | null;
}

export const CANDADO_NUEVO: EstadoCandado = { fallos: 0, abierto: false, elegida: null };

/** Bien abre; el primer fallo deja reintentar; el segundo abre (y la pantalla muestra la correcta). */
export function responderCandado(e: EstadoCandado, opcion: number, correcta: number): EstadoCandado {
  if (e.abierto) return e;
  if (opcion === correcta) return { fallos: e.fallos, abierto: true, elegida: opcion };
  const fallos = e.fallos + 1;
  return { fallos, abierto: fallos >= 2, elegida: opcion };
}

const temasDe = (bloques: Bloque[]) => bloques.flatMap((b) => (b.tipo === "lectura" ? b.temas : []));

/**
 * Un candado aparece abierto si el cadete ya leyó lo que protege: el tema que le sigue o,
 * si no le sigue ningún tema, todo el capítulo.
 */
export function candadoAbiertoDeInicio(bloques: Bloque[], i: number, hecha: (id: string) => boolean): boolean {
  const siguiente = temasDe(bloques.slice(i + 1))[0];
  return siguiente ? hecha(siguiente.id) : temasDe(bloques).every((t) => hecha(t.id));
}

/** Capítulo (0-based) pedido por ?capitulo=N o, en enlaces viejos de Fundamentos, ?mision=N; lo inválido cae en `inicial`. */
export function capituloDeUrl(capitulo: string | null, mision: string | null, total: number, inicial: number): number {
  const pedido = capitulo ?? mision;
  const n = Number(pedido);
  return pedido !== null && Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : inicial;
}

/** Etapa con la que abre el módulo: las viejas «interactividad» y «misiones» ahora son parte de la lección. */
export function etapaInicial(etapa: string | null, etapas: string[]): string {
  const e = etapa === "interactividad" || etapa === "misiones" ? "leccion" : etapa;
  return e && etapas.includes(e) ? e : "introduccion";
}
