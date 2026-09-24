import { ACADEMIA_MODULOS } from "../../data/academia.ts";

/**
 * Reubica las lecciones ya completadas cuando un módulo se parte en dos.
 *
 * El progreso se guarda como `completadas[slug] = [ids de actividad]`. Al
 * partir Navegación, los temas 13 al 26 cambiaron de módulo, así que un cadete
 * que ya los había estudiado los vería otra vez como pendientes.
 *
 * Los ids de lección son únicos en toda la Academia (`navegacion-tema14`), así
 * que se pueden reubicar solos. Los de interactividad, práctica y evaluación
 * NO lo son —`interactividad-1` existe en todos los módulos— y por eso se
 * quedan donde están: moverlos sería adivinar.
 */
export function reindexarLecciones(completadas: Record<string, string[]>): {
  completadas: Record<string, string[]>;
  cambio: boolean;
} {
  const moduloDe = new Map<string, string>();
  for (const modulo of ACADEMIA_MODULOS) {
    for (const actividad of modulo.actividades) {
      if (actividad.tipo === "leccion") moduloDe.set(actividad.id, modulo.slug);
    }
  }

  const salida: Record<string, string[]> = {};
  let cambio = false;

  const agregar = (slug: string, id: string) => {
    const lista = (salida[slug] ??= []);
    if (!lista.includes(id)) lista.push(id);
  };

  for (const [slug, ids] of Object.entries(completadas)) {
    salida[slug] ??= [];
    for (const id of ids) {
      const destino = moduloDe.get(id) ?? slug;
      if (destino !== slug) cambio = true;
      agregar(destino, id);
    }
  }

  return { completadas: salida, cambio };
}
