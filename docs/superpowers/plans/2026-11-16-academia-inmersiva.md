# Academia inmersiva (piloto Fundamentos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La lectura de las 6 misiones de Fundamentos avanza con scroll: el texto sube y un visual fijo (foto, clip o avión 3D, con flechas y etiquetas animadas encima) cambia según el paso en pantalla.

**Architecture:** Cada tema se parte en pasos (la `clave` y cada punto de `TEMA_PUNTOS`). `src/data/escenas.ts` da un visual por paso. `LeccionScroll` reemplaza a `LessonFlow` dentro de `MisionesModulo` solo cuando todos los temas de la misión tienen escena, así que el resto de la academia no cambia. La lógica de qué paso está activo y qué tema ya se leyó son funciones puras con prueba; el componente solo mide posiciones y las llama.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind, framer-motion 13 (ya instalado), three.js (nuevo, solo en la tarea 4, cargado bajo demanda). Pruebas con `node --experimental-strip-types --test` (script `npm test`).

**Spec:** `docs/superpowers/specs/2026-11-16-academia-inmersiva-design.md`

## Global Constraints

- Textos en español; nada de «instructor certificado», «CFI», «licencia», «certificado», «curso oficial», «examen de la AFAC», «con IA»; nada de «Garmin» visible.
- No se usan imágenes generadas por IA en contenido técnico.
- Fotos: `.webp` a 800 y 1600 px. Clips: `.mp4` H.264 + `.webm`, `muted loop playsInline`, de 3 a 6 s, menos de 1.5 MB cada uno. Nada de GIF.
- Celular: el visual queda fijo arriba, alrededor del 45 % de la pantalla; escritorio: texto a la izquierda, visual sticky a la derecha.
- Con `prefers-reduced-motion: reduce`: fotos en lugar de clips, sin animaciones, sin 3D, texto completo legible.
- Clips y 3D se cargan cuando el tema está por entrar en pantalla, no al abrir la página.
- Cada visual lleva `alt` que describe lo que enseña.
- Un tema se marca con el mismo id de actividad de siempre (`completarActividad(modulo.slug, tema.id)`): el avance existente se conserva.
- Modelo 3D: licencia que permita uso comercial, alerones/elevador/timón como piezas separadas, menos de 3 MB.
- Git: `git add` solo de archivos nombrados; commit con `-m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`; nunca push sin que Erik lo apruebe; no tocar código mientras Erik vuela con el instructor.

**Ruling (spec vs. código):** el spec dice que las comprobaciones quedan como paradas, pero `MisionesModulo` ya llama a `LessonFlow` sin `checkpoints` (cada misión tiene su propio quiz al final). `LeccionScroll` no maneja comprobaciones; si algún día se usa fuera de las misiones, se agregan ahí.

## Review Focus

1. **Cambio de misión estando abajo en la página:** la lectura nueva se monta arriba de la pantalla; no debe marcar ningún tema como leído hasta que el alumno pase por él (prueba en Task 1: «un tema que nunca entró en pantalla no se marca»).
2. **Saltar al final (tecla Fin, scroll muy rápido):** un tema que sí estuvo en pantalla y quedó arriba se marca aunque no haya llegado ningún evento intermedio (prueba en Task 1: «visto antes y ya arriba se marca»).
3. **La página se remonta al volver a la ventana** (el avance se recarga con el foco): el paso activo se calcula de la posición del scroll al montar, no de un estado guardado (verificación manual en Task 3).
4. **Reducir movimiento activado:** ningún clip se reproduce solo y el 3D no se carga (verificación manual forzando `matchMedia` en Task 3 y Task 4).
5. **Imagen o clip que no carga:** el texto sigue legible y la lección se puede completar; el visual muestra el `alt` (prueba en Task 2: todos los archivos existen en `public/`).

---

### Task 1: Lógica pura de la lectura con scroll

**Files:**
- Create: `src/features/academia/lecturaScroll.ts`
- Test: `src/features/academia/lecturaScroll.test.ts`
- Modify: `package.json` (agregar el test al script `test`)

**Interfaces:**
- Consumes: `Tema` de `src/data/moduleContent.ts` (`clave?`, `puntos?: TemaPunto[]`, `texto`).
- Produces:
  - `interface PasoTexto { titulo?: string; texto: string }`
  - `pasosDeTema(tema: Tema): PasoTexto[]` — con `clave` y `puntos`: `[{ texto: clave }, ...puntos.map(p => ({ titulo: p.titulo, texto: p.texto }))]`; sin puntos: `[{ texto: tema.texto }]`.
  - `pasoActivo(tops: number[], mitad: number): number` — el último índice cuyo `top <= mitad`; 0 si ninguno.
  - `interface MedidaTema { id: string; arriba: number; abajo: number; topUltimo: number }` (en px relativos a la ventana: borde superior del primer paso, borde inferior del último, borde superior del último).
  - `leidosAhora(medidas: MedidaTema[], alto: number, vistos: ReadonlySet<string>): { vistos: Set<string>; leidos: string[] }` — un tema es *visto* si alguna vez `arriba < alto && abajo > 0`; es *leído* si es visto (ahora o antes) y `topUltimo < alto / 2`.

- [ ] **Step 1: Write the failing tests** en `lecturaScroll.test.ts`:

```ts
test("pasosDeTema: la clave y cada punto son un paso", () => {
  const tema = { id: "t", titulo: "T", texto: "largo", clave: "K", puntos: [{ titulo: "A", texto: "a" }, { titulo: "B", texto: "b" }] };
  assert.deepEqual(pasosDeTema(tema), [{ texto: "K" }, { titulo: "A", texto: "a" }, { titulo: "B", texto: "b" }]);
});
test("pasosDeTema: sin puntos, el texto completo es un solo paso", () => {
  assert.deepEqual(pasosDeTema({ id: "t", titulo: "T", texto: "largo" }), [{ texto: "largo" }]);
});
test("pasoActivo: el último paso que ya cruzó la mitad", () => {
  assert.equal(pasoActivo([100, 500, 900], 400), 0);
  assert.equal(pasoActivo([100, 500, 900], 600), 1);
  assert.equal(pasoActivo([500, 900], 400), 0);
  assert.equal(pasoActivo([-900, -500, -100], 400), 2);
});
test("leidosAhora: en pantalla y con el último paso arriba de la mitad, se marca", () => {
  const r = leidosAhora([{ id: "a", arriba: -200, abajo: 500, topUltimo: 300 }], 800, new Set());
  assert.deepEqual(r.leidos, ["a"]);
});
test("leidosAhora: en pantalla pero el último paso abajo de la mitad, solo queda visto", () => {
  const r = leidosAhora([{ id: "a", arriba: 100, abajo: 1400, topUltimo: 1000 }], 800, new Set());
  assert.deepEqual(r.leidos, []);
  assert.ok(r.vistos.has("a"));
});
test("leidosAhora: un tema que nunca entró en pantalla no se marca (cambio de misión estando abajo)", () => {
  const r = leidosAhora([{ id: "a", arriba: -3000, abajo: -1500, topUltimo: -1800 }], 800, new Set());
  assert.deepEqual(r.leidos, []);
  assert.equal(r.vistos.size, 0);
});
test("leidosAhora: visto antes y ya arriba de la pantalla se marca (salto con la tecla Fin)", () => {
  const r = leidosAhora([{ id: "a", arriba: -3000, abajo: -1500, topUltimo: -1800 }], 800, new Set(["a"]));
  assert.deepEqual(r.leidos, ["a"]);
});
```

- [ ] **Step 2: Agregar `src/features/academia/lecturaScroll.test.ts` al final del script `test` de `package.json` y correr**

Run: `node --experimental-strip-types --test src/features/academia/lecturaScroll.test.ts`
Expected: FAIL (no existe `lecturaScroll.ts`).

- [ ] **Step 3: Implementar las tres funciones en `lecturaScroll.ts`** (importar `Tema` con `import type` desde `../../data/moduleContent.ts`).

- [ ] **Step 4: Correr**

Run: `npm test` y `npx tsc -b --noEmit`
Expected: todo pasa (747 + 7 nuevas), sin errores de tipos.

- [ ] **Step 5: Commit**

```bash
git add src/features/academia/lecturaScroll.ts src/features/academia/lecturaScroll.test.ts package.json
git commit -m "Add the pure scroll-reading logic for immersive lessons" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Escenas de Fundamentos (con las imágenes que ya existen)

**Files:**
- Create: `src/data/escenas.ts`
- Test: `src/data/escenas.test.ts`
- Modify: `package.json` (agregar el test)

**Interfaces:**
- Consumes: `pasosDeTema` (Task 1); `flattenTemas("fundamentos")`.
- Produces:
  - `type Punto = [x: number, y: number]` en porcentaje (0–100) del visual.
  - `type Marca = { tipo: "flecha"; desde: Punto; hasta: Punto; texto?: string } | { tipo: "etiqueta"; en: Punto; texto: string }`
  - `type Visual = { tipo: "foto"; src: string; alt: string; marcas?: Marca[] } | { tipo: "clip"; mp4: string; webm: string; poster: string; alt: string; marcas?: Marca[] } | { tipo: "avion3d"; superficie: "alerones" | "elevador" | "timon" | "flaps" | null; eje: "longitudinal" | "lateral" | "vertical" | null; poster: string; alt: string }`
  - `ESCENAS: Record<string, Visual[]>` — un visual por paso, para los 8 temas de Fundamentos.
  - `tieneEscena(temaId: string): boolean`

Contenido provisional (hasta que lleguen las tomas de Erik): cada paso usa la imagen actual del tema (`tema.imagenes`; en tema7 la imagen de cada control que nombra el paso, en tema3 `fundamentos-pdb.png` para Bernoulli y `fundamentos-tldn.png` para Newton). Tema2 (4 fuerzas) usa `/images/flota/c172-1600.webp` con marcas: el paso 1 sin marcas, después una flecha por fuerza (sustentación arriba, peso abajo, empuje adelante, resistencia atrás) con su etiqueta, colocadas mirando la foto. Ninguna escena usa `avion3d` hasta Task 4.

- [ ] **Step 1: Write the failing tests** en `escenas.test.ts`:

```ts
test("cada tema de Fundamentos tiene un visual por paso", () => {
  for (const tema of flattenTemas("fundamentos")!) {
    assert.equal(ESCENAS[tema.id]?.length, pasosDeTema(tema).length, tema.id);
  }
});
test("cada archivo de las escenas existe en public/", () => {
  for (const [id, visuales] of Object.entries(ESCENAS)) for (const v of visuales) {
    const rutas = v.tipo === "foto" ? [v.src] : v.tipo === "clip" ? [v.mp4, v.webm, v.poster] : [v.poster];
    for (const r of rutas) assert.ok(existsSync(join("public", r)), `${id}: ${r}`);
  }
});
test("cada visual describe lo que enseña y sus marcas caen dentro de la imagen", () => {
  for (const visuales of Object.values(ESCENAS)) for (const v of visuales) {
    assert.ok(v.alt.trim().length >= 10);
    const puntos = "marcas" in v ? (v.marcas ?? []).flatMap((m) => (m.tipo === "flecha" ? [m.desde, m.hasta] : [m.en])) : [];
    for (const [x, y] of puntos) assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100);
  }
});
test("el avión 3D solo aparece en superficies y ejes", () => {
  for (const [id, visuales] of Object.entries(ESCENAS))
    if (visuales.some((v) => v.tipo === "avion3d")) assert.ok(["fundamentos-tema5", "fundamentos-tema6"].includes(id), id);
});
test("los textos de las escenas no usan palabras prohibidas", () => {
  const todo = JSON.stringify(ESCENAS).toLowerCase();
  for (const p of ["certificado", "cfi", "licencia", "curso oficial", "afac", "con ia", "garmin"]) assert.ok(!todo.includes(p), p);
});
```

- [ ] **Step 2: Agregar el test a `package.json` y correr**

Run: `node --experimental-strip-types --test src/data/escenas.test.ts`
Expected: FAIL (no existe `escenas.ts`).

- [ ] **Step 3: Escribir `escenas.ts`** con los tipos y las 8 escenas provisionales descritas arriba.

- [ ] **Step 4: Correr**

Run: `npm test` y `npx tsc -b --noEmit`
Expected: todo pasa.

- [ ] **Step 5: Commit**

```bash
git add src/data/escenas.ts src/data/escenas.test.ts package.json
git commit -m "Add the Fundamentos scenes with the current images" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Lectura con scroll en las misiones

**Files:**
- Create: `src/features/academia/VisualEscena.tsx`
- Create: `src/features/academia/LeccionScroll.tsx`
- Modify: `src/features/academia/MisionesModulo.tsx:151-161` (la tarjeta «Lo esencial»)

**Interfaces:**
- Consumes: `pasosDeTema`, `pasoActivo`, `leidosAhora`, `MedidaTema` (Task 1); `ESCENAS`, `tieneEscena`, `Visual`, `Marca` (Task 2).
- Produces:
  - `VisualEscena({ visual, quieto }: { visual: Visual; quieto: boolean }): JSX.Element` — foto o clip con un SVG encima (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, `absolute inset-0` sobre un contenedor del tamaño de la imagen) que dibuja las marcas; las marcas entran con framer-motion salvo con `quieto`. Un clip con `quieto` muestra su `poster`. Al cambiar de visual, cruce suave (`AnimatePresence`), sin animación con `quieto`.
  - `LeccionScroll({ temas, isCompleted, onAdvance }: { temas: Tema[]; isCompleted: (id: string) => boolean; onAdvance: (id: string) => void }): JSX.Element` — mismas props que `LessonFlow` sin `checkpoints`, para que `MisionesModulo` cambie uno por otro.

Comportamiento de `LeccionScroll`:
- Cada tema: título (con palomita si `isCompleted`), sus pasos en bloques altos (aprox. 70vh en escritorio, 60vh en celular), y al final «Ver explicación completa» con `tema.texto`, como hoy.
- Un listener de `scroll`/`resize` (con `requestAnimationFrame`) mide los pasos con `getBoundingClientRect`, calcula el paso activo con `pasoActivo` (mitad = `innerHeight / 2`) y llama a `onAdvance(id)` una vez por cada id nuevo de `leidosAhora` que no esté ya completo. Se mide también al montar, así el remonte por foco de ventana no pierde el paso.
- Visual sticky: escritorio `lg:` dos columnas, visual en `sticky top-28`; celular arriba en `sticky top-16 h-[45vh]`.
- `quieto` = `matchMedia("(prefers-reduced-motion: reduce)")`.
- Clips: `<video muted loop playsInline autoPlay preload="none">` con `<source>` webm y mp4, y solo se monta el `<video>` cuando su tema está a una pantalla de distancia.

- [ ] **Step 1: Escribir `VisualEscena.tsx` y `LeccionScroll.tsx`.**

- [ ] **Step 2: En `MisionesModulo.tsx`, usar `LeccionScroll` cuando `temas.every((t) => tieneEscena(t.id))`; si no, `LessonFlow` como hoy.**

- [ ] **Step 3: Verificar tipos y pruebas**

Run: `npx tsc -b --noEmit` y `npm test`
Expected: sin errores; todo pasa.

- [ ] **Step 4: Verificar en el navegador** (servidor `ruta-red-dev` de `.claude/launch.json`; Erik inicia sesión en el panel, Claude no). En `/academia/fundamentos`, misiones 1 a 6:
  - el visual cambia al pasar cada paso, en escritorio y con `resize_window` móvil (375×812);
  - el tema se palomea al pasar su último paso, y en Supabase/estado de progreso aparece el mismo id;
  - estando al final de la misión 1, «Siguiente misión» no palomea ningún tema de la misión 2 (Review Focus 1);
  - tecla Fin palomea los temas que ya se vieron (Review Focus 2);
  - cambiar de ventana y regresar mantiene el paso activo (Review Focus 3);
  - con `matchMedia` de reducir movimiento forzado (`javascript_tool` para comprobar que no hay `<video>` reproduciéndose ni animaciones) se ve todo fijo (Review Focus 4);
  - un clip de prueba local, sin commit, para comprobar que se reproduce en bucle y sin sonido;
  - `read_console_messages` sin errores. Captura de pantalla como prueba.

- [ ] **Step 5: Commit**

```bash
git add src/features/academia/VisualEscena.tsx src/features/academia/LeccionScroll.tsx src/features/academia/MisionesModulo.tsx
git commit -m "Read Fundamentos missions by scrolling, with a sticky visual per step" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Avión 3D en superficies y ejes

**Files:**
- Create: `src/features/academia/Avion3D.tsx`
- Create: `public/modelos/<modelo>.glb` y `public/modelos/LICENCIA.txt` (autor, enlace y licencia)
- Modify: `src/features/academia/VisualEscena.tsx` (caso `avion3d` con `React.lazy`)
- Modify: `src/data/escenas.ts` (temas 5 y 6 pasan a `avion3d`), `package.json` (dependencia `three`, versión exacta)

**Interfaces:**
- Consumes: `Visual` con `tipo: "avion3d"` (Task 2); `VisualEscena` (Task 3).
- Produces: `Avion3D({ superficie, eje }: { superficie: "alerones" | "elevador" | "timon" | "flaps" | null; eje: "longitudinal" | "lateral" | "vertical" | null }): JSX.Element`, export default, para cargarse con `React.lazy`.

- [ ] **Step 1: PARADA — elegir el modelo.** Claude busca 2 o 3 modelos de Cessna 172 o 152 que cumplan las restricciones globales (licencia comercial, superficies separadas, menos de 3 MB) y se los presenta a Erik con precio y licencia. Erik aprueba uno (y lo compra si cuesta; Claude no paga ni crea cuentas). Si ninguno sirve, se cancela esta tarea y se usa el plan B del spec (vuelta de 360° que captura Erik), en un plan aparte.

- [ ] **Step 2: Escribir `Avion3D.tsx`** con `three` directo (sin react-three-fiber): `GLTFLoader` y `OrbitControls` de `three/examples/jsm`, la superficie indicada oscila unos 20° alrededor de su bisagra, el eje se dibuja como una línea dorada por el centro de gravedad y el avión gira suave sobre ese eje. Una tabla `PIEZAS: Record<superficie, string[]>` con los nombres de nodo del modelo elegido. Libera geometrías y el renderer al desmontar.

- [ ] **Step 3: En `VisualEscena`, `avion3d` carga `Avion3D` con `React.lazy` + `Suspense` (fallback: `poster`). Con `quieto` o sin WebGL, solo el `poster`.**

- [ ] **Step 4: Cambiar los pasos de temas 5 y 6 en `escenas.ts` a `avion3d`** (cada superficie en el paso que la nombra; cada eje en el suyo; `poster` = la imagen actual del tema).

- [ ] **Step 5: Verificar**

Run: `npm test`, `npx tsc -b --noEmit` y `npm run build`
Expected: todo pasa; en `dist/assets` `three` queda en un chunk aparte que no aparece en el `index-*.js` principal (`grep -l "WebGLRenderer" dist/assets/*.js` da solo el chunk de `Avion3D`).
En el navegador: el modelo solo se descarga al llegar al tema 5 (`read_network_requests`), gira con el dedo/ratón, la superficie correcta se mueve en cada paso; con reducir movimiento solo se ve el `poster`.

- [ ] **Step 6: Commit**

```bash
git add src/features/academia/Avion3D.tsx src/features/academia/VisualEscena.tsx src/data/escenas.ts package.json package-lock.json public/modelos/<modelo>.glb public/modelos/LICENCIA.txt
git commit -m "Show a 3D Cessna for control surfaces and axes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fuera de este plan (siguen después)

- Cambiar las imágenes provisionales por las tomas de Erik (lista en el spec) y dibujar sus marcas: solo se edita `escenas.ts`.
- Revisar las reglas de Microsoft sobre capturas del simulador antes de publicar.
- Publicar (push a main) cuando Erik lo apruebe, y a las 3 semanas volver a correr el embudo de Fundamentos.
