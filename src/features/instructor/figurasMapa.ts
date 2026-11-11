import { norm, SECTORES, type Entrada, type Giros } from "../entrenador/esperas.ts";

// Las figuras IFR del mapa del debriefing (arcos y esperas), en lat/lon. Puro.
// Rumbos magnéticos del ejercicio + `decl` = verdaderos. Plano local, suficiente para 60 NM.

type LatLon = [number, number];
const RAD = Math.PI / 180;

/** `nm` millas desde (lat, lon) al rumbo verdadero `rumbo`. */
export const destino = (lat: number, lon: number, rumbo: number, nm: number): LatLon => [
  lat + (nm * Math.cos(rumbo * RAD)) / 60,
  lon + (nm * Math.sin(rumbo * RAD)) / 60 / Math.cos(lat * RAD),
];

/** El arco de `radioNm`, un punto cada 2°, del radial `desde` al `hasta` en el `sentido` dado (+1 = radiales crecientes). */
export function puntosArco(vor: { lat: number; lon: number }, radioNm: number, desde: number, hasta: number, sentido: 1 | -1, decl: number): LatLon[] {
  const barrido = norm((hasta - desde) * sentido);
  const n = Math.ceil(barrido / 2);
  return Array.from({ length: n + 1 }, (_, k) => destino(vor.lat, vor.lon, desde + sentido * Math.min(2 * k, barrido) + decl, radioNm));
}

/** Radio de los virajes de la espera a unos 100 kt, NM. */
const RADIO_NM = 0.5;
const SECTOR_NM = 3;

/**
 * La pista de la espera (el fijo en el VOR, el acercamiento por el radial `acercamiento + 180`, los virajes hacia el lado de la espera)
 * y las tres cuñas de entrada: cada una cubre las direcciones desde las que llega quien vuela esa entrada.
 */
export function figuraEspera(
  vor: { lat: number; lon: number },
  espera: { acercamiento: number; giros: Giros; tramoSeg: number },
  decl: number,
): { pista: LatLon[]; sectores: { entrada: Entrada; poligono: LatLon[] }[] } {
  const alejamiento = norm(espera.acercamiento + 180);
  const derecha = espera.giros === "derecha";
  // u: a lo largo del radial de la espera; v: hacia el lado de la espera (a la izquierda del alejamiento si vira a la derecha).
  const bu = alejamiento + decl;
  const bv = bu + (derecha ? -90 : 90);
  const punto = (u: number, v: number): LatLon => {
    const este = u * Math.sin(bu * RAD) + v * Math.sin(bv * RAD);
    const norte = u * Math.cos(bu * RAD) + v * Math.cos(bv * RAD);
    return [vor.lat + norte / 60, vor.lon + este / 60 / Math.cos(vor.lat * RAD)];
  };
  const largo = (espera.tramoSeg * 100) / 3600;
  // Medio círculo alrededor de (u0, R) de `a0` a `a0 + 180` grados (0 = hacia +u).
  const medio = (u0: number, a0: number) =>
    Array.from({ length: 19 }, (_, k) => {
      const a = (a0 + k * 10) * RAD;
      return punto(u0 + RADIO_NM * Math.cos(a), RADIO_NM + RADIO_NM * Math.sin(a));
    });
  // Acercamiento hasta el fijo, viraje más allá del fijo, alejamiento y viraje de regreso.
  const pista = [punto(largo, 0), ...medio(0, 90).reverse(), punto(largo, 2 * RADIO_NM), ...medio(largo, -90).reverse()];
  pista.push(pista[0]);

  const sectores = SECTORES.map(({ entrada, desde, hasta }) => {
    const arco: LatLon[] = [];
    for (let d = desde; d <= hasta; d += 5) {
      const rumbo = derecha ? alejamiento + d : alejamiento - d;
      arco.push(destino(vor.lat, vor.lon, rumbo + 180 + decl, SECTOR_NM));
    }
    return { entrada, poligono: [[vor.lat, vor.lon] as LatLon, ...arco] };
  });
  return { pista, sectores };
}
