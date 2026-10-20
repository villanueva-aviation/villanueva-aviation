import { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, Eye, Target } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";
import { ACADEMIA_MODULOS } from "../data/academia";
import { TOTAL_AVIONES, fotoFlota } from "../data/flota";

const DATOS = [
  { valor: "6,884 h", texto: "en la red de IVAO" },
  { valor: "120 h", texto: "de vuelo real" },
  { valor: "CPL", texto: "la meta: Comercial" },
];

const RUMBO = [
  {
    icon: Target,
    titulo: "Objetivo",
    texto:
      "Que cualquier persona que sueña con volar tenga una base sólida y real, sin importar dónde viva ni cuánto pueda invertir para empezar. Que pase de jugar al simulador a volar con procedimientos, hablar por radio con confianza y entender por qué hace cada cosa.",
    foto: "c172",
    alt: "Cessna 172 XB-VNA en vuelo, captura de simulador",
  },
  {
    icon: Eye,
    titulo: "Visión",
    texto:
      "Ser la academia de referencia en español para aprender aviación a través de la simulación: el lugar donde los simuladores de Latinoamérica y España aprenden a volar en red como se vuela en la realidad, y donde quien quiere llegar a una cabina real empieza con el pie derecho.",
    foto: "c408",
    alt: "Cessna 408 XB-SKY en vuelo, captura de simulador",
  },
];

// El camino del fundador como un plan de vuelo: tramos volados y el destino.
const RUTA = [
  {
    ident: "SIM",
    titulo: "En el simulador",
    texto:
      "6,884 horas voladas en la red de IVAO, con controladores reales, procedimientos y fraseología.",
    meta: false,
  },
  {
    ident: "PPL",
    titulo: "Piloto Privado",
    texto:
      "En la vida real: obtuvo su licencia de Piloto Privado y voló 120 horas.",
    meta: false,
  },
  {
    ident: "HOY",
    titulo: "Villanueva Aviation",
    texto:
      "Compartir lo aprendido, en español, para que más personas tengan una base sólida desde su propio simulador.",
    meta: false,
  },
  {
    ident: "PPL",
    etiqueta: "Próximo · PPL",
    titulo: "De vuelta a la cabina",
    texto:
      "Renovar su licencia de Piloto Privado, que hoy está vencida, para volver a volar en la vida real.",
    meta: false,
  },
  {
    ident: "CPL",
    titulo: "Piloto Comercial",
    texto:
      "La meta final: conseguir la licencia de Piloto Comercial, y seguir compartiendo el camino aquí.",
    meta: true,
  },
];

const COMO_TRABAJAMOS = [
  {
    titulo: "Una persona real del otro lado",
    texto:
      "El fundador revisa en persona tus proyectos finales, tus vuelos de práctica y tus pruebas en vivo.",
  },
  {
    titulo: "En el simulador que ya tienes",
    texto: `Todo se practica en tu propio simulador, con ${TOTAL_AVIONES} aviones, rutas y checklists listos para volar.`,
  },
  {
    titulo: "Primero lo gratis",
    texto: `La Academia de ${ACADEMIA_MODULOS.length} módulos, el test de nivel y las herramientas no cuestan nada. Solo se paga el tiempo personal.`,
  },
  {
    titulo: "En español desde el inicio",
    texto:
      "Pensado y escrito en español, no traducido, con fraseología en español y en inglés.",
  },
];

/** La línea de la ruta se va trazando conforme bajas por la página. */
function RutaFundador() {
  const lista = useRef<HTMLOListElement>(null);
  const linea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ol = lista.current;
    const l = linea.current;
    if (!ol || !l) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      l.style.transform = "scaleY(1)";
      return;
    }
    let raf = 0;
    const pintar = () => {
      raf = 0;
      const r = ol.getBoundingClientRect();
      const avance = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height),
      );
      l.style.transform = `scaleY(${avance})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    pintar();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative">
      <div
        className="absolute bottom-3 left-[15px] top-3 w-px bg-white/10 sm:left-[23px]"
        aria-hidden="true"
      />
      <div
        ref={linea}
        className="absolute bottom-3 left-[15px] top-3 w-px origin-top bg-gradient-to-b from-gold-500 to-gold-300 sm:left-[23px]"
        style={{ transform: "scaleY(0)" }}
        aria-hidden="true"
      />
      <ol ref={lista} className="relative space-y-12 pl-12 sm:pl-16">
        {RUTA.map((p, i) => (
          <li key={p.titulo} className="relative">
            <span
              className={`absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full border sm:-left-16 sm:h-12 sm:w-12 ${
                p.meta
                  ? "border-gold-400 bg-navy-950"
                  : "border-gold-500/60 bg-navy-900"
              }`}
              aria-hidden="true"
            >
              {p.meta && (
                <span className="absolute inset-0 rounded-full border border-gold-400 motion-safe:animate-ping" />
              )}
              <span
                className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${p.meta ? "bg-gold-300" : "bg-gold-500"}`}
              />
            </span>
            <Reveal delay={i * 60}>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold-500 tabular-nums">
                {"etiqueta" in p
                  ? p.etiqueta
                  : p.meta
                    ? `Destino · ${p.ident}`
                    : `Tramo ${String(i + 1).padStart(2, "0")} · ${p.ident}`}
              </p>
              <h3
                className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${p.meta ? "text-gold-400" : "text-white"}`}
              >
                {p.titulo}
              </h3>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-white/65">
                {p.texto}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function QuienesSomos() {
  return (
    <div>
      {/* PORTADA A PANTALLA COMPLETA */}
      <section className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden bg-navy-950">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={fotoFlota("c90").src}
            alt=""
            fetchPriority="high"
            className="animate-ken-burns h-full w-full object-cover object-[65%_50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/55 to-navy-950/10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent" />
        </div>

        <Container className="relative pb-10 pt-32">
          <span className="animate-fade-up inline-block font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
            Quiénes somos
          </span>
          <h1
            className="animate-fade-up mt-5 max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white text-balance sm:text-6xl xl:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            No es solo volar.{" "}
            <span className="text-gold-400">Es vivir la aviación.</span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Villanueva Aviation es una academia digital independiente que enseña
            teoría de aviación real a través de la simulación de vuelo, en
            español. Aprendes meteorología, navegación, radio y procedimientos
            VFR e IFR, y los practicas en el simulador que ya tienes en casa.
          </p>

          <dl
            className="animate-fade-up mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md"
            style={{ animationDelay: "240ms" }}
          >
            {DATOS.map((d) => (
              <div key={d.valor} className="bg-navy-950/70 px-3 py-4 sm:px-5">
                <dt className="sr-only">{d.texto}</dt>
                <dd className="font-display text-xl font-bold text-white tabular-nums sm:text-3xl">
                  {d.valor}
                </dd>
                <dd aria-hidden="true" className="mt-1 text-xs uppercase tracking-wide text-white/50">
                  {d.texto}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href="#rumbo"
            className="mx-auto mt-10 flex w-fit flex-col items-center gap-1 text-xs uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-gold-400"
          >
            Despegamos
            <ChevronDown size={18} className="motion-safe:animate-bounce" />
          </a>
        </Container>
      </section>

      {/* OBJETIVO Y VISIÓN */}
      <section id="rumbo" className="scroll-mt-16 py-20 md:py-28">
        <Container className="space-y-20 md:space-y-28">
          {RUMBO.map((r, i) => (
            <div
              key={r.titulo}
              className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal
                className={`overflow-hidden rounded-3xl border border-white/10 ${i % 2 ? "lg:order-2" : ""}`}
              >
                <img
                  src={fotoFlota(r.foto).src}
                  srcSet={fotoFlota(r.foto).srcSet}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={r.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-out hover:scale-[1.04]"
                />
              </Reveal>
              <Reveal delay={120}>
                <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
                  <r.icon size={16} strokeWidth={1.75} /> {r.titulo}
                </p>
                <p className="mt-5 font-display text-2xl font-light leading-snug text-white sm:text-3xl">
                  {r.texto}
                </p>
              </Reveal>
            </div>
          ))}
        </Container>
      </section>

      {/* LA RUTA DEL FUNDADOR */}
      <section className="relative overflow-hidden border-t border-white/10 bg-radar py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
                  El fundador
                </p>
                <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
                  Erik Villanueva
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                  Creó Villanueva Aviation para que el camino hacia la cabina no
                  tenga que empezar en una escuela cara e intimidante, sino con
                  una base sólida, práctica en simulador y alguien que te
                  acompañe.
                </p>
              </Reveal>
              <Reveal
                delay={120}
                className="mt-8 hidden aspect-[2/3] w-full max-w-xs overflow-hidden rounded-3xl border border-gold-500/20 shadow-[0_0_32px_rgba(212,175,55,0.18)] lg:block"
              >
                <img
                  src="/images/founder-erik-poster.jpg"
                  alt="Erik Villanueva, fundador de Villanueva Aviation"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </Reveal>
            </div>
            <RutaFundador />
          </div>
        </Container>
      </section>

      {/* CÓMO TRABAJAMOS */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <Reveal>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
              Cómo trabajamos
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-white sm:text-4xl">
              Lo que nos hace distintos
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {COMO_TRABAJAMOS.map((c, i) => (
              <Reveal
                key={c.titulo}
                delay={i * 80}
                className="h-full bg-navy-950 p-7"
              >
                <span className="font-display text-4xl font-extrabold text-gold-500/30 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                  {c.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {c.texto}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 rounded-2xl border border-white/10 bg-navy-900/60 p-6 md:p-8">
            <h3 className="font-display text-base font-semibold text-white">
              Para ser claros
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Villanueva Aviation no es una escuela de vuelo certificada ni
              otorga licencias, y las asesorías no cuentan como horas de
              instrucción de vuelo. Lo que aprendes aquí es preparación: te da
              bases, práctica y confianza, pero no sustituye la formación
              oficial en una escuela autorizada por la autoridad de aviación de
              tu país.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* CIERRE */}
      <section className="relative overflow-hidden border-t border-white/10 py-28 md:py-40">
        <img
          src={fotoFlota("seneca").src}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/70 to-navy-950" />
        <Container className="relative text-center">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold text-white text-balance sm:text-5xl">
            El cielo no es el límite,{" "}
            <span className="text-gold-400">es el comienzo</span>
          </h2>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to={ROUTES.testNivel} variant="primary" className="group">
              Descubre tu nivel
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Button>
            <Button to={ROUTES.academia} variant="secondary">
              Ver la Academia
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
