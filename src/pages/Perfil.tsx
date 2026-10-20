import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BadgeCheck, Gauge, Lock, Plane, Radio, Timer } from "lucide-react";
import { CadetTabs } from "../components/layout/CadetTabs";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatTile } from "../components/ui/StatTile";
import { Reveal } from "../components/ui/Reveal";
import { useAuth } from "../features/auth/AuthContext";
import { useProgress } from "../features/progress/ProgressContext";
import { contarExamenesAprobados } from "../data/evaluaciones";
import { useHorasVueloConfirmadas } from "../features/practica/vuelosPractica";
import { useRango } from "../features/progress/rango";
import { fetchMisIntentos, fetchMisPruebas } from "../features/rutaRed/pruebasRed";
import { insigniaGanada } from "../features/rutaRed/reglas";
import { LECCIONES_RED, SLUG_RUTA_RED } from "../data/rutaRed";
import { ROUTES } from "../lib/routes";
import type { Logro } from "../data/cadete";

export function Perfil() {
  const { user } = useAuth();
  const { nivel, xp, horasSimulador, progresoGeneralPct, logros, certificados, examenResultado, isActividadCompletada, loading } =
    useProgress();
  const examenesAprobados = contarExamenesAprobados(examenResultado);
  const horasVueloConfirmadas = useHorasVueloConfirmadas();
  const rango = useRango();

  // Ruta "Listo para volar en red": sin sesión o con error se trata como "sin datos", nunca rompe el perfil.
  const [red, setRed] = useState({ insignia: false, tieneBloque: false });
  useEffect(() => {
    let vivo = true;
    Promise.all([fetchMisIntentos(1), fetchMisPruebas(1)])
      .then(([intentos, pruebas]) => vivo && setRed({ insignia: insigniaGanada(intentos), tieneBloque: pruebas.length > 0 }))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  if (loading) return null;

  const pendientesRed = LECCIONES_RED.filter((l) => !isActividadCompletada(SLUG_RUTA_RED, l.id));
  const empezoRed = pendientesRed.length < LECCIONES_RED.length;
  const logroRed: Logro = {
    id: "listo-para-red-1",
    titulo: "Listo para volar en red · Etapa 1 (español)",
    descripcion: "Se gana al aprobar la prueba en vivo con Erik. No es una evaluación oficial de IVAO, VATSIM ni de la AFAC.",
    icon: Radio,
    desbloqueado: red.insignia,
  };
  const todosLogros = [...logros, logroRed];

  return (
    <div>
      <div className="border-b border-white/10 bg-radar bg-grid">
        <Container className="py-14 md:py-20">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-gold-500/50 bg-gold-500/10 font-display text-3xl font-semibold text-gold-400">
              {(user?.nombre ?? "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{user?.nombre ?? "Cadete"}</h1>
              <p className="text-sm text-white/50">{user?.email ?? "cadete@villanuevaaviation.com"}</p>
              <span className="mt-2 inline-flex rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 font-display text-xs font-semibold text-gold-400">
                {rango} · Nivel {nivel}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <CadetTabs />

      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Reveal delay={0}>
            <StatTile icon={Gauge} label="Progreso general" value={`${progresoGeneralPct}%`} />
          </Reveal>
          <Reveal delay={80}>
            <StatTile icon={BadgeCheck} label="Exámenes aprobados" value={String(examenesAprobados)} />
          </Reveal>
          <Reveal delay={160}>
            <StatTile icon={Timer} label="Horas de simulador" value={`${horasSimulador}h`} />
          </Reveal>
          <Reveal delay={240}>
            <StatTile icon={Award} label="XP acumulados" value={String(xp)} />
          </Reveal>
          <Reveal delay={320}>
            <StatTile icon={Plane} label="Horas de vuelo registradas" value={`${horasVueloConfirmadas}h`} />
          </Reveal>
        </div>

        <Reveal className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/60">Progreso hacia el siguiente nivel</p>
          <div className="mt-3">
            <ProgressBar value={progresoGeneralPct} />
          </div>
        </Reveal>

        {(empezoRed || red.tieneBloque) && pendientesRed.length > 0 && (
          <Reveal className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-6">
            <p className="font-display text-sm font-semibold text-white">
              Te faltan {pendientesRed.length} {pendientesRed.length === 1 ? "lección" : "lecciones"} de la ruta Listo para volar en red
            </p>
            <Link
              to={ROUTES.rutaRedLeccion(pendientesRed[0].id)}
              className="mt-2 inline-block text-sm font-semibold text-gold-400 underline-offset-4 hover:underline"
            >
              Seguir con: {pendientesRed[0].titulo}
            </Link>
          </Reveal>
        )}

        <h2 className="mt-14 font-display text-xl font-semibold text-white">Logros</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todosLogros.map((logro, i) => (
            <Reveal
              key={logro.id}
              delay={i * 80}
              className={`flex items-start gap-4 rounded-2xl border p-5 ${
                logro.desbloqueado ? "border-gold-500/30 bg-gold-500/5" : "border-white/10 bg-white/[0.02] opacity-60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  !logro.desbloqueado
                    ? "bg-white/5 text-white/30"
                    : logro.nivel === "bronce"
                      ? "bg-[#b87333]/15 text-[#e3a46f]"
                      : logro.nivel === "plata"
                        ? "bg-slate-300/10 text-slate-200"
                        : "bg-gold-500/15 text-gold-400"
                }`}
              >
                {logro.desbloqueado ? <logro.icon size={18} /> : <Lock size={16} />}
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-white">{logro.titulo}</p>
                <p className="mt-1 text-xs text-white/50">{logro.descripcion}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-14 font-display text-xl font-semibold text-white">Certificados</h2>
        <p className="mt-2 text-sm text-white/50">
          Reconocimientos internos de Villanueva Aviation por completar módulos. No tienen validez oficial ni sustituyen una licencia.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {certificados.map((cert, i) => (
            <Reveal
              key={cert.id}
              delay={i * 80}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4"
            >
              <div className="flex items-center gap-3">
                {cert.obtenido ? <BadgeCheck size={18} className="text-gold-400" /> : <Lock size={16} className="text-white/30" />}
                <span className={`text-sm ${cert.obtenido ? "text-white" : "text-white/45"}`}>{cert.titulo}</span>
              </div>
              <Badge tone={cert.obtenido ? "green" : "neutral"}>{cert.obtenido ? cert.fecha : "Pendiente"}</Badge>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
