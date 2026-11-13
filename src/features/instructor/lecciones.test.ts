import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCESO_REPASO, LECCIONES, LECCIONES_IFR, REPASO, claveLeccion, estadoLeccion, leccionDe, leccionIfrDe, lineaEjercicios } from "./lecciones.ts";
import { LECCIONES_GUARDADAS } from "./reglasIntentos.ts";

test("14 lecciones en el orden de la escuela", () => {
  assert.equal(LECCIONES.length, 14);
  assert.deepEqual(LECCIONES.map((l) => l.numero), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  assert.equal(LECCIONES[0].nombre.es, "Familiarización");
  assert.equal(LECCIONES[7].nombre.es, "«S» sobre un camino");
  assert.equal(LECCIONES[12].nombre.es, "Repaso general");
  assert.equal(LECCIONES[12].nombre.en, "General review");
  assert.equal(LECCIONES[13].nombre.es, "Toques y despegues");
  for (const l of LECCIONES) assert.doesNotMatch(l.nombre.en, /[áéíóúñ¿¡«»]/);
});

test("acceso al repaso: por ahora solo el fundador", () => {
  const r = LECCIONES[REPASO - 1];
  assert.equal(ACCESO_REPASO, "fundador");
  assert.equal(estadoLeccion({ ...LECCIONES[0], disponible: false }, { fundador: true, exclusivo: true }), "proximamente");
  assert.equal(estadoLeccion(r, { fundador: true, exclusivo: false }), "abierta");
  assert.equal(estadoLeccion(r, { fundador: false, exclusivo: true }), "candado");
  assert.equal(estadoLeccion(r, { fundador: false, exclusivo: false }), "candado");
});

test("2 y 3 (recto y nivelado) y 7 (vuelo lento) se abren con su maniobra, con la misma regla de acceso", () => {
  assert.ok(LECCIONES.every((l) => l.disponible), "las 14 ya existen");
  assert.equal(LECCIONES[0].maniobra, "familiarizacion");
  assert.equal(LECCIONES[7].maniobra, "s-camino");
  assert.equal(LECCIONES[8].maniobra, "ocho-pilones");
  assert.equal(LECCIONES[9].nombre.es, "«8» alrededor de pilones");
  assert.equal(LECCIONES[9].maniobra, "ocho-alrededor");
  assert.equal(LECCIONES[10].maniobra, "falla-motor");
  assert.equal(LECCIONES[11].maniobra, "falla-motor", "la 12 es la segunda hora de emergencias");
  assert.equal(LECCIONES[13].maniobra, "toques-despegues");
  assert.equal(LECCIONES[3].maniobra, "virajes-rumbos");
  assert.equal(LECCIONES[4].maniobra, "ascensos-descensos");
  assert.equal(LECCIONES[5].maniobra, "virajes-ascendiendo");
  assert.equal(LECCIONES[1].maniobra, "recto-nivelado");
  assert.equal(LECCIONES[2].maniobra, "recto-nivelado");
  assert.equal(LECCIONES[6].maniobra, "vuelo-lento");
  assert.equal(LECCIONES[REPASO - 1].maniobra, undefined);
  assert.equal(estadoLeccion(LECCIONES[6], { fundador: true, exclusivo: false }), "abierta");
  assert.equal(estadoLeccion(LECCIONES[6], { fundador: false, exclusivo: true }), "candado");
});

test("cada lección se guarda con su clave; el repaso conserva la de antes", () => {
  assert.equal(claveLeccion(LECCIONES[REPASO - 1]), "repaso-general");
  assert.equal(claveLeccion(LECCIONES[6]), "leccion-7");
  assert.equal(leccionDe(undefined), LECCIONES[REPASO - 1]);
  assert.equal(leccionDe("7"), LECCIONES[6]);
  assert.equal(leccionDe("1"), LECCIONES[0]);
  assert.equal(leccionDe("15"), null, "no existe");
  assert.equal(leccionDe("x"), null);
});

test("programa IFR: 6 lecciones, de la 1 a la 4 abiertas, con su propia clave", () => {
  assert.equal(LECCIONES_IFR.length, 6);
  assert.deepEqual(LECCIONES_IFR.map((l) => l.disponible), [true, true, true, true, false, false]);
  assert.equal(LECCIONES_IFR[0].maniobra, "interceptar-radial");
  assert.equal(LECCIONES_IFR[5].nombre.en, "IFR checkride");
  for (const l of LECCIONES_IFR) assert.doesNotMatch(l.nombre.en, /[áéíóúñ¿¡«»]/);
  assert.equal(claveLeccion(leccionIfrDe("1")!), "ifr-1");
  assert.equal(leccionIfrDe("5"), null, "todavía no existe");
  assert.equal(estadoLeccion(LECCIONES_IFR[5], { fundador: true, exclusivo: true }), "proximamente");
  assert.equal(leccionIfrDe(undefined), null);
  assert.ok(LECCIONES_GUARDADAS["ifr-1"]);
  assert.equal(leccionDe("1"), LECCIONES[0], "la 1 del VFR no cambia");
});

test("IFR 2 a 4: su maniobra, sus ejercicios y su clave; los arcos piden DME", () => {
  const [, ruta, arco, espera] = LECCIONES_IFR;
  assert.equal(ruta.maniobra, "ruta-pasada");
  assert.deepEqual(ruta.nombre, { es: "Rutas pasadas", en: "Passed routes" });
  assert.deepEqual(ruta.ejercicios, { practica: 4, examen: 2 });
  assert.equal(arco.maniobra, "arco-dme");
  assert.deepEqual(arco.ejercicios, { practica: 3, examen: 1 });
  assert.equal(arco.requiereDme, true);
  assert.equal(espera.maniobra, "espera");
  assert.deepEqual(espera.ejercicios, { practica: 3, examen: 1 });
  assert.equal(ruta.requiereDme, undefined);
  assert.deepEqual(["2", "3", "4"].map((n) => claveLeccion(leccionIfrDe(n)!)), ["ifr-2", "ifr-3", "ifr-4"]);
  assert.ok(LECCIONES_GUARDADAS["ifr-4"]);
});

test("IFR 1: 4 tramos de práctica y un examen de 2", () => {
  assert.deepEqual(LECCIONES_IFR[0].ejercicios, { practica: 4, examen: 2 });
});

test("el briefing IFR cuenta los ejercicios de cada lección", () => {
  const [l1, l2, , l4] = LECCIONES_IFR;
  assert.equal(lineaEjercicios(l1, false, "es"), "Son 4 tramos seguidos de interceptaciones normales, alejándote y acercándote.");
  assert.equal(lineaEjercicios(l1, true, "es"), "Son 2 tramos calificados, uno alejándote y otro acercándote, sin consejos.");
  assert.equal(lineaEjercicios(l2, false, "es"), "Son 4 tramos seguidos de rutas pasadas, alejándote y acercándote.");
  assert.equal(lineaEjercicios(l2, true, "es"), "Son 2 tramos calificados: uno normal y una ruta pasada, sin decirte cuál. Sin consejos.");
  for (const l of [l1, l2]) for (const c of [false, true]) assert.doesNotMatch(lineaEjercicios(l, c, "en"), /[áéíóúñ¿¡]/);
  assert.equal(lineaEjercicios(l4, false, "en"), "3 practice exercises, with tips.");
  assert.equal(lineaEjercicios(l4, true, "es"), "Es 1 ejercicio calificado, sin consejos.");
  assert.equal(lineaEjercicios(l2, true, "en"), "2 graded legs: one normal intercept and one passed route, without telling you which. No tips.");
});
