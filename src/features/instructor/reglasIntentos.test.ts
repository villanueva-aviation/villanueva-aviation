import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Muestra, type Resultado } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { agruparSesiones, folio, insigniaManiobraGanada, paraGuardar, puedeMandar, resumenProgreso, type IntentoManiobra } from "./reglasIntentos.ts";

const calificar = (muestras: Muestra[]): Resultado => muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0])).resultado!;

const intento = (r: Resultado, created_at: string, modo: "practica" | "checkride" = "practica", sesion_id: string | null = null): IntentoManiobra => ({
  id: created_at, user_id: "u", maniobra: "viraje-escarpado", avion: "C172", modo,
  calificacion: r.calificacion, aprobado: r.aprobado, elementos: r.elementos, detalle: paraGuardar(r),
  revision: "sin_mandar", revisado_at: null, created_at, sesion_id,
});

const conCorreo = (i: IntentoManiobra) => ({ ...i, email: "cadete@x.com" });

test("agrupa por sesión", () => {
  const r = calificar(simularManiobra());
  const lista = [
    intento({ ...r, calificacion: 70 }, "2026-11-05T10:00:00Z", "practica", "A"),
    intento({ ...r, calificacion: 80 }, "2026-11-05T10:10:00Z", "practica", "A"),
    intento({ ...r, calificacion: 88, aprobado: true }, "2026-11-05T10:40:00Z", "checkride", "A"),
    intento(r, "2026-11-05T12:00:00Z", "practica", "B"),
  ].map(conCorreo);
  const s = agruparSesiones(lista);
  assert.equal(s.length, 2);
  const a = s.find((x) => x.sesionId === "A")!;
  assert.equal(a.intentos, 3);
  assert.deepEqual(a.checkride, { calificacion: 88, aprobado: true });
  assert.equal(a.inicio, "2026-11-05T10:00:00Z");
  assert.equal(a.email, "cadete@x.com");
  assert.equal(s.find((x) => x.sesionId === "B")!.checkride, null);
});

test("el repaso general: su renglón es la lección, no un intento ni el checkride", () => {
  const r = calificar(simularManiobra());
  const leccion = { ...intento({ ...r, calificacion: 75, aprobado: false }, "2026-11-08T11:00:00Z", "checkride", "R"), maniobra: "repaso-general", detalle: { maniobras: [{}, {}, {}, {}] } };
  const lista = [
    intento({ ...r, calificacion: 90, aprobado: true }, "2026-11-08T10:20:00Z", "checkride", "R"),
    intento({ ...r, calificacion: 60, aprobado: false }, "2026-11-08T10:30:00Z", "checkride", "R"),
    leccion,
  ].map(conCorreo);
  const s = agruparSesiones(lista)[0];
  assert.equal(s.intentos, 2);
  assert.deepEqual(s.checkride, { calificacion: 60, aprobado: false });
  assert.deepEqual(s.leccion, { nombre: "Repaso general", modo: "checkride", calificacion: 75, aprobado: false, nivel: 3 });
  assert.equal(agruparSesiones([conCorreo(intento(r, "2026-11-05T10:00:00Z", "practica", "A"))])[0].leccion, null);
});

test("una lección de maniobra también es la lección de la sesión, con su número", () => {
  const r = calificar(simularManiobra());
  const leccion = { ...intento(r, "2026-11-09T11:00:00Z", "practica", "L"), maniobra: "leccion-7", detalle: { nivel: 2 } };
  const s = agruparSesiones([intento(r, "2026-11-09T10:00:00Z", "practica", "L"), leccion].map(conCorreo))[0];
  assert.equal(s.intentos, 1);
  assert.equal(s.leccion?.nombre, "Lección 7 · Vuelo lento");
  assert.equal(s.leccion?.nivel, 2);
});

test("la sesión dice en qué niveles practicó y en cuál fue la lección", () => {
  const r = calificar(simularManiobra());
  const en = (nivel: 1 | 2, at: string) => ({ ...intento({ ...r, nivel }, at, "practica", "N"), detalle: { ...paraGuardar({ ...r, nivel }) } });
  const leccion = { ...intento(r, "2026-11-08T11:00:00Z", "practica", "N"), maniobra: "repaso-general", detalle: { nivel: 1 } };
  const s = agruparSesiones([en(2, "2026-11-08T10:10:00Z"), en(1, "2026-11-08T10:00:00Z"), en(1, "2026-11-08T10:20:00Z"), leccion].map(conCorreo))[0];
  assert.deepEqual(s.niveles, [1, 2]);
  assert.equal(s.leccion?.nivel, 1);
  assert.deepEqual(agruparSesiones([conCorreo(intento(r, "2026-11-05T10:00:00Z", "practica", "A"))])[0].niveles, [3], "sin nivel guardado = Difícil");
});

test("los intentos sin sesión no se agrupan", () => {
  assert.deepEqual(agruparSesiones([conCorreo(intento(calificar(simularManiobra()), "2026-11-05T10:00:00Z"))]), []);
});

test("la sesión más nueva primero", () => {
  const r = calificar(simularManiobra());
  const s = agruparSesiones([intento(r, "2026-11-05T12:00:00Z", "practica", "B"), intento(r, "2026-11-05T10:00:00Z", "practica", "A")].map(conCorreo));
  assert.deepEqual(s.map((x) => x.sesionId), ["B", "A"]);
});

test("solo se manda un checkride aprobado sin mandar", () => {
  assert.equal(puedeMandar({ modo: "checkride", aprobado: true, revision: "sin_mandar" }), true);
  assert.equal(puedeMandar({ modo: "practica", aprobado: true, revision: "sin_mandar" }), false);
  assert.equal(puedeMandar({ modo: "checkride", aprobado: false, revision: "sin_mandar" }), false);
  assert.equal(puedeMandar({ modo: "checkride", aprobado: true, revision: "mandado" }), false);
});

test("la insignia sale solo con un intento aprobado por el fundador", () => {
  const m = "viraje-escarpado";
  assert.equal(insigniaManiobraGanada([{ maniobra: m, revision: "mandado" }, { maniobra: m, revision: "no_aprobado" }], m), false);
  assert.equal(insigniaManiobraGanada([{ maniobra: "otra", revision: "aprobado" }], m), false);
  assert.equal(insigniaManiobraGanada([{ maniobra: m, revision: "aprobado" }], m), true);
});

test("folio del reporte", () => {
  assert.equal(folio("7f3k2611-aaaa-bbbb"), "VA-7F3K-2611");
});

test("resumen numera por fecha y encuentra la tolerancia mas fallada", () => {
  const caida = calificar(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } }));
  const caida2 = calificar(simularManiobra({ caidaAltitud: { lado: 1, ft: 160, segundos: 2, enGrados: 120 } }));
  const limpio = calificar(simularManiobra());
  const r = resumenProgreso([
    intento(limpio, "2026-11-05T12:00:00Z", "checkride"),
    intento(caida, "2026-11-05T10:00:00Z"),
    intento(caida2, "2026-11-05T11:00:00Z"),
  ]);
  assert.deepEqual(r.intentos.map((i) => i.n), [1, 2, 3]);
  assert.deepEqual(r.intentos.map((i) => i.calificacion), [caida.calificacion, caida2.calificacion, 100]);
  assert.equal(r.intentos[2].modo, "checkride");
  assert.equal(r.mejor, 100);
  assert.equal(r.masFallada, "altitud");
});

test("resumen vacio", () => {
  assert.deepEqual(resumenProgreso([]), { intentos: [], mejor: null, masFallada: null });
});

test("lo guardado cambia las muestras por series cortas por lado", () => {
  const r = calificar(simularManiobra());
  const g = paraGuardar(r);
  assert.equal("muestras" in g, false);
  assert.equal(g.series.length, 2);
  for (const lado of g.series) for (const campo of ["altitud", "velocidad", "inclinacion", "bola"] as const) {
    assert.ok(lado[campo].length > 0 && lado[campo].length <= 300);
  }
  assert.equal(g.calificacion, 100);
});

test("las series de inclinacion y bola usan la misma ventana que la calificacion", () => {
  const g = paraGuardar(calificar(simularManiobra()));
  for (const lado of g.series) assert.ok(lado.inclinacion.every((p) => Math.abs(p.v) <= 5), JSON.stringify(lado.inclinacion.slice(0, 3)));
});
