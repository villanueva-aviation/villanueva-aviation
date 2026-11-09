import type { Idioma } from "./idiomaInstructor.ts";
import { INVITA_SUBIR, NIVELES, NOMBRE_NIVEL, type Nivel } from "./nivel.ts";

const T = {
  es: { nivel: "Nivel", checkride: "El checkride siempre va en Difícil, como el examen.", subir: "Cambiar" },
  en: { nivel: "Level", checkride: "The checkride is always on Hard, like the real test.", subir: "Switch" },
};

/** Fácil / Medio / Difícil. En checkride solo avisa que va en Difícil. */
export function SelectorNivel({ nivel, cambiar, checkride = false, subir = null, idioma = "es" }: {
  nivel: Nivel;
  cambiar: (n: Nivel) => void;
  checkride?: boolean;
  subir?: Nivel | null;
  idioma?: Idioma;
}) {
  const t = T[idioma];
  if (checkride) return <p className="text-xs text-white/60">{t.checkride}</p>;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t.nivel}>
        <span className="text-xs text-white/60">{t.nivel}</span>
        {NIVELES.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={nivel === n} onClick={() => cambiar(n)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${nivel === n ? "bg-gold-500 text-navy-950" : "border border-white/20 text-white/80"}`}>
            {n} · {NOMBRE_NIVEL[idioma][n]}
          </button>
        ))}
      </div>
      {subir && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-gold-300">
          {INVITA_SUBIR[idioma](subir)}
          <button type="button" onClick={() => cambiar(subir)} className="rounded-full border border-gold-500/60 px-3 py-0.5 text-xs font-semibold text-gold-200">
            {t.subir}
          </button>
        </p>
      )}
    </div>
  );
}
