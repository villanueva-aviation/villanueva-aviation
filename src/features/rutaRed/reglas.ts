import { HORAS_CANCELACION, INTENTOS_POR_BLOQUE, PRECIO_PRUEBA_RED, PRECIO_PRUEBA_RED_REPETICION } from "../../lib/constants.ts";

export const PARTES_RED = ["autorizacion", "salida", "ruta_llegada", "aproximacion"] as const;
export type ParteRed = (typeof PARTES_RED)[number];

export const NOMBRE_PARTE: Record<ParteRed, string> = {
  autorizacion: "Autorización",
  salida: "Salida (SID)",
  ruta_llegada: "En ruta y llegada (STAR)",
  aproximacion: "Aproximación",
};

export type EstadoIntento = "pendiente" | "confirmado" | "realizado" | "no_se_presento" | "cancelado" | "cancelado_tarde";

export interface IntentoRed {
  id: string;
  prueba_id: string;
  user_id: string;
  numero: number;
  fecha: string;
  horario: string;
  partes: ParteRed[];
  estado: EstadoIntento;
  aprobadas: ParteRed[];
  criterio_fallado: string | null;
  notas: string | null;
  enlace_seguimiento: string;
  created_at: string;
}

export interface PruebaRed {
  id: string;
  user_id: string;
  etapa: 1 | 2;
  bloque: number;
  monto: number;
  estado: "activa" | "reembolsada";
  pagado_at: string;
  vence_at: string;
}

export type EstadoBloque = "activa" | "agotada" | "vencida" | "aprobada" | "reembolsada";

/** Partes aprobadas en intentos realizados, en el orden de PARTES_RED. */
export function partesAprobadas(intentos: IntentoRed[]): ParteRed[] {
  const ok = new Set(intentos.filter((i) => i.estado === "realizado").flatMap((i) => i.aprobadas));
  return PARTES_RED.filter((p) => ok.has(p));
}

export function partesPendientes(intentos: IntentoRed[]): ParteRed[] {
  const ok = new Set(partesAprobadas(intentos));
  return PARTES_RED.filter((p) => !ok.has(p));
}

export function insigniaGanada(intentos: IntentoRed[]): boolean {
  return partesPendientes(intentos).length === 0;
}

export function intentosUsados(intentos: IntentoRed[]): number {
  return intentos.filter((i) => i.estado === "realizado" || i.estado === "no_se_presento" || i.estado === "cancelado_tarde").length;
}

/** `intentos` son los del bloque; para "aprobada" hay que pasar todos los de la etapa. */
export function estadoBloque(prueba: PruebaRed, intentos: IntentoRed[], ahora: Date): EstadoBloque {
  if (prueba.estado === "reembolsada") return "reembolsada";
  if (insigniaGanada(intentos)) return "aprobada";
  if (intentosUsados(intentos) >= INTENTOS_POR_BLOQUE) return "agotada";
  if (ahora.getTime() > new Date(prueba.vence_at).getTime()) return "vencida";
  return "activa";
}

export function puedeAgendar(prueba: PruebaRed, intentosBloque: IntentoRed[], intentosEtapa: IntentoRed[], ahora: Date): boolean {
  if (insigniaGanada(intentosEtapa)) return false;
  if (estadoBloque(prueba, intentosBloque, ahora) !== "activa") return false;
  return !intentosBloque.some((i) => i.estado === "pendiente" || i.estado === "confirmado");
}

/** Precio del siguiente bloque que se puede comprar, o null si no se puede (hay uno activo o ya hay insignia). */
export function precioSiguienteBloque(pruebasEtapa: PruebaRed[], intentosEtapa: IntentoRed[], ahora: Date): "32" | "16" | null {
  if (insigniaGanada(intentosEtapa)) return null;
  const vigentes = pruebasEtapa.filter((p) => p.estado !== "reembolsada");
  if (vigentes.length === 0) return PRECIO_PRUEBA_RED;
  const ultimo = vigentes.reduce((a, b) => (b.bloque > a.bloque ? b : a));
  const estado = estadoBloque(
    ultimo,
    intentosEtapa.filter((i) => i.prueba_id === ultimo.id),
    ahora,
  );
  return estado === "activa" ? null : PRECIO_PRUEBA_RED_REPETICION;
}

export function partesDelSiguienteIntento(intentosEtapa: IntentoRed[]): ParteRed[] {
  return intentosEtapa.some((i) => i.estado === "realizado") ? partesPendientes(intentosEtapa) : [...PARTES_RED];
}

/** fecha "YYYY-MM-DD", horario "HH:00" en hora de México (UTC-6 fijo, sin horario de verano). */
export function cancelacionTardia(fecha: string, horario: string, ahora: Date): boolean {
  const cita = new Date(`${fecha}T${horario}:00-06:00`).getTime();
  return cita - ahora.getTime() < HORAS_CANCELACION * 3600_000;
}
