import { BANDA } from "./evaluadorAltitud.ts";
import { MIN_AGL, PLANEO_KT, RECUPERA_AGL, type ResultadoFalla } from "./evaluadorFalla.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolFalla, type Nivel } from "./nivel.ts";
import { ITEM } from "./textosFalla.ts";

type R = Pick<ResultadoFalla, "aprobado" | "peor" | "fuera" | "reaccionSeg" | "recuperaSeg" | "recuperoAntes" | "recuperaAgl" | "faltan" | "objetivo"> & { nivel?: Nivel };

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const seg = (s: number) => `${Math.round(s * 10) / 10} s`;

const filas = (T: ReturnType<typeof tolFalla>): { campo: keyof R["fuera"]; nombre: Record<Idioma, string>; valor: (r: R, idioma: Idioma) => string }[] => {
  const [al, ah] = BANDA.sube;
  return [
    { campo: "reaccion", nombre: { es: `Ralentí ≤ ${T.reaccionSeg} s`, en: `Idle ≤ ${T.reaccionSeg} s` }, valor: (r) => seg(r.reaccionSeg) },
    { campo: "planeo", nombre: { es: `Planeo ${PLANEO_KT} kt ±${T.velocidadKt}`, en: `Glide ${PLANEO_KT} kt ±${T.velocidadKt}` }, valor: (r) => `${Math.round(PLANEO_KT + r.peor.planeo)} kt` },
    {
      campo: "checklist",
      nombre: { es: "Checklist de falla de motor", en: "Engine failure checklist" },
      valor: (r, idioma) => (r.faltan.length ? r.faltan.map((x) => ITEM[idioma][x]).join(", ") : idioma === "en" ? "complete" : "completo"),
    },
    {
      campo: "recuperacion",
      nombre: { es: `Recupera a ${pies(RECUPERA_AGL)} ft AGL, ≥ ${MIN_AGL}`, en: `Recover at ${pies(RECUPERA_AGL)} ft AGL, ≥ ${MIN_AGL}` },
      valor: (r, idioma) => `${pies(r.recuperaAgl)} ft${r.recuperoAntes ? (idioma === "en" ? ", early" : ", antes") : r.recuperaSeg !== null ? ` · ${seg(r.recuperaSeg)}` : ""}`,
    },
    {
      campo: "ascenso",
      nombre: { es: `Ascenso ${al}–${ah} kt ±${T.velocidadKt}`, en: `Climb ${al}-${ah} kt ±${T.velocidadKt}` },
      valor: (r) => (r.peor.ascenso === 0 ? `${al}–${ah} kt` : `${Math.round((r.peor.ascenso > 0 ? ah : al) + r.peor.ascenso)} kt`),
    },
  ];
};

const T = {
  es: { titulo: "Falla de motor", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", objetivo: "Falla a" },
  en: { titulo: "Engine failure", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", objetivo: "Failure at" },
};

/** Cada criterio de la falla de motor con lo que hizo el cadete. */
export function HojaFalla({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const FILAS = filas(tolFalla(resultado.nivel));
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
        {t.objetivo}: {pies(resultado.objetivo.altitud)} ft · {pies(resultado.objetivo.agl)} ft AGL
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
