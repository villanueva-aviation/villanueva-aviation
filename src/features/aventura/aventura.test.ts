import assert from "node:assert/strict";
import { test } from "node:test";
import { aeropuertosCompletados, distanciaNm, fechaMexico, formatoDuracion, resumenAventura } from "./calculos.ts";
import type { VueloAventura } from "./aventura.ts";

test("distanciaNm: Guadalajara a Ciudad de México ronda las 248 NM", () => {
  const nm = distanciaNm(20.5233, -103.3101, 19.4363, -99.0721);
  assert.ok(nm >= 245 && nm <= 251, `salió ${nm}`);
});

test("distanciaNm: el mismo punto es cero", () => {
  assert.equal(distanciaNm(20.5, -103.3, 20.5, -103.3), 0);
});

test("formatoDuracion", () => {
  assert.equal(formatoDuracion(45), "45 min");
  assert.equal(formatoDuracion(125), "2 h 05 min");
  assert.equal(formatoDuracion(60), "1 h 00 min");
});

test("resumenAventura cuenta cada aeropuerto una sola vez", () => {
  const v = (o: string, d: string, minutos: number, nm: number) =>
    ({ origen_icao: o, destino_icao: d, minutos, distancia_nm: nm }) as VueloAventura;
  const r = resumenAventura([v("MMGL", "MMMX", 60, 285), v("MMMX", "MMPB", 20, 60)]);
  assert.deepEqual(r, { vuelos: 2, aeropuertos: 3, minutos: 80, nm: 345 });
});

test("fechaMexico: 04:17 UTC del 15 es todavía el 14 en Guadalajara", () => {
  assert.equal(fechaMexico("2026-09-15T04:17:29.969Z"), "2026-09-14");
  assert.equal(fechaMexico("2026-09-15T18:00:00Z"), "2026-09-15");
});

test("aeropuertosCompletados: solo destinos, con la fecha de la primera vez", () => {
  const v = (d: string, fecha: string) => ({ destino_icao: d, destino_nombre: d, fecha }) as VueloAventura;
  const r = aeropuertosCompletados([v("MMLO", "2026-10-01"), v("MMQT", "2026-10-04"), v("MMLO", "2026-10-09")]);
  assert.deepEqual(r.map((a) => [a.icao, a.fecha]), [["MMLO", "2026-10-01"], ["MMQT", "2026-10-04"]]);
});
