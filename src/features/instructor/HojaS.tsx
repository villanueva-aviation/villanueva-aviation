import { INCLINACION_MAX_S, type ResultadoS } from "./evaluadorS.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolS, type Nivel } from "./nivel.ts";

type R = Pick<ResultadoS, "aprobado" | "peor" | "fuera" | "objetivo" | "lado" | "profundidadFt"> & { nivel?: Nivel };

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}`;

const filas = (T: ReturnType<typeof tolS>): { campo: keyof R["fuera"]; nombre: Record<Idioma, string>; valor: (r: R) => string }[] => [
  { campo: "altitud", nombre: { es: `Altitud ±${T.altitudFt} ft`, en: `Altitude ±${T.altitudFt} ft` }, valor: (r) => `${signo(r.peor.altitud)} ft` },
  { campo: "velocidad", nombre: { es: `Velocidad ±${T.velocidadKt} kt`, en: `Airspeed ±${T.velocidadKt} kt` }, valor: (r) => `${signo(r.peor.velocidad)} kt` },
  { campo: "alas", nombre: { es: `Alas al cruzar < ${T.alasGrados}°`, en: `Wings at crossing < ${T.alasGrados}°` }, valor: (r) => `${Math.round(r.peor.alas)}°` },
  { campo: "rumbo", nombre: { es: `Perpendicular ±${T.rumboGrados}°`, en: `Perpendicular ±${T.rumboGrados}°` }, valor: (r) => `${signo(r.peor.rumbo)}°` },
  {
    campo: "simetria",
    nombre: { es: `Curvas iguales ±${T.simetriaPct}%`, en: `Equal halves ±${T.simetriaPct}%` },
    valor: (r) => `${pies(r.profundidadFt[0])} / ${pies(r.profundidadFt[1])} ft`,
  },
  {
    campo: "inclinacion",
    nombre: { es: `Inclinación máx. ${INCLINACION_MAX_S}° +${T.inclinacionGrados}°`, en: `Max bank ${INCLINACION_MAX_S}° +${T.inclinacionGrados}°` },
    valor: (r) => (r.peor.inclinacion > 0 ? `${Math.round(INCLINACION_MAX_S + r.peor.inclinacion)}°` : `≤ ${INCLINACION_MAX_S}°`),
  },
];

const T = {
  es: { titulo: "«S» sobre un camino", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", entrada: "Entrada", lado: { derecha: "primera curva a la derecha", izquierda: "primera curva a la izquierda" } },
  en: { titulo: "S-turns", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", entrada: "Entry", lado: { derecha: "first half to the right", izquierda: "first half to the left" } },
};

/** Cada criterio de la «S» con su peor valor; la simetría dice cuánto se alejó cada curva. */
export function HojaS({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const o = resultado.objetivo;
  const FILAS = filas(tolS(resultado.nivel));
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
        {t.entrada}: {pies(o.altitud)} ft · {Math.round(o.velocidad)} kt · {t.lado[resultado.lado]}
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
