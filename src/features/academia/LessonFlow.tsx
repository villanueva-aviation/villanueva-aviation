import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { Tema } from "../../data/moduleContent";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";

export function LessonFlow({
  temas,
  isCompleted,
  onAdvance,
}: {
  temas: Tema[];
  isCompleted: (temaId: string) => boolean;
  onAdvance: (temaId: string) => void;
}) {
  const [step, setStep] = useState(0);
  const tema = temas[step];
  const completada = isCompleted(tema.id);

  function next() {
    onAdvance(tema.id);
    if (step + 1 < temas.length) setStep((s) => s + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>
          Lección {step + 1} de {temas.length}
        </span>
        <span>{Math.round(((step + 1) / temas.length) * 100)}%</span>
      </div>
      <div className="mt-2">
        <ProgressBar value={((step + 1) / temas.length) * 100} size="sm" />
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h3 className="font-display text-lg font-semibold text-white">{tema.titulo}</h3>
        {completada && <Check size={20} className="shrink-0 text-gold-400" />}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/65">{tema.texto}</p>
      {tema.imagenes && tema.imagenes.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tema.imagenes.map((src) => (
            <div key={src} className="overflow-hidden rounded-xl border border-white/10">
              <img src={src} alt={tema.titulo} className="w-full" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={15} /> Anterior
        </button>
        <Button onClick={next}>
          {step + 1 >= temas.length ? "Finalizar lección" : "Siguiente lección"}
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}
