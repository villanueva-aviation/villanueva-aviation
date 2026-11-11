import { CRUCE_SEG, INCLINACION_MAX_OCHO, type ResultadoOcho } from "./evaluadorOcho.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolOcho, type Nivel } from "./nivel.ts";

type R = Pick<ResultadoOcho, "aprobado" | "peor" | "fuera" | "objetivo" | "lado" | "cruceSeg"> & { nivel?: Nivel };

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}`;

const filas = (T: ReturnType<typeof tolOcho>): { campo: keyof R["fuera"]; nombre: Record<Idioma, string>; valor: (r: R) => string }[] => [
  { campo: "velocidad", nombre: { es: `Velocidad ±${T.velocidadKt} kt`, en: `Airspeed ±${T.velocidadKt} kt` }, valor: (r) => `${signo(r.peor.velocidad)} kt` },
  { campo: "ala", nombre: { es: `Pilón en el ala ±${T.alaGrados}°`, en: `Pylon on the wing ±${T.alaGrados}°` }, valor: (r) => `${signo(r.peor.ala)}°` },
  { campo: "cruce", nombre: { es: `Recto entre pilones ≥ ${CRUCE_SEG} s`, en: `Straight between pylons ≥ ${CRUCE_SEG} s` }, valor: (r) => `${Math.round(r.cruceSeg)} s` },
  {
    campo: "inclinacion",
    nombre: { es: `Inclinación máx. ${INCLINACION_MAX_OCHO}° +${T.inclinacionGrados}°`, en: `Max bank ${INCLINACION_MAX_OCHO}° +${T.inclinacionGrados}°` },
    valor: (r) => (r.peor.inclinacion > 0 ? `${Math.round(INCLINACION_MAX_OCHO + r.peor.inclinacion)}°` : `≤ ${INCLINACION_MAX_OCHO}°`),
  },
];

const T = {
  es: {
    titulo: "«8» sobre pilones", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", pivote: "Altura pivote", volaste: "volaste",
    sobre: "sobre el suelo", lado: { derecha: "primera vuelta a la derecha", izquierda: "primera vuelta a la izquierda" },
  },
  en: {
    titulo: "Eights on pylons", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", pivote: "Pivotal altitude", volaste: "you flew",
    sobre: "groundspeed", lado: { derecha: "first turn to the right", izquierda: "first turn to the left" },
  },
};

/** Cada criterio de la «8» con su peor valor; arriba, la altura pivote contra la que voló. */
export function HojaOcho({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const o = resultado.objetivo;
  const FILAS = filas(tolOcho(resultado.nivel));
  const malos = FILAS.filter((f) => resultado.fuera[f.campo].length > 0).length;
  const resumen =
    idioma === "en"
      ? malos === 0 ? `All ${FILAS.length} criteria within tolerance.` : `${malos} of ${FILAS.length} criteria out of tolerance.`
      : malos === 0 ? `Los ${FILAS.length} criterios dentro de tolerancia.` : `${malos} de ${FILAS.length} criterios fuera de tolerancia.`;
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{t.titulo}</h3>
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${resultado.aprobado ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
          {resultado.aprobado ? t.si : t.no}
        </span>
      </div>
      <p className="mb-3 text-sm text-white/60">
        {t.pivote}: {pies(o.pivote)} ft AGL ({Math.round(o.gs)} kt {t.sobre}) · {t.volaste} {pies(o.agl)} ft · {t.lado[resultado.lado]}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/50">
            <th className="py-1 pr-3 font-normal">{t.tolerancia}</th>
            <th className="py-1 pr-3 font-normal">{t.peor}</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f) => {
            const bien = resultado.fuera[f.campo].length === 0;
            return (
              <tr key={f.campo} className="border-t border-white/5">
                <td className="py-1.5 pr-3 text-white/80">{f.nombre[idioma]}</td>
                <td className={`py-1.5 pr-3 font-medium ${bien ? "text-emerald-300" : "text-red-300"}`}>
                  {f.valor(resultado)} {bien ? "✓" : "✗"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-white/50">{resumen}</p>
    </section>
  );
}
