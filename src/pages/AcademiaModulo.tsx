import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ACADEMIA_MODULOS, type ActividadTipo } from "../data/academia";
import { ROUTES } from "../lib/routes";
import { useProgress } from "../features/progress/ProgressContext";
import { ModuleStepper, type StepperStage } from "../features/academia/ModuleStepper";
import { AirplaneDiagram } from "../features/academia/AirplaneDiagram";
import { DragDropLabels } from "../features/academia/DragDropLabels";
import { ScenarioSimulator } from "../features/academia/ScenarioSimulator";
import { DragSlider } from "../features/academia/DragSlider";
import { AudioPhraseology } from "../features/academia/AudioPhraseology";
import { Quiz } from "../features/academia/Quiz";
import { PRACTICA_FUNDAMENTOS, EVALUACION_FUNDAMENTOS } from "../features/academia/quizData";
import { Reveal } from "../components/ui/Reveal";

const LECCIONES_FUNDAMENTOS: Record<string, { titulo: string; contenido: string[] }> = {
  "leccion-1": {
    titulo: "Partes de la aeronave",
    contenido: [
      "Toda aeronave de ala fija comparte una estructura básica: fuselaje, alas, empenaje (estabilizadores) y tren de aterrizaje.",
      "El fuselaje aloja la cabina, los pasajeros y la carga, y sirve como columna vertebral estructural de la aeronave.",
      "Las alas generan la sustentación necesaria para volar y alojan superficies de control como los alerones y, en muchos modelos, los flaps.",
    ],
  },
  "leccion-2": {
    titulo: "Principios de vuelo",
    contenido: [
      "El vuelo es el resultado del equilibrio entre cuatro fuerzas: sustentación, peso, empuje y resistencia.",
      "La sustentación se genera por la diferencia de presión entre la parte superior e inferior del ala, producto de su perfil aerodinámico.",
      "El piloto controla la aeronave sobre tres ejes —longitudinal, lateral y vertical— usando alerones, elevador y timón de dirección.",
    ],
  },
};

const INTERACTIVIDAD_INTRO: Record<string, string> = {
  diagrama: "Explora el diagrama y haz clic en cada componente para conocer su función.",
  escenario: "Toma decisiones en un escenario de vuelo y descubre las consecuencias de cada una.",
  slider: "Mueve el control y observa en vivo cómo cambian velocidad, consumo y resistencia.",
  audio: "Escucha la fraseología correcta y compárala con lo que tú dirías en cada situación.",
};

const STAGE_LABELS: Record<ActividadTipo | "introduccion", string> = {
  introduccion: "Introducción",
  leccion: "Lección",
  interactividad: "Interactividad",
  practica: "Práctica",
  evaluacion: "Evaluación",
};

export function AcademiaModulo() {
  const { slug } = useParams<{ slug: string }>();
  const modulo = ACADEMIA_MODULOS.find((m) => m.slug === slug);
  const { isActividadCompletada, completarActividad, registrarExamen, moduloProgreso } = useProgress();

  const stageKeys = useMemo(() => {
    if (!modulo) return [];
    const tipos = new Set<ActividadTipo>(modulo.actividades.map((a) => a.tipo));
    const order: ActividadTipo[] = ["leccion", "interactividad", "practica", "evaluacion"];
    return ["introduccion", ...order.filter((t) => tipos.has(t))];
  }, [modulo]);

  const [activeStage, setActiveStage] = useState<string>("introduccion");

  if (!modulo) return <Navigate to={ROUTES.academia} replace />;

  const progreso = moduloProgreso(modulo.slug);
  const leccionActividades = modulo.actividades.filter((a) => a.tipo === "leccion");
  const interactividadActividad = modulo.actividades.find((a) => a.tipo === "interactividad");
  const practicaActividad = modulo.actividades.find((a) => a.tipo === "practica");
  const evaluacionActividad = modulo.actividades.find((a) => a.tipo === "evaluacion");

  const stages: StepperStage[] = stageKeys.map((key) => {
    let done = false;
    if (key === "leccion") done = leccionActividades.every((a) => isActividadCompletada(modulo.slug, a.id));
    else if (key === "interactividad" && interactividadActividad) done = isActividadCompletada(modulo.slug, interactividadActividad.id);
    else if (key === "practica" && practicaActividad) done = isActividadCompletada(modulo.slug, practicaActividad.id);
    else if (key === "evaluacion" && evaluacionActividad) done = isActividadCompletada(modulo.slug, evaluacionActividad.id);
    else if (key === "introduccion") done = true;
    return { key, label: STAGE_LABELS[key as ActividadTipo | "introduccion"], done };
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
        <ModuleStepper stages={stages} activeKey={activeStage} onSelect={setActiveStage} />

        <Reveal key={activeStage} className="mt-10">
          {activeStage === "introduccion" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold text-white">Bienvenido al módulo</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{modulo.resumen}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
                Esta sección te guiará a través de una experiencia estructurada: lección teórica
                {interactividadActividad ? ", un ejercicio interactivo" : ""}, práctica y evaluación final.
              </p>
              <Button className="mt-6" onClick={() => setActiveStage("leccion")}>
                Comenzar lección
              </Button>
            </div>
          )}

          {activeStage === "leccion" && (
            <div className="flex flex-col gap-5">
              {leccionActividades.map((actividad) => {
                const completada = isActividadCompletada(modulo.slug, actividad.id);
                const contenido = modulo.interactivo ? LECCIONES_FUNDAMENTOS[actividad.id] : undefined;
                return (
                  <div key={actividad.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-lg font-semibold text-white">{actividad.titulo}</h3>
                      {completada && <CheckCircle2 size={20} className="shrink-0 text-gold-400" />}
                    </div>
                    {contenido ? (
                      <div className="mt-4 flex flex-col gap-3">
                        {contenido.contenido.map((p, i) => (
                          <p key={i} className="text-sm leading-relaxed text-white/65">
                            {p}
                          </p>
                        ))}
                      </div>
                    ) : modulo.imagenLeccion ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                        <img src={modulo.imagenLeccion} alt={actividad.titulo} className="w-full" />
                      </div>
                    ) : (
                      <p className="mt-4 flex items-center gap-2 text-sm text-white/45">
                        <Lock size={14} /> Contenido en preparación — se publicará próximamente.
                      </p>
                    )}
                    {!completada && (
                      <Button
                        variant="secondary"
                        className="mt-5"
                        onClick={() => completarActividad(modulo.slug, actividad.id)}
                      >
                        Marcar como completada
                      </Button>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-end">
                <Button onClick={() => setActiveStage(interactividadActividad ? "interactividad" : practicaActividad ? "practica" : "evaluacion")}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {activeStage === "interactividad" && interactividadActividad && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <h3 className="font-display text-lg font-semibold text-white">{interactividadActividad.titulo}</h3>
                <p className="mt-2 text-sm text-white/60">
                  {INTERACTIVIDAD_INTRO[modulo.interactividadTipo ?? "diagrama"]}
                </p>
                <div className="mt-6">
                  {modulo.interactividadTipo === "escenario" && <ScenarioSimulator />}
                  {modulo.interactividadTipo === "slider" && <DragSlider />}
                  {modulo.interactividadTipo === "audio" && (
                    <AudioPhraseology
                      onComplete={() => completarActividad(modulo.slug, interactividadActividad.id)}
                    />
                  )}
                  {(!modulo.interactividadTipo || modulo.interactividadTipo === "diagrama") && <AirplaneDiagram />}
                </div>
              </div>

              {modulo.slug === "fundamentos" && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                  <h3 className="font-display text-lg font-semibold text-white">
                    Segundo ejercicio: arrastra las etiquetas
                  </h3>
                  <p className="mt-2 text-sm text-white/60">
                    Practica una vez más, esta vez arrastrando el nombre correcto a su lugar en la aeronave.
                  </p>
                  <div className="mt-6">
                    <DragDropLabels onComplete={() => completarActividad(modulo.slug, interactividadActividad.id)} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {!isActividadCompletada(modulo.slug, interactividadActividad.id) && (
                  <Button variant="secondary" onClick={() => completarActividad(modulo.slug, interactividadActividad.id)}>
                    Marcar como completada
                  </Button>
                )}
                <Button onClick={() => setActiveStage("practica")}>Continuar a práctica</Button>
              </div>
            </div>
          )}

          {activeStage === "practica" && practicaActividad && (
            <div className="flex flex-col gap-6">
              {modulo.interactivo ? (
                <Quiz
                  preguntas={PRACTICA_FUNDAMENTOS}
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
              {modulo.interactivo ? (
                <Quiz
                  preguntas={EVALUACION_FUNDAMENTOS}
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
            </div>
          )}
        </Reveal>
      </Container>
    </div>
  );
}
