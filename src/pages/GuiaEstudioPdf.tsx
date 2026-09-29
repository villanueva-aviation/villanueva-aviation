import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Lock } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import { fuenteDe } from "../features/examenesTipo/GuiaEstudio";
import { examenTipo, nombreCorto, REGLAS_EXAMEN_TIPO } from "../data/examenesTipo";
import type { TablaReferencia } from "../data/checklistAviones";
import type { ChecklistFase } from "../data/checklistC172";
import { ROUTES } from "../lib/routes";
import { NotFound } from "./NotFound";

const h2 = "mt-8 break-after-avoid border-b-2 border-[#0b1d34] pb-1 font-display text-lg font-bold text-[#0b1d34]";

function Tabla({ columnas, filas }: { columnas: string[]; filas: string[][] }) {
  return (
    <table className="mt-3 w-full border-collapse text-sm">
      <thead>
        <tr>
          {columnas.map((c) => (
            <th key={c} className="border-b border-slate-400 py-1.5 pr-3 text-left text-xs uppercase tracking-wide text-slate-500">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((f, i) => (
          <tr key={i} className="break-inside-avoid border-b border-slate-200">
            {f.map((c, j) => (
              <td key={j} className={`py-1.5 pr-3 align-top ${j === 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Referencia({ tabla }: { tabla: TablaReferencia }) {
  return (
    <>
      <h3 className="mt-5 text-sm font-semibold text-[#9a7b2f]">{tabla.titulo}</h3>
      <p className="mt-1 text-xs text-slate-500">{tabla.nota}</p>
      <Tabla columnas={tabla.columnas} filas={tabla.filas} />
    </>
  );
}

function Fases({ fases }: { fases: ChecklistFase[] }) {
  return (
    <>
      {fases.map((f) => (
        <div key={f.id} className="mt-4 break-inside-avoid">
          <h3 className="text-sm font-semibold text-[#9a7b2f]">{f.titulo}</h3>
          <ul className="mt-1.5 grid gap-1.5">
            {f.items.map((i) => (
              <li key={i.id} className="text-sm text-slate-800">
                ☐ {i.texto}
                {i.porque && <span className="block pl-5 text-xs text-slate-500">{i.porque}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Versión imprimible de la guía de estudio de un avión: el navegador la guarda como PDF. Mismo acceso que su examen. */
export function GuiaEstudioPdf() {
  const { clave } = useParams();
  const examen = examenTipo(clave);
  const { hasAccess, loading } = usePremiumAccess();
  const f = examen ? fuenteDe(examen.clave) : null;

  if (!examen || !f) return <NotFound />;
  if (loading) return null;
  if (!examen.gratis && !hasAccess) {
    return (
      <Container className="max-w-xl py-20 text-center">
        <Lock size={28} className="mx-auto text-gold-400" />
        <h1 className="mt-4 font-display text-xl font-semibold text-white">Esta guía es parte de Contenido Exclusivo</h1>
        <Button to={ROUTES.contenidoExclusivo} className="mt-6">Ver Contenido Exclusivo</Button>
      </Container>
    );
  }

  const corto = nombreCorto(examen);
  const volver = ROUTES.examenTipo(examen.clave);

  return (
    <Container className="max-w-4xl py-10 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link to={volver} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-gold-400">
          <ArrowLeft size={14} /> Volver al examen
        </Link>
        <Button onClick={() => window.print()}>
          <Download size={16} /> Descargar PDF
        </Button>
      </div>
      <p className="mt-3 text-xs text-white/45 print:hidden">En la ventana de impresión elige "Guardar como PDF" como destino.</p>

      <article className="mt-6 rounded-2xl bg-white p-8 text-slate-900 md:p-12 print:mt-0 print:rounded-none print:p-0">
        <header className="flex items-center justify-between gap-6 border-b border-slate-300 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7b2f]">Villanueva Aviation · Guía de estudio</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[#0b1d34]">Experto en {corto}</h1>
            <p className="mt-1 text-sm text-slate-600">{examen.modelo} · examen teórico de {examen.preguntas.length} preguntas</p>
          </div>
          <img src="/images/logo-mark.png" alt="" className="h-16 w-16 object-contain" />
        </header>

        <p className="mt-4 text-sm text-slate-700">
          El examen toma {REGLAS_EXAMEN_TIPO.preguntasPorIntento} preguntas de todas las áreas y se aprueba con {REGLAS_EXAMEN_TIPO.aprobacion} %. Todo lo que
          pregunta sale de estos datos, los mismos del checklist del avión.
        </p>

        <h2 className={h2}>1. Velocidades</h2>
        {f.notaVspeeds && <p className="mt-2 text-xs text-slate-500">{f.notaVspeeds}</p>}
        <Tabla columnas={["Clave", "Velocidad", "Valor"]} filas={f.vspeeds.map((v) => [v.clave, v.nombre, v.valor])} />

        {(f.limites || f.potencia) && (
          <>
            <h2 className={h2}>2. Limitaciones</h2>
            {f.limites && <Referencia tabla={f.limites} />}
            {f.potencia && <Referencia tabla={f.potencia} />}
          </>
        )}

        {f.sistemas && f.sistemas.length > 0 && (
          <>
            <h2 className={h2}>3. Sistemas</h2>
            {f.sistemas.map((s) => (
              <div key={s.titulo} className="mt-4 break-inside-avoid">
                <h3 className="text-sm font-semibold text-[#9a7b2f]">{s.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.texto}</p>
              </div>
            ))}
          </>
        )}

        {f.flujos.length > 0 && (
          <>
            <h2 className={h2}>4. Flujos de memoria</h2>
            <p className="mt-2 text-xs text-slate-500">Se recitan sin leer; el checklist es para confirmar después.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
              {f.flujos.map((fl) => (
                <div key={fl.id} className="break-inside-avoid rounded-lg border border-slate-300 p-3">
                  <h3 className="text-sm font-semibold text-[#0b1d34]">{fl.titulo}</h3>
                  <ol className="mt-1.5 list-decimal pl-5 text-sm text-slate-700">
                    {fl.pasos.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className={h2}>5. Procedimientos normales</h2>
        <Fases fases={f.normal} />

        {f.emergencia.length > 0 && (
          <>
            <h2 className={h2}>6. Emergencias</h2>
            <Fases fases={f.emergencia} />
          </>
        )}

        <footer className="mt-10 border-t border-slate-300 pt-4 text-xs text-slate-500">
          Reconocimiento interno de Villanueva Aviation para entrenamiento en simulador. No es una habilitación oficial ni sustituye una licencia.
          El checklist oficial es el del manual del avión y el de tu simulador: si difieren, mandan los suyos.
        </footer>
      </article>
    </Container>
  );
}
