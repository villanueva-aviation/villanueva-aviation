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
}

export type NuevoVueloAventura = Omit<VueloAventura, "id">;

const COLUMNS =
  "id, fecha, origen_icao, origen_nombre, origen_lat, origen_lon, destino_icao, destino_nombre, destino_lat, destino_lon, avion, minutos, distancia_nm, aterrizaje_fpm, red, video_url, notas";

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
