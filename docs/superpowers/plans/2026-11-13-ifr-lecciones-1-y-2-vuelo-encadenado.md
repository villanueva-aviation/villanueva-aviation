# IFR lecciones 1 y 2: vuelo encadenado — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Las lecciones IFR 1 (interceptaciones normales) y 2 (rutas pasadas) se vuelven un solo vuelo de tramos encadenados: instrucción exacta, el cadete identifica por voz si es normal o ruta pasada, y el tramo se califica a las 8 NM o al pasar el VOR.

**Architecture:** Un solo evaluador (`evaluadorInterceptacion.ts`) vuela cualquier tramo: alejamiento o acercamiento, normal o ruta pasada. La lección dice qué tramos van (`tramosDe`), el evaluador elige el radial con la posición del avión al armarse, y el programa (`repaso.ts`) avanza al siguiente tramo sin repetir. La lección 2 vieja (`ruta-vor`) se borra y entra `ruta-pasada`, que comparte el evaluador.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind. Pruebas con `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-13-ifr-lecciones-1-y-2-vuelo-encadenado-design.md` (y `2026-11-11-instructor-ifr-design.md` para lo que no cambia)

## Global Constraints

- Prohibido en textos: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA»; nada de «Garmin» visible.
- Textos en inglés sin `[áéíóúñ¿¡]`.
- La instrucción nunca dice «normal» ni «ruta pasada» (ni «passed route», «behind»).
- Nada en pantalla delata el tipo antes de que el cadete conteste: ni la guía del HSI ni el texto del paso.
- Radiales: normal a 20–60° de la referencia, ruta pasada a 120–160°, redondeados a la decena; nunca a menos de 10° de la frontera de 90°.
- Fin de tramo: alejamiento a las 8 NM (`FIN_NM = 8`), acercamiento al pasar el VOR.
- Lección 2: el alejamiento que sigue al paso por el VOR se anuncia a 3 NM del otro lado (`esperarNm: 3`).
- Pruebas: cada archivo nuevo de prueba va en la lista explícita de `"test"` en `package.json`; borrar ahí los que se borren.
- Commits: `git add` solo de archivos nombrados; mensaje en inglés con `-m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`. Nunca agregar `en-vivo/ g1000-prueba/ guias/ poster/ propuestas/ redes/ simhub-sixpack/ supabase/.temp/ .superpowers/`.
- No push a main sin el «sí» de Erik. Entre las tareas 1 y 7 la app no compila (tipos que cambian); se sube todo junto al final.

## Rulings que ya tomé (Erik puede cambiarlos)

- **Sin repetir tramos en práctica.** Si un tramo sale mal, el vuelo sigue al siguiente (repetir un alejamiento ya a 8 NM no tiene sentido). El error queda en el debriefing.
- **En el examen, la respuesta por voz no se corrige** (el examen va sin consejos); solo suena el tono de recibido.
- **Referencia del primer tramo en tierra:** el rumbo magnético del umbral de pista más cercano al avión (la pista por la que va a despegar). Sin aeropuerto, el rumbo del avión.
- **El aviso «Pon el curso X en el OBS»** solo después de contestar: el curso lo calcula el cadete con la tarjeta.
- **Límite de seguridad:** 15 min por tramo (`LIMITE_SEG = 900`). Si se cumple sin haber cruzado el radial, error de interceptación.
- **Dentro del cono (2 NM del VOR)** nada se mide: la aguja ahí no vale.
- **Si el tramo arranca ya lejos** (VOR fuera del aeropuerto), termina a `max(8, distancia inicial + 4)` NM.

## Review Focus

1. **VOR lejos del aeropuerto** (a 2 NM o más en tierra): la referencia es el radial del avión, no la pista, y el alejamiento no termina en el instante de armarse. Pruebas en tareas 1 y 2.
2. **El cadete nunca contesta** (sin micrófono y sin tocar botones): el tramo termina igual, «identificar» sale NS y la guía no aparece. Prueba en tarea 2.
3. **Radiales que cruzan el 360** (referencia 350, radial pedido 010): la clasificación normal/pasada y el redondeo funcionan. Prueba en tarea 1.
4. **Recargar la página a mitad del vuelo:** se conservan los tramos sorteados y el primer ejercicio dicho en tierra. Prueba en tarea 7 (`reanudar.test.ts`).
5. **Resultados viejos** (interceptaciones sin `tipo` ni `referencia`, filas `ruta-vor` en la base): se explican y se listan sin romperse. Pruebas en tareas 3 y 4.

---

### Task 1: Tramos y radiales (`navIfr.ts`)

**Files:**
- Modify: `src/features/instructor/navIfr.ts`
- Modify: `src/features/instructor/aeropuertoSim.ts` (agregar `pistaProbable`)
- Test: `src/features/instructor/navIfr.test.ts`, `src/features/instructor/aeropuertoSim.test.ts`

**Interfaces:**
- Produces:
  - `type TipoTramo = "normal" | "pasada"`
  - `type Tramo = { desde: boolean; tipo: TipoTramo; esperarNm?: number }`
  - `type Ejercicio = { tipo: TipoTramo; radial: number; desde: boolean; curso: number; referencia: number }` (reemplaza al de `caso`)
  - `tipoDe(radial: number, referencia: number): TipoTramo`: pasada si `|norm180(radial − referencia)| > 90`
  - `generarTramo(tramo: Tramo, referencia: number, azar?: () => number): Ejercicio`
  - `tramosDe(leccion: 1 | 2, examen: boolean, azar?: () => number): Tramo[]`
  - `referenciaTramo(m: Muestra, vor: VorElegido | undefined, rumboPista?: number): number`
  - `tipoDicho(texto: string, idioma: Idioma): TipoTramo | null`
  - `pistaProbable(m: Muestra, a: Aeropuerto): number | null` en `aeropuertoSim.ts`: rumbo **magnético** del extremo de pista más cercano (`rumboV − declinacion(m)`)
- Se borran: `CasoInterceptacion`, `CASOS_PRACTICA`, `deltaRadial`, `generarEjercicio`, `casosExamen`, `EjercicioRuta`, `CASOS_RUTA`, `generarRuta`.

- [ ] **Step 1: Write the failing tests** en `navIfr.test.ts` (borra las pruebas de lo que se va):

```ts
test("tramosDe: lección 1 alterna alejamiento y acercamiento, todo normal", () => {
  assert.deepEqual(tramosDe(1, false), [
    { desde: true, tipo: "normal" }, { desde: false, tipo: "normal" }, { desde: true, tipo: "normal" }, { desde: false, tipo: "normal" },
  ]);
  assert.deepEqual(tramosDe(1, true), [{ desde: true, tipo: "normal" }, { desde: false, tipo: "normal" }]);
});
test("tramosDe: lección 2 son rutas pasadas y el alejamiento tras el VOR espera 3 NM", () => {
  assert.deepEqual(tramosDe(2, false), [
    { desde: true, tipo: "pasada" }, { desde: false, tipo: "pasada" }, { desde: true, tipo: "pasada", esperarNm: 3 }, { desde: false, tipo: "pasada" },
  ]);
});
test("tramosDe: el examen de la lección 2 mezcla una normal y una pasada", () => {
  assert.deepEqual(tramosDe(2, true, () => 0.1).map((t) => t.tipo), ["pasada", "normal"]);
  assert.deepEqual(tramosDe(2, true, () => 0.9).map((t) => t.tipo), ["normal", "pasada"]);
  assert.deepEqual(tramosDe(2, true, () => 0.9).map((t) => t.desde), [true, false]);
});
test("generarTramo: normal a 20–60°, pasada a 120–160°, en decenas, lejos de la frontera de 90°", () => {
  for (const ref of [0, 7, 95, 183, 290, 355]) for (let k = 0; k < 50; k++) {
    const azar = () => (k * 0.137 + ref * 0.01) % 1;
    const n = generarTramo({ desde: true, tipo: "normal" }, ref, azar);
    const p = generarTramo({ desde: false, tipo: "pasada" }, ref, azar);
    const dn = Math.abs(norm180(n.radial - ref)), dp = Math.abs(norm180(p.radial - ref));
    assert.ok(dn >= 15 && dn <= 65, `normal ${n.radial} ref ${ref}`);
    assert.ok(dp >= 115 && dp <= 165, `pasada ${p.radial} ref ${ref}`);
    assert.equal(n.radial % 10, 0);
    assert.equal(tipoDe(n.radial, ref), "normal");
    assert.equal(tipoDe(p.radial, ref), "pasada");
  }
});
test("generarTramo: curso FROM = radial, TO = radial + 180; guarda tipo y referencia", () => {
  assert.deepEqual(generarTramo({ desde: true, tipo: "normal" }, 290, () => 0), { tipo: "normal", radial: 310, desde: true, curso: 310, referencia: 290 });
  const p = generarTramo({ desde: false, tipo: "pasada" }, 290, () => 0.99);
  assert.equal(p.curso, norm360(p.radial + 180));
});
test("tipoDe: el ejemplo de Erik y el cruce del 360", () => {
  assert.equal(tipoDe(200, 290), "normal");
  assert.equal(tipoDe(20, 290), "normal");
  assert.equal(tipoDe(150, 290), "pasada");
  assert.equal(tipoDe(10, 350), "normal");
  assert.equal(tipoDe(170, 350), "pasada");
});
test("referenciaTramo: cerca del VOR, la pista; lejos, el radial del avión", () => {
  // VOR en el aeropuerto (a 0.5 NM) → la pista; sin pista, el rumbo del avión.
  // VOR a 10 NM → el radial del avión (navRadial, o por posición si no hay).
});
test("tipoDicho: normal, ruta pasada y en inglés; dos o ninguna → null", () => {
  assert.equal(tipoDicho("normal", "es"), "normal");
  assert.equal(tipoDicho("es una ruta pasada", "es"), "pasada");
  assert.equal(tipoDicho("pasado", "es"), "pasada");
  assert.equal(tipoDicho("passed route", "en"), "pasada");
  assert.equal(tipoDicho("it's behind", "en"), "pasada");
  assert.equal(tipoDicho("normal o pasada", "es"), null);
  assert.equal(tipoDicho("no sé", "es"), null);
});
```

El de `referenciaTramo` se llena con muestras del helper del archivo y un `VorElegido` en lat/lon conocidos (usa `distanciaVor`). Asserts: a 0.5 NM con `rumboPista = 290` → 290; a 0.5 NM sin pista y `rumbo = 285` → 285; a 10 NM con `navRadial = 47` → 47.

En `aeropuertoSim.test.ts`: con `AEROPUERTO_PRUEBA`, un avión parado junto a un umbral → `pistaProbable` da el `rumboV` de ese extremo menos la declinación de la muestra.

- [ ] **Step 2: Run to verify they fail**

Run: `node --experimental-strip-types --test src/features/instructor/navIfr.test.ts src/features/instructor/aeropuertoSim.test.ts`
Expected: FAIL (`tramosDe` / `pistaProbable` no existen)

- [ ] **Step 3: Implement** en `navIfr.ts` y `aeropuertoSim.ts`.
  - `generarTramo`: desfase `(tipo === "normal" ? 20 : 120) + 10 * Math.floor(azar() * 5)`, signo con otro `azar() < 0.5 ? 1 : -1` (el primer `azar()` da el signo, el segundo el desfase, para que el caso `() => 0` del test dé 290 + 20 = 310), `radial = redondear10(referencia + signo * desfase)`.
  - `tramosDe(2, true, azar)`: `azar() < 0.5` → `[pasada alejando, normal acercando]`; si no, `[normal alejando, pasada acercando]`.
  - `referenciaTramo`: distancia con `distanciaVor(m, vor)` o el DME si no hay VOR; `< CONO_NM` (2) → `rumboPista ?? m.rumbo`; si no, `m.navRadial ?? radialPorPosicion(m, vor) ?? m.rumbo`.
  - `tipoDicho`: igual que `entradaDicha`. Palabras: normal → `["normal"]`; pasada → `["pasada", "pasado", "passed", "behind"]` (con «ruta pasada», `pasada` ya la encuentra).

- [ ] **Step 4: Run to verify they pass**

Run: el mismo comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/navIfr.ts src/features/instructor/navIfr.test.ts src/features/instructor/aeropuertoSim.ts src/features/instructor/aeropuertoSim.test.ts
git commit -m "Pick IFR legs by lesson: normal intercepts or passed routes, 20-60 or 120-160 degrees off" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: El evaluador del tramo (`evaluadorInterceptacion.ts`)

**Files:**
- Modify: `src/features/instructor/evaluadorInterceptacion.ts`
- Modify: `src/features/instructor/maniobras.ts` (solo `ContextoArmado`)
- Test: `src/features/instructor/interceptacion.test.ts`

**Interfaces:**
- Consumes: Task 1 (`Tramo`, `Ejercicio`, `generarTramo`, `referenciaTramo`, `tipoDe`), `distanciaVor`, `conCono`, `CONO_NM` de `vorSim.ts`, `pasoEstacion` de `navIfr.ts`.
- Produces:
  - `ContextoArmado`: `casos` se reemplaza por `tramos?: Tramo[]`; se agrega `primero?: Ejercicio` (el ejercicio del primer tramo, dicho en tierra; vale solo con `intento === 0`).
  - `FaseInterceptacion = "esperando" | "reposicionando" | "interceptando" | "establecido" | "terminado" | "invalido"`
  - `CampoInterceptacion = "identificar" | "interceptar" | "sobrepaso" | "corto"`, códigos `identificar: "4"` (los demás no cambian).
  - `EvaluacionInterceptacion` gana: `tramo: Tramo`, `ejercicio: Ejercicio | null` (null solo en `esperando`), `estacion?: VorElegido`, `preguntar: boolean`, `dicho: TipoTramo | null | undefined`, `medirDesde: number | null`, `atraves: boolean`, `finNm: number | null`, `lado: boolean`, `minDist: number | null`.
  - `ResultadoInterceptacion` gana: `dicho: TipoTramo | null`, `dmeFin: number | null`.
  - `responderTipo(e: EvaluacionInterceptacion, dicho: TipoTramo | null): EvaluacionInterceptacion`
  - `distanciaTramo(e, m): number | null` (VOR por lat/lon, o el DME).
  - Constantes: `FIN_NM = 8`, `LIMITE_SEG = 900`, `MINUTO_SEG = 60`.

Reglas (de la spec y los rulings):
- **Armar:** `tramo = ctx.tramos?.[ctx.intento] ?? { desde: true, tipo: "normal" }`. Con `ctx.primero` y `intento === 0` → ese ejercicio. Si el tramo tiene `esperarNm` y la distancia es menor → fase `esperando` (sin ejercicio, sin pregunta). Si no, el ejercicio sale de `generarTramo(tramo, referenciaTramo(m, ctx.estacion))`.
- **De `esperando` a lo siguiente:** cuando la distancia llega a `esperarNm` → genera el ejercicio con la referencia de ese momento, `inicio = m`.
- **Al empezar el tramo:** `preguntar = true`. Fase `reposicionando` si es ruta pasada, `interceptando` si es normal. `finNm` (solo alejamiento) es `max(FIN_NM, distancia inicial + 4)`.
- **Ruta pasada:** se mide desde «al través», cuando el radial del avión queda a 80° o menos del pedido. Usa `pasoEstacion(atraves, radialAvion, radial + 180)`. En alejamiento se mide desde ese momento; en acercamiento, desde ese momento + `MINUTO_SEG`. Hasta entonces no se mide nada. En `medirDesde` se fija `signo` con esa muestra y la fase pasa a `interceptando`.
- **Dentro de `CONO_NM`** (o con DME < 2) no se mide nada; reemplaza a `sobreEstacion`. Las muestras pasan antes por `conCono(m, estacion)`.
- **Cruce, corto, ángulo y sobrepaso:** igual que hoy, contados desde `medirDesde` (el ángulo, desde `medirDesde + 20 s`). **Ya no termina a los 30 s establecido**; la fase `establecido` sigue marcando el cruce.
- **Fin del alejamiento:** distancia ≥ `finNm`.
- **Fin del acercamiento:** cuando `lado = pasoEstacion(lado, radialAvion, radial)` se vuelve true, o cuando la distancia mínima fue menor de 1.5 NM y ahora es mayor por 0.5 NM. Es la misma regla que tenía `evaluadorRuta`.
- **Límite:** `LIMITE_SEG` desde el inicio del tramo.
- **Errores al terminar:** `interceptar` si no hubo cruce; `identificar` si `dicho !== ejercicio.tipo` (`undefined` cuenta como error). La calificación sigue siendo `100 − 35·errores − 10·notas`.
- **`responderTipo`:** solo la primera vez (si `dicho` ya no es `undefined`, no cambia nada); pone `preguntar = false`.

- [ ] **Step 1: Rewrite the tests.** Las pruebas actuales terminan a los 30 s establecido: cámbialas para que terminen por distancia (el helper `base` recibe el DME que sube 0.05 NM por segundo, o termina con un tramo a 8.1 NM). Las pruebas nuevas:

```ts
test("alejamiento normal: centrado y a 8 NM termina con 100", ...);           // fuera vacío, dicho "normal", aprobado
test("alejamiento que empieza a 10 NM termina a 14, no al armarse", ...);     // finNm 14; a 10.5 sigue en curso
test("acercamiento termina al pasar el VOR", ...);                            // DME baja a 0.3 y el radial salta 180 → terminado
test("no llega al radial antes de las 8 NM → error de interceptar", ...);    // fuera.interceptar.length 1
test("dice ruta pasada en una normal → identificar NS y 65", ...);            // elementos["4"] "NS", calificacion 65
test("nunca contesta → identificar NS, el tramo termina igual", ...);         // dicho null en el resultado
test("responderTipo solo cuenta la primera respuesta", ...);
test("ruta pasada de alejamiento: nada se mide hasta el al través", ...);     // angulos vacío y sin corto antes; medirDesde = t del al través
test("ruta pasada de acercamiento: se mide desde el al través + 60 s", ...);
test("esperarNm 3: espera sin ejercicio y lo genera a las 3 NM con el radial de ese momento", ...);
test("ctx.primero en el intento 0 se usa tal cual; en el 1, no", ...);
test("dentro del cono no se mide: oscilar a 1 NM no es sobrepaso", ...);
test("15 min sin cruzar → termina con error de interceptar", ...);
```

Cada una arma con `iniciarInterceptacion` o `armarInterceptacion` y un `Ejercicio` fijo, y vuela con el helper `volar` adaptado (agregar el DME por muestra). Los asserts son los de los comentarios.

- [ ] **Step 2: Run to verify they fail**

Run: `node --experimental-strip-types --test src/features/instructor/interceptacion.test.ts`
Expected: FAIL (`responderTipo` no existe, los tramos terminan a los 30 s)

- [ ] **Step 3: Implement** las reglas de arriba en `evaluadorInterceptacion.ts` y `ContextoArmado` en `maniobras.ts`. `armarSoloInterceptacion` no cambia.

- [ ] **Step 4: Run to verify they pass**

Run: el mismo comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/evaluadorInterceptacion.ts src/features/instructor/interceptacion.test.ts src/features/instructor/maniobras.ts
git commit -m "Fly each IFR leg to 8 NM or station passage, grade the normal/passed call, measure passed routes from abeam" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Lo que dice el instructor (`textosInterceptacion.ts`)

**Files:**
- Modify: `src/features/instructor/textosInterceptacion.ts`
- Test: `src/features/instructor/interceptacion.test.ts` (las de textos van en el mismo archivo)

**Interfaces:**
- Consumes: Task 2.
- Produces:
  - `PasoInterceptacion = "espera" | "intercepta" | "respondida" | "manten" | "terminado" | "invalido"`. `intercepta` = sin contestar; `respondida` = ya contestó y no está establecido.
  - `instruccionTramo(ej: Ejercicio, vor: string | undefined, idioma: Idioma, alDespegar: boolean): string`
  - `PREGUNTA_TIPO: Record<Idioma, string>`: es «¿Interceptación normal o ruta pasada?», en "Normal intercept or passed route?"
  - `briefingRutaPasada(idioma, nivel): string[]`
  - `NOMBRE_TIPO: Record<Idioma, Record<TipoTramo, string>>`: es `{ normal: "normal", pasada: "ruta pasada" }`, en `{ normal: "normal intercept", pasada: "passed route" }`

Textos que la spec fija:
- `instruccionTramo`:
  - es: «Aléjate por el radial 310 de GDL.» / «Acércate por el radial 040 de GDL.»; con `alDespegar`, «Después del despegue, aléjate por…».
  - en: "Proceed outbound on the 310 radial of GDL." / "Proceed inbound on the 040 radial of GDL."; con `alDespegar`, "After takeoff, proceed outbound…".
  - No lleva curso del OBS ni el tipo. La orden de `intercepta` = `instruccionTramo` + la pregunta, más el consejo cerca/lejos de hoy (fuera del examen).
- Orden de `respondida`, solo en práctica:
  - Si acertó: «Correcto: ruta pasada.» / "Correct: passed route."
  - Si no: «Es ruta pasada: el 150 queda a 140°, atrás de ti.» o «Es normal: el 250 queda a 40°, adelante de ti.»; en "It's a passed route: the 150 is 140 degrees away, behind you." Los grados son `|norm180(radial − referencia)|`, redondeados.
  - En el examen: null.
- `manten`: «Barra centrada: mantenla hasta las 8 millas.» / «…hasta pasar el VOR.» (en: "…until 8 miles." / "…until you pass the VOR.").
- `espera`: «Sigue alejándote; a las 3 millas te doy el siguiente radial.» / "Keep going outbound; at 3 miles I'll give you the next radial."
- `avisoInterceptacion`: el aviso del OBS solo si `dicho !== undefined`.
- `briefingInterceptacion` (lección 1) y `briefingRutaPasada` (lección 2). Cada uno explica en 5–6 frases:
  - que es un vuelo de tramos seguidos;
  - que la instrucción no dice el tipo y el cadete lo contesta por voz;
  - la regla de los 90°, con el ejemplo de Erik (por el 290: del 200 al 020 es normal; el 150 es ruta pasada);
  - las técnicas: DC30 y CD45 en la lección 1; regla de 45° y regla de 1 minuto en la 2;
  - que el alejamiento se califica a las 8 NM y el acercamiento al pasar el VOR.
  - La última frase, como hoy: «Cuando estés listo, presiona «Listo, empiezo».».
- `explicarInterceptacion`:
  - Si falló la identificación, línea «mal»: «Dijiste normal; era ruta pasada.» / "You said normal; it was a passed route." (si no dijo nada: «No dijiste si era normal o ruta pasada.»).
  - Un resultado viejo sin `tipo` cuenta como normal y sin `dicho`, y no se califica la identificación.
- `semaforoInterceptacion` agrega `identificar`: gris mientras no contesta, verde o rojo según acierte. `interceptar` se pone con `luz(t, LIMITE_SEG)`.

- [ ] **Step 1: Write the failing tests**

```ts
test("la instrucción no dice el tipo ni el curso", () => {
  for (const idioma of ["es", "en"] as const) for (const tipo of ["normal", "pasada"] as const) {
    const s = instruccionTramo({ tipo, radial: 150, desde: true, curso: 150, referencia: 290 }, "GDL", idioma, false);
    assert.doesNotMatch(s, /normal|pasada|passed|behind|OBS/i);
  }
  assert.equal(instruccionTramo({ tipo: "normal", radial: 310, desde: true, curso: 310, referencia: 290 }, "GDL", "es", true), "Después del despegue, aléjate por el radial 310 de GDL.");
});
test("respondida mal en práctica: corrige con los grados; en examen calla", ...);
test("el aviso del OBS espera a que conteste", ...);
test("explicar: identificación fallida y resultado viejo sin tipo", ...);
test("textos en inglés sin acentos", ...); // briefings y órdenes en en: sin [áéíóúñ¿¡]
```

- [ ] **Step 2: Run to verify they fail** — `node --experimental-strip-types --test src/features/instructor/interceptacion.test.ts` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify they pass** → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/textosInterceptacion.ts src/features/instructor/interceptacion.test.ts
git commit -m "Give IFR legs as outbound/inbound instructions only, ask normal or passed route, correct it in practice" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `ruta-pasada` reemplaza a `ruta-vor`

**Files:**
- Modify: `src/features/instructor/maniobras.ts`, `src/features/instructor/lecciones.ts`, `src/features/instructor/recorrido.ts`, `src/features/instructor/repaso.ts` (`FUERA_DEL_SORTEO`), `src/features/instructor/vistasManiobra.tsx`, `src/pages/InstructorPrograma.tsx` (`MATERIAL`), `src/pages/AdminManiobras.tsx`, `package.json`
- Create: `src/features/instructor/HojaRutaPasada.tsx`
- Delete: `src/features/instructor/evaluadorRuta.ts`, `textosRuta.ts`, `HojaRuta.tsx`, `ruta.test.ts`
- Test: `src/features/instructor/maniobras.test.ts`, `src/features/instructor/lecciones.test.ts`

**Interfaces:**
- Consumes: Tasks 2–3.
- Produces:
  - `ManiobraId`: `"ruta-vor"` sale y entra `"ruta-pasada"`.
  - `defRutaPasada` usa todo el evaluador y los textos de interceptación, salvo:
    - `id: "ruta-pasada"`
    - `insignia: "maniobra-ruta-pasada-c172"`
    - `titulo`: es «Rutas pasadas C172», en "C172 passed routes"
    - `tarea`: «Práctica IFR · Rutas pasadas» / "IFR practice · Passed routes"
    - `briefing: briefingRutaPasada`
  - Las dos definiciones:
    - `celdas` agregan `celda("identificar", "Identificar", "Identify")` al principio.
    - `elementosReporte` agrega `{ codigo: "4", texto: "Identifica si es normal o ruta pasada", textoEn: "Calls normal intercept or passed route" }`.
    - El elemento 1 dice «Llega al radial antes de las 8 NM o del VOR» / "Reaches the radial before 8 NM or the VOR".
  - `lecciones.ts`:
    - `ifr(1, "Interceptación de radiales", "Radial interception", "interceptar-radial", { ejercicios: { practica: 4, examen: 2 } })`
    - `ifr(2, "Rutas pasadas", "Passed routes", "ruta-pasada", { ejercicios: { practica: 4, examen: 2 } })`
  - `lineaEjercicios`:
    - Lección 1: «Son 4 tramos seguidos de interceptaciones normales, alejándote y acercándote.» / examen «Son 2 tramos calificados, uno alejándote y otro acercándote, sin consejos.»
    - Lección 2: «Son 4 tramos seguidos de rutas pasadas, alejándote y acercándote.» / examen «Son 2 tramos calificados: uno normal y una ruta pasada, sin decirte cuál. Sin consejos.»
    - Con su inglés.
  - `recorrido.ts`: tolerancias y unidades de `"ruta-pasada"` iguales a las de `"interceptar-radial"`, más `identificar`.
  - `AdminManiobras.tsx`: los intentos con un `maniobra` que no esté en `MANIOBRAS` se saltan al listar. Hoy `defDe` los convertiría en viraje y su `explicar` rompería.
  - `HojaRutaPasada.tsx`: hoja imprimible con las dos tarjetas de rutas pasadas de `/resumen-hsi` (regla de 1 minuto y regla de 45°) y las celdas de calificación. Sigue el estilo de `HojaInterceptacion.tsx`.

- [ ] **Step 1: Write the failing tests**:
  - `maniobras.test.ts`: `MANIOBRAS["ruta-pasada"].briefing("es")` existe, y `"ruta-vor" in MANIOBRAS` es false. Las dos definiciones tienen la celda `identificar` y el elemento con código "4".
  - `lecciones.test.ts`: las lecciones 1 y 2 tienen 4 y 2 ejercicios, con los textos de `lineaEjercicios`.
- [ ] **Step 2: Run to verify they fail** — `node --experimental-strip-types --test src/features/instructor/maniobras.test.ts src/features/instructor/lecciones.test.ts` → FAIL.
- [ ] **Step 3: Implement.** Borra los cuatro archivos y quita `ruta.test.ts` de `package.json`. Busca con `grep -rn "ruta-vor\|evaluadorRuta\|textosRuta\|HojaRuta\|EvaluacionRuta" src` y no debe quedar nada. La única excepción es `pasosHsi.ts`, que es de la tarea 6.
- [ ] **Step 4: Run to verify they pass** → PASS.
- [ ] **Step 5: Commit**

```bash
git add -A src/features/instructor/evaluadorRuta.ts src/features/instructor/textosRuta.ts src/features/instructor/HojaRuta.tsx src/features/instructor/ruta.test.ts
git add src/features/instructor/maniobras.ts src/features/instructor/maniobras.test.ts src/features/instructor/lecciones.ts src/features/instructor/lecciones.test.ts src/features/instructor/recorrido.ts src/features/instructor/repaso.ts src/features/instructor/vistasManiobra.tsx src/features/instructor/HojaRutaPasada.tsx src/pages/InstructorPrograma.tsx src/pages/AdminManiobras.tsx package.json
git commit -m "Replace IFR lesson 2 with passed routes on the shared leg evaluator" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: El programa encadena y nombra los tramos (`repaso.ts`)

**Files:**
- Modify: `src/features/instructor/repaso.ts`, `src/features/instructor/recorrido.ts` (`IntentoVuelo.entrada?: string`), `src/features/instructor/debriefingRepaso.ts`, `src/features/instructor/DebriefingMapa.tsx`
- Test: `src/features/instructor/repaso.test.ts`

**Interfaces:**
- Produces:
  - `alResultado`: en IFR con `interceptar-radial` o `ruta-pasada`, avanza siempre, igual que en el checkride.
  - `entradaDe(r): string | undefined`. Para la espera devuelve `correcta`, como hoy. Para un tramo devuelve `"${tipo}-${desde ? "alejamiento" : "acercamiento"}"`, y un resultado viejo sin `tipo` cuenta como `normal`.
  - `nombreHecha(id, variante: string | undefined, idioma)`. Para un tramo:
    - es: «Interceptación de radiales (alejamiento)», «Rutas pasadas (acercamiento)».
    - Si en la lección 2 sale un tramo normal en el examen: «Interceptación normal (acercamiento)».
    - en: "Radial interception (outbound)", "Passed routes (inbound)", "Normal intercept (inbound)".
    - La regla: base = `nombreManiobra(id)`, salvo cuando `tipo` no corresponde a la lección; entre paréntesis va el sentido.

- [ ] **Step 1: Write the failing tests** en `repaso.test.ts`:
  - Un tramo reprobado en práctica de la lección 1 avanza `actual` (y no dice `repetir`).
  - `nombreHecha("ruta-pasada", "pasada-acercamiento", "es") === "Rutas pasadas (acercamiento)"`.
  - `nombreHecha("ruta-pasada", "normal-acercamiento", "en") === "Normal intercept (inbound)"`.
  - `entradaDe` de un resultado viejo sin `tipo` da `"normal-alejamiento"`.
- [ ] **Step 2: Run to verify they fail** — `node --experimental-strip-types --test src/features/instructor/repaso.test.ts` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `node --experimental-strip-types --test src/features/instructor/repaso.test.ts src/features/instructor/recorrido.test.ts src/features/instructor/debriefingRepaso.test.ts` → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/repaso.ts src/features/instructor/repaso.test.ts src/features/instructor/recorrido.ts src/features/instructor/debriefingRepaso.ts src/features/instructor/DebriefingMapa.tsx
git commit -m "Chain IFR legs without repeating and name each one by direction in the debrief" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: La guía del HSI con las 4 tarjetas (`pasosHsi.ts`)

**Files:**
- Modify: `src/features/instructor/pasosHsi.ts`
- Test: `src/features/instructor/pasosHsi.test.ts`

**Interfaces:**
- Consumes: Task 2 (`dicho`, `medirDesde`, `atraves`, `ejercicio.referencia`).
- Produces:
  - `pasosInterceptacion(e, m, idioma)` devuelve null en el examen, en `esperando`, si el tramo no es válido o mientras `dicho === undefined`. Ya contestado, muestra **la tarjeta correcta** aunque haya dicho otra.
  - La flecha del HSI: `ejercicio.referencia` (en un resultado viejo, `inicio.navRadial`).
  - `pasosHsiDe`: `"interceptar-radial"` y `"ruta-pasada"` van a `pasosInterceptacion`; se borran `pasosRuta` y su rama.
  - Tarjeta **ruta pasada de alejamiento**, con los números del ejercicio. Es la tarjeta de `/resumen-hsi`:
    1. «Mariposa y CRS al 150 (radial y rumbo coinciden).» Se tacha con el CRS.
    2. «Vira al 150.» Se tacha con el rumbo a 15°.
    3. «Al través (cambia la flechita), mariposa a 45° del lado de la estación: 105.» Se tacha con `atraves`.
    4. «Vira al 105.» Se tacha con el rumbo.
    5. «CDI vivo: vira al lado contrario de la estación, al 150.» Se tacha con el cruce o al terminar.
    - El lado de los 45°: hacia la estación, o sea el lado del CDI. Se calcula como `curso + 45·s`, donde `s = −sign(norm180(radialAvion − radial))` al través.
  - Tarjeta **ruta pasada de acercamiento** (regla de 1 minuto):
    1. «Mariposa al 150 (radial solicitado).»
    2. «CRS al 330 (rumbo contrario).»
    3. «Vira al 150.»
    4. «Al través (cambia la flechita), cronómetro 1 minuto.» Se tacha con `atraves`.
    5. «Pasado el minuto, vira 90° hacia el lado del CDI: 060.» Se tacha con `medirDesde` alcanzado y el rumbo. El rumbo es `radial + 90·s`, con la misma `s` de la otra tarjeta (radial 150, al través en el R-240 → 060).
    6. «CDI vivo: vira hacia la estación, al 330.»

- [ ] **Step 1: Write the failing tests**:
  - Sin contestar → null.
  - Normal contestada mal («pasada») → se ve DC30/CD45, no la tarjeta de ruta pasada.
  - Pasada de alejamiento con referencia 290 y radial 150 → los textos llevan 150 y el rumbo de 45° correcto; el paso 3 se tacha al poner `atraves`.
  - Pasada de acercamiento → el paso 5 lleva el rumbo de 90° correcto.
  - El examen → null.
  - Borra las pruebas de `pasosRuta`.
- [ ] **Step 2: Run to verify they fail** — `node --experimental-strip-types --test src/features/instructor/pasosHsi.test.ts` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify they pass** → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/pasosHsi.ts src/features/instructor/pasosHsi.test.ts
git commit -m "Show Alvaro's passed-route cards in the HSI guide, only after the cadet calls the leg" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: La página (`InstructorRepaso.tsx`) y reanudar

**Files:**
- Modify: `src/pages/InstructorRepaso.tsx`, `src/features/instructor/reanudar.ts`
- Test: `src/features/instructor/reanudar.test.ts`

**Interfaces:**
- Consumes: Tasks 1–6. Usa `tramosDe`, `generarTramo`, `referenciaTramo`, `pistaProbable`, `instruccionTramo`, `PREGUNTA_TIPO`, `tipoDicho`, `responderTipo` y `NOMBRE_TIPO`.
- Produces:
  - `casosRef` → `tramosRef: Tramo[] | undefined`. Se llena en `empezar()` para práctica y examen, con `tramosDe(leccion.numero, modo === "checkride")`, cuando la maniobra es `interceptar-radial` o `ruta-pasada`.
  - `primeroRef: Ejercicio | null` reemplaza el uso de `rutaPrimera` para estas lecciones, y `esperaUsada` pasa a llamarse `primeraUsada` (vale para las dos).
  - **Al cerrar «Antes del despegue»** en estas lecciones:
    - Genera `primeroRef = generarTramo(tramos[0], referenciaTramo(m, e.vor, pista))`, donde `pista = aeroRef.current ? pistaProbable(m, aeroRef.current) : undefined`.
    - Pasa `extra = instruccionTramo(primero, e.vor.ident, idioma, true)` a `instruirEnRampa`.
  - `contexto()` pasa `tramos: tramosRef.current` y `primero` (solo si no se usó).
  - La pregunta generaliza el efecto de la espera:
    - `preguntar = (def.id === "espera" || esTramo) && !!ev?.preguntar`.
    - Con `esTramo`, se pregunta `PREGUNTA_TIPO`, se interpreta con `tipoDicho` y se responde con `ajustar((e) => responderTipo(e, d))`.
    - Si no se entiende, quedan dos botones, «Normal» y «Ruta pasada» («Normal intercept» / "Passed route"), igual que los de las entradas de la espera.
    - Después de contestar se muestra «Dijiste: ruta pasada ✓», como `t.entradaDicha`.
  - `reanudar.ts`: `paraReanudar` / `leerReanudable` guardan `tramos` y `primero`. Una lección guardada antes de este cambio, sin esos campos, se lee igual: quedan `undefined` y `null`.

- [ ] **Step 1: Write the failing test** en `reanudar.test.ts`: un guardado con `tramos` y `primero` se recupera igual, y uno viejo sin ellos se lee sin error.
- [ ] **Step 2: Run to verify it fails** — `node --experimental-strip-types --test src/features/instructor/reanudar.test.ts` → FAIL.
- [ ] **Step 3: Implement** `reanudar.ts` y la página.
- [ ] **Step 4: Verify**
  - Run: `node --experimental-strip-types --test src/features/instructor/reanudar.test.ts` → PASS
  - Run: `npx tsc -b --noEmit` → sin errores (es la primera vez que todo compila junto)
  - Run: `npm.cmd test` → todo pasa
- [ ] **Step 5: Commit**

```bash
git add src/pages/InstructorRepaso.tsx src/features/instructor/reanudar.ts src/features/instructor/reanudar.test.ts
git commit -m "Announce the first IFR leg on the ground, ask normal or passed route by voice, keep the legs on reload" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Teoría y hojas

**Files:**
- Modify: `src/data/teoriaIfr.ts` (temas `interceptacion` y `rutas`), `src/features/instructor/HojaInterceptacion.tsx`, `src/features/instructor/HojasInstructor.tsx` (si lista la hoja vieja), `src/pages/TeoriaIfr.tsx` (si nombra la lección 2)
- Test: `src/data/teoriaIfr.test.ts`

**Interfaces:**
- Consumes: Task 4 (`HojaRutaPasada`).
- Produces:
  - Tema `interceptacion`, con estas secciones:
    - la regla de los 90° (normal contra ruta pasada), con el ejemplo de Erik (por el 290: del 200 al 020 es normal, el 150 es ruta pasada);
    - DC30;
    - CD45;
    - el vuelo encadenado (8 NM / VOR, la pregunta por voz).
  - Tema `rutas`: el título pasa a «Rutas pasadas» / "Passed routes". Lleva las dos tarjetas (regla de 1 minuto y regla de 45°) y cuándo se usa cada una. Sale lo de TO/FROM sobre la estación.
  - `HojaInterceptacion.tsx`: sin «5 casos»; describe los 4 tramos y la identificación.

- [ ] **Step 1: Write the failing test** en `teoriaIfr.test.ts`:
  - el título de `rutas` es «Rutas pasadas»;
  - `interceptacion` menciona «90°» y «ruta pasada»;
  - el inglés no tiene `[áéíóúñ¿¡]`;
  - ningún texto usa las palabras prohibidas.
- [ ] **Step 2: Run to verify it fails** — `node --experimental-strip-types --test src/data/teoriaIfr.test.ts` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Verify**
  - `node --experimental-strip-types --test src/data/teoriaIfr.test.ts` → PASS
  - `npx tsc -b --noEmit` → limpio
  - `npm.cmd test` → todo pasa
  - En el navegador del panel (dev server), estas páginas cargan sin errores en consola:
    - `/instructor/ifr/1`
    - `/instructor/ifr/2`
    - la teoría de las dos lecciones
    - `/instructor/hojas`
  - Nunca presionar «Empezar» si el MSFS de Erik está conectado.
- [ ] **Step 5: Commit**

```bash
git add src/data/teoriaIfr.ts src/data/teoriaIfr.test.ts src/features/instructor/HojaInterceptacion.tsx src/features/instructor/HojasInstructor.tsx src/pages/TeoriaIfr.tsx
git commit -m "Rewrite IFR theory and printable sheets for normal intercepts and passed routes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Al terminar

Revisión de toda la rama y después preguntar a Erik «¿La subo?». Él vuela las dos lecciones en MSFS antes o después de subir, como prefiera.
