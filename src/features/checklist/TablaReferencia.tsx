import type { TablaReferencia as Tabla } from "../../data/checklistAviones";

/** Tabla de consulta del manual del avión (potencia de crucero, rendimiento…). La primera columna es la fila. */
export function TablaReferencia({ tabla }: { tabla: Tabla }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        <thead>
          <tr className="bg-white/[0.04] text-left text-xs uppercase tracking-wide text-white/45">
            {tabla.columnas.map((c) => (
              <th key={c} scope="col" className="px-4 py-2.5">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila) => (
            <tr key={fila[0]} className="border-t border-white/10">
              {fila.map((celda, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-4 py-2.5 text-left font-display font-semibold text-gold-400">
                    {celda}
                  </th>
                ) : (
                  <td key={i} className="px-4 py-2.5 font-mono text-white/85">
                    {celda}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
