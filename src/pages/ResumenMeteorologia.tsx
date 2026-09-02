import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { TopicExplorer } from "../components/ui/TopicExplorer";
import { flattenTemas } from "../data/moduleContent";
import { ROUTES } from "../lib/routes";

export function ResumenMeteorologia() {
  const temas = flattenTemas("meteorologia") ?? [];

  return (
    <div>
      <PageHero
        eyebrow="Material de estudio"
        title="Resumen de Meteorología Aeronáutica"
        description="Explora cada tema clave y márcalo conforme lo repasas: METAR, TAF, nubes, frentes, turbulencia, wind shear, hielo y altitud de densidad."
      >
        <Link
          to={ROUTES.descargas}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Descargas
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <TopicExplorer temas={temas} />
      </Container>
    </div>
  );
}
