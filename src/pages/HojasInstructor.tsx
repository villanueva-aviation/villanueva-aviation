import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { MANIOBRAS } from "../features/instructor/maniobras";
import { VEL_C172 } from "../features/instructor/tomas";
import { AVIONES_VOZ, type AvionVoz } from "../data/checklistVozAviones";
import { ROUTES } from "../lib/routes";

const h2 = "mt-8 break-after-avoid border-b-2 border-[#0b1d34] pb-1 font-display text-lg font-bold text-[#0b1d34]";
const h3 = "text-sm font-semibold text-[#9a7b2f]";

// Las líneas del briefing que solo tienen sentido en pantalla (botones, plan de la sesión) no van al papel.
const SOLO_PANTALLA = /presiona «|^El plan|^Primero practicas|^En práctica/;

/** Briefings de las maniobras y checklists por voz, con los mismos datos que usa el instructor. El navegador lo guarda como PDF. */
export function HojasInstructor() {
  const [avion, setAvion] = useState<AvionVoz | "todos">("c172");
  const aviones = (Object.keys(AVIONES_VOZ) as AvionVoz[]).filter((a) => avion === "todos" || a === avion);

  return (
    <Container className="max-w-4xl py-10 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link to={ROUTES.descargas} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-gold-400">
          <ArrowLeft size={14} /> Volver a Descargas
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-white/70">
            Checklist del{" "}
            <select value={avion} onChange={(e) => setAvion(e.target.value as AvionVoz | "todos")} className="ml-1 rounded-lg border border-white/15 bg-navy-900 px-2 py-1.5 text-white">
              {(Object.keys(AVIONES_VOZ) as AvionVoz[]).map((a) => (
                <option key={a} value={a}>{AVIONES_VOZ[a].nombre}</option>
              ))}
              <option value="todos">Los tres aviones</option>
            </select>
          </label>
          <Button onClick={() => window.print()}>
            <Download size={16} /> Descargar PDF
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/45 print:hidden">En la ventana de impresión elige "Guardar como PDF" como destino.</p>

      <article className="mt-6 rounded-2xl bg-white p-8 text-slate-900 md:p-12 print:mt-0 print:rounded-none print:p-0">
        <header className="flex items-center justify-between gap-6 border-b border-slate-300 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7b2f]">Villanueva Aviation · Instructor virtual</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-[#0b1d34]">Briefings y checklists por voz</h1>
            <p className="mt-1 text-sm text-slate-600">Para tener a la mano mientras vuelas con el instructor en MSFS 2020.</p>
          </div>
          <img src="/images/logo-mark.png" alt="" className="h-16 w-16 object-contain" />
        </header>

        <h2 className={h2}>1. Repaso general (C172)</h2>
        <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-sm text-slate-700">
          <li>De rampa a rampa: checklist y rodaje, despegue, 4 maniobras al azar en la zona de trabajo, regreso, aterrizaje y apagado.</li>
          <li>Desde MMGL la zona es Cajititlán (5 NM al sur) o el lago de Chapala (4.5 NM al sur del aeródromo de Chapala, sobre el agua). Entra a 1,500 ft sobre el terreno o más: vuela a 7,000 ft.</li>
          <li>Despegue: rota a {VEL_C172.vr} kt y asciende a Vy, {VEL_C172.vy} kt. Final: {VEL_C172.aprox} kt, −5/+10.</li>
          <li>Si usas slew o el avión salta de lugar, la lección no se califica. Regresa volando.</li>
        </ul>

        <h2 className={h2}>2. Maniobras</h2>
        {Object.values(MANIOBRAS).map((d) => (
          <section key={d.id} className="mt-5 break-inside-avoid">
            <h3 className="font-display text-base font-bold text-[#0b1d34]">{d.titulo.es}</h3>
            <p className="text-xs text-slate-500">{d.tarea.es}</p>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-slate-700">
              {d.briefing("es").filter((l) => !SOLO_PANTALLA.test(l)).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-slate-800">
              <span className="font-semibold">Pasos:</span> {d.pasos(null, "es").map((p) => p.nombre).join(" → ")}
            </p>
            <ul className="mt-2 grid gap-0.5 text-xs text-slate-600">
              {d.elementosReporte.map((e) => (
                <li key={e.codigo}>☐ {e.texto}</li>
              ))}
            </ul>
          </section>
        ))}

        {aviones.map((a, i) => (
          <section key={a} className="break-before-page">
            <h2 className={h2}>{3 + i}. Checklist por voz · {AVIONES_VOZ[a].nombre}</h2>
            <p className="mt-2 text-xs text-slate-500">
              Di «Checklist» y el nombre de la sección para abrirla; luego lee cada punto en voz alta mientras lo haces. Las palabras de cada punto son las que reconoce el micrófono.
            </p>
            <div className="mt-2 columns-1 gap-6 sm:columns-2 print:columns-2">
              {AVIONES_VOZ[a].secciones.map((s) => (
                <div key={s.id} className="mt-4 break-inside-avoid">
                  <h3 className={h3}>«Checklist {s.titulo.toLowerCase()}»</h3>
                  <ul className="mt-1 grid gap-1">
                    {s.puntos.map((p) => (
                      <li key={p.id} className="text-sm text-slate-800">
                        ☐ {p.dicho}
                        {p.nota && <span className="block pl-5 text-xs text-slate-500">{p.nota}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-10 border-t border-slate-300 pt-4 text-xs text-slate-500">
          Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica. Si algo difiere del manual del avión, manda el manual.
        </footer>
      </article>
    </Container>
  );
}
