import type { ResultadoEspera } from "./evaluadorEspera.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolEspera } from "./nivel.ts";
import { NOMBRE_ENTRADA } from "./textosEspera.ts";

type R = Pick<
  ResultadoEspera,
  "aprobado" | "fuera" | "ejercicio" | "vor" | "dicha" | "volada" | "correcta" | "tramos" | "tasas" | "peorAcercamiento" | "maxDistancia" | "peorAltitud" | "nivel"
>;

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const uno = (x: number) => String(Math.round(x * 10) / 10);
const pies = (ft: number) => ft.toLocaleString("en-US");

const T = {
  es: { titulo: "Patrón de espera", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", curso: "Curso de acercamiento", giros: { derecha: "virajes a la derecha", izquierda: "virajes a la izquierda" }, nada: "ninguna" },
  en: { titulo: "Holding pattern", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", curso: "Inbound course", giros: { derecha: "right turns", izquierda: "left turns" }, nada: "none" },
};

/** Las 6 celdas; en la entrada dicha y la volada muestra la entrada en vez de un número. */
export function HojaEspera({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const en = idioma === "en";
  const Tol = tolEspera(resultado.nivel);
  const ej = resultado.ejercicio;
  const N = NOMBRE_ENTRADA[idioma];
  const peorDe = (xs: number[], ref: number) => (xs.length ? xs.reduce((a, x) => (Math.abs(x - ref) > Math.abs(a - ref) ? x : a)) : null);
  const tramo = peorDe(resultado.tramos, ej.tramoSeg);
  const tasa = peorDe(resultado.tasas, 3);
  const filas = [
    { campo: "dicha" as const, nombre: en ? `Entry called (should be ${N[resultado.correcta]})` : `Entrada dicha (tocaba ${N[resultado.correcta]})`, valor: resultado.dicha ? N[resultado.dicha] : t.nada },
    { campo: "volada" as const, nombre: en ? "Entry flown" : "Entrada volada", valor: resultado.volada ? N[resultado.volada] : t.nada },
    { campo: "tramo" as const, nombre: en ? `Outbound leg ${ej.tramoSeg} s ±${Tol.tramoSeg} s` : `Tramo de alejamiento ${ej.tramoSeg} s ±${Tol.tramoSeg} s`, valor: tramo === null ? "—" : `${Math.round(tramo)} s` },
    { campo: "acercamiento" as const, nombre: en ? `Inbound within ${Tol.puntos} dots` : `Acercamiento dentro de ${Tol.puntos} puntos`, valor: `${uno(resultado.peorAcercamiento)} ${en ? "dots" : "puntos"}` },
    { campo: "virajes" as const, nombre: en ? `Turns at 3 ±${Tol.tasaGrados} °/s` : `Virajes a 3 ±${Tol.tasaGrados} °/s`, valor: tasa === null ? "—" : `${uno(tasa)} °/s` },
    { campo: "distancia" as const, nombre: en ? `Within ${Tol.maxNm} NM of the VOR` : `A ${Tol.maxNm} NM o menos del VOR`, valor: `${uno(resultado.maxDistancia)} NM` },
    // Los resultados guardados antes de 2026-11-11 no tienen altitud.
    ...(resultado.fuera.altitud
      ? [{ campo: "altitud" as const, nombre: en ? `Holding altitude ${pies(ej.altitudFt)} ft ±${Tol.altitudFt} ft` : `Altitud de la espera ${pies(ej.altitudFt)} ft ±${Tol.altitudFt} ft`, valor: `${resultado.peorAltitud > 0 ? "+" : ""}${Math.round(resultado.peorAltitud)} ft` }]
      : []),
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
        {t.curso} {tres(ej.acercamiento)}{resultado.vor ? ` · ${resultado.vor}` : ""} · {t.giros[ej.giros]}
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
