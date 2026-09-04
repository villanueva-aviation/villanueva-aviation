import { PremiumChecklistPage } from "../features/checklist/PremiumChecklistPage";
import { CHECKLIST_NORMAL, CHECKLIST_EMERGENCIA } from "../data/checklistC172";
import { FLUJOS_C172, VSPEEDS_C172 } from "../data/checklistPremium";

export function ChecklistPremiumC172() {
  return (
    <PremiumChecklistPage
      titulo="Checklist Premium — Cessna 172"
      normal={CHECKLIST_NORMAL}
      emergencia={CHECKLIST_EMERGENCIA}
      flujos={FLUJOS_C172}
      vspeeds={VSPEEDS_C172}
    />
  );
}
