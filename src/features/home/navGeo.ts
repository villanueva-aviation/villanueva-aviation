// Geometría de la pantalla de navegación del inicio (pura, para poder probarla con `npm test`).
// Plano local en millas náuticas: x hacia el este, y hacia el norte. Rumbos en grados, 0 = norte, horario.

export interface PuntoNm {
  x: number;
  y: number;
}

const RAD = Math.PI / 180;

/** Proyección equirectangular alrededor de una latitud de referencia; basta para tramos de ~100 NM. */
export function aNm(lat: number, lon: number, lat0: number, lon0: number): PuntoNm {
  return { x: (lon - lon0) * 60 * Math.cos(lat0 * RAD), y: (lat - lat0) * 60 };
}

/** Rumbo verdadero de `a` hacia `b`, entre 0 y 360. */
export function rumbo(a: PuntoNm, b: PuntoNm): number {
  return (Math.atan2(b.x - a.x, b.y - a.y) / RAD + 360) % 360;
}

/** Diferencia más corta de `desde` a `hacia`, entre -180 y 180 (positivo = a la derecha). */
export function difAngulo(desde: number, hacia: number): number {
  return ((((hacia - desde) % 360) + 540) % 360) - 180;
}

/**
 * Lleva un punto del mapa a la pantalla con el rumbo hacia arriba ("track up"):
 * el avión está en `centro` (px) y `escala` son px por NM.
 */
export function aPantalla(p: PuntoNm, avion: PuntoNm, rumboDeg: number, centro: PuntoNm, escala: number): PuntoNm {
  const dx = p.x - avion.x;
  const dy = p.y - avion.y;
  const h = rumboDeg * RAD;
  const derecha = dx * Math.cos(h) - dy * Math.sin(h);
  const adelante = dx * Math.sin(h) + dy * Math.cos(h);
  return { x: centro.x + derecha * escala, y: centro.y - adelante * escala };
}
