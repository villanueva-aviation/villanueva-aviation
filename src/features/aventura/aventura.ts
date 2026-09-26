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
