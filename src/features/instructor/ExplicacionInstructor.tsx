import { traducirAviso, type Idioma } from "./idiomaInstructor";
import { MANIOBRAS, type DefManiobra, type ResultadoComun } from "./maniobras";

export function Explicacion({
  resultado,
  idioma = "es",
  def = MANIOBRAS["viraje-escarpado"],
}: {
  resultado: ResultadoComun;
  idioma?: Idioma;
  def?: DefManiobra;
}) {
  const rep = def.repetir(resultado, idioma);
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{idioma === "en" ? "What your instructor says" : "Lo que dice tu instructor"}</h3>
        <span className="font-display text-3xl font-bold text-gold-400">
          {resultado.calificacion}
          <span className="text-sm text-white/50">/100</span>
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/85">
        {def.explicar(resultado, idioma).map((l) => (
          <li key={l.texto}>
            <span className={l.tipo === "bien" ? "text-emerald-300" : "text-red-300"}>{l.tipo === "bien" ? "✓" : "✗"}</span> {l.texto}
          </li>
        ))}
        {resultado.avisos.map((a) => (
          <li key={a}>
            <span className="text-gold-400">!</span> {traducirAviso(a, idioma)}
          </li>
        ))}
      </ul>
      {rep && <p className="mt-3 font-semibold text-gold-400">{rep}</p>}
    </section>
  );
}
