import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAMENES_TIPO, REGLAS_EXAMEN_TIPO } from "../../data/examenesTipo.ts";
import { areasAReforzar, armarIntento, combinarResultado, nivelInsignia, proximoIntento } from "./reglas.ts";

// Aleatorio con semilla, para que la prueba sea repetible.
function semilla(s: number) {
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test("el banco de cada avión es válido", () => {
  for (const ex of EXAMENES_TIPO) {
    const ids = new Set<string>();
    for (const p of ex.preguntas) {
      assert.ok(!ids.has(p.id), `id repetido ${p.id}`);
      ids.add(p.id);
      assert.equal(p.opciones.length, 4, p.id);
      assert.ok(p.correcta >= 0 && p.correcta < 4, p.id);
      assert.equal(new Set(p.opciones).size, 4, `opciones repetidas en ${p.id}`);
    }
    assert.ok(ex.preguntas.length > REGLAS_EXAMEN_TIPO.preguntasPorIntento, `${ex.clave}: el banco debe ser más grande que un intento`);
  }
});

test("un intento trae n preguntas distintas, de todas las áreas, con la respuesta correcta intacta", () => {
  const banco = EXAMENES_TIPO[0].preguntas;
  const original = new Map(banco.map((p) => [p.id, p.opciones[p.correcta]]));
  for (let s = 1; s <= 50; s++) {
    const intento = armarIntento(banco, 20, semilla(s));
    assert.equal(intento.length, 20);
    assert.equal(new Set(intento.map((p) => p.id)).size, 20);
    assert.equal(new Set(intento.map((p) => p.area)).size, new Set(banco.map((p) => p.area)).size);
    for (const p of intento) assert.equal(p.opciones[p.correcta], original.get(p.id));
  }
});

test("las áreas a reforzar son las que quedan bajo el mínimo, la peor primero", () => {
  const banco = EXAMENES_TIPO[0].preguntas;
  const vel = banco.filter((p) => p.area === "Velocidades").slice(0, 4);
  const emer = banco.filter((p) => p.area === "Emergencias").slice(0, 2);
  const sis = banco.filter((p) => p.area === "Sistemas").slice(0, 2);
  const preguntas = [...vel, ...emer, ...sis];
  const aciertos = [true, true, true, false, false, false, true, true]; // vel 75 %, emer 0 %, sis 100 %
  assert.deepEqual(areasAReforzar(preguntas, aciertos, 80), ["Emergencias", "Velocidades"]);
});

test("hay que esperar entre intentos hasta llegar al dominio", () => {
  const ahora = new Date("2026-09-29T12:00:00Z");
  const reprobado = { score: 60, passed: false, fecha: "2026-09-29T10:00:00Z" };
  assert.deepEqual(proximoIntento(reprobado, 24, 95, ahora), new Date("2026-09-30T10:00:00Z"));
  assert.equal(proximoIntento({ ...reprobado, fecha: "2026-09-28T11:00:00Z" }, 24, 95, ahora), null);
  assert.deepEqual(proximoIntento({ score: 90, passed: true, fecha: "2026-09-29T11:00:00Z" }, 24, 95, ahora), new Date("2026-09-30T11:00:00Z"));
  assert.equal(proximoIntento({ score: 95, passed: true, fecha: "2026-09-29T11:00:00Z" }, 24, 95, ahora), null);
  assert.equal(proximoIntento(null, 24, 95, ahora), null);
});

test("un repaso reprobado no quita la insignia y se guarda la mejor calificación", () => {
  const aprobado = { score: 85, passed: true, fecha: "2026-09-29T10:00:00Z" };
  assert.deepEqual(combinarResultado(aprobado, 60, false, "2026-09-30T10:00:00Z"), { ...aprobado, fecha: "2026-09-30T10:00:00Z" });
  assert.deepEqual(combinarResultado(aprobado, 95, true, "2026-09-30T10:00:00Z"), { score: 95, passed: true, fecha: "2026-09-30T10:00:00Z" });
  assert.deepEqual(combinarResultado(null, 60, false, "x"), { score: 60, passed: false, fecha: "x" });
});

test("niveles: bronce con el teórico, plata con el práctico, oro con práctico y dominio", () => {
  assert.equal(nivelInsignia(null, false, 95), null);
  assert.equal(nivelInsignia({ score: 70, passed: false }, true, 95), null);
  assert.equal(nivelInsignia({ score: 100, passed: true }, false, 95), "bronce");
  assert.equal(nivelInsignia({ score: 85, passed: true }, true, 95), "plata");
  assert.equal(nivelInsignia({ score: 95, passed: true }, true, 95), "oro");
});
