import { CheckCircle2, CircleDashed, Lock } from "lucide-react";

export interface TrackerStage {
  id: string;
  label: string;
  status: "completado" | "en-progreso" | "bloqueado";
}

const ICONS = {
  completado: CheckCircle2,
  "en-progreso": CircleDashed,
  bloqueado: Lock,
};

const RING_CLASSES = {
  completado: "border-gold-500 bg-gold-500/15 text-gold-400",
  "en-progreso": "border-gold-500/60 bg-gold-500/5 text-gold-400 animate-glow-pulse",
  bloqueado: "border-white/15 bg-white/[0.03] text-white/30",
};

const LABEL_CLASSES = {
  completado: "text-white",
  "en-progreso": "text-gold-400",
  bloqueado: "text-white/40",
};

export function TrackerLine({ stages, compact = false }: { stages: TrackerStage[]; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {stages.map((stage, i) => {
        const Icon = ICONS[stage.status];
        const isLast = i === stages.length - 1;
        return (
          <div key={stage.id} className="flex flex-1 sm:flex-col">
            <div className="flex flex-col items-center sm:w-full">
              <div className="flex w-full items-center">
                <div
                  className={`flex shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${RING_CLASSES[stage.status]} ${
                    compact ? "h-9 w-9" : "h-12 w-12"
                  }`}
                >
                  <Icon size={compact ? 16 : 20} strokeWidth={2} />
                </div>
                {!isLast && (
                  <div
                    className={`hidden h-[2px] flex-1 sm:block ${
                      stage.status === "completado" ? "bg-gold-500/60" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
              <p
                className={`mt-3 text-center font-display text-xs font-semibold uppercase tracking-wide sm:text-sm ${LABEL_CLASSES[stage.status]}`}
              >
                {stage.label}
              </p>
            </div>
            {!isLast && (
              <div className={`ml-6 h-8 w-[2px] sm:hidden ${stage.status === "completado" ? "bg-gold-500/60" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
