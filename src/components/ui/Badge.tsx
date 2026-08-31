import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "green" | "red" | "neutral";
}) {
  const tones: Record<string, string> = {
    gold: "bg-gold-500/15 text-gold-400 border-gold-500/30",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    neutral: "bg-white/10 text-white/70 border-white/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium font-display tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
