import { MessageCircle, Radio, Trophy, Users } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { FeatureCard } from "../components/ui/FeatureCard";
import { Reveal } from "../components/ui/Reveal";
import { DISCORD_URL } from "../lib/constants";

const PILARES = [
  {
    icon: Users,
    titulo: "Comunidad activa",
    descripcion: "Pilotos, controladores y estudiantes compartiendo conocimiento a diario.",
  },
  {
    icon: Radio,
    titulo: "Canales de voz",
    descripcion: "Espacios en vivo para vuelos comunitarios y prácticas de ATC.",
  },
  {
    icon: Trophy,
    titulo: "Eventos y actividades",
    descripcion: "Tours, sesiones de práctica y actividades especiales cada semana.",
  },
];

export function Comunidad() {
  return (
    <div>
      <PageHero
        eyebrow="Comunidad"
        title="La formación continúa fuera del aula"
        description="Discord es nuestro espacio complementario de comunidad: resuelve dudas, comparte vuelos, participa en eventos y recibe soporte entre cadetes e instructores."
      >
        <Button href={DISCORD_URL} variant="primary">
          <MessageCircle size={16} />
          Unirme al Discord
        </Button>
      </PageHero>

      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILARES.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 100}>
              <FeatureCard icon={p.icon} title={p.titulo} description={p.descripcion} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 rounded-3xl border border-gold-500/20 bg-gradient-to-br from-navy-900 to-navy-800 px-8 py-14 text-center md:px-16">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            ¿Listo para despegar con nosotros?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/65">
            Entra a nuestro servidor de Discord y preséntate en el canal de bienvenida.
          </p>
          <div className="mt-7 flex justify-center">
            <Button href={DISCORD_URL} variant="primary">
              <MessageCircle size={16} />
              Unirse a Discord
            </Button>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
