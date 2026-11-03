import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";
import { DISCORD_URL } from "../lib/constants";
import { PanelAventura } from "../features/aventura/PanelAventura";
import { NavDisplay } from "../features/home/NavDisplay";
import { PruebaVOR } from "../features/landing/PruebaVOR";
import { MetarEnVivo } from "../features/home/MetarEnVivo";
import { FondoHero } from "../features/home/FondoHero";
import { FLOTA, TOTAL_AVIONES, fotoFlota } from "../data/flota";
import { SECCIONES } from "../data/secciones";

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
              Todo para volar <span className="text-gold-400">mejor</span> tu simulador
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: "60ms" }}>
              Rutas de México con su plan de vuelo, el clima real decodificado, dashes y checklists para tu cabina y una
              comunidad que vuela contigo. En español y gratis para empezar.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "120ms" }}>
              <Button to={ROUTES.vuela} variant="primary" className="group">
                Prepara tu próximo vuelo
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="secondary">
                <MessageCircle size={16} /> Únete al Discord
              </Button>
            </div>
            <p className="animate-fade-up mt-4 text-sm text-white/55" style={{ animationDelay: "160ms" }}>
              ¿Quieres aprender aviación de verdad?{" "}
              <Link to={ROUTES.aprende} className="font-medium text-gold-400 hover:text-gold-300">
                La Academia es gratis
              </Link>
              .
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

      {/* LAS CUATRO SECCIONES */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="La casa del simulador"
            title="Elige por dónde entrar"
            description="Cuatro secciones para cada momento: antes de despegar, en tu cabina, cuando quieres aprender y cuando quieres volar acompañado."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {SECCIONES.map((s, i) => (
              <Reveal key={s.clave} delay={i * 100}>
                <Link
                  to={s.to}
                  className="group relative block overflow-hidden rounded-2xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
                >
                  <img
                    src={s.img.src}
                    srcSet={s.img.srcSet}
                    sizes="(min-width: 640px) 45vw, 100vw"
                    alt=""
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-white">
                      {s.nombre}
                      <ArrowRight size={18} className="text-gold-400 transition-transform duration-200 group-hover:translate-x-1" />
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">{s.resumen}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* NOVEDAD: DASHES DE SIMHUB */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <Reveal className="overflow-hidden rounded-3xl border border-white/10 bg-black">
              <img
                src="/images/exclusivo-simhub.jpg"
                alt="Dashes de SimHub de varios aviones con sus instrumentos y la página de motor"
                loading="lazy"
                className="w-full"
              />
            </Reveal>
            <Reveal delay={120}>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Nuevo en el Hangar</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
                Tus instrumentos en una pantalla extra
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">
                Dashes de SimHub con los instrumentos de tu avión y el valor exacto bajo cada uno. El del Cessna 152 es gratis;
                el V35B, A36TC, C208, Arrow III y Seneca V vienen en Contenido Exclusivo. Requiere SimHub con licencia.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button to={ROUTES.descargas} variant="primary">
                  Descargar el del C152 <ArrowRight size={16} />
                </Button>
                <Button to={ROUTES.contenidoExclusivo} variant="secondary">
                  Ver los cinco aviones
                </Button>
              </div>
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
              title={`${TOTAL_AVIONES} aviones con los colores de la casa`}
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

      {/* APRENDE */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Aprende</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
              ¿Quieres entender lo que haces en cabina?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              La Academia es gratis: teoría real de Fundamentos a IFR, con ejercicios para el simulador. Y si quieres ir más
              rápido, el fundador te arma un plan en asesorías 1 a 1.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button to={ROUTES.aprende} variant="primary">
                Ver todo en Aprende <ArrowRight size={16} />
              </Button>
              <Button to={ROUTES.asesorias} variant="secondary">
                Asesorías 1 a 1
              </Button>
            </div>
          </div>
          <div className="mt-14">
            <PruebaVOR href={ROUTES.testNivel} cta="Haz el test de nivel" titulo="Pruébate: ¿hacia dónde viras?" ancho />
          </div>
        </Container>
      </section>

      {/* EL FUNDADOR */}
      <section className="relative overflow-hidden border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-3xl border border-gold-500/20 shadow-[0_0_32px_rgba(212,175,55,0.18)]">
              <img src="/images/founder-erik-poster.jpg" alt="Erik Villanueva, fundador de Villanueva Aviation" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            </Reveal>
            <Reveal delay={150}>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Un sueño. Un plan. <span className="text-gold-400">Una ruta.</span>
              </h2>
              <div className="mt-6 border-l border-gold-500/60 pl-5">
                <p className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl">"No es solo volar. Es vivir la aviación."</p>
                <p className="mt-2 text-sm text-white/50">— Erik Villanueva, fundador</p>
              </div>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60">
                Villanueva Aviation nace de esa idea: que volar en simulador puede ser tan serio y tan divertido como uno quiera.
                Aquí encuentras las herramientas, la gente y, si lo buscas, el conocimiento para vivir la aviación desde casa.
              </p>
              <p className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-gold-400">El cielo no es el límite, es el comienzo.</p>
              <Button to={ROUTES.quienesSomos} variant="ghost" className="mt-6">
                Quiénes somos <ArrowRight size={16} />
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <Container>
          <Reveal className="relative overflow-hidden rounded-3xl border border-gold-500/20">
            <img src="/images/msfs-volaris-climb.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-950/95" />
            <div className="relative z-10 px-8 py-16 text-center md:px-16">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Vuela con nosotros</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/65">
                Entra al Discord, comparte tus vuelos y encuentra con quién volar. Es gratis.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="primary">
                  <MessageCircle size={16} /> Únete al Discord <ArrowUpRight size={16} />
                </Button>
                <Button to={ROUTES.vuela} variant="secondary">
                  Prepara tu próximo vuelo
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
