import type { Resultado } from "./evaluador.ts";
import { explicar } from "./explicacion.ts";
import type { Idioma } from "./idiomaInstructor.ts";

// La sesión de una hora: los bloques avanzan por lo que pasa, el reloj solo sugiere.

export type Modo = "practica" | "checkride";
export type Bloque = "idioma" | "briefing" | "preparacion" | "practica" | "checkride" | "debriefing" | "cierre";

export const GUIA_MIN: Record<Exclude<Bloque, "idioma">, [number, number]> = {
  briefing: [0, 5],
  preparacion: [5, 10],
  practica: [10, 35],
  checkride: [35, 45],
  debriefing: [45, 55],
  cierre: [55, 60],
};

/** Solo intentos calificados: los anulados nunca entran. */
export type IntentoSesion = { modo: Modo; resultado: Resultado; id: string | null };

export type Sesion = {
  id: string;
  bloque: Bloque;
  inicioMs: number | null;
  intentos: IntentoSesion[];
  sugerido35: boolean;
  sugeridoTres: boolean;
};

export type EventoSesion =
  | { tipo: "idioma" }
  | { tipo: "listo"; ahoraMs: number }
  | { tipo: "armado" }
  | { tipo: "intento"; intento: IntentoSesion }
  | { tipo: "pasar-checkride" }
  | { tipo: "fin-debriefing" }
  | { tipo: "reloj"; ahoraMs: number };

const SUGERIR_MIN = 35;
const META_PRACTICA = 3;
const TEXTO: Record<Idioma, { tres: string; min35: string }> = {
  es: {
    tres: "Ya tienes tres intentos: puedes pasar al checkride o seguir practicando.",
    min35: "Ya llevamos 35 minutos: cuando quieras pasamos al checkride.",
  },
  en: {
    tres: "That's three attempts: you can move on to the checkride or keep practicing.",
    min35: "We're 35 minutes in: whenever you're ready, we'll move on to the checkride.",
  },
};

export function crearSesion(id: string): Sesion {
  return { id, bloque: "idioma", inicioMs: null, intentos: [], sugerido35: false, sugeridoTres: false };
}

export const modoDelBloque = (b: Bloque): Modo => (b === "checkride" ? "checkride" : "practica");
export const armaEnBloque = (b: Bloque): boolean => b === "preparacion" || b === "practica" || b === "checkride";

export function avanzarSesion(s: Sesion, e: EventoSesion, idioma: Idioma = "es"): { sesion: Sesion; decir: string[] } {
  const igual = { sesion: s, decir: [] as string[] };
  const ir = (cambio: Partial<Sesion>, decir: string[] = []) => ({ sesion: { ...s, ...cambio }, decir });
  switch (e.tipo) {
    case "idioma":
      return s.bloque === "idioma" ? ir({ bloque: "briefing" }) : igual;
    case "listo":
      return s.bloque === "briefing" ? ir({ bloque: "preparacion", inicioMs: e.ahoraMs }) : igual;
    case "armado":
      return s.bloque === "preparacion" ? ir({ bloque: "practica" }) : igual;
    case "pasar-checkride":
      return s.bloque === "practica" ? ir({ bloque: "checkride" }) : igual;
    case "fin-debriefing":
      return s.bloque === "debriefing" ? ir({ bloque: "cierre" }) : igual;
    case "intento": {
      if (e.intento.modo !== modoDelBloque(s.bloque) || (s.bloque !== "practica" && s.bloque !== "checkride")) return igual;
      const intentos = [...s.intentos, e.intento];
      if (s.bloque === "checkride") return ir({ intentos, bloque: "debriefing" });
      const practicas = intentos.filter((i) => i.modo === "practica").length;
      if (practicas >= META_PRACTICA && !s.sugeridoTres) return ir({ intentos, sugeridoTres: true }, [TEXTO[idioma].tres]);
      return ir({ intentos });
    }
    case "reloj":
      if (s.bloque !== "practica" || s.sugerido35 || s.inicioMs === null || e.ahoraMs - s.inicioMs < SUGERIR_MIN * 60_000) return igual;
      return ir({ sugerido35: true }, [TEXTO[idioma].min35]);
  }
}

/** Lo que dice el instructor después de cada intento de práctica. */
export function comentarioIntento(i: IntentoSesion, numero: number, idioma: Idioma = "es"): string {
  const mal = explicar(i.resultado, idioma).find((l) => l.tipo === "mal");
  return idioma === "en"
    ? `Attempt ${numero}: ${i.resultado.calificacion} out of 100. ${mal?.texto ?? "Everything within tolerance."}`
    : `Intento ${numero}: ${i.resultado.calificacion} de 100. ${mal?.texto ?? "Todo dentro de tolerancia."}`;
}
