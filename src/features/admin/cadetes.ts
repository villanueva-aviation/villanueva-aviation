import { supabase } from "../../lib/supabaseClient";
import { ACADEMIA_MODULOS } from "../../data/academia";

export interface Cadete {
  user_id: string;
  email: string;
  nombre: string | null;
  created_at: string;
}

interface ProgresoFila {
  user_id: string;
  completadas: Record<string, string[]>;
}

const TOTAL_ACTIVIDADES = ACADEMIA_MODULOS.reduce((sum, m) => sum + m.actividades.length, 0);

export async function fetchTodosCadetes(): Promise<Cadete[]> {
  const { data } = await supabase
    .from("profiles")
    .select("user_id, email, nombre, created_at")
    .order("created_at", { ascending: false });
  return (data as Cadete[]) ?? [];
}

/** Progreso general de Academia (%) por user_id, para todos los cadetes. */
export async function fetchProgresoPorCadete(): Promise<Record<string, number>> {
  const { data } = await supabase.from("academia_progreso").select("user_id, completadas");
  const filas = (data as ProgresoFila[]) ?? [];
  const porCadete: Record<string, number> = {};
  for (const fila of filas) {
    const completadas = Object.values(fila.completadas ?? {}).reduce((sum, arr) => sum + arr.length, 0);
    porCadete[fila.user_id] = TOTAL_ACTIVIDADES === 0 ? 0 : Math.round((completadas / TOTAL_ACTIVIDADES) * 100);
  }
  return porCadete;
}
