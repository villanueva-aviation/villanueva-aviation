import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { RUTAS_EN } from "../../lib/idioma";
import { ALUMNOS_NUEVOS_POR_MES, DIAGNOSTICOS_POR_SEMANA, HORAS_IVAO, PRECIO_PAQUETE_4_SESIONES, PRECIO_SESION_2H } from "../../lib/constants";
import { fotoFlota } from "../../data/flota";
import { EtapasConFoto, type Etapa } from "../../features/home/EtapasRuta";
import { PlanEjemplo } from "../Asesorias";

// Versión en inglés de /asesorias. Mismos precios y cupos (constants.ts); si cambias la página en español, revisa esta.
const CASOS = [
  {
    titulo: "I want to learn IFR",
    texto: "Instruments, procedures and approaches, from zero or to polish what you already know.",
    img: fotoFlota("c90"),
    alt: "King Air C90 XB-KNG in flight, simulator screenshot",
  },
  {
    titulo: "I'm preparing for a written exam",
    texto: "We go over what you're missing with exercises and mock tests, until you walk in calm.",
    img: fotoFlota("c172"),
    alt: "Cessna 172 XB-VNA in flight, simulator screenshot",
  },
  {
    titulo: "I want to fly online without freezing up",
    texto: "Phraseology and radio work for VATSIM or IVAO, practiced out loud.",
    img: { src: "/images/msfs-volaris-climb.jpg" },
    alt: "Airliner climbing out, simulator screenshot",
  },
  {
    titulo: "I want to master my aircraft",
    texto: "Procedures, limits and emergencies for the aircraft you fly, step by step.",
    img: fotoFlota("seneca"),
    alt: "Piper Seneca XB-SNV in flight, simulator screenshot",
  },
];

const PASOS: Etapa[] = [
  {
    titulo: "Free 30-minute assessment",
    texto: "You tell me your level, your simulator and what you want to achieve. No cost, no commitment.",
    img: fotoFlota("da40"),
    alt: "Diamond DA40 XB-NGD in flight, simulator screenshot",
    cta: { label: "Book my assessment", to: RUTAS_EN.assessment },
  },
  {
    titulo: "Your written plan",
    texto: "I send you a short plan: topics, number of sessions and the goal. It's yours to keep even if you decide not to continue.",
    img: { src: "/images/paneles/c172-panel.webp" },
    alt: "Cessna 172 instrument panel, simulator screenshot",
  },
  {
    titulo: "Live sessions",
    texto: "We work together on Discord, in your own simulator, with practice to do between sessions.",
    img: fotoFlota("a36"),
    alt: "Beechcraft Bonanza A36 XB-BNZ in flight, simulator screenshot",
  },
];

export function EnCoaching() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0" aria-hidden="true">
          <img src="/images/msfs-sunset-wing.jpg" alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-transparent to-navy-950" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <div className="relative mx-auto grid w-full max-w-[100rem] items-center gap-12 px-6 py-14 sm:py-20 md:px-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="animate-fade-up font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl xl:text-6xl">
              Learn with a plan <span className="text-gold-400">built for you</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: "60ms" }}>
              One-on-one flight simulation sessions with the founder, in English, on Discord and in your own simulator. We start
              with a free assessment and you leave with your written plan.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "120ms" }}>
              <Button to={RUTAS_EN.assessment} variant="primary" className="group">
                Book my free assessment
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </div>
            <p className="animate-fade-up mt-4 text-sm text-white/55" style={{ animationDelay: "160ms" }}>
              {`Limited spots: ${DIAGNOSTICOS_POR_SEMANA} assessments a week and ${ALUMNOS_NUEVOS_POR_MES} new students a month.`}
            </p>
          </div>
          <div className="animate-fade-up lg:rotate-[1.5deg]" style={{ animationDelay: "200ms" }}>
            <PlanEjemplo en />
          </div>
        </div>
      </section>

      {/* CASES */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
            What do you want to achieve?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
            These are the most common goals. If yours is different, that works too: every plan is built around what you need.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {CASOS.map((c) => (
              <Link
                key={c.titulo}
                to={RUTAS_EN.assessment}
                className="group relative block overflow-hidden rounded-2xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
              >
                <img
                  src={c.img.src}
                  srcSet={"srcSet" in c.img ? c.img.srcSet : undefined}
                  sizes="(min-width: 640px) 45vw, 100vw"
                  alt={c.alt}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-xl font-bold text-white">{c.titulo}</h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">{c.texto}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <EtapasConFoto titulo="How it works" descripcion="Three steps, and you pay nothing until you have your plan." etapas={PASOS} etiqueta="STEP" />

      {/* PRICING */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Pricing</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display text-sm font-semibold text-white">Assessment</p>
              <p className="mt-3 font-display text-4xl font-bold text-white">Free</p>
              <p className="mt-3 text-sm text-white/60">30 minutes and your written plan.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display text-sm font-semibold text-white">2-hour session</p>
              <p className="mt-3 font-display text-4xl font-bold text-white tabular-nums">
                ${PRECIO_SESION_2H} <span className="text-base font-semibold text-white/50">USD</span>
              </p>
              <p className="mt-3 text-sm text-white/60">A single session, no commitment.</p>
            </div>
            <div className="rounded-2xl border border-gold-500/40 bg-gold-500/[0.07] p-6">
              <p className="font-display text-sm font-semibold text-gold-400">4-session package</p>
              <p className="mt-3 font-display text-4xl font-bold text-white tabular-nums">
                ${PRECIO_PAQUETE_4_SESIONES} <span className="text-base font-semibold text-white/50">USD</span>
              </p>
              <p className="mt-3 text-sm text-white/60">8 hours in total. Paid through PayPal once we confirm your dates.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* WHO COACHES YOU */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <img
              src="/images/founder-erik-poster-sm.jpg"
              alt="Erik Villanueva, founder of Villanueva Aviation"
              width="640"
              height="960"
              loading="lazy"
              className="mx-auto aspect-[2/3] w-full max-w-xs rounded-3xl border border-white/10 object-cover"
            />
            <div>
              <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">Who coaches you</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
                Erik Villanueva is a virtual pilot who has passed IVAO's Senior Private Pilot exams and logged{" "}
                <span className="font-semibold text-white tabular-nums">{HORAS_IVAO.toLocaleString("en-US")} hours</span> on IVAO.
                He studies real private pilot material in depth, builds every plan and teaches every session himself, in English or
                Spanish.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
                Sessions cover flight simulation and theory preparation. Villanueva Aviation is an independent online academy: we
                are not a certified flight school and we do not issue pilot licenses. Sessions run weekday evenings (5–10 pm) and
                weekends (8 am–10 pm), Central Mexico time (UTC−6).
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CLOSE */}
      <section className="border-t border-white/10 bg-gradient-to-b from-navy-950 to-navy-900 py-20 text-center md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
            Start with your free assessment
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70">
            Thirty minutes to get to know you and build your plan. You pay nothing.
          </p>
          <div className="mt-8 flex justify-center">
            <Button to={RUTAS_EN.assessment} variant="primary">
              Book my free assessment <ArrowRight size={16} />
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
