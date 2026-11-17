import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ACADEMIA_MODULOS, type ActividadTipo } from "../data/academia";
import { MODULE_PRACTICA, MODULE_EVALUACION } from "../data/moduleContent";
import { ROUTES } from "../lib/routes";
import { CONTENIDO_EXCLUSIVO } from "../data/exclusivo";
import { useAuth } from "../features/auth/AuthContext";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import { useProgress } from "../features/progress/ProgressContext";
import { ModuleStepper, type StepperStage } from "../features/academia/ModuleStepper";
import { Quiz } from "../features/academia/Quiz";
import { ProyectoFinal } from "../features/academia/ProyectoFinal";
import { ModuloFeedback } from "../features/academia/ModuloFeedback";
import { Reveal } from "../components/ui/Reveal";
import { LeccionRise } from "../features/academia/rise/LeccionRise";
import { armarCapitulos } from "../features/academia/rise/motor";
import { etapaInicial } from "../features/academia/rise/reglas";

// Sugerencia de Contenido Exclusivo más relacionada con cada módulo, mostrada al completarlo.
const MODULO_EXCLUSIVO_SUGERIDO: Record<string, string> = {
  comunicaciones: "audio-atc-rodaje",
  vfr: "checkride-vuelo",
  reglamentacion: "checkride-oral",
  "espacios-aereos": "checkride-oral",
  ifr: "checkride-oral",
  instrumentos: "checklist-premium-c172",
  rendimiento: "checklist-premium-c172",
  operacion: "checklist-premium-c172",
};

function ModuloCompletadoBanner({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  const { hasAccess, loading } = usePremiumAccess();
  const item =
    CONTENIDO_EXCLUSIVO.find((i) => i.id === MODULO_EXCLUSIVO_SUGERIDO[slug]) ??
    CONTENIDO_EXCLUSIVO.find((i) => i.id === "agendar-cita");
  if (loading || !item) return null;
  const puedeAbrir = isAuthenticated && hasAccess;

  return (
    <Reveal className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-400" />
        <div>
          <p className="font-display text-sm font-semibold text-white">¡Módulo completado! Sigue practicando</p>
          <p className="mt-1 text-sm text-white/60">
            {puedeAbrir ? item.titulo : `${item.titulo} te espera en Contenido Exclusivo.`}
          </p>
        </div>
      </div>
      <Link
        to={puedeAbrir && item.interactivoHref ? item.interactivoHref : ROUTES.contenidoExclusivo}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 transition-transform duration-200 hover:scale-[1.03]"
      >
        {puedeAbrir ? "Abrir" : "Ver en Contenido Exclusivo"}
        <ArrowRight size={13} />
      </Link>
    </Reveal>
  );
}

// «Interactividad» ya no es etapa: los ejercicios van dentro de la lección.
const STAGE_LABELS: Record<Exclude<ActividadTipo, "interactividad"> | "introduccion", string> = {
  introduccion: "Introducción",
  leccion: "Lección",
  practica: "Práctica",
  evaluacion: "Evaluación",
  proyecto: "Proyecto final",
};

export function AcademiaModulo() {
  const { slug } = useParams<{ slug: string }>();
  const modulo = ACADEMIA_MODULOS.find((m) => m.slug === slug);
  const { isActividadCompletada, completarActividad, registrarExamen, moduloProgreso, loading: progresoLoading } = useProgress();

  // Lección e interactividad son una sola etapa: los ejercicios van dentro de la lectura.
  const stageKeys = useMemo(() => {
    if (!modulo) return [];
    const tipos = new Set<ActividadTipo>(modulo.actividades.map((a) => a.tipo));
    const leccion = tipos.has("leccion") || tipos.has("interactividad") ? ["leccion"] : [];
    return ["introduccion", ...leccion, ...(["practica", "evaluacion", "proyecto"] as const).filter((t) => tipos.has(t))];
  }, [modulo]);
  const numCapitulos = useMemo(() => (slug ? armarCapitulos(slug).length : 0), [slug]);

  const [searchParams] = useSearchParams();
  // Los enlaces viejos (?etapa=interactividad o misiones) llevan a la lección.
  const [activeStage, setActiveStage] = useState<string>(() => etapaInicial(searchParams.get("etapa"), stageKeys));
  const { user } = useAuth();
  const esBienvenida = searchParams.get("bienvenida") === "1";

  if (!modulo) return <Navigate to={ROUTES.academia} replace />;
  if (progresoLoading) return null;

  const progreso = moduloProgreso(modulo.slug);
  const leccionActividades = modulo.actividades.filter((a) => a.tipo === "leccion");
  const interactividadActividades = modulo.actividades.filter((a) => a.tipo === "interactividad");
  const practicaActividad = modulo.actividades.find((a) => a.tipo === "practica");
  const evaluacionActividad = modulo.actividades.find((a) => a.tipo === "evaluacion");
  const proyectoActividad = modulo.actividades.find((a) => a.tipo === "proyecto");

  const practicaPreguntas = MODULE_PRACTICA[modulo.slug];
  const evaluacionPreguntas = MODULE_EVALUACION[modulo.slug];

  const leccionDone = leccionActividades.length === 0 || leccionActividades.every((a) => isActividadCompletada(modulo.slug, a.id));
  const interactividadDone =
    interactividadActividades.length === 0 || interactividadActividades.every((a) => isActividadCompletada(modulo.slug, a.id));

  const stages: StepperStage[] = stageKeys.map((key) => {
    let done = false;
    if (key === "leccion") done = leccionDone && interactividadDone;
    else if (key === "practica" && practicaActividad) done = isActividadCompletada(modulo.slug, practicaActividad.id);
    else if (key === "evaluacion" && evaluacionActividad) done = isActividadCompletada(modulo.slug, evaluacionActividad.id);
    else if (key === "proyecto" && proyectoActividad) done = isActividadCompletada(modulo.slug, proyectoActividad.id);
    else if (key === "introduccion") done = true;
    return {
      key,
      label: STAGE_LABELS[key as keyof typeof STAGE_LABELS],
      done,
    };
  });


  return (
    <div>
      <PageHero eyebrow={`Academia · ${modulo.nivel}`} title={modulo.titulo} description={modulo.resumen}>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={ROUTES.academia}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
          >
            <ArrowLeft size={15} />
            Volver a la Academia
          </Link>
          <Badge tone={progreso.estado === "completado" ? "green" : "gold"}>
            {progreso.estado === "completado" ? "Completado" : `${progreso.progresoPct}% completado`}
          </Badge>
        </div>
      </PageHero>

      <Container className="py-12 md:py-16">
        {esBienvenida && progreso.completadasCount === 0 && (
          <div className="mb-8 rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-5">
            <p className="font-display text-sm font-semibold text-gold-400">
              Bienvenido a Villanueva Aviation{user?.nombre ? `, ${user.nombre}` : ""}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              Empieza aquí: {numCapitulos} {numCapitulos === 1 ? "capítulo" : "capítulos"} que lees bajando, con imágenes, ejercicios y
              preguntas rápidas entre la lectura.
            </p>
          </div>
        )}
        <ModuleStepper stages={stages} activeKey={activeStage} onSelect={setActiveStage} />

        {progreso.estado === "completado" && (
          <>
            <ModuloCompletadoBanner slug={modulo.slug} />
            <ModuloFeedback slug={modulo.slug} moduloTitulo={modulo.titulo} />
          </>
        )}

        <Reveal key={activeStage} className="mt-10">

          {activeStage === "introduccion" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold text-white">Bienvenido al módulo</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{modulo.resumen}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
                {numCapitulos === 1 ? "Es un capítulo" : `Son ${numCapitulos} capítulos`} que recorres bajando: las imágenes cambian contigo
                y entre la lectura hay ejercicios y preguntas rápidas. Al final vienen la práctica, la evaluación
                {proyectoActividad ? " y un proyecto final que el fundador revisa en persona" : ""}.
              </p>
              <Button className="mt-6" onClick={() => setActiveStage("leccion")}>
                Empezar la lección
              </Button>
            </div>
          )}

          {activeStage === "leccion" && (
            <LeccionRise
              modulo={modulo}
              isCompleted={(id) => isActividadCompletada(modulo.slug, id)}
              onComplete={(id) => completarActividad(modulo.slug, id)}
              onTerminar={() => setActiveStage(practicaActividad ? "practica" : "evaluacion")}
            />
          )}

          {activeStage === "practica" && practicaActividad && (
            <div className="flex flex-col gap-6">
              {practicaPreguntas ? (
                <Quiz
                  preguntas={practicaPreguntas}
                  passingScore={0}
                  onFinish={() => completarActividad(modulo.slug, practicaActividad.id)}
                />
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
                  <Lock size={20} className="text-gold-400" />
                  <p className="mt-4 max-w-md text-sm text-white/55">
                    Los ejercicios prácticos de {modulo.titulo} se publicarán próximamente.
                  </p>
                </div>
              )}
              {isActividadCompletada(modulo.slug, practicaActividad.id) && (
                <div className="flex justify-end">
                  <Button onClick={() => setActiveStage("evaluacion")}>Continuar a evaluación</Button>
                </div>
              )}
            </div>
          )}

          {activeStage === "evaluacion" && evaluacionActividad && (
            <div className="flex flex-col gap-6">
              {evaluacionPreguntas ? (
                <Quiz
                  preguntas={evaluacionPreguntas}
                  passingScore={70}
                  onFinish={(score, passed) => registrarExamen(modulo.slug, evaluacionActividad.id, score, passed)}
                />
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
                  <Lock size={20} className="text-gold-400" />
                  <p className="mt-4 max-w-md text-sm text-white/55">
                    La evaluación de {modulo.titulo} se publicará próximamente.
                  </p>
                </div>
              )}
              {proyectoActividad && isActividadCompletada(modulo.slug, evaluacionActividad.id) && (
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-white/45">
                    Este módulo se marca como completado solo después de enviar el proyecto final.
                  </p>
                  <Button onClick={() => setActiveStage("proyecto")}>Continuar al proyecto final</Button>
                </div>
              )}
            </div>
          )}

          {activeStage === "proyecto" && proyectoActividad && (
            <div className="flex flex-col gap-6">
              {isActividadCompletada(modulo.slug, proyectoActividad.id) ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-6 py-14 text-center">
                  <CheckCircle2 size={28} className="text-gold-400" />
                  <p className="max-w-md text-sm text-white/75">Ya enviaste tu proyecto final de {modulo.titulo} para revisión.</p>
                </div>
              ) : (
                <ProyectoFinal
                  moduloTitulo={modulo.titulo}
                  prompt={modulo.proyectoPrompt ?? ""}
                  onComplete={() => completarActividad(modulo.slug, proyectoActividad.id)}
                />
              )}
            </div>
          )}
        </Reveal>
      </Container>
    </div>
  );
}
