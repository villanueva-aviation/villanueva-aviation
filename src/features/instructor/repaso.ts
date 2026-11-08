// Lección 13, repaso general: sorteo de maniobras, zona de trabajo y la lección de rampa a rampa. Puro, para poder probarlo.
import type { Muestra } from "./evaluador.ts";
import type { Aeropuerto } from "./aeropuertoSim.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import type { ManiobraId } from "./maniobras.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import { aNm } from "../home/navGeo.ts";

const RAD = Math.PI / 180;

/** `n` maniobras: cada disponible al menos una vez y nunca la misma dos veces seguidas (salvo que haya una sola). */
export function sortear(disponibles: ManiobraId[], n = 4, azar = Math.random): ManiobraId[] {
  const s = [...disponibles];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  while (s.length < n) {
    const otras = disponibles.filter((d) => d !== s[s.length - 1]);
    const de = otras.length ? otras : disponibles;
    s.push(de[Math.floor(azar() * de.length)]);
  }
  return s.slice(0, n);
}

export interface Zona {
  nombre: Record<Idioma, string>;
  lat: number;
  lon: number;
  radioNm: number;
}

const punto = (a: Aeropuerto, rumbo: number, nm: number) => ({
  lat: a.lat + (nm * Math.cos(rumbo * RAD)) / 60,
  lon: a.lon + (nm * Math.sin(rumbo * RAD)) / 60 / Math.cos(a.lat * RAD),
});

/** MMGL: Cajititlán o Chapala, al azar. Otro aeropuerto: 10 NM al través de la pista más larga. */
export function zonaRepaso(a: Aeropuerto | null, azar = Math.random): Zona | null {
  if (!a) return null;
  if (a.icao === "MMGL") {
    return azar() < 0.5
      ? { nombre: { es: "Cajititlán", en: "Cajititlan" }, ...punto(a, 180, 5), radioNm: 3 }
      : { nombre: { es: "Chapala", en: "Chapala" }, ...punto(a, 157.5, 15), radioNm: 5 };
  }
  const larga = [...a.pistas].sort((x, y) => y.largoFt - x.largoFt)[0];
  // ponytail: rumbo verdadero redondeado a 10°; la declinación local no la manda el lector.
  const rumbo = (((larga?.extremos[0].rumboV ?? 0) + 90) % 360);
  const dicho = String(Math.round(rumbo / 10) * 10 || 360).padStart(3, "0");
  return {
    nombre: { es: `la zona a 10 millas al rumbo ${dicho}`, en: `the area 10 miles out on heading ${dicho}` },
    ...punto(a, rumbo, 10),
    radioNm: 3,
  };
}

export function enZona(m: Muestra, z: Zona): boolean {
  if (m.lat === undefined || m.lon === undefined) return false;
  const d = aNm(m.lat, m.lon, z.lat, z.lon);
  return Math.hypot(d.x, d.y) <= z.radioNm && m.agl >= ALTURA_SEGURA_AGL;
}
