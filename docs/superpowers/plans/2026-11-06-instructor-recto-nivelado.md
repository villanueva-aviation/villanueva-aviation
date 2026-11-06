# Instructor virtual: recto y nivelado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el cadete elija «Recto y nivelado» en el menú del programa y haga una sesión completa (briefing, práctica, intento calificado, debriefing, cierre) calificada por el lector actual, con preguntas por micrófono e insignia que Erik otorga.

**Architecture:** Cada maniobra se vuelve una definición (`DefManiobra`, en `maniobras.ts`) con todo lo que el programa necesita de ella: evaluar, pasos, órdenes, avisos, briefing, explicación, reporte y guardado. El viraje escarpado entra como un adaptador de las funciones que ya existen, sin cambiarles comportamiento. Recto y nivelado es la segunda definición, en archivos propios. El programa, el hook del intento, el debriefing y el panel de Erik toman la definición según `sesion.actividad` / `intento.maniobra`. Esta misma pieza la usarán vuelo lento, pérdidas y la clase.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind v4, Supabase; pruebas con `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-05-instructor-maniobras-microfono-design.md` (fase 2 del «Orden de construcción»).

## Global Constraints

- Nada de "certificado", "CFI", "licencia", "certified" ni "instructor certificado" en ningún texto.
- El aviso del reporte no cambia: «Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica.» / "Simulator practice. Not an official document and does not replace an exam before an aviation authority."
- Títulos en inglés: nunca "Notice of Disapproval".
- Ningún texto en inglés contiene `/[áéíóúñ¿¡]/`. Cada archivo nuevo con textos en inglés lleva una prueba de eso.
- Sin la marca "Garmin" visible.
- La sesión del viraje escarpado y la página `/instructor/viraje-escarpado` no cambian de comportamiento. Las pruebas existentes pasan sin cambiar lo que comprueban; solo pueden cambiar las llamadas que ganan un parámetro con valor por omisión.
- Recto y nivelado usa solo los datos del lector actual (v1.2). El lector no cambia.
- Sin migración: el intento calificado de cualquier maniobra se guarda con `modo = 'checkride'` en `intentos_maniobra`. Solo cambia el nombre que ve el cadete.
- Las tolerancias y constantes de recto y nivelado viven solo en `src/features/instructor/rectoNivelado.ts`.
- Pruebas: los archivos de prueba no importan `.tsx` ni React, y cada archivo de prueba nuevo se agrega al script `"test"` de `package.json`.
- Comandos de verificación: `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build`.

## Review Focus

1. **El cadete se arma y sigue ajustando potencia o compensador.** El tramo calificado no empieza mientras la altitud o la velocidad siguen cambiando. Prueba en Task 1: «no empieza mientras el avión sigue subiendo».
2. **El rumbo objetivo está junto al norte (358°) y se desvía a 004°.** Cuenta como +6°, no como −354°. Prueba en Task 1: «el rumbo cruza el norte sin error».
3. **Regresión del viraje escarpado.** El adaptador `defViraje` da exactamente lo mismo que las funciones viejas. Prueba en Task 3: «defViraje dice lo mismo que las funciones del viraje».
4. **Pausa, slew o reinicio del lector a medio tramo.** El intento se anula con el mismo motivo que en el viraje. Prueba en Task 1: «una pausa a media maniobra anula el intento».
5. **Un intento guardado con una maniobra desconocida, o uno viejo del viraje, llega al panel de Erik.** Se muestra con la definición del viraje y no truena. Prueba en Task 3: «defDe cae al viraje con una maniobra desconocida».

---

### Task 1: El evaluador de recto y nivelado

**Files:**
- Create: `src/features/instructor/rectoNivelado.ts`, `src/features/instructor/evaluadorRecto.ts`, `src/features/instructor/evaluadorRecto.test.ts`
- Modify: `src/features/instructor/evaluador.ts` (exportar `analizar` e `invalidez` sin cambiarlos), `src/features/instructor/simular.ts` (agregar `simularRecto`), `package.json`

**Interfaces:**
- Consumes: de `evaluador.ts`: `Muestra`, `Tramo`, `difRumbo`; `analizar(puntos, tol)` e `invalidez(m, previo)`, que esta tarea exporta. De `virajeEscarpado.ts`: `BOLA_TOLERANCIA`, `INCLINACION_NIVELADO`.
- Produces:
  ```ts
  // rectoNivelado.ts  (valores de partida, decisión de Claude; se afinan tras un vuelo real)
  export const TOLERANCIAS_RECTO = { altitudFt: 100, rumboGrados: 10, velocidadKt: 10 } as const;
  export const DURACION_SEG = 120;
  /** Estable = en los últimos `seg`: alas < `inclinacion`° y rango de altitud, velocidad y rumbo dentro de estos márgenes. */
  export const ESTABLE = { seg: 5, inclinacion: 5, altitudFt: 40, velocidadKt: 4, rumboGrados: 3 } as const;
  export const MITAD_SEG = 60;
  // evaluadorRecto.ts
  export type CampoRecto = "altitud" | "rumbo" | "velocidad" | "bola";
  export type CodigoRecto = "1" | "2" | "3" | "4"; // altitud, rumbo, velocidad, bola
  export type FaseRecto = "armado" | "manteniendo" | "terminado" | "invalido";
  export interface ResultadoRecto {
    maniobra: "recto-nivelado";
    aprobado: boolean; calificacion: number;
    elementos: Record<CodigoRecto, "S" | "NS">;
    objetivo: { t: number; altitud: number; rumbo: number; velocidad: number };
    peor: Record<CampoRecto, number>; fuera: Record<CampoRecto, Tramo[]>; ns: Record<CampoRecto, boolean>;
    avisos: string[]; muestras: Muestra[]; // desde el objetivo hasta el final
  }
  export interface EvaluacionRecto {
    fase: FaseRecto; motivo?: string; resultado?: ResultadoRecto;
    previo: Muestra | null; ventana: Muestra[]; objetivo: Muestra | null; tramo: Muestra[];
  }
  export function armarRecto(m: Muestra): EvaluacionRecto;
  export function avanzarRecto(ev: EvaluacionRecto, m: Muestra): EvaluacionRecto; // pura; ignora muestras repetidas o viejas
  export function armarSoloRecto(ev: EvaluacionRecto | null, m: Muestra): boolean; // misma regla que armarSolo
  // simular.ts
  export function simularRecto(op?: {
    rumbo?: number;                // 90 por omisión
    subidaSeg?: number;            // segundos iniciales subiendo a 300 ft/min antes de nivelar
    deriva?: { campo: "altitud" | "rumbo" | "velocidad"; valor: number; desde: number; segundos: number }; // desde = s después de estabilizar
    pausaEn?: number;              // s después de estabilizar
  }): Muestra[]; // 10 Hz, 3,500 ft, 95 kt, C172, alas niveladas, ESTABLE.seg + DURACION_SEG + 5 s de vuelo
  ```
- Reglas que la prueba no fija sola:
  - **Armado:** al armarse en tierra queda `invalido` con el mismo motivo que `armar` del viraje.
  - **Inicio del tramo:** en `armado` se guarda una ventana de `ESTABLE.seg`. Cuando la ventana está estable, `objetivo` = esa muestra y la fase pasa a `manteniendo`.
  - **Medición:** en `manteniendo` se mide contra `objetivo`: altitud, `difRumbo` del rumbo, velocidad y bola. Termina cuando `m.t − objetivo.t ≥ DURACION_SEG`.
  - **NS:** con `analizar` (las mismas reglas `NS_SEGUNDOS`/`NS_FACTOR` del viraje).
  - **Calificación:** `100 − Σ campo min(25, 2·segundosFuera + 10·max(0, |peor|/tol − 1))`, redondeada y con 0 como mínimo.
  - **Resultado:** `elementos[k] = "S"` si el campo no es NS, y `aprobado` si todos son "S". `avisos` va vacío.
  - **Invalidez:** cualquier `invalidez(m, previo)` deja la fase en `invalido` con ese motivo.

- [ ] **Step 1: Escribe las pruebas que fallan** en `evaluadorRecto.test.ts`:
  ```ts
  const correr = (ms: Muestra[]) => ms.slice(1).reduce(avanzarRecto, armarRecto(ms[0]));
  test("un vuelo estable de 2 minutos aprueba con 100", () => {
    const ev = correr(simularRecto());
    assert.equal(ev.fase, "terminado");
    assert.equal(ev.resultado!.aprobado, true);
    assert.equal(ev.resultado!.calificacion, 100);
    assert.equal(Math.round(ev.resultado!.objetivo.altitud), 3500);
  });
  test("no empieza mientras el avión sigue subiendo", () => {
    const ms = simularRecto({ subidaSeg: 30 });
    const ev = correr(ms);
    assert.ok(ev.resultado!.objetivo.t >= ms[0].t + 30);
  });
  test("el rumbo cruza el norte sin error", () => {
    const ev = correr(simularRecto({ rumbo: 358, deriva: { campo: "rumbo", valor: 6, desde: 20, segundos: 10 } }));
    assert.equal(Math.round(ev.resultado!.peor.rumbo), 6);
    assert.equal(ev.resultado!.ns.rumbo, false);
  });
  test("una caída de 150 ft por 6 s es NS en altitud", () => {
    const ev = correr(simularRecto({ deriva: { campo: "altitud", valor: -150, desde: 30, segundos: 6 } }));
    assert.equal(ev.resultado!.elementos["1"], "NS");
    assert.equal(ev.resultado!.aprobado, false);
    assert.ok(ev.resultado!.calificacion < 100);
  });
  test("una pausa a media maniobra anula el intento", () => {
    const ev = correr(simularRecto({ pausaEn: 40 }));
    assert.equal(ev.fase, "invalido");
    assert.equal(ev.motivo, "Pausaste el simulador: el intento no se califica.");
  });
  test("termina a los 120 s del objetivo", () => {
    const r = correr(simularRecto()).resultado!;
    assert.ok(r.muestras.at(-1)!.t - r.objetivo.t >= 120 && r.muestras.at(-1)!.t - r.objetivo.t < 121);
  });
  ```
  Agrega `evaluadorRecto.test.ts` al script `"test"`.
- [ ] **Step 2:** Corre `node --experimental-strip-types --test src/features/instructor/evaluadorRecto.test.ts`. Expected: FAIL porque no existen los módulos.
- [ ] **Step 3:** Exporta `analizar` e `invalidez` de `evaluador.ts`. Implementa `rectoNivelado.ts`, `evaluadorRecto.ts` y `simularRecto`.
- [ ] **Step 4:** Corre `npm.cmd test`. Expected: todo pasa, incluidas las pruebas del viraje sin cambios.
- [ ] **Step 5: Commit** "Grade straight-and-level flight against the attitude the cadet settles into".

### Task 2: Voz, textos y guardado de recto y nivelado

**Files:**
- Create: `src/features/instructor/vozRecto.ts`, `src/features/instructor/explicacionRecto.ts`, `src/features/instructor/recto.test.ts`
- Modify: `src/features/instructor/voz.ts` (extraer la selección del aviso a `avisoDe`, que `avisoVoz` sigue usando sin cambiar su salida; exportar `CORRECCION`, `CORTO`, `NOMBRE`, `FUERA` y `luz`), `src/data/materialInstructor.ts`, `package.json`

**Interfaces:**
- Consumes: Task 1 (`EvaluacionRecto`, `ResultadoRecto`, `CampoRecto`, constantes); de `voz.ts`: `Luz`, `Aviso`, `paraVoz`; de `explicacion.ts`: `Linea`, `serie`; `traducirMotivo`.
- Produces:
  ```ts
  // voz.ts
  export function avisoDe<C extends string>(d: Record<C, number | null>, tol: Record<C, number>, campos: C[],
    textos: { corto: Record<C, string>; correccion: Record<C, { mas: string; menos: string }>; nombre: Record<C, string> },
    modo: "practica" | "checkride", idioma: Idioma): Aviso | null;
  // vozRecto.ts
  export type PasoRecto = "estabiliza" | "manten" | "mitad" | "terminado" | "invalido";
  export function pasoRecto(ev: EvaluacionRecto | null, m: Muestra | null): PasoRecto | null;
  export function ordenRecto(antes: PasoRecto | null, ahora: PasoRecto | null, ev: EvaluacionRecto | null, idioma: Idioma): string | null;
  export function textoPasoRecto(paso: PasoRecto | null, ev: EvaluacionRecto | null, idioma: Idioma): string;
  export function semaforoRecto(ev: EvaluacionRecto | null, m: Muestra | null): Record<CampoRecto, Luz>;
  export function avisoRecto(ev: EvaluacionRecto | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null;
  // explicacionRecto.ts
  export function briefingRecto(idioma: Idioma): string[];
  export function listaPasosRecto(paso: PasoRecto | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[];
  export function queHacerRecto(paso: PasoRecto | null, idioma: Idioma): string;
  export function explicarRecto(r: ResultadoRecto, idioma: Idioma): Linea[];
  export function repetirRecto(r: ResultadoRecto, idioma: Idioma): string | null;
  export function masFalladoRecto(rs: ResultadoRecto[], idioma: Idioma): string | null;
  export function paraGuardarRecto(r: ResultadoRecto): Omit<ResultadoRecto, "muestras"> & { series: Record<CampoRecto, { t: number; v: number }[]> };
  // materialInstructor.ts
  export const MATERIAL_RECTO: Material[];
  ```
- **Pasos:** `pasoRecto` devuelve:
  - `estabiliza` en `armado`;
  - `manten` en `manteniendo` antes de `MITAD_SEG`;
  - `mitad` desde `MITAD_SEG`;
  - la fase misma en `terminado` o `invalido`.
- **Órdenes** (`ordenRecto`); el número de altitud se redondea a 10 ft y se escribe con `toLocaleString("en-US")`, el rumbo va con 3 dígitos y la velocidad redondeada:
  - `estabiliza`: «Nivela y estabiliza: alas niveladas, altitud y velocidad constantes.» / "Level off and stabilize: wings level, constant altitude and airspeed."
  - `manten`: `Mantén ${alt} pies, rumbo ${rrr} y ${kt} nudos durante dos minutos.` / `Hold ${alt} feet, heading ${rrr} and ${kt} knots for two minutes.`
  - `mitad`: «Un minuto. Sigue así.» / "One minute. Keep it up."
  - `invalido`: igual que el viraje, `Intento anulado. ${motivo traducido}`.
- **Avisos del rumbo:** el corto es «Cuida el rumbo» / "Watch your heading" y el nombre «rumbo» / "heading". La corrección es:
  - positivo: «Te vas a la derecha: regresa a tu rumbo» / "Drifting right: back to your heading";
  - negativo: «Te vas a la izquierda: regresa a tu rumbo» / "Drifting left: back to your heading".
  - Altitud, velocidad y bola reutilizan los textos del viraje.
  - Solo hay avisos y semáforo en `manteniendo`; en lo demás, gris.
- **Pasos en pantalla:** «Estabiliza», «Mantén», «Un minuto» / "Stabilize", "Hold", "One minute".
- **Qué hacer** (`queHacerRecto`):
  - `estabiliza`: «Alas niveladas y potencia fija: el instructor empieza cuando el avión deje de subir o bajar.» / "Wings level and power set: the instructor starts once the airplane stops climbing or descending."
  - `manten` y `mitad`: «Compensa y corrige con cambios pequeños.» / "Trim, and correct with small changes."
- **Briefing:** siete líneas en este orden. La tercera sale de `TOLERANCIAS_RECTO`, `DURACION_SEG` y la bola:
  1. «Hoy vas a practicar vuelo recto y nivelado en el Cessna 172: la base de todas las maniobras.»
  2. «Vuela a la altitud y velocidad que quieras. Cuando el avión esté estable, el instructor toma tu altitud, rumbo y velocidad.»
  3. «Durante 2 minutos mantén la altitud ±100 ft, el rumbo ±10° y la velocidad ±10 kt, con la bola centrada.»
  4. «Fija la actitud con el horizonte, pon la potencia y compensa para no cargar el yugo.»
  5. «Mira afuera y revisa los instrumentos en ciclo: actitud, altímetro, rumbo y velocidad.»
  6. «Primero practicas; cuando quieras, pasas al intento calificado.»
  7. «Cuando estés listo, presiona «Listo, empiezo».»
  
  En inglés, el mismo sentido y en el mismo orden; la última línea es "When you're ready, press «Ready, let's start»."
- **Explicación** (`explicarRecto`): una línea "mal" por cada campo con tramos fuera:
  - altitud baja: `Perdiste ${ft} ft. Revisa la actitud y compensa para no cargar el yugo.` / `You lost ${ft} ft. Check your attitude and trim so you aren't holding the yoke.`
  - altitud alta: `Subiste ${ft} ft. Baja un poco la nariz y compensa.` / `You gained ${ft} ft. Lower the nose a little and trim.`
  - rumbo: `Te desviaste ${g}° del rumbo. Mantén las alas niveladas y toma una referencia en el horizonte.` / `You drifted ${g}° off heading. Keep the wings level and pick a point on the horizon.`
  - velocidad: `La velocidad se te fue ${kt} kt. Ajusta la potencia y deja que se estabilice antes de compensar.` / `Your airspeed drifted ${kt} kt. Set the power and let it settle before you trim.`
  - bola: «La bola se salió del centro: corrige con el pedal.» / "The ball left center: correct with the rudder."
  
  Luego, una línea "bien" con los campos limpios, igual que en el viraje: `${Lista}, bien todo el tramo.` / `${List}, good the whole time.`
- **Repetir** (`repetirRecto`): si no aprobó, «Repite: recto y nivelado» / "Repeat: straight and level"; si aprobó, null.
- **Lo que más se salió** (`masFalladoRecto`): toma el campo con más segundos fuera en todos los resultados y arma `Lo que más se te salió fue ${nombre}: ${consejo}` / `What slipped the most was your ${nombre}: ${consejo}`, con el consejo de la explicación de ese campo. Devuelve null si todo estuvo dentro.
- **Guardado** (`paraGuardarRecto`): una serie de ≤300 puntos por campo contra el objetivo; el rumbo va con `difRumbo`.
- **Material** (`MATERIAL_RECTO`):
  - «Academia: Fundamentos de vuelo» / "Academy: Flight fundamentals" → `ROUTES.academiaModulo("fundamentos")`, no exclusivo;
  - el checklist del C172, igual que en el viraje.

- [ ] **Step 1: Escribe las pruebas que fallan** en `recto.test.ts`:
  - **«los pasos siguen el tramo»:** con `simularRecto()` avanzado hasta 10 s, 70 s y el final, `pasoRecto` da `manten`, `mitad` y `terminado`; antes de estabilizar da `estabiliza`.
  - **«la orden de mantener dice los números del objetivo»:** `ordenRecto("estabiliza", "manten", ev, "es")` es «Mantén 3,500 pies, rumbo 090 y 95 nudos durante dos minutos.»
  - **«el aviso del rumbo dice hacia dónde se va»:** con el objetivo a 090 y la muestra a 099 en práctica, `avisoRecto(...).texto` contiene «Te vas a la derecha».
  - **«sin tramo no hay semáforo»:** `semaforoRecto` en `armado` da gris en los cuatro campos.
  - **«la explicación nombra la caída»:** con la deriva de −150 ft de la Task 1, `explicarRecto` incluye una línea que empieza con «Perdiste 150 ft» y `repetirRecto` da «Repite: recto y nivelado».
  - **«avisoVoz no cambia»:** las pruebas existentes de `voz.test.ts` siguen pasando sin tocarlas.
  - **«en inglés no hay español»:** recorre el briefing, los pasos, el qué hacer, las órdenes de los cuatro pasos, la explicación y el repetir en inglés con `/[áéíóúñ¿¡]/`.
  - **«lo guardado no trae muestras y cabe»:** `paraGuardarRecto(r)` no tiene `muestras`, cada serie tiene ≤300 puntos y `JSON.stringify` mide < 200000.

  Agrega `recto.test.ts` al script `"test"`.
- [ ] **Step 2:** Corre las pruebas. Expected: FAIL porque no existen los módulos.
- [ ] **Step 3:** Implementa `avisoDe`, `vozRecto.ts`, `explicacionRecto.ts` y `MATERIAL_RECTO`.
- [ ] **Step 4:** Corre `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 5: Commit** "Give straight and level its own steps, warnings, briefing and explanation".

### Task 3: Una definición por maniobra

**Files:**
- Create: `src/features/instructor/maniobras.ts`, `src/features/instructor/maniobras.test.ts`
- Modify: `src/features/instructor/actividades.ts` (+test), `src/features/instructor/sesion.ts` (+test), `src/features/instructor/briefing.ts` (+test), `src/features/instructor/preguntas.ts` (`Tema` gana `"recto-nivelado"`), `package.json`

**Interfaces:**
- Consumes: Tasks 1–2; las funciones del viraje (`armar`, `avanzar`, `armarSolo`, `pasoVoz`, `ordenVoz`, `textoPaso`, `semaforo`, `avisoVoz`, `briefing`, `listaPasos`, `queHacer`, `explicar`, `repetir`, `paraGuardar`, `ELEMENTOS_ACS`).
- Produces:
  ```ts
  // maniobras.ts
  export type ManiobraId = "viraje-escarpado" | "recto-nivelado";
  export type FaseComun = "armado" | "en-curso" | "terminado" | "invalido";
  export interface ResultadoComun { aprobado: boolean; calificacion: number; elementos: Record<string, "S" | "NS">; avisos: string[]; muestras: Muestra[] }
  /** Métodos con sintaxis de método: cada definición tipa su E y su R, y el registro las guarda como DefManiobra. */
  export interface DefManiobra<E = any, R extends ResultadoComun = any> {
    id: ManiobraId; insignia: string; avion: "C172";
    titulo: Record<Idioma, string>;                 // "Viraje escarpado C172" / "Recto y nivelado C172"
    tarea: Record<Idioma, string>;                  // renglón de tarea del reporte
    elementosReporte: { codigo: string; texto: string; textoEn: string }[];
    celdas: { campo: string; nombre: Record<Idioma, string> }[]; // semáforo, en orden
    temas: Tema[];
    armar(m: Muestra): E; avanzar(e: E, m: Muestra): E; armarSolo(e: E | null, m: Muestra): boolean;
    fase(e: E): FaseComun; motivo(e: E): string | undefined; resultado(e: E): R | null;
    paso(e: E | null, m: Muestra | null): string | null;
    orden(antes: string | null, ahora: string | null, e: E | null, idioma: Idioma): string | null;
    textoPaso(paso: string | null, e: E | null, idioma: Idioma): string;
    pasos(paso: string | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[];
    queHacer(paso: string | null, idioma: Idioma): string;
    semaforo(e: E | null, m: Muestra | null): Record<string, Luz>;
    aviso(e: E | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null;
    briefing(idioma: Idioma): string[];
    explicar(r: R, idioma: Idioma): Linea[]; repetir(r: R, idioma: Idioma): string | null;
    masFallado(rs: R[], idioma: Idioma): string | null;
    paraGuardar(r: R): object;
  }
  export const MANIOBRAS: Record<ManiobraId, DefManiobra>;
  export function defDe(id: string | null | undefined): DefManiobra;        // desconocida o null → viraje
  export function lecturaFinalDe(def: DefManiobra, r: ResultadoComun, idioma: Idioma): string[]; // misma forma que lecturaFinal
  // actividades.ts: cada Actividad gana
  calificado: Record<Idioma, string>; // "checkride" en todas menos recto-nivelado: { es: "intento calificado", en: "graded attempt" }
  // recto-nivelado pasa a disponible: true
  // sesion.ts
  export type IntentoSesion = { modo: Modo; resultado: ResultadoComun; id: string | null };
  export function comentarioIntento(i: IntentoSesion, numero: number, idioma?: Idioma, explicar?: (r: any, idioma: Idioma) => Linea[]): string; // por omisión, el del viraje
  // briefing.ts
  export type OpcionesDebriefing = { masFallado: (rs: any[], idioma: Idioma) => string | null; repetir: (r: any, idioma: Idioma) => string | null; calificado: Record<Idioma, string> };
  export function masFalladoViraje(rs: Resultado[], idioma: Idioma): string | null; // lo que hoy hace CONSEJO adentro de debriefing
  export function debriefing(intentos, material, idioma = "es", respondidas = [], op: OpcionesDebriefing = DEBRIEF_VIRAJE): {...};
  ```
- **Viraje:** `defViraje` envuelve las funciones existentes. `fase` traduce `viraje1`/`entre`/`viraje2` a `en-curso`; `textoPaso` ignora `e`. Sus `celdas` son altitud, velocidad, inclinación y bola, con los nombres que hoy tiene `t.celdas`. Sus temas son `["viraje-escarpado", "c172"]` y su `tarea` es la de `textosReporte`.
- **Recto y nivelado:** `defRecto` usa Tasks 1–2. Celdas: altitud, rumbo, velocidad y bola. Temas: `["recto-nivelado", "c172"]`. Insignia: `"maniobra-recto-nivelado-c172"`. Tarea: «Práctica · Recto y nivelado» / "Practice · Straight and level". `elementosReporte` lleva los códigos "1"–"4" con estos textos *(decisión de Claude: no es tarea del ACS, así que no lleva código del ACS)*:
  - «Mantiene la altitud ±100 ft» / "Maintains altitude ±100 ft"
  - «Mantiene el rumbo ±10°» / "Maintains heading ±10°"
  - «Mantiene la velocidad ±10 kt» / "Maintains airspeed ±10 kt"
  - «Vuelo coordinado: bola centrada» / "Coordinated flight: ball centered"
- **Sesión:** las sugerencias de `avanzarSesion` usan el `calificado` de `s.actividad`; con `null`, «checkride». Quedan así:
  - `Ya tienes tres intentos: puedes pasar al ${c} o seguir practicando.` / `That's three attempts: you can move on to the ${c} or keep practicing.`
  - `Ya llevamos 35 minutos: cuando quieras pasamos al ${c}.` / `We're 35 minutes in: whenever you're ready, we'll move on to the ${c}.`
- **Debriefing:** las líneas de `Checkride:` y «del primer intento al checkride» usan `op.calificado`, con mayúscula inicial al empezar la línea. `vozDebriefing` reconoce `/^(Checkride|Intento calificado|Graded attempt|Preguntas|Questions):/`.

- [ ] **Step 1: Escribe las pruebas que fallan:**
  - **maniobras.test «defViraje dice lo mismo que las funciones del viraje»:** con `simularManiobra()` muestra por muestra, `defViraje.paso`, `.orden`, `.semaforo`, `.aviso` y `.textoPaso` dan lo mismo que `pasoVoz`, `ordenVoz`, `semaforo`, `avisoVoz` y `textoPaso`. Al final, `explicar` y `repetir` dan lo mismo y `paraGuardar` es igual a `paraGuardar(r)`.
  - **maniobras.test «defDe cae al viraje con una maniobra desconocida»:** `defDe("otra").id === "viraje-escarpado"`, `defDe(null).id === "viraje-escarpado"` y `defDe("recto-nivelado").id === "recto-nivelado"`.
  - **maniobras.test «recto completo por la definición»:** con `simularRecto()` vía `defRecto.armar/avanzar`, `fase` termina en `terminado` y `resultado(e).calificacion === 100`. `lecturaFinalDe(defRecto, r, "es")[0]` es «Aprobado. Calificación: 100 de 100.».
  - **maniobras.test «las celdas en inglés no tienen español»:** recorre `celdas`, `titulo.en`, `tarea.en` y `elementosReporte.textoEn` de las dos con `/[áéíóúñ¿¡]/`.
  - **sesion.test «recto y nivelado sugiere el intento calificado»:** con una sesión `actividad: "recto-nivelado"` en práctica, el tercer intento dice «Ya tienes tres intentos: puedes pasar al intento calificado o seguir practicando.».
  - **briefing.test «el debriefing de recto y nivelado nombra el intento calificado»:** con `op` de recto y un intento calificado no aprobado, una línea empieza con «Intento calificado: no aprobado» y la última es «Repite: recto y nivelado». `vozDebriefing(..., "necesario")` incluye la línea «Intento calificado:».
  - **actividades.test:** `estadoActividad(recto, false) === "abierta"`. Hoy es «proximamente»; actualiza esa expectativa.

  Agrega `maniobras.test.ts` al script `"test"`.
- [ ] **Step 2:** Corre las pruebas. Expected: FAIL porque no existe `maniobras.ts` y las sugerencias siguen diciendo «checkride».
- [ ] **Step 3:** Implementa `maniobras.ts` y los cambios de `actividades.ts`, `sesion.ts`, `briefing.ts` y `preguntas.ts`.
- [ ] **Step 4:** Corre `npm.cmd test` y `npx tsc -b --noEmit`. Expected: todo pasa. El programa todavía compila con el viraje directo, porque los parámetros nuevos tienen valor por omisión.
- [ ] **Step 5: Commit** "Describe each maneuver in one definition the program can follow".

### Task 4: Banco de preguntas de recto y nivelado

**Files:**
- Modify: `src/features/instructor/bancoPreguntas.ts`
- Modify (fuera del repo): el script de la hoja de revisión `hoja-preguntas.mjs` del scratchpad, que gana el tema «Recto y nivelado», y el artifact de revisión https://claude.ai/artifact/TjQ9TBKHhBknBMC6MsFeFy

**Interfaces:**
- Consumes: `Tema` con `"recto-nivelado"` (Task 3); el helper `p(...)` del banco.
- Produces: 15–20 preguntas `rn-1…rn-N` con tema `"recto-nivelado"`, de respuesta corta y en los dos idiomas, que salen de la Academia (Fundamentos, Instrumentos) y del C172S:
  - las cuatro fuerzas en equilibrio (sustentación = peso, empuje = resistencia);
  - qué instrumento confirma el nivel (altímetro), el rumbo (indicador de rumbo) y las alas niveladas (indicador de actitud o coordinador de viraje);
  - para qué sirve el compensador;
  - qué hacer si la nariz sube sola;
  - cómo corregir altitud con potencia o actitud;
  - el ciclo de revisión de instrumentos;
  - qué indica la bola descentrada y con qué pedal se corrige;
  - el efecto de reducir potencia sin tocar el yugo;
  - las tolerancias de esta práctica (±100 ft, ±10°, ±10 kt).

  Ninguna aceptada se normaliza a sí/no/yes, y cada respuesta del instructor se califica correcta (las pruebas existentes del banco lo comprueban).

- [ ] **Step 1:** En `bancoPreguntas.test.ts`, agrega `"recto-nivelado"` a la lista fija de la prueba «15 a 20 preguntas por tema». Corre `node --experimental-strip-types --test src/features/instructor/bancoPreguntas.test.ts`. Expected: FAIL con `recto-nivelado: 0`.
- [ ] **Step 2:** Escribe las preguntas en `bancoPreguntas.ts`.
- [ ] **Step 3:** Corre `npm.cmd test`. Expected: todo pasa.
- [ ] **Step 4:** Regenera la hoja de revisión con el tema nuevo y vuelve a publicar el mismo artifact para que Erik la revise.
- [ ] **Step 5: Commit** "Add the straight-and-level question bank for Erik to review".

### Task 5: El programa sigue la maniobra elegida

**Files:**
- Create: `src/features/instructor/useIntento.ts`, `src/features/instructor/HojaRecto.tsx`, `src/features/instructor/vistasManiobra.tsx`
- Modify:
  - `src/features/instructor/useIntentoViraje.ts`: se vuelve un envoltorio de `useIntento(defViraje, opciones)` que devuelve lo mismo que hoy. `series` (con `paraGuardar(resultado).series`) y `bajo` se calculan en el envoltorio.
  - `src/features/instructor/intentos.ts`: `guardarIntento` recibe `resultado: ResultadoComun` y `detalle: object`.
  - `src/features/instructor/ExplicacionInstructor.tsx`: prop opcional `def`, que por omisión es la del viraje.
  - `src/features/instructor/ReporteExamen.tsx`: props opcionales `def` y `calificado`.
  - `src/features/instructor/idiomaInstructor.ts`: `textosReporte(idioma, calificado?: "checkride" | "intento")`.
  - `src/pages/InstructorPrograma.tsx`.
  - `src/features/instructor/idiomaInstructor.test.ts`.

**Interfaces:**
- Consumes: Task 3 (`defDe`, `DefManiobra`, `lecturaFinalDe`, `ACTIVIDADES[].calificado`); `MATERIAL_VIRAJE` y `MATERIAL_RECTO`.
- Produces:
  ```ts
  export function useIntento(def: DefManiobra, opciones?: Opciones): { estado, muestra, modo, cambiarModo, modoIntento, ev, resultado, anulado, enCurso, iniciar, reiniciar, guardado, guardar, intento, numero, intentos, mandar, envio, aprobadoPorErik };
  export const HOJA: Record<ManiobraId, (p: { resultado: any; idioma: Idioma }) => JSX.Element>; // vistasManiobra.tsx: viraje → HojaCheckride, recto → HojaRecto
  ```
- **Reporte del intento calificado** (`textosReporte` con `calificado: "intento"`):
  - título: «INTENTO CALIFICADO APROBADO» / «INTENTO CALIFICADO NO APROBADO»; en inglés, "GRADED PRACTICE ATTEMPT — PASSED" / "GRADED PRACTICE ATTEMPT — NOT PASSED";
  - subtítulo: «Práctica de vuelo simulada» / "Simulated flight practice";
  - lo que falta repetir: «Elementos a repetir:» / "Items to repeat:";
  - el aviso no cambia.
  - Sin `calificado`, todo queda como hoy.
- **HojaRecto:** una fila por campo con su tolerancia y el peor valor: altitud con signo en ft, rumbo con signo en °, velocidad en kt y la bola centrada o fuera. El estilo es el de `HojaCheckride`.
- **InstructorPrograma** toma `const def = defDe(sesion.actividad)` y cambia lo siguiente:
  - **Hook:** `useIntento(def, ...)` en lugar de `useIntentoViraje`.
  - **Pasos y voz:** lo que hoy llama a funciones del viraje sale de `def`: paso, orden, aviso, semáforo, texto del paso, lista de pasos, qué hacer, briefing y explicación.
  - **Lectura final:** `lecturaFinalDe(def, ...)`.
  - **Comentario de cada intento:** `comentarioIntento(..., def.explicar)`.
  - **Debriefing:** con `{ masFallado: def.masFallado, repetir: def.repetir, calificado }` y el material de esa maniobra.
  - **Semáforo:** las celdas salen de `def.celdas`.
  - **Encabezado:** `Instructor virtual · ${def.titulo}` / `Virtual instructor · ${def.titulo}`.
  - **Nombre del intento calificado:** el bloque «Checkride» y el botón «Pasar al …» usan `calificado`; el botón dice `Pasar al ${c}` / `Move on to the ${c}`.
  - **Hoja, explicación y reporte:** `HOJA[def.id]`, `Explicacion def={def}` y `ReporteExamen def={def} calificado={...}`.
  - **Preguntas:** el tema es `def.temas`. Los momentos son los de la fase 1: al entrar a la preparación y después del comentario de cada intento de práctica, nunca en el intento calificado *(decisión de Claude: en recto y nivelado el momento tranquilo es entre intentos, como en el viraje; preguntar a media retención le quitaría atención al tramo calificado)*.
  - **Sin cambios:** el viraje se ve y suena igual que hoy.

- [ ] **Step 1: Escribe la prueba que falla:** en `idiomaInstructor.test.ts`, «el reporte del intento calificado no dice checkride ni Notice of Disapproval». Comprueba que `textosReporte("en", "intento").titulo(false)` sea "GRADED PRACTICE ATTEMPT — NOT PASSED", que ningún texto en inglés tenga español y que `aviso` siga igual en los dos idiomas.
- [ ] **Step 2:** Corre la prueba. Expected: FAIL.
- [ ] **Step 3:** Implementa los archivos de esta tarea.
- [ ] **Step 4:** Corre `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build`. Expected: todo pasa.
- [ ] **Step 5: Verifica en el navegador.** Arranca vite en el worktree (`node node_modules/vite/bin/vite.js --port 5180 --strictPort`) y abre `/instructor/programa` a 380 px.
  - **Lector falso:** en el panel, sustituye `window.fetch` para las URLs `127.0.0.1:8766`. Que devuelva `{ conectado: true, muestra, muestras }` de un vuelo recto a 10× de velocidad: `t` avanza 10 s por segundo real, así el tramo de 2 minutos dura unos 12 s.
  - **Recorrido en español:** idioma → menú → «Recto y nivelado» → briefing → «Listo» → la orden «Mantén … durante dos minutos» → resultado con la hoja de recto → «Pasar al intento calificado» → debriefing con «Intento calificado:» → cierre con el reporte «INTENTO CALIFICADO …».
  - **Desviación:** mete una deriva de rumbo de 15° en el falso y confirma el aviso «Te vas a la derecha».
  - **Inglés:** repite el recorrido en inglés.
  - **Viraje:** con el lector `--simulado` real, si el puerto está libre, confirma que la sesión del viraje sigue igual hasta la primera orden y el primer resultado.
  - **Ancho:** sin scroll horizontal.
- [ ] **Step 6: Commit** "Run straight and level in the instructor program".

### Task 6: Panel de Erik e insignia

**Files:**
- Modify: `src/pages/AdminManiobras.tsx`, `src/pages/Perfil.tsx`

**Interfaces:**
- Consumes: `defDe`, `HOJA`, `ReporteExamen` con `def` y `calificado` (Tasks 3 y 5); `insigniaManiobraGanada`.
- Produces:
  - **Panel de Erik:** `/admin/maniobras` muestra cada intento por revisar con `HOJA[defDe(i.maniobra).id]` y `ReporteExamen def={defDe(i.maniobra)}`. El reporte lleva `calificado="intento"` solo cuando la maniobra es recto y nivelado.
  - **Insignia en el perfil:** una insignia «Recto y nivelado · C172» con id `maniobra-recto-nivelado-c172`. Su descripción es «Se gana cuando Erik revisa y aprueba tu intento calificado del instructor virtual. Práctica en simulador, no es una evaluación oficial.». Se lee con `fetchMisIntentosManiobra("recto-nivelado")`, igual que la del viraje.

- [ ] **Step 1:** La lógica que se elige aquí ya tiene prueba en Task 3 (`defDe`) y en las pruebas existentes de `insigniaManiobraGanada`. Corre `npm.cmd test` como línea base. Expected: pasa.
- [ ] **Step 2:** Implementa los dos cambios.
- [ ] **Step 3:** Corre `npx tsc -b --noEmit` y `npm.cmd run build`. Expected: todo pasa. Abre `/perfil` en el navegador y confirma que aparece la insignia nueva, bloqueada. `/admin/maniobras` necesita la sesión de Erik: queda como verificación suya.
- [ ] **Step 4: Commit** "Let Erik review straight-and-level attempts and award its badge".
