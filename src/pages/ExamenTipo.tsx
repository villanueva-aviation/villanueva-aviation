import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award, Clock, Lock, Plane } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Quiz } from "../features/academia/Quiz";
import { useProgress } from "../features/progress/ProgressContext";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import { areasAReforzar, armarIntento, proximoIntento } from "../features/examenesTipo/reglas";
import { examenTipo, REGLAS_EXAMEN_TIPO, type AreaExamen, type PreguntaTipo } from "../data/examenesTipo";
import { FLOTA, fotoFlota } from "../data/flota";
import { ROUTES } from "../lib/routes";
import { NotFound } from "./NotFound";

type Fase = { tipo: "inicio" } | { tipo: "examen"; preguntas: PreguntaTipo[] } | { tipo: "resultado"; score: number; passed: boolean; reforzar: AreaExamen[] };

const { preguntasPorIntento, aprobacion, esperaHoras } = REGLAS_EXAMEN_TIPO;

const fechaHora = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export function ExamenTipo() {
  const { clave } = useParams();
  const examen = examenTipo(clave);
  const { registrarExamenTipo, examenTipoResultado, loading } = useProgress();
  const { hasAccess, loading: accesoCargando } = usePremiumAccess();
  const [fase, setFase] = useState<Fase>({ tipo: "inicio" });
  const respuestas = useRef<boolean[]>([]);

  if (!examen) return <NotFound />;
  if (loading || accesoCargando) return null;

  const avion = FLOTA.flatMap((e) => e.aviones).find((a) => a.clave === examen.clave);
  const foto = fotoFlota(examen.clave);
  const corto = examen.modelo.replace(/^Cessna /, "C");
  const guardado = examenTipoResultado(examen.clave);
  const espera = proximoIntento(guardado, esperaHoras);
  const bloqueado = !examen.gratis && !hasAccess;

  function empezar() {
    respuestas.current = [];
    setFase({ tipo: "examen", preguntas: armarIntento(examen!.preguntas, preguntasPorIntento) });
  }

  return (
    <div>
      <div className="relative overflow-hidden border-b border-white/10">
        <img src={foto.src} srcSet={foto.srcSet} sizes="100vw" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/30" />
        <Container className="relative py-14 md:py-20">
          <Link to={ROUTES.academia} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-gold-400">
            <ArrowLeft size={14} /> Academia
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Insignia de avión · Nivel teórico</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Experto en {corto}</h1>
          <p className="mt-3 max-w-xl text-white/70">
            El examen de lo esencial que un piloto debe saber del {examen.modelo}
            {avion ? ` (${avion.matricula} en la flota)` : ""}: velocidades, limitaciones, sistemas, procedimientos normales y emergencias.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {guardado?.passed ? <Badge tone="green">Teórico aprobado · {guardado.score}%</Badge> : <Badge tone={examen.gratis ? "gold" : "neutral"}>{examen.gratis ? "Gratis" : "Contenido Exclusivo"}</Badge>}
            <Badge tone="neutral">Práctico: próximamente</Badge>
          </div>
        </Container>
      </div>

      <Container className="max-w-3xl py-12 md:py-16">
        {bloqueado ? (
          <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.05] p-8 text-center">
            <Lock size={28} className="mx-auto text-gold-400" />
            <h2 className="mt-4 font-display text-xl font-semibold text-white">Este examen es parte de Contenido Exclusivo</h2>
            <p className="mt-2 text-sm text-white/60">El examen del Cessna 152 es gratis; los de los demás aviones de la flota vienen con Contenido Exclusivo.</p>
            <Button to={ROUTES.contenidoExclusivo} className="mt-6">Ver Contenido Exclusivo</Button>
          </div>
        ) : fase.tipo === "examen" ? (
          <Quiz
            preguntas={fase.preguntas}
            passingScore={aprobacion}
            permitirReintento={false}
            onRespuestas={(a) => { respuestas.current = a; }}
            onFinish={(score, passed) => {
              registrarExamenTipo(examen.clave, score, passed);
              setFase({ tipo: "resultado", score, passed, reforzar: areasAReforzar(fase.preguntas, respuestas.current, aprobacion) });
            }}
          />
        ) : fase.tipo === "resultado" ? (
          <Resultado corto={corto} {...fase} clave={examen.clave} />
        ) : (
          <div className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="font-display text-lg font-semibold text-white">Cómo funciona</h2>
              <ul className="mt-4 grid gap-3 text-sm text-white/70">
                <li className="flex gap-3"><Plane size={16} className="mt-0.5 shrink-0 text-gold-400" />{preguntasPorIntento} preguntas elegidas de un banco de {examen.preguntas.length}, de todas las áreas. Cada intento es distinto.</li>
                <li className="flex gap-3"><Award size={16} className="mt-0.5 shrink-0 text-gold-400" />Apruebas con {aprobacion} % y ganas la insignia "Experto en {corto} · Teórico" en tu perfil.</li>
                <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-gold-400" />Si no apruebas, te decimos qué áreas repasar y puedes volver a presentarlo {esperaHoras} horas después.</li>
              </ul>
              <p className="mt-5 text-xs text-white/40">
                Reconocimiento interno de Villanueva Aviation para entrenamiento en simulador. No es una habilitación oficial ni sustituye una licencia.
              </p>
            </div>

            {espera ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-sm text-white/70">
                  Tu último intento fue de {guardado?.score}%. Puedes volver a presentarlo el {fechaHora.format(espera)}.
                </p>
                {examen.clave === "c152" && (
                  <Button to={ROUTES.checklistC152} variant="secondary" className="mt-5">Repasar con el checklist</Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button onClick={empezar}>{guardado?.passed ? "Presentarlo de nuevo" : "Empezar examen"}</Button>
                {guardado?.passed && <p className="text-xs text-white/45">Tu insignia se queda aunque vuelvas a presentarlo.</p>}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

function Resultado({ corto, clave, score, passed, reforzar }: { corto: string; clave: string; score: number; passed: boolean; reforzar: AreaExamen[] }) {
  if (passed) {
    return (
      <div className="animate-result-in rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500 bg-gold-500/10 text-gold-400">
          <Award size={28} />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-white">¡Insignia ganada!</h2>
        <p className="mt-2 text-white/70">
          Experto en {corto} · Teórico, con {score}%. El nivel práctico, un vuelo evaluado en el simulador, llega pronto.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to={ROUTES.perfil}>Ver mis logros</Button>
          <Button to={ROUTES.academia} variant="secondary">Volver a la Academia</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="animate-result-in rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <h2 className="font-display text-2xl font-semibold text-white">Esta vez no: {score}%</h2>
      <p className="mt-2 text-white/60">Necesitas {aprobacion} %. Puedes volver a presentarlo en {esperaHoras} horas; úsalas para repasar.</p>
      {reforzar.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-white">Repasa estas áreas:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reforzar.map((a) => <Badge key={a} tone="red">{a}</Badge>)}
          </div>
        </div>
      )}
      <div className="mt-7 flex flex-wrap gap-3">
        {clave === "c152" && <Button to={ROUTES.checklistC152}>Repasar con el checklist del C152</Button>}
        <Button to={ROUTES.academia} variant="secondary">Volver a la Academia</Button>
      </div>
    </div>
  );
}
