# Programa ATIS — Plan 2: redes IVAO y VATSIM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The pilot picks a network (IVAO, VATSIM or Sin red) on `/atis/programa`. The program then never contradicts that network's ATC:
- if the network has an ATIS for that airport, the program is silent and shows the network's ATIS text with «Escúchalo en tu cliente»;
- if the network has ATC there but no ATIS, it plays the generated ATIS without letter or runway and ends with «Confirme pista y QNH con el controlador»;
- if the network has no ATC there, it plays the generated ATIS as in plan 1.

**Architecture:**
- A new Pages Function, `functions/api/atis/red.ts`, fetches the public feeds with a 60 s edge cache:
  - VATSIM: `vatsim-data.json` plus `transceivers-data.json`, for controller positions;
  - IVAO: `whazzup`.
- The function answers `{ atc, atis }` for one airport. The decision logic is pure and lives in `src/features/atis/red.ts`, which the function imports, as `discord.ts` imports from `src/lib`.
- In dev, a small Vite middleware runs the same handler.
- The page asks every 60 s per tuned airport. A pure `fuente()` picks the rule.

**Tech Stack:** React + TypeScript (Vite), Cloudflare Pages Functions, tests with `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-16-programa-atis-design.md`, sections 3, 4 and 5.

**This is plan 2 of 4.** Plan 1 (generated ATIS in MSFS, Mexico) is on main, `235bebc`.

## Rulings made while writing this plan (checked 2026-11-20)

- **IVAO moves to rule 1** (program silent), as the spec says to do if the IVAO client plays the ATIS by voice.
  - IVAO's wiki ("Altitude Voice ATIS Manual") says pilots receive the ATIS "via text or voice" by tuning the ATIS frequency in Altitude.
  - Its Aurora guide says the station broadcasts it with TTS or with a recording, by priority TWR > APP > GND > DEL.
  - So the program never speaks over an IVAO ATIS.
  - Cost if wrong: when an IVAO controller has a text-only ATIS, the pilot hears nothing. They still read it on screen.
- **The text-ATIS parser** (letter, METAR, runways and TL read out of a text) **moves to plan 3**. With IVAO on rule 1, only the US D-ATIS needs it.
- **PilotEdge moves to plan 3.**
  - It only covers the western US, and plan 1's data is Mexico only.
  - Its list exists: `https://www.pilotedge.net/atis/airports.json`, with 86 airports and the fields `icao`, `name`, `atis_name` and `has_d_atis`.
  - This plan's selector shows IVAO, VATSIM and Sin red.
- **The screen language selector** (spec section 4) goes with the explanations in plan 4. Until then the screen is Spanish only.
- **Feed shapes**, seen live on 2026-11-20:
  - VATSIM `controllers[]` and `atis[]` share `{ callsign, frequency: "118.300", facility, visual_range, text_atis: string[] | null }`. The ATIS entries add `atis_code`. Facility ids: 1 FSS, 2 DEL, 3 GND, 4 TWR, 5 APP, 6 CTR.
  - VATSIM controllers carry **no position**. It comes from `transceivers-data.json`: `[{ callsign, transceivers: [{ latDeg, lonDeg }] }]`.
  - IVAO `clients.atcs[]` has `{ callsign, atcSession: { frequency, position }, lastTrack: { latitude, longitude } | null, atis?: { lines: string[], revision } }`.
  - IVAO `lines[0]` is a voice-server address like `ts-1.eu-west-2.ivao.aero/MMMX_TWR`, not ATIS text.
  - The same IVAO callsign can appear more than once.
  - Live example: `MMMX_TWR` on IVAO, revision `F`, text «Mexico ATIS Information FOXTROT recorded at 0505z MMMX 210441Z 30003KT 10SM FEW020 SCT080 17/04 A3034 NOSIG RMK 8/530 LWR SC ARR RWY 05R DEP RWY 05L TL FL195 TA 18500ft CONFIRM ATIS INFO FOXTROT on initial contact».

## Global Constraints

- Feeds:
  - `https://data.vatsim.net/v3/vatsim-data.json`
  - `https://data.vatsim.net/v3/transceivers-data.json`
  - `https://api.ivao.aero/v2/tracker/whazzup`
- Send `user-agent: VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)` and `cf: { cacheTtl: 60, cacheEverything: true }`. The response carries `cache-control: public, max-age=60` and `access-control-allow-origin: *`, like `functions/api/wx/[tipo].ts`.
- Endpoint: `GET /api/atis/red?icao=XXXX&red=ivao|vatsim`.
  - It returns `{ "atc": boolean, "atis": { "lineas": string[], "letra": string | null } | null }`.
  - Bad input gives 400; a feed failure gives 502.
- What counts as ATC at the airport (spec section 5):
  - any station whose callsign starts with `ICAO_`, except observers;
  - any APP, DEP, CTR or FSS whose position is closer to the airport than its range.
  - VATSIM range: `visual_range`, in NM.
  - IVAO range: CTR and FSS 150 NM, APP and DEP 60 NM.
  - A station with no position never counts by distance.
- Which ATIS counts:
  - VATSIM: an entry in `atis[]` whose callsign starts with `ICAO_` and ends with `ATIS`, so `MMMX_D_ATIS` counts. Letter = `atis_code`. Lines = `text_atis`.
  - IVAO: the station with the airport prefix and `atis` whose position comes first in TWR > APP > GND > DEL. Lines are `atis.lines` without the ones matching `/\.ivao\.aero\//`. Letter = `atis.revision`.
  - If no lines are left, there is no ATIS: `atis: null`, but `atc` stays true.
- Selector: «IVAO», «VATSIM», «Sin red».
  - It is stored in `localStorage` under `atis-red`, with values `ivao`, `vatsim` and `ninguna`. Default `ninguna`.
  - Every read and write is wrapped in try/catch.
- Copy (Spanish UI):
  - source label: «ATIS de IVAO», «ATIS de VATSIM», «Generado con el METAR de las HHMMZ», «Generado sin letra: hay controlador en línea»;
  - tag «Escúchalo en tu cliente»;
  - warning «Sin datos de la red».
- New pieces:
  - `"f-confirme": ["Confirme pista y QNH con el controlador.", "Confirm runway and QNH with the controller."]`.
  - Erik generates them with Azure in his own terminal, **without** `--forzar`, so only missing pieces are made. The key never passes through Claude.
- No "oficial" or "certificado". No network logos. `ACCESO_ATIS` stays `"fundador"`.
- New `*.test.ts` files go into the `test` script of `package.json` by hand.

## Review Focus

1. **The network feed fails or times out.** "When in doubt there is ATC" (spec section 5): `fuente()` returns `"sin-letra"` for `null`, and the page shows «Sin datos de la red». → test in Task 1, copy in Task 4.
2. **A controller logs on or off while the ATIS plays.** The loop switches to or from the no-letter version at the next loop boundary, not mid-word, through the plan 1 swap path. → `debeCambiar` test in Task 3.
3. **VATSIM ATIS callsign variants** (`MMMX_ATIS`, `MMMX_D_ATIS`, `MMMX_A_ATIS`). Any of them means rule 1. → test in Task 1.
4. **An IVAO ATIS that is only the voice-server line** (seen live: `CZYZ_CTR`). It is not ATIS text, so `atis: null`. → test in Task 1.
5. **A center far away does not count; one in range does.** `MMFR_CTR` 400 NM away doesn't make MMGL "with ATC"; one 100 NM away with range 300 does. → test in Task 1.

---

### Task 1: Pure network logic

**Files:**
- Create: `src/features/atis/red.ts`
- Test: `src/features/atis/red.test.ts`
- Modify: `package.json` (add the test file)

**Interfaces:**
- Consumes: `distanciaNm` from `src/features/atis/radio.ts`.
- Produces:
```ts
export type Red = "ivao" | "vatsim" | "ninguna";
export type EstadoRed = { atc: boolean; atis: { lineas: string[]; letra: string | null } | null };
export type Fuente = "cliente" | "sin-letra" | "generado";
// Minimal feed shapes (only the fields used):
export type VatsimEstacion = { callsign: string; facility: number; visual_range: number; text_atis: string[] | null; atis_code?: string | null };
export type VatsimDatos = { controllers: VatsimEstacion[]; atis: VatsimEstacion[] };
export type VatsimTransceptores = { callsign: string; transceivers: { latDeg: number; lonDeg: number }[] }[];
export type IvaoAtc = { callsign: string; atcSession: { position: string }; lastTrack: { latitude: number; longitude: number } | null; atis?: { lines: string[]; revision: string } };
export type IvaoWhazzup = { clients: { atcs: IvaoAtc[] } };
export function estadoVatsim(datos: VatsimDatos, trans: VatsimTransceptores, ap: { icao: string; lat: number; lon: number }): EstadoRed;
export function estadoIvao(w: IvaoWhazzup, ap: { icao: string; lat: number; lon: number }): EstadoRed;
export function fuente(red: Red, estado: EstadoRed | null): Fuente; // ninguna → generado; null → sin-letra; atis → cliente; atc → sin-letra; else generado
```

- [ ] **Step 1: Write the failing tests** in `src/features/atis/red.test.ts`. Use small inline fixtures shaped like the feeds above, with MMGL at 20.5218, −103.3112.
  - `fuente("ninguna", null)` → `"generado"`.
  - `fuente("ivao", null)` → `"sin-letra"`.
  - `fuente("vatsim", { atc: true, atis: { lineas: ["x"], letra: "A" } })` → `"cliente"`.
  - `fuente("vatsim", { atc: true, atis: null })` → `"sin-letra"`.
  - `fuente("ivao", { atc: false, atis: null })` → `"generado"`.
  - VATSIM:
    - `MMGL_ATIS` with `atis_code: "C"` and `text_atis: ["MMGL INFO C ..."]` gives `{ atc: true, atis: { lineas: ["MMGL INFO C ..."], letra: "C" } }`;
    - the same with callsign `MMGL_D_ATIS` gives the same result;
    - `MMGL_TWR` alone in `controllers` gives `{ atc: true, atis: null }`;
    - `MMGLX_TWR` does not count;
    - `MMFR_CTR` (facility 6, `visual_range: 300`) with its transceiver at 21.4, −103.3 (about 53 NM) gives `atc: true`;
    - the same CTR with its transceiver at 27.0, −103.3 (about 390 NM) gives `atc: false`;
    - a CTR with no transceiver entry gives `atc: false`.
  - IVAO:
    - `MMGL_TWR` with `atis.lines: ["ts-1.eu-west-2.ivao.aero/MMGL_TWR", "Guadalajara ATIS Information FOXTROT ..."]` and `revision: "F"` gives the lines without the first, and `letra: "F"`;
    - `MMGL_GND` with atis together with `MMGL_TWR` with atis: the TWR one wins;
    - `MMGL_TWR` whose lines are only the voice-server line gives `{ atc: true, atis: null }`;
    - `MMFR_CTR` with `lastTrack` at 22.19, −103.3112 (about 100 NM) gives `atc: true` (150 NM range);
    - `MMFR_APP` at that same point gives `atc: false` (60 NM range);
    - an APP with `lastTrack: null` gives `atc: false`.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/atis/red.test.ts`. Expected: FAIL, the module is missing.
- [ ] **Step 3: Implement `src/features/atis/red.ts`** with the interfaces above and the rules in Global Constraints.
  - The prefix check is `callsign.startsWith(icao + "_")`.
  - Positions for distance: VATSIM facility 1, 5 or 6; IVAO `atcSession.position` in `FSS | CTR | APP | DEP`.
  - A VATSIM station is in range if any of its transceivers is within `visual_range`.
- [ ] **Step 4: Run the test again.** Expected: PASS. Add the file to `package.json` and run `npm test`; everything passes.
- [ ] **Step 5: Commit:** `Add the network ATC and ATIS rules for the ATIS program`.

### Task 2: Pages Function `/api/atis/red` and dev middleware

**Files:**
- Create: `functions/api/atis/red.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `estadoVatsim` and `estadoIvao` from Task 1, and the Mexico data `public/data/atis/MX.json` (for `lat`/`lon` by ICAO).
- Produces: `export const onRequestGet = async ({ request }: { request: Request }) => Response`.
  - `?icao=` must match `/^[A-Z]{4}$/` after `toUpperCase()`.
  - `?red=` must be `ivao` or `vatsim`.
  - The airport must be in `MX.json`. Import the JSON (`import aeropuertos from "../../../public/data/atis/MX.json"`). Otherwise 400.
  - Body: the `EstadoRed` JSON.

- [ ] **Step 1: Implement the function.**
  - Fetch with the user-agent and the `cf` cache options from Global Constraints. VATSIM needs both feeds, in parallel.
  - Any network or parse error gives `502 { "error": "Red no disponible" }`.
  - Headers as in `functions/api/wx/[tipo].ts`, with `cache-control: public, max-age=60` on 200.
- [ ] **Step 2: Add a dev middleware** in `vite.config.ts`: a plugin with `configureServer` that answers `/api/atis/red`.
  - It builds `new Request("http://localhost" + req.url)`, awaits `onRequestGet({ request })`, and writes the status, headers and body to `res`.
  - It sits next to the existing `/api/wx` proxy, with a comment in the same style.
- [ ] **Step 3: Check it by hand.** Start the `atis-dev` launch config (port 5180, or the next free one), then:
  - `curl "http://localhost:5180/api/atis/red?icao=MMMX&red=ivao"` → 200 with the `EstadoRed` shape;
  - the same with `red=vatsim` → 200;
  - `icao=XXXX` → 400;
  - `red=foo` → 400.
  - Note in the report what MMMX returned. Whether there is ATC online is whatever the feeds say at that moment.
- [ ] **Step 4: Run** `npx tsc -b` and `npm test`. Both pass.
- [ ] **Step 5: Commit:** `Add the network ATIS endpoint for IVAO and VATSIM`.

### Task 3: Generated ATIS with a controller online (rule 3)

**Files:**
- Modify: `src/features/atis/frases.ts` (piece `f-confirme`)
- Modify: `src/features/atis/generado.ts`
- Modify: `src/features/atis/radio.ts` (`debeCambiar`)
- Test: `src/features/atis/generado.test.ts`, `src/features/atis/radio.test.ts`

**Interfaces:**
- Produces:
  - `armarAtisMx(metar: Metar, ap: AeropuertoAtis, opciones?: { conControlador?: boolean }): Atis`;
  - `Atis` gains `conControlador: boolean` (false by default).
  - With `conControlador: true`, in both languages:
    - no `letra` part;
    - no `pista` part;
    - the `cierre` part is `j("f-confirme")`.
  - `letra` is still computed (for change detection and the loop phase), but it is not spoken.
  - `debeCambiar(actual, nuevo)` is also true when `actual.conControlador !== nuevo.conControlador`.

- [ ] **Step 1: Write the failing tests.**
  - In `generado.test.ts`:
    - `armarAtisMx(metar, ap, { conControlador: true })` has no part with `tipo` `letra` or `pista`;
    - its `cierre` texts are `["Confirme pista y QNH con el controlador.", "Confirm runway and QNH with the controller."]`;
    - `conControlador` is `true`;
    - without options, `conControlador` is `false` and the plan 1 tests are unchanged.
  - In `radio.test.ts`: same icao and letter, one with `conControlador` true and one false → `debeCambiar` is `true`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Add `"f-confirme"` to `frases.ts` with the exact copy from Global Constraints, so `todasLasPiezas` includes it.
  - Update the plan 1 test that counts the pieces, if there is one.
- [ ] **Step 4: Run** `npm test` and `npx tsc -b`. Expected: PASS.
- [ ] **Step 5: Commit:** `Say no letter or runway in the generated ATIS when a controller is online`.
- [ ] **Step 6 (Erik): generate the new pieces with Azure** in his own PowerShell, from the worktree:
  - `$env:AZURE_SPEECH_KEY="…"; $env:AZURE_SPEECH_REGION="eastus"`
  - `node --experimental-strip-types tools/atis-piezas/generar.ts --proveedor azure`, **without** `--forzar`.
  - Expected output: `hechas 2`. Commit `public/atis/piezas/es/f-confirme.mp3` and `en/f-confirme.mp3`.

### Task 4: Network selector and rules on the page

**Files:**
- Modify: `src/pages/AtisPrograma.tsx`

**Interfaces:**
- Consumes: `Red`, `EstadoRed`, `fuente` (Task 1), `/api/atis/red` (Task 2), and `armarAtisMx(..., { conControlador })` (Task 3).

- [ ] **Step 1: Selector.**
  - Three buttons in a row under the header: «IVAO», «VATSIM», «Sin red». Use the site's `Button` with the active one as `variant="primary"` and the rest `"ghost"`, or the existing segmented pattern in `InstructorPrograma.tsx` if there is one.
  - Read it from `localStorage` (`atis-red`) inside try/catch, default `ninguna`; write it on change.
- [ ] **Step 2: Network state per airport,** like `metarDe`: a `Map<string, { estado: EstadoRed | null; pedidoMs: number; fallo: boolean }>` keyed by `${red}-${icao}`.
  - Fetch `/api/atis/red?icao=…&red=…` the first time and every 60 s.
  - On error, `fallo = true` and keep the last `estado`. With no last one, `estado` stays `null`.
  - With `red === "ninguna"`, never fetch.
- [ ] **Step 3: Apply the rule** in the per-sample effect, with `f = fuente(red, estado)`. Treat "fetch failed and no last state" as `null`, so it gives `sin-letra`.
  - `cliente`: stop that COM's audio (`apagar`). Show:
    - the header «ICAO · Información X», where X is the network letter through `LETRAS` (a non-letter shows raw);
    - the label «ATIS de IVAO» or «ATIS de VATSIM»;
    - the lines as text;
    - the tag «Escúchalo en tu cliente».
    - Distance and signal stay.
  - `sin-letra`: build with `armarAtisMx(metar, ap, { conControlador: true })` and play it through the existing path. Header «ICAO · Sin letra · METAR HHMMZ», label «Generado sin letra: hay controlador en línea».
  - `generado`: as plan 1. Add the label «Generado con el METAR de las HHMMZ».
  - When `fallo` is true and `red !== "ninguna"`, show «Sin datos de la red» (gold, like «METAR sin actualizar»).
  - `clave(a)` (the loading dedupe key) must include `conControlador`, so a switch reloads the audio.
  - Changing the selector re-runs the effect: add `red` to its dependencies.
- [ ] **Step 4: Check it in the browser pane** with the simulated reader (`--simulado --sin-ventana`, MMGL 127.9), with the founder signed in. If the pane isn't signed in, ask Erik to sign in; never type credentials.
  - «Sin red» → generated, with a letter.
  - «IVAO» or «VATSIM» with no ATC at MMGL → the same, plus the label.
  - To see `cliente` and `sin-letra` without a live controller, temporarily point the fetch at a hand-made JSON response (for example by editing the URL locally to a `public/` file). Check both screens, then revert. Do not commit it.
  - No console errors.
- [ ] **Step 5: Run** `npm run build` and `npm test`. Both pass.
- [ ] **Step 6: Commit:** `Add the network selector and network rules to the ATIS program`.
- [ ] **Step 7: Live test with Erik** whenever a Mexican station is online on IVAO or VATSIM (Webeye or vatsim-radar), with the reader against `localhost:5180` or after deploy.
  - Expected:
    - ATIS online → the program is silent and Altitude or vPilot plays it;
    - only TWR or APP → the no-letter ATIS;
    - no ATC → the normal one.
  - Record what he reports.
