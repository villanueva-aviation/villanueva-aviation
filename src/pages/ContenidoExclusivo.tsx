import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { LockedOverlay } from "../components/ui/LockedOverlay";
import { Reveal } from "../components/ui/Reveal";
import { CONTENIDO_EXCLUSIVO } from "../data/exclusivo";
import { useAuth } from "../features/auth/AuthContext";

export function ContenidoExclusivo() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <PageHero
        eyebrow="Contenido Exclusivo"
        title="La biblioteca privada de la Academia"
        description="Clases especiales, guías avanzadas y procedimientos disponibles únicamente para cadetes de Villanueva Aviation."
      />

      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENIDO_EXCLUSIVO.map((item, i) => {
            const card = (
              <Reveal
                key={item.id}
                delay={i * 100}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                {!isAuthenticated && <LockedOverlay label="Contenido de cadetes" />}
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      isAuthenticated ? "group-hover:scale-105" : "scale-105 blur-sm"
                    }`}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Badge tone="gold">{item.tipo}</Badge>
                  <h3 className="mt-3 font-display text-base font-semibold text-white">{item.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{item.descripcion}</p>
                  <p className="mt-3 text-xs text-white/40">{item.duracion}</p>
                  {isAuthenticated && item.interactivoHref && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400">
                      Abrir
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </Reveal>
            );

            if (isAuthenticated && item.interactivoHref) {
              return (
                <Link key={item.id} to={item.interactivoHref}>
                  {card}
                </Link>
              );
            }
            return card;
          })}
        </div>
      </Container>
    </div>
  );
}
