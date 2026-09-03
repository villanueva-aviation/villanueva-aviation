import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, RotateCcw, XCircle } from "lucide-react";
import { SITUACIONES_CIRCUITO, TRAMOS_CIRCUITO, type SituacionCircuito } from "../../data/circuitoTrafico";

type PosicionesTablero = Record<string, { xPct: number; yPct: number }>;

function posicionesIniciales(): PosicionesTablero {
  return Object.fromEntries(TRAMOS_CIRCUITO.map((t) => [t.id, { xPct: t.xPct, yPct: t.yPct }]));
}

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
  "viento-en-cara": 30,
  "viento-cruzado": -45,
  "viento-en-cola": -135,
  base: 135,
  final: 90,
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
  const [searchParams] = useSearchParams();
  const editable = searchParams.has("editar");

  const containerRef = useRef<HTMLDivElement>(null);
  const [posiciones, setPosiciones] = useState<PosicionesTablero>(posicionesIniciales);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const tramoAvion = tramoActivoId ? TRAMOS_CIRCUITO.find((t) => t.id === tramoActivoId) : undefined;

  function actualizarDesdePuntero(id: string, clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.round((((clientX - rect.left) / rect.width) * 100) * 10) / 10;
    const yPct = Math.round((((clientY - rect.top) / rect.height) * 100) * 10) / 10;
    setPosiciones((prev) => ({
      ...prev,
      [id]: { xPct: Math.min(100, Math.max(0, xPct)), yPct: Math.min(100, Math.max(0, yPct)) },
    }));
  }

  function handlePointerDown(id: string, e: React.PointerEvent) {
    if (!editable) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingId(id);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    actualizarDesdePuntero(draggingId, e.clientX, e.clientY);
  }

  function restablecerPosiciones() {
    setPosiciones(posicionesIniciales());
  }

  const codigoPosiciones = TRAMOS_CIRCUITO.map(
    (t) => `${t.id}: { xPct: ${posiciones[t.id].xPct}, yPct: ${posiciones[t.id].yPct} }`,
  ).join("\n");

  function copiarCodigo() {
    navigator.clipboard
      .writeText(codigoPosiciones)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      })
      .catch(() => {
        // El navegador bloqueó el portapapeles — el texto de abajo se puede seleccionar y copiar a mano.
      });
  }

  return (
    <div>
      {editable && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs text-gold-400">
          <span>Modo edición: arrastra los puntos con el mouse.</span>
          <div className="flex gap-2">
            <button onClick={restablecerPosiciones} className="inline-flex items-center gap-1 hover:text-white">
              <RotateCcw size={12} /> Restablecer
            </button>
            <button onClick={copiarCodigo} className="inline-flex items-center gap-1 hover:text-white">
              {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? "Copiado" : "Copiar código"}
            </button>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDraggingId(null)}
        className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-950 select-none"
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <rect
            x="15"
            y="20"
            width="70"
            height="60"
            rx="10"
            ry="10"
            fill="none"
            className="stroke-white/25"
            strokeWidth="1.5"
          />
          <rect x="38" y="74" width="24" height="12" className="fill-white/15" />
          <line x1="41" y1="80" x2="59" y2="80" className="stroke-white/25" strokeWidth="0.6" strokeDasharray="2.5 2.5" />
        </svg>
        {TRAMOS_CIRCUITO.map((tramo) => {
          const pos = posiciones[tramo.id];
          const esActivo = tramo.id === tramoActivoId;
          const esCorrecto = tramo.id === tramoCorrectoId;
          const esIncorrecto = tramo.id === tramoIncorrectoId;
          const rotacion = ROTACION_TRAMO[tramo.id] ?? 0;
          return (
            <button
              key={tramo.id}
              onPointerDown={(e) => handlePointerDown(tramo.id, e)}
              onClick={() => !editable && onClickTramo?.(tramo.id)}
              disabled={!editable && !onClickTramo}
              aria-label={tramo.nombre}
              className={`absolute ${editable ? "cursor-grab active:cursor-grabbing" : "disabled:cursor-default"}`}
              style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%`, transform: "translate(-50%, -50%)" }}
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
                        : editable || onClickTramo
                          ? "text-white/35 hover:text-white/60"
                          : "text-white/35"
                  }`}
                />
              </span>
              {editable && (
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-navy-950 px-1.5 py-0.5 text-[10px] text-gold-400">
                  {pos.xPct}%, {pos.yPct}%
                </span>
              )}
            </button>
          );
        })}
        {tramoAvion && (
          <motion.div
            className="pointer-events-none absolute z-10 text-gold-400"
            initial={false}
            animate={{
              left: `${posiciones[tramoAvion.id].xPct}%`,
              top: `${posiciones[tramoAvion.id].yPct}%`,
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

      {editable && (
        <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] text-white/60 select-text">
          {codigoPosiciones}
        </pre>
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
