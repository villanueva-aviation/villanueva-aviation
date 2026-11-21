# Academia estilo Rise — fase 1 (motor + versión automática) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Los 14 módulos de la Academia se leen por capítulos que se recorren bajando, con imagen fija que cambia, tarjetas, candados, interactivos y cierre, armados solos con el contenido que ya existe.

**Architecture:** Un motor puro (`src/features/academia/rise/motor.ts`) convierte cada módulo en `Capitulo[]`, cada uno con una lista de `Bloque`. Unas reglas puras (`reglas.ts`) deciden candados, capítulo inicial y enlaces viejos. Los componentes (`CapituloRise`, `LeccionRise`, `Bloques`) solo pintan bloques; `AcademiaModulo` junta Lección e Interactividad en una sola etapa «Lección» que usa `LeccionRise`. `LeccionScroll` (rama `academia-inmersiva`) se reutiliza para cada tramo de lectura. La capa a mano (`src/data/rise/<slug>.ts`) no se construye aquí: llega con la primera ronda de la fase 2, cuando haya un bloque a mano que meter.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind 4, framer-motion, react-router; pruebas con `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-17-academia-estilo-rise-design.md`

## Global Constraints

- Rama `academia-inmersiva` en el worktree `.claude/worktrees/ruta-listo-para-red`. No se sube a `main` sin que Erik diga que sí («¿La subo?»).
- La fase 1 **no escribe texto técnico nuevo**: todo lo técnico sale de `MODULE_LECCIONES`, `TEMA_PUNTOS`, `MODULE_CHECKPOINTS`, `misiones.ts` y las actividades del módulo. Lo único nuevo son rótulos de navegación («Repaso rápido», «Capítulo 2 de 3», «Siguiente capítulo»…).
- Mismos ids de actividad de siempre; sin migraciones ni cambios en la base de datos. Práctica, Evaluación y Proyecto no cambian.
- Interfaz en español. Prohibido: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA».
- Nunca imágenes generadas por IA; solo las imágenes de los temas, `/flota` y las escenas de `escenas.ts`.
- «Reducir movimiento» del sistema: todo fijo, sin animaciones (reusar `usarQuieto`). Tarjetas, candado y menú se usan con teclado y dedo (botones). Imágenes fuera de la portada con `loading="lazy"`.
- Archivos puros importan con extensión `.ts` (los corre node sin bundler). Cada `*.test.ts` nuevo se agrega a la lista explícita de `"test"` en `package.json`.
- Commits: `git add` solo con archivos nombrados; `git commit -m "<inglés, imperativo>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`. Nunca agregar `.superpowers/`, `remotion-video/`, `.agents/`, `supabase/.temp/`.
- Verificación de cada tarea: `npm test` y `npx tsc -b --noEmit` sin errores.

## Review Focus

1. **Tema sin imágenes o sin puntos** (espacios-aereos tiene 4 temas sin imagen; algunos temas solo tienen `texto`): la lectura se ve completa, el visual fijo muestra el título del tema en vez de un hueco y no salen tarjetas vacías. Pruebas en Tarea 1 (`visualesDeTema` vacío, tarjetas solo de temas con puntos).
2. **Cadete que regresa con avance guardado**: entra al primer capítulo sin terminar y los candados de lo ya leído están abiertos (no le vuelve a preguntar todo). Pruebas en Tarea 2 (`capituloInicial`, `candadoAbiertoDeInicio`).
3. **Enlaces viejos y URL basura** (`?etapa=interactividad`, `?etapa=misiones`, `?mision=3`, `?capitulo=99`, `?capitulo=abc`): caen en un capítulo válido, nunca en pantalla vacía. Pruebas en Tarea 2 (`capituloDeUrl`, `etapaInicial`).
4. **Candado cerrado**: lo que sigue no se monta (solo un adelanto borroso), así el scroll no marca como leído un tema que no se vio; al contestar aparece sin saltar al inicio. Prueba de reglas en Tarea 2; revisión en navegador en Tarea 5.
5. **Celular angosto (375 px)**: visual fijo ~45 % arriba, menú de puntos oculto y «Capítulo N de M» con la barra; sin scroll horizontal. Revisión en navegador en Tarea 5.

---

### Task 1: Poner la rama al día y el motor de capítulos

**Files:**
- Create: `src/features/academia/rise/motor.ts`
- Test: `src/features/academia/rise/motor.test.ts`
- Modify: `package.json` (lista de `"test"`)

**Interfaces:**
- Consumes: `flattenTemas`, `MODULE_LECCIONES`, `checkpointsDeModulo` (`src/data/moduleContent.ts`); `MISIONES`, `Mision` (`src/data/misiones.ts`); `ACADEMIA_MODULOS`, `ModuloActividad` (`src/data/academia.ts`); `ESCENAS`, `Visual` (`src/data/escenas.ts`); `pasosDeTema` (`src/features/academia/lecturaScroll.ts`); `QuizPregunta` (`src/features/academia/quizData.ts`).
- Produces:
  ```ts
  export interface Tarjeta { frente: string; reverso: string }
  export type Bloque =
    | { tipo: "portada"; imagen: string | null; gancho: string | null }
    | { tipo: "video"; youtubeId: string }
    | { tipo: "lectura"; temas: Tema[] }
    | { tipo: "candado"; pregunta: QuizPregunta }
    | { tipo: "tarjetas"; tarjetas: Tarjeta[] }
    | { tipo: "interactivo"; actividad: ModuloActividad }
    | { tipo: "simulador"; pasos: string[] }
    | { tipo: "cierre" };
  export interface Capitulo { id: string; titulo: string; minutos: number; temas: string[]; interactivos: string[]; bloques: Bloque[] }
  export function armarCapitulos(slug: string): Capitulo[];
  export function visualesDeTema(tema: Tema): Visual[];
  export function capituloCompleto(c: Capitulo, hecha: (id: string) => boolean): boolean;
  export function capituloInicial(caps: Capitulo[], hecha: (id: string) => boolean): number;
  ```

- [ ] **Step 1: Poner la rama al día**

Run: `git fetch -q origin main` y luego `git merge --no-edit origin/main`
Expected: merge sin conflictos (main solo trae el arreglo IFR 5: `navIfr.ts`, `evaluadorInterceptacion.ts`, `llegada.test.ts`, spec). Luego `npm test` y `npx tsc -b --noEmit` en verde.

- [ ] **Step 2: Escribir las pruebas que fallan** en `motor.test.ts` (y agregarlo a `package.json`)

```ts
test("los 14 módulos tienen capítulos que abren con portada y terminan con cierre", () => {
  assert.equal(ACADEMIA_MODULOS.length, 14);
  for (const m of ACADEMIA_MODULOS) {
    const caps = armarCapitulos(m.slug);
    assert.ok(caps.length > 0, m.slug);
    for (const c of caps) {
      assert.equal(c.bloques[0].tipo, "portada", c.id);
      assert.equal(c.bloques.at(-1)!.tipo, "cierre", c.id);
    }
  }
});

test("cada lectura e interactivo del módulo aparece exactamente una vez", () => {
  for (const m of ACADEMIA_MODULOS) {
    const caps = armarCapitulos(m.slug);
    const enBloques = caps.flatMap((c) => c.bloques.flatMap((b) =>
      b.tipo === "lectura" ? b.temas.map((t) => t.id) : b.tipo === "interactivo" ? [b.actividad.id] : []));
    const esperadas = m.actividades.filter((a) => a.tipo === "leccion" || a.tipo === "interactividad").map((a) => a.id);
    assert.deepEqual([...enBloques].sort(), [...esperadas].sort(), m.slug);
    assert.deepEqual(caps.flatMap((c) => [...c.temas, ...c.interactivos]).sort(), [...esperadas].sort(), m.slug);
  }
});

test("fundamentos: un capítulo por misión, simulador y sus preguntas como candados al final", () => {
  const caps = armarCapitulos("fundamentos");
  assert.deepEqual(caps.map((c) => c.titulo), MISIONES.fundamentos.map((m) => m.titulo));
  caps.forEach((c, i) => {
    const m = MISIONES.fundamentos[i];
    assert.equal(c.minutos, m.minutos);
    const n = m.preguntas.length;
    assert.deepEqual(c.bloques.slice(-1 - n, -1).map((b) => b.tipo === "candado" && b.pregunta.id), m.preguntas.map((p) => p.id));
    assert.deepEqual(c.bloques.find((b) => b.tipo === "simulador"), { tipo: "simulador", pasos: m.enSimulador });
  });
  const ids = caps.flatMap((c) => c.bloques.flatMap((b) => (b.tipo === "candado" ? [b.pregunta.id] : [])));
  assert.ok(!ids.includes("fun-q2") && !ids.includes("fun-q11"));
});

test("cada comprobación va como candado justo después de su tema", () => {
  for (const m of ACADEMIA_MODULOS.filter((m) => m.slug !== "fundamentos")) {
    const temas = flattenTemas(m.slug)!;
    const bloques = armarCapitulos(m.slug).flatMap((c) => c.bloques);
    const cps = checkpointsDeModulo(m.slug);
    assert.equal(bloques.filter((b) => b.tipo === "candado").length, cps.length, m.slug);
    for (const cp of cps) {
      const i = bloques.findIndex((b) => b.tipo === "candado" && b.pregunta.id === cp.pregunta.id);
      const antes = bloques[i - 1];
      assert.ok(antes.tipo === "lectura" && antes.temas.at(-1)!.id === temas[cp.despuesDeTema].id, `${m.slug} ${cp.pregunta.id}`);
    }
  }
});

test("los interactivos se reparten en orden entre los capítulos", () => {
  const caps = armarCapitulos("vfr");
  assert.deepEqual(caps.map((c) => c.interactivos.length), [1, 1, 2]);
  const orden = ACADEMIA_MODULOS.find((m) => m.slug === "vfr")!.actividades.filter((a) => a.tipo === "interactividad").map((a) => a.id);
  assert.deepEqual(caps.flatMap((c) => c.interactivos), orden);
});

test("las tarjetas salen de los puntos del capítulo, sin texto nuevo", () => {
  for (const m of ACADEMIA_MODULOS) for (const c of armarCapitulos(m.slug)) {
    const puntos = c.bloques.flatMap((b) => (b.tipo === "lectura" ? b.temas.flatMap((t) => t.puntos ?? []) : []));
    for (const b of c.bloques) if (b.tipo === "tarjetas") {
      assert.ok(b.tarjetas.length >= 2 && b.tarjetas.length <= 6, c.id);
      for (const t of b.tarjetas) {
        const p = puntos.find((p) => p.titulo === t.frente);
        assert.ok(p, `${c.id}: ${t.frente}`);
        assert.equal(t.reverso.toLowerCase(), p.texto.toLowerCase());
      }
    }
  }
});

test("visualesDeTema: escenas primero, luego las imágenes del tema repartidas por paso, si no hay nada vacío", () => {
  const t2 = flattenTemas("fundamentos")!.find((t) => t.id === "fundamentos-tema2")!;
  assert.deepEqual(visualesDeTema(t2), ESCENAS["fundamentos-tema2"]);
  const tema = { id: "x", titulo: "X", texto: "t", clave: "k", imagenes: ["/a.jpg", "/b.jpg"],
    puntos: [{ titulo: "1", texto: "1" }, { titulo: "2", texto: "2" }, { titulo: "3", texto: "3" }] };
  assert.deepEqual(visualesDeTema(tema).map((v) => v.tipo === "foto" && v.src), ["/a.jpg", "/a.jpg", "/b.jpg", "/b.jpg"]);
  assert.deepEqual(visualesDeTema({ id: "y", titulo: "Y", texto: "t" }), []);
});

test("capituloInicial: el primero sin terminar, o el último si todo está hecho", () => {
  const caps = armarCapitulos("meteorologia");
  const hechos = new Set([...caps[0].temas, ...caps[0].interactivos]);
  assert.equal(capituloCompleto(caps[0], (id) => hechos.has(id)), true);
  assert.equal(capituloInicial(caps, (id) => hechos.has(id)), 1);
  assert.equal(capituloInicial(caps, () => false), 0);
  assert.equal(capituloInicial(caps, () => true), caps.length - 1);
});

test("minutos de cada capítulo: al menos 3; módulo inexistente sin capítulos", () => {
  for (const m of ACADEMIA_MODULOS) for (const c of armarCapitulos(m.slug)) assert.ok(c.minutos >= 3, c.id);
  assert.deepEqual(armarCapitulos("no-existe"), []);
});
```

- [ ] **Step 3: Correr y ver que fallan**

Run: `npm test`
Expected: FAIL en `motor.test.ts` («Cannot find module …/rise/motor.ts»); las demás pasan.

- [ ] **Step 4: Implementar `motor.ts`**

Orden de bloques (decisión del spec, cópiala tal cual):
- **Fundamentos** (un capítulo por misión, `id = mision.id`, `minutos = mision.minutos`): `portada` (gancho = `mision.gancho`, imagen = primer visual foto de su primer tema) → `video` si `videoId` → `lectura` (sus temas, en el orden de `mision.temas`) → `tarjetas` → `interactivo` por cada id de `mision.interactivos` → `simulador` (`enSimulador`) → un `candado` por cada `mision.preguntas` → `cierre`. No usa `MODULE_CHECKPOINTS`.
- **Demás módulos** (un capítulo por grupo de `MODULE_LECCIONES[slug]`, `id = "${slug}-cap${i+1}"`, título del grupo): `portada` (gancho `null`, imagen = primera `imagenes[0]` de sus temas o `null`) → los temas del grupo en tramos `lectura`, cortando con un `candado` justo después del tema global `despuesDeTema` de cada `checkpointsDeModulo(slug)` → `tarjetas` → sus `interactivo` → `cierre`.
- Los temas salen de `flattenTemas(slug)` (trae `clave` y `puntos`); el grupo i toma el tramo consecutivo de su largo.
- Interactivos del módulo (en orden de `actividades`) repartidos: el capítulo i de C recibe `slice(floor(i*N/C), floor((i+1)*N/C))`.
- Tarjetas: el primer punto de cada tema del capítulo que tenga puntos; si hay más de 6, toma los de los índices `floor(k*n/6)`, k = 0..5; `reverso` con la primera letra en mayúscula. Solo se agrega el bloque si hay 2 o más.
- `visualesDeTema`: `ESCENAS[tema.id]` si existe; si no, un `foto` por paso de `pasosDeTema(tema)` con `imagenes[floor(p*L/P)]` y `alt = tema.titulo`; sin imágenes, `[]`.
- Minutos (no Fundamentos): `max(3, round(palabras/180 + 2*interactivos))`, contando palabras de `clave` y `puntos` (lo que se lee al bajar).
- `capituloCompleto`: todos sus `temas` e `interactivos` hechos; `capituloInicial`: igual que `misionInicial` en `misiones.ts`.

- [ ] **Step 5: Correr y ver que pasan**

Run: `npm test` y `npx tsc -b --noEmit`
Expected: todo en verde.

- [ ] **Step 6: Commit**

```bash
git add src/features/academia/rise/motor.ts src/features/academia/rise/motor.test.ts package.json
git commit -m "Build academy chapters with Rise-style blocks from existing content" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Reglas del candado, del capítulo inicial y de los enlaces viejos

**Files:**
- Create: `src/features/academia/rise/reglas.ts`
- Test: `src/features/academia/rise/reglas.test.ts`
- Modify: `package.json` (lista de `"test"`)

**Interfaces:**
- Consumes: `Bloque` (Tarea 1).
- Produces:
  ```ts
  export interface EstadoCandado { fallos: number; abierto: boolean; elegida: number | null }
  export const CANDADO_NUEVO: EstadoCandado; // { fallos: 0, abierto: false, elegida: null }
  export function responderCandado(e: EstadoCandado, opcion: number, correcta: number): EstadoCandado;
  export function candadoAbiertoDeInicio(bloques: Bloque[], i: number, hecha: (id: string) => boolean): boolean;
  export function capituloDeUrl(capitulo: string | null, mision: string | null, total: number, inicial: number): number; // 0-based
  export function etapaInicial(etapa: string | null, etapas: string[]): string;
  ```

- [ ] **Step 1: Escribir las pruebas que fallan** (y agregar el archivo a `package.json`)

```ts
test("candado: bien a la primera abre", () => {
  assert.deepEqual(responderCandado(CANDADO_NUEVO, 2, 2), { fallos: 0, abierto: true, elegida: 2 });
});
test("candado: un fallo deja reintentar; el segundo abre", () => {
  const uno = responderCandado(CANDADO_NUEVO, 0, 2);
  assert.deepEqual(uno, { fallos: 1, abierto: false, elegida: 0 });
  assert.deepEqual(responderCandado(uno, 1, 2), { fallos: 2, abierto: true, elegida: 1 });
});
test("candado: ya abierto no cambia", () => {
  const abierto = { fallos: 0, abierto: true, elegida: 2 };
  assert.equal(responderCandado(abierto, 0, 2), abierto);
});

const lect = (...ids: string[]) => ({ tipo: "lectura" as const, temas: ids.map((id) => ({ id, titulo: id, texto: id })) });
const cand = { tipo: "candado" as const, pregunta: { id: "q", pregunta: "?", opciones: ["a", "b"], correcta: 0 } };
test("candadoAbiertoDeInicio: abierto si el tema que sigue ya se leyó", () => {
  const bloques = [lect("a"), cand, lect("b"), { tipo: "cierre" as const }];
  assert.equal(candadoAbiertoDeInicio(bloques, 1, (id) => id === "a" || id === "b"), true);
  assert.equal(candadoAbiertoDeInicio(bloques, 1, (id) => id === "a"), false);
});
test("candadoAbiertoDeInicio: al final del capítulo, abierto si todo el capítulo se leyó", () => {
  const bloques = [lect("a", "b"), cand, cand, { tipo: "cierre" as const }];
  assert.equal(candadoAbiertoDeInicio(bloques, 2, () => true), true);
  assert.equal(candadoAbiertoDeInicio(bloques, 2, (id) => id === "a"), false);
});

test("capituloDeUrl: ?capitulo manda, ?mision es el enlace viejo, lo inválido cae en el inicial", () => {
  assert.equal(capituloDeUrl("2", null, 6, 0), 1);
  assert.equal(capituloDeUrl(null, "3", 6, 0), 2);
  assert.equal(capituloDeUrl("2", "5", 6, 0), 1);
  assert.equal(capituloDeUrl("99", null, 6, 4), 4);
  assert.equal(capituloDeUrl("abc", null, 6, 4), 4);
  assert.equal(capituloDeUrl("0", null, 6, 4), 4);
  assert.equal(capituloDeUrl(null, null, 6, 4), 4);
});

test("etapaInicial: leccion, interactividad y misiones llevan a la lección", () => {
  const etapas = ["introduccion", "leccion", "practica", "evaluacion", "proyecto"];
  for (const e of ["leccion", "interactividad", "misiones"]) assert.equal(etapaInicial(e, etapas), "leccion");
  assert.equal(etapaInicial("practica", etapas), "practica");
  assert.equal(etapaInicial("otra", etapas), "introduccion");
  assert.equal(etapaInicial(null, etapas), "introduccion");
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `npm test`
Expected: FAIL en `reglas.test.ts` (módulo no existe).

- [ ] **Step 3: Implementar `reglas.ts`**

`candadoAbiertoDeInicio`: busca el primer tema en un bloque `lectura` después del índice `i`; si existe, abierto si ese tema está hecho; si no hay temas después, abierto si todos los temas de todas las `lectura` de `bloques` están hechos.

- [ ] **Step 4: Correr y ver que pasan**

Run: `npm test` y `npx tsc -b --noEmit`
Expected: todo en verde.

- [ ] **Step 5: Commit**

```bash
git add src/features/academia/rise/reglas.ts src/features/academia/rise/reglas.test.ts package.json
git commit -m "Add the gate, starting chapter and legacy link rules for the Rise lessons" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Bloques y capítulo que se recorre bajando

**Files:**
- Modify: `src/features/academia/LeccionScroll.tsx`
- Create: `src/features/academia/rise/Bloques.tsx`
- Create: `src/features/academia/rise/CapituloRise.tsx`
- Modify: `src/data/escenas.ts`, `src/data/escenas.test.ts` (solo si `tieneEscena` queda sin uso: se borra con su prueba)

**Interfaces:**
- Consumes: `Capitulo`, `Bloque`, `Tarjeta`, `visualesDeTema` (Tarea 1); `EstadoCandado`, `CANDADO_NUEVO`, `responderCandado`, `candadoAbiertoDeInicio` (Tarea 2); `InteractividadWidget`, `INTERACTIVIDAD_INTRO`; `VideoYouTube`; `Button`.
- Produces:
  ```tsx
  // LeccionScroll.tsx
  export function usarQuieto(): boolean;               // ahora exportado
  export function LeccionScroll(props: { temas: Tema[]; isCompleted: (id: string) => boolean; onAdvance: (id: string) => void }): JSX.Element;
  // Bloques.tsx
  export function Portada(p: { titulo: string; numero: number; total: number; minutos: number; imagen: string | null; gancho: string | null }): JSX.Element;
  export function Tarjetas(p: { tarjetas: Tarjeta[] }): JSX.Element;
  export function Candado(p: { pregunta: QuizPregunta; abiertoDeInicio: boolean; onAbrir: () => void }): JSX.Element;
  export function EnTuSimulador(p: { pasos: string[] }): JSX.Element;   // movido tal cual de MisionesModulo
  // CapituloRise.tsx
  export function CapituloRise(p: {
    modulo: AcademiaModulo; capitulo: Capitulo; numero: number; total: number;
    isCompleted: (id: string) => boolean; onComplete: (id: string) => void;
    onSiguiente: (() => void) | null;   // null en el último capítulo
    onTerminar: () => void; todoCompleto: boolean;
  }): JSX.Element;
  ```

- [ ] **Step 1: `LeccionScroll` sirve para cualquier módulo**

Cambia `ESCENAS[temas[ta]?.id]?.[pa]` por `visualesDeTema(temas[ta])[pa]`. Cuando el tema activo no tiene visual, el panel fijo muestra su título en grande sobre el fondo navy (nunca un hueco ni la imagen de otro tema). El botón dice «Leer la explicación completa» / «Ocultar la explicación completa». Exporta `usarQuieto`.

- [ ] **Step 2: `Bloques.tsx`** (siguiendo la maqueta aprobada `.superpowers/brainstorm/344-1794954513/content/leccion-rise.html`)

- `Portada`: alto `min-h-[70vh]`, imagen `object-cover` con acercamiento lento (sin acercamiento si `usarQuieto()`), degradado y encima «Capítulo N de M · X min», título y gancho. Sin imagen: fondo degradado navy.
- `Tarjetas`: rótulo «Repaso rápido · toca cada tarjeta»; cada tarjeta es un `<button aria-pressed>` que voltea (rotateY; con `quieto`, solo cambia el contenido).
- `Candado`: rótulo «Comprueba antes de seguir»; opciones como botones; estado con `responderCandado`. Primer fallo: opción en rojo y «Inténtalo otra vez». Segundo fallo: se marca la correcta, «La correcta queda marcada. Sigamos.» y se abre. Al abrirse llama `onAbrir` una vez. Si `abiertoDeInicio`, se ve ya contestado con la correcta marcada y no bloquea.
- `EnTuSimulador`: mover desde `MisionesModulo.tsx` sin cambios.

- [ ] **Step 3: `CapituloRise.tsx`**

- Pinta `capitulo.bloques` en orden: `portada` → `Portada`; `video` → `VideoYouTube`; `lectura` → `LeccionScroll` (`key` = ids de sus temas); `tarjetas`; `candado`; `interactivo` → la misma tarjeta de hoy en `MisionesModulo` (título, `INTERACTIVIDAD_INTRO`, `InteractividadWidget`, «Marcar como completada»); `simulador`; `cierre`.
- Candados: un `Set` de índices abiertos que arranca con los que dan `candadoAbiertoDeInicio`. Se montan los bloques hasta el primer candado cerrado, inclusive; después va solo un adelanto `aria-hidden` borroso (`blur-sm`, sin contenido real, «Contesta para seguir») — así el scroll no marca temas que no se vieron.
- Cierre: si el capítulo está completo, sello «Capítulo completo» y botón «Siguiente capítulo» (`onSiguiente`) o, en el último, «Continuar a práctica» (`onTerminar`, desactivado hasta `todoCompleto`, con «Completa los N capítulos para pasar a la práctica»). Si no está completo: «Para completar este capítulo, termina la lectura[ y el ejercicio interactivo].»
- Barra de avance: fija justo debajo del menú del sitio, ancho = cuánto del capítulo ya pasó por la mitad de la pantalla (0–100 %); en celular lleva «Capítulo N de M». Menú de puntos: fijo a la izquierda solo en `lg`, un punto por bloque montado (rótulos: «Inicio», título del primer tema de cada lectura, «Video», «Repaso rápido», «Comprueba», título del interactivo, «En tu simulador», «Final»), activo = el último cuyo borde superior cruzó la mitad, con `pasoActivo`; clic hace `scrollIntoView`. Ambos con un solo listener de scroll y `requestAnimationFrame`, como `LeccionScroll`.

- [ ] **Step 4: Verificar**

Run: `npm test` y `npx tsc -b --noEmit`
Expected: verde (los componentes se revisan en el navegador en la Tarea 5).

- [ ] **Step 5: Commit**

```bash
git add src/features/academia/LeccionScroll.tsx src/features/academia/rise/Bloques.tsx src/features/academia/rise/CapituloRise.tsx
git commit -m "Render Rise-style chapters with cover, flip cards, gates and progress" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
(Agrega `src/data/escenas.ts` y `src/data/escenas.test.ts` solo si borraste `tieneEscena`.)

---

### Task 4: Una sola etapa «Lección» en los 14 módulos

**Files:**
- Create: `src/features/academia/rise/LeccionRise.tsx`
- Modify: `src/pages/AcademiaModulo.tsx`
- Delete: `src/features/academia/MisionesModulo.tsx`

**Interfaces:**
- Consumes: `armarCapitulos`, `capituloInicial`, `capituloCompleto` (Tarea 1); `capituloDeUrl`, `etapaInicial` (Tarea 2); `CapituloRise` (Tarea 3).
- Produces:
  ```tsx
  export function LeccionRise(p: {
    modulo: AcademiaModulo; isCompleted: (id: string) => boolean; onComplete: (id: string) => void; onTerminar: () => void;
  }): JSX.Element;
  ```
  (Recibe el avance por props, no con `useProgress`, para poder probarlo sin sesión en la Tarea 5.)

- [ ] **Step 1: `LeccionRise.tsx`**

- `caps = useMemo(() => armarCapitulos(modulo.slug), [modulo.slug])`.
- Capítulo activo = `capituloDeUrl(params.get("capitulo"), params.get("mision"), caps.length, capituloInicial(caps, isCompleted))`. Copia de `MisionesModulo` la lógica que ya resolvió dos errores: fijar el capítulo inicial en la URL al montar (`?capitulo=N`, `replace: true`, y quitar `?mision`) y hacer `scrollIntoView` al cambiar de capítulo pero no al cargar.
- Arriba, los capítulos como en la cuadrícula de misiones de hoy («Capítulo N», título, palomita si `capituloCompleto`); en celular se puede deslizar en una fila.
- Abajo `<CapituloRise key={cap.id} … onSiguiente={último ? null : () => ir(i + 1)} todoCompleto={caps.every((c) => capituloCompleto(c, isCompleted))} />`.

- [ ] **Step 2: `AcademiaModulo.tsx`**

- Etapas: `["introduccion", "leccion" si hay actividades leccion o interactividad, …practica, evaluacion, proyecto que existan]`. Sin `misiones` ni `interactividad`. `STAGE_LABELS` sin esas dos.
- Etapa inicial: `etapaInicial(searchParams.get("etapa"), stageKeys)`.
- Lección hecha = `leccionDone && interactividadDone`.
- `activeStage === "leccion"` → `<LeccionRise modulo isCompleted={(id) => isActividadCompletada(modulo.slug, id)} onComplete={(id) => completarActividad(modulo.slug, id)} onTerminar={() => setActiveStage(practicaActividad ? "practica" : "evaluacion")} />`. Se borran las ramas viejas de lección (LessonFlow + checkpoints + `imagenLeccion`), interactividad y misiones, y sus imports que queden sin uso (`LessonFlow` sigue vivo en `RutaRedLeccion`; no se borra el archivo).
- Introducción (texto de navegación, sin datos técnicos): «Son N capítulos. En cada uno bajas para leer, las imágenes cambian contigo y entre la lectura hay ejercicios y preguntas rápidas. Al final vienen la práctica, la evaluación[ y un proyecto final que el fundador revisa en persona].» Botón «Empezar el capítulo 1».
- Bienvenida (`?bienvenida=1`): «Empieza aquí: N capítulos que lees bajando, con imágenes, ejercicios y preguntas rápidas entre la lectura.»
- Borra `MisionesModulo.tsx` (`git rm`).

- [ ] **Step 3: Verificar**

Run: `npm test`, `npx tsc -b --noEmit` y `npx vite build`
Expected: verde y el build sin errores. `grep -rn "MisionesModulo\|etapa=misiones" src` sin resultados.

- [ ] **Step 4: Commit**

```bash
git add src/features/academia/rise/LeccionRise.tsx src/pages/AcademiaModulo.tsx
git rm src/features/academia/MisionesModulo.tsx
git commit -m "Merge lesson and interactivity into one scroll lesson for every module" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Revisión en el navegador

**Files:**
- Temporal, **sin commit**: `src/pages/PruebaRise.tsx` y una ruta `/prueba-rise/:slug` en `src/App.tsx` solo si `import.meta.env.DEV`, que pinta `LeccionRise` con avance en memoria (`useState<Set<string>>`). Se quitan al terminar (`git checkout src/App.tsx`, borrar el archivo).

- [ ] **Step 1: Abrir la página temporal**

`preview_start` con `ruta-red-dev` (puerto 5180) y navegar a `/prueba-rise/<slug>`.

- [ ] **Step 2: Revisar en escritorio y en celular (375×812)**, sin errores en consola

| Módulo | Qué revisar |
|---|---|
| fundamentos | 6 capítulos; flechas de las 4 fuerzas en el capítulo 2; preguntas de la misión como candados al final; pasos del simulador |
| meteorologia | portada con imagen; candados tras los temas 3, 6 y 9; tarjetas que voltean |
| navegacion | un solo capítulo de 12 temas: barra y menú de puntos siguen el scroll |
| espacios-aereos | temas sin imagen muestran su título en el panel fijo, sin hueco |
| vfr | capítulo 3 con 1 tema y 2 interactivos |

En todos: el candado cerrado oculta lo que sigue y no marca temas; un fallo deja reintentar, el segundo abre; al bajar se marcan los temas; el cierre lleva al siguiente capítulo y `?capitulo=N` cambia; `?mision=3`, `?capitulo=99` y `?etapa=interactividad` caen bien; en celular no hay scroll horizontal y el menú de puntos no aparece.

- [ ] **Step 3: Arreglar lo que salga** (cada arreglo de lógica pura con su prueba primero) y commit de los arreglos con `git add` de archivos nombrados.

- [ ] **Step 4: Quitar la página temporal** y confirmar `git status` limpio de ella. Pendiente para Erik (anotarlo en el ledger): revisar con su sesión la página real `/academia/fundamentos?etapa=leccion` en localhost (navbar vs barra fija, «reducir movimiento», avance guardado que ya tiene).

---

### Task 6: Revisión final y entrega a Erik

- [ ] **Step 1:** Revisión de toda la rama contra el spec y el Review Focus (autor revisando; sin subagentes salvo que Erik los pida). Buscar palabras prohibidas: `grep -rniE "certificad|licencia|\bCFI\b|curso oficial|examen de la AFAC|con IA" src/features/academia/rise src/pages/AcademiaModulo.tsx` sin resultados.
- [ ] **Step 2:** `npm test`, `npx tsc -b --noEmit`, `npx vite build` en verde.
- [ ] **Step 3:** Pedirle a Erik que corra la consulta del embudo de 2026-10-25 para **todos** los módulos (base antes de publicar) y que vea la lección con su sesión. Preguntar «¿La subo?». Solo con su sí: `git fetch -q origin main`, `git merge-base --is-ancestor origin/main HEAD && echo ancestro`, `git push -q origin HEAD:main`.
