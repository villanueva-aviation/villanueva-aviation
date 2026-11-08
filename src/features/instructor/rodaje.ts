// Rutas de rodaje con los datos de calles del propio simulador (TAXI_POINT, TAXI_PATH, TAXI_NAME, TAXI_PARKING).
// Puro: la ruta más corta (Dijkstra) por tramos de rodaje y de estacionamiento, nunca por pista, dicha como nombres de calle.
import { aNm } from "../home/navGeo.ts";

/** Tipos de tramo del SDK de MSFS: 1 rodaje, 2 pista, 3 estacionamiento. */
export type TipoTramo = 1 | 2 | 3;
export interface PuntoCalle {
  lat: number;
  lon: number;
}
/** inicio y fin son índices en `puntos`; en tramos tipo 3, inicio es índice en `estacionamientos`. nombre: índice en `nombres`, −1 = sin nombre. */
export interface TramoCalle {
  inicio: number;
  fin: number;
  tipo: TipoTramo;
  nombre: number;
}
export interface DatosCalles {
  puntos: PuntoCalle[];
  tramos: TramoCalle[];
  nombres: string[];
  estacionamientos: (PuntoCalle & { nombre?: string })[];
}
export type Origen = { punto: number } | { estacionamiento: number };

interface Arista {
  a: number;
  nombre: string | null;
  nm: number;
}

/** Nodos: los puntos primero y después los estacionamientos (índice = puntos.length + i). */
function grafo(d: DatosCalles): Arista[][] {
  const np = d.puntos.length;
  const ady: Arista[][] = Array.from({ length: np + d.estacionamientos.length }, () => []);
  const coord = (n: number) => (n < np ? d.puntos[n] : d.estacionamientos[n - np]);
  for (const t of d.tramos) {
    if (t.tipo !== 1 && t.tipo !== 3) continue; // la pista no se cruza
    const u = t.tipo === 3 ? np + t.inicio : t.inicio;
    const v = t.fin;
    if (!coord(u) || !coord(v) || u === v) continue;
    const ref = coord(u);
    const pu = aNm(ref.lat, ref.lon, ref.lat, ref.lon);
    const pv = aNm(coord(v).lat, coord(v).lon, ref.lat, ref.lon);
    const nm = Math.hypot(pv.x - pu.x, pv.y - pu.y);
    const nombre = t.tipo === 1 ? (d.nombres[t.nombre] ?? null) : null;
    ady[u].push({ a: v, nombre, nm });
    ady[v].push({ a: u, nombre, nm });
  }
  return ady;
}

/** Nombres de calle de la ruta más corta de `desde` a un punto de espera; [] si ya está ahí; null si no hay ruta. */
export function rutaRodaje(d: DatosCalles, desde: Origen, hastaPunto: number): string[] | null {
  const np = d.puntos.length;
  const ini = "punto" in desde ? desde.punto : np + desde.estacionamiento;
  const total = np + d.estacionamientos.length;
  if (!Number.isInteger(ini) || ini < 0 || ini >= total) return null;
  if (!Number.isInteger(hastaPunto) || hastaPunto < 0 || hastaPunto >= np) return null;
  if (ini === hastaPunto) return [];
  const ady = grafo(d);
  const dist = new Array<number>(total).fill(Infinity);
  const previo = new Array<{ n: number; nombre: string | null } | null>(total).fill(null);
  const listo = new Array<boolean>(total).fill(false);
  dist[ini] = 0;
  for (;;) {
    let u = -1;
    for (let k = 0; k < total; k++) if (!listo[k] && dist[k] < Infinity && (u < 0 || dist[k] < dist[u])) u = k;
    if (u < 0 || u === hastaPunto) break;
    listo[u] = true;
    for (const e of ady[u])
      if (dist[u] + e.nm < dist[e.a]) {
        dist[e.a] = dist[u] + e.nm;
        previo[e.a] = { n: u, nombre: e.nombre };
      }
  }
  if (dist[hastaPunto] === Infinity) return null;
  const al_reves: string[] = [];
  for (let n = hastaPunto; previo[n]; n = previo[n]!.n) {
    const nombre = previo[n]!.nombre;
    if (nombre && al_reves[al_reves.length - 1] !== nombre) al_reves.push(nombre);
  }
  return al_reves.reverse();
}

/** El punto de calle más cercano a (lat, lon), para armar la ruta desde donde está el avión; null si no hay puntos. */
export function puntoMasCercano(d: DatosCalles, lat: number, lon: number): number | null {
  let mejor: number | null = null;
  let mejorD = Infinity;
  d.puntos.forEach((p, k) => {
    const q = aNm(p.lat, p.lon, lat, lon);
    const dd = q.x * q.x + q.y * q.y;
    if (dd < mejorD) {
      mejorD = dd;
      mejor = k;
    }
  });
  return mejor;
}
