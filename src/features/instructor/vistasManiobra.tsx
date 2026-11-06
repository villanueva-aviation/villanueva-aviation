import type { JSX } from "react";
import { HojaCheckride } from "./HojaCheckride";
import { HojaRecto } from "./HojaRecto";
import type { Idioma } from "./idiomaInstructor";
import type { ManiobraId } from "./maniobras";

/** La hoja de resultados de cada maniobra. */
export const HOJA: Record<ManiobraId, (p: { resultado: any; idioma: Idioma }) => JSX.Element> = {
  "viraje-escarpado": HojaCheckride,
  "recto-nivelado": HojaRecto,
};
