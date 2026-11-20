import { test } from "node:test";
import assert from "node:assert/strict";
import { ACADEMIA_MODULOS } from "../../../data/academia.ts";
import { MODULE_LECCIONES, checkpointsDeModulo, flattenTemas } from "../../../data/moduleContent.ts";
import { MISIONES } from "../../../data/misiones.ts";
import { ESCENAS } from "../../../data/escenas.ts";
import { armarCapitulos, capituloCompleto, capituloInicial, visualesDeTema } from "./motor.ts";
import { pasosDeTema } from "../lecturaScroll.ts";

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

test("cada módulo armado por temas declara los ejercicios de cada capítulo", () => {
  // Los módulos con misiones se arman aparte; el resto debe decir qué ejercicio va en cada capítulo, para que ninguno
  // se pregunte antes de enseñarse por el reparto automático.
  for (const m of ACADEMIA_MODULOS.filter((x) => !MISIONES[x.slug])) {
    for (const g of MODULE_LECCIONES[m.slug] ?? []) assert.ok(g.interactivos, m.slug + ": " + g.titulo);
  }
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

test("Fundamentos: el capítulo de ejes trae el ejercicio de clasificar y el de instrumentos el diagrama del six pack", () => {
  const caps = armarCapitulos("fundamentos");
  const ejes = caps.find((c) => c.id === "superficies-y-ejes")!;
  const tipos = ejes.bloques.map((b) => b.tipo);
  assert.ok(tipos.includes("clasificar"));
  assert.ok(tipos.indexOf("clasificar") < tipos.indexOf("simulador"));
  const seis = caps.find((c) => c.id === "seis-instrumentos")!;
  const puntos = seis.bloques.find((b) => b.tipo === "puntos");
  assert.deepEqual(puntos, { tipo: "puntos", setId: "six-pack" });
  // No cuentan para el avance: el capítulo se completa igual que antes.
  assert.deepEqual(seis.interactivos, []);
});

test("Aerodinámica: tres capítulos, cada ejercicio con su tema y un candado tras el tema 9", () => {
  const caps = armarCapitulos("aerodinamica");
  assert.deepEqual(caps.map((c) => c.titulo), ["Sustentación, pérdida y resistencia", "Superficies de control", "Tendencias, barrena y Va"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-4"], ["interactividad-1", "interactividad-3"], ["interactividad-2"]]);
  assert.deepEqual(caps[2].temas, ["aerodinamica-tema9"]);
  const candados = caps[2].bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : []));
  assert.deepEqual(candados, ["aero-q8"]);
});

test("Meteorología: tres capítulos, cada ejercicio con su tema y un candado por capítulo", () => {
  const caps = armarCapitulos("meteorologia");
  assert.deepEqual(caps.map((c) => c.titulo), ["Leer METAR y TAF", "Lo que mueve el aire", "Hielo y altitud de densidad"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-1"], ["interactividad-2"], ["interactividad-4", "interactividad-3"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["met-q3"], ["met-q6"], ["met-q9"]]);
});

test("Navegación I: cuatro capítulos, los ejercicios donde van y un candado por capítulo", () => {
  const caps = armarCapitulos("navegacion");
  assert.deepEqual(caps.map((c) => c.titulo), ["El VOR y sus radiales", "TO/FROM, CDI y OBS", "Interceptar un radial", "Tracking y fijación cruzada"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [[], ["interactividad-1"], [], ["interactividad-2", "interactividad-3"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["nav-q1"], ["nav-q3"], ["nav-q14"], ["nav-q9"]]);
});

test("Navegación II: cuatro capítulos y los ejercicios donde van", () => {
  const caps = armarCapitulos("navegacion-2");
  assert.deepEqual(caps.map((c) => c.titulo), ["DME y HSI", "ADF, NDB y RMI", "Cartas y planificación de ruta", "Arco DME y patrón de espera"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [[], ["interactividad-1"], ["interactividad-2"], ["interactividad-3", "interactividad-4"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["nav-q6"], ["nav-q8"], ["nav-q15", "nav-q12"], []]);
});

test("Cartografía: tres capítulos y los ejercicios donde van", () => {
  const caps = armarCapitulos("cartografia");
  assert.deepEqual(caps.map((c) => c.titulo), ["Cartas, símbolos y espacio aéreo", "Obstáculos, elevaciones y frecuencias", "Puntos VFR y lectura completa"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-1"], ["interactividad-2"], ["interactividad-3", "interactividad-4"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["cart-q17"], ["cart-q13"], []]);
});

test("Comunicaciones: cuatro capítulos y los ejercicios donde van", () => {
  const caps = armarCapitulos("comunicaciones");
  assert.deepEqual(caps.map((c) => c.titulo), ["Fraseología, primer contacto y rodaje", "Despegue y circuito", "En ruta y llegada", "Aterrizaje, IFR, emergencias y errores"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-2"], ["interactividad-1"], ["interactividad-3"], ["interactividad-4", "interactividad-5", "interactividad-6"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["com-q3"], ["com-q12"], ["com-q13"], ["com-q6"]]);
});

test("Instrumentos: cuatro capítulos y los ejercicios donde van", () => {
  const caps = armarCapitulos("instrumentos");
  assert.deepEqual(caps.map((c) => c.titulo), ["Altímetro, velocidad y actitud", "Viraje y velocidad vertical", "Rumbo: compás, HSI y RMI", "DME y transponder"]);
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-5"], ["interactividad-1", "interactividad-4"], ["interactividad-3"], ["interactividad-2"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["ins-q4"], ["ins-q6"], ["ins-q12"], []]);
});

test("Instrumentos: los textos no repiten los errores de la revisión", () => {
  const texto = (n: number) => flattenTemas("instrumentos")!.find((t) => t.id === "instrumentos-tema" + n)!.texto;
  assert.match(texto(2), /presión total/);
  assert.ok(!/acelerar volando hacia el norte/.test(texto(7)), "ANDS es en rumbos este u oeste");
  assert.match(texto(7), /este u oeste/);
  assert.match(texto(7), /único indicador de rumbo/);
  assert.match(texto(10), /oblicua/);
});

test("Rendimiento: cada ejercicio va en el capítulo donde ya se enseñó lo que pregunta", () => {
  const caps = armarCapitulos("rendimiento");
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-3", "interactividad-2"], ["interactividad-1", "interactividad-4"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["ren-q16"], ["ren-q6"]]);
});

test("Rendimiento: los textos no repiten los errores de la revisión", () => {
  const temas = flattenTemas("rendimiento")!;
  const texto = (n: number) => temas.find((t) => t.id === "rendimiento-tema" + n)!.texto;
  assert.ok(!/20-30%/.test(texto(4)), "con 10 nudos de cola, el C172 pide 50%");
  assert.match(texto(4), /50%/);
  assert.ok(!/sin previo aviso/.test(texto(2)));
  assert.match(texto(2), /barrena/);
  assert.ok(!/30-50%/.test(texto(5)));
  assert.match(texto(6), /un solo control/);
  assert.match(texto(6), /Vs1/);
});

test("VFR: cada ejercicio va en el capítulo donde ya se enseñó lo que pregunta", () => {
  const caps = armarCapitulos("vfr");
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-1"], ["interactividad-3", "interactividad-4"], ["interactividad-2"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["vfr-q16"], ["vfr-q6"], ["vfr-q12"]]);
});

test("VFR: los textos no repiten los errores de la revisión", () => {
  const temas = flattenTemas("vfr")!;
  const todo = (n: number) => {
    const t = temas.find((x) => x.id === "vfr-tema" + n)!;
    return [t.texto, ...pasosDeTema(t).map((p) => p.titulo + " " + p.texto)].join(" ");
  };
  assert.ok(!/en cuanto el motor arranca/.test(todo(9)), "la baliza se enciende antes de arrancar");
  assert.match(todo(9), /antes de arrancar/);
  assert.ok(!/30 minutos/.test(todo(9)), "las luces de posición van de la puesta a la salida del sol");
  assert.match(todo(9), /puesta a la salida del sol/);
  assert.match(todo(3), /Clase G/);
  assert.match(todo(3), /mismos/);
  assert.ok(!/marca el inicio del descenso/.test(todo(6)), "el descenso empieza en viento en cola");
  assert.match(todo(6), /punto de toque/);
  assert.match(todo(1), /siempre/);
  assert.match(todo(2), /FAA/);
  assert.match(todo(2), /ENR 1\.2/);
  assert.match(todo(8), /meterte delante/);
});

test("Operación: cada ejercicio va en el capítulo donde ya se enseñó lo que pregunta", () => {
  const caps = armarCapitulos("operacion");
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-2", "interactividad-4"], ["interactividad-1", "interactividad-3", "interactividad-5"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["op-q4", "op-q14"], ["op-q9", "op-q15"]]);
});

test("Operación: los textos no repiten los errores de la revisión", () => {
  const temas = flattenTemas("operacion")!;
  const todo = (n: number) => {
    const t = temas.find((x) => x.id === "operacion-tema" + n)!;
    return [t.texto, ...pasosDeTema(t).map((p) => p.titulo + " " + p.texto)].join(" ");
  };
  assert.ok(!/manecillas del reloj/.test(todo(1)), "el orden de la inspección es el del POH");
  assert.match(todo(1), /POH/);
  assert.match(todo(1), /cabina, cola, ala derecha, nariz y ala izquierda/);
  assert.ok(!/antes de cruzar el umbral/.test(todo(10)), "estabilizado a más tardar a 500 ft");
  assert.match(todo(10), /500 pies/);
  assert.match(todo(2), /[Ll]eer y ejecutar/);
  assert.ok(!/Lo que no se hace/.test(todo(2)), "leer y ejecutar también es un método");
  assert.match(todo(3), /30 a 60 segundos/);
  assert.match(todo(3), /baliza/);
  assert.match(todo(4), /autorización/);
  assert.match(todo(4), /línea de espera/);
  assert.match(todo(6), /en qué punto/);
  assert.match(todo(8), /acelere/);
  assert.match(todo(9), /ATIS/);
  assert.match(todo(9), /5 veces/);
});

test("Espacios aéreos: cada ejercicio va en el capítulo donde ya se enseñó lo que pregunta", () => {
  const caps = armarCapitulos("espacios-aereos");
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-2"], ["interactividad-1", "interactividad-3", "interactividad-4"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["esp-q3"], ["esp-q5", "esp-q8"]]);
});

test("Espacios aéreos: los textos no repiten los errores de la revisión", () => {
  const temas = flattenTemas("espacios-aereos")!;
  const todo = (n: number) => {
    const t = temas.find((x) => x.id === "espacios-aereos-tema" + n)!;
    return [t.texto, ...pasosDeTema(t).map((p) => p.titulo + " " + p.texto)].join(" ");
  };
  assert.ok(!/autorización especial/.test(todo(8)), "la prohibida no se cruza con permiso");
  assert.match(todo(6), /más alto/);
  assert.match(todo(6), /8,300/);
  assert.match(todo(5), /250 nudos/);
  assert.match(todo(10), /250 nudos/);
  for (const r of [/ADIZ/, /NOTAM/, /techo/, /rutas VFR/]) assert.match(todo(10), r);
  assert.ok(!/tráfico intenso/.test(todo(9)), "tráfico intenso no es una actividad peligrosa");
  assert.match(todo(9), /aguas internacionales/);
  const vfr2 = flattenTemas("vfr")!.find((x) => x.id === "vfr-tema2")!;
  assert.match(vfr2.texto, /Espacios aéreos/);
});

test("Reglamentación: cada ejercicio va en el capítulo donde ya se enseñó lo que pregunta", () => {
  const caps = armarCapitulos("reglamentacion");
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-1"], ["interactividad-2", "interactividad-3", "interactividad-4"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["reg-q5"], ["reg-q15"]]);
});

test("Reglamentación: los textos no repiten los errores de la revisión", () => {
  const temas = flattenTemas("reglamentacion")!;
  const todo = (n: number) => {
    const t = temas.find((x) => x.id === "reglamentacion-tema" + n)!;
    return [t.texto, ...pasosDeTema(t).map((p) => p.titulo + " " + p.texto)].join(" ");
  };
  for (const n of [1, 2, 4, 5, 6, 7]) assert.ok(!/RAC 61/.test(todo(n)), "tema " + n);
  assert.ok(!/marco del RAC 61/.test(todo(3)), "el RAC 61 es de Colombia");
  assert.match(todo(3), /Colombia/);
  assert.match(todo(3), /Reglamento para la Expedición de Permisos, Licencias y Certificados/);
  assert.ok(!/referencia visual constante/.test(todo(1)));
  assert.ok(!/más lento/.test(todo(1)));
  for (const r of [/VMC/, /convergen/, /aterriza/, /responsable final/]) assert.match(todo(1), r);
  assert.ok(!/continu/.test(todo(2)), "fuera del espacio controlado no hay instrucciones continuas");
  assert.match(todo(2), /[Ff]uera del espacio controlado/);
  assert.ok(!/Student Pilot/.test(todo(3)));
  for (const r of [/TPI/, /5,700 kg/, /permiso para formación/i]) assert.match(todo(3), r);
  for (const r of [/180 horas/, /1,500/, /art\. 50/, /art\. 54/, /art\. 56/]) assert.match(todo(4), r);
  for (const r of [/aptitud psicofísica/, /21 años/, /tres años/, /nivel 6/]) assert.match(todo(5), r);
  assert.ok(!/más estricto/.test(todo(6)), "con la tabla OACI los mínimos dependen de la altitud");
  for (const r of [/alterno/, /altitud/, /Espacios aéreos/]) assert.match(todo(6), r);
  for (const r of [/alterno/, /Parte II/]) assert.match(todo(7), r);
  const m = ACADEMIA_MODULOS.find((x) => x.slug === "reglamentacion")!;
  assert.ok(!/RAC 61/.test(m.proyectoPrompt ?? ""));
});

test("IFR: cada ejercicio va en el capítulo donde ya se enseñó lo que pregunta", () => {
  const caps = armarCapitulos("ifr");
  assert.deepEqual(caps.map((c) => c.interactivos), [["interactividad-1"], ["interactividad-2", "interactividad-3", "interactividad-4"]]);
  const candados = caps.map((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.deepEqual(candados, [["ifr-q12"], ["ifr-q7", "ifr-q15"]]);
});

test("IFR: los textos no repiten los errores de la revisión", () => {
  const temas = flattenTemas("ifr")!;
  const todo = (n: number) => {
    const t = temas.find((x) => x.id === "ifr-tema" + n)!;
    return [t.texto, ...pasosDeTema(t).map((p) => p.titulo + " " + p.texto)].join(" ");
  };
  for (const n of [1, 4, 10]) assert.ok(!/control continuo/.test(todo(n)), "tema " + n);
  assert.ok(!/prioridad de tránsito/.test(todo(1)), "el IFR no tiene prioridad sobre el VFR");
  for (const r of [/[Ff]uera del espacio controlado/, /D y E/, /prioridad/]) assert.match(todo(1), r);
  assert.match(todo(2), /OACI/);
  assert.match(todo(3), /3\.3 %/);
  assert.ok(!/Victor hasta FL180/.test(todo(4)));
  for (const r of [/letra y un número/, /AIP/, /Estados Unidos/]) assert.match(todo(4), r);
  assert.ok(!/aproximaciones de precisión/.test(todo(7)), "LPV es con guía vertical, no de precisión");
  assert.match(todo(7), /SBAS/);
  assert.match(todo(8), /CDFA/);
  for (const r of [/70°/, /110°/, /1 minuto/]) assert.match(todo(9), r);
});
