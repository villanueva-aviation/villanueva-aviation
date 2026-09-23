import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { QuizPregunta } from "./quizData";

/**
 * Una sola pregunta de repaso dentro de la lección. No puntúa ni bloquea: sirve
 * para que el cadete recupere lo que acaba de leer antes de seguir.
 */
export function Comprobacion({
  pregunta,
  onContinue,
}: {
  pregunta: QuizPregunta;
  onContinue: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const acerto = selected === pregunta.correcta;

  return (
    <div className="animate-result-in rounded-2xl border border-gold-500/25 bg-gold-500/[0.04] p-5 md:p-6">
      <p className="font-display text-xs font-semibold uppercase tracking-wide text-gold-400">
        Comprobación rápida
      </p>
      <h3 className="mt-3 font-display text-base font-semibold text-white">{pregunta.pregunta}</h3>

      <div className="mt-4 flex flex-col gap-2.5">
        {pregunta.opciones.map((opcion, i) => {
          const isCorrect = i === pregunta.correcta;
          const isSelected = i === selected;
          let stateClasses = "border-white/10 bg-white/[0.02] hover:border-gold-500/30 hover:bg-white/[0.05]";
          if (selected !== null) {
            if (isCorrect) stateClasses = "border-gold-500/60 bg-gold-500/10 text-white";
            else if (isSelected) stateClasses = "border-red-500/50 bg-red-500/10 text-white";
            else stateClasses = "border-white/10 bg-white/[0.02] opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => selected === null && setSelected(i)}
              disabled={selected !== null}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm text-white/85 transition-all duration-200 disabled:cursor-default ${stateClasses}`}
            >
              {opcion}
              {selected !== null && isCorrect && <Check size={16} className="shrink-0 text-gold-400" />}
              {selected !== null && isSelected && !isCorrect && <X size={16} className="shrink-0 text-red-400" />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/70">
            {acerto ? "Correcto. Sigamos." : "Esa no era. La correcta queda marcada arriba."}
          </p>
          <Button onClick={onContinue}>Continuar</Button>
        </div>
      )}
    </div>
  );
}
