import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { ROUTES } from "../../lib/routes";
import { ACADEMIA_MODULOS } from "../../data/academia";
import { EXAMENES_TIPO } from "../../data/examenesTipo";
import { TOTAL_AVIONES, fotoFlota } from "../../data/flota";

export interface Etapa {
  titulo: string;
  texto: string;
  img: { src: string; srcSet?: string };
  alt: string;
  cta?: { label: string; to: string };
}

const ETAPAS_INICIO: Etapa[] = [
  {
    titulo: "Descubre tu nivel",
    texto: "Doce preguntas de seis áreas, en unos tres minutos y sin crear cuenta. Ves tu nivel, tus puntos fuertes y por dónde te conviene seguir.",
    cta: { label: "Hacer el test", to: ROUTES.testNivel },
    img: fotoFlota("c152"),
    alt: "Cessna 152 XB-CDT en vuelo, captura de simulador",
  },
  {
    titulo: "Aprende la teoría",
    texto: `${ACADEMIA_MODULOS.length} módulos, de Fundamentos a IFR: lecciones, ejercicios interactivos y un proyecto final que el fundador revisa en persona. Gratis.`,
    cta: { label: "Ver la Academia", to: ROUTES.academia },
    img: fotoFlota("c172"),
    alt: "Cessna 172 XB-VNA en vuelo, captura de simulador",
  },
  {
    titulo: "Practica en tu simulador",
    texto: `Checklists de ${TOTAL_AVIONES} aviones, exámenes de ${EXAMENES_TIPO.length} modelos, rutas de México con su plan de vuelo listo para cargar y un briefing con el METAR real.`,
    cta: { label: "Ver la flota", to: ROUTES.flota },
    img: fotoFlota("seneca"),
    alt: "Piper Seneca XB-SNV en vuelo, captura de simulador",
  },
  {
    titulo: "Vuela con acompañamiento",
    texto: "Asesorías 1 a 1 por Discord, con un plan escrito para ti. Empiezas con un diagnóstico gratis de 30 minutos.",
    cta: { label: "Ver asesorías", to: ROUTES.asesorias },
    img: fotoFlota("c90"),
    alt: "King Air C90 XB-KNG en vuelo, captura de simulador",
  },
  {
    titulo: "Vuela en una aerolínea",
    texto:
      "Cuando ya te muevas en la red, súmate a Axolojet Virtual, nuestra aerolínea aliada en IVAO: base en Guadalajara, tours en grupo y eventos con ATC, del TBM al 747. Su vuelo de entrada es en Cessna 172 de Guadalajara a Puerto Vallarta y de regreso, justo lo que practicas aquí.",
    cta: { label: "Conoce Axolojet", to: "https://axolojetva.com" },
    img: { src: "/images/axolojet-737-max.webp" },
    alt: "Boeing 737 MAX con los colores de Axolojet Virtual sobre las nubes, captura de simulador",
  },
];

const n = (i: number) => String(i + 1).padStart(2, "0");

/** La ruta del cadete en el inicio. */
export function EtapasRuta() {
  return (
    <EtapasConFoto
      titulo="Tu ruta, etapa por etapa"
      descripcion="Del primer test a volar en una aerolínea virtual. Cada etapa se puede hacer por separado y a tu ritmo."
      etapas={ETAPAS_INICIO}
    />
  );
}

/** Etapas con foto: en escritorio la foto se queda fija y cambia al bajar; en celular cada etapa trae la suya. */
export function EtapasConFoto({ titulo, descripcion, etapas }: { titulo: string; descripcion?: string; etapas: Etapa[] }) {
  const TOTAL = n(etapas.length - 1);
  const [activa, setActiva] = useState(0);
  const bloques = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActiva(Number((e.target as HTMLElement).dataset.etapa));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    bloques.current.forEach((b) => b && observador.observe(b));
    return () => observador.disconnect();
  }, []);

  return (
    <section className="border-t border-white/10 py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">{titulo}</h2>
          {descripcion && <p className="mt-4 text-base leading-relaxed text-white/65">{descripcion}</p>}
        </div>

        <div className="mt-12 grid gap-10 lg:mt-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Foto fija (escritorio). Se sale del contenedor hacia el margen izquierdo (queda a 1.5rem de la orilla):
              en su columna quedaba más alta que ancha y el recorte dejaba fuera la nariz de los aviones. */}
          <div className="hidden lg:-ml-[calc(max(0px,(100vw_-_80rem)/2)_+_2.5rem)] lg:block">
            <div className="sticky top-24 h-[min(72vh,640px)] overflow-hidden rounded-3xl border border-white/10">
              {etapas.map((e, i) => (
                <img
                  key={e.titulo}
                  src={e.img.src}
                  srcSet={e.img.srcSet}
                  sizes="55vw"
                  alt={i === activa ? e.alt : ""}
                  aria-hidden={i !== activa}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                    i === activa ? "scale-100 opacity-100 blur-0" : "scale-[1.04] opacity-0 blur-[2px]"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="font-display text-sm font-semibold tabular-nums tracking-[0.2em] text-gold-400">
                  ETAPA {n(activa)} <span className="text-white/45">/ {TOTAL}</span>
                </p>
                <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))` }} aria-hidden="true">
                  {etapas.map((e, i) => (
                    <span key={e.titulo} className="h-[3px] overflow-hidden rounded-full bg-white/20">
                      <span
                        className={`block h-full origin-left bg-gold-500 transition-transform duration-500 ease-out motion-reduce:transition-none ${i <= activa ? "scale-x-100" : "scale-x-0"}`}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Texto de cada etapa */}
          <div>
            {etapas.map((e, i) => (
              <article
                key={e.titulo}
                ref={(el) => {
                  bloques.current[i] = el;
                }}
                data-etapa={i}
                className="flex flex-col justify-center border-t border-white/10 py-10 first:border-t-0 lg:min-h-[min(72vh,640px)] lg:border-t-0 lg:py-0"
              >
                <img
                  src={e.img.src}
                  srcSet={e.img.srcSet}
                  sizes="100vw"
                  alt={e.alt}
                  loading="lazy"
                  className="mb-6 aspect-video w-full rounded-2xl border border-white/10 object-cover lg:hidden"
                />
                <p
                  className={`font-display text-sm font-semibold tabular-nums tracking-[0.2em] transition-colors duration-300 ${
                    i === activa ? "text-gold-400" : "text-white/40"
                  } max-lg:text-gold-400`}
                >
                  ETAPA {n(i)}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{e.titulo}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">{e.texto}</p>
                {e.cta && (
                  <div className="mt-6">
                    {e.cta.to.startsWith("http") ? (
                      <Button href={e.cta.to} target="_blank" rel="noopener" variant="secondary">
                        {e.cta.label} <ArrowUpRight size={16} />
                      </Button>
                    ) : (
                      <Button to={e.cta.to} variant="secondary">
                        {e.cta.label} <ArrowRight size={16} />
                      </Button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
