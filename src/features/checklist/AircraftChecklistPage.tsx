import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../../components/layout/PageHero";
import { Container } from "../../components/ui/Container";
import { ChecklistInteractive } from "./ChecklistInteractive";
import type { ChecklistFase } from "../../data/checklistC172";
import { ROUTES } from "../../lib/routes";

type Modo = "normal" | "emergencia";

export function AircraftChecklistPage({
  titulo,
  normal,
  emergencia,
}: {
  titulo: string;
  normal: ChecklistFase[];
  emergencia: ChecklistFase[];
}) {
  const [modo, setModo] = useState<Modo>("normal");

  return (
    <div>
      <PageHero
        eyebrow="Checklist interactivo"
        title={titulo}
        description="Toca cada punto para marcarlo conforme lo verificas. Checklist estándar de referencia (motor a carburador, panel clásico) — ajústala a tu aeronave y procedimientos específicos."
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
        <div className="flex gap-2">
          <button
            onClick={() => setModo("normal")}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              modo === "normal"
                ? "border-gold-500 bg-gold-500/15 text-gold-400"
                : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setModo("emergencia")}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              modo === "emergencia"
                ? "border-red-500 bg-red-500/15 text-red-400"
                : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            Emergencia
          </button>
        </div>

        <div className="mt-8">
          <ChecklistInteractive fases={modo === "normal" ? normal : emergencia} />
        </div>
      </Container>
    </div>
  );
}
