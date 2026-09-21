import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ROUTES } from "../lib/routes";
import datos from "../data/paneles.json";

const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-white/50";
const td = "px-3 py-2 text-sm text-white/75";

function Tabla({ cab, filas }: { cab: string[]; filas: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[420px]">
        <thead className="bg-white/[0.04]">
          <tr>{cab.map((c) => <th key={c} className={th}>{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filas.map((f) => (
            <tr key={f[0]}>{f.map((c, i) => <td key={i} className={i === 0 ? `${td} font-medium text-white` : td}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Lista = ({ items, ordenada }: { items: string[]; ordenada?: boolean }) => {
  const Tag = ordenada ? "ol" : "ul";
  return (
    <Tag className={`mt-3 space-y-2 pl-5 text-sm leading-relaxed text-white/70 ${ordenada ? "list-decimal" : "list-disc"}`}>
      {items.map((x) => <li key={x}>{x}</li>)}
    </Tag>
  );
};

export function Paneles() {
  const [id, setId] = useState(datos.herramientas[0].id);
  const h = datos.herramientas.find((x) => x.id === id) ?? datos.herramientas[0];

  return (
    <div>
      <PageHero
        eyebrow="Guía para tu simulador"
        title="Paneles y dashboards para MSFS"
        description="Qué herramienta usar para ver tus instrumentos, datos y mapa en una segunda pantalla o una tablet, y cómo configurarla paso a paso."
      >
        <Link to={ROUTES.descargas} className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400">
          <ArrowLeft size={15} />
          Volver a Descargas
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <section>
          <h2 className="font-display text-lg font-semibold text-white">¿Qué quieres lograr?</h2>
          <div className="mt-4">
            <Tabla cab={["Quiero", "Usa"]} filas={datos.elige.map((x) => [x.quiero, x.usa])} />
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-2">
          {datos.herramientas.map((x) => (
            <button
              key={x.id}
              onClick={() => setId(x.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                id === x.id ? "border-gold-500 bg-gold-500/15 text-gold-400" : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {x.nombre}
            </button>
          ))}
        </div>

        <section className="mt-6 flex max-w-3xl flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">{h.costo}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{h.intro}</p>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">Qué necesitas</h3>
            <Lista items={h.requisitos} />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">Paso a paso</h3>
            <Lista items={h.pasos} ordenada />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">Consejos</h3>
            <Lista items={h.consejos} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-lg font-semibold text-white">Qué mostrar en un dashboard de Cessna 172</h2>
          <p className="mt-1.5 max-w-3xl text-sm text-white/55">Un punto de partida para una tablet o una segunda pantalla: pocos datos, siempre a la vista.</p>
          <div className="mt-4">
            <Tabla cab={["Dato", "Por qué"]} filas={datos.c172.map((x) => [x.dato, x.porque])} />
          </div>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-lg font-semibold text-white">Errores comunes</h2>
          <Lista items={datos.errores} />
          <p className="mt-6 text-xs leading-relaxed text-white/45">
            Guía general para MSFS 2020 y 2024. Las funciones, los precios y los pasos de cada herramienta cambian con las versiones: confírmalos en el sitio oficial de cada una antes de instalar.
          </p>
        </section>
      </Container>
    </div>
  );
}
