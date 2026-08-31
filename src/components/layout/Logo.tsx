import { Link } from "react-router-dom";
import { ROUTES } from "../../lib/routes";

export function Logo({ onClick, className = "" }: { onClick?: () => void; className?: string }) {
  return (
    <Link
      to={ROUTES.home}
      onClick={onClick}
      className={`group relative inline-flex items-center ${className}`}
    >
      <span className="pointer-events-none absolute -inset-4 rounded-full bg-gold-500/25 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <span className="relative inline-flex items-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] ring-1 ring-gold-500/30 transition-transform duration-300 group-hover:scale-[1.03] px-4 py-2.5 sm:px-5 sm:py-3">
        <img
          src="/images/logo-mark.png"
          alt="Villanueva Aviation"
          className="h-14 w-auto sm:h-16 md:h-20 lg:h-24"
        />
      </span>
    </Link>
  );
}
