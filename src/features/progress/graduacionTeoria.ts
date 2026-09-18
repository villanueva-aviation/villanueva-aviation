import { supabase } from "../../lib/supabaseClient";

export interface Graduado {
  user_id: string;
  email: string;
  completado_en: string;
  reconocido: boolean;
}

/** Registra la graduación del cadete la primera vez que llega a 100% de teoría. Se ignora si ya existe. */
export async function marcarGraduacionTeoria(userId: string, email: string) {
  return supabase.from("graduados_teoria").upsert({ user_id: userId, email }, { onConflict: "user_id", ignoreDuplicates: true });
}

export async function fetchGraduados(): Promise<Graduado[]> {
  const { data } = await supabase
    .from("graduados_teoria")
    .select("user_id, email, completado_en, reconocido")
    .order("completado_en", { ascending: false });
  return (data as Graduado[]) ?? [];
}

export async function marcarReconocido(userId: string) {
  return supabase.from("graduados_teoria").update({ reconocido: true }).eq("user_id", userId);
}

export async function contarGraduadosPorReconocer(): Promise<number> {
  const { count } = await supabase
    .from("graduados_teoria")
    .select("user_id", { count: "exact", head: true })
    .eq("reconocido", false);
  return count ?? 0;
}
