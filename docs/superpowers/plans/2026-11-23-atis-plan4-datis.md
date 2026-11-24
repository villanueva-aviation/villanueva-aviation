# Programa ATIS, plan 4: D-ATIS real de EE. UU. — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En los ~76 aeropuertos de EE. UU. con D-ATIS, sin controlador en la red, sonar el D-ATIS real completo: piezas para lo que ya tiene pieza y voz en vivo de Azure para lo demás.

**Architecture:** Un módulo puro (`datis.ts`) lee el D-ATIS de atis.info y arma un `Atis` reusando el armado FAA del plan 3; lo que no tiene pieza queda como partes «en vivo». Dos Functions de Cloudflare: `/api/atis/real` (el D-ATIS del aeropuerto, caché 60 s) y `/api/atis/voz` (convierte con Azure **solo** texto sacado del propio D-ATIS, verificado por hash, guardado 3 h). La página elige D-ATIS donde hoy elegiría el generado y el motor de audio acepta piezas con URL propia.

**Tech Stack:** TypeScript (Vite/React), Cloudflare Pages Functions (compiladas con el esbuild de wrangler 3), Web Audio, Azure Speech REST, C# (.NET Framework, SimConnect) para el lector.

**Spec:** `docs/superpowers/specs/2026-11-23-atis-plan4-datis-design.md`

## Global Constraints

- Fuente: `https://atis.info/api/all` (una sola consulta, caché de Cloudflare 60 s, user-agent `VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)`). No oficial.
- Entrada: `{ airport, type: "combined"|"arr"|"dep", code, datis, time: "HHMM", updatedAt }`. `updatedAt` **no** sirve para vigencia.
- Vigente: hora de emisión `time` (Zulu, se lee contra la hora UTC actual con cambio de día) de hace **menos de 90 min**.
- Voz en vivo: `en-US-ChristopherNeural`, `<prosody rate="-8%">`, `X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3`, `https://{region}.tts.speech.microsoft.com/cognitiveservices/v1` (como `tools/atis-piezas/generar.ts`).
- Secretos `AZURE_SPEECH_KEY` y `AZURE_SPEECH_REGION` solo en Cloudflare Pages; los pone Erik. Nunca en el navegador ni en el repo. Ninguna prueba llama a Azure ni a atis.info.
- La función de voz solo convierte texto que ella misma sacó del D-ATIS; `h` (hash del texto normalizado) debe coincidir o responde 404.
- Caché de la voz: `caches.default`, 3 h. Espera de la página por la voz en vivo: 8 s.
- El D-ATIS suena **en inglés** aunque la página esté en español.
- Etiqueta: «ATIS real (D-ATIS)» / «Real ATIS (D-ATIS)». Sigue «Solo para simulación»; nunca «oficial» ni «certificado». Sigue solo fundador (`ACCESO_ATIS`).
- Las reglas de red mandan primero: el D-ATIS solo entra donde hoy entraría el ATIS generado.
- Functions: sin `with { type: "json" }` (wrangler 3).
- Pruebas: `npm test` (node --test). Cada archivo de prueba nuevo se agrega a la lista del script `test` en `package.json`. Typecheck: `npx tsc -b`.
- Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nunca `git stash` a secas. Nada de push ni merge sin OK de Erik.
- Nunca correr el lector contra MSFS sin OK de Erik. El lector se recompila con `python -I tools/atis-lector/build.py` solo con el lector cerrado.

## Decisiones del plan (frente al diseño)

- **Ruling:** las frases de aproximación y pista (`APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L. DEPG RY 31L.`) van **enteras** a voz en vivo, no partidas en pieza + vivo — partir una frase a la mitad suena cortado y duplicaría la pista — costo: unos caracteres más de Azure.
- **Ruling:** el `RMK` del METAR del D-ATIS (`AO2 SLP213 T01720106`) **no** se dice: son códigos de máquina que la voz real tampoco lee; queda «Solo en texto» — costo: si algún RMK sí tuviera sentido hablado, no suena.
- **Ruling:** en local, el proxy de Vite `/api/atis` apunta a la vista previa de la rama (`https://programa-atis.villanueva-aviation.pages.dev`), porque las funciones nuevas no existen en producción hasta el merge — costo: en local, la red se consulta en la vista previa en lugar de producción.

## Review Focus

1. Un D-ATIS con forma rara (`SPECIAL` en el encabezado, `NOTAMS, .` vacío, sin METAR, ` . ` sueltos): `armarDatis` no lanza y nada con contenido se pierde → prueba sobre **las 89 entradas** de la muestra (Task 3).
2. El ATIS cambia (otra letra o el mismo con otro texto) entre que la página lo arma y pide la voz → 404 por hash, nunca avisos de otro ATIS (Task 4).
3. Azure sin secretos, 429 o caído → 503 y la página sigue con piezas, ese segmento «Solo en texto» (Tasks 4 y 6).
4. Abreviaturas locales que no están en la lista (`HDSRT`, `INSTXNS`, `TRSN`): se mandan tal cual; las de la lista nunca llegan a Azure como abreviatura → prueba sobre la muestra (Task 2).
5. Con controlador en la red el D-ATIS no suena; con la fuente caída suena el generado (Task 6).

---

### Task 1: Leer el D-ATIS (`datis.ts`) y la muestra real

**Files:**
- Create: `src/features/atis/datis.ts`, `src/features/atis/datis.test.ts`
- Ya existe: `src/features/atis/datis.muestra.json` (89 entradas reales de `/api/all`, 2026-11-24 ~0531Z)
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces:
  - `export type EntradaDatis = { airport: string; type: "combined" | "arr" | "dep"; code: string; datis: string; time: string; updatedAt: string }`
  - `export type DatisLeido = { letra: string; hora: string; especial: boolean; metar: string | null; rmk: string | null; resto: string[] }` — `metar`: el bloque del clima sin estación ni fecha, sin `RMK` y sin el `(THREE ZERO …)`; `resto`: las oraciones entre el METAR y el cierre, en orden, sin vacías (`NOTAMS, .` queda como `NOTAMS`; los `.` sueltos se quitan).
  - `export function leerDatis(e: EntradaDatis): DatisLeido`
  - `export function vigenteDatis(e: EntradaDatis, ahoraMs: number): boolean`
  - `export function emitidoMs(time: string, ahoraMs: number): number` — la hora `HHMM` Zulu más reciente que no esté en el futuro (cambio de día).
  - `export function datisPara(entradas: EntradaDatis[], nombreFrec: string | null): EntradaDatis | null` — `combined` si existe; si no, `dep` cuando `nombreFrec` contiene `DEP`, si no `arr`.
  - `export function huella(texto: string): string` — FNV-1a de 32 bits en hex de 8 caracteres (síncrono: lo usan la página y la Function).

- [ ] **Step 1: Pruebas que fallan** en `datis.test.ts`:

```ts
const KJFK: EntradaDatis = { airport: "KJFK", type: "combined", code: "H", time: "0451", updatedAt: "2026-11-24T05:26:29Z",
  datis: "JFK ATIS INFO H 0451Z. 35011G22KT 10SM BKN095 BKN120 11/M01 A3008 (THREE ZERO ZERO EIGHT). APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L. DEPG RY 31L. NOTAMS, . RWY 4R, 22L CLSD. RY 31L PAPI OTS. NUM CRANES OPERATING AT JFK. BIRD ACTIVITY VICINITY ARPT. READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS. ...ADVS YOU HAVE INFO H." };

test("leerDatis: encabezado, METAR y resto de KJFK", () => {
  const l = leerDatis(KJFK);
  assert.equal(l.letra, "H"); assert.equal(l.hora, "0451"); assert.equal(l.especial, false);
  assert.equal(l.metar, "35011G22KT 10SM BKN095 BKN120 11/M01 A3008");
  assert.equal(l.rmk, null);
  assert.deepEqual(l.resto, ["APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L.", "DEPG RY 31L.", "NOTAMS.", "RWY 4R, 22L CLSD.",
    "RY 31L PAPI OTS.", "NUM CRANES OPERATING AT JFK.", "BIRD ACTIVITY VICINITY ARPT.", "READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS."]);
});
test("leerDatis: RMK aparte y encabezado SPECIAL", () => { /* KLAX y KDTW dep de la muestra: rmk "AO2 SLP213 T01720106", especial true */ });
test("leerDatis: las 89 entradas de la muestra tienen letra igual a code, hora igual a time y METAR con altímetro", () => {
  for (const e of muestra) { const l = leerDatis(e); assert.equal(l.letra, e.code); assert.equal(l.hora, e.time); assert.match(l.metar ?? "", /\bA\d{4}$/); }
});
test("vigenteDatis: 89 min sí, 91 no; 2350 emitido visto a las 0010 del día siguiente vale", () => { … });
test("datisPara: combined gana; DEP en el nombre da dep; otro nombre o null da arr", () => { … });
test("huella: estable y distinta con un carácter de diferencia", () => {
  assert.equal(huella("ABC"), huella("ABC")); assert.notEqual(huella("ABC"), huella("ABD")); assert.match(huella("x"), /^[0-9a-f]{8}$/);
});
```

- [ ] **Step 2:** `npm test` → falla (no existe `datis.ts`).
- [ ] **Step 3:** Implementar en `datis.ts`. Encabezado: `^\w{3} (?:ATIS|ARR|DEP) INFO ([A-Z]) (\d{4})Z( SPECIAL)?\.`; cierre: `\.{0,3}\s*ADVS YOU HAVE INFO [A-Z]\.?\s*$`; el METAR va del encabezado al final de la oración que contiene `A\d{4}` (si no hay altímetro: `metar` null y todo va a `resto`). Si el encabezado no casa, `letra`/`hora` salen de `code`/`time`.
- [ ] **Step 4:** `npm test` → pasa. `npx tsc -b` limpio.
- [ ] **Step 5:** Commit `Read the real US D-ATIS into header, METAR and sentences`.

### Task 2: Decirlo en palabras (`hablado.ts`)

**Files:**
- Create: `src/features/atis/hablado.ts`, `src/features/atis/hablado.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `export function hablado(texto: string): string` — texto listo para Azure; `export const CONTRACCIONES: Record<string, string>`.

- [ ] **Step 1: Pruebas que fallan:**

```ts
test("hablado: pistas, contracciones y calles", () => {
  assert.equal(hablado("RY 31L PAPI OTS."), "Runway three one left PAPI out of service.");
  assert.equal(hablado("RWY 4R, 22L CLSD."), "Runway four right, two two left closed.");
  assert.equal(hablado("BIRD ACTIVITY VICINITY ARPT."), "Bird activity vicinity airport.");
  assert.equal(hablado("TWY B CLSD BTN TWY A AND TWY C."), "Taxiway Bravo closed between taxiway Alpha and taxiway Charlie.");
  assert.equal(hablado("CTC L A GC ON 121.75 FOR PUSH."), "Contact L A ground control on one two one point seven five for push.");
  assert.equal(hablado("APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L."), "Approach in use I L S runway three one right, visual approach runway three one left.");
  assert.equal(hablado("-SN"), "Light snow.");
});
test("hablado: en las 89 entradas de la muestra no queda ninguna contracción de la lista", () => {
  for (const e of muestra) for (const o of leerDatis(e).resto) {
    const fuera = hablado(o).split(/[\s,.]+/).filter((w) => w.toUpperCase() in CONTRACCIONES && w === w.toUpperCase());
    assert.deepEqual(fuera, [], `${e.airport}: ${o}`);
  }
});
```

- [ ] **Step 2:** `npm test` → falla.
- [ ] **Step 3:** Implementar. Reglas, en este orden: `RY`/`RWY`/`RWYS` + ident → «runway(s)» + dígitos en palabras inglesas (`niner` no: Azure dice «nine»; usar `one … nine`) + `left/right/center`; idents sueltos tras coma en una lista de pistas también; `TWY X` y letras sueltas tras `TWY`/`TWYS` → alfabeto (`LETRAS` de `frases.ts`); frecuencias `\d{3}\.\d{1,3}` → dígitos + «point»; códigos de tiempo con `WX` de `frases.ts` (en inglés) y los que falten (`SN`, `-SN`, `+SN`, `FZRA`, `FZDZ`, `PL`, `GR`, `DZ`, `SG`, `UP`, `BLSN`, `FZFG`) agregados aquí; siglas de varias letras conocidas que se deletrean (`ILS`, `RNAV`→«R NAV», `GPS`, `VOR`, `DME`, `PAPI`, `VASI`, `ALS`, `LLWAS` tal cual); contracciones FAA (base JO 7340.2, al menos todas las que aparecen en la muestra: `APCH`, `APCHS`, `ARPT`, `CLSD`, `OTS`, `VCNTY`, `VICINITY`, `DEPG`, `DEP`, `ARR`, `INST`, `INSTR`, `SIMUL`, `NUM`, `CTC`, `GC`, `CD`, `TWR`, `FREQ`, `ACFT`, `ALT`, `ASSGN`, `BTN`, `CLNC`, `DLVRY`, `GND`, `HLDG`, `INFO`, `INTXN`, `ISNS`, `INSTXNS`, `HDSRT`, `LCL`, `LGT`, `MIN`, `N/S/E/W`, `NE/NW/SE/SW`, `PARL`, `PROC`, `RCVD`, `RQRD`, `TRSN`, `TFC`, `UNAVBL`, `ADVS`, `PSBL`, `ADJ`, `PRCTN`, `CONST`, `EQUIP`); números sueltos de altura (`3000` → «three thousand») como el ATIS FAA. Lo que no esté en la lista pasa tal cual. Las palabras que salen de la lista van en minúsculas (salvo el alfabeto, que va como en `LETRAS`); las siglas y lo que pasa tal cual conservan su forma; mayúscula al inicio de cada oración.
- [ ] **Step 4:** `npm test` → pasa (ajustar la lista hasta que la prueba de las 89 entradas pase sin quitar casos).
- [ ] **Step 5:** Commit `Turn D-ATIS abbreviations into spoken words`.

### Task 3: Armar el ATIS real (`armarDatis`)

**Files:**
- Modify: `src/features/atis/datis.ts`, `src/features/atis/datis.test.ts`, `src/features/atis/generado.ts` (tipos), `src/features/atis/frases.ts` (tipo `Pieza`), `src/features/atis/radio.ts` (`debeCambiar`), `src/features/atis/radio.test.ts`

**Interfaces:**
- Consumes: `leerDatis`, `emitidoMs`, `huella` (Task 1); `hablado` (Task 2); `armarAtis` y `DatosRed` (existentes).
- Produces:
  - `Pieza` gana `url?: string` (si está, el audio sale de esa URL y no de `/atis/piezas/`).
  - `Parte` gana `vivo?: string` (el texto normalizado que se manda a Azure). `TipoParte` gana `"avisos"`.
  - `Atis` gana `real?: boolean` y `huella?: string` (huella del texto `datis` completo).
  - `export function metarDeTexto(icao: string, emitido: number, cuerpo: string): Metar` — `rawOb` = `${icao} ${DDHHMM}Z ${cuerpo}`; llena `obsTime`, `wdir` (número o `"VRB"`), `wspd`, `wgst`, `visib` (`"10SM"` → `"10"`, `"1 1/2SM"` → `"1 1/2"`), `wxString`, `clouds`, `temp`, `dewp`, `altim` (hPa = inHg × 33.8639), `elev: null`.
  - `export function armarDatis(e: EntradaDatis, ap: AeropuertoAtis | null, ahoraMs: number): Atis` — con `ap` null usa un aeropuerto mínimo (`nombreEs`/`nombreEn` null, sin pistas): así la Function obtiene **las mismas** partes en vivo que la página.
  - `export function vivosDe(atis: Atis): { n: number; texto: string; h: string }[]` — las partes con `vivo`, en orden, `h = huella(texto)`.
  - `export const urlVoz = (icao: string, tipo: string, n: number, h: string) => \`/api/atis/voz?icao=${icao}&tipo=${tipo}&n=${n}&h=${h}\``
- `debeCambiar` también compara `!!real` y `huella`.

- [ ] **Step 1: Pruebas que fallan:**

```ts
test("armarDatis KJFK: letra y hora de la fuente, clima con piezas, avisos en vivo antes del cierre", () => {
  const a = armarDatis(KJFK, AP_KJFK, Date.parse("2026-11-24T05:30:00Z"));
  assert.equal(a.letra, "H"); assert.equal(a.real, true); assert.equal(a.huella, huella(KJFK.datis));
  assert.ok(a.partes.find((p) => p.tipo === "letra")!.piezas.some((x) => x.clave === "letra-H"));
  assert.ok(a.partes.some((p) => p.tipo === "viento" && !p.vivo && p.piezas.length > 0));
  const vivos = vivosDe(a);
  assert.equal(vivos[0].texto, "Approach in use I L S runway three one right, visual approach runway three one left.");
  assert.equal(a.partes.at(-1)!.tipo, "cierre");
  assert.ok(!a.partes.some((p) => p.tipo === "pista" && !p.vivo)); // la pista no se dice dos veces
  for (const p of a.partes.filter((x) => x.vivo)) assert.equal(p.piezas[0].url, urlVoz("KJFK", "combined", vivosDe(a).find((v) => v.texto === p.vivo)!.n, huella(p.vivo!)));
});
test("armarDatis: con ap null da los mismos vivos que con ap", () => {
  const t = Date.parse("2026-11-24T05:30:00Z");
  assert.deepEqual(vivosDe(armarDatis(KJFK, null, t)), vivosDe(armarDatis(KJFK, AP_KJFK, t)));
});
test("armarDatis: el RMK queda solo en texto y nada más", () => { /* KLAX: una parte soloTexto con "AO2 SLP213 T01720106"; ninguna otra soloTexto */ });
test("armarDatis: las 89 entradas arman sin lanzar y ninguna parte con contenido queda soloTexto salvo el RMK", () => { … });
test("armarDatis: un código de tiempo sin pieza (-SN) va a voz en vivo", () => { … });
test("debeCambiar: misma letra con otra huella cambia", () => { … }); // en radio.test.ts
```

- [ ] **Step 2:** `npm test` → falla.
- [ ] **Step 3:** Implementar: `metarDeTexto` del cuerpo; `armarAtis(metar, ap, { deRed: { letra: e.code, pista: null, salida: null, tl: null, taFt: null } })` (sin pista: la frase real va en vivo); cada parte `soloTexto` del armado (nunca hay RMK porque no se le pasa) pasa a parte en vivo; `resto` → una parte `"avisos"` en vivo por oración, insertadas antes del `"cierre"`; luego una parte `soloTexto` de `"observaciones"` con el RMK si hay. Parte en vivo: `{ tipo, idioma: "en", texto: <texto original>, vivo: hablado(texto), piezas: [{ idioma: "en", clave: \`vivo-${n}\`, url: urlVoz(...) }] }`. `inicioMs = emitidoMs(e.time, ahoraMs)`. `tipo` de la URL = `e.type`.
- [ ] **Step 4:** `npm test` → pasa; `npx tsc -b` limpio.
- [ ] **Step 5:** Commit `Assemble the real D-ATIS with pieces and live-voice parts`.

### Task 4: Functions `/api/atis/real` y `/api/atis/voz`

**Files:**
- Create: `src/features/atis/fuenteDatis.ts` (bajar el feed, compartido), `functions/api/atis/real.ts`, `functions/api/atis/voz.ts`, `src/features/atis/datisFuncion.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces:
  - `export async function bajarDatis(): Promise<EntradaDatis[]>` — `fetch` con `cf: { cacheTtl: 60, cacheEverything: true }` y el user-agent; lanza si no es 2xx.
  - `real.ts`: `export const onRequestGet = async ({ request }) => Response` — `?icao=` (`^[A-Z0-9]{3,4}$`, si no 400); 200 con las entradas del ICAO (`[]` si no tiene), `cache-control: public, max-age=60`; 502 si la fuente falla.
  - `voz.ts`: `export const onRequestGet = async ({ request, env }) => Response` y, para probarla, `export async function responderVoz(q: URLSearchParams, env: { AZURE_SPEECH_KEY?: string; AZURE_SPEECH_REGION?: string }, deps: { bajar: () => Promise<EntradaDatis[]>; sintetizar: (texto: string, env) => Promise<ArrayBuffer>; cache: Pick<Cache, "match" | "put"> }): Promise<Response>`.
- Flujo de `voz`: validar `icao`, `tipo ∈ combined|arr|dep`, `n` entero ≥ 0, `h` `^[0-9a-f]{8}$` (si no, 400) → buscar en caché por `https://cache.local/atis-voz/${icao}/${tipo}/${h}` → bajar el feed, `armarDatis(entrada, null, Date.now())`, `vivosDe(...)[n]`; si no existe o su `h` no coincide → 404 → sin secretos → 503 → `sintetizar` (SSML del Global Constraints, texto escapado) → falla o no 2xx → 503 → `audio/mpeg`, `cache-control: public, max-age=10800`, guardado en caché.

- [ ] **Step 1: Pruebas que fallan** (`datisFuncion.test.ts`, con `fetch` y `deps` falsos, como `redFuncion.test.ts`):
  - `real`: ICAO raro → 400; KJFK con la muestra → 200 y 1 entrada; ICAO sin D-ATIS → `[]`; fuente que falla → 502.
  - `voz`: `n` y `h` correctos → 200 `audio/mpeg` y `sintetizar` recibió exactamente `vivosDe(armarDatis(KJFK, null, …))[0].texto`; `h` de otro texto → 404 y `sintetizar` no se llamó; `n` fuera de rango → 404; sin secretos → 503; `sintetizar` que lanza → 503; segunda llamada igual → sale de la caché (`sintetizar` llamado una vez); `tipo=xyz` → 400.
- [ ] **Step 2:** `npm test` → falla.
- [ ] **Step 3:** Implementar. `onRequestGet` de `voz` usa `caches.default` y un `sintetizar` real con `fetch` a Azure (`Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`, el formato de salida). Comprobar que compila como en Cloudflare: `npx -y wrangler@3 pages functions build --outdir <scratchpad>` sin errores.
- [ ] **Step 4:** `npm test` → pasa; `npx tsc -b` limpio.
- [ ] **Step 5:** Commit `Serve the real D-ATIS and its live voice from Cloudflare`.

### Task 5: El lector manda el nombre de cada frecuencia ATIS

**Files:**
- Modify: `tools/atis-lector/LectorAtis.cs`, `src/features/atis/useLectorAtis.ts` (`AeropuertoSim`), `src/features/atis/datos.ts` (`AeropuertoAtis`), `src/features/atis/datis.ts`, `src/features/atis/datis.test.ts`

**Interfaces:**
- Produces: JSON de `/aeropuertos` con `"atisNombres": [...]` alineado con `atisMhz`. `AeropuertoSim` y `AeropuertoAtis` ganan `atisNombres?: string[]`. `export function nombreFrecuencia(ap: AeropuertoAtis, mhz: number): string | null` en `datis.ts` (misma tolerancia de 5 kHz que `sintonizado`).

- [ ] **Step 1:** Prueba que falla de `nombreFrecuencia` (128.075 → `"ATIS DEP"`; frecuencia que no está o sin `atisNombres` → null). En `--probar`, actualizar el JSON esperado de MMGL simulado con `"atisNombres": ["ATIS"]`.
- [ ] **Step 2:** `npm test` → falla.
- [ ] **Step 3:** En C#: `Aeropuerto.Nombres` (`List<string>`) se llena junto a `Mhz` en `OnRecvFacilityData` (`FrecFac.Nombre`, recortado); `Json` lo escribe con `Texto()`; el volcado no cambia. En TS: `nombreFrecuencia`.
- [ ] **Step 4:** `npm test` pasa. Compilar a una carpeta temporal (no a `out/`, el lector puede estar abierto) y correr `--probar`: todas OK, código 0. Con el lector cerrado (preguntar a Erik): `python -I tools/atis-lector/build.py`.
- [ ] **Step 5:** Commit `Send each ATIS frequency name from the reader`.

### Task 6: La página y el audio

**Files:**
- Modify: `src/features/atis/motorAudio.ts`, `src/pages/AtisPrograma.tsx`, `vite.config.ts`

**Interfaces:**
- Consumes: `armarDatis`, `datisPara`, `vigenteDatis`, `nombreFrecuencia`, `EntradaDatis` (Tasks 1, 3, 5).
- Produces: nada que use otra tarea.

- [ ] **Step 1:** `motorAudio.ts`: `urlDe(p) = p.url ?? /atis/piezas/...`; las piezas con `url` se piden con `AbortSignal.timeout(8000)`; tras una pieza con `url` la pausa es la de fin de oración (`pausaTras(".")`). Una que falla queda en `faltantes` con su clave `vivo-n` (y no se guarda en la caché, como hoy).
- [ ] **Step 2:** `AtisPrograma.tsx`:
  - `realDe(icao)` igual que `redDe`: pide `/api/atis/real?icao=` la primera vez y cada 60 s; guarda la última respuesta y si falló.
  - Solo para aeropuertos con `formatoDe(icao) === "faa"` y `origen === "generado"`: mientras no llega la primera respuesta, silencio («Consultando…», como la red); con respuesta, `datisPara(entradas, nombreFrecuencia(ap, com.mhz))`; si es vigente → `armarDatis(entrada, ap, Date.now())`, `origen` de la vista `"real"`; si no, o la fuente falló → `armarAtis` (generado) como hoy.
  - `clave()` incluye `real` y `huella`. La regla de «siguiente que llegó tarde» también compara `real`.
  - Reintento: si el ATIS que suena tiene en `faltantes` alguna clave `vivo-` y pasaron 15 s desde el último intento (`Canal.reintentoMs`), se vuelve a cargar el mismo ATIS; entra en la pausa del loop por el mecanismo de `siguiente`.
  - Vista: etiqueta `T.real` («ATIS real (D-ATIS)» / «Real ATIS (D-ATIS)») en lugar de «Generado del METAR…»; las partes en vivo que faltan se ven con `T.soloTexto`; las claves `vivo-` no salen en «Falta audio».
- [ ] **Step 3:** `vite.config.ts`: el proxy `/api/atis` apunta a `https://programa-atis.villanueva-aviation.pages.dev` (ver Decisiones del plan), con comentario.
- [ ] **Step 4:** `npm test` y `npx tsc -b` limpios; `npx vite build` sin errores.
- [ ] **Step 5:** Commit `Play the real D-ATIS on the ATIS page`.

### Task 7: Prueba en vivo con Erik (puerta del merge)

- [ ] **Step 1:** Erik pone `AZURE_SPEECH_KEY` y `AZURE_SPEECH_REGION` (eastus) en Cloudflare Pages → Settings → Variables and Secrets, para **Production y Preview** (como secretos). Claude da los pasos y nunca ve la clave.
- [ ] **Step 2:** Con OK de Erik: push de `programa-atis`; esperar la vista previa; comprobar `GET https://programa-atis.villanueva-aviation.pages.dev/api/atis/real?icao=KJFK` → 200 con entradas.
- [ ] **Step 3:** Erik en MSFS en **KLAX** (combined) con «Abrir en local.cmd», Sin red: sintoniza el ATIS; debe sonar la letra real (compararla con atis.info), el clima y los avisos con la misma voz y radio. Revisar el oído: uniones pieza ↔ vivo.
- [ ] **Step 4:** **KATL** (arr/dep): anotar qué nombres trae MSFS en `atisNombres` y si cada frecuencia suena el que le toca; si no traen `DEP`, anotarlo (suenan `arr`).
- [ ] **Step 5:** Un aeropuerto FAA **sin** D-ATIS (p. ej. KSMO): sigue el generado. Con IVAO/VATSIM y controlador: el D-ATIS no suena.
- [ ] **Step 6:** Anotar resultados; merge a main solo con OK explícito de Erik.
