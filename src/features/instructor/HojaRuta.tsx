import type { ResultadoRuta } from "./evaluadorRuta.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolRuta } from "./nivel.ts";

type R = Pick<ResultadoRuta, "aprobado" | "fuera" | "ejercicio" | "vor" | "peor" | "nivel">;

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const uno = (x: number) => String(Math.round(x * 10) / 10);

const T = {
  es: { titulo: "Rutas de acercamiento y alejamiento", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", acercate: "Acercamiento por el radial", alejate: "alejamiento por el radial" },
  en: { titulo: "Inbound and outbound courses", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", acercate: "Inbound on the radial", alejate: "outbound on the radial" },
};

/** Las dos celdas (ida y vuelta) con su peor valor y su tolerancia. */
export function HojaRuta({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const en = idioma === "en";
  const Tol = tolRuta(resultado.nivel);
  const ej = resultado.ejercicio;
  const filas = [
    { campo: "acercamiento" as const, nombre: en ? `Inbound within ${Tol.puntos} dots` : `Acercamiento dentro de ${Tol.puntos} puntos`, valor: resultado.peor.acercamiento },
    {
      campo: "alejamiento" as const,
      nombre: en ? `Outbound within ${Tol.puntos} dots (settled in ${Tol.establecerSeg} s)` : `Alejamiento dentro de ${Tol.puntos} puntos (establecido en ${Tol.establecerSeg} s)`,
      valor: resultado.peor.alejamiento,
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
        {t.acercate} {tres(ej.entrada)}{resultado.vor ? ` ${resultado.vor}` : ""} · {t.alejate} {tres(ej.salida)}
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
                  {uno(f.valor)} {en ? "dots" : "puntos"} {bien ? "✓" : "✗"}
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
