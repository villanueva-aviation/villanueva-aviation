import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Clock, Lock, Plane, RotateCcw, Target, X } from "lucide-react";
import type { QuizPregunta } from "../quizData";
import { usarQuieto } from "../LeccionScroll";
import type { Tarjeta } from "./motor";
import { CANDADO_NUEVO, responderCandado, type EstadoCandado } from "./reglas";

export const CARD = "rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8";

export function Rotulo({ icono: Icono, children }: { icono: typeof Target; children: string }) {
  return (
    <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
      <Icono size={14} /> {children}
    </p>
  );
}

/** Portada de pantalla completa del capítulo: imagen con acercamiento lento, número, minutos y gancho. */
export function Portada({
  titulo,
  numero,
  total,
  minutos,
  imagen,
  gancho,
}: {
  titulo: string;
  numero: number;
  total: number;
  minutos: number;
  imagen: string | null;
  gancho: string | null;
}) {
  const quieto = usarQuieto();
  return (
    <section className="relative -mx-6 flex min-h-[70vh] items-end overflow-hidden bg-gradient-to-br from-navy-700 via-navy-900 to-navy-950 md:mx-0 md:rounded-3xl">
      {imagen && (
        <motion.img
          src={imagen}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={quieto ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: quieto ? 0 : 14, ease: "easeOut" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/10" />
      <div className="relative max-w-3xl px-6 pb-10 pt-24 md:px-12 md:pb-14">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
          <span>
            Capítulo {numero} de {total}
          </span>
          <span className="flex items-center gap-1.5 text-white/60">
            <Clock size={13} /> {minutos} min
          </span>
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">{titulo}</h2>
        {gancho && <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">{gancho}</p>}
        <p className="mt-8 text-sm text-white/50">Baja para empezar ↓</p>
      </div>
    </section>
  );
}

/** Repaso rápido: tarjetas que voltean al tocarlas (con «reducir movimiento», solo cambian de cara). */
export function Tarjetas({ tarjetas }: { tarjetas: Tarjeta[] }) {
  const quieto = usarQuieto();
  const [volteadas, setVolteadas] = useState<Set<number>>(new Set());
  const voltear = (i: number) =>
    setVolteadas((v) => {
      const n = new Set(v);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const cara = "absolute inset-0 flex flex-col justify-center rounded-2xl p-5 text-left [backface-visibility:hidden]";

  return (
    <section>
      <Rotulo icono={RotateCcw}>Repaso rápido · toca cada tarjeta</Rotulo>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t, i) => {
          const atras = volteadas.has(i);
          return (
            <button
              key={`${t.tema}-${t.frente}`}
              onClick={() => voltear(i)}
              aria-pressed={atras}
              aria-label={atras ? `${t.frente}: ${t.reverso}` : `${t.tema}, ${t.frente}. Toca para ver la respuesta`}
              className="h-44 rounded-2xl [perspective:1000px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
            >
              <span
                className={`relative block h-full w-full [transform-style:preserve-3d] ${quieto ? "" : "transition-transform duration-500"}`}
                style={{ transform: !quieto && atras ? "rotateY(180deg)" : undefined }}
              >
                {(quieto ? !atras : true) && (
                  <span className={`${cara} border border-gold-500/35 bg-gradient-to-br from-navy-700 to-navy-800`}>
                    <span className="text-xs font-medium text-gold-400/80">{t.tema}</span>
                    <span className="mt-2 font-display text-xl font-semibold text-white">{t.frente}</span>
                  </span>
                )}
                {(quieto ? atras : true) && (
                  <span
                    className={`${cara} bg-gold-400 text-sm font-medium leading-relaxed text-navy-950`}
                    style={{ transform: quieto ? undefined : "rotateY(180deg)" }}
                  >
                    {t.reverso}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Pregunta con candado: lo que sigue no aparece hasta contestar bien. Un fallo deja reintentar;
 * el segundo marca la correcta y abre, para no dejar a nadie atorado. No cuenta para el avance.
 */
export function Candado({ pregunta, abiertoDeInicio, onAbrir }: { pregunta: QuizPregunta; abiertoDeInicio: boolean; onAbrir: () => void }) {
  const [estado, setEstado] = useState<EstadoCandado>(() =>
    abiertoDeInicio ? { fallos: 0, abierto: true, elegida: pregunta.correcta } : CANDADO_NUEVO,
  );

  function elegir(i: number) {
    const nuevo = responderCandado(estado, i, pregunta.correcta);
    setEstado(nuevo);
    if (nuevo.abierto && !estado.abierto) onAbrir();
  }

  const mensaje = !estado.abierto
    ? estado.elegida !== null && "Esa no es. Inténtalo otra vez."
    : abiertoDeInicio
      ? "Ya habías leído esto. La correcta queda marcada."
      : estado.fallos >= 2
        ? "La correcta queda marcada. Sigamos."
        : "¡Correcto! Sigamos.";

  return (
    <section className="rounded-2xl border border-gold-500/25 bg-gradient-to-br from-navy-800 to-navy-900 p-6 md:p-8">
      <Rotulo icono={estado.abierto ? CheckCircle2 : Lock}>Comprueba antes de seguir</Rotulo>
      <h3 className="mt-4 font-display text-lg font-semibold text-white">{pregunta.pregunta}</h3>
      <div className="mt-5 flex flex-col gap-2.5">
        {pregunta.opciones.map((opcion, i) => {
          const correcta = i === pregunta.correcta;
          const elegida = i === estado.elegida;
          let clases = "border-white/10 bg-white/[0.02] hover:border-gold-500/30 hover:bg-white/[0.05]";
          if (estado.abierto) {
            if (correcta) clases = "border-gold-500/60 bg-gold-500/10 text-white";
            else if (elegida) clases = "border-red-500/50 bg-red-500/10 text-white";
            else clases = "border-white/10 bg-white/[0.02] opacity-50";
          } else if (elegida) clases = "border-red-500/50 bg-red-500/10 text-white";
          return (
            <button
              key={i}
              onClick={() => elegir(i)}
              disabled={estado.abierto || (elegida && !correcta)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm text-white/85 transition-colors duration-200 disabled:cursor-default ${clases}`}
            >
              {opcion}
              {estado.abierto && correcta && <Check size={16} className="shrink-0 text-gold-400" />}
              {elegida && !correcta && <X size={16} className="shrink-0 text-red-400" />}
            </button>
          );
        })}
      </div>
      <p className="mt-4 min-h-5 text-sm text-white/70" aria-live="polite">
        {mensaje}
      </p>
    </section>
  );
}

/** Pasos para hacer en el simulador; las marcas solo ayudan a no perderse, no cuentan para el avance. */
export function EnTuSimulador({ pasos }: { pasos: string[] }) {
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
