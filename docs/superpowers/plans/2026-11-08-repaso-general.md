# Repaso general (lección 13) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El cadete escoge «Repaso general» en el menú de 14 lecciones y vuela una lección completa en el C172: checklist por voz en tierra, despegue, salida a la zona de trabajo, 4 maniobras sorteadas, regreso, aterrizaje y apagado en rampa. Al final recibe un debriefing por fases y la lección queda guardada.

**Architecture:**
- **Lógica pura nueva:** sorteo, zona, medición de despegue y aterrizaje, máquina de estados del repaso y debriefing, en archivos `.ts` con pruebas.
- **Lo que ya existe se reusa:** `fasesVuelo.ts` (fases de rampa a rampa), `checklistVoz.ts` + `useChecklistVoz.ts` (checklist por voz) y `maniobras.ts` + `useIntento.ts` (armado, calificación y guardado de cada maniobra).
- **Página propia:** la lección vive en su ruta, `/instructor/repaso`, para no crecer `InstructorPrograma.tsx` (28 KB) ni tener dos lectores leyendo a la vez.
- **Guardado sin migración:** la lección se guarda como un renglón más de `intentos_maniobra` con `maniobra = "repaso-general"` y el mismo `sesion_id` que sus maniobras.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind v4, Supabase. Pruebas con `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-06-instructor-programa-lecciones-design.md` (secciones «Repaso general», «Calificación del vuelo completo», «Salida, zona y regreso», «Modo y repeticiones», «Datos»).

## Cambios al spec (decisiones de Claude, 2026-11-08)

- **Sin torre ni radio.** Erik canceló la torre por voz el 2026-11-08. Se va del debriefing la parte «Comunicaciones» y se van de la regla de aprobado los «errores de seguridad», que todos venían de la torre (autorizaciones, pista asignada). El instructor dice a dónde ir y el cadete vuela.
- **Sin tabla nueva.** La lección se guarda en `intentos_maniobra` (ver Arquitectura). Así no hay migración que correr, `/admin/maniobras` ya agrupa por `sesion_id` y el historial y las insignias no cambian. Ceiling: no hay un lugar propio para las 14 lecciones. Si más adelante hace falta, se hace la tabla.
- **Sin preguntas orales** en el repaso: el micrófono es del checklist.
- **Solo C172.** El paso 5 lleva las maniobras a los tres aviones.

## Global Constraints

- **Palabras prohibidas.** Nunca usar «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial» ni «examen de la AFAC». Tampoco «con IA», ni la marca o el nombre de la escuela.
- **Inglés sin acentos.** Ningún texto en inglés de la interfaz ni de la voz puede contener `/[áéíóúñ¿¡]/`.
- **Lector.** Sigue igual: 127.0.0.1:8766 por `useLector`. Un lector anterior al v1.4 anula la lección con el motivo que ya trae `armarVuelo`.
- **Avión.** Solo el C172 (`esC172`). El motivo lo da `armarVuelo`.
- **Zona de trabajo.**
  - MMGL: Cajititlán (rumbo 180°, 5 NM del ARP 20.5218, −103.3111) o Chapala (157.5°, 15 NM), escogida al azar.
  - Cualquier otro aeropuerto: 10 NM al rumbo de la pista más larga + 90°.
  - En la zona se está dentro de 3 NM del centro (Chapala: 5 NM) y a 1,500 ft AGL o más (`ALTURA_SEGURA_AGL`).
- **Velocidades del C172S** (POH, Erik las revisa antes de publicar): Vr 55 KIAS, Vy 74 KIAS, aproximación 65 KIAS.
- **Tolerancias ACS:** despegue −5/+10 kt sobre Vr y sobre Vy. Final +10/−5 kt sobre la de aproximación.
- **Sorteo.** 4 maniobras de `MANIOBRAS` (hoy viraje-escarpado, recto-nivelado y vuelo-lento). Cada disponible sale al menos una vez y nunca la misma dos veces seguidas.
- **Práctica:** se puede repetir una maniobra no aprobada o pasar a la siguiente. **Checkride:** un intento calificado por maniobra. En los dos modos un intento anulado nunca cuenta y se vuelve a armar solo, como hoy.
- **Aprobado del checkride:** las 4 maniobras aprobadas y ningún punto del checklist saltado. En práctica no hay aprobado.
- **Archivos.** Cada archivo de prueba nuevo se agrega al script `"test"` de `package.json`.
- **Commits** con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Solo `git add` de archivos específicos.

## Review Focus

1. **Aterriza antes de terminar las 4 maniobras.** La lección pasa a regreso y luego a terminado. El debriefing dice qué maniobras no se volaron, y el checkride no se aprueba. *(Prueba en Task 4.)*
2. **MSFS se cierra o el avión «salta»:** más de 2 NM entre dos muestras seguidas. La lección se anula con un motivo claro y no se guarda nada de ella; las maniobras ya guardadas se quedan. *(Task 4.)*
3. **Sale de la zona a media lección.** La siguiente maniobra no se arma hasta que vuelve, y el instructor lo dice una sola vez. *(Task 4.)*
4. **El lector no manda aeropuerto todavía.** La lección espera en rampa con el aviso «Esperando el aeropuerto del simulador», sin romperse. *(Tasks 2 y 4.)*
5. **Textos en inglés con caracteres del español:** el inglés no lleva acentos. *(Tasks 1, 4 y 5.)*

---

### Task 1: Las 14 lecciones

**Files:**
- Create: `src/features/instructor/lecciones.ts`
- Test: `src/features/instructor/lecciones.test.ts`

**Interfaces:**
- Produces:
  - `type LeccionId = number` (1–14)
  - `interface Leccion { numero: number; nombre: Record<Idioma, string>; disponible: boolean }`
  - `const LECCIONES: Leccion[]`
  - `const REPASO = 13`
  - `const ACCESO_REPASO: "fundador" | "exclusivo" | "todos"` (ver la pregunta a Erik al final; por defecto `"fundador"`)
  - `estadoLeccion(l: Leccion, acceso: { fundador: boolean; exclusivo: boolean }): "abierta" | "candado" | "proximamente"`

- [ ] **Step 1: Write the failing test**

```ts
test("14 lecciones en el orden de la escuela y solo el repaso disponible", () => {
  assert.equal(LECCIONES.length, 14);
  assert.deepEqual(LECCIONES.map((l) => l.numero), [1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
  assert.equal(LECCIONES[12].nombre.es, "Repaso general");
  assert.equal(LECCIONES[12].nombre.en, "General review");
  assert.deepEqual(LECCIONES.filter((l) => l.disponible).map((l) => l.numero), [REPASO]);
  for (const l of LECCIONES) assert.doesNotMatch(l.nombre.en, /[áéíóúñ¿¡]/);
});
test("acceso al repaso", () => {
  const r = LECCIONES[12];
  assert.equal(estadoLeccion(LECCIONES[0], { fundador: true, exclusivo: true }), "proximamente");
  assert.equal(estadoLeccion(r, { fundador: true, exclusivo: false }), "abierta");
  // con ACCESO_REPASO = "fundador":
  assert.equal(estadoLeccion(r, { fundador: false, exclusivo: true }), "candado");
});
```

Los nombres en español salen del spec, tal cual: 1 Familiarización · 2 y 3 Vuelo recto y nivelado · 4 Virajes a rumbos · 5 Ascensos y descensos · 6 Virajes ascendiendo y descendiendo · 7 Vuelo lento · 8 «S» sobre un camino · 9 «8» primera fase · 10 «8» segunda fase · 11 y 12 Práctica de emergencia · 13 Repaso general · 14 Toques y despegues. Los nombres en inglés los escribe el implementador, sin acentos.

- [ ] **Step 2:** Agrega `lecciones.test.ts` al script de prueba. `npm.cmd test` debe FALLAR (no existe `lecciones.ts`).
- [ ] **Step 3:** Implementa `lecciones.ts`.
- [ ] **Step 4:** `npm.cmd test` debe PASAR.
- [ ] **Step 5:** Commit: `Add the 14-lesson list with the general review available`.

### Task 2: Sorteo y zona de trabajo

**Files:**
- Create: `src/features/instructor/repaso.ts`
- Test: `src/features/instructor/repaso.test.ts`

**Interfaces:**
- Consumes:
  - `ManiobraId` y `MANIOBRAS` de `maniobras.ts`
  - `Aeropuerto` de `aeropuertoSim.ts`
  - `aNm` de `../home/navGeo.ts`
  - `ALTURA_SEGURA_AGL` de `virajeEscarpado.ts`
- Produces:
  - `sortear(disponibles: ManiobraId[], n = 4, azar = Math.random): ManiobraId[]`
  - `interface Zona { nombre: Record<Idioma, string>; lat: number; lon: number; radioNm: number }`
  - `zonaRepaso(a: Aeropuerto | null, azar = Math.random): Zona | null`. Usa el ICAO de `a`: MMGL da Cajititlán o Chapala. Otro aeropuerto da 10 NM al rumbo de la pista más larga + 90°, con `nombre` = «la zona a 10 millas al rumbo 290» o «the area 10 miles out on heading 290». `null` sin aeropuerto.
  - `enZona(m: Muestra, z: Zona): boolean`, que pide además `m.agl >= ALTURA_SEGURA_AGL`.

- [ ] **Step 1: Write the failing tests**

```ts
test("sorteo: 4, todas las disponibles al menos una vez, nunca dos seguidas iguales", () => {
  for (let k = 0; k < 200; k++) {
    const s = sortear(["viraje-escarpado", "recto-nivelado", "vuelo-lento"]);
    assert.equal(s.length, 4);
    assert.equal(new Set(s).size, 3);
    for (let i = 1; i < 4; i++) assert.notEqual(s[i], s[i - 1]);
  }
  assert.deepEqual(sortear(["recto-nivelado"], 2, () => 0), ["recto-nivelado", "recto-nivelado"]); // con una sola no hay de otra
});
test("zona en MMGL: Cajititlán o Chapala; otro aeropuerto: 10 NM al través de la pista más larga; sin aeropuerto, null", () => {
  const mmgl = { ...AEROPUERTO_PRUEBA, icao: "MMGL" };
  assert.equal(zonaRepaso(mmgl, () => 0)?.nombre.es, "Cajititlán");
  assert.equal(zonaRepaso(mmgl, () => 0.99)?.radioNm, 5); // Chapala
  const otro = zonaRepaso({ ...AEROPUERTO_PRUEBA, icao: "MMXX" }, () => 0)!;
  // distancia al ARP ≈ 10 NM
  assert.equal(zonaRepaso(null), null);
});
test("en la zona: dentro del radio y a 1,500 ft AGL o más", () => { /* dentro y alto: true; dentro y 1,200 AGL: false; 4 NM fuera de Cajititlán: false */ });
```

- [ ] **Step 2:** Agrega el archivo al script de prueba. Debe FALLAR.
- [ ] **Step 3:** Implementa las tres funciones. El sorteo baraja todas las disponibles y rellena con al azar hasta `n`, sin repetir la anterior.
- [ ] **Step 4:** Debe PASAR.
- [ ] **Step 5:** Commit: `General review: draw the maneuvers and pick the practice area`.

### Task 3: Medición del despegue y del aterrizaje

**Files:**
- Create: `src/features/instructor/tomas.ts`
- Test: `src/features/instructor/tomas.test.ts`

**Interfaces:**
- Produces:
  - `const VEL_C172 = { vr: 55, vy: 74, aprox: 65 }` (POH C172S, Erik las revisa)
  - `interface Tomas { rotacionKt: number | null; vy: { suma: number; n: number }; final: { min: number; max: number; n: number }; tocoEnPista: boolean | null }`
  - `crearTomas(): Tomas`
  - `medirTomas(t: Tomas, previo: Muestra | null, m: Muestra, fase: FaseVuelo, regreso: boolean): Tomas`. Reglas:
    - **Rotación:** `velocidad` en la primera muestra en el aire con `fase === "carrera-despegue"`.
    - **Vy:** el promedio de `velocidad` mientras `fase === "vuelo"`, `vs > 0` y `agl` entre 200 y 1000, solo antes de la primera vez que el avión pasa 1000 AGL.
    - **Final:** `velocidad` con `regreso === true`, `fase === "vuelo"`, `agl` entre 50 y 500 y `vs < 0`.
  - `calificarTomas(t: Tomas, v = VEL_C172): { despegue: { rotacion: boolean | null; vy: boolean | null }; aterrizaje: { final: boolean | null; enPista: boolean | null } }`. `null` = no se midió. La rotación vale en `[vr−5, vr+10]`, la Vy con el promedio en `[vy−5, vy+10]`, y el final si `min >= aprox−5 && max <= aprox+10`. `tocoEnPista` lo pone la página con el `pista` del evento `aterrizaje` de `fasesVuelo` (`!== null`).

- [ ] **Step 1: Write the failing tests** con muestras sintéticas:
  - Rotación a 57 kt: `rotacion: true`.
  - Rotación a 45 kt: `false`.
  - Ascenso a 72–78 kt entre 200 y 1000 AGL: `vy: true`.
  - Ascenso a 90 kt: `false`.
  - Final entre 63 y 72 kt: `final: true`.
  - Final con un cuadro a 78 kt: `false`.
  - Sin ascenso medido: `vy: null`.
- [ ] **Step 2:** Agrega el archivo al script de prueba. Debe FALLAR.
- [ ] **Step 3:** Implementa.
- [ ] **Step 4:** Debe PASAR.
- [ ] **Step 5:** Commit: `Measure rotation, Vy climb and final approach speed for the C172`.

### Task 4: La lección como máquina de estados

**Files:**
- Modify: `src/features/instructor/repaso.ts`
- Test: `src/features/instructor/repaso.test.ts`

**Interfaces:**
- Consumes:
  - Task 2 y Task 3
  - `armarVuelo` / `avanzarVuelo` / `EvaluacionVuelo` de `fasesVuelo.ts`
  - `Modo` de `sesion.ts`
  - `ResultadoComun` de `maniobras.ts`
- Produces:
  - `type EtapaRepaso = "rampa" | "salida" | "maniobra" | "fuera-de-zona" | "regreso" | "terminado" | "invalido"`
  - `interface Hecha { id: ManiobraId; resultado: ResultadoComun | null; intentoId: string | null }`
  - `interface EstadoRepaso { etapa: EtapaRepaso; modo: Modo; sorteo: ManiobraId[]; actual: number; hechas: Hecha[]; zona: Zona | null; vuelo: EvaluacionVuelo | null; tomas: Tomas; motivo?: string }`
  - `crearRepaso(modo: Modo, sorteo: ManiobraId[]): EstadoRepaso`
  - `alMuestrearRepaso(e: EstadoRepaso, m: Muestra, a: Aeropuerto | null, idioma: Idioma): { estado: EstadoRepaso; decir: string[] }`
  - `alResultado(e: EstadoRepaso, r: ResultadoComun, intentoId: string | null, idioma: Idioma): { estado: EstadoRepaso; decir: string[] }`
  - `siguienteManiobra(e: EstadoRepaso, idioma: Idioma): { estado: EstadoRepaso; decir: string[] }` (solo en práctica, para pasar una maniobra no aprobada)
  - `armaManiobra(e: EstadoRepaso): boolean` = `e.etapa === "maniobra"`
  - `maniobraActual(e: EstadoRepaso): ManiobraId | null`

**Reglas:**
- **rampa:**
  - Arma el vuelo con la primera muestra (`armarVuelo`). Si sale inválido, el estado es `invalido` con su motivo.
  - Sin aeropuerto, se queda en rampa con `motivo` «Esperando el aeropuerto del simulador» / «Waiting for the simulator's airport». Cuando llega, fija la `zona` con `zonaRepaso`.
  - Al evento `despegue` pasa a **salida** y dice: «Ve a la zona de trabajo: {zona}, a 1,500 pies sobre el terreno o más».
- **salida:** con `enZona` pasa a **maniobra** y dice «Estás en la zona. Primera maniobra: {titulo}».
- **maniobra:**
  - Si sale de la zona sin estar en una maniobra en curso, pasa a **fuera-de-zona** y dice una vez «Regresa a la zona de trabajo». Con `enZona` de nuevo, vuelve a **maniobra** sin decir nada.
  - La maniobra en curso la decide el evaluador. La página solo deja de armar la siguiente.
- **alResultado:**
  - Guarda el resultado en `hechas[actual]`.
  - En checkride, o si salió aprobado, avanza `actual`. Dice «Recto y nivelado. Siguiente maniobra: {titulo}» y, si es la segunda vez de la misma, agrega «con otro rumbo».
  - En práctica no aprobado se queda: dice «Puedes repetirla o pasar a la siguiente».
  - Después de la cuarta pasa a **regreso**: «Terminamos las maniobras. Regresa al aeropuerto y aterriza».
- **Aterrizaje antes de terminar:** el evento `aterrizaje` en cualquier etapa pasa a **regreso**. Las que faltaban quedan con `resultado: null`.
- **terminado:** cuando `vuelo.fase === "terminado"`.
- **invalido:** si `vuelo.fase === "invalido"`, o si dos muestras seguidas están a más de 2 NM («El avión se movió de golpe: la lección no se califica»).
- **Textos:** todos los dice en `idioma`, y en inglés sin acentos.

- [ ] **Step 1: Write the failing tests**, uno por regla. Usan las muestras de `fasesVuelo.test.ts` como patrón (`hasta`), con `AEROPUERTO_PRUEBA` e `icao: "MMGL"`:
  - «vuelo de principio a fin en práctica»
  - «checkride: un intento por maniobra aunque no se apruebe»
  - «práctica: no aprobada se queda hasta repetir o pasar»
  - «aterriza con 2 maniobras: regreso y las otras sin resultado» *(Review Focus 1)*
  - «salto de más de 2 NM anula» *(RF 2)*
  - «fuera de zona: no arma y avisa una vez» *(RF 3)*
  - «sin aeropuerto espera en rampa» *(RF 4)*
  - «textos en inglés sin acentos» *(RF 5)*
- [ ] **Step 2:** Debe FALLAR.
- [ ] **Step 3:** Implementa.
- [ ] **Step 4:** Debe PASAR.
- [ ] **Step 5:** Commit: `General review as a state machine: departure, area, drawn maneuvers and return`.

### Task 5: Debriefing por fases y lo que se guarda

**Files:**
- Create: `src/features/instructor/debriefingRepaso.ts`
- Test: `src/features/instructor/debriefingRepaso.test.ts`

**Interfaces:**
- Consumes:
  - Task 3 (`calificarTomas`) y Task 4 (`EstadoRepaso`)
  - `Checklist` y `resumenChecklist` de `checklistVoz.ts`
  - `MANIOBRAS` de `maniobras.ts`
- Produces:
  - `interface Parte { id: "checklist" | "despegue" | "maniobras" | "aterrizaje"; titulo: string; bien: string[]; repetir: string[] }`
  - `debriefingRepaso(e: EstadoRepaso, cl: Checklist, idioma: Idioma): { partes: Parte[]; aprobado: boolean | null }`. `aprobado` es `null` en práctica.
  - `paraGuardarRepaso(e: EstadoRepaso, cl: Checklist): { calificacion: number; aprobado: boolean; elementos: Record<string, "S" | "NS">; detalle: object }`
    - `calificacion`: el promedio redondeado de las maniobras con resultado; 0 si no hubo ninguna.
    - `aprobado`: el del checkride; `false` en práctica.
    - `elementos`: `{ checklist, despegue, maniobras, aterrizaje }`, cada uno «S» si su parte no tiene nada en `repetir`.
    - `detalle`: `{ zona, aeropuerto: icao, maniobras: hechas.map(({id, resultado, intentoId}) => ({ id, calificacion, aprobado, intentoId })), checklist: resumenChecklist(cl), tomas: calificarTomas(e.tomas) }`

- [ ] **Step 1: Write the failing tests:**
  - **Checkride aprobado:** 4 aprobadas y sin saltados da `aprobado: true`. Un punto saltado da `false`. Una maniobra no aprobada da `false`. Una sin volar da `false`.
  - **Práctica:** `aprobado: null`.
  - **Checklist:** «dichos pero no hechos» va en `repetir` y no reprueba por sí solo.
  - **Maniobras:** cada maniobra sale con su título y calificación; las no voladas dicen «No se voló» / «Not flown».
  - **Textos:** el inglés no lleva acentos.
- [ ] **Step 2:** Agrega el archivo al script de prueba. Debe FALLAR.
- [ ] **Step 3:** Implementa.
- [ ] **Step 4:** Debe PASAR.
- [ ] **Step 5:** Commit: `General review debriefing by phase and the saved summary`.

### Task 6: La página de la lección

**Files:**
- Create: `src/pages/InstructorRepaso.tsx`
- Modify:
  - `src/lib/routes.ts`: `instructorRepaso: "/instructor/repaso"` y su título.
  - `src/App.tsx`: lazy route como `InstructorPrograma`, incluida la excepción de layout donde aparece `ROUTES.instructorPrograma`.
  - `src/features/instructor/useIntento.ts`:
    - opción `alLote?: (lote: Muestra[]) => void`, que se llama dentro del callback de `useLector` después de avanzar la maniobra;
    - devuelve `aeropuerto` de `useLector`.
  - `src/pages/InstructorPrograma.tsx`: sección «Lecciones» arriba de las actividades del menú. Cada lección muestra su número y nombre. La 13 abierta es un `Link` a `ROUTES.instructorRepaso`; las demás llevan «Próximamente».

**Interfaces:**
- Consumes:
  - Tasks 1–5
  - `useIntento(def, { sesionId, modoFijo, arma, alTerminar, alLote })`
  - `useVoz`, `useChecklistVoz` y `AVIONES_VOZ.c172`
  - `crearChecklist` / `avanzarChecklist` / `oir` / `porDecir` (mismo patrón que `AdminVuelo.tsx`)
  - `guardarIntento` de `intentos.ts`
  - `HOJA` de `vistasManiobra.tsx`
- Produces: la página.

**Flujo de la pantalla:**
1. **Idioma:** sale de `localStorage["instructor-idioma"]`, como en el programa.
2. **Modo:** botones Práctica / Checkride, debajo el briefing y luego «Empezar».
   - El briefing en español: «Vuelo completo en el C172: checklist en voz alta, despegue, zona de trabajo, 4 maniobras sorteadas y regreso».
   - Al empezar: `sortear`, `crearRepaso` y `crearChecklist`, con escucha del checklist encendida.
3. **Vuelo:**
   - Muestra la etapa, la última orden dicha, el `motivo` si hay, y el checklist compacto (sección abierta y puntos con su color, como en `AdminVuelo`).
   - Durante una maniobra muestra `def.textoPaso` y `def.pasos`. Con resultado muestra la `Hoja`.
   - En práctica, si no se aprobó: «Repetir» (`reiniciar`) y «Siguiente maniobra» (`siguienteManiobra`).
   - `def` = `MANIOBRAS[maniobraActual(e)]`, o recto-nivelado cuando es null. Se arma con `arma = armaManiobra(e)`.
   - `alLote` pasa cada muestra a `alMuestrearRepaso` y a `avanzarChecklist`.
4. **Debriefing:** al llegar a `terminado` se leen y se muestran las partes, se guarda una vez con `guardarIntento` (`maniobra: "repaso-general"`, `avion: "C172"`, `sesionId`) y se muestra «Guardando… / No se pudo guardar · Reintentar».
5. **Botones finales:** «Nueva lección» y «Volver al menú» (a `ROUTES.instructorPrograma`).
6. **Inválida:** muestra el motivo, sin guardar, y «Nueva lección».

- [ ] **Step 1:** `npx tsc -b --noEmit` y `npm.cmd test` deben salir limpios. `npm.cmd run build` debe terminar (el aviso del chunk de 500 kB ya existía).
- [ ] **Step 2:** En el navegador, con el servidor de prueba en 5180, sin lector:
  - `/instructor/programa` muestra las 14 lecciones y la 13 lleva a `/instructor/repaso`;
  - el repaso dice «No encuentro el lector».
  - Leer `read_page` y la consola sin errores.
- [ ] **Step 3:** Commit: `General review lesson page with voice checklist, drawn maneuvers and debriefing`.

### Task 7: El repaso en /admin/maniobras

**Files:**
- Modify: `src/pages/AdminManiobras.tsx`, en las líneas que usan `defDe(i.maniobra)` (≈77, 98 y 148).

**Interfaces:**
- Consumes: el renglón `maniobra: "repaso-general"` con el `detalle` de Task 5.
- Produces: en la lista de sesiones, el renglón del repaso dice «Repaso general · {calificacion}/100 · {aprobado / no aprobado / práctica}» con sus maniobras. No usa la `Hoja` de maniobra ni `defDe`, que para un id desconocido devuelve el viraje.

- [ ] **Step 1:** `npx tsc -b --noEmit` debe salir limpio y `npm.cmd run build` debe terminar.
- [ ] **Step 2:** Commit: `Show general review lessons in the maneuvers admin`.

### Final

- [ ] Revisión de toda la rama: `git diff origin/main...HEAD`.
- [ ] **Prueba en vivo con Erik:** MSFS en la plataforma de MMGL, C172, lector v1.5.1, práctica primero y checkride después.
- [ ] «Sí, súbelo» de Erik antes de subir a main.
