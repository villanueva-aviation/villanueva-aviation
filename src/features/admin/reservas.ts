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
  motivo_revision: string | null;
  created_at: string;
}

const COLUMNS =
  "id, user_id, email, tipo, tema, fecha_preferida, horario_preferido, comentarios, estado, motivo_revision, created_at";

export async function fetchTodasReservas(): Promise<Reserva[]> {
  const { data } = await supabase.from("reservas").select(COLUMNS).order("created_at", { ascending: false });
  return (data as Reserva[]) ?? [];
}

export async function actualizarEstadoReserva(id: string, estado: string) {
  return supabase.from("reservas").update({ estado, motivo_revision: null }).eq("id", id);
}

export async function rechazarReserva(id: string, motivo: string) {
  return supabase.from("reservas").update({ estado: "rechazada", motivo_revision: motivo }).eq("id", id);
}

/** Reservas propias (cadete) que coinciden con un tema exacto, más recientes primero. RLS ya limita a las del usuario actual. */
export async function fetchMisReservasPorTema(tema: string): Promise<Reserva[]> {
  const { data } = await supabase
    .from("reservas")
    .select(COLUMNS)
    .eq("tema", tema)
    .order("created_at", { ascending: false });
  return (data as Reserva[]) ?? [];
}

export async function contarReservasPendientes(): Promise<number> {
  const { count } = await supabase
    .from("reservas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente");
  return count ?? 0;
}
