import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import type { EvaluacionVuelo, FaseVuelo } from "./fasesVuelo.ts";
import { crearRepaso, type EstadoRepaso, type EtapaRepaso } from "./repaso.ts";
import type { ManiobraId } from "./maniobras.ts";
import { CAMPO_PUNTO, crearGrabador, faseMapa, grabarMuestra, grabarVoz, puntoEn, type Punto } from "./recorrido.ts";

const muestra = (x: Partial<Muestra> = {}): Muestra => ({
  t: 0, inclinacion: 0, altitud: 6500, velocidad: 100, rumbo: 90, bola: 0, agl: 1500, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk", lat: 20.5, lon: -103.3, ...x,
});

const estado = (etapa: EtapaRepaso, fase: FaseVuelo = "vuelo", sorteo: ManiobraId[] = ["recto-nivelado"]): EstadoRepaso => ({
  ...crearRepaso("practica", sorteo),
  etapa,
  vuelo: { fase } as EvaluacionVuelo,
});

test("un punto por segundo, redondeado", () => {
  const g = crearGrabador();
  const e = estado("salida");
  for (let k = 0; k < 50; k++) grabarMuestra(g, muestra({ t: k * 0.1, lat: 20.123456789, bola: 0.12345 }), e);
  assert.equal(g.puntos.length, 5);
  assert.equal(g.puntos[0][CAMPO_PUNTO.lat], 20.12346);
  assert.equal(g.puntos[0][CAMPO_PUNTO.bola], 0.12);
  assert.equal(g.puntos[0][CAMPO_PUNTO.altitud], 6500);
});

test("sin lat/lon no se graba punto", () => {
  const g = crearGrabador();
  grabarMuestra(g, muestra({ lat: undefined, lon: undefined }), estado("salida"));
  assert.equal(g.puntos.length, 0);
});

test("fases del mapa según la etapa de la lección y la fase del vuelo", () => {
  assert.equal(faseMapa(estado("rampa", "rampa")), "rodaje");
  assert.equal(faseMapa(estado("rampa", "rodaje")), "rodaje");
  assert.equal(faseMapa(estado("rampa", "carrera-despegue")), "despegue");
  assert.equal(faseMapa(estado("salida")), "despegue");
  assert.equal(faseMapa(estado("maniobra")), "zona");
  assert.equal(faseMapa(estado("fuera-de-zona")), "zona");
  assert.equal(faseMapa(estado("regreso", "vuelo")), "aterrizaje");
  assert.equal(faseMapa(estado("regreso", "carrera-aterrizaje")), "aterrizaje");
  assert.equal(faseMapa(estado("regreso", "rodaje-regreso")), "rodaje-regreso");
  assert.equal(faseMapa(estado("terminado", "terminado")), "rodaje-regreso");
  assert.equal(faseMapa(estado("invalido")), null);
  assert.equal(faseMapa({ ...crearRepaso("practica", ["recto-nivelado"]) }), null, "sin vuelo todavía");
});

test("lección 14: las maniobras son circuitos", () => {
  assert.equal(faseMapa(estado("maniobra", "vuelo", ["toques-despegues"])), "circuitos");
});

test("los tramos de fase se extienden y cambian sin huecos", () => {
  const g = crearGrabador();
  for (let t = 0; t < 10; t++) grabarMuestra(g, muestra({ t }), estado("rampa", "rodaje"));
  for (let t = 10; t < 20; t++) grabarMuestra(g, muestra({ t }), estado("salida"));
  assert.deepEqual(g.fases, [
    { fase: "rodaje", inicio: 0, fin: 10 },
    { fase: "despegue", inicio: 10, fin: 19 },
  ]);
});

test("una lección anulada no abre ni cierra tramos", () => {
  const g = crearGrabador();
  for (let t = 0; t < 5; t++) grabarMuestra(g, muestra({ t }), estado("salida"));
  grabarMuestra(g, muestra({ t: 6 }), estado("invalido"));
  assert.deepEqual(g.fases, [{ fase: "despegue", inicio: 0, fin: 4 }]);
});

test("puntoEn: el más cercano, y los extremos se sujetan", () => {
  const pts: Punto[] = [0, 1, 2, 3, 4, 5].map((t) => [t, 20, -103, 6500, 100, 90, 0, 0, 1500]);
  assert.equal(puntoEn(pts, 2.4)![0], 2);
  assert.equal(puntoEn(pts, 2.6)![0], 3);
  assert.equal(puntoEn(pts, -50)![0], 0);
  assert.equal(puntoEn(pts, 1e9)![0], 5);
  assert.equal(puntoEn([], 3), null);
});

test("grabarVoz guarda cada frase con su t", () => {
  const g = crearGrabador();
  grabarVoz(g, 12, ["Vira a la derecha.", "Rumbo 270."]);
  assert.deepEqual(g.voz, [{ t: 12, texto: "Vira a la derecha." }, { t: 12, texto: "Rumbo 270." }]);
});

test("2 horas de vuelo caben en menos de 450 KB", () => {
  const g = crearGrabador();
  const e = estado("maniobra");
  for (let t = 0; t < 7200; t++) {
    grabarMuestra(g, muestra({ t: t + 0.37, lat: 20.5123456 + t * 1e-5, lon: -103.3123456 - t * 1e-5, altitud: 6512.34, velocidad: 98.76, rumbo: 271.4, inclinacion: -23.45, bola: -0.1234, agl: 1534.5 }), e);
  }
  assert.equal(g.puntos.length, 7200);
  assert.ok(JSON.stringify(g.puntos).length < 450_000, `${JSON.stringify(g.puntos).length}`);
});
