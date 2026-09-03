import { ArrowRight, Gauge, MessageCircle, PlayCircle, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";
import { FeatureCard } from "../components/ui/FeatureCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Reveal } from "../components/ui/Reveal";
import { TrackerLine, type TrackerStage } from "../components/tracker/TrackerLine";
import { ACADEMIA_MODULOS } from "../data/academia";
import { DISCORD_URL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

const RUTA_DEMO: TrackerStage[] = [
  { id: "fundamentos", label: "Fundamentos", status: "en-progreso" },
  { id: "conocimientos", label: "Conocimientos", status: "bloqueado" },
  { id: "simulacion", label: "Simulación", status: "bloqueado" },
  { id: "operacion", label: "Operación", status: "bloqueado" },
  { id: "evaluacion", label: "Evaluación", status: "bloqueado" },
];

const POR_QUE_SIMULACION = [
  {
    icon: ShieldCheck,
    titulo: "Practica sin riesgo",
    descripcion: "Comete errores y aprende de ellos en un entorno controlado, antes de subir a una aeronave real.",
  },
  {
    icon: Gauge,
    titulo: "Repite hasta dominar",
    descripcion: "Repite maniobras y procedimientos las veces que necesites, a tu propio ritmo.",
  },
  {
    icon: Target,
    titulo: "Enfócate en lo esencial",
    descripcion: "Llega a tu escuela de vuelo con una base sólida y aprovecha mejor cada hora de instrucción real.",
  },
];

const BENEFICIOS = [
  {
    icon: Sparkles,
    titulo: "Aprendizaje estructurado",
    descripcion: "Módulos progresivos con lecciones, ejercicios interactivos y evaluaciones.",
  },
  {
    icon: PlayCircle,
    titulo: "Aprende haciendo",
    descripcion: "Diagramas interactivos, quizzes y simulaciones visuales en cada módulo.",
  },
  {
    icon: Gauge,
    titulo: "Seguimiento real de tu progreso",
    descripcion: "Tracker, XP, logros y certificados que documentan tu avance como cadete.",
  },
];

export function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video className="h-full w-full object-cover opacity-50" autoPlay muted loop playsInline poster="/images/msfs-xbvla-farmland.jpg">
            <source src="/media/hero-xbvla-kingair.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/55 to-navy-950" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
            Academia aeronáutica digital
          </span>

          <h1
            className="animate-fade-up mt-8 max-w-5xl font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl"
            style={{ animationDelay: "80ms" }}
          >
            Tu camino a <span className="text-shine">piloto</span>, sin pagar por avión real
          </h1>

          <p
            className="animate-fade-up mt-7 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Te dijeron que ser piloto era caro, lejano y complicado. Aquí empiezas a construir la base
            real —teoría y simulación— antes de pisar una escuela de vuelo.
          </p>

          <div className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <Button to={ROUTES.academia} variant="primary" className="group">
              Comenzar formación
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
            <Button href={DISCORD_URL} variant="secondary">
              <MessageCircle size={16} />
              Unirse a Discord
            </Button>
          </div>

          <p
            className="animate-fade-up mt-5 text-xs font-medium uppercase tracking-wide text-white/40"
            style={{ animationDelay: "300ms" }}
          >
            Gratis para empezar — crea tu cuenta de cadete en menos de un minuto
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center px-6">
          <span className="inline-flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-center font-sans text-xs font-light text-white/50">
            Aeronave XB-VLA · captura real de simulador — Villanueva Aviation
          </span>
        </div>
      </section>

      {/* QUÉ ES */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                eyebrow="Qué es Villanueva Aviation"
                title="Una academia digital para quienes sueñan con volar"
                description="Villanueva Aviation es una plataforma de formación teórico-práctica pensada para futuros pilotos: fundamentos de aviación, meteorología, aerodinámica, navegación, VFR e IFR, con simulación de vuelo integrada a cada módulo."
              />
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/55">
                No es solo un curso: es un espacio donde puedes medir tu progreso, poner a prueba
                tus conocimientos y llegar mejor preparado a tu escuela de vuelo.
              </p>
            </Reveal>
            <Reveal delay={150} className="relative aspect-square overflow-hidden rounded-3xl border border-white/10">
              <img src="/images/msfs-xbvla-farmland.jpg" alt="XB-VLA en vuelo, captura de simulador" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* EL FUNDADOR */}
      <section className="relative overflow-hidden border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-3xl border border-gold-500/20 shadow-2xl">
              <img
                src="/images/founder-erik-poster.jpg"
                alt="Erik Villanueva, fundador de Villanueva Aviation"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            </Reveal>
            <Reveal delay={150}>
              <span className="mb-4 inline-block font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
                El piloto detrás de la academia
              </span>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Un sueño. Un plan. <span className="text-shine">Una ruta.</span>
              </h2>
              <div className="mt-6 border-l-2 border-gold-500 pl-5">
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
            </Reveal>
          </div>
        </Container>
      </section>

      {/* POR QUÉ SIMULACIÓN */}
      <section className="relative overflow-hidden border-t border-white/10 py-24 md:py-32">
        <div className="absolute inset-0">
          <img src="/images/msfs-sunset-wing.jpg" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy-950/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/40" />
        </div>
        <Container className="relative z-10">
          <Reveal>
            <SectionHeading
              eyebrow="Por qué simulación"
              title="Aprende volando, antes de volar"
              description="La simulación te permite convertir la teoría en experiencia práctica desde el primer día."
              align="center"
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {POR_QUE_SIMULACION.map((f, i) => (
              <Reveal key={f.titulo} delay={i * 120}>
                <FeatureCard icon={f.icon} title={f.titulo} description={f.descripcion} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* BENEFICIOS */}
      <section className="py-20 md:py-28">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Beneficios"
              title="Todo lo que necesitas para empezar bien"
              description="Una experiencia diseñada para que tu formación se sienta estructurada y medible."
            />
            <Button to={ROUTES.academia} variant="ghost" className="px-0">
              Ver módulos <ArrowRight size={16} />
            </Button>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {BENEFICIOS.map((f, i) => (
              <Reveal key={f.titulo} delay={i * 120}>
                <FeatureCard icon={f.icon} title={f.titulo} description={f.descripcion} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={360} className="mt-14 flex justify-center">
            <Button to={ROUTES.academia} variant="primary" className="group">
              Comenzar formación
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* RUTA DE FORMACIÓN */}
      <section className="relative overflow-hidden border-t border-white/10 py-20 md:py-28">
        <div className="absolute inset-0">
          <img src="/images/msfs-aeromexico-clouds.jpg" alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-navy-900/90" />
        </div>
        <Container className="relative z-10">
          <Reveal>
            <SectionHeading
              eyebrow="Ruta de formación"
              title="Un camino claro, de principio a fin"
              description="Fundamentos, conocimientos teóricos, simulación, operación y evaluación final."
              align="center"
            />
          </Reveal>
          <Reveal delay={150} className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <TrackerLine stages={RUTA_DEMO} />
          </Reveal>
        </Container>
      </section>

      {/* VISTA PREVIA DE LA PLATAFORMA */}
      <section className="border-t border-white/10 bg-navy-900/40 py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Vista previa"
              title="Tu cabina de entrenamiento personal"
              description="Así se ve tu progreso una vez que inicias tu formación como cadete."
              align="center"
            />
          </Reveal>
          <Reveal delay={150} className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-navy-900 shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-navy-950/60 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <div className="bg-radar bg-grid p-6 md:p-10">
              <span className="inline-flex rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 font-display text-xs font-semibold text-gold-400">
                Cadete · Nivel 2
              </span>
              <p className="mt-4 text-sm text-white/60">Progreso general de formación</p>
              <div className="mt-2 max-w-sm">
                <ProgressBar value={64} />
              </div>
              <p className="mt-2 text-xs text-white/40">64%</p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ACADEMIA_MODULOS.slice(0, 4).map((m, i) => (
                  <div key={m.slug} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <m.icon size={16} className="text-gold-400" />
                    <p className="mt-2 text-xs font-medium text-white/80">{m.titulo}</p>
                    <div className="mt-2">
                      <ProgressBar value={[100, 100, 40, 0][i]} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <Container>
          <Reveal className="relative overflow-hidden rounded-3xl border border-gold-500/20">
            <img src="/images/msfs-volaris-climb.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-950/95" />
            <div className="relative z-10 px-8 py-16 text-center md:px-16">
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Aquí comienza tu formación como piloto
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/65">
                Crea tu cuenta de cadete, explora la Academia y comienza a construir tu camino hacia
                la cabina.
              </p>
              <div className="mt-8 flex justify-center">
                <Button to={ROUTES.academia} variant="primary" className="group">
                  Comenzar formación
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
