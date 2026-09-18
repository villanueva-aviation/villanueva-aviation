import { supabase } from "../../lib/supabaseClient";

export interface ModuloFeedbackRow {
  id: string;
  email: string;
  modulo_slug: string;
  calificacion: number;
  comentario: string | null;
  created_at: string;
}

export async function fetchMiCalificacionModulo(userId: string, moduloSlug: string): Promise<number | null> {
  const { data } = await supabase
    .from("modulo_feedback")
    .select("id")
    .eq("user_id", userId)
    .eq("modulo_slug", moduloSlug)
    .maybeSingle();
  return data ? 1 : null;
}

export async function enviarCalificacionModulo(input: {
  userId: string;
  email: string;
  moduloSlug: string;
  calificacion: number;
  comentario: string;
}) {
  return supabase.from("modulo_feedback").upsert(
    {
      user_id: input.userId,
      email: input.email,
      modulo_slug: input.moduloSlug,
      calificacion: input.calificacion,
      comentario: input.comentario || null,
    },
    { onConflict: "user_id,modulo_slug" },
  );
}

export async function fetchTodoModuloFeedback(): Promise<ModuloFeedbackRow[]> {
  const { data } = await supabase
    .from("modulo_feedback")
    .select("id, email, modulo_slug, calificacion, comentario, created_at")
    .order("created_at", { ascending: false });
  return (data as ModuloFeedbackRow[]) ?? [];
}
