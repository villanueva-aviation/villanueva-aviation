import { test } from "node:test";
import assert from "node:assert/strict";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";
import { ES_V15 } from "./revisionSim.ts";
import type { Muestra } from "./evaluador.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { avanzarChecklist, avisoSeccion, crearChecklist, oir, resumenChecklist, type Checklist } from "./checklistVoz.ts";

const PUNTOS = CHECKLIST_VOZ_C172.flatMap((s) => s.puntos);

test("el C172 tiene 80 puntos en 11 secciones", () => {
  assert.equal(CHECKLIST_VOZ_C172.length, 11);
  assert.equal(PUNTOS.length, 80);
});

test("37 se revisan hoy, 15 con v1.5 y 28 solo por voz", () => {
  assert.equal(PUNTOS.filter((p) => p.revisa && !ES_V15.has(p.revisa)).length, 37);
  assert.equal(PUNTOS.filter((p) => p.revisa && ES_V15.has(p.revisa)).length, 15);
  assert.equal(PUNTOS.filter((p) => !p.revisa).length, 28);
});

test("los ids no se repiten", () => {
  assert.equal(new Set(PUNTOS.map((p) => p.id)).size, 80);
});

test("cada punto y cada seccion tiene claves sin acentos", () => {
  for (const c of [...CHECKLIST_VOZ_C172, ...PUNTOS]) {
    assert.ok(c.claves.length > 0, c.id);
    for (const k of c.claves) assert.match(k, /^[a-z0-9 ]+$/, `${c.id}: ${k}`);
  }
});

const base: Muestra = { ...simularVuelo()[0], avionica: false, selector: 1, valvula: true, bomba: false, autopiloto: false, trim: 0 };
const con = (c: Partial<Muestra>): Muestra => ({ ...base, ...c });
const ctx = { elevacionFt: 5016 };
const nuevo = () => crearChecklist(CHECKLIST_VOZ_C172);
const abrirAA = () => oir(nuevo(), "checklist antes de arrancar", 0);
const estados = (cl: Checklist, id: keyof Checklist["puntos"]) => cl.puntos[id].map((p) => p.estado);
const decir = (cl: Checklist, frases: string[], t = 0) => frases.reduce((c, f) => oir(c, f, t), cl);

test("checklist antes de arrancar abre la seccion", () => {
  const cl = abrirAA();
  assert.equal(cl.abierta, "antes-arrancar");
  assert.equal(cl.siguiente, 0);
});

test("checklist antes del arranque no abre arranque", () => {
  assert.equal(oir(nuevo(), "checklist antes del arranque", 0).abierta, "antes-arrancar");
});

test("cada punto dicho tal cual se reconoce como el siguiente", () => {
  let cl = nuevo();
  for (const s of CHECKLIST_VOZ_C172) {
    cl = oir(cl, `checklist ${s.claves[0]}`, 0);
    assert.equal(cl.abierta, s.id);
    for (const p of s.puntos) cl = oir(cl, p.dicho, 0);
    assert.ok(!estados(cl, s.id).includes("saltado"), `${s.id}: ${estados(cl, s.id).join(",")}`);
    assert.equal(cl.abierta, null, s.id);
  }
});

test("saltarse un punto lo anota", () => {
  const cl = oir(abrirAA(), "breakers adentro", 0);
  assert.deepEqual(estados(cl, "antes-arrancar").slice(0, 3), ["saltado", "saltado", "dicho"]);
  assert.equal(cl.siguiente, 3);
});

test("una frase de un punto lejano no salta nada", () => {
  for (const f of ["bitacora anotada", "valvula abierta"]) {
    const cl = oir(abrirAA(), f, 0);
    assert.equal(cl.siguiente, 0, f);
    assert.ok(!estados(cl, "antes-arrancar").includes("saltado"), f);
  }
});

test("repetir el punto anterior no cambia nada", () => {
  const una = decir(abrirAA(), ["asientos y cinturones ajustados", "freno puesto"]);
  const dos = oir(una, "freno puesto", 0);
  assert.equal(dos.siguiente, 2);
  assert.deepEqual(estados(dos, "antes-arrancar"), estados(una, "antes-arrancar"));
});

test("dos puntos en una frase cuentan los dos", () => {
  const cl = decir(nuevo(), ["checklist arranque", "acelerador abierto", "mezcla corte", "area de la helice despejada", "master encendido beacon encendido"]);
  assert.deepEqual(estados(cl, "arranque").slice(3, 5), ["revisando", "revisando"]);
  assert.equal(cl.siguiente, 5);
});

test("freno dicho y puesto queda hecho", () => {
  const cl = avanzarChecklist(decir(abrirAA(), ["asientos y cinturones", "freno puesto"]), con({ t: 1, freno: true }), ctx);
  assert.equal(cl.puntos["antes-arrancar"][1].estado, "hecho");
});

test("freno dicho y no puesto a los 10 s queda no hecho", () => {
  let cl = decir(abrirAA(), ["asientos y cinturones", "freno puesto"]);
  for (let t = 1; t <= 11; t++) cl = avanzarChecklist(cl, con({ t, freno: false }), ctx);
  assert.equal(cl.puntos["antes-arrancar"][1].estado, "no-hecho");
});

test("sin datos v1.5 el punto queda dicho", () => {
  const { avionica: _, ...viejo } = con({ t: 1 });
  let cl = decir(abrirAA(), ["asientos", "freno", "breakers", "equipo electrico", "avionica master apagado"]);
  cl = avanzarChecklist(cl, viejo, ctx);
  assert.equal(cl.puntos["antes-arrancar"][4].estado, "dicho");
});

test("checklist completo cierra y anota los pendientes", () => {
  const cl = oir(abrirAA(), "checklist completo", 0);
  assert.equal(cl.abierta, null);
  assert.ok(estados(cl, "antes-arrancar").every((e) => e === "saltado"));
});

test("el aviso espera a las revisiones pendientes", () => {
  let cl = decir(abrirAA(), ["freno puesto", "checklist completo"]);
  assert.equal(avisoSeccion(cl, "antes-arrancar"), null);
  cl = avanzarChecklist(cl, con({ t: 1, freno: true }), ctx);
  const aviso = avisoSeccion(cl, "antes-arrancar");
  assert.ok(aviso?.includes("Te faltó"), aviso ?? "null");
  assert.ok(!aviso?.includes("No vi hecho"), aviso ?? "null");
});

test("resumen cuenta las secciones no leidas", () => {
  assert.equal(resumenChecklist(abrirAA()).noLeidas.length, 10);
});