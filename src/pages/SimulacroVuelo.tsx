import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { TopicExplorer } from "../components/ui/TopicExplorer";
import { CHECKRIDE_VUELO } from "../data/checkrideVuelo";
import { ROUTES } from "../lib/routes";

export function SimulacroVuelo() {
  return (
    <div>
      <PageHero
        eyebrow="Contenido de cadetes · Premium"
        title="Simulacro de checkride: maniobras en vuelo"
        description="Estándares de tolerancia por maniobra, estilo ACS, para autoevaluar tus vuelos de práctica antes del examen."
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
        <TopicExplorer temas={CHECKRIDE_VUELO} />
      </Container>
    </div>
  );
}
