import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../../components/layout/PageHero";
import { Container } from "../../components/ui/Container";
import { ChecklistInteractive } from "./ChecklistInteractive";
import { FlowDiagram } from "./FlowDiagram";
import { VSpeedsTable } from "./VSpeedsTable";
import type { ChecklistFase } from "../../data/checklistC172";
import type { Flujo, VSpeed } from "../../data/checklistPremium";
import { ROUTES } from "../../lib/routes";

export function PremiumChecklistPage({
  titulo,
  normal,
  emergencia,
  flujos,
  vspeeds,
}: {
  titulo: string;
  normal: ChecklistFase[];
  emergencia: ChecklistFase[];
  flujos: Flujo[];
  vspeeds: VSpeed[];
}) {
  return (
    <div>
      <PageHero
        eyebrow="Contenido de cadetes · Premium"
        title={titulo}
        description="Checklist completo, flujos de memoria para emergencias y V-speeds de referencia — todo en un solo lugar."
      >
        <Link
          to={ROUTES.contenidoExclusivo}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Contenido Exclusivo
        </Link>
      </PageHero>

      <Container className="flex flex-col gap-10 py-12 md:py-16">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">V-speeds de referencia</h2>
          <p className="mt-1.5 text-sm text-white/55">
            Valores genéricos de referencia — confirma los de tu aeronave específica en su POH.
          </p>
          <div className="mt-4">
            <VSpeedsTable vspeeds={vspeeds} />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-white">Flujos de memoria — emergencias</h2>
          <p className="mt-1.5 text-sm text-white/55">
            Secuencias cortas para recitar de memoria en el momento — el checklist completo abajo es para confirmar después.
          </p>
          <div className="mt-4">
            <FlowDiagram flujos={flujos} />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-white">Checklist completo</h2>
          <div className="mt-4">
            <ChecklistInteractive fases={[...normal, ...emergencia]} />
          </div>
        </div>
      </Container>
    </div>
  );
}
