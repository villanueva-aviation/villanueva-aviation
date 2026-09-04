import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { AudioPhraseology } from "../features/academia/AudioPhraseology";
import { CHECKRIDE_ORAL } from "../data/checkrideOral";
import { ROUTES } from "../lib/routes";

export function SimulacroOral() {
  return (
    <div>
      <PageHero
        eyebrow="Contenido de cadetes · Premium"
        title="Simulacro de examen oral PPL"
        description="Preguntas reales de examinador por área de conocimiento. Piensa tu respuesta en voz alta antes de revisar la respuesta modelo."
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
        <AudioPhraseology
          cards={CHECKRIDE_ORAL}
          labels={{
            unidad: "Pregunta",
            unidadPlural: "preguntas",
            escuchar: "Escuchar respuesta modelo",
            mostrar: "Mostrar respuesta modelo",
            siguiente: "Siguiente pregunta",
            terminar: "Terminar simulacro",
          }}
        />
      </Container>
    </div>
  );
}
