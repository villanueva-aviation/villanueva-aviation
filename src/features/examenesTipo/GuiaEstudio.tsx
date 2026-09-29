import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, Download } from "lucide-react";
import { ROUTES } from "../../lib/routes";
import { VSpeedsTable } from "../checklist/VSpeedsTable";
import { TablaReferencia } from "../checklist/TablaReferencia";
import { FlowDiagram } from "../checklist/FlowDiagram";
import { AVIONES_CHECKLIST, type Sistema, type TablaReferencia as Tabla } from "../../data/checklistAviones";
import { CHECKLIST_C152_EMERGENCIA, CHECKLIST_C152_NORMAL, LIMITES_C152, SISTEMAS_C152 } from "../../data/checklistC152";
import { CHECKLIST_EMERGENCIA, CHECKLIST_NORMAL, LIMITES_C172, SISTEMAS_C172, type ChecklistFase } from "../../data/checklistC172";
import { FLUJOS_C152, FLUJOS_C172, VSPEEDS_C152, VSPEEDS_C172, type Flujo, type VSpeed } from "../../data/checklistPremium";
import type { AreaExamen, PreguntaTipo } from "../../data/examenesTipo";

interface Fuente {
  vspeeds: VSpeed[];
  notaVspeeds?: string;
  limites?: Tabla;
  potencia?: Tabla;
  sistemas?: Sistema[];
  flujos: Flujo[];
  normal: ChecklistFase[];
  emergencia: ChecklistFase[];
}

/** Los mismos datos de los checklists del sitio: así la guía nunca contradice al examen. */
export function fuenteDe(clave: string): Fuente | null {
  if (clave === "c152") {
    return {
      vspeeds: VSPEEDS_C152,
      notaVspeeds: "Valores del POH del Cessna 152, en KIAS.",
      limites: LIMITES_C152,
      sistemas: SISTEMAS_C152,
      flujos: FLUJOS_C152,
      normal: CHECKLIST_C152_NORMAL,
      emergencia: CHECKLIST_C152_EMERGENCIA,
    };
  }
  if (clave === "c172") {
    return {
      vspeeds: VSPEEDS_C172,
      notaVspeeds: "Valores del POH del Cessna 172S, en KIAS.",
      limites: LIMITES_C172,
      sistemas: SISTEMAS_C172,
      flujos: FLUJOS_C172,
      normal: CHECKLIST_NORMAL,
      emergencia: CHECKLIST_EMERGENCIA,
    };
  }
  return AVIONES_CHECKLIST[clave] ?? null;
}

function Seccion({ titulo, preguntas, children }: { titulo: string; preguntas: number; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.03]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden">
        <span className="font-display text-sm font-semibold text-white">{titulo}</span>
        <span className="flex items-center gap-3 text-xs text-white/45">
          {preguntas} preguntas en el banco
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-white/10 p-5">{children}</div>
    </details>
  );
}

function ListaFases({ fases }: { fases: ChecklistFase[] }) {
  return (
    <div className="grid gap-4">
      {fases.map((f) => (
        <div key={f.id}>
          <h4 className="text-sm font-semibold text-gold-400">{f.titulo}</h4>
          <ul className="mt-2 grid gap-2">
            {f.items.map((i) => (
              <li key={i.id} className="text-sm text-white/75">
                {i.texto}
                {i.porque && <span className="block text-xs text-white/45">{i.porque}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Guía de estudio del examen de un avión: cada sección corresponde a un área del examen. */
export function GuiaEstudio({ clave, preguntas, checklistHref }: { clave: string; preguntas: PreguntaTipo[]; checklistHref?: string }) {
  const f = fuenteDe(clave);
  if (!f) return null;
  const cuantas = (area: AreaExamen) => preguntas.filter((p) => p.area === area).length;
  const bimotor = cuantas("Motor inoperativo") > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
        <BookOpen size={18} className="text-gold-400" /> Guía de estudio
      </h2>
      <p className="mt-2 text-sm text-white/60">
        Todo lo que pregunta el examen sale de estos datos, los mismos del checklist del avión. Abre cada área y estúdiala antes de
        presentarlo.
      </p>

      <div className="mt-5 grid gap-3">
        <Seccion titulo="Velocidades" preguntas={cuantas("Velocidades")}>
          {f.notaVspeeds && <p className="text-xs text-white/45">{f.notaVspeeds}</p>}
          <VSpeedsTable vspeeds={f.vspeeds} />
        </Seccion>

        {(f.limites || f.potencia) && (
          <Seccion titulo="Limitaciones" preguntas={cuantas("Limitaciones")}>
            {f.limites && <TablaReferencia tabla={f.limites} />}
            {f.potencia && (
              <>
                <h4 className="text-sm font-semibold text-gold-400">{f.potencia.titulo}</h4>
                <TablaReferencia tabla={f.potencia} />
              </>
            )}
          </Seccion>
        )}

        {f.sistemas && f.sistemas.length > 0 && (
          <Seccion titulo="Sistemas" preguntas={cuantas("Sistemas")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {f.sistemas.map((s) => (
                <div key={s.titulo} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <h4 className="text-sm font-semibold text-gold-400">{s.titulo}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{s.texto}</p>
                </div>
              ))}
            </div>
          </Seccion>
        )}

        <Seccion titulo="Procedimientos normales" preguntas={cuantas("Procedimientos normales")}>
          <ListaFases fases={f.normal} />
        </Seccion>

        <Seccion
          titulo={bimotor ? "Emergencias y motor inoperativo" : "Emergencias"}
          preguntas={cuantas("Emergencias") + cuantas("Motor inoperativo")}
        >
          {f.flujos.length > 0 && (
            <>
              <p className="text-xs text-white/45">Los flujos de memoria primero: se recitan sin leer.</p>
              <FlowDiagram flujos={f.flujos} />
            </>
          )}
          <ListaFases fases={f.emergencia} />
        </Seccion>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
        <Link to={ROUTES.guiaEstudioPdf(clave)} className="inline-flex items-center gap-1.5 text-gold-400 hover:underline">
          <Download size={15} /> Descargar la guía en PDF
        </Link>
        {checklistHref && (
          <Link to={checklistHref} className="text-gold-400 hover:underline">
            Abrir el checklist interactivo del avión
          </Link>
        )}
      </div>
    </div>
  );
}
