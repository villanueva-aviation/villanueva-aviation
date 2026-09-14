import { supabase } from "../../lib/supabaseClient";

export interface Reserva {
  id: string;
  user_id: string;
  email: string;
  tipo: "revision" | "examen";
  tema: string | null;
  fecha_preferida: string | null;
  horario_preferido: string | null;
  comentarios: string | null;
  estado: string;
  created_at: string;
}

const COLUMNS = "id, user_id, email, tipo, tema, fecha_preferida, horario_preferido, comentarios, estado, created_at";

export async function fetchTodasReservas(): Promise<Reserva[]> {
  const { data } = await supabase.from("reservas").select(COLUMNS).order("created_at", { ascending: false });
  return (data as Reserva[]) ?? [];
}

export async function actualizarEstadoReserva(id: string, estado: string) {
  return supabase.from("reservas").update({ estado }).eq("id", id);
}
