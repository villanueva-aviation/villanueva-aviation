import { Check } from "lucide-react";

export interface StepperStage {
  key: string;
  label: string;
  done: boolean;
}

export function ModuleStepper({
  stages,
  activeKey,
  onSelect,
}: {
  stages: StepperStage[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {stages.map((stage, i) => {
        const isActive = stage.key === activeKey;
        return (
          <button
            key={stage.key}
            onClick={() => onSelect(stage.key)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
              isActive
                ? "border-gold-500 bg-gold-500/15 text-gold-400"
                : stage.done
                  ? "border-white/15 bg-white/[0.03] text-white/70 hover:border-gold-500/30"
                  : "border-white/10 bg-white/[0.02] text-white/45 hover:border-white/20 hover:text-white/70"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                stage.done ? "bg-gold-500 text-navy-950" : "border border-current"
              }`}
            >
              {stage.done ? <Check size={11} /> : i + 1}
            </span>
            {stage.label}
          </button>
        );
      })}
    </div>
  );
}
