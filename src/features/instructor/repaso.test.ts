import { test } from "node:test";
import assert from "node:assert/strict";
import type { Muestra } from "./evaluador.ts";
import { AEROPUERTO_PRUEBA as A, type Aeropuerto } from "./aeropuertoSim.ts";
import { aNm } from "../home/navGeo.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import type { ResultadoComun } from "./maniobras.ts";
import { simularVuelo } from "./simularVuelo.ts";
import {
  alMuestrearRepaso, alResultado, armaManiobra, crearRepaso, enZona, fueraDeZona, maniobraActual, nombreManiobra, siguienteManiobra, sortear, zonaRepaso,
  type EstadoRepaso, type Zona,
} from "./repaso.ts";

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
