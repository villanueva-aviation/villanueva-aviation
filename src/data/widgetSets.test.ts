import { test } from "node:test";
import assert from "node:assert/strict";
import { ACADEMIA_MODULOS } from "./academia.ts";
import { HOTSPOT_SETS } from "../features/academia/hotspots.ts";
import { AUDIO_SETS } from "./fraseologiaATC.ts";
import { CIRCUITO_SETS, TRAMOS_CIRCUITO } from "./circuitoTrafico.ts";
import { MODULE_SCENARIOS } from "./moduleContent.ts";

const interactividades = ACADEMIA_MODULOS.flatMap((m) =>
  m.actividades.filter((a) => a.tipo === "interactividad").map((a) => ({ modulo: m.slug, ...a })),
);

// Un id mal escrito no rompe nada: el widget cae al set por omisión y muestra
// el contenido de otro módulo. Nadie se entera hasta que un cadete lo reporta.
test("cada actividad apunta a un set que existe", () => {
  for (const a of interactividades) {
    if (a.hotspotSetId) {
      assert.ok(HOTSPOT_SETS[a.hotspotSetId], `${a.modulo}/${a.id}: no existe el juego "${a.hotspotSetId}"`);
    }
    if (a.audioSetId) {
      assert.ok(AUDIO_SETS[a.audioSetId], `${a.modulo}/${a.id}: no existe la tanda "${a.audioSetId}"`);
    }
    if (a.circuitoSetId) {
      assert.ok(CIRCUITO_SETS[a.circuitoSetId], `${a.modulo}/${a.id}: no existe la tanda "${a.circuitoSetId}"`);
    }
  }
});

test("los sets solo se declaran donde el widget los usa", () => {
  for (const a of interactividades) {
    if (a.hotspotSetId) assert.ok(["diagrama", "dragdrop"].includes(a.widget ?? ""), `${a.modulo}/${a.id}`);
    if (a.audioSetId) assert.equal(a.widget, "audio", `${a.modulo}/${a.id}`);
    if (a.circuitoSetId) assert.equal(a.widget, "circuito", `${a.modulo}/${a.id}`);
    if (a.circuitoSoloPrueba) assert.equal(a.widget, "circuito", `${a.modulo}/${a.id}`);
  }
});

// El audio sin tanda explícita usa las tarjetas por omisión del componente, que
// son un ejemplo de demostración, no el material grabado.
test("toda actividad de audio pide una tanda explícita", () => {
  for (const a of interactividades.filter((x) => x.widget === "audio")) {
    assert.ok(a.audioSetId, `${a.modulo}/${a.id} no declara audioSetId`);
  }
});

test("las preguntas del circuito apuntan a tramos reales y no se repiten", () => {
  const tramos = new Set(TRAMOS_CIRCUITO.map((t) => t.id));
  const vistos = new Set<string>();
  for (const [nombre, banco] of Object.entries(CIRCUITO_SETS)) {
    assert.ok(banco.length >= 5, `la tanda "${nombre}" tiene muy pocas preguntas`);
    for (const s of banco) {
      assert.ok(tramos.has(s.tramoCorrectoId), `${nombre}/${s.id}: tramo "${s.tramoCorrectoId}" no existe`);
      assert.ok(!vistos.has(s.id), `el id "${s.id}" está repetido entre tandas`);
      vistos.add(s.id);
    }
  }
});

// Cada tramo del circuito debe poder salir preguntado en cada módulo, si no hay
// tramos que el cadete nunca practica.
test("cada tanda del circuito cubre los cinco tramos", () => {
  for (const [nombre, banco] of Object.entries(CIRCUITO_SETS)) {
    const cubiertos = new Set(banco.map((s) => s.tramoCorrectoId));
    for (const t of TRAMOS_CIRCUITO) {
      assert.ok(cubiertos.has(t.id), `la tanda "${nombre}" nunca pregunta por "${t.id}"`);
    }
  }
});

test("los juegos de puntos tienen imagen y al menos tres zonas", () => {
  for (const [nombre, juego] of Object.entries(HOTSPOT_SETS)) {
    assert.ok(juego.imagen.startsWith("/images/"), `"${nombre}" sin imagen válida`);
    assert.ok(juego.puntos.length >= 3, `"${nombre}" tiene muy pocos puntos`);
    const ids = juego.puntos.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length, `"${nombre}" tiene ids repetidos`);
    for (const p of juego.puntos) {
      assert.ok(p.xPct > 0 && p.xPct < 100, `"${nombre}/${p.id}" fuera de la imagen en x`);
      assert.ok(p.yPct > 0 && p.yPct < 100, `"${nombre}/${p.id}" fuera de la imagen en y`);
    }
  }
});

// Los cuatro widgets ricos costaron trabajo y cada uno aparecía una sola vez en
// toda la ruta. Si alguno vuelve a quedarse solo, esta prueba lo dice.
test("ningún widget rico aparece una sola vez", () => {
  for (const widget of ["diagrama", "dragdrop", "audio", "circuito"]) {
    const usos = interactividades.filter((a) => a.widget === widget);
    assert.ok(usos.length >= 2, `"${widget}" solo aparece ${usos.length} vez`);
  }
});

// El audio es la excepción a propósito: sus dos tandas grabadas son material de
// Comunicaciones, así que vive dos veces ahí. Los demás sí deben repartirse.
test("el diagrama, el drag-drop y el circuito llegan a más de un módulo", () => {
  for (const widget of ["diagrama", "dragdrop", "circuito"]) {
    const modulos = new Set(interactividades.filter((a) => a.widget === widget).map((a) => a.modulo));
    assert.ok(modulos.size >= 2, `"${widget}" solo se usa en ${[...modulos].join(", ")}`);
  }
});

// ---------- Escenarios ----------

// Si el id no resuelve, ScenarioSimulator cae a su árbol por omisión y el
// cadete practica el escenario de otro módulo sin que nada lo indique.
test("cada escenario del temario resuelve contra un árbol real", () => {
  for (const a of interactividades.filter((x) => x.widget === "escenario")) {
    const id = a.scenarioId ?? a.modulo;
    assert.ok(MODULE_SCENARIOS[id], `${a.modulo}/${a.id}: no existe el escenario "${id}"`);
  }
});

test("todo escenario encadena al menos dos decisiones", () => {
  for (const [id, esc] of Object.entries(MODULE_SCENARIOS)) {
    const profundidad = (nodo: string, visto = new Set<string>()): number => {
      if (visto.has(nodo)) return 0;
      visto.add(nodo);
      const n = esc.tree[nodo];
      if (!n || n.options.length === 0) return 0;
      return 1 + Math.max(...n.options.map((o) => profundidad(o.next, new Set(visto))));
    };
    assert.ok(profundidad(esc.startId) >= 2, `"${id}" se resuelve con una sola decisión`);
  }
});

test("los escenarios están bien formados", () => {
  for (const [id, esc] of Object.entries(MODULE_SCENARIOS)) {
    assert.ok(esc.tree[esc.startId], `"${id}": el nodo inicial no existe`);

    const alcanzables = new Set<string>();
    const pendientes = [esc.startId];
    while (pendientes.length) {
      const actual = pendientes.pop()!;
      if (alcanzables.has(actual)) continue;
      alcanzables.add(actual);
      for (const o of esc.tree[actual]?.options ?? []) {
        assert.ok(esc.tree[o.next], `"${id}": la opción "${o.label}" apunta a "${o.next}", que no existe`);
        pendientes.push(o.next);
      }
    }

    for (const nodo of Object.keys(esc.tree)) {
      assert.ok(alcanzables.has(nodo), `"${id}": el nodo "${nodo}" no se alcanza desde el inicio`);
    }

    const finales = Object.values(esc.tree).filter((n) => n.options.length === 0);
    for (const f of finales) {
      assert.ok(f.outcome, `"${id}": el nodo "${f.id}" no tiene salida ni desenlace`);
    }
    const aciertos = finales.filter((n) => n.outcome?.correct);
    assert.equal(aciertos.length, 1, `"${id}" tiene ${aciertos.length} desenlaces correctos, debe haber uno`);
  }
});
