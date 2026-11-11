import type { ResultadoArco } from "./evaluadorArco.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolArco, tolInterceptacion } from "./nivel.ts";

type R = Pick<ResultadoArco, "aprobado" | "fuera" | "ejercicio" | "vor" | "peorDistancia" | "sobrepasoEntrada" | "salida" | "nivel">;

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const uno = (x: number) => String(Math.round(x * 10) / 10);

const T = {
  es: { titulo: "Arco DME", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", arco: "Arco de", del: "del radial", al: "al" },
  en: { titulo: "DME arc", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", arco: "Arc of", del: "from the", al: "radial to" },
};

/** Entrada, distancia y salida, con su peor valor y su tolerancia. */
export function HojaArco({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const en = idioma === "en";
  const Tol = tolArco(resultado.nivel);
  const ej = resultado.ejercicio;
  const filas = [
    { campo: "entrada" as const, nombre: en ? `Arc entry: overshoot ≤ ${Tol.distanciaNm} NM` : `Entrada al arco: pasarse ≤ ${Tol.distanciaNm} NM`, valor: `${uno(resultado.sobrepasoEntrada)} NM` },
    { campo: "distancia" as const, nombre: en ? `Arc distance ±${Tol.distanciaNm} NM` : `Distancia del arco ±${Tol.distanciaNm} NM`, valor: `${uno(resultado.peorDistancia)} NM` },
    {
      campo: "salida" as const,
      nombre: en ? `Radial exit: overshoot ≤ ${tolInterceptacion(resultado.nivel).sobrepasoPuntos} dots` : `Salida al radial: pasarse ≤ ${tolInterceptacion(resultado.nivel).sobrepasoPuntos} puntos`,
      valor: resultado.salida ? `${uno(resultado.salida.sobrepaso)} ${en ? "dots" : "puntos"}` : "—",
    },
  ];
  const malos = filas.filter((f) => resultado.fuera[f.campo].length > 0).length;
  const resumen = en
    ? malos === 0 ? `All ${filas.length} criteria within tolerance.` : `${malos} of ${filas.length} criteria out of tolerance.`
    : malos === 0 ? `Los ${filas.length} criterios dentro de tolerancia.` : `${malos} de ${filas.length} criterios fuera de tolerancia.`;
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{t.titulo}</h3>
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${resultado.aprobado ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
          {resultado.aprobado ? t.si : t.no}
        </span>
      </div>
      <p className="mb-3 text-sm text-white/60">
        {t.arco} {ej.radioNm} NM{resultado.vor ? ` ${resultado.vor}` : ""} · {t.del} {tres(ej.desde)} {t.al} {tres(ej.hasta)}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/50">
            <th className="py-1 pr-3 font-normal">{t.tolerancia}</th>
            <th className="py-1 pr-3 font-normal">{t.peor}</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => {
            const bien = resultado.fuera[f.campo].length === 0;
            return (
              <tr key={f.campo} className="border-t border-white/5">
                <td className="py-1.5 pr-3 text-white/80">{f.nombre}</td>
                <td className={`py-1.5 pr-3 font-medium ${bien ? "text-emerald-300" : "text-red-300"}`}>
                  {f.valor} {bien ? "✓" : "✗"}
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
