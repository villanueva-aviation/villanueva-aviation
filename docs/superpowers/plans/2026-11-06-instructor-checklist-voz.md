# Checklist por voz del C172 — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El cadete lee en voz alta el checklist del C172 mientras lo hace (lectura y acción al mismo tiempo), y el programa sigue los puntos en orden. Anota los saltados y revisa en el simulador que cada punto visible sí se hizo. Es el paso 2 del programa de 14 lecciones y se prueba en `/admin/vuelo`.

**Architecture:**
- **El lector C# v1.5** agrega seis variables: aviónica master, selector de combustible, válvula de corte, bomba auxiliar, piloto automático y trim de elevador.
- **En el sitio** hay tres módulos puros:
  - `revisionSim.ts` decide si un punto se ve hecho en las muestras.
  - `checklistVozC172.ts` tiene los 80 puntos que aprobó Erik.
  - `checklistVoz.ts` es la máquina de estados: oye el texto, avanza en la sección y resuelve las revisiones con cada muestra, igual que `fasesVuelo.ts`.
- **Un hook** escucha el micrófono sin botón y se calla mientras habla el instructor.
- **`/admin/vuelo`** muestra el checklist en vivo. Tiene una caja de texto para probar sin micrófono.

**Tech Stack:** C# (csc, .NET Framework, SimConnect managed de SimHub), TypeScript, React 19, Web Speech API (`useSpeechRecognition`), `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-06-instructor-programa-lecciones-design.md`, «Checklist por voz» y «Orden de construcción → 2».
- Los 80 puntos son los que Erik revisó en https://claude.ai/artifact/BkbPgAcDhD8P7g11s9DqTq (v2). La fuente está en el scratchpad, en `checklist-voz-c172/index.html`.
- Este plan cubre solo el C172. El C152 y el Arrow usan la misma forma de datos y van en un plan corto aparte, después de que Erik revise sus puntos. *(Decisión de Claude: así cada avión tiene su revisión, como pidió Erik con el C172.)*
- El push-to-talk (lo que se dice con el botón va a torre, no al checklist) va en el paso 3, junto con torre.
- Abrir secciones solas por la fase del vuelo y calificar en el debriefing va en el paso 4. Por ahora el cadete abre cada sección con «checklist <sección>».

## Global Constraints

- El repositorio es público. No van llaves, tokens ni URLs privadas. Nunca hacer commit de `simhub-sixpack/` ni de `g1000-prueba/`.
- `git add` solo de archivos con nombre, nunca `git add .`.
- Commits desde PowerShell: `git commit -q -m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.
- No se sube nada sin que Erik diga «Sí, súbelo».
- El lector sigue en `127.0.0.1:8766` con `GET /muestra?desde=`. Los campos nuevos se agregan y ninguno cambia de nombre.
- Los textos del checklist van en español, tal como los aprobó Erik. Inglés después, cuando haya demanda. La página es solo del fundador.
- No se usa la marca «Garmin», ni «certificado», «CFI», «licencia» o «curso oficial».
- MSFS 2020.
  - Compilar con `python -I tools/instructor-lector/build.py`. La compilación reescribe `public/downloads/villanueva-instructor-lector.zip`: hay que hacer `git restore` del zip, salvo en la Tarea 6.
  - La autoprueba es `tools/instructor-lector/out/VillanuevaInstructorLector.exe --probar`.
- Checks: `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build`. El aviso de tamaño de chunk ya existía.
- Las pruebas no pueden importar `.tsx`. Todo `*.test.ts` nuevo se agrega al script `"test"` de `package.json`.
- Para ediciones de C#, usar la herramienta Edit (PowerShell bloquea los `//` en here-strings).

## Review Focus

1. **Una frase mal oída que coincide con un punto lejano** no marca como saltada media sección. Solo se buscan los 3 puntos siguientes. Lo prueba la Tarea 4, «una frase de un punto lejano no salta nada».
2. **El cadete repite el punto que acaba de decir** («freno puesto» dos veces). No se cuenta doble ni se salta el siguiente. Lo prueba la Tarea 4, «repetir el punto anterior no cambia nada».
3. **Dos puntos en una sola frase** («master encendido, beacon encendido»), porque el reconocimiento corta por pausas y no por punto. Los dos cuentan. Lo prueba la Tarea 4, «dos puntos en una frase cuentan los dos».
4. **Con el lector v1.4**, sin los campos v1.5, los 15 puntos v1.5 cuentan como dichos por voz y no como «no hecho». Lo prueba la Tarea 4, «sin datos v1.5 el punto queda dicho».
5. **«Checklist completo» con revisiones pendientes** (el último punto se dijo hace 2 s). Las revisiones terminan después de cerrar, y el aviso del instructor espera a que terminen. Lo prueba la Tarea 4, «el aviso espera a las revisiones pendientes».

---

### Task 1: Lector v1.5 — seis variables del checklist

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs`:
  - clase `Muestra` (líneas 20–70);
  - `Probar()` (cerca de la línea 230);
  - la lista de variables (después de la línea 811);
  - `Vuelo.SizeConst`;
  - el armado de `Muestra` (cerca de la línea 846);
  - el texto de versión que imprime al arrancar, si lo hay.
- Modify: `src/features/instructor/evaluador.ts` (interfaz `Muestra` y una función nueva).
- Test: `src/features/instructor/evaluador.test.ts`.

**Interfaces:**
- Produces:
  - Campos JSON nuevos: `avionica: bool`, `selector: number`, `valvula: bool`, `bomba: bool`, `autopiloto: bool` y `trim: number`.
  - En TS, `Muestra` agrega `avionica?: boolean; selector?: number; valvula?: boolean; bomba?: boolean; autopiloto?: boolean; trim?: number`.
  - `export const lectorViejoChecklist = (m: Muestra) => m.avionica === undefined;`

- [ ] **Step 1: Prueba en TS.** En `evaluador.test.ts` agregar la prueba `"lectorViejoChecklist distingue v1.4 de v1.5"`:
  - `lectorViejoChecklist({...base, lat: 1})` es `true`;
  - `lectorViejoChecklist({...base, lat: 1, avionica: false})` es `false`.

  `base` es cualquier muestra completa del archivo.
- [ ] **Step 2:** `npm.cmd test`. Expected: FAIL, `lectorViejoChecklist` no existe.
- [ ] **Step 3: Implementar en `evaluador.ts`.**
  - Agregar los campos con el comentario `// Desde el lector v1.5, para el checklist. selector: 0 cerrado, 1 ambos, 2 izq, 3 der. trim: −100…100 (%).`
  - Agregar `lectorViejoChecklist` con su JSDoc: «Un lector anterior a v1.5 no manda aviónica ni combustible: esos puntos del checklist solo se oyen.»
- [ ] **Step 4:** `npm.cmd test`. Expected: PASS.
- [ ] **Step 5: Implementar en C#.**
  - Campos `public double Selector, Trim; public bool Avionica, Valvula, Bomba, Autopiloto;` con el comentario `// v1.5, para el checklist por voz.`
  - En `Json()`, antes de `titulo`, agregar `,"avionica":`, `,"selector":`, `,"valvula":`, `,"bomba":`, `,"autopiloto":` y `,"trim":`.
  - Variables `x[40]..x[45]`, en este orden:

    | x | Variable | Unidad |
    |---|---|---|
    | 40 | `AVIONICS MASTER SWITCH` | bool |
    | 41 | `FUEL TANK SELECTOR:1` | number |
    | 42 | `GENERAL ENG FUEL VALVE:1` | bool |
    | 43 | `GENERAL ENG FUEL PUMP SWITCH:1` | bool |
    | 44 | `AUTOPILOT MASTER` | bool |
    | 45 | `ELEVATOR TRIM PCT` | percent |

  - `SizeConst = 46`.
  - `Muestra.Desde` no se toca: lee por nombre de campo.
  - En `Probar()`, una línea `Json v1.5: OK/FALLA` que arme `new Muestra { Avionica = true, Selector = 1, Trim = 12.5 }` y busque `"avionica":true`, `"selector":1` y `"trim":12.5`.
  - Si hay un texto de versión «1.4», cambiarlo a «1.5».
- [ ] **Step 6:** `python -I tools/instructor-lector/build.py`, luego `tools/instructor-lector/out/VillanuevaInstructorLector.exe --probar`. Expected: todas las líneas en OK, incluida `Json v1.5: OK`. Después, `git restore public/downloads/villanueva-instructor-lector.zip`.
- [ ] **Step 7: Commit.**
  - `git add tools/instructor-lector/LectorInstructor.cs src/features/instructor/evaluador.ts src/features/instructor/evaluador.test.ts`
  - `git commit -q -m "Reader v1.5: avionics, fuel selector, valve, pump, autopilot and trim"`

---

### Task 2: Revisión en el simulador

**Files:**
- Create: `src/features/instructor/revisionSim.ts`
- Test: `src/features/instructor/revisionSim.test.ts`, que se agrega a `package.json` `"test"`.

**Interfaces:**
- Consumes: `Muestra` (Tarea 1).
- Produces:

```ts
export type Revision =
  | "freno" | "acelerador-cuarto" | "mezcla-corte" | "mezcla-rica" | "mezcla-aeropuerto" | "mezcla-empobrecida"
  | "master-on" | "master-off" | "beacon-on" | "nav-on" | "taxi-on" | "aterrizaje-on" | "aterrizaje-off"
  | "strobe-on" | "strobe-off" | "arranque-motor" | "corte-motor" | "magnetos" | "magnetos-off"
  | "flaps-arriba" | "flaps-despegue" | "altimetro" | "rpm-1800" | "ralenti" | "xpdr-alt"
  | "vel-ascenso" | "potencia-crucero" | "vel-aproximacion"
  // v1.5
  | "avionica-on" | "avionica-off" | "selector-ambos" | "selector-tanque" | "valvula-abierta"
  | "bomba-on" | "bomba-off" | "autopiloto-off" | "trim-despegue";
export const ES_V15: ReadonlySet<Revision>; // las 9 de v1.5
export type ContextoRevision = { elevacionFt: number | null };
export type Revisado = { ok: boolean; detalle?: string };
/** Segundos antes y después de oír el punto en que se busca. Por defecto {antes: 0, despues: 10}. */
export function ventana(r: Revision): { antes: number; despues: number };
/** null si las muestras no traen el campo (lector viejo): el punto queda solo por voz. */
export function revisar(r: Revision, muestras: Muestra[], ctx: ContextoRevision): Revisado | null;
```

**Reglas.** La mayoría de los puntos son de estado: `ok` si alguna muestra de la ventana cumple. Son estos:

| Revisión | Cumple si |
|---|---|
| `freno` | `freno` |
| `acelerador-cuarto` | acelerador de 5 a 20 |
| `mezcla-corte` | mezcla < 5 |
| `mezcla-rica` | mezcla > 80 |
| `mezcla-empobrecida` | mezcla < 95 |
| `mezcla-aeropuerto` | si elev ≥ 3,000 ft, mezcla < 95; si no, mezcla > 80 |
| `master-on` / `master-off` | `master` / `!master` |
| `beacon-on` | `luzBeacon` |
| `nav-on` | `luzNav` |
| `taxi-on` | `luzTaxi` |
| `aterrizaje-on` / `aterrizaje-off` | `luzAterrizaje` / su contrario |
| `strobe-on` / `strobe-off` | `luzStrobe` / su contrario |
| `arranque-motor` | `motor` |
| `corte-motor` | mezcla < 5 y `!motor` |
| `magnetos-off` | `!magIzq && !magDer` |
| `flaps-arriba` | flaps 0 |
| `flaps-despegue` | flaps 0 o 1 |
| `altimetro` | \|altimetro − qnh\| ≤ 0.02 |
| `rpm-1800` | rpm de 1,700 a 1,900 |
| `ralenti` | acelerador < 5 y rpm ≤ 1,050 |
| `xpdr-alt` | xpdrModo 4 |
| `vel-ascenso` | en el aire, velocidad de 65 a 85 |
| `potencia-crucero` | rpm de 2,100 a 2,700 |
| `vel-aproximacion` | con flaps > 0, de 60 a 70; sin flaps, de 65 a 75 |
| `avionica-on` / `avionica-off` | `avionica` / su contrario |
| `selector-ambos` | selector 1 |
| `selector-tanque` | selector 2 o 3 |
| `valvula-abierta` | `valvula` |
| `bomba-on` / `bomba-off` | `bomba` / su contrario |
| `autopiloto-off` | `!autopiloto` |
| `trim-despegue` | trim dentro de `TRIM_DESPEGUE` |

- `TRIM_DESPEGUE = { min: -5, max: 25 }`. Lleva el comentario `// ponytail: provisional, se calibra con la marca de despegue en MSFS (Tarea 6)`.
- La elevación es `ctx.elevacionFt ?? (altitud − agl)` de la primera muestra.

**Ventanas:**
- `arranque-motor`: `{0, 30}`.
- `magnetos`: `{15, 30}`.
- Las demás: `{0, 10}`.

**`magnetos`** es la única revisión de evento:
- Necesita ver al menos una muestra con solo el izquierdo y otra con solo el derecho, y después una con los dos encendidos.
- La base es la rpm de la última muestra con los dos encendidos antes del primer magneto solo.
- La caída de cada lado es la base menos la rpm mínima con ese magneto solo.
- `ok` si cada caída es ≤ 150 y la diferencia entre las dos es ≤ 50.
- Si se vieron los dos lados pero falla un límite, regresa `ok: false` con `detalle` del tipo «caída izq 180 RPM, der 90 RPM».

**`null`:** cuando el campo que usa la regla viene `undefined` en la última muestra, o cuando no hay muestras.

- [ ] **Step 1: Pruebas.** Una muestra base con `mezcla: 100, master: true, ...` y un helper `con(cambios)` para variarla. Las pruebas se nombran así, con estos valores:
  - `"acelerador un cuarto: 12 cumple, 25 no"`.
  - `"mezcla del aeropuerto: a 5,016 ft pide empobrecida"`: con `elevacionFt: 5016`, mezcla 90 es ok y mezcla 100 no.
  - `"mezcla del aeropuerto: a 20 ft pide rica"`: con `elevacionFt: 20`, mezcla 90 es ok y mezcla 70 no.
  - `"altimetro a 0.02 del QNH cumple, a 0.05 no"`.
  - `"ralenti: 1,000 rpm con acelerador cerrado cumple, 1,100 no"`.
  - `"velocidad de aproximacion depende de los flaps"`: 68 kt con flaps 2 es ok; 62 kt sin flaps no.
  - `"magnetos: caidas de 100 y 120 cumplen"`. La secuencia de rpm es ambos 1800 → izq 1700 → ambos 1800 → der 1680 → ambos 1800.
  - `"magnetos: caida de 180 no cumple y dice cuanto"`: `ok` es false y `detalle` incluye «180».
  - `"magnetos: sin ver el derecho no cumple"`.
  - `"sin el campo v1.5 regresa null"`: `revisar("avionica-on", [base sin avionica], ctx)` da `null`.
  - `"ES_V15 tiene 9 revisiones"`.
  - `"ventana del arranque es 30 s"`.
- [ ] **Step 2:** `npm.cmd test`. Expected: FAIL, el módulo no existe.
- [ ] **Step 3: Implementar `revisionSim.ts`** con la tabla de arriba. La lógica va en un `Record<Revision, (m: Muestra, ctx) => boolean | undefined>` para las de estado (`undefined` = sin dato), más la función aparte de `magnetos`.
- [ ] **Step 4:** `npm.cmd test`. Expected: PASS. Después, `npx tsc -b --noEmit` sin errores.
- [ ] **Step 5: Commit.**
  - `git add src/features/instructor/revisionSim.ts src/features/instructor/revisionSim.test.ts package.json`
  - `git commit -q -m "Check checklist items against the simulator"`

---

### Task 3: Los 80 puntos del C172

**Files:**
- Create: `src/data/checklistVozC172.ts`
- Test: `src/features/instructor/checklistVoz.test.ts`. Se crea aquí con las pruebas de datos y se agrega a `package.json` `"test"`.

**Interfaces:**
- Consumes: `Revision` (Tarea 2).
- Produces:

```ts
export type SeccionId = "antes-arrancar" | "arranque" | "antes-rodar" | "prueba-motor" | "antes-despegar"
  | "despues-despegar" | "crucero" | "descenso" | "antes-aterrizar" | "despues-aterrizar" | "apagado";
export type PuntoVoz = { id: string; dicho: string; claves: string[]; revisa?: Revision; nota?: string };
export type SeccionVoz = { id: SeccionId; titulo: string; claves: string[]; puntos: PuntoVoz[] };
export const CHECKLIST_VOZ_C172: SeccionVoz[];
```

**Formato de los datos:**
- `id` es `${seccion}-${n}`, con `n` desde 1. Lo arma un helper local.
- `claves` son frases sin acentos. Basta una para reconocer el punto. No hace falta la respuesta.
- `dicho` y `nota` se copian tal cual de la tabla.

**Claves de cada sección** (se oyen después de «checklist»):

| Sección | Claves |
|---|---|
| antes-arrancar | antes de arrancar, antes del arranque |
| arranque | arranque, arrancar motor |
| antes-rodar | antes de rodar, antes del rodaje |
| prueba-motor | prueba de motor, prueba de motores, run up, runup |
| antes-despegar | antes de despegar, antes del despegue |
| despues-despegar | despues de despegar, despues del despegue |
| crucero | crucero |
| descenso | descenso |
| antes-aterrizar | antes de aterrizar, antes del aterrizaje |
| despues-aterrizar | despues de aterrizar, despues del aterrizaje |
| apagado | apagado, apagar motor |

**Puntos.** El formato de cada renglón es dicho | claves | revisa | nota. Los grupos de claves que se repiten:
- `FLAPS` = flaps, flap
- `LUZ_ATT` = aterrizaje, landing
- `LUZ_TAXI` = rodaje, taxi
- `STROBE` = estroboscopicas, estroboscopica, strobes, strobe
- `AP` = piloto automatico, autopiloto

**Antes de arrancar**
1. Asientos y cinturones — ajustados y asegurados | asientos, cinturones | — | —
2. Freno de estacionamiento — puesto | freno | freno | —
3. Breakers — adentro | breakers, breaker | — | —
4. Equipo eléctrico — apagado | electrico | — | —
5. Aviónica master — apagado | avionica master, avionica | avionica-off | —
6. Selector de combustible — ambos | selector | selector-ambos | —
7. Válvula de corte de combustible — abierta | valvula | valvula-abierta | —

**Arranque**
1. Acelerador — abierto un cuarto de pulgada | acelerador | acelerador-cuarto | —
2. Mezcla — corte | mezcla | mezcla-corte | —
3. Área de la hélice — despejada | helice | — | El cadete puede decir «¡libre hélice!»
4. Master — encendido | master | master-on | —
5. Luz anticolisión — encendida | anticolision, beacon | beacon-on | —
6. Bomba de combustible auxiliar — encendida | bomba | bomba-on | —
7. Mezcla — rica de 3 a 5 segundos, luego corte | mezcla, cebar, cebado | — | —
8. Bomba de combustible auxiliar — apagada | bomba | bomba-off | —
9. Llave de encendido — arranque | llave, magnetos | arranque-motor | —
10. Mezcla — rica | mezcla | mezcla-rica | —
11. Presión de aceite — verificada | aceite | — | —
12. Luces de navegación — encendidas | navegacion, nav | nav-on | —
13. Aviónica master — encendido | avionica master, avionica | avionica-on | —
14. Flaps — arriba | FLAPS | flaps-arriba | —

**Antes de rodar**
1. Frenos — probados | frenos, freno | — | Se dice al empezar a moverse.
2. Luz de rodaje — encendida | LUZ_TAXI | taxi-on | —
3. Instrumentos de vuelo — verificados en los virajes | instrumentos | — | —

**Prueba de motor**
1. Freno de estacionamiento — puesto | freno | freno | —
2. Puertas — cerradas y aseguradas | puertas, puerta | — | —
3. Controles de vuelo — libres y correctos | controles | — | —
4. Instrumentos de vuelo — verificados | instrumentos | — | —
5. Altímetro — ajustado | altimetro | altimetro | —
6. Combustible — cantidad verificada | cantidad de combustible, cantidad | — | —
7. Selector de combustible — ambos | selector | selector-ambos | —
8. Mezcla — ajustada | mezcla | mezcla-aeropuerto | Se saca la mezcla hasta que quede balanceada con el aire.
9. Acelerador — 1,800 RPM | acelerador, 1800 | rpm-1800 | —
10. Magnetos — probados | magnetos, magneto | magnetos | —
11. Amperímetro — revisado | amperimetro | — | —
12. Panel de anunciadores — sin luces | anunciadores, anunciador | — | —
13. Ralentí — verificado, 1,000 RPM o menos | ralenti | ralenti | —
14. Fricción del acelerador — ajustada | friccion | — | —

**Antes de despegar**
1. Radios y aviónica — configurados | radios, radio, avionica | — | En las lecciones con torre se revisa que COM1 esté en la frecuencia de torre.
2. Trim eléctrico — configurado | trim electrico | — | —
3. Piloto automático — apagado | AP | autopiloto-off | —
4. Trim de elevador — despegue | trim | trim-despegue | —
5. Flaps — 0 a 10 grados | FLAPS | flaps-despegue | —
6. Transponder — ALT | transponder, transpondedor | xpdr-alt | —
7. Luz de aterrizaje — encendida | LUZ_ATT | aterrizaje-on | —
8. Luces estroboscópicas — encendidas | STROBE | strobe-on | —
9. Briefing de despegue — repasado | briefing | — | Qué hacer si falla el motor.

**Después de despegar**
1. Velocidad de ascenso — 70 a 80 nudos | velocidad, ascenso | vel-ascenso | —
2. Flaps — arriba | FLAPS | flaps-arriba | —
3. Mezcla — ajustada | mezcla | mezcla-aeropuerto | —

**Crucero**
1. Potencia — 2,100 a 2,700 RPM | potencia | potencia-crucero | —
2. Trim — ajustado | trim | — | —
3. Mezcla — empobrecida | mezcla | mezcla-empobrecida | —
4. Vigilancia de tránsito — constante | vigilancia, transito | — | —

**Descenso**
1. Mezcla — ajustada | mezcla | — | —
2. Altímetro — ajustado | altimetro | altimetro | —
3. Selector de combustible — ambos | selector | selector-ambos | —
4. Flaps — según se necesite | FLAPS | — | —

**Antes de aterrizar**
1. Cinturones — asegurados | cinturones, cinturon | — | —
2. Selector de combustible — ambos | selector | selector-ambos | —
3. Mezcla — ajustada | mezcla | mezcla-aeropuerto | —
4. Luz de aterrizaje — encendida | LUZ_ATT | aterrizaje-on | —
5. Luz de rodaje — encendida | LUZ_TAXI | taxi-on | —
6. Piloto automático — apagado | AP | autopiloto-off | —
7. Velocidad — 65 a 75 nudos, o 60 a 70 con flaps | velocidad | vel-aproximacion | —
8. Aproximación — estabilizada | aproximacion | — | —

**Después de aterrizar**
1. Flaps — arriba | FLAPS | flaps-arriba | —
2. Luz de aterrizaje — apagada | LUZ_ATT | aterrizaje-off | —
3. Luces estroboscópicas — apagadas | STROBE | strobe-off | —

**Apagado**
1. Freno de estacionamiento — puesto | freno | freno | —
2. Equipo eléctrico — apagado | electrico | — | —
3. Piloto automático — apagado | AP | autopiloto-off | —
4. Aviónica master — apagado | avionica master, avionica | avionica-off | —
5. Mezcla — corte | mezcla | corte-motor | —
6. Llave de encendido — apagada | llave, magnetos | magnetos-off | —
7. Master — apagado | master | master-off | —
8. Seguro de control — instalado | seguro | — | —
9. Selector de combustible — izquierdo o derecho | selector | selector-tanque | —
10. Bitácora — anotada | bitacora | — | —
11. Avión asegurado — calzos y amarres | calzos, amarres, avion asegurado | — | —

- [ ] **Step 1: Pruebas de datos** en `checklistVoz.test.ts`:
  - `"el C172 tiene 80 puntos en 11 secciones"`.
  - `"37 se revisan hoy, 15 con v1.5 y 28 solo por voz"`. Las cuenta con `revisa`, `ES_V15.has(revisa)` o sin `revisa`.
  - `"los ids no se repiten"`.
  - `"cada punto y cada seccion tiene claves sin acentos"`. Cada clave cumple `/^[a-z0-9 ]+$/`.
- [ ] **Step 2:** `npm.cmd test`. Expected: FAIL, el módulo no existe.
- [ ] **Step 3:** Escribir `checklistVozC172.ts` con la tabla de arriba.
- [ ] **Step 4:** `npm.cmd test`. Expected: PASS.
- [ ] **Step 5: Commit.**
  - `git add src/data/checklistVozC172.ts src/features/instructor/checklistVoz.test.ts package.json`
  - `git commit -q -m "C172 voice checklist: the 80 items Erik reviewed"`

---

### Task 4: Seguir el checklist por voz

**Files:**
- Create: `src/features/instructor/checklistVoz.ts`
- Test: `src/features/instructor/checklistVoz.test.ts`, que ya existe desde la Tarea 3.

**Interfaces:**
- Consumes:
  - `normalizar(texto, idioma)` de `preguntas.ts`;
  - `revisar`, `ventana` y `ContextoRevision` (Tarea 2);
  - `SeccionVoz`, `SeccionId` y `CHECKLIST_VOZ_C172` (Tarea 3);
  - `Muestra`.
- Produces:

```ts
export type EstadoPunto = "pendiente" | "revisando" | "hecho" | "dicho" | "no-hecho" | "saltado";
export type Punto = { estado: EstadoPunto; t?: number; detalle?: string };
export interface Checklist {
  secciones: SeccionVoz[];
  abierta: SeccionId | null;
  siguiente: number;                      // índice en la sección abierta
  puntos: Record<SeccionId, Punto[]>;
  leidas: SeccionId[];                    // abiertas alguna vez
  muestras: Muestra[];                    // últimos BUFFER_SEG
}
export const ADELANTE = 3;     // puntos que se buscan desde el siguiente
export const BUFFER_SEG = 60;
export function crearChecklist(secciones: SeccionVoz[]): Checklist;
/** t: reloj del lector (la última muestra), para que las ventanas cuadren. */
export function oir(cl: Checklist, texto: string, t: number): Checklist;
export function avanzarChecklist(cl: Checklist, m: Muestra, ctx: ContextoRevision): Checklist;
/** Lo que dice el instructor al cerrar la sección; null mientras siga abierta o tenga puntos revisando. */
export function avisoSeccion(cl: Checklist, id: SeccionId): string | null;
export function resumenChecklist(cl: Checklist): { enOrden: number; saltados: string[]; noHechos: string[]; noLeidas: string[] };
```

**Cómo trabaja `oir`.** El texto se normaliza con `normalizar(texto, "es")` y se rellena con espacios. Una clave «está» si aparece como palabras completas (` ${clave} `).

1. **Comando.** Si el texto tiene «checklist» o «check list»:
   - Si además dice «completo», «completa» o «terminado», cierra la sección abierta y sus puntos pendientes quedan `saltado`.
   - Si no, busca la sección cuya clave sea la más larga de las que aparecen, para que «antes del arranque» gane a «arranque».
   - Si encuentra una sección:
     - cierra la abierta igual que con «completo»;
     - abre la nueva y la agrega a `leidas`;
     - si la nueva ya se había leído, sus puntos vuelven a `pendiente`;
     - el resto del texto, después de la clave, se procesa como puntos.
2. **Puntos.** Con una sección abierta:
   - Repite: entre los puntos `siguiente … siguiente + ADELANTE − 1`, toma el primero que tenga una clave después de la posición actual del texto. Si aparecen varias claves de ese punto, se consume la más larga: así «aviónica master apagado» no deja «master» para el punto Master, cuatro más adelante en Apagado.
   - Los anteriores a ese quedan `saltado`.
   - El encontrado queda `revisando` con `t` si tiene `revisa`, o `dicho` si no.
   - Se avanza la posición del texto y `siguiente`. Se detiene cuando no hay coincidencia.
   - Al pasar el último punto, la sección se cierra (`abierta = null`).
3. Sin sección abierta y sin comando, no hace nada.

**Cómo trabaja `avanzarChecklist`:**
- Agrega `m` al buffer y quita lo de más de `BUFFER_SEG`.
- Para cada punto `revisando` de cualquier sección:
  - toma las muestras con `t` entre `p.t − antes` y `p.t + despues`;
  - llama a `revisar`;
  - si da `null`, el punto queda `dicho`;
  - si da `ok`, queda `hecho`;
  - si `m.t > p.t + despues`, queda `no-hecho` con el `detalle`;
  - si nada de eso, sigue `revisando`.

**El aviso.** El reto de un punto es su `dicho` antes de « — ».
- Sin faltas: `${titulo}: completo.`
- Con faltas: `${titulo}. Te faltó: ${retos saltados}. No vi hecho: ${retos no hechos}.`, omitiendo la parte vacía.

**El resumen:**
- `enOrden` cuenta los puntos `hecho` y `dicho`.
- `saltados` y `noHechos` se escriben `${titulo}: ${reto}`, con el detalle entre paréntesis si lo hay.
- `noLeidas` son los títulos de las secciones que no están en `leidas`.

- [ ] **Step 1: Pruebas.**
  - Helper `abrirAA = oir(crearChecklist(CHECKLIST_VOZ_C172), "checklist antes de arrancar", 0)`.
  - Helper de muestra `con(cambios)`, como en la Tarea 2.
  - Pruebas:
    - `"checklist antes de arrancar abre la seccion"`: `abierta === "antes-arrancar"` y `siguiente === 0`.
    - `"checklist antes del arranque no abre arranque"`.
    - `"cada punto dicho tal cual se reconoce como el siguiente"`: recorre las 11 secciones. Abre cada una y dice cada `dicho` en orden. Ninguno queda `saltado`, y la sección termina cerrada.
    - `"saltarse un punto lo anota"`: tras abrir, `"breakers adentro"` deja el punto 1 (asientos) y el 2 (freno) `saltado`, y el 3 `dicho`.
    - `"una frase de un punto lejano no salta nada"`: tras abrir, `"bitacora anotada"` no cambia `siguiente`. También `"valvula abierta"` (punto 7) con `siguiente` 0 no cambia nada.
    - `"repetir el punto anterior no cambia nada"`: `"freno puesto"` dos veces seguidas. La segunda no cambia `siguiente` ni marca saltados.
    - `"dos puntos en una frase cuentan los dos"`: en arranque, después de acelerador, mezcla y hélice, `"master encendido beacon encendido"` deja los dos `revisando`.
    - `"freno dicho y puesto queda hecho"`: `"freno puesto"` en t=0 y luego `avanzarChecklist` con `con({freno: true, t: 1})` da `hecho`.
    - `"freno dicho y no puesto a los 10 s queda no hecho"`: muestras con `freno: false` hasta t=11.
    - `"sin datos v1.5 el punto queda dicho"`: «aviónica master apagado» con muestras sin `avionica`.
    - `"checklist completo cierra y anota los pendientes"`.
    - `"el aviso espera a las revisiones pendientes"`: `"master encendido"` y en seguida `"checklist completo"`. `avisoSeccion` es `null` hasta que llega una muestra con `master: true`, y después regresa un texto que incluye «Te faltó».
    - `"resumen cuenta las secciones no leidas"`: con solo antes de arrancar leída, `noLeidas` tiene 10.
- [ ] **Step 2:** `npm.cmd test`. Expected: FAIL, el módulo no existe.
- [ ] **Step 3:** Implementar `checklistVoz.ts` como se describe arriba. Todas las funciones regresan un objeto nuevo y no mutan el que reciben, igual que `avanzarVuelo`.
- [ ] **Step 4:** `npm.cmd test`. Expected: PASS. Si la prueba «cada punto dicho tal cual» falla por claves ambiguas, se corrigen las claves de los datos, no el algoritmo, y se anota como `Ruling`.
- [ ] **Step 5:** `npx tsc -b --noEmit` sin errores.
- [ ] **Step 6: Commit.**
  - `git add src/features/instructor/checklistVoz.ts src/features/instructor/checklistVoz.test.ts`
  - `git commit -q -m "Follow the voice checklist in order and check it in the sim"`

---

### Task 5: Escuchar sin botón y probar en /admin/vuelo

**Files:**
- Create: `src/features/instructor/useChecklistVoz.ts`
- Modify: `src/pages/AdminVuelo.tsx`

**Interfaces:**
- Consumes:
  - `useSpeechRecognition("es-MX")` (de `src/features/academia/`);
  - `useVoz("es", () => null)`;
  - `crearChecklist`, `oir`, `avanzarChecklist`, `avisoSeccion` y `resumenChecklist` (Tarea 4);
  - `lectorViejoChecklist` (Tarea 1).
- Produces: `useChecklistVoz(activo: boolean, voz: ReturnType<typeof useVoz>, alOir: (texto: string) => void): { escuchando: boolean; supported: boolean; error: string | null; decir: (texto: string) => void }`

**El hook.** `useSpeechRecognition` corta en cada pausa (`continuous = false`), así que el hook vuelve a arrancarlo:
- Cuando `listening` pasa de true a false, entrega el `transcript` si no está vacío. Primero se entrega, porque `start()` lo borra.
- Si `activo`, la voz no habla y no hay pausa, llama a `start()` otra vez. `no-speech` solo reinicia.
- Con `not-allowed` deja de intentar y pone `error` con el texto de `mic.error`.
- `decir(texto)`:
  - pone la pausa, llama a `mic.stop()` y a `voz.decir(texto, "aviso")`;
  - quita la pausa cuando `voz.hablando` pasa de true a false;
  - si la voz está apagada (`!voz.activa`), la quita en seguida. Es el mismo patrón `hablo` de `useEscucha`.

**La página.** Debajo de «Eventos», una sección «Checklist por voz»:
- Un botón «Escuchar checklist» / «Dejar de escuchar» para `activo`, y una insignia «Escuchando» mientras el mic está abierto.
- Una caja de texto con el botón «Decir», para probar sin micrófono. Pasa el texto por el mismo `alOir`.
- `alOir(texto)` hace `clRef.current = oir(clRef.current, texto, muestra?.t ?? 0)` y muestra «Oí: …».
- En el callback de `useLector`, por cada muestra: `clRef.current = avanzarChecklist(clRef.current, m, { elevacionFt: evRef.current?.aeropuerto?.elevacionFt ?? null })`.
- Después de cada cambio, por cada sección con `avisoSeccion` no nulo que no se haya dicho, llama a `decir(aviso)` una vez. Lleva la cuenta en un `Set` en un ref, y la sección sale del `Set` cuando se vuelve a abrir.
- Muestra las 11 secciones. La abierta va resaltada y cada punto lleva su estado:
  - `hecho` en verde;
  - `dicho` en blanco;
  - `revisando` en dorado;
  - `no-hecho` y `saltado` en rojo, con el detalle.
  - Al final va el resumen de `resumenChecklist`.
- Si la última muestra cumple `lectorViejoChecklist`, aviso: «Lector v1.4: 15 puntos se revisan solo por voz. Baja el v1.5 de Descargas.»
- «Empezar de nuevo» también hace `crearChecklist(CHECKLIST_VOZ_C172)`.
- En «Última muestra» agrega el renglón «Aviónica / combustible» con `avionica`, `selector`, `valvula`, `bomba`, `autopiloto` y `trim`.
- Cambia la descripción del `PageHero` a «Prueba del lector v1.5: fases del vuelo y checklist por voz del C172.»

- [ ] **Step 1:** Escribir el hook y la sección de la página. Son `.tsx` y hooks, así que no llevan pruebas unitarias: la lógica ya está probada en la Tarea 4.
- [ ] **Step 2:** `npx tsc -b --noEmit` y `npm.cmd test`. Expected: sin errores y con todo en PASS.
- [ ] **Step 3: Verificar en el navegador.**
  - Lector reproduciendo la grabación de Erik: `tools/instructor-lector/out/VillanuevaInstructorLector.exe --reproducir <scratchpad>/vuelo-erik.jsonl --rapido 5`, en una pestaña de terminal.
  - Vite en el worktree, en el puerto 5180.
  - `preview_start` en `http://localhost:5180/admin/vuelo`.
  - Escribir en la caja: «checklist antes de arrancar», luego «asientos y cinturones ajustados», luego «freno puesto».
  - Expected:
    - la sección queda abierta con los dos puntos marcados;
    - el aviso v1.4 aparece, porque la grabación es v1.4;
    - no hay errores en la consola.
  - Tomar una captura.
- [ ] **Step 4:** `npm.cmd run build`. Expected: OK.
- [ ] **Step 5: Commit.**
  - `git add src/features/instructor/useChecklistVoz.ts src/pages/AdminVuelo.tsx`
  - `git commit -q -m "Founder page: listen to the checklist hands-free"`

---

### Task 6: Publicar el lector v1.5 y probarlo en vivo con Erik

**Files:**
- Modify:
  - `src/data/descargas.ts`: el lector pasa a «v1.5». Es CRLF, así que se edita con Edit.
  - `tools/instructor-lector/LEEME.txt`: una línea de qué trae la v1.5, y los comandos con `.\VillanuevaInstructorLector.exe`, como necesitó Erik en PowerShell.
  - `public/downloads/villanueva-instructor-lector.zip`: se reconstruye.
  - `src/features/instructor/revisionSim.ts`, si hay calibración.
  - `src/features/instructor/revisionSim.test.ts`, si cambia `TRIM_DESPEGUE`.

- [ ] **Step 1:** Editar `descargas.ts` y `LEEME.txt`, luego `python -I tools/instructor-lector/build.py` y `--probar`. Expected: todo OK. Esta vez el zip sí se queda.
- [ ] **Step 2: Commit.**
  - `git add src/data/descargas.ts tools/instructor-lector/LEEME.txt public/downloads/villanueva-instructor-lector.zip`
  - `git commit -q -m "Publish reader v1.5 in Downloads"`
- [ ] **Step 3: Prueba en vivo.** Erik abre el lector nuevo desde `tools/instructor-lector/out/` con MSFS en el C172, y luego `/admin/vuelo`. Mueve cada control y lee lo que muestra «Aviónica / combustible»:
  - interruptor de aviónica;
  - selector en AMBOS, IZQ y DER;
  - válvula de corte;
  - bomba auxiliar;
  - piloto automático;
  - el trim en la marca de despegue.

  Expected: cada valor cambia con su control. El selector da 1 en AMBOS, y 2 y 3 en IZQ y DER.
  - Si una variable no se mueve, se busca el nombre correcto (Tarea 1, Step 5) y se recompila.
  - Si no hay nombre que funcione, ese punto pasa a solo voz (se quita su `revisa` y se ajusta la prueba de conteos). Se anota como `Ruling`.
- [ ] **Step 4: Calibrar el trim.**
  - `TRIM_DESPEGUE` queda en el valor leído en la marca de despegue ±10, con el valor a la vista en el comentario.
  - La prueba de la Tarea 2 se ajusta a esos números.
  - `npm.cmd test`. Expected: PASS.
  - Commit: `git commit -q -m "Calibrate the takeoff trim range from MSFS"`.
- [ ] **Step 5: Prueba de voz.**
  - Erik pulsa «Escuchar checklist» y lee en voz alta, haciendo cada punto, desde antes de arrancar hasta la prueba de motor.
  - Expected:
    - los puntos se marcan en orden;
    - los visibles quedan en verde;
    - el instructor da el aviso al cerrar cada sección;
    - el micrófono no se oye a sí mismo.
  - Las frases que no se reconozcan se agregan como claves y se anotan como `Ruling`. Se vuelve a correr `npm.cmd test` y se hace commit.
- [ ] **Step 6:** Pedir a Erik «Sí, súbelo» antes del push. Luego `git fetch -q origin main; git merge-base --is-ancestor origin/main HEAD; if ($?) { git push -q origin HEAD:main }`.
