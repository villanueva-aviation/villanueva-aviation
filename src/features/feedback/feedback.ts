import { supabase } from "../../lib/supabaseClient";

export interface Feedback {
  id: string;
  email: string;
  calificacion: number | null;
  lo_que_te_gusto: string | null;
  que_mejorarias: string;
  created_at: string;
}

export async function enviarFeedback(input: {
  userId: string;
  email: string;
  calificacion: number | null;
  loQueTeGusto: string;
  queMejorarias: string;
}) {
  return supabase.from("feedback").insert({
    user_id: input.userId,
    email: input.email,
    calificacion: input.calificacion,
    lo_que_te_gusto: input.loQueTeGusto || null,
    que_mejorarias: input.queMejorarias,
  });
}

export async function fetchTodoFeedback(): Promise<Feedback[]> {
  const { data } = await supabase
    .from("feedback")
    .select("id, email, calificacion, lo_que_te_gusto, que_mejorarias, created_at")
    .order("created_at", { ascending: false });
  return (data as Feedback[]) ?? [];
}
