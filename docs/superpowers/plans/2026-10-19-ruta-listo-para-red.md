# Ruta "Listo para volar en red" (etapa 1) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar la ruta gratuita de 8 lecciones (MMGL → MMMX en IFR) y la prueba final en vivo de pago ($32, 3 intentos, repetición por partes, insignia), sin tocar el bloqueo secuencial de la Academia.

**Architecture:** Las lecciones son datos (`src/data/rutaRed.ts`) que se pintan con los componentes de la Academia (`LessonFlow`, `Quiz`, `AudioPhraseology`) en páginas públicas propias bajo `/ruta/listo-para-red`. El pago, los intentos y los resultados viven del lado del servidor en dos tablas nuevas (`pruebas_red`, `intentos_prueba_red`): solo una Edge Function escribe el pago y solo el fundador escribe resultados. Todas las reglas (intentos, vencimiento, partes, precio, cancelación tardía, insignia) son funciones puras probadas en `src/features/rutaRed/reglas.ts`.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind v4, Supabase (Postgres + RLS + Edge Functions en Deno), PayPal JS SDK, Cloudflare Pages. Pruebas: `node --experimental-strip-types --test` (script `npm test`).

**Spec:** `docs/superpowers/specs/2026-10-19-ruta-listo-para-red-design.md`

## Global Constraints

- Prohibido en todo texto: "habilitación", "licencia", "certificado", "certificación", "instructor certificado", "horas válidas". La insignia dice que **no es una evaluación oficial de IVAO, VATSIM ni la AFAC**.
- Precio de la prueba: **$32 USD** por bloque de **3 intentos**; si un bloque se agota sin aprobar, el siguiente bloque cuesta **$16 USD** (otros 3 intentos).
- Vigencia: **30 días** desde el pago. No presentarse o cancelar con **menos de 24 horas** gasta el intento. Reembolso a mano por PayPal si Erik no da fecha en 30 días; el sitio solo registra `reembolsada`.
- Partes fijas: `autorizacion`, `salida`, `ruta_llegada`, `aproximacion`. Criterios de no aprobación: colacionar mal la autorización, salirse de la SID, comunicaciones no claras ni precisas.
- Cupo: **2 horas por semana** para pruebas, aparte de asesorías (texto visible; no hay bloqueo automático de horarios, igual que la agenda actual).
- Primer intento = las 4 partes (~2 h). Intentos siguientes = solo las partes pendientes (20–30 min).
- Para agendar: callsign de IVAO/VATSIM o enlace de Volanta (obligatorio).
- Lecciones públicas sin cuenta; avance guardado solo con cuenta (`completarActividad("listo-para-red", leccionId)`); pagar y agendar exige cuenta.
- La prueba no se escribe en `pagos` (esa tabla da acceso premium vía `cadete_acceso`) y no requiere premium.
- Nombres de SID/STAR/aproximaciones: solo los publicados y vigentes en la PIA de SENEAM (o Navigraph de Erik); nunca inventados. Leyenda "Solo para simulación" con la fecha de vigencia de la carta.
- Instrumentos sin marco, botones, logotipo ni nombre "Garmin" en el sitio.
- Etapa en datos: `etapa` 1 | 2 (la 2 no se construye ahora).
- Correo del fundador en RLS/trigger: `villanuevaaviation@gmail.com`.

## Review Focus

- **Pagar dos veces el mismo bloque** (doble clic o recargar con el botón en pantalla): la función rechaza un pago nuevo si ya hay un bloque activo para esa etapa, y `paypal_order_id` es único → prueba en Task 1 (`precioSiguienteBloque` devuelve `null` con bloque activo) y en Task 3 (verificación manual).
- **Agendar con el bloque vencido, agotado o aprobado:** la página no ofrece agendar y el trigger rechaza el insert → prueba en Task 1 (`puedeAgendar`) y Task 2 (trigger).
- **Cancelación a menos de 24 h:** gasta el intento; a más de 24 h no → prueba en Task 1 (`cancelacionTardia`, `intentosUsados`).
- **Lección sin video subido todavía:** se pinta sin iframe y sin hueco → prueba en Task 5 (datos con `videoId: null` válidos) y Task 6 (verificación en navegador).
- **Visitante sin sesión en una lección:** la lección se lee completa, no se intenta guardar avance y aparece la invitación a crear cuenta; `/ruta/listo-para-red/prueba` manda a `/ingresar` → verificación en Task 6 y Task 7.

---

## Archivos

- Create: `src/features/rutaRed/reglas.ts` — reglas puras (tipos `ParteRed`, `PruebaRed`, `IntentoRed`).
- Create: `src/features/rutaRed/reglas.test.ts`
- Modify: `src/lib/constants.ts` — constantes de precio, intentos, vigencia, cupo y cancelación.
- Create: `supabase/migrations/0019_pruebas_red.sql`
- Create: `supabase/functions/verify-paypal-prueba-red/index.ts`
- Create: `src/features/rutaRed/pruebasRed.ts` — acceso a Supabase.
- Create: `src/data/rutaRed.ts` — lecciones; `src/data/rutaRed.test.ts`
- Modify: `src/data/fraseologiaATC.ts` — set de audio `autorizacion-ifr`.
- Create: `src/components/ui/VideoYouTube.tsx`
- Create: `src/pages/RutaRed.tsx`, `src/pages/RutaRedLeccion.tsx`, `src/pages/PruebaRed.tsx`, `src/pages/AdminPruebasRed.tsx`
- Modify: `src/lib/routes.ts`, `src/App.tsx`, `src/pages/Perfil.tsx`, `src/pages/Asesorias.tsx`, `src/pages/TestNivel.tsx` (siguiente paso), `package.json` (script `test`).

---

### Task 1: Reglas puras y constantes

**Files:**
- Create: `src/features/rutaRed/reglas.ts`, `src/features/rutaRed/reglas.test.ts`
- Modify: `src/lib/constants.ts`, `package.json` (agregar `src/features/rutaRed/reglas.test.ts` al script `test`)

**Interfaces:**
- Produces:
  - `export const PARTES_RED = ["autorizacion", "salida", "ruta_llegada", "aproximacion"] as const; export type ParteRed = typeof PARTES_RED[number];`
  - `export const NOMBRE_PARTE: Record<ParteRed, string>` → "Autorización", "Salida (SID)", "En ruta y llegada (STAR)", "Aproximación".
  - `export type EstadoIntento = "pendiente" | "confirmado" | "realizado" | "no_se_presento" | "cancelado" | "cancelado_tarde";`
  - `export interface IntentoRed { id: string; prueba_id: string; numero: number; fecha: string; horario: string; partes: ParteRed[]; estado: EstadoIntento; aprobadas: ParteRed[]; criterio_fallado: string | null; notas: string | null; created_at: string; }`
  - `export interface PruebaRed { id: string; user_id: string; etapa: 1 | 2; bloque: number; monto: number; estado: "activa" | "reembolsada"; pagado_at: string; vence_at: string; }`
  - `partesAprobadas(intentos: IntentoRed[]): ParteRed[]` (unión de `aprobadas` de intentos `realizado`, en el orden de `PARTES_RED`)
  - `partesPendientes(intentos: IntentoRed[]): ParteRed[]`
  - `insigniaGanada(intentos: IntentoRed[]): boolean` (las 4 aprobadas)
  - `intentosUsados(intentos: IntentoRed[]): number` (cuentan `realizado`, `no_se_presento`, `cancelado_tarde`)
  - `estadoBloque(prueba: PruebaRed, intentos: IntentoRed[], ahora: Date): "activa" | "agotada" | "vencida" | "aprobada" | "reembolsada"` — `intentos` son los de ese bloque; para "aprobada" se pasan todos los de la etapa (ver `insigniaGanada`); orden de prioridad: reembolsada > aprobada > agotada > vencida > activa.
  - `puedeAgendar(prueba: PruebaRed, intentosBloque: IntentoRed[], intentosEtapa: IntentoRed[], ahora: Date): boolean` — activa, sin otro intento `pendiente`/`confirmado` abierto, y `intentosUsados < INTENTOS_POR_BLOQUE`.
  - `precioSiguienteBloque(pruebasEtapa: PruebaRed[], intentosEtapa: IntentoRed[], ahora: Date): "32" | "16" | null` — `"32"` si no hay bloques (o todos `reembolsada`), `null` si hay uno `activa` o la insignia ya se ganó, `"16"` si el último bloque quedó `agotada` o `vencida` sin aprobar.
  - `partesDelSiguienteIntento(intentosEtapa: IntentoRed[]): ParteRed[]` — sin intentos realizados → las 4; si no, `partesPendientes`.
  - `cancelacionTardia(fecha: string, horario: string, ahora: Date): boolean` — `fecha` "YYYY-MM-DD", `horario` "HH:00" hora local de México (UTC−6, sin horario de verano); tardía si faltan menos de `HORAS_CANCELACION` horas.
- Constantes en `src/lib/constants.ts`: `PRECIO_PRUEBA_RED = "32"`, `PRECIO_PRUEBA_RED_REPETICION = "16"`, `INTENTOS_POR_BLOQUE = 3`, `DIAS_VIGENCIA_PRUEBA = 30`, `HORAS_SEMANA_PRUEBAS = 2`, `HORAS_CANCELACION = 24`.

- [ ] **Step 1: Escribir las pruebas que fallan** (`reglas.test.ts`, mismo estilo que `src/features/testNivel/reglas.test.ts`):
  - `insigniaGanada` es `true` cuando un primer intento aprobó `autorizacion` y `salida` y un segundo intento aprobó `ruta_llegada` y `aproximacion`; `false` si falta una.
  - `partesDelSiguienteIntento([])` → las 4; tras un intento `realizado` con `aprobadas: ["autorizacion","salida"]` → `["ruta_llegada","aproximacion"]`.
  - `intentosUsados` cuenta `realizado`, `no_se_presento` y `cancelado_tarde`, y no cuenta `cancelado` ni `pendiente`.
  - `estadoBloque`: activa con 0 usados; agotada con 3 usados sin insignia; vencida si `ahora > vence_at`; aprobada gana sobre agotada; reembolsada gana sobre todo.
  - `precioSiguienteBloque`: `"32"` sin bloques; `null` con un bloque activo; `"16"` con un bloque agotado; `null` con la insignia ganada.
  - `puedeAgendar`: `false` si ya hay un intento `pendiente`; `false` con el bloque vencido.
  - `cancelacionTardia("2026-11-10", "18:00", ahora)` es `true` a las 2026-11-10T00:30:00Z (la cita es 2026-11-11T00:00Z; faltan 23.5 h) y `false` a las 2026-11-08T23:00:00Z.
- [ ] **Step 2: Correr y ver que fallan:** `node --experimental-strip-types --test src/features/rutaRed/reglas.test.ts` → FAIL (módulo no existe).
- [ ] **Step 3: Implementar `reglas.ts` y las constantes** con las firmas de arriba. Las constantes se importan desde `../../lib/constants.ts` (con extensión, para que `node --test` resuelva).
- [ ] **Step 4: Correr `npm test`** → todas pasan (las 101 previas + las nuevas).
- [ ] **Step 5: Commit** `git add src/features/rutaRed/reglas.ts src/features/rutaRed/reglas.test.ts src/lib/constants.ts package.json` y `git commit -m "Add the pure rules for the paid network-readiness test"`.

### Task 2: Tablas, RLS y trigger (migración 0019)

**Files:**
- Create: `supabase/migrations/0019_pruebas_red.sql`

**Interfaces:**
- Produces (columnas que leen Task 4 y Task 8):
  - `pruebas_red(id uuid pk, user_id uuid fk auth.users, email text, etapa smallint check in (1,2), bloque smallint, proveedor text default 'paypal', paypal_order_id text unique not null, monto numeric, moneda text default 'USD', estado text default 'activa' check in ('activa','reembolsada'), pagado_at timestamptz default now(), vence_at timestamptz not null, created_at timestamptz default now())`
  - `intentos_prueba_red(id uuid pk, prueba_id uuid fk pruebas_red on delete cascade, user_id uuid fk auth.users, numero smallint, fecha date not null, horario text not null, partes text[] not null, enlace_seguimiento text not null, estado text default 'pendiente' check in (los 6 de EstadoIntento), aprobadas text[] default '{}', criterio_fallado text, notas text, created_at timestamptz default now())`

- [ ] **Step 1: Escribir la migración** siguiendo `0013_pagos_sesiones.sql` y `0017_reservas_estado_inicial.sql`:
  - `pruebas_red`: RLS activo; select propio y select del fundador; **sin** insert/update del cliente (solo service_role); update e insert solo del fundador (insert para dar un bloque sin pago a quien compró el paquete de 4 asesorías; update para `reembolsada`).
  - `intentos_prueba_red`: RLS; select propio y del fundador; insert propio con `check (auth.uid() = user_id and exists (select 1 from pruebas_red p where p.id = prueba_id and p.user_id = auth.uid() and p.estado = 'activa' and p.vence_at > now()))`; update propio **solo** para pasar de `pendiente`/`confirmado` a `cancelado` o `cancelado_tarde` (política con `using` sobre el estado actual y trigger que bloquea cambiar otras columnas); update total del fundador.
  - Trigger `before insert` (patrón 0017): si no es el fundador, fuerza `estado = 'pendiente'`, `aprobadas = '{}'`, `criterio_fallado = null`, `notas = null`, y rechaza (`raise exception`) si el bloque ya tiene 3 intentos que cuentan o un intento `pendiente`/`confirmado` abierto.
  - Trigger `before update` para no fundadores: solo puede cambiar `estado` a `cancelado`/`cancelado_tarde`; cualquier otra columna distinta → `raise exception`.
- [ ] **Step 2: Verificación (la corre Erik):** pegar el archivo en Supabase → SQL Editor → Run. Esperado: "Success. No rows returned". Luego, con un usuario de prueba, `insert` en `intentos_prueba_red` sin prueba activa → error de RLS.
- [ ] **Step 3: Commit** `git add supabase/migrations/0019_pruebas_red.sql` y `git commit -m "Add tables for the paid network-readiness test and its attempts"`.

### Task 3: Edge Function del pago

**Files:**
- Create: `supabase/functions/verify-paypal-prueba-red/index.ts`

**Interfaces:**
- Consumes: tablas de Task 2.
- Produces: `supabase.functions.invoke("verify-paypal-prueba-red", { body: { orderId: string, etapa: 1 } })` → `{ ok: true, pruebaId: string }` o `{ ok: false, motivo: string }`.

- [ ] **Step 1: Implementar** copiando la estructura de `supabase/functions/verify-paypal-session/index.ts` (CORS, `getUser`, token PayPal, `GET /v2/checkout/orders/{id}`, `COMPLETED` y `USD`). Diferencias:
  - Precio esperado del lado del servidor: con el cliente service_role lee los bloques de ese usuario y etapa; sin bloques (o todos `reembolsada`) → `PRECIO_PRUEBA_RED` (secreto, default "32"); si el último bloque no está reembolsado y quedó agotado (3 intentos que cuentan) o vencido sin insignia → `PRECIO_PRUEBA_RED_REPETICION` (default "16"); si hay un bloque activo o ya ganó la insignia → `{ ok:false, motivo:"Ya tienes intentos activos" }` (409).
  - Insert en `pruebas_red` con `bloque = n+1`, `vence_at = now() + 30 days`; `onConflict: "paypal_order_id"` para que reintentar la misma orden no duplique.
- [ ] **Step 2: Despliegue (Erik):** `supabase functions deploy verify-paypal-prueba-red` y `supabase secrets set PRECIO_PRUEBA_RED=32 PRECIO_PRUEBA_RED_REPETICION=16`. Esperado: "Deployed Function verify-paypal-prueba-red".
- [ ] **Step 3: Verificación en sandbox:** pagar con una cuenta sandbox → fila en `pruebas_red` con `bloque 1`, `monto 32`, `vence_at` a 30 días; repetir el pago con el bloque activo → `409 Ya tienes intentos activos`.
- [ ] **Step 4: Commit** `git add supabase/functions/verify-paypal-prueba-red/index.ts` y `git commit -m "Add the PayPal verification function for the network-readiness test"`.

### Task 4: Acceso a datos de la prueba

**Files:**
- Create: `src/features/rutaRed/pruebasRed.ts`

**Interfaces:**
- Consumes: tipos de Task 1, tablas de Task 2.
- Produces:
  - `fetchMisPruebas(etapa: 1 | 2): Promise<PruebaRed[]>`
  - `fetchMisIntentos(etapa: 1 | 2): Promise<IntentoRed[]>` (join por `prueba_id`)
  - `agendarIntento(input: { pruebaId: string; numero: number; fecha: string; horario: string; partes: ParteRed[]; enlaceSeguimiento: string }): Promise<{ error: string | null }>`
  - `cancelarIntento(intento: IntentoRed, ahora: Date): Promise<{ error: string | null }>` (estado `cancelado_tarde` si `cancelacionTardia`, si no `cancelado`)
  - Fundador: `fetchTodasPruebasRed(): Promise<(PruebaRed & { email: string; intentos: IntentoRed[] })[]>`, `confirmarIntento(id: string)`, `registrarResultado(id: string, r: { aprobadas: ParteRed[]; criterio_fallado: string | null; notas: string | null })` (pone `estado: "realizado"`), `marcarNoSePresento(id: string)`, `marcarReembolsada(pruebaId: string)`, `darBloqueSinPago(userId: string, email: string, etapa: 1 | 2): Promise<{ error: string | null }>`.

- [ ] **Step 1: Implementar** con `supabase` de `src/lib/supabaseClient.ts`, mismo estilo que `src/features/admin/reservas.ts` (columnas explícitas, `{ data } ?? []`).
- [ ] **Step 2: `npx tsc -b`** → sin errores.
- [ ] **Step 3: Commit** `git add src/features/rutaRed/pruebasRed.ts` y `git commit -m "Add Supabase access for test blocks and attempts"`.

### Task 5: Contenido de las 8 lecciones y el audio de autorización

**Files:**
- Create: `src/data/rutaRed.ts`, `src/data/rutaRed.test.ts`
- Modify: `src/data/fraseologiaATC.ts` (export nuevo `FRASEOLOGIA_AUTORIZACION_IFR: PhraseologyCard[]` y su clave `"autorizacion-ifr"` en `AUDIO_SETS`), `package.json` (agregar `src/data/rutaRed.test.ts` al script `test`)

**Interfaces:**
- Consumes: `Tema` de `src/data/moduleContent.ts`, `QuizPregunta` de `src/features/academia/quizData.ts`, `PhraseologyCard` de `src/features/academia/AudioPhraseology.tsx`.
- Produces:
  - `export const SLUG_RUTA_RED = "listo-para-red";`
  - `export interface LeccionRed { id: string; numero: number; titulo: string; resumen: string; videoId: string | null; temas: Tema[]; practica: QuizPregunta[]; audioSetId?: "autorizacion-ifr"; }`
  - `export const LECCIONES_RED: LeccionRed[]` (8, en el orden del spec; ids `"antes-de-conectarte"`, `"plan-de-vuelo"`, `"carta-sid"`, `"autorizacion"`, `"sid-garmin"`, `"sid-fms"`, `"ruta-llegada"`, `"aproximacion"`)
  - `export const CARTAS_RED: { procedimiento: string; aeropuerto: "MMGL" | "MMMX"; tipo: "SID" | "STAR" | "APP"; vigencia: string; fuente: string }[]`
  - `leccionRed(id: string): LeccionRed | undefined`

- [ ] **Step 1: Verificar procedimientos reales.** Consultar la PIA vigente de SENEAM (sitio oficial de SENEAM, sección de publicación de información aeronáutica) para MMGL y MMMX: nombres de las SID por pista, una STAR a MMMX desde el oeste y una aproximación RNAV o VOR a MMMX. Anotar nombre, pista y fecha de vigencia en `CARTAS_RED`. Si no se pueden confirmar, **detenerse y pedir a Erik** que los confirme en Navigraph; no inventar.
- [ ] **Step 2: Escribir las pruebas que fallan** (`rutaRed.test.ts`): hay 8 lecciones con `numero` 1–8 sin repetir; ids únicos; cada lección tiene ≥3 temas y ≥3 preguntas; cada `correcta` es un índice válido de `opciones`; `videoId` es `null` o coincide con `/^[A-Za-z0-9_-]{11}$/`; ningún texto (títulos, temas, preguntas) contiene las palabras prohibidas de Global Constraints (regex sin acentos, sin distinguir mayúsculas); todo procedimiento citado en los temas existe en `CARTAS_RED`.
- [ ] **Step 3: Correr** `node --experimental-strip-types --test src/data/rutaRed.test.ts` → FAIL.
- [ ] **Step 4: Escribir el contenido** en español de México, siguiendo el temario del spec (lección 5 es la central; lecciones 1–5 y 7–8 en el C172 con G1000; lección 6 genérica para CDU/FMC, sin tutorial por avión). Lección 1 incluye cómo dejar el vuelo visible para Erik (mapa de IVAO/VATSIM o Volanta en vivo). Todos los `videoId` en `null` (Erik los llena al subir). `FRASEOLOGIA_AUTORIZACION_IFR`: 4 tarjetas de autorización IFR desde MMGL a MMMX con CRAFT completo, `palabrasClave` por elemento, sin `audioUrl` (usa voz sintética hasta que Erik grabe).
- [ ] **Step 5: `npm test`** → todo pasa.
- [ ] **Step 6: Commit** `git add src/data/rutaRed.ts src/data/rutaRed.test.ts src/data/fraseologiaATC.ts package.json` y `git commit -m "Add the eight lessons of the network-readiness route"`.

### Task 6: Páginas públicas de la ruta y de cada lección

**Files:**
- Create: `src/components/ui/VideoYouTube.tsx`, `src/pages/RutaRed.tsx`, `src/pages/RutaRedLeccion.tsx`
- Modify: `src/lib/routes.ts` (`rutaRed: "/ruta/listo-para-red"`, `rutaRedLeccion: (id: string) => \`/ruta/listo-para-red/${id}\``, `pruebaRed: "/ruta/listo-para-red/prueba"`, `adminPruebasRed: "/admin/pruebas-red"`), `src/App.tsx` (rutas públicas, cargadas con `lazy` como `Academia`)

**Interfaces:**
- Consumes: `LECCIONES_RED`, `leccionRed`, `SLUG_RUTA_RED` (Task 5); `useProgress().completarActividad/isActividadCompletada`; `useAuth` (como en `Diagnostico.tsx`).
- Produces: `VideoYouTube({ id, titulo }: { id: string; titulo: string })` — iframe `https://www.youtube-nocookie.com/embed/{id}`, `loading="lazy"`, `aspect-video`, `title={titulo}`.

- [ ] **Step 1: `RutaRed.tsx`** (`/ruta/listo-para-red`, pública): encabezado con la meta (MMGL → MMMX en IFR), lista de las 8 lecciones con marca de completada si hay sesión, bloque de la prueba (precio $32, 3 intentos, partes, criterios, reglas de 24 h / 30 días / reembolso, cupo de 2 h por semana, requisito de seguimiento) con botón a `ROUTES.pruebaRed`, y el aviso "no es una evaluación oficial de IVAO, VATSIM ni la AFAC". Estilo de las páginas del embudo (`/asesorias`, `/nivel`).
- [ ] **Step 2: `RutaRedLeccion.tsx`** (`/ruta/listo-para-red/:id`, pública): `VideoYouTube` solo si `videoId`; `LessonFlow` con `temas`; `AudioPhraseology` si `audioSetId`; `Quiz passingScore={0}` con `practica`. Con sesión, `completarActividad(SLUG_RUTA_RED, leccion.id)` al terminar la práctica; sin sesión, `isCompleted` devuelve `false`, no guarda y muestra "Crea tu cuenta gratis para guardar tu avance" con enlace a `ROUTES.ingresar`. Navegación anterior/siguiente; la última lleva a `ROUTES.pruebaRed`. Id inexistente → `NotFound`.
- [ ] **Step 3: `npx tsc -b`, `npx oxlint src`** → sin errores.
- [ ] **Step 4: Verificar en el navegador** (`preview_start` con `villanueva-aviation-dev`): sin sesión, `/ruta/listo-para-red` y `/ruta/listo-para-red/sid-garmin` cargan, sin iframe (videoId null), sin errores en consola; en 375 px no hay scroll horizontal.
- [ ] **Step 5: Commit** `git add src/components/ui/VideoYouTube.tsx src/pages/RutaRed.tsx src/pages/RutaRedLeccion.tsx src/lib/routes.ts src/App.tsx` y `git commit -m "Add the public route and lesson pages"`.

### Task 7: Página de la prueba (pago, agenda e intentos)

**Files:**
- Create: `src/pages/PruebaRed.tsx`
- Modify: `src/App.tsx` (envuelta en `ProtectedRoute`)

**Interfaces:**
- Consumes: Task 1 (reglas y constantes), Task 4 (datos), Task 3 (`funcion="verify-paypal-prueba-red"`, `cuerpo={{ etapa: 1 }}`), `PayPalButton`, `horariosDisponibles`/`fechaMinima` de `src/lib/agendaSlots.ts`, `LECCIONES_RED` + `isActividadCompletada`.

- [ ] **Step 1: Implementar los estados de la página** según `estadoBloque` y `precioSiguienteBloque`:
  - Lecciones incompletas: aviso que recomienda terminarlas con enlace a la siguiente pendiente (no bloquea).
  - Sin bloque activo: reglas y criterios visibles **antes** del botón; `PayPalButton monto={precio}` con el precio de `precioSiguienteBloque` ("32" o "16"); tras `onSuccess`, recargar datos.
  - Bloque activo: intentos restantes (`INTENTOS_POR_BLOQUE - intentosUsados`), fecha de vencimiento, partes aprobadas y pendientes; formulario para agendar (fecha ≥ `fechaMinima()`, horario de `horariosDisponibles`, `enlaceSeguimiento` obligatorio, partes = `partesDelSiguienteIntento`) solo si `puedeAgendar`; lista de intentos con estado, partes, resultado, criterio fallado y notas de Erik; botón "Cancelar" en intentos `pendiente`/`confirmado` que avisa si la cancelación es tardía antes de confirmar (aviso en la propia página, no `confirm()`).
  - Insignia ganada: tarjeta de la insignia "Listo para volar en red · Etapa 1 (español)" con el aviso de que no es oficial.
- [ ] **Step 2: `npx tsc -b`, `npx oxlint src`, `npm test`** → sin errores.
- [ ] **Step 3: Verificar en el navegador:** sin sesión, `/ruta/listo-para-red/prueba` manda a `/ingresar`; con sesión y sin bloque, se ven reglas, criterios y el botón de $32.
- [ ] **Step 4: Commit** `git add src/pages/PruebaRed.tsx src/App.tsx` y `git commit -m "Add the test page with payment, booking and attempt history"`.

### Task 8: Panel del fundador

**Files:**
- Create: `src/pages/AdminPruebasRed.tsx`
- Modify: `src/App.tsx` (misma protección que `ROUTES.adminReservas`), enlace desde `src/pages/AdminReservas.tsx`

**Interfaces:**
- Consumes: funciones de fundador de Task 4, `NOMBRE_PARTE`, `PARTES_RED`.

- [ ] **Step 1: Implementar:** lista de bloques por alumno (email, etapa, bloque, monto, vence, estado de `estadoBloque`) con sus intentos; por intento: fecha/hora, partes, enlace de seguimiento (clic abre en pestaña nueva), botones Confirmar, No se presentó, y formulario de resultado (casillas por parte de las que tocaban en ese intento, criterio fallado de los tres del spec, notas); botón "Marcar reembolsada" por bloque; y "Dar bloque sin pago" (por email del alumno) para quien compró el paquete de 4 asesorías, que inserta en `pruebas_red` con `paypal_order_id = "paquete-" + uuid`, `monto 0`, `bloque` siguiente y `vence_at` a 30 días.
- [ ] **Step 2: `npx tsc -b`, `npx oxlint src`** → sin errores.
- [ ] **Step 3: Commit** `git add src/pages/AdminPruebasRed.tsx src/App.tsx src/pages/AdminReservas.tsx` y `git commit -m "Add the founder panel to grade network-readiness attempts"`.

### Task 9: Insignia en el perfil y enlaces de entrada

**Files:**
- Modify: `src/pages/Perfil.tsx`, `src/pages/Asesorias.tsx`, `src/pages/TestNivel.tsx` (o el componente de siguiente paso de `src/features/testNivel/`)

**Interfaces:**
- Consumes: `fetchMisIntentos`, `insigniaGanada`, `LECCIONES_RED`, `SLUG_RUTA_RED`, `ROUTES.rutaRed`.

- [ ] **Step 1: Perfil:** agregar a la lista de logros "Listo para volar en red · Etapa 1 (español)" (desbloqueado si `insigniaGanada`); si el alumno empezó la ruta o tiene un bloque y le faltan lecciones, tarjeta que recomienda terminarlas con enlace a la siguiente.
- [ ] **Step 2: Entradas:** en `/asesorias`, una sección corta que presenta la ruta y la prueba de $32; en el resultado de `/nivel`, para Intermedio y Avanzado, un enlace secundario "¿Listo para volar en red? Empieza la ruta gratis" a `ROUTES.rutaRed`.
- [ ] **Step 3: `npm test`, `npx tsc -b`, `npm run build`** → todo pasa.
- [ ] **Step 4: Verificar en el navegador** el perfil (logro bloqueado) y el enlace desde `/nivel` y `/asesorias`, en escritorio y 375 px.
- [ ] **Step 5: Commit** `git add src/pages/Perfil.tsx src/pages/Asesorias.tsx src/pages/TestNivel.tsx` y `git commit -m "Show the network badge on the profile and link the route from the funnel"`.

### Task 10: Puesta en marcha (con Erik)

- [ ] **Step 1:** Erik corre la migración 0019 (Task 2) y despliega la función con sus secretos (Task 3).
- [ ] **Step 2:** Prueba de punta a punta en sandbox de PayPal con una cuenta de prueba: pagar → agendar → Erik confirma → Erik registra 2 partes aprobadas → la página ofrece repetir solo las 2 pendientes → Erik aprueba → aparece la insignia en el perfil. Esperado: cada paso se refleja tras recargar.
- [ ] **Step 3:** "Sí, subelo" de Erik → `git push origin main`; Cloudflare Pages despliega.
- [ ] **Step 4:** Erik sube los videos a YouTube y se llenan los `videoId` en `src/data/rutaRed.ts` (commit aparte por cada tanda).
