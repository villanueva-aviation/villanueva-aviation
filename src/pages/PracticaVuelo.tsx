import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ManiobrasChecklist } from "../features/practica/ManiobrasChecklist";
import { ROUTES } from "../lib/routes";

export function PracticaVuelo() {
  return (
    <div>
      <PageHero
        eyebrow="Contenido de cadetes · Premium"
        title="Práctica de vuelo — progresión de maniobras"
        description="La teoría de Academia te prepara para esto: la secuencia real de maniobras que practicarás en el aire con tu instructor, del primer vuelo de familiarización hasta las tomas y despegues antes de volar solo."
      >
        <Link
          to={ROUTES.contenidoExclusivo}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Contenido Exclusivo
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <ManiobrasChecklist />
      </Container>
    </div>
  );
}
