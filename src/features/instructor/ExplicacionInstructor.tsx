import type { Resultado } from "./evaluador";
import { explicar, repetir } from "./explicacion";

export function Explicacion({ resultado }: { resultado: Resultado }) {
  const rep = repetir(resultado);
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">Lo que dice tu instructor</h3>
        <span className="font-display text-3xl font-bold text-gold-400">
          {resultado.calificacion}
          <span className="text-sm text-white/50">/100</span>
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/85">
        {explicar(resultado).map((l) => (
          <li key={l.texto}>
            <span className={l.tipo === "bien" ? "text-emerald-300" : "text-red-300"}>{l.tipo === "bien" ? "✓" : "✗"}</span> {l.texto}
          </li>
        ))}
        {resultado.avisos.map((a) => (
          <li key={a}>
            <span className="text-gold-400">!</span> {a}
          </li>
        ))}
      </ul>
      {rep && <p className="mt-3 font-semibold text-gold-400">{rep}</p>}
    </section>
  );
}
