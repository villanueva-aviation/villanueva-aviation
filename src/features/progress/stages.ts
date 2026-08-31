import type { TrackerStage } from "../../components/tracker/TrackerLine";
import type { ModuloEstado } from "./ProgressContext";

function estadoDe(slug: string, modulos: { slug: string; estado: ModuloEstado }[]) {
  return modulos.find((m) => m.slug === slug)?.estado ?? "bloqueado";
}

export function buildFormationStages(modulos: { slug: string; estado: ModuloEstado }[]): TrackerStage[] {
  const fundamentos = estadoDe("fundamentos", modulos);
  const teoricos = ["meteorologia", "aerodinamica", "navegacion", "comunicaciones"].map((s) => estadoDe(s, modulos));
  const vfr = estadoDe("vfr", modulos);
  const ifr = estadoDe("ifr", modulos);

  const conocimientosCompleto = teoricos.every((e) => e === "completado");
  const conocimientosIniciado = teoricos.some((e) => e === "completado" || e === "en-progreso");

  const toStatus = (completo: boolean, iniciado: boolean, prevCompleto: boolean): TrackerStage["status"] => {
    if (completo) return "completado";
    if (!prevCompleto) return "bloqueado";
    if (iniciado) return "en-progreso";
    return "en-progreso";
  };

  const fundamentosCompleto = fundamentos === "completado";
  const vfrCompleto = vfr === "completado";
  const ifrCompleto = ifr === "completado";
  const evaluacionCompleto = fundamentosCompleto && conocimientosCompleto && vfrCompleto && ifrCompleto;

  return [
    { id: "fundamentos", label: "Fundamentos", status: toStatus(fundamentosCompleto, fundamentos !== "bloqueado", true) },
    { id: "conocimientos", label: "Conocimientos", status: toStatus(conocimientosCompleto, conocimientosIniciado, fundamentosCompleto) },
    { id: "simulacion", label: "Simulación", status: toStatus(vfrCompleto, vfr === "en-progreso", conocimientosCompleto) },
    { id: "operacion", label: "Operación", status: toStatus(ifrCompleto, ifr === "en-progreso", vfrCompleto) },
    { id: "evaluacion", label: "Evaluación", status: evaluacionCompleto ? "completado" : ifrCompleto ? "en-progreso" : "bloqueado" },
  ];
}
