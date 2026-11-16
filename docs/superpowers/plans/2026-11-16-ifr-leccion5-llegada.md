# Lección IFR 5: llegada real — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La lección IFR 5 vuela 2 llegadas (examen: 1). Cada llegada es una autorización de ATC completa a las 15 NM, seguida de interceptación normal, arco DME, acercamiento y espera en el VOR.

**Architecture:** Se encadenan las tres maniobras que ya existen (`interceptar-radial`, `arco-dme`, `espera`):
- El sorteo de la lección es esa terna repetida.
- La interceptación, al llegar a 15 NM, sortea la llegada (`Llegada`), la dice como autorización y la guarda en su resultado.
- El arco y la espera la leen de `ContextoArmado.llegadas`, que la página arma con los resultados ya guardados en `EstadoRepaso.hechas`.
- `repaso.ts` encadena sin repetir y anula la llegada completa si se anula una parte.

**Tech Stack:** React 19 + Vite + TypeScript. Pruebas con `node --experimental-strip-types --test`; el script `npm test` lista los archivos de prueba uno por uno.

**Spec:** `docs/superpowers/specs/2026-11-16-ifr-leccion5-llegada-design.md`

## Global Constraints

- Requiere VOR con DME (`requiereDme: true`), igual que la IFR 3.
- Las lecciones 1 a 4 no cambian de comportamiento. Toda la lógica nueva se activa solo con `ctx.llegadas` definido o con `esLlegada(sorteo)`.
- Interceptación siempre normal y sin la pregunta «¿normal o ruta pasada?». Se conservan la pregunta del lado del arco y la de la entrada de la espera.
- Autorización a 15 NM (`LLEGADA_NM = 15`). Arco de 8 a 10 NM. R2 queda a 30–60° de R1. R1 queda a 20–40° del radial del avión.
- La espera nunca va a menos de 30° de R2. Las entradas se reparten: la entrada de una llegada nunca es la de la llegada anterior. La espera siempre es inventada, con tramos de 60 s.
- La interceptación termina a `arco.radioNm + 1` NM. Si no hay cruce para entonces, es error en «interceptar».
- Una parte anulada después de empezar la llegada anula la llegada completa:
  - en práctica se repite la llegada con una autorización nueva;
  - en el examen, `etapa: "invalido"`.
- Una parte fallada no se repite: la llegada sigue.
- Práctica: 2 llegadas. Examen: 1. El examen se aprueba si se aprueban todas las partes (esto ya lo hace `debriefingRepaso`).
- Sin «oficial», «certificado», «licencia», «CFI», «con IA». La interfaz en inglés no lleva `[áéíóúñ¿¡]`.
- Los commits llevan dos `-m`: el mensaje y `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Solo se hace `git add` de los archivos nombrados.
- Cada archivo de prueba nuevo se agrega a la lista del script `test` en `package.json`.
- Verificación al final de cada tarea: `npx tsc -b --noEmit` (sin errores) y `npm test` (0 fallas).

## Review Focus

1. Recargar la página a media llegada, después de la autorización. La interceptación se rearma dentro de las 15 NM y debe quedar en «esperando» con «Sigue alejándote; a las 15 millas te doy la llegada». No debe trabarse ni preguntar. Lo cubre la prueba de la Tarea 2.
2. El arco se arma con el avión ya adentro del radio porque la interceptación terminó tarde. El arco debe terminar con error de entrada, no quedarse en «hacia-arco» para siempre. Lo cubre la prueba de la Tarea 3.
3. Una parte que se anula al armarse, antes de que empiece la llegada (sin señal, en tierra), no debe disparar `anularLlegada` en bucle. Lo cubre la prueba de `llegadaEmpezada` en la Tarea 4.
4. La espera armada en la lección 5 con el avión ya acercándose por R2 debe llegar a «pregunta» (la entrada) antes del fijo. Lo cubre la prueba de la Tarea 3.
5. `generarLlegada` siempre encuentra una espera válida para cualquier radial del avión, entrada anterior y giros. Lo cubre la prueba exhaustiva de la Tarea 1.

---

### Task 1: Sorteo de la llegada (`navIfr.ts`)

**Files:**
- Modify: `src/features/instructor/navIfr.ts`
- Create: `src/features/instructor/llegada.test.ts` (agrégalo al script `test` de `package.json`)

**Interfaces:**
- Produces:
  - `export const LLEGADA_NM = 15`
  - `export type Llegada = { r1: number; arco: EjercicioArco; espera: DatosEspera; entrada: Entrada }`
  - `export function generarLlegada(radialAvion: number, altitudFt: number, anterior?: Llegada, azar: () => number = Math.random): Llegada`
  - `export const radialEsperaDe = (ll: Llegada) => norm360(ll.espera.acercamiento + 180)`
  - `export const alejamientoSiguiente = (anterior: Llegada) => norm360(anterior.arco.hasta + 180)`: el radial por el que se aleja antes de la siguiente llegada; sigue de largo por R2 después del VOR.

- [ ] **Step 1: Write the failing tests** in `llegada.test.ts`:

```ts
test("generarLlegada: R1 a 20–40° del avión, arco de 8–10 NM acercándose hasta 30–60° más allá", () => {
  for (const x of [0, 0.2, 0.5, 0.8, 0.99]) {
    const ll = generarLlegada(300, 9000, undefined, () => x);
    const d1 = Math.abs(norm180(ll.r1 - 300));
    assert.ok([20, 30, 40].includes(d1), String(d1));
    assert.ok(ll.arco.radioNm >= 8 && ll.arco.radioNm <= 10);
    assert.equal(ll.arco.desde, ll.r1);
    assert.equal(ll.arco.alejandose, false);
    assert.equal(ll.arco.saleAlejandose, false);
    assert.ok([30, 40, 50, 60].includes(Math.abs(norm180(ll.arco.hasta - ll.r1))));
    assert.equal(ll.espera.altitudFt, 9000);
    assert.equal(ll.espera.carta, false);
    assert.equal(ll.espera.tramoSeg, 60);
  }
});

test("generarLlegada: la espera da la entrada sorteada llegando por R2, nunca sobre R2, y cambia de entrada", () => {
  for (let radial = 0; radial < 360; radial += 10)
    for (const anterior of [undefined, ...(["directa", "paralela", "gota"] as const)]) {
      const prev = anterior && generarLlegada(radial, 9000, undefined, () => 0.5);
      const ll = generarLlegada(radial, 9000, prev && { ...prev, entrada: anterior }, Math.random);
      const r2 = ll.arco.hasta;
      assert.ok(Math.abs(norm180(radialEsperaDe(ll) - r2)) >= 30);
      for (const d of [-10, 0, 10]) assert.equal(entradaEspera(norm360(r2 + 180 + d), radialEsperaDe(ll), ll.espera.giros), ll.entrada);
      if (anterior) assert.notEqual(ll.entrada, anterior);
    }
});

test("alejamientoSiguiente: sigue de largo por R2", () => {
  const ll = generarLlegada(300, 9000, undefined, () => 0);
  assert.equal(alejamientoSiguiente(ll), norm360(ll.arco.hasta + 180));
});
```

- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/instructor/llegada.test.ts < /dev/null`. Expected: FAIL, porque `generarLlegada` no está exportada.
- [ ] **Step 3: Implement** en `navIfr.ts`, reutilizando `redondear10`, `giroArco`, `entradaEspera` y `norm360`:
  - Orden de llamadas a `azar`: signo y desfase de R1, radio, sentido, giro del arco, entrada y, por último, la espera.
  - La entrada se sortea entre las tres menos `anterior?.entrada`.
  - Para la espera se reúnen los candidatos (radial de alejamiento `k*10`, giros `derecha | izquierda`) que cumplen las dos condiciones de la prueba y se elige uno con `azar`. La condición de la entrada es la misma de `rutaEspera` (±10°).
  - `acercamiento = norm360(radial + 180)`.
- [ ] **Step 4: Run** el mismo comando. Expected: PASS.
- [ ] **Step 5: Commit** `navIfr.ts`, `llegada.test.ts` y `package.json` con el mensaje «Draw an IFR arrival: inbound radial, DME arc and a hold with a varied entry».

### Task 2: Interceptación en modo llegada (`evaluadorInterceptacion.ts`, `textosInterceptacion.ts`)

**Files:**
- Modify: `src/features/instructor/maniobras.ts` (en `ContextoArmado`: `llegadas?: Llegada[]` con este comentario: «Lección 5: las llegadas ya sorteadas, en orden; presente, aunque esté vacío, solo en la 5»).
- Modify: `src/features/instructor/evaluadorInterceptacion.ts`
- Modify: `src/features/instructor/textosInterceptacion.ts`
- Create: `src/features/instructor/textosLlegada.ts` (por ahora solo `autorizacionLlegada`; la Tarea 5 lo completa)
- Test: `src/features/instructor/llegada.test.ts`

**Interfaces:**
- Consumes: `generarLlegada`, `LLEGADA_NM` y `Llegada` (Tarea 1).
- Produces:
  - En `EvaluacionInterceptacion`: `paraLlegada: boolean`, `anterior?: Llegada` (la última de `ctx.llegadas`) y `llegada?: Llegada`.
  - En `ResultadoInterceptacion`: `llegada?: Llegada`.
  - `export function autorizacionLlegada(ll: Llegada, vor: string | undefined, idioma: Idioma): string` en `textosLlegada.ts`.

- [ ] **Step 1: Write the failing tests** en `llegada.test.ts`. Usa el helper de muestras que ya usa `interceptacion.test.ts` (copia o importa su `base`).

```ts
test("lección 5: la interceptación espera las 15 NM, sin pregunta", () => {
  const e = armarInterceptacion(muestra({ radial: 290, dme: 12 }), 2, { intento: 0, examen: false, llegadas: [] });
  assert.equal(e.fase, "esperando");
  assert.equal(e.paraLlegada, true);
  assert.equal(textoInterceptacion("espera", e, "es"), "Sigue alejándote; a las 15 millas te doy la llegada.");
});

test("lección 5: a las 15 NM sortea la llegada e intercepta R1 acercándose, sin pregunta", () => {
  let e = armarInterceptacion(muestra({ radial: 290, dme: 12 }), 2, { intento: 0, examen: false, llegadas: [] });
  e = avanzarInterceptacion(e, muestra({ radial: 290, dme: 15.1, t: 1 }));
  assert.ok(e.llegada);
  assert.equal(e.ejercicio!.radial, e.llegada!.r1);
  assert.equal(e.ejercicio!.desde, false);
  assert.equal(e.ejercicio!.tipo, "normal");
  assert.equal(e.preguntar, false);
  assert.match(textoInterceptacion("intercepta", e, "es"), /^Autorizado a /);
});

test("lección 5: termina a radio + 1 NM; establecido = aprobado sin error de identificar", () => {
  // Vuela hacia R1, cruza a 13 NM y sigue establecido hasta radio + 1.
  // Expected: fase "terminado", resultado.aprobado true, fuera.identificar [], resultado.llegada igual a e.llegada.
});

test("lección 5: llegar a radio + 1 NM sin cruzar R1 es error de interceptar", () => {
  // Expected: fuera.interceptar.length === 1 y fuera.identificar vacío.
});

test("autorizacionLlegada en español y en inglés", () => {
  const ll: Llegada = {
    r1: 240,
    arco: { radioNm: 8, desde: 240, hasta: 200, sentido: -1, alejandose: false, saleAlejandose: false },
    espera: { acercamiento: 220, giros: "derecha", tramoSeg: 60, carta: false, altitudFt: 9000 },
    entrada: "paralela",
  };
  assert.equal(autorizacionLlegada(ll, "GDL", "es"),
    "Autorizado a GDL: intercepta el radial 240 acercándote, únete al arco de 8 millas hasta el radial 200, acércate a GDL y espera al noreste en el radial 040, virajes a la derecha, mantén 9,000 pies.");
  assert.equal(autorizacionLlegada(ll, "GDL", "en"),
    "Cleared to GDL: intercept the 240 radial inbound, join the 8 mile arc to the 200 radial, proceed inbound to GDL and hold northeast on the 040 radial, right turns, maintain 9,000 feet.");
});
```

  `textoInterceptacion` es el `texto(paso, e, idioma)` interno: expórtalo con ese nombre. El sector cardinal sale del radial de la espera en 8 sectores de 45° centrados en 0, 45, … («norte», «noreste», … / "north", "northeast", …).

- [ ] **Step 2: Run** las pruebas. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `armarInterceptacion` con `ctx.llegadas !== undefined`:
    - tramo `{ desde: false, tipo: "normal", esperarNm: LLEGADA_NM }`;
    - `paraLlegada: true` y `anterior: ctx.llegadas.at(-1)`;
    - ignora `ctx.tramos` y `ctx.primero`.
  - Un solo `arrancar(e, m)` sirve a `armar` y a la fase «esperando». Con `paraLlegada`:
    - `llegada = generarLlegada(referenciaTramo(m, e.estacion), e.altitudFt ?? Math.round(m.altitud / 100) * 100, e.anterior)`;
    - `empezar` arranca con `{ tipo: "normal", radial: r1, desde: false, curso: r1 + 180, referencia }`, `preguntar: false` y `llegada`.
  - Fin en `avanzarInterceptacion`, antes del bloque «El fin del tramo»: si hay `e.llegada`, `dist !== null` y `dist <= e.llegada.arco.radioNm + 1`, llama a `terminar(n, dist)`.
  - `terminar`: con `e.llegada`, `identificar: []` y `resultado.llegada = e.llegada`.
  - Textos:
    - «espera» con `paraLlegada`: «Sigue alejándote; a las 15 millas te doy la llegada.» / "Keep flying outbound; at 15 miles I'll give you the arrival."
    - «intercepta»/«respondida» con `llegada`: `autorizacionLlegada(...)`, sin consejo de distancia.
- [ ] **Step 4: Run** `llegada.test.ts` e `interceptacion.test.ts`. Expected: todo PASS (las lecciones 1 y 2 no cambian).
- [ ] **Step 5: Commit** «Lesson IFR 5 interception: wait for 15 NM, draw the arrival and read it as a clearance».

### Task 3: Arco y espera en modo llegada (`evaluadorArco.ts`, `evaluadorEspera.ts`)

**Files:**
- Modify: `src/features/instructor/evaluadorArco.ts` (`armarArco`)
- Modify: `src/features/instructor/evaluadorEspera.ts` (`armarEspera`)
- Test: `src/features/instructor/llegada.test.ts`

**Interfaces:**
- Consumes: `ctx.llegadas` (Tarea 2).

- [ ] **Step 1: Write the failing tests:**

```ts
test("lección 5: el arco arranca con el de la llegada, hacia el arco y con la pregunta del lado", () => {
  // ll = generarLlegada(300, 9000, undefined, () => 0)
  // armarArco(m: acercándose por R1 a 11 NM, 2, { intento: 1, examen: false, llegadas: [ll] })
  // Expected: fase "hacia-arco", ejercicio deepEqual ll.arco, preguntar true.
});

test("lección 5: el arco armado ya adentro del radio termina con error de entrada", () => {
  // Arma con dme = ll.arco.radioNm - 1.5 y avanza recto hacia el VOR hasta pasarlo.
  // Expected: termina (fase "terminado") con fuera.entrada.length > 0. No se queda en "hacia-arco".
});

test("lección 5: la espera llega por R2 con la espera de la llegada y pregunta la entrada", () => {
  // armarEspera(m: acercándose por R2 a 9 NM, 2, { intento: 2, examen: false, llegadas: [ll], altitudFt: 9000 })
  // Expected: ejercicio.llegada === ll.arco.hasta, ejercicio.acercamiento === ll.espera.acercamiento, giros igual.
  // Avanza acercándose por R2 hasta PREGUNTA_SEG del fijo: pasoEspera(...) === "pregunta".
});
```

- [ ] **Step 2: Run.** Expected: FAIL en la primera y la tercera. Si la segunda ya pasa con el código de hoy, déjala como prueba de regresión y anótalo.
- [ ] **Step 3: Implement.**
  - `armarArco`: si `ctx.llegadas?.length`, devuelve `iniciarArco(m, nivel, ctx.llegadas.at(-1)!.arco, ctx)` antes de la lógica de paridad.
  - `armarEspera`: si `ctx.llegadas?.length`:
    - `espera = ll.espera`;
    - ruta `{ llegada: ll.arco.hasta, salida: ll.arco.hasta }`;
    - no toca `ENTRADAS_PRACTICA`.
  - Si la segunda prueba falla: en `avanzarArco`, estando en «hacia-arco», si `dme < radioNm - tolArco(nivel).distanciaNm` y el DME va bajando, termina con un tramo de `entrada` (el patrón de `sinEntrar`).
- [ ] **Step 4: Run** `llegada.test.ts`, `arco.test.ts` y `espera.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit** «Lesson IFR 5: arc and hold armed from the drawn arrival».

### Task 4: Lección y encadenado (`lecciones.ts`, `repaso.ts`, `debriefingRepaso.ts`)

**Files:**
- Modify: `src/features/instructor/lecciones.ts`
- Modify: `src/features/instructor/repaso.ts`
- Modify: `src/features/instructor/debriefingRepaso.ts`
- Test: `src/features/instructor/llegada.test.ts`, `src/features/instructor/lecciones.test.ts`

**Interfaces:**
- Consumes: `Llegada`, `alejamientoSiguiente` y `ResultadoInterceptacion.llegada`.
- Produces:
  - `Leccion.llegada?: true`
  - `export const PARTES_LLEGADA: ManiobraId[] = ["interceptar-radial", "arco-dme", "espera"]`
  - `export const esLlegada = (sorteo: ManiobraId[]) => sorteo[0] === "interceptar-radial" && sorteo[1] === "arco-dme"`
  - `export function llegadasDe(e: EstadoRepaso): Llegada[]`: las `resultado.llegada` de `hechas`, en orden.
  - `export function llegadaEmpezada(e: EstadoRepaso, ev: { llegada?: Llegada } | null): boolean`, que vale `e.actual % 3 > 0 || !!ev?.llegada`.
  - `export function anularLlegada(e: EstadoRepaso, motivo: string, idioma: Idioma): Paso`

- [ ] **Step 1: Write the failing tests:**
  - `lecciones`: la 5 queda `disponible` con `requiereDme` y `llegada`; `maniobrasDe(l5)` es `PARTES_LLEGADA` dos veces en práctica y una en examen.
  - `lineaEjercicios` de la 5:
    - práctica: «Son 2 llegadas seguidas, con recordatorios y consejos.» / "2 arrivals in a row, with reminders and tips."
    - examen: «Es 1 llegada calificada, sin consejos.» / "One graded arrival, no tips."
  - `esLlegada` es true para el sorteo de la 5 y false para el de la 1, la 3 y la 4.
  - `alResultado` en la 5 con una parte no aprobada avanza (no dice `repetir`):
    - entre partes de una llegada no dice nada;
    - al terminar la espera de la llegada 1 dice exactamente «Llegada 1 terminada. Aléjate por el radial X de GDL; a las 15 millas te doy la siguiente llegada.», con X = `alejamientoSiguiente(llegada 1)`.
  - `anularLlegada`:
    - en práctica con `actual = 4`, deja `actual = 3`, borra resultado e intentoId de `hechas[3..5]` y dice «Se anuló la llegada: {motivo} Aléjate de GDL por donde vas; a las 15 millas te doy otra.»;
    - en examen deja `etapa: "invalido"` con el motivo.
  - `llegadaEmpezada`: false con `actual = 0` y `ev = null`, true con `actual = 1`, true con `actual = 0` y `ev.llegada`.
  - `debriefingRepaso` en la 5 agrega a «Navegación»:
    - «Llegada 1: aprobada» en `bien` si sus tres partes aprobaron;
    - si no, «Llegada 1: no aprobada» en `repetir`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `lecciones.ts`: `ifr(5, "Vuelo mezclado", "Mixed flight", undefined, { ejercicios: { practica: 2, examen: 1 }, requiereDme: true, llegada: true })`; `disponible` es `!!maniobra || !!extra.llegada`.
  - `maniobrasDe`: con `l.llegada`, repite `PARTES_LLEGADA` n veces.
  - `encadenado(e)` también es true con `esLlegada(e.sorteo)`.
  - `avanzarManiobra` con `esLlegada`:
    - `actual % 3 !== 0` → sin voz;
    - al empezar la llegada k+1 → `T.finLlegada(k, X, vor)`;
    - el fin, como hoy.
  - Textos nuevos en el `T` de `repaso.ts`, en español y en inglés sin acentos.
- [ ] **Step 4: Run** `npm test`. Expected: 0 fallas.
- [ ] **Step 5: Commit** «Lesson IFR 5: two chained arrivals, no repeats, and a void restarts the arrival».

### Task 5: Textos de la llegada (`textosLlegada.ts`)

**Files:**
- Modify: `src/features/instructor/textosLlegada.ts`
- Test: `src/features/instructor/llegada.test.ts`

**Interfaces:**
- Produces:
  - `export function ordenDespegue(radial: number, vor: string | undefined, altitudFt: number, idioma: Idioma): string`: «Después del despegue, aléjate por el radial 290 de GDL y sube a 9,000 pies. A las 15 millas te doy la llegada.» Compone `instruccionTramo(..., true, altitudFt)` y le agrega la segunda frase.
  - `export function pideRepetir(texto: string, idioma: Idioma): boolean`: true con «repite», «repita», «repítela», «otra vez la autorización» y "say again", "repeat"; false con «checklist antes del despegue» y con «derecha».
  - `export function briefingLlegada(idioma: Idioma): string[]`: 4 líneas.
    1. Qué trae la autorización.
    2. Que se puede pedir otra vez con «repite» o con el botón.
    3. Las dos preguntas (el lado del arco y la entrada).
    4. Que la llegada se aprueba si aprueban sus tres partes.
- [ ] **Step 1: Write the failing tests** con esas cadenas exactas y estas dos revisiones:
  - las líneas en inglés no tienen `[áéíóúñ¿¡]`;
  - ninguna línea contiene «oficial», «certific» ni «licencia».
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** `pideRepetir` usa `normalizar` de `preguntas.ts`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** «Lesson IFR 5 texts: takeoff order, say-again detection and briefing».

### Task 6: Página de la lección (`InstructorRepaso.tsx`)

**Files:**
- Modify: `src/pages/InstructorRepaso.tsx`

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: Wire.**
  - `contexto()`: `llegadas: repasoRef.current && esLlegada(repasoRef.current.sorteo) ? llegadasDe(repasoRef.current) : undefined`.
  - Al cerrar «Antes del despegue», si `leccion.llegada`: `extra = ordenDespegue(referenciaTramo(m, e.vor, pista), e.vor.ident, altitudDeLaLeccion, idioma)` y `altitudRef.current = altitudDeLaLeccion`.
  - Anulación: un efecto sobre `fase === "invalido"`. Si `esLlegada(repaso.sorteo)` y `llegadaEmpezada(repaso, ev)`:
    - `poner(anularLlegada(repaso, ev.motivo, idioma).estado)`;
    - dice su voz;
    - `reiniciar()`.
    En cualquier otro caso se deja el rearmado de hoy.
  - Llegada vigente: la de `ev.llegada` si la parte actual es la interceptación; si no, `llegadasDe(repaso).at(-1)`.
    - Se muestra su autorización (`autorizacionLlegada`) en la caja del paso.
    - Hay un botón «Repetir autorización» / "Say the clearance again" que la vuelve a decir.
  - Voz: en el callback de `useChecklistVoz`, si es la lección 5, hay llegada vigente y `pideRepetir(texto, idioma)`, se dice la autorización y se hace `return` antes de `oir`.
  - Encabezado: en la 5 dice «Llegada k de n · {nombreManiobra}» en lugar de `t.ejercicio`.
  - Briefing: en la 5 usa `briefingLlegada(idioma)` donde hoy van las líneas de `MANIOBRAS[leccion.maniobra].briefing`.
- [ ] **Step 2: Verify.** Expected: `npx tsc -b --noEmit` sin errores y `npm test` con 0 fallas.
- [ ] **Step 3: Verify in the browser** (preview, sin presionar «Empezar» con el MSFS de Erik conectado). Expected:
  - el menú IFR muestra la lección 5 abierta;
  - su briefing tiene las 4 líneas;
  - en inglés no aparecen acentos.
- [ ] **Step 4: Commit** «Lesson IFR 5 page: clearance on screen, say-again by voice or button, and arrival voids».

### Task 7: Teoría de la lección 5 (`teoriaIfr.ts`, `InstructorIfr.tsx`)

**Files:**
- Modify: `src/data/teoriaIfr.ts`, `src/data/teoriaIfr.test.ts`, `src/pages/InstructorIfr.tsx`

- [ ] **Step 1: Write the failing test:** `TEORIA_IFR.llegada` tiene 4 secciones, cada una con `es` y `en` no vacíos, y el inglés va sin acentos.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `TemaIfr` suma `"llegada"`. Las secciones son:
    1. «Qué es una autorización de llegada»: qué trae, en el orden en que se vuela.
    2. «Cópiala antes de volarla»: anótala o repítela, y pídela otra vez si hace falta.
    3. «Del arco a la espera»: la salida del arco te deja acercándote por el radial final; decide la entrada antes de llegar al VOR.
    4. «En la lección y en el examen»: 2 llegadas en práctica y 1 en examen; la llegada se aprueba si aprueban sus tres partes.
  - `InstructorIfr.tsx`: `TEORIA` suma `5: "llegada"`.
- [ ] **Step 4: Run** `npm test`. Expected: 0 fallas.
- [ ] **Step 5: Commit** «Theory for IFR lesson 5: reading and flying an arrival clearance».
