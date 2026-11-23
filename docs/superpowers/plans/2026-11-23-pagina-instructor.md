# Página del instructor virtual — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página pública `/instructor` que luce el instructor virtual y lleva a crear cuenta y probar gratis el viraje escarpado.

**Architecture:** Los textos y la lógica del botón viven en un módulo de datos puro (`src/data/paginaInstructor.ts`), probado con `node --test`. La página (`src/pages/InstructorLanding.tsx`) solo pinta ese módulo más capturas reales en `public/images/`. La tarjeta de «Aprende» y un bloque nuevo en la portada apuntan a la página.

**Tech Stack:** React + Vite + Tailwind (navy/dorado del sitio), react-router, `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-23-pagina-instructor-design.md`

## Global Constraints

- Palabras prohibidas en todo texto visible: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA», «Garmin».
- Todo se presenta como **beta**.
- Ninguna lección «solo fundador» se presenta como abierta: lo que no es el viraje escarpado ni las hojas va como «Próximamente».
- Sin imágenes generadas con IA: solo capturas reales del sitio.
- El debriefing va como captura fija; la página no monta `MapaVuelo` ni carga mosaicos de Esri.
- Sin quinta entrada en el menú.
- Cada archivo `*.test.ts` nuevo se agrega a la lista explícita del script `test` de `package.json`.

## Review Focus

- Visitante con sesión iniciada: el botón dice «Prueba el viraje escarpado» y va directo, sin pasar por `/ingresar` (prueba en la tarea 1).
- Ancho de teléfono (~375 px): sin scroll horizontal; las capturas se encogen (verificación en la tarea 3).
- `?from=` con la ruta codificada: tras registrarse cae en `/instructor/viraje-escarpado` (prueba en la tarea 1, verificación en el navegador en la tarea 3).
- Si una captura no carga, el texto alrededor sigue explicando el bloque y el `alt` describe la pantalla (revisión en la tarea 3).
- Las lecciones duplicadas de propósito (2 = 3, 11 = 12) no aparecen dos veces en «Próximamente» (prueba en la tarea 1).

---

### Task 1: Módulo de datos de la página

**Files:**
- Create: `src/data/paginaInstructor.ts`
- Create: `src/data/paginaInstructor.test.ts`
- Modify: `src/lib/routes.ts` (agregar `instructor: "/instructor"` junto a `instructorVirajeEscarpado`)
- Modify: `package.json` (agregar el test nuevo al script `test`)

**Interfaces:**
- Consumes: `LECCIONES`, `LECCIONES_IFR`, `REPASO` de `src/features/instructor/lecciones.ts`; `ROUTES`.
- Produces:
  - `botonInstructor(conSesion: boolean): { texto: string; to: string }`
  - `PROXIMAMENTE: { vfr: string[]; ifr: string[] }`: nombres en español, sin duplicados, en orden.
  - `PAGINA_INSTRUCTOR`: `{ eyebrow, titulo, subtitulo, pasos: {titulo, texto}[], debriefing: {titulo, texto}, funciones: {titulo, texto, img, alt}[], gratis: string[], beta: string, requisitos: string }`.

- [ ] **Step 1: Escribir las pruebas que fallan** en `src/data/paginaInstructor.test.ts`:

```ts
test("sin sesión: crea cuenta y vuelve al viraje", () => {
  assert.deepEqual(botonInstructor(false), {
    texto: "Crea tu cuenta y prueba el viraje escarpado gratis",
    to: "/ingresar?from=%2Finstructor%2Fviraje-escarpado",
  });
});
test("con sesión: directo a la maniobra", () => {
  assert.deepEqual(botonInstructor(true), { texto: "Prueba el viraje escarpado", to: "/instructor/viraje-escarpado" });
});
test("próximamente: 11 nombres VFR únicos sin el repaso, 5 IFR sin el checkride", () => {
  assert.equal(new Set(PROXIMAMENTE.vfr).size, PROXIMAMENTE.vfr.length);
  assert.equal(PROXIMAMENTE.vfr[0], "Familiarización");
  assert.ok(!PROXIMAMENTE.vfr.includes("Repaso general"));
  assert.equal(PROXIMAMENTE.vfr.length, 11); // 14 − 2 duplicadas − repaso
  assert.deepEqual(PROXIMAMENTE.ifr, ["Interceptación de radiales", "Rutas pasadas", "Arcos DME", "Patrones de espera", "Vuelo mezclado"]);
});
test("textos: beta presente y ninguna palabra prohibida", () => {
  const todo = JSON.stringify(PAGINA_INSTRUCTOR).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  assert.match(todo, /beta/);
  assert.doesNotMatch(todo, /certificad|cfi\b|licencia|certified|curso oficial|examen de la afac|con ia\b|garmin/);
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `node --experimental-strip-types --test src/data/paginaInstructor.test.ts`
Expected: FAIL, no encuentra el módulo `./paginaInstructor.ts`.

- [ ] **Step 3: Implementar `src/data/paginaInstructor.ts` y la ruta**

`PROXIMAMENTE.vfr` = nombres `es` de `LECCIONES` sin `REPASO`, sin repetidos; `.ifr` = los de `LECCIONES_IFR` con `disponible`. Textos según la spec, sección «La página»: los pasos se basan en los de `InstructorVirajeEscarpado.tsx` (líneas ~129-134), `gratis` = viraje escarpado (práctica y checkride) y hojas imprimibles, `requisitos` = «Windows, MSFS 2020 y el lector gratis de Descargas». Las `img` de `funciones` son las rutas de la tarea 2.

- [ ] **Step 4: Correr y ver que pasa, más la suite completa**

Run: `node --experimental-strip-types --test src/data/paginaInstructor.test.ts` y luego `npm test`
Expected: PASS en las dos.

- [ ] **Step 5: Commit**

```bash
git add src/data/paginaInstructor.ts src/data/paginaInstructor.test.ts src/lib/routes.ts package.json
git commit -m "Add the copy and button logic for the instructor showcase page"
```

### Task 2: Capturas reales

**Files:**
- Create: `public/images/instructor-debriefing.jpg` (vuelo demo `/instructor/vuelo/demo`: mapa con los errores numerados y las pestañas)
- Create: `public/images/instructor-programa.jpg` (menú de lecciones de `/instructor/programa`)
- Create: `public/images/instructor-checklist.jpg` (pantalla del checklist por voz)
- Create: `public/images/instructor-hojas.jpg` (`/instructor/hojas`)

**Interfaces:**
- Produces: esas 4 rutas, que usa `PAGINA_INSTRUCTOR.funciones[].img` y el bloque del debriefing.

- [ ] **Step 1:** Abrir el sitio en vivo en el navegador del panel. Si sale el inicio de sesión, pedirle a Erik que entre él (nunca escribir credenciales).
- [ ] **Step 2:** Tomar cada captura a 1440 px de ancho, recortarla a la zona útil y guardarla como JPG de calidad 82 y 1600 px de ancho máximo (Pillow). La pantalla del checklist necesita MSFS conectado: si no se puede, pedirle la captura a Erik o usar la que ya exista en el repo.
- [ ] **Step 3:** Revisar cada imagen: ningún correo, nombre de cuenta ni dato personal visible. Si hay, recortar o tapar.
- [ ] **Step 4: Commit**

```bash
git add public/images/instructor-*.jpg
git commit -m "Add real screenshots for the instructor showcase page"
```

### Task 3: La página `/instructor`

**Files:**
- Create: `src/pages/InstructorLanding.tsx`
- Modify: `src/App.tsx` (import `lazy`, ruta pública `ROUTES.instructor` **sin** `ProtectedRoute`, y `TITULOS[ROUTES.instructor] = "Instructor virtual (beta) — Villanueva Aviation"`)

**Interfaces:**
- Consumes: `PAGINA_INSTRUCTOR`, `PROXIMAMENTE`, `botonInstructor` (tarea 1); `useAuth()` para saber si hay sesión; `Button` de `components/ui/Button`; las imágenes de la tarea 2.
- Produces: `export function InstructorLanding()`.

- [ ] **Step 1:** Construir la página con los 7 bloques de la spec, en ese orden, con el botón arriba y al final. Usar `<img loading="lazy">` con `alt`, salvo la captura del gancho. El enlace a las hojas va a `ROUTES.hojasInstructor` y el del Discord al `DISCORD_URL` de `lib/constants`.
- [ ] **Step 2: Verificar el tipado y el build**

Run: `npm run build` y `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Verificar en el navegador** (dev server de `.claude/launch.json`):
  - `/instructor` carga sin errores en la consola.
  - Sin sesión, el botón va a `/ingresar?from=%2Finstructor%2Fviraje-escarpado`.
  - A 375 px no hay scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`).
  - Captura de pantalla para Erik.
- [ ] **Step 4: Commit**

```bash
git add src/pages/InstructorLanding.tsx src/App.tsx
git commit -m "Add the public virtual instructor showcase page"
```

### Task 4: Entradas a la página

**Files:**
- Modify: `src/data/secciones.ts:144-149` (tarjeta «Instructor virtual (beta)»: `to: ROUTES.instructor`)
- Modify: `src/pages/Home.tsx` (bloque nuevo entre «LAS CUATRO SECCIONES», ~línea 63, y la sección siguiente, ~línea 102)
- Create: `src/data/secciones.test.ts` y agregarlo a `package.json`

**Interfaces:**
- Consumes: `ROUTES.instructor`, `PAGINA_INSTRUCTOR.eyebrow/titulo/subtitulo`, `instructor-debriefing.jpg`.

- [ ] **Step 1: Escribir la prueba que falla**

```ts
test("la tarjeta del instructor lleva a la página /instructor", () => {
  const t = SECCIONES.flatMap((s) => s.tarjetas).find((x) => x.titulo.startsWith("Instructor virtual"));
  assert.equal(t?.to, "/instructor");
});
```

- [ ] **Step 2:** Correr `node --experimental-strip-types --test src/data/secciones.test.ts`. Expected: FAIL (`/instructor/viraje-escarpado` ≠ `/instructor`).
- [ ] **Step 3:** Cambiar el `to` de la tarjeta. Agregar en `Home.tsx` un bloque destacado: la captura del debriefing, el eyebrow, el título, el subtítulo y el botón «Conoce el instructor» que lleva a `/instructor`, con el mismo estilo de sección (`border-t border-white/10 py-20 md:py-28`).
- [ ] **Step 4:** Correr `npm test`, `npm run build` y verificar la portada en el navegador. Expected: PASS, build limpio, el bloque visible y el enlace funcionando.
- [ ] **Step 5: Commit**

```bash
git add src/data/secciones.ts src/data/secciones.test.ts src/pages/Home.tsx package.json
git commit -m "Point the Aprende card and a new home block to the instructor page"
```

### Al terminar

Mostrarle a Erik las capturas de `/instructor` y de la portada. Subir a main solo con su «Sí, súbelo», con la secuencia de siempre: `git fetch`, revisar que `origin/main` sea ancestro y `git push origin HEAD:main`. Después, revisar el sitio en vivo.
