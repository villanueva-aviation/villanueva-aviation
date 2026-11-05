# Instructor virtual con voz (programa) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al abrir el lector se abre una ventana propia (Edge sin barra de direcciones) con el instructor del viraje escarpado, que da órdenes, avisa antes de salirse de tolerancia y al final lee la explicación por voz. Usa la misma calificación, cuenta y revisión que la página.

**Architecture:**
- La lógica de voz es pura y probada (`voz.ts`): qué paso es, qué orden dar, qué aviso dar, cuándo repetirlo y qué leer al final.
- La lógica del intento sale de la página a un hook compartido (`useIntentoViraje`). La página actual y la vista nueva `/instructor/programa` lo usan las dos.
- `useVoz` envuelve `speechSynthesis`.
- El lector en C# lanza Edge en modo aplicación con un perfil propio.

**Tech Stack:** React 19, Vite, TS, Tailwind v4, Supabase, Web Speech API, C# 5 (csc .NET 4).

**Spec:** `docs/superpowers/specs/2026-11-05-instructor-programa-voz-design.md`

## Global Constraints

- **Pruebas:** `node --experimental-strip-types --test`. Cada archivo nuevo de prueba se agrega a la lista explícita del script `test` de package.json. Los módulos probados importan con extensión `.ts`.
- **Verificaciones:** `npx tsc -b --noEmit`, `npm.cmd test` y `npm.cmd run build` deben quedar limpios.
- **C# 5:** sin `$""` y sin `?.`. Compilar con `python -I tools/instructor-lector/build.py`. El zip lleva solo el exe, LEEME.txt y el .bat, sin DLL de SimConnect.
- **Copy:**
  - Español.
  - Sin "certificado", "licencia", "CFI" ni "Garmin".
  - El aviso del reporte no cambia: "Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica."
- **Constantes nuevas** en `src/features/instructor/virajeEscarpado.ts`: `AVISO_FRACCION = 0.6` y `REPETIR_AVISO_SEG = 8`.
- **URL por defecto de la ventana:** `https://villanueva-aviation.pages.dev/instructor/programa`. Perfil de Edge en `%LOCALAPPDATA%\VillanuevaInstructor\Edge`.
- **Banderas de Edge:** `--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`.
- **Commits:** archivos específicos con `git add`, nunca `git add .`. No push sin "Sí, súbelo".

## Review Focus

1. **Voz en el borde ámbar.** Un cadete que oscila justo en el 60 % de la tolerancia no debe oír el aviso cada medio segundo. Lo cubre la prueba "alternar dentro/fuera no repite antes de 8 s" (Task 1).
2. **La voz no suena** porque Edge bloquea `speechSynthesis` sin un clic del usuario. El botón "Probar voz" da ese clic y la bandera `--autoplay-policy=no-user-gesture-required` ayuda; se verifica en el navegador (Task 4).
3. **Abrir el exe dos veces** (uno quedó en el inicio de Windows): no debe fallar por el puerto ocupado. Debe abrir la ventana y salir. Lo cubre el paso manual de Task 6.
4. **Ingreso por correo sin código en la plantilla:** el cadete no debe quedar atorado. Siempre se muestra "Entra con Google" como salida (Task 5).
5. **La página web sigue calificando y avisando igual** tras mover la lógica al hook: armado automático, "Otro intento" y guardado. Lo cubren la suite y la verificación con `--simulado` (Task 2).

---

### Task 1: Lógica pura de la voz

**Files:**
- Create: `src/features/instructor/voz.ts`
- Create: `src/features/instructor/voz.test.ts`
- Modify: `src/features/instructor/virajeEscarpado.ts` (agregar `AVISO_FRACCION`, `REPETIR_AVISO_SEG`)
- Modify: `package.json` (agregar `src/features/instructor/voz.test.ts` al script `test`)

**Interfaces:**
- Consumes: de `evaluador.ts`: `Evaluacion` (`fase`, `interno.giro?.{ref, muestras, girado}`, `interno.historial`, `motivo`), `Muestra`, `Resultado`, `TOLERANCIA` (`altitud`, `velocidad`, `inclinacion`, `bola`), `difRumbo`. De `explicacion.ts`: `explicar`, `repetir`. De `virajeEscarpado.ts`: `ALTURA_SEGURA_AGL`, `INCLINACION_ESTABLECIDA`, `INCLINACION_OBJETIVO`, `LIMPIEZA`.
- Produces:
  - `type CampoAviso = "altitud" | "velocidad" | "inclinacion" | "bola"`
  - `type Luz = "gris" | "verde" | "ambar" | "rojo"`
  - `semaforo(ev: Evaluacion | null, m: Muestra | null): Record<CampoAviso, Luz>`
  - `type Aviso = { clave: string; nivel: "ambar" | "rojo"; texto: string }`
  - `avisoVoz(ev: Evaluacion | null, m: Muestra | null, modo: "practica" | "checkride"): Aviso | null`
  - `type MemoriaAviso = { clave: string | null; desde: number; libreDesde: number | null }`
  - `MEMORIA_VACIA: MemoriaAviso`
  - `filtrarAviso(mem: MemoriaAviso, aviso: Aviso | null, t: number): { decir: string | null; mem: MemoriaAviso }`
  - `type PasoVoz = "bajo" | "limpieza" | "despejado" | "viraje1" | "nivelar1" | "entre" | "viraje2" | "nivelar2" | "terminado" | "invalido"`
  - `pasoVoz(ev: Evaluacion | null, m: Muestra | null): PasoVoz | null`
  - `ordenVoz(antes: PasoVoz | null, ahora: PasoVoz | null, ev: Evaluacion | null): string | null`
  - `textoPaso(paso: PasoVoz | null): string`
  - `textoEspera(m: Muestra | null): string`
  - `lecturaFinal(r: Resultado): string[]`
  - `paraVoz(texto: string): string`

**Reglas que fija el spec:**

**`semaforo`**
- Todo `gris` si no hay `ev.interno.giro`.
- La desviación es contra `giro.ref`: altitud y velocidad con signo; inclinación como `|m.inclinacion| − INCLINACION_OBJETIVO`; bola como `m.bola`.
- Inclinación y bola valen `gris` hasta que alguna muestra del giro tenga `|inclinacion| ≥ INCLINACION_ESTABLECIDA`, y otra vez desde `|girado| ≥ 330`. Es la misma ventana que el `avisoEnVivo` de hoy.
- `rojo` si `|d| > tol`, `ambar` si `|d| > AVISO_FRACCION·tol`, si no `verde`.

**`avisoVoz`**
- Toma el primer campo que no esté en verde ni en gris, en este orden: altitud, velocidad, inclinación, bola.
- `clave = campo-nivel-signo`, con signo `+` o `−` según la desviación.

Textos exactos de **Checkride ámbar:**

| Campo | Texto |
|---|---|
| altitud | "Ojo con tu altitud" |
| velocidad | "Revisa tu velocidad" |
| inclinación | "Cuida la inclinación" |
| bola | "Centra la bola" |

Textos exactos de **Práctica ámbar:**

| Campo y signo | Texto |
|---|---|
| altitud − | "Estás perdiendo altitud: más presión atrás" |
| altitud + | "Estás subiendo: menos presión atrás" |
| velocidad + | "Vas muy rápido: reduce potencia" |
| velocidad − | "Vas muy lento: agrega potencia" |
| inclinación + | "Te estás pasando de 45 grados: afloja la inclinación" |
| inclinación − | "Te falta inclinación: lleva el avión a 45 grados" |
| bola | "Centra la bola con el pedal" |

Textos exactos de **rojo:**
- Checkride: `Fuera de tolerancia: ${nombre}`, con nombre ∈ {altitud, velocidad, inclinación, coordinación}.
- Práctica: `Fuera de tolerancia. ${textoPráctica}`.

**`filtrarAviso`**
- Una clave nueva se dice al momento.
- La misma clave se repite solo si pasaron `REPETIR_AVISO_SEG` desde la última vez.
- La memoria se borra solo si `aviso` es `null` durante ≥ 2 s seguidos (`libreDesde`). Así, oscilar en el borde no repite.

**`pasoVoz`**
- `null` si no hay ev. `invalido` y `terminado` según la fase.
- El evaluador crea el giro y cambia a `viraje1` o `viraje2` al pasar de 30°, así que `armado` y `entre` nunca tienen giro.
- En `armado`:
  - `bajo` si `m.agl < ALTURA_SEGURA_AGL`;
  - si no, `despejado` si la suma de `|difRumbo|` entre muestras seguidas del historial en los últimos `LIMPIEZA.ventanaSeg` es ≥ `LIMPIEZA.grados`;
  - si no, `limpieza`.
- `viraje1`: es `nivelar1` si `|giro.girado| ≥ 300` y si no `viraje1`.
- `entre`: `entre`.
- `viraje2`: es `nivelar2` si `|giro.girado| ≥ 300` y si no `viraje2`.
- Una entrada abortada regresa a `armado` o `entre`, y la orden de ese paso se vuelve a decir. Es correcto.

**`ordenVoz`**
- Solo devuelve algo si el paso cambió. Textos:

| Paso | Texto |
|---|---|
| bajo | "Suba a 1,500 pies sobre el terreno." |
| limpieza | "Despeje el área con sus virajes de limpieza." |
| despejado | "Área despejada. Inicie el viraje de 360 grados." |
| nivelar1, nivelar2 | "Nivele en su rumbo de entrada." |
| entre | "Ahora al lado contrario." |
| invalido | `Intento anulado. ${ev.motivo}` |
| viraje1, viraje2, terminado | `null` (la lectura final va aparte) |

**`textoPaso`** es el texto en pantalla:
- bajo y limpieza: como en `ordenVoz`;
- despejado: "Inicia el viraje de 360° a 45°.";
- viraje1: "Sostén 45°, la altitud y la velocidad.";
- nivelar1 y nivelar2: "Nivela en tu rumbo de entrada.";
- entre: "Ahora al lado contrario.";
- viraje2: "Sostén 45° y nivela en tu rumbo de entrada.";
- terminado: "Maniobra terminada.";
- invalido y null: "".

**`textoEspera`** es la lógica de espera que hoy vive en la página (avión que no es C172, "Despega…", pausa/slew/velocidad acelerada, "Nivela las alas…"), movida tal cual.

**`lecturaFinal`** devuelve, en este orden:
1. `${aprobado ? "Aprobado" : "No aprobado"}. Calificación: ${calificacion} de 100.`
2. Cada `explicar(r)[i].texto`.
3. Cada `r.avisos[i]`.
4. `repetir(r)` si existe.

Todo pasa por `paraVoz`.

**`paraVoz`**
- `/(\d)\s?ft\b/g → "$1 pies"`
- `/(\d)\s?kt\b/g → "$1 nudos"`
- `"°" → " grados"`
- `"±" → "más menos "`
- quita `✓` y `✗` y colapsa los espacios.

**Decisión de este plan:** `despejado` reemplaza el "Inicie el viraje al detectar la entrada" del spec. Decirlo cuando el cadete ya inclinó no le sirve; decirlo al terminar la limpieza es lo que hace un examinador.

- [ ] **Step 1: Write the failing tests** in `voz.test.ts`. Use the same `correr` helper as `evaluador.test.ts` (`muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0]))`) and `simularManiobra` from `./simular.ts`. The `enViraje(): { ev, m }` helper runs `correr` over `simularManiobra()` up to the first sample with `|inclinacion| > 41` (inclusive) and returns that evaluation and that sample.

```ts
test("semáforo: verde, ámbar al 60 % y rojo al pasar la tolerancia", () => {
  // ev y muestra dentro del primer viraje; la referencia es giro.ref
  const { ev, m } = enViraje();
  const ref = ev.interno.giro!.ref;
  assert.equal(semaforo(ev, { ...m, altitud: ref.altitud - 50 }).altitud, "verde");
  assert.equal(semaforo(ev, { ...m, altitud: ref.altitud - 65 }).altitud, "ambar");
  assert.equal(semaforo(ev, { ...m, altitud: ref.altitud - 110 }).altitud, "rojo");
  assert.deepEqual(Object.values(semaforo(armar(crearEvaluacion(), m), m)), ["gris", "gris", "gris", "gris"]);
});

test("aviso: corto en checkride, con corrección en práctica", () => {
  const { ev, m } = enViraje();
  const bajo = { ...m, altitud: ev.interno.giro!.ref.altitud - 65 };
  assert.equal(avisoVoz(ev, bajo, "checkride")!.texto, "Ojo con tu altitud");
  assert.equal(avisoVoz(ev, bajo, "practica")!.texto, "Estás perdiendo altitud: más presión atrás");
  const fuera = { ...m, altitud: ev.interno.giro!.ref.altitud - 110 };
  assert.equal(avisoVoz(ev, fuera, "checkride")!.texto, "Fuera de tolerancia: altitud");
  assert.equal(avisoVoz(ev, m, "checkride"), null);
});

test("filtro: no repite antes de 8 s, sí al escalar a rojo", () => {
  const a = { clave: "altitud-ambar--", nivel: "ambar", texto: "Ojo con tu altitud" } as const;
  const r = { clave: "altitud-rojo--", nivel: "rojo", texto: "Fuera de tolerancia: altitud" } as const;
  let s = filtrarAviso(MEMORIA_VACIA, a, 0); assert.equal(s.decir, "Ojo con tu altitud");
  s = filtrarAviso(s.mem, a, 3); assert.equal(s.decir, null);
  s = filtrarAviso(s.mem, a, 8.1); assert.equal(s.decir, "Ojo con tu altitud");
  s = filtrarAviso(s.mem, r, 9); assert.equal(s.decir, "Fuera de tolerancia: altitud");
});

test("filtro: alternar dentro/fuera no repite antes de 8 s", () => {
  const a = { clave: "altitud-ambar--", nivel: "ambar", texto: "Ojo con tu altitud" } as const;
  let mem = MEMORIA_VACIA; const dichos: number[] = [];
  for (let t = 0; t < 7.9; t += 0.5) {
    const s = filtrarAviso(mem, Math.round(t * 2) % 2 ? null : a, t); mem = s.mem;
    if (s.decir) dichos.push(t);
  }
  assert.deepEqual(dichos, [0]);
});

test("filtro: tras 2 s dentro de la banda vuelve a avisar", () => {
  const a = { clave: "altitud-ambar--", nivel: "ambar", texto: "Ojo con tu altitud" } as const;
  let s = filtrarAviso(MEMORIA_VACIA, a, 0);
  s = filtrarAviso(s.mem, null, 1); s = filtrarAviso(s.mem, null, 3.1);
  assert.equal(filtrarAviso(s.mem, a, 3.2).decir, "Ojo con tu altitud");
});

test("órdenes de una maniobra completa, en orden", () => {
  const muestras = simularManiobra();
  let ev = armar(crearEvaluacion(), muestras[0]); let paso = null as PasoVoz | null; const dichas: string[] = [];
  for (const m of muestras) { ev = avanzar(ev, m); const p = pasoVoz(ev, m); const o = ordenVoz(paso, p, ev); if (o) dichas.push(o); paso = p; }
  assert.deepEqual(dichas, [
    "Despeje el área con sus virajes de limpieza.",
    "Área despejada. Inicie el viraje de 360 grados.",
    "Nivele en su rumbo de entrada.",
    "Ahora al lado contrario.",
    "Nivele en su rumbo de entrada.",
  ]);
});

test("bajo de 1,500 AGL pide subir primero", () => {
  const [m] = simularManiobra();
  const ev = armar(crearEvaluacion(), { ...m, agl: 600 });
  assert.equal(pasoVoz(ev, { ...m, agl: 600 }), "bajo");
  assert.equal(ordenVoz(null, "bajo", ev), "Suba a 1,500 pies sobre el terreno.");
});

test("anulado dice el motivo", () => {
  const [m] = simularManiobra();
  const ev = { fase: "invalido", motivo: "Pausaste el simulador: el intento no se califica.", interno: crearEvaluacion().interno } as Evaluacion;
  assert.equal(ordenVoz("limpieza", pasoVoz(ev, m), ev), "Intento anulado. Pausaste el simulador: el intento no se califica.");
});

test("lectura final completa y en voz", () => {
  const r = correr(simularManiobra({ caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 } })).resultado!;
  const l = lecturaFinal(r);
  assert.equal(l[0], "No aprobado. Calificación: 90 de 100.");
  assert.ok(l.some((x) => x.includes("130 pies")), l.join(" | "));
  assert.equal(l.at(-1), "Repite: viraje izquierdo");
  assert.ok(l.every((x) => !/[✓✗°]|\bft\b/.test(x)));
});

test("paraVoz", () => {
  assert.equal(paraVoz("✗ Perdiste 130 ft, vas a 95 kt y 45°"), "Perdiste 130 pies, vas a 95 nudos y 45 grados");
});
```

- [ ] **Step 2: Run the tests to watch them fail.**
  - Run: `node --experimental-strip-types --test src/features/instructor/voz.test.ts`
  - Expected: FAIL, "does not provide an export named …" (voz.ts doesn't exist yet).

- [ ] **Step 3: Implement `voz.ts`** with the interfaces and rules above, and add the two constants to `virajeEscarpado.ts`. The 90 in the final reading must match the existing test "caída de 130 ft…"; if the real text from `explicar` doesn't contain "130 ft", tweak only the test's `includes`, never `explicar`.

- [ ] **Step 4: Run the file and the suite.**
  - Run: `node --experimental-strip-types --test src/features/instructor/voz.test.ts`, then `npm.cmd test`.
  - Expected: all pass (175 + the new ones).

- [ ] **Step 5: Commit.**

```bash
git add src/features/instructor/voz.ts src/features/instructor/voz.test.ts src/features/instructor/virajeEscarpado.ts package.json
git commit -m "Decide what the instructor says, and when, from the live attempt"
```

### Task 2: Shared attempt hook, and the page uses it

**Files:**
- Create: `src/features/instructor/useIntentoViraje.ts`
- Create: `src/features/instructor/Explicacion.tsx` (moved from the page)
- Modify: `src/pages/InstructorVirajeEscarpado.tsx`

**Interfaces:**
- Consumes: `useLector`, `armar`, `armarSolo`, `avanzarLote`, `crearEvaluacion`, `guardarIntento`, `fetchMisIntentosManiobra`, `mandarARevision`, `paraGuardar`, `ALTURA_SEGURA_AGL`; from Task 1: `avisoVoz`, `textoEspera`.
- Produces: `useIntentoViraje()` returns `{ estado, muestra, modo, cambiarModo, modoIntento, ev, resultado, series, anulado, bajo, enCurso, iniciar, guardado, guardar, intento, numero, intentos, mandar, envio, aprobadoPorErik }`, with the types and behavior they have today in `InstructorVirajeEscarpado.tsx`. Also `Explicacion({ resultado }: { resultado: Resultado })`.

- [ ] **Step 1: Move** the page state and logic (state, saving, auto-arm, `cambiarModo`, `iniciar`, `intento`/`numero`, `enCurso`, `bajo`, `aprobadoPorErik`, `mandar`) into `useIntentoViraje`, with no change in behavior.
  - The page keeps the beep and its text: it uses `avisoVoz(ev, muestra, "practica")` and shows the text only when `nivel === "rojo"`. Its local `avisoEnVivo` is deleted.
  - The waiting text uses `textoEspera(muestra)`.
  - `Explicacion` moves to its own file.

- [ ] **Step 2: Verify.**
  - Run `npx tsc -b --noEmit`, `npm.cmd test` and `npm.cmd run build`. Expected: clean.
  - In the browser, with `tools/instructor-lector/out/VillanuevaInstructorLector.exe --simulado --sin-ventana` (if Task 6 isn't done yet, without the flag) and vite on 5180, open `/instructor/viraje-escarpado`.
  - Expected: it arms itself, shows "Haz tus virajes de limpieza…", finishes at 90/100 NO APROBADO, and saves.

- [ ] **Step 3: Commit.**

```bash
git add src/features/instructor/useIntentoViraje.ts src/features/instructor/Explicacion.tsx src/pages/InstructorVirajeEscarpado.tsx
git commit -m "Move the steep turn attempt logic into a hook both views can share"
```

### Task 3: `useVoz`

**Files:**
- Create: `src/features/instructor/useVoz.ts`

**Interfaces:**
- Produces: `useVoz(): { activa: boolean; setActiva(v: boolean): void; volumen: number; setVolumen(v: number): void; nombreVoz: string | null; decir(textos: string | string[], opciones?: { final?: boolean }): void }`

**Rules:**
- **Voice choice:** after `voiceschanged`, take the first voice with lang `es-MX` whose name includes "Natural" or "Online". If none, any `es-MX`. If none, any `es-*`.
- **Each utterance:** `lang = "es-MX"` and `volume = volumen`.
- **Not final:**
  - Dropped if a final reading is playing.
  - Otherwise `speechSynthesis.cancel()`, then speak.
- **Final:** `cancel()`, then queue every line. It counts as playing until the last line's `onend`.
- **No-op** when `activa` is false or `speechSynthesis` doesn't exist.
- **Saved settings:** `activa` and `volumen` live in localStorage `instructor-voz` as JSON, wrapped in try/catch.

- [ ] **Step 1: Implement.** It's browser-only, so there's no node test; it's verified in Task 4.
- [ ] **Step 2: Verify.** Run `npx tsc -b --noEmit`. Expected: clean.
- [ ] **Step 3: Commit.**

```bash
git add src/features/instructor/useVoz.ts
git commit -m "Speak through the browser's Spanish voice with a no-interrupt final reading"
```

### Task 4: `/instructor/programa` view

**Files:**
- Create: `src/pages/InstructorPrograma.tsx`
- Modify: `src/lib/routes.ts` (`instructorPrograma: "/instructor/programa"`)
- Modify: `src/App.tsx`:
  - protected route;
  - `TITULOS` entry "Instructor virtual — Villanueva Aviation";
  - no navbar/footer when `pathname === ROUTES.instructorPrograma` or when on `ROUTES.ingresar` with `from === ROUTES.instructorPrograma`. Extend today's `aterrizaje` condition.

**Interfaces:**
- Consumes: `useIntentoViraje` (Task 2), `useVoz` (Task 3), and from Task 1: `semaforo`, `avisoVoz`, `filtrarAviso`, `MEMORIA_VACIA`, `pasoVoz`, `ordenVoz`, `textoPaso`, `textoEspera`, `lecturaFinal`, `paraVoz`. Plus `HojaCheckride`, `Explicacion`, `ReporteExamen`.

**Layout**, one column, usable from 380 px:
1. **Header:** "Instructor virtual · Viraje escarpado C172" and the reader status.
2. **Práctica/Checkride**, as on the page.
3. **Voice:** "Voz" toggle, volume range, "Probar voz" button that says "Hola, soy tu instructor. Así me vas a escuchar." and the chosen voice's name.
4. **Big instruction:**
   - `textoPaso(pasoVoz(ev, muestra))`;
   - with no ev: `textoEspera(muestra)`;
   - the voided-attempt notice, as on the page.
5. **Traffic light:** four cells (Altitud, Velocidad, Inclinación, Bola) colored by `semaforo` (gris/verde/ámbar/rojo), with the current warning text under them.
6. **At the end:** `HojaCheckride`, `Explicacion`, `ReporteExamen` (with its PDF button), save state, "Mandar a revisión" and "Otro intento".

**Decision in this plan:** `ReporteExamen` goes inside the program instead of the spec's "Ver reporte completo" link. The page doesn't show an attempt saved from another view, except one Erik approved, so the link would open with nothing.

**Voice wiring** (effect on `[ev, muestra]`, using refs for the previous step and `MemoriaAviso`):
- When the step changes and `ordenVoz` returns text → `decir(paraVoz(texto))`.
- `filtrarAviso(mem, avisoVoz(ev, muestra, modoIntento), muestra.t)` → `decir(paraVoz(decir))`.
- On the change to `terminado` → `decir(lecturaFinal(resultado), { final: true })`.

- [ ] **Step 1: Implement** view, route and frameless layout.
- [ ] **Step 2: Verify.**
  - Run `npx tsc -b --noEmit`, `npm.cmd test` and `npm.cmd run build`. Expected: clean.
  - In the browser, with `--simulado` and `/instructor/programa` on 5180, wrap `speechSynthesis.speak` to log `utterance.text`, click "Probar voz", and fly a full cycle.
  - Expected:
    - the log has, in order, the commands from Task 1;
    - at least one "Ojo…" or "Fuera de tolerancia…" in Checkride during the drop;
    - the final reading starting "No aprobado. Calificación: 90 de 100.";
    - no navbar;
    - no horizontal scroll at 380 px.
- [ ] **Step 3: Commit.**

```bash
git add src/pages/InstructorPrograma.tsx src/lib/routes.ts src/App.tsx
git commit -m "Add the compact instructor view that talks the cadet through the steep turn"
```

### Task 5: Sign in with an email code from the program

**Files:**
- Modify: `src/features/auth/AuthContext.tsx` (add `verifyEmailCode(email: string, code: string): Promise<{ error: string | null }>` using `supabase.auth.verifyOtp({ email, token: code, type: "email" })`, plus its type)
- Modify: `src/pages/Ingresar.tsx`

**Rules:**
- Only when `params.get("from") === ROUTES.instructorPrograma` and `status === "sent"`.
- Under the "Te enviamos…" message, add a field "Código del correo" (`inputMode="numeric"`, `autoComplete="one-time-code"`, 6 to 10 digits) and an "Entrar" button.
- **If it works:** `navigate(from)`.
- **If it fails:** show the error and the line "¿No te llegó un código? Entra con Google.", with a button that calls `loginWithGoogle(redirectTo)`.
- Ingresar for the page stays the same.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Verify.**
  - Run `npx tsc -b --noEmit` and `npm.cmd run build`. Expected: clean.
  - In the browser, open `/ingresar?from=/instructor/programa` and confirm it has no navbar. Don't send a real email.
- [ ] **Step 3: Commit.**

```bash
git add src/features/auth/AuthContext.tsx src/pages/Ingresar.tsx
git commit -m "Let the instructor program sign in with the code from the sign-in email"
```

- [ ] **Step 4: Instructions for Erik** (final message, not code). In Supabase → Authentication → Email Templates → Magic Link, add the line `Tu código: {{ .Token }}` to the body. Until he does, the program logs in with Google.

### Task 6: The reader opens the window

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs`
- Modify: `tools/instructor-lector/Iniciar con Windows.bat` (the shortcut gets `$s.Arguments='--sin-ventana'`)
- Modify: `tools/instructor-lector/LEEME.txt`
- Modify: `src/data/descargas.ts`, entry `instructor-lector`:
  - `nombre: "Instructor virtual con voz"`
  - `descripcion: "El instructor virtual de MSFS 2020 en su propia ventana, con voz. Gratis, no necesita SimHub."`
  - `version: "v1.1"`, `fecha: "2026-11-05"`
- Modify: `public/downloads/villanueva-instructor-lector.zip` (rebuilt)

**Interfaces:**
- Produces (C#, in `LectorInstructor`):
  - `static string ArgumentosEdge(string url, string perfil)` returns exactly:
    `--app=<url> --user-data-dir="<perfil>" --window-size=480,860 --no-first-run --autoplay-policy=no-user-gesture-required --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`
  - `static string BuscarEdge()` looks in the default value of `HKLM` then `HKCU` `SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe`, then `%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe`, then `%ProgramFiles%\…`. Returns `null` if it finds nothing.
  - `static void AbrirVentana(string url)`: if Edge is missing, prints `No encontre Microsoft Edge. Abre la pagina del instructor en tu navegador.`

**Flags:**
- `--sin-ventana`
- `--url <url>`, default from the Global Constraints
- They combine with `--simulado` / `--simulado-limpio`.

**Behavior:**
- Before starting `Servir`, try to bind the port.
  - **If it's taken:** `AbrirVentana(url)`, print `El lector ya estaba abierto: abri la ventana del instructor.` and exit.
  - **If it's free:** start the server and, unless `--sin-ventana`, open the window.
- `Servir` receives the listener that was already bound.

**`--probar`** adds:
- `ArgumentosEdge("https://x/instructor/programa", @"C:\p")` equals the exact string above with those values;
- flag parsing: `--simulado --url http://localhost:5180/instructor/programa --sin-ventana` gives simulado + that url + no window.

**LEEME:** step 4 says the instructor window opens by itself when you open the program, that you sign in there once, and to pick "Probar voz". It mentions `--sin-ventana` for those who only want the reader for the page.

- [ ] **Step 1: Write the new `--probar` checks** and run them against the current exe to see them fail.
  - Run: `python -I tools/instructor-lector/build.py`, then `tools\instructor-lector\out\VillanuevaInstructorLector.exe --probar`.
  - Expected: doesn't compile (`ArgumentosEdge` doesn't exist) or `FALLA`.
- [ ] **Step 2: Implement** flags, `BuscarEdge`, `ArgumentosEdge`, `AbrirVentana`, port pre-bind, `.bat`, LEEME and Descargas.
- [ ] **Step 3: Verify.**
  - `--probar` → `OK`, exit 0.
  - Open `--simulado --url http://localhost:5180/instructor/programa`: an Edge window opens with no address bar and the program view says "Conectado".
  - Open the exe a second time: the console says "ya estaba abierto" and it opens another window without failing.
  - Close everything. Run `npx tsc -b --noEmit`, `npm.cmd test`, `npm.cmd run build`.
- [ ] **Step 4: Commit.**

```bash
git add tools/instructor-lector/LectorInstructor.cs "tools/instructor-lector/Iniciar con Windows.bat" tools/instructor-lector/LEEME.txt src/data/descargas.ts public/downloads/villanueva-instructor-lector.zip
git commit -m "Open the instructor in its own Edge window when the reader starts"
```
