# Debriefing con mapa satelital — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al terminar cada lección de rampa a rampa, el cadete ve su recorrido en un mapa satelital con cada error marcado donde empezó, lo puede repetir sobre el perfil con instrumentos y voz del instructor, y lo vuelve a abrir después desde una página propia.

**Architecture:** Un módulo puro `recorrido.ts` acumula durante el vuelo (un punto por segundo, tramos de fase, frases del instructor) y al final arma una `Grabacion` con los errores ya calculados desde los `fuera` de cada intento y el debriefing de la lección. Tres componentes React (mapa Leaflet con Esri World Imagery, repetición SVG, debriefing que los junta) la muestran; una tabla nueva `recorridos_leccion` la guarda ligada al renglón de la lección en `intentos_maniobra`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, Leaflet 1.9 (ya instalado), Supabase.

**Spec:** `docs/superpowers/specs/2026-11-10-debriefing-mapa-design.md`

## Global Constraints

- Sin dependencias nuevas; Leaflet ya está (`src/features/aventura/MapaAventura.tsx` muestra cómo se importa con su CSS).
- Mosaicos: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`, con `?token=` + `import.meta.env.VITE_ARCGIS_KEY` solo si la variable existe. Atribución visible: «Imagen: Esri, Maxar, Earthstar Geographics».
- Prohibido en textos: "instructor certificado", "CFI", "licencia", "certificado", "certified", "curso oficial", "examen de la AFAC", "con IA", "Garmin" visible. El inglés no lleva [áéíóúñ¿¡].
- ES/EN con `Idioma` de `idiomaInstructor.ts`.
- Pruebas: `node --experimental-strip-types --test <archivo>`; cada archivo nuevo de prueba se agrega a la lista explícita de `"test"` en `package.json`. Los módulos puros (`.ts`) no importan `.tsx`.
- La migración la corre Erik; el código no debe romper si la tabla todavía no existe (guardar el recorrido falla con mensaje y «Reintentar», la lección ya quedó guardada).
- Commits: `git add` de archivos concretos, mensaje con `-m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`. No se hace push sin que Erik lo apruebe.
- Nunca se commitean `en-vivo/`, `g1000-prueba/`, `guias/`, `poster/`, `propuestas/`, `redes/`, `simhub-sixpack/`, `supabase/.temp/`, `.superpowers/`.

## Review Focus

1. Práctica con la misma maniobra repetida (`e.hechas` solo guarda el último resultado por maniobra): cada intento calificado sale como intento propio, con sus errores numerados. Prueba en Task 2.
2. Lección anulada a medio vuelo (slew, salto): la grabación trae `anulada` con su `t` y motivo, y la página no intenta guardarla. Prueba en Task 2; cableado en Task 5.
3. Lección sin ningún error: lista vacía, todas las fases con ✓, la pantalla dice que no hubo errores en vez de quedar en blanco. Prueba en Task 2; UI en Task 4.
4. Vuelo largo (2 h ≈ 7,200 puntos): el JSON de la grabación cabe en menos de 450 KB gracias al redondeo. Prueba en Task 1.
5. Un vuelo guardado sin recorrido (lecciones de antes de esta función, o el recorrido falló): la página del vuelo lo dice y no se rompe. Cubierto en Task 4 (estado vacío) y verificado en navegador.

---

### Task 1: Grabador del vuelo (puntos, fases y voz)

**Files:**
- Create: `src/features/instructor/recorrido.ts`
- Create: `src/features/instructor/recorrido.test.ts`
- Modify: `package.json` (lista de `"test"`)

**Interfaces:**
- Consumes: `Muestra` (`evaluador.ts`), `EstadoRepaso` (`repaso.ts`), `FaseVuelo` (`fasesVuelo.ts`).
- Produces:
  - `type Punto = [t: number, lat: number, lon: number, altitud: number, velocidad: number, rumbo: number, inclinacion: number, bola: number, agl: number]` — lat/lon a 5 decimales, bola a 2, lo demás entero; t a 1 decimal.
  - `type FaseMapa = "rodaje" | "despegue" | "zona" | "circuitos" | "aterrizaje" | "rodaje-regreso"`
  - `type TramoFase = { fase: FaseMapa; inicio: number; fin: number }`
  - `interface Grabador { puntos: Punto[]; fases: TramoFase[]; voz: { t: number; texto: string }[] }`
  - `crearGrabador(): Grabador`
  - `faseMapa(e: EstadoRepaso): FaseMapa | null` — null cuando todavía no hay `vuelo`.
  - `grabarMuestra(g: Grabador, m: Muestra, e: EstadoRepaso): void` — muta `g`.
  - `grabarVoz(g: Grabador, t: number, textos: string[]): void`
  - `puntoEn(puntos: Punto[], t: number): Punto | null` — el punto con `t` más cercano (búsqueda binaria); null si no hay puntos.
  - `CAMPO_PUNTO = { t: 0, lat: 1, lon: 2, altitud: 3, velocidad: 4, rumbo: 5, inclinacion: 6, bola: 7, agl: 8 } as const`

- [ ] **Step 1: Write the failing tests** en `recorrido.test.ts`:

```ts
test("un punto por segundo, redondeado", () => {
  const g = crearGrabador();
  const e = estado("salida"); // helper del archivo: crearRepaso + etapa/vuelo.fase forzados
  for (let k = 0; k < 50; k++) grabarMuestra(g, muestra({ t: k * 0.1, lat: 20.123456789, bola: 0.12345 }), e);
  assert.equal(g.puntos.length, 5);           // t 0, 1, 2, 3, 4 (con muestras cada 0.1 s)
  assert.equal(g.puntos[0][CAMPO_PUNTO.lat], 20.12346);
  assert.equal(g.puntos[0][CAMPO_PUNTO.bola], 0.12);
});
test("sin lat/lon no se graba punto", () => { /* muestra con lat undefined → g.puntos.length === 0 */ });
test("fases: rampa→rodaje, carrera→despegue, salida→despegue, maniobra→zona, regreso en vuelo→aterrizaje, regreso en rodaje-regreso→rodaje-regreso", () => {
  // faseMapa sobre estados construidos a mano, una aserción por fila
});
test("lección 14: maniobra→circuitos", () => { /* sorteo[0] === "toques-despegues" */ });
test("los tramos de fase se extienden y cambian sin huecos", () => {
  // grabar t 0..9 en rodaje y 10..19 en despegue
  assert.deepEqual(g.fases, [{ fase: "rodaje", inicio: 0, fin: 10 }, { fase: "despegue", inicio: 10, fin: 19 }]);
});
test("invalido conserva la fase de antes", () => { /* etapa invalido no abre tramo nuevo */ });
test("puntoEn: el más cercano, y los extremos se sujetan", () => {
  assert.equal(puntoEn(pts, 2.4)![0], 2);
  assert.equal(puntoEn(pts, -50)![0], 0);
  assert.equal(puntoEn(pts, 1e9)![0], pts.at(-1)![0]);
  assert.equal(puntoEn([], 3), null);
});
test("grabarVoz guarda cada frase con su t", () => { /* grabarVoz(g, 12, ["a", "b"]) → 2 renglones con t 12 */ });
test("2 horas caben en menos de 450 KB", () => {
  // 7,200 puntos con valores realistas (lat 20.5xxxxx, lon -103.3xxxxx, altitud 6,500, etc.)
  assert.ok(JSON.stringify(g.puntos).length < 450_000);
});
```

- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/instructor/recorrido.test.ts` — Expected: FAIL, el módulo no existe.

- [ ] **Step 3: Implement** `recorrido.ts` con las firmas de arriba. `faseMapa`: rampa → `vuelo.fase === "carrera-despegue" ? "despegue" : "rodaje"`; salida → despegue; maniobra/fuera-de-zona → `sorteo[0] === "toques-despegues" ? "circuitos" : "zona"`; regreso → `vuelo.fase` en `rodaje-regreso`/`terminado` ? "rodaje-regreso" : "aterrizaje"; terminado → rodaje-regreso; invalido → null (el grabador entonces no abre ni cierra tramos). `grabarMuestra` graba punto cuando `m.t - ultimo.t >= 1` (o no hay ninguno), y extiende `fin` del último tramo o abre uno nuevo si la fase cambió (el `fin` del anterior queda en el `inicio` del nuevo).

- [ ] **Step 4: Run** el mismo comando — Expected: PASS. Agregar `src/features/instructor/recorrido.test.ts` a `"test"` en `package.json` y correr `npm.cmd test` — Expected: todo en verde (530 + nuevas).

- [ ] **Step 5: Commit** `git add src/features/instructor/recorrido.ts src/features/instructor/recorrido.test.ts package.json` y `git commit -m "Record the lesson flight: one point per second, map phases and instructor phrases" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.

---

### Task 2: Errores con su lugar y la grabación final

**Files:**
- Modify: `src/features/instructor/recorrido.ts`
- Modify: `src/features/instructor/recorrido.test.ts`

**Interfaces:**
- Consumes: Task 1; `MANIOBRAS`, `ManiobraId`, `ResultadoComun` (`maniobras.ts`); `toleranciaViraje` (`evaluador.ts`) y las 10 `toleranciaX` de `evaluadorRecto/Lento/Rumbos/Altitud/Combinado/Circuito/Falla/S/Ocho/Alrededor.ts`; `debriefingRepaso`, `Parte` (`debriefingRepaso.ts`); `Checklist`; `EventoVuelo`; `Nivel`.
- Produces:
  - `TOLERANCIAS: Record<ManiobraId, (n: Nivel) => Record<string, number>>` — familiarización `() => ({})`.
  - `UNIDAD: Record<string, string>` por campo (clave `"campo"` o, si una maniobra usa el mismo nombre con otra unidad, `"maniobra.campo"`); `unidadDe(id: ManiobraId, campo: string): string`.
  - `tramosFuera(r: unknown): { campo: string; inicio: number; fin: number; peor: number }[]` — busca toda propiedad `fuera` (también anidada, como `lados[].fuera` del viraje escarpado).
  - `type IntentoVuelo = { n: number; maniobra: ManiobraId; calificacion: number; aprobado: boolean; inicio: number; fin: number }`
  - `type ErrorVuelo = { n: number; fase: FaseMapa | "checklist"; inicio: number | null; fin: number | null; intento?: number; maniobra?: ManiobraId; campo?: string; peor?: number; tol?: number; texto?: Record<Idioma, string> }`
  - `interface Grabacion { version: 1; leccion: number; puntos: Punto[]; fases: TramoFase[]; voz: { t: number; texto: string }[]; intentos: IntentoVuelo[]; errores: ErrorVuelo[]; explicaciones: { intento: number; lineas: Record<Idioma, string[]> }[]; bien: Record<Idioma, string[]>; zona: { lat: number; lon: number; radioNm: number; poligono?: [number, number][] } | null; anulada: { t: number; motivo: string } | null }`
  - `cerrarGrabacion(g: Grabador, x: { leccion: number; e: EstadoRepaso; cl: Checklist; resultados: { maniobra: ManiobraId; resultado: ResultadoComun }[] }): Grabacion`
  - `grabacionDemo(): Grabacion` — vuelo de `simularVuelo()` con un intento de `simularRumbos({ pasarse: 25 })` y otro limpio, para la página demo.

Reglas que fija el spec (el implementador escribe los cuerpos):
- Cada resultado de `resultados` es un intento (`n` = posición + 1); `inicio`/`fin` = `t` de su primera y última muestra.
- Por cada tramo de `tramosFuera(resultado)`: un error con `campo`, `peor`, `tol = TOLERANCIAS[maniobra](resultado.nivel ?? 3)[campo]`, `inicio`/`fin` del tramo (los de un solo valor ya vienen como tramo de largo 0 al final del intento), y `fase` = la fase de `g.fases` que contiene `inicio` (si ninguna, "zona").
- Debriefing de la lección (`debriefingRepaso(e, cl, idioma)` en "es" y "en"): cada renglón de `repetir` de la parte `despegue` es un error en el `t` del primer evento `despegue` de `e.vuelo.eventos` (fase "despegue"); los de `aterrizaje`, en el `t` del último evento `aterrizaje` (fase "aterrizaje"); los de `checklist`, con `inicio: null`, fase "checklist". La parte `maniobras` no genera errores (ya salen por intento). Si no hay evento, `inicio: null`. `texto` lleva los dos idiomas por posición (el inglés del checklist resume conteos: se toma su renglón por índice cuando exista y, si no, el español).
- `bien`: los renglones `bien` de todas las partes, en cada idioma.
- `explicaciones`: por intento, `MANIOBRAS[maniobra].explicar(resultado, idioma)` filtrado a `tipo === "mal"`, en los dos idiomas; los intentos sin líneas no van.
- Orden y número: por `inicio` ascendente, los `null` al final; `n` de 1 en adelante.
- `anulada`: si `e.etapa === "invalido"`, `{ t: último punto, motivo: e.motivo ?? "" }`; si no, null.

- [ ] **Step 1: Write the failing tests:**

```ts
test("cada campo de cada maniobra tiene unidad y nombre", () => {
  for (const id of Object.keys(MANIOBRAS) as ManiobraId[])
    for (const campo of Object.keys(TOLERANCIAS[id](3))) {
      assert.notEqual(unidadDe(id, campo), undefined, `${id}.${campo}`);
      assert.ok(MANIOBRAS[id].celdas.some((c) => c.campo === campo), `celda ${id}.${campo}`);
    }
});
test("tramosFuera encuentra los fuera anidados del viraje escarpado", () => { /* resultado de simularManiobra con altitud fuera → al menos un tramo campo "altitud" */ });
test("un error de rumbos queda en el momento y con la tolerancia del nivel", () => {
  // resultado de virajes-rumbos con simularRumbos({ pasarse: 25 }) en nivel 2 (correr como en rumbos.test.ts)
  const err = gr.errores.find((x) => x.campo === "rumbo")!;
  assert.equal(err.tol, toleranciaRumbos(2).rumbo);
  assert.equal(err.intento, 1);
  assert.equal(err.fase, "zona");
  assert.ok(err.inicio! >= gr.intentos[0].inicio && err.inicio! <= gr.intentos[0].fin);
});
test("misma maniobra dos veces en práctica: dos intentos, errores de cada uno", () => {
  assert.deepEqual(gr.intentos.map((i) => i.n), [1, 2]);
  assert.ok(gr.errores.some((x) => x.intento === 2));
});
test("errores en orden de tiempo, numerados, el checklist al final sin momento", () => {
  assert.deepEqual(gr.errores.map((x) => x.n), gr.errores.map((_, k) => k + 1));
  assert.equal(gr.errores.at(-1)!.fase, "checklist");
  assert.equal(gr.errores.at(-1)!.inicio, null);
});
test("rotación fuera de Vr: error en el despegue, en el t del evento", () => { /* tomas.rotacionKt = 40 → error fase "despegue", inicio === t del evento despegue */ });
test("lección sin errores: lista vacía y renglones de bien", () => { assert.equal(gr.errores.length, 0); assert.ok(gr.bien.es.length > 0); });
test("lección anulada: anulada con t y motivo", () => { /* e.etapa invalido, motivo "Usaste el modo slew…" */ });
test("grabacionDemo trae puntos, 2 intentos y al menos un error de rumbo", () => { /* … */ });
```

- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/instructor/recorrido.test.ts` — Expected: FAIL en las pruebas nuevas.

- [ ] **Step 3: Implement** lo de Interfaces en `recorrido.ts`. Las unidades salen de leer cada `toleranciaX` y su Hoja (`HojaX.tsx`): ft, kt, °, % (radio), s (cruce, alas, reacción…), bola sin unidad.

- [ ] **Step 4: Run** el archivo y luego `npm.cmd test` — Expected: PASS todo.

- [ ] **Step 5: Commit** los dos archivos: `"Place every graded error on the flight: maneuver deviations, takeoff and landing, checklist; build the final recording"`.

---

### Task 3: Guardar y leer el recorrido

**Files:**
- Create: `supabase/migrations/0024_recorridos_leccion.sql`
- Modify: `src/features/instructor/intentos.ts`
- Modify: `src/features/instructor/reglasIntentos.ts` (`ResumenSesion.leccion` lleva `id`)
- Modify: el test existente de `agruparSesiones` (búscalo con `grep -l agruparSesiones src/features/instructor/*.test.ts`)

**Interfaces:**
- Consumes: `Grabacion` (Task 2).
- Produces:
  - Tabla `public.recorridos_leccion(id uuid pk default gen_random_uuid(), intento_id uuid not null unique references public.intentos_maniobra(id) on delete cascade, user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, grabacion jsonb not null, created_at timestamptz not null default now())`, RLS con tres políticas copiadas del estilo de `0022`: leer propio, fundador lee todo (`auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com'`), guardar propio (`with check (auth.uid() = user_id)`). Sin update ni delete.
  - `guardarRecorrido(intentoId: string, g: Grabacion): Promise<{ error: string | null }>`
  - `fetchRecorrido(intentoId: string): Promise<Grabacion | null>` — lanza si falla la consulta; null si no hay renglón.
  - `fetchIntento(id: string): Promise<IntentoManiobra | null>`
  - `fetchMisLecciones(): Promise<{ id: string; maniobra: string; created_at: string }[]>` — los renglones propios cuya `maniobra` es una clave de `LECCIONES_GUARDADAS`, el más nuevo primero.
  - `ResumenSesion.leccion` gana `id: string`.

- [ ] **Step 1: Write the failing test** en el test de `agruparSesiones`: `assert.equal(resumen.leccion!.id, <id del renglón de la lección>)`.
- [ ] **Step 2: Run** ese archivo — Expected: FAIL (`id` undefined).
- [ ] **Step 3: Implement** el `id` en `agruparSesiones`, las cuatro funciones en `intentos.ts` (mismo estilo que `guardarIntento`/`fetchMisIntentosManiobra`) y la migración.
- [ ] **Step 4: Run** `npm.cmd test` y `npx tsc -b --noEmit` — Expected: PASS y sin errores.
- [ ] **Step 5: Commit** los tres archivos de código + la migración: `"Store lesson recordings in their own table, readable by the cadet and the founder"`.

---

### Task 4: La pantalla: mapa, repetición, errores y página del vuelo

**Files:**
- Create: `src/features/instructor/MapaVuelo.tsx`
- Create: `src/features/instructor/RepeticionVuelo.tsx`
- Create: `src/features/instructor/DebriefingMapa.tsx`
- Create: `src/pages/InstructorVuelo.tsx`
- Modify: `src/lib/routes.ts` (`instructorVuelo: (id: string) => \`/instructor/vuelo/${id}\``), `src/App.tsx` (ruta lazy, dentro del mismo guard de sesión que `InstructorRepaso`)

**Interfaces:**
- Consumes: Tasks 1–3 (`Grabacion`, `puntoEn`, `CAMPO_PUNTO`, `unidadDe`, `grabacionDemo`, `fetchIntento`, `fetchRecorrido`); `MANIOBRAS[id].celdas` para el nombre de cada campo; `nombreManiobra` (`repaso.ts`).
- Produces:
  - `MapaVuelo({ grabacion, cursorT, foco, alTocarError }: { grabacion: Grabacion; cursorT: number | null; foco: { inicio: number; fin: number } | null; alTocarError: (n: number) => void })`
  - `RepeticionVuelo({ grabacion, cursorT, alMover, idioma }: { grabacion: Grabacion; cursorT: number; alMover: (t: number) => void; idioma: Idioma })`
  - `DebriefingMapa({ grabacion, idioma }: { grabacion: Grabacion; idioma: Idioma })` — dueño del estado `cursorT`, `foco` y la fase elegida.
  - `InstructorVuelo()` — página en `/instructor/vuelo/:id`; `id === "demo"` usa `grabacionDemo()` sin red.

Lo que fija el spec y los bocetos aprobados (`.superpowers/brainstorm/1437-1794368889/content/debrief-combinado.html`, `debrief-satelital-v2.html`):
- Orden de arriba abajo: botones de fase («Todo el vuelo», Checklist, Rodaje, Despegue, Zona o Circuitos, Aterrizaje, Rodaje) con ✓ o el número de errores → mapa → perfil/repetición con lecturas (altitud, velocidad, rumbo, inclinación, bola) y la última frase del instructor de los 20 s anteriores → lista de errores agrupada por intento, cada uno «N · fase, intento k (maniobra) · {celda} {peor con signo y unidad} (tolerancia ±tol) · mm:ss» con «Ver», y bajo cada intento sus líneas de `explicaciones` → renglón verde con `bien`.
- Sin errores: un renglón «Sin errores en este vuelo» / "No errors on this flight" en lugar de la lista.
- `anulada`: banda roja arriba con el motivo y marcador ✕ en el punto.
- Mapa: Leaflet + mosaico de Global Constraints, `maxZoom` 18, `scrollWheelZoom: false`, arrastre desactivado en celular como `MapaAventura`. Recorrido coloreado por fase (rodaje gris punteado, despegue y aterrizaje azul, zona/circuitos blanco), tramos de error en rojo más grueso, marcadores numerados (`L.divIcon`), contorno de la zona, avión dorado en `cursorT` girado por el rumbo. `foco` → `fitBounds` de los puntos entre `inicio` y `fin` (con margen); «Todo el vuelo» → todos.
- Repetición: SVG con altitud y velocidad, fases sombreadas, rayas rojas en cada error con momento; arrastrar/tocar mueve `cursorT`; play a ×1, ×4, ×16 con `requestAnimationFrame`; mm:ss desde el primer punto.
- «Ver» y tocar un marcador: `foco` = el error (o su intento si es de largo 0), `cursorT` = `inicio`.
- Página: si `fetchRecorrido` da null, «Este vuelo no tiene recorrido guardado.» / "This flight has no saved track." con el resumen del renglón; si falla la consulta, el error con «Reintentar».
- Una columna en celular, sin scroll horizontal.

- [ ] **Step 1: Implement** los cuatro componentes y la ruta.
- [ ] **Step 2: Run** `npx tsc -b --noEmit` y `npm.cmd run build` — Expected: sin errores.
- [ ] **Step 3: Verify in browser:** dev server (`preview_start`), abrir `/instructor/vuelo/demo` con la cuenta del fundador: el mapa satelital carga con atribución, el recorrido y sus colores se ven sobre MMGL, el marcador de rumbo cae dentro de la zona, «Ver» acerca el mapa y mueve la repetición, play a ×16 mueve el avión, la consola sin errores (los CORS de cloudflareinsights son normales). Repetir a 375 px de ancho. Abrir `/instructor/vuelo/<uuid inexistente>` → mensaje de sin recorrido. Captura de pantalla para Erik.
- [ ] **Step 4: Commit** los seis archivos: `"Show the lesson debriefing on a satellite map with replay, phase tabs and pinned errors; add the flight page"`.

---

### Task 5: Grabar en la lección real y llegar desde los menús

**Files:**
- Modify: `src/pages/InstructorRepaso.tsx`
- Modify: `src/pages/InstructorPrograma.tsx`
- Modify: `src/pages/AdminManiobras.tsx`

**Interfaces:**
- Consumes: `crearGrabador`, `grabarMuestra`, `grabarVoz`, `cerrarGrabacion` (Tasks 1–2); `guardarRecorrido`, `fetchMisLecciones` (Task 3); `DebriefingMapa` (Task 4); `ROUTES.instructorVuelo`.
- Produces: nada que use otra tarea.

Reglas:
- `InstructorRepaso`: un `useRef(crearGrabador())` que `empezar` y `nueva` reinician; `grabarMuestra` en el ciclo de `alLote` (después de `alMuestrearRepaso`, con el estado nuevo). Cada intento calificado que llega a `alTerminar` se agrega a un `useRef` de `{ maniobra, resultado }` (no se toma de `e.hechas`).
- Voz: envolver una sola vez el `decir` de `useVoz` para que cada texto pase por `grabarVoz(g, ultimaT.current, textos)` antes de hablar, y pasar ese `voz` envuelto a `useChecklistVoz`; ninguna otra llamada a `decir` cambia.
- Al terminar (`deb` listo) o al anularse: `cerrarGrabacion(...)` una vez, `DebriefingMapa` arriba del debriefing de texto actual.
- Guardar: después de que `guardarIntento` de la lección devuelve `id`, `guardarRecorrido(id, grabacion)`. Error → aviso aparte «No se pudo guardar el mapa del vuelo: …» con «Reintentar» que solo reintenta el recorrido. Con `anulada` no se guarda nada (igual que hoy). Al guardar bien, enlace «Ver este vuelo después» a `ROUTES.instructorVuelo(id)`.
- `InstructorPrograma`: con sesión, `fetchMisLecciones()` y, en cada lección con vuelos, enlace «Último vuelo» al más nuevo. Si la consulta falla, no se muestra el enlace (sin romper el menú).
- `AdminManiobras`: en cada sesión con `leccion`, enlace «Ver vuelo» a `ROUTES.instructorVuelo(leccion.id)`.

- [ ] **Step 1: Implement** las tres páginas.
- [ ] **Step 2: Run** `npm.cmd test`, `npx tsc -b --noEmit`, `npm.cmd run build` — Expected: todo en verde.
- [ ] **Step 3: Verify in browser:** `/instructor/programa` carga sin errores y sin enlaces rotos; `/instructor/leccion/4` abre igual que antes (sin lector: estado «sin lector», sin errores en consola); el panel de sesiones muestra «Ver vuelo» donde hay lección. La prueba con vuelo real la hace Erik con el lector.
- [ ] **Step 4: Commit** las tres páginas: `"Record every lesson flight, save its map after the lesson, and link to it from the program menu and the sessions panel"`.

---

Después de la Task 5: revisión de toda la rama, reporte a Erik con el SQL de `0024` para que lo corra, y la pregunta «¿La subo?». Luego, repaso de lecciones en vivo una por una.
