import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CadetTabs } from "../components/layout/CadetTabs";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ProgressBar } from "../components/ui/ProgressBar";
import { TrackerLine } from "../components/tracker/TrackerLine";
import { Reveal } from "../components/ui/Reveal";
import { useProgress } from "../features/progress/ProgressContext";
import { buildFormationStages } from "../features/progress/stages";
import { ACADEMIA_MODULOS } from "../data/academia";

export function Tracker() {
  const { modulos, isActividadCompletada } = useProgress();
  const [expanded, setExpanded] = useState<string | null>(ACADEMIA_MODULOS[0].slug);
  const stages = buildFormationStages(modulos);

  return (
    <div>
      <PageHero
        eyebrow="Tracker"
        title="Tu ruta de formación"
        description="Sigue tu avance a través de las cinco etapas del programa: desde los fundamentos hasta la evaluación final."
      />
      <CadetTabs />

      <Container className="py-14 md:py-20">
        <Reveal className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <TrackerLine stages={stages} />
        </Reveal>

        <h2 className="mt-14 font-display text-xl font-semibold text-white">Detalle por módulo</h2>
        <div className="mt-6 flex flex-col gap-3">
          {modulos.map((m, i) => {
            const modulo = ACADEMIA_MODULOS.find((am) => am.slug === m.slug)!;
            const isOpen = expanded === m.slug;
            return (
              <Reveal key={m.slug} delay={i * 60} className="rounded-2xl border border-white/10 bg-white/[0.03]">
                <button
                  onClick={() => setExpanded(isOpen ? null : m.slug)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                    <modulo.icon size={18} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-white">{modulo.titulo}</p>
                    <div className="mt-2 max-w-xs">
                      <ProgressBar value={m.progresoPct} size="sm" />
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-white/50">{m.progresoPct}%</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-white/10 px-6 py-4">
                    <ul className="flex flex-col gap-2">
                      {modulo.actividades.map((a) => {
                        const done = isActividadCompletada(modulo.slug, a.id);
                        return (
                          <li key={a.id} className="flex items-center gap-3 text-sm">
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                done ? "border-gold-500 bg-gold-500" : "border-white/25"
                              }`}
                            />
                            <span className={done ? "text-white/80" : "text-white/45"}>{a.titulo}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
