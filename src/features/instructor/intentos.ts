import { supabase } from "../../lib/supabaseClient";
import type { ResultadoComun } from "./maniobras.ts";
import { LECCIONES_GUARDADAS, type IntentoManiobra } from "./reglasIntentos.ts";
import type { Grabacion } from "./recorrido.ts";

const COLUMNAS =
  "id, user_id, maniobra, avion, modo, calificacion, aprobado, elementos, detalle, revision, revisado_at, created_at, sesion_id";

type Escritura = { error: string | null };

async function miUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function guardarIntento(input: {
  maniobra: string;
  avion: string;
  modo: "practica" | "checkride";
  resultado: ResultadoComun;
  /** Lo que se guarda en `detalle`: `def.paraGuardar(resultado)`. */
  detalle: object;
  /** Solo desde la sesión del programa. */
  sesionId?: string;
}): Promise<{ id: string | null; error: string | null }> {
  const userId = await miUserId();
  if (!userId) return { id: null, error: "Inicia sesión para guardar el intento." };
  const r = input.resultado;
  const { data, error } = await supabase
    .from("intentos_maniobra")
    .insert({
      user_id: userId,
      maniobra: input.maniobra,
      avion: input.avion,
      modo: input.modo,
      calificacion: r.calificacion,
      aprobado: r.aprobado,
      elementos: r.elementos,
      detalle: input.detalle,
      ...(input.sesionId ? { sesion_id: input.sesionId } : {}),
    })
    .select("id")
    .single();
  return { id: (data?.id as string | undefined) ?? null, error: error?.message ?? null };
}

/** Lanza si falla o no hay sesión. El fundador lee todo, así que se filtra por user_id. */
export async function fetchMisIntentosManiobra(maniobra: string): Promise<IntentoManiobra[]> {
  const userId = await miUserId();
  if (!userId) throw new Error("Sin sesión");
  const { data, error } = await supabase
    .from("intentos_maniobra")
    .select(COLUMNAS)
    .eq("user_id", userId)
    .eq("maniobra", maniobra)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as IntentoManiobra[]) ?? [];
}

/** Un renglón por id: el dueño lee el suyo, el fundador cualquiera (RLS). */
export async function fetchIntento(id: string): Promise<IntentoManiobra | null> {
  const { data, error } = await supabase.from("intentos_maniobra").select(COLUMNAS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as IntentoManiobra | null) ?? null;
}

/** Los renglones de lección propios, el más nuevo primero. */
export async function fetchMisLecciones(): Promise<{ id: string; maniobra: string; created_at: string }[]> {
  const userId = await miUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("intentos_maniobra")
    .select("id, maniobra, created_at")
    .eq("user_id", userId)
    .in("maniobra", Object.keys(LECCIONES_GUARDADAS))
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as { id: string; maniobra: string; created_at: string }[]) ?? [];
}

// El recorrido del mapa va en su propia tabla: el panel trae `detalle` de cientos de renglones y no debe cargar los puntos.
export async function guardarRecorrido(intentoId: string, grabacion: Grabacion): Promise<Escritura> {
  const userId = await miUserId();
  if (!userId) return { error: "Inicia sesión para guardar el recorrido." };
  const { error } = await supabase.from("recorridos_leccion").insert({ intento_id: intentoId, user_id: userId, grabacion });
  return { error: error?.message ?? null };
}

/** null si ese vuelo no tiene recorrido guardado; lanza si falla la consulta. */
export async function fetchRecorrido(intentoId: string): Promise<Grabacion | null> {
  const { data, error } = await supabase.from("recorridos_leccion").select("grabacion").eq("intento_id", intentoId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.grabacion as Grabacion | undefined) ?? null;
}

/** La base rechaza todo lo que no sea un checkride aprobado sin mandar (policy + trigger). */
export async function mandarARevision(id: string): Promise<Escritura> {
  const { error } = await supabase.from("intentos_maniobra").update({ revision: "mandado" }).eq("id", id);
  return { error: error?.message ?? null };
}

// Fundador

export async function fetchPorRevisar(): Promise<(IntentoManiobra & { email: string | null })[]> {
  const { data, error } = await supabase
    .from("intentos_maniobra")
    .select(`${COLUMNAS}, email`)
    .eq("revision", "mandado")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as (IntentoManiobra & { email: string | null })[]) ?? [];
}

/** Intentos de las sesiones del programa, del más nuevo al más viejo (el fundador lee todo). */
export async function fetchSesionesRecientes(limite = 200): Promise<(IntentoManiobra & { email: string | null })[]> {
  const { data, error } = await supabase
    .from("intentos_maniobra")
    .select(`${COLUMNAS}, email`)
    .not("sesion_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return (data as (IntentoManiobra & { email: string | null })[]) ?? [];
}

export async function contarPorRevisar(): Promise<number> {
  const { count, error } = await supabase
    .from("intentos_maniobra")
    .select("id", { count: "exact", head: true })
    .eq("revision", "mandado");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function revisarIntento(id: string, aprobado: boolean): Promise<Escritura> {
  const { error } = await supabase
    .from("intentos_maniobra")
    .update({ revision: aprobado ? "aprobado" : "no_aprobado" })
    .eq("id", id);
  return { error: error?.message ?? null };
}
