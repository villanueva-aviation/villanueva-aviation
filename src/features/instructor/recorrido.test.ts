import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import type { EvaluacionVuelo, FaseVuelo } from "./fasesVuelo.ts";
import { crearRepaso, type EstadoRepaso, type EtapaRepaso } from "./repaso.ts";
import { MANIOBRAS, type ManiobraId, type ResultadoComun } from "./maniobras.ts";
import { CAMPO_PUNTO, cerrarGrabacion, crearGrabador, faseMapa, grabarMuestra, grabarVoz, marcasErrores, puntoEn, TOLERANCIAS, tramosFuera, unidadDe, type Punto } from "./recorrido.ts";
import { grabacionDemo } from "./recorridoDemo.ts";
import type { Nivel } from "./nivel.ts";
import { simularRumbos } from "./simular.ts";
import { toleranciaRumbos } from "./evaluadorRumbos.ts";
import { avanzarInterceptacion, iniciarInterceptacion } from "./evaluadorInterceptacion.ts";
import { crearChecklist, type Checklist } from "./checklistVoz.ts";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";

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

// ── Errores y grabación final ──

const calificar = (id: ManiobraId, ms: Muestra[], nivel: Nivel = 3): ResultadoComun => {
  const d = MANIOBRAS[id];
  let ev = d.armar(ms[0], nivel);
  for (const m of ms.slice(1)) ev = d.avanzar(ev, m);
  return d.resultado(ev)!;
};
const corrido = (ms: Muestra[], seg: number) => ms.map((m) => ({ ...m, t: m.t + seg }));
const checklistLeido = (cambiar?: (cl: Checklist) => void) => {
  const cl = crearChecklist(CHECKLIST_VOZ_C172);
  cl.leidas = cl.secciones.map((s) => s.id);
  for (const s of cl.secciones) cl.puntos[s.id] = cl.puntos[s.id].map(() => ({ estado: "dicho" as const }));
  cambiar?.(cl);
  return cl;
};
/** Una lección terminada: despegue en t 100, aterrizaje en t 2000, zona de 200 a 1900. */
const leccion = (x: Partial<EstadoRepaso> = {}): EstadoRepaso => {
  const e = crearRepaso("practica", ["virajes-rumbos", "virajes-rumbos"], 2);
  return {
    ...e,
    etapa: "terminado",
    vuelo: { fase: "terminado", eventos: [{ t: 100, tipo: "despegue", pista: null }, { t: 2000, tipo: "aterrizaje", pista: null }] } as unknown as EvaluacionVuelo,
    tomas: { ...e.tomas, rotacionKt: 57, vy: { suma: 74 * 3, n: 3 }, final: { min: 63, max: 70, n: 5 }, tocoEnPista: true },
    zona: { nombre: { es: "Cajititlán", en: "Cajititlan" }, lat: 20.44, lon: -103.31, radioNm: 3 },
    ...x,
  };
};
const grabadorConFases = () => {
  const g = crearGrabador();
  g.fases = [{ fase: "rodaje", inicio: 0, fin: 100 }, { fase: "despegue", inicio: 100, fin: 200 }, { fase: "zona", inicio: 200, fin: 1900 }, { fase: "aterrizaje", inicio: 1900, fin: 2010 }];
  g.puntos = [[0, 20.5, -103.3, 5000, 0, 90, 0, 0, 0], [2100, 20.5, -103.3, 5000, 0, 90, 0, 0, 0]];
  return g;
};
const malRumbo = () => calificar("virajes-rumbos", corrido(simularRumbos({ pasarse: 25 }), 300), 2);
const bienRumbo = () => calificar("virajes-rumbos", corrido(simularRumbos(), 600), 2);

test("cada campo de cada maniobra tiene unidad y nombre", () => {
  for (const id of Object.keys(MANIOBRAS) as ManiobraId[])
    for (const campo of Object.keys(TOLERANCIAS[id](3))) {
      assert.equal(typeof unidadDe(id, campo), "string", `${id}.${campo}`);
      assert.ok(MANIOBRAS[id].celdas.some((c) => c.campo === campo), `celda ${id}.${campo}`);
    }
});

test("tramosFuera encuentra los fuera anidados, sin entrar a las muestras", () => {
  const r = {
    lados: [{ fuera: { altitud: [{ inicio: 1, fin: 2, peor: 120 }], bola: [] } }, { fuera: { velocidad: [{ inicio: 5, fin: 9, peor: -12 }] } }],
    muestras: [{ fuera: { x: [{ inicio: 0, fin: 0, peor: 1 }] } }],
  };
  assert.deepEqual(tramosFuera(r), [{ campo: "altitud", inicio: 1, fin: 2, peor: 120 }, { campo: "velocidad", inicio: 5, fin: 9, peor: -12 }]);
});

test("un error de rumbos queda en su momento, en la zona y con la tolerancia del nivel", () => {
  const gr = cerrarGrabacion(grabadorConFases(), { leccion: 4, e: leccion(), cl: checklistLeido(), resultados: [{ maniobra: "virajes-rumbos", resultado: malRumbo() }] });
  const err = gr.errores.find((x) => x.campo === "rumbo")!;
  assert.ok(err, "hay error de rumbo");
  assert.equal(err.tol, toleranciaRumbos(2).rumbo);
  assert.equal(err.intento, 1);
  assert.equal(err.maniobra, "virajes-rumbos");
  assert.equal(err.fase, "zona");
  assert.ok(err.inicio! >= gr.intentos[0].inicio && err.inicio! <= gr.intentos[0].fin);
  assert.ok(gr.explicaciones.some((x) => x.intento === 1 && x.lineas.es.length > 0 && x.lineas.en.length > 0));
});

test("la misma maniobra dos veces en práctica: dos intentos, errores de cada uno", () => {
  const gr = cerrarGrabacion(grabadorConFases(), {
    leccion: 4, e: leccion(), cl: checklistLeido(),
    resultados: [{ maniobra: "virajes-rumbos", resultado: bienRumbo() }, { maniobra: "virajes-rumbos", resultado: calificar("virajes-rumbos", corrido(simularRumbos({ pasarse: 25 }), 900), 2) }],
  });
  assert.deepEqual(gr.intentos.map((i) => i.n), [1, 2]);
  assert.ok(gr.errores.length > 0);
  assert.ok(gr.errores.every((x) => x.intento === 2));
});

test("errores en orden de tiempo y numerados; el checklist al final, sin momento, en un solo renglón", () => {
  const sinLeer = checklistLeido((cl) => {
    cl.puntos["arranque"][0] = { estado: "saltado" };
    cl.puntos["arranque"][1] = { estado: "saltado" };
  });
  const gr = cerrarGrabacion(grabadorConFases(), { leccion: 4, e: leccion(), cl: sinLeer, resultados: [{ maniobra: "virajes-rumbos", resultado: malRumbo() }] });
  assert.deepEqual(gr.errores.map((x) => x.n), gr.errores.map((_, k) => k + 1));
  const conT = gr.errores.filter((x) => x.inicio !== null).map((x) => x.inicio!);
  assert.deepEqual(conT, [...conT].sort((a, b) => a - b));
  const ultimo = gr.errores.at(-1)!;
  assert.equal(ultimo.fase, "checklist");
  assert.equal(ultimo.inicio, null);
  assert.equal(gr.errores.filter((x) => x.fase === "checklist").length, 1);
  assert.doesNotMatch(ultimo.texto!.en, /[áéíóúñ¿¡]/);
});

test("rotar fuera de Vr es un error del despegue en el t del evento; tocar fuera de la pista, del aterrizaje", () => {
  const e = leccion();
  const gr = cerrarGrabacion(grabadorConFases(), { leccion: 4, e: { ...e, tomas: { ...e.tomas, rotacionKt: 40, tocoEnPista: false } }, cl: checklistLeido(), resultados: [] });
  const despegue = gr.errores.find((x) => x.fase === "despegue")!;
  assert.equal(despegue.inicio, 100);
  assert.match(despegue.texto!.es, /40 kt/);
  const aterrizaje = gr.errores.find((x) => x.fase === "aterrizaje")!;
  assert.equal(aterrizaje.inicio, 2000);
});

test("lección sin errores: lista vacía y renglones de bien en los dos idiomas", () => {
  const gr = cerrarGrabacion(grabadorConFases(), { leccion: 4, e: leccion(), cl: checklistLeido(), resultados: [{ maniobra: "virajes-rumbos", resultado: bienRumbo() }] });
  assert.equal(gr.errores.length, 0);
  assert.ok(gr.bien.es.length > 0);
  assert.equal(gr.bien.es.length, gr.bien.en.length);
  assert.equal(gr.anulada, null);
  assert.equal(gr.version, 1);
  assert.equal(gr.leccion, 4);
});

test("lección anulada: anulada con el t del último punto y el motivo", () => {
  const motivo = "Usaste el modo slew: la lección no se califica.";
  const gr = cerrarGrabacion(grabadorConFases(), { leccion: 4, e: leccion({ etapa: "invalido", motivo }), cl: checklistLeido(), resultados: [] });
  assert.deepEqual(gr.anulada, { t: 2100, motivo });
});

test("el vuelo de demostración trae recorrido, 2 intentos y un error de rumbo en la zona", () => {
  const gr = grabacionDemo();
  assert.ok(gr.puntos.length > 300);
  assert.equal(gr.intentos.length, 2);
  const rumbo = gr.errores.find((x) => x.campo === "rumbo")!;
  assert.equal(rumbo.fase, "zona");
  assert.ok(gr.fases.some((f) => f.fase === "zona"));
  assert.ok(gr.voz.length > 0);
});

test("errores en el mismo punto del mapa comparten un marcador; los que no tienen momento no llevan", () => {
  const g = grabacionDemo();
  const marcas = marcasErrores(g);
  assert.deepEqual(marcas.map((m) => m.ns), [[1, 2], [3]]);
  assert.equal(marcas[0].punto, puntoEn(g.puntos, g.errores[0].inicio!));
});

// ── IFR: el radial en el mapa ──

const conNav = (x: Partial<Muestra> = {}) => muestra({ navMhz: 117.5, navObs: 90, navRadial: 92.4, navDesv: -2.46, navDesde: 2, navDme: 8.26, navTieneDme: true, navSenal: true, gpsNav: false, ...x });

test("IFR: el grabador con nav guarda radial, barra en puntos y DME; sin nav, los 9 de siempre", () => {
  const g = crearGrabador(true);
  grabarMuestra(g, conNav(), estado("maniobra"));
  assert.equal(g.puntos[0].length, 12);
  assert.deepEqual(g.puntos[0].slice(9), [92, -1.2, 8.3]);
  assert.equal(CAMPO_PUNTO.radial, 9);
  const v = crearGrabador();
  grabarMuestra(v, conNav(), estado("maniobra"));
  assert.equal(v.puntos[0].length, 9);
});

/** Interceptación alejándose por el radial 090 que se pasa 1.4 puntos (medio: error). */
function interceptacionPasada(): ResultadoComun {
  const ej = { caso: "alejandose" as const, radial: 90, desde: true, curso: 90 };
  const en = (t: number, desv: number, rumbo: number) => conNav({ t: 300 + t, navRadial: (90 + desv + 360) % 360, rumbo, navDme: 6 + t / 60 });
  let e = iniciarInterceptacion(en(0, 20, 60), 2, ej, { intento: 0, examen: false, vor: "GDL" });
  const vuelo: [number, number][] = [];
  for (let d = 19; d >= 0; d--) vuelo.push([d, 60]);
  vuelo.push([-1, 100], [-2, 100], [-2.8, 100], [-2, 80], [-1, 80]);
  for (let k = 0; k < 35; k++) vuelo.push([0, 90]);
  vuelo.forEach(([d, r], i) => (e = avanzarInterceptacion(e, en(i + 1, d, r))));
  return e.resultado!;
}

test("IFR: el cierre trae el VOR, el radial de cada intento y el sobrepaso como error en puntos", () => {
  const r = interceptacionPasada();
  const vor = { ident: "GDL", region: "MM", lat: 20.52, lon: -103.31, mhz: 117.5, dme: true, decl: 5 };
  const e = { ...leccion(), programa: "ifr" as const, vor, zona: null, sorteo: ["interceptar-radial" as const] };
  const x = cerrarGrabacion(grabadorConFases(), { leccion: 1, e, cl: checklistLeido(), resultados: [{ maniobra: "interceptar-radial", resultado: r }] });
  assert.deepEqual(x.vor, { ident: "GDL", lat: 20.52, lon: -103.31, decl: 5 });
  assert.deepEqual(x.radiales, [{ intento: 1, radial: 90, desde: true }]);
  const err = x.errores.find((v) => v.campo === "sobrepaso");
  assert.ok(err, JSON.stringify(x.errores));
  assert.equal(unidadDe("interceptar-radial", "sobrepaso"), " puntos");
  assert.equal(x.zona, null);
});

test("VFR: la grabación no gana vor ni radiales", () => {
  const x = cerrarGrabacion(grabadorConFases(), { leccion: 4, e: leccion(), cl: checklistLeido(), resultados: [] });
  assert.equal("vor" in x, false);
  assert.equal("radiales" in x, false);
});
