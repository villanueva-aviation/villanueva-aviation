import { Link } from "react-router-dom";
import { ArrowRight, Timer } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Reveal } from "../components/ui/Reveal";
import { ACADEMIA_MODULOS } from "../data/academia";
import { ROUTES } from "../lib/routes";
import { useProgress, type ModuloEstado } from "../features/progress/ProgressContext";

const ESTADO_LABEL: Record<ModuloEstado, string> = {
  disponible: "Disponible",
  "en-progreso": "En progreso",
  completado: "Completado",
};

const ESTADO_TONE: Record<ModuloEstado, "gold" | "green" | "neutral"> = {
  disponible: "neutral",
  "en-progreso": "gold",
  completado: "green",
};

export function Academia() {
  const { moduloProgreso, loading } = useProgress();

  if (loading) return null;

  return (
    <div>
      <PageHero
        eyebrow="Academia"
        title="Educación aeronáutica estructurada por módulos"
        description="Cada módulo combina lecciones, ejercicios interactivos y una evaluación final. Avanza a tu ritmo y desbloquea el siguiente nivel de formación."
      />

      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACADEMIA_MODULOS.map((modulo, i) => {
            const progreso = moduloProgreso(modulo.slug);
            const leccionesCount = modulo.actividades.filter((a) => a.tipo === "leccion").length;
            const tieneExamen = modulo.actividades.some((a) => a.tipo === "evaluacion");

            const card = (
              <div className="card-hover group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-gold-500/20">
                    <modulo.icon size={22} strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge tone={ESTADO_TONE[progreso.estado]}>{ESTADO_LABEL[progreso.estado]}</Badge>
                    <Badge tone="neutral">{modulo.nivel}</Badge>
                  </div>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{modulo.titulo}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{modulo.resumen}</p>

                <div className="mt-5">
                  <ProgressBar value={progreso.progresoPct} size="sm" />
                  <p className="mt-2 text-xs text-white/45">
                    {leccionesCount} lecciones{tieneExamen ? " · 1 examen" : ""} · {progreso.progresoPct}%
                  </p>
                </div>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400">
                  Ver módulo
                  <ArrowRight size={14} className="transition-transform duration-200 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-0.5" />
                </span>
              </div>
            );

            return (
              <Reveal key={modulo.slug} delay={i * 80}>
                <Link to={ROUTES.academiaModulo(modulo.slug)}>{card}</Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold text-white">Práctica extra</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
            Herramientas cortas para entrenar decisiones.
          </p>
          <Link
            to={ROUTES.entrenadorEsperas}
            className="card-hover group mt-5 flex max-w-xl items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
              <Timer size={22} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-semibold text-white">Entrenador de esperas</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                Te damos la espera y tu rumbo de llegada: elige la entrada (directa, gota o paralela) en menos de 15 segundos.
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-gold-400 transition-transform duration-200 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
