import { supabase } from "../../lib/supabaseClient";

export type RedAventura = "ivao" | "vatsim" | "ninguna";

export interface VueloAventura {
  id: string;
  fecha: string;
  origen_icao: string;
  origen_nombre: string;
  origen_lat: number;
  origen_lon: number;
  destino_icao: string;
  destino_nombre: string;
  destino_lat: number;
  destino_lon: number;
  avion: string;
  minutos: number;
  distancia_nm: number;
  aterrizaje_fpm: number | null;
  red: RedAventura;
  video_url: string | null;
  notas: string | null;
  como_lo_hice: string | null;
  plan_imagen_path: string | null;
  plan_archivo_path: string | null;
  plan_archivo_nombre: string | null;
}

export type NuevoVueloAventura = Omit<VueloAventura, "id">;

const COLUMNS =
  "id, fecha, origen_icao, origen_nombre, origen_lat, origen_lon, destino_icao, destino_nombre, destino_lat, destino_lon, avion, minutos, distancia_nm, aterrizaje_fpm, red, video_url, notas, como_lo_hice, plan_imagen_path, plan_archivo_path, plan_archivo_nombre";

/** Del primer vuelo al último: así se lee la aventura y así se dibuja la ruta. */
export async function fetchVuelosAventura(): Promise<VueloAventura[]> {
  const { data } = await supabase
    .from("aventura_vuelos")
    .select(COLUMNS)
    .order("fecha", { ascending: true })
    .order("created_at", { ascending: true });
  return (data as VueloAventura[]) ?? [];
}

export async function insertarVueloAventura(vuelo: NuevoVueloAventura) {
  return supabase.from("aventura_vuelos").insert(vuelo);
}

export async function borrarVueloAventura(id: string) {
  return supabase.from("aventura_vuelos").delete().eq("id", id);
}

/** Un vuelo tal como lo devuelve la función volanta-vuelos (que consulta Volanta). */
export interface VueloVolanta {
  id: string;
  /** UTC, ISO */
  salida: string;
  minutos: number;
  /** 0 = Volanta no registró aterrizaje */
  aterrizaje: number;
  origen: string;
  destino: string;
  avion: string;
  matricula: string | null;
}

export async function fetchVuelosVolanta(): Promise<{ vuelos: VueloVolanta[]; error: string | null }> {
  const { data, error } = await supabase.functions.invoke("volanta-vuelos");
  if (error) return { vuelos: [], error: "No se pudo llegar a la función (¿ya está desplegada?)." };
  if (!data?.ok) return { vuelos: [], error: data?.motivo ?? "Volanta no respondió." };
  return { vuelos: data.vuelos as VueloVolanta[], error: null };
}

export interface ProximoDestino {
  icao: string;
  nombre: string;
  lat: number;
  lon: number;
}

export async function fetchProximo(): Promise<ProximoDestino | null> {
  const { data } = await supabase.from("aventura_proximo").select("icao, nombre, lat, lon").maybeSingle();
  return data ? { ...data, lat: Number(data.lat), lon: Number(data.lon) } : null;
}

export async function guardarProximo(p: ProximoDestino) {
  return supabase.from("aventura_proximo").upsert({ id: true, ...p, updated_at: new Date().toISOString() });
}

export async function borrarProximo() {
  return supabase.from("aventura_proximo").delete().eq("id", true);
}

const BUCKET_IMAGENES = "aventura-imagenes";
const BUCKET_PLANES = "aventura-planes";

/** Sube el archivo con un nombre único (para no pisar otro) y devuelve su ruta en el bucket. */
export async function subirArchivo(tipo: "imagen" | "plan", archivo: File): Promise<{ path: string | null; error: string | null }> {
  const path = `${crypto.randomUUID()}-${archivo.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from(tipo === "imagen" ? BUCKET_IMAGENES : BUCKET_PLANES).upload(path, archivo);
  return error ? { path: null, error: error.message } : { path, error: null };
}

export async function borrarArchivos(vuelo: Pick<VueloAventura, "plan_imagen_path" | "plan_archivo_path">) {
  if (vuelo.plan_imagen_path) await supabase.storage.from(BUCKET_IMAGENES).remove([vuelo.plan_imagen_path]);
  if (vuelo.plan_archivo_path) await supabase.storage.from(BUCKET_PLANES).remove([vuelo.plan_archivo_path]);
}

export function urlImagenPlan(path: string): string {
  return supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(path).data.publicUrl;
}

/** Enlace temporal (2 min) para descargar el plan. Solo funciona con sesión iniciada. */
export async function urlDescargaPlan(path: string, nombre: string | null): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET_PLANES).createSignedUrl(path, 120, { download: nombre ?? true });
  return data?.signedUrl ?? null;
}
