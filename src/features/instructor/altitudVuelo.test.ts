import { test } from "node:test";
import assert from "node:assert/strict";
import { AEROPUERTO_PRUEBA as A } from "./aeropuertoSim.ts";
import { altitudValida, rangoAltitud, TECHO_FT, textoRango, PISO_GLOBAL_FT } from "./altitudVuelo.ts";

const ELEV = Math.round(A.elevacionFt); // MMGL de prueba: 5,016 ft

test("IFR: entre la elevación + 1,000 y 18,000; la sugerida es la de siempre", () => {
  const r = rangoAltitud({ programa: "ifr", maniobra: "interceptar-radial" }, ELEV);
  assert.equal(r.minFt, ELEV + 1000);
  assert.equal(r.maxFt, TECHO_FT);
  assert.equal(r.fijo, false);
  assert.equal(r.sugeridaFt, 9000);
  assert.equal(r.sinAeropuerto, false);
});

test("VFR normal: entre la elevación + 1,500 y 18,000; la sugerida es la mínima", () => {
  const r = rangoAltitud({ maniobra: "recto-nivelado" }, ELEV);
  assert.equal(r.minFt, ELEV + 1500);
  assert.equal(r.maxFt, TECHO_FT);
  assert.equal(r.sugeridaFt, ELEV + 1500);
});

test("«S» y ochos: la banda de la maniobra (600–1,000 AGL) y la sugerida al centro", () => {
  for (const m of ["s-camino", "ocho-pilones", "ocho-alrededor"] as const) {
    const r = rangoAltitud({ maniobra: m }, ELEV);
    assert.equal(r.minFt, ELEV + 600, m);
    assert.equal(r.maxFt, ELEV + 1000, m);
    assert.equal(r.sugeridaFt, 5800, m);
  }
});

test("toques y despegues: la altitud del circuito, una sola", () => {
  const r = rangoAltitud({ maniobra: "toques-despegues" }, ELEV);
  assert.equal(r.minFt, ELEV + 1000);
  assert.equal(r.maxFt, ELEV + 1000);
  assert.equal(r.fijo, true);
  assert.equal(r.sugeridaFt, ELEV + 1000);
});

test("sin aeropuerto: el rango global y se revalida al conectar", () => {
  const vfr = rangoAltitud({ maniobra: "recto-nivelado" }, undefined);
  assert.deepEqual(vfr, { minFt: PISO_GLOBAL_FT, maxFt: TECHO_FT, fijo: false, sugeridaFt: 1500, sinAeropuerto: true });
  assert.equal(rangoAltitud({ programa: "ifr" }, NaN).sugeridaFt, 3000);
});

test("altitudValida: dentro del rango sí; vacía, fuera o sin rango, no", () => {
  const r = rangoAltitud({ maniobra: "recto-nivelado" }, ELEV);
  assert.equal(altitudValida(ELEV + 1500, r), true);
  assert.equal(altitudValida(ELEV + 1499, r), false);
  assert.equal(altitudValida(TECHO_FT + 1, r), false);
  assert.equal(altitudValida(null, r), false);
  assert.equal(altitudValida(undefined, r), false);
  assert.equal(altitudValida(NaN, r), false);
  assert.equal(altitudValida(5000, null), false);
});

test("textoRango: el rango o, si es fijo, la altitud; sin acentos en inglés", () => {
  assert.equal(textoRango(rangoAltitud({ maniobra: "recto-nivelado" }, ELEV), "es"), "Entre 6,516 y 18,000 ft.");
  assert.equal(textoRango(rangoAltitud({ maniobra: "recto-nivelado" }, ELEV), "en"), "Between 6,516 and 18,000 ft.");
  assert.equal(textoRango(rangoAltitud({ maniobra: "toques-despegues" }, ELEV), "es"), "Esta lección se vuela a 6,016 ft.");
  for (const x of [textoRango(rangoAltitud({ maniobra: "recto-nivelado" }, ELEV), "en"), textoRango(rangoAltitud({ maniobra: "toques-despegues" }, ELEV), "en")])
    assert.doesNotMatch(x, /[áéíóúñ¿¡]/, x);
});

test("sin aeropuerto no se puede empezar: la sugerida sin elevación quedaría bajo el terreno", () => {
  const r = rangoAltitud({ programa: "ifr" }, undefined);
  assert.equal(altitudValida(3000, r), false);
  assert.equal(altitudValida(9000, r), false);
});
