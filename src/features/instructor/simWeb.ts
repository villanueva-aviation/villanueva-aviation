// El simulador web de Villanueva (/simulador) como fuente del instructor. Puro.
import type { Muestra } from "./evaluador.ts";

/** El título del «avión» en cada muestra del simulador web; cabe en la columna `avion` (20 caracteres). */
export const TITULO_SIM_WEB = "H135 simulador web";

export const esSimWeb = (m: Muestra) => m.titulo === TITULO_SIM_WEB;
