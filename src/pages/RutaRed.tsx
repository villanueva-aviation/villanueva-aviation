import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { CARTAS_RED, LECCIONES_RED, SLUG_RUTA_RED } from "../data/rutaRed";
import { NOMBRE_PARTE, PARTES_RED } from "../features/rutaRed/reglas";
import { useProgress } from "../features/progress/ProgressContext";
import { useAuth } from "../features/auth/AuthContext";
import {
  DIAS_VIGENCIA_PRUEBA,
  HORAS_CANCELACION,
  HORAS_SEMANA_PRUEBAS,
  INTENTOS_POR_BLOQUE,
  PRECIO_PRUEBA_RED,
  PRECIO_PRUEBA_RED_REPETICION,
} from "../lib/constants";
import { ROUTES } from "../lib/routes";

const CRITERIOS = ["Colacionó mal la autorización", "Se salió de la SID", "Comunicaciones poco claras o imprecisas"];

export function RutaRed() {
  const { isAuthenticated } = useAuth();
  const { isActividadCompletada } = useProgress();
  const hechas = LECCIONES_RED.filter((l) => isAuthenticated && isActividadCompletada(SLUG_RUTA_RED, l.id)).length;

  return (
    <div>
      <PageHero
        eyebrow="Ruta gratuita · Etapa 1 (español)"
        title="Listo para volar en red"
        description="Ocho lecciones para volar IFR de MMGL a MMMX en IVAO o VATSIM sin trabarte con la radio, y una prueba final contigo y Erik como controlador."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button to={ROUTES.rutaRedLeccion(LECCIONES_RED[0].id)} variant="primary">
            Empezar la lección 1 <ArrowRight size={16} />
          </Button>
          <a href="#prueba" className="text-sm font-medium text-white/70 transition-colors hover:text-gold-400">
            Ver cómo es la prueba
          </a>
        </div>
      </PageHero>

      <section className="py-16 md:py-20">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Las 8 lecciones</h2>
            {isAuthenticated && (
              <p className="text-sm text-white/55 tabular-nums">
                {hechas} de {LECCIONES_RED.length} completadas
              </p>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Son gratis y las puedes ver sin cuenta. Si creas una cuenta gratis, guardamos tu avance.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {LECCIONES_RED.map((l) => {
              const hecha = isAuthenticated && isActividadCompletada(SLUG_RUTA_RED, l.id);
              return (
                <li key={l.id}>
                  <Link
                    to={ROUTES.rutaRedLeccion(l.id)}
                    className="group flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-gold-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
                  >
                    <span className="font-mono text-lg font-semibold tabular-nums text-gold-400">{l.numero}</span>
                    <span className="flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-display text-base font-semibold text-white">{l.titulo}</span>
                        {hecha && <CheckCircle2 size={18} className="shrink-0 text-gold-400" aria-label="Completada" />}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-white/60">{l.resumen}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-display text-sm font-semibold text-white">Cartas que usamos</h3>
            <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-white/65 sm:grid-cols-2">
              {CARTAS_RED.map((c) => (
                <li key={c.procedimiento}>
                  <span className="font-semibold text-white">{c.procedimiento}</span> · {c.aeropuerto} · {c.tipo} · vigente desde el{" "}
                  {c.vigencia}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/50">Solo para simulación. Confirma la fecha en tu carta del ciclo actual.</p>
          </div>
        </Container>
      </section>

      <section id="prueba" className="scroll-mt-20 border-t border-white/10 py-16 md:py-20">
        <Container>
          <Badge tone="gold">Listo para volar en red · Etapa 1 (español)</Badge>
          <h2 className="mt-4 max-w-2xl font-display text-2xl font-bold text-white text-balance sm:text-3xl">
            La prueba final con Erik
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/65">
            Vuelas MMGL → MMMX en tu simulador y Erik hace de controlador por Discord. Si pasas las cuatro partes, ganas la
            insignia en tu perfil.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-gold-500/40 bg-gold-500/[0.07] p-6">
              <p className="font-display text-sm font-semibold text-gold-400">Precio</p>
              <p className="mt-3 font-display text-4xl font-bold text-white tabular-nums">
                ${PRECIO_PRUEBA_RED} <span className="text-base font-semibold text-white/50">USD</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Incluye {INTENTOS_POR_BLOQUE} intentos. Si no pasas en esos {INTENTOS_POR_BLOQUE}, el siguiente bloque de{" "}
                {INTENTOS_POR_BLOQUE} intentos cuesta ${PRECIO_PRUEBA_RED_REPETICION} USD.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                El primer intento es el vuelo completo MMGL → MMMX (unas 2 h). Los siguientes repiten solo las partes
                pendientes (20 a 30 min).
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display text-sm font-semibold text-white">Las 4 partes</p>
              <ol className="mt-3 flex flex-col gap-1.5 text-sm text-white/75">
                {PARTES_RED.map((p, i) => (
                  <li key={p} className="flex gap-3">
                    <span className="font-mono font-semibold tabular-nums text-gold-400">{i + 1}</span>
                    {NOMBRE_PARTE[p]}
                  </li>
                ))}
              </ol>
              <p className="mt-5 font-display text-sm font-semibold text-white">No apruebas una parte si</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/75">
                {CRITERIOS.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span aria-hidden="true" className="text-gold-400">
                      ·
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="font-display text-sm font-semibold text-white">Reglas</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-white/70">
              <li>
                Si no te presentas, o cancelas con menos de {HORAS_CANCELACION} horas de anticipación, se usa el intento.
              </li>
              <li>Los intentos vencen {DIAS_VIGENCIA_PRUEBA} días después del pago.</li>
              <li>
                Si Erik no puede darte una fecha dentro de esos {DIAS_VIGENCIA_PRUEBA} días, te devolvemos el pago.
              </li>
              <li>Erik dedica {HORAS_SEMANA_PRUEBAS} horas a la semana a las pruebas.</li>
              <li>
                Para agendar necesitas tu callsign de IVAO o VATSIM, o tu enlace de Volanta, para que Erik pueda ver tu vuelo.
              </li>
              <li>Pagar y agendar requiere una cuenta gratis.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button to={ROUTES.pruebaRed} variant="primary">
              Ir a la prueba <ArrowRight size={16} />
            </Button>
            <Button to={ROUTES.rutaRedLeccion(LECCIONES_RED[0].id)} variant="secondary">
              Primero, las lecciones
            </Button>
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-white/50">
            La insignia es de Villanueva Aviation y no es una evaluación oficial de IVAO, VATSIM ni la AFAC.
          </p>
        </Container>
      </section>
    </div>
  );
}
