import { test } from "node:test";
import assert from "node:assert/strict";
import { armar, avanzar, crearEvaluacion, type Evaluacion, type Muestra } from "./evaluador.ts";
import { simularManiobra } from "./simular.ts";
import { avisoVoz, filtrarAviso, lecturaFinal, MEMORIA_VACIA, ordenVoz, paraVoz, pasoVoz, semaforo, type Aviso, type PasoVoz } from "./voz.ts";

const correr = (muestras: Muestra[]): Evaluacion => muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0]));

/** La evaluación en la primera muestra ya dentro del viraje izquierdo. */
function enViraje(): { ev: Evaluacion; m: Muestra } {
  const muestras = simularManiobra();
  const i = muestras.findIndex((x) => Math.abs(x.inclinacion) > 41);
  return { ev: correr(muestras.slice(0, i + 1)), m: muestras[i] };
}

const ambar: Aviso = { clave: "altitud-ambar--", nivel: "ambar", texto: "Ojo con tu altitud" };
const rojo: Aviso = { clave: "altitud-rojo--", nivel: "rojo", texto: "Fuera de tolerancia: altitud" };

test("semáforo: verde, ámbar al 60 % y rojo al pasar la tolerancia", () => {
  const { ev, m } = enViraje();
  const ref = ev.interno.giro!.ref;
  assert.equal(semaforo(ev, { ...m, altitud: ref.altitud - 50 }).altitud, "verde");
  assert.equal(semaforo(ev, { ...m, altitud: ref.altitud - 65 }).altitud, "ambar");
  assert.equal(semaforo(ev, { ...m, altitud: ref.altitud - 110 }).altitud, "rojo");
  assert.deepEqual(Object.values(semaforo(armar(crearEvaluacion(), m), m)), ["gris", "gris", "gris", "gris"]);
});

test("aviso: corto en checkride, con corrección en práctica", () => {
  const { ev, m } = enViraje();
  const bajo = { ...m, altitud: ev.interno.giro!.ref.altitud - 65 };
  assert.equal(avisoVoz(ev, bajo, "checkride")!.texto, "Ojo con tu altitud");
  assert.equal(avisoVoz(ev, bajo, "practica")!.texto, "Estás perdiendo altitud: más presión atrás");
  const fuera = { ...m, altitud: ev.interno.giro!.ref.altitud - 110 };
  assert.equal(avisoVoz(ev, fuera, "checkride")!.texto, "Fuera de tolerancia: altitud");
  assert.equal(avisoVoz(ev, fuera, "practica")!.texto, "Fuera de tolerancia. Estás perdiendo altitud: más presión atrás");
  assert.equal(avisoVoz(ev, m, "checkride"), null);
});

test("no avisa de inclinación mientras entra a 45°, sí 2 s después", () => {
  const { ev, m } = enViraje();
  assert.equal(semaforo(ev, { ...m, inclinacion: -41 }).inclinacion, "gris");
  assert.equal(semaforo(ev, { ...m, t: m.t + 2.1, inclinacion: -41 }).inclinacion, "ambar");
});

test("filtro: no repite antes de 8 s, sí al escalar a rojo", () => {
  let s = filtrarAviso(MEMORIA_VACIA, ambar, 0);
  assert.equal(s.decir, "Ojo con tu altitud");
  s = filtrarAviso(s.mem, ambar, 3);
  assert.equal(s.decir, null);
  s = filtrarAviso(s.mem, ambar, 8.1);
  assert.equal(s.decir, "Ojo con tu altitud");
  s = filtrarAviso(s.mem, rojo, 9);
  assert.equal(s.decir, "Fuera de tolerancia: altitud");
});

test("filtro: alternar dentro/fuera no repite antes de 8 s", () => {
  let mem = MEMORIA_VACIA;
  const dichos: number[] = [];
  for (let t = 0; t < 7.9; t += 0.5) {
    const s = filtrarAviso(mem, Math.round(t * 2) % 2 ? null : ambar, t);
    mem = s.mem;
    if (s.decir) dichos.push(t);
  }
  assert.deepEqual(dichos, [0]);
});

test("filtro: tras 2 s dentro de la banda vuelve a avisar", () => {
  let s = filtrarAviso(MEMORIA_VACIA, ambar, 0);
  s = filtrarAviso(s.mem, null, 1);
  s = filtrarAviso(s.mem, null, 3.1);
  assert.equal(filtrarAviso(s.mem, ambar, 3.2).decir, "Ojo con tu altitud");
});

test("órdenes de una maniobra completa, en orden", () => {
  const muestras = simularManiobra();
  let ev = armar(crearEvaluacion(), muestras[0]);
  let paso: PasoVoz | null = null;
  const dichas: string[] = [];
  for (const m of muestras) {
    ev = avanzar(ev, m);
    const p = pasoVoz(ev, m);
    const o = ordenVoz(paso, p, ev);
    if (o) dichas.push(o);
    paso = p;
  }
  assert.deepEqual(dichas, [
    "Despeje el área con sus virajes de limpieza.",
    "Área despejada. Inicie el viraje de 360 grados.",
    "Rumbo de entrada 089.",
    "Nivele en su rumbo de entrada.",
    "Ahora al lado contrario.",
    "Rumbo de entrada 090.",
    "Nivele en su rumbo de entrada.",
  ]);
});

test("bajo de 1,500 AGL pide subir primero", () => {
  const [m] = simularManiobra();
  const bajo = { ...m, agl: 600 };
  const ev = armar(crearEvaluacion(), bajo);
  assert.equal(pasoVoz(ev, bajo), "bajo");
  assert.equal(ordenVoz(null, "bajo", ev), "Suba a 1,500 pies sobre el terreno.");
});

test("anulado dice el motivo", () => {
  const [m] = simularManiobra();
  const ev: Evaluacion = { fase: "invalido", motivo: "Pausaste el simulador: el intento no se califica.", interno: crearEvaluacion().interno };
  assert.equal(ordenVoz("limpieza", pasoVoz(ev, m), ev), "Intento anulado. Pausaste el simulador: el intento no se califica.");
});

test("lectura final completa y en voz", () => {
  const r = correr(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } })).resultado!;
  const l = lecturaFinal(r);
  assert.equal(l[0], "No aprobado. Calificación: 90 de 100.");
  assert.ok(l.some((x) => x.includes("130 pies")), l.join(" | "));
  assert.equal(l.at(-1), "Repite: viraje izquierdo");
  assert.ok(l.every((x) => !/[✓✗°]|\bft\b/.test(x)), l.join(" | "));
});

test("paraVoz no lee la flecha de las preguntas falladas", () => {
  assert.equal(paraVoz("«¿Cuál es la Vs0?» → 40 nudos"), "«¿Cuál es la Vs0?»: 40 nudos");
});

const dichasDe = (muestras: Muestra[]) => {
  let ev = armar(crearEvaluacion(), muestras[0]);
  let paso: PasoVoz | null = null;
  const dichas: string[] = [];
  for (const m of muestras) {
    ev = avanzar(ev, m);
    const p = pasoVoz(ev, m);
    const o = ordenVoz(paso, p, ev);
    if (o) dichas.push(o);
    paso = p;
  }
  return dichas;
};

test("al entrar al viraje dice el rumbo de entrada", () => {
  const dichas = dichasDe(simularManiobra());
  assert.equal(dichas.filter((d) => /^Rumbo de entrada 0(89|90)\.$/.test(d)).length, 2);
});

test("viraje corto: la voz dice cuántos grados llevaba y el rumbo de entrada", () => {
  const dichas = dichasDe(simularManiobra({ angulo: 318, lados: ["izquierda"] }));
  assert.match(dichas.at(-1)!, /^Nivelaste antes de completar la vuelta: llevabas 318 grados\. Repite el viraje y nivela en tu rumbo de entrada, 0(89|90)\.$/);
});

test("segundo viraje al mismo lado: la voz pide el lado contrario", () => {
  const dichas = dichasDe(simularManiobra({ lados: ["izquierda", "izquierda"] }));
  assert.equal(dichas.at(-1), "Ese viraje fue al mismo lado. El segundo va al lado contrario.");
});

test("a 32° sin llegar a 40°, avisa que falta inclinación a los 5 s, no antes", () => {
  const muestras = simularManiobra({ inclinacion: 32 });
  const i = muestras.findIndex((x) => Math.abs(x.inclinacion) > 30 && x.t > 60);
  const en = (seg: number) => muestras.findIndex((x) => x.t >= muestras[i].t + seg);
  const j = en(5.1);
  assert.match(avisoVoz(correr(muestras.slice(0, j + 1)), muestras[j], "practica")?.texto ?? "", /Te falta inclinación/);
  const k = en(3);
  assert.equal(semaforo(correr(muestras.slice(0, k + 1)), muestras[k]).inclinacion, "gris");
});

test("el semáforo usa la tolerancia del nivel: 150 ft abajo es rojo en Difícil y ámbar en Fácil", () => {
  const { ev, m } = enViraje();
  const bajo = { ...m, altitud: ev.interno.giro!.ref.altitud - 150 };
  assert.equal(semaforo(ev, bajo).altitud, "rojo");
  assert.equal(semaforo({ ...ev, nivel: 1 }, bajo).altitud, "ambar");
});

test("Fácil: pide nivelar desde los 270° (giro mínimo 300°)", () => {
  const { ev, m } = enViraje();
  const a = { ...ev, interno: { ...ev.interno, giro: { ...ev.interno.giro!, girado: -280 } } };
  assert.equal(pasoVoz(a, m), "viraje1");
  assert.equal(pasoVoz({ ...a, nivel: 1 }, m), "nivelar1");
});

test("paraVoz", () => {
  assert.equal(paraVoz("✗ Perdiste 130 ft, vas a 95 kt y 45°"), "Perdiste 130 pies, vas a 95 nudos y 45 grados");
});

test("en inglés: orden, aviso, paraVoz y lectura final", () => {
  const { ev, m } = enViraje();
  assert.equal(ordenVoz("limpieza", "despejado", ev, "en"), "Area clear. Begin your 360-degree steep turn.");
  const bajo = { ...m, altitud: ev.interno.giro!.ref.altitud - 65 };
  assert.equal(avisoVoz(ev, bajo, "checkride", "en")!.texto, "Watch your altitude");
  assert.equal(avisoVoz(ev, bajo, "practica", "en")!.texto, "You're losing altitude: more back pressure");
  assert.equal(paraVoz("100 ft ±5°", "en"), "100 feet plus or minus 5 degrees");
  const r = correr(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } })).resultado!;
  const l = lecturaFinal(r, "en");
  assert.equal(l[0], "Not passed. Score: 90 out of 100.");
  assert.ok(l.every((x) => !/[áéíóúñ]/.test(x)), l.join(" | "));
});

test("filtrarAviso: un aviso con repetir 30 no se repite a los 8 s, sí a los 30", () => {
  const lento: Aviso = { clave: "llegada", nivel: "ambar", texto: "Regresa al radial", repetir: 30 };
  let s = filtrarAviso(MEMORIA_VACIA, lento, 0);
  assert.equal(s.decir, "Regresa al radial");
  s = filtrarAviso(s.mem, lento, 8);
  assert.equal(s.decir, null);
  s = filtrarAviso(s.mem, lento, 30);
  assert.equal(s.decir, "Regresa al radial");
});
