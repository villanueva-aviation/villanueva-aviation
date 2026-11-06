# Menú de actividades y preguntas por micrófono (fase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La ventana del instructor (`/instructor/programa`) gana un menú de actividades después del idioma y un instructor que hace preguntas de respuesta corta por micrófono durante la sesión del viraje escarpado, con el resultado en el debriefing.

**Architecture:** Lógica pura y probada en `src/features/instructor/` (`preguntas.ts` califica y elige, `bancoPreguntas.ts` son los datos, `actividades.ts` es el menú, `sesion.ts` gana el bloque `menu` y las respuestas). La página usa el `useSpeechRecognition` de la Academia para escuchar y `useVoz` gana `retener` para no hablar mientras escucha.

**Tech Stack:** React 19, TypeScript, Vite, Web Speech API (speechSynthesis + SpeechRecognition), pruebas con `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-05-instructor-maniobras-microfono-design.md` (este plan es su fase 1: "Menú y preguntas por micrófono con el viraje escarpado, más el banco del viraje y el general del C172").

## Global Constraints

- Las preguntas nunca cambian la calificación de la maniobra; cuentan solo en el debriefing.
- Si contesta mal o no contesta: el instructor dice «La respuesta es …» y la maniobra sigue; nada se anula ni se detiene.
- Escuchar empieza cuando el instructor termina de hablar, unos 8 s, con "Escuchando…" en pantalla; mientras escucha, la voz no empieza piezas nuevas.
- Reconocimiento con `es-MX` o `en-US` según el idioma de la sesión.
- Sin micrófono, sin permiso o sin soporte: las preguntas se apagan solas con un aviso; la sesión sigue.
- Interruptor "Preguntas por micrófono" en el panel de voz, encendido por defecto, guardado con los demás ajustes de voz (`localStorage` "instructor-voz").
- Menú: Clase completa (Exclusivo), Recto y nivelado (Gratis), Vuelo lento (Exclusivo), Pérdidas (Exclusivo), Viraje escarpado (Gratis). En esta fase solo el viraje escarpado está disponible; los demás se ven como "Próximamente".
- Prohibido en textos: "certificado", "CFI", "licencia", "certified". El aviso del reporte no cambia.
- Inglés sin caracteres españoles (`/[áéíóúñ]/` no aparece en textos en inglés).
- Las preguntas son de respuesta corta (un número, un nombre o una acción), en español e inglés, con datos que ya están en el repo; Erik las revisa antes de publicarlas.
- Solo `git add` de archivos específicos. Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nada se sube sin "Sí, súbelo".

## Review Focus

1. El reconocimiento devuelve el número con palabras o con cifras y unidades («cuarenta nudos», «40 kt», «son 40») → cuenta como correcta. Prueba en Task 2.
2. «140» o «400» no cuentan como «40»; se compara por palabra completa. Prueba en Task 2.
3. La voz del instructor no se graba como respuesta: mientras escucha, una orden o un aviso nuevo espera a que termine. Verificación en Task 5.
4. Permiso negado o navegador sin reconocimiento: las preguntas se apagan con aviso y la sesión sigue. Verificación en Task 5.
5. El auto-armado arranca el siguiente intento mientras escucha: el intento corre normal y la orden del paso sale al terminar de escuchar. Verificación en Task 5.

---

### Task 1: Probar el micrófono y el interruptor de preguntas

Primero se resuelve el riesgo más grande del diseño: si Edge escucha con MSFS en pantalla completa.

**Files:**
- Modify: `src/features/instructor/useVoz.ts`
- Modify: `src/pages/InstructorPrograma.tsx` (panel de voz y textos `T`)

**Interfaces:**
- Produces: `useVoz` devuelve además `preguntas: boolean`, `setPreguntas(on: boolean)`, `retener(on: boolean)`. `retener(true)` hace que no empiece ninguna pieza nueva (la que suena termina); `retener(false)` sigue con la cola.

- [ ] **Step 1:** En `useVoz.ts`, agrega `preguntas: boolean` a `Ajustes` (`BASE` true; `leer()` acepta el formato viejo: `v.preguntas !== false`). Agrega un `useRef` `retenido`; `reproducir()` regresa sin hablar si está retenido; `retener(false)` llama `reproducir()`.
- [ ] **Step 2:** En el panel de voz (`<details>`), agrega:
  - el interruptor "Preguntas por micrófono" / "Spoken questions";
  - el botón "Probar micrófono en 10 s" / "Test microphone in 10 s".

  El botón espera 10 s y hace esto:
  1. dice «Di la matrícula de tu avión.» / «Say your aircraft's registration.» con tipo "prueba";
  2. cuando termina de hablar, escucha con `useSpeechRecognition(idioma === "en" ? "en-US" : "es-MX")`;
  3. al terminar dice «Escuché: …» / «I heard: …», o «No escuché nada.» / «I didn't hear anything.»

  En pantalla se ve "Escuchando…" / "Listening…" y el error del hook si lo hay. Esos 10 s son para que Erik cambie a MSFS en pantalla completa antes de que empiece.
- [ ] **Step 3:** Verifica en el navegador con vite en el puerto 5180 y la ventana a 380 px:
  - el interruptor se guarda al recargar;
  - el botón cuenta 10 s y habla;
  - sin micrófono, en el panel se ve el error del hook y nada se rompe;
  - no hay scroll horizontal.
- [ ] **Step 4:** Corre `npx tsc -b --noEmit` y `npm.cmd test`. Expected: limpio, y todas las pruebas pasan.
- [ ] **Step 5: Commit** `useVoz.ts` y `InstructorPrograma.tsx`, con el mensaje "Let the cadet test the microphone from the instructor window".
- [ ] **Step 6: Checkpoint con Erik.** Pide "Sí, súbelo" para este commit y que Erik pruebe el botón con MSFS en pantalla completa. Si Edge no escucha sin el foco, detente: el diseño pasa al plan B (botón del joystick leído por el lector) y este plan se reescribe desde la Task 5.

### Task 2: Calificar respuestas y elegir preguntas

**Files:**
- Create: `src/features/instructor/preguntas.ts`
- Test: `src/features/instructor/preguntas.test.ts` (agrégalo al script `test` de `package.json`)

**Interfaces:**
- Produces:
  - `type Tema = "viraje-escarpado" | "c172"`
  - `type Pregunta = { id: string; tema: Tema; es: TextoPregunta; en: TextoPregunta }`, donde `TextoPregunta = { pregunta: string; respuesta: string; aceptadas: string[] }`
  - `normalizar(texto: string, idioma: Idioma): string`: minúsculas, sin acentos ni signos, y los números dichos con palabras pasan a cifras.
  - `calificarRespuesta(dicho: string, p: Pregunta, idioma: Idioma): boolean`: true si la versión normalizada de `dicho` contiene una de las `aceptadas` normalizadas como palabras completas.
  - `siguientePregunta(banco: Pregunta[], temas: Tema[], hechas: string[], azar?: () => number): Pregunta | null`: una al azar de esos temas que no esté en `hechas`; si ya salieron todas, vuelve a usar todas; null solo si no hay ninguna de esos temas.
  - `type Respondida = { id: string; correcta: boolean }`
  - `lineasPreguntas(respondidas: Respondida[], banco: Pregunta[], idioma: Idioma): string[]`: vacía si no hubo preguntas.

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
test("los números con palabras pasan a cifras", () => {
  assert.equal(normalizar("Cuarenta nudos", "es"), "40 nudos");
  assert.equal(normalizar("cuarenta y cinco grados", "es"), "45 grados");
  assert.equal(normalizar("ciento cinco", "es"), "105");
  assert.equal(normalizar("mil quinientos pies", "es"), "1500 pies");
  assert.equal(normalizar("dieciséis", "es"), "16");
  assert.equal(normalizar("Forty knots", "en"), "40 knots");
  assert.equal(normalizar("one hundred five", "en"), "105");
  assert.equal(normalizar("fifteen hundred feet", "en"), "1500 feet");
  assert.equal(normalizar("¡Áreas, despejadas!", "es"), "areas despejadas");
});

const VS0: Pregunta = { id: "t-vs0", tema: "c172",
  es: { pregunta: "¿Cuál es la Vs0?", respuesta: "40 nudos.", aceptadas: ["40"] },
  en: { pregunta: "What is Vs0?", respuesta: "40 knots.", aceptadas: ["40"] } };

test("acepta la respuesta dicha de varias formas", () => {
  for (const d of ["40", "cuarenta nudos", "son 40 kt", "Cuarenta."]) assert.ok(calificarRespuesta(d, VS0, "es"), d);
  assert.ok(calificarRespuesta("forty knots", VS0, "en"));
});

test("no confunde 140 o 400 con 40", () => {
  for (const d of ["140", "400", "ciento cuarenta", "", "no sé"]) assert.equal(calificarRespuesta(d, VS0, "es"), false, d);
});

test("no repite una pregunta hasta agotar el tema, y luego vuelve a empezar", () => {
  const b = [VS0, { ...VS0, id: "t-2" }, { ...VS0, id: "t-3", tema: "viraje-escarpado" as const }];
  assert.equal(siguientePregunta(b, ["c172"], ["t-vs0"], () => 0)?.id, "t-2");
  assert.ok(["t-vs0", "t-2"].includes(siguientePregunta(b, ["c172"], ["t-vs0", "t-2"], () => 0)!.id));
  assert.equal(siguientePregunta(b, ["viraje-escarpado"], [], () => 0)?.id, "t-3");
  assert.equal(siguientePregunta([], ["c172"], []), null);
});

test("las líneas del debriefing cuentan y listan las falladas con su respuesta", () => {
  const l = lineasPreguntas([{ id: "t-vs0", correcta: false }, { id: "t-vs0", correcta: true }], [VS0], "es");
  assert.equal(l[0], "Preguntas: 1 de 2 correctas.");
  assert.ok(l.some((x) => x.includes("¿Cuál es la Vs0?") && x.includes("40 nudos.")));
  assert.equal(lineasPreguntas([], [VS0], "en").length, 0);
  assert.equal(lineasPreguntas([{ id: "t-vs0", correcta: true }], [VS0], "en")[0], "Questions: 1 of 1 correct.");
});
```

- [ ] **Step 2:** Corre `node --experimental-strip-types --test src/features/instructor/preguntas.test.ts`. Expected: FAIL, porque no existe `./preguntas.ts`.
- [ ] **Step 3:** Implementa `preguntas.ts`.
  - El conversor de números cubre de 0 a 9999 en los dos idiomas:
    - En español: unidades, `dieci-`, `veinti-`, decenas con «y», «cien/ciento», las centenas («doscientos»… «novecientos», incluidas «quinientos», «setecientos» y «novecientos») y «mil».
    - En inglés: unidades, *teens*, decenas, «hundred» y «thousand», y «and» como conector.
    - «X hundred» multiplica, así que «fifteen hundred» = 1500.
  - Una palabra que no es número corta la secuencia.
  - En la línea de falladas, el formato es `«pregunta» → respuesta`.
- [ ] **Step 4:** Corre la misma prueba. Expected: todas pasan. Luego corre `npm.cmd test`. Expected: todas pasan.
- [ ] **Step 5: Commit** `preguntas.ts`, `preguntas.test.ts` y `package.json`, con el mensaje "Grade spoken answers by key ideas, with numbers said in words".

### Task 3: Banco de preguntas y hoja de revisión para Erik

**Files:**
- Create: `src/features/instructor/bancoPreguntas.ts` (`export const BANCO: Pregunta[]`)
- Test: `src/features/instructor/bancoPreguntas.test.ts` (agrégalo al script `test`)

**Interfaces:**
- Consumes: `Pregunta`, `calificarRespuesta` y `normalizar` de la Task 2.
- Produces: `BANCO`.

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
test("15 a 20 preguntas por tema", () => {
  for (const t of ["viraje-escarpado", "c172"] as const) {
    const n = BANCO.filter((p) => p.tema === t).length;
    assert.ok(n >= 15 && n <= 20, `${t}: ${n}`);
  }
});
test("ids únicos y textos completos en los dos idiomas", () => {
  assert.equal(new Set(BANCO.map((p) => p.id)).size, BANCO.length);
  for (const p of BANCO) for (const i of ["es", "en"] as const) {
    assert.ok(p[i].pregunta && p[i].respuesta && p[i].aceptadas.length, `${p.id} ${i}`);
  }
});
test("la respuesta que dice el instructor se califica como correcta", () => {
  for (const p of BANCO) for (const i of ["es", "en"] as const) assert.ok(calificarRespuesta(p[i].respuesta, p, i), `${p.id} ${i}`);
});
test("en inglés no hay español", () => {
  for (const p of BANCO) assert.doesNotMatch(`${p.en.pregunta} ${p.en.respuesta}`, /[áéíóúñ¿¡]/, p.id);
});
test("las preguntas no se aceptan con un sí o un no", () => {
  for (const p of BANCO) for (const i of ["es", "en"] as const) for (const a of p[i].aceptadas) {
    assert.ok(!["si", "no", "yes"].includes(normalizar(a, i)), `${p.id}: ${a}`);
  }
});
```

- [ ] **Step 2:** Corre la prueba. Expected: FAIL, porque no existe `./bancoPreguntas.ts`.
- [ ] **Step 3:** Escribe `BANCO`, con ids `ve-1…` y `c172-1…`.
  - **Datos:** solo valores que ya están en el repo.
    - Tolerancias, Va por peso, inclinación y altura de seguridad: de `virajeEscarpado.ts`.
    - Velocidades, límites y sistemas del C172: de la sección C172 de `src/data/checklistAviones.ts`.
    - Teoría del viraje escarpado: de `src/data/moduleContent.ts` y `src/data/checkrideVuelo.ts`.

    Un dato que no esté en el repo no entra.
  - **Respuestas aceptadas:** las formas cortas en que un cadete lo diría. Un número se escribe en cifras, con su unidad aparte (la unidad no es obligatoria). Una acción se escribe con sus palabras clave («potencia», «nariz abajo»).
  - **Qué preguntar:** solo lo que se contesta en una o dos palabras mientras vuela.
- [ ] **Step 4:** Corre la prueba y luego `npm.cmd test`. Expected: todas pasan.
- [ ] **Step 5:** Genera la hoja de revisión para Erik con un script en el scratchpad, no en el repo. El script lee `BANCO` y escribe un HTML con una tabla por tema; cada fila trae la pregunta, la respuesta y las aceptadas, en español y en inglés. Publícalo como Artifact privado ("Preguntas del instructor") y anota el enlace en el ledger.
- [ ] **Step 6: Commit** `bancoPreguntas.ts`, `bancoPreguntas.test.ts` y `package.json`, con el mensaje "Add the first spoken-question bank for the steep turn and the C172".

### Task 4: Menú de actividades

**Files:**
- Create: `src/features/instructor/actividades.ts`
- Test: `src/features/instructor/actividades.test.ts` (agrégalo al script `test`)
- Modify: `src/features/instructor/sesion.ts`, `src/features/instructor/sesion.test.ts`, `src/pages/InstructorPrograma.tsx`

**Interfaces:**
- Produces:
  - `type ActividadId = "clase" | "recto-nivelado" | "vuelo-lento" | "perdidas" | "viraje-escarpado"`
  - `ACTIVIDADES: { id: ActividadId; nombre: Record<Idioma, string>; detalle: Record<Idioma, string>; minutos: number; acceso: "gratis" | "exclusivo"; disponible: boolean }[]`, en el orden del menú. Solo `viraje-escarpado` tiene `disponible: true`, y todas duran 60 minutos.
  - `estadoActividad(a, tieneExclusivo: boolean): "abierta" | "candado" | "proximamente"`. "proximamente" va primero: lo no disponible nunca se abre.
  - En `sesion.ts`:
    - `Bloque` gana `"menu"`;
    - `Sesion` gana `actividad: ActividadId | null`;
    - `EventoSesion` gana `{ tipo: "elegir"; actividad: ActividadId }`;
    - el evento `"idioma"` ahora lleva a `"menu"`, y `"elegir"` en `"menu"` lleva a `"briefing"`.

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
// actividades.test.ts
test("orden y acceso del menú", () => {
  assert.deepEqual(ACTIVIDADES.map((a) => [a.id, a.acceso]), [
    ["clase", "exclusivo"], ["recto-nivelado", "gratis"], ["vuelo-lento", "exclusivo"], ["perdidas", "exclusivo"], ["viraje-escarpado", "gratis"],
  ]);
});
test("estado de cada opción", () => {
  const ve = ACTIVIDADES.find((a) => a.id === "viraje-escarpado")!;
  assert.equal(estadoActividad(ve, false), "abierta");
  assert.equal(estadoActividad({ ...ve, acceso: "exclusivo" }, false), "candado");
  assert.equal(estadoActividad({ ...ve, acceso: "exclusivo" }, true), "abierta");
  assert.equal(estadoActividad(ACTIVIDADES[0], true), "proximamente");
});
// sesion.test.ts
test("del idioma al menú y del menú al briefing", () => {
  let s = avanzarSesion(crearSesion("x"), { tipo: "idioma" }).sesion;
  assert.equal(s.bloque, "menu");
  assert.equal(avanzarSesion(s, { tipo: "listo", ahoraMs: 0 }).sesion.bloque, "menu");
  s = avanzarSesion(s, { tipo: "elegir", actividad: "viraje-escarpado" }).sesion;
  assert.equal(s.bloque, "briefing");
  assert.equal(s.actividad, "viraje-escarpado");
});
```

Actualiza también en `sesion.test.ts` las pruebas que esperaban `idioma` → `briefing`.

- [ ] **Step 2:** Corre las dos pruebas. Expected: FAIL, porque no existe `./actividades.ts` y el bloque esperado es "menu".
- [ ] **Step 3:** Implementa `actividades.ts` y los cambios de `sesion.ts`. En `InstructorPrograma.tsx`:
  - agrega una pantalla de menú después del idioma, con una tarjeta por actividad: nombre, detalle y una etiqueta "Gratis", "Exclusivo" o "Próximamente";
  - una tarjeta "abierta" manda `elegir`;
  - una con "candado" muestra qué trae y un enlace a `/contenido-exclusivo`;
  - una "proximamente" está deshabilitada;
  - el acceso sale de `usePremiumAccess()`, y mientras carga, las opciones del Exclusivo se ven con candado;
  - agrega `menu` a los nombres de bloque de `T`.
- [ ] **Step 4:** Corre `npm.cmd test` y `npx tsc -b --noEmit`. Expected: todo pasa. En el navegador, a 380 px: idioma → menú → viraje escarpado → briefing, en los dos idiomas, sin scroll horizontal.
- [ ] **Step 5: Commit** los archivos de esta tarea con el mensaje "Add the activity menu after choosing the language".

### Task 5: El instructor pregunta en vuelo y lo cuenta en el debriefing

**Files:**
- Modify: `src/features/instructor/sesion.ts`, `sesion.test.ts`, `briefing.ts`, `briefing.test.ts`, `src/pages/InstructorPrograma.tsx`

**Interfaces:**
- Consumes: `siguientePregunta`, `calificarRespuesta`, `lineasPreguntas` y `Respondida` (Task 2); `BANCO` (Task 3); `retener` y `preguntas` de `useVoz` (Task 1); `useSpeechRecognition` (`src/features/academia/useSpeechRecognition.ts`).
- Produces:
  - `Sesion` gana `respondidas: Respondida[]`, y `EventoSesion` gana `{ tipo: "respuesta"; respondida: Respondida }`, que se acepta en cualquier bloque menos `idioma`, `menu` y `cierre`.
  - `debriefing(intentos, material, idioma, respondidas: Respondida[] = [])` agrega `lineasPreguntas(...)` antes de la línea de «Repite». El «Repite», si existe, sigue siendo la última línea.
  - `vozDebriefing` en "necesario" también lee la línea que empieza con «Preguntas:» o «Questions:».

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
// sesion.test.ts
test("las respuestas se guardan en la sesión sin tocar los intentos", () => {
  let s = { ...crearSesion("x"), bloque: "practica" as const };
  s = avanzarSesion(s, { tipo: "respuesta", respondida: { id: "c172-1", correcta: true } }).sesion;
  assert.deepEqual(s.respondidas, [{ id: "c172-1", correcta: true }]);
  assert.equal(s.intentos.length, 0);
  assert.equal(avanzarSesion({ ...s, bloque: "cierre" }, { tipo: "respuesta", respondida: { id: "c172-2", correcta: false } }).sesion.respondidas.length, 1);
});
// briefing.test.ts
test("el debriefing suma las preguntas y la voz las dice en Solo lo necesario", () => {
  const intentos = [con("practica", 70), noAprobado("checkride")];
  const d = debriefing(intentos, MATERIAL, "es", [{ id: BANCO[0].id, correcta: false }]);
  assert.ok(d.lineas.includes("Preguntas: 0 de 1 correctas."));
  assert.ok(d.lineas.at(-1)!.startsWith("Repite"));
  assert.ok(vozDebriefing(d.lineas, intentos, "necesario").includes("Preguntas: 0 de 1 correctas."));
});
```

- [ ] **Step 2:** Corre las dos pruebas. Expected: FAIL, porque no existe `respondidas` y no aparece la línea de preguntas.
- [ ] **Step 3:** Implementa los cambios puros. Luego, en `InstructorPrograma.tsx`, el flujo de una pregunta:
  - **Cuándo se pregunta** (solo si `voz.preguntas` está encendido y hay reconocimiento):
    - una vez al entrar a `preparacion`, después de la orden del paso;
    - una vez después del comentario de cada intento de práctica;
    - nunca en `checkride`.
  - **El tema:** `["viraje-escarpado", "c172"]`. Las `hechas` son los ids de `sesion.respondidas`.
  - **El flujo:**
    1. Decir la pregunta con tipo "orden" y clave "pregunta".
    2. Cuando la voz deja de hablar, llamar `voz.retener(true)` y empezar a escuchar, con un tope de 8 s que llama `stop()`.
    3. Al terminar de escuchar: `calificarRespuesta(transcript)`, el evento `respuesta`, `voz.retener(false)`, y decir «Correcto.» / «Correct.» o «La respuesta es: …» / «The answer is: …», con clave "pregunta".
  - **Si falla el micrófono:** con error `not-allowed` o sin soporte, se apaga `setPreguntas(false)` y se muestra en el panel "No se pudo usar el micrófono: las preguntas se apagaron." / "The microphone couldn't be used: questions are off."
  - **En pantalla:** mientras escucha, la pregunta y "Escuchando…" / "Listening…". En el cierre, las líneas de preguntas dentro del debriefing.
- [ ] **Step 4:** Corre `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build`. Expected: todo pasa. En el navegador, con el lector `--simulado --sin-ventana` y la ventana a 380 px, revisa en español y en inglés:
  - **(a)** Las órdenes y avisos que llegan mientras escucha salen hasta que termina de escuchar (Review Focus 3 y 5).
  - **(b)** Sin micrófono, las preguntas se apagan con el aviso y la sesión llega al cierre (Review Focus 4).
  - **(c)** El debriefing muestra «Preguntas: X de Y correctas.».
  - **(d)** No hay scroll horizontal.
- [ ] **Step 5: Commit** los archivos de esta tarea con el mensaje "Ask spoken questions during practice and count them in the debriefing".
