import { useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Checkpoint, Tema } from "../../data/moduleContent";
import { Comprobacion } from "./Comprobacion";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { Carousel } from "../../components/ui/Carousel";

export function LessonFlow({
  temas,
  checkpoints = [],
  isCompleted,
  onAdvance,
}: {
  temas: Tema[];
  checkpoints?: Checkpoint[];
  isCompleted: (temaId: string) => boolean;
  onAdvance: (temaId: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [comprobando, setComprobando] = useState(false);
  const [ampliado, setAmpliado] = useState(false);
  const tema = temas[step];
  const completada = isCompleted(tema.id);
  const checkpoint = checkpoints.find((c) => c.despuesDeTema === step);

  function next() {
    onAdvance(tema.id);
    if (checkpoint && !comprobando) {
      setComprobando(true);
      return;
    }
    setComprobando(false);
    setAmpliado(false);
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
      {tema.puntos ? (
        <>
          <p className="mt-3 text-base font-medium leading-snug text-white/90">{tema.clave}</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {tema.puntos.map((p) => (
              <li
                key={p.titulo}
                className="rounded-xl border-l-2 border-gold-500/60 bg-white/[0.04] py-2.5 pl-4 pr-3 text-sm leading-relaxed text-white/65"
              >
                <span className="font-display font-semibold text-white">{p.titulo}</span> · {p.texto}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setAmpliado((v) => !v)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-gold-400/90 transition-colors hover:text-gold-400"
          >
            {ampliado ? "Ocultar explicación completa" : "Ver explicación completa"}
            <ChevronDown size={14} className={ampliado ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {ampliado && (
            <p className="mt-3 text-justify text-sm leading-relaxed text-white/60 [text-justify:inter-word]">
              {tema.texto}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-justify text-sm leading-relaxed text-white/65 [text-justify:inter-word]">{tema.texto}</p>
      )}
      {tema.imagenes && tema.imagenes.length >= 2 && (
        <Carousel key={tema.id} images={tema.imagenes} alt={tema.titulo} />
      )}
      {tema.imagenes && tema.imagenes.length === 1 && (
        <div className="mt-4 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img src={tema.imagenes[0]} alt={tema.titulo} className="mx-auto max-h-[440px] w-auto" />
        </div>
      )}

      {comprobando && checkpoint && (
        <div className="mt-6">
          <Comprobacion pregunta={checkpoint.pregunta} onContinue={next} />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            setComprobando(false);
            setAmpliado(false);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={15} /> Anterior
        </button>
        {!comprobando && (
          <Button onClick={next}>
            {checkpoint ? "Comprobar lo leído" : step + 1 >= temas.length ? "Finalizar lección" : "Siguiente lección"}
            <ChevronRight size={15} />
          </Button>
        )}
      </div>
    </div>
  );
}
