import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "green" | "red" | "neutral" | "bronce" | "plata" | "oro";
}) {
  const tones: Record<string, string> = {
    gold: "bg-gold-500/15 text-gold-400 border-gold-500/30",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    neutral: "bg-white/10 text-white/70 border-white/20",
    // Niveles de las insignias de avión.
    bronce: "bg-[#b87333]/15 text-[#e3a46f] border-[#b87333]/40",
    plata: "bg-slate-300/10 text-slate-200 border-slate-300/35",
    oro: "bg-gold-500/15 text-gold-400 border-gold-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium font-display tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
