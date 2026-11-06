import type { Resultado, ResultadoLado } from "./evaluador.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { INCLINACION_OBJETIVO, TOLERANCIAS } from "./virajeEscarpado.ts";

const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}`;

type Fila = { nombre: Record<Idioma, string>; valor: (l: ResultadoLado, idioma: Idioma) => string; bien: (l: ResultadoLado) => boolean };

const FILAS: Fila[] = [
  {
    nombre: {
      es: `Inclinación ${INCLINACION_OBJETIVO}° ±${TOLERANCIAS.inclinacionGrados}`,
      en: `Bank ${INCLINACION_OBJETIVO}° ±${TOLERANCIAS.inclinacionGrados}`,
    },
    valor: (l) => `${Math.round(INCLINACION_OBJETIVO + l.peor.inclinacion)}°`,
    bien: (l) => l.fuera.inclinacion.length === 0,
  },
  {
    nombre: { es: `Altitud ±${TOLERANCIAS.altitudFt} ft`, en: `Altitude ±${TOLERANCIAS.altitudFt} ft` },
    valor: (l) => `${signo(l.peor.altitud)} ft`,
    bien: (l) => l.fuera.altitud.length === 0,
  },
  {
    nombre: { es: `Velocidad ±${TOLERANCIAS.velocidadKt} kt`, en: `Airspeed ±${TOLERANCIAS.velocidadKt} kt` },
    valor: (l) => `${Math.round(l.entrada.velocidad + l.peor.velocidad)} kt`,
    bien: (l) => l.fuera.velocidad.length === 0,
  },
  {
    nombre: { es: "Coordinación (bola)", en: "Coordination (ball)" },
    valor: (l, idioma) => (l.fuera.bola.length ? (idioma === "en" ? "out" : "fuera") : idioma === "en" ? "centered" : "centrada"),
    bien: (l) => l.fuera.bola.length === 0,
  },
  {
    nombre: { es: `Rumbo de salida ±${TOLERANCIAS.rumboSalidaGrados}°`, en: `Exit heading ±${TOLERANCIAS.rumboSalidaGrados}°` },
    valor: (l) => `${signo(l.rumboSalida)}°`,
    bien: (l) => Math.abs(l.rumboSalida) <= TOLERANCIAS.rumboSalidaGrados,
  },
];

const T = {
  es: { titulo: "Viraje escarpado", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", izq: "Izquierda", der: "Derecha" },
  en: { titulo: "Steep turn", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", izq: "Left", der: "Right" },
};

/** Cada tolerancia con su peor valor, por lado, como la hoja de un examinador. */
export function HojaCheckride({ resultado, idioma = "es" }: { resultado: Pick<Resultado, "aprobado" | "lados">; idioma?: Idioma }) {
  const { lados, aprobado } = resultado;
  const t = T[idioma];
  const total = FILAS.length * lados.length;
  const malos = FILAS.reduce((s, f) => s + lados.filter((l) => !f.bien(l)).length, 0);
  const resumen =
    idioma === "en"
      ? malos === 0 ? `All ${total} criteria within tolerance.` : `${malos} of ${total} criteria out of tolerance.`
      : malos === 0 ? `Los ${total} criterios dentro de tolerancia.` : `${malos} de ${total} criterios fuera de tolerancia.`;
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{t.titulo}</h3>
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${aprobado ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
          {aprobado ? t.si : t.no}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50">
              <th className="py-1 pr-3 font-normal">{t.tolerancia}</th>
              {lados.map((l) => (
                <th key={l.lado} className="py-1 pr-3 font-normal">{l.lado === "izquierda" ? t.izq : t.der}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) => (
              <tr key={f.nombre.es} className="border-t border-white/5">
                <td className="py-1.5 pr-3 text-white/80">{f.nombre[idioma]}</td>
                {lados.map((l) => (
                  <td key={l.lado} className={`py-1.5 pr-3 font-medium ${f.bien(l) ? "text-emerald-300" : "text-red-300"}`}>
                    {f.valor(l, idioma)} {f.bien(l) ? "✓" : "✗"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-white/50">{resumen}</p>
    </section>
  );
}
