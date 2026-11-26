// Matemática de los mosaicos de elevación (Web Mercator) para la vista sintética. Pura.
export type Mosaico = { z: number; x: number; y: number };
export type Calidad = "baja" | "media" | "alta";

const RAD = Math.PI / 180;

export function mosaicoDe(lat: number, lon: number, z: number): Mosaico {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const l = Math.max(-85.05, Math.min(85.05, lat)) * RAD;
  const y = Math.floor(((1 - Math.log(Math.tan(l) + 1 / Math.cos(l)) / Math.PI) / 2) * n);
  return { z, x: ((x % n) + n) % n, y: Math.min(n - 1, Math.max(0, y)) };
}

/** Bordes en grados de un mosaico. */
export function limitesMosaico(m: Mosaico): { oeste: number; este: number; norte: number; sur: number } {
  const n = 2 ** m.z;
  const lat = (y: number) => Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) / RAD;
  return { oeste: (m.x / n) * 360 - 180, este: ((m.x + 1) / n) * 360 - 180, norte: lat(m.y), sur: lat(m.y + 1) };
}

export function alrededor(lat: number, lon: number, z: number, radio: number): Mosaico[] {
  const c = mosaicoDe(lat, lon, z);
  const n = 2 ** z;
  const lista: Mosaico[] = [];
  for (let dy = -radio; dy <= radio; dy++) {
    const y = c.y + dy;
    if (y < 0 || y >= n) continue;
    for (let dx = -radio; dx <= radio; dx++) lista.push({ z, x: (((c.x + dx) % n) + n) % n, y });
  }
  return lista;
}

export function metrosTerrarium(r: number, g: number, b: number): number {
  return r * 256 + g + b / 256 - 32768;
}

export function urlMosaico(m: Mosaico): string {
  return `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${m.z}/${m.x}/${m.y}.png`;
}

export function anillos(calidad: Calidad): { z: number; radio: number; segmentos: number }[] {
  if (calidad === "alta") return [{ z: 12, radio: 2, segmentos: 64 }, { z: 10, radio: 2, segmentos: 32 }, { z: 8, radio: 2, segmentos: 16 }];
  if (calidad === "media") return [{ z: 12, radio: 1, segmentos: 32 }, { z: 10, radio: 2, segmentos: 16 }, { z: 8, radio: 1, segmentos: 16 }];
  return [{ z: 11, radio: 1, segmentos: 32 }, { z: 8, radio: 1, segmentos: 16 }];
}
