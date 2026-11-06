# Sesión de una hora con el instructor — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La ventana del instructor (`/instructor/programa`) se vuelve una sesión de una hora en bloques (idioma → briefing → preparación → práctica → checkride → debriefing → cierre), en español o inglés, con una voz que no corta frases y que el cadete configura.

**Architecture:**
- Todo lo que decide qué decir o a qué bloque pasar es puro y probado: textos por idioma en los módulos que ya existen (`voz.ts`, `explicacion.ts`), una cola de voz (`colaVoz.ts`), el plan de sesión (`sesion.ts`) y el briefing/debriefing (`briefing.ts`).
- `useVoz` reproduce la cola. `useIntentoViraje` recibe opciones para que la sesión controle el modo, el armado y el id de sesión.
- La base solo gana la columna `sesion_id`; `/admin/maniobras` agrupa por ella.

**Tech Stack:** React 19, Vite, TS, Tailwind v4, Supabase, Web Speech API.

**Spec:** `docs/superpowers/specs/2026-11-05-instructor-sesion-hora-design.md`

## Global Constraints

- **Pruebas:** `node --experimental-strip-types --test`. Cada archivo nuevo de prueba se agrega a la lista explícita del script `test` de package.json. Los módulos probados importan con extensión `.ts`.
- **Verificaciones:** `npx tsc -b --noEmit`, `npm.cmd test` y `npm.cmd run build` limpios.
- **Idioma:** `export type Idioma = "es" | "en"`. Toda función de texto que gane idioma lo recibe como **último parámetro con valor por defecto `"es"`**: la página web no cambia y las pruebas actuales siguen pasando sin tocarlas.
- **Avisos del reporte, exactos:**
  - es (no cambia): "Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica."
  - en: "Simulator practice. Not an official document and does not replace an exam before an aviation authority."
- **Títulos del reporte en inglés:** "PRACTICE CHECKRIDE — PASSED" / "PRACTICE CHECKRIDE — NOT PASSED". Nunca "Notice of Disapproval".
- **Copy:** sin "certificado", "licencia", "CFI", "certified" ni "Garmin". Unidades ft y kt en los dos idiomas.
- **Constantes:** tolerancias, altura y ángulos salen de `virajeEscarpado.ts` (`TOLERANCIAS`, `ALTURA_SEGURA_AGL`, `INCLINACION_OBJETIVO`, `LIMPIEZA`), nunca escritas a mano.
- **Velocidades de voz:** lenta 0.85, normal 1, rápida 1.15.
- **Base de datos:** la migración `0023_sesion_instructor.sql` la corre Erik en el SQL Editor **antes** de subir el código, porque las consultas nuevas leen `sesion_id`.
- **Commits:** archivos específicos con `git add`, nunca `git add .`. No push sin "Sí, súbelo".
- **Ediciones:** nunca con PowerShell `Get-Content`/`Set-Content` (BOM y mojibake): usar Edit/Write.

## Review Focus

1. **Español colado en una sesión en inglés:** los motivos de anulación y el aviso de altura del evaluador son texto en español. Toda cadena que el evaluador puede devolver debe tener inglés. Prueba "cada motivo del evaluador tiene inglés" (Task 1).
2. **Aviso viejo:** si un aviso deja de aplicar mientras el instructor sigue hablando, no debe decirse después. Prueba "un aviso que ya no aplica se descarta al llegarle el turno" (Task 3).
3. **Intentos que no cuentan:** un intento anulado no suma a la meta de 3 prácticas ni cierra el checkride. El hook solo llama `alTerminar` con resultado calificado (Task 6, verificado con una pausa en `--simulado`), y la sesión ignora intentos del modo equivocado (prueba "un intento de práctica no cierra el checkride", Task 4).
4. **PC sin voz en el idioma elegido:** el programa sigue en texto y lo dice, sin tomar una voz de otro idioma. Prueba "sin voz en inglés devuelve null" (Task 3).
5. **Intentos de la página en el panel:** los intentos sin `sesion_id` no forman una sesión falsa. Prueba "los intentos sin sesión no se agrupan" (Task 5).

---

### Task 1: Textos del instructor en inglés

**Files:**
- Create: `src/features/instructor/idiomaInstructor.ts`, `src/features/instructor/idiomaInstructor.test.ts`
- Modify: `src/features/instructor/voz.ts`, `src/features/instructor/explicacion.ts`, `src/features/instructor/voz.test.ts`, `src/features/instructor/explicacion.test.ts`, `package.json`

**Interfaces:**
- Produces, en `idiomaInstructor.ts`:
  - `type Idioma = "es" | "en"`
  - `traducirMotivo(motivo: string, idioma?: Idioma): string`: los 4 motivos fijos de `invalidez()` y "Despega primero…" de `evaluador.ts` con su inglés; el del avión con regex sobre «…». En español devuelve el mismo texto.
  - `traducirAviso(aviso: string, idioma?: Idioma): string`: "Bajaste de 1500 ft sobre el terreno: haz la maniobra más alto." → "You went below 1500 ft above the ground: fly the maneuver higher."
  - ponytail: tabla español→inglés en vez de códigos en el evaluador; si el evaluador gana más textos, pasar a códigos.
- Produces, `idioma` como último parámetro (default "es") en: `avisoVoz`, `ordenVoz` (usa `traducirMotivo`), `textoPaso`, `textoEspera`, `lecturaFinal` (usa `traducirAviso` en `r.avisos`), `paraVoz`, `explicar`, `repetir`.
- Inglés fijo:
  - Órdenes: bajo "Climb to 1,500 feet above the ground." · limpieza "Clear the area with your clearing turns." · despejado "Area clear. Begin your 360-degree steep turn." · nivelar1/2 "Roll out on your entry heading." · entre "Now the other direction." · invalido "Attempt cancelled. <motivo>".
  - Avisos checkride: "Watch your altitude", "Check your airspeed", "Watch your bank", "Center the ball". Rojo: "Out of tolerance: altitude" (airspeed, bank, coordination).
  - Correcciones de práctica: "You're climbing: ease the back pressure" / "You're losing altitude: more back pressure" · "Too fast: reduce power" / "Too slow: add power" · "Past 45 degrees: shallow the bank" / "Not enough bank: roll to 45 degrees" · "Center the ball with the rudder". Rojo de práctica: "Out of tolerance. <corrección>".
  - Final: "Passed." / "Not passed." y "Score: <n> out of 100."
  - `repetir`: "Repeat: left turn" / "Repeat: right turn" / "Repeat: both turns" / "Repeat: the whole maneuver".
  - `paraVoz(…, "en")`: ft→feet, kt→knots, °→" degrees", ±→"plus or minus ".
  - El resto de `explicar`, `textoPaso` y `textoEspera` en inglés de checkride (steep turn, clearing turns, yoke, rudder), con los mismos números.

- [ ] **Step 1: Write the failing tests**
  - `idiomaInstructor.test.ts`:
    - "cada motivo del evaluador tiene inglés": arma muestras que anulen por pausa, slew, tasa 2, hueco de 3 s, en tierra y avión "Cessna 152"; para cada `ev.motivo`, `traducirMotivo(m, "en")` no es igual a `m` y no contiene "á", "é", "í", "ó", "ú", "ñ" ni "intento".
    - "en español no cambia": `traducirMotivo(m)` === `m`.
    - `traducirAviso` con el aviso de altura da el texto inglés de arriba.
  - `voz.test.ts`: `ordenVoz("limpieza", "despejado", ev, "en")` === "Area clear. Begin your 360-degree steep turn."; `avisoVoz` checkride ámbar de altitud en "en" da "Watch your altitude"; `paraVoz("100 ft ±5°", "en")` === "100 feet plus or minus 5 degrees"; `lecturaFinal(r, "en")[0]` empieza con "Passed." o "Not passed.".
  - `explicacion.test.ts`: con S1 NS, la primera línea de `explicar(r, "en")` === "You didn't do clearing turns before entering: look for traffic with a turn of at least 90°."; `repetir(rDosLados, "en")` === "Repeat: both turns".
- [ ] **Step 2: Run** `npm.cmd test`. Expected: FAIL (`traducirMotivo` no existe y los textos en inglés no coinciden).
- [ ] **Step 3: Implement** según Interfaces. Los textos por idioma van como `Record<Idioma, …>` junto a los que ya existen en cada archivo.
- [ ] **Step 4: Run** `npm.cmd test` y `npx tsc -b --noEmit`. Expected: PASS; las pruebas en español de antes pasan sin cambios.
- [ ] **Step 5: Commit** "Give the instructor's spoken and written texts an English version".

### Task 2: Hoja, explicación y reporte en inglés

**Files:**
- Modify: `src/features/instructor/HojaCheckride.tsx`, `src/features/instructor/ExplicacionInstructor.tsx`, `src/features/instructor/ReporteExamen.tsx`, `src/features/instructor/virajeEscarpado.ts`, `src/features/instructor/idiomaInstructor.ts`, `src/features/instructor/idiomaInstructor.test.ts`

**Interfaces:**
- Consumes: `Idioma`, `explicar`, `repetir`, `traducirAviso` (Task 1).
- Produces:
  - Prop opcional `idioma?: Idioma` (default "es") en `HojaCheckride`, `Explicacion` y `ReporteExamen`.
  - `ELEMENTOS_ACS` gana `textoEn` por elemento: S1 "Clear the area", S2 "Entry airspeed ≤ Va", S3 "Coordinated 360° at ~45°", S4 "Repeat in the opposite direction", S5 "Alt ±100 · Spd ±10 · Bank ±5 · Hdg ±10".
  - En `idiomaInstructor.ts`: `textosReporte(idioma?: Idioma): { titulo: (aprobado: boolean) => string; subtitulo: string; aviso: string; … }` con todas las etiquetas del reporte (Aspirante/Applicant, Fecha/Date, Aeronave/Aircraft, Intento/Attempt, Calificación/Score, Folio de verificación/Verification code, Áreas a re-examinar/Areas to re-test, Revisó/Reviewed by, Descargar PDF/Download PDF, "Área V · Tarea A: Virajes escarpados"/"Area V · Task A: Steep turns"). Subtítulo en: "Simulated practical test". Fecha con `toLocaleDateString("en-US", …)` en inglés.
  - `AVISO_REPORTE` se queda exportado igual y `textosReporte("es").aviso` es ese mismo valor.

- [ ] **Step 1: Write the failing test** en `idiomaInstructor.test.ts`: `textosReporte("en").aviso` === el aviso en inglés de Global Constraints; `textosReporte("en").titulo(false)` === "PRACTICE CHECKRIDE — NOT PASSED"; ningún texto de `textosReporte("en")` contiene "Disapproval", "FAA" ni "certif"; `textosReporte("es").aviso` === `AVISO_REPORTE`.
- [ ] **Step 2: Run** `npm.cmd test`. Expected: FAIL (`textosReporte` no existe).
- [ ] **Step 3: Implement** `textosReporte` y la prop `idioma` en los tres componentes. La hoja en inglés: Tolerance, Left, Right, Bank, Altitude, Airspeed, Coordination (ball) centered/out, Exit heading, "All N criteria within tolerance." / "N of M criteria out of tolerance.", PASSED / NOT PASSED. Explicación en inglés: título "What your instructor says", y `resultado.avisos` pasan por `traducirAviso`.
- [ ] **Step 4: Run** `npm.cmd test` y `npx tsc -b --noEmit`. Expected: PASS. `/instructor/viraje-escarpado` y `/admin/maniobras` se ven igual que antes (no pasan idioma).
- [ ] **Step 5: Commit** "Let the checkride sheet, explanation and report render in English".

### Task 3: Cola de voz y ajustes

**Files:**
- Create: `src/features/instructor/colaVoz.ts`, `src/features/instructor/colaVoz.test.ts`
- Modify: `src/features/instructor/useVoz.ts`, `src/pages/InstructorPrograma.tsx` (solo para que compile con la nueva firma de `decir`), `package.json`

**Interfaces:**
- Consumes: `Idioma` (Task 1).
- Produces, en `colaVoz.ts`:
  - `type TipoPieza = "orden" | "aviso" | "anulado" | "final" | "prueba"`
  - `type Pieza = { tipo: TipoPieza; texto: string; clave?: string }` (`clave` solo en avisos: la de `Aviso.clave`).
  - `encolar(cola: Pieza[], p: Pieza): { cola: Pieza[]; cortar: boolean }`:
    - "anulado" y "prueba": vacía la cola, `cortar: true`.
    - "aviso": reemplaza cualquier aviso que ya esté en la cola (solo espera uno, el más nuevo).
    - "orden" y "final": van al final, `cortar: false`.
  - `siguiente(cola: Pieza[], avisoVigente: string | null): { pieza: Pieza | null; cola: Pieza[] }`: saca la primera; si es un aviso cuya `clave` no es `avisoVigente`, la descarta y sigue con la próxima.
  - `type Velocidad = "lenta" | "normal" | "rapida"`; `RITMO: Record<Velocidad, number> = { lenta: 0.85, normal: 1, rapida: 1.15 }`.
  - `type Detalle = "detallado" | "necesario"`.
  - `escogerVoz(voces: { name: string; lang: string }[], idioma: Idioma, nombre: string | null): { name: string; lang: string } | null`: la de `nombre` si existe y es del idioma; si no, Natural/Online de es-MX (en-US en inglés), luego cualquiera de ese país, luego cualquiera del idioma, y si no, null.
- Produces, en `useVoz(idioma: Idioma, avisoVigente: () => string | null)`, devuelve `{ activa, setActiva, volumen, setVolumen, velocidad, setVelocidad, detalle, setDetalle, voces, nombreVoz, setNombreVoz, hablando, decir(textos: string | string[], tipo: TipoPieza, clave?: string) }`:
  - `voces` son las de la PC en el idioma.
  - Reproduce una pieza a la vez: al terminar (`onend`/`onerror`) llama a `siguiente` con `avisoVigente()`. Solo `cortar: true` llama a `speechSynthesis.cancel()`.
  - Con la voz apagada, `decir` no encola.
  - Guarda en localStorage `"instructor-voz"`: `{ activa, volumen, velocidad, detalle, voz: { es?: string; en?: string } }`. Lee el formato viejo `{ activa, volumen }` sin romperse.

- [ ] **Step 1: Write the failing tests** en `colaVoz.test.ts`:
  - "una orden no corta lo que se está diciendo": `encolar([], orden).cortar === false`.
  - "anulado corta y vacía la cola": con 2 órdenes en cola, `encolar(cola, anulado)` da `cortar: true` y una cola de solo el anulado.
  - "solo espera el aviso más nuevo": dos avisos seguidos dejan uno, el segundo.
  - "un aviso que ya no aplica se descarta al llegarle el turno": cola `[aviso clave "altitud-ambar--", orden]`, `siguiente(cola, null)` devuelve la orden.
  - "un aviso vigente sí se dice": `siguiente([aviso k], k).pieza` es el aviso.
  - "escoge Natural es-MX": entre `[{name:"Microsoft Sabina", lang:"es-MX"}, {name:"Microsoft Dalia Online (Natural)", lang:"es-MX"}]` da Dalia.
  - "respeta la voz elegida del idioma": nombre "Microsoft Sabina" la devuelve.
  - "sin voz en inglés devuelve null": voces solo es-MX, idioma "en" → null.
  - `RITMO` es exactamente `{ lenta: 0.85, normal: 1, rapida: 1.15 }`.
- [ ] **Step 2: Run** `npm.cmd test`. Expected: FAIL (`colaVoz.ts` no existe).
- [ ] **Step 3: Implement** `colaVoz.ts` y reescribe `useVoz` sobre él. En `InstructorPrograma.tsx`, ajusta las llamadas a `decir` con su tipo (orden/aviso con clave/anulado/final/prueba) y pasa `"es"` y la clave del aviso actual. Nada más en la vista: la sesión llega en Task 6.
- [ ] **Step 4: Run** `npm.cmd test` y `npx tsc -b --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit** "Queue the instructor's voice so nothing is cut off mid-sentence".

### Task 4: Plan de sesión, briefing y debriefing

**Files:**
- Create: `src/features/instructor/sesion.ts`, `src/features/instructor/sesion.test.ts`, `src/features/instructor/briefing.ts`, `src/features/instructor/briefing.test.ts`, `src/data/materialInstructor.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Idioma`, `explicar`, `repetir`, `PasoVoz` (Task 1); `Resultado`, `Campo` (evaluador).
- `sesion.ts` y `briefing.ts` no importan `useIntentoViraje` ni `lib/routes` (arrastran Supabase y lucide a las pruebas de node): `sesion.ts` define `export type Modo = "practica" | "checkride"` y `debriefing` recibe el material como parámetro.
- Produces, en `sesion.ts`:
  - `type Bloque = "idioma" | "briefing" | "preparacion" | "practica" | "checkride" | "debriefing" | "cierre"`
  - `GUIA_MIN: Record<Exclude<Bloque, "idioma">, [number, number]>` = briefing [0,5], preparacion [5,10], practica [10,35], checkride [35,45], debriefing [45,55], cierre [55,60].
  - `type IntentoSesion = { modo: Modo; resultado: Resultado; id: string | null }` (solo intentos calificados; los anulados nunca entran).
  - `type Sesion = { id: string; bloque: Bloque; inicioMs: number | null; intentos: IntentoSesion[]; sugerido35: boolean; sugeridoTres: boolean }`.
  - `crearSesion(id: string): Sesion`: bloque "idioma", `inicioMs` null.
  - `type EventoSesion = { tipo: "idioma" } | { tipo: "listo"; ahoraMs: number } | { tipo: "armado" } | { tipo: "intento"; intento: IntentoSesion } | { tipo: "pasar-checkride" } | { tipo: "fin-debriefing" } | { tipo: "reloj"; ahoraMs: number }`.
  - `avanzarSesion(s: Sesion, e: EventoSesion, idioma?: Idioma): { sesion: Sesion; decir: string[] }`:
    - idioma → briefing; listo → preparacion (fija `inicioMs`); armado en preparacion → practica.
    - intento de práctica en "practica": se agrega; si es el 3.º, dice la sugerencia de los tres (una vez).
    - pasar-checkride en "practica" → checkride. Intento de checkride en "checkride" → se agrega y pasa a debriefing.
    - fin-debriefing → cierre.
    - reloj: en "practica" con ≥ 35 min desde `inicioMs` y `!sugerido35`, dice la sugerencia de los 35 (una vez). Nunca cambia de bloque.
    - Cualquier otro par bloque/evento: sin cambios y `decir: []`.
  - Copy: 35 min es "Ya llevamos 35 minutos: cuando quieras pasamos al checkride." / en "We're 35 minutes in: whenever you're ready, we'll move on to the checkride." · tres intentos es "Ya tienes tres intentos: puedes pasar al checkride o seguir practicando." / en "That's three attempts: you can move on to the checkride or keep practicing."
  - `modoDelBloque(b: Bloque): Modo` ("checkride" solo en checkride) y `armaEnBloque(b: Bloque): boolean` (true en preparacion, practica, checkride).
  - `comentarioIntento(i: IntentoSesion, numero: number, idioma?: Idioma): string`: es "Intento <n>: <cal> de 100. <primera línea mal de explicar, o «Todo dentro de tolerancia.»>" / en "Attempt <n>: <cal> out of 100. <… o «Everything within tolerance.»>".
- Produces, en `briefing.ts`:
  - `briefing(idioma?: Idioma): string[]`, con las tolerancias desde constantes. Español:
    1. "Hoy, en esta hora, vas a practicar el viraje escarpado en el Cessna 172, como en un checkride."
    2. "La maniobra: un viraje de 360° a 45° de inclinación, nivelas en tu rumbo de entrada y de inmediato otro de 360° al lado contrario."
    3. "Tolerancias: altitud ±100 ft, velocidad ±10 kt, inclinación 45° ±5°, la bola centrada y el rumbo de salida ±10°."
    4. "Antes de empezar sube a 1,500 ft sobre el terreno, compensa el avión y estabiliza tu velocidad de entrada sin pasar de Va."
    5. "Luego haz tus virajes de limpieza: al menos 90° para buscar tráfico."
    6. "Errores comunes: perder altitud al pasar de 30° por falta de presión atrás, pasarte de 45°, nivelar tarde y volar con la bola descentrada."
    7. "El plan: unos 25 minutos de práctica con correcciones, un checkride sin ayudas y al final un debriefing de tus intentos."
    8. "En práctica te corrijo en vivo; en el checkride solo te doy órdenes. Si apruebas el checkride, puedes mandarlo a revisión para tu insignia."
    9. "Cuando estés listo, presiona «Listo, empiezo»."
    - El inglés dice lo mismo en términos de checkride; la línea 9: "When you're ready, press «Ready, let's start»."
  - `PASOS: PasoVoz[] = ["bajo", "limpieza", "viraje1", "nivelar1", "viraje2", "nivelar2"]` y `listaPasos(paso: PasoVoz | null, idioma?: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[]`. "despejado" cuenta como actual de "viraje1" y "entre" como actual de "viraje2". Nombres: Subir, Virajes de limpieza, Viraje 1, Nivelar, Viraje 2, Nivelar / Climb, Clearing turns, Turn 1, Roll out, Turn 2, Roll out.
  - `queHacer(paso: PasoVoz | null, idioma?: Idioma): string`. Español:
    - bajo: "Potencia y velocidad de ascenso; nivela y compensa al llegar."
    - limpieza: "Dos virajes suaves de 90°, uno a cada lado, buscando tráfico."
    - despejado/viraje1/viraje2: "Al pasar de 30° agrega presión atrás y un poco de potencia; pedal para la bola."
    - nivelar1/nivelar2: "Empieza a nivelar unos 20° antes del rumbo de entrada y quita la presión atrás."
    - entre: "Sin detenerte, alabea al lado contrario hasta 45°."
    - terminado/invalido/null: "".
  - `type Material = { titulo: { es: string; en: string }; to: string; exclusivo: boolean }`.
  - `debriefing(intentos: IntentoSesion[], material: Material[], idioma?: Idioma): { lineas: string[]; material: { titulo: string; to: string; exclusivo: boolean }[] }`. Líneas en orden:
    1. "Hiciste <n> intentos calificados en esta sesión." Con 0 intentos, solo esta línea y el material.
    2. Con 2 o más: "El mejor: <a> de 100 (intento <i>). El más bajo: <b> de 100 (intento <j>)."
    3. Si hay práctica y checkride: "Del primer intento de práctica al checkride pasaste de <a> a <c>." + "Vas mejorando." / "Bajaste un poco: es normal con la presión del examen." / "Te mantuviste parejo."
    4. El campo con más segundos fuera en toda la sesión (altitud, velocidad, inclinación o bola), si hubo alguno: "Lo que más se te salió fue la <campo>: <consejo>", con el consejo del campo tomado de `queHacer`/`explicar`.
    5. "Checkride: aprobado, <c> de 100." o "Checkride: no aprobado, <c> de 100.", si hubo checkride.
    6. `repetir()` del último intento, si no es null.
    - Inglés equivalente, con títulos de material + " (in Spanish)".
- Produces, en `src/data/materialInstructor.ts`: `MATERIAL_VIRAJE: Material[]` (la vista se lo pasa a `debriefing`):
  - `{ titulo: { es: "Simulacro de vuelo: virajes pronunciados", en: "Flight checkride practice: steep turns" }, to: ROUTES.simulacroVuelo, exclusivo: true }`
  - `{ titulo: { es: "Checklist del C172", en: "C172 checklist" }, to: ROUTES.checklistC172, exclusivo: false }`
  - Comentario: los videos de Erik se agregan aquí cuando existan.

- [ ] **Step 1: Write the failing tests**
  - `sesion.test.ts`:
    - "recorre los bloques": idioma → listo → armado → 3 intentos de práctica → pasar-checkride → intento de checkride → fin-debriefing da briefing, preparacion, practica, practica…, checkride, debriefing, cierre.
    - "la sugerencia de los tres se dice una vez": al 3.º intento `decir` trae el texto; al 4.º no.
    - "los 35 minutos sugieren una vez y no cambian de bloque": reloj a 34 min → `decir: []`; a 35 → el texto; a 40 → `[]`; el bloque sigue "practica".
    - "un intento de práctica no cierra el checkride": `avanzarSesion` en "checkride" con un intento de modo "practica" no lo agrega ni cambia de bloque.
    - "un checkride no aprobado también cierra": va a debriefing.
    - "eventos fuera de lugar no hacen nada": "listo" en "practica" deja la sesión igual.
    - `modoDelBloque("checkride") === "checkride"`, `armaEnBloque("briefing") === false`.
  - `briefing.test.ts`:
    - "el briefing usa las tolerancias": `briefing().join(" ")` contiene `±${TOLERANCIAS.altitudFt} ft` y `${ALTURA_SEGURA_AGL.toLocaleString("en-US")} ft`.
    - "en inglés no hay español": `briefing("en")` no contiene "á", "é", "í", "ó", "ú" ni "ñ".
    - "lista de pasos": `listaPasos("nivelar1")` da hecho, hecho, hecho, actual, pendiente, pendiente.
    - "despejado marca el viraje 1": `listaPasos("despejado")[2].estado === "actual"`.
    - "debriefing sin intentos": una línea y el material.
    - "debriefing compara": práctica 70 y 80 y checkride 90 → contiene "El mejor: 90 de 100 (intento 3)", "pasaste de 70 a 90" y "Vas mejorando.".
    - "material en inglés avisa que es en español": cada título termina en " (in Spanish)".
- [ ] **Step 2: Run** `npm.cmd test`. Expected: FAIL (los módulos no existen).
- [ ] **Step 3: Implement** según Interfaces.
- [ ] **Step 4: Run** `npm.cmd test` y `npx tsc -b --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit** "Plan the one-hour session with its briefing, steps and debriefing".

### Task 5: Guardar la sesión y verla en el panel

**Files:**
- Create: `supabase/migrations/0023_sesion_instructor.sql`
- Modify: `src/features/instructor/intentos.ts`, `src/features/instructor/reglasIntentos.ts`, `src/features/instructor/reglasIntentos.test.ts`, `src/pages/AdminManiobras.tsx`

**Interfaces:**
- Migración: `alter table public.intentos_maniobra add column if not exists sesion_id uuid;` y un índice parcial `where sesion_id is not null`. Políticas y disparador sin cambios (el disparador ya bloquea editar todo menos `revision`). Comentario arriba: ejecutar en el SQL Editor antes de subir el código.
- `IntentoManiobra` gana `sesion_id: string | null`; `COLUMNAS` lo incluye.
- `guardarIntento` gana `sesionId?: string`; lo inserta como `sesion_id` solo si viene.
- `fetchSesionesRecientes(limite = 200): Promise<(IntentoManiobra & { email: string | null })[]>`: intentos con `sesion_id` no nulo, del más nuevo al más viejo (solo el fundador lee todo).
- En `reglasIntentos.ts`: `type ResumenSesion = { sesionId: string; email: string | null; inicio: string; intentos: number; checkride: { calificacion: number; aprobado: boolean } | null }` y `agruparSesiones(intentos: (IntentoManiobra & { email: string | null })[]): ResumenSesion[]`, la más nueva primero.
- `AdminManiobras`: debajo de "por revisar", una sección "Sesiones del programa" con una fila por sesión: fecha y hora, correo, número de intentos y el checkride ("—" si no hubo). Si falla la lectura: "No se pudieron leer las sesiones. ¿Ya corriste la migración 0023 en Supabase?"

- [ ] **Step 1: Write the failing tests** en `reglasIntentos.test.ts`:
  - "agrupa por sesión": 3 intentos de la sesión A (2 práctica y 1 checkride de 88 aprobado) y 1 de B dan 2 resúmenes; A con `intentos: 3` y `checkride: { calificacion: 88, aprobado: true }`.
  - "los intentos sin sesión no se agrupan": un intento con `sesion_id: null` no produce resumen.
  - "la más nueva primero": B creada después de A va primero.
- [ ] **Step 2: Run** `npm.cmd test`. Expected: FAIL (`agruparSesiones` no existe).
- [ ] **Step 3: Implement** la migración, las funciones y la sección del panel.
- [ ] **Step 4: Run** `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build`. Expected: PASS.
- [ ] **Step 5: Commit** "Group the program's attempts into sessions for the founder's panel".

### Task 6: La sesión en la ventana del instructor

**Files:**
- Modify: `src/features/instructor/useIntentoViraje.ts`, `src/pages/InstructorPrograma.tsx`

**Interfaces:**
- Consumes: todo lo de Tasks 1–5.
- `useIntentoViraje(opciones?: { sesionId?: string; modoFijo?: Modo; arma?: boolean; alTerminar?: (i: IntentoSesion) => void })`:
  - Sin opciones se comporta como hoy: la página no cambia.
  - `modoFijo` manda sobre `modo`.
  - `arma === false` apaga el armado solo.
  - Guarda con `sesionId`.
  - Llama `alTerminar` una vez por resultado calificado, con el id cuando se guarde (o null si falló).
- `InstructorPrograma`:
  - Estado `Sesion` con `crearSesion(crypto.randomUUID())`. El idioma se guarda en localStorage `"instructor-idioma"`, en try/catch.
  - **Bloque idioma:** dos botones grandes, "Español" y "English", con el último idioma marcado.
  - **Encabezado (desde briefing):** reloj mm:ss desde `inicioMs` (en briefing muestra 00:00), bloque actual con su guía de `GUIA_MIN` ("Práctica · min 10–35") y estado del lector. Un intervalo de 1 s manda el evento `reloj`.
  - **Briefing:** las líneas de `briefing(idioma)` en pantalla, que se leen con `decir(lineas, "orden")` al entrar. Botón "Listo, empiezo" / "Ready, let's start" que manda `listo`. Ese clic también deja hablar a la voz.
  - **Preparación, práctica y checkride:**
    - `listaPasos` con el actual marcado, la orden grande (`textoPaso`) y `queHacer` debajo; el semáforo como hoy.
    - En práctica, el botón "Pasar al checkride" / "Move on to the checkride" (siempre visible), y "Un intento más" tras el 3.º.
    - El modo lo pone `modoDelBloque` y el armado `armaEnBloque`. El primer armado manda `armado`.
    - En "detallado", tras cada intento de práctica dice `comentarioIntento`. Las órdenes y los avisos van con los tipos de Task 3; los avisos ámbar y las correcciones solo en "detallado".
    - Los resultados se muestran con HojaCheckride, Explicacion y ReporteExamen con `idioma`.
  - **Debriefing:** las líneas y el material como enlaces (con «Exclusivo» si aplica). Se leen con `decir(lineas, "final")`; al terminar la lectura, o con el botón "Siguiente" / "Next", se manda `fin-debriefing`. En "necesario" se leen solo las líneas 1 y 5.
  - **Cierre:** el checkride con ReporteExamen, "Mandar a revisión" si `puedeMandar`, y "Nueva sesión" / "New session", que crea otra sesión empezando en briefing con el mismo idioma.
  - **Panel "Voz"** (plegable, en el encabezado): encendido, volumen, voz (select de `voces`), velocidad (Lenta/Normal/Rápida), cuánto habla (Detallado/Solo lo necesario) y "Probar voz" ("Hola, soy tu instructor. Así me vas a escuchar." / "Hi, I'm your instructor. This is how I'll sound."). Sin voz en el idioma: "Tu PC no tiene una voz en <idioma>: sigue en texto." / "Your PC has no <language> voice: text only."
  - Todo el texto de la vista va por idioma. Usable a 380 px sin scroll horizontal.

- [ ] **Step 1: Run** `npm.cmd test` para tener la base verde (no hay prueba nueva: la lógica ya está probada en Tasks 1–5).
- [ ] **Step 2: Implement** las opciones del hook y la vista.
- [ ] **Step 3: Verify** con el lector simulado (`tools\instructor-lector\out\VillanuevaInstructorLector.exe --simulado --sin-ventana`), vite en 5180 y el panel del navegador en `/instructor/programa`, envolviendo `speechSynthesis.speak` para registrar lo dicho:
  - En español: elegir idioma, briefing leído completo, "Listo, empiezo", arma en preparación y pasa a práctica.
  - Tras un intento calificado: comentario dicho y lista de pasos reiniciada.
  - "Pasar al checkride" y un intento: debriefing leído y luego cierre.
  - Ninguna pieza se cortó: el registro de `cancel()` solo aparece con anulado o "Probar voz".
  - Lo mismo con English: nada en español en pantalla ni en el registro de voz.
  - `/instructor/viraje-escarpado` sigue armando, calificando y guardando como antes.
  - A 380 px no hay scroll horizontal.
  - Después: `npx tsc -b --noEmit`, `npm.cmd test` y `npm.cmd run build`.
- [ ] **Step 4: Commit** "Run the instructor window as a one-hour session in Spanish or English".
