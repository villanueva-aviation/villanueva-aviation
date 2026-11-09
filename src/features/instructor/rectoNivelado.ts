// Recto y nivelado (práctica, no es tarea del ACS). Valores de partida: se afinan tras un vuelo real.

// Tolerancias y duración por nivel: nivel.ts (tolRecto).
/** Lo que dura el tramo calificado en Difícil; el simulador de pruebas vuela este tiempo. */
export const DURACION_SEG = 120;
/**
 * Estable = en los últimos `seg`: alas a menos de `inclinacion`° y rango de altitud, velocidad y rumbo
 * dentro de estos márgenes. 15 ft en 5 s deja fuera una subida o bajada de 180 ft/min o más.
 */
export const ESTABLE = { seg: 5, inclinacion: 5, altitudFt: 15, velocidadKt: 4, rumboGrados: 3 } as const;
