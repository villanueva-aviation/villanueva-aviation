import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { SuscribirseForm } from "../features/newsletter/SuscribirseForm";
import { PREGUNTAS_TEST } from "../data/testNivel";
import { areaMasDebil, MODULO_DE_AREA, nivelTest, resumenPorArea, type NivelTest, type RespuestaTest } from "../features/testNivel/reglas";
import { ROUTES } from "../lib/routes";

const TOTAL = PREGUNTAS_TEST.length;

const MENSAJE_NIVEL: Record<NivelTest, string> = {
  Principiante: "Estás en el mejor punto para empezar: todo el camino está por delante y se aprende paso a paso.",
  Base: "Tienes bases. Lo que sigue es reforzar áreas puntuales para volar con más seguridad.",
  Intermedio: "Dominas lo esencial. Lo que te separa del siguiente nivel son los detalles de procedimientos.",
  Avanzado: "Tu conocimiento es sólido. Lo más útil ahora es un plan a tu medida para seguir creciendo.",
};

export function TestNivel() {
  const [paso, setPaso] = useState(-1); // -1 intro, 0..TOTAL-1 preguntas, TOTAL resultado
  const [respuestas, setRespuestas] = useState<RespuestaTest[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [paso]);

  function responder(opcion: number) {
    const p = PREGUNTAS_TEST[paso];
    setRespuestas([...respuestas, { area: p.area, acierto: opcion === p.correcta }]);
    setPaso(paso + 1);
  }

  function reiniciar() {
    setRespuestas([]);
    setPaso(-1);
  }

  if (paso === -1) {
    return (
      <PageHero
        eyebrow="Test de nivel"
        title="¿Qué nivel tienes realmente en simulación de vuelo?"
        description={`${TOTAL} preguntas, unos 3 minutos, gratis y sin crear cuenta. Al final ves tu nivel, tus puntos fuertes y por dónde seguir.`}
      >
        <Button onClick={() => setPaso(0)} variant="primary">
          Empezar el test <ArrowRight size={16} />
        </Button>
      </PageHero>
    );
  }

  if (paso < TOTAL) {
    const p = PREGUNTAS_TEST[paso];
    return (
      <Container className="max-w-2xl py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
          Pregunta {paso + 1} de {TOTAL} · {p.area}
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full bg-gold-500 transition-[width] duration-300 ease-out" style={{ width: `${(paso / TOTAL) * 100}%` }} />
        </div>
        <h1 key={p.id} className="animate-fade-up mt-8 font-display text-xl font-semibold leading-snug text-white md:text-2xl">
          {p.pregunta}
        </h1>
        <div className="mt-6 flex flex-col gap-3">
          {p.opciones.map((o, i) => (
            <button
              key={`${p.id}-${i}`}
              onClick={() => responder(i)}
              className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/85 transition-[transform,border-color,background-color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 [@media(hover:hover)_and_(pointer:fine)]:hover:border-gold-500/50 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.07]"
            >
              {o}
            </button>
          ))}
        </div>
      </Container>
    );
  }

  const aciertos = respuestas.filter((r) => r.acierto).length;
  const nivel = nivelTest(aciertos, TOTAL);
  const resumen = resumenPorArea(respuestas);
  const debil = areaMasDebil(resumen);
  const irModulo = nivel === "Principiante" ? "fundamentos" : debil ? MODULO_DE_AREA[debil] : null;

  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="animate-result-in rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Tu resultado</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Nivel {nivel}</h1>
        <p className="mt-1 text-sm text-white/55">{`${aciertos} de ${TOTAL} respuestas correctas`}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/75">{MENSAJE_NIVEL[nivel]}</p>
      </div>

      <h2 className="mt-10 font-display text-base font-semibold text-white">Tu nivel por área</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {resumen.map((r) => (
          <li key={r.area}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-white/80">{r.area}</span>
              <span className="text-xs text-white/45">{`${r.aciertos}/${r.total}`}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div className="h-full rounded-full bg-gold-500" style={{ width: `${r.total ? (r.aciertos / r.total) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-base font-semibold text-white">Tu siguiente paso</h2>
        {irModulo ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {nivel === "Principiante"
                ? "Empieza por la primera lección de Fundamentos. Es gratis y toma pocos minutos."
                : `Tu área para reforzar es ${debil}. Su módulo de la Academia es gratis.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button to={ROUTES.academiaModulo(irModulo)} variant="primary">
                Ir al módulo <ArrowRight size={16} />
              </Button>
              <Button to={ROUTES.diagnostico} variant="secondary">
                Pedir mi diagnóstico gratis
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Con este nivel, lo que más te sirve es un plan a tu medida. Pide tu diagnóstico gratis de 30 minutos y lo armamos juntos.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button to={ROUTES.diagnostico} variant="primary">
                Pedir mi diagnóstico gratis <ArrowRight size={16} />
              </Button>
              <Button to={ROUTES.asesorias} variant="secondary">
                Ver cómo funcionan las asesorías
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mt-10">
        <SuscribirseForm origen="test-nivel" titulo="¿Quieres recibir guías y novedades? Deja tu correo (opcional)." />
      </div>

      <button
        onClick={reiniciar}
        className="mt-8 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-gold-400"
      >
        <RotateCcw size={14} /> Repetir el test
      </button>

      <p className="mt-8 text-xs leading-relaxed text-white/40">
        Resultado orientativo de conocimiento en simulación, con preguntas de la Academia. No es una evaluación oficial ni una
        certificación. Villanueva Aviation es una academia digital independiente.
      </p>
    </Container>
  );
}
