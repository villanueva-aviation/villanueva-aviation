// Recto y nivelado (práctica, no es tarea del ACS). Valores de partida: se afinan tras un vuelo real.

export const TOLERANCIAS_RECTO = { altitudFt: 100, rumboGrados: 10, velocidadKt: 10 } as const;
/** Lo que dura el tramo calificado, desde que el avión queda estable. */
export const DURACION_SEG = 120;
/**
 * Estable = en los últimos `seg`: alas a menos de `inclinacion`° y rango de altitud, velocidad y rumbo
 * dentro de estos márgenes. 15 ft en 5 s deja fuera una subida o bajada de 180 ft/min o más.
 */
export const ESTABLE = { seg: 5, inclinacion: 5, altitudFt: 15, velocidadKt: 4, rumboGrados: 3 } as const;
/** El instructor avisa a la mitad del tramo. */
export const MITAD_SEG = 60;
