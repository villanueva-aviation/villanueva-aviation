// Puerta en inglés: solo estas páginas tienen versión en /en. El resto del sitio sigue en español.
export const RUTAS_EN = {
  home: "/en",
  coaching: "/en/coaching",
  assessment: "/en/free-assessment",
  signIn: "/en/sign-in",
  legal: "/en/legal",
} as const;

// Página en español → su equivalente en inglés.
const PARES: Record<string, string> = {
  "/": RUTAS_EN.home,
  "/asesorias": RUTAS_EN.coaching,
  "/asesorias/diagnostico": RUTAS_EN.assessment,
  "/ingresar": RUTAS_EN.signIn,
  "/legal": RUTAS_EN.legal,
};
const PARES_INVERSOS: Record<string, string> = Object.fromEntries(Object.entries(PARES).map(([es, en]) => [en, es]));

export function esIngles(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

/** La misma página en el otro idioma; si no tiene par, la portada del otro idioma. */
export function rutaEnOtroIdioma(pathname: string): string {
  if (esIngles(pathname)) return PARES_INVERSOS[pathname] ?? "/";
  return PARES[pathname] ?? RUTAS_EN.home;
}

/** Par de la página para las etiquetas hreflang, o null si solo existe en un idioma. */
export function parDeIdioma(pathname: string): { es: string; en: string } | null {
  if (PARES[pathname]) return { es: pathname, en: PARES[pathname] };
  if (PARES_INVERSOS[pathname]) return { es: PARES_INVERSOS[pathname], en: pathname };
  return null;
}
