import { BANDA, type ResultadoAltitud } from "./evaluadorAltitud.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolAltitud, type Nivel } from "./nivel.ts";

type R = Pick<ResultadoAltitud, "aprobado" | "peor" | "fuera" | "objetivo" | "altitudAlNivelar"> & { nivel?: Nivel };

const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}`;
const rumbo3 = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");

const filas = (T: ReturnType<typeof tolAltitud>, sube: boolean): { campo: keyof R["fuera"]; nombre: Record<Idioma, string>; valor: (r: R, idioma: Idioma) => string }[] => {
  const [lo, hi] = sube ? BANDA.sube : BANDA.baja;
  return [
    {
      campo: "velocidad",
      nombre: { es: `Velocidad ${lo}–${hi} kt ±${T.velocidadKt}`, en: `Airspeed ${lo}-${hi} kt ±${T.velocidadKt}` },
      valor: (r) => (r.peor.velocidad === 0 ? `${lo}–${hi} kt` : `${Math.round((r.peor.velocidad > 0 ? hi : lo) + r.peor.velocidad)} kt`),
    },
    {
      campo: "altitud",
      nombre: { es: `Altitud al nivelar ±${T.altitudFt} ft`, en: `Altitude at level-off ±${T.altitudFt} ft` },
      valor: (r) => `${pies(r.objetivo.altitudFinal + r.altitudAlNivelar)} (${signo(r.peor.altitud)} ft)`,
    },
    { campo: "rumbo", nombre: { es: `Rumbo ±${T.rumboGrados}°`, en: `Heading ±${T.rumboGrados}°` }, valor: (r) => `${signo(r.peor.rumbo)}°` },
    {
      campo: "bola",
      nombre: { es: "Coordinación (bola)", en: "Coordination (ball)" },
      valor: (r, idioma) => (r.fuera.bola.length ? (idioma === "en" ? "out" : "fuera") : idioma === "en" ? "centered" : "centrada"),
    },
  ];
};

const T = {
  es: { titulo: "Ascensos y descensos", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", objetivo: "Objetivo", sube: "subiendo", baja: "bajando" },
  en: { titulo: "Climbs and descents", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", objetivo: "Target", sube: "climbing", baja: "descending" },
};

/** Cada tolerancia con su peor valor; la altitud dice dónde niveló. */
export function HojaAltitud({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const o = resultado.objetivo;
  const FILAS = filas(tolAltitud(resultado.nivel), o.sube);
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
        {t.objetivo}: {pies(o.altitud)} → {pies(o.altitudFinal)} ft {o.sube ? t.sube : t.baja} · {rumbo3(o.rumbo)}°
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
