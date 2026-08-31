import { Link, NavLink } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { NAV_LINKS, ROUTES } from "../../lib/routes";
import { DISCORD_URL } from "../../lib/constants";
import { useAuth } from "../../features/auth/AuthContext";
import { Logo } from "./Logo";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div
      className={`fixed inset-0 z-50 xl:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-navy-950/95 backdrop-blur-xl transition-opacity duration-700 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative flex h-full flex-col transition-all duration-700 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Logo onClick={onClose} />
          <button
            aria-label="Cerrar menú"
            onClick={onClose}
            className="relative flex h-10 w-10 items-center justify-center"
          >
            <span
              className="absolute h-[2px] w-6 rounded-full bg-white transition-transform duration-500"
              style={{
                transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                transform: "rotate(45deg)",
              }}
            />
            <span
              className="absolute h-[2px] w-6 rounded-full bg-white transition-transform duration-500"
              style={{
                transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                transform: "rotate(-45deg)",
              }}
            />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-4">
          {NAV_LINKS.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 border-b border-white/10 py-3 font-display text-xl font-semibold uppercase tracking-tight transition-all duration-500 hover:pl-4 hover:text-gold-400 sm:text-2xl ${
                  isActive ? "text-gold-400" : "text-white"
                } ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`
              }
              style={{
                transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                transitionDelay: open ? `${150 + i * 60}ms` : "0ms",
              }}
            >
              <link.icon size={18} strokeWidth={1.75} className="text-gold-500/70" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div
          className={`flex flex-col gap-3 px-6 pb-8 transition-all duration-700 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
            transitionDelay: open ? "550ms" : "0ms",
          }}
        >
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.perfil}
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 py-3 font-display text-sm font-semibold text-white"
              >
                <User size={15} /> Mi perfil {user ? `— ${user.nombre}` : ""}
              </Link>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                aria-label="Cerrar sesión"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to={ROUTES.ingresar}
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-full border border-white/25 py-3 font-display text-sm font-semibold text-white"
            >
              Iniciar sesión
            </Link>
          )}
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-full bg-gold-500 py-3.5 font-display text-sm font-semibold text-navy-950"
          >
            Unirse a Discord
          </a>
        </div>
      </div>
    </div>
  );
}
