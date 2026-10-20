import { test } from "node:test";
import assert from "node:assert/strict";
import {
  antesDeVencer,
  cancelacionTardia,
  citaPasada,
  estadoBloque,
  insigniaGanada,
  intentosUsados,
  partesAprobadas,
  partesDelSiguienteIntento,
  partesPendientes,
  precioSiguienteBloque,
  puedeAgendar,
  type EstadoIntento,
  type IntentoRed,
  type ParteRed,
  type PruebaRed,
} from "./reglas.ts";

let n = 0;
const intento = (estado: EstadoIntento, aprobadas: ParteRed[] = [], prueba_id = "p1"): IntentoRed => ({
  id: `i${++n}`,
  prueba_id,
  user_id: "u1",
  numero: n,
  fecha: "2026-11-10",
  horario: "18:00",
  partes: ["autorizacion", "salida", "ruta_llegada", "aproximacion"],
  estado,
  aprobadas,
  criterio_fallado: null,
  notas: null,
  enlace_seguimiento: "https://example.com/seguimiento",
  created_at: "2026-11-01T00:00:00Z",
});

const prueba = (extra: Partial<PruebaRed> = {}): PruebaRed => ({
  id: "p1",
  user_id: "u1",
  etapa: 1,
  bloque: 1,
  monto: 32,
  estado: "activa",
  pagado_at: "2026-11-01T00:00:00Z",
  vence_at: "2026-12-01T00:00:00Z",
  ...extra,
});

const AHORA = new Date("2026-11-05T12:00:00Z");
const VENCIDO = new Date("2026-12-02T00:00:00Z");
const MITAD_1 = intento("realizado", ["autorizacion", "salida"]);
const MITAD_2 = intento("realizado", ["ruta_llegada", "aproximacion"]);
const TRES = [intento("realizado"), intento("no_se_presento"), intento("cancelado_tarde")];

test("la insignia se gana con las 4 partes, aunque sea en intentos distintos", () => {
  assert.equal(insigniaGanada([MITAD_1, MITAD_2]), true);
  assert.equal(insigniaGanada([MITAD_1]), false);
  assert.equal(insigniaGanada([MITAD_1, intento("realizado", ["ruta_llegada"])]), false);
});

test("solo cuentan las partes de intentos realizados", () => {
  const pendiente = intento("pendiente", ["ruta_llegada"]);
  assert.deepEqual(partesAprobadas([MITAD_1, pendiente]), ["autorizacion", "salida"]);
  assert.deepEqual(partesPendientes([MITAD_1, pendiente]), ["ruta_llegada", "aproximacion"]);
});

test("el siguiente intento: las 4 sin intentos realizados, si no las pendientes", () => {
  assert.deepEqual(partesDelSiguienteIntento([]), ["autorizacion", "salida", "ruta_llegada", "aproximacion"]);
  assert.deepEqual(partesDelSiguienteIntento([MITAD_1]), ["ruta_llegada", "aproximacion"]);
});

test("intentosUsados cuenta realizado, no_se_presento y cancelado_tarde", () => {
  assert.equal(intentosUsados([...TRES, intento("cancelado"), intento("pendiente"), intento("confirmado")]), 3);
});

test("estadoBloque y su prioridad", () => {
  assert.equal(estadoBloque(prueba(), [], AHORA), "activa");
  assert.equal(estadoBloque(prueba(), TRES, AHORA), "agotada");
  assert.equal(estadoBloque(prueba(), [], VENCIDO), "vencida");
  assert.equal(estadoBloque(prueba(), [...TRES, MITAD_1, MITAD_2], AHORA), "aprobada");
  assert.equal(estadoBloque(prueba({ estado: "reembolsada" }), [...TRES, MITAD_1, MITAD_2], VENCIDO), "reembolsada");
});

test("precioSiguienteBloque", () => {
  assert.equal(precioSiguienteBloque([], [], AHORA), "32");
  assert.equal(precioSiguienteBloque([prueba({ estado: "reembolsada" })], [], AHORA), "32");
  assert.equal(precioSiguienteBloque([prueba()], [], AHORA), null);
  assert.equal(precioSiguienteBloque([prueba()], TRES, AHORA), "16");
  assert.equal(precioSiguienteBloque([prueba()], [], VENCIDO), "16");
  assert.equal(precioSiguienteBloque([prueba()], [MITAD_1, MITAD_2], AHORA), null);
  // bloque 1 agotado pero ya hay un bloque 2 activo: no se puede comprar otro
  assert.equal(precioSiguienteBloque([prueba(), prueba({ id: "p2", bloque: 2 })], TRES, AHORA), null);
});

test("puedeAgendar", () => {
  assert.equal(puedeAgendar(prueba(), [], [], AHORA), true);
  assert.equal(puedeAgendar(prueba(), [intento("pendiente")], [], AHORA), false);
  assert.equal(puedeAgendar(prueba(), [intento("confirmado")], [], AHORA), false);
  assert.equal(puedeAgendar(prueba(), [], [], VENCIDO), false);
  assert.equal(puedeAgendar(prueba(), TRES, TRES, AHORA), false);
  assert.equal(puedeAgendar(prueba(), [MITAD_1], [MITAD_1, MITAD_2], AHORA), false);
});

test("cancelación tardía: menos de 24 h para la cita (hora de México, UTC-6)", () => {
  // 18:00 en México = 2026-11-11T00:00Z
  assert.equal(cancelacionTardia("2026-11-10", "18:00", new Date("2026-11-10T00:30:00Z")), true);
  assert.equal(cancelacionTardia("2026-11-10", "18:00", new Date("2026-11-08T23:00:00Z")), false);
});

test("antesDeVencer compara la cita en hora de México con vence_at", () => {
  const prueba = { vence_at: "2026-11-11T00:00:00Z" }; // 10 nov 18:00 en México
  assert.equal(antesDeVencer("2026-11-10", "17:00", prueba), true);
  assert.equal(antesDeVencer("2026-11-10", "18:00", prueba), false);
  assert.equal(antesDeVencer("2026-11-10", "21:00", prueba), false);
});

test("citaPasada: hora de México, la cita ya llegó", () => {
  // 18:00 en México (UTC-6) = 00:00 UTC del día siguiente.
  assert.equal(citaPasada("2026-11-10", "18:00", new Date("2026-11-10T23:59:00Z")), false);
  assert.equal(citaPasada("2026-11-10", "18:00", new Date("2026-11-11T00:00:00Z")), true);
});
