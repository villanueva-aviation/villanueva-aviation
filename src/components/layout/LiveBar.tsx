import { useEffect, useState } from "react";
import { X, Radio } from "lucide-react";
import { NEXT_LIVE_EVENT, DISCORD_URL } from "../../lib/constants";

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, remaining);
  const days = Math.floor(clamped / 86400000);
  const hours = Math.floor((clamped % 86400000) / 3600000);
  const minutes = Math.floor((clamped % 3600000) / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);

  return { days, hours, minutes, seconds, done: remaining <= 0 };
}

export function LiveBar() {
  const [dismissed, setDismissed] = useState(false);
  const { days, hours, minutes, seconds, done } = useCountdown(NEXT_LIVE_EVENT.date);

  if (dismissed || done) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold-500/20 bg-navy-950/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="hidden shrink-0 font-display text-xs font-semibold uppercase tracking-wide text-white/70 sm:inline">
            Próximo en vivo
          </span>
          <span className="truncate text-xs text-white/60 sm:text-sm">{NEXT_LIVE_EVENT.title}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-1 font-display text-sm font-semibold text-gold-400 xs:flex sm:gap-1.5">
            <span>{pad(days)}d</span>
            <span className="text-white/30">:</span>
            <span>{pad(hours)}h</span>
            <span className="text-white/30">:</span>
            <span>{pad(minutes)}m</span>
            <span className="text-white/30">:</span>
            <span>{pad(seconds)}s</span>
          </div>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 font-display text-xs font-semibold text-navy-950 transition-colors hover:bg-gold-400 sm:px-4 sm:text-sm"
          >
            <Radio size={13} />
            Ver en vivo
          </a>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Cerrar"
            className="text-white/40 transition-colors hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
