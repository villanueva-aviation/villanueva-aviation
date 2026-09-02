import { ArrowRight } from "lucide-react";
import type { Flujo } from "../../data/checklistPremium";

export function FlowDiagram({ flujos }: { flujos: Flujo[] }) {
  return (
    <div className="flex flex-col gap-4">
      {flujos.map((f) => (
        <div key={f.id} className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
          <h4 className="font-display text-sm font-semibold text-red-400">{f.titulo}</h4>
          <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {f.pasos.map((paso, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/85">
                  {paso}
                </span>
                {i < f.pasos.length - 1 && <ArrowRight size={13} className="shrink-0 text-white/25" />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
