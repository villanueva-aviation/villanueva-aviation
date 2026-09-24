import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  OPCIONES,
  PUNTOS_POR_LADO,
  SITUACION,
  desviacionTras,
  type Eleccion,
} from "./datosPruebaVor";

const PASO = 14; // unidades del SVG por cada punto del CDI
const CENTRO_X = 150;
const CENTRO_Y = 92;

/**
 * El CDI de la pregunta. La aguja es lo único que se mueve: parte dos puntos a
 * la derecha y termina donde dejaría el instrumento la decisión que tomes.
 */
function CDI({ desviacion }: { desviacion: number }) {
  const id = useId();
  const centrada = desviacion === 0;
  const puntos = Array.from({ length: PUNTOS_POR_LADO }, (_, i) => i + 1);

  return (
    <svg
      viewBox="0 0 300 184"
      className="h-auto w-full max-w-[17rem]"
      role="img"
      aria-label={
        centrada
          ? "CDI con la aguja centrada"
          : `CDI con la aguja desviada ${desviacion} puntos a la derecha`
      }
    >
      <defs>
        <linearGradient id={`${id}-bisel`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#f0dfa4" />
          <stop offset="0.45" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#6d5a1f" />
        </linearGradient>
        <clipPath id={`${id}-cara`}>
          <circle cx={CENTRO_X} cy={CENTRO_Y} r="78" />
        </clipPath>
      </defs>

      <circle cx={CENTRO_X} cy={CENTRO_Y} r="86" fill="#0c0f13" stroke={`url(#${id}-bisel)`} strokeWidth="7" />
      <circle cx={CENTRO_X} cy={CENTRO_Y} r="78" fill="#12151a" />

      <g clipPath={`url(#${id}-cara)`}>
        <text x={CENTRO_X} y="38" textAnchor="middle" fontSize="15" letterSpacing="2" fill="#9aa4b2" fontFamily="Inter, sans-serif">
          OBS 360
        </text>

        {puntos.flatMap((k) =>
          [-1, 1].map((lado) => (
            <circle key={`${k}${lado}`} cx={CENTRO_X + lado * k * PASO} cy={CENTRO_Y} r="3.6" fill="#8d97a6" />
          )),
        )}

        <circle cx={CENTRO_X} cy={CENTRO_Y} r="8" fill="none" stroke="#D4AF37" strokeWidth="2" />

        {/* La bandera va a la izquierda: la aguja solo se desvía hacia la derecha y nunca la cruza. */}
        <path d="M 96 116 l 8 -12 l 8 12 Z" fill="#9aa4b2" />
        <text x="104" y="135" textAnchor="middle" fontSize="15" letterSpacing="1.5" fill="#9aa4b2" fontFamily="Inter, sans-serif">
          TO
        </text>

        <g
          className="transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${desviacion * PASO}px)` }}
        >
          <line
            x1={CENTRO_X}
            y1="50"
            x2={CENTRO_X}
            y2="134"
            strokeWidth="5"
            strokeLinecap="round"
            className="transition-[stroke] duration-500 motion-reduce:transition-none"
            stroke={centrada ? "#D4AF37" : "#F6F4EF"}
          />
        </g>
      </g>
    </svg>
  );
}

export function PruebaVOR({ href }: { href: string }) {
  const id = useId();
  const [elegida, setElegida] = useState<Eleccion | null>(null);
  const opcion = OPCIONES.find((o) => o.clave === elegida);

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="w-full rounded-2xl border border-white/10 bg-navy-950/85 p-5 sm:p-6"
    >
      <h2 id={`${id}-titulo`} className="font-display text-lg font-semibold text-white">
        Prueba de 20 segundos
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{SITUACION}</p>

      <div className="mt-4 flex justify-center">
        <CDI desviacion={desviacionTras(elegida)} />
      </div>

      <p className="mt-2 font-display text-sm font-semibold text-white">¿Qué haces?</p>
      <div className="mt-3 flex flex-col gap-2" role="group" aria-label="¿Qué haces?">
        {OPCIONES.map((o) => {
          const activa = elegida === o.clave;
          return (
            <button
              key={o.clave}
              type="button"
              aria-pressed={activa}
              onClick={() => setElegida(o.clave)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-[border-color,background-color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                activa && o.correcta
                  ? "border-gold-500/60 bg-gold-500/10 text-white"
                  : activa
                    ? "border-white/35 bg-white/[0.07] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/85 [@media(hover:hover)_and_(pointer:fine)]:hover:border-gold-500/40"
              }`}
            >
              {o.texto}
            </button>
          );
        })}
      </div>

      <div role="status" aria-live="polite">
        {opcion && (
          <div key={opcion.clave} className="animate-fade-up mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className={`font-display text-sm font-semibold ${opcion.correcta ? "text-gold-400" : "text-white"}`}>
              {opcion.titulo}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/75">{opcion.explicacion}</p>
            <Button to={href} className="mt-4 w-full sm:w-auto">
              Sigue con la lección 1
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
