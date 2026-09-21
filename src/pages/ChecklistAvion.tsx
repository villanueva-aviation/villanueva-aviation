import { Navigate, useParams } from "react-router-dom";
import { AircraftChecklistPage } from "../features/checklist/AircraftChecklistPage";
import { AVIONES_CHECKLIST } from "../data/checklistAviones";
import { ROUTES } from "../lib/routes";

export function ChecklistAvion() {
  const { avion = "" } = useParams();
  const a = AVIONES_CHECKLIST[avion];
  if (!a) return <Navigate to={ROUTES.descargas} replace />;
  return (
    <AircraftChecklistPage
      titulo={`${a.nombre} — Normal y Emergencia`}
      normal={a.normal}
      emergencia={a.emergencia}
      descripcion={`Toca cada punto para marcarlo conforme lo verificas. ${a.nota}`}
    />
  );
}
