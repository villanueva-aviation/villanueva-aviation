import type { Idioma } from "./idiomaInstructor.ts";
import { norm360, radialEsperaDe, type Llegada } from "./navIfr.ts";
import { normalizar } from "./preguntas.ts";
import { instruccionTramo } from "./textosInterceptacion.ts";

// Lo que dice el instructor en la lección IFR 5, la llegada (spec 2026-11-16). Puro.

const tres = (r: number) => String(Math.round(norm360(r)) || 360).padStart(3, "0");
const pies = (ft: number) => (Math.round(ft / 100) * 100).toLocaleString("en-US");

const SECTOR: Record<Idioma, string[]> = {
  es: ["norte", "noreste", "este", "sureste", "sur", "suroeste", "oeste", "noroeste"],
  en: ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"],
};
/** De qué lado del VOR queda la espera: el radial en 8 sectores de 45°. */
const sector = (radial: number, idioma: Idioma) => SECTOR[idioma][Math.round(norm360(radial) / 45) % 8];

/** La autorización completa, en el orden en que se vuela. */
export function autorizacionLlegada(ll: Llegada, vor: string | undefined, idioma: Idioma): string {
  const r = radialEsperaDe(ll);
  const alt = pies(ll.espera.altitudFt ?? 0);
  const derecha = ll.espera.giros === "derecha";
  if (idioma === "en") {
    const v = vor ?? "the VOR";
    return `Cleared to ${v}: intercept the ${tres(ll.r1)} radial inbound, join the ${ll.arco.radioNm} mile arc to the ${tres(ll.arco.hasta)} radial, proceed inbound to ${v} and hold ${sector(r, "en")} on the ${tres(r)} radial, ${derecha ? "right" : "left"} turns, maintain ${alt} feet.`;
  }
  const v = vor ?? "el VOR";
  return `Autorizado a ${v}: intercepta el radial ${tres(ll.r1)} acercándote, únete al arco de ${ll.arco.radioNm} millas hasta el radial ${tres(ll.arco.hasta)}, acércate a ${v} y espera al ${sector(r, "es")} en el radial ${tres(r)}, virajes a la ${derecha ? "derecha" : "izquierda"}, mantén ${alt} pies.`;
}

/** En tierra: la salida por el radial de la pista y cuándo llega la autorización. */
export function ordenDespegue(radial: number, vor: string | undefined, altitudFt: number, idioma: Idioma): string {
  const orden = instruccionTramo({ radial, desde: true }, vor, idioma, true, altitudFt);
  return idioma === "en" ? `${orden} At 15 miles I'll give you the arrival.` : `${orden} A las 15 millas te doy la llegada.`;
}

const REPETIR: Record<Idioma, RegExp> = {
  es: /\b(repite|repita|repitela|repetir|repiteme|otra vez)\b/,
  en: /\b(say again|repeat)\b/,
};
/** «Repite» por voz: la autorización otra vez. */
export const pideRepetir = (texto: string, idioma: Idioma) => REPETIR[idioma].test(normalizar(texto, idioma));

export function briefingLlegada(idioma: Idioma): string[] {
  return idioma === "en"
    ? [
        "At 15 miles you get the whole arrival in one clearance, like from ATC: the radial to intercept, the arc, the inbound radial and the hold.",
        "Copy it down or remember it. Say \"say again\" or tap the button to hear it again.",
        "On the arc you say which way you turn onto it; before the VOR, which hold entry you'll fly.",
        "The arrival passes only if all three parts pass: the intercept, the arc and the hold.",
      ]
    : [
        "A las 15 millas te doy la llegada completa en una autorización, como de ATC: el radial a interceptar, el arco, el radial de acercamiento y la espera.",
        "Cópiala o apréndetela. Di «repite» o toca el botón para oírla otra vez.",
        "En el arco dices hacia qué lado viras para entrar; antes del VOR, qué entrada vas a hacer a la espera.",
        "La llegada se aprueba solo si aprueban sus tres partes: la interceptación, el arco y la espera.",
      ];
}
