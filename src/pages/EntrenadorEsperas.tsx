import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { EntrenadorEsperas } from "../features/entrenador/EntrenadorEsperas";
import { ROUTES } from "../lib/routes";

export function EntrenadorEsperasPage() {
  return (
    <div>
      <PageHero
        eyebrow="Entrenador"
        title="¿Qué entrada haces a la espera?"
        description="Te damos la espera y el rumbo con el que llegas al fijo. Elige la entrada: directa, gota o paralela. En una evaluación, decidir en menos de 15 segundos importa tanto como acertar."
      />
      <Container className="py-12 md:py-16">
        <EntrenadorEsperas />

        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-white/45">
          Los sectores siguen el AIM 5-3-8 de la FAA (directa 180°, gota 70°, paralela 110°). Las preguntas evitan rumbos pegados a una
          frontera. Tu instructor puede usar otro diagrama o variantes: confirma con él. Herramienta de práctica, no instrucción certificada.
        </p>

        <div className="mt-12 rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-semibold text-white">Esto es una parte de la Academia</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
            VOR, arcos DME, esperas e IFR explicados paso a paso, con práctica en cada módulo. Gratis y en español.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to={ROUTES.empieza}>
              Empieza gratis <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
