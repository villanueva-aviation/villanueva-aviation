import { ArrowRight, Plane } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";
import { FLOTA, TOTAL_AVIONES, fotoFlota, type AvionFlota } from "../data/flota";

function TarjetaAvion({ avion }: { avion: AvionFlota }) {
  const foto = fotoFlota(avion.clave);
  return (
    <article id={avion.clave} className="grid scroll-mt-28 grid-cols-1 items-center gap-6 xl:grid-cols-[1.4fr_1fr] xl:gap-10">
      <figure className="group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900">
        <img
          src={foto.src}
          srcSet={foto.srcSet}
          sizes="(min-width: 1280px) 640px, (min-width: 1024px) 70vw, 100vw"
          alt={`${avion.modelo} ${avion.matricula} en vuelo, captura de simulador`}
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        />
      </figure>
      <div>
        <p className="font-display text-4xl font-extrabold tracking-tight text-white tabular-nums sm:text-5xl">
          {avion.matricula}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-gold-400">{avion.modelo}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">{avion.descripcion}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {avion.rasgos.map((r) => (
            <li
              key={r}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/70"
            >
              {r}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function Flota() {
  return (
    <div>
      <PageHero
        eyebrow="Flota virtual"
        title="Diez aviones, una sola ruta hacia la cabina"
        description="La flota de Villanueva Aviation vuela en Microsoft Flight Simulator con los colores de la academia. Está ordenada como se sube de categoría en la aviación real: del Cessna 152 del primer vuelo solo al turbohélice bimotor."
      >
        {/* La fila de la flota, en orden de ascenso: cada miniatura lleva a su avión. */}
        <ol className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0">
          {FLOTA.flatMap((etapa) => etapa.aviones).map((avion) => (
            <li key={avion.clave} className="w-40 shrink-0 snap-start md:w-auto">
              <a
                href={`#${avion.clave}`}
                className="group block overflow-hidden rounded-xl border border-white/10 bg-navy-900 transition-colors duration-300 hover:border-gold-500/40 focus-visible:border-gold-500/60 focus-visible:outline-none"
              >
                <img
                  src={`/images/flota/${avion.clave}-800.webp`}
                  alt=""
                  width={800}
                  height={450}
                  className="aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <span className="block px-3 py-2 font-display text-xs font-semibold tracking-wide text-white/80 tabular-nums group-hover:text-white">
                  {avion.matricula}
                  <span className="sr-only"> · {avion.modelo}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </PageHero>

      <Container className="py-16 md:py-24">
        <ol className="flex flex-col gap-24 md:gap-32">
          {FLOTA.map((etapa, i) => (
            <li key={etapa.nombre} className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 font-display text-sm font-semibold text-gold-400 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-gold-500/40 to-transparent lg:hidden" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-white">{etapa.nombre}</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">{etapa.resumen}</p>
              </div>
              <div className="flex flex-col gap-14 md:gap-20">
                {etapa.aviones.map((avion) => (
                  <Reveal key={avion.clave}>
                    <TarjetaAvion avion={avion} />
                  </Reveal>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <Reveal className="mt-24 flex flex-col items-start gap-6 border-t border-white/10 pt-12 md:mt-32 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-white/55">
            Los {TOTAL_AVIONES} aviones son de simulador, no aeronaves reales. Cada uno lleva su propia matrícula
            y la librea que diseñamos para la academia.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to={ROUTES.aventura} variant="secondary">
              <Plane size={16} />
              Ver la Aventura
            </Button>
            <Button to={ROUTES.academia} variant="primary" className="group">
              Comenzar formación
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
