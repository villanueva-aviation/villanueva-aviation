# ATIS de VATSIM textual (EE. UU.): plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En EE. UU., con VATSIM elegido y «Leer en voz» encendido, decir el ATIS de texto de la estación de VATSIM completo, igual que el D-ATIS del plan 4. En cualquier región, elegir la estación de llegadas o salidas según la frecuencia sintonizada.

**Architecture:**
- El texto de VATSIM se normaliza a una `EntradaDatis` con encabezado de D-ATIS y pasa por la misma `armarDatis` del plan 4. Las URLs de voz llevan `red=vatsim&cs=<callsign>`.
- `estadoVatsim` publica todas las estaciones ATIS del aeropuerto, y `estacionPara` elige la de la frecuencia.
- `/api/atis/voz` con `red=vatsim` baja el feed de VATSIM, rearma el ATIS y compara la huella.

**Tech Stack:** TypeScript, React (Vite), Cloudflare Pages Functions, `node --test` con `--experimental-strip-types` (`npm test`, NO vitest).

**Spec:** `docs/superpowers/specs/2026-11-25-atis-plan5-vatsim-textual-design.md`

## Global Constraints

- Solo aeropuertos con `formatoDe(icao) === "faa"` se leen textual. Fuera de EE. UU. solo cambia qué estación se elige.
- Las reglas de «se puede leer» viven en **una sola función**, que usan la página y la función de voz. Un texto se puede leer solo si cumple todo esto:
  - trae letra (`atis_code`);
  - trae hora: el primer `\d{4}Z` seguido de espacios opcionales y un punto;
  - trae altímetro `\bA\d{4}\b`;
  - mide **≤ 1200** caracteres, contando los renglones unidos con un espacio.
- La función de voz **nunca** convierte texto que no sacó ella misma del feed y verificó con la huella. Con un callsign que no es del aeropuerto, `delAeropuerto(cs, icao)` falso, responde 404 sin bajar nada ni llamar a Azure.
- Con el interruptor «Leer en voz» apagado y ATIS de la red, la página **calla** como hoy.
- El ATIS de VATSIM **no** usa la vigencia de 90 min del D-ATIS. Vale con la regla de 2 min de la red (`estadoVigente`).
- Las pruebas y el código nunca llaman a Azure, a atis.info ni a VATSIM: todo se inyecta.
- Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nunca `git stash` a secas. No hacer push.
- Copia: nunca «oficial» ni «certificado».

## Review Focus

1. Una estación con frecuencia de relleno (`135.000`, `118.000`) en un aeropuerto con llegadas y salidas no debe poner el ATIS equivocado: debe caer a la regla de respaldo (combinada, luego tabla de salidas o nombre DEP). Lo cubre la Task 2.
2. El controlador cambia el texto pero no la letra: la página debe recargar el ATIS. Hoy `clave()` de un ATIS `deRed` no lleva huella, y el reintento descartaría la recarga. Lo cubre la Task 4.
3. KBZN escribe `0256Z .`, con un espacio antes del punto, y los cierres traen de 2 a 5 puntos (`....ADVS YOU HAVE INFO Z`). Ninguno debe romper la lectura ni dejar el cierre como aviso en vivo. Lo cubre la Task 1.
4. Un callsign de otro aeropuerto en la URL de voz (`cs=KJFK_ATIS&icao=KCVG`) no debe sintetizar nada. Lo cubre la Task 3.
5. Una estación que no se puede leer (más de 1200 caracteres o sin altímetro) debe quedarse con la lectura con piezas de hoy, no callar. Lo cubren la Task 1 (función) y la Task 4 (página).

---

### Task 1: Leer una estación de VATSIM como D-ATIS

**Files:**
- Modify: `src/features/atis/datis.ts`
- Test: `src/features/atis/datis.test.ts`
- Usa: `src/features/atis/vatsim.muestra.json`. Ya existe: `{ tomado, atis: VatsimEstacion[] }`, con 34 estaciones de EE. UU. (K…, PH…) y 4 de otros países (UIII, SABE, SADP, SADF).

**Interfaces:**
- Produces:
  - `export type AtisRed = { callsign: string; tipo: "combined" | "arr" | "dep"; mhz: number | null; lineas: string[]; letra: string | null }`. Se define en `src/features/atis/red.ts` (Task 2), pero esta task lo necesita primero: **créalo aquí en `red.ts`** con solo el tipo exportado.
  - `export function esFrecuenciaSalidas(icao: string, mhz: number | undefined, nombreFrec: string | null): boolean`. Es la regla que hoy vive dentro de `datisPara`: la frecuencia coincide con `ATIS_SALIDAS[icao]` dentro de `TOLERANCIA_MHZ`, o el nombre contiene `DEP`. `datisPara` pasa a usarla.
  - `export function entradaDeVatsim(icao: string, est: AtisRed): EntradaDatis | null`. Da `null` si no se puede leer. Si se puede, devuelve:
    - `airport: icao`, `type: est.tipo`, `code: letra`, `time: "HHMM"`, `updatedAt: ""`;
    - `datis`: `` `${icao.slice(1)} ATIS INFO ${letra} ${HHMM}Z. ${cuerpo}` ``, donde `cuerpo` es lo que sigue al punto después de la hora.
  - `export function armarVatsim(icao: string, est: AtisRed, ap: AeropuertoAtis | null, ahoraMs: number): Atis | null`. Hace `armarDatis` sobre `entradaDeVatsim`, con URLs de voz `urlVoz(icao, tipo, n, h, est.callsign)`. Devuelve el `Atis` con `deRed: true`, `real` quitado y la `huella` que ya trae.
  - `urlVoz(icao, tipo, n, h, cs?: string)`: con `cs` agrega `&red=vatsim&cs=${cs}`.
  - `armarDatis(e, ap, ahoraMs, cs?: string)`: pasa `cs` a `urlVoz`.

- [ ] **Step 1: Write the failing tests** in `datis.test.ts`. Usan la muestra; `est(x)` convierte un `VatsimEstacion` de la muestra en `AtisRed`: `tipo` por `_A_ATIS`/`_D_ATIS`, `mhz` = `Number(frequency)`.

```ts
test("entradaDeVatsim: las 34 estaciones de EE. UU. de la muestra se pueden leer y su encabezado queda como D-ATIS", () => {
  for (const x of usa) {
    const e = entradaDeVatsim(icaoDe(x.callsign), est(x));
    assert.ok(e, x.callsign);
    assert.match(e!.datis, /^\w{3} ATIS INFO [A-Z] \d{4}Z\. /);
    assert.equal(leerDatis(e!).letra, x.atis_code);
  }
});
test("entradaDeVatsim: KBZN «0256Z .» y Boston «INFORMATION Y. 0254Z.» dan hora y cuerpo con el METAR", () => {
  const bzn = entradaDeVatsim("KBZN", est(porCs("KBZN_ATIS")))!;
  assert.equal(bzn.time, "0256");
  assert.match(leerDatis(bzn).metar!, /^16004KT 9SM/);
  assert.equal(entradaDeVatsim("KBOS", est(porCs("KBOS_ATIS")))!.time, "0254");
});
test("entradaDeVatsim: sin letra, sin hora con punto, sin altímetro o con más de 1200 caracteres da null", () => {
  const base = est(porCs("KJFK_ATIS"));
  assert.equal(entradaDeVatsim("KJFK", { ...base, letra: null }), null);
  assert.equal(entradaDeVatsim("KJFK", { ...base, lineas: ["JFK ATIS INFO G 0251Z EXPECT ILS"] }), null);
  assert.equal(entradaDeVatsim("KJFK", { ...base, lineas: [base.lineas.join(" ").replace(/\bA\d{4}\b/, "")] }), null);
  assert.equal(entradaDeVatsim("KJFK", { ...base, lineas: [base.lineas.join(" ") + " X".repeat(700)] }), null);
  assert.equal(entradaDeVatsim("UIII", est(porCs("UIII_ATIS"))), null); // «0300Z EXPECT»: sin punto
});
test("armarVatsim: ningún cierre «..ADVS YOU HAVE INFO X» queda como aviso en vivo; URLs con red=vatsim y cs", () => {
  for (const x of usa) {
    const a = armarVatsim(icaoDe(x.callsign), est(x), null, AHORA)!;
    assert.ok(a.deRed && !a.real && a.huella, x.callsign);
    for (const p of a.partes) {
      assert.doesNotMatch(p.vivo ?? "", /you have info/i, x.callsign);
      for (const pz of p.piezas) if (pz.url) assert.match(pz.url, new RegExp(`&red=vatsim&cs=${x.callsign}$`));
    }
  }
});
test("armarVatsim: con ap null da los mismos vivos que con ap con pistas, en las 34 estaciones", () => { /* vivosDe iguales */ });
test("datisPara sigue igual con esFrecuenciaSalidas (KATL 125.55 dep, 119.65 arr)", () => { /* casos actuales de datisPara */ });
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, porque `entradaDeVatsim`, `armarVatsim` y `AtisRed` no existen.
- [ ] **Step 3: Implement.**
  - Cambia `CIERRE` a `/\.*\s*ADVS YOU HAVE INFO [A-Z]\.?\s*$/` (cualquier cantidad de puntos).
  - La hora sale de `/(\d{4})Z\s*\./`. Antes de medir los 1200 caracteres y de buscar el altímetro, une `lineas` con `" "`.
- [ ] **Step 4: Run** `npm test` and `npx tsc -b`. Expected: todo PASS, incluidas las pruebas del plan 4 (el D-ATIS no cambia).
- [ ] **Step 5: Commit** — `Read a VATSIM text ATIS as a D-ATIS (US): flexible header, 1200-char cap, altimeter required`.

### Task 2: Todas las estaciones ATIS de VATSIM y la de la frecuencia

**Files:**
- Modify: `src/features/atis/red.ts`
- Test: `src/features/atis/red.test.ts`, `src/features/atis/redFuncion.test.ts` (ajustar los `deepEqual`)

**Interfaces:**
- Consumes: `AtisRed` (Task 1) y `esFrecuenciaSalidas` (Task 1, en `datis.ts`).
- Produces:
  - `VatsimEstacion` gana `frequency?: string`.
  - `EstadoRed` gana `estaciones?: AtisRed[]`.
    - VATSIM: todas las estaciones `delAeropuerto(...) && callsign.endsWith("ATIS")`.
    - IVAO: no lo llena.
    - `atis` sigue existiendo: es la combinada si hay, si no la primera. `fuente()` no cambia.
  - `export function estacionPara(estaciones: AtisRed[] | undefined, icao: string, mhz: number, nombreFrec: string | null): AtisRed | null`. Elige en este orden:
    1. la estación cuyo `mhz` está a menos de `TOLERANCIA_MHZ` del COM;
    2. si no, la `combined`;
    3. si no, `dep` si `esFrecuenciaSalidas(icao, mhz, nombreFrec)`, y si no `arr`;
    4. si no hay de ese tipo, la primera;
    5. `null` si no hay estaciones.
  - `export` de `delAeropuerto` (la usará la función de voz).

- [ ] **Step 1: Write the failing tests**

```ts
test("VATSIM: KCVG_A_ATIS y KCVG_D_ATIS quedan las dos, con tipo y MHz", () => {
  const datos = { controllers: [], atis: [vat("KCVG_A_ATIS", 4, { frequency: "134.375", atis_code: "J", text_atis: ["A"] }), vat("KCVG_D_ATIS", 4, { frequency: "135.300", atis_code: "W", text_atis: ["D"] })] };
  const e = estadoVatsim(datos, [], { icao: "KCVG", lat: 39.05, lon: -84.66 });
  assert.deepEqual(e.estaciones!.map((s) => [s.callsign, s.tipo, s.mhz, s.letra]), [["KCVG_A_ATIS", "arr", 134.375, "J"], ["KCVG_D_ATIS", "dep", 135.3, "W"]]);
});
test("estacionPara: por la frecuencia publicada; con relleno, la tabla de salidas; combinada gana sin coincidencia", () => {
  const a = { callsign: "KATL_A_ATIS", tipo: "arr", mhz: 135.0, lineas: [], letra: "A" } as const;
  const d = { callsign: "KATL_D_ATIS", tipo: "dep", mhz: 135.0, lineas: [], letra: "D" } as const;
  assert.equal(estacionPara([a, d], "KATL", 125.55, "KATL"), d); // relleno 135.000: tabla ATIS_SALIDAS
  assert.equal(estacionPara([a, d], "KATL", 119.65, "KATL"), a);
  assert.equal(estacionPara([{ ...a, mhz: 119.65 }, { ...d, mhz: 125.55 }], "KATL", 125.55, null), d);
  const c = { callsign: "KBOS_ATIS", tipo: "combined", mhz: 135.0, lineas: [], letra: "Y" } as const;
  assert.equal(estacionPara([c], "KBOS", 135.0, null), c);
  assert.equal(estacionPara([], "KBOS", 135.0, null), null);
  assert.equal(estacionPara(undefined, "KBOS", 135.0, null), null);
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, porque no hay `estaciones` ni `estacionPara`.
- [ ] **Step 3: Implement.** `mhz` es `Number(frequency)`, o `null` si falta o no es número. Ajusta los `deepEqual` existentes de `estadoVatsim` para que incluyan `estaciones`.
- [ ] **Step 4: Run** `npm test` and `npx tsc -b`. Expected: PASS.
- [ ] **Step 5: Commit** — `Keep every VATSIM ATIS station of an airport and pick the one on the tuned frequency`.

### Task 3: La función de voz con fuente VATSIM

**Files:**
- Modify: `functions/api/atis/voz.ts`, `src/features/atis/fuenteDatis.ts`
- Test: `src/features/atis/datisFuncion.test.ts`

**Interfaces:**
- Consumes: `armarVatsim`, `vivosDe` (Task 1); `delAeropuerto`, `AtisRed`, `VatsimDatos` (Task 2).
- Produces:
  - `export async function bajarVatsim(): Promise<VatsimDatos["atis"]>` en `fuenteDatis.ts`. Baja `https://data.vatsim.net/v3/vatsim-data.json` con:
    - `user-agent` de `red.ts`;
    - `cf: { cacheTtl: 60, cacheEverything: true }`;
    - `AbortSignal.timeout(5000)`.

    Devuelve `.atis`.
  - `Deps` de `voz.ts` gana `bajarVatsim`.
  - Con `red=vatsim`, `responderVoz` exige `cs` con `/^[A-Z0-9_]{3,20}$/`; si no, 400. Luego:
    1. Si `!delAeropuerto(cs, icao)`, responde 404 **antes** de bajar nada.
    2. Busca la estación por callsign, la convierte en `AtisRed` (como `estadoVatsim`) y hace `armarVatsim(icao, est, null, Date.now())` y `vivosDe(...)[n]`.
    3. Si falta la estación, no se puede leer o la huella no coincide: 404.
    4. Si el feed falla: 502 `VATSIM no disponible`.

    Sin `red`, todo sigue como el plan 4. La llave de caché no cambia: `h` es la huella del texto hablado, así que el mismo audio sirve para las dos fuentes.

- [ ] **Step 1: Write the failing tests.** Inyecta `bajarVatsim` con las estaciones de `vatsim.muestra.json`.
  - `red=vatsim` con el `n`/`h` de `armarVatsim` para `KCVG_A_ATIS`: 200 `audio/mpeg`, y `sintetizar` recibe ese texto.
  - `cs=KJFK_ATIS&icao=KCVG`: 404, sin llamar a `bajarVatsim` ni a `sintetizar`.
  - `cs` que no está en el feed, o `h` ajeno: 404 sin sintetizar.
  - Estación con más de 1200 caracteres (modificada en la prueba): 404 sin sintetizar.
  - `bajarVatsim` lanza: 502.
  - `cs` con caracteres raros (`cs=KCVG_A_ATIS&x`): 400.
  - `bajarVatsim` lleva tiempo límite, igual que la prueba actual de `bajarDatis`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`, `npx tsc -b` y `npx vite build`. Expected: PASS. El build compila las Functions con wrangler 3: sin `with { type: "json" }`.
- [ ] **Step 5: Commit** — `Speak VATSIM ATIS parts only after re-deriving them from the VATSIM feed`.

### Task 4: La página

**Files:**
- Modify: `src/pages/AtisPrograma.tsx`

**Interfaces:**
- Consumes: `estacionPara`, `delAeropuerto` (Task 2); `armarVatsim` (Task 1); `nombreFrecuencia`, `formatoDe` (ya existen).

- [ ] **Step 1: Implement** en el bloque que hoy calcula `deRed` (≈ líneas 286–292 y 333):
  - `est = origen === "cliente" ? estacionPara(vigente!.estaciones, s.ap.icao, com.mhz, nombreFrecuencia(s.ap, com.mhz)) ?? vigente!.atis : null`. Con el tipo `EstadoRed["atis"]` basta con `lineas` y `letra`.
  - `textual = origen === "cliente" && leerVoz && red === "vatsim" && formatoDe(s.ap.icao) === "faa" && est && "callsign" in est ? armarVatsim(s.ap.icao, est, s.ap, Date.now()) : null`.
  - `deRed = origen === "cliente" && leerVoz && !textual ? datosDeRed(est!) : null`.
  - Calla para vPilot solo si `origen === "cliente" && !deRed && !textual`.
  - `nuevo = textual ?? (datis ? … : …)`, igual que hoy para lo demás.
  - El filtro de `siguiente` compara `!!c.siguiente.atis.deRed` con `!!(deRed || textual)`.
  - Lo mismo en la condición de `tocar` (≈ línea 320).
  - `atisRed` en la vista es `est` cuando `deRed || textual`, para que el texto mostrado sea el de la estación elegida. La etiqueta «Leído con la voz del programa» sale igual.
  - En el retorno de «calla para vPilot», `atisRed: est`.
  - `clave()`: el caso `deRed` pasa a `` `red-${a.huella ?? ""}` ``. Así un texto nuevo con la misma letra sí recarga, y el reintento no lo descarta (Review Focus 2).
- [ ] **Step 2: Run** `npm test`, `npx tsc -b` y `npx vite build`. Expected: PASS.
- [ ] **Step 3: Commit** — `Play the US VATSIM ATIS word for word on the page and use the station on the tuned frequency`.

### Task 5: Prueba en vivo con Erik (la hace el controlador, no un subagente)

- Push solo con OK de Erik. Revisar en el preview que `/api/atis/voz?…&red=vatsim&cs=…` dé 200 con un callsign en línea, y 404 con uno ajeno.
- El servidor local apunta su proxy `/api/atis` al preview mientras dura la prueba. Se regresa a producción como último commit.
- Pruebas en vivo en MSFS 2020 o 2024, buscando estaciones en línea en el feed justo antes:
  1. EE. UU. con una sola estación: se oye el texto completo.
  2. EE. UU. con llegadas y salidas: cada frecuencia da la suya, y el cambio corta al momento.
  3. Una estación de VATSIM fuera de EE. UU.: suena como hoy.
- Merge a main solo con OK de Erik.
