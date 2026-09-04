import type { VSpeed } from "../../data/checklistPremium";

export function VSpeedsTable({ vspeeds }: { vspeeds: VSpeed[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white/[0.04] text-left text-xs uppercase tracking-wide text-white/45">
            <th className="px-4 py-2.5">Clave</th>
            <th className="px-4 py-2.5">Descripción</th>
            <th className="px-4 py-2.5">Valor de referencia</th>
          </tr>
        </thead>
        <tbody>
          {vspeeds.map((v) => (
            <tr key={v.clave} className="border-t border-white/10">
              <td className="px-4 py-2.5 font-display font-semibold text-gold-400">{v.clave}</td>
              <td className="px-4 py-2.5 text-white/75">{v.nombre}</td>
              <td className="px-4 py-2.5 font-mono text-white/85">{v.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
