import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Tema } from "../../data/moduleContent";
import { leidosAhora, pasoActivo, pasosDeTema, type MedidaTema } from "./lecturaScroll";
import { VisualEscena } from "./VisualEscena";
import { visualesDeTema } from "./rise/motor";

export function usarQuieto(): boolean {
  const [quieto, setQuieto] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cambiar = () => setQuieto(mq.matches);
    mq.addEventListener("change", cambiar);
    return () => mq.removeEventListener("change", cambiar);
  }, []);
  return quieto;
}

/**
 * Lectura con scroll: el texto sube por pasos y el visual fijo cambia con el paso que cruza la mitad
 * de la pantalla. Un tema se marca al pasar su último paso (ver leidosAhora). Mismas props que LessonFlow.
 */
export function LeccionScroll({
  temas,
  isCompleted,
  onAdvance,
}: {
  temas: Tema[];
  isCompleted: (temaId: string) => boolean;
  onAdvance: (temaId: string) => void;
}) {
  const quieto = usarQuieto();
  const pasos = temas.map(pasosDeTema);
  const nodos = useRef<(HTMLElement | null)[][]>([]);
  const vistos = useRef<Set<string>>(new Set());
  const avisados = useRef<Set<string>>(new Set());
  const [activo, setActivo] = useState<[tema: number, paso: number]>([0, 0]);
  const [ampliado, setAmpliado] = useState<string | null>(null);

  // Las funciones de props cambian en cada render; el listener lee siempre las últimas.
  const props = useRef({ temas, isCompleted, onAdvance });
  props.current = { temas, isCompleted, onAdvance };
  // MisionesModulo arma `temas` en cada render; solo importa cuando cambian los ids.
  const ids = temas.map((t) => t.id).join("|");

  useEffect(() => {
    let cuadro = 0;
    function medir() {
      cuadro = 0;
      const alto = window.innerHeight;
      const mitad = alto / 2;
      const medidas: MedidaTema[] = [];
      const tops: number[] = [];
      const indice: [number, number][] = [];
      props.current.temas.forEach((tema, t) => {
        const els = (nodos.current[t] ?? []).filter((e): e is HTMLElement => !!e);
        if (els.length === 0) return;
        const primero = els[0].getBoundingClientRect();
        const ultimo = els[els.length - 1].getBoundingClientRect();
        medidas.push({ id: tema.id, arriba: primero.top, abajo: ultimo.bottom, topUltimo: ultimo.top });
        els.forEach((e, p) => {
          tops.push(e.getBoundingClientRect().top);
          indice.push([t, p]);
        });
      });
      if (indice.length > 0) {
        const nuevo = indice[pasoActivo(tops, mitad)];
        setActivo((a) => (a[0] === nuevo[0] && a[1] === nuevo[1] ? a : nuevo));
      }
      const r = leidosAhora(medidas, alto, vistos.current);
      vistos.current = r.vistos;
      for (const id of r.leidos) {
        if (avisados.current.has(id) || props.current.isCompleted(id)) continue;
        avisados.current.add(id);
        props.current.onAdvance(id);
      }
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
  }, [ids]);

  const [ta, pa] = activo;
  const visual = temas[ta] ? visualesDeTema(temas[ta])[pa] : undefined;

  return (
    <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
      {/* Visual fijo: arriba en celular, a la derecha en escritorio. */}
      <div className="sticky top-[5.75rem] z-10 -mx-6 mb-6 flex h-[45vh] items-center justify-center bg-navy-950/90 px-4 py-3 backdrop-blur [--alto:calc(45vh-1.5rem)] md:-mx-8 lg:order-2 lg:top-28 lg:mx-0 lg:mb-0 lg:h-[70vh] lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:[--alto:70vh]">
        {visual ? (
          <VisualEscena visual={visual} quieto={quieto} />
        ) : (
          // Tema sin imagen: su título en grande, nunca un hueco ni la imagen de otro tema.
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 p-6 text-center">
            <p className="max-w-md font-display text-2xl font-bold leading-tight text-gold-300 sm:text-3xl">{temas[ta]?.titulo}</p>
          </div>
        )}
      </div>

      <div className="lg:order-1">
        {temas.map((tema, t) => (
          <section key={tema.id} className="pb-[20vh] last:pb-[30vh]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl font-semibold text-white">{tema.titulo}</h3>
              {isCompleted(tema.id) && <Check size={20} className="mt-1 shrink-0 text-gold-400" aria-label="Leído" />}
            </div>
            {pasos[t].map((paso, p) => {
              const actual = ta === t && pa === p;
              return (
                <div
                  key={p}
                  ref={(el) => {
                    (nodos.current[t] ??= [])[p] = el;
                  }}
                  className="flex min-h-[60vh] items-center lg:min-h-[70vh]"
                >
                  <p
                    className={`text-lg leading-relaxed transition-colors duration-300 ${actual ? "text-white" : "text-white/40"} ${
                      p === 0 ? "font-display text-xl font-medium" : ""
                    }`}
                  >
                    {paso.titulo && <span className="font-display font-semibold text-gold-400">{paso.titulo} · </span>}
                    {paso.texto}
                  </p>
                </div>
              );
            })}
            {tema.puntos && (
              <>
                <button
                  onClick={() => setAmpliado((v) => (v === tema.id ? null : tema.id))}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-400/90 transition-colors hover:text-gold-400"
                >
                  {ampliado === tema.id ? "Ocultar la explicación completa" : "Leer la explicación completa"}
                  <ChevronDown size={14} className={ampliado === tema.id ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
                {ampliado === tema.id && <p className="mt-3 text-sm leading-relaxed text-white/60">{tema.texto}</p>}
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
