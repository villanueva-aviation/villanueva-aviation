# Programa ATIS — Plan 1: ATIS generado en MSFS (México) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In MSFS, the pilot tunes the real ATIS frequency of a Mexican airport on COM1 or COM2 and hears a bilingual ATIS (Spanish, then English) built from the real METAR. It plays as a loop of pre-recorded pieces (Jorge and Christopher) with the radio effect, and the static grows with distance.

**Architecture:**
- A new small C# reader (`tools/atis-lector`, port 8767) serves COM and position as JSON. It is derived from the instructor reader.
- A founder-only page `/atis/programa` does the rest:
  - polls the reader and matches the tuned frequency against `public/data/atis/MX.json`, which is built from OurAirports;
  - fetches the METAR through the existing `/api/wx`;
  - builds the ATIS as parts plus a list of pieces;
  - joins the piece MP3s from `public/atis/piezas/` and plays them through a Web Audio radio chain.
- No voice service runs live.

**Tech Stack:**
- React + TypeScript (Vite), tests with `node --experimental-strip-types --test`.
- C# .NET Framework 4 with `csc.exe` and SimConnect managed DLL.
- Node scripts for data and pieces.
- Azure Speech REST, or `edge-tts` for provisional pieces only.

**Spec:** `docs/superpowers/specs/2026-11-16-programa-atis-design.md`

**This is plan 1 of 4:**
- Plan 2: networks IVAO, VATSIM and PilotEdge, plus text ATIS parsing and the rule-3 ending.
- Plan 3: X-Plane, FAA and OACI formats, D-ATIS.
- Plan 4: explanations, `/guia-atis`, the product page `/atis`, the zip in Descargas.

## Global Constraints

- Voices: `es-MX-JorgeNeural` for Spanish and `en-US-ChristopherNeural` for English, rate `-8%`.
- Pauses after each piece, by the punctuation that ends its spoken text:
  - `.` → 0.45 s;
  - `,` → 0.22 s;
  - otherwise 0.06 s;
  - 1.2 s between the Spanish and the English blocks.
- Radio chain: 2× highpass 300 Hz, then 2× lowpass 3000 Hz, then a compressor (threshold −24 dB, ratio 8, attack 3 ms, release 60 ms, makeup ×2), then tanh soft clip, then gain 0.8. Mix in pink noise filtered with highpass 400 Hz and lowpass 4000 Hz, amplitude 0.012 when clean.
- Loop: 2 s between repeats. It starts at `(now − letter start) mod (duration + 2 s)`.
- Range: `1.23 × (√aglFt + √50)` NM.
  - Clean when distance is under 40 % of range.
  - Dirty at 90 % or more: noise 0.05, voice gain 0.55, tremolo 0.4 Hz with depth 0.35.
  - Linear in between. Silent beyond range.
- Frequency match tolerance: 5 kHz (`|Δ| < 0.005` MHz). If several airports match, the nearest in range wins.
- Reader port **8767**. CORS origins: `https://villanueva-aviation.pages.dev` and `http://localhost:5180`. Window URL: `https://villanueva-aviation.pages.dev/atis/programa`.
- Access: `ACCESO_ATIS = "fundador"` (same pattern as `ACCESO_REPASO`).
- No "oficial" or "certificado" wording. The page shows «Solo para simulación».
- The Azure key is used only by the piece script, read from env. It is never committed and never shipped.
- Pieces made with `edge-tts` are provisional. Do not commit or publish them. `public/atis/piezas/` stays in `.gitignore` until Task 8.
- New `*.test.ts` files must be added by hand to the `test` script in `package.json` (it lists files explicitly).
- Copy for the pieces is in Spanish/English exactly as in this plan. The UI copy is Spanish.

## Review Focus

1. **A METAR with weather the bank can't say** (for example `+TSRA`, `FZFG`, or an RMK that isn't on the list). That part is left out of the audio, and the text shows it marked «Solo en texto». Nothing else is cut. → test in Task 2.
2. **A missing piece file (404)**, for example an airport name not generated yet. That part plays without the missing piece, and the screen shows «Falta audio: …». The program doesn't freeze. → `cargarAudio` returns `faltantes` (Task 5) and the page shows them (Task 7).
3. **Two airports on the same ATIS frequency.** Only the nearest in range plays. → test in Task 4.
4. **The METAR changes while it plays** (new letter). The loop changes to the new ATIS at the next repeat, not in the middle of a word. If the METAR fetch fails, it keeps the last one and shows «METAR sin actualizar». → logic in Task 7, pure decision `debeCambiar` tested in Task 4.
5. **Reader closed or simulator not running.** The page shows «Abre el lector ATIS» or «Esperando a MSFS» and stays silent. → Task 7. The reader reports `sim: null` when SimConnect is down, Task 6.

---

### Task 1: Airport data for Mexico from OurAirports

**Files:**
- Create: `src/features/atis/datos.ts`
- Test: `src/features/atis/datos.test.ts`
- Create: `tools/atis-datos/generar.ts`
- Create (generated, committed): `public/data/atis/MX.json`
- Modify: `package.json` (add the test file)

**Interfaces:**
- Produces:
```ts
export type ExtremoPista = { ident: string; rumboV: number; largoFt: number }; // rumboV = true heading, degrees
export type AeropuertoAtis = {
  icao: string; nombreEs: string; nombreEn: string;
  lat: number; lon: number; elevFt: number;
  atisMhz: number[]; pistas: ExtremoPista[];
};
export function nombres(nombreOurAirports: string, municipio: string): { es: string; en: string };
export function extremos(fila: Record<string, string>): ExtremoPista[]; // one runways.csv row → 0 or 2 ends
export function armarAeropuertos(aeropuertos: Record<string,string>[], pistas: Record<string,string>[], frecuencias: Record<string,string>[], pais: string): AeropuertoAtis[];
```

- [ ] **Step 1: Write the failing tests** in `datos.test.ts`:
  - `nombres("Guadalajara International Airport", "Guadalajara")` → `{ es: "Aeropuerto Internacional de Guadalajara", en: "Guadalajara International Airport" }`.
  - `nombres("Some Field", "Tepic")` → `{ es: "Aeropuerto de Tepic", en: "Tepic Airport" }`.
  - `extremos` on the MMGL row `11R/29L`:
    - `le_heading_degT` is `113` and `he_heading_degT` is `293`; `length_ft` is `13123`; `closed` is `0`;
    - result: `[{ident:"11R", rumboV:113, largoFt:13123}, {ident:"29L", rumboV:293, largoFt:13123}]`.
  - `extremos` on the MMGL row `11L/29R` with empty headings:
    - le `20.531017,-103.32666`, he `20.518005,-103.29567`;
    - computes the bearing from the coordinates; assert `rumboV` within ±1 of 113 and of 293.
  - `extremos` with `closed: "1"` → `[]`.
  - `armarAeropuertos` with one MX airport row, its two runways and frequencies `ATIS 127.9` and `TWR 118.1` returns one airport with `atisMhz: [127.9]`. An airport with no ATIS frequency is left out. A row with `iso_country: "US"` is left out for `pais = "MX"`.

- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/atis/datos.test.ts` and confirm it FAILS (module not found).

- [ ] **Step 3: Implement `datos.ts`.**
  - Name rule: a name ending in "International Airport" gets "Internacional"; anything else is a plain "Aeropuerto de {municipio}" / "{municipio} Airport". Use `municipality`, not the official name. Real ATIS says the city.
  - Bearing: standard initial great-circle bearing, rounded to an integer.
  - Frequency types that count: `ATIS` and `D-ATIS`.

- [ ] **Step 4: Run the test** and confirm it PASSES.

- [ ] **Step 5: Write `tools/atis-datos/generar.ts`.**
  - Usage: `node --experimental-strip-types tools/atis-datos/generar.ts MX`.
  - Fetches `airports.csv`, `runways.csv` and `airport-frequencies.csv` from `https://davidmegginson.github.io/ourairports-data/`.
  - Parses the CSV with a small quote-aware splitter (no new dependency).
  - Writes `public/data/atis/MX.json` as compact JSON.

- [ ] **Step 6: Run the script.** Check that `MX.json` contains MMGL with `atisMhz: [127.9]` and the ends 11R/29L/11L/29R, without the closed 02/20. The builder check counted about 21 Mexican airports.

- [ ] **Step 7: Add the test to `package.json` and run `npm test`.** All tests pass.

- [ ] **Step 8: Commit.**
```bash
git add src/features/atis/datos.ts src/features/atis/datos.test.ts tools/atis-datos/generar.ts public/data/atis/MX.json package.json
git commit -m "Add Mexican airport ATIS data from OurAirports"
```

---

### Task 2: Mexican bilingual ATIS builder (text + pieces)

**Files:**
- Create: `src/features/atis/frases.ts` (piece catalog)
- Create: `src/features/atis/generado.ts`
- Test: `src/features/atis/generado.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `AeropuertoAtis`, `ExtremoPista` (Task 1); `Metar` from `src/lib/clima.ts` (uses `rawOb`, `obsTime`, `wdir`, `wspd`, `wgst`, `visib`, `clouds`, `wxString`, `temp`, `dewp`).
- Produces:
```ts
// frases.ts
export type Idioma = "es" | "en";
export type Pieza = { idioma: Idioma; clave: string };
export const FRASES: Record<Idioma, Record<string, string>>; // clave → spoken text (with its punctuation)
export function textoDePieza(p: Pieza, aeropuertos: AeropuertoAtis[]): string | null; // spoken text, incl. "ap-XXXX" names; null = unknown
export function todasLasPiezas(aeropuertos: AeropuertoAtis[]): Pieza[]; // whole bank, no duplicates
// generado.ts
export type TipoParte = "aeropuerto"|"letra"|"hora"|"pista"|"viento"|"visibilidad"|"tiempo"|"nubes"|"temperatura"|"altimetro"|"observaciones"|"cierre";
export type Parte = { tipo: TipoParte; idioma: Idioma; texto: string; piezas: Pieza[]; soloTexto?: boolean };
export type Atis = { icao: string; letra: string; inicioMs: number; partes: Parte[] }; // es parts first, then en
export function letraDe(obsTime: number): string;           // "A".."Z"
export function pistaEnUso(pistas: ExtremoPista[], wdir: number | string | null, wspd: number | null): ExtremoPista | null;
export function armarAtisMx(metar: Metar, ap: AeropuertoAtis): Atis;
```

**Piece keys** (file `public/atis/piezas/{idioma}/{clave}.mp3`):
- `d-{0-9}-sigue` is spoken as the digit word plus `,` and `d-{0-9}-cierra` as the word plus `.`:
  - ES: cero uno dos tres cuatro cinco seis siete ocho nueve;
  - EN: zero one two three four five six seven eight niner.
  - In every number group, the last digit uses `cierra` and the rest use `sigue`.
- `letra-{A-Z}` is the phonetic word plus `.` (Alfa, Bravo, Charlie, Delta… Zulu; ES uses the same ICAO words).
- `ap-{ICAO}` is the airport name plus `.` (`nombreEs` / `nombreEn`).
- Fixed phrases: one `f-…` key per phrase. Use these exact texts. ES / EN in the same order:
  - `f-informacion`: "Información" / "Information"
  - `f-observacion`: "Observación de las" / (none in EN)
  - `f-zulu`: "zulú." / "zulu weather."
  - `f-pista`: "Pista en uso," / "Runway in use,"
  - `f-derecha` / `f-izquierda` / `f-central`: "derecha." / "izquierda." / "central." — EN "right." / "left." / "center."
  - `f-viento`: "Viento," / "Wind,"
  - `f-grados`: "grados," / "degrees,"
  - `f-nudos`: "nudos." / "knots."
  - `f-calma`: "Viento en calma." / "Wind calm."
  - `f-variable`: "variable," / "variable,"
  - `f-rafagas`: "ráfagas de" / "gusts"
  - `f-variando`: "variando entre" / "variable between"
  - `f-y`: "y" / "and"
  - `f-visibilidad`: "Visibilidad," / "Visibility,"
  - `f-millas`: "millas." / "miles."
  - `f-o-mas`: "millas o más." / "miles or more."
  - `f-cuarto`, `f-medio`, `f-tres-cuartos`: "un cuarto de milla." / "one quarter mile."; "media milla." / "one half mile."; "tres cuartos de milla." / "three quarters mile."
  - `f-nubes`: "Nubes" / (none in EN)
  - `f-few`, `f-sct`, `f-bkn`, `f-ovc`:
    - first layer, ES "escasas a" / "dispersas a" / "fragmentadas a" / "cerrado a"; EN "Few clouds at" / "Scattered clouds at" / "Broken clouds at" / "Overcast at";
    - later layers `f-few2` … `f-ovc2`: ES "Escasas a" / "Dispersas a" / "Fragmentadas a" / "Cerrado a"; EN "Few," / "Scattered," / "Broken," / "Overcast,".
  - `f-vv`: "Visibilidad vertical," / "Vertical visibility,"
  - `f-despejado`: "Cielo despejado." / "Sky clear."
  - `f-mil-pies`: "mil pies." / "thousand."
  - `f-mil`: "mil" / "thousand"
  - `f-cientos-{1-9}`: ES "cien pies." "doscientos pies." … "novecientos pies."; EN "one hundred." … "niner hundred."
  - `f-cb` / `f-tcu`: "cumulonimbos." / "cúmulos en torre." — EN "cumulonimbus." / "towering cumulus."
  - `f-temperatura`: "Temperatura," / "Temperature,"
  - `f-rocio`: "Punto de rocío," / "Dewpoint,"
  - `f-menos`: "menos" / "minus"
  - `f-altimetro`: "Altímetro," / "Altimeter,"
  - `f-qnh`: "QNH," / "QNH,"
  - `f-cierre`: "Al primer contacto, notifique que tiene la información" / "Advise on initial contact you have information"
- Weather keys (`wx-…`), one per code in `WX` below, with the spoken text ending in `.`:
```ts
export const WX: Record<string, [string, string]> = {
  "-RA": ["Lluvia ligera.", "Light rain."], "RA": ["Lluvia.", "Rain."], "+RA": ["Lluvia fuerte.", "Heavy rain."],
  "-SHRA": ["Chubascos ligeros.", "Light rain showers."], "SHRA": ["Chubascos.", "Rain showers."],
  "TS": ["Tormenta.", "Thunderstorm."], "VCTS": ["Tormenta en las cercanías.", "Thunderstorm in the vicinity."],
  "-TSRA": ["Tormenta con lluvia ligera.", "Thunderstorm, light rain."], "TSRA": ["Tormenta con lluvia.", "Thunderstorm, rain."],
  "VCSH": ["Chubascos en las cercanías.", "Showers in the vicinity."], "-DZ": ["Llovizna ligera.", "Light drizzle."],
  "BR": ["Neblina.", "Mist."], "FG": ["Niebla.", "Fog."], "HZ": ["Bruma.", "Haze."], "FU": ["Humo.", "Smoke."],
};
```
- RMK keys (`rmk-{ISOL|OCNL|FRQ}-{SC|CB|TCU|CU|AC|ST}`):
  - ES "{tipo} {frecuencia}." with tipo in plural: Estratocúmulos, Cumulonimbos, Cúmulos en torre, Cúmulos, Altocúmulos, Estratos; frecuencia: aislados / ocasionales / frecuentes;
  - EN "{Isolated|Occasional|Frequent} {stratocumulus|cumulonimbus|towering cumulus|cumulus|altocumulus|stratus}.".

- [ ] **Step 1: Write the failing tests** in `generado.test.ts`:
  - Fixture METAR, parsed like `/api/wx` returns it: `rawOb: "METAR MMGL 162240Z 12004KT 7SM FEW120 BKN300 25/09 A3014 RMK 8/078 ISOL SC"`, `obsTime` = 2026-11-16T22:40Z in seconds, `wdir: 120, wspd: 4, visib: 7, clouds: [{cover:"FEW",base:12000},{cover:"BKN",base:30000}], temp: 25, dewp: 9`.
  - **Exact text test.** Use a fixture airport with a single runway `11/29` (rumboV 113/293). Override `letra` by passing `obsTime` such that `letraDe` gives `"D"` (choose the value in the test from `letraDe`'s rule). Then:
    - the `es` parts' `texto` joined with `" "` equals exactly: `Aeropuerto Internacional de Guadalajara. Información Delta. Observación de las dos dos cuatro cero zulú. Pista en uso, uno uno. Viento, uno dos cero grados, cuatro nudos. Visibilidad, siete millas. Nubes escasas a uno dos mil pies. Fragmentadas a tres cero mil pies. Temperatura, dos cinco. Punto de rocío, cero nueve. Altímetro, tres cero uno cuatro. Estratocúmulos aislados. Al primer contacto, notifique que tiene la información Delta.`
    - the `en` parts joined equal exactly: `Guadalajara International Airport. Information Delta. Two two four zero zulu weather. Runway in use, one one. Wind, one two zero degrees, four knots. Visibility, seven miles. Few clouds at one two thousand. Broken, three zero thousand. Temperature, two five. Dewpoint, zero niner. Altimeter, three zero one four. Isolated stratocumulus. Advise on initial contact you have information Delta.`
    - The `Fragmentadas a` / `Broken,` second layer text is the Anexo wording. The second-layer phrases above give exactly that.
  - **Pieces of the wind part (es):** `f-viento, d-1-sigue, d-2-sigue, d-0-cierra, f-grados, d-4-cierra, f-nudos`.
  - **Real MMGL parallels:** with ends 11L (11608 ft), 11R (13123 ft), 29L and 29R, wind 120/04 → `pistaEnUso` returns `11R` (best headwind; the tie goes to the longer). The ES pista part text is `Pista en uso, uno uno derecha.`
  - **Calm (`wspd` < 5 or `wdir` `"VRB"` with `wspd` < 5) → longest runway, `le` end.** Wind `0/0` → the ES viento part is `Viento en calma.`
  - **Gust and variable:** `rawOb` with `27015G25KT 240V300` → ES `Viento, dos siete cero grados, uno cinco nudos, ráfagas de dos cinco nudos. Variando entre dos cuatro cero y tres cero cero.`. Build the pieces in that order with the keys above.
  - **Unknown weather (Review Focus 1):** `wxString: "+TSRA FZFG"`. `+TSRA` and `FZFG` are not in `WX`, so each becomes a `tiempo` part with `soloTexto: true`, `piezas: []` and `texto` = the raw code. All other parts are still present.
  - **RMK not on the list** (`RMK 8/078 CB SE`) → no `observaciones` part with pieces. It becomes a `soloTexto` part with the raw RMK text.
  - **Altimeter Q:** `rawOb` with `Q1013` instead of `A…` → ES `QNH, uno cero uno tres.`
  - **Negative dewpoint** `25/M05` → ES `Punto de rocío, menos cero cinco.`
  - **Cloud base 800 ft** → ES `Nubes escasas a ochocientos pies.`; EN `Few clouds at eight hundred.`
  - **`visib: "10+"`** → ES `Visibilidad, uno cero millas o más.`
  - **`letraDe`**: two `obsTime` values in the same UTC hour give the same letter; consecutive hours give consecutive letters, Z wraps to A.
  - **Every piece used by `armarAtisMx` is in `todasLasPiezas([fixture])`**, and `todasLasPiezas` has no duplicate `idioma+clave`.

- [ ] **Step 2: Run the test** and confirm it FAILS.

- [ ] **Step 3: Implement `frases.ts` and `generado.ts`.**
  - `letraDe(obsTime) = ALFABETO[Math.floor(obsTime / 3600) % 26]`.
    - `// ponytail: a SPECI in the same hour keeps the letter; key on rawOb hash if that matters`
  - Wind headwind is `cos(wdir − rumboV)`. The tie margin is 0.01.
  - Time digits come from the `DDHHMMZ` group of `rawOb`. Temperature and dewpoint come from the `TT/DD` group (two digits, with `M` meaning minus). Altimeter comes from `A\d{4}` or `Q\d{4}`. Variable direction comes from `\d{3}V\d{3}`.
  - Cloud heights: thousands as digits + `f-mil-pies`. If there is a remainder of 100–900 ft, use digits + `f-mil` + `f-cientos-N`. Below 1000 ft, only `f-cientos-N`. EN uses the same structure with its own texts.
  - `inicioMs = obsTime * 1000`.

- [ ] **Step 4: Run the test** and confirm it PASSES.
- [ ] **Step 5: Add it to `package.json`, run `npm test`, and commit** (`Add the Mexican bilingual ATIS builder`).

---

### Task 3: Piece bank script (provisional pieces with edge-tts, final ones with Azure)

**Files:**
- Create: `tools/atis-piezas/generar.ts`
- Modify: `.gitignore` (add `public/atis/piezas/`)

**Interfaces:**
- Consumes: `todasLasPiezas`, `textoDePieza` (Task 2); `public/data/atis/MX.json` (Task 1).

- [ ] **Step 1: Write the script.**
  - Usage: `node --experimental-strip-types tools/atis-piezas/generar.ts --proveedor azure|edge [--solo ap-MMGL]`.
  - For each piece in `todasLasPiezas` it writes `public/atis/piezas/{idioma}/{clave}.mp3` and skips existing files unless `--forzar` is given.
  - `azure`:
    - `POST https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
    - headers `Ocp-Apim-Subscription-Key: ${AZURE_SPEECH_KEY}`, `Content-Type: application/ssml+xml`, `X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3`;
    - SSML `<speak version="1.0" xml:lang="{es-MX|en-US}"><voice name="{voz}"><prosody rate="-8%">{texto escapado}</prosody></voice></speak>`;
    - if either env var is missing, exit with a clear message.
  - `edge`: runs `${EDGE_TTS}` (path to the `edge-tts` executable) with `--voice {voz} --rate=-8% --text {texto} --write-media {archivo}`.
  - Prints the counts at the end: made, skipped, failed.
- [ ] **Step 2: Add `public/atis/piezas/` to `.gitignore`.** Comment: provisional edge-tts pieces must not be published; it is removed in Task 8.
- [ ] **Step 3: Generate the provisional bank.**
  - Run `EDGE_TTS=<scratch venv>/Scripts/edge-tts.exe node --experimental-strip-types tools/atis-piezas/generar.ts --proveedor edge`.
  - Expected: 0 failed. The file count equals `todasLasPiezas(...).length`.
- [ ] **Step 4: Commit** the script and `.gitignore` only (`Add the ATIS piece bank script`). `git status` must show no files under `public/atis/piezas/`.

---

### Task 4: Pure radio, range, tuning and loop math

**Files:**
- Create: `src/features/atis/radio.ts`
- Test: `src/features/atis/radio.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `AeropuertoAtis` (Task 1); `Atis` (Task 2).
- Produces:
```ts
export type Com = { mhz: number; escucha: boolean; volumen: number | null }; // volumen 0..1
export type Posicion = { lat: number; lon: number; aglFt: number };
export type Mezcla = { voz: number; ruido: number; tremolo: number }; // gains; tremolo = depth (0 = none)
export function distanciaNm(a: {lat:number;lon:number}, b: {lat:number;lon:number}): number;
export function alcanceNm(aglFt: number): number;
export function mezclaPorDistancia(distNm: number, alcance: number, volumenCom: number | null): Mezcla | null; // null = out of range
export function sintonizado(com: Com, pos: Posicion, aeropuertos: AeropuertoAtis[]): { ap: AeropuertoAtis; distNm: number } | null;
export function offsetLoop(ahoraMs: number, inicioMs: number, duracionSeg: number): number; // seconds into the loop
export function debeCambiar(actual: Atis | null, nuevo: Atis): boolean; // different icao or letra
```

- [ ] **Step 1: Write the failing tests.**
  - `alcanceNm(0)` ≈ 8.70 and `alcanceNm(5000)` ≈ 95.67 (±0.05).
  - `mezclaPorDistancia(10, 100, null)` → `{voz: 0.8, ruido: 0.012, tremolo: 0}`. At 95 % of range → `{voz: 0.55, ruido: 0.05, tremolo: 0.35}`. At 65 % → the linear midpoint ±0.001. At 101 % → `null`. With `volumenCom = 0.5`, `voz` and `ruido` are both halved.
  - `sintonizado`:
    - COM `127.9` near MMGL → MMGL;
    - `127.905` → MMGL; `127.91` → null;
    - `escucha: false` → null;
    - **Review Focus 3:** two airports on 127.9, one 20 NM away and one 60 NM away, with range 95 → the 20 NM one. If the near one is out of range (agl 0, range 8.7) and the far one is too, → null.
  - `offsetLoop(inicio + 100_000, inicio, 30)` → `100 mod 32 = 4`.
  - `debeCambiar(null, x)` is true. Same icao and letra → false. A new letra → true.
- [ ] **Step 2: Run it** and confirm it FAILS. **Step 3: Implement it**, using haversine with Earth radius 3440.065 NM and a linear interpolation between 0.4 and 0.9. **Step 4: Run it** and confirm it PASSES.
- [ ] **Step 5: Add it to `package.json`, run `npm test`, and commit** (`Add ATIS radio range and tuning math`).

---

### Task 5: Audio engine (Web Audio)

**Files:**
- Create: `src/features/atis/motorAudio.ts`

**Interfaces:**
- Consumes: `Pieza`, `FRASES`/`textoDePieza` (Task 2); `Mezcla` (Task 4).
- Produces:
```ts
export function pausaTras(textoHablado: string): number; // 0.45 / 0.22 / 0.06
export async function cargarAudio(ctx: AudioContext, atis: Atis, aeropuertos: AeropuertoAtis[]): Promise<{ buffer: AudioBuffer; faltantes: string[] }>;
export class RadioAtis {
  constructor(ctx: AudioContext);
  reproducir(buffer: AudioBuffer, offsetSeg: number): void; // loops with 2 s gap baked in (buffer + 2 s silence)
  ajustar(m: Mezcla): void;      // ramps gains over 0.2 s
  clic(): void;                  // 30 ms noise burst at tune
  detener(): void;
}
```

- [ ] **Step 1: Implement `pausaTras`** with the values from Global Constraints, then add 2 asserts to `radio.test.ts`: `pausaTras("dos,") === 0.22` and `pausaTras("Delta.") === 0.45`.
- [ ] **Step 2: Implement `cargarAudio`.**
  - Fetch `/atis/piezas/{idioma}/{clave}.mp3` for each piece of each part that isn't `soloTexto` (fetch them in parallel, cached in a `Map` for the session).
  - Decode with `decodeAudioData` and trim leading and trailing samples below −45 dBFS.
  - Concatenate into one mono buffer at the context's sample rate. Insert `pausaTras(spoken text)` after each piece, and 1.2 s between the last `es` piece and the first `en` piece. Apply a 5 ms linear crossfade at each join.
  - A failed fetch or decode adds the clave to `faltantes` and is skipped (Review Focus 2).
  - Append 2 s of silence.
- [ ] **Step 3: Implement `RadioAtis`.**
  - Graph: `AudioBufferSourceNode(loop)` → highpass 300 → highpass 300 → lowpass 3000 → lowpass 3000 → `DynamicsCompressorNode(threshold −24, ratio 8, attack 0.003, release 0.06, knee 0)` → gain 2 (makeup) → `WaveShaperNode` (tanh curve, 1024 points) → gain `voz` → tremolo gain (LFO 0.4 Hz `OscillatorNode` → gain `tremolo/2` → into the tremolo gain's `.gain`, base `1 − tremolo/2`) → destination.
  - Pink noise: a 4 s looped buffer using the Paul Kellet filter → highpass 400 → lowpass 4000 → gain `ruido` → destination.
- [ ] **Step 4: Check by ear.**
  - Add a temporary founder button "Probar MMGL" on `/atis/programa` in Task 7. It plays the Task 2 fixture with `ajustar(mezclaPorDistancia(10,100,null))`.
  - **Done when** it sounds like `atis-prueba/07-piezas-jorge-christopher-radio.mp3`. Erik confirms.
- [ ] **Step 5: Commit** (`Add the ATIS Web Audio engine`).

---

### Task 6: ATIS reader (C#, MSFS)

**Files:**
- Create: `tools/atis-lector/LectorAtis.cs`
- Create: `tools/atis-lector/build.py` (copy `tools/instructor-lector/build.py`; change the names to `VillanuevaAtisLector.exe` and folder `Villanueva ATIS`; **do not** build a zip yet, that is plan 4)
- Create: `tools/atis-lector/LEEME.txt` (short: open the exe, leave its window open, MSFS SDK note copied from the instructor's LEEME)

**Interfaces:**
- Produces `GET http://127.0.0.1:8767/muestra`:
```json
{ "sim": "msfs" | null, "com": [{ "mhz": 127.9, "escucha": true, "volumen": 0.8 }, { "mhz": 118.1, "escucha": false, "volumen": null }], "lat": 20.6, "lon": -103.3, "aglFt": 3000 }
```
  When SimConnect is down: `{"sim": null, "com": [], "lat": null, "lon": null, "aglFt": null}` (Review Focus 5).

- [ ] **Step 1: Copy from `LectorInstructor.cs` with only the names and constants changed:**
  - `Opciones` (keep `--simulado`, `--url`, `--sin-ventana`);
  - DLL search `Dlls.Preparar`;
  - the minimal HTTP server (`Servir`/`Atender`, CORS with the two origins and Private-Network header);
  - `ArgumentosEdge`/`AbrirVentana` with profile folder `%LOCALAPPDATA%\VillanuevaAtis\Edge`;
  - the `Main` structure;
  - the `--probar` self-test harness.

  Drop everything about history, `?desde=`, recording, airports, VORs and maneuvers.
- [ ] **Step 2: Add the SimConnect data definition**, read every 250 ms:
  - `COM ACTIVE FREQUENCY:1` and `:2` (MHz);
  - `COM RECEIVE:1` and `:2` (Bool);
  - `COM VOLUME:1` and `:2` (percent → divide by 100; if the aircraft gives 0 for both while receiving, send `null`);
  - `PLANE LATITUDE`, `PLANE LONGITUDE` (degrees);
  - `PLANE ALT ABOVE GROUND` (feet).
- [ ] **Step 3: Add `--simulado`.** It sits at 20.70,-103.31 (about 10 NM north of MMGL) with COM1 127.9 receiving and volume 0.8. AGL climbs from 1500 to 6000 ft and then the position moves north 1 NM every 5 s, so the range and static can be heard changing.
- [ ] **Step 4: Extend `--probar`:**
  - `ArgumentosEdge` with the new profile;
  - the JSON of a sample with `sim: null`;
  - the JSON of the simulated first sample, matching the shape above exactly.
  - Run `python -I tools/atis-lector/build.py` and then `tools/atis-lector/out/VillanuevaAtisLector.exe --probar`. Expected: every line `OK`.
- [ ] **Step 5: Commit** the `.cs`, `build.py` and `LEEME.txt`, not `out/` (`Add the ATIS reader for MSFS`).

---

### Task 7: Page `/atis/programa`

**Files:**
- Create: `src/features/atis/acceso.ts` — `export const ACCESO_ATIS: "fundador" | "todos" = "fundador";`
- Create: `src/features/atis/useLectorAtis.ts`
- Create: `src/pages/AtisPrograma.tsx`
- Modify: `src/lib/routes.ts` (add `atisPrograma: "/atis/programa"`), `src/App.tsx` (lazy route inside `<ProtectedRoute>`, like `instructorPrograma`)

**Interfaces:**
- Consumes: Task 1 (`MX.json`), Task 2 (`armarAtisMx`), Task 4 (`sintonizado`, `mezclaPorDistancia`, `alcanceNm`, `offsetLoop`, `debeCambiar`), Task 5 (`cargarAudio`, `RadioAtis`), `consultarMetar` from `src/lib/clima.ts`, `useAuth` and `FOUNDER_EMAIL`.
- Produces: `useLectorAtis(): { estado: "sin-lector" | "sin-simulador" | "conectado"; muestra: MuestraAtis | null }`. It polls `http://127.0.0.1:8767/muestra` every 1 s; `MuestraAtis` has the reader JSON shape.

- [ ] **Step 1: Implement `useLectorAtis`.**
  - A failed fetch gives `"sin-lector"`.
  - `sim: null` gives `"sin-simulador"`.
- [ ] **Step 2: Build `AtisPrograma.tsx`.**
  - Gate: if `ACCESO_ATIS === "fundador"` and the user isn't the founder, show «Próximamente».
  - Load `MX.json` once.
  - On each sample, call `sintonizado` for each COM. Each COM has its own `RadioAtis` and its own current `Atis`, because the spec says both play when COM1 and COM2 are both receiving an ATIS.
  - The METAR comes from `consultarMetar(icao)` and is refreshed every 60 s. On failure, keep the last one and show «METAR sin actualizar» (Review Focus 4).
  - When `debeCambiar(actual, nuevo)` is true, load the audio with `cargarAudio`. Swap it at the next loop boundary, or right away if nothing is playing.
  - On a new tune: `clic()`, then `reproducir(buffer, offsetLoop(Date.now(), atis.inicioMs, duracion))`.
  - On every sample: `ajustar(mezclaPorDistancia(...))`. A `null` mix, an untuned COM or `escucha: false` mean `detener()`.
  - The `AudioContext` is created on a first «Empezar» click (autoplay policy). The reader's Edge flags also allow no-gesture autoplay.
- [ ] **Step 3: Screen** (compact, 480 px wide, the site's existing UI components and styles):
  - status line: «Abre el lector ATIS» / «Esperando a MSFS» / «Sintoniza la frecuencia ATIS de un aeropuerto»;
  - when playing, the header «MMGL · Información Delta · METAR 2240Z», distance and «Señal: buena / débil / fuera de alcance»;
  - the parts as text, ES block then EN block. `soloTexto` parts in muted style with the tag «Solo en texto»;
  - `faltantes` as «Falta audio: …» (Review Focus 2);
  - a «Silenciar» button and the footer «Solo para simulación».
  - Add the temporary founder button «Probar MMGL» (Task 5, Step 4).
- [ ] **Step 4: Check it in the browser.**
  - Run Vite on port 5180 (`PORT=5180 npm run dev` in a terminal tab inside this worktree).
  - Run `tools/atis-lector/out/VillanuevaAtisLector.exe --simulado --url http://localhost:5180/atis/programa`.
  - Expected: MMGL plays as soon as you press Empezar, with real METAR text on screen. The «Señal» line goes from buena to débil to fuera de alcance as the simulated plane moves away, and the audio goes silent out of range. No console errors.
- [ ] **Step 5: Run `npm run build` and `npm test`.** Both pass.
- [ ] **Step 6: Commit** (`Add the ATIS program page`).
- [ ] **Step 7: Live test with Erik in MSFS.**
  - He runs the reader without `--simulado` at MMGL, tunes 127.9 on COM1, and then flies 30+ NM away.
  - Record what he reports. Don't tune values without his feedback.

---

### Task 8: Final piece bank with Azure (blocked until Erik has the free Azure Speech account)

- [ ] **Step 1:** Erik creates an Azure Speech resource on the free tier (F0) and gives the key and region **as environment variables in his own terminal**. They never go in chat or in a file.
- [ ] **Step 2:** Run `node --experimental-strip-types tools/atis-piezas/generar.ts --proveedor azure --forzar`. Expected: 0 failed.
- [ ] **Step 3:** Erik listens to the MMGL ATIS on the page and compares it with sample 07.
- [ ] **Step 4:** Remove `public/atis/piezas/` from `.gitignore`, then commit the pieces and the `.gitignore` change (`Add the Azure ATIS piece bank`).
- [ ] **Step 5:** Remove the temporary «Probar MMGL» button and commit.
