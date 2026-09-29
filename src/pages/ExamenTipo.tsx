import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award, Check, Clock, Lock, Plane } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Quiz } from "../features/academia/Quiz";
import { useProgress } from "../features/progress/ProgressContext";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import { areasAReforzar, armarIntento, proximoIntento, type NivelInsignia } from "../features/examenesTipo/reglas";
import { VueloPractico } from "../features/examenesTipo/VueloPractico";
import { examenTipo, nombreCorto, NIVELES_INSIGNIA, REGLAS_EXAMEN_TIPO, type AreaExamen, type PreguntaTipo } from "../data/examenesTipo";
import { FLOTA, fotoFlota } from "../data/flota";
import { ROUTES } from "../lib/routes";
import { NotFound } from "./NotFound";

type Fase = { tipo: "inicio" } | { tipo: "examen"; preguntas: PreguntaTipo[] } | { tipo: "resultado"; score: number; passed: boolean; mejor: number; reforzar: AreaExamen[] };

const { preguntasPorIntento, aprobacion, esperaHoras, dominio } = REGLAS_EXAMEN_TIPO;

const CHECKLIST: Record<string, string> = { c152: ROUTES.checklistC152, c172: ROUTES.checklistC172, da40: ROUTES.checklistAvion("da40") };

const fechaHora = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export function ExamenTipo() {
  const { clave } = useParams();
  const examen = examenTipo(clave);
  const { registrarExamenTipo, examenTipoResultado, nivelInsigniaAvion, loading } = useProgress();
  const { hasAccess, loading: accesoCargando } = usePremiumAccess();
  const [fase, setFase] = useState<Fase>({ tipo: "inicio" });
  const respuestas = useRef<boolean[]>([]);

  if (!examen) return <NotFound />;
  if (loading || accesoCargando) return null;

  const avion = FLOTA.flatMap((e) => e.aviones).find((a) => a.clave === examen.clave);
  const foto = fotoFlota(examen.clave);
  const corto = nombreCorto(examen);
  const guardado = examenTipoResultado(examen.clave);
  const espera = proximoIntento(guardado, esperaHoras, dominio);
  const nivel = nivelInsigniaAvion(examen.clave);
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
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Insignia de avión · Examen teórico</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Experto en {corto}</h1>
          <p className="mt-3 max-w-xl text-white/70">
            El examen de lo esencial que un piloto debe saber del {examen.modelo}
            {avion ? ` (${avion.matricula} en la flota)` : ""}: velocidades, limitaciones, sistemas, procedimientos normales y emergencias.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {nivel ? (
              <Badge tone={nivel}><Award size={12} className="mr-1" />{NIVELES_INSIGNIA[nivel].medalla} · {NIVELES_INSIGNIA[nivel].titulo(corto)}</Badge>
            ) : (
              <Badge tone={examen.gratis ? "gold" : "neutral"}>{examen.gratis ? "Gratis" : "Contenido Exclusivo"}</Badge>
            )}
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
              setFase({ tipo: "resultado", score, passed, mejor: Math.max(score, guardado?.score ?? 0), reforzar: areasAReforzar(fase.preguntas, respuestas.current, aprobacion) });
            }}
          />
        ) : fase.tipo === "resultado" ? (
          <Resultado corto={corto} {...fase} clave={examen.clave} conPlata={nivel === "plata" || nivel === "oro"} onVolver={() => setFase({ tipo: "inicio" })} />
        ) : (
          <div className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="font-display text-lg font-semibold text-white">Cómo funciona</h2>
              <ul className="mt-4 grid gap-3 text-sm text-white/70">
                <li className="flex gap-3"><Plane size={16} className="mt-0.5 shrink-0 text-gold-400" />{preguntasPorIntento} preguntas elegidas de un banco de {examen.preguntas.length}, de todas las áreas. Cada intento es distinto.</li>
                <li className="flex gap-3"><Award size={16} className="mt-0.5 shrink-0 text-gold-400" />Apruebas con {aprobacion} % y ganas el nivel Bronce de la insignia en tu perfil.</li>
                <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-gold-400" />Hasta llegar a {dominio} %, entre un intento y otro esperas {esperaHoras} horas. Si no apruebas, te decimos qué áreas repasar.</li>
              </ul>
              <p className="mt-5 text-xs text-white/40">
                Reconocimiento interno de Villanueva Aviation para entrenamiento en simulador. No es una habilitación oficial ni sustituye una licencia.
              </p>
            </div>

            <Niveles corto={corto} nivel={nivel} mejor={guardado?.score ?? null} />

            <VueloPractico modelo={examen.modelo} corto={corto} teoricoAprobado={Boolean(guardado?.passed)} />

            {espera ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-sm text-white/70">
                  Puedes volver a presentarlo el {fechaHora.format(espera)}
                </p>
                {CHECKLIST[examen.clave] && (
                  <Button to={CHECKLIST[examen.clave]} variant="secondary" className="mt-5">Repasar con el checklist</Button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button onClick={empezar}>{!guardado?.passed ? "Empezar examen" : guardado.score < dominio ? `Subir mi calificación a ${dominio} %` : "Presentarlo de nuevo"}</Button>
                {guardado?.passed && <p className="text-xs text-white/45">Tu insignia se queda aunque vuelvas a presentarlo.</p>}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

const PASOS = [
  { nivel: "bronce", requisito: `Aprobar el examen teórico con ${aprobacion} %` },
  { nivel: "plata", requisito: "Aprobar el vuelo práctico evaluado en el simulador" },
  { nivel: "oro", requisito: `Tener la Plata y el teórico con ${dominio} % o más` },
] as const;

function Niveles({ corto, nivel, mejor }: { corto: string; nivel: NivelInsignia | null; mejor: number | null }) {
  const alcanzado = nivel ? PASOS.findIndex((p) => p.nivel === nivel) : -1;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h2 className="font-display text-lg font-semibold text-white">Niveles de la insignia</h2>
      <ol className="mt-4 grid gap-3">
        {PASOS.map((p, i) => (
          <li key={p.nivel} className="flex items-start gap-3">
            <span className="w-24 shrink-0">
              <Badge tone={i <= alcanzado ? p.nivel : "neutral"}>
                {i <= alcanzado && <Check size={11} className="mr-1" />}
                {NIVELES_INSIGNIA[p.nivel].medalla}
              </Badge>
            </span>
            <div className="text-sm">
              <p className="font-medium text-white">{NIVELES_INSIGNIA[p.nivel].titulo(corto)}</p>
              <p className="text-white/55">{p.requisito}</p>
            </div>
          </li>
        ))}
      </ol>
      {mejor !== null && (
        <p className="mt-4 text-xs text-white/45">
          Tu mejor calificación en el teórico: {mejor}%{mejor >= dominio ? ", ya cumple lo que pide el Oro." : `. El Oro pide ${dominio} %.`}
        </p>
      )}
    </div>
  );
}

function Resultado({ corto, clave, score, passed, mejor, reforzar, conPlata, onVolver }: { corto: string; clave: string; score: number; passed: boolean; mejor: number; reforzar: AreaExamen[]; conPlata: boolean; onVolver: () => void }) {
  if (passed) {
    return (
      <div className="animate-result-in rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500 bg-gold-500/10 text-gold-400">
          <Award size={28} />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-white">¡Aprobado con {score}%!</h2>
        <p className="mt-2 text-white/70">
          {conPlata ? "Tu insignia sigue en su nivel." : `Tienes el nivel Bronce: ${NIVELES_INSIGNIA.bronce.titulo(corto)}.`}{" "}
          {mejor >= dominio
            ? `Con ${mejor} % ya cumples el teórico que pide el Oro.`
            : `Para el Oro necesitas ${dominio} % en el teórico; puedes volver a intentarlo en ${esperaHoras} horas.`}
          {!conPlata && " Ya puedes solicitar tu vuelo práctico para la Plata."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!conPlata && <Button onClick={onVolver}>Solicitar mi vuelo práctico</Button>}
          <Button to={ROUTES.perfil} variant={conPlata ? "primary" : "secondary"}>Ver mis logros</Button>
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
        {CHECKLIST[clave] && <Button to={CHECKLIST[clave]}>Repasar con el checklist del {corto}</Button>}
        <Button to={ROUTES.academia} variant="secondary">Volver a la Academia</Button>
      </div>
    </div>
  );
}
