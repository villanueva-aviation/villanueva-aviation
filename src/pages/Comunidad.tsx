import { MessageCircle } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { DISCORD_URL } from "../lib/constants";
import { seccion } from "../data/secciones";
import { OtrasSecciones, TarjetasSeccion } from "./Seccion";

export function Comunidad() {
  const s = seccion("comunidad");
  return (
    <div>
      <PageHero eyebrow={s.nombre} title={s.titulo} description={s.descripcion}>
        <Button href={DISCORD_URL} variant="primary">
          <MessageCircle size={16} />
          Unirme al Discord
        </Button>
      </PageHero>

      <Container className="py-12 md:py-16">
        <TarjetasSeccion tarjetas={s.tarjetas} />

        <Reveal className="mt-16 rounded-3xl border border-gold-500/20 bg-gradient-to-br from-navy-900 to-navy-800 px-8 py-14 text-center md:px-16">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">¿Listo para despegar con nosotros?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/65">Entra a nuestro servidor de Discord y preséntate en el canal de bienvenida.</p>
          <div className="mt-7 flex justify-center">
            <Button href={DISCORD_URL} variant="primary">
              <MessageCircle size={16} />
              Unirse a Discord
            </Button>
          </div>
        </Reveal>

        <OtrasSecciones actual="comunidad" />
      </Container>
    </div>
  );
}
