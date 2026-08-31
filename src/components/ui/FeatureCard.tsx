import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:bg-white/[0.06]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors duration-300 group-hover:bg-gold-500/20">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{description}</p>
    </div>
  );
}
