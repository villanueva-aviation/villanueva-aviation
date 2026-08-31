import { NavLink } from "react-router-dom";
import { CADET_TABS } from "../../lib/routes";
import { Container } from "../ui/Container";

export function CadetTabs() {
  return (
    <div className="relative border-b border-gold-500/15 bg-navy-900/40">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <Container className="relative">
        <nav className="flex items-center gap-1 overflow-x-auto py-3">
          {CADET_TABS.map((tab, i) => (
            <div key={tab.to} className="flex shrink-0 items-center">
              {i > 0 && <span className="mx-1 h-4 w-px bg-white/10" />}
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 font-display text-sm font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? "border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-[0_0_16px_rgba(212,175,55,0.25)]"
                      : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white"
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
                    <tab.icon
                      size={15}
                      strokeWidth={1.75}
                      className={
                        isActive
                          ? "text-gold-400"
                          : "text-white/40 transition-transform duration-200 group-hover:scale-110 group-hover:text-gold-400"
                      }
                    />
                    {tab.label}
                  </>
                )}
              </NavLink>
            </div>
          ))}
        </nav>
      </Container>
    </div>
  );
}
