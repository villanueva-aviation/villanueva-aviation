import { useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { CESSNA_HOTSPOTS } from "./hotspots";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function DragDropLabels({ onComplete }: { onComplete: () => void }) {
  const labels = useMemo(() => shuffle(CESSNA_HOTSPOTS.map((h) => h.id)), []);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrongZone, setWrongZone] = useState<string | null>(null);

  const allCorrect = CESSNA_HOTSPOTS.every((h) => placed[h.id] === h.id);

  function handleDrop(zoneId: string, e: React.DragEvent) {
    e.preventDefault();
    const labelId = e.dataTransfer.getData("text/plain");
    if (!labelId) return;
    if (labelId === zoneId) {
      const next = { ...placed, [zoneId]: labelId };
      setPlaced(next);
      if (CESSNA_HOTSPOTS.every((h) => next[h.id] === h.id)) onComplete();
    } else {
      setWrongZone(zoneId);
      setTimeout(() => setWrongZone(null), 500);
    }
  }

  function reset() {
    setPlaced({});
  }

  const availableLabels = labels.filter((id) => !placed[id]);

  return (
    <div>
      <p className="text-sm text-white/60">
        Arrastra cada nombre a la zona correcta de la aeronave. Suéltalo sobre el punto que le corresponde.
      </p>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
        <img src="/images/cessna-topview.png" alt="Cessna 172 de Villanueva Aviation, vista superior" className="w-full" />
        {CESSNA_HOTSPOTS.map((h) => (
          <div
            key={h.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(h.id, e)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.xPct}%`, top: `${h.yPct}%` }}
          >
            {placed[h.id] ? (
              <span className="flex items-center gap-1 rounded-full border border-gold-500/50 bg-navy-950/90 px-2.5 py-1 text-[11px] font-semibold text-gold-400 whitespace-nowrap">
                <Check size={11} /> {h.label}
              </span>
            ) : (
              <span
                className={`block h-6 w-6 rounded-full border-2 border-dashed transition-colors ${
                  wrongZone === h.id ? "border-red-400 bg-red-500/20" : "border-white/40 bg-white/5"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {availableLabels.map((id) => {
          const hotspot = CESSNA_HOTSPOTS.find((h) => h.id === id)!;
          return (
            <span
              key={id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", id)}
              className="cursor-grab rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-2 text-sm font-medium text-gold-400 active:cursor-grabbing"
            >
              {hotspot.label}
            </span>
          );
        })}
        {availableLabels.length === 0 && !allCorrect && (
          <span className="text-sm text-white/40">Todas las etiquetas colocadas.</span>
        )}
      </div>

      {allCorrect ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-gold-400">
          <Check size={16} /> ¡Todas las etiquetas correctas!
        </p>
      ) : (
        Object.keys(placed).length > 0 && (
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
          >
            <RotateCcw size={12} /> Reiniciar
          </button>
        )
      )}
    </div>
  );
}
