import { INCLINACION_MAX, PATRON_AGL, VEL_CIRCUITO, type ResultadoCircuito } from "./evaluadorCircuito.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolCircuito, type Nivel } from "./nivel.ts";

type R = Pick<ResultadoCircuito, "aprobado" | "peor" | "fuera" | "rotacionKt" | "toqueFpm" | "patron" | "lado"> & { nivel?: Nivel };

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const kt = (v: number) => `${Math.round(v)} kt`;

const filas = (T: ReturnType<typeof tolCircuito>): { campo: keyof R["fuera"]; nombre: Record<Idioma, string>; valor: (r: R, idioma: Idioma) => string }[] => {
  const [al, ah] = VEL_CIRCUITO.ascenso;
  const [fl, fh] = VEL_CIRCUITO.final;
  const enBanda = (peor: number, lo: number, hi: number) => (peor === 0 ? `${lo}–${hi} kt` : kt((peor > 0 ? hi : lo) + peor));
  return [
    {
      campo: "rotacion",
      nombre: { es: `Rotación ${VEL_CIRCUITO.vr} kt −5/+10`, en: `Rotation ${VEL_CIRCUITO.vr} kt -5/+10` },
      valor: (r, idioma) => (r.rotacionKt === null ? (idioma === "en" ? "not measured" : "sin medir") : kt(r.rotacionKt)),
    },
    { campo: "ascenso", nombre: { es: `Ascenso ${al}–${ah} kt ±${T.velocidadKt}`, en: `Climb ${al}-${ah} kt ±${T.velocidadKt}` }, valor: (r) => enBanda(r.peor.ascenso, al, ah) },
    {
      campo: "altitud",
      nombre: { es: `Circuito ${pies(PATRON_AGL)} ft AGL ±${T.altitudFt}`, en: `Pattern ${pies(PATRON_AGL)} ft AGL ±${T.altitudFt}` },
      valor: (r) => `${pies(r.patron + r.peor.altitud)} ft`,
    },
    { campo: "velocidad", nombre: { es: `Viento en cola ${VEL_CIRCUITO.cola} kt ±${T.velocidadKt}`, en: `Downwind ${VEL_CIRCUITO.cola} kt ±${T.velocidadKt}` }, valor: (r) => kt(VEL_CIRCUITO.cola + r.peor.velocidad) },
    {
      campo: "inclinacion",
      nombre: { es: `Inclinación máx. ${INCLINACION_MAX}° +${T.inclinacionGrados}°`, en: `Max bank ${INCLINACION_MAX}° +${T.inclinacionGrados}°` },
      valor: (r) => (r.peor.inclinacion > 0 ? `${Math.round(INCLINACION_MAX + r.peor.inclinacion)}°` : `≤ ${INCLINACION_MAX}°`),
    },
    { campo: "final", nombre: { es: `Final ${fl}–${fh} kt ±${T.velocidadKt}`, en: `Final ${fl}-${fh} kt ±${T.velocidadKt}` }, valor: (r) => enBanda(r.peor.final, fl, fh) },
    {
      campo: "toque",
      nombre: { es: `Toque ≤ ${T.toqueFpm} ft/min`, en: `Touchdown ≤ ${T.toqueFpm} ft/min` },
      valor: (r) => (r.toqueFpm === null ? "—" : `${Math.round(r.toqueFpm)} ft/min`),
    },
  ];
};

const T = {
  es: { titulo: "Toques y despegues", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", objetivo: "Circuito", lado: { derecha: "por la derecha", izquierda: "por la izquierda" } },
  en: { titulo: "Touch and goes", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", objetivo: "Pattern", lado: { derecha: "right traffic", izquierda: "left traffic" } },
};

/** Cada tolerancia del circuito con su peor valor. */
export function HojaCircuito({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const FILAS = filas(tolCircuito(resultado.nivel));
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
        {t.objetivo}: {pies(resultado.patron)} ft · {t.lado[resultado.lado]}
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
                  {f.valor(resultado, idioma)} {bien ? "✓" : "✗"}
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
