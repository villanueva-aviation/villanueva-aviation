import { supabase } from "../../lib/supabaseClient";

export interface PagoSesion {
  reserva_id: string;
  estado: string;
}

export async function fetchMisPagosSesiones(): Promise<PagoSesion[]> {
  const { data } = await supabase.from("pagos_sesiones").select("reserva_id, estado").eq("estado", "completado");
  return (data as PagoSesion[]) ?? [];
}

/** Todas las sesiones pagadas (solo el fundador puede leerlas, por RLS). */
export async function fetchTodosPagosSesiones(): Promise<PagoSesion[]> {
  const { data } = await supabase
    .from("pagos_sesiones")
    .select("reserva_id, estado")
    .eq("estado", "completado");
  return (data as PagoSesion[]) ?? [];
}
