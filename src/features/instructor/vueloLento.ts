// Vuelo lento (ACS Área VII Tarea A). Valores de partida: se afinan tras un vuelo real.

export const TOLERANCIAS_LENTO = { altitudFt: 100, rumboGrados: 10, inclinacionGrados: 10, velocidadMasKt: 10 } as const;
/** Velocidad objetivo con flaps completos; la banda es +10/−0. Sin flaps el aviso del C172 suena cerca de aquí. */
export const OBJETIVO_KT = 55;
/** La inclinación indicada en los virajes suaves. */
export const INCLINACION_VIRAJE = 15;
/** Lo que dura el tramo recto desde que el avión queda en la banda. */
export const RECTO_SEG = 30;
/** Segundos estable en la banda para tomar el objetivo. */
export const ENTRADA_SEG = 3;
export const GIRO_GRADOS = 90;
/** Fuera del vuelo lento = potencia y velocidad; si no sale en maxSeg, no pasa. */
export const SALIDA = { rpm: 2300, kt: 70, maxSeg: 30 } as const;
