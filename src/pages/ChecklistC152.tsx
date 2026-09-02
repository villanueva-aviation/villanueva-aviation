import { AircraftChecklistPage } from "../features/checklist/AircraftChecklistPage";
import { CHECKLIST_C152_NORMAL, CHECKLIST_C152_EMERGENCIA } from "../data/checklistC152";

export function ChecklistC152() {
  return (
    <AircraftChecklistPage titulo="Cessna 152 — Normal y Emergencia" normal={CHECKLIST_C152_NORMAL} emergencia={CHECKLIST_C152_EMERGENCIA} />
  );
}
