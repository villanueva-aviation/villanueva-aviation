import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import type { ChecklistFase } from "../../data/checklistC172";
import { ProgressBar } from "../../components/ui/ProgressBar";

function FaseCard({ fase }: { fase: ChecklistFase }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-base font-semibold text-white">{fase.titulo}</h3>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap font-mono text-xs text-white/45">
            {checked.size}/{fase.items.length}
          </span>
          <button
            onClick={() => setChecked(new Set())}
            className="text-white/40 transition-colors hover:text-gold-400"
            title="Reiniciar"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={(checked.size / fase.items.length) * 100} size="sm" />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {fase.items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 ${
                isChecked
                  ? "border-gold-500/40 bg-gold-500/10 text-white/50 line-through decoration-gold-500/50"
                  : "border-white/10 bg-white/[0.02] text-white/80 hover:border-gold-500/30"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 ease-out ${
                  isChecked ? "border-gold-500 bg-gold-500 text-navy-950" : "border-white/30"
                }`}
              >
                {isChecked && <Check size={11} strokeWidth={3} className="animate-check-in" />}
              </span>
              {item.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChecklistInteractive({ fases }: { fases: ChecklistFase[] }) {
  return (
    <div className="flex flex-col gap-6">
      {fases.map((fase) => (
        <FaseCard key={fase.id} fase={fase} />
      ))}
    </div>
  );
}
