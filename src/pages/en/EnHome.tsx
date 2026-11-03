import { ArrowRight } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { Reveal } from "../../components/ui/Reveal";
import { RUTAS_EN } from "../../lib/idioma";
import { NavDisplay } from "../../features/home/NavDisplay";
import { FondoHero } from "../../features/home/FondoHero";
import { EtapasConFoto, type Etapa } from "../../features/home/EtapasRuta";
import { ACADEMIA_MODULOS } from "../../data/academia";
import { TOTAL_AVIONES, fotoFlota } from "../../data/flota";

// Portada de la puerta en inglés: lo que se puede comprar en inglés hoy son las asesorías, así que todo lleva ahí.
const ETAPAS: Etapa[] = [
  {
    titulo: "Learn the theory",
    texto: "Aerodynamics, weather, navigation, instruments and regulations, explained with your simulator in front of you instead of a textbook.",
    img: fotoFlota("c152"),
    alt: "Cessna 152 XB-CDT in flight, simulator screenshot",
  },
  {
    titulo: "Practice real procedures",
    texto: "Checklists, flows and emergencies for the aircraft you fly, from a Cessna 152 to a King Air, until they become second nature.",
    img: fotoFlota("seneca"),
    alt: "Piper Seneca XB-SNV in flight, simulator screenshot",
  },
  {
    titulo: "Fly online with ATC",
    texto: "Radio phraseology, clearances and full flights on VATSIM or IVAO, practiced out loud until you stop freezing on the frequency.",
    img: { src: "/images/msfs-volaris-climb.jpg" },
    alt: "Airliner climbing out, simulator screenshot",
    cta: { label: "See coaching", to: RUTAS_EN.coaching },
  },
];

export function EnHome() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950">
        <FondoHero />
        <div className="relative mx-auto grid w-full max-w-[100rem] items-center gap-12 px-6 pb-10 pt-10 sm:pt-16 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10 lg:pb-12 lg:pt-6">
          <div className="lg:max-w-xl">
            <h1 className="animate-fade-up font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl xl:text-6xl 2xl:text-7xl">
              Learn to fly <span className="text-gold-400">for real</span> in your simulator
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: "60ms" }}>
              Real theory, procedures and radio work, with the simulator you already have at home. One-on-one coaching with the
              founder, in English, built around your goals.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "120ms" }}>
              <Button to={RUTAS_EN.assessment} variant="primary" className="group">
                Book a free assessment
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button to={RUTAS_EN.coaching} variant="secondary">
                How coaching works
              </Button>
            </div>
            <p className="animate-fade-up mt-4 text-sm text-white/55" style={{ animationDelay: "160ms" }}>
              A free 30-minute call on Discord. You pay nothing until you have your plan.
            </p>
          </div>
          <div className="animate-fade-up w-full lg:max-w-[min(860px,calc((100svh-23rem)*1.25))] lg:justify-self-end" style={{ animationDelay: "200ms" }}>
            <NavDisplay en />
          </div>
        </div>
      </section>

      <EtapasConFoto
        titulo="From your first flight to flying online"
        descripcion="We work on whichever stage you're at. Each one stands on its own, at your pace."
        etapas={ETAPAS}
        etiqueta="STAGE"
      />

      {/* FOUNDER */}
      <section className="relative overflow-hidden border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-3xl border border-gold-500/20 shadow-[0_0_32px_rgba(212,175,55,0.18)]">
              <img src="/images/founder-erik-poster.jpg" alt="Erik Villanueva, founder of Villanueva Aviation" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            </Reveal>
            <Reveal delay={150}>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                A dream. A plan. <span className="text-gold-400">A route.</span>
              </h2>
              <div className="mt-6 border-l border-gold-500/60 pl-5">
                <p className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl">"It's not just flying. It's living aviation."</p>
                <p className="mt-2 text-sm text-white/50">— Erik Villanueva, founder</p>
              </div>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60">
                Villanueva Aviation was born from that idea: the road to the cockpit doesn't have to start at an expensive,
                intimidating flight school. It can start here, with solid foundations, simulator practice and someone who walks
                each stage with you.
              </p>
              <p className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-gold-400">The sky is not the limit, it's the beginning.</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* SPANISH-ONLY CONTENT, SAID PLAINLY */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">Our academy speaks Spanish, for now</h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              The free Academy ({ACADEMIA_MODULOS.length} modules), the checklists for {TOTAL_AVIONES} aircraft and our premium
              library are in Spanish today. Coaching is fully in English. We'll translate the rest based on what English-speaking
              pilots ask for first, so tell us in your assessment.
            </p>
            <div className="mt-6">
              <Button to="/" variant="ghost">
                Explore the Spanish site <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <Container>
          <Reveal className="relative overflow-hidden rounded-3xl border border-gold-500/20">
            <img src="/images/msfs-volaris-climb.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-950/95" />
            <div className="relative z-10 px-8 py-16 text-center md:px-16">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Your road to the cockpit starts here</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/65">Thirty minutes to get to know you and build your plan. Free, no commitment.</p>
              <div className="mt-8 flex justify-center">
                <Button to={RUTAS_EN.assessment} variant="primary" className="group">
                  Book a free assessment
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
