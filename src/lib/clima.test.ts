import { test } from "node:test";
import assert from "node:assert/strict";
import {
  altitudDensidad, categoriaVuelo, componentesViento, fenomeno, techoFt, visibilidadSM,
} from "./clima.ts";

test("categoría: usa la peor de techo y visibilidad", () => {
  assert.equal(categoriaVuelo(3500, 6), "VFR");
  assert.equal(categoriaVuelo(2500, 10), "MVFR");
  assert.equal(categoriaVuelo(5000, 3), "MVFR"); // 3 SM es MVFR, no IFR
  assert.equal(categoriaVuelo(900, 10), "IFR");
  assert.equal(categoriaVuelo(5000, 2), "IFR");
  assert.equal(categoriaVuelo(400, 5), "LIFR");
  assert.equal(categoriaVuelo(null, 10), "VFR"); // sin techo
  assert.equal(categoriaVuelo(null, null), null);
});

test("techo: solo cuentan BKN y OVC", () => {
  const nubes = [
    { cover: "FEW", base: 1000 },
    { cover: "SCT", base: 1800 },
    { cover: "BKN", base: 3000 },
    { cover: "OVC", base: 8000 },
  ];
  assert.equal(techoFt(nubes), 3000);
  assert.equal(techoFt([{ cover: "SCT", base: 1800 }]), null);
});

test("viento cruzado: pista 27, viento 320/15 -> 11.5 cruzado y 9.6 de frente", () => {
  const c = componentesViento(320, 15, 27);
  assert.equal(c.cruzado.toFixed(1), "11.5");
  assert.equal(c.frente.toFixed(1), "9.6");
  assert.equal(c.lado, "derecha");
  assert.equal(componentesViento(220, 10, 27).lado, "izquierda");
  assert.ok(componentesViento(90, 10, 27).frente < 0); // viento de cola
});

test("altitud de densidad: ejemplo de la guía (5,000 ft, A3020, 24 °C) ≈ 6,900 ft", () => {
  const elevM = 5000 / 3.28084;
  const altimHpa = 30.2 / 0.02953;
  const r = altitudDensidad(elevM, altimHpa, 24);
  assert.ok(Math.abs(r.presion - 4720) < 5, `presión ${r.presion}`);
  assert.ok(Math.abs(r.densidad - 6930) < 15, `densidad ${r.densidad}`);
});

test("fenómenos: decodifica combinaciones y deja pasar códigos desconocidos", () => {
  assert.equal(fenomeno("TSRA"), "Tormenta con lluvia");
  assert.equal(fenomeno("+TSRA"), "Tormenta con lluvia, intensidad fuerte");
  assert.equal(fenomeno("-RA"), "Lluvia, intensidad ligera");
  assert.equal(fenomeno("VCTS"), "Tormenta en las cercanías");
  assert.equal(fenomeno("FZFG"), "Niebla engelante");
  assert.equal(fenomeno("XYZ"), "XYZ");
});

test("visibilidad: acepta 10+, fracciones y números", () => {
  assert.equal(visibilidadSM("10+"), 10);
  assert.equal(visibilidadSM("1 1/2"), 1.5);
  assert.equal(visibilidadSM("3/4"), 0.75);
  assert.equal(visibilidadSM(6), 6);
  assert.equal(visibilidadSM(null), null);
});
