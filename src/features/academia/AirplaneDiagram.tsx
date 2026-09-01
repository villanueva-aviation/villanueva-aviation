import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Copy, RotateCcw } from "lucide-react";
import { CESSNA_HOTSPOTS, type Hotspot } from "./hotspots";

export function AirplaneDiagram() {
  const [searchParams] = useSearchParams();
  const editable = searchParams.has("editar");

  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Hotspot[]>(CESSNA_HOTSPOTS);
  const [active, setActive] = useState(CESSNA_HOTSPOTS[0].id);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const activeHotspot = positions.find((h) => h.id === active) ?? positions[0];

  function updateFromPointer(id: string, clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.round((((clientX - rect.left) / rect.width) * 100) * 10) / 10;
    const yPct = Math.round((((clientY - rect.top) / rect.height) * 100) * 10) / 10;
    setPositions((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, xPct: Math.min(100, Math.max(0, xPct)), yPct: Math.min(100, Math.max(0, yPct)) }
          : h,
      ),
    );
  }

  function handlePointerDown(id: string, e: React.PointerEvent) {
    setActive(id);
    if (!editable) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingId(id);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    updateFromPointer(draggingId, e.clientX, e.clientY);
  }

  function resetPositions() {
    setPositions(CESSNA_HOTSPOTS);
  }

  function copyCode() {
    const code = positions
      .map(
        (h) =>
          `  { id: "${h.id}", label: "${h.label}", description: "${h.description}", xPct: ${h.xPct}, yPct: ${h.yPct} },`,
      )
      .join("\n");
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        {editable && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs text-gold-400">
            <span>Modo edición: arrastra los puntos con el mouse.</span>
            <div className="flex gap-2">
              <button onClick={resetPositions} className="inline-flex items-center gap-1 hover:text-white">
                <RotateCcw size={12} /> Restablecer
              </button>
              <button onClick={copyCode} className="inline-flex items-center gap-1 hover:text-white">
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copiado" : "Copiar código"}
              </button>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-950 select-none"
        >
          <img
            src="/images/cessna-topview.png"
            alt="Cessna 172 de Villanueva Aviation, vista superior"
            className="w-full"
            draggable={false}
          />
          {positions.map((h) => (
            <button
              key={h.id}
              onPointerDown={(e) => handlePointerDown(h.id, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDraggingId(null)}
              aria-label={h.label}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${editable ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{ left: `${h.xPct}%`, top: `${h.yPct}%` }}
            >
              {active === h.id && (
                <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-gold-500/50" />
              )}
              <span
                className={`relative block rounded-full border-2 border-navy-950 transition-all duration-200 ${
                  active === h.id ? "h-5 w-5 bg-gold-500" : "h-3.5 w-3.5 bg-gold-500/70 hover:bg-gold-400"
                }`}
              />
              {editable && active === h.id && (
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-navy-950 px-1.5 py-0.5 text-[10px] text-gold-400">
                  {h.xPct}%, {h.yPct}%
                </span>
              )}
            </button>
          ))}
        </div>

        {editable && (
          <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] text-white/60">
            {positions.map((h) => `${h.id}: ${h.xPct}%, ${h.yPct}%`).join("\n")}
          </pre>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5">
          <h4 className="font-display text-base font-semibold text-white">{activeHotspot.label}</h4>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{activeHotspot.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {positions.map((h) => (
            <button
              key={h.id}
              onClick={() => setActive(h.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors duration-200 ${
                active === h.id
                  ? "border-gold-500/50 bg-gold-500/10 text-gold-400"
                  : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
