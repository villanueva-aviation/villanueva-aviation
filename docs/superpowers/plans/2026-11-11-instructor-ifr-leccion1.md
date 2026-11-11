# Instructor IFR · Plan 1: Lección 1 (interceptación) de rampa a rampa

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer volable la Lección 1 IFR (interceptación de radiales) de rampa a rampa en cualquier aeropuerto: lector v1.6 con NAV1 y VOR cercanos, el evaluador de interceptación, el flujo de la lección con el VOR en lugar de la zona, el debriefing con el radial en el mapa, el menú IFR y la página de teoría.

**Architecture:** La interceptación es una maniobra más del registro `MANIOBRAS` (`DefManiobra`). Así reutiliza la voz, el guardado, los niveles, el debriefing y el mapa del programa VFR. `repaso.ts` gana una variante IFR: la etapa «maniobra» empieza arriba de 1,000 ft AGL con señal del VOR elegido, en lugar de al entrar a una zona. Los planes 2 y 3 agregan las lecciones 2–4 y 5–6 sobre esta base.

**Tech Stack:** React 19, Vite, TS, Tailwind v4, Supabase, Leaflet 1.9, lector C# (SimConnect, MSFS 2020), pruebas `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-11-instructor-ifr-design.md`

## Global Constraints

- **Lenguaje prohibido** en todo texto, voz y página: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA». Tampoco «Garmin» visible.
- **Inglés:** la interfaz en inglés no lleva `[áéíóúñ¿¡]`.
- **Idiomas:** ES y EN, como el programa VFR (`Idioma`, `localStorage "instructor-idioma"`).
- **Acceso:** el de `ACCESO_REPASO` (`lecciones.ts`); hoy solo el fundador.
- **NAV1 únicamente.** Un punto de la barra = 2°. Si el GPS maneja la barra, no se califica.
- **Niveles:** `Nivel` 1/2/3 de `nivel.ts`. Los exámenes se califican en `max(2, nivel elegido)`, no en 3 fijo como VFR.
- **Pruebas:** cada archivo `*.test.ts` nuevo se agrega a la lista explícita de `"test"` en `package.json`. Suite: `npm.cmd test`. Tipos: `npx tsc -b --noEmit`. Build: `npm.cmd run build`.
- **Lector:** `python -I tools/instructor-lector/build.py` compila y regenera `public/downloads/villanueva-instructor-lector.zip`. Autoprueba: `tools/instructor-lector/out/VillanuevaInstructorLector.exe --probar`.
- **Git:**
  - solo `git add` de archivos nombrados;
  - nunca commitear `en-vivo/ g1000-prueba/ guias/ poster/ propuestas/ redes/ simhub-sixpack/ supabase/.temp/ .superpowers/`;
  - commits con `-m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`;
  - no se sube a main sin que Erik lo apruebe.
- **Sentidos de espera:** `esperas.ts` es la única fuente (no aplica a este plan, pero no se crea otra).

## Cambios respecto a la spec (decididos al planear)

- **Las 5 prácticas:** la spec decía «alejándose/acercándose × lejos/cerca + radial a la espalda». Pero la distancia depende de dónde esté el avión, y obligarla haría volar al cadete a un punto antes de cada ejercicio. Los 5 casos varían el ángulo (normal, amplio, contrario) y el sentido (TO/FROM). El consejo de cerca o lejos se dice según el DME real en ese momento.
  - Si Erik quiere los 5 por distancia, se agrega una orden previa «vuela a menos de 5 millas del VOR».
- **El VOR se identifica por la frecuencia de NAV1, no por el identificador:** el identificador es un texto aparte en SimConnect. Dos VOR cercanos con la misma frecuencia son raros, y la lista ya trae la frecuencia.
- **Declinación:** sale del avión (`rumboV − rumbo`) al elegir el VOR, no del dato del VOR, cuyo signo en SimConnect no está claro. Puede desviar el dibujo del radial uno o dos grados.
- **Rutas:** `/instructor/ifr/leccion/:n` en lugar de `/instructor/ifr/:n`, para que no choque con `/instructor/ifr/teoria/:tema`.

## Review Focus

1. **NAV1 en otro VOR** a mitad del ejercicio (otra frecuencia): no debe calificar contra la estación equivocada. Prueba en Task 5: `sinSenal` con frecuencia distinta.
2. **Radiales que cruzan 360/000** (curso 350, avión en el radial 010): la desviación debe dar 20°, no 340°. Prueba en Task 3.
3. **Lector v1.5 sin campos de NAV**: la lección no truena; el ejercicio se anula con «actualiza el lector a v1.6». Prueba en Task 4.
4. **Pasar sobre la estación** (DME menor a 1 NM, la barra se va de un lado a otro, TO/FROM cambia): no cuenta como pasarse ni como quedarse corto. Prueba en Task 4.
5. **GPS manejando la barra**: aviso y no se califica. Prueba en Task 4.

---

### Task 1: Lector v1.6 — NAV1 y VOR cercanos

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs` (clase `Muestra`, `Vars`, `Vuelo.SizeConst`, `Estado`, `Probar`, `Sim.Correr`)
- Modify: `tools/instructor-lector/LEEME.txt` (línea v1.6 arriba de v1.5.1)
- Modify: `public/downloads/villanueva-instructor-lector.zip` (lo regenera `build.py`)

**Interfaces:**
- **Produces, campos nuevos en el JSON de `/muestra.muestra`:** `navMhz`, `navObs`, `navRadial`, `navDesv` (grados, `NAV RADIAL ERROR`), `navDesde` (0 apagado, 1 TO, 2 FROM), `navDme`, `navTieneDme` (bool), `navSenal` (bool: `NAV HAS NAV` y `NAV SIGNAL` > 0), `gpsNav` (bool).
- **Produces, en la raíz de `/muestra`:** `"vors":[{"ident","region","lat","lon","mhz","dme"}]`, o `[]` mientras no llega.

- [ ] **Step 1:** En `Probar()`, agrega dos casos.
  - **Json v1.6:** `new Muestra { NavMhz = 115.2, NavRadial = 270, NavDesv = -3.5, NavDesde = 2, NavDme = 12.4, NavTieneDme = true, NavSenal = true, GpsNav = false }.Json()` contiene `"navMhz":115.2`, `"navRadial":270`, `"navDesv":-3.5`, `"navDesde":2`, `"navDme":12.4`, `"navTieneDme":true`, `"navSenal":true`, `"gpsNav":false`.
  - **Vors:** `Estado(NaN)` contiene `"vors":[]`. Después de `PonerVors("[{\"ident\":\"GDL\"}]")` contiene `"vors":[{"ident":"GDL"}]`. Al final, `PonerVors("[]")`.
  - Ambos casos van al `return` combinado.
- [ ] **Step 2:** Compila y corre `--probar`. Expected: falla de compilación (no existen `NavMhz` ni `PonerVors`).
- [ ] **Step 3:** Implementa.
  - **Campos:** los de Interfaces en `Muestra` y en `Json()`.
  - **Variables nuevas en `Vars`** (x[46]..x[55]), con `SizeConst = 56`: `NAV ACTIVE FREQUENCY:1` MHz, `NAV OBS:1` degrees, `NAV RADIAL:1` degrees, `NAV RADIAL ERROR:1` degrees, `NAV TOFROM:1` enum, `NAV DME:1` nautical miles, `NAV HAS DME:1` bool, `NAV HAS NAV:1` bool, `NAV SIGNAL:1` number, `GPS DRIVES NAV1` bool.
  - **`static string vors = "[]"`** con `PonerVors(string)` bajo `Candado`. `Estado` agrega `,"vors":` + `vors`.
  - **Lista de VOR:** en `Correr`, `RequestFacilitiesList(SIMCONNECT_FACILITY_LIST_TYPE.VOR, Req.Vors)`. Usa `PedirLista` con su propia posición, así que se pide al arrancar y al moverse más de 3 NM, igual que los aeropuertos. `OnRecvVorList` junta `SIMCONNECT_DATA_FACILITY_VOR`. Al llegar la última página arma el JSON:
    - descarta los que tengan `Flags & 2` (localizador);
    - `dme` = `(Flags & 8) != 0`;
    - `mhz` = `fFrequency / 1e6`, redondeado a 2 decimales.
- [ ] **Step 4:** `python -I tools/instructor-lector/build.py` y luego `--probar`. Expected: todas las líneas en `OK`, incluidas `Json v1.6: OK` y `Vors: OK`; exit 0; zip regenerado.
- [ ] **Step 5:** `LEEME.txt`: «v1.6: lee el radio NAV1 (radial, barra, TO/FROM, DME) y los VOR cercanos para el programa IFR. Si tienes una versión anterior, cierra el lector y reemplaza la carpeta.». Commit de los tres archivos.

### Task 2: Muestra con NAV y lista de VOR en la página

**Files:**
- Modify: `src/features/instructor/evaluador.ts` (interfaz `Muestra`, más `lectorViejoNav`)
- Create: `src/features/instructor/vorSim.ts`, `src/features/instructor/vorSim.test.ts`
- Modify: `src/features/instructor/useLector.ts` (devuelve `vors`)
- Modify: `package.json` (registra la prueba)

**Interfaces:**
- **Produces:**
  - En `Muestra`, opcionales: `navMhz`, `navObs`, `navRadial`, `navDesv`, `navDesde` (0|1|2), `navDme`, `navTieneDme`, `navSenal`, `gpsNav`.
  - `lectorViejoNav(m: Muestra): boolean`, que es `m.navRadial === undefined`.
- **Produces, en `vorSim.ts`:**
  - `type VorSim = { ident: string; region: string; lat: number; lon: number; mhz: number; dme: boolean }`.
  - `type VorElegido = VorSim & { decl: number }`, donde `decl` son grados (verdadero − magnético).
  - `leerVors(crudo: unknown): VorSim[]`: ignora entradas mal formadas.
  - `vorsCercanos(vors: VorSim[], lat: number, lon: number, maxNm = 60): (VorSim & { nm: number; largo: boolean })[]`: ordenados por distancia; `largo` = `nm > 40`.
  - `declinacion(m: Muestra): number`: `norm180(m.rumboV − m.rumbo)`; 0 si falta `rumboV`.
  - `elegirVor(v: VorSim, m: Muestra): VorElegido`.
  - `useLector()` devuelve además `vors: VorSim[]`.

- [ ] **Step 1:** Prueba `vorSim.test.ts`.
  - `leerVors([{ident:"GDL",region:"MM",lat:20.52,lon:-103.31,mhz:117.5,dme:true}, {ident:3}, null])` tiene largo 1.
  - `vorsCercanos` con GDL (20.52,−103.31), TLC (19.34,−99.57) y otro a 45 NM, desde (20.52,−103.31): solo quedan GDL y el de 45 NM, en ese orden; el de 45 NM tiene `largo === true`.
  - `declinacion({ ...muestra, rumbo: 350, rumboV: 5 })` es 15. `declinacion({ ...muestra, rumbo: 10, rumboV: 5 })` es −5.
- [ ] **Step 2:** `node --experimental-strip-types --test src/features/instructor/vorSim.test.ts`. Expected: falla porque el módulo no existe.
- [ ] **Step 3:** Implementa:
  - `vorSim.ts`, con `aNm` de `../home/navGeo.ts`;
  - los campos de `Muestra`;
  - en `useLector`, `vors` guardado como `aeropuerto`: compara el JSON crudo para no volver a renderizar;
  - el registro en `package.json`.
- [ ] **Step 4:** El mismo comando. Expected: pasa. Luego `npx tsc -b --noEmit`, limpio.
- [ ] **Step 5:** Commit.

### Task 3: Geometría y ejercicios de interceptación (puro)

**Files:**
- Create: `src/features/instructor/navIfr.ts`, `src/features/instructor/navIfr.test.ts`
- Modify: `src/features/instructor/nivel.ts` (`tolInterceptacion`)
- Modify: `package.json`

**Interfaces:**
- **Produces, en `navIfr.ts`:**
  - `norm180(g: number): number`.
  - `type Ejercicio = { caso: CasoInterceptacion; radial: number; desde: boolean; curso: number }`. `curso` es lo que va en el OBS: `radial` si `desde`, `radial+180` si es TO.
  - `type CasoInterceptacion = "alejandose" | "acercandose" | "alejandose-amplio" | "acercandose-amplio" | "contrario"`.
  - `CASOS_PRACTICA: CasoInterceptacion[]`, en ese orden.
  - `desvioGrados(ej: Ejercicio, radialAvion: number): number`. Signo: positivo si el avión está a la derecha del curso mirando en la dirección del curso. Usa `norm180`.
  - `puntos(grados: number): number`, que es `grados / 2`.
  - `generarEjercicio(caso: CasoInterceptacion, radialAvion: number, dme: number, rumbo: number, azar?: () => number): Ejercicio`.
  - `casosExamen(azar?): [CasoInterceptacion, CasoInterceptacion]`: uno de `alejandose|alejandose-amplio` y uno de `acercandose|acercandose-amplio`.
  - `distanciaConsejo(dme: number): "cerca" | "lejos" | null`: `< 5` cerca, `> 15` lejos.
- **Produces, en `nivel.ts`:** `tolInterceptacion(n: Nivel) => ({ sobrepasoPuntos: por(n, 1.5, 1, 0.5), cortoSeg: por(n, 60, 30, 20), establecidoPuntos: por(n, 2, 1, 0.5), anguloMin: 20, anguloMax: 40 })`.
- **Cómo se genera un ejercicio:**
  - **Diferencia Δ** (desplazamiento del radial elegido respecto al radial del avión): `asin(min(1, 2.5/dme))` en grados, limitada a 15..60. En los casos `-amplio`, +30 con tope de 90.
  - **Radial:** `round10(radialAvion ± Δ)`; el signo con `azar() < 0.5`.
  - **Caso `contrario`:** usa `radial = round10(radialAvion + 20)`. Elige TO o FROM, el que deje `|norm180(curso − rumbo)| > 90`.

- [ ] **Step 1:** Pruebas.
  - `desvioGrados({…, radial:350, desde:true, curso:350}, 10)` es −20 o 20 (absoluto 20; el signo fijo según la convención). Con `curso:170, desde:false` (TO sobre el radial 350) da el signo contrario.
  - `puntos(-3)` es −1.5.
  - Para cada caso de `CASOS_PRACTICA` con radial 90, dme 10 y rumbo 90:
    - `curso` es múltiplo de 10;
    - `desde === (curso === radial)`;
    - en `contrario`, `|norm180(curso − 90)| > 90`.
  - Con dme 2, Δ es 60. Con dme 20, Δ es 15.
  - `casosExamen(() => 0.1)` trae un caso de alejamiento y uno de acercamiento.
  - `distanciaConsejo(3)` es "cerca", `(20)` es "lejos", `(10)` es null.
  - `tolInterceptacion(2).sobrepasoPuntos` es 1.
- [ ] **Step 2:** Corre el archivo. Expected: falla porque el módulo no existe.
- [ ] **Step 3:** Implementa.
- [ ] **Step 4:** Corre el archivo. Expected: pasa.
- [ ] **Step 5:** Commit.

### Task 4: La maniobra «interceptar-radial»

**Files:**
- Create: `src/features/instructor/evaluadorInterceptacion.ts`, `src/features/instructor/textosInterceptacion.ts`, `src/features/instructor/interceptacion.test.ts`, `src/features/instructor/HojaInterceptacion.tsx`
- Modify: `src/features/instructor/maniobras.ts` (`ManiobraId`, `DefManiobra.armar` con contexto, `nivelExamen`, registro)
- Modify: `src/features/instructor/useIntento.ts` (contexto de armado, nivel del examen)
- Modify: los `Record<ManiobraId, …>` que `tsc` marque (`vistasManiobra.tsx` HOJA, `recorrido.ts` TOLERANCIAS, etc.)
- Modify: `package.json`

**Interfaces:**
- **Consumes:** Task 3 completo; `Muestra.nav*` y `lectorViejoNav` de Task 2.
- **Produces, en `maniobras.ts`:**
  - `ManiobraId` gana `"interceptar-radial"`.
  - `interface ContextoArmado { intento: number; examen: boolean; casos?: CasoInterceptacion[] }`.
  - `DefManiobra.armar(m, nivel?, ctx?: ContextoArmado)`.
  - `DefManiobra.nivelExamen?(elegido: Nivel): Nivel`. Si falta, el nivel del examen es 3, como hoy.
- **Produces, en `useIntento.ts`:**
  - `Opciones.contexto?: () => ContextoArmado`, que se pasa a cada `def.armar`.
  - En checkride, el nivel es `def.nivelExamen?.(nivelSelector) ?? 3`.
- **Produces, en `evaluadorInterceptacion.ts`:**
  - `EvaluacionInterceptacion`, con fases `"interceptando" | "establecido" | "terminado" | "invalido"`.
  - `ResultadoInterceptacion extends ResultadoComun` con: `ejercicio: Ejercicio`, `dmeInicio`, `dmeCruce: number | null`, `sobrepaso` (puntos), `cortoSeg`, `angulo: number | null`, `fuera: { sobrepaso: Tramo[]; corto: Tramo[]; interceptar: Tramo[] }`.
  - `armarInterceptacion(m, nivel, ctx)`: el caso es `ctx.casos?.[ctx.intento] ?? CASOS_PRACTICA[ctx.intento % 5]`.
  - `avanzarInterceptacion(e, m)` y `armarSoloInterceptacion(e, m)`. Esta última es true si `!e` o si es inválida, y además `m.navSenal && !m.gpsNav && !m.enTierra && m.agl >= 1000`.
  - `Tramo` es el tipo que ya usan los evaluadores VFR.
- **Reglas de calificación** (spec, nivel medio; `tolInterceptacion` da los otros niveles):
  - **Cruce:** el primer cambio de signo de la desviación respecto al signo inicial, o `|desv| ≤ 0.25` puntos.
  - **Pasarse:** después del cruce, el máximo de `−signoInicial·desv` en puntos.
    - Error si pasa de `sobrepasoPuntos`: un tramo en `fuera.sobrepaso` con su peor valor.
    - «Nota» si pasa de `sobrepasoPuntos/2`.
  - **Quedarse corto:** tiempo seguido con `|norm180(rumbo − curso)| ≤ 10`, `|desv| > 1` punto, del lado inicial y antes del cruce. Error si pasa de `cortoSeg`.
  - **Ángulo:** promedio de `|norm180(rumbo − curso)|` en las muestras con `|desv| > 2` puntos, antes del cruce y desde los 20 s de armado. Si hay al menos 10 muestras y queda fuera de 20..40, es nota, no error.
  - **Establecido:** `|desv| ≤ establecidoPuntos` durante 30 s seguidos. Ahí se pasa a «terminado».
  - **Sin interceptar:** a los 8 min sin establecerse, se termina con error; el tramo va a `fuera.interceptar`.
  - **Sobre la estación:** las muestras con `navDme < 1` no cuentan para pasarse ni para quedarse corto.
  - **Anulado, con motivo:**
    - `lectorViejoNav`: «Actualiza el lector a v1.6 para el programa IFR.»;
    - `gpsNav`: «La barra la está manejando el GPS: cambia a NAV.»;
    - más de 10 s sin señal;
    - slew o pausa, como los demás evaluadores.
  - **Calificación:** `max(0, 100 − 35·errores − 10·notas)`. Aprueba si no hay errores.
- **Produces, en `textosInterceptacion.ts`:** los mismos miembros que pide `DefManiobra` (paso, orden, textoPaso, pasos, queHacer, semaforo, aviso, briefing, explicar, repetir, masFallado, paraGuardar), ES/EN.
  - **La orden al armar:** «Intercepta el radial {radial} de {ident?} {alejándote|acercándote}: curso {curso} en el OBS.»
  - **El consejo de distancia** (`distanciaConsejo`) se agrega solo en práctica (spec: el examen va sin consejos):
    - cerca: «Estás cerca: la barra se mueve rápido, intercepta pronto.»
    - lejos: «Estás lejos: la barra tarda en moverse, ten paciencia.»
  - **El aviso** «Pon el curso {curso} en el OBS» si `|norm180(navObs − curso)| > 5`.
  - **El aviso** «Mantén {altitud} pies» si la altitud se aleja más de 300 ft de la que tenía al armar. Es solo aviso; no cuenta en la calificación (spec).
  - **El briefing** (teoría por voz): 4 a 6 frases cortas de la spec: qué es un radial, TO/FROM, un punto = 2°, los 30° de interceptación, cerca y lejos.
- **Produces, en `DefManiobra "interceptar-radial"`:**
  - `avion: "C172"`;
  - `nivelExamen: (n) => Math.max(2, n)`;
  - celdas `sobrepaso` («Pasarse», «Overshoot»), `corto` («Quedarse corto», «Undershoot»), `interceptar` («Interceptar», «Intercept»);
  - `TOLERANCIAS["interceptar-radial"] = (n) => ({ sobrepaso: tolInterceptacion(n).sobrepasoPuntos, corto: tolInterceptacion(n).cortoSeg, interceptar: 480 })`;
  - `UNIDAD["interceptar-radial.sobrepaso"] = " puntos"`, `"interceptar-radial.corto" = "s"`.

- [ ] **Step 1:** `interceptacion.test.ts`, con un simulador de muestras local en la prueba: radial que cambia linealmente en el tiempo.
  - Perfecta: entra a 30°, cruza y queda dentro de ½ punto por 30 s. Resultado: aprobado, 100, sin tramos.
  - Pasarse 1.4 puntos en nivel medio: no aprueba y hay un tramo en `fuera.sobrepaso` con peor 1.4. El mismo vuelo en fácil aprueba con nota (90).
  - Corto: queda en el rumbo del curso a 2 puntos durante 40 s en medio. Hay error y un tramo en `fuera.corto`; en fácil, sin error.
  - Ángulo de 60°: nota, no error.
  - Muestras sin `navRadial`: fase «invalido» con el motivo de v1.6 (Review Focus 3).
  - `gpsNav: true`: «invalido» con el motivo del GPS (Review Focus 5).
  - Pasar sobre la estación con DME 0.4 y la barra a 3 puntos del otro lado: no hay tramo de sobrepaso (Review Focus 4).
  - `armarInterceptacion(m, 2, { intento: 1, examen: false })` usa el caso `acercandose`.
  - `MANIOBRAS["interceptar-radial"].nivelExamen?.(1)` es 2.
  - `briefing("en")` no tiene caracteres españoles.
- [ ] **Step 2:** Corre el archivo. Expected: falla porque los módulos no existen.
- [ ] **Step 3:** Implementa:
  - el evaluador y los textos;
  - el registro y el `HojaInterceptacion`: la tabla de las tres celdas con su peor valor y su tolerancia, como `HojaRumbos`;
  - `ContextoArmado` en `useIntento`;
  - las entradas de los `Record<ManiobraId>` que pida `tsc`.
- [ ] **Step 4:** Corre el archivo, luego `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 5: La lección IFR de rampa a rampa

**Files:**
- Modify: `src/features/instructor/lecciones.ts` (`LECCIONES_IFR`, `leccionIfrDe`, `claveLeccion`)
- Modify: `src/features/instructor/reglasIntentos.ts` (`LECCIONES_GUARDADAS` incluye las IFR)
- Modify: `src/features/instructor/repaso.ts` (variante IFR)
- Modify: `src/features/instructor/repaso.test.ts`, `src/features/instructor/lecciones.test.ts`
- Modify: `src/features/instructor/debriefingRepaso.ts` (la parte «maniobras» se titula «Navegación»/«Navigation» en IFR)
- Modify: `src/pages/InstructorRepaso.tsx` (prop `programa`, selector de VOR en rampa, `contexto` de armado)
- Modify: `src/lib/routes.ts`, `src/App.tsx`

**Interfaces:**
- **Consumes:** `VorSim`, `VorElegido`, `elegirVor`, `vorsCercanos` (Task 2); `casosExamen` (Task 3); `"interceptar-radial"` (Task 4).
- **Produces, en `lecciones.ts`:**
  - `Leccion.programa?: "ifr"`.
  - `LECCIONES_IFR`:
    1. «Interceptación de radiales» / «Radial interception», `interceptar-radial`;
    2. «Rutas de acercamiento y alejamiento» / «Inbound and outbound courses»;
    3. «Arcos DME» / «DME arcs»;
    4. «Patrones de espera» / «Holding patterns»;
    5. «Vuelo mezclado» / «Mixed flight»;
    6. «Checkride IFR» / «IFR checkride».
    Solo la 1 está disponible.
  - `leccionIfrDe(numero?: string)`.
  - `claveLeccion` da `ifr-${n}` en IFR.
- **Produces, en `repaso.ts`:**
  - `EstadoRepaso` gana `programa: "vfr" | "ifr"`, `vor: VorElegido | null` y `sinSenalDesde: number | null`.
  - `crearRepaso(modo, sorteo, nivel, programa = "vfr")`: en IFR el checkride usa `max(2, nivel)`.
  - `maniobrasDe(l, azar, modo?)`: en IFR, práctica da 5 de la maniobra y checkride da 2.
  - `conSenal(m: Muestra, vor: VorElegido): boolean`, que exige `navSenal`, `!gpsNav` y `|navMhz − vor.mhz| < 0.03`.
  - `ponerVor(e: EstadoRepaso, v: VorElegido): EstadoRepaso`, válido en rampa y salida.
- **Reglas IFR en `alMuestrearRepaso`** (la VFR no cambia):
  - **Despegue:** etapa «salida». Dice «Sintoniza {mhz} en NAV1, {ident}. Arriba de 1,000 pies sobre el terreno empezamos.» Sin VOR: `motivo` «Elige un VOR.».
  - **Salida → maniobra:** con `agl ≥ 1000 && conSenal`. Dice «Tenemos señal de {ident}. Primer ejercicio.»
  - **Maniobra → «fuera-de-zona»:** tras 5 s sin `conSenal`. Dice «Perdí la señal de {ident}: revisa NAV1 o acércate al VOR.»
  - **Regreso a «maniobra»:** al recuperar la señal.
  - **Sin zona:** en IFR no hay `zonaRepaso`; `zona` queda null y no hay `motivo` de espera de aeropuerto por la zona.
- **Rutas:**
  - `ROUTES.instructorIfr = "/instructor/ifr"`;
  - `instructorIfrLeccion(n) = /instructor/ifr/leccion/${n}`;
  - `instructorIfrTeoria(tema) = /instructor/ifr/teoria/${tema}`.
  - Ruling en el plan: `/leccion/` evita chocar con `/teoria/`; la spec decía `/instructor/ifr/:numero`.
- **Página:** `InstructorRepaso({ programa = "vfr" })`.
  - **Rampa IFR:** muestra `vorsCercanos(vors, avión)` como botones (ident, frecuencia, NM, «con DME» y «vuelo largo» cuando aplica). Al tocar uno se llama `ponerVor(e, elegirVor(v, muestra))`.
  - **Despegue sin VOR elegido:** se elige el más cercano.
  - **Contexto de armado:** `useIntento(def, { …, contexto: () => ({ intento: repaso.actual, examen: modo === "checkride", casos: casosRef }) })`. `casosRef` es `casosExamen()` al empezar un checkride.
  - **Briefing:** en IFR habla del VOR, no de la zona.

- [ ] **Step 1:** Pruebas en `repaso.test.ts` y `lecciones.test.ts`.
  - IFR con VOR: despegue → «salida». Con AGL 1,200 y señal → «maniobra». 6 s sin señal → «fuera-de-zona». Al volver la señal → «maniobra».
  - Señal con otra frecuencia (`navMhz` 113.1 contra el VOR 117.5): no pasa a maniobra (Review Focus 1).
  - `crearRepaso("checkride", […], 1, "ifr").nivel` es 2; en VFR sigue siendo 3.
  - `maniobrasDe(leccionIfrDe("1")!, Math.random, "checkride")` tiene largo 2.
  - `claveLeccion(leccionIfrDe("1")!)` es `"ifr-1"`; `LECCIONES_GUARDADAS["ifr-1"]` existe.
  - Las pruebas VFR que ya existen siguen pasando sin cambios.
- [ ] **Step 2:** Corre los dos archivos. Expected: fallan las nuevas.
- [ ] **Step 3:** Implementa `repaso`, `lecciones`, `reglasIntentos`, el título del debriefing, la página, las rutas y la ruta protegida en `App.tsx` (lazy, como `instructorLeccion`).
- [ ] **Step 4:** Corre los dos archivos, luego `npx tsc -b --noEmit` y `npm.cmd test`. Expected: pasan.
- [ ] **Step 5:** Commit.

### Task 6: El radial en el mapa del debriefing

**Files:**
- Modify: `src/features/instructor/recorrido.ts` (`crearGrabador(nav)`, `Punto` con NAV opcional, `Grabacion.vor` y `Grabacion.radiales`)
- Modify: `src/features/instructor/recorrido.test.ts`
- Modify: `src/features/instructor/MapaVuelo.tsx` (VOR y líneas de radial), `RepeticionVuelo.tsx` (lecturas NAV), `DebriefingMapa.tsx` (pestaña «Navegación» en vez de «Zona» cuando hay `vor`)
- Modify: `src/pages/InstructorRepaso.tsx` (`crearGrabador(programa === "ifr")`)

**Interfaces:**
- **Consumes:** `VorElegido` (Task 2); `ResultadoInterceptacion.ejercicio` (Task 4); `EstadoRepaso.vor` (Task 5).
- **Produces:**
  - `Punto` admite tres valores finales opcionales `[…, agl, radial, desvPuntos, dme]` (0 decimales, 1 decimal, 1 decimal). Solo se graban si el grabador se creó con `nav: true`.
  - `CAMPO_PUNTO` gana `radial: 9`, `desv: 10`, `dme: 11`.
  - `Grabacion.vor?: { ident; lat; lon; decl }`.
  - `Grabacion.radiales?: { intento: number; radial: number; desde: boolean }[]`, armado en `cerrarGrabacion` a partir de los resultados con `ejercicio`.
  - Una grabación VFR queda igual, byte por byte.
- **Dibujo:**
  - el VOR como hexágono dorado con su identificador;
  - cada radial como una línea punteada blanca desde el VOR, al rumbo verdadero `radial + decl`, hasta `max(DME del intento) + 5` NM, con la etiqueta `R-270`.

- [ ] **Step 1:** Pruebas en `recorrido.test.ts`.
  - Un grabador con `nav` guarda 12 valores por punto; sin `nav`, 9.
  - `cerrarGrabacion` con `e.vor` y un resultado de interceptación trae `vor` y `radiales[0].radial`.
  - El tramo de sobrepaso aparece en `errores` con su unidad `" puntos"`.
  - La prueba de tamaño de 7,200 puntos VFR sigue bajo 450 KB.
- [ ] **Step 2:** Corre el archivo. Expected: fallan las nuevas.
- [ ] **Step 3:** Implementa el grabador y el cierre. En el mapa, el VOR y los radiales. En la repetición, las lecturas Radial, Barra (puntos) y DME cuando el punto las trae.
- [ ] **Step 4:** Corre el archivo, luego `npx tsc -b --noEmit` y `npm.cmd test`. Expected: pasan.
- [ ] **Step 5:** Commit.

### Task 7: Menú IFR y teoría de interceptación

**Files:**
- Create: `src/pages/InstructorIfr.tsx` (menú), `src/pages/TeoriaIfr.tsx` (teoría, con versión imprimible)
- Create: `src/data/teoriaIfr.ts` (los textos de la teoría ES/EN), `src/data/teoriaIfr.test.ts`
- Modify: `src/lib/routes.ts`, `src/App.tsx`, `src/pages/InstructorPrograma.tsx` (enlace «Programa IFR» bajo las lecciones, solo para quien pueda abrir lecciones)
- Modify: `package.json`

**Interfaces:**
- **Consumes:** `LECCIONES_IFR`, `estadoLeccion`, `claveLeccion` (Task 5); `fetchMisLecciones` (devuelve las IFR gracias a Task 5); `RosaHSI` de `src/features/landing/HSI.tsx`.
- **Produces:**
  - `TEORIA_IFR: Record<"interceptacion", { titulo: Record<Idioma,string>; secciones: { titulo: Record<Idioma,string>; texto: Record<Idioma,string>; hsi?: { rumbo: number; curso: number; desviacion: number } }[] }>`.
  - Secciones de interceptación: qué es un radial; TO/FROM; leer la barra (un punto = 2°); interceptar a 30°; cerca y lejos de la estación; paso a paso.
- **Menú:**
  - las 6 lecciones, con «Próximamente» en la 2 a la 6;
  - la lección abierta lleva a `instructorIfrLeccion` y debajo «Último vuelo» si existe, igual que el menú VFR;
  - un enlace «Teoría» por lección con teoría.
- **Teoría:** cada sección con su `RosaHSI` cuando tiene `hsi`, y un botón «Imprimir» con `window.print()` y las clases de impresión de `HojasInstructor`.

- [ ] **Step 1:** `teoriaIfr.test.ts`:
  - ningún texto ES/EN contiene una palabra de la lista prohibida;
  - ningún texto EN contiene `[áéíóúñ¿¡]`;
  - cada `hsi.desviacion` está entre −10 y 10.
- [ ] **Step 2:** Corre el archivo. Expected: falla porque el módulo no existe.
- [ ] **Step 3:** Implementa los textos (Erik los revisa antes de publicar), las dos páginas, las rutas (menú y teoría protegidas como el programa) y el enlace en el menú VFR.
- [ ] **Step 4:** Corre el archivo, luego `npx tsc -b --noEmit`, `npm.cmd test` y `npm.cmd run build`. Expected: pasan.
- [ ] **Step 5:** Commit.

### Verificación final (después de las 7 tareas)

- En el navegador (localhost:5180, con sesión), revisa `/instructor/ifr`, `/instructor/ifr/teoria/interceptacion` y `/instructor/ifr/leccion/1` en rampa, con el lector en `--simulado` si no hay MSFS:
  - la consola está limpia salvo Cloudflare Insights;
  - a 375 px no hay desplazamiento horizontal.
- La prueba en vivo con MSFS la hace Erik.
