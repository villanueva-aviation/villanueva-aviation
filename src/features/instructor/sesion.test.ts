import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Resultado } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { armaEnBloque, avanzarSesion, crearSesion, modoDelBloque, type EventoSesion, type IntentoSesion, type Sesion } from "./sesion.ts";

const muestras = simularManiobra();
const resultado: Resultado = muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0])).resultado!;
const practica: IntentoSesion = { modo: "practica", resultado, id: null };
const checkride: IntentoSesion = { modo: "checkride", resultado, id: null };
const MIN = 60_000;

function correr(eventos: EventoSesion[], s: Sesion = crearSesion("s1")) {
  const dichos: string[][] = [];
  for (const e of eventos) {
    const r = avanzarSesion(s, e);
    s = r.sesion;
    dichos.push(r.decir);
  }
  return { s, dichos };
}

const hastaPractica: EventoSesion[] = [
  { tipo: "idioma" },
  { tipo: "elegir", actividad: "viraje-escarpado" },
  { tipo: "listo", ahoraMs: 0 },
  { tipo: "armado" },
];

test("del idioma al menú y del menú al briefing", () => {
  let s = avanzarSesion(crearSesion("x"), { tipo: "idioma" }).sesion;
  assert.equal(s.bloque, "menu");
  assert.equal(avanzarSesion(s, { tipo: "listo", ahoraMs: 0 }).sesion.bloque, "menu");
  s = avanzarSesion(s, { tipo: "elegir", actividad: "viraje-escarpado" }).sesion;
  assert.equal(s.bloque, "briefing");
  assert.equal(s.actividad, "viraje-escarpado");
});

test("recorre los bloques", () => {
  let s = crearSesion("s1");
  const bloques: string[] = [s.bloque];
  for (const e of [
    ...hastaPractica,
    { tipo: "intento", intento: practica },
    { tipo: "intento", intento: practica },
    { tipo: "intento", intento: practica },
    { tipo: "pasar-checkride" },
    { tipo: "intento", intento: checkride },
    { tipo: "fin-debriefing" },
  ] as EventoSesion[]) {
    s = avanzarSesion(s, e).sesion;
    bloques.push(s.bloque);
  }
  assert.deepEqual(bloques, ["idioma", "menu", "briefing", "preparacion", "practica", "practica", "practica", "practica", "checkride", "debriefing", "cierre"]);
  assert.equal(s.intentos.length, 4);
  assert.equal(s.inicioMs, 0);
});

test("la sugerencia de los tres se dice una vez", () => {
  const { dichos } = correr([...hastaPractica, ...Array(4).fill({ tipo: "intento", intento: practica })]);
  assert.deepEqual(dichos.slice(4), [[], [], ["Ya tienes tres intentos: puedes pasar al checkride o seguir practicando."], []]);
});

test("los 35 minutos sugieren una vez y no cambian de bloque", () => {
  const { s, dichos } = correr([
    ...hastaPractica,
    { tipo: "reloj", ahoraMs: 34 * MIN },
    { tipo: "reloj", ahoraMs: 35 * MIN },
    { tipo: "reloj", ahoraMs: 40 * MIN },
  ]);
  assert.deepEqual(dichos.slice(4), [[], ["Ya llevamos 35 minutos: cuando quieras pasamos al checkride."], []]);
  assert.equal(s.bloque, "practica");
});

test("en inglés las sugerencias van en inglés", () => {
  let s = correr(hastaPractica).s;
  assert.deepEqual(avanzarSesion(s, { tipo: "reloj", ahoraMs: 35 * MIN }, "en").decir, [
    "We're 35 minutes in: whenever you're ready, we'll move on to the checkride.",
  ]);
  s = correr([{ tipo: "intento", intento: practica }, { tipo: "intento", intento: practica }], s).s;
  assert.deepEqual(avanzarSesion(s, { tipo: "intento", intento: practica }, "en").decir, [
    "That's three attempts: you can move on to the checkride or keep practicing.",
  ]);
});

test("un intento de práctica no cierra el checkride", () => {
  const { s } = correr([...hastaPractica, { tipo: "pasar-checkride" }, { tipo: "intento", intento: practica }]);
  assert.equal(s.bloque, "checkride");
  assert.equal(s.intentos.length, 0);
});

test("un checkride no aprobado también cierra", () => {
  const malo: IntentoSesion = { ...checkride, resultado: { ...resultado, aprobado: false, calificacion: 60 } };
  const { s } = correr([...hastaPractica, { tipo: "pasar-checkride" }, { tipo: "intento", intento: malo }]);
  assert.equal(s.bloque, "debriefing");
});

test("eventos fuera de lugar no hacen nada", () => {
  const antes = correr(hastaPractica).s;
  const r = avanzarSesion(antes, { tipo: "listo", ahoraMs: 99 });
  assert.deepEqual(r.sesion, antes);
  assert.deepEqual(r.decir, []);
});

test("las respuestas se guardan en la sesión sin tocar los intentos", () => {
  let s = { ...crearSesion("x"), bloque: "practica" as const };
  s = avanzarSesion(s, { tipo: "respuesta", respondida: { id: "c172-1", correcta: true } }).sesion;
  assert.deepEqual(s.respondidas, [{ id: "c172-1", correcta: true }]);
  assert.equal(s.intentos.length, 0);
  assert.equal(avanzarSesion({ ...s, bloque: "cierre" }, { tipo: "respuesta", respondida: { id: "c172-2", correcta: false } }).sesion.respondidas.length, 1);
});

test("modo y armado por bloque", () => {
  assert.equal(modoDelBloque("checkride"), "checkride");
  assert.equal(modoDelBloque("practica"), "practica");
  assert.equal(armaEnBloque("briefing"), false);
  assert.equal(armaEnBloque("preparacion"), true);
  assert.equal(armaEnBloque("debriefing"), false);
});
