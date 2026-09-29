import { supabase } from "../../lib/supabaseClient";

export interface QuizResult {
  score: number;
  passed: boolean;
  /** Fecha ISO del último intento; la usan los exámenes por avión para la espera tras reprobar. */
  fecha?: string;
}

export interface ProgresoRemoto {
  completadas: Record<string, string[]>;
  examenes: Record<string, QuizResult>;
}

export async function fetchProgresoRemoto(userId: string): Promise<ProgresoRemoto | null> {
  const { data } = await supabase
    .from("academia_progreso")
    .select("completadas, examenes")
    .eq("user_id", userId)
    .maybeSingle();
  return data as ProgresoRemoto | null;
}

export async function guardarProgresoRemoto(userId: string, progreso: ProgresoRemoto) {
  return supabase.from("academia_progreso").upsert({
    user_id: userId,
    completadas: progreso.completadas,
    examenes: progreso.examenes,
    updated_at: new Date().toISOString(),
  });
}
