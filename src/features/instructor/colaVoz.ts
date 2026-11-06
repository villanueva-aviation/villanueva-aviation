import type { Idioma } from "./idiomaInstructor.ts";

// La cola de la voz: nada se corta a media frase salvo un intento anulado o "Probar voz".

export type TipoPieza = "orden" | "aviso" | "anulado" | "final" | "prueba";
export type Pieza = { tipo: TipoPieza; texto: string; clave?: string };
export type Velocidad = "lenta" | "normal" | "rapida";
export type Detalle = "detallado" | "necesario";

export const RITMO: Record<Velocidad, number> = { lenta: 0.85, normal: 1, rapida: 1.15 };

export function encolar(cola: Pieza[], p: Pieza): { cola: Pieza[]; cortar: boolean } {
  if (p.tipo === "anulado" || p.tipo === "prueba") return { cola: [p], cortar: true };
  if (p.tipo === "aviso") return { cola: [...cola.filter((x) => x.tipo !== "aviso"), p], cortar: false };
  return { cola: [...cola, p], cortar: false };
}

/** La próxima pieza; un aviso que ya no aplica se descarta. */
export function siguiente(cola: Pieza[], avisoVigente: string | null): { pieza: Pieza | null; cola: Pieza[] } {
  let resto = cola;
  while (resto.length) {
    const [pieza, ...despues] = resto;
    resto = despues;
    if (pieza.tipo !== "aviso" || pieza.clave === avisoVigente) return { pieza, cola: resto };
  }
  return { pieza: null, cola: [] };
}

type Voz = { name: string; lang: string };
const PAIS: Record<Idioma, string> = { es: "es-mx", en: "en-us" };

/** La elegida si es del idioma; si no, Natural del país, cualquiera del país, cualquiera del idioma. */
export function escogerVoz<V extends Voz>(voces: V[], idioma: Idioma, nombre: string | null): V | null {
  const delIdioma = voces.filter((v) => v.lang.toLowerCase().startsWith(idioma));
  const pais = delIdioma.filter((v) => v.lang.toLowerCase() === PAIS[idioma]);
  return (
    delIdioma.find((v) => v.name === nombre) ??
    pais.find((v) => /natural|online/i.test(v.name)) ??
    pais[0] ??
    delIdioma[0] ??
    null
  );
}
