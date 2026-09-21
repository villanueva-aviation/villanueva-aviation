import { Navigate, useParams } from "react-router-dom";
import { PremiumChecklistPage } from "../features/checklist/PremiumChecklistPage";
import { AVIONES_CHECKLIST } from "../data/checklistAviones";
import { ROUTES } from "../lib/routes";

export function ChecklistPremiumAvion() {
  const { avion = "" } = useParams();
  const a = AVIONES_CHECKLIST[avion];
  if (!a) return <Navigate to={ROUTES.contenidoExclusivo} replace />;
  return (
    <PremiumChecklistPage
      titulo={`Checklist Premium — ${a.nombre}`}
      normal={a.normal}
      emergencia={a.emergencia}
      flujos={a.flujos}
      vspeeds={a.vspeeds}
      descripcion={a.nota}
    />
  );
}
