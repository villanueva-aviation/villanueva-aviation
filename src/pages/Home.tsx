import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";
import { PanelAventura } from "../features/aventura/PanelAventura";
import { NavDisplay } from "../features/home/NavDisplay";
import { EtapasRuta } from "../features/home/EtapasRuta";
import { PruebaVOR } from "../features/landing/PruebaVOR";
import { MetarEnVivo } from "../features/home/MetarEnVivo";
import { FondoHero } from "../features/home/FondoHero";
import { FLOTA, TOTAL_AVIONES, fotoFlota } from "../data/flota";

// Uno por categoría: el primer vuelo, el salto a multimotor y el turbohélice.
const ADELANTO_FLOTA = ["c152", "seneca", "c90"].map((clave) =>
  FLOTA.flatMap((etapa) => etapa.aviones).find((a) => a.clave === clave)!,
);

export function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950">
        <FondoHero />
        <div className="relative mx-auto grid w-full max-w-[100rem] items-center gap-12 px-6 pb-10 pt-10 sm:pt-16 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10 lg:pb-6 lg:pt-6">
          <div className="lg:max-w-xl">
            <h1 className="animate-fade-up font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl xl:text-6xl 2xl:text-7xl">
              Aprende a volar <span className="text-gold-400">de verdad</span> en tu simulador
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: "60ms" }}>
              Teoría real, procedimientos y radio, en español y con el simulador que ya tienes en casa. Cuando quieras ir más
              rápido, el fundador te arma un plan a tu medida.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "120ms" }}>
              <Button to={ROUTES.testNivel} variant="primary" className="group">
                Descubre tu nivel
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button to={ROUTES.asesorias} variant="secondary">
                Asesorías 1 a 1
              </Button>
            </div>
            <p className="animate-fade-up mt-4 text-sm text-white/55" style={{ animationDelay: "160ms" }}>
              El test es gratis, sin cuenta y toma unos 3 minutos.
            </p>
          </div>
          <div className="animate-fade-up w-full lg:max-w-[min(860px,calc((100svh-23rem)*1.25))] lg:justify-self-end" style={{ animationDelay: "200ms" }}>
            <NavDisplay />
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[100rem] px-6 pb-6 md:px-8 lg:px-10">
          <MetarEnVivo />
        </div>
      </section>

      {/* PRUEBA DEL HSI */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <PruebaVOR href={ROUTES.testNivel} cta="Haz el test completo" titulo="Pruébate: ¿hacia dónde viras?" ancho />
        </Container>
      </section>

      <EtapasRuta />

      {/* EL FUNDADOR */}
      <section className="relative overflow-hidden border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-3xl border border-gold-500/20 shadow-[0_0_32px_rgba(212,175,55,0.18)]">
              <img
                src="/images/founder-erik-poster.jpg"
                alt="Erik Villanueva, fundador de Villanueva Aviation"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            </Reveal>
            <Reveal delay={150}>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Un sueño. Un plan. <span className="text-gold-400">Una ruta.</span>
              </h2>
              <div className="mt-6 border-l border-gold-500/60 pl-5">
                <p className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
                  "No es solo volar. Es vivir la aviación."
                </p>
                <p className="mt-2 text-sm text-white/50">— Erik Villanueva, fundador</p>
              </div>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60">
                Villanueva Aviation nace de esa misma idea: que el camino hacia la cabina no tiene por
                qué empezar en una escuela de vuelo cara e intimidante. Empieza aquí, con una base
                sólida, práctica en simulador y una comunidad que acompaña cada etapa.
              </p>
              <p className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-gold-400">
                El cielo no es el límite, es el comienzo.
              </p>
              <Button to={ROUTES.quienesSomos} variant="ghost" className="mt-6">
                Quiénes somos <ArrowRight size={16} />
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* LA FLOTA */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Flota virtual"
              title={`${TOTAL_AVIONES} aviones con los colores de la academia`}
              description="Del Cessna 152 del primer vuelo solo al King Air: la flota que vuela en simulador, ordenada como se sube de categoría en la aviación real."
            />
            <Button to={ROUTES.flota} variant="ghost" className="shrink-0">
              Conoce la flota <ArrowRight size={16} />
            </Button>
          </Reveal>
          <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
            {ADELANTO_FLOTA.map((avion, i) => (
              <Reveal key={avion.clave} delay={i * 120} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <Link
                  to={ROUTES.flota}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-gold-500/40"
                >
                  <img
                    src={fotoFlota(avion.clave).src}
                    srcSet={fotoFlota(avion.clave).srcSet}
                    sizes="(min-width: 640px) 33vw, 82vw"
                    alt={`${avion.modelo} ${avion.matricula} en vuelo, captura de simulador`}
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="flex items-baseline justify-between gap-3 px-5 py-4">
                    <span className="font-display text-xl font-bold tracking-tight text-white tabular-nums">{avion.matricula}</span>
                    <span className="truncate text-xs text-white/50">{avion.modelo}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <PanelAventura />

      {/* CTA FINAL */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <Container>
          <Reveal className="relative overflow-hidden rounded-3xl border border-gold-500/20">
            <img src="/images/msfs-volaris-climb.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-950/95" />
            <div className="relative z-10 px-8 py-16 text-center md:px-16">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Aquí empieza tu camino hacia la cabina
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/65">
                Descubre tu nivel en tres minutos y, cuando quieras, pide tu diagnóstico gratis para armar tu plan.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button to={ROUTES.testNivel} variant="primary" className="group">
                  Descubre tu nivel
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
                <Button to={ROUTES.diagnostico} variant="secondary">
                  Pedir mi diagnóstico gratis
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
