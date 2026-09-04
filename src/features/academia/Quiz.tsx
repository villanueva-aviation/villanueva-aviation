import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { QuizPregunta } from "./quizData";

export function Quiz({
  preguntas,
  passingScore = 70,
  onFinish,
}: {
  preguntas: QuizPregunta[];
  passingScore?: number;
  onFinish: (score: number, passed: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const pregunta = preguntas[step];
  const score = finished ? Math.round((answers.filter(Boolean).length / preguntas.length) * 100) : 0;
  const passed = score >= passingScore;

  function handleSelect(index: number) {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === pregunta.correcta;
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);
  }

  function handleNext() {
    if (step + 1 >= preguntas.length) {
      const finalScore = Math.round((answers.filter(Boolean).length / preguntas.length) * 100);
      setFinished(true);
      onFinish(finalScore, finalScore >= passingScore);
      return;
    }
    setStep((s) => s + 1);
    setSelected(null);
  }

  function handleRetry() {
    setStep(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="animate-result-in flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${
            passed ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-red-500/50 bg-red-500/10 text-red-400"
          }`}
        >
          {passed ? <Check size={28} /> : <X size={28} />}
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-white">
          {passingScore === 0 ? "¡Práctica completada!" : passed ? "¡Aprobado!" : "No alcanzaste el puntaje mínimo"}
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Obtuviste <span className="text-white">{score}%</span> de aciertos
          {passingScore > 0 && ` · Mínimo requerido: ${passingScore}%`}
        </p>
        {!passed && (
          <Button variant="secondary" className="mt-6" onClick={handleRetry}>
            <RotateCcw size={15} /> Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>
          Pregunta {step + 1} de {preguntas.length}
        </span>
        <span>{Math.round(((step + (selected !== null ? 1 : 0)) / preguntas.length) * 100)}%</span>
      </div>
      <div className="mt-2">
        <ProgressBar value={((step + (selected !== null ? 1 : 0)) / preguntas.length) * 100} size="sm" />
      </div>

      <h3 className="mt-6 font-display text-lg font-semibold text-white">{pregunta.pregunta}</h3>

      <div className="mt-5 flex flex-col gap-3">
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
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm text-white/85 transition-all duration-200 disabled:cursor-default ${stateClasses}`}
            >
              {opcion}
              {selected !== null && isCorrect && <Check size={16} className="text-gold-400" />}
              {selected !== null && isSelected && !isCorrect && <X size={16} className="text-red-400" />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={handleNext}>
            {step + 1 >= preguntas.length ? "Ver resultado" : "Siguiente pregunta"}
          </Button>
        </div>
      )}
    </div>
  );
}
