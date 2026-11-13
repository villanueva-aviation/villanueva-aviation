import type { ResultadoInterceptacion } from "./evaluadorInterceptacion.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolInterceptacion } from "./nivel.ts";

type R = Pick<ResultadoInterceptacion, "aprobado" | "fuera" | "ejercicio" | "vor" | "sobrepaso" | "cortoSeg" | "angulo" | "dmeInicio" | "nivel" | "dicho">;

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const uno = (x: number) => String(Math.round(x * 10) / 10);

const T = {
  es: { titulo: "Interceptación de radiales", tituloPasada: "Rutas pasadas", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", radial: "Radial", alejandote: "alejándote", acercandote: "acercándote", curso: "curso", angulo: "Ángulo de interceptación" },
  en: { titulo: "Radial interception", tituloPasada: "Passed routes", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", radial: "Radial", alejandote: "outbound", acercandote: "inbound", curso: "course", angulo: "Intercept angle" },
};

const NOMBRE_TIPO = { es: { normal: "normal", pasada: "ruta pasada" }, en: { normal: "normal intercept", pasada: "passed route" } } as const;

/**
 * Las celdas con su peor valor y su tolerancia; el ángulo va aparte porque es nota, no error. Los intentos de antes del vuelo
 * encadenado no traen `tipo`: esos no tienen fila de identificar.
 */
export function HojaInterceptacion({ resultado, idioma = "es", rutaPasada = false }: { resultado: R; idioma?: Idioma; rutaPasada?: boolean }) {
  const t = T[idioma];
  const en = idioma === "en";
  const Tol = tolInterceptacion(resultado.nivel);
  const ej = resultado.ejercicio;
  const tipo = (ej as Partial<typeof ej>).tipo;
  const identificar = tipo
    ? [{
        campo: "identificar" as const,
        nombre: en ? `Called it: ${NOMBRE_TIPO.en[tipo]}` : `Lo identificó: ${NOMBRE_TIPO.es[tipo]}`,
        valor: resultado.dicho ? NOMBRE_TIPO[idioma][resultado.dicho] : en ? "no answer" : "sin respuesta",
      }]
    : [];
  const filas = [
    ...identificar,
    {
      campo: "interceptar" as const,
      nombre: ej.desde ? (en ? "Reached the radial before 8 NM" : "Llegó al radial antes de las 8 NM") : en ? "Reached the radial before the VOR" : "Llegó al radial antes del VOR",
      valor: resultado.fuera.interceptar.length ? "no" : en ? "yes" : "sí",
    },
    { campo: "sobrepaso" as const, nombre: en ? `Overshoot ≤ ${Tol.sobrepasoPuntos} dots` : `Pasarse ≤ ${Tol.sobrepasoPuntos} puntos`, valor: `${uno(resultado.sobrepaso)} ${en ? "dots" : "puntos"}` },
    { campo: "corto" as const, nombre: en ? `Undershoot ≤ ${Tol.cortoSeg} s` : `Quedarse corto ≤ ${Tol.cortoSeg} s`, valor: `${Math.round(resultado.cortoSeg)} s` },
  ];
  const malos = filas.filter((f) => (resultado.fuera[f.campo]?.length ?? 0) > 0).length;
  const resumen = en
    ? malos === 0 ? `All ${filas.length} criteria within tolerance.` : `${malos} of ${filas.length} criteria out of tolerance.`
    : malos === 0 ? `Los ${filas.length} criterios dentro de tolerancia.` : `${malos} de ${filas.length} criterios fuera de tolerancia.`;
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{rutaPasada ? t.tituloPasada : t.titulo}</h3>
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${resultado.aprobado ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
          {resultado.aprobado ? t.si : t.no}
        </span>
      </div>
      <p className="mb-3 text-sm text-white/60">
        {t.radial} {tres(ej.radial)}{resultado.vor ? ` ${resultado.vor}` : ""} {ej.desde ? t.alejandote : t.acercandote} · {t.curso} {tres(ej.curso)} · DME {uno(resultado.dmeInicio)} NM
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
            const bien = !resultado.fuera[f.campo]?.length;
            return (
              <tr key={f.campo} className="border-t border-white/5">
                <td className="py-1.5 pr-3 text-white/80">{f.nombre}</td>
                <td className={`py-1.5 pr-3 font-medium ${bien ? "text-emerald-300" : "text-red-300"}`}>
                  {f.valor} {bien ? "✓" : "✗"}
                </td>
              </tr>
            );
          })}
          {resultado.angulo !== null && (
            <tr className="border-t border-white/5">
              <td className="py-1.5 pr-3 text-white/80">{t.angulo} 30° ±10°</td>
              <td className="py-1.5 pr-3 font-medium text-white/80">{Math.round(resultado.angulo)}°</td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-white/50">{resumen}</p>
    </section>
  );
}

/** Lección IFR 2: el mismo resultado, con su título. */
export const HojaRutaPasada = (p: { resultado: R; idioma?: Idioma }) => <HojaInterceptacion {...p} rutaPasada />;
