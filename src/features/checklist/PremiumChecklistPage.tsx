import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../../components/layout/PageHero";
import { Container } from "../../components/ui/Container";
import { ChecklistInteractive } from "./ChecklistInteractive";
import { FlowDiagram } from "./FlowDiagram";
import { VSpeedsTable } from "./VSpeedsTable";
import { TablaReferencia } from "./TablaReferencia";
import { PanelDiagram } from "./PanelDiagram";
import type { ChecklistFase } from "../../data/checklistC172";
import type { Flujo, VSpeed } from "../../data/checklistPremium";
import type { Sistema, TablaReferencia as Tabla } from "../../data/checklistAviones";
import type { PanelDiagramaData } from "../../data/panelesAviones";
import { ROUTES } from "../../lib/routes";

export function PremiumChecklistPage({
  titulo,
  normal,
  emergencia,
  flujos,
  vspeeds,
  notaVspeeds = "Valores genéricos de referencia — confirma los de tu aeronave específica en su POH.",
  potencia,
  limites,
  sistemas,
  panel,
  descripcion = "Checklist completo, flujos de memoria para emergencias y V-speeds de referencia — todo en un solo lugar.",
}: {
  titulo: string;
  normal: ChecklistFase[];
  emergencia: ChecklistFase[];
  flujos: Flujo[];
  vspeeds: VSpeed[];
  notaVspeeds?: string;
  potencia?: Tabla;
  limites?: Tabla;
  sistemas?: Sistema[];
  panel?: PanelDiagramaData;
  descripcion?: string;
}) {
  return (
    <div>
      <PageHero
        eyebrow="Contenido de cadetes · Premium"
        title={titulo}
        description={descripcion}
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
          <p className="mt-1.5 text-sm text-white/55">{notaVspeeds}</p>
          <div className="mt-4">
            <VSpeedsTable vspeeds={vspeeds} />
          </div>
        </div>

        {potencia && (
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{potencia.titulo}</h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/55">{potencia.nota}</p>
            <div className="mt-4">
              <TablaReferencia tabla={potencia} />
            </div>
          </div>
        )}

        {limites && (
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{limites.titulo}</h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/55">{limites.nota}</p>
            <div className="mt-4">
              <TablaReferencia tabla={limites} />
            </div>
          </div>
        )}

        {sistemas && sistemas.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Sistemas clave</h2>
            <p className="mt-1.5 text-sm text-white/55">Cómo funciona el avión, no solo qué hacer con él.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {sistemas.map((s) => (
                <div key={s.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-display text-sm font-semibold text-gold-400">{s.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{s.texto}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {panel && (
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Diagrama del panel</h2>
            <p className="mt-1.5 text-sm text-white/55">
              Ubica cada control antes de volar — pasa de la teoría del checklist a reconocerlo en la cabina.
            </p>
            <div className="mt-4">
              <PanelDiagram panel={panel} />
            </div>
          </div>
        )}

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
