import { test } from "node:test";
import assert from "node:assert/strict";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";
import { AVIONES_VOZ } from "../../data/checklistVozAviones.ts";
import { ES_V15 } from "./revisionSim.ts";
import type { Muestra } from "./evaluador.ts";
import { simularVuelo } from "./simularVuelo.ts";
import { avanzarChecklist, avisoSeccion, avisosPorDecir, crearChecklist, oir, PIEZA_AVISO, porDecir, respuestasCopiloto, resumenChecklist, type Checklist } from "./checklistVoz.ts";
import { encolar, siguiente } from "./colaVoz.ts";

const PUNTOS = CHECKLIST_VOZ_C172.flatMap((s) => s.puntos);

test("el C172 tiene 103 puntos en 11 secciones", () => {
  assert.equal(CHECKLIST_VOZ_C172.length, 11);
  assert.equal(PUNTOS.length, 103);
});

test("42 se revisan con el lector v1.4, 15 con v1.5 y 46 solo por voz", () => {
  assert.equal(PUNTOS.filter((p) => p.revisa && !ES_V15.has(p.revisa)).length, 42);
  assert.equal(PUNTOS.filter((p) => p.revisa && ES_V15.has(p.revisa)).length, 15);
  assert.equal(PUNTOS.filter((p) => !p.revisa).length, 46);
});

test("los ids no se repiten", () => {
  assert.equal(new Set(PUNTOS.map((p) => p.id)).size, 103);
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
// Los dos primeros puntos ya dichos: las pruebas empiezan en «Asientos y cinturones» (índice 2).
const abrirAA = () => decir(nuevo(), ["checklist antes de arrancar", "briefing de pasajeros completo", "seguro de control quitado"]);
const estados = (cl: Checklist, id: keyof Checklist["puntos"]) => cl.puntos[id].map((p) => p.estado);
const decir = (cl: Checklist, frases: string[], t = 0) => frases.reduce((c, f) => oir(c, f, t), cl);

test("checklist antes de arrancar abre la seccion", () => {
  const cl = oir(nuevo(), "checklist antes de arrancar", 0);
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
  assert.deepEqual(estados(cl, "antes-arrancar").slice(2, 5), ["saltado", "saltado", "dicho"]);
  assert.equal(cl.siguiente, 5);
});

test("una frase de un punto lejano no salta nada", () => {
  for (const f of ["bitacora anotada", "valvula abierta"]) {
    const cl = oir(abrirAA(), f, 0);
    assert.equal(cl.siguiente, 2, f);
    assert.ok(!estados(cl, "antes-arrancar").includes("saltado"), f);
  }
});

test("repetir el punto anterior no cambia nada", () => {
  const una = decir(abrirAA(), ["asientos y cinturones ajustados", "freno puesto"]);
  const dos = oir(una, "freno puesto", 0);
  assert.equal(dos.siguiente, 4);
  assert.deepEqual(estados(dos, "antes-arrancar"), estados(una, "antes-arrancar"));
});

test("dos puntos en una frase cuentan los dos", () => {
  const cl = decir(nuevo(), ["checklist arranque", "acelerador abierto", "mezcla corte", "area de la helice despejada", "master encendido beacon encendido"]);
  assert.deepEqual(estados(cl, "arranque").slice(3, 5), ["revisando", "revisando"]);
  assert.equal(cl.siguiente, 5);
});

test("freno dicho y puesto queda hecho", () => {
  const cl = avanzarChecklist(decir(abrirAA(), ["asientos y cinturones", "freno puesto"]), con({ t: 1, freno: true }), ctx);
  assert.equal(cl.puntos["antes-arrancar"][3].estado, "hecho");
});

test("freno dicho y no puesto a los 10 s queda no hecho", () => {
  let cl = decir(abrirAA(), ["asientos y cinturones", "freno puesto"]);
  for (let t = 1; t <= 11; t++) cl = avanzarChecklist(cl, con({ t, freno: false }), ctx);
  assert.equal(cl.puntos["antes-arrancar"][3].estado, "no-hecho");
});

test("sin datos v1.5 el punto queda dicho", () => {
  const { avionica: _, ...viejo } = con({ t: 1 });
  let cl = decir(abrirAA(), ["asientos", "freno", "breakers", "equipo electrico", "avionica master apagado"]);
  cl = avanzarChecklist(cl, viejo, ctx);
  assert.equal(cl.puntos["antes-arrancar"][6].estado, "dicho");
});

test("checklist completo cierra y anota los pendientes", () => {
  const cl = oir(abrirAA(), "checklist completo", 0);
  assert.equal(cl.abierta, null);
  assert.ok(estados(cl, "antes-arrancar").slice(2).every((e) => e === "saltado"));
});

test("el aviso espera a las revisiones pendientes", () => {
  let cl = decir(abrirAA(), ["freno puesto", "checklist completo"]);
  assert.equal(avisoSeccion(cl, "antes-arrancar"), null);
  cl = avanzarChecklist(cl, con({ t: 1, freno: true }), ctx);
  const aviso = avisoSeccion(cl, "antes-arrancar");
  assert.ok(aviso?.startsWith("Checklist antes de arrancar."), aviso ?? "null");
  assert.ok(aviso?.includes("Te faltó"), aviso ?? "null");
  assert.ok(!aviso?.includes("No vi hecho"), aviso ?? "null");
});

test("resumen cuenta las secciones no leidas", () => {
  assert.equal(resumenChecklist(abrirAA()).noLeidas.length, 10);
});
test("el aviso del checklist si se dice en la cola de voz", () => {
  assert.notEqual(siguiente(encolar([], { tipo: PIEZA_AVISO, texto: "Antes de arrancar: completo." }).cola, null).pieza, null);
});

test("repetir un punto que comparte palabra con los siguientes no salta nada", () => {
  const casos: [string, string[], string][] = [
    ["checklist arranque", ["acelerador", "mezcla corte", "helice", "master", "beacon", "bomba de combustible auxiliar encendida"], "bomba de combustible auxiliar encendida"],
    ["checklist apagado", ["freno", "equipo electrico", "piloto automatico apagado", "avionica master apagado"], "avionica master apagado"],
    ["checklist antes de despegar", ["radios configurados", "trim electrico configurado"], "trim electrico configurado"],
  ];
  for (const [abrir, frases, repetida] of casos) {
    const una = decir(nuevo(), [abrir, ...frases]);
    const dos = oir(una, repetida, 0);
    assert.equal(dos.siguiente, una.siguiente, repetida);
    assert.deepEqual(estados(dos, una.abierta!), estados(una, una.abierta!), repetida);
  }
});

test("los avisos esperan a que no haya seccion abierta", () => {
  let cl = decir(abrirAA(), ["freno puesto"]);
  cl = avanzarChecklist(cl, con({ t: 1, freno: true }), ctx);
  cl = decir(cl, ["checklist completo", "checklist arranque"]);
  assert.deepEqual(avisosPorDecir(cl, new Set()), []);
  cl = oir(cl, "checklist completo", 2);
  assert.deepEqual(avisosPorDecir(cl, new Set()).map((a) => a.id), ["antes-arrancar", "arranque"]);
  assert.deepEqual(avisosPorDecir(cl, new Set(["antes-arrancar"])).map((a) => a.id), ["arranque"]);
});
test("brakers como lo escribe el reconocimiento cuenta como breakers", () => {
  const cl = decir(abrirAA(), ["asientos", "freno", "brakers adentro"]);
  assert.equal(cl.puntos["antes-arrancar"][4].estado, "dicho");
});

for (const [id, puntos] of [["c152", 92], ["arrow", 107]] as const) {
  const secciones = AVIONES_VOZ[id].secciones;
  const todos = secciones.flatMap((s) => s.puntos);

  test(`${id}: ${puntos} puntos en las 11 secciones, ids sin repetir y claves sin acentos`, () => {
    assert.deepEqual(secciones.map((s) => s.id), CHECKLIST_VOZ_C172.map((s) => s.id));
    assert.equal(todos.length, puntos);
    assert.equal(new Set(todos.map((p) => p.id)).size, puntos);
    for (const c of [...secciones, ...todos]) {
      assert.ok(c.claves.length > 0, c.id);
      for (const k of c.claves) assert.match(k, /^[a-z0-9 ]+$/, `${c.id}: ${k}`);
    }
  });

  test(`${id}: cada punto dicho tal cual se reconoce como el siguiente`, () => {
    let cl = crearChecklist(secciones);
    for (const s of secciones) {
      cl = oir(cl, `checklist ${s.claves[0]}`, 0);
      assert.equal(cl.abierta, s.id);
      for (const p of s.puntos) cl = oir(cl, p.dicho, 0);
      assert.ok(!estados(cl, s.id).includes("saltado"), `${s.id}: ${estados(cl, s.id).join(",")}`);
      assert.equal(cl.abierta, null, s.id);
    }
  });
}

test("carb heat como lo dice la escuela cuenta como calentador de carburador", () => {
  let cl = oir(crearChecklist(AVIONES_VOZ.c152.secciones), "checklist arranque", 0);
  cl = decir(cl, ["mezcla rica", "carb heat frio"]);
  assert.deepEqual(estados(cl, "arranque").slice(0, 2), ["revisando", "dicho"]);
});

const copiloto = (cl: Checklist, ya: Set<string> = new Set()) => respuestasCopiloto(cl, ya).map((r) => r.texto);

test("copiloto: un punto de solo voz se contesta en cuanto se dice", () => {
  const cl = decir(abrirAA(), ["asientos y cinturones", "freno"]);
  assert.deepEqual(copiloto(oir(cl, "breakers", 0)).slice(-1), ["Adentro."]);
});

test("copiloto: un punto del simulador se contesta hasta que se ve hecho", () => {
  let cl = decir(abrirAA(), ["asientos y cinturones", "freno de estacionamiento"]);
  assert.ok(!copiloto(cl).includes("Puesto."));
  cl = avanzarChecklist(cl, con({ t: 3, freno: true }), ctx);
  assert.ok(copiloto(cl).includes("Puesto."));
});

test("copiloto: si se vence sin hacerse pide revisarlo", () => {
  let cl = decir(abrirAA(), ["asientos y cinturones", "freno de estacionamiento"]);
  for (let t = 1; t <= 11; t++) cl = avanzarChecklist(cl, con({ t, freno: false }), ctx);
  assert.ok(copiloto(cl).includes("Revisa freno de estacionamiento."));
});

test("copiloto: no repite lo ya contestado ni contesta lo saltado", () => {
  const cl = oir(abrirAA(), "breakers adentro", 0);
  const una = respuestasCopiloto(cl, new Set());
  assert.deepEqual(una.map((r) => r.texto).slice(-1), ["Adentro."]);
  assert.equal(una.filter((r) => r.texto === "Ajustados y asegurados.").length, 0);
  assert.deepEqual(respuestasCopiloto(cl, new Set(una.map((r) => r.clave))), []);
});

test("copiloto: la respuesta del ultimo punto va antes del aviso de la seccion", () => {
  const ultimo = CHECKLIST_VOZ_C172[0].puntos.slice(2).map((p) => p.dicho);
  let cl = decir(abrirAA(), ultimo);
  for (let t = 1; t <= 11; t++) cl = avanzarChecklist(cl, con({ t, freno: true, avionica: false, selector: 1, valvula: true }), ctx);
  const textos = porDecir(cl, new Set(), new Set()).map((x) => x.texto);
  assert.equal(textos.at(-2), "Sin X rojas.");
  assert.equal(textos.at(-1), "Checklist antes de arrancar completado.");
});

test("sin copiloto solo salen los avisos", () => {
  const cl = decir(abrirAA(), [...CHECKLIST_VOZ_C172[0].puntos.slice(2).map((p) => p.dicho), "checklist completo"]);
  assert.ok(porDecir(cl, new Set(), null).every((x) => x.tipo === "aviso"));
});

test("dream como lo escribe el reconocimiento cuenta como trim", () => {
  const ad = decir(nuevo(), ["checklist antes de despegar", "radios configurados", "dream electrico configurado", "piloto automatico apagado", "dream despegue"]);
  assert.deepEqual(estados(ad, "antes-despegar").slice(0, 4), ["dicho", "dicho", "revisando", "revisando"]);
  const cr = decir(nuevo(), ["checklist crucero", "potencia", "dream ajustado"]);
  assert.equal(cr.puntos.crucero[1].estado, "dicho");
});
