import { useMemo, useState } from "react";
import { Check } from "lucide-react";

export interface TermPair {
  id: string;
  term: string;
  definition: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function TermMatch({ pairs, onComplete }: { pairs: TermPair[]; onComplete?: () => void }) {
  const terms = useMemo(() => shuffle(pairs), [pairs]);
  const definitions = useMemo(() => shuffle(pairs), [pairs]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  function pickTerm(id: string) {
    if (matched.has(id)) return;
    setSelectedTerm(id);
    setWrongPair(null);
  }

  function pickDefinition(id: string) {
    if (matched.has(id) || !selectedTerm) return;
    if (selectedTerm === id) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelectedTerm(null);
      if (next.size === pairs.length) onComplete?.();
    } else {
      setWrongPair(id);
      setTimeout(() => setWrongPair(null), 500);
      setSelectedTerm(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <p className="text-sm text-white/60">Elige un término y luego su definición correcta para relacionarlos.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          {terms.map((p) => (
            <button
              key={p.id}
              onClick={() => pickTerm(p.id)}
              disabled={matched.has(p.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-150 ${
                matched.has(p.id)
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-400/70"
                  : selectedTerm === p.id
                    ? "border-gold-500 bg-gold-500/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/80 hover:border-gold-500/30"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                {p.term}
                {matched.has(p.id) && <Check size={14} />}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {definitions.map((p) => (
            <button
              key={p.id}
              onClick={() => pickDefinition(p.id)}
              disabled={matched.has(p.id)}
              className={`rounded-xl border px-4 py-3 text-left text-xs leading-relaxed transition-all duration-150 ${
                matched.has(p.id)
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-400/70"
                  : wrongPair === p.id
                    ? "border-red-500/60 bg-red-500/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:border-gold-500/30"
              }`}
            >
              {p.definition}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 text-xs text-white/45">
        {matched.size} de {pairs.length} relacionados correctamente.
      </p>
    </div>
  );
}
