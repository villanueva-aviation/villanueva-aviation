import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { SITUACIONES_CIRCUITO, TRAMOS_CIRCUITO, type SituacionCircuito } from "../../data/circuitoTrafico";

/** Silueta simple de avión, apuntando hacia arriba por defecto (0°) para que ROTACION_TRAMO sea exacta. */
function IconAvionCircuito({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2 L15 11 L22 15 L22 17 L15 15 L15 19 L18 21 L18 22.5 L12 21 L6 22.5 L6 21 L9 19 L9 15 L2 17 L2 15 L9 11 Z" />
    </svg>
  );
}

function elegirSituacionAleatoria(excluirId?: string): SituacionCircuito {
  const opciones = excluirId
    ? SITUACIONES_CIRCUITO.filter((s) => s.id !== excluirId)
    : SITUACIONES_CIRCUITO;
  return opciones[Math.floor(Math.random() * opciones.length)];
}

/** Rumbo del avión durante cada tramo, en grados, hacia el siguiente punto del circuito. */
const ROTACION_TRAMO: Record<string, number> = {
  "viento-en-cara": 0,
  "viento-cruzado": -90,
  "viento-en-cola": 180,
  base: 90,
  final: 0,
};

function TableroCircuito({
  tramoActivoId,
  tramoCorrectoId,
  tramoIncorrectoId,
  onClickTramo,
}: {
  tramoActivoId?: string;
  tramoCorrectoId?: string;
  tramoIncorrectoId?: string;
  onClickTramo?: (id: string) => void;
}) {
  const tramoAvion = tramoActivoId ? TRAMOS_CIRCUITO.find((t) => t.id === tramoActivoId) : undefined;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect x="44" y="35" width="12" height="38" className="fill-white/10" />
        <line x1="50" y1="39" x2="50" y2="69" className="stroke-white/20" strokeWidth="0.6" strokeDasharray="2.5 2.5" />
        <polyline points="50,35 50,15 19,15 19,73 50,73 50,92" fill="none" className="stroke-white/20" strokeWidth="1" />
        <line x1="50" y1="92" x2="50" y2="35" className="stroke-white/10" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
      {TRAMOS_CIRCUITO.map((tramo) => {
        const esActivo = tramo.id === tramoActivoId;
        const esCorrecto = tramo.id === tramoCorrectoId;
        const esIncorrecto = tramo.id === tramoIncorrectoId;
        const rotacion = ROTACION_TRAMO[tramo.id] ?? 0;
        return (
          <button
            key={tramo.id}
            onClick={() => onClickTramo?.(tramo.id)}
            disabled={!onClickTramo}
            aria-label={tramo.nombre}
            className="absolute disabled:cursor-default"
            style={{ left: `${tramo.xPct}%`, top: `${tramo.yPct}%`, transform: "translate(-50%, -50%)" }}
          >
            {(esActivo || esCorrecto) && (
              <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-gold-500/50" />
            )}
            <span className="relative inline-block" style={{ transform: `rotate(${rotacion}deg)` }}>
              <IconAvionCircuito
                size={18}
                className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-colors duration-200 ${
                  esCorrecto
                    ? "text-emerald-400"
                    : esIncorrecto
                      ? "text-red-400"
                      : onClickTramo
                        ? "text-white/35 hover:text-white/60"
                        : "text-white/35"
                }`}
              />
            </span>
          </button>
        );
      })}
      {tramoAvion && (
        <motion.div
          className="pointer-events-none absolute z-10 text-gold-400"
          initial={false}
          animate={{
            left: `${tramoAvion.xPct}%`,
            top: `${tramoAvion.yPct}%`,
            x: "-50%",
            y: "-50%",
            rotate: ROTACION_TRAMO[tramoAvion.id] ?? 0,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <IconAvionCircuito size={26} className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
        </motion.div>
      )}
    </div>
  );
}

export function CircuitoTrafico({ onComplete }: { onComplete?: () => void }) {
  const [modo, setModo] = useState<"aprende" | "prueba">("aprende");

  const [paradaActiva, setParadaActiva] = useState(1);
  const tramoActivo = TRAMOS_CIRCUITO.find((t) => t.numero === paradaActiva)!;

  const [situacionActual, setSituacionActual] = useState<SituacionCircuito>(() => elegirSituacionAleatoria());
  const [tramoElegidoId, setTramoElegidoId] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const autoAvanzarRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAvanzarRef.current) clearTimeout(autoAvanzarRef.current);
    };
  }, []);

  const respondioCorrecto = tramoElegidoId !== null && tramoElegidoId === situacionActual.tramoCorrectoId;
  const respondioIncorrecto = tramoElegidoId !== null && !respondioCorrecto;

  function cambiarModo(nuevo: "aprende" | "prueba") {
    if (autoAvanzarRef.current) {
      clearTimeout(autoAvanzarRef.current);
      autoAvanzarRef.current = null;
    }
    setModo(nuevo);
    if (nuevo === "prueba") {
      setSituacionActual(elegirSituacionAleatoria());
      setTramoElegidoId(null);
      setAciertos(0);
      setIntentos(0);
    }
  }

  function siguienteParada() {
    if (paradaActiva >= TRAMOS_CIRCUITO.length) {
      onComplete?.();
      return;
    }
    setParadaActiva((p) => p + 1);
  }

  function anteriorParada() {
    setParadaActiva((p) => Math.max(1, p - 1));
  }

  function elegirTramo(id: string) {
    if (tramoElegidoId !== null) return;
    setTramoElegidoId(id);
    setIntentos((i) => i + 1);
    if (id === situacionActual.tramoCorrectoId) {
      setAciertos((a) => a + 1);
      autoAvanzarRef.current = setTimeout(() => {
        setSituacionActual((actual) => elegirSituacionAleatoria(actual.id));
        setTramoElegidoId(null);
        autoAvanzarRef.current = null;
      }, 1000);
    }
  }

  function siguienteSituacion() {
    setSituacionActual((actual) => elegirSituacionAleatoria(actual.id));
    setTramoElegidoId(null);
  }

  const tramoCorrectoInfo = TRAMOS_CIRCUITO.find((t) => t.id === situacionActual.tramoCorrectoId)!;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      {modo === "prueba" && (
        <p className="mb-3 text-xs text-white/50">
          {aciertos} de {intentos} correctas
        </p>
      )}

      {modo === "aprende" ? (
        <p className="mb-4 text-sm leading-relaxed text-white/80">
          Parada {tramoActivo.numero} de {TRAMOS_CIRCUITO.length}
        </p>
      ) : (
        <p className="mb-4 text-sm leading-relaxed text-white/80">{situacionActual.prompt}</p>
      )}

      <TableroCircuito
        tramoActivoId={modo === "aprende" ? tramoActivo.id : undefined}
        tramoCorrectoId={modo === "prueba" && tramoElegidoId !== null ? situacionActual.tramoCorrectoId : undefined}
        tramoIncorrectoId={modo === "prueba" && respondioIncorrecto ? (tramoElegidoId ?? undefined) : undefined}
        onClickTramo={modo === "prueba" ? elegirTramo : undefined}
      />

      {modo === "aprende" && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="font-display text-sm font-semibold text-white">
            {tramoActivo.nombre} <span className="text-white/40">({tramoActivo.nombreIngles})</span>
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{tramoActivo.queHace}</p>
          <p className="mt-2 text-xs text-gold-400">{tramoActivo.reporteRadio}</p>
        </div>
      )}

      {modo === "prueba" && tramoElegidoId !== null && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          {respondioCorrecto ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">{respondioCorrecto ? "¡Correcto!" : "No era ese tramo"}</p>
            {respondioIncorrecto && (
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                Era {tramoCorrectoInfo.nombre}: {tramoCorrectoInfo.queHace}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => cambiarModo("aprende")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              modo === "aprende"
                ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Aprende el recorrido
          </button>
          <button
            onClick={() => cambiarModo("prueba")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              modo === "prueba"
                ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Ponte a prueba
          </button>
        </div>

        {modo === "aprende" && (
          <div className="flex gap-2">
            <button
              onClick={anteriorParada}
              disabled={paradaActiva === 1}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Anterior
            </button>
            <button
              onClick={siguienteParada}
              className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              {paradaActiva >= TRAMOS_CIRCUITO.length ? "Terminar recorrido" : "Siguiente"} <ChevronRight size={15} />
            </button>
          </div>
        )}

        {modo === "prueba" && respondioIncorrecto && (
          <button
            onClick={siguienteSituacion}
            className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
