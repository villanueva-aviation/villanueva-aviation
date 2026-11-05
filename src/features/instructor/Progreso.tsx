import { resumenProgreso, type IntentoManiobra } from "./reglasIntentos.ts";

/** Calificación de cada intento en orden, la mejor y la tolerancia que más se te va. */
export function Progreso({ intentos }: { intentos: IntentoManiobra[] }) {
  if (intentos.length === 0) return null;
  const r = resumenProgreso(intentos);
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <h3 className="font-display text-lg font-bold text-white">Tu progreso</h3>
      <p className="mt-1 text-sm text-white/60">
        Mejor calificación: <b className="text-gold-400">{r.mejor}/100</b>
        {r.masFallada && (
          <>
            {" · "}Lo que más se te va: <b className="text-white">{r.masFallada}</b>
          </>
        )}
      </p>
      <ol className="mt-4 flex h-32 items-end gap-1.5 overflow-x-auto pb-1" aria-label="Calificación por intento">
        {r.intentos.map((i) => (
          <li key={i.n} className="flex h-full min-w-6 flex-1 flex-col items-center justify-end gap-1" title={`Intento ${i.n}: ${i.calificacion}/100`}>
            <span className="text-[10px] text-white/60">{i.calificacion}</span>
            <span
              className={`w-full max-w-8 rounded-t ${i.modo === "checkride" ? "bg-gold-500" : "bg-white/30"}`}
              style={{ height: `${Math.max(4, i.calificacion)}%` }}
            />
            <span className="text-[10px] text-white/40">{i.n}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-white/40">
        <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-white/30" />Práctica
        <span className="mr-1 ml-3 inline-block h-2 w-2 rounded-sm bg-gold-500" />Checkride
      </p>
    </section>
  );
}
