// Red de rutas propuesta para la aerolínea virtual (pura, para poder probarla con `npm test`).
// Base en Guadalajara: C408 regional, King Air C90 ejecutiva, 737-800 troncal y la vuelta al mundo.

export type ClaveRed = "c408" | "c90" | "b737" | "vuelta";

export interface Red {
  nombre: string;
  color: string;
  nudos: number; // crucero típico, para el tiempo de bloque estimado
  extraMin: number; // rodaje y ascenso
  texto: string;
}

export interface Ruta {
  id: number;
  red: ClaveRed;
  desde: string;
  hasta: string;
  tramo?: number; // solo en la vuelta al mundo
}

// ICAO: [latitud, longitud, ciudad]
export const AEROPUERTOS: Record<string, [number, number, string]> = {
  MMGL: [20.52, -103.31, "Guadalajara"], MMMX: [19.44, -99.07, "Ciudad de México"], MMIA: [19.28, -103.58, "Colima"],
  MMAS: [21.71, -102.32, "Aguascalientes"], MMPR: [20.68, -105.25, "Puerto Vallarta"], MMMZ: [23.16, -106.27, "Mazatlán"],
  MMZH: [17.6, -101.46, "Zihuatanejo"], MMLP: [24.07, -110.36, "La Paz"], MMLT: [25.99, -111.35, "Loreto"],
  MMGR: [28.03, -114.02, "Guerrero Negro"], MMUN: [21.04, -86.88, "Cancún"], MMCZ: [20.52, -86.93, "Cozumel"],
  MMCM: [18.5, -88.33, "Chetumal"], MMOX: [17.0, -96.73, "Oaxaca"], MMPS: [15.88, -97.09, "Puerto Escondido"],
  MMBT: [15.78, -96.26, "Huatulco"], MMTO: [19.34, -99.57, "Toluca"], MMMY: [25.78, -100.11, "Monterrey"],
  MMSD: [23.15, -109.72, "Los Cabos"], MMCU: [28.7, -105.96, "Chihuahua"], KSAT: [29.53, -98.47, "San Antonio"],
  MMMD: [20.94, -89.66, "Mérida"], MUHA: [22.99, -82.41, "La Habana"], MMTJ: [32.54, -116.97, "Tijuana"],
  KLAX: [33.94, -118.41, "Los Ángeles"], KDFW: [32.9, -97.04, "Dallas"], MPTO: [9.07, -79.38, "Panamá"],
  SKBO: [4.7, -74.15, "Bogotá"], KJFK: [40.64, -73.78, "Nueva York"], CYQX: [48.94, -54.57, "Gander"],
  BIKF: [63.99, -22.61, "Keflavík"], EGLL: [51.47, -0.45, "Londres"], LEMD: [40.47, -3.56, "Madrid"],
  LIRF: [41.8, 12.25, "Roma"], LGAV: [37.94, 23.94, "Atenas"], OMDB: [25.25, 55.36, "Dubái"],
  VIDP: [28.57, 77.1, "Delhi"], VTBS: [13.69, 100.75, "Bangkok"], VHHH: [22.31, 113.91, "Hong Kong"],
  RJTT: [35.55, 139.78, "Tokio"], RJCC: [42.78, 141.69, "Sapporo"], UHPP: [53.17, 158.45, "Petropávlovsk"],
  PANC: [61.17, -149.99, "Anchorage"], CYVR: [49.19, -123.18, "Vancouver"], KSFO: [37.62, -122.38, "San Francisco"],
};

export const REDES: Record<ClaveRed, Red> = {
  c408: { nombre: "C408 · Regional", color: "#5fd0bd", nudos: 200, extraMin: 15,
    texto: "Aeropuertos chicos, playas e islas. Vuelos cortos y escénicos, ideales para los en vivo." },
  c90: { nombre: "C90 · Ejecutiva", color: "#86b4ff", nudos: 240, extraMin: 15,
    texto: "De 250 a 800 nm, aeropuertos altos como Toluca y las primeras salidas internacionales." },
  b737: { nombre: "737 · Troncal", color: "#f2896b", nudos: 450, extraMin: 25,
    texto: "Rutas nacionales largas e internacionales desde Guadalajara y la Ciudad de México." },
  vuelta: { nombre: "737 · Vuelta al mundo", color: "#e8c766", nudos: 450, extraMin: 25,
    texto: "Un tramo por semana. El 737 no cruza océanos de un salto: sube por Gander e Islandia y regresa por Kamchatka y Alaska." },
};

const VUELTA = ["MMGL", "KJFK", "CYQX", "BIKF", "EGLL", "LEMD", "LIRF", "LGAV", "OMDB", "VIDP", "VTBS", "VHHH",
  "RJTT", "RJCC", "UHPP", "PANC", "CYVR", "KSFO", "MMGL"];

const PARES: [ClaveRed, string[][]][] = [
  ["c408", [["MMGL", "MMIA"], ["MMGL", "MMAS"], ["MMGL", "MMPR"], ["MMGL", "MMMZ"], ["MMGL", "MMZH"],
    ["MMLP", "MMLT"], ["MMLT", "MMGR"], ["MMUN", "MMCZ"], ["MMCZ", "MMCM"], ["MMOX", "MMPS"], ["MMPS", "MMBT"]]],
  ["c90", [["MMGL", "MMTO"], ["MMGL", "MMMY"], ["MMGL", "MMSD"], ["MMGL", "MMCU"], ["MMMY", "KSAT"], ["MMMD", "MUHA"]]],
  ["b737", [["MMGL", "MMMX"], ["MMGL", "MMTJ"], ["MMGL", "MMUN"], ["MMGL", "KLAX"], ["MMGL", "KDFW"],
    ["MMMX", "MPTO"], ["MMMX", "SKBO"]]],
  ["vuelta", VUELTA.slice(0, -1).map((c, i) => [c, VUELTA[i + 1]])],
];

export const RUTAS: Ruta[] = PARES.flatMap(([red, pares]) =>
  pares.map(([desde, hasta], i) => ({ red, desde, hasta, ...(red === "vuelta" ? { tramo: i + 1 } : {}) })),
).map((r, id) => ({ ...r, id }));

/** Distancia ortodrómica en millas náuticas. */
export function millas(desde: string, hasta: string): number {
  const [la1, lo1] = AEROPUERTOS[desde];
  const [la2, lo2] = AEROPUERTOS[hasta];
  const rad = Math.PI / 180;
  const h = Math.sin(((la2 - la1) * rad) / 2) ** 2 +
    Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(((lo2 - lo1) * rad) / 2) ** 2;
  return 2 * 3440.065 * Math.asin(Math.sqrt(h));
}

/** Tiempo de bloque estimado, p. ej. "4 h 42" o "35 min". */
export function bloque(ruta: Ruta): string {
  const red = REDES[ruta.red];
  const min = Math.round((millas(ruta.desde, ruta.hasta) / red.nudos) * 60 + red.extraMin);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}
