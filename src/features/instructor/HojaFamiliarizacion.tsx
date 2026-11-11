import type { ResultadoFamiliarizacion } from "./evaluadorFamiliarizacion.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { nombreTarea } from "./textosFamiliarizacion.ts";

type R = Pick<ResultadoFamiliarizacion, "aprobado" | "tareas">;

const T = {
  es: { titulo: "Familiarización", si: "HECHO", movimiento: "Movimiento", tiempo: "Tiempo", resumen: "Los 8 movimientos, sin tolerancias: cuenta el tiempo para ver qué te costó más." },
  en: { titulo: "Familiarization", si: "DONE", movimiento: "Movement", tiempo: "Time", resumen: "All 8 movements, no tolerances: the time shows what took you longest." },
};

/** Cada movimiento con el tiempo que tardó desde que el instructor lo pidió. */
export function HojaFamiliarizacion({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{t.titulo}</h3>
        <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-sm font-semibold text-emerald-300">{t.si}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/50">
            <th className="py-1 pr-3 font-normal">{t.movimiento}</th>
            <th className="py-1 pr-3 font-normal">{t.tiempo}</th>
          </tr>
        </thead>
        <tbody>
          {resultado.tareas.map((x) => (
            <tr key={x.id} className="border-t border-white/5">
              <td className="py-1.5 pr-3 text-white/80">{nombreTarea(x.id, idioma)}</td>
              <td className="py-1.5 pr-3 font-medium text-emerald-300">{Math.round(x.seg)} s ✓</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-white/50">{t.resumen}</p>
    </section>
  );
}
