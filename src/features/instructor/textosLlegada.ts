import type { Idioma } from "./idiomaInstructor.ts";
import { norm360, radialEsperaDe, type Llegada } from "./navIfr.ts";

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
