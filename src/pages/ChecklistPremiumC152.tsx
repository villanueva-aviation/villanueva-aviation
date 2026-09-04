import { PremiumChecklistPage } from "../features/checklist/PremiumChecklistPage";
import { CHECKLIST_C152_NORMAL, CHECKLIST_C152_EMERGENCIA } from "../data/checklistC152";
import { FLUJOS_C152, VSPEEDS_C152 } from "../data/checklistPremium";

export function ChecklistPremiumC152() {
  return (
    <PremiumChecklistPage
      titulo="Checklist Premium — Cessna 152"
      normal={CHECKLIST_C152_NORMAL}
      emergencia={CHECKLIST_C152_EMERGENCIA}
      flujos={FLUJOS_C152}
      vspeeds={VSPEEDS_C152}
    />
  );
}
