import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { NAV_LINKS, ROUTES } from "../../lib/routes";
import { useAuth } from "../../features/auth/AuthContext";
import { Logo } from "./Logo";
import { HamburgerButton } from "./HamburgerButton";
import { MobileMenu } from "./MobileMenu";

function ProfileControl() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.ingresar}
        className="hidden rounded-full border border-white/25 px-4 py-2 font-display text-xs font-semibold text-white/85 transition-colors duration-200 hover:border-gold-500/50 hover:text-gold-400 lg:inline-flex"
      >
        Iniciar sesión
      </Link>
    );
  }

  const initial = (user?.nombre ?? "C").charAt(0).toUpperCase();

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 font-display text-sm font-semibold text-gold-400 transition-colors hover:bg-gold-500/20"
        aria-label="Perfil"
      >
        {initial}
      </button>
      <div
        className={`absolute right-0 top-12 w-48 origin-top-right rounded-xl border border-white/10 bg-navy-900/95 p-1.5 shadow-xl backdrop-blur-lg transition-[opacity,transform] duration-150 ease-out ${
          open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        }`}
      >
        <Link
          to={ROUTES.perfil}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
        >
          <User size={14} /> Mi perfil
        </Link>
        <button
          onClick={() => {
            logout();
            setOpen(false);
            navigate(ROUTES.home);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          scrolled ? "border-gold-500/15 bg-navy-950/85 backdrop-blur-lg" : "border-white/5 bg-navy-950/30 backdrop-blur-sm"
        }`}
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="animate-shimmer h-full w-1/3 bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
        </div>

        <div className="relative mx-auto flex max-w-[100rem] items-center justify-between gap-4 px-6 py-3 md:px-8 lg:px-10">
          <Logo />

          <nav className="hidden items-center xl:flex">
            {NAV_LINKS.map((link, i) => (
              <div key={link.to} className="flex items-center">
                {i > 0 && <span className="mx-1 h-4 w-px bg-white/10" />}
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 font-sans text-sm font-light transition-all duration-200 ${
                      isActive
                        ? "border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-[0_0_16px_rgba(212,175,55,0.25)]"
                        : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
                        </span>
                      )}
                      <link.icon
                        size={16}
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
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ProfileControl />
            <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
