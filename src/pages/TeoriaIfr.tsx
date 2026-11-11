import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "../components/ui/Button";
import { HSI } from "../features/landing/HSI";
import type { Idioma } from "../features/instructor/idiomaInstructor";
import { TEORIA_IFR, type TemaIfr } from "../data/teoriaIfr";
import { ROUTES } from "../lib/routes";

const T = {
  es: { volver: "Menú IFR", imprimir: "Imprimir o guardar PDF", pdf: "En la ventana de impresión elige «Guardar como PDF» como destino.", noExiste: "Este tema todavía no tiene teoría." },
  en: { volver: "IFR menu", imprimir: "Print or save PDF", pdf: "In the print window choose «Save as PDF» as the destination.", noExiste: "This topic has no theory yet." },
};

function leerIdioma(): Idioma {
  try {
    return localStorage.getItem("instructor-idioma") === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

/** La teoría de un tema IFR con su HSI dibujado; la misma página se imprime en blanco. */
export function TeoriaIfr() {
  const tema = useParams().tema;
  const [idioma] = useState<Idioma>(leerIdioma);
  const t = T[idioma];
  const teoria = tema && tema in TEORIA_IFR ? TEORIA_IFR[tema as TemaIfr] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={ROUTES.instructorIfr} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {t.volver}
        </Link>
        {teoria && (
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4" /> {t.imprimir}
          </Button>
        )}
      </div>
      {teoria && <p className="mt-2 text-xs text-white/45 print:hidden">{t.pdf}</p>}
      {!teoria ? (
        <p className="mt-6 text-white">{t.noExiste}</p>
      ) : (
        <article className="mt-4 rounded-2xl bg-white p-6 text-slate-900 md:p-10 print:mt-0 print:rounded-none print:p-0">
          <h1 className="font-display text-2xl font-bold text-[#0b1d34]">{teoria.titulo[idioma]}</h1>
          {teoria.secciones.map((s) => (
            <section key={s.titulo.es} className="mt-6 break-inside-avoid sm:flex sm:items-start sm:gap-5">
              <div className="min-w-0 flex-1">
                <h2 className="border-b-2 border-[#0b1d34] pb-1 font-display text-lg font-bold text-[#0b1d34]">{s.titulo[idioma]}</h2>
                <p className="mt-2 text-sm leading-relaxed">{s.texto[idioma]}</p>
              </div>
              {s.hsi && (
                <div className="mx-auto mt-3 w-40 shrink-0 sm:mt-0">
                  <HSI rumbo={s.hsi.rumbo} curso={s.hsi.curso} desviacion={s.hsi.desviacion} marcador={s.hsi.rumbo} />
                </div>
              )}
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
