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
      <span className="relative inline-flex items-center transition-transform duration-300 group-hover:scale-[1.03]">
        <img
          src="/images/logo-full.png"
          alt="Villanueva Aviation"
          className="h-28 w-auto sm:h-36 md:h-44 lg:h-52"
        />
      </span>
    </Link>
  );
}
