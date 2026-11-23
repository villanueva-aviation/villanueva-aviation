// Tras publicar, una pestaña abierta con la versión anterior pide archivos que ya no existen
// («Algo salió mal»). La recargamos sola, pero máximo una vez por minuto para no entrar en un ciclo.

const CLAVE = "va-recarga-version";
const ESPERA_MS = 60_000;

export const debeRecargar = (ultima: number | null, ahora: number): boolean => ultima === null || ahora - ultima > ESPERA_MS;

export function recargarSiHayVersionNueva(): boolean {
  let ultima: number | null = null;
  try {
    ultima = Number(sessionStorage.getItem(CLAVE)) || null;
  } catch {
    // Sin sessionStorage: recargar igual, la guarda solo evita repetir.
  }
  const ahora = Date.now();
  if (!debeRecargar(ultima, ahora)) return false;
  try {
    sessionStorage.setItem(CLAVE, String(ahora));
  } catch {
    return false; // sin poder anotar la recarga no hay forma de evitar el ciclo
  }
  location.reload();
  return true;
}
