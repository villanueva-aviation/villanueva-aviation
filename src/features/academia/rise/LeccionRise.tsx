import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { AcademiaModulo } from "../../../data/academia";
import { CapituloRise } from "./CapituloRise";
import { armarCapitulos, capituloCompleto, capituloInicial } from "./motor";
import { capituloDeUrl } from "./reglas";

/**
 * La etapa Lección de cualquier módulo: capítulos que se recorren bajando. El avance llega por props
 * (no con useProgress) para poder probarla sin sesión.
 */
export function LeccionRise({
  modulo,
  isCompleted,
  onComplete,
  onTerminar,
}: {
  modulo: AcademiaModulo;
  isCompleted: (id: string) => boolean;
  onComplete: (id: string) => void;
  onTerminar: () => void;
}) {
  const caps = useMemo(() => armarCapitulos(modulo.slug), [modulo.slug]);
  // El capítulo va en la URL (?capitulo=2): la página se vuelve a montar cuando el avance se recarga
  // (por ejemplo, al volver del simulador a esta pestaña) y así no regresa a otro capítulo.
  const [params, setParams] = useSearchParams();
  const activo = capituloDeUrl(params.get("capitulo"), params.get("mision"), caps.length, capituloInicial(caps, isCompleted));
  const ir = (i: number) =>
    setParams(
      (p) => {
        p.set("capitulo", String(i + 1));
        p.delete("mision");
        return p;
      },
      { replace: true },
    );
  const inicio = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  // Fija el capítulo inicial en la URL; si no, al terminarlo la página saltaría sola al siguiente.
  useEffect(() => {
    if (!params.get("capitulo")) ir(activo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al cambiar de capítulo, salta a su inicio (no al cargar la página). Va de golpe y en layout effect,
  // antes de que la lectura nueva mida: si no, se montaría con la página aún abajo (o pasaría por ella
  // al subir suave) y marcaría como leídos temas que no se vieron.
  useLayoutEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    inicio.current?.scrollIntoView({ behavior: "instant", block: "start" }); // "instant": el html tiene scroll-behavior: smooth
  }, [activo]);

  const cap = caps[activo];
  if (!cap) return null;
  const ultimo = activo === caps.length - 1;
  const todoCompleto = caps.every((c) => capituloCompleto(c, isCompleted));

  return (
    <div ref={inicio} className="flex scroll-mt-[calc(var(--alto-menu)+1rem)] flex-col gap-6">
      {caps.length > 1 && (
        <ol className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {caps.map((c, i) => {
            const actual = i === activo;
            return (
              <li key={c.id} className="w-44 shrink-0 snap-start sm:w-auto">
                <button
                  onClick={() => ir(i)}
                  aria-current={actual ? "step" : undefined}
                  className={`flex h-full w-full flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    actual ? "border-gold-500/60 bg-gold-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <span className="flex w-full items-center justify-between font-display text-[11px] font-semibold uppercase tracking-wider text-gold-500">
                    Capítulo {i + 1}
                    {capituloCompleto(c, isCompleted) && <CheckCircle2 size={14} className="text-gold-400" aria-label="Completo" />}
                  </span>
                  <span className={`text-xs font-medium leading-snug ${actual ? "text-white" : "text-white/65"}`}>{c.titulo}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <CapituloRise
        key={cap.id}
        modulo={modulo}
        capitulo={cap}
        numero={activo + 1}
        total={caps.length}
        isCompleted={isCompleted}
        onComplete={onComplete}
        onSiguiente={ultimo ? null : () => ir(activo + 1)}
        onTerminar={onTerminar}
        todoCompleto={todoCompleto}
      />
    </div>
  );
}
