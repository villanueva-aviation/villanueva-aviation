import type { LucideIcon } from "lucide-react";

export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-white">{value}</p>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-white/50">{label}</p>
        {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
      </div>
    </div>
  );
}
