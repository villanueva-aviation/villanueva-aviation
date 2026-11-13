import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { armarEspera, avanzarEspera, responderEntrada, type EvaluacionEspera } from "./evaluadorEspera.ts";
import type { DatosEspera } from "./navIfr.ts";
import { pasosArco, pasosHsi, pasosInterceptacion, pasosRuta } from "./pasosHsi.ts";
import type { VorElegido } from "./vorSim.ts";
import type { EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import type { EvaluacionRuta } from "./evaluadorRuta.ts";
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

test("lección 1, acercándose: DC30 con la cabeza de la flecha y los números del ejercicio", () => {
  const e = { fase: "interceptando", examen: false, ejercicio: { caso: "acercandose", radial: 270, desde: false, curso: 90 }, inicio: en(0, { navRadial: 240 }) } as unknown as EvaluacionInterceptacion;
  assert.deepEqual(textos(pasosInterceptacion(e, en(90, { navObs: 90 }), "es")), [
    "Mariposa en 090 (rumbo deseado).",
    "DC30: deseada 090, cabeza 060, me paso 30°: vira al 030.",
    "CRS en 090.",
    "CDI vivo: vira hacia la estación, al 090.",
  ]);
  assert.deepEqual(estados(pasosInterceptacion(e, en(90, { navObs: 90 }), "es")), ["actual", "pendiente", "hecho", "pendiente"]);
  assert.deepEqual(estados(pasosInterceptacion(e, en(30, { navObs: 90 }), "es")), ["hecho", "hecho", "hecho", "actual"]);
  assert.deepEqual(estados(pasosInterceptacion({ ...e, fase: "establecido" }, en(90, { navObs: 90, navDesv: 1 }), "es")), ["hecho", "hecho", "hecho", "hecho"]);
  assert.equal(pasosInterceptacion({ ...e, examen: true }, en(90), "es"), null);
});

test("lección 1, alejándose: CD45 con la cola de la flecha; en inglés sin acentos", () => {
  const e = { fase: "interceptando", examen: false, ejercicio: { caso: "alejandose", radial: 90, desde: true, curso: 90 }, inicio: en(0, { navRadial: 60 }) } as unknown as EvaluacionInterceptacion;
  const p = textos(pasosInterceptacion(e, en(90), "es"));
  assert.equal(p[0], "Mariposa en 090 (rumbo y radial coinciden).");
  assert.equal(p[1], "CD45: cola 060, deseada 090, me paso 45°: vira al 135.");
  assert.equal(p[3], "CDI vivo: vira al lado contrario de la estación, al 090.");
  for (const x of textos(pasosInterceptacion(e, en(90), "en"))) assert.doesNotMatch(x, /[áéíóúñ¿¡]/i);
});

test("lección 2, giro de 135°: la regla de los 45° de la guía, tachándose", () => {
  const e = { fase: "acercandose", examen: false, ejercicio: { entrada: 90, salida: 45, giro: 135 }, establecidoVuelta: null } as unknown as EvaluacionRuta;
  assert.deepEqual(textos(pasosRuta(e, en(270), "es")), [
    "CRS en 270 (TO): mantén la barra centrada hacia la estación.",
    "Sobre la estación: mariposa y CRS en 045; vira a la derecha al 045.",
    "Al través (cambia la flechita), mariposa en 090, del lado del CDI, y vira esos 45°.",
    "CDI vivo: vira al lado contrario de la estación, al 045.",
  ]);
  assert.deepEqual(estados(pasosRuta(e, en(270), "es")), ["actual", "pendiente", "pendiente", "pendiente"]);
  const fuera = { ...e, fase: "alejandose" } as EvaluacionRuta;
  assert.deepEqual(estados(pasosRuta(fuera, en(300), "es")), ["hecho", "actual", "pendiente", "pendiente"]);
  assert.deepEqual(estados(pasosRuta(fuera, en(45), "es")), ["hecho", "hecho", "actual", "pendiente"]);
  assert.deepEqual(estados(pasosRuta(fuera, en(90), "es")), ["hecho", "hecho", "hecho", "actual"]);
  assert.deepEqual(estados(pasosRuta({ ...fuera, establecidoVuelta: 5 }, en(45), "es")), ["hecho", "hecho", "hecho", "hecho"]);
});

test("lección 2, giro de 90° o menos: sobre la estación vira y centra; sin ejercicio todavía, nada", () => {
  const e = { fase: "acercandose", examen: false, ejercicio: { entrada: 90, salida: 180, giro: 90 }, establecidoVuelta: null } as unknown as EvaluacionRuta;
  assert.deepEqual(textos(pasosRuta(e, en(270), "es")).slice(1), ["Sobre la estación: mariposa y CRS en 180; vira a la izquierda al 180.", "CDI vivo: centra la barra en el 180."]);
  assert.equal(pasosRuta({ ...e, ejercicio: null, fase: "posicionando" }, en(270), "es"), null);
  for (const x of textos(pasosRuta(e, en(270), "en"))) assert.doesNotMatch(x, /[áéíóúñ¿¡]/i);
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
