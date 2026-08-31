import { NavLink } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { NAV_LINKS } from "../../lib/routes";
import { DISCORD_URL, SITE } from "../../lib/constants";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gold-500/15 bg-navy-950">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="animate-shimmer h-full w-1/3 bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10 lg:px-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              {SITE.description}
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-gold-500/50 hover:text-gold-400"
            >
              <MessageCircle size={16} />
              Únete a nuestro Discord
            </a>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `group flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-[0_0_16px_rgba(212,175,55,0.25)]"
                      : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      size={14}
                      strokeWidth={1.75}
                      className={
                        isActive
                          ? "text-gold-400"
                          : "text-white/40 transition-transform duration-200 group-hover:scale-110 group-hover:text-gold-400"
                      }
                    />
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
          <p>Comunidad independiente de aviación. No afiliada a ninguna aerolínea real.</p>
        </div>
      </div>
    </footer>
  );
}
