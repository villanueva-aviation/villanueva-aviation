import type { JSX } from "react";
import { HojaCheckride } from "./HojaCheckride";
import { HojaLento } from "./HojaLento";
import { HojaRecto } from "./HojaRecto";
import { HojaRumbos } from "./HojaRumbos";
import { HojaAltitud } from "./HojaAltitud";
import { HojaCombinado } from "./HojaCombinado";
import type { Idioma } from "./idiomaInstructor";
import type { ManiobraId } from "./maniobras";

/** La hoja de resultados de cada maniobra. */
export const HOJA: Record<ManiobraId, (p: { resultado: any; idioma: Idioma }) => JSX.Element> = {
  "viraje-escarpado": HojaCheckride,
  "recto-nivelado": HojaRecto,
  "vuelo-lento": HojaLento,
  "virajes-rumbos": HojaRumbos,
  "ascensos-descensos": HojaAltitud,
  "virajes-ascendiendo": HojaCombinado,
};
