import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { SECCIONES, seccion, type Seccion, type Tarjeta } from "../data/secciones";
import { useAuth } from "../features/auth/AuthContext";
import { ROUTES } from "../lib/routes";

const externo = (to: string) => to.startsWith("http");

function TarjetaSeccion({ t }: { t: Tarjeta }) {
  const contenido = (
    <>
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={t.img.src}
          srcSet={t.img.srcSet}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          alt={t.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-lg font-semibold text-white">{t.titulo}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">{t.texto}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400">
          {externo(t.to) ? (
            <>
              Abrir sitio <ArrowUpRight size={14} />
            </>
          ) : (
            <>
              Abrir <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </span>
      </div>
    </>
  );
  const clase =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-gold-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60";
  return externo(t.to) ? (
    <a href={t.to} target="_blank" rel="noopener noreferrer" className={clase}>
      {contenido}
    </a>
  ) : (
    <Link to={t.to} className={clase}>
      {contenido}
    </Link>
  );
}

export function TarjetasSeccion({ tarjetas }: { tarjetas: Tarjeta[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tarjetas.map((t) => (
        <TarjetaSeccion key={t.titulo} t={t} />
      ))}
    </div>
  );
}

/** Las otras secciones, al pie de cada una, para moverse sin volver al menú. */
export function OtrasSecciones({ actual }: { actual: Seccion["clave"] }) {
  return (
    <div className="mt-16 border-t border-white/10 pt-10">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Otras secciones</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {SECCIONES.filter((s) => s.clave !== actual).map((s) => (
          <Link
            key={s.clave}
            to={s.to}
            className="group rounded-xl border border-white/10 px-5 py-4 transition-colors duration-200 hover:border-gold-500/40"
          >
            <span className="flex items-center justify-between font-display text-base font-semibold text-white">
              {s.nombre} <ArrowRight size={15} className="text-gold-400 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-white/50">{s.resumen}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SeccionPage({ clave }: { clave: "vuela" | "hangar" | "aprende" }) {
  const s = seccion(clave);
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <PageHero eyebrow={s.nombre} title={s.titulo} description={s.descripcion} />
      <Container className="py-12 md:py-16">
        <TarjetasSeccion tarjetas={s.tarjetas} />
        {clave === "aprende" && isAuthenticated && (
          <p className="mt-8 text-sm text-white/60">
            ¿Ya estudias en la Academia?{" "}
            <Link to={ROUTES.miFormacion} className="font-medium text-gold-400 hover:text-gold-300">
              Ve a Mi Formación
            </Link>
          </p>
        )}
        <OtrasSecciones actual={clave} />
      </Container>
    </div>
  );
}
