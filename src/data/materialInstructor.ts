import type { Material } from "../features/instructor/briefing";
import { ROUTES } from "../lib/routes";

/** Material del debriefing del viraje escarpado. Los videos de Erik se agregan aquí cuando existan. */
export const MATERIAL_VIRAJE: Material[] = [
  { titulo: { es: "Simulacro de vuelo: virajes pronunciados", en: "Flight checkride practice: steep turns" }, to: ROUTES.simulacroVuelo, exclusivo: true },
  { titulo: { es: "Checklist del C172", en: "C172 checklist" }, to: ROUTES.checklistC172, exclusivo: false },
];
