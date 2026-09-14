import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";

export type RedVuelo = "ninguna" | "vatsim" | "ivao";

export interface VueloPractica {
  id: string;
  user_id: string;
  email: string;
  maniobra_id: string;
  maniobra_titulo: string;
  fecha: string;
  matricula: string | null;
  tiempo: number;
  notas: string | null;
  estado: "pendiente" | "confirmado";
  created_at: string;
  confirmado_at: string | null;
  red: RedVuelo;
  identificador: string | null;
}

const COLUMNS =
  "id, user_id, email, maniobra_id, maniobra_titulo, fecha, matricula, tiempo, notas, estado, created_at, confirmado_at, red, identificador";

/** Enlace público para verificar el historial de vuelos de una red online, cuando existe uno confiable. */
export function enlaceVerificacion(red: RedVuelo, identificador: string | null): string | null {
  if (!identificador) return null;
  if (red === "vatsim") return `https://statsim.net/flights/vatsimid/?vatsimid=${encodeURIComponent(identificador)}`;
  if (red === "ivao") return "https://tracker.ivao.aero";
  return null;
}

export async function fetchMisVuelos(userId: string): Promise<VueloPractica[]> {
  const { data } = await supabase
    .from("vuelos_practica")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as VueloPractica[]) ?? [];
}

export async function registrarVuelo(input: {
  userId: string;
  email: string;
  maniobraId: string;
  maniobraTitulo: string;
  fecha: string;
  matricula: string;
  tiempo: number;
  red: RedVuelo;
  identificador: string;
}) {
  return supabase.from("vuelos_practica").insert({
    user_id: input.userId,
    email: input.email,
    maniobra_id: input.maniobraId,
    maniobra_titulo: input.maniobraTitulo,
    fecha: input.fecha,
    matricula: input.matricula || null,
    tiempo: input.tiempo,
    red: input.red,
    identificador: input.identificador || null,
  });
}

export async function fetchPendientes(): Promise<VueloPractica[]> {
  const { data } = await supabase
    .from("vuelos_practica")
    .select(COLUMNS)
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });
  return (data as VueloPractica[]) ?? [];
}

export async function confirmarVuelo(id: string) {
  return supabase
    .from("vuelos_practica")
    .update({ estado: "confirmado", confirmado_at: new Date().toISOString() })
    .eq("id", id);
}

export async function fetchHorasConfirmadas(userId: string): Promise<number> {
  const { data } = await supabase
    .from("vuelos_practica")
    .select("tiempo")
    .eq("user_id", userId)
    .eq("estado", "confirmado");
  return (data ?? []).reduce((sum, r) => sum + Number((r as { tiempo: number }).tiempo), 0);
}

/** Horas de práctica de vuelo ya confirmadas por el fundador para el cadete actual. */
export function useHorasVueloConfirmadas() {
  const { user } = useAuth();
  const [horas, setHoras] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchHorasConfirmadas(user.id).then(setHoras);
  }, [user]);

  return horas;
}
