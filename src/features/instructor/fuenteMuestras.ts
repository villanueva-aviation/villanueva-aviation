// Segunda fuente de muestras para el instructor: el simulador web (/simulador) en la misma página.
// Sin ella, useLector lee el lector local de MSFS como siempre.
import { createContext, useContext } from "react";
import type { Aeropuerto } from "./aeropuertoSim.ts";
import type { Muestra } from "./evaluador.ts";
import type { VorSim } from "./vorSim.ts";

/** `aeropuerto` y `vors` conservan la misma referencia mientras no cambian. */
export type LoteWeb = { muestras: Muestra[]; aeropuerto: Aeropuerto | null; vors: VorSim[] };
export type FuenteMuestras = { suscribir(f: (l: LoteWeb) => void): () => void };

export const FuenteMuestrasContext = createContext<FuenteMuestras | null>(null);
export const useFuenteMuestras = () => useContext(FuenteMuestrasContext);
