import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../lib/routes";

export function LockedOverlay({ label = "Solo para cadetes" }: { label?: string }) {
  return (
    <Link
      to={ROUTES.ingresar}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-navy-950/75 text-center backdrop-blur-sm transition-colors hover:bg-navy-950/85"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-400">
        <Lock size={16} />
      </span>
      <span className="font-display text-sm font-semibold text-white">{label}</span>
      <span className="text-xs text-gold-400">Iniciar sesión →</span>
    </Link>
  );
}
