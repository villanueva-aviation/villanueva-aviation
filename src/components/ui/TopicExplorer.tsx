import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface ExplorerTema {
  id: string;
  titulo: string;
  texto: string;
  imagenes?: string[];
}

export function TopicExplorer({ temas }: { temas: ExplorerTema[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [explored, setExplored] = useState<Set<string>>(new Set());

  function toggle(tema: ExplorerTema) {
    setActiveId((current) => (current === tema.id ? null : tema.id));
    if (!explored.has(tema.id)) {
      const next = new Set(explored);
      next.add(tema.id);
      setExplored(next);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: `${(explored.size / temas.length) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap font-mono text-xs text-white/45">
          {explored.size}/{temas.length} exploradas
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {temas.map((tema, i) => {
          const isOpen = activeId === tema.id;
          const isExplored = explored.has(tema.id);
          return (
            <div
              key={tema.id}
              className={`overflow-hidden rounded-xl border transition-colors duration-150 ${
                isOpen ? "border-gold-500/50 bg-white/[0.04]" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <button
                onClick={() => toggle(tema)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-white/85">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                      isExplored ? "bg-gold-500 text-navy-950" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {isExplored ? <Check size={12} /> : i + 1}
                  </span>
                  {tema.titulo}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-white/10 px-4 py-4">
                  <p className="text-sm leading-relaxed text-white/65">{tema.texto}</p>
                  {tema.imagenes && tema.imagenes.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {tema.imagenes.map((src) => (
                        <div key={src} className="overflow-hidden rounded-xl border border-white/10">
                          <img src={src} alt={tema.titulo} className="w-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
