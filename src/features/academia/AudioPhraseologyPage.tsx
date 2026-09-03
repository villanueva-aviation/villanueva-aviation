import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../../components/layout/PageHero";
import { Container } from "../../components/ui/Container";
import { AudioPhraseology, type PhraseologyCard } from "./AudioPhraseology";
import { ROUTES } from "../../lib/routes";

export function AudioPhraseologyPage({
  titulo,
  descripcion,
  cards,
}: {
  titulo: string;
  descripcion: string;
  cards: PhraseologyCard[];
}) {
  return (
    <div>
      <PageHero eyebrow="Contenido de cadetes · Premium" title={titulo} description={descripcion}>
        <Link
          to={ROUTES.contenidoExclusivo}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Contenido Exclusivo
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <AudioPhraseology cards={cards} />
      </Container>
    </div>
  );
}
