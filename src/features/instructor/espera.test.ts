import { test } from "node:test";
import assert from "node:assert/strict";
import { entradaEspera, generarSituacion } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { avanzarEspera, armarEspera, responderEntrada, type EvaluacionEspera } from "./evaluadorEspera.ts";
import { MANIOBRAS } from "./maniobras.ts";
import { altitudEspera, entradaDicha, entradasValidas, entradaVolada, inventarEspera, norm180, rutaEspera, type DatosEspera } from "./navIfr.ts";
import type { Nivel } from "./nivel.ts";
import { avisoEspera, briefingEspera, ordenEspera } from "./textosEspera.ts";
import type { VorElegido } from "./vorSim.ts";

// Simulador local: VOR en 0,0 (declinación 0), 100 kt, una muestra por segundo. x al este, y al norte, en NM.
const VOR = { ident: "TST", region: "", lat: 0, lon: 0, mhz: 113.1, dme: true, decl: 0 } as VorElegido;
const RAD = Math.PI / 180;
const n360 = (g: number) => ((g % 360) + 360) % 360;

type Tramo = [seg: number, tasa: number]; // tasa en °/s: + derecha, − izquierda, 0 recto
type Avion = { x: number; y: number; rumbo: number };

function volarTramos(avion: Avion, tramos: Tramo[], t0: number): Muestra[] {
  const out: Muestra[] = [];
  let t = t0;
  for (const [seg, tasa] of tramos) {
    for (let k = 0; k < seg; k++) {
      avion.rumbo = n360(avion.rumbo + tasa);
      avion.x += (100 / 3600) * Math.sin(avion.rumbo * RAD);
      avion.y += (100 / 3600) * Math.cos(avion.rumbo * RAD);
      out.push(muestra(t++, avion, tasa === 0 ? 0 : 20 * Math.sign(tasa)));
    }
  }
  return out;
}

function muestra(t: number, a: Avion, inclinacion: number): Muestra {
  return {
    t, inclinacion, altitud: 5000, velocidad: 100, rumbo: a.rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
    titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 270, navRadial: n360(Math.atan2(a.x, a.y) / RAD), navDesv: 0, navDesde: 1,
    navDme: Math.hypot(a.x, a.y), navTieneDme: true, navSenal: true, gpsNav: false, lat: a.y / 60, lon: a.x / 60,
  };
}

// Espera sobre el VOR: acercamiento 270, giros a la derecha, alejamiento 090 (radial 090).
const ESPERA: DatosEspera = { acercamiento: 270, giros: "derecha", tramoSeg: 60, carta: false };

/** Llega por el radial 090 desde 8 NM, entrada directa y dos vueltas con tramos de `tramo` segundos. */
function esperaDirecta(tramo = 60): Muestra[] {
  const a: Avion = { x: 8, y: 0, rumbo: 270 };
  const llegada = volarTramos(a, [[288, 0]], 0);
  const vuelta: Tramo[] = [[1, 0], [60, 3], [tramo, 0], [60, 3], [tramo, 0]];
  return [muestra(-1, { x: 8.03, y: 0, rumbo: 270 }, 0), ...llegada, ...volarTramos(a, [...vuelta, ...vuelta, [40, 0]], 288)];
}

function volar(ms: Muestra[], nivel: Nivel = 2, responder: string | null = "directa", espera: DatosEspera = ESPERA): EvaluacionEspera {
  let e = armarEspera(ms[0], nivel, { intento: 0, examen: false, estacion: VOR, espera, llegada: 90 });
  for (const m of ms.slice(1)) {
    e = avanzarEspera(e, m);
    if (e.preguntar && responder) e = responderEntrada(e, responder as "directa", m.rumbo);
  }
  return e;
}

test("entradaDicha: lágrima, teardrop, parallel; dos distintas o nada → null", () => {
  assert.equal(entradaDicha("Voy a hacer una lágrima", "es"), "gota");
  assert.equal(entradaDicha("teardrop", "en"), "gota");
  assert.equal(entradaDicha("tear drop entry", "en"), "gota");
  assert.equal(entradaDicha("parallel", "en"), "paralela");
  assert.equal(entradaDicha("Directa", "es"), "directa");
  assert.equal(entradaDicha("directa o paralela", "es"), null);
  assert.equal(entradaDicha("", "es"), null);
});

test("entradaDicha: «voy directo» y «en paralelo» también cuentan", () => {
  assert.equal(entradaDicha("Voy directo", "es"), "directa");
  assert.equal(entradaDicha("Entrada en paralelo", "es"), "paralela");
});

test("entradasValidas: a 3° de la frontera de 110° valen paralela y directa", () => {
  const v = entradasValidas([197 - 5, 197, 197 + 5], 90, "derecha");
  assert.ok(v.includes("paralela"));
  assert.ok(v.includes("directa"));
  assert.equal(v.length, 2);
});

test("entradaVolada: directa, paralela, gota y sin tramo recto (espera a la derecha, alejamiento 090)", () => {
  const de = (rumbo: number, tramos: Tramo[]) => volarTramos({ x: 0, y: 0, rumbo }, tramos, 0);
  assert.equal(entradaVolada(de(270, [[5, 0], [60, 3], [60, 0], [60, 3]]), 90, "derecha"), "directa");
  assert.equal(entradaVolada(de(150, [[3, 0], [20, -3], [60, 0], [70, -3]]), 90, "derecha"), "paralela");
  assert.equal(entradaVolada(de(50, [[2, 5], [60, 0], [70, 3]]), 90, "derecha"), "gota");
  assert.equal(entradaVolada(de(270, [[200, 3]]), 90, "derecha"), null);
});

test("entradaVolada: un tramo largo en el rumbo de llegada antes de virar no la vuelve gota", () => {
  const ms = volarTramos({ x: 0, y: 0, rumbo: 270 }, [[40, 0], [60, 3], [60, 0], [60, 3]], 0);
  assert.equal(entradaVolada(ms, 90, "derecha"), "directa");
});

test("espera completa: directa dicha y volada, tramos de 60 s, virajes a 3°/s → 100", () => {
  const e = volar(esperaDirecta());
  assert.equal(e.fase, "terminado");
  const r = e.resultado!;
  assert.deepEqual(r.fuera, { dicha: [], volada: [], tramo: [], acercamiento: [], virajes: [], distancia: [], altitud: [] });
  assert.equal(r.volada, "directa");
  assert.equal(r.correcta, "directa");
  assert.deepEqual(r.tramos, [59]);
  assert.ok(e.acerc.length >= 5, "se calificó el acercamiento");
  assert.equal(r.tasas.length, 4);
  for (const x of r.tasas) assert.ok(Math.abs(x - 3) < 0.01);
  assert.ok(r.maxDistancia > 1.5 && r.maxDistancia < 2.5);
  assert.equal(r.aprobado, true);
  assert.equal(r.calificacion, 100);
});

test("tramos de 75 s: error en el tramo en medio, no en fácil", () => {
  const medio = volar(esperaDirecta(75), 2).resultado!;
  assert.equal(medio.fuera.tramo.length, 1);
  assert.equal(medio.calificacion, 80);
  assert.equal(volar(esperaDirecta(75), 1).resultado!.fuera.tramo.length, 0);
});

test("sin respuesta a la pregunta: error en la entrada dicha", () => {
  const r = volar(esperaDirecta(), 2, null).resultado!;
  assert.equal(r.fuera.dicha.length, 1);
  assert.equal(r.dicha, null);
});

test("armada a 2 NM: sale por su radial y sin preguntar hasta pasar 8 NM", () => {
  const a: Avion = { x: 2, y: 0, rumbo: 90 };
  const ms = [muestra(0, a, 0), ...volarTramos(a, [[212, 0]], 1)]; // llega a 7.9 NM
  let e = volar(ms);
  assert.equal(e.fase, "posicionando");
  assert.equal(e.preguntar, false);
  e = volar([...ms, ...volarTramos(a, [[10, 0]], 213)]);
  assert.equal(e.fase, "llegando");
  assert.equal(e.ejercicio.llegada, 90);
});

test("preguntar se enciende a 120 s del fijo y una sola vez", () => {
  const ms = esperaDirecta().slice(0, 289);
  let e = armarEspera(ms[0], 2, { intento: 0, examen: false, estacion: VOR, espera: ESPERA, llegada: 90 });
  let veces = 0;
  let distancia = 0;
  for (const m of ms.slice(1)) {
    const antes = e.preguntar;
    e = avanzarEspera(e, m);
    if (e.preguntar && !antes) {
      veces++;
      distancia = m.navDme!;
      e = responderEntrada(e, "directa", m.rumbo);
    }
  }
  assert.equal(veces, 1);
  assert.ok(distancia <= 3.34 && distancia > 3.3, String(distancia));
  assert.equal(e.dicha, "directa");
});

test("inventarEspera coincide con generarSituacion: acercamiento = alejamiento + 180", () => {
  const azar = () => {
    const v = [0.3, 0.5, 0.1, 0.6];
    let k = 0;
    return () => v[k++ % v.length];
  };
  const s = generarSituacion(azar());
  const d = inventarEspera(azar());
  assert.equal(d.acercamiento, n360(s.alejamiento + 180));
  assert.equal(d.giros, s.giros);
  assert.equal(d.tramoSeg, 60);
  assert.equal(d.carta, false);
});

test("el examen de la espera va en medio como mínimo y el briefing en inglés no tiene caracteres del español", () => {
  assert.equal(MANIOBRAS.espera.nivelExamen?.(1), 2);
  for (const l of briefingEspera("en")) assert.doesNotMatch(l, /[áéíóúñ¿¡]/i);
});

test("altitud de la espera inventada: elevación + 3000 ft, al millar de arriba (MMGL 5016 → 9000)", () => {
  assert.equal(altitudEspera(5016), 9000);
  assert.equal(altitudEspera(2000), 5000);
  assert.equal(inventarEspera(Math.random, 5016).altitudFt, 9000);
  assert.equal(inventarEspera().altitudFt, undefined);
});

test("sin altitud en la espera, sale del terreno bajo el avión al armarla", () => {
  // El simulador vuela a 5000 ft con 3000 ft AGL: terreno a 2000 → 5000.
  assert.equal(volar(esperaDirecta()).ejercicio.altitudFt, 5000);
});

test("200 ft debajo de la altitud de la espera: error de altitud en medio, no en fácil", () => {
  const alta = { ...ESPERA, altitudFt: 5200 };
  const medio = volar(esperaDirecta(), 2, "directa", alta).resultado!;
  assert.equal(medio.fuera.altitud.length, 1);
  assert.equal(medio.peorAltitud, -200);
  assert.equal(medio.calificacion, 80);
  assert.equal(volar(esperaDirecta(), 1, "directa", alta).resultado!.fuera.altitud.length, 0);
});

test("el instructor dice a qué altitud cruzar el fijo y avisa si te sales de ella en la espera", () => {
  const ms = esperaDirecta();
  const e = volar(ms.slice(0, 20), 2, "directa", { ...ESPERA, altitudFt: 9000 });
  assert.equal(e.fase, "llegando");
  assert.match(ordenEspera("posiciona", "llega", e, "es")!, /cruza el fijo a 9,000 pies/);
  assert.match(ordenEspera("posiciona", "llega", e, "en")!, /cross the fix at 9,000 feet/);
  // Antes del fijo no avisa la altitud: todavía puede estar subiendo.
  assert.equal(avisoEspera(e, ms[19], "practica", "es"), null);
  const v = volar(ms.slice(0, 400), 2, "directa", { ...ESPERA, altitudFt: 9000 });
  assert.equal(v.fase, "entrada");
  assert.equal(avisoEspera(v, ms[399], "practica", "es")?.texto, "Mantén 9,000 pies");
});

test("rutaEspera: el regreso queda en la zona de la entrada, a 10° o más de las fronteras, y la salida a 20–40° de él", () => {
  for (const entrada of ["directa", "paralela", "gota"] as const)
    for (let k = 0; k < 40; k++) {
      const { salida, llegada } = rutaEspera(90, "derecha", entrada);
      for (const d of [-10, 0, 10]) assert.equal(entradaEspera(n360(llegada + 180 + d), 90, "derecha"), entrada, `${entrada} ${llegada}`);
      const giro = Math.abs(norm180(salida - llegada));
      assert.ok(giro >= 20 && giro <= 40 && salida % 10 === 0 && llegada % 10 === 0, `${salida} ${llegada}`);
    }
  assert.equal(rutaEspera(90, "derecha", "gota", Math.random, 120).llegada, 120);
});

test("la práctica toca gota, paralela y directa, una por intento; el examen, cualquiera", () => {
  const m = muestra(0, { x: 0.5, y: 0, rumbo: 90 }, 0);
  const entradas = [0, 1, 2].map((intento) => {
    const e = armarEspera(m, 2, { intento, examen: false, estacion: VOR, espera: ESPERA });
    assert.equal(e.fase, "posicionando");
    return entradaEspera(n360(e.ejercicio.llegada + 180), 90, "derecha");
  });
  assert.deepEqual(entradas, ["gota", "paralela", "directa"]);
});

test("el instructor da el radial de salida al empezar y el de regreso a 8 millas", () => {
  const m = muestra(0, { x: 0.5, y: 0, rumbo: 90 }, 0);
  const e = armarEspera(m, 2, { intento: 0, examen: false, estacion: VOR, espera: { ...ESPERA, altitudFt: 9000 }, llegada: 90 });
  const r = String(e.ejercicio.salida).padStart(3, "0");
  assert.equal(ordenEspera(null, "posiciona", e, "es"), `Intercepta el radial ${r} alejándote y sube a 9,000 pies. A 8 millas te doy el regreso.`);
  assert.match(ordenEspera(null, "posiciona", e, "en")!, new RegExp(`^Intercept the ${r} radial outbound and climb to 9,000 feet\\.`));
  assert.match(ordenEspera("posiciona", "llega", e, "es")!, /^Regresa a la estación por el radial 090\./);
});

test("no avisa «Regresa al radial» mientras intercepta: solo después de establecerse", () => {
  // A 8.5 NM en el radial 060, el regreso es por el 090: 30° fuera mientras vira para interceptarlo.
  const a: Avion = { x: 8.5 * Math.sin(60 * RAD), y: 8.5 * Math.cos(60 * RAD), rumbo: 240 };
  const ms = [muestra(0, a, 0), ...volarTramos(a, [[5, 0]], 1)];
  const e = volar(ms);
  assert.equal(e.fase, "llegando");
  assert.equal(avisoEspera(e, ms[5], "practica", "es"), null);
  // Ya establecido en el 090 y luego 10° fuera: avisa.
  const b = volar(esperaDirecta().slice(0, 100));
  const fuera = muestra(100, { x: 6 * Math.cos(10 * RAD), y: 6 * Math.sin(10 * RAD), rumbo: 270 }, 0);
  assert.equal(avisoEspera(b, fuera, "practica", "es")?.clave, "llegada");
});
