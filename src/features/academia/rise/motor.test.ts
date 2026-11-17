import { test } from "node:test";
import assert from "node:assert/strict";
import { ACADEMIA_MODULOS } from "../../../data/academia.ts";
import { checkpointsDeModulo, flattenTemas } from "../../../data/moduleContent.ts";
import { MISIONES } from "../../../data/misiones.ts";
import { ESCENAS } from "../../../data/escenas.ts";
import { armarCapitulos, capituloCompleto, capituloInicial, visualesDeTema } from "./motor.ts";

test("los 14 módulos tienen capítulos que abren con portada y terminan con cierre", () => {
  assert.equal(ACADEMIA_MODULOS.length, 14);
  for (const m of ACADEMIA_MODULOS) {
    const caps = armarCapitulos(m.slug);
    assert.ok(caps.length > 0, m.slug);
    for (const c of caps) {
      assert.equal(c.bloques[0].tipo, "portada", c.id);
      assert.equal(c.bloques.at(-1)!.tipo, "cierre", c.id);
    }
  }
});

test("cada lectura e interactivo del módulo aparece exactamente una vez", () => {
  for (const m of ACADEMIA_MODULOS) {
    const caps = armarCapitulos(m.slug);
    const enBloques = caps.flatMap((c) =>
      c.bloques.flatMap((b) => (b.tipo === "lectura" ? b.temas.map((t) => t.id) : b.tipo === "interactivo" ? [b.actividad.id] : [])),
    );
    const esperadas = m.actividades.filter((a) => a.tipo === "leccion" || a.tipo === "interactividad").map((a) => a.id);
    assert.deepEqual([...enBloques].sort(), [...esperadas].sort(), m.slug);
    assert.deepEqual(caps.flatMap((c) => [...c.temas, ...c.interactivos]).sort(), [...esperadas].sort(), m.slug);
  }
});

test("fundamentos: un capítulo por misión, simulador y sus preguntas como candados al final", () => {
  const caps = armarCapitulos("fundamentos");
  assert.deepEqual(
    caps.map((c) => c.titulo),
    MISIONES.fundamentos.map((m) => m.titulo),
  );
  caps.forEach((c, i) => {
    const m = MISIONES.fundamentos[i];
    assert.equal(c.minutos, m.minutos);
    const n = m.preguntas.length;
    assert.deepEqual(
      c.bloques.slice(-1 - n, -1).map((b) => b.tipo === "candado" && b.pregunta.id),
      m.preguntas.map((p) => p.id),
    );
    assert.deepEqual(
      c.bloques.find((b) => b.tipo === "simulador"),
      { tipo: "simulador", pasos: m.enSimulador },
    );
  });
  const ids = caps.flatMap((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.ok(!ids.includes("fun-q2") && !ids.includes("fun-q11"));
});

test("cada comprobación va como candado justo después de su tema", () => {
  for (const m of ACADEMIA_MODULOS.filter((m) => m.slug !== "fundamentos")) {
    const temas = flattenTemas(m.slug)!;
    const bloques = armarCapitulos(m.slug).flatMap((c) => c.bloques);
    const cps = checkpointsDeModulo(m.slug);
    assert.equal(bloques.filter((b) => b.tipo === "candado").length, cps.length, m.slug);
    for (const cp of cps) {
      const i = bloques.findIndex((b) => b.tipo === "candado" && b.pregunta.id === cp.pregunta.id);
      const antes = bloques[i - 1];
      assert.ok(antes.tipo === "lectura" && antes.temas.at(-1)!.id === temas[cp.despuesDeTema].id, `${m.slug} ${cp.pregunta.id}`);
    }
  }
});

test("los interactivos se reparten en orden entre los capítulos", () => {
  const caps = armarCapitulos("vfr");
  assert.deepEqual(
    caps.map((c) => c.interactivos.length),
    [1, 1, 2],
  );
  const orden = ACADEMIA_MODULOS.find((m) => m.slug === "vfr")!
    .actividades.filter((a) => a.tipo === "interactividad")
    .map((a) => a.id);
  assert.deepEqual(
    caps.flatMap((c) => c.interactivos),
    orden,
  );
});

test("las tarjetas salen de los puntos del capítulo, sin texto nuevo", () => {
  for (const m of ACADEMIA_MODULOS)
    for (const c of armarCapitulos(m.slug)) {
      const temas = c.bloques.flatMap((b) => (b.tipo === "lectura" ? b.temas : []));
      for (const b of c.bloques)
        if (b.tipo === "tarjetas") {
          assert.ok(b.tarjetas.length >= 2 && b.tarjetas.length <= 6, c.id);
          for (const t of b.tarjetas) {
            // El título del tema acompaña al punto: hay puntos genéricos («Qué es») repetidos en un capítulo.
            const p = temas.find((tm) => tm.titulo === t.tema)?.puntos?.find((p) => p.titulo === t.frente);
            assert.ok(p, `${c.id}: ${t.frente}`);
            assert.equal(t.reverso.toLowerCase(), p.texto.toLowerCase());
          }
        }
    }
});

test("visualesDeTema: escenas primero, luego las imágenes del tema repartidas por paso, si no hay nada vacío", () => {
  const t2 = flattenTemas("fundamentos")!.find((t) => t.id === "fundamentos-tema2")!;
  assert.deepEqual(visualesDeTema(t2), ESCENAS["fundamentos-tema2"]);
  const tema = {
    id: "x",
    titulo: "X",
    texto: "t",
    clave: "k",
    imagenes: ["/a.jpg", "/b.jpg"],
    puntos: [
      { titulo: "1", texto: "1" },
      { titulo: "2", texto: "2" },
      { titulo: "3", texto: "3" },
    ],
  };
  assert.deepEqual(
    visualesDeTema(tema).map((v) => v.tipo === "foto" && v.src),
    ["/a.jpg", "/a.jpg", "/b.jpg", "/b.jpg"],
  );
  assert.deepEqual(visualesDeTema({ id: "y", titulo: "Y", texto: "t" }), []);
});

test("capituloInicial: el primero sin terminar, o el último si todo está hecho", () => {
  const caps = armarCapitulos("meteorologia");
  const hechos = new Set([...caps[0].temas, ...caps[0].interactivos]);
  assert.equal(
    capituloCompleto(caps[0], (id) => hechos.has(id)),
    true,
  );
  assert.equal(
    capituloInicial(caps, (id) => hechos.has(id)),
    1,
  );
  assert.equal(
    capituloInicial(caps, () => false),
    0,
  );
  assert.equal(
    capituloInicial(caps, () => true),
    caps.length - 1,
  );
});

test("minutos de cada capítulo: al menos 3; módulo inexistente sin capítulos", () => {
  for (const m of ACADEMIA_MODULOS) for (const c of armarCapitulos(m.slug)) assert.ok(c.minutos >= 3, c.id);
  assert.deepEqual(armarCapitulos("no-existe"), []);
});
