import type { PanelDiagramaData } from "../../data/panelesAviones";

export function PanelDiagram({ panel }: { panel: PanelDiagramaData }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="relative w-full">
        <img src={panel.imagen} alt={panel.alt} className="block w-full" />
        {panel.marcadores.map((m) => (
          <span
            key={m.numero}
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-navy-950/50 bg-gold-500 text-xs font-bold text-navy-950 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
            style={{ left: `${m.xPct}%`, top: `${m.yPct}%` }}
          >
            {m.numero}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-6 sm:grid-cols-2">
        {panel.marcadores.map((m) => (
          <div key={m.numero} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-xs font-bold text-gold-400">
              {m.numero}
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-white/90">{m.titulo}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/55">{m.nota}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
