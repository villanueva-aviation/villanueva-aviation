// Reglas puras de cobro de las sesiones 1 a 1 (sin Supabase, para poder probarlas).

/** Prefijo del tema con el que Academia envía los proyectos finales a la misma tabla. */
export const PREFIJO_PROYECTO_FINAL = "Proyecto final —";

/** Estados en los que la cita ya tiene fecha acordada y por tanto se cobra. */
const ESTADOS_COBRABLES = ["confirmada", "completada"];

/** Los proyectos finales de Academia viven en la misma tabla que las citas, pero nunca se cobran. */
export function esProyectoFinal(tema: string | null): boolean {
  return Boolean(tema?.startsWith(PREFIJO_PROYECTO_FINAL));
}

export function esSesionCobrable(r: { tipo: string; tema: string | null; estado: string }): boolean {
  return ESTADOS_COBRABLES.includes(r.estado) && !esProyectoFinal(r.tema);
}

/**
 * Reparte las citas en "incluida" (la primera del cadete, la del paquete) y el resto.
 * Recibe las reservas en cualquier orden y decide por antigüedad.
 */
export function sesionIncluidaId<T extends { id: string; tipo: string; tema: string | null; estado: string; created_at: string }>(
  reservas: T[],
): string | null {
  const cobrables = reservas.filter(esSesionCobrable).sort((a, b) => a.created_at.localeCompare(b.created_at));
  return cobrables[0]?.id ?? null;
}

/** Para el panel del fundador: la sesión incluida de CADA cadete, por usuario. */
export function sesionesIncluidasPorCadete<
  T extends { id: string; user_id: string; tipo: string; tema: string | null; estado: string; created_at: string },
>(reservas: T[]): Set<string> {
  const porCadete = new Map<string, T[]>();
  for (const r of reservas) {
    porCadete.set(r.user_id, [...(porCadete.get(r.user_id) ?? []), r]);
  }
  const ids = new Set<string>();
  for (const lista of porCadete.values()) {
    const id = sesionIncluidaId(lista);
    if (id) ids.add(id);
  }
  return ids;
}
