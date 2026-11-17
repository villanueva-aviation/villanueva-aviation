import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import type { AcademiaModulo } from "../../../data/academia";
import { Button } from "../../../components/ui/Button";
import { VideoYouTube } from "../../../components/ui/VideoYouTube";
import { InteractividadWidget, INTERACTIVIDAD_INTRO } from "../InteractividadWidget";
import { LeccionScroll } from "../LeccionScroll";
import { pasoActivo } from "../lecturaScroll";
import { Candado, CARD, EnTuSimulador, Portada, Tarjetas } from "./Bloques";
import { capituloCompleto, type Bloque, type Capitulo } from "./motor";
import { candadoAbiertoDeInicio } from "./reglas";

function rotulo(b: Bloque): string {
  switch (b.tipo) {
    case "portada":
      return "Inicio";
    case "video":
      return "Video";
    case "lectura":
      return b.temas[0]?.titulo ?? "Lectura";
    case "tarjetas":
      return "Repaso rápido";
    case "candado":
      return "Comprueba";
    case "interactivo":
      return b.actividad.titulo;
    case "simulador":
      return "En tu simulador";
    case "cierre":
      return "Final";
  }
}

/**
 * Un capítulo de la lección: sus bloques en orden, recorridos bajando. Se montan hasta el primer
 * candado cerrado; lo de después es solo un adelanto borroso, así el scroll no marca temas que no se vieron.
 */
export function CapituloRise({
  modulo,
  capitulo,
  numero,
  total,
  isCompleted,
  onComplete,
  onSiguiente,
  onTerminar,
  todoCompleto,
}: {
  modulo: AcademiaModulo;
  capitulo: Capitulo;
  numero: number;
  total: number;
  isCompleted: (id: string) => boolean;
  onComplete: (id: string) => void;
  onSiguiente: (() => void) | null;
  onTerminar: () => void;
  todoCompleto: boolean;
}) {
  const { bloques } = capitulo;
  // Los candados de lo ya leído arrancan abiertos (avance guardado); se calcula una sola vez al montar.
  const [abiertosDeInicio] = useState(
    () => new Set(bloques.flatMap((b, i) => (b.tipo === "candado" && candadoAbiertoDeInicio(bloques, i, isCompleted) ? [i] : []))),
  );
  const [abiertos, setAbiertos] = useState<Set<number>>(abiertosDeInicio);
  const corte = bloques.findIndex((b, i) => b.tipo === "candado" && !abiertos.has(i));
  const visibles = corte === -1 ? bloques : bloques.slice(0, corte + 1);

  const caja = useRef<HTMLDivElement>(null);
  const secciones = useRef<(HTMLElement | null)[]>([]);
  const [avance, setAvance] = useState(0);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    let cuadro = 0;
    function medir() {
      cuadro = 0;
      const mitad = window.innerHeight / 2;
      const r = caja.current?.getBoundingClientRect();
      if (r && r.height > 0) setAvance(Math.min(1, Math.max(0, (mitad - r.top) / r.height)));
      const tops = secciones.current.slice(0, visibles.length).map((e) => e?.getBoundingClientRect().top ?? Infinity);
      if (tops.length) setActiva(pasoActivo(tops, mitad));
    }
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [visibles.length]);

  const completo = capituloCompleto(capitulo, isCompleted);

  function pintar(b: Bloque, i: number) {
    switch (b.tipo) {
      case "portada":
        return <Portada titulo={capitulo.titulo} numero={numero} total={total} minutos={capitulo.minutos} imagen={b.imagen} gancho={b.gancho} />;
      case "video":
        return <VideoYouTube id={b.youtubeId} titulo={capitulo.titulo} />;
      case "lectura":
        return <LeccionScroll key={b.temas.map((t) => t.id).join("|")} temas={b.temas} isCompleted={isCompleted} onAdvance={onComplete} />;
      case "tarjetas":
        return <Tarjetas tarjetas={b.tarjetas} />;
      case "candado":
        return (
          <Candado
            pregunta={b.pregunta}
            abiertoDeInicio={abiertosDeInicio.has(i)}
            onAbrir={() => setAbiertos((a) => new Set(a).add(i))}
          />
        );
      case "interactivo": {
        const hecho = isCompleted(b.actividad.id);
        return (
          <div className={CARD}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-white">{b.actividad.titulo}</h3>
              {hecho && <CheckCircle2 size={20} className="shrink-0 text-gold-400" aria-label="Completada" />}
            </div>
            <p className="mt-2 text-sm text-white/60">{INTERACTIVIDAD_INTRO[b.actividad.widget ?? "diagrama"]}</p>
            <div className="mt-6">
              <InteractividadWidget modulo={modulo} actividad={b.actividad} onComplete={() => onComplete(b.actividad.id)} />
            </div>
            {!hecho && (
              <Button variant="secondary" className="mt-5" onClick={() => onComplete(b.actividad.id)}>
                Marcar como completada
              </Button>
            )}
          </div>
        );
      }
      case "simulador":
        return <EnTuSimulador pasos={b.pasos} />;
      case "cierre":
        return (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] px-6 py-12 text-center">
            {completo ? (
              <>
                <CheckCircle2 size={36} className="text-gold-400" />
                <p className="font-display text-2xl font-bold text-white">Capítulo completo</p>
                {onSiguiente ? (
                  <Button onClick={onSiguiente}>
                    Siguiente capítulo <ArrowRight size={15} />
                  </Button>
                ) : (
                  <>
                    <Button disabled={!todoCompleto} onClick={onTerminar}>
                      Continuar a práctica <ArrowRight size={15} />
                    </Button>
                    {!todoCompleto && <p className="text-xs text-white/50">Completa los {total} capítulos para pasar a la práctica.</p>}
                  </>
                )}
              </>
            ) : (
              <p className="max-w-md text-sm text-white/65">
                Para completar este capítulo, termina la lectura{capitulo.interactivos.length > 0 ? " y el ejercicio interactivo" : ""}.
              </p>
            )}
          </div>
        );
    }
  }

  return (
    <div ref={caja} className="relative">
      {/* Barra de avance justo debajo del menú del sitio; en celular dice en qué capítulo vas. */}
      <div className="sticky top-16 z-20 -mx-6 h-7 bg-navy-950/90 backdrop-blur md:-mx-10 lg:mx-0 lg:h-1 lg:bg-transparent lg:backdrop-blur-none">
        <p className="px-6 pt-1 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-400 lg:hidden">
          Capítulo {numero} de {total}
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div className="h-full bg-gradient-to-r from-gold-500 to-gold-300" style={{ width: `${avance * 100}%` }} />
        </div>
      </div>

      {/* Menú de puntos: solo en pantallas grandes; el rótulo aparece al pasar el mouse o con el teclado. */}
      <nav aria-label="Secciones del capítulo" className="group fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {visibles.map((b, i) => (
          <button
            key={i}
            onClick={() => secciones.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
            aria-current={i === activa ? "step" : undefined}
            className={`flex items-center gap-2.5 text-left text-xs ${i === activa ? "text-gold-300" : "text-white/45"}`}
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 border-current transition-transform ${
                i === activa ? "scale-125 border-gold-400 bg-gold-400" : i < activa ? "bg-white/45" : ""
              }`}
            />
            <span className="max-w-[12rem] truncate rounded bg-navy-950/90 px-1.5 py-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {rotulo(b)}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-16">
        {visibles.map((b, i) => (
          <section
            key={i}
            ref={(el) => {
              secciones.current[i] = el;
            }}
            className="scroll-mt-28"
          >
            {pintar(b, i)}
          </section>
        ))}
        {corte !== -1 && (
          <div className="relative">
            <div aria-hidden className="pointer-events-none select-none space-y-3 opacity-50 blur-sm">
              <div className="h-6 w-2/3 rounded bg-white/20" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-white/10" />
              <div className="h-40 w-full rounded-2xl bg-white/10" />
            </div>
            <p className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-white/70">
              <Lock size={15} className="text-gold-400" /> Contesta la pregunta para seguir
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
