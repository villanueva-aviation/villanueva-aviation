import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Plane, Target } from "lucide-react";
import { ACADEMIA_MODULOS } from "../../data/academia";
import { flattenTemas } from "../../data/moduleContent";
import { misionCompleta, misionInicial, type Mision } from "../../data/misiones";
import { useProgress } from "../progress/ProgressContext";
import { Button } from "../../components/ui/Button";
import { VideoYouTube } from "../../components/ui/VideoYouTube";
import { LessonFlow } from "./LessonFlow";
import { Quiz } from "./Quiz";
import { InteractividadWidget, INTERACTIVIDAD_INTRO } from "./InteractividadWidget";

const CARD = "rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8";

function Rotulo({ icono: Icono, children }: { icono: typeof Target; children: string }) {
  return (
    <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
      <Icono size={14} /> {children}
    </p>
  );
}

/** Pasos para hacer en el simulador; las marcas solo ayudan a no perderse, no cuentan para el avance. */
function EnTuSimulador({ pasos }: { pasos: string[] }) {
  const [hechos, setHechos] = useState<boolean[]>(() => pasos.map(() => false));
  return (
    <div className={CARD}>
      <Rotulo icono={Plane}>Ahora, en tu simulador</Rotulo>
      <ol className="mt-4 flex flex-col gap-2.5">
        {pasos.map((paso, i) => (
          <li key={paso}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-white/75 transition-colors hover:border-gold-500/30">
              <input
                type="checkbox"
                checked={hechos[i]}
                onChange={() => setHechos((h) => h.map((v, j) => (j === i ? !v : v)))}
                className="mt-1 h-4 w-4 shrink-0 accent-[#d4af37]"
              />
              <span className={hechos[i] ? "text-white/45 line-through" : ""}>
                <span className="mr-1.5 font-display font-semibold text-gold-400 tabular-nums">{i + 1}.</span>
                {paso}
              </span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Un módulo presentado como misiones cortas: lectura, interactivo, simulador y comprobación juntos. */
export function MisionesModulo({
  modulo,
  misiones,
  onTerminar,
}: {
  modulo: (typeof ACADEMIA_MODULOS)[number];
  misiones: Mision[];
  onTerminar: () => void;
}) {
  const { isActividadCompletada, completarActividad } = useProgress();
  const hecha = (id: string) => isActividadCompletada(modulo.slug, id);
  // La misión va en la URL (?mision=2): la página se vuelve a montar cuando el avance se recarga
  // (por ejemplo, al volver del simulador a esta pestaña) y así no regresa a otra misión.
  const [params, setParams] = useSearchParams();
  const pedida = Number(params.get("mision")) - 1;
  const activa = pedida >= 0 && pedida < misiones.length ? pedida : misionInicial(misiones, hecha);
  const setActiva = (siguiente: number | ((i: number) => number)) => {
    const i = typeof siguiente === "function" ? siguiente(activa) : siguiente;
    setParams(
      (p) => {
        p.set("mision", String(i + 1));
        return p;
      },
      { replace: true },
    );
  };
  const inicio = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  // Fija la misión inicial en la URL; si no, al terminarla la página saltaría sola a la siguiente.
  useEffect(() => {
    if (!params.get("mision")) setActiva(activa);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al cambiar de misión, vuelve al principio de la misión (no al cargar la página).
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    inicio.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activa]);

  const mision = misiones[activa];
  const temas = (flattenTemas(modulo.slug) ?? []).filter((t) => mision.temas.includes(t.id));
  const interactivos = mision.interactivos.flatMap((id) => modulo.actividades.filter((a) => a.id === id));
  const todasHechas = misiones.every((m) => misionCompleta(m, hecha));
  const ultima = activa === misiones.length - 1;
  const terminada = misionCompleta(mision, hecha);

  return (
    <div ref={inicio} className="flex scroll-mt-28 flex-col gap-6">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {misiones.map((m, i) => {
          const completa = misionCompleta(m, hecha);
          const actual = i === activa;
          return (
            <li key={m.id}>
              <button
                onClick={() => setActiva(i)}
                aria-current={actual ? "step" : undefined}
                className={`flex h-full w-full flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  actual ? "border-gold-500/60 bg-gold-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <span className="flex w-full items-center justify-between font-display text-[11px] font-semibold uppercase tracking-wider text-gold-500">
                  Misión {i + 1}
                  {completa && <CheckCircle2 size={14} className="text-gold-400" aria-label="Completada" />}
                </span>
                <span className={`text-xs font-medium leading-snug ${actual ? "text-white" : "text-white/65"}`}>{m.titulo}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.05] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
          <span>
            Misión {activa + 1} de {misiones.length}
          </span>
          <span className="flex items-center gap-1.5 text-white/50">
            <Clock size={13} /> {mision.minutos} min
          </span>
        </div>
        <h2 className="mt-3 flex items-start gap-3 font-display text-2xl font-bold text-white sm:text-3xl">
          {mision.titulo}
          {terminada && <CheckCircle2 size={22} className="mt-1.5 shrink-0 text-gold-400" aria-label="Completada" />}
        </h2>
        <p className="mt-4 flex max-w-3xl items-start gap-3 text-base leading-relaxed text-white/75">
          <Target size={18} className="mt-1 shrink-0 text-gold-400" />
          {mision.gancho}
        </p>
      </div>

      {mision.videoId && <VideoYouTube id={mision.videoId} titulo={mision.titulo} />}

      <div className={CARD}>
        <Rotulo icono={Target}>Lo esencial</Rotulo>
        <div className="mt-4">
          <LessonFlow
            key={mision.id}
            temas={temas}
            isCompleted={hecha}
            onAdvance={(id) => completarActividad(modulo.slug, id)}
          />
        </div>
      </div>

      {interactivos.map((actividad) => {
        const completada = hecha(actividad.id);
        return (
          <div key={actividad.id} className={CARD}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-white">{actividad.titulo}</h3>
              {completada && <CheckCircle2 size={20} className="shrink-0 text-gold-400" aria-label="Completada" />}
            </div>
            <p className="mt-2 text-sm text-white/60">{INTERACTIVIDAD_INTRO[actividad.widget ?? "diagrama"]}</p>
            <div className="mt-6">
              <InteractividadWidget modulo={modulo} actividad={actividad} onComplete={() => completarActividad(modulo.slug, actividad.id)} />
            </div>
            {!completada && (
              <Button variant="secondary" className="mt-5" onClick={() => completarActividad(modulo.slug, actividad.id)}>
                Marcar como completada
              </Button>
            )}
          </div>
        );
      })}

      <EnTuSimulador key={mision.id} pasos={mision.enSimulador} />

      <div className={CARD}>
        <Rotulo icono={CheckCircle2}>Comprueba lo que aprendiste</Rotulo>
        <div className="mt-4">
          <Quiz key={mision.id} preguntas={mision.preguntas} passingScore={0} onFinish={() => {}} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={activa === 0} onClick={() => setActiva((i) => Math.max(0, i - 1))}>
          <ArrowLeft size={15} /> Misión anterior
        </Button>
        {!terminada && (
          <p className="text-xs text-white/45">
            Para completar esta misión, termina la lectura{interactivos.length > 0 ? " y el ejercicio interactivo" : ""}.
          </p>
        )}
        {ultima ? (
          <Button disabled={!todasHechas} onClick={onTerminar}>
            Continuar a práctica <ArrowRight size={15} />
          </Button>
        ) : (
          <Button onClick={() => setActiva((i) => i + 1)}>
            Siguiente misión <ArrowRight size={15} />
          </Button>
        )}
      </div>
      {ultima && !todasHechas && (
        <p className="text-right text-xs text-white/45">Completa las {misiones.length} misiones para pasar a la práctica.</p>
      )}
    </div>
  );
}
