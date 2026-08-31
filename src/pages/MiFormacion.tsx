import { ArrowRight, Award, BookCheck, ClipboardCheck, Gauge, Timer } from "lucide-react";
import { CadetTabs } from "../components/layout/CadetTabs";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatTile } from "../components/ui/StatTile";
import { Reveal } from "../components/ui/Reveal";
import { useProgress } from "../features/progress/ProgressContext";
import { useAuth } from "../features/auth/AuthContext";
import { ACADEMIA_MODULOS } from "../data/academia";
import { contarExamenesAprobados } from "../data/evaluaciones";
import { ROUTES } from "../lib/routes";

export function MiFormacion() {
  const { user } = useAuth();
  const { modulos, moduloProgreso, moduloActualSlug, progresoGeneralPct, nivel, xp, horasSimulador, examenResultado } =
    useProgress();

  const moduloActual = ACADEMIA_MODULOS.find((m) => m.slug === moduloActualSlug) ?? ACADEMIA_MODULOS[0];
  const progresoActual = moduloProgreso(moduloActual.slug);
  const formacionCompleta = progresoActual.estado === "completado";
  const siguiente = formacionCompleta
    ? undefined
    : moduloActual.actividades[Math.min(progresoActual.completadasCount, moduloActual.actividades.length - 1)];

  const leccionesCompletadas = modulos.reduce((sum, m) => sum + m.completadasCount, 0);
  const examenesAprobados = contarExamenesAprobados(examenResultado);

  return (
    <div>
      <div className="border-b border-white/10 bg-radar bg-grid">
        <Container className="py-14 md:py-20">
          <span className="mb-3 inline-block font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
            Mi Formación
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Bienvenido de vuelta, {user?.nombre ?? "Cadete"}
          </h1>
          <p className="mt-3 max-w-xl text-white/60">
            Esta es tu cabina de entrenamiento personal. Aquí verás tu progreso, tu próxima lección y tus logros.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span className="rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 font-display text-sm font-semibold text-gold-400">
              Cadete · Nivel {nivel}
            </span>
            <span className="text-sm text-white/50">{xp} XP acumulados</span>
          </div>
          <div className="mt-4 max-w-md">
            <div className="mb-1.5 flex items-center justify-between text-xs text-white/50">
              <span>Progreso general de formación</span>
              <span>{progresoGeneralPct}%</span>
            </div>
            <ProgressBar value={progresoGeneralPct} />
          </div>
        </Container>
      </div>

      <CadetTabs />

      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="rounded-2xl border border-gold-500/25 bg-gradient-to-br from-navy-900 to-navy-800 p-6 md:p-8">
            <span className="font-display text-xs font-semibold uppercase tracking-wide text-gold-500">
              {formacionCompleta ? "Formación completada" : "Módulo actual"}
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white">
              {formacionCompleta ? "¡Completaste todos los módulos!" : moduloActual.titulo}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {formacionCompleta
                ? "Puedes repasar cualquier módulo o revisar tus certificados en tu perfil."
                : moduloActual.resumen}
            </p>
            <div className="mt-5 max-w-sm">
              <ProgressBar value={progresoActual.progresoPct} />
              <p className="mt-2 text-xs text-white/45">{progresoActual.progresoPct}% completado</p>
            </div>
            {siguiente && (
              <p className="mt-4 text-sm text-white/55">
                Próxima actividad: <span className="text-white">{siguiente.titulo}</span>
              </p>
            )}
            <Button to={formacionCompleta ? ROUTES.perfil : ROUTES.academiaModulo(moduloActual.slug)} className="mt-6 group">
              {formacionCompleta ? "Ver mi perfil" : "Continuar formación"}
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </Reveal>

          <div className="grid grid-cols-2 gap-4">
            <Reveal delay={0}>
              <StatTile icon={BookCheck} label="Lecciones completadas" value={String(leccionesCompletadas)} />
            </Reveal>
            <Reveal delay={80}>
              <StatTile icon={ClipboardCheck} label="Exámenes aprobados" value={String(examenesAprobados)} />
            </Reveal>
            <Reveal delay={160}>
              <StatTile icon={Gauge} label="Progreso general" value={`${progresoGeneralPct}%`} />
            </Reveal>
            <Reveal delay={240}>
              <StatTile icon={Timer} label="Horas de simulador" value={`${horasSimulador}h`} />
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Award size={18} className="text-gold-400" />
            <h3 className="font-display text-lg font-semibold text-white">Tu progreso por módulo</h3>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {modulos.map((m) => {
              const modulo = ACADEMIA_MODULOS.find((am) => am.slug === m.slug)!;
              return (
                <div key={m.slug} className="flex items-center gap-4">
                  <span className="w-40 shrink-0 text-sm text-white/75">{modulo.titulo}</span>
                  <ProgressBar value={m.progresoPct} size="sm" />
                  <span className="w-12 shrink-0 text-right text-xs text-white/45">{m.progresoPct}%</span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
