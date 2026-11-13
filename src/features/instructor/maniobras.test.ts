import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Evaluacion } from "./evaluador.ts";
import { explicar, repetir } from "./explicacion.ts";
import { defDe, lecturaFinalDe, maniobraConocida, MANIOBRAS } from "./maniobras.ts";
import { paraGuardar } from "./reglasIntentos.ts";
import { simularLento, simularManiobra, simularRecto } from "./simular.ts";
import { avisoVoz, ordenVoz, pasoVoz, semaforo, textoPaso, type PasoVoz } from "./voz.ts";

test("defViraje dice lo mismo que las funciones del viraje", () => {
  const d = MANIOBRAS["viraje-escarpado"];
  const ms = simularManiobra({ caidaAltitud: { lado: 0, ft: 120, segundos: 4, enGrados: 90 } });
  let ev: Evaluacion = armar(crearEvaluacion(), ms[0]);
  let e = d.armar(ms[0]);
  let antes: PasoVoz | null = null;
  for (const m of ms.slice(1)) {
    ev = avanzar(ev, m);
    e = d.avanzar(e, m);
    const p = pasoVoz(ev, m);
    assert.equal(d.paso(e, m), p);
    assert.equal(d.orden(antes, p, e, "es"), ordenVoz(antes, p, ev, "es"));
    assert.deepEqual(d.semaforo(e, m), semaforo(ev, m));
    assert.deepEqual(d.aviso(e, m, "practica", "en"), avisoVoz(ev, m, "practica", "en"));
    assert.equal(d.textoPaso(p, e, "en"), textoPaso(p, "en"));
    antes = p;
  }
  const r = ev.resultado!;
  assert.equal(d.fase(e), "terminado");
  assert.deepEqual(d.explicar(d.resultado(e), "es"), explicar(r, "es"));
  assert.equal(d.repetir(d.resultado(e), "es"), repetir(r, "es"));
  assert.deepEqual(d.paraGuardar(d.resultado(e)), paraGuardar(r));
});

test("defDe cae al viraje con una maniobra desconocida", () => {
  assert.equal(defDe("otra").id, "viraje-escarpado");
  assert.equal(defDe(null).id, "viraje-escarpado");
  assert.equal(defDe("recto-nivelado").id, "recto-nivelado");
});

test("recto completo por la definición", () => {
  const d = defDe("recto-nivelado");
  const ms = simularRecto();
  const e = ms.slice(1).reduce((x, m) => d.avanzar(x, m), d.armar(ms[0]));
  assert.equal(d.fase(e), "terminado");
  const r = d.resultado(e)!;
  assert.equal(r.calificacion, 100);
  assert.equal(lecturaFinalDe(d, r, "es")[0], "Aprobado. Calificación: 100 de 100.");
});

test("las celdas en inglés no tienen español", () => {
  for (const d of Object.values(MANIOBRAS)) {
    const textos = [...d.celdas.map((c) => c.nombre.en), d.titulo.en, d.tarea.en, ...d.elementosReporte().map((x) => x.textoEn)];
    for (const t of textos) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, `${d.id}: ${t}`);
  }
});

test("vuelo lento tiene su def con los códigos del ACS Área VII Tarea A", () => {
  const d = defDe("vuelo-lento");
  assert.equal(d.id, "vuelo-lento");
  assert.equal(d.insignia, "maniobra-vuelo-lento-c172");
  assert.deepEqual(d.elementosReporte().map((e) => e.codigo), ["PA.VII.A.S2", "PA.VII.A.S3", "PA.VII.A.S4", "PA.VII.A.S5"]);
  assert.equal(d.tarea.es, "Área VII · Tarea A: Vuelo lento");
  assert.equal(d.tarea.en, "Area VII · Task A: Slow flight");
  assert.deepEqual(d.temas, ["vuelo-lento", "c172"]);
  for (const e of d.elementosReporte()) assert.doesNotMatch(e.textoEn, /[áéíóúñ¿¡]/, e.codigo);
});

test("la def de vuelo lento corre un intento simulado de punta a punta", () => {
  const d = defDe("vuelo-lento");
  const ms = simularLento();
  let e = d.armar(ms[0]);
  const fases = new Set<string>();
  for (const m of ms.slice(1)) {
    e = d.avanzar(e, m);
    fases.add(d.fase(e));
  }
  assert.deepEqual([...fases], ["armado", "en-curso", "terminado"]);
  const r = d.resultado(e)!;
  assert.equal(r.aprobado, true);
  for (const t of lecturaFinalDe(d, r, "en")) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  assert.equal("muestras" in d.paraGuardar(r), false);
});
test("IFR: ruta-pasada reemplaza a ruta-vor y comparte el evaluador de interceptación", () => {
  assert.equal("ruta-vor" in MANIOBRAS, false);
  const d = MANIOBRAS["ruta-pasada"];
  assert.equal(d.titulo.es, "Rutas pasadas C172");
  assert.equal(d.armar, MANIOBRAS["interceptar-radial"].armar);
  assert.match(d.briefing("es").join(" "), /regla de 45 grados/);
  for (const id of ["interceptar-radial", "ruta-pasada"] as const) {
    const def = MANIOBRAS[id];
    assert.equal(def.celdas[0].campo, "identificar");
    assert.ok(def.elementosReporte(2).some((x) => x.codigo === "4" && x.texto === "Identifica si es normal o ruta pasada"));
    assert.equal(def.elementosReporte(2)[0].texto, "Llega al radial antes de las 8 NM o del VOR");
  }
});

test("maniobraConocida: las de antes de las actividades (null) sí; ruta-vor, que se borró, no", () => {
  assert.equal(maniobraConocida(null), true);
  assert.equal(maniobraConocida("ruta-pasada"), true);
  assert.equal(maniobraConocida("ruta-vor"), false);
});

test("el examen de interceptación va en medio como mínimo", () => {
  assert.equal(MANIOBRAS["interceptar-radial"].nivelExamen?.(1), 2);
  assert.equal(MANIOBRAS["interceptar-radial"].nivelExamen?.(3), 3);
  assert.equal(MANIOBRAS["ruta-pasada"].nivelExamen?.(1), 2);
});
