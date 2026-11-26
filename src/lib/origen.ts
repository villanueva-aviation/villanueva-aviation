import { fuenteDeEnlace } from "../features/testNivel/reglas.ts";

// De qué Reel o publicación llegó alguien (`?ref=`), para saber qué trae registros.
// Se guarda en el navegador al llegar y se pega a la cuenta solo si la crea poco después.

const CLAVE = "va-origen";
const VIGENCIA_MS = 30 * 86_400_000;
const CUENTA_NUEVA_MS = 3_600_000;

type Origen = { ref: string; t: number };
type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const local = (): Almacen | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** Guarda el `?ref=` válido de la URL (el último gana). */
export function recordarOrigen(busqueda: string, ahora = Date.now(), almacen = local()): void {
  const ref = fuenteDeEnlace(busqueda);
  if (!ref || !almacen) return;
  try {
    almacen.setItem(CLAVE, JSON.stringify({ ref, t: ahora }));
  } catch {
    // Sin almacenamiento (modo privado): simplemente no se mide.
  }
}

export function origenGuardado(almacen = local()): Origen | null {
  try {
    const o = JSON.parse(almacen?.getItem(CLAVE) ?? "null");
    return o && typeof o.ref === "string" && typeof o.t === "number" ? o : null;
  } catch {
    return null;
  }
}

export function olvidarOrigen(almacen = local()): void {
  try {
    almacen?.removeItem(CLAVE);
  } catch {
    // nada que borrar
  }
}

/** El ref que toca pegarle a la cuenta: solo si es nueva (menos de 1 h), aún no tiene y el origen no venció. */
export function refParaCuenta(origen: Origen | null, creadaEn: string | undefined, yaTiene: unknown, ahora: number): string | null {
  if (!origen || yaTiene || !creadaEn) return null;
  if (ahora - Date.parse(creadaEn) > CUENTA_NUEVA_MS || ahora - origen.t > VIGENCIA_MS) return null;
  return origen.ref;
}
