import { test } from "node:test";
import assert from "node:assert/strict";
import { ACADEMIA_MODULOS } from "./academia.ts";
import { HOTSPOT_SETS } from "../features/academia/hotspots.ts";
import { AUDIO_SETS } from "./fraseologiaATC.ts";
import { CIRCUITO_SETS, TRAMOS_CIRCUITO } from "./circuitoTrafico.ts";
import {
  MODULE_CHECKPOINTS,
  MODULE_EVALUACION,
  MODULE_PRACTICA,
  MODULE_SCENARIOS,
  MODULE_SLIDERS,
  MODULE_TERMS,
  checkpointsDeModulo,
} from "./moduleContent.ts";
import { valorMetrica } from "../features/academia/sliderValor.ts";

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

// ---------- Integridad de cada módulo ----------

// TermMatch con un id que no existe no falla: renderiza cero parejas.
test("cada actividad de términos resuelve contra un set real", () => {
  for (const a of interactividades.filter((x) => x.widget === "terminos")) {
    const id = a.termSetId ?? a.modulo;
    const set = MODULE_TERMS[id];
    assert.ok(set, `${a.modulo}/${a.id}: no existe el set de términos "${id}"`);
    assert.ok(set.length >= 3, `${a.modulo}/${a.id}: el set "${id}" tiene ${set.length} parejas`);
  }
});

test("el slider resuelve contra una configuración real", () => {
  for (const a of interactividades.filter((x) => x.widget === "slider")) {
    assert.ok(MODULE_SLIDERS[a.modulo], `${a.modulo}/${a.id}: no hay slider para este módulo`);
  }
});

test("todo módulo con evaluación tiene banco de preguntas", () => {
  for (const m of ACADEMIA_MODULOS) {
    const tieneEvaluacion = m.actividades.some((a) => a.tipo === "evaluacion");
    if (!tieneEvaluacion) continue;
    const evaluacion = MODULE_EVALUACION[m.slug] ?? [];
    const practica = MODULE_PRACTICA[m.slug] ?? [];
    assert.ok(evaluacion.length >= 5, `${m.slug}: evaluación con ${evaluacion.length} preguntas`);
    assert.ok(practica.length >= 3, `${m.slug}: práctica con ${practica.length} preguntas`);
  }
});

// checkpointsDeModulo descarta en silencio los ids que no encuentra en el banco
// del módulo, así que un checkpoint mal repartido simplemente desaparece.
test("todos los checkpoints declarados se resuelven", () => {
  for (const m of ACADEMIA_MODULOS) {
    const declarados = MODULE_CHECKPOINTS[m.slug] ?? [];
    if (declarados.length === 0) continue;
    const resueltos = checkpointsDeModulo(m.slug);
    assert.equal(resueltos.length, declarados.length, `${m.slug}: ${resueltos.length} de ${declarados.length}`);
    const temas = m.actividades.filter((a) => a.tipo === "leccion").length;
    for (const c of resueltos) {
      assert.ok(c.despuesDeTema < temas, `${m.slug}: checkpoint tras el tema ${c.despuesDeTema + 1} de ${temas}`);
    }
  }
});

test("todo módulo tiene lecciones", () => {
  for (const m of ACADEMIA_MODULOS) {
    const temas = m.actividades.filter((a) => a.tipo === "leccion").length;
    assert.ok(temas >= 4, `${m.slug} tiene ${temas} temas`);
  }
});

// La razón de partir Navegación fue que tenía 26 temas y el siguiente más
// largo 13. Si un módulo vuelve a dispararse, conviene enterarse.
test("ningún módulo se dispara en número de temas", () => {
  const cuentas = ACADEMIA_MODULOS.map((m) => ({
    slug: m.slug,
    temas: m.actividades.filter((a) => a.tipo === "leccion").length,
  }));
  for (const c of cuentas) {
    assert.ok(c.temas <= 16, `${c.slug} tiene ${c.temas} temas: conviene partirlo`);
  }
});

test("el slider de Navegación II calcula el tiempo con distancia ÷ velocidad, no en línea recta", () => {
  const [gs, tiempo, litros] = MODULE_SLIDERS["navegacion-2"].metrics;
  assert.deepEqual([valorMetrica(gs, 0), valorMetrica(gs, 0.5), valorMetrica(gs, 1)], [110, 90, 70]);
  assert.equal(Math.round(valorMetrica(tiempo, 0)), 59);
  assert.equal(Math.round(valorMetrica(tiempo, 0.5)), 72); // 108.6 NM a 90 kt
  assert.equal(Math.round(valorMetrica(tiempo, 1)), 93);
  assert.equal(Math.round(valorMetrica(litros, 0.5)), 48); // 72 min a 40 L/h
});

test("Cartografía: cada juego de términos va con lo que enseña su capítulo", () => {
  const ids = (k: string) => MODULE_TERMS[k].map((t) => t.term);
  assert.deepEqual(ids("cartografia"), ["Carta VFR (Sectional)", "Aeropuerto controlado", "Espacio Clase B", "Espacio Clase D"]);
  assert.deepEqual(ids("cartografia-2"), ["MEF", "CTAF", "Obstáculo '1500 (450)'", "Curvas de nivel"]);
  assert.deepEqual(ids("cartografia-3"), ["Punto VFR", "Trazar la ruta", "Aeropuerto no controlado", "MOA", "Vía aérea Víctor", "Declinación magnética"]);
  assert.ok(!MODULE_TERMS["cartografia-2"][0].definition.includes("seguridad"), "el MEF no es una altitud de seguridad");
});

test("Comunicaciones: cada juego de términos va con lo que enseña su capítulo", () => {
  const ids = (k: string) => MODULE_TERMS[k].map((t) => t.term);
  assert.deepEqual(ids("comunicaciones"), ["Wilco", "Roger", "Affirm", "Negative", "Say again", "Standby", "Readback obligatorio"]);
  assert.deepEqual(ids("comunicaciones-2"), ["Fraseología estándar", "CTAF", "Traffic in sight", "Frequency change approved", "PAN-PAN", "MAYDAY", "Stepping on"]);
});

test("Comunicaciones: la fraseología con audio no repite los errores de la revisión", () => {
  const tarjetas = [...AUDIO_SETS["rodaje-despegue"], ...AUDIO_SETS["emergencias-aproximacion"]];
  const textos = tarjetas.map((c) => c.situacion + " " + c.callout).join(" ");
  assert.ok(!/pista 02/.test(textos), "la 02 y la 20 son la misma pista");
  assert.ok(!/cinco mil pies/.test(textos), "cinco mil pies es el nivel de Guadalajara");
  assert.ok(!/solicito información/i.test(textos), "el ATIS se escucha, no se pide");
  const listo = AUDIO_SETS["rodaje-despegue"].find((c) => /listo para/.test(c.callout))!;
  assert.match(listo.callout, /listo para salida/);
  assert.ok(listo.elementos.some((e) => e.palabrasClave.includes("listo para salida") && e.palabrasClave.includes("listo para despegue")));
  // Las tarjetas que cambiaron de texto ya no coinciden con la grabación: usan la voz sintética.
  for (const c of tarjetas) {
    if (/punto de espera|listo para salida|nueve mil/.test(c.callout)) assert.equal(c.audioUrl, undefined, c.callout);
  }
});

test("Circuito: el tramo alineado con la pista después del despegue es la salida", () => {
  const t = TRAMOS_CIRCUITO.find((x) => x.id === "viento-en-cara")!;
  assert.match(t.nombre, /^Salida/);
});

// Dos actividades con el mismo id comparten el avance: completar una marca las dos.
test("ningún módulo repite el id de una actividad", () => {
  for (const m of ACADEMIA_MODULOS) {
    const ids = m.actividades.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, m.slug);
  }
});

test("Instrumentos: el error ANDS es en rumbos este-oeste", () => {
  const ands = MODULE_TERMS.instrumentos.find((t) => t.term === "ANDS")!;
  assert.match(ands.definition, /este-oeste/);
  const q7 = [...MODULE_PRACTICA.instrumentos, ...MODULE_EVALUACION.instrumentos].find((p) => p.id === "ins-q7")!;
  assert.match(q7.opciones[q7.correcta], /este-oeste/);
});

test("Instrumentos: el pitot capta la presión total y su bloqueo se describe completo", () => {
  const t = Object.fromEntries(MODULE_TERMS["instrumentos-2"].map((x) => [x.term, x.definition]));
  assert.match(t["Tubo pitot"], /presión total/);
  assert.match(t["Bloqueo del pitot"], /drenaje/);
});

test("Instrumentos: el escenario es una sola falla de la toma estática", () => {
  const { tree, startId } = MODULE_SCENARIOS["instrumentos-2"];
  const inicio = tree[startId];
  assert.match(inicio.prompt, /altímetro se queda fijo/);
  const bien = inicio.options.find((o) => /toma estática/.test(o.label))!;
  assert.equal(bien.next, "segunda");
  const alterna = tree.segunda.options.find((o) => /estática alterna/.test(o.label))!;
  assert.equal(tree[alterna.next].outcome?.correct, true);
  const pitot = tree.segunda.options.find((o) => /calefacción del pitot/.test(o.label))!;
  assert.equal(tree[pitot.next].outcome?.correct, false);
  const textos = Object.values(tree).map((n) => n.prompt + " " + (n.outcome?.feedback ?? "")).join(" ");
  assert.ok(!/en descenso indica menos/.test(textos), "con la estática bloqueada, en descenso marca más");
});

const preguntaRen = (id: string) => [...MODULE_PRACTICA.rendimiento, ...MODULE_EVALUACION.rendimiento].find((p) => p.id === id)!;

test("Rendimiento: la pregunta de altitud de densidad tiene sus propias opciones", () => {
  const q = preguntaRen("ren-q15");
  assert.match(q.opciones[q.correcta], /motor/);
  assert.ok(!q.opciones.some((o) => /estable|ágil/.test(o)), "eran las opciones de la pregunta del CG");
});

test("Rendimiento: el viento de cola de 10 nudos suma 50% en un C172", () => {
  for (const id of ["ren-q4", "ren-q17"]) {
    const q = preguntaRen(id);
    assert.match(q.opciones[q.correcta], /50%/, id);
    assert.ok(!q.opciones.some((o) => /20-30%/.test(o)), id);
  }
  const q12 = preguntaRen("ren-q12");
  assert.match(q12.opciones[q12.correcta], /50%/);
});

test("Rendimiento: el peso vacío ya no excluye el aceite", () => {
  const t = MODULE_TERMS["rendimiento-2"].find((x) => x.term === "Peso vacío")!;
  assert.ok(!/aceite utilizable/.test(t.definition));
  assert.match(t.definition, /combustible no utilizable/);
});

test("Rendimiento: el simulador dice que sus valores son de ejemplo", () => {
  const s = MODULE_SLIDERS.rendimiento;
  assert.match(s.footnote, /ejemplo/i);
  assert.ok(!s.metrics.some((m) => /Margen de seguridad/.test(m.label)));
  const pista = s.metrics.find((m) => /50% de margen/.test(m.label))!;
  const carrera = s.metrics.find((m) => /Carrera/.test(m.label))!;
  assert.equal(pista.from, carrera.from * 1.5);
  assert.equal(pista.to, carrera.to * 1.5);
});

const preguntaVfr = (id: string) => [...MODULE_PRACTICA.vfr, ...MODULE_EVALUACION.vfr].find((p) => p.id === id)!;

test("VFR: de noche solo cambian los mínimos de la Clase G", () => {
  const q = preguntaVfr("vfr-q15");
  assert.match(q.opciones[q.correcta], /iguales/);
  assert.match(q.opciones[q.correcta], /Clase G/);
});

test("VFR: 500/1,000/2,000 ft es para las Clases C, D y E", () => {
  assert.match(preguntaVfr("vfr-q2").pregunta, /Clase C, D o E/);
});

test("VFR: con techo de 900 ft hace falta Special VFR", () => {
  const q = preguntaVfr("vfr-q8");
  assert.match(q.opciones[q.correcta], /Special VFR/);
});

test("VFR: la baliza se enciende antes de arrancar", () => {
  const t = MODULE_TERMS.vfr.find((x) => x.term === "Baliza (Beacon)")!;
  assert.match(t.definition, /antes de arrancar/);
});

test("VFR: en base ya vas descendiendo; el descenso empieza en viento en cola", () => {
  const s = CIRCUITO_SETS.vfr.find((x) => x.id === "vfr-3")!;
  assert.ok(!/Acabas de dejar la altitud de circuito/.test(s.prompt));
  assert.match(s.prompt, /ya en descenso/);
});

const preguntaOp = (id: string) => [...MODULE_PRACTICA.operacion, ...MODULE_EVALUACION.operacion].find((p) => p.id === id)!;

test("Operación: fuego en el arranque, seguir girando el arranque es lo correcto", () => {
  const inicio = MODULE_SCENARIOS.operacion.tree.inicio;
  const mala = inicio.options.find((o) => o.next === "falla-1")!;
  assert.match(mala.label, /bombear el acelerador/);
  const fb = MODULE_SCENARIOS.operacion.tree["falla-1"].outcome!.feedback;
  assert.ok(!/alimenta el incendio/.test(fb));
  assert.match(fb, /seguir girando/);
});

test("Operación: ante una falla en la carrera de despegue se aborta", () => {
  const q = preguntaOp("op-q14");
  assert.match(q.opciones[q.correcta], /^Abortar/);
});

test("Operación: estabilizado a más tardar a 500 ft y términos corregidos", () => {
  const t = (id: string) => [...MODULE_TERMS.operacion, ...MODULE_TERMS["operacion-2"]].find((x) => x.id === id)!.definition;
  assert.match(t("op-5"), /500 ft/);
  assert.match(t("op2-4"), /[Ii]nstrucción/);
  assert.ok(!/velocidad de decisión/.test(t("op2-5")));
});

test("Operación: en base sigues descendiendo, el viraje es desde el viento en cola", () => {
  const s = CIRCUITO_SETS.operacion.find((x) => x.id === "ope-2")!;
  assert.match(s.prompt, /desde el viento en cola/);
  assert.match(s.prompt, /sigues descendiendo/);
});

test("Operación: la presión de aceite con la cifra del C172S", () => {
  const q = preguntaOp("op-q16");
  assert.match(q.pregunta, /tiempo que marca el POH/);
});
