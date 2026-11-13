import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarEspera, avanzarEspera, responderEntrada, type EvaluacionEspera } from "./evaluadorEspera.ts";
import type { DatosEspera } from "./navIfr.ts";
import { pasosArco, pasosHsi, pasosInterceptacion } from "./pasosHsi.ts";
import type { VorElegido } from "./vorSim.ts";
import type { EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import type { EvaluacionArco } from "./evaluadorArco.ts";

// El mismo simulador de espera.test.ts: VOR en 0,0, 100 kt, una muestra por segundo.
const VOR = { ident: "TST", region: "", lat: 0, lon: 0, mhz: 113.1, dme: true, decl: 0 } as VorElegido;
const RAD = Math.PI / 180;
const n360 = (g: number) => ((g % 360) + 360) % 360;
type Avion = { x: number; y: number; rumbo: number };
function volarTramos(a: Avion, tramos: [number, number][], t0: number): Muestra[] {
  const out: Muestra[] = [];
  let t = t0;
  for (const [seg, tasa] of tramos)
    for (let k = 0; k < seg; k++) {
      a.rumbo = n360(a.rumbo + tasa);
      a.x += (100 / 3600) * Math.sin(a.rumbo * RAD);
      a.y += (100 / 3600) * Math.cos(a.rumbo * RAD);
      out.push(muestra(t++, a, tasa === 0 ? 0 : 20 * Math.sign(tasa)));
    }
  return out;
}
const muestra = (t: number, a: Avion, inclinacion: number): Muestra => ({
  t, inclinacion, altitud: 5000, velocidad: 100, rumbo: a.rumbo, bola: 0, agl: 3000, peso: 2300, enTierra: false, slew: false, tasa: 1, pausa: false,
  titulo: "Cessna Skyhawk 172", navMhz: 113.1, navObs: 270, navRadial: n360(Math.atan2(a.x, a.y) / RAD), navDesv: 0, navDesde: 1,
  navDme: Math.hypot(a.x, a.y), navTieneDme: true, navSenal: true, gpsNav: false, lat: a.y / 60, lon: a.x / 60,
});
const ESPERA: DatosEspera = { acercamiento: 270, giros: "derecha", tramoSeg: 60, carta: false };

/** Entrada directa por el radial 090; devuelve la evaluación y la muestra tras `n` muestras. */
function directa(n: number, responder = true): [EvaluacionEspera, Muestra] {
  const a: Avion = { x: 10, y: 0, rumbo: 270 };
  const vuelta: [number, number][] = [[1, 0], [60, 3], [60, 0], [60, 3], [60, 0]];
  const ms = [muestra(-1, { x: 10.03, y: 0, rumbo: 270 }, 0), ...volarTramos(a, [[360, 0], ...vuelta, ...vuelta, [40, 0]], 0)].slice(0, n);
  let e = armarEspera(ms[0], 2, { intento: 2, examen: false, estacion: VOR, espera: ESPERA, llegada: 90 });
  for (const m of ms.slice(1)) {
    e = avanzarEspera(e, m);
    if (e.preguntar && responder) e = responderEntrada(e, "directa", m.rumbo);
  }
  return [e, ms[ms.length - 1]];
}
const estados = (p: ReturnType<typeof pasosHsi>) => p!.map((x) => x.estado);

test("pasos HSI: no salen antes de decir la entrada ni en el examen", () => {
  assert.equal(pasosHsi(...directa(272, false), "es"), null);
  const [e, m] = directa(272);
  assert.equal(pasosHsi({ ...e, examen: true }, m, "es"), null);
});

test("pasos HSI de la directa con los números del ejercicio; el CRS ya puesto se tacha", () => {
  const p = pasosHsi(...directa(272), "es")!;
  assert.deepEqual(p.map((x) => x.texto), [
    "CRS en 270 (inbound) y mariposa en 090 (outbound).",
    "Sobre la estación, vira a la derecha al 090.",
    "Al través (cambia la flechita), cronómetro 1 minuto. Si no se distingue, al terminar el viraje.",
    "Pasado el minuto, vira hacia el lado del CDI hasta el 270.",
    "Sobre la estación, vira de nuevo al 090.",
  ]);
  assert.deepEqual(estados(p), ["hecho", "actual", "pendiente", "pendiente", "pendiente"]);
  for (const x of pasosHsi(...directa(272), "en")!) assert.doesNotMatch(x.texto, /[áéíóúñ¿¡]/i);
});

test("pasos HSI: se tachan conforme vuela la entrada", () => {
  // Nivelado en el alejamiento (cruce ≈ 360, viraje de 60 s): vira al 090 hecho, cronómetro en curso.
  assert.deepEqual(estados(pasosHsi(...directa(442), "es")), ["hecho", "hecho", "actual", "pendiente", "pendiente"]);
  // Virando de regreso: el minuto ya pasó.
  assert.deepEqual(estados(pasosHsi(...directa(492), "es")), ["hecho", "hecho", "hecho", "actual", "pendiente"]);
  // De nuevo sobre la estación: todo hecho.
  assert.deepEqual(estados(pasosHsi(...directa(632), "es")), ["hecho", "hecho", "hecho", "hecho", "hecho"]);
});

test("pasos HSI de la gota: la mariposa 30° hacia el lado de la espera", () => {
  const m = muestra(0, { x: 0.5, y: 0, rumbo: 90 }, 0);
  const e = { ...armarEspera(m, 2, { intento: 0, examen: false, estacion: VOR, espera: ESPERA }), dicha: "gota" as const };
  const p = pasosHsi(e, m, "es")!;
  assert.equal(p[1].texto, "Mariposa en 060 (outbound 090 −30°).");
  assert.equal(p.length, 7);
});

// Lecciones 1 a 3: estados armados a mano (solo importa la fase, el ejercicio y la muestra).
const en = (rumbo: number, extra: Partial<Muestra> = {}): Muestra => ({ ...muestra(0, { x: 5, y: 0, rumbo }, 0), navObs: 0, navDesv: 30, ...extra });
const textos = (p: { texto: string }[] | null) => p!.map((x) => x.texto);

/** Un tramo armado a mano: ya contestado «normal» salvo que se diga otra cosa. */
const tramo = (ejercicio: object, extra: object = {}) =>
  ({ fase: "interceptando", examen: false, dicho: "normal", atraves: false, medirDesde: 0, signo: 1, ejercicio, inicio: en(0), ...extra }) as unknown as EvaluacionInterceptacion;

test("lección 1, acercándose: DC30 con la cabeza de la flecha (la referencia del tramo) y los números del ejercicio", () => {
  const e = tramo({ tipo: "normal", radial: 270, desde: false, curso: 90, referencia: 240 });
  assert.deepEqual(textos(pasosInterceptacion(e, en(90, { navObs: 90 }), "es")), [
    "Mariposa en 090 (rumbo deseado).",
    "DC30: deseada 090, cabeza 060, me paso 30°: vira al 030.",
    "CRS en 090.",
    "CDI vivo: vira hacia la estación, al 090.",
  ]);
  assert.deepEqual(estados(pasosInterceptacion(e, en(90, { navObs: 90 }), "es")), ["actual", "pendiente", "hecho", "pendiente"]);
  assert.deepEqual(estados(pasosInterceptacion(e, en(30, { navObs: 90 }), "es")), ["hecho", "hecho", "hecho", "actual"]);
  assert.deepEqual(estados(pasosInterceptacion({ ...e, fase: "establecido" }, en(90, { navObs: 90, navDesv: 1 }), "es")), ["hecho", "hecho", "hecho", "hecho"]);
});

test("la guía sale hasta que contesta normal o ruta pasada; nunca en el examen ni esperando el tramo", () => {
  const e = tramo({ tipo: "normal", radial: 270, desde: false, curso: 90, referencia: 240 });
  assert.equal(pasosInterceptacion({ ...e, dicho: undefined }, en(90), "es"), null);
  assert.equal(pasosInterceptacion({ ...e, examen: true }, en(90), "es"), null);
  assert.equal(pasosInterceptacion({ ...e, fase: "esperando", ejercicio: null }, en(90), "es"), null);
  assert.notEqual(pasosInterceptacion({ ...e, dicho: null }, en(90), "es"), null, "contestó algo que no se entendió: ya se le corrigió");
});

test("contestó «ruta pasada» en una normal: ve la tarjeta correcta, la normal", () => {
  const e = tramo({ tipo: "normal", radial: 90, desde: true, curso: 90, referencia: 60 }, { dicho: "pasada" });
  assert.equal(textos(pasosInterceptacion(e, en(90), "es"))[1], "CD45: cola 060, deseada 090, me paso 45°: vira al 135.");
});

test("lección 1, alejándose: CD45 con la cola de la flecha; en inglés sin acentos", () => {
  const e = tramo({ tipo: "normal", radial: 90, desde: true, curso: 90, referencia: 60 });
  const p = textos(pasosInterceptacion(e, en(90), "es"));
  assert.equal(p[0], "Mariposa en 090 (rumbo y radial coinciden).");
  assert.equal(p[1], "CD45: cola 060, deseada 090, me paso 45°: vira al 135.");
  assert.equal(p[3], "CDI vivo: vira al lado contrario de la estación, al 090.");
  for (const x of textos(pasosInterceptacion(e, en(90), "en"))) assert.doesNotMatch(x, /[áéíóúñ¿¡]/i);
});

// Ruta pasada por el radial 150 saliendo del R-290 (el ejemplo de Erik): al través en el R-240.
const PASADA_AL = { tipo: "pasada", radial: 150, desde: true, curso: 150, referencia: 290 };
const PASADA_AC = { tipo: "pasada", radial: 150, desde: false, curso: 330, referencia: 290 };

test("ruta pasada de alejamiento: la tarjeta de la guía con la mariposa a 45° del lado de la estación", () => {
  const e = tramo(PASADA_AL, { fase: "reposicionando", dicho: "pasada", medirDesde: null });
  const antes = en(150, { navRadial: 290, navObs: 150 });
  assert.deepEqual(textos(pasosInterceptacion(e, antes, "es")), [
    "Mariposa y CRS al 150 (radial y rumbo coinciden).",
    "Vira al 150.",
    "Al través (cambia la flechita), mariposa a 45° del lado de la estación: 105.",
    "Vira al 105.",
    "CDI vivo: vira al lado contrario de la estación, al 150.",
  ]);
  assert.deepEqual(estados(pasosInterceptacion(e, antes, "es")), ["hecho", "hecho", "actual", "pendiente", "pendiente"]);
  // Al través en el R-240: desde ahí el lado es el del evaluador.
  const atraves = { ...e, fase: "interceptando", atraves: true, medirDesde: 0, signo: 1 } as EvaluacionInterceptacion;
  assert.deepEqual(estados(pasosInterceptacion(atraves, en(150, { navRadial: 240 }), "es")), ["hecho", "hecho", "hecho", "actual", "pendiente"]);
  assert.match(textos(pasosInterceptacion(atraves, en(150, { navRadial: 240 }), "es"))[2], /: 105\.$/);
  assert.deepEqual(estados(pasosInterceptacion(atraves, en(105, { navRadial: 200 }), "es")), ["hecho", "hecho", "hecho", "hecho", "actual"]);
  assert.deepEqual(estados(pasosInterceptacion({ ...atraves, fase: "establecido" }, en(150), "es")), ["hecho", "hecho", "hecho", "hecho", "hecho"]);
  // Del otro lado de la línea del radial, los 45° van al otro lado.
  assert.match(textos(pasosInterceptacion(e, en(150, { navRadial: 10 }), "es"))[2], /: 195\.$/);
});

test("ruta pasada de acercamiento: la regla de 1 minuto, con el viraje de 90° hacia el lado del CDI", () => {
  const e = tramo(PASADA_AC, { fase: "reposicionando", dicho: "pasada", medirDesde: null });
  const antes = en(150, { navRadial: 290, navObs: 330 });
  assert.deepEqual(textos(pasosInterceptacion(e, antes, "es")), [
    "Mariposa al 150 (radial solicitado).",
    "CRS al 330 (rumbo contrario).",
    "Vira al 150.",
    "Al través (cambia la flechita), cronómetro 1 minuto.",
    "Pasado el minuto, vira 90° hacia el lado del CDI: 060.",
    "CDI vivo: vira hacia la estación, al 330.",
  ]);
  assert.deepEqual(estados(pasosInterceptacion(e, antes, "es")), ["hecho", "hecho", "hecho", "actual", "pendiente", "pendiente"]);
  const minuto = { ...e, atraves: true, medirDesde: 60 } as EvaluacionInterceptacion;
  assert.deepEqual(estados(pasosInterceptacion(minuto, en(150, { navRadial: 240 }), "es")), ["hecho", "hecho", "hecho", "hecho", "actual", "pendiente"]);
  // Pasado el minuto el lado es el del evaluador (acercándose, el signo va al revés del radial).
  const midiendo = { ...minuto, fase: "interceptando", signo: -1 } as EvaluacionInterceptacion;
  assert.match(textos(pasosInterceptacion(midiendo, en(60, { navRadial: 230 }), "es"))[4], /: 060\.$/);
  assert.deepEqual(estados(pasosInterceptacion(midiendo, en(60, { navRadial: 230 }), "es")), ["hecho", "hecho", "hecho", "hecho", "hecho", "actual"]);
  for (const x of [...textos(pasosInterceptacion(e, antes, "en")), ...textos(pasosInterceptacion(tramo(PASADA_AL, { dicho: "pasada" }), antes, "en"))])
    assert.doesNotMatch(x, /[áéíóúñ¿¡]/i);
});

test("lección 3: media milla antes del arco y del radial, con el lado y los rumbos del ejercicio", () => {
  const e = { fase: "hacia-arco", examen: false, ejercicio: { radioNm: 10, desde: 30, hasta: 90, sentido: 1, alejandose: true } } as unknown as EvaluacionArco;
  assert.deepEqual(textos(pasosArco(e, en(30), "es")), [
    "A 9.5 DME (media milla antes del arco), vira 90° a la derecha: rumbo 120.",
    "En el arco mantén 10 millas: si crecen, vira 10° hacia la estación; si bajan, abre 10°.",
    "CRS en 270 (curso de acercamiento).",
    "Media milla antes del radial 090, vira 90° a la derecha, hacia donde apunta la cabeza de la flecha VOR.",
    "CDI vivo: vira hacia la estación, al 270.",
  ]);
  assert.deepEqual(estados(pasosArco(e, en(30), "es")), ["actual", "pendiente", "pendiente", "pendiente", "pendiente"]);
  assert.deepEqual(estados(pasosArco({ ...e, fase: "en-arco" } as EvaluacionArco, en(150, { navObs: 270 }), "es")), ["hecho", "actual", "hecho", "pendiente", "pendiente"]);
  assert.deepEqual(estados(pasosArco({ ...e, fase: "saliendo" } as EvaluacionArco, en(250, { navObs: 270 }), "es")), ["hecho", "hecho", "hecho", "hecho", "actual"]);
  assert.deepEqual(estados(pasosArco({ ...e, fase: "terminado" } as EvaluacionArco, en(270, { navObs: 270 }), "es")), ["hecho", "hecho", "hecho", "hecho", "hecho"]);
  // Acercándose al arco: media milla antes es más lejos, 10.5.
  assert.match(textos(pasosArco({ ...e, ejercicio: { ...e.ejercicio, alejandose: false } }, en(210), "es"))[0], /^A 10\.5 DME/);
  for (const x of textos(pasosArco(e, en(30), "en"))) assert.doesNotMatch(x, /[áéíóúñ¿¡]/i);
});
