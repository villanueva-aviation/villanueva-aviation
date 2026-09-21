import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ROUTES } from "../lib/routes";
import datos from "../data/controles.json";

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

export function Controles() {
  const [id, setId] = useState(datos.equipos[0].id);
  const e = datos.equipos.find((x) => x.id === id) ?? datos.equipos[0];

  return (
    <div>
      <PageHero
        eyebrow="Guía para tu simulador"
        title="Configura tus controles en MSFS"
        description="Asignación recomendada de ejes y botones para joystick y para yoke con quadrante, y los ajustes de zona muerta y sensibilidad que evitan que el avión se vaya solo."
      >
        <Link to={ROUTES.descargas} className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400">
          <ArrowLeft size={15} />
          Volver a Descargas
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <section className="max-w-3xl">
          <h2 className="font-display text-lg font-semibold text-white">Cómo configurarlos, paso a paso</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/70">
            {datos.pasos.map((p) => <li key={p}>{p}</li>)}
          </ol>
        </section>

        <div className="mt-12 flex flex-wrap gap-2">
          {datos.equipos.map((x) => (
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

        <section className="mt-6 flex flex-col gap-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-wide text-white/40">{e.modelos}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{e.intro}</p>
          </div>
          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-white">Ejes</h3>
            <Tabla cab={["Control físico", "Asígnalo a"]} filas={e.ejes.map((x) => [x.control, x.funcion])} />
          </div>
          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-white">Botones e interruptores</h3>
            <Tabla cab={["Control físico", "Asígnalo a"]} filas={e.botones.map((x) => [x.control, x.funcion])} />
          </div>
          <div className="max-w-3xl">
            <h3 className="font-display text-base font-semibold text-white">Consejos para este equipo</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70">
              {e.consejos.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-lg font-semibold text-white">Zona muerta y sensibilidad</h2>
          <p className="mt-1.5 max-w-3xl text-sm text-white/55">Punto de partida para cualquier mando. Ajústalo a tu equipo: uno nuevo necesita menos zona muerta que uno con años de uso.</p>
          <div className="mt-4">
            <Tabla cab={["Eje", "Zona muerta", "Sensibilidad"]} filas={datos.ajustes.map((a) => [a.eje, a.zona, a.sens])} />
          </div>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-lg font-semibold text-white">Errores comunes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70">
            {datos.errores.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-white/45">
            Recomendaciones generales para MSFS 2020 y 2024. Los menús y nombres de comandos pueden variar con la versión y el idioma, y cada modelo de mando tiene sus propios botones: usa esta guía como punto de partida.
          </p>
        </section>
      </Container>
    </div>
  );
}
