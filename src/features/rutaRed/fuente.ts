import { supabase } from "../../lib/supabaseClient";
import { fuenteRuta } from "./reglas";

// De qué publicación llega la gente a la ruta (?ref=fb-ruta, ig-ruta…). Se recuerda en el navegador
// para atribuir el pago de la prueba aunque la persona entre sin el ?ref días después.
const CLAVE = "ruta_red_fuente";
const CLAVE_SESION = "ruta_red_visita";

export function fuenteGuardadaRuta(): string | null {
  try {
    return fuenteRuta("", localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

/** Guarda la fuente y anota una visita anónima por sesión del navegador. Nunca rompe la página. */
export function registrarVisitaRuta(pagina: string, busqueda: string) {
  try {
    const fuente = fuenteRuta(busqueda, localStorage.getItem(CLAVE));
    if (fuente) localStorage.setItem(CLAVE, fuente);
    if (sessionStorage.getItem(CLAVE_SESION)) return;
    sessionStorage.setItem(CLAVE_SESION, "1");
    const paginaValida = /^[a-z0-9-]{1,40}$/.test(pagina) ? pagina : "otra";
    void supabase.from("visitas_ruta_red").insert({ fuente, pagina: paginaValida }).then(() => undefined);
  } catch {
    // Almacenamiento bloqueado (ventana privada, etc.): la página sigue igual.
  }
}
