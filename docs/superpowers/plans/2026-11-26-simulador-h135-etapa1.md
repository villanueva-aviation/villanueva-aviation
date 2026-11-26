# Simulador H135, etapa 1 (cabina volable) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** una página `/simulador`, gratis y sin cuenta, donde el cadete escoge país y VOR o aeropuerto, y vuela un H135 con PFD 3D, HSI, piloto automático, radios y GPS directo, con ratón, teclado o pantalla táctil.

**Architecture:** la lógica es pura y está probada con `node --test`: datos, radios, modelo de vuelo, mandos, piloto automático y matemática de mosaicos. Vive en `src/features/simulador/`. Un bucle propio (fuera del render de React) avanza la física a 50 Hz. La UI lee el estado con `useSyncExternalStore`. La vista 3D es three.js con terreno de los mosaicos Terrarium de AWS. Los instrumentos son SVG propios; el HSI extiende `RosaHSI` de `src/features/landing/HSI.tsx`.

**Tech Stack:** React 19 + Vite + Tailwind 4 + TypeScript. Dependencia nueva: `three` y `@types/three`, con la versión exacta del día de instalación. Pruebas con `node --experimental-strip-types --test`: cada archivo de prueba nuevo se agrega a la lista explícita de `"test"` en `package.json`. Los módulos que se prueban importan con extensión `.ts`.

**Spec:** `docs/superpowers/specs/2026-11-25-simulador-h135-design.md`

La etapa 2 (instructor IFR dentro del simulador, acceso y marca «simulador web») tendrá su propio plan después de que Erik pruebe esta etapa.

## Global Constraints

- Todo el texto visible en español. Nunca escribir «oficial» ni «certificado». «Solo para simulación» siempre visible en la cabina.
- No copiar el aspecto ni la marca de Garmin, Airbus, Helionix ni Thales: diseño propio inspirado en la función.
- Sin servicios de pago ni cuentas. Datos: OurAirports (dominio público) y mosaicos `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png` (CORS abierto, comprobado el 2026-11-25). Atribución visible: «Elevación: Mapzen/AWS Terrain Tiles · Navegación: OurAirports».
- `/simulador` es público. No pide cuenta y no lleva la barra ni el pie del sitio (se agrega a `aterrizaje` en `src/App.tsx`).
- Entradas a espera: solo `src/features/entrenador/esperas.ts`. Nunca `guia-hsi.pdf`.
- VOR: 1 punto = 2°. Escala completa ±5 puntos (como `RosaHSI`). GPS: 1 punto = 0.4 NM.
- Rendimiento: laptop o PC con gráficos integrados a ≥30 cuadros por segundo; celular de gama media en calidad baja.
- Git: commits con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Sin push ni merge sin el OK de Erik. Nunca `git stash` a secas.

## Review Focus

1. **Volver a una pestaña oculta:** el tiempo real acumulado es enorme. La física no debe dar un salto: se limita el paso y se pausa mientras está oculta (Task 8, prueba `pasosPendientes`).
2. **Terreno que no llega** (sin internet, mosaico con error): no se cae; vuela con cielo y tierra planos y la elevación del aeropuerto como suelo (Task 6, prueba `alturaEn` sin mosaico → `null`; Task 3, prueba del suelo de respaldo).
3. **Dos VOR con la misma frecuencia a alcance:** se recibe el más cercano (Task 2, prueba).
4. **Frecuencia fuera de banda o con mal espaciado:** NAV 108.00–117.95 cada 0.05; COM 118.000–136.990 cada 0.025. Se ajusta al canal válido más cercano (Task 2, prueba `ajustarFrecuencia`).
5. **Búsqueda con o sin acentos** («Leon» encuentra «León», «gdl» encuentra GDL): se normaliza (Task 1, prueba `buscar`).

---

### Task 1: Datos de OurAirports por país

**Files:**
- Create: `src/features/simulador/datos.ts` (tipos, conversión pura y búsqueda)
- Create: `src/features/simulador/datos.test.ts`
- Create: `scripts/datos-simulador.ts` (baja los CSV y escribe los JSON)
- Create: `public/data/sim/paises.json`, `public/data/sim/{ISO}.json` (generados y en commit)
- Modify: `package.json` (prueba nueva)

**Interfaces:**
- Produces:
  ```ts
  export type Vor = { ident: string; nombre: string; lat: number; lon: number; mhz: number; dme: boolean; decl: number; elevFt: number };
  export type PistaSim = { a: string; b: string; latA: number; lonA: number; latB: number; lonB: number; anchoFt: number };
  export type AeropuertoSim = { icao: string; nombre: string; lat: number; lon: number; elevFt: number; helipuerto: boolean; pistas: PistaSim[]; com: { tipo: string; mhz: number }[] };
  export type DatosPais = { vors: Vor[]; aeropuertos: AeropuertoSim[] };
  export type Pais = { iso: string; vors: number };
  export function parsearCsv(texto: string): Record<string, string>[];
  export function convertirPais(iso: string, navaids: Record<string,string>[], aeropuertos: Record<string,string>[], pistas: Record<string,string>[], frecuencias: Record<string,string>[]): DatosPais;
  export function normalizar(s: string): string; // minúsculas, sin acentos
  export function buscar(datos: DatosPais, q: string): { vors: Vor[]; aeropuertos: AeropuertoSim[] }; // máx 20 de cada uno
  export async function cargarPais(iso: string): Promise<DatosPais>; // fetch /data/sim/{iso}.json
  ```
  `decl` es la declinación en grados, positiva al este (verdadero = magnético + decl). El nombre del país se muestra con `new Intl.DisplayNames(["es"], { type: "region" }).of(iso)`.

- [ ] **Step 1: Write the failing tests** en `datos.test.ts`:
  - `parsearCsv` respeta comillas con comas: `'a,b\n"x, y",2'` → `[{ a: "x, y", b: "2" }]`.
  - `convertirPais("MX", ...)` con filas de muestra: guarda tipos `VOR`, `VOR-DME` y `VORTAC`; descarta `NDB` y `TACAN`. `frequency_khz` 117500 → `mhz` 117.5. `dme` es true en VOR-DME y VORTAC y en un VOR con `dme_frequency_khz`. `magnetic_variation_deg` `"5.2"` → `decl` 5.2. Los aeropuertos de otro país se descartan.
  - Aeropuertos: se guardan `large_airport`, `medium_airport`, `small_airport` con `gps_code` o `ident` de 4 letras, y `heliport` (con `helipuerto: true`). `closed` se descarta. Las pistas salen de `runways.csv` con coordenadas en los dos extremos (las que no tienen se omiten). `com` sale de `airport-frequencies.csv` (`frequency_mhz`).
  - `buscar(datos, "Leon")` encuentra el VOR `nombre: "León"`. `buscar(datos, "gdl")` encuentra `ident: "GDL"`. Primero coincidencia exacta de ident, luego prefijo, luego contiene.
- [ ] **Step 2:** `node --experimental-strip-types --test src/features/simulador/datos.test.ts` → FAIL (módulo no existe).
- [ ] **Step 3:** Implementar `datos.ts`. `parsearCsv` a mano (el CSV de OurAirports usa comillas dobles y `""`). Sin dependencia nueva.
- [ ] **Step 4:** Repetir el comando → PASS.
- [ ] **Step 5:** Escribir `scripts/datos-simulador.ts`. Baja `navaids.csv`, `airports.csv`, `runways.csv` y `airport-frequencies.csv` de `https://davidmegginson.github.io/ourairports-data/`. Escribe un `public/data/sim/{ISO}.json` por cada país con al menos un VOR, más `paises.json` (`Pais[]` ordenado por iso). Correr: `node --experimental-strip-types scripts/datos-simulador.ts`. Esperado: `MX.json`, `ES.json` y `CL.json` existen; `ES.json` contiene `BRS` (Burgos) o `VLL` (Valladolid) y `MX.json` contiene `GDL`. Confirmar los idents con `grep`. Si un JSON pesa más de 1.5 MB, quitar los `small_airport` sin pistas pavimentadas y anotarlo.
- [ ] **Step 6: Commit** `Add OurAirports VOR and airport data for the simulator`.

### Task 2: Radios, recepción de VOR y GPS directo

**Files:**
- Create: `src/features/simulador/radios.ts`, `src/features/simulador/radios.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Vor`, `AeropuertoSim` (Task 1); `aNm`, `rumbo`, `difAngulo` de `src/features/home/navGeo.ts`.
- Produces:
  ```ts
  export type Posicion = { lat: number; lon: number; altFt: number };
  export type LecturaNav = { vor: Vor; radial: number; desvGrados: number; desde: boolean; dmeNm: number | null; distNm: number };
  export function alcanceNm(altFt: number, elevVorFt: number): number; // 1.23*sqrt(max(0,alt-elev)) acotado a 130
  export function recibirNav(mhz: number, obs: number, pos: Posicion, vors: Vor[]): LecturaNav | null;
  export function ajustarFrecuencia(mhz: number, banda: "nav" | "com"): number;
  export function nombreCom(mhz: number, aeropuertos: AeropuertoSim[], pos: Posicion): string | null; // el más cercano a ≤60 NM
  export type Guia = { curso: number; xtkNm: number; distNm: number };
  export function guiaGps(pos: Posicion, destino: { lat: number; lon: number }, cursoDesde: number): Guia;
  export function guiaVor(l: LecturaNav, obs: number): Guia;
  export function puntos(g: Guia, fuente: "vor" | "gps", desvGrados?: number): number; // VOR: desvGrados/2; GPS: xtkNm/0.4; acotado a ±5
  ```
  Convenciones: `radial` es magnético (verdadero − `vor.decl`). `desvGrados` es positivo cuando el curso queda a la derecha del avión, mirando hacia donde va el curso: la barra se va a la derecha, como `desviacion` en `RosaHSI`. `desde` es true en FROM. `xtkNm` sigue el mismo signo.

- [ ] **Step 1: Write the failing tests:**
  - Avión 10 NM al este de un VOR con `decl: 0` → `radial ≈ 90`. Con OBS 090 → `desde: true` y `|desvGrados| < 0.5`. Con OBS 270 → `desde: false`.
  - Avión en el radial 095, OBS 090, FROM → curso a la izquierda → `desvGrados ≈ -5`. En el radial 085 → `≈ +5`.
  - Con `decl: 5` (este) y el avión al este verdadero → `radial ≈ 85`.
  - Fuera de alcance (a 1,000 ft sobre el VOR y 80 NM) → `null`. A 5,000 ft y 60 NM → recibe (`alcanceNm(5000,0) ≈ 87`).
  - Dos VOR con 117.5 a 20 y 40 NM → recibe el de 20 NM.
  - `dmeNm` es `null` si `vor.dme` es false; si no, la distancia oblicua (incluye altura en NM).
  - `ajustarFrecuencia(117.97,"nav") = 117.95`, `(107,"nav") = 108`, `(118.012,"com") = 118.0`, `(140,"com") = 136.975`.
  - `guiaGps`: destino 10 NM al norte, avión 1 NM al este de la línea, curso 360 → `xtkNm ≈ -1` (curso a la izquierda) y `distNm ≈ 10`.
- [ ] **Step 2:** correr la prueba → FAIL.
- [ ] **Step 3:** implementar `radios.ts`.
- [ ] **Step 4:** correr → PASS.
- [ ] **Step 5: Commit** `Add VOR reception, DME, frequency rules and GPS direct-to`.

### Task 3: Ficha del H135 y modelo de vuelo con estabilización

**Files:**
- Create: `src/features/simulador/ficha.ts`, `src/features/simulador/modelo.ts`, `src/features/simulador/modelo.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces:
  ```ts
  // ficha.ts
  export type Ficha = { nombre: string; vne: number; cabeceoMax: number; cabeceoArribaMax: number; inclinacionMax: number; tauActitud: number; tauVel: number; tauVs: number; kVs: number; preqHover: number; preqMin: number; vPreqMin: number; preqVne: number };
  export const H135: Ficha; // vne 150, cabeceoMax 20, cabeceoArribaMax 15, inclinacionMax 30, tauActitud 0.8, tauVel 8, tauVs 1.5, kVs 2600, preqHover 0.55, preqMin 0.38, vPreqMin 70, preqVne 0.75
  // modelo.ts
  export type Estado = { lat: number; lon: number; altFt: number; ias: number; gs: number; vs: number; cabeceo: number; inclinacion: number; rumboV: number; track: number; vLat: number; colectivo: number; enTierra: boolean; bola: number };
  export type Objetivos = { cabeceo: number; inclinacion: number; colectivo: number; pedales: number }; // grados, grados, 0..1, -1..1
  export type Viento = { dir: number; kt: number }; // de donde viene, verdadero
  export function sigma(altFt: number): number; // (1 - 6.875e-6*alt)^4.256
  export function potenciaRequerida(f: Ficha, ias: number): number;
  export function velocidadEquilibrio(cabeceo: number): number; // (5 - cabeceo) * 8, mínimo 0
  export function paso(e: Estado, o: Objetivos, f: Ficha, viento: Viento, sueloFt: number, dt: number): Estado;
  export function enPlataforma(lat: number, lon: number, elevFt: number, rumboV: number): Estado;
  ```
  El modelo, en orden, dentro de `paso`:
  1. **Actitud:** primer orden hacia `o.cabeceo` y `o.inclinacion` con `tauActitud`, acotados a la ficha (cabeceo de −`cabeceoMax` a +`cabeceoArribaMax`).
  2. **Velocidad:** IAS = TAS·√σ. La TAS va hacia `velocidadEquilibrio(cabeceo)` con `tauVel`, sin pasar de 1.05·vne.
  3. **Vertical:** la potencia disponible es `colectivo·σ^1.2`. La VS va hacia `(disponible − potenciaRequerida)·kVs` con `tauVs`. `potenciaRequerida` es la curva en U: cuadrática de `preqHover` (0 kt) a `preqMin` (70 kt), y de ahí a `preqVne`.
  4. **Guiñada:** arriba de 45 kt, viraje coordinado `1091·tan(inclinación)/TAS` en °/s más `pedales·3`. Debajo de 30 kt, `pedales·30` °/s menos `Δcolectivo/dt·20` (par del rotor). Entre 30 y 45 kt se mezcla lineal. `bola = pedales·0.5` arriba de 45 kt.
  5. **Lateral a baja velocidad:** debajo de 40 kt, `vLat` va hacia `inclinación·1.5` kt con τ 2 s. Arriba, 0.
  6. **Posición:** velocidad del aire (rumbo verdadero + `vLat`) más viento → `gs`, `track`, nueva lat/lon.
  7. **Suelo:** si `altFt ≤ sueloFt` y `vs ≤ 0`: `altFt = sueloFt`, `vs = 0`, `enTierra = true` y la velocidad cae a 0 con τ 1 s. Sale de tierra cuando la VS objetivo es > 0.

- [ ] **Step 1: Write the failing tests** (simulando con `dt = 0.02`):
  - Crucero a 120 kt y 5,000 ft, con el cabeceo de equilibrio y el colectivo en `potenciaRequerida/σ^1.2`, 60 s: altitud ±50 ft, IAS ±3 kt.
  - Inclinación 25° a 120 kt: régimen de viraje entre 3.8 y 4.6 °/s.
  - Cabeceo −20° sostenido 120 s: IAS ≤ 1.05·150.
  - Desde la plataforma, colectivo 0.7: despega y sube; a 30 s, VS > 300 ft/min.
  - En tierra con colectivo 0.3: sigue en tierra y no se mueve.
  - Viento 270/20, rumbo 360 a 100 kt: `track ≈ 011`.
  - A 22,000 ft con colectivo 1 y 70 kt: VS < 300 ft/min (techo).
  - Suelo de respaldo: `paso` con `sueloFt = 5016` no deja bajar de 5,016 ft.
- [ ] **Step 2:** correr → FAIL.
- [ ] **Step 3:** implementar `ficha.ts` y `modelo.ts`. Marcar con `// ponytail:` que es un modelo de equilibrio, no de rotor, y que la opción B (sin estabilización) va como otra función `paso` que no amortigua la actitud.
- [ ] **Step 4:** correr → PASS.
- [ ] **Step 5: Commit** `Add the stabilized H135 flight model`.

### Task 4: Mandos (teclado, ratón, táctil)

**Files:**
- Create: `src/features/simulador/mandos.ts`, `src/features/simulador/mandos.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Ficha`, `Objetivos` (Task 3).
- Produces:
  ```ts
  export type Mandos = { cx: number; cy: number; colectivo: number; pedales: number }; // cx, cy, pedales -1..1 (cy + = adelante); colectivo 0..1
  export type Teclas = Set<string>; // KeyboardEvent.code
  export function avanzarTeclado(m: Mandos, teclas: Teclas, dt: number): Mandos;
  export function aplicarRaton(m: Mandos, dx: number, dy: number, rueda: number, botonDerecho: boolean): Mandos;
  export function aObjetivos(m: Mandos, f: Ficha): Objetivos; // cabeceo = -cy * (cy>0 ? cabeceoMax : cabeceoArribaMax); inclinacion = cx * inclinacionMax
  export function tocados(antes: Mandos, ahora: Mandos): { lat: boolean; lon: boolean; col: boolean; ped: boolean }; // cambio > 0.02
  ```
  - **Teclado:** flechas mueven `cx`/`cy` a 1.5/s; al soltar vuelven a 0 a 2/s. `PageUp`/`PageDown` mueven el colectivo a 0.3/s y se queda donde lo dejas. `KeyZ`/`KeyX` mueven los pedales a 2/s y vuelven a 0 al soltar. `KeyC` centra el cíclico.
  - **Ratón:** con la vista capturada (Pointer Lock), `dx`/`dy` mueven el cíclico a 0.004 por píxel y se queda donde lo dejas. La rueda mueve el colectivo 0.02 por clic. Botón derecho + `dx` mueve los pedales y vuelven a 0 al soltar.
  - **Táctil:** las palancas en pantalla dan valores absolutos y no necesitan función aquí.

- [ ] **Step 1: Write the failing tests:**
  - `ArrowLeft` 0.5 s → `cx ≈ -0.75`; luego sin teclas 0.5 s → `cx ≈ -0.75 + 1.0 = 0.25` → acotado hacia 0 sin pasar: `cx = 0`.
  - `PageUp` 1 s desde 0.5 → 0.8; sin teclas 1 s → sigue en 0.8.
  - `aplicarRaton(m0, 100, 0, 0, false).cx ≈ 0.4`; con botón derecho, `pedales ≈ 0.4` y `cx` sin cambio.
  - `aObjetivos({cx:0, cy:1, ...}, H135).cabeceo = -20`; `cy: -1` → `+15`; `cx: 1` → `inclinacion 30`.
  - `tocados` marca solo el eje que cambió.
- [ ] **Step 2:** correr → FAIL. **Step 3:** implementar. **Step 4:** correr → PASS.
- [ ] **Step 5: Commit** `Add keyboard, mouse and touch control mapping`.

### Task 5: Piloto automático

**Files:**
- Create: `src/features/simulador/piloto.ts`, `src/features/simulador/piloto.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Estado`, `Objetivos`, `Ficha`, `potenciaRequerida`, `sigma`, `velocidadEquilibrio` (Task 3); `Guia` (Task 2); `difAngulo`.
- Produces:
  ```ts
  export type ModoLat = "ATT" | "HDG" | "NAV" | "APR";
  export type ModoVert = "ATT" | "ALT" | "VS" | "ALTA";
  export type EstadoAp = { ap: boolean; lat: ModoLat; armado: "NAV" | "APR" | null; vert: ModoVert; ias: boolean; ref: { cabeceo: number; inclinacion: number }; aviso: string | null };
  export type Selecciones = { hdg: number; altSel: number; vsSel: number; iasSel: number };
  export const AP_APAGADO: EstadoAp;
  export function pulsar(ap: EstadoAp, boton: "AP" | "HDG" | "NAV" | "APR" | "ALT" | "VS" | "IAS" | "ALTA", e: Estado, sel: Selecciones): EstadoAp;
  export function pilotar(ap: EstadoAp, e: Estado, sel: Selecciones, guia: Guia | null, manual: Objetivos, tocado: { lat: boolean; lon: boolean; col: boolean }, f: Ficha, decl: number, dt: number): { ap: EstadoAp; objetivos: Objetivos };
  ```
  Las reglas que fija la spec:
  - `AP` enciende en `ATT` lateral y vertical con `ref` = actitud actual. Con el AP apagado, `pilotar` devuelve `manual`.
  - **HDG:** inclinación = `clamp(1.5·error, ±min(20, atan(3·TAS/1091)))`. El error es el rumbo magnético seleccionado menos (`rumboV − decl`).
  - **NAV/APR:** quedan armados mientras `|xtkNm|` es mayor que 1.0 (NAV) o 0.5 (APR); después capturan. Ya capturado, el track deseado es `curso + clamp(-xtk·30, ±30)` (APR: `xtk·45`, ±30). Sin guía, aviso «Sin señal» y pasan a `HDG`.
  - **ALT:** VS deseada = `clamp(2·(alt ref − alt), ±800)`.
  - **VS:** VS deseada = `vsSel`.
  - **ALTA:** hacia `altSel` a `±max(|vsSel|, 500)`; a 200 ft o menos pasa a `ALT` con referencia en `altSel`.
  - En los modos verticales, colectivo = `(potenciaRequerida(ias) + vsDeseada/kVs) / σ^1.2`.
  - **IAS:** cabeceo = `clamp(5 − iasSel/8 + 0.3·(ias − iasSel), −cabeceoMax, cabeceoArribaMax)`.
  - **Tocar un eje desconecta ese eje:** si `tocado.lat` y el modo lateral no es ATT, pasa a ATT con aviso «HDG desconectado» (o el modo que fuera). Lo mismo para `lon` con IAS y para `col` con los verticales. En ATT, tocar actualiza `ref`.
  - Los pedales siempre son los del piloto.

- [ ] **Step 1: Write the failing tests** (lazo cerrado con `paso` de Task 3, `dt = 0.02`, 120 kt, 5,000 ft):
  - **HDG** de 360 a 090: llega a ±2° en menos de 40 s, sin pasar de 20° de inclinación.
  - **NAV:** radial 090 FROM, avión 3 NM al sur de la línea con track 060. Captura y queda a menos de 0.2 NM (≈1 punto a 6 NM) a los 120 s, sin pasar más de 1 punto del otro lado.
  - **ALT:** sostiene ±20 ft durante 60 s con viento 270/20.
  - **ALTA** con `altSel` 7,000 y `vsSel` 1,000: llega a 7,000 ±50 ft y el modo final es `ALT`.
  - **IAS** con `iasSel` 90 desde 120: queda en 90 ±3 kt a los 60 s.
  - **Desconexión:** con HDG puesto y `tocado.lat = true` → `lat: "ATT"` y `aviso` no nulo.
- [ ] **Step 2:** correr → FAIL. **Step 3:** implementar. Si un caso no pasa con las ganancias de arriba, ajustarlas en `piloto.ts` sin aflojar las tolerancias de la prueba. **Step 4:** correr → PASS.
- [ ] **Step 5: Commit** `Add the H135 autopilot modes`.

### Task 6: Terreno 3D (vista sintética)

**Files:**
- Create: `src/features/simulador/mosaicos.ts`, `src/features/simulador/mosaicos.test.ts` (puro)
- Create: `src/features/simulador/terreno.ts` (three.js: carga, mallas y altura)
- Create: `src/features/simulador/VistaSintetica.tsx`
- Modify: `package.json` (`three`, `@types/three`, prueba)

**Interfaces:**
- Produces:
  ```ts
  // mosaicos.ts
  export type Mosaico = { z: number; x: number; y: number };
  export function mosaicoDe(lat: number, lon: number, z: number): Mosaico; // x envuelve con módulo 2^z
  export function alrededor(lat: number, lon: number, z: number, radio: number): Mosaico[]; // (2r+1)^2, x envuelto
  export function metrosTerrarium(r: number, g: number, b: number): number; // r*256 + g + b/256 - 32768
  export function urlMosaico(m: Mosaico): string;
  export function anillos(calidad: "baja" | "media" | "alta"): { z: number; radio: number; segmentos: number }[];
  // alta: [{z:12,r:2,s:64},{z:10,r:2,s:32},{z:8,r:2,s:16}]; media: [{12,1,32},{10,2,16},{8,1,16}]; baja: [{11,1,32},{8,1,16}]
  // terreno.ts
  export class Terreno { constructor(escena: THREE.Scene); actualizar(lat: number, lon: number, altFt: number, calidad: "baja"|"media"|"alta"): void; alturaEn(lat: number, lon: number): number | null /* ft */; pistas(aeropuerto: AeropuertoSim | null): void; liberar(): void }
  // VistaSintetica.tsx
  export function VistaSintetica(props: { leer: () => Estado; aeropuerto: AeropuertoSim | null; terrenoRef: { current: Terreno | null } }): JSX.Element;
  ```
  - El origen local está en metros ENU alrededor de un punto. Se recentra cuando el helicóptero se aleja más de 20 km, para no perder precisión.
  - La cámara va en la posición del helicóptero con rumbo, cabeceo e inclinación, FOV vertical 50°.
  - El material es un `ShaderMaterial` con color por altura (verde, ocre, gris, blanco) y sombreado por la normal. Uniform `altAvion`: el terreno a menos de 1,000 ft debajo del helicóptero va en amarillo y el que está por encima en rojo. Niebla hacia el horizonte. Cielo con degradado.
  - Cada mosaico se baja con `fetch` → `createImageBitmap` → `OffscreenCanvas` → `getImageData` → malla con `segmentos×segmentos`. Se guardan 64 mosaicos en un LRU. Uno que falla no se reintenta en 60 s.
  - Las pistas del aeropuerto de salida son rectángulos grises a la altura del terreno (o `elevFt` si no hay).
  - **Calidad automática:** si el promedio de 2 s baja de 28 cuadros por segundo, baja la calidad; si pasa de 55 durante 10 s, la sube. En pantallas táctiles arranca en `baja`. Sin WebGL, `VistaSintetica` dibuja cielo y tierra planos con SVG.
  - La vista se pinta con su propio `requestAnimationFrame` y lee el estado con `leer()`, sin re-render de React.

- [ ] **Step 1: Write the failing tests** (`mosaicos.test.ts`):
  - `mosaicoDe(20.52, -103.31, 10)` (GDL) = `{ z:10, x:218, y:452 }`. Cotejar con la fórmula Web Mercator; si el valor difiere, corregir la prueba con el valor de la fórmula y anotarlo.
  - `metrosTerrarium(128, 0, 0) = 0`; `(129, 100, 128) = 356.5`.
  - `alrededor(0, 179.99, 4, 1)` contiene x = 0 (envuelve).
  - `urlMosaico({z:10,x:224,y:453})` = `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/10/224/453.png`.
- [ ] **Step 2:** correr → FAIL. **Step 3:** implementar `mosaicos.ts`. **Step 4:** correr → PASS.
- [ ] **Step 5:** `npm i three @types/three` con la versión exacta del día (sin `^`). Implementar `terreno.ts` y `VistaSintetica.tsx`. Correr `npx tsc -b` → sin errores.
- [ ] **Step 6: Commit** `Add the synthetic-vision terrain view`.

### Task 7: Instrumentos de cabina

**Files:**
- Modify: `src/features/landing/HSI.tsx` (props opcionales nuevas en `RosaHSI`, sin cambiar su dibujo actual)
- Create: `src/features/simulador/Pfd.tsx`, `HsiSim.tsx`, `PanelAp.tsx`, `Radios.tsx`, `Navegador.tsx`, `Perilla.tsx`

**Interfaces:**
- Consumes: `Estado` (3), `EstadoAp`/`Selecciones`/`pulsar` (5), `LecturaNav`/`Guia`/`puntos`/`ajustarFrecuencia` (2), `aPantalla` de `navGeo.ts`, `Vor`/`AeropuertoSim` (1).
- Produces:
  - `RosaHSI` gana `desde?: boolean | null` (null = sin señal: barra y TO/FROM ocultos y bandera roja «NAV»), `brg2?: number | null` (marcación magnética de la segunda aguja, magenta) y `colorCurso?: string` (verde VOR, magenta GPS). Sin estas props se dibuja igual que hoy, así que `/resumen-hsi` y el PFD del inicio no cambian.
  - `Perilla({ valor, paso, min?, max?, circular?, onCambio, etiqueta })`. Rueda del ratón encima: ±paso. Arrastre vertical: un paso por cada 8 px. Clic en el centro: sincroniza (HDG al rumbo actual, CRS al radial actual). Botones − y + visibles en táctil.
  - `Pfd({ leer, ap, sel })`: SVG encima de `VistaSintetica`. Cintas de IAS (con `iasSel` en cian) y altitud (con `altSel`), VS, escala de cabeceo ±20°, inclinación, rumbo arriba, modos del AP (verde capturado, blanco armado) y avisos del AP en ámbar. «Solo para simulación» abajo.
  - `HsiSim({ e, decl, fuente, crs, hdg, nav1, nav2, gps })`: `RosaHSI` grande con datos en las esquinas (fuente e ident, CRS, DME, GS, viento) y botón de fuente VOR1 ⇄ GPS.
  - `PanelAp`: botones AP, HDG, NAV, APR, ALT, VS, IAS, ALTA y perillas HDG, ALT SEL, VS e IAS.
  - `Radios`: COM1, NAV1 y NAV2, cada uno con activa, en espera, botón ⇄ e ident o estación recibida. Perilla CRS.
  - `Navegador`: mapa SVG con rumbo arriba, escala 5/10/20/40 NM. Muestra VOR, aeropuertos, helicóptero, radial seleccionado y línea GPS. Botón «Directo a» con un buscador (usa `buscar` de Task 1).

- [ ] **Step 1:** `RosaHSI` con las props nuevas. `npx tsc -b` → sin errores. Abrir `/resumen-hsi` en la vista previa y confirmar que se ve igual que antes.
- [ ] **Step 2:** los componentes nuevos. `npx tsc -b` → sin errores. Revisar todo el texto contra las Global Constraints (nada de «oficial» ni «certificado», nada de marcas).
- [ ] **Step 3: Commit** `Add the cockpit instruments, autopilot panel, radios and navigator`.

### Task 8: Bucle, página `/simulador` y elegir dónde volar

**Files:**
- Create: `src/features/simulador/bucle.ts`, `src/features/simulador/bucle.test.ts`
- Create: `src/features/simulador/useSimulador.ts`, `src/features/simulador/ElegirLugar.tsx`, `src/features/simulador/Controles.tsx`
- Create: `src/pages/Simulador.tsx`
- Modify: `src/lib/routes.ts` (`simulador: "/simulador"`), `src/App.tsx` (ruta lazy, `TITULOS`, agregar a `aterrizaje`), `package.json`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces:
  ```ts
  // bucle.ts (puro)
  export const DT = 0.02;
  export function pasosPendientes(acumulado: number, dtReal: number): { pasos: number; resto: number }; // dtReal acotado a 0.1 s
  export type Sim = { e: Estado; mandos: Mandos; ap: EstadoAp; sel: Selecciones; radios: { com1: [number, number]; nav1: [number, number]; nav2: [number, number]; obs: number }; fuente: "vor" | "gps"; gps: { lat: number; lon: number; ident: string } | null; viento: Viento; pausa: boolean; t: number };
  export function avanzar(s: Sim, teclas: Teclas, vors: Vor[], suelo: (lat: number, lon: number) => number | null, sueloRespaldoFt: number, decl: number): Sim; // un paso de DT
  export function inicio(lugar: { lat: number; lon: number; elevFt: number; rumboV: number }, enElAire?: { vor: Vor; distNm: number; altFt: number }): Sim;
  // useSimulador.ts
  export function useSimulador(datos: DatosPais | null, arranque: Parameters<typeof inicio> | null): { leer: () => Sim; usar: <T>(sel: (s: Sim) => T) => T; accion: (f: (s: Sim) => Sim) => void };
  ```
  - `avanzar` hace, en orden: mandos → objetivos → `pilotar` → `paso` → nada más (las radios se leen en la UI con `recibirNav`). `decl` es la del VOR más cercano al punto de inicio, marcado `// ponytail:` (la declinación cambia poco en el área de práctica; si se vuela lejos, recalcular con el VOR más cercano).
  - El bucle (`requestAnimationFrame`) usa `pasosPendientes` y **pausa con `document.hidden`**. `usar` es `useSyncExternalStore` con avisos limitados a 30 por segundo.
  - **ElegirLugar:** select de país (de `paises.json`, nombres con `Intl.DisplayNames`, MX primero), buscador (`buscar`), y lista de VOR y aeropuertos con frecuencia y DME. Opciones: «En la plataforma» (aeropuerto o helipuerto) o «En el aire» (10 NM del VOR, 3,000 ft sobre el suelo, rumbo al VOR), y viento (dirección y velocidad, por defecto calma). El último país elegido se guarda en `localStorage` con try/catch.
  - **Controles:** el teclado escucha `keydown`/`keyup` en `window`, salvo si el foco está en un input. El ratón captura con Pointer Lock al hacer clic en la vista 3D; Esc suelta. En táctil hay dos palancas en pantalla: a la izquierda el colectivo (vertical) y los pedales (horizontal); a la derecha el cíclico. Una ayuda plegable muestra las teclas. Botones: pausa y reiniciar.
  - **Layout:** en `lg:` y más ancho, la maqueta D: columna izquierda con `VistaSintetica`+`Pfd` arriba (16:9) y `HsiSim` abajo; columna derecha con `PanelAp`, `Navegador` y `Radios`. Más angosto, la maqueta B: tiras de IAS/ALT/VS arriba, `HsiSim` al centro, la vista 3D pequeña arriba (o plana) y las palancas táctiles a los lados; `PanelAp` y `Radios` en pestañas abajo.
  - Atribución de datos en el pie de la cabina.

- [ ] **Step 1: Write the failing tests** (`bucle.test.ts`):
  - `pasosPendientes(0, 5)` → `{ pasos: 5, resto: 0 }` (5 s se acotan a 0.1 s = 5 pasos).
  - `pasosPendientes(0.015, 0.01)` → `{ pasos: 1, resto: 0.005 }`.
  - `inicio(gdl)` está en tierra. 200 llamadas a `avanzar` sin teclas → sigue en tierra en la misma posición (±10 m).
  - `inicio(..., { vor, distNm: 10, altFt: 8000 })` queda a 10 ±0.1 NM del VOR con rumbo hacia él (±1°).
  - Con `suelo` que siempre da `null`, el suelo es `sueloRespaldoFt`.
- [ ] **Step 2:** correr → FAIL. **Step 3:** implementar `bucle.ts`. **Step 4:** correr → PASS.
- [ ] **Step 5:** implementar `useSimulador`, `ElegirLugar`, `Controles`, `Simulador.tsx`, la ruta, el título «Simulador H135 gratis en el navegador — Villanueva Aviation» y `aterrizaje`.
- [ ] **Step 6:** `npm test`, `npx tsc -b` y `npm run lint` → sin errores ni fallas nuevas.
- [ ] **Step 7: Commit** `Add the /simulador page with location picker and controls`.

### Task 9: Verificación en el navegador y ajuste fino

**Files:** los que haga falta ajustar. Sin archivos nuevos.

- [ ] **Step 1:** levantar el servidor de desarrollo (`.claude/launch.json`, `npm run dev`) y abrir `/simulador` en la vista previa.
- [ ] **Step 2:** MX → GDL «En la plataforma». Despegar con PageUp, acelerar con ↑ a 110 kt, subir a 8,000 ft. Se ven los cerros alrededor de Guadalajara y no hay errores en la consola.
- [ ] **Step 3:** NAV1 en la frecuencia de GDL, CRS 090, interceptar a mano. La barra del HSI y el TO/FROM coinciden con la posición del Navegador. Repetir con AP: HDG, luego NAV. Captura sin pasarse más de un punto.
- [ ] **Step 4:** ALT, ALTA a 9,000 con VS 1,000, IAS 90. Mover el cíclico con AP: desconecta con aviso.
- [ ] **Step 5:** ES → Burgos (o Valladolid) «En el aire». Directo GPS a un aeropuerto: la aguja magenta y NAV con fuente GPS funcionan.
- [ ] **Step 6:** vista de celular (375×812) en la vista previa: maqueta B, palancas táctiles visibles y nada se sale de la pantalla. Medir cuadros por segundo con `performance.now` en la consola: ≥30 en escritorio.
- [ ] **Step 7:** apagar la red en el panel de red, recargar y volar: cielo y tierra planos y el resto sigue funcionando.
- [ ] **Step 8:** ajustar las cifras de `ficha.ts` o las ganancias del AP si algo se siente fuera (sin aflojar pruebas). Commit `Tune the simulator after the live check`.
- [ ] **Step 9:** pedirle a Erik que lo pruebe con la vista previa de Cloudflare de la rama. El push de la rama necesita su OK explícito.
