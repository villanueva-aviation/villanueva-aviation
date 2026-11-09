import { textosReporte, type Idioma } from "./idiomaInstructor.ts";
import { MANIOBRAS, type DefManiobra, type ResultadoComun } from "./maniobras.ts";
import { folio, type IntentoManiobra } from "./reglasIntentos.ts";

export { AVISO_REPORTE } from "./idiomaInstructor.ts";

const fecha = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-").replace(/[.,]/g, "");

/**
 * Calificación final con formato de examen práctico, con nuestra marca: sin logos ni formularios oficiales.
 * `intento` es null mientras el intento no se guarda (sin folio todavía).
 */
export function ReporteExamen({
  resultado,
  intento,
  nombre,
  numero,
  idioma = "es",
  def = MANIOBRAS["viraje-escarpado"],
  calificado = "checkride",
}: {
  resultado: Pick<ResultadoComun, "aprobado" | "calificacion" | "elementos" | "nivel">;
  intento: IntentoManiobra | null;
  nombre: string;
  numero?: number;
  idioma?: Idioma;
  def?: DefManiobra;
  /** "intento": maniobras fuera del ACS, sin la palabra checkride. */
  calificado?: "checkride" | "intento";
}) {
  const t = textosReporte(idioma, calificado);
  const ns = def.elementosReporte(resultado.nivel).filter((e) => resultado.elementos[e.codigo] === "NS").map((e) => e.codigo);
  const gris = "text-[#6b6457]";
  return (
    <article className="reporte-examen mx-auto max-w-xl rounded-lg bg-[#f6f3ea] p-5 font-serif text-[13px] leading-snug text-[#1d1f22] sm:p-6">
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .reporte-examen, .reporte-examen * { visibility: visible !important; }
        .reporte-examen { position: absolute; left: 0; top: 0; width: 100%; max-width: none; border-radius: 0; }
        .reporte-examen .no-imprimir { display: none !important; }
      }`}</style>
      <div className="flex justify-between gap-3 border-b-2 border-[#1d1f22] pb-1.5">
        <b className="tracking-[.06em]">VILLANUEVA AVIATION</b>
        <span>{t.instructor}</span>
      </div>
      <h3 className="mt-3 text-center text-base font-bold tracking-[.04em]">{t.titulo(resultado.aprobado)}</h3>
      <p className={`mb-3 text-center text-[11px] ${gris}`}>{t.subtitulo}</p>
      <dl className="mb-3 grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-0.5 text-xs">
        <dt className={gris}>{t.aspirante}</dt>
        <dd>{nombre}</dd>
        <dt className={gris}>{t.fecha}</dt>
        <dd>{fecha(intento?.created_at ?? new Date().toISOString(), t.locale)}</dd>
        <dt className={gris}>{t.aeronave}</dt>
        <dd>{intento?.avion ?? "C172"}</dd>
        {numero !== undefined && (
          <>
            <dt className={gris}>{t.intento}</dt>
            <dd>{numero}</dd>
          </>
        )}
      </dl>
      <p className="mb-1 font-bold">{def.tarea[idioma]}</p>
      <table className="w-full border-collapse text-xs">
        <tbody>
          {def.elementosReporte(resultado.nivel).map((e) => (
            <tr key={e.codigo} className="border-b border-[#c9c1ae] last:border-0">
              <td className="py-1 pr-2 whitespace-nowrap">{e.codigo}</td>
              <td className="py-1 pr-2">{idioma === "en" ? e.textoEn : e.texto}</td>
              <td className={`py-1 text-right ${resultado.elementos[e.codigo] === "NS" ? "font-bold text-[#a3271a]" : ""}`}>
                {resultado.elementos[e.codigo]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {resultado.aprobado ? (
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="text-xs">
            {t.calificacion}: <b>{resultado.calificacion}/100</b>
            <br />
            {t.folio}: {intento ? folio(intento.id) : t.sinFolio}
          </div>
          {intento?.revision === "aprobado" && (
            <div className="w-36 border-t border-[#1d1f22] pt-0.5 text-center text-[11px]">{t.reviso}</div>
          )}
        </div>
      ) : (
        <div className="mt-3 border border-[#a3271a] p-2 text-xs text-[#a3271a]">
          <b>{t.reexaminar}</b> {ns.join(", ")}
        </div>
      )}
      <p className={`mt-3 text-[10px] ${gris}`}>{t.aviso}</p>
      <div className="no-imprimir mt-4 text-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-[#1d1f22] px-4 py-1.5 font-sans text-xs font-semibold [@media(hover:hover)]:hover:bg-[#1d1f22] [@media(hover:hover)]:hover:text-[#f6f3ea]"
        >
          {t.pdf}
        </button>
      </div>
    </article>
  );
}
