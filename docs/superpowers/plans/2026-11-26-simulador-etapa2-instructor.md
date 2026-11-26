# Simulador web, etapa 2: instructor IFR dentro del simulador — plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Las lecciones IFR 1 a 5 corren dentro de `/simulador` con el H135 web, con el mismo instructor de MSFS (voz, calificación, debriefing y mapa). Los intentos quedan marcados como del simulador web.

**Architecture:**
- El simulador entrega muestras (`Muestra`) a 10 Hz por un contexto de React. `useLector` toma esa fuente cuando existe y, si no, lee el lector local como hoy.
- La página de lección (`InstructorRepaso`, programa IFR) se monta dentro de `/simulador`: panel a la derecha en laptop y pestaña «Instructor» en celular.
- Solo se agrega lo propio del simulador web:
  - Regla de acceso.
  - El piloto automático anula el checkride.
  - La marca «H135 simulador web».
  - Encender y apagar el motor, para terminar la lección en la plataforma.

**Tech Stack:** React 19, Vite 8, Tailwind 4, TypeScript, Supabase (tabla `intentos_maniobra` existente, sin migración).

**Spec:** `docs/superpowers/specs/2026-11-25-simulador-h135-design.md`. Las secciones que aplican son «Instructor virtual dentro del simulador», «Quién puede usarlo» y «Cómo cuentan las lecciones en el simulador web».

## Global Constraints

- Textos en español; también en inglés donde la página del instructor ya es bilingüe (`T.es` / `T.en`).
- Nunca «oficial» ni «certificado». Se mantiene «Solo para simulación».
- Sin servicios de pago y sin servidor propio.
- Pruebas: `node --experimental-strip-types --test`, con la lista explícita en `package.json` (`"test"`). Todo archivo `*.test.ts` nuevo se agrega a esa lista. Los imports entre `.ts` llevan la extensión `.ts`.
- Typecheck: `npx tsc -b`. Lint: `npx oxlint`.
- Columna `avion` de `intentos_maniobra`: 1 a 20 caracteres.
- Las lecciones con MSFS no cambian: siguen `ACCESO_REPASO` y sus reglas de anulación de hoy.
- Cada commit termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Sin push ni merge sin el OK de Erik.

## Review Focus

1. **Reiniciar o «Cambiar lugar» con la lección en curso.** La posición salta y la lección se anula con el motivo de salto de siempre. No debe quedar trabada ni guardar un intento.
2. **Pestaña oculta en vuelo.** El simulador se detiene y no manda muestras, así que el hueco anula la lección. En tierra solo se pausa.
3. **Helipuerto o pista tipo «H1».** Aterrizar en el helipuerto y apagar debe terminar la lección. La conversión de aeropuerto quita esas pistas para que no cuenten como pista.
4. **Inicio en el aire con una lección elegida.** El panel pide empezar en un aeropuerto, porque `iniciar` exige tierra y quietud.
5. **AP encendido solo en ATT (sin modo que mueva) en checkride.** No anula. HDG, NAV, APR, ALT, VS, ALT.A o IAS sí anulan, y en práctica nada anula.

---

### Task 1: Motor encendido y apagado en el simulador

La lección termina con `!m.motor` en la plataforma (`fasesVuelo.ts`, fase `rodaje-regreso`), y el simulador no tiene motor.

**Files:**
- Modify: `src/features/simulador/bucle.ts` (`Sim`, `inicio`, `avanzar`)
- Modify: `src/pages/Simulador.tsx` (botón en `botones`)
- Test: `src/features/simulador/bucle.test.ts`

**Interfaces:**
- Produces: `Sim.motor: boolean`, que es `true` al empezar, en tierra y en el aire. Lo agrega `export function alternarMotor(s: Sim): Sim`, que solo cambia en tierra; en el aire devuelve `s` igual.

- [ ] **Step 1: Write the failing tests** in `bucle.test.ts`:
  - `"con el motor apagado no despega aunque suba el colectivo"`: en la plataforma, `alternarMotor` y luego 5 s con `PageUp`. Se espera `e.enTierra === true` y `e.altFt` igual a la elevación.
  - `"el motor solo se apaga en tierra"`: `inicio` en el aire y luego `alternarMotor`. Se espera `motor === true`.
  - `"inicio arranca con el motor encendido"`.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/simulador/bucle.test.ts`. Expected: FAIL, `alternarMotor` no existe.
- [ ] **Step 3: Implement.** En `avanzar`, con `!s.motor` el colectivo de `objetivos` es 0, y `mandos.colectivo` también, para que al encender no salte.
- [ ] **Step 4: Run the test again.** Expected: PASS.
- [ ] **Step 5: Add the button.** En `Simulador.tsx`, junto a Pausa, un botón «Apagar motor» / «Encender motor» que llama `accion(alternarMotor)`. Va deshabilitado en el aire, con `title="Solo en tierra"`.
- [ ] **Step 6: Commit** `Add engine on/off to the web simulator`.

### Task 2: De estado del simulador a muestra del instructor

**Files:**
- Create:
  - `src/features/simulador/muestraSim.ts`
  - `src/features/instructor/simWeb.ts` (solo el título; Task 4 le agrega las reglas)
- Test: `src/features/simulador/muestraSim.test.ts` (agregar a `package.json`)

**Interfaces:**
- Consumes:
  - `Sim` (con `motor`), `recibirNav` y `Vor` / `AeropuertoSim` de `datos.ts`.
  - `Muestra` de `src/features/instructor/evaluador.ts`, `Aeropuerto` de `aeropuertoSim.ts` y `VorSim` de `vorSim.ts`.
- Produces:
  - En `instructor/simWeb.ts`: `export const TITULO_SIM_WEB = "H135 simulador web"` (18 caracteres) y `export const esSimWeb = (m: Muestra) => m.titulo === TITULO_SIM_WEB`. `muestraSim.ts` los importa de ahí, para que `instructor/` nunca importe de `simulador/`.
  - `export function apMueve(ap: EstadoAp): boolean`: el AP mueve el helicóptero.
  - `export function aMuestra(s: Sim, x: { t: number; sueloFt: number; decl: number; vors: Vor[] }): Muestra`.
  - `export function aAeropuerto(a: AeropuertoSim): Aeropuerto`.
  - `export function aVorSim(v: Vor): VorSim`.
  - `export function aeropuertoCercano(lista: AeropuertoSim[], lat: number, lon: number, maxNm = 5): AeropuertoSim | null`.

- [ ] **Step 1: Write the failing tests:**
  - `apMueve`:
    - Con `AP_APAGADO`: false.
    - Con AP encendido en ATT/ATT y sin IAS: false.
    - Después de `pulsar(..., "HDG")`: true.
    - Con ALT: true.
    - Con IAS: true.
  - `aMuestra` sobre `inicio` al sur del VOR GDL, en el aire:
    - `rumbo` = `(rumboV − decl + 360) % 360`.
    - `agl` = `altFt − sueloFt`.
    - `titulo === TITULO_SIM_WEB`.
    - `tasa === 1` y `slew === false`.
    - `motor === true`.
    - `navMhz` = NAV1 activa y `navSenal === true`.
    - `navRadial` = el `radial` de `recibirNav`.
    - `navDesde`: 2 cuando `desde`, 1 cuando hacia y 0 sin señal.
    - `navTieneDme === vor.dme`.
    - `navDme` = `dmeNm`.
    - `gpsNav === (s.fuente === "gps")`.
    - `autopiloto === apMueve(s.ap)`.
  - `aMuestra` sin señal: `navSenal === false` y `navDesde === 0`.
  - `aAeropuerto`:
    - Una pista `{a:"10", b:"28"}` da dos extremos con `rumboV` opuestos (±1°) y `largoFt` > 0.
    - Una pista `{a:"H1"}` no aparece.
    - Los `com` con tipo `TWR` dan `"torre"`, `GND` da `"rodaje"`, `ATIS` da `"atis"`, `APP` da `"aproximacion"` y cualquier otro da `"otra"`.
  - `aeropuertoCercano`: devuelve el más cercano dentro de 5 NM, y null si no hay ninguno.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/simulador/muestraSim.test.ts`. Expected: FAIL, el módulo no existe.
- [ ] **Step 3: Implement.**
  - `aMuestra` deja `peso: 5500` como constante (`ponytail:` solo lo usa el viraje escarpado).
  - `bola` = `e.bola` y `pausa` = `s.pausa`.
  - `navDesv` = `desvGrados`, con un comentario sobre el signo: positivo es curso a la derecha.
  - `com1` = COM1 activa; `vientoDir` y `vientoKt` salen de `s.viento`.
- [ ] **Step 4: Run the test again.** Expected: PASS.
- [ ] **Step 5: Commit** `Turn the web simulator state into instructor samples`.

### Task 3: El simulador como segunda fuente de `useLector`

**Files:**
- Create: `src/features/instructor/fuenteMuestras.ts`
- Modify:
  - `src/features/instructor/useLector.ts`
  - `src/features/simulador/useSimulador.ts`
  - `src/pages/Simulador.tsx`

**Interfaces:**
- Produces:
  - `export type LoteWeb = { muestras: Muestra[]; aeropuerto: Aeropuerto | null; vors: VorSim[] }`.
  - `export type FuenteMuestras = { suscribir(f: (l: LoteWeb) => void): () => void }`.
  - `export const FuenteMuestrasContext = createContext<FuenteMuestras | null>(null)`.
  - `export const useFuenteMuestras = () => useContext(FuenteMuestrasContext)`.
  - `useSimulador` devuelve además `suscribirMuestras(f: (s: Sim, t: number) => void): () => void`.
- Consumes: `aMuestra`, `aAeropuerto`, `aVorSim`, `aeropuertoCercano` y `TITULO_SIM_WEB` (Task 2).

- [ ] **Step 1: Emit samples from the loop.** En el `cuadro` de `useSimulador`, cada 100 ms de reloj de pared (`t` del rAF), llama a los oyentes con `(sim.current, t / 1000)`.
  - El reloj es de pared, no de simulación. Así `Muestra.t` no vuelve a cero al Reiniciar y en pausa siguen llegando muestras con `pausa: true`, como espera `fasesVuelo`.
  - Con `document.hidden` no se emite nada.
- [ ] **Step 2: Build the context value in `Simulador.tsx`** con `useMemo`. `suscribir` registra el oyente y convierte cada `Sim` con `aMuestra`.
  - `sueloFt`: `terrenoRef.current?.alturaEn(lat, lon) ?? arranque.respaldoFt`.
  - Los `vors` se convierten con `aVorSim` una vez por país.
  - El `aeropuerto` se recalcula con `aeropuertoCercano` como mucho una vez por segundo. Se entrega el mismo objeto mientras no cambie, para que `useLector` no vuelva a renderizar.
  - El `<FuenteMuestrasContext.Provider>` envuelve la cabina.
- [ ] **Step 3: Teach `useLector` the second source.**
  - Con `useFuenteMuestras()` no nulo, el efecto se suscribe y no hace `fetch`.
  - Cada lote llama `alRecibir(muestras)` y `setMuestra(última)`. El estado queda en `"conectado"`; antes del primer lote, en `"sin-simulador"`.
  - `setAeropuerto` y `setVors` solo cambian con una referencia distinta.
  - `continuarDesde` no hace nada.
  - Dependencias del efecto: `[fuente]`.
- [ ] **Step 4: Verify.** Corre `npx tsc -b` y `npm test`. Expected: sin errores y todas las pruebas en verde. Las de `lector.test.ts` no cambian, porque el lector local queda igual.
- [ ] **Step 5: Commit** `Let the instructor read samples from the web simulator`.

### Task 4: Reglas del instructor para el simulador web

**Files:**
- Modify:
  - `src/features/instructor/lecciones.ts`
  - `src/features/instructor/repaso.ts`
  - `src/features/instructor/useIntento.ts`
  - `src/pages/InstructorRepaso.tsx`
  - `src/features/instructor/simWeb.ts` (de Task 2)
- Test:
  - `src/features/instructor/lecciones.test.ts`
  - `src/features/instructor/repaso.test.ts`
  - `src/features/instructor/simWeb.test.ts` (agregar a `package.json`)

**Interfaces:**
- Produces:
  - `export function estadoLeccionWeb(l: Leccion, a: { fundador: boolean; exclusivo: boolean }): "abierta" | "candado" | "proximamente"`.
    - No disponible: `"proximamente"`.
    - IFR 1: `"abierta"`.
    - Las demás: abiertas con fundador o Exclusivo; si no, `"candado"`.
  - En `simWeb.ts`, junto a `TITULO_SIM_WEB` y `esSimWeb` (Task 2): `export function anulaPorAp(m: Muestra, modo: Modo): boolean`: `esSimWeb(m) && modo === "checkride" && !!m.autopiloto && !m.enTierra`.
  - En `simWeb.ts`: `export const MOTIVO_AP = { es: "Usaste el piloto automático en el checkride: no se califica.", en: "You used the autopilot in the checkride: it is not graded." }`.
- Consumes: `useFuenteMuestras` (Task 3).

- [ ] **Step 1: Write the failing tests:**
  - `estadoLeccionWeb`:
    - IFR 1 sin Exclusivo: `"abierta"`.
    - IFR 2 sin Exclusivo: `"candado"`.
    - IFR 2 con Exclusivo: `"abierta"`.
    - IFR 2 con fundador: `"abierta"`.
    - IFR 6: `"proximamente"`.
  - `anulaPorAp`:
    - Las muestras de este grupo de pruebas se arman a mano, con `titulo: TITULO_SIM_WEB`.
    - Muestra web, checkride, `autopiloto: true`, en el aire: true.
    - En práctica: false.
    - En tierra: false.
    - Con `titulo: "Cessna Skyhawk"`: false (MSFS no cambia).
  - `repaso.test.ts`: en un repaso IFR en checkride ya en vuelo, una muestra web con `autopiloto: true` deja `etapa === "invalido"` con el motivo de `MOTIVO_AP`.
- [ ] **Step 2: Run the three test files.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `lecciones.ts`: `estadoLeccionWeb`.
  - `simWeb.ts`: `anulaPorAp` y `MOTIVO_AP`.
  - `repaso.ts`: en la función que avanza el repaso por muestra, junto a las otras anulaciones, `if (anulaPorAp(m, e.modo)) return anular(e, MOTIVO_AP[idioma], idioma)`. Usa el `anular` existente.
- [ ] **Step 4: `useIntento`.**
  - Con `useFuenteMuestras()` no nulo, `guardar` manda `avion: TITULO_SIM_WEB` en lugar de `d.avion`.
  - En el manejador de lotes: si `modoIntento === "checkride"`, el intento está en curso y alguna muestra cumple `anulaPorAp`, entonces `setEv(null)` y `setAnulado(MOTIVO_AP.es)`.
- [ ] **Step 5: `InstructorRepaso`.**
  - Acepta `numero?: string`, que manda sobre `useParams().numero`.
  - Con fuente web:
    - Usa `estadoLeccionWeb` en lugar de `estadoLeccion`.
    - El estado dice «Conectado al simulador web» / «Connected to the web simulator».
    - No guarda ni ofrece reanudar: la posición del simulador no se recupera.
  - La lección guarda `avion` con `avionParaGuardar(avionDe(TITULO_SIM_WEB))`, sin cambio de código: `avionDe` ya devuelve el título cuando no es un avión con checklist, y por eso tampoco hay checklist por voz (`conChecklist` es false).
- [ ] **Step 6: Run** `npm test` y `npx tsc -b`. Expected: todo en verde.
- [ ] **Step 7: Commit** `Add the web simulator rules to the IFR instructor`.

### Task 5: Panel del instructor en `/simulador`

**Files:**
- Create: `src/features/simulador/PanelInstructor.tsx`
- Modify:
  - `src/pages/Simulador.tsx`
  - `src/pages/InstructorIfr.tsx`
  - `src/lib/routes.ts` (opcional: `simuladorLeccion: (n: number) => \`/simulador?leccion=${n}\``)

**Interfaces:**
- Consumes:
  - `InstructorRepaso` con `programa="ifr"` y `numero` (Task 4), cargado con `lazy` solo cuando hay lección.
  - `estadoLeccionWeb`, `LECCIONES_IFR`, `useAuth` y `usePremiumAccess`.
- Produces: `PanelInstructor({ enElAire: boolean, onCambiarLugar: () => void })`.

- [ ] **Step 1: Write `PanelInstructor`.**
  - Selector «Lección IFR»: «Sin lección» y 1 a 5, con la lección 6 deshabilitada («Próximamente»).
  - El valor inicial sale de `?leccion=`.
  - Según el caso, muestra:
    - **Sin cuenta:** «Inicia sesión para usar el instructor», con enlace a `ROUTES.ingresar?from=` (codificando `/simulador?leccion=N`).
    - **Con candado:** «Esta lección es de Exclusivo», con enlace a precios.
    - **Con `enElAire`:** «La lección empieza en tierra: elige un aeropuerto», con un botón que llama `onCambiarLugar`.
    - **En los demás casos:** `<InstructorRepaso programa="ifr" numero={String(n)} />` dentro de `<Suspense>`.
  - Lo elegido se recuerda en `localStorage` con la clave `"simulador-leccion"`, con try/catch como los demás.
- [ ] **Step 2: Place it.**
  - **Laptop:** arriba de la columna derecha, plegable como el mapa («Instructor IFR · Mostrar/Ocultar»).
  - **Celular:** cuarta pestaña «Instructor».
- [ ] **Step 3: Link from the IFR menu.** En `InstructorIfr.tsx`, bajo cada lección abierta, un enlace «Volar en el simulador web» a `/simulador?leccion=N`.
  - Se muestra también en las lecciones con `estadoLeccionWeb === "abierta"`, aunque la de MSFS tenga candado.
  - Hay que ajustar el `return` de las lecciones sin acceso MSFS para que el enlace web siga visible.
- [ ] **Step 4: Verify in the browser** (servidor `simulador-dev`, puerto 5196):
  - Sin sesión: el panel pide iniciar sesión.
  - Con la cuenta de Erik:
    - Lección 1 desde MMGL en la plataforma. El estado dice «Conectado al simulador web» y el instructor dice el VOR al despegar.
    - Reiniciar a mitad del vuelo anula por salto (Review Focus 1).
    - Inicio en el aire: aparece el aviso (Review Focus 4).
  - En celular (375×812): la pestaña Instructor sin desborde horizontal.
- [ ] **Step 5: Commit** `Run the IFR lessons inside the web simulator`.

### Task 6: Prueba de Erik

- [ ] Erik vuela la lección 1 completa:
  - De la plataforma de MMGL, en práctica, con voz.
  - Aterriza, apaga el motor y ve el debriefing con el mapa.
  - Revisa que el intento aparezca en su panel con avión «H135 simulador web».
- [ ] Erik vuela un checkride con el AP en HDG: el intento se anula con el aviso.
- [ ] Push solo con su OK.

## Notas para Erik (decisiones mías, dentro de la spec)

- **Sin checklist por voz en el H135.** Los checklists son del C172, el C152 y el Arrow. Con el H135 el instructor dice el VOR al despegar, como ya hace hoy cuando no hay checklist.
- **El motor se enciende y apaga con un botón.** La lección termina cuando apagas en la plataforma, igual que en MSFS.
- **«Cuentan igual para abrir la siguiente lección»:** hoy el programa IFR no tiene candado por orden, solo por acceso. Los intentos del simulador web se guardan en la misma tabla y con la misma clave de lección, así que contarán en cuanto exista ese orden.
- **El piloto automático solo anula en el simulador web.** En MSFS no cambia nada, como dice la spec.
- **Sin reanudar en el simulador web.** Si recargas la página, la lección vuelve a empezar.
