import {
  DIAS_VIGENCIA_PRUEBA,
  HORAS_CANCELACION,
  HORAS_SEMANA_PRUEBAS,
  INTENTOS_POR_BLOQUE,
  PRECIO_PRUEBA_RED,
  PRECIO_PRUEBA_RED_REPETICION,
} from "../../lib/constants.ts";
import { fuenteDeEnlace } from "../testNivel/reglas.ts";

export const PARTES_RED = ["autorizacion", "salida", "ruta_llegada", "aproximacion"] as const;
export type ParteRed = (typeof PARTES_RED)[number];

export const NOMBRE_PARTE: Record<ParteRed, string> = {
  autorizacion: "Autorización",
  salida: "Salida (SID)",
  ruta_llegada: "En ruta y llegada (STAR)",
  aproximacion: "Aproximación",
};

/** Criterios de no aprobación de una parte (texto visible). */
export const CRITERIOS_RED = ["Colacionó mal la autorización", "Se salió de la SID", "Comunicaciones poco claras o imprecisas"] as const;

/** Reglas de la prueba que se muestran en la ruta y en la página de la prueba. */
export const REGLAS_PRUEBA_RED = [
  `Si no te presentas, o cancelas con menos de ${HORAS_CANCELACION} horas de anticipación, se usa el intento.`,
  `Los intentos vencen ${DIAS_VIGENCIA_PRUEBA} días después del pago.`,
  `Si Erik no puede darte una fecha dentro de esos ${DIAS_VIGENCIA_PRUEBA} días, te devolvemos el pago.`,
  `Erik dedica ${HORAS_SEMANA_PRUEBAS} horas a la semana a las pruebas.`,
  "Para agendar necesitas tu callsign de IVAO o VATSIM, o tu enlace de Volanta, para que Erik pueda ver tu vuelo.",
];

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
const horaCita = (fecha: string, horario: string) => new Date(`${fecha}T${horario}:00-06:00`).getTime();

export function cancelacionTardia(fecha: string, horario: string, ahora: Date): boolean {
  return horaCita(fecha, horario) - ahora.getTime() < HORAS_CANCELACION * 3600_000;
}

/** La hora de la cita ya llegó: ya no se cancela, queda pendiente de calificación. */
export function citaPasada(fecha: string, horario: string, ahora: Date): boolean {
  return horaCita(fecha, horario) <= ahora.getTime();
}

/** La cita (hora de México) cae antes de que venza el bloque; el trigger de la base revisa lo mismo. */
export function antesDeVencer(fecha: string, horario: string, prueba: Pick<PruebaRed, "vence_at">): boolean {
  return horaCita(fecha, horario) < new Date(prueba.vence_at).getTime();
}

/** De qué publicación llegó (?ref=fb-ruta…): la del enlace actual gana; si no trae ?ref, la última guardada. */
export function fuenteRuta(busqueda: string, guardada: string | null): string | null {
  return fuenteDeEnlace(busqueda) ?? (guardada && /^[a-z0-9_-]{1,40}$/.test(guardada) ? guardada : null);
}
