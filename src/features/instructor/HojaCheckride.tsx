import type { Resultado, ResultadoLado } from "./evaluador.ts";
import { INCLINACION_OBJETIVO, TOLERANCIAS } from "./virajeEscarpado.ts";

const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}`;

const FILAS: { nombre: string; valor: (l: ResultadoLado) => string; bien: (l: ResultadoLado) => boolean }[] = [
  {
    nombre: `Inclinación ${INCLINACION_OBJETIVO}° ±${TOLERANCIAS.inclinacionGrados}`,
    valor: (l) => `${Math.round(INCLINACION_OBJETIVO + l.peor.inclinacion)}°`,
    bien: (l) => l.fuera.inclinacion.length === 0,
  },
  { nombre: `Altitud ±${TOLERANCIAS.altitudFt} ft`, valor: (l) => `${signo(l.peor.altitud)} ft`, bien: (l) => l.fuera.altitud.length === 0 },
  {
    nombre: `Velocidad ±${TOLERANCIAS.velocidadKt} kt`,
    valor: (l) => `${Math.round(l.entrada.velocidad + l.peor.velocidad)} kt`,
    bien: (l) => l.fuera.velocidad.length === 0,
  },
  { nombre: "Coordinación (bola)", valor: (l) => (l.fuera.bola.length ? "fuera" : "centrada"), bien: (l) => l.fuera.bola.length === 0 },
  {
    nombre: `Rumbo de salida ±${TOLERANCIAS.rumboSalidaGrados}°`,
    valor: (l) => `${signo(l.rumboSalida)}°`,
    bien: (l) => Math.abs(l.rumboSalida) <= TOLERANCIAS.rumboSalidaGrados,
  },
];

/** Cada tolerancia con su peor valor, por lado, como la hoja de un examinador. */
export function HojaCheckride({ resultado }: { resultado: Pick<Resultado, "aprobado" | "lados"> }) {
  const { lados, aprobado } = resultado;
  const total = FILAS.length * lados.length;
  const malos = FILAS.reduce((s, f) => s + lados.filter((l) => !f.bien(l)).length, 0);
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">Viraje escarpado</h3>
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${aprobado ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
          {aprobado ? "APROBADO" : "NO APROBADO"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50">
              <th className="py-1 pr-3 font-normal">Tolerancia</th>
              {lados.map((l) => (
                <th key={l.lado} className="py-1 pr-3 font-normal">{l.lado === "izquierda" ? "Izquierda" : "Derecha"}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) => (
              <tr key={f.nombre} className="border-t border-white/5">
                <td className="py-1.5 pr-3 text-white/80">{f.nombre}</td>
                {lados.map((l) => (
                  <td key={l.lado} className={`py-1.5 pr-3 font-medium ${f.bien(l) ? "text-emerald-300" : "text-red-300"}`}>
                    {f.valor(l)} {f.bien(l) ? "✓" : "✗"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-white/50">
        {malos === 0 ? `Los ${total} criterios dentro de tolerancia.` : `${malos} de ${total} criterios fuera de tolerancia.`}
      </p>
    </section>
  );
}
