import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { AEROPUERTO_PRUEBA as A, type Aeropuerto } from "./aeropuertoSim.ts";
import { aNm } from "../home/navGeo.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import type { ResultadoComun } from "./maniobras.ts";
import { simularVuelo } from "./simularVuelo.ts";
import {
  alMuestrearRepaso, alResultado, armaManiobra, crearRepaso, enZona, fueraDeZona, maniobraActual, maniobrasDe, nombreManiobra, pisoZona, siguienteManiobra, sortear, zonaRepaso,
  type EstadoRepaso, type Zona,
} from "./repaso.ts";
import { LECCIONES, REPASO, leccionIfrDe } from "./lecciones.ts";
import { avionDe, conSenal, instruirEnRampa, ponerVor } from "./repaso.ts";
import { elegirVor } from "./vorSim.ts";

test("una lección de maniobra la vuela 5 veces; el repaso sortea 4", () => {
  assert.deepEqual(maniobrasDe(LECCIONES[6]), Array(5).fill("vuelo-lento"));
  assert.deepEqual(maniobrasDe(LECCIONES[1]), Array(5).fill("recto-nivelado"));
  const s = maniobrasDe(LECCIONES[REPASO - 1]);
  assert.equal(s.length, 4);
  assert.equal(new Set(s).size, 4, "4 distintas de las disponibles");
  assert.deepEqual(maniobrasDe(LECCIONES[13]), Array(5).fill("toques-despegues"));
  for (let k = 0; k < 50; k++) assert.ok(!maniobrasDe(LECCIONES[REPASO - 1]).includes("toques-despegues"), "los circuitos no se sortean en la zona");
  for (let k = 0; k < 50; k++) assert.ok(!maniobrasDe(LECCIONES[REPASO - 1]).includes("familiarizacion"), "el primer vuelo no se repasa");
  assert.deepEqual(maniobrasDe(LECCIONES[0]), Array(5).fill("familiarizacion"));
  for (let k = 0; k < 50; k++) assert.ok(!maniobrasDe(LECCIONES[REPASO - 1]).includes("interceptar-radial"), "el repaso VFR no sortea maniobras IFR");
});

const BASE = simularVuelo()[0];
const dist = (lat: number, lon: number) => Math.hypot(aNm(lat, lon, A.lat, A.lon).x, aNm(lat, lon, A.lat, A.lon).y);
/** Una muestra en el aire a `nm` del centro de la zona hacia el norte, a `agl` sobre el terreno. */
const enAire = (z: Zona, nm: number, agl: number): Muestra => ({ ...BASE, lat: z.lat + nm / 60, lon: z.lon, agl, enTierra: false });

test("sorteo: 4, todas las disponibles al menos una vez, nunca dos seguidas iguales", () => {
  for (let k = 0; k < 200; k++) {
    const s = sortear(["viraje-escarpado", "recto-nivelado", "vuelo-lento"]);
    assert.equal(s.length, 4);
    assert.equal(new Set(s).size, 3);
    for (let i = 1; i < 4; i++) assert.notEqual(s[i], s[i - 1]);
  }
  assert.deepEqual(sortear(["recto-nivelado"], 2, () => 0), ["recto-nivelado", "recto-nivelado"]);
});

test("zona en MMGL: Cajititlán o Chapala", () => {
  const caji = zonaRepaso(A, () => 0)!;
  assert.equal(caji.nombre.es, "Cajititlán");
  assert.ok(Math.abs(dist(caji.lat, caji.lon) - 5) < 0.1);
  assert.ok(caji.lat < A.lat, "al sur");
  assert.equal(zonaRepaso(A, () => 0.99)!.nombre.es, "el lago de Chapala");
});

test("Chapala: todo el lago es la zona (Erik, 2026-11-09)", () => {
  const z = zonaRepaso(A, () => 0.99)!;
  const sobre = (lat: number, lon: number): Muestra => ({ ...BASE, lat, lon, agl: 1800, enTierra: false });
  assert.equal(enZona(sobre(20.2334, -103.1595), z), true, "la zona de antes, al sur del aeródromo");
  assert.equal(enZona(sobre(20.2, -102.8), z), true, "el extremo este del lago");
  assert.equal(enZona(sobre(20.25, -103.38), z), true, "el extremo oeste, frente a Jocotepec");
  assert.equal(enZona(sobre(20.31, -103.26), z), false, "Ajijic, en tierra");
  assert.equal(enZona(sobre(20.44, -103.31), z), false, "Cajititlán");
  // Orilla norte en 20.3335 N 103.0788 W: medio NM de margen para salir.
  assert.equal(fueraDeZona(sobre(20.3335 + 0.3 / 60, -103.0788), z), false);
  assert.equal(fueraDeZona(sobre(20.3335 + 1 / 60, -103.0788), z), true);
  assert.equal(fueraDeZona(sobre(20.2, -102.8), z), false);
});

test("otro aeropuerto: 10 NM al través de la pista más larga; sin aeropuerto, null", () => {
  const z = zonaRepaso({ ...A, icao: "MMXX" }, () => 0)!;
  assert.ok(Math.abs(dist(z.lat, z.lon) - 10) < 0.1);
  assert.equal(z.radioNm, 3);
  // la pista más larga va a 112°: la zona queda a 202°
  assert.equal(z.nombre.es, "la zona a 10 millas al rumbo 200");
  assert.equal(z.nombre.en, "the area 10 miles out on heading 200");
  assert.equal(zonaRepaso(null), null);
});

test("en la zona: dentro del radio y a 1,500 ft AGL o más", () => {
  const z = zonaRepaso(A, () => 0)!;
  assert.equal(enZona(enAire(z, 1, 1600), z), true);
  assert.equal(enZona(enAire(z, 1, 1200), z), false);
  assert.equal(enZona(enAire(z, 4, 2000), z), false);
  assert.equal(enZona({ ...BASE, lat: undefined, lon: undefined, agl: 2000 }, z), false);
});

// ── La lección como máquina de estados ──

const SORTEO = ["recto-nivelado", "viraje-escarpado", "vuelo-lento", "recto-nivelado"] as const;
const res = (aprobado: boolean): ResultadoComun => ({ aprobado, calificacion: aprobado ? 90 : 50, elementos: {}, avisos: [], muestras: [] });

/** Corre las muestras; `alEntrar(e)` se llama una vez cuando la etapa pasa a «maniobra» por primera vez. */
function correr(
  e0: EstadoRepaso,
  ms: Muestra[],
  op: { aero?: (i: number) => Aeropuerto | null; idioma?: Idioma; alEntrar?: (e: EstadoRepaso, decir: string[]) => EstadoRepaso; enCurso?: boolean } = {},
) {
  let e = e0;
  const decir: string[] = [];
  const etapas: string[] = [e.etapa];
  let entro = false;
  ms.forEach((m, i) => {
    const r = alMuestrearRepaso(e, m, (op.aero ?? (() => A))(i), op.idioma ?? "es", () => 0, op.enCurso ?? false);
    e = r.estado;
    decir.push(...r.decir);
    if (e.etapa !== etapas[etapas.length - 1]) etapas.push(e.etapa);
    if (e.etapa === "maniobra" && !entro && op.alEntrar) {
      entro = true;
      e = op.alEntrar(e, decir);
    }
  });
  return { e, decir, etapas };
}
const conDecir = (decir: string[]) => (x: { estado: EstadoRepaso; decir: string[] }) => {
  decir.push(...x.decir);
  return x.estado;
};

test("vuelo de principio a fin en práctica", () => {
  const { e, decir, etapas } = correr(crearRepaso("practica", [...SORTEO]), simularVuelo(), {
    alEntrar: (e, d) => {
      assert.equal(armaManiobra(e), true);
      assert.equal(maniobraActual(e), "recto-nivelado");
      for (let i = 0; i < 4; i++) e = conDecir(d)(alResultado(e, res(true), `id${i}`, "es"));
      return e;
    },
  });
  assert.deepEqual(etapas, ["rampa", "salida", "maniobra", "regreso", "terminado"]);
  assert.equal(e.hechas.length, 4);
  assert.deepEqual(e.hechas.map((h) => h.intentoId), ["id0", "id1", "id2", "id3"]);
  assert.equal(e.zona?.nombre.es, "Cajititlán");
  assert.equal(e.tomas.tocoEnPista, true);
  assert.ok(e.tomas.rotacionKt !== null);
  assert.ok(decir.some((d) => d.startsWith("Ve a la zona de trabajo: Cajititlán")), decir.join(" | "));
  assert.ok(decir.includes("Estás en la zona. Primera maniobra: Recto y nivelado."), decir.join(" | "));
  assert.ok(decir.includes("Recto y nivelado. Siguiente maniobra: Viraje escarpado."), decir.join(" | "));
  assert.ok(decir.includes("Recto y nivelado. Siguiente maniobra: Recto y nivelado, con otro rumbo."), decir.join(" | "));
  assert.ok(decir.includes("Terminamos las maniobras. Regresa al aeropuerto y aterriza."));
  assert.equal(maniobraActual(e), null);
});

test("checkride: un intento por maniobra aunque no se apruebe", () => {
  const { e } = correr(crearRepaso("checkride", [...SORTEO]), simularVuelo(), {
    alEntrar: (e) => {
      e = alResultado(e, res(false), "a", "es").estado;
      assert.equal(e.actual, 1);
      for (let i = 0; i < 3; i++) e = alResultado(e, res(true), null, "es").estado;
      return e;
    },
  });
  assert.equal(e.etapa, "terminado");
  assert.equal(e.hechas[0].resultado?.aprobado, false);
});

test("práctica: no aprobada se queda hasta repetir o pasar", () => {
  correr(crearRepaso("practica", [...SORTEO]), simularVuelo(), {
    alEntrar: (e) => {
      const r = alResultado(e, res(false), "a", "es");
      assert.equal(r.estado.actual, 0);
      assert.deepEqual(r.decir, ["Puedes repetirla o pasar a la siguiente."]);
      assert.equal(r.estado.hechas[0].resultado?.aprobado, false);
      const otra = alResultado(r.estado, res(true), "b", "es").estado; // la repitió y salió
      assert.equal(otra.actual, 1);
      assert.equal(otra.hechas[0].intentoId, "b");
      const paso = siguienteManiobra(r.estado, "es");
      assert.equal(paso.estado.actual, 1);
      assert.deepEqual(paso.decir, ["Recto y nivelado. Siguiente maniobra: Viraje escarpado."]);
      return e;
    },
  });
  const ck = { ...crearRepaso("checkride", [...SORTEO]), etapa: "maniobra" as const };
  assert.equal(siguienteManiobra(ck, "es").estado.actual, 0, "en checkride no se pasa");
});

test("aterriza con 2 maniobras: regreso y las otras sin resultado", () => {
  const { e, etapas } = correr(crearRepaso("checkride", [...SORTEO]), simularVuelo(), {
    alEntrar: (e) => alResultado(alResultado(e, res(true), "a", "es").estado, res(true), "b", "es").estado,
  });
  assert.deepEqual(etapas.slice(-2), ["regreso", "terminado"]);
  assert.deepEqual(e.hechas.map((h) => h.resultado?.aprobado ?? null), [true, true, null, null]);
});

test("salto de más de 2 NM anula", () => {
  const ms = simularVuelo();
  const i = ms.findIndex((m) => m.agl > 1000);
  const saltado = ms.map((m, k) => (k >= i && m.lat !== undefined ? { ...m, lat: m.lat + 0.05 } : m));
  const { e } = correr(crearRepaso("practica", [...SORTEO]), saltado);
  assert.equal(e.etapa, "invalido");
  assert.equal(e.motivo, "El avión se movió de golpe: la lección no se califica.");
  // una vez anulada, ya no cambia
  assert.equal(alMuestrearRepaso(e, ms[ms.length - 1], A, "es").estado, e);
});

test("fuera de zona: no arma y avisa una vez; dentro de una maniobra en curso no avisa", () => {
  const { decir, etapas } = correr(crearRepaso("practica", [...SORTEO]), simularVuelo());
  assert.ok(etapas.includes("fuera-de-zona"), etapas.join(","));
  assert.equal(decir.filter((d) => d === "Regresa a la zona de trabajo.").length, 1);
  const enCurso = correr(crearRepaso("practica", [...SORTEO]), simularVuelo(), { enCurso: true });
  assert.ok(!enCurso.etapas.includes("fuera-de-zona"));
});

test("sin aeropuerto espera en rampa, y llega después", () => {
  const ms = simularVuelo();
  const { e } = correr(crearRepaso("practica", [...SORTEO]), ms.slice(0, 50), { aero: () => null });
  assert.equal(e.etapa, "rampa");
  assert.equal(e.motivo, "Esperando el aeropuerto del simulador.");
  const luego = correr(e, ms.slice(50, 100));
  assert.equal(luego.e.motivo, undefined);
  assert.equal(luego.e.zona?.nombre.es, "Cajititlán");
});

test("sin aeropuerto ni al despegar: zona al través del despegue, sin atorarse", () => {
  const { etapas, e } = correr(crearRepaso("practica", [...SORTEO]), simularVuelo(), { aero: () => null });
  assert.ok(etapas.includes("salida"), etapas.join(","));
  assert.ok(e.zona !== null);
});

test("no es C172: anulada desde la rampa", () => {
  const ms = simularVuelo().map((m) => ({ ...m, titulo: "Piper Cherokee" }));
  assert.equal(correr(crearRepaso("practica", [...SORTEO]), ms.slice(0, 2)).e.etapa, "invalido");
  const en = correr(crearRepaso("practica", [...SORTEO]), ms.slice(0, 2), { idioma: "en" });
  assert.match(en.e.motivo ?? "", /C172/);
  assert.doesNotMatch(en.e.motivo ?? "", /[áéíóúñ¿¡]/);
});

/** La lección hasta que entra a la zona, y la muestra con la que entró. */
function enLaZona() {
  const ms = simularVuelo();
  let e = crearRepaso("practica", [...SORTEO]);
  for (const m of ms) {
    e = alMuestrearRepaso(e, m, A, "es", () => 0).estado;
    if (e.etapa === "maniobra") return { e, m };
  }
  throw new Error("no entró a la zona");
}

test("zona con margen: a 1,450 ft AGL sigue en la zona; a 1,350 sale", () => {
  const { e, m } = enLaZona();
  const a1450 = alMuestrearRepaso(e, { ...m, t: m.t + 0.1, agl: 1450 }, A, "es").estado;
  assert.equal(a1450.etapa, "maniobra");
  const a1350 = alMuestrearRepaso(a1450, { ...m, t: m.t + 0.2, agl: 1350 }, A, "es");
  assert.equal(a1350.estado.etapa, "fuera-de-zona");
  assert.deepEqual(a1350.decir, ["Regresa a la zona de trabajo."]);
  // al volver a la zona, el instructor repite la maniobra que toca
  const vuelta = alMuestrearRepaso(a1350.estado, { ...m, t: m.t + 0.3, agl: 1600 }, A, "es");
  assert.equal(vuelta.estado.etapa, "maniobra");
  assert.deepEqual(vuelta.decir, [`De vuelta en la zona. Maniobra: ${nombreManiobra(e.sorteo[e.actual], "es")}.`]);
  const en = alMuestrearRepaso(a1350.estado, { ...m, t: m.t + 0.3, agl: 1600 }, A, "en");
  assert.deepEqual(en.decir, [`Back in the area. Maneuver: ${nombreManiobra(e.sorteo[e.actual], "en")}.`]);
});

test("se pierde la conexión en vuelo más de 10 s: anula; en tierra no", () => {
  const ms = simularVuelo();
  const i = ms.findIndex((m) => m.agl > 1000);
  const conHueco = ms.filter((m) => m.t < ms[i].t || m.t > ms[i].t + 15);
  const { e } = correr(crearRepaso("practica", [...SORTEO]), conHueco);
  assert.equal(e.etapa, "invalido");
  assert.equal(e.motivo, "Se perdió la conexión con el simulador en vuelo: la lección no se califica.");
  const en = correr(crearRepaso("practica", [...SORTEO]), conHueco, { idioma: "en" });
  assert.equal(en.e.motivo, "The connection to the simulator dropped in flight: this lesson won't be graded.");
  const enRampa = ms.filter((m) => m.t < 5 || m.t > 20);
  assert.notEqual(correr(crearRepaso("practica", [...SORTEO]), enRampa).e.etapa, "invalido");
});

test("sin aeropuerto no se sabe si tocó en la pista", () => {
  const { e } = correr(crearRepaso("practica", [...SORTEO]), simularVuelo(), { aero: () => null });
  assert.equal(e.tomas.tocoEnPista, null);
});

test("textos en inglés sin acentos", () => {
  const { decir, e } = correr(crearRepaso("practica", [...SORTEO]), simularVuelo(), {
    idioma: "en",
    alEntrar: (e, d) => {
      e = conDecir(d)(alResultado(e, res(false), "a", "en"));
      e = conDecir(d)(siguienteManiobra(e, "en"));
      for (let i = 0; i < 3; i++) e = conDecir(d)(alResultado(e, res(true), null, "en"));
      return e;
    },
  });
  assert.equal(e.etapa, "terminado");
  assert.ok(decir.length >= 6, decir.join(" | "));
  for (const d of decir) assert.doesNotMatch(d, /[áéíóúñ¿¡]/, d);
  const espera = correr(crearRepaso("practica", [...SORTEO]), simularVuelo().slice(0, 5), { aero: () => null, idioma: "en" });
  assert.equal(espera.e.motivo, "Waiting for the simulator's airport.");
});

test("toques y despegues: arma en la carrera, cada toque es un circuito y no va a regreso hasta el último", () => {
  const CIRC = Array(5).fill("toques-despegues");
  let cuenta = 0;
  const { e, decir, etapas } = correr(crearRepaso("practica", CIRC), simularVuelo({ tocarYDespegar: true }), {
    alEntrar: (e, d) => {
      assert.equal(e.vuelo?.fase, "carrera-despegue");
      assert.equal(armaManiobra(e), true);
      cuenta++;
      // Uno reprobado también avanza: cada circuito es su intento.
      const r = alResultado(e, res(false), "a", "es");
      assert.equal(r.estado.actual, 1);
      assert.deepEqual(r.decir, ["Circuito 2 de 5: potencia completa y despega."]);
      let x = r.estado;
      for (let i = 0; i < 3; i++) x = conDecir(d)(alResultado(x, res(true), null, "es"));
      return x;
    },
  });
  assert.equal(cuenta, 1);
  assert.deepEqual(etapas, ["rampa", "maniobra", "regreso", "terminado"]);
  assert.ok(decir.includes("Circuito 1 de 5."), decir.join(" | "));
  assert.ok(decir.includes("Circuito 5 de 5: potencia completa y despega; este termina con aterrizaje completo."), decir.join(" | "));
  assert.ok(!decir.some((x) => x.startsWith("Ve a la zona")), decir.join(" | "));
  assert.ok(!decir.includes("Regresa a la zona de trabajo."), "bajo 1,500 ft no hay zona");
  assert.equal(e.hechas[4].resultado, null);
});

test("toques y despegues: después del último circuito, a la plataforma", () => {
  const e = { ...crearRepaso("checkride", Array(5).fill("toques-despegues")), etapa: "maniobra" as const, actual: 4 };
  const r = alResultado(e, res(true), "z", "es");
  assert.equal(r.estado.etapa, "regreso");
  assert.deepEqual(r.decir, ["Terminamos los circuitos. Sal de la pista y rueda a la plataforma."]);
  assert.deepEqual(alResultado(e, res(true), "z", "en").decir, ["We're done with the patterns. Exit the runway and taxi to the ramp."]);
});

test("toques y despegues: el toque a mitad de la lección no la manda a regreso; detenerse en la pista sí", () => {
  let e = crearRepaso("practica", Array(5).fill("toques-despegues"));
  let enToque: string | null = null;
  for (const m of simularVuelo({ tocarYDespegar: true })) {
    const antes = e.vuelo?.eventos.length ?? 0;
    e = alMuestrearRepaso(e, m, A, "es", () => 0).estado;
    if (e.vuelo?.eventos.slice(antes).some((x) => x.tipo === "toque-y-despegue")) enToque = e.etapa;
  }
  assert.equal(enToque, "maniobra");
  assert.equal(e.etapa, "terminado");
});

test("«S»: la zona va de 600 ft AGL hacia arriba y la salida lo dice", () => {
  const z = zonaRepaso(A, () => 0)!;
  assert.equal(enZona(enAire(z, 1, 800), z), false);
  assert.equal(enZona(enAire(z, 1, 800), z, 600), true);
  assert.equal(fueraDeZona(enAire(z, 1, 550), z, 600), false, "margen de 100 ft");
  assert.equal(fueraDeZona(enAire(z, 1, 450), z, 600), true);
  const { e, m } = enLaZona();
  const s = { ...e, sorteo: Array(5).fill("s-camino") };
  assert.equal(alMuestrearRepaso(s, { ...m, t: m.t + 0.1, agl: 800 }, A, "es").estado.etapa, "maniobra");
  let x = crearRepaso("practica", Array(5).fill("s-camino"));
  const decir: string[] = [];
  for (const mm of simularVuelo()) {
    const p = alMuestrearRepaso(x, mm, A, "es", () => 0);
    x = p.estado;
    decir.push(...p.decir);
    if (x.etapa === "salida") break;
  }
  assert.ok(decir.includes("Ve a la zona de trabajo: Cajititlán, entre 600 y 1,000 pies sobre el terreno."), decir.join(" | "));
  assert.equal(pisoZona("ocho-pilones"), 600, "la «8» sobre pilones va a la altura pivote, unos 700–900 ft");
  assert.equal(pisoZona("ocho-alrededor"), 600);
  assert.equal(pisoZona("recto-nivelado"), 1500);
});

// ── IFR: la misma lección de rampa a rampa, con el VOR en lugar de la zona ──

const VOR = elegirVor({ ident: "GDL", region: "MM", lat: A.lat, lon: A.lon, mhz: 117.5, dme: true }, BASE);
const IFR = Array(5).fill("interceptar-radial");
/** El vuelo simulado con NAV1 en `mhz`; `sinSenal(i, m)` apaga la señal en esas muestras. */
const vueloIfr = (mhz = 117.5, sinSenal: (i: number, m: Muestra) => boolean = () => false) =>
  simularVuelo().map((m, i) => ({ ...m, navMhz: mhz, navObs: 0, navRadial: 0, navDesv: 0, navDesde: 2 as const, navDme: 3, navTieneDme: true, navSenal: !sinSenal(i, m), gpsNav: false }));

test("IFR: despega → salida, arriba de 1,000 ft con señal → maniobra; 6 s sin señal → fuera; vuelve la señal → maniobra", () => {
  const ms = vueloIfr();
  const i0 = ms.findIndex((m) => !m.enTierra && m.agl >= 1200);
  const { e, decir, etapas } = correr(ponerVor(crearRepaso("practica", IFR, 2, "ifr"), VOR), vueloIfr(117.5, (i) => i >= i0 + 100 && i < i0 + 160));
  assert.deepEqual(etapas.slice(0, 5), ["rampa", "salida", "maniobra", "fuera-de-zona", "maniobra"]);
  assert.equal(e.zona, null, "en IFR no hay zona");
  assert.ok(decir.includes("Sintoniza 117.50 en NAV1, GDL. Arriba de 1,000 pies sobre el terreno empezamos."), decir.join(" | "));
  assert.ok(decir.includes("Tenemos señal de GDL. Primer ejercicio."), decir.join(" | "));
  assert.ok(decir.includes("Perdí la señal de GDL: revisa NAV1 o acércate al VOR."), decir.join(" | "));
});

test("IFR: con otra frecuencia en NAV1 no empieza (Review Focus 1)", () => {
  const { etapas } = correr(ponerVor(crearRepaso("practica", IFR, 2, "ifr"), VOR), vueloIfr(113.1));
  assert.ok(!etapas.includes("maniobra"), etapas.join(" → "));
  assert.equal(conSenal({ ...vueloIfr()[0], gpsNav: true }, VOR), false, "el GPS manejando la barra no cuenta");
});

test("IFR: en el cono de silencio (a menos de 2 NM del VOR) cuenta como con señal; más lejos, no", () => {
  const m = { ...vueloIfr()[0], navSenal: false };
  assert.equal(conSenal({ ...m, lat: VOR.lat + 1 / 60, lon: VOR.lon }, VOR), true);
  assert.equal(conSenal({ ...m, lat: VOR.lat + 3 / 60, lon: VOR.lon }, VOR), false);
  assert.equal(conSenal({ ...m, navMhz: 113.1, lat: VOR.lat + 1 / 60, lon: VOR.lon }, VOR), false, "otra frecuencia no");
});

test("IFR: al cerrar «Antes del despegue» se instruye una vez en tierra y al despegar solo se recuerda", () => {
  const ms = vueloIfr();
  const r = correr(ponerVor(crearRepaso("practica", IFR, 2, "ifr"), VOR), ms.slice(0, 1)).e;
  const p = instruirEnRampa(r, "es", "Al despegar intercepta el radial 250 alejándote y sube a 9,000 pies.");
  assert.deepEqual(p.decir, ["Sintoniza GDL, 117.50, en NAV1, con la barra en NAV. Al despegar intercepta el radial 250 alejándote y sube a 9,000 pies."]);
  assert.deepEqual(instruirEnRampa(p.estado, "es").decir, [], "una sola vez");
  const { decir } = correr(p.estado, ms.slice(1));
  assert.ok(decir.includes("Recuerda: GDL en NAV1, 117.50. Arriba de 1,000 pies sobre el terreno empezamos."), decir.join(" | "));
  assert.ok(!decir.some((d) => d.startsWith("Sintoniza")), decir.join(" | "));
  assert.deepEqual(instruirEnRampa(r, "en").decir, ["Tune GDL, 117.50, on NAV1, with the needle on NAV."]);
});

test("IFR: cualquier avión; el checklist por voz solo para C172, C152 y Arrow", () => {
  const baron = correr(ponerVor(crearRepaso("practica", IFR, 2, "ifr"), VOR), vueloIfr().map((m) => ({ ...m, titulo: "Beechcraft Baron G58" })));
  assert.notEqual(baron.e.etapa, "invalido", baron.e.motivo);
  assert.deepEqual(baron.e.avion, { nombre: "Beechcraft Baron G58", voz: null, c172: false });
  assert.deepEqual(avionDe("Piper PA-28R Arrow III"), { nombre: "Piper Arrow III", voz: "arrow", c172: false });
  assert.deepEqual(avionDe("Cessna 152 Asobo"), { nombre: "Cessna 152", voz: "c152", c172: false });
  assert.deepEqual(avionDe("Cessna Skyhawk G1000 Asobo"), { nombre: "Cessna 172", voz: "c172", c172: true });
  // El VFR sigue en el C172.
  const vfr = correr(crearRepaso("practica", [...SORTEO]), vueloIfr().map((m) => ({ ...m, titulo: "Beechcraft Baron G58" })));
  assert.equal(vfr.e.etapa, "invalido");
});

test("IFR: sin VOR elegido al despegar, pide elegir uno", () => {
  const { e } = correr(crearRepaso("practica", IFR, 2, "ifr"), vueloIfr());
  assert.equal(e.motivo, "Elige un VOR.");
  assert.ok(!["maniobra", "fuera-de-zona"].includes(e.etapa));
});

test("IFR: el checkride va en medio como mínimo y son 2 interceptaciones; el VFR sigue en Difícil", () => {
  assert.equal(crearRepaso("checkride", IFR, 1, "ifr").nivel, 2);
  assert.equal(crearRepaso("checkride", IFR, 3, "ifr").nivel, 3);
  assert.equal(crearRepaso("checkride", [...SORTEO], 1).nivel, 3);
  assert.equal(maniobrasDe(leccionIfrDe("1")!, Math.random, "checkride").length, 2);
  assert.deepEqual(maniobrasDe(leccionIfrDe("1")!), IFR);
});

test("IFR: los ejercicios de la lección mandan cuántas maniobras hay en práctica y en examen", () => {
  const l1 = leccionIfrDe("1")!;
  assert.equal(maniobrasDe(l1, Math.random, "practica").length, 5);
  assert.equal(maniobrasDe(l1, Math.random, "checkride").length, 2);
  const otra = { ...l1, ejercicios: { practica: 3, examen: 1 } };
  assert.equal(maniobrasDe(otra, Math.random, "practica").length, 3);
  assert.equal(maniobrasDe(otra, Math.random, "checkride").length, 1);
});
