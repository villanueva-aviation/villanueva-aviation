# Vuelo lento + lector v1.3: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El lector lee cabeceo, régimen vertical, aviso de pérdida, flaps y RPM, y el programa del instructor califica el vuelo lento del C172 como un checkride (Exclusivo).

**Architecture:** Esta es la fase 3 de la spec. El lector C# agrega cinco SimVars y las manda en el mismo JSON. Un lector viejo se reconoce porque no manda `perdida`. El vuelo lento sigue el patrón del recto:
- constantes en `vueloLento.ts`;
- evaluador puro en `evaluadorLento.ts`;
- voz en `vozLento.ts`;
- textos en `explicacionLento.ts`;
- un `DefManiobra` en `maniobras.ts`.

El programa, el debriefing, /admin/maniobras y la hoja siguen la def, sin lógica nueva.

**Tech Stack:**
- Sitio: React 19, TypeScript, Vite, Tailwind v4, Supabase. Pruebas con `node --experimental-strip-types --test`, listadas en `package.json` "test".
- Lector: C# para .NET Framework 4 con csc.exe y SimConnect managed, armado por `python -I tools/instructor-lector/build.py`.

**Spec:** `docs/superpowers/specs/2026-11-05-instructor-maniobras-microfono-design.md` (secciones Maniobras → Vuelo lento, Preguntas, Orden de construcción paso 3 y Riesgos).

## Global Constraints

**Reglas de la maniobra (spec)**
- Vuelo lento es **Exclusivo**, ACS Área VII Tarea A. El intento calificado se llama **«Checkride»**.
- Pasos: reducir a la velocidad de vuelo lento, mantenerla en recto unos 30 s, hacer un viraje suave de 90° a cada lado y salir con potencia.
- Tolerancias:
  - altitud ±100 ft;
  - rumbo ±10° en los tramos rectos;
  - inclinación ±10° de la indicada en los virajes;
  - velocidad +10/−0 kt de la objetivo, que es una constante por afinar.
- Si suena el aviso de pérdida, el intento no pasa. Se vuela a 1,500 ft sobre el terreno o más.
- Lector viejo: «el programa le dice que lo actualice en vez de calificar mal».

**Textos y presentación**
- Los descargos se copian tal cual:
  - ES: «Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica.»
  - EN: "Simulator practice. Not an official document and does not replace an exam before an aviation authority."
- Nada de «instructor certificado», «CFI», «licencia», «certificado» ni «certified». Nada de "Notice of Disapproval".
- El texto en inglés no lleva `/[áéíóúñ¿¡]/`.
- La marca Garmin no se ve en ningún lado.

**Repositorio**
- Commits con `git add` de archivos concretos, nunca `git add .`. Cada commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Nunca se suben `simhub-sixpack/` ni `g1000-prueba/`.
- Push a main solo después del «Sí, súbelo» de Erik.

**Calls de Claude (se afinan con el vuelo de Erik)**
- Velocidad objetivo: **55 KIAS**, banda 55–65 kt. Se vuela con flaps completos, porque sin flaps el aviso del C172 suena cerca de 55.
- Inclinación indicada en los virajes: **15°**.
- La salida cuenta con **≥ 2,300 RPM y ≥ 70 kt**. Se espera como máximo **30 s**.
- Momento tranquilo para las preguntas: **entre intentos**, igual que hoy. Al entrar a preparación y después del comentario de cada práctica. Nunca durante el intento.
- El rumbo se califica solo en el tramo recto de 30 s. La inclinación, solo con el viraje establecido: más de 15° girados y más de 15° por girar.
- La parte calificada empieza cuando el avión queda en la banda de velocidad. La desaceleración no se califica, salvo que el objetivo no se toma con el aviso de pérdida sonando.

## Review Focus

1. **Lector viejo.** Una muestra sin `perdida` no arma el intento y el motivo pide bajar el lector nuevo de Descargas. Nunca se califica con `undefined`. *Prueba:* Task 2 «lector viejo: no arma y pide actualizar».
2. **Un solo cuadro de aviso de pérdida** (0.1 s) ya hace que el intento no pase. El elemento S4 queda NS. *Prueba:* Task 2 «un cuadro de aviso de pérdida basta para no pasar».
3. **Abajo de 1,500 ft AGL.** En armado el paso es «sube» y no toma el objetivo. Si baja a media maniobra, S2 queda NS. *Prueba:* Task 2 «abajo de 1,500 AGL: no empieza; si baja, S2 NS».
4. **Dos virajes al mismo lado.** El segundo viraje solo cuenta hacia el lado contrario del primero. Si el cadete repite el lado, no pasa a la salida. *Prueba:* Task 2 «el segundo viraje al mismo lado no cuenta».
5. **Nunca sale con potencia.** A los 30 s de la orden de salida el intento termina como no aprobado, con el aviso «No saliste del vuelo lento con potencia». *Prueba:* Task 2 «sin salida con potencia termina a los 30 s y no pasa».

---

### Task 1: Lector v1.3 con cabeceo, régimen vertical, aviso de pérdida, flaps y RPM

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs`. Cambian `class Muestra` y `Json()` (~l. 20–50), `Opciones.Leer` (~l. 64), `Probar()` (~l. 108), el arranque del simulado (~l. 245), `Simulado` (~l. 430) y `Sim.Vars`, `Vuelo` y `Correr` (~l. 498–556).
- Modify: `tools/instructor-lector/LEEME.txt`, `src/data/descargas.ts:39-48`.
- Rebuild: `public/downloads/villanueva-instructor-lector.zip` (con build.py).

**Interfaces:**
- Produces: cada muestra del JSON trae además `"cabeceo"` (grados, positivo = nariz arriba), `"vs"` (ft/min), `"perdida"` (bool), `"flaps"` (índice de la palanca: 0 = arriba) y `"rpm"`. Con `--simulado-lento`, el lector repite un vuelo lento completo y limpio, como `simularLento()` de la Task 2.

- [ ] **Step 1: Agrega la prueba que falla a `Probar()`**

  Arma una `Muestra` con `Cabeceo = 7.5, Vs = -120, Perdida = true, Flaps = 3, Rpm = 1850` y revisa:
  - que `Json()` contenga `"cabeceo":7.5`, `"vs":-120`, `"perdida":true`, `"flaps":3` y `"rpm":1850`;
  - que `Opciones.Leer(new[]{"--simulado-lento"}).Modo == "--simulado-lento"`.

  Imprime `Json: OK` o `Json: FALLA` y súmalo al código de salida.

- [ ] **Step 2: Compila y corre la prueba**

  Run: `python -I tools/instructor-lector/build.py` y luego `tools/instructor-lector/out/VillanuevaInstructorLector.exe --probar`
  Expected: no compila (`Cabeceo` no existe) o imprime `Json: FALLA`.

- [ ] **Step 3: Implementa los cambios**
  - `Muestra` gana `Cabeceo`, `Vs`, `Rpm`, `Flaps` (double) y `Perdida` (bool). `Copia()` y `Json()` los incluyen con esas claves.
  - `Sim.Vars` agrega, en este orden:
    - `PLANE PITCH DEGREES`/`degrees`;
    - `VERTICAL SPEED`/`feet per minute`;
    - `STALL WARNING`/`bool`;
    - `FLAPS HANDLE INDEX`/`number`;
    - `GENERAL ENG RPM:1`/`rpm`.
  - `SizeConst` pasa de 11 a 16.
  - En `Correr()`: `Cabeceo = -x[11]` (SimConnect da nariz arriba negativo), `Vs = x[12]`, `Perdida = x[13] != 0`, `Flaps = x[14]`, `Rpm = x[15]`.
  - `Opciones.Leer` acepta `--simulado-lento`.
  - `Simulado.EscenarioLento()` sale a 10 Hz con flaps 3 y RPM 1,700 casi todo el tiempo, `Perdida = false` y AGL 2,500:
    - 3500 ft y 95 kt, bajando 2 kt/s hasta 58 kt;
    - 35 s recto a 58 kt;
    - viraje izquierdo de 90° a 15°;
    - viraje derecho de 90° a 15°;
    - salida a 2,450 RPM, subiendo 2 kt/s hasta 80 kt;
    - 10 s recto.

    El arranque corre `Simulado.Correr` con ese escenario cuando el modo es `--simulado-lento`. El escenario de virajes escarpados sigue igual para `--simulado` y `--simulado-limpio`. En esos dos, los campos nuevos valen `Cabeceo = 0`, `Vs = 0`, `Perdida = false`, `Flaps = 0` y `Rpm = 2300`.

- [ ] **Step 4: Compila y corre `--probar` otra vez**

  Run: `python -I tools/instructor-lector/build.py` y luego `tools/instructor-lector/out/VillanuevaInstructorLector.exe --probar`
  Expected: cinco líneas `…: OK` (Pausado, ArgumentosEdge, Banderas, Puerto libre tras abrir Edge y Json), código de salida 0, y `public/downloads/villanueva-instructor-lector.zip: … KB`.

- [ ] **Step 5: Versión y textos de descarga**
  - `descargas.ts`, entrada `instructor-lector`: `version: "v1.3"`, `fecha: "2026-11-06"`.
  - Al principio de `LEEME.txt` va una línea: «v1.3: lee cabeceo, régimen vertical, aviso de pérdida, flaps y RPM para el vuelo lento. Si tienes una versión anterior, cierra el lector y reemplaza la carpeta.»

- [ ] **Step 6: Commit**

```bash
git add tools/instructor-lector/LectorInstructor.cs tools/instructor-lector/LEEME.txt src/data/descargas.ts public/downloads/villanueva-instructor-lector.zip
git commit -m "Read pitch, vertical speed, stall warning, flaps and RPM in reader v1.3"
```

  No se sube `tools/instructor-lector/out/`. Revisa que `.gitignore` ya lo ignore. Si no lo ignora, déjalo fuera del `git add`.

---

### Task 2: Evaluador del vuelo lento

**Files:**
- Modify: `src/features/instructor/evaluador.ts`. `Muestra` gana campos opcionales y se agrega `lectorViejo`.
- Create: `src/features/instructor/vueloLento.ts`, `src/features/instructor/evaluadorLento.ts`.
- Modify: `src/features/instructor/simular.ts`. Agrega `simularLento`.
- Test: `src/features/instructor/evaluadorLento.test.ts`. Agrégalo a `package.json` "test".

**Interfaces:**
- Consumes: de `evaluador.ts`, `analizar(puntos, tol)`, `invalidez(m, previo)`, `difRumbo(a, b)`, `Muestra`, `Tramo` y `Lado`. De `virajeEscarpado.ts`, `ALTURA_SEGURA_AGL`, `BOLA_TOLERANCIA` e `INCLINACION_NIVELADO`.
- Produces:
  - `Muestra` gana `cabeceo?: number; vs?: number; perdida?: boolean; flaps?: number; rpm?: number`.
  - `lectorViejo(m: Muestra): boolean`. Vale `true` cuando `m.perdida === undefined`.
  - En `vueloLento.ts`:
    - `TOLERANCIAS_LENTO = { altitudFt: 100, rumboGrados: 10, inclinacionGrados: 10, velocidadMasKt: 10 }`;
    - `OBJETIVO_KT = 55`, `INCLINACION_VIRAJE = 15`, `RECTO_SEG = 30`, `ENTRADA_SEG = 3`, `GIRO_GRADOS = 90`;
    - `SALIDA = { rpm: 2300, kt: 70, maxSeg: 30 }`, todo `as const`.
  - En `evaluadorLento.ts`:
    - `type CampoLento = "altitud" | "rumbo" | "velocidad" | "inclinacion" | "bola"`;
    - `type CodigoLento = "PA.VII.A.S2" | "PA.VII.A.S3" | "PA.VII.A.S4" | "PA.VII.A.S5"`;
    - `type FaseLento = "armado" | "recto" | "viraje1" | "viraje2" | "salida" | "terminado" | "invalido"`;
    - `interface ResultadoLento { maniobra: "vuelo-lento"; aprobado; calificacion; elementos: Record<CodigoLento,"S"|"NS">; objetivo: { t; altitud; rumbo; velocidad }; peor: Record<CampoLento,number>; fuera: Record<CampoLento,Tramo[]>; ns: Record<CampoLento,boolean>; perdidas: number[]; bajo: boolean; salio: boolean; primerLado: Lado; flaps: number; avisos: string[]; muestras: Muestra[] }`;
    - `interface EvaluacionLento { fase; motivo?; resultado?; previo; ventana: Muestra[]; objetivo: Muestra | null; inicioFase: Muestra | null; primerLado: Lado | null; tramo: Muestra[] }`. `tramo` guarda cada muestra calificada, con su fase en un `Map` o un arreglo paralelo, a elección.
    - `CAMPOS_LENTO`, `TOLERANCIA_LENTO: Record<CampoLento, number>`. La velocidad vale 5, por la banda corrida de abajo.
    - `desvioLento(m, objetivo, c): number`. La velocidad es `m.velocidad − OBJETIVO_KT − 5`. La inclinación es `|m.inclinacion| − INCLINACION_VIRAJE`. El rumbo usa `difRumbo`.
    - `armarLento(m): EvaluacionLento`, `armarSoloLento(ev, m): boolean`, `avanzarLento(ev, m): EvaluacionLento`, `giroDe(ev, m): number`.
  - En `simular.ts`: `simularLento(op?: { segundoLado?: Lado; perdidaEn?: number; aglDesde?: { t: number; agl: number }; sinSalida?: boolean; velocidadKt?: number; caidaKt?: { desde: number; segundos: number; kt: number }; viejo?: boolean }): Muestra[]`. Es el mismo escenario que Task 1 a 10 Hz. `t` es el segundo de la simulación: la entrada a la banda queda cerca de t=21 s y el tramo recto entre 21 y 51 s. Las opciones:
    - `perdidaEn` pone `perdida: true` en un solo cuadro (0.1 s);
    - `velocidadKt` cambia la velocidad del tramo lento;
    - `caidaKt` la baja a `kt` durante `segundos` a partir de `desde`;
    - `viejo` quita los cinco campos nuevos.

**Reglas del evaluador** (en orden; puro, ignora `m.t <= previo.t` como `avanzarRecto`):
- Arranque:
  - `armarLento(m)` da `invalido` en tres casos: si `lectorViejo(m)`, con el motivo `"Tu lector es de una versión anterior: baja el nuevo de Descargas para el vuelo lento."`; si el avión está en tierra, con el mismo motivo que el recto; o si `invalidez`.
  - `armarSoloLento` sigue la regla de `armarSoloRecto` y además exige `!lectorViejo(m)`.
- **armado → recto:** pasa cuando las últimas muestras de ENTRADA_SEG s (al menos 0.9×) cumplen todo esto: velocidad en [55, 65], |inclinación| < `INCLINACION_NIVELADO`, `agl ≥ ALTURA_SEGURA_AGL` y `!perdida`. El objetivo es la muestra en que se cumple, con su altitud y su rumbo.
- **recto → viraje1:** a los `RECTO_SEG` del objetivo.
- **viraje1 → viraje2:** cuando |giro| ≥ 80 y |inclinación| < `INCLINACION_NIVELADO`. `giro` es la suma con signo de `difRumbo` entre muestras desde el inicio de la fase, y su signo da `primerLado`.
- **viraje2 → salida:** con la misma condición, pero el giro va al lado contrario de `primerLado`. Un giro al mismo lado no cuenta.
- **salida → terminado:** cuando `rpm ≥ SALIDA.rpm` y `velocidad ≥ SALIDA.kt` (`salio: true`), o a los `SALIDA.maxSeg` (`salio: false`, con el aviso `"No saliste del vuelo lento con potencia."`).
- **Qué se califica:**
  - altitud, en todo desde el objetivo;
  - rumbo, solo en `recto`;
  - velocidad, en recto, viraje1 y viraje2;
  - inclinación, en viraje1 y viraje2 con 15° < |giro| < 75°;
  - bola, en todo;
  - `perdidas` guarda el `t` de cada muestra donde el aviso de pérdida empieza a sonar, desde el objetivo;
  - `bajo` = alguna muestra abajo de `ALTURA_SEGURA_AGL`.
- **Elementos:**
  - S2 = `!bajo`;
  - S3 = `!ns.velocidad`;
  - S4 = `perdidas.length === 0 && !ns.bola`;
  - S5 = `!ns.altitud && !ns.rumbo && !ns.inclinacion`;
  - `aprobado` = todos S y `salio`.
- **Calificación:**
  - cada campo resta como en el recto, `min(25, 2·seg fuera + 10·max(0, |peor|/tol − 1))`;
  - un aviso de pérdida resta 30, `bajo` resta 20 y `!salio` resta 20;
  - el mínimo es 0.
  - `peor.velocidad` se guarda como la desviación real contra `OBJETIVO_KT`, es decir, el valor corrido + 5.

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
// evaluadorLento.test.ts — helper `hasta(ms, t?)` como en recto.test.ts, con armarLento/avanzarLento.
test("vuelo lento limpio: pasa por todas las fases y aprueba", () => {
  const { ev } = hasta(simularLento());
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.aprobado, true);
  assert.equal(ev.resultado!.salio, true);
  assert.equal(ev.resultado!.primerLado, "izquierda");
  assert.deepEqual(Object.values(ev.resultado!.elementos), ["S", "S", "S", "S"]);
});
test("el objetivo se toma en la banda de velocidad, no antes", () => {
  const ms = simularLento();
  const { ev } = hasta(ms);
  const t0 = ev.resultado!.objetivo.t;
  assert.ok(ms.find((m) => m.t === t0)!.velocidad <= 65);
  assert.equal(ev.resultado!.objetivo.altitud, 3500);
});
test("velocidad +10/−0: 1 kt abajo del objetivo queda fuera, 9 arriba queda dentro", () => {
  assert.ok(desvioLento({ ...base, velocidad: 54 }, obj, "velocidad") < -TOLERANCIA_LENTO.velocidad);
  assert.ok(Math.abs(desvioLento({ ...base, velocidad: 64 }, obj, "velocidad")) <= TOLERANCIA_LENTO.velocidad);
});
test("lector viejo: no arma y pide actualizar", () => {
  const m = simularLento({ viejo: true })[0];
  assert.equal(armarLento(m).fase, "invalido");
  assert.match(armarLento(m).motivo!, /Descargas/);
  assert.equal(armarSoloLento(null, m), false);
});
test("un cuadro de aviso de pérdida basta para no pasar", () => {
  const r = hasta(simularLento({ perdidaEn: 30 })).ev.resultado!;
  assert.equal(r.aprobado, false);
  assert.equal(r.elementos["PA.VII.A.S4"], "NS");
  assert.equal(r.perdidas.length, 1);
});
test("abajo de 1,500 AGL: no empieza; si baja, S2 NS", () => {
  const ms = simularLento({ aglDesde: { t: 0, agl: 1200 } });
  assert.equal(hasta(ms).ev.fase, "armado");
  const r = hasta(simularLento({ aglDesde: { t: 50, agl: 1400 } })).ev.resultado!;
  assert.equal(r.elementos["PA.VII.A.S2"], "NS");
});
test("el segundo viraje al mismo lado no cuenta", () => {
  assert.equal(hasta(simularLento({ segundoLado: "izquierda" })).ev.fase, "viraje2");
});
test("sin salida con potencia termina a los 30 s y no pasa", () => {
  const { ev } = hasta(simularLento({ sinSalida: true }));
  assert.equal(ev.fase, "terminado");
  assert.equal(ev.resultado!.salio, false);
  assert.equal(ev.resultado!.aprobado, false);
  assert.ok(ev.resultado!.avisos.includes("No saliste del vuelo lento con potencia."));
});
test("volar a 50 kt deja S3 NS", () => {
  assert.equal(hasta(simularLento({ velocidadKt: 50 })).ev.fase, "armado"); // nunca entra a la banda
  assert.equal(hasta(simularLento({ caidaKt: { desde: 30, segundos: 8, kt: 50 } })).ev.resultado!.elementos["PA.VII.A.S3"], "NS");
});
test("pausa a media maniobra anula", () => { /* pausa en la muestra de t=60 → fase invalido, motivo de invalidez */ });
```

  `base` y `obj` son una `Muestra` y un objetivo fijos, armados en el archivo.

- [ ] **Step 2: Corre las pruebas para ver que fallan**

  Run: `node --experimental-strip-types --test src/features/instructor/evaluadorLento.test.ts`
  Expected: FAIL, `Cannot find module './evaluadorLento.ts'`.

- [ ] **Step 3: Implementa** `vueloLento.ts`, los campos opcionales y `lectorViejo` en `evaluador.ts`, `simularLento` en `simular.ts` y `evaluadorLento.ts`, siguiendo las reglas de arriba. Copia la forma de `evaluadorRecto.ts`.

- [ ] **Step 4: Corre las pruebas para ver que pasan**

  Run: `node --experimental-strip-types --test src/features/instructor/evaluadorLento.test.ts`, luego `npm.cmd test`
  Expected: todas pasan; la suite completa tiene 266 + las nuevas.

- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/evaluador.ts src/features/instructor/vueloLento.ts src/features/instructor/evaluadorLento.ts src/features/instructor/simular.ts src/features/instructor/evaluadorLento.test.ts package.json
git commit -m "Grade slow flight from the new reader fields"
```

---

### Task 3: Voz, avisos y explicación del vuelo lento (ES/EN)

**Files:**
- Create: `src/features/instructor/vozLento.ts`, `src/features/instructor/explicacionLento.ts`.
- Test: `src/features/instructor/lento.test.ts`. Agrégalo a `package.json` "test".

**Interfaces:**
- Consumes: todo lo que produce Task 2. De `voz.ts`: `avisoDe`, `Luz`, `Aviso`, `paraVoz`. De `explicacion.ts`: `Linea`, `reducir`. De `idiomaInstructor.ts`: `Idioma`.
- Produces:
  - `type PasoLento = "sube" | "reduce" | "recto" | "vira1" | "vira2" | "sal" | "terminado" | "invalido"`;
  - `pasoLento(ev, m): PasoLento | null`. `"sube"` = armado con `m.agl < ALTURA_SEGURA_AGL`.
  - `ordenLento(antes, ahora, ev, idioma): string | null`. Solo cambia cuando cambia el paso, como `ordenRecto`.
  - `textoPasoLento(paso, ev, idioma)`, `semaforoLento(ev, m): Record<CampoLento, Luz>`, `avisoLento(ev, m, modo, idioma): Aviso | null`.
  - `briefingLento(idioma): string[]`, `listaPasosLento(paso, idioma)`, `queHacerLento(paso, idioma)`, `explicarLento(r, idioma): Linea[]`, `repetirLento(r, idioma)`, `masFalladoLento(rs, idioma)`.
  - `paraGuardarLento(r): Omit<ResultadoLento,"muestras"> & { series: Record<CampoLento, {t:number;v:number}[]> }`. Usa `reducir`.

**Qué dicen** (el implementador escribe la frase final, con el tono de `vozRecto.ts`):
- `sube`: «sube a 1,500 ft sobre el terreno».
- `reduce`: «flaps completos, reduce potencia y mantén la altitud hasta 55 nudos».
- `recto`: «mantén 55 a 65 nudos, recto y nivelado, unos 30 segundos».
- `vira1`: «viraje suave de 90° a cualquier lado, 15° de inclinación».
- `vira2`: «ahora 90° al lado contrario». Nombra el lado contrario a `primerLado`.
- `sal`: «sal del vuelo lento: potencia completa, nariz para mantener altitud, flaps arriba por etapas».

**Avisos:**
- Con `avisoDe`, los campos activos por fase son:
  - recto: altitud, rumbo, velocidad, bola;
  - virajes: altitud, velocidad, inclinación (solo establecido), bola;
  - salida: altitud.
- Un aviso de pérdida sonando gana a todo, en los dos modos: `{ clave: "perdida", nivel: "rojo" }`, «Aviso de pérdida: baja la nariz y agrega potencia» / "Stall warning: lower the nose and add power".

**Semáforo:** un campo que no se califica en la fase va en `"gris"`.

**Explicación:** una `Linea` por campo, más el aviso de pérdida (cuántas veces y en qué segundo), la altura y la salida. `repetirLento` elige lo peor en este orden: aviso de pérdida, altura, salida, y luego el campo con más segundos fuera.

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
test("los pasos siguen la maniobra", () => {
  // simularLento(): sube → nunca; reduce al inicio; recto después de la entrada; vira1; vira2; sal; terminado
  assert.deepEqual(pasosVistos(simularLento()), ["reduce", "recto", "vira1", "vira2", "sal", "terminado"]);
  assert.equal(pasoLento(armarLento({ ...m0, agl: 1200 }), { ...m0, agl: 1200 }), "sube");
});
test("vira2 nombra el lado contrario al primero", () => {
  assert.match(textoPasoLento("vira2", evTrasIzquierda, "es"), /derecha/);
  assert.match(textoPasoLento("vira2", evTrasIzquierda, "en"), /right/);
});
test("el aviso de pérdida gana a cualquier otro, también en checkride", () => {
  assert.equal(avisoLento(evRecto, { ...mRecto, perdida: true, altitud: 3590 }, "checkride", "es")!.clave, "perdida");
});
test("en el viraje no se avisa de rumbo, y en recto la inclinación va en gris", () => {
  assert.equal(semaforoLento(evRecto, mRecto).inclinacion, "gris");
  assert.equal(semaforoLento(evViraje, mViraje).rumbo, "gris");
});
test("la explicación menciona el aviso de pérdida y repetir lo pide primero", () => {
  const r = hasta(simularLento({ perdidaEn: 30 })).ev.resultado!;
  assert.ok(explicarLento(r, "es").some((l) => l.tipo === "mal" && /pérdida/.test(l.texto)));
  assert.match(repetirLento(r, "es")!, /pérdida/);
});
test("en inglés no hay español", () => {
  for (const r of [limpio, conPerdida, sinSalida]) {
    const textos = [...briefingLento("en"), ...explicarLento(r, "en").map((l) => l.texto), repetirLento(r, "en") ?? "",
      ...(["sube","reduce","recto","vira1","vira2","sal","terminado","invalido"] as const).map((p) => textoPasoLento(p, evTrasIzquierda, "en") + queHacerLento(p, "en"))];
    for (const t of textos) assert.doesNotMatch(t, /[áéíóúñ¿¡]/, t);
  }
});
test("paraGuardar no lleva muestras y reduce las series", () => {
  const g = paraGuardarLento(limpio);
  assert.equal("muestras" in g, false);
  assert.ok(g.series.altitud.length <= 300);
});
```

- [ ] **Step 2: Corre las pruebas para ver que fallan**

  Run: `node --experimental-strip-types --test src/features/instructor/lento.test.ts`
  Expected: FAIL, `Cannot find module './vozLento.ts'`.

- [ ] **Step 3: Implementa `vozLento.ts` y `explicacionLento.ts`** como `vozRecto.ts` y `explicacionRecto.ts`. El briefing dice:
  - para qué sirve el vuelo lento;
  - los 1,500 ft AGL;
  - la configuración (flaps completos);
  - 55 a 65 kt;
  - los pasos;
  - las tolerancias, con los valores de `TOLERANCIAS_LENTO`;
  - que el aviso de pérdida hace que no pase.

- [ ] **Step 4: Corre las pruebas para ver que pasan**

  Run: `node --experimental-strip-types --test src/features/instructor/lento.test.ts`, luego `npm.cmd test`
  Expected: todas pasan.

- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/vozLento.ts src/features/instructor/explicacionLento.ts src/features/instructor/lento.test.ts package.json
git commit -m "Give slow flight its steps, warnings, briefing and explanation"
```

---

### Task 4: Vuelo lento en el programa, la hoja, el panel y el perfil

**Files:**
- Modify: `src/features/instructor/maniobras.ts`. Agrega `"vuelo-lento"` a `ManiobraId` y `defLento` a `MANIOBRAS`.
- Modify: `src/features/instructor/actividades.ts`. `vuelo-lento` queda `disponible: true`.
- Modify: `src/features/instructor/preguntas.ts`. `Tema` gana `"vuelo-lento"`.
- Create: `src/features/instructor/HojaLento.tsx`.
- Modify: `src/features/instructor/vistasManiobra.tsx` (HOJA), `src/data/materialInstructor.ts` (`MATERIAL_LENTO`), `src/pages/InstructorPrograma.tsx:130` (MATERIAL).
- Modify: `src/pages/Perfil.tsx`. Agrega la insignia `logroLento`.
- Modify: `src/pages/AdminManiobras.tsx:77`. El título sale de la def.
- Test: `src/features/instructor/maniobras.test.ts`, `src/features/instructor/actividades.test.ts`.

**Interfaces:**
- Consumes: todo lo de Tasks 2 y 3. También `DefManiobra`, `defDe` y `lecturaFinalDe`.
- Produces:
  - `defLento: DefManiobra<EvaluacionLento, ResultadoLento>` con estos campos:
    - `insignia: "maniobra-vuelo-lento-c172"`;
    - `titulo { es: "Vuelo lento C172", en: "C172 slow flight" }`;
    - `tarea { es: "Área VII · Tarea A: Vuelo lento", en: "Area VII · Task A: Slow flight" }`;
    - `temas ["vuelo-lento", "c172"]`;
    - `fase` lleva recto, viraje1, viraje2 y salida a `"en-curso"`.
  - `elementosReporte`:
    - S2 «Entrada que permite terminar a 1,500 ft AGL o más» / "Entry allows completion no lower than 1,500 ft AGL";
    - S3 «Velocidad de vuelo lento 55 +10/−0 kt» / "Slow-flight airspeed 55 +10/−0 kt";
    - S4 «Coordinado y sin aviso de pérdida» / "Coordinated, no stall warning";
    - S5 «Alt ±100 · Rumbo ±10 · Incl ±10» / "Alt ±100 · Hdg ±10 · Bank ±10".

    Los valores salen de las constantes.
  - `celdas` (las mismas cinco de `CampoLento`): altitud, rumbo, velocidad, inclinación, bola.

- [ ] **Step 1: Escribe las pruebas que fallan**

```ts
// maniobras.test.ts
test("vuelo lento tiene su def con los códigos del ACS Área VII Tarea A", () => {
  const d = defDe("vuelo-lento");
  assert.equal(d.id, "vuelo-lento");
  assert.deepEqual(d.elementosReporte.map((e) => e.codigo), ["PA.VII.A.S2", "PA.VII.A.S3", "PA.VII.A.S4", "PA.VII.A.S5"]);
  assert.equal(d.tarea.en, "Area VII · Task A: Slow flight");
});
test("la def de vuelo lento corre un intento simulado de punta a punta", () => {
  const d = defDe("vuelo-lento");
  const ms = simularLento();
  let e = d.armar(ms[0]);
  for (const m of ms.slice(1)) e = d.avanzar(e, m);
  assert.equal(d.fase(e), "terminado");
  const r = d.resultado(e)!;
  for (const t of lecturaFinalDe(d, r, "en")) assert.doesNotMatch(t, /[áéíóúñ¿¡]/);
  assert.equal("muestras" in d.paraGuardar(r), false);
});
// actividades.test.ts
test("vuelo lento abre solo con Exclusivo y su intento se llama checkride", () => {
  const a = ACTIVIDADES.find((x) => x.id === "vuelo-lento")!;
  assert.equal(estadoActividad(a, false), "candado");
  assert.equal(estadoActividad(a, true), "abierta");
  assert.equal(a.calificado.es, "checkride");
});
```

  Si alguna prueba existente de `actividades.test.ts` afirma que `vuelo-lento` está en «proximamente», actualízala a lo nuevo.

- [ ] **Step 2: Corre las pruebas para ver que fallan**

  Run: `node --experimental-strip-types --test src/features/instructor/maniobras.test.ts src/features/instructor/actividades.test.ts`
  Expected: FAIL. `defDe("vuelo-lento").id` es `"viraje-escarpado"` y vuelo-lento sale como `"proximamente"`.

- [ ] **Step 3: Implementa**
  - **Def y actividad:** escribe `defLento` y regístralo, y deja vuelo-lento en `disponible: true`.
  - **Tema:** agrega `Tema "vuelo-lento"`.
  - **Hoja:** `HojaLento.tsx` sigue a `HojaRecto` y muestra una fila por cada `CampoLento` con su tolerancia y su peor valor. La velocidad se ve como «55 +10/−0 kt» con la mínima volada, y la inclinación como «15° ±10». Después van tres filas más:
    - «Aviso de pérdida»: «no sonó» o «sonó N veces»;
    - «Altura»: «≥ 1,500 ft AGL» o «abajo de 1,500 ft AGL»;
    - «Salida con potencia»: «sí» o «no».

    Al final, una línea con los flaps del objetivo.
  - **Material:** `MATERIAL_LENTO = [Academia Aerodinámica (ROUTES.academiaModulo("aerodinamica"), exclusivo: false), MATERIAL_VIRAJE[1]]`.
  - **Perfil:** `logroLento` va como el recto, con `fetchMisIntentosManiobra("vuelo-lento")` y el título «Vuelo lento · C172». La descripción es «…aprueba tu checkride del instructor virtual. Práctica en simulador, no es una evaluación oficial.» Se acomoda en `todosLogros` entre `logroRecto` y `logroViraje`.
  - **Panel:** en AdminManiobras, `Viraje escarpado ·` pasa a `{defDe(i.maniobra).titulo.es} ·`. Hoy un intento de recto se ve como viraje.

- [ ] **Step 4: Corre las pruebas y los chequeos**

  Run: `npm.cmd test`, luego `npx tsc -b --noEmit`, luego `npm.cmd run build`
  Expected: todas pasan, tsc sin errores y el build termina. Solo sale el aviso de tamaño de chunk que ya existía.

- [ ] **Step 5: Commit**

```bash
git add src/features/instructor/maniobras.ts src/features/instructor/actividades.ts src/features/instructor/preguntas.ts src/features/instructor/HojaLento.tsx src/features/instructor/vistasManiobra.tsx src/data/materialInstructor.ts src/pages/InstructorPrograma.tsx src/pages/Perfil.tsx src/pages/AdminManiobras.tsx src/features/instructor/maniobras.test.ts src/features/instructor/actividades.test.ts
git commit -m "Run slow flight in the instructor program for Exclusivo cadets"
```

---

### Task 5: Banco de preguntas de vuelo lento

**Files:**
- Modify: `src/features/instructor/bancoPreguntas.ts`. Agrega `vl-1`…`vl-18`, con tema `"vuelo-lento"`.
- Test: `src/features/instructor/bancoPreguntas.test.ts`. Agrega `"vuelo-lento"` a la lista de temas de «15 a 20 preguntas por tema».
- Republish: el artifact de revisión (slug `d8791b88-87b6-4b36-a9db-26fbe0a72c28`, https://claude.ai/artifact/TjQ9TBKHhBknBMC6MsFeFy). Se regenera con `hoja-preguntas.mjs` del scratchpad, con `vuelo-lento` agregado a TEMAS.

**Interfaces:**
- Consumes: `Tema "vuelo-lento"` (Task 4) y el helper `p(id, tema, es, en)` de `bancoPreguntas.ts`.

**Temas de las preguntas:**
- el propósito del vuelo lento;
- velocidades del C172, todas en KIAS: Vs0 40 y Vs1 48;
- el aviso de pérdida y a qué margen suena;
- qué controla la potencia y qué controla el cabeceo en el lado de atrás de la curva;
- el efecto de los flaps en la velocidad de pérdida;
- la guiñada adversa y el timón a baja velocidad;
- la salida: potencia, cabeceo y flaps por etapas;
- la altura mínima de 1,500 ft AGL;
- la tolerancia +10/−0;
- el factor de carga en los virajes y por qué el viraje va suave.

Cada pregunta tiene respuesta corta y `aceptadas` con las ideas clave, nunca un «sí» o un «no». Las respuestas en inglés van sin acentos.

- [ ] **Step 1: Escribe la prueba que falla**

  Agrega `"vuelo-lento"` al arreglo de temas en «15 a 20 preguntas por tema».

- [ ] **Step 2: Corre la prueba para ver que falla**

  Run: `node --experimental-strip-types --test src/features/instructor/bancoPreguntas.test.ts`
  Expected: FAIL, `vuelo-lento: 0`.

- [ ] **Step 3: Escribe vl-1…vl-18**

- [ ] **Step 4: Corre las pruebas para ver que pasan**

  Run: `node --experimental-strip-types --test src/features/instructor/bancoPreguntas.test.ts`, luego `npm.cmd test`
  Expected: todas pasan, incluidas «la respuesta que dice el instructor se califica como correcta», «en inglés no hay español» y «no se aceptan con un sí o un no».

- [ ] **Step 5: Commit y artifact**

```bash
git add src/features/instructor/bancoPreguntas.ts src/features/instructor/bancoPreguntas.test.ts
git commit -m "Add the slow-flight question bank for Erik to review"
```

  Regenera la hoja de revisión y republícala en el mismo slug.

---

### Task 6: Verificación en el navegador

**Files:** ninguno. Si aparece un defecto, se corrige en el archivo de la task que lo posee, con su prueba primero.

- [ ] **Step 1: Arranca Vite**

  Run: `mcp__terminal__run_in_terminal` con `node node_modules/vite/bin/vite.js --port 5180 --strictPort`.
  Expected: `Local: http://localhost:5180/`.

- [ ] **Step 2: Corre un vuelo lento limpio**
  1. Abre `/instructor/programa` y espera a que cargue la página.
  2. Parcha `window.fetch` para URLs `127.0.0.1:8766`. La respuesta es `{conectado, muestra, muestras}` con una versión en JS de `simularLento()` a 10× de velocidad, como en la verificación del recto.
  3. Elige ES → Vuelo lento → briefing → preparación → checkride.

  Expected:
  - las órdenes van en el orden reduce → recto → vira1 → vira2 → sal;
  - se ven HojaLento y el debriefing con «Checkride:»;
  - el reporte dice «EXAMEN PRÁCTICO APROBADO», con PA.VII.A.S2…S5 y el descargo exacto.

- [ ] **Step 3: Repite en EN a 380 px de ancho, con un aviso de pérdida en t=30**

  Expected:
  - el aviso «Stall warning…» sale rojo;
  - el reporte es de no aprobado, sin "Notice of Disapproval";
  - no hay texto en español ni scroll horizontal.

- [ ] **Step 4: Lector viejo**

  Parcha `fetch` con muestras sin los cinco campos nuevos.
  Expected: el programa muestra el motivo «Tu lector es de una versión anterior…» y no califica.

- [ ] **Step 5: Revisa lo que ya existía**
  - El viraje escarpado y el recto llegan igual que antes a su primera orden.
  - `/perfil` muestra la insignia «Vuelo lento · C172» con candado.
  - En el menú, vuelo lento sale abierto con la cuenta de Erik y con candado sin Exclusivo. Esto último se revisa con la prueba de Task 4; en el navegador basta la cuenta de Erik.

- [ ] **Step 6: Avisa a Erik**

  La verificación guarda filas reales en `intentos_maniobra`, con `maniobra='vuelo-lento'`. Dale el SQL para borrarlas, con un select primero, y pídele el «Sí, súbelo» para el push.

**Lo que queda para el vuelo de Erik** (no es parte de este plan):
- revisar el signo del cabeceo en MSFS real;
- ver a qué velocidad suena el aviso con flaps 30;
- afinar `OBJETIVO_KT`, `SALIDA.rpm` y `SALIDA.kt`;
- probar la descarga del zip v1.3.
