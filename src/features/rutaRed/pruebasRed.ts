import { supabase } from "../../lib/supabaseClient";
import { DIAS_VIGENCIA_PRUEBA } from "../../lib/constants.ts";
import { cancelacionTardia, type IntentoRed, type ParteRed, type PruebaRed } from "./reglas.ts";

const COLUMNAS_PRUEBA = "id, user_id, etapa, bloque, monto, estado, pagado_at, vence_at";
const COLUMNAS_INTENTO =
  "id, prueba_id, user_id, numero, fecha, horario, partes, estado, aprobadas, criterio_fallado, notas, enlace_seguimiento, created_at";

type Resultado = { error: string | null };

const aResultado = (error: { message: string } | null): Resultado => ({ error: error?.message ?? null });

/** Id del usuario con sesión, o null. El fundador puede leer todas las filas, así que las lecturas "mías" filtran por user_id. */
async function miUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchMisPruebas(etapa: 1 | 2): Promise<PruebaRed[]> {
  const userId = await miUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("pruebas_red")
    .select(COLUMNAS_PRUEBA)
    .eq("user_id", userId)
    .eq("etapa", etapa)
    .order("bloque", { ascending: true });
  return (data as PruebaRed[]) ?? [];
}

/** Intentos de todos los bloques de la etapa (join por prueba_id); se quita el objeto del join y se devuelven IntentoRed planos. */
export async function fetchMisIntentos(etapa: 1 | 2): Promise<IntentoRed[]> {
  const userId = await miUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("intentos_prueba_red")
    .select(`${COLUMNAS_INTENTO}, pruebas_red!inner(etapa)`)
    .eq("user_id", userId)
    .eq("pruebas_red.etapa", etapa)
    .order("created_at", { ascending: true });
  return ((data as unknown as (IntentoRed & { pruebas_red?: unknown })[]) ?? []).map((fila) => {
    const { pruebas_red: _join, ...intento } = fila;
    return intento;
  });
}

/** `numero` lo recalcula el trigger de la base; se manda igual por el tipo de la columna. El estado queda en 'pendiente' por defecto. */
export async function agendarIntento(input: {
  pruebaId: string;
  numero: number;
  fecha: string;
  horario: string;
  partes: ParteRed[];
  enlaceSeguimiento: string;
}): Promise<Resultado> {
  const userId = await miUserId();
  if (!userId) return { error: "Inicia sesión para agendar." };
  const { error } = await supabase.from("intentos_prueba_red").insert({
    prueba_id: input.pruebaId,
    user_id: userId,
    numero: input.numero,
    fecha: input.fecha,
    horario: input.horario,
    partes: input.partes,
    enlace_seguimiento: input.enlaceSeguimiento,
  });
  return aResultado(error);
}

/** Dentro de las horas de cancelación el intento se cuenta ('cancelado_tarde'); el trigger de la base rechaza 'cancelado' en ese caso. */
export async function cancelarIntento(intento: IntentoRed, ahora: Date): Promise<Resultado> {
  const estado = cancelacionTardia(intento.fecha, intento.horario, ahora) ? "cancelado_tarde" : "cancelado";
  const { error } = await supabase.from("intentos_prueba_red").update({ estado }).eq("id", intento.id);
  return aResultado(error);
}

// ---------------------------------------------------------------------------
// Fundador
// ---------------------------------------------------------------------------

export type PruebaRedAdmin = PruebaRed & { email: string; intentos: IntentoRed[] };

/** Todos los bloques con el correo del cadete y sus intentos (por número); los más recientes primero. */
export async function fetchTodasPruebasRed(): Promise<PruebaRedAdmin[]> {
  const { data } = await supabase
    .from("pruebas_red")
    .select(`${COLUMNAS_PRUEBA}, email, intentos_prueba_red(${COLUMNAS_INTENTO})`)
    .order("pagado_at", { ascending: false });
  type Fila = PruebaRed & { email: string | null; intentos_prueba_red: IntentoRed[] | null };
  return ((data as unknown as Fila[]) ?? []).map(({ intentos_prueba_red, email, ...prueba }) => ({
    ...prueba,
    email: email ?? "",
    intentos: [...(intentos_prueba_red ?? [])].sort((a, b) => a.numero - b.numero),
  }));
}

export async function confirmarIntento(id: string): Promise<Resultado> {
  const { error } = await supabase.from("intentos_prueba_red").update({ estado: "confirmado" }).eq("id", id);
  return aResultado(error);
}

export async function registrarResultado(
  id: string,
  r: { aprobadas: ParteRed[]; criterio_fallado: string | null; notas: string | null },
): Promise<Resultado> {
  const { error } = await supabase
    .from("intentos_prueba_red")
    .update({ estado: "realizado", aprobadas: r.aprobadas, criterio_fallado: r.criterio_fallado, notas: r.notas })
    .eq("id", id);
  return aResultado(error);
}

export async function marcarNoSePresento(id: string): Promise<Resultado> {
  const { error } = await supabase.from("intentos_prueba_red").update({ estado: "no_se_presento" }).eq("id", id);
  return aResultado(error);
}

export async function marcarReembolsada(pruebaId: string): Promise<Resultado> {
  const { error } = await supabase.from("pruebas_red").update({ estado: "reembolsada" }).eq("id", pruebaId);
  return aResultado(error);
}

/** Regala un bloque (paquete de 4 asesorías): siguiente número de bloque de ese cadete y etapa, sin cobro. */
export async function darBloqueSinPago(userId: string, email: string, etapa: 1 | 2): Promise<Resultado> {
  const { data, error: errorLectura } = await supabase
    .from("pruebas_red")
    .select("bloque")
    .eq("user_id", userId)
    .eq("etapa", etapa)
    .order("bloque", { ascending: false })
    .limit(1);
  if (errorLectura) return aResultado(errorLectura);
  const bloque = ((data?.[0]?.bloque as number | undefined) ?? 0) + 1;
  const venceAt = new Date(Date.now() + DIAS_VIGENCIA_PRUEBA * 24 * 3600_000).toISOString();
  const { error } = await supabase.from("pruebas_red").insert({
    user_id: userId,
    email,
    etapa,
    bloque,
    paypal_order_id: `paquete-${crypto.randomUUID()}`,
    monto: 0,
    moneda: "USD",
    estado: "activa",
    vence_at: venceAt,
  });
  return aResultado(error);
}
