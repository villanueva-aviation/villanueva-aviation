import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { SuscribirseForm } from "../features/newsletter/SuscribirseForm";
import { PREGUNTAS_TEST } from "../data/testNivel";
import { areaMasDebil, MODULO_DE_AREA, nivelTest, resumenPorArea, type NivelTest, type RespuestaTest } from "../features/testNivel/reglas";
import { ROUTES } from "../lib/routes";
import { AREAS_TEST, filaResultado, fuenteDeEnlace } from "../features/testNivel/reglas";
import { supabase } from "../lib/supabaseClient";
import { Medidor, type Banda } from "../features/testNivel/Medidor";

const TOTAL = PREGUNTAS_TEST.length;

// Bandas por área (2 preguntas): rojo = reforzar, ámbar = a medias, verde = dominada.
const BANDAS_AREA: Banda[] = [
  { desde: 0, hasta: 0.6, color: "#ef4444" },
  { desde: 0.6, hasta: 1.4, color: "#f59e0b" },
  { desde: 1.4, hasta: 2, color: "#34d399" },
];

// Nivel general (0-12): un tramo dorado más intenso por nivel, con los mismos cortes que nivelTest.
const BANDAS_NIVEL: Banda[] = [
  { desde: 0, hasta: 3.5, color: "rgba(212,175,55,0.22)" },
  { desde: 3.5, hasta: 6.5, color: "rgba(212,175,55,0.45)" },
  { desde: 6.5, hasta: 9.5, color: "rgba(212,175,55,0.7)" },
  { desde: 9.5, hasta: 12, color: "#d4af37" },
];

// Valores de muestra para las agujas en espera de la portada (no son resultados de nadie).
const MUESTRA = [1.3, 0.8, 1.6, 1.1, 0.6, 1.4];

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

  // Al terminar, se guarda el resultado anónimo una sola vez por intento. Si falla, la persona no se entera.
  const guardado = useRef(false);
  useEffect(() => {
    if (paso !== TOTAL || guardado.current) return;
    guardado.current = true;
    // El builder de Supabase no se ejecuta hasta que se le pide el resultado: por eso el .then.
    supabase
      .from("resultados_test_nivel")
      .insert(filaResultado(respuestas, TOTAL, fuenteDeEnlace(window.location.search)))
      .then(() => {});
  }, [paso, respuestas]);

  function responder(opcion: number) {
    const p = PREGUNTAS_TEST[paso];
    setRespuestas([...respuestas, { area: p.area, acierto: opcion === p.correcta }]);
    setPaso(paso + 1);
  }

  function reiniciar() {
    guardado.current = false;
    setRespuestas([]);
    setPaso(-1);
  }

  if (paso === -1) {
    return (
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0" aria-hidden="true">
          <img src="/images/msfs-aeromexico-clouds.jpg" alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-transparent to-navy-950" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <div className="relative mx-auto grid w-full max-w-[100rem] items-center gap-12 px-6 py-14 sm:py-20 md:px-8 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-16 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="animate-fade-up font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl xl:text-6xl">
              ¿Qué nivel tienes <span className="text-gold-400">realmente</span> en simulación de vuelo?
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: "60ms" }}>
              {`${TOTAL} preguntas de ${AREAS_TEST.length} áreas, unos 3 minutos, gratis y sin crear cuenta. Al final ves tu nivel en un panel de instrumentos, tus puntos fuertes y por dónde seguir.`}
            </p>
            <div className="animate-fade-up mt-9" style={{ animationDelay: "120ms" }}>
              <Button onClick={() => setPaso(0)} variant="primary" className="group">
                Empezar el test
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
          <figure className="animate-fade-up rounded-3xl border border-white/10 bg-[#03080f]/85 p-5 backdrop-blur-sm sm:p-6" style={{ animationDelay: "180ms" }}>
            <div className="grid grid-cols-3 gap-x-3 gap-y-4">
              {AREAS_TEST.map((area, i) => (
                <div key={area} className="text-center">
                  <Medidor valor={MUESTRA[i]} maximo={2} marcas={0.5} bandas={BANDAS_AREA} oscilar titulo={`Instrumento de ${area} en espera`} />
                  <p className="mt-1 truncate text-xs font-semibold text-white/70">{area}</p>
                </div>
              ))}
            </div>
            <figcaption className="mt-4 border-t border-white/10 pt-3 text-center text-xs text-white/50">
              Así se ve tu panel al terminar, con tus respuestas.
            </figcaption>
          </figure>
        </div>
      </section>
    );
  }

  if (paso < TOTAL) {
    const p = PREGUNTAS_TEST[paso];
    return (
      <Container className="max-w-2xl py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
          Pregunta {paso + 1} de {TOTAL} · {p.area}
        </p>
        <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${TOTAL}, minmax(0, 1fr))` }} aria-hidden="true">
          {PREGUNTAS_TEST.map((q, i) => (
            <span key={q.id} className={`h-1 rounded-full transition-colors duration-300 ${i < paso ? "bg-gold-500" : i === paso ? "bg-gold-500/50" : "bg-white/10"}`} />
          ))}
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
    <Container className="max-w-4xl py-12 md:py-16">
      <div className="grid items-center gap-8 rounded-3xl border border-gold-500/25 bg-[#03080f]/80 p-6 sm:grid-cols-[minmax(0,15rem)_1fr] md:gap-10 md:p-8">
        <div className="mx-auto w-full max-w-[15rem]">
          <Medidor
            valor={aciertos}
            maximo={TOTAL}
            marcas={1}
            bandas={BANDAS_NIVEL}
            etiquetas={{ 1.75: "P", 5: "B", 8: "I", 10.75: "A" }}
            centro={`${aciertos}/${TOTAL}`}
            sub="aciertos"
            titulo={`Nivel general: ${aciertos} de ${TOTAL}, nivel ${nivel}`}
          />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Nivel {nivel}</h1>
          <p className="mt-1 text-sm text-white/55">{`${aciertos} de ${TOTAL} respuestas correctas`}</p>
          <p className="mt-4 text-base leading-relaxed text-white/75">{MENSAJE_NIVEL[nivel]}</p>
          <p className="mt-3 text-xs text-white/40">P Principiante · B Base · I Intermedio · A Avanzado</p>
        </div>
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-white">Tu panel por área</h2>
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
        {resumen.map((r, i) => (
          <li key={r.area} className="text-center">
            <Medidor
              valor={r.aciertos}
              maximo={r.total || 2}
              marcas={0.5}
              bandas={BANDAS_AREA}
              centro={`${r.aciertos}/${r.total}`}
              retraso={300 + i * 120}
              className="mx-auto max-w-[11rem]"
              titulo={`${r.area}: ${r.aciertos} de ${r.total}`}
            />
            <p className={`mt-1 text-sm font-semibold ${r.area === debil ? "text-gold-400" : "text-white/80"}`}>
              {r.area}
              {r.area === debil && <span className="block text-xs font-normal text-white/50">Para reforzar</span>}
            </p>
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
        {(nivel === "Intermedio" || nivel === "Avanzado") && (
          <p className="mt-5 text-sm text-white/65">
            ¿Listo para volar en red?{" "}
            <Link to={ROUTES.rutaRed} className="font-semibold text-gold-400 underline-offset-4 hover:underline">
              Empieza la ruta gratis
            </Link>
          </p>
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
