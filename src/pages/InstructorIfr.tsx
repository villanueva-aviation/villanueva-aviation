import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { Idioma } from "../features/instructor/idiomaInstructor";
import { fetchMisLecciones } from "../features/instructor/intentos";
import { claveLeccion, estadoLeccion, LECCIONES_IFR } from "../features/instructor/lecciones";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import type { TemaIfr } from "../data/teoriaIfr";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

/** La teoría con dibujos de cada lección que ya la tiene. */
const TEORIA: Partial<Record<number, TemaIfr>> = { 1: "interceptacion" };

const T = {
  es: {
    titulo: "Instructor virtual IFR",
    intro: "Navegación con VOR en el C172, de la plataforma a la plataforma: teoría, práctica y examen por tema.",
    proximamente: "Próximamente",
    ultimo: "Último vuelo",
    teoria: "Teoría con dibujos",
    volver: "Volver al programa VFR",
  },
  en: {
    titulo: "IFR virtual instructor",
    intro: "VOR navigation in the C172, from ramp to ramp: theory, practice and a graded flight for each topic.",
    proximamente: "Coming soon",
    ultimo: "Last flight",
    teoria: "Illustrated theory",
    volver: "Back to the VFR program",
  },
};

function leerIdioma(): Idioma {
  try {
    return localStorage.getItem("instructor-idioma") === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

/** El menú del programa IFR: las 6 lecciones; abiertas las que ya existen, con la misma regla de acceso que el VFR. */
export function InstructorIfr() {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [idioma] = useState<Idioma>(leerIdioma);
  const t = T[idioma];
  const [ultimoVuelo, setUltimoVuelo] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!user) return;
    let vivo = true;
    fetchMisLecciones()
      .then((ls) => {
        const m: Record<string, string> = {};
        for (const x of ls) m[x.maniobra] ??= x.id;
        if (vivo) setUltimoVuelo(m);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-6">
      <h1 className="font-display text-xl font-bold text-white">{t.titulo}</h1>
      <p className="text-sm text-white/70">{t.intro}</p>
      <ol className="space-y-1.5">
        {LECCIONES_IFR.map((l) => {
          const e = estadoLeccion(l, { fundador: user?.email === FOUNDER_EMAIL, exclusivo: hasAccess });
          const tema = TEORIA[l.numero];
          const fila = (
            <span className="flex items-baseline justify-between gap-3">
              <span><span className="mr-2 font-mono text-white/50">{l.numero}</span>{l.nombre[idioma]}</span>
              {e !== "abierta" && <span className="shrink-0 text-xs text-white/50">{t.proximamente}</span>}
            </span>
          );
          return (
            <li key={l.numero}>
              {e === "abierta" ? (
                <Link to={ROUTES.instructorIfrLeccion(l.numero)} className="block rounded-xl border border-gold-500/60 bg-gold-500/10 px-4 py-2.5 font-semibold text-white hover:bg-gold-500/20">{fila}</Link>
              ) : (
                <div aria-disabled="true" className="rounded-xl border border-white/10 px-4 py-2.5 text-white opacity-60">{fila}</div>
              )}
              <span className="ml-4 mt-0.5 flex gap-4 text-xs">
                {e === "abierta" && ultimoVuelo[claveLeccion(l)] && (
                  <Link to={ROUTES.instructorVuelo(ultimoVuelo[claveLeccion(l)])} className="text-gold-300 underline">{t.ultimo}</Link>
                )}
                {e === "abierta" && tema && <Link to={ROUTES.instructorIfrTeoria(tema)} className="text-gold-300 underline">{t.teoria}</Link>}
              </span>
            </li>
          );
        })}
      </ol>
      <Link to={ROUTES.instructorPrograma} className="block text-center text-sm text-white/60 underline">{t.volver}</Link>
    </div>
  );
}
