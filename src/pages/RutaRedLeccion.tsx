import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { VideoYouTube } from "../components/ui/VideoYouTube";
import { LessonFlow } from "../features/academia/LessonFlow";
import { Quiz } from "../features/academia/Quiz";
import { AudioPhraseology } from "../features/academia/AudioPhraseology";
import { AUDIO_SETS } from "../data/fraseologiaATC";
import { LECCIONES_RED, SLUG_RUTA_RED, leccionRed } from "../data/rutaRed";
import { useAuth } from "../features/auth/AuthContext";
import { useProgress } from "../features/progress/ProgressContext";
import { registrarVisitaRuta } from "../features/rutaRed/fuente";
import { ROUTES } from "../lib/routes";
import { NotFound } from "./NotFound";

const CARD = "rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8";

export function RutaRedLeccion() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  useEffect(() => registrarVisitaRuta(id ?? "leccion", location.search), [id, location.search]);
  const leccion = id ? leccionRed(id) : undefined;
  const { isAuthenticated } = useAuth();
  const { isActividadCompletada, completarActividad } = useProgress();

  if (!leccion) return <NotFound />;

  const i = LECCIONES_RED.indexOf(leccion);
  const anterior = LECCIONES_RED[i - 1];
  const siguiente = LECCIONES_RED[i + 1];
  const hecha = isAuthenticated && isActividadCompletada(SLUG_RUTA_RED, leccion.id);

  return (
    <Container className="py-10 md:py-14">
      <Link
        to={ROUTES.rutaRed}
        className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
      >
        <ArrowLeft size={15} />
        Listo para volar en red
      </Link>

      <div className="mt-6 max-w-3xl">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          Lección {leccion.numero} de {LECCIONES_RED.length}
        </span>
        <h1 className="mt-3 flex items-start gap-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          {leccion.titulo}
          {hecha && <CheckCircle2 size={24} className="mt-2 shrink-0 text-gold-400" role="img" aria-label="Completada" />}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/65">{leccion.resumen}</p>
      </div>

      {!isAuthenticated && (
        <p className="mt-6 max-w-3xl rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] px-5 py-3 text-sm text-white/75">
          <Link to={`${ROUTES.ingresar}?from=${encodeURIComponent(location.pathname)}`} className="font-semibold text-gold-400 underline-offset-2 hover:underline">
            Crea tu cuenta gratis para guardar tu avance
          </Link>
        </p>
      )}

      <div className="mt-8 flex max-w-3xl flex-col gap-6">
        {leccion.videoId && <VideoYouTube id={leccion.videoId} titulo={leccion.titulo} />}

        <div className={CARD}>
          <h2 className="sr-only">Contenido de la lección</h2>
          <LessonFlow key={leccion.id} temas={leccion.temas} isCompleted={() => hecha} onAdvance={() => {}} />
        </div>

        {leccion.audioSetId && (
          <div className={CARD}>
            <h2 className="font-display text-lg font-semibold text-white">Escucha y practica</h2>
            <div className="mt-4">
              <AudioPhraseology cards={AUDIO_SETS[leccion.audioSetId]} />
            </div>
          </div>
        )}

        <div className={CARD}>
          <h2 className="font-display text-lg font-semibold text-white">Practica lo que viste</h2>
          <div className="mt-4">
            <Quiz
              key={leccion.id}
              preguntas={leccion.practica}
              passingScore={0}
              onFinish={() => {
                if (isAuthenticated) completarActividad(SLUG_RUTA_RED, leccion.id);
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {anterior ? (
            <Button to={ROUTES.rutaRedLeccion(anterior.id)} variant="secondary">
              <ArrowLeft size={15} /> Anterior
            </Button>
          ) : (
            <span />
          )}
          {siguiente ? (
            <Button to={ROUTES.rutaRedLeccion(siguiente.id)} variant="primary">
              Siguiente <ArrowRight size={15} />
            </Button>
          ) : (
            <Button to={ROUTES.pruebaRed} variant="primary">
              Ir a la prueba <ArrowRight size={15} />
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
