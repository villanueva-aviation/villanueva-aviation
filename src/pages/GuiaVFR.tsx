import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ChecklistInteractive } from "../features/checklist/ChecklistInteractive";
import { GUIA_VFR } from "../data/guiaVFR";
import { ROUTES } from "../lib/routes";

export function GuiaVFR() {
  return (
    <div>
      <PageHero
        eyebrow="Guía interactiva"
        title="Planificación de vuelo VFR"
        description="Toca cada punto para marcarlo conforme lo completas. Guía de referencia paso a paso — ajústala a tu región y a los procedimientos de tu escuela."
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
        <ChecklistInteractive fases={GUIA_VFR} />
      </Container>
    </div>
  );
}
