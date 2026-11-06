import { useMemo } from "react";
import type { Evaluacion, Resultado } from "./evaluador.ts";
import { MANIOBRAS } from "./maniobras.ts";
import { paraGuardar } from "./reglasIntentos.ts";
import type { Modo } from "./sesion.ts";
import { useIntento, type Opciones } from "./useIntento.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";

export type { Modo };

/** El intento del viraje escarpado, como lo usa su página: lo de `useIntento` más las series y si va bajo. */
export function useIntentoViraje(opciones: Opciones = {}) {
  const r = useIntento(MANIOBRAS["viraje-escarpado"], opciones);
  const ev = r.ev as Evaluacion | null;
  const resultado = r.resultado as Resultado | null;
  const series = useMemo(() => (resultado ? paraGuardar(resultado).series : []), [resultado]);
  // Recién armado en el ascenso: primero que suba, luego los virajes.
  const bajo = ev?.fase === "armado" && !!r.muestra && r.muestra.agl < ALTURA_SEGURA_AGL;
  return { ...r, ev, resultado, series, bajo };
}
