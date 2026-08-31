import { useState } from "react";
import { Download } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { CATEGORIAS_DESCARGAS, RECURSOS_DESCARGAS } from "../data/descargas";
import { Reveal } from "../components/ui/Reveal";

export function Descargas() {
  const [categoria, setCategoria] = useState<string>("Todos");
  const recursos =
    categoria === "Todos" ? RECURSOS_DESCARGAS : RECURSOS_DESCARGAS.filter((r) => r.categoria === categoria);

  return (
    <div>
      <PageHero
        eyebrow="Centro de Descargas"
        title="Biblioteca digital de recursos"
        description="Dashboards de SimHub, checklists, guías y plantillas para acompañar tu formación y tus vuelos de práctica."
      />

      <Container className="py-16 md:py-24">
        <div className="flex flex-wrap gap-2">
          {["Todos", ...CATEGORIAS_DESCARGAS].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                categoria === cat
                  ? "border-gold-500 bg-gold-500/15 text-gold-400"
                  : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recursos.map((r, i) => (
            <Reveal key={r.id} delay={i * 80} className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="aspect-video w-full overflow-hidden">
                <img src={r.imagen} alt={r.nombre} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="font-display text-xs font-semibold uppercase tracking-wide text-gold-500">
                  {r.categoria}
                </span>
                <h3 className="mt-2 font-display text-base font-semibold text-white">{r.nombre}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{r.descripcion}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                  <span>{r.version}</span>
                  <span>{r.fecha}</span>
                </div>
                <button
                  disabled
                  title="Disponible próximamente"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm font-semibold text-white/40 cursor-not-allowed"
                >
                  <Download size={15} /> Disponible próximamente
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
