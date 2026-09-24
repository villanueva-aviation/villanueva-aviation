import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { HotspotDiagram } from "../features/academia/HotspotDiagram";
import { useAuth } from "../features/auth/AuthContext";
import { PruebaVOR } from "../features/landing/PruebaVOR";
import { ROUTES } from "../lib/routes";

/**
 * Página de aterrizaje para el tráfico de redes. Sin barra de navegación y con
 * un solo camino: crear la cuenta y empezar la lección 1. Tu público viene de
 * un video de 30 segundos; cada enlace extra es una salida.
 */

const TEMAS = [
  {
    nombre: "Navegación",
    detalle:
      "VOR, radiales, CDI y OBS; interceptación y tracking; DME, HSI, ADF, arcos DME y patrones de espera.",
  },
  {
    nombre: "Comunicaciones",
    detalle: "Fraseología de radio con audio para practicar en voz alta, y el circuito de tráfico paso a paso.",
  },
  {
    nombre: "Instrumentos",
    detalle: "El Six Pack instrumento por instrumento, y qué pasa cuando falla el vacío, el pitot o la estática.",
  },
  {
    nombre: "Meteorología",
    detalle: "Leer un METAR y un TAF, y decidir si vuelas o no vuelas.",
  },
  {
    nombre: "IFR",
    detalle: "Aproximaciones, mínimos, y qué hacer cuando llegas a la altura de decisión sin ver la pista.",
  },
];

/** ¿Está el elemento a la vista? Sirve para que la barra móvil solo aparezca cuando el botón principal ya no se ve. */
function useVisible(ref: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export function Empieza() {
  const { isAuthenticated } = useAuth();
  const ctaHero = useRef<HTMLDivElement>(null);
  const ctaFinal = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const heroVisible = useVisible(ctaHero);
  const tarjetaVisible = useVisible(tarjeta);
  const finalVisible = useVisible(ctaFinal);

  const ocultarBarra = heroVisible || tarjetaVisible || finalVisible;

  useEffect(() => {
    const anterior = document.title;
    document.title = "Aprende a volar de verdad en tu simulador — Villanueva Aviation";
    return () => {
      document.title = anterior;
    };
  }, []);

  // Sin `from`, Ingresar lleva a Mi Formación, que manda al cadete nuevo directo a la lección 1.
  const irEmpezar = isAuthenticated ? ROUTES.miFormacion : ROUTES.ingresar;
  const irNavegacion = isAuthenticated
    ? ROUTES.academiaModulo("navegacion")
    : `${ROUTES.ingresar}?from=${encodeURIComponent(ROUTES.academiaModulo("navegacion"))}`;

  return (
    <div className="pb-24 md:pb-0">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="/images/msfs-xbvla-farmland-1280.jpg"
            srcSet="/images/msfs-xbvla-farmland-1280.jpg 1280w, /images/msfs-xbvla-farmland.jpg 1920w"
            sizes="100vw"
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/50 to-navy-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/70 via-navy-950/25 to-transparent" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="relative">
          <Container className="pt-6 sm:pt-8">
            <img
              src="/images/logo-horizontal-sm.png"
              alt="Villanueva Aviation"
              width="560"
              height="166"
              className="h-auto w-40 sm:w-48"
            />
          </Container>

          <Container className="grid gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14 lg:pb-24 lg:pt-14">
            <div className="lg:pt-8">
              <h1
                className="animate-fade-up font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl"
              >
                Aprende a volar <span className="whitespace-nowrap text-gold-400">de verdad</span> en tu simulador
              </h1>
              <p
                className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
                style={{ animationDelay: "60ms" }}
              >
                VOR, radiales, HSI, fraseología e IFR explicados paso a paso, con práctica en cada módulo y un
                proyecto final que revisa personalmente el fundador. Gratis y en español.
              </p>

              <div className="animate-fade-up mt-8" style={{ animationDelay: "120ms" }}>
                <div ref={ctaHero} className="inline-block">
                  <Button to={irEmpezar}>
                    Empieza gratis
                    <ArrowRight size={16} />
                  </Button>
                </div>
                <p className="mt-3 text-sm text-white/65">Sin tarjeta. Entras con Google o con un enlace a tu correo.</p>
                <Link
                  to={irNavegacion}
                  className="mt-6 inline-block rounded text-sm text-white/70 underline decoration-white/30 underline-offset-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:decoration-gold-400"
                >
                  ¿Ya dominas lo básico? Empieza por Navegación (VOR)
                </Link>
              </div>
            </div>

            <div ref={tarjeta} className="animate-fade-up" style={{ animationDelay: "180ms" }}>
              <PruebaVOR href={irEmpezar} />
            </div>
          </Container>
        </div>
      </section>

      {/* QUÉ VAS A APRENDER */}
      <section className="border-t border-white/10 py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
              Del primer radial a la aproximación IFR
            </h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {TEMAS.map((t) => (
                <li key={t.nombre} className="grid gap-1 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <h3 className="font-display text-lg font-semibold text-white">{t.nombre}</h3>
                  <p className="text-sm leading-relaxed text-white/70">{t.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* PRÁCTICA REAL */}
      <section className="border-t border-white/10 py-16 md:py-24">
        <Container>
          <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
            Toca cada instrumento. Decide en cada escenario.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
            Entre lección y lección hay preguntas rápidas, y cada módulo trae práctica: diagramas como este, escenarios
            de dos decisiones y un proyecto final. Lo de abajo es una muestra real del módulo de Instrumentos.
          </p>
          <div className="mt-10">
            <HotspotDiagram setId="six-pack" />
          </div>
        </Container>
      </section>

      {/* QUIÉN REVISA */}
      <section className="border-t border-white/10 py-16 md:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <img
              src="/images/founder-erik-poster-sm.jpg"
              alt="Erik Villanueva, fundador de Villanueva Aviation"
              width="640"
              height="960"
              loading="lazy"
              className="mx-auto aspect-[2/3] w-full max-w-xs rounded-3xl border border-white/10 object-cover"
            />
            <div>
              <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
                Quién revisa tu trabajo
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
                Erik Villanueva es piloto virtual, con los exámenes de IVAO Senior Private Pilot, y estudia a fondo el
                material de piloto privado real. Cada proyecto final que envíes lo revisa él personalmente.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                Villanueva Aviation es formación complementaria para el simulador y para prepararte antes de una
                escuela de vuelo. No es una escuela certificada ni emite licencias.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CIERRE */}
      <section className="border-t border-white/10 bg-gradient-to-b from-navy-950 to-navy-900 py-20 text-center md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
            Tu primera lección está lista
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70">
            Cuenta gratis, sin tarjeta. Empiezas en la lección 1 y avanzas a tu ritmo.
          </p>
          <div ref={ctaFinal} className="mt-8 inline-block">
            <Button to={irEmpezar}>
              Empieza gratis
              <ArrowRight size={16} />
            </Button>
          </div>
        </Container>
      </section>

      <footer className="border-t border-white/10 py-6">
        <Container className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
          <span>© {new Date().getFullYear()} Villanueva Aviation</span>
          <Link
            to={ROUTES.legal}
            className="rounded underline decoration-white/30 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
          >
            Aviso legal
          </Link>
        </Container>
      </footer>

      {/* Barra móvil: aparece cuando ya no hay un botón a la vista. Se esconde con el botón del hero, con la tarjeta de la prueba (trae el suyo al contestar) y con el cierre. */}
      <div
        inert={ocultarBarra}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy-950/95 p-3 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none md:hidden ${
          ocultarBarra ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <Button to={irEmpezar} className="w-full">
          Empieza gratis
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
