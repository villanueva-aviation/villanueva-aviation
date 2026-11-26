// El simulador web de Villanueva (/simulador) como fuente del instructor. Puro.
import type { Muestra } from "./evaluador.ts";

/** El título del «avión» en cada muestra del simulador web; cabe en la columna `avion` (20 caracteres). */
export const TITULO_SIM_WEB = "H135 simulador web";

export const esSimWeb = (m: Muestra) => m.titulo === TITULO_SIM_WEB;

/** En el checkride del simulador web, el AP que mueve el helicóptero (HDG, NAV, APR, ALT, VS, IAS) anula. MSFS no cambia. */
export const anulaPorAp = (m: Muestra, modo: "practica" | "checkride") => esSimWeb(m) && modo === "checkride" && !!m.autopiloto && !m.enTierra;

export const MOTIVO_AP = {
  es: "Usaste el piloto automático en el checkride: no se califica.",
  en: "You used the autopilot in the checkride: it is not graded.",
};
