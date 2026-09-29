import { supabase } from "../../lib/supabaseClient";
import { PREFIJO_INSIGNIA_PRACTICA, PREFIJO_PROYECTO_FINAL } from "../payments/reglasSesiones";

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
  tiempo_escritura_segundos: number | null;
  created_at: string;
}

const COLUMNS =
  "id, user_id, email, tipo, tema, fecha_preferida, horario_preferido, comentarios, estado, motivo_revision, tiempo_escritura_segundos, created_at";

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

export const temaProyectoFinal = (moduloTitulo: string) => `${PREFIJO_PROYECTO_FINAL} ${moduloTitulo}`;

export const temaInsigniaPractica = (modelo: string) => `${PREFIJO_INSIGNIA_PRACTICA} ${modelo}`;

/** Temas de los vuelos prácticos que el fundador ya aprobó (estado "completada") a este cadete. */
export async function fetchPracticosAprobados(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("reservas")
    .select("tema")
    .eq("user_id", userId) // el fundador puede leer todas las filas; aquí solo cuentan las suyas
    .eq("estado", "completada")
    .like("tema", `${PREFIJO_INSIGNIA_PRACTICA}%`);
  return (data ?? []).map((r) => r.tema as string);
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
