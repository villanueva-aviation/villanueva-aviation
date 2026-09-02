import { AircraftChecklistPage } from "../features/checklist/AircraftChecklistPage";
import { CHECKLIST_NORMAL, CHECKLIST_EMERGENCIA } from "../data/checklistC172";

export function ChecklistC172() {
  return <AircraftChecklistPage titulo="Cessna 172 — Normal y Emergencia" normal={CHECKLIST_NORMAL} emergencia={CHECKLIST_EMERGENCIA} />;
}
