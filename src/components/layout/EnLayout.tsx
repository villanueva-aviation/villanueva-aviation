import { Link, NavLink, useLocation } from "react-router-dom";
import { Globe, MessageCircle } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";
import { CONTACT_EMAIL, DISCORD_URL, SITE } from "../../lib/constants";
import { RUTAS_EN, rutaEnOtroIdioma } from "../../lib/idioma";
import { Logo } from "./Logo";

/** Barra de la puerta en inglés: pocas salidas, todas a páginas que existen en inglés. */
export function EnNavbar() {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const enlace = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm transition-colors duration-200 ${isActive ? "text-gold-400" : "text-white/70 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/15 bg-navy-950/95 backdrop-blur-lg">
      <div className="relative mx-auto flex max-w-[100rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-10">
        <Logo to={RUTAS_EN.home} />
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to={RUTAS_EN.home} end className={(s) => `hidden md:inline-flex ${enlace(s)}`}>
            Home
          </NavLink>
          <NavLink to={RUTAS_EN.coaching} className={(s) => `hidden sm:inline-flex ${enlace(s)}`}>
            Coaching
          </NavLink>
          <Link
            to={rutaEnOtroIdioma(pathname)}
            lang="es"
            hrefLang="es"
            aria-label="Versión en español"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-display text-xs font-semibold text-white/70 transition-colors duration-200 hover:border-gold-500/50 hover:text-gold-400"
          >
            <Globe size={14} strokeWidth={1.75} /> ES
          </Link>
          {isAuthenticated ? (
            <button onClick={() => logout()} className="hidden px-3 py-2 text-sm text-white/55 transition-colors hover:text-white lg:inline-flex">
              Sign out
            </button>
          ) : (
            <Link to={RUTAS_EN.signIn} className="hidden px-3 py-2 text-sm text-white/70 transition-colors hover:text-white lg:inline-flex">
              Sign in
            </Link>
          )}
          <Link
            to={RUTAS_EN.assessment}
            className="inline-flex whitespace-nowrap rounded-full bg-gold-500 px-4 py-2 font-display text-xs font-semibold text-navy-950 transition-transform duration-150 active:scale-[0.97] sm:text-sm"
          >
            Free assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function EnFooter() {
  return (
    <footer className="border-t border-gold-500/15 bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 lg:px-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo to={RUTAS_EN.home} />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              An independent online academy for flight theory and simulator training: from your first flight to flying online with
              air traffic control.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 block text-sm text-white/50 transition-colors hover:text-gold-400">
              {CONTACT_EMAIL}
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-gold-500/50 hover:text-gold-400"
            >
              <MessageCircle size={16} />
              Join our Discord
            </a>
            <p className="mt-2 text-xs text-white/40">Most of the community chats in Spanish.</p>
          </div>
          <nav className="flex flex-col gap-3 text-sm">
            <Link to={RUTAS_EN.coaching} className="text-white/65 transition-colors hover:text-gold-400">
              One-on-one coaching
            </Link>
            <Link to={RUTAS_EN.assessment} className="text-white/65 transition-colors hover:text-gold-400">
              Free assessment
            </Link>
            <Link to="/" lang="es" hrefLang="es" className="text-white/65 transition-colors hover:text-gold-400">
              Sitio en español
            </Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p>Independent online academy. We are not a certified flight school and do not issue pilot licenses.</p>
            <Link to={RUTAS_EN.legal} className="shrink-0 transition-colors hover:text-gold-400">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
