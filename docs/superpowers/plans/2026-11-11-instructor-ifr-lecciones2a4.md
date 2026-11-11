# Instructor IFR · Plan 2: Lecciones 2 a 4 (rutas TO/FROM, arcos DME, esperas)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer volables de rampa a rampa las lecciones IFR 2 (rutas de acercamiento y alejamiento), 3 (arcos DME) y 4 (patrones de espera, con la entrada dicha por voz), con su teoría con dibujos y sus figuras en el mapa del debriefing.

**Architecture:** Cada lección es una maniobra más del registro `MANIOBRAS` (`"ruta-vor"`, `"arco-dme"`, `"espera"`), con su evaluador puro y sus textos, igual que `"interceptar-radial"` del plan 1. El flujo IFR de `repaso.ts` no cambia: solo cuenta cuántos ejercicios tiene cada lección. La salida del arco reutiliza el evaluador de interceptación por dentro. Las entradas a la espera salen solo de `esperas.ts`.

**Tech Stack:** React 19, Vite, TS, Tailwind v4, Supabase, Leaflet 1.9, pruebas `node --experimental-strip-types --test`. El lector no cambia (v1.6 ya manda NAV1, DME y posición).

**Spec:** `docs/superpowers/specs/2026-11-11-instructor-ifr-design.md`
**Plan anterior (ya en main, 6293a5f):** `docs/superpowers/plans/2026-11-11-instructor-ifr-leccion1.md`

## Global Constraints

- **Lenguaje prohibido** en todo texto, voz y página: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA». Tampoco «Garmin» visible.
- **Inglés:** la interfaz en inglés no lleva `[áéíóúñ¿¡]`.
- **Idiomas:** ES y EN, como el programa VFR (`Idioma`, `localStorage "instructor-idioma"`).
- **Acceso:** el de `ACCESO_REPASO` (`lecciones.ts`); hoy solo el fundador.
- **NAV1 únicamente.** Un punto de la barra = 2°. Con el GPS manejando la barra, o con otra frecuencia en NAV1, no se califica (mismas reglas que `evaluadorInterceptacion.ts`, incluida la de otra estación de 6293a5f).
- **Niveles:** exámenes en `max(2, nivel elegido)` (`nivelExamen`), como la lección 1.
- **Altitud:** no se califica en las lecciones 1 a 4; solo el aviso de ±300 ft que ya tiene la lección 1.
- **Sentidos de espera:** `src/features/entrenador/esperas.ts` es la única fuente de entradas y sectores. Nunca `guia-hsi.pdf`.
- **Ejercicios imposibles nunca se dictan:** un arco sin DME no se arma.
- **Pruebas:** cada `*.test.ts` nuevo se agrega a la lista explícita de `"test"` en `package.json`. Suite: `npm.cmd test`. Tipos: `npx tsc -b --noEmit`. Build: `npm.cmd run build`.
- **Git:**
  - solo `git add` de archivos nombrados;
  - nunca commitear `en-vivo/ g1000-prueba/ guias/ poster/ propuestas/ redes/ simhub-sixpack/ supabase/.temp/ .superpowers/`;
  - commits con `-m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`;
  - no se sube a main sin que Erik lo apruebe.

## Cambios respecto a la spec (decididos al planear)

- **Cuántas prácticas:** la spec solo fija 5 en la lección 1. Cada ruta o espera es un vuelo de varios minutos, así que van:
  - lección 2: 3 prácticas, examen de 1;
  - lección 3: 3 prácticas, examen de 1;
  - lección 4: 2 prácticas, examen de 1 (entrada más dos vueltas, como dice la spec).
- **Posicionarse antes del ejercicio:** casi siempre el VOR está en el aeropuerto, y a 1,000 ft AGL el avión queda a 1 o 2 NM. Las rutas y las esperas empiezan con una fase «posicionando» que no se califica: «Aléjate del VOR: a 5 millas empezamos» (rutas) o a 6 (esperas, para que quepa la pregunta de 2 minutos).
- **Paso por la estación:** se detecta cuando el radial del avión cambia más de 90° respecto al de llegada, con histéresis (sale de ≤80° y llega a ≥100°). No se usa la bandera TO/FROM, que depende de lo que el cadete ponga en el OBS.
- **Distancia al VOR:** la de lat/lon del avión contra la posición del VOR elegido, no el DME. Así las rutas y las esperas funcionan con un VOR sin DME. Los arcos sí usan `navDme`.
- **Pasarse al entrar al arco:** se mide en NM con la tolerancia del arco (±1/0.5/0.2), no en puntos de barra. La spec dice «con las reglas de interceptación»; la idea es la misma (cuánto se pasa después de llegar), pero en la unidad del arco.
- **La espera:**
  - El tramo de alejamiento se cronometra desde que nivela las alas en rumbo de alejamiento hasta que empieza el viraje de acercamiento.
  - Cada error resta 20 (no 35): son 6 elementos.
  - Si a los 30 min no terminó, se anula («La espera no se completó en 30 minutos»), no se califica.
  - Cerca de las fronteras de los sectores (±5° del rumbo de cruce) se aceptan las dos entradas. También se acepta la entrada que correspondía al rumbo del momento de la pregunta.
  - Si el navegador no tiene micrófono, o el cadete no contesta, aparecen tres botones (Directa / Paralela / Gota). No contestar es error.
- **Abrir la siguiente lección al aprobar el examen:** sigue pendiente, igual que en VFR. Mientras `ACCESO_REPASO` sea «fundador», todas las lecciones disponibles están abiertas. Se hace cuando se abra el acceso.
- **Teoría de esperas:** los dibujos usan el diagrama de `EntrenadorEsperas.tsx` (que ya colorea los sectores con `esperas.ts`), no el HSI.

## Review Focus

1. **VOR en el aeropuerto** (el cadete arma a menos de 5 NM): la ruta y la espera no califican nada mientras están «posicionando». Pruebas en Task 2 y Task 4.
2. **Arco con un VOR sin DME:** nunca se dicta. La lista solo deja elegir VOR con DME y el evaluador se anula con su motivo. Pruebas en Task 3 y Task 5.
3. **Respuesta de la entrada** en inglés («teardrop»), con acento («lágrima»), con dos entradas a la vez o en silencio: se reconoce o da null, nunca truena. Prueba en Task 4.
4. **Rumbo de cruce pegado a una frontera de sector** (±5°): las dos entradas valen, dicha y volada. Prueba en Task 4.
5. **Radial que oscila sobre la estación** (pasa de 85° a 95° y regresa): no cuenta dos pasos por la estación. Prueba en Task 2.

---

### Task 1: Piezas compartidas

**Files:**
- Modify: `src/features/instructor/lecciones.ts`, `src/features/instructor/repaso.ts`, `src/features/instructor/maniobras.ts`, `src/features/instructor/useIntento.ts`, `src/features/instructor/vorSim.ts`, `src/features/instructor/navIfr.ts`
- Test: `src/features/instructor/lecciones.test.ts`, `src/features/instructor/repaso.test.ts`, `src/features/instructor/vorSim.test.ts`, `src/features/instructor/navIfr.test.ts`

**Interfaces:**
- **Produces, en `lecciones.ts`:**
  - `Leccion.ejercicios?: { practica: number; examen: number }` (solo IFR). La lección 1 IFR pasa a `{ practica: 5, examen: 2 }`.
  - `Leccion.requiereDme?: true`.
- **Produces, en `repaso.ts`:** `maniobrasDe(l, azar, modo)` usa `l.ejercicios` cuando existe (examen en checkride, práctica si no); sin `ejercicios`, se queda como hoy (5 de la maniobra o el sorteo VFR).
- **Produces, en `maniobras.ts`:** `ContextoArmado` gana `estacion?: VorElegido`, `espera?: DatosEspera` y `llegada?: number`. `DatosEspera` lo declara Task 1 en `navIfr.ts` (Task 4 lo usa): `type DatosEspera = { acercamiento: number; giros: Giros; tramoSeg: number; carta: boolean }`, con `Giros` de `esperas.ts`.
- **Produces, en `useIntento.ts`:** `ajustar(f: (e: any) => any): void`, que aplica `f` a la evaluación en curso (`setEv(e => e ? f(e) : e)`). Lo usa la respuesta de la espera.
- **Produces, en `vorSim.ts`:** `distanciaVor(m: Muestra, v: { lat: number; lon: number }): number | null`, NM con `aNm`; null sin `lat`/`lon`.
- **Produces, en `navIfr.ts`:**
  - `norm360` exportado y `redondear10` exportado.
  - `pasoEstacion(antes: boolean, radialAvion: number, radialLado: number): boolean`. Dice si el avión ya está «del otro lado» de la estación respecto a `radialLado`, con histéresis: si `antes` era false, se vuelve true con `|norm180(radialAvion − radialLado)| ≥ 100`; si era true, vuelve a false con `≤ 80`.
- **Página:** `InstructorRepaso.tsx` pasa `estacion: repaso.vor ?? undefined` en el `contexto`.

- [ ] **Step 1:** Pruebas:
  - `maniobrasDe(LECCIONES_IFR[0], azar, "practica").length` es 5 y en `"checkride"` es 2 (sin cambio de comportamiento).
  - Una lección de prueba `{ ...LECCIONES_IFR[0], ejercicios: { practica: 3, examen: 1 } }` da 3 y 1.
  - `distanciaVor` de un punto a 0.1° de latitud del VOR da 6 ±0.05; sin `lat` da null.
  - `pasoEstacion(false, 90 + 95, 90)` es false; `pasoEstacion(false, 90 + 100, 90)` es true; `pasoEstacion(true, 90 + 85, 90)` es true; `pasoEstacion(true, 90 + 80, 90)` es false.
- [ ] **Step 2:** Corre los cuatro archivos. Expected: fallan (`ejercicios` ignorado, funciones inexistentes).
- [ ] **Step 3:** Implementa lo de Interfaces.
- [ ] **Step 4:** Corre los archivos, `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 2: Lección 2 · la maniobra «ruta-vor»

**Files:**
- Create: `src/features/instructor/evaluadorRuta.ts`, `src/features/instructor/textosRuta.ts`, `src/features/instructor/ruta.test.ts`, `src/features/instructor/HojaRuta.tsx`
- Modify: `src/features/instructor/navIfr.ts`, `src/features/instructor/nivel.ts`, `src/features/instructor/maniobras.ts`, los `Record<ManiobraId, …>` que pida `tsc` (`recorrido.ts` TOLERANCIAS y UNIDAD, `vistasManiobra.tsx` HOJA, `InstructorPrograma.tsx` MATERIAL), `src/features/instructor/idiomaInstructor.ts` (motivos en inglés), `package.json`

**Interfaces:**
- **Consumes:** `pasoEstacion`, `distanciaVor`, `ContextoArmado.estacion` (Task 1); `desvioGrados`, `puntos`, `norm180`, `MOTIVO_*` y `invalidez`/`lectorViejoNav` como los usa `evaluadorInterceptacion.ts`.
- **Produces, en `navIfr.ts`:**
  - `type EjercicioRuta = { entrada: number; salida: number; giro: number }`: `entrada` es el radial por el que se acerca (curso `entrada + 180`, TO); `salida`, el radial por el que se aleja (FROM).
  - `CASOS_RUTA = [45, 90, 135]` (el viraje sobre la estación).
  - `generarRuta(radialAvion: number, giro: number, azar = Math.random): EjercicioRuta`: `entrada = redondear10(radialAvion)`, `salida = norm360(entrada + 180 + signo·giro)`, con `signo = azar() < 0.5 ? 1 : -1` como `generarEjercicio`.
- **Produces, en `nivel.ts`:** `tolRuta(n = 2) => ({ puntos: por(n, 2, 1, 0.5), establecerSeg: por(n, 240, 180, 120) })`.
- **Produces, en `evaluadorRuta.ts`:**
  - Fases `"posicionando" | "acercandose" | "alejandose" | "terminado" | "invalido"`.
  - `ResultadoRuta extends ResultadoComun`: `ejercicio`, `vor?`, `deriva: { acercamiento: number | null; alejamiento: number | null }` (promedio con signo, en puntos), `peor: { acercamiento: number; alejamiento: number }`, `notas: ("deriva")[]`, `fuera: { acercamiento: Tramo[]; alejamiento: Tramo[] }`.
  - `armarRuta(m, nivel = 2, ctx)`: el giro es `CASOS_RUTA[ctx.intento % 3]` en práctica y uno al azar de los tres en el examen.
  - `avanzarRuta(e, m)`, `armarSoloRuta(e, m)` (mismas condiciones que `armarSoloInterceptacion`).
- **Reglas** (nivel medio):
  - **Posicionando:** mientras `distanciaVor < 5`, no se genera el ejercicio ni se califica. Al llegar a 5 NM se genera con el radial de ese momento y pasa a «acercandose». Sin `ctx.estacion` o sin lat/lon se salta esta fase.
  - **Acercándose:** desviación contra `{ radial: entrada, desde: false }`.
    - Se califica desde la primera muestra con `|desv| ≤ puntos` hasta el paso por la estación.
    - No cuentan las muestras a menos de 2 NM (`distanciaVor`) ni, sin posición, los últimos 60 s antes del paso.
    - Cada tramo con `|desv| > puntos` es error en `fuera.acercamiento`, con su peor valor en puntos.
    - Si pasa la estación sin haberse establecido nunca, es un error con un tramo de toda la ida.
  - **Paso por la estación:** `pasoEstacion(…, navRadial, entrada)` se vuelve true.
  - **Alejándose:** desviación contra `{ radial: salida, desde: true }`.
    - No cuentan las muestras a menos de 2 NM (o los primeros 60 s sin posición).
    - Si no llega a `|desv| ≤ puntos` en `establecerSeg` desde el paso, es error en `fuera.alejamiento`.
    - Después de establecerse, cada tramo con `|desv| > puntos` es error.
    - Termina 120 s después de establecerse.
  - **Deriva:** si en un tramo calificado el promedio con signo pasa de `puntos/2`, se anota «deriva» (nota, no error): el viento lo está sacando de un lado.
  - **Anulado:** lo mismo que la interceptación (lector viejo, GPS, otra frecuencia o sin señal más de 10 s, slew, pausa). Si a los 30 min no pasó la estación, se termina con error en `fuera.acercamiento`.
  - **Calificación:** `max(0, 100 − 35·errores − 10·notas)`. Aprueba sin errores.
- **Produces, en `textosRuta.ts`:** los miembros de `DefManiobra`, ES/EN.
  - **Orden:** «Acércate a {ident} por el radial {entrada}: curso {entrada+180} TO. Después de la estación, aléjate por el radial {salida}.»
  - **Posicionando:** «Aléjate del VOR: a 5 millas empezamos.»
  - **Al pasar la estación:** «Pasaste la estación: vira al radial {salida} y pon {salida} en el OBS.»
  - **Aviso del OBS** como la lección 1 (curso esperado según la fase), y el de altitud ±300 ft.
  - **Consejo de deriva (solo práctica):** «La barra se te va a la {derecha|izquierda}: corrige unos 10° hacia ese lado.»
  - **Briefing:** 4 o 5 frases: TO y FROM, qué pasa al cruzar la estación, cambiar el curso en el OBS, corregir el viento.
- **Produces, en el registro:** `"ruta-vor"`, insignia `maniobra-ruta-vor-c172`, `nivelExamen: max(2, n)`, celdas `acercamiento` («Acercamiento», «Inbound»), `alejamiento` («Alejamiento», «Outbound»); `TOLERANCIAS["ruta-vor"] = (n) => ({ acercamiento: tolRuta(n).puntos, alejamiento: tolRuta(n).puntos })`; `UNIDAD["ruta-vor.acercamiento"]` y `["ruta-vor.alejamiento"] = " puntos"`. `FUERA_DEL_SORTEO` de `repaso.ts` gana `"ruta-vor"`.

- [ ] **Step 1:** `ruta.test.ts`, con un simulador local como `interceptacion.test.ts` (radial, rumbo, lat/lon del avión respecto a un VOR en 0,0):
  - Perfecta: se acerca centrado, pasa la estación, se establece en la salida en 60 s y la sostiene 120 s. Aprobado, 100.
  - Armada a 1.5 NM: queda «posicionando», sin tramos, hasta pasar 5 NM (Review Focus 1).
  - Se sale 1.6 puntos 40 s en la ida (medio): error en `fuera.acercamiento` con peor 1.6; en fácil, sin error.
  - Tarda 200 s en establecerse en la salida: error en medio; en fácil (240 s), no.
  - Radial que oscila 85°↔95° respecto a la entrada cerca de la estación: un solo paso, la fase no regresa a «acercandose» (Review Focus 5).
  - Deriva constante de +0.7 puntos en la ida, dentro de tolerancia: nota «deriva», calificación 90.
  - Otra frecuencia en NAV1 más de 10 s: «invalido».
  - `generarRuta(93, 90, () => 0.9)` da `{ entrada: 90, salida: 180, giro: 90 }`; con `() => 0.1`, salida 0.
  - `briefing("en")` sin caracteres españoles.
- [ ] **Step 2:** Corre el archivo. Expected: falla porque los módulos no existen.
- [ ] **Step 3:** Implementa el evaluador, los textos, `HojaRuta` (tabla de las dos celdas con peor valor y tolerancia, como `HojaInterceptacion`), el registro y las entradas que pida `tsc`.
- [ ] **Step 4:** Corre el archivo, `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 3: Lección 3 · la maniobra «arco-dme»

**Files:**
- Create: `src/features/instructor/evaluadorArco.ts`, `src/features/instructor/textosArco.ts`, `src/features/instructor/arco.test.ts`, `src/features/instructor/HojaArco.tsx`
- Modify: `navIfr.ts`, `nivel.ts`, `maniobras.ts`, los `Record<ManiobraId, …>` que pida `tsc`, `idiomaInstructor.ts`, `repaso.ts` (`FUERA_DEL_SORTEO`), `package.json`

**Interfaces:**
- **Consumes:** `iniciarInterceptacion`, `avanzarInterceptacion` y `ResultadoInterceptacion` (plan 1), para la salida al radial.
- **Produces, en `navIfr.ts`:**
  - `type EjercicioArco = { radioNm: number; desde: number; hasta: number; sentido: 1 | -1; alejandose: boolean }`. `sentido` +1 = radiales crecientes. `alejandose`: llega al arco desde adentro.
  - `generarArco(radialAvion: number, dme: number, azar = Math.random): EjercicioArco`:
    - `desde = redondear10(radialAvion)`;
    - `radioNm = dme ≤ 14 ? clamp(round(dme) + 4, 6, 18) : round(dme) − 4`;
    - `sentido` al azar;
    - `hasta = norm360(desde + sentido·60)`;
    - `alejandose = dme < radioNm`.
- **Produces, en `nivel.ts`:** `tolArco(n = 2) => ({ distanciaNm: por(n, 1, 0.5, 0.2) })`.
- **Produces, en `evaluadorArco.ts`:**
  - `MOTIVO_SIN_DME = "Este VOR no tiene DME: elige uno con DME para los arcos."`.
  - Fases `"hacia-arco" | "entrando" | "en-arco" | "saliendo" | "terminado" | "invalido"`.
  - `ResultadoArco extends ResultadoComun`: `ejercicio`, `vor?`, `extremos: number[]` (el DME en el peor punto de cada tramo de distancia), `sobrepasoEntrada: number` (NM), `salida: ResultadoInterceptacion | null`, `fuera: { entrada: Tramo[]; distancia: Tramo[]; salida: Tramo[] }`.
  - `armarArco(m, nivel = 2, ctx)`, `avanzarArco(e, m)`, `armarSoloArco(e, m)`: lo mismo que la interceptación y además `m.navTieneDme`.
- **Reglas** (nivel medio):
  - **Sin DME** (`!navTieneDme` al armar o en cualquier muestra): «invalido» con `MOTIVO_SIN_DME` (Review Focus 2).
  - **Hacia el arco:** vuela el radial `desde` hasta que `|navDme − radioNm| ≤ distanciaNm`. No se califica.
  - **Entrando:** 90 s desde que entra en la banda. El sobrepaso es lo más que pasa del arco hacia el lado al que iba (`navDme − radioNm` si `alejandose`, al revés si no). Si pasa de `distanciaNm`, es error en `fuera.entrada` con su peor valor.
  - **En el arco:** cada tramo con `|navDme − radioNm| > distanciaNm` es error en `fuera.distancia`, con peor `|navDme − radioNm|` y su DME en `extremos`.
  - **Saliendo:** cuando el radial del avión queda a 10° o menos de `hasta`, empieza `iniciarInterceptacion` con `{ caso: "acercandose", radial: hasta, desde: false, curso: hasta + 180 }`, y se le pasan las muestras. Cuando la interceptación termina:
    - sus tramos (`sobrepaso`, `corto`, `interceptar`) van a `fuera.salida`;
    - el arco queda «terminado»;
    - si la interceptación se anula, el arco se anula con el mismo motivo.
  - **Límite:** 20 min desde que entra al arco sin llegar a la salida: termina con un error en `fuera.salida`.
  - **Calificación:** `max(0, 100 − 35·errores)`. Aprueba sin errores.
- **Produces, en `textosArco.ts`:**
  - **Orden:** «Vuela el radial {desde} hasta el arco de {radioNm} millas de {ident}; síguelo hacia la {derecha|izquierda} hasta el radial {hasta} y acércate por él: curso {hasta+180}.» El lado sale del sentido y de si se aleja.
  - **Consejo** (solo práctica, en «en-arco»), si la distancia crece 0.2 NM por arriba del radio: «Corrige unos 10° hacia la estación.» Si baja de él: «Abre unos 10°, te estás metiendo.»
  - **Al salir:** «Radial {hasta}: vira al curso {hasta+180}.»
  - **Explicar:** «Llegaste a {extremo} millas» para cada tramo de distancia.
  - **Briefing:** qué es un arco, empezar a virar antes de llegar (unos 0.5 NM a 100 kt), los 10° hacia la estación, el radial de salida.
- **Produces, en el registro:** `"arco-dme"`, insignia `maniobra-arco-dme-c172`, `nivelExamen: max(2, n)`, celdas `entrada` («Entrada», «Entry»), `distancia` («Distancia», «Distance»), `salida` («Salida al radial», «Radial exit»); `TOLERANCIAS["arco-dme"] = (n) => ({ entrada: tolArco(n).distanciaNm, distancia: tolArco(n).distanciaNm, salida: tolInterceptacion(n).sobrepasoPuntos })`; `UNIDAD` de entrada y distancia `" NM"`, de salida `" puntos"`.

- [ ] **Step 1:** `arco.test.ts`:
  - Perfecta: radial 090 alejándose hasta 10 NM, arco dentro de ±0.3 NM hasta el radial 150, intercepta acercándose. Aprobado, 100, `salida.aprobado` true.
  - Arco de 10 NM con un tramo a 10.8 NM: en medio, error en `fuera.distancia` con `extremos[0]` = 10.8; en fácil, sin error.
  - Entrada pasándose a 10.7 NM alejándose: error en `fuera.entrada` en medio.
  - `navTieneDme: false` al armar: «invalido» con `MOTIVO_SIN_DME` (Review Focus 2).
  - Salida pasándose 1.5 puntos: error en `fuera.salida` en medio.
  - `generarArco(93, 3)` da `{ desde: 90, radioNm: 7, alejandose: true }` y `hasta` a 60° de 90; `generarArco(93, 22)` da radio 18 y `alejandose: false`.
  - `briefing("en")` sin caracteres españoles.
- [ ] **Step 2:** Corre el archivo. Expected: falla porque los módulos no existen.
- [ ] **Step 3:** Implementa el evaluador, los textos, `HojaArco`, el registro y las entradas que pida `tsc`.
- [ ] **Step 4:** Corre el archivo, `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 4: Lección 4 · la maniobra «espera»

**Files:**
- Create: `src/features/instructor/evaluadorEspera.ts`, `src/features/instructor/textosEspera.ts`, `src/features/instructor/espera.test.ts`, `src/features/instructor/HojaEspera.tsx`
- Modify: `navIfr.ts`, `nivel.ts`, `maniobras.ts`, los `Record<ManiobraId, …>` que pida `tsc`, `idiomaInstructor.ts`, `repaso.ts` (`FUERA_DEL_SORTEO`), `package.json`

**Interfaces:**
- **Consumes:** `entradaEspera`, `generarSituacion`, `Entrada`, `Giros`, `norm` de `esperas.ts`; `normalizar` de `preguntas.ts`; `pasoEstacion`, `distanciaVor`, `DatosEspera`, `ContextoArmado.espera`/`llegada`/`estacion` (Task 1).
- **Produces, en `navIfr.ts`:**
  - `inventarEspera(azar = Math.random): DatosEspera`: desde `generarSituacion`, `acercamiento = norm(alejamiento + 180)`, `giros`, `tramoSeg: 60`, `carta: false`.
  - `entradasValidas(rumbos: number[], alejamiento: number, giros: Giros): Entrada[]`: las entradas de `entradaEspera` para cada rumbo, sin repetir.
  - `entradaDicha(texto: string, idioma: Idioma): Entrada | null`, sobre `normalizar`:
    - `directa|direct` → directa;
    - `paralela|parallel` → paralela;
    - `gota|lagrima|teardrop|tear drop` → gota;
    - si aparecen dos distintas, o ninguna, null.
  - `entradaVolada(ms: Muestra[], alejamiento: number, giros: Giros): Entrada | null`. Recibe las muestras desde el cruce del fijo hasta el regreso al fijo.
    1. El primer tramo recto: 30 s seguidos o más con `|inclinacion| < 5`, empezando en los primeros 180 s. `H1` es su rumbo medio.
    2. Después de ese tramo, suma el cambio de rumbo con signo (`norm180` entre muestras) hasta que llegue a 90°: ese es el sentido del segundo viraje.
    3. Si el segundo viraje va al revés de `giros`, es paralela.
    4. Si no, es gota cuando `H1` está más cerca de `alejamiento + lado·30` que de `alejamiento`. `lado` es −1 en esperas a la derecha y +1 a la izquierda: el lado de la espera visto desde el rumbo de alejamiento, como dice `esperas.ts`.
    5. Si no, es directa.
    6. Si no hay tramo recto o no hay segundo viraje, null.
- **Produces, en `nivel.ts`:** `tolEspera(n = 2) => ({ tramoSeg: por(n, 15, 10, 5), puntos: por(n, 2, 1, 0.5), tasaGrados: por(n, 1.5, 1, 0.5), maxNm: por(n, 5, 4, 3) })`.
- **Produces, en `evaluadorEspera.ts`:**
  - Fases `"posicionando" | "llegando" | "entrada" | "vueltas" | "terminado" | "invalido"`.
  - `EvaluacionEspera` lleva `ejercicio: DatosEspera & { llegada: number }`, `preguntar: boolean`, `dicha: Entrada | null | undefined` (undefined = todavía no contesta), `rumboPregunta: number | null`, `rumboCruce: number | null` y `cruces: number[]` (los t de cada paso por el fijo).
  - `responderEntrada(e, dicha: Entrada | null, rumbo: number): EvaluacionEspera`: guarda la respuesta y el rumbo, y apaga `preguntar`.
  - `ResultadoEspera extends ResultadoComun`: `ejercicio`, `vor?`, `dicha`, `volada: Entrada | null`, `correcta: Entrada`, `validas: Entrada[]`, `tramos: number[]` (s de cada alejamiento), `tasas: number[]` (°/s de cada viraje), `fuera: { dicha: Tramo[]; volada: Tramo[]; tramo: Tramo[]; acercamiento: Tramo[]; virajes: Tramo[]; distancia: Tramo[] }`.
  - `armarEspera(m, nivel = 2, ctx)`:
    - la espera es `ctx.espera`, o `inventarEspera()` si no hay;
    - la llegada es `ctx.llegada`, o `redondear10(navRadial)` cuando termina de posicionarse;
    - `avanzarEspera`, `armarSoloEspera` como la ruta.
- **Reglas** (nivel medio):
  - **Posicionando:** igual que la ruta, pero a 6 NM.
  - **Llegando:** se acerca por el radial `llegada`. No se califica; avisa si se sale más de 2 puntos.
    - `preguntar` se enciende una sola vez cuando `distanciaVor / (gs ?? velocidad) · 3600 ≤ 120` s.
  - **Cruce del fijo:** `pasoEstacion` respecto a `llegada`. Guarda `rumboCruce = m.rumbo` y la fase pasa a «entrada».
  - **Los siguientes cruces** (fin de la entrada y fin de cada vuelta) son pasos de «lado de la espera» a «otro lado»: `pasoEstacion` respecto a `radialEspera = norm(acercamiento + 180)`, que se reinicia después de cada cruce. Con el tercero, termina.
  - **Entradas válidas:** `entradasValidas([rumboCruce − 5, rumboCruce, rumboCruce + 5, rumboPregunta?], alejamiento, giros)`. `correcta` es la de `rumboCruce`.
  - **Errores** (cada uno con un tramo en su campo):
    - **dicha:** si `dicha` no está en `validas`, o si es null o undefined al cruzar;
    - **volada:** si `entradaVolada` no está en `validas`, o si da null;
    - **tramo:** en cada vuelta, el tramo recto (`|inclinacion| < 5`, rumbo a 45° o menos de `alejamiento`) dura fuera de `tramoSeg ± tol.tramoSeg`; peor = `|dur − tramoSeg|`;
    - **acercamiento:** en cada vuelta, desde 15 s después de nivelar en el acercamiento hasta el fijo, sin las muestras a menos de 1 NM: `|desv| > puntos` respecto a `{ radial: radialEspera, desde: false }`;
    - **virajes:** cada viraje (`|inclinacion| ≥ 10` por 20 s o más, después del primer cruce) con tasa media `|Δrumbo| / dur` fuera de `3 ± tasaGrados`; peor = `|tasa − 3|`;
    - **distancia:** cualquier tramo a más de `maxNm` del VOR después del primer cruce.
  - **Anulado:** las reglas de la interceptación y, además, 30 min sin terminar: «La espera no se completó en 30 minutos.»
  - **Calificación:** `max(0, 100 − 20·errores)`. Aprueba sin errores.
- **Produces, en `textosEspera.ts`:**
  - **Orden:** «Espera sobre {ident}: curso de acercamiento {acercamiento}, virajes a la {derecha|izquierda}, tramos de {tramoSeg/60} minuto(s). Llega por el radial {llegada}.»
  - **La pregunta:** «¿Qué entrada vas a hacer?» / «Which entry will you fly?».
  - **Al cruzar** (solo práctica): «Entrada {correcta}: {comoSeVuela}». En inglés, una frase propia equivalente.
  - **Consejo de la vuelta** (solo práctica): «Un minuto: vira» cuando el tramo de alejamiento llega a `tramoSeg`.
  - **Explicar:**
    - «Dijiste {dicha}; tocaba {correcta}.»
    - «Volaste una entrada {volada}.»
    - «Tramo de {s} s.»
    - «Viraje a {tasa}°/s.»
  - **Briefing:** las partes de la espera, el sentido de los virajes, cómo decidir la entrada con el rumbo de llegada, el minuto de alejamiento.
- **Produces, en el registro:** `"espera"`, insignia `maniobra-espera-c172`, `nivelExamen: max(2, n)`.
  - **Celdas:** `dicha` («Entrada dicha», «Entry called»), `volada` («Entrada volada», «Entry flown»), `tramo` («Tramo», «Leg»), `acercamiento` («Acercamiento», «Inbound»), `virajes` («Virajes», «Turns»), `distancia` («Distancia», «Distance»).
  - **`TOLERANCIAS["espera"]`:** desde `tolEspera`; dicha y volada usan 0.
  - **`UNIDAD`:** `tramo` en `"s"`, `acercamiento` en `" puntos"`, `virajes` en `"°/s"`, `distancia` en `" NM"`.

- [ ] **Step 1:** `espera.test.ts`:
  - `entradaDicha("Voy a hacer una lágrima", "es")` es gota; `entradaDicha("teardrop", "en")` es gota; `entradaDicha("parallel", "en")` es paralela; `entradaDicha("directa o paralela", "es")` es null; `entradaDicha("", "es")` es null (Review Focus 3).
  - `entradasValidas` con un rumbo a 3° de la frontera de 110° (espera a la derecha, alejamiento 090: rumbo 200 − 3) incluye paralela y directa (Review Focus 4).
  - `entradaVolada` con perfiles sintéticos de rumbo e inclinación (espera a la derecha, alejamiento 090):
    - directa: llega en 270, vira a la derecha a 090, tramo, vira a la derecha → directa;
    - paralela: llega en 150, vira a la izquierda a 090, tramo, vira a la izquierda → paralela;
    - gota: llega en 050, nivela en 060, tramo, vira a la derecha → gota;
    - sin tramo recto → null.
  - Una espera completa sintética (cruce, entrada directa, dos vueltas con tramos de 60 s, virajes a 3°/s, acercamiento centrado), respondiendo «directa» → aprobado, 100.
  - La misma con tramos de 75 s: error en `fuera.tramo` en medio; en fácil, no.
  - La misma sin respuesta: error en `fuera.dicha`.
  - Armada a 2 NM: «posicionando», sin `preguntar`, hasta pasar 6 NM (Review Focus 1).
  - `preguntar` se enciende a 120 s del fijo (3.3 NM a 100 kt) y una sola vez.
  - `inventarEspera(azar fijo)` coincide con `generarSituacion(mismo azar)`: `acercamiento = alejamiento + 180`.
  - `briefing("en")` sin caracteres españoles.
- [ ] **Step 2:** Corre el archivo. Expected: falla porque los módulos no existen.
- [ ] **Step 3:** Implementa el evaluador, los textos, `HojaEspera` (la tabla de las 6 celdas; en dicha y volada muestra la entrada en vez de un número), el registro y las entradas que pida `tsc`.
- [ ] **Step 4:** Corre el archivo, `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 5: Las lecciones 2 a 4 en la página

**Files:**
- Modify: `src/features/instructor/lecciones.ts`, `src/features/instructor/vorSim.ts`, `src/pages/InstructorRepaso.tsx`
- Create: `src/features/instructor/DatosEsperaForm.tsx`
- Test: `src/features/instructor/lecciones.test.ts`, `src/features/instructor/vorSim.test.ts`

**Interfaces:**
- **Consumes:** las tres maniobras (Tasks 2–4); `ajustar` (Task 1); `useEscucha` (`escuchar(texto, tipo, clave, alTerminar)`); `entradaDicha`, `responderEntrada`, `inventarEspera`.
- **Produces, en `lecciones.ts`:**
  - `LECCIONES_IFR[1] = ifr(2, …, "ruta-vor")` con `ejercicios { practica: 3, examen: 1 }`;
  - `[2] = ifr(3, …, "arco-dme")` con `{ 3, 1 }` y `requiereDme: true`;
  - `[3] = ifr(4, …, "espera")` con `{ 2, 1 }`.
- **Produces, en `vorSim.ts`:** `vorsParaLeccion<T extends VorSim>(cercanos: T[], requiereDme: boolean): (T & { apto: boolean })[]`: `apto = !requiereDme || v.dme`.
- **Página, `InstructorRepaso.tsx`:**
  - **Lista de VOR:** con `vorsParaLeccion`. Un VOR no apto se ve deshabilitado con «sin DME» / «no DME». La elección automática al despegar toma el primero apto. Sin ninguno apto: «No hay VOR con DME a 60 millas: elige otro aeropuerto.» y no se arma (Review Focus 2).
  - **Lección 4, en la rampa:** `DatosEsperaForm`, con:
    - «Con carta»: curso de acercamiento (0–359), virajes a la derecha o a la izquierda, tramo en segundos (60 por defecto);
    - el botón «Inventar espera», que llena con `inventarEspera()` y muestra los datos;
    - «Llego por el radial» (opcional, 0–359).
    - Si al despegar no hay datos, se inventan y el instructor los dice con la orden.
    - En práctica con espera inventada, cada intento inventa una nueva (spec); con carta, se repite la misma.
  - **Contexto:** `contexto` agrega `espera` y `llegada`.
  - **La pregunta:** cuando `ev.preguntar` se enciende, `escuchar(T.pregunta, …, (texto) => ajustar((e) => responderEntrada(e, entradaDicha(texto, idioma), muestraRef.current?.rumbo ?? 0)))`.
    - Mientras `ev.fase === "llegando"` y `ev.dicha` no tiene respuesta, se ven tres botones (Directa / Paralela / Gota; en inglés Direct / Parallel / Teardrop) que llaman lo mismo.
    - Sin soporte de micrófono, solo los botones.
- **Ruling ya tomado:** el nombre de la lección sigue saliendo de `LECCIONES_IFR`. El resto de la página (briefing, etiquetas, debriefing «Navegación») ya es genérico IFR desde el plan 1.

- [ ] **Step 1:** Pruebas:
  - las lecciones IFR 2, 3 y 4 están disponibles, con su maniobra y sus `ejercicios`; `claveLeccion` da `ifr-2`, `ifr-3` e `ifr-4`;
  - la 5 y la 6 siguen como «proximamente»;
  - `vorsParaLeccion` con dos VOR (uno sin DME) marca `apto` false solo en ese, y solo cuando `requiereDme`.
- [ ] **Step 2:** Corre los dos archivos. Expected: fallan.
- [ ] **Step 3:** Implementa lo de Interfaces.
- [ ] **Step 4:** Corre los archivos, `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 6: Arcos y esperas en el mapa del debriefing

**Files:**
- Create: `src/features/instructor/figurasMapa.ts`, `src/features/instructor/figurasMapa.test.ts`
- Modify: `src/features/instructor/maniobras.ts`, `src/features/instructor/recorrido.ts`, `src/features/instructor/MapaVuelo.tsx`, `src/features/entrenador/EntrenadorEsperas.tsx` (exportar `COLOR_SECTOR`), `package.json`
- Test: `src/features/instructor/recorrido.test.ts`

**Interfaces:**
- **Produces, en `maniobras.ts`:**
  - `type Figuras = { radiales?: { radial: number; desde: boolean }[]; arco?: { radioNm: number; desde: number; hasta: number; sentido: 1 | -1 }; espera?: { acercamiento: number; giros: Giros; tramoSeg: number } }`;
  - `DefManiobra.figuras?(r): Figuras`:
    - la interceptación da su radial;
    - la ruta da la entrada (`desde: false`) y la salida (`desde: true`);
    - el arco da el arco y el radial de salida;
    - la espera da la espera y el radial de llegada.
- **Produces, en `recorrido.ts`:**
  - `Grabacion.radiales` se llena con `figuras` (deja de leer `ejercicio` a mano).
  - `Grabacion` gana `arcos?: ({ intento: number } & Figuras["arco"])[]` y `esperas?: ({ intento: number } & Figuras["espera"])[]`. Solo con `e.vor`; las grabaciones VFR no cambian.
- **Produces, en `figurasMapa.ts`** (puro; verdadero = magnético + `decl`, con el `destino(lat, lon, rumboV, nm)` que hoy vive en `MapaVuelo.tsx`, que se mueve aquí):
  - `puntosArco(vor, radioNm, desde, hasta, sentido, decl): [number, number][]`: un punto cada 2°, de `desde` a `hasta` en el sentido dado.
  - `figuraEspera(vor, espera, decl)` devuelve `{ pista: [number, number][]; sectores: { entrada: Entrada; poligono: [number, number][] }[] }`:
    - **la pista:** el fijo en el VOR; el tramo de acercamiento sobre el radial `acercamiento + 180`, de `tramoSeg · 100 / 3600` NM; giros de 0.5 NM de radio hacia el lado de la espera;
    - **los sectores:** una cuña de 3 NM por cada uno de `SECTORES`. La cuña cubre las direcciones desde las que se llega: rumbo de llegada = `alejamiento ± d` (± según los giros, como `diferencia()`), y la dirección desde el fijo es ese rumbo + 180.
- **Dibujo en `MapaVuelo.tsx`:**
  - el arco: línea blanca punteada como los radiales, con la etiqueta «{radio} NM»;
  - la espera: la pista en blanco y los tres sectores con `COLOR_SECTOR`, con 0.15 de opacidad;
  - las dos entran en los límites del mapa.

- [ ] **Step 1:** Pruebas:
  - `puntosArco` de 090 a 150 en sentido +1 da 31 puntos, todos a `radioNm ± 0.01` del VOR;
  - en sentido −1, de 090 a 030, también 31 puntos;
  - `figuraEspera` con acercamiento 270 y virajes a la derecha: la pista queda al este del VOR (lon > lon del VOR) y al norte del radial 090. Hay 3 sectores, y el de la gota contiene la dirección desde la que llega un rumbo de 060 (060 + 180 = 240);
  - una grabación IFR con un resultado de arco tiene `arcos[0].radioNm`; una VFR no tiene `arcos` ni `esperas` (las pruebas existentes de `radiales` siguen pasando).
- [ ] **Step 2:** Corre los archivos. Expected: fallan.
- [ ] **Step 3:** Implementa lo de Interfaces.
- [ ] **Step 4:** Corre los archivos, `npx tsc -b --noEmit` y `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Task 7: Teoría con dibujos de rutas, arcos y esperas

**Files:**
- Modify: `src/data/teoriaIfr.ts`, `src/data/teoriaIfr.test.ts`, `src/pages/TeoriaIfr.tsx`, `src/pages/InstructorIfr.tsx`, `src/features/entrenador/EntrenadorEsperas.tsx` (exportar `Diagrama` como `DiagramaEspera`)

**Interfaces:**
- **Produces, en `teoriaIfr.ts`:**
  - `TemaIfr = "interceptacion" | "rutas" | "arcos" | "esperas"`;
  - `SeccionTeoria.espera?: Situacion` (de `esperas.ts`), para dibujar con `DiagramaEspera` revelado.
- **Contenido** (texto mío; Erik lo revisa antes de publicar):
  - **rutas**, 4 secciones con HSI:
    - acercarse con TO;
    - qué pasa al cruzar la estación (la bandera cambia y la barra se mueve rápido);
    - alejarse con FROM y cambiar el OBS;
    - corregir el viento.
  - **arcos**, 5 secciones (HSI donde ayude):
    - qué es un arco;
    - empezar a virar antes;
    - los 10° hacia la estación;
    - el radial de salida;
    - paso a paso.
  - **esperas**, 6 secciones:
    - las partes de la espera;
    - virajes a la derecha y a la izquierda;
    - la directa, la paralela y la gota, cada una con su `espera` dibujada;
    - paso a paso.
- **Página:** `TeoriaIfr` dibuja `DiagramaEspera` cuando la sección tiene `espera`. `InstructorIfr` muestra «Teoría con dibujos» en las lecciones 1 a 4: `TEORIA = { 1: "interceptacion", 2: "rutas", 3: "arcos", 4: "esperas" }`.

- [ ] **Step 1:** `teoriaIfr.test.ts`:
  - rutas tiene 4 secciones, arcos 5 y esperas 6;
  - cada sección con `espera` usa una situación cuya `entradaEspera` coincide con lo que dice el título de su sección;
  - las pruebas de palabras prohibidas y de inglés ya cubren los temas nuevos.
- [ ] **Step 2:** Corre el archivo. Expected: falla.
- [ ] **Step 3:** Implementa el contenido y la página.
- [ ] **Step 4:** Corre el archivo, `npx tsc -b --noEmit`, `npm.cmd test` y `npm.cmd run build`. Expected: todo pasa.
- [ ] **Step 5:** Commit.

### Verificación final (después de las 7 tareas)

- `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build` pasan.
- **En el navegador, con la sesión de Erik**, sin scroll horizontal a 375 px y con la consola limpia (salvo Cloudflare Insights):
  - `/instructor/ifr` (lecciones 1 a 4 abiertas);
  - `/instructor/ifr/teoria/rutas`, `/arcos` y `/esperas`;
  - `/instructor/ifr/leccion/2`, `/3` y `/4` (en la 4, el formulario de la espera).
- **Lo que solo se prueba volando con MSFS** (se le reporta a Erik como pendiente):
  - la pregunta por micrófono;
  - la entrada volada;
  - el paso por la estación con viento.
