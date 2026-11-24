import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RepeticionVuelo } from "./RepeticionVuelo";
import { CAMPO_PUNTO } from "./recorrido";
import { grabacionDemo } from "./recorridoDemo";

const marco = "overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-2xl shadow-black/40";

/** Una pantalla del instructor con brillo dorado detrás; llega inclinada y se endereza al bajar (index.css). */
export function Pantalla({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative isolate ${className}`}>
      <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(closest-side,rgba(212,175,55,0.2),transparent)] blur-2xl" />
      <figure className={`pantalla-inclinada ${marco}`}>{children}</figure>
    </div>
  );
}

/**
 * La repetición real del vuelo demo, parada en el primer mensaje del instructor dentro de la zona.
 * Con `autoplay` arranca sola a ×4 la primera vez que se ve, salvo con «reducir movimiento».
 */
export function DemoVuelo({ autoplay = false }: { autoplay?: boolean }) {
  const g = useMemo(() => grabacionDemo(), []);
  const [t, setT] = useState(() => {
    const zona = g.fases.find((f) => f.fase === "zona");
    const voz = zona && g.voz.find((v) => v.t >= zona.inicio && v.t <= zona.fin);
    return voz ? voz.t + 2 : (g.puntos[0]?.[CAMPO_PUNTO.t] ?? 0);
  });
  const caja = useRef<HTMLDivElement>(null);
  const [enVista, setEnVista] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!autoplay || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setEnVista(true);
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  return (
    <div ref={caja} className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="font-display font-bold text-white">Vuelo de demostración · Virajes a rumbos</p>
        <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-300">Toca ▶ o arrastra</span>
      </div>
      {/* La key reinicia el reproductor para que arranque andando cuando entra en vista. */}
      <RepeticionVuelo key={enVista ? "andando" : "quieto"} grabacion={g} cursorT={t} alMover={setT} idioma="es" velInicial={enVista ? 4 : 0} />
    </div>
  );
}
