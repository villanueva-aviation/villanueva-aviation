# Programa ATIS — Plan 3: ATIS en todo el mundo con datos de MSFS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every airport with an ATIS frequency in the pilot's MSFS 2020 or 2024 plays an ATIS.
- The ATIS uses that country's format: Mexico bilingual as today, Spanish-speaking Latin America bilingual ICAO, US FAA in English, and the rest of the world ICAO in English.
- The airport name is spoken from pre-recorded pieces, with a phonetic fallback.
- The screen is in English when the computer is not set to Spanish.
- The IVAO and VATSIM rules work worldwide.

**Architecture:**
- The C# reader asks MSFS for its world airport list once per connection.
- It then fetches facility data (ATIS frequencies with `TYPE` 1, runways, elevation) for airports within 200 NM, a few at a time, and caches them for the session.
- It serves them at `GET /aeropuertos` beside `/muestra`.
- The page uses that list instead of `MX.json`, merges spoken names from `public/data/atis/nombres.json`, and picks the format from the ICAO prefix.
- `functions/api/atis/red.ts` takes the airport position from the query instead of `MX.json`.

**Tech Stack:**
- React + TypeScript (Vite) and Cloudflare Pages Functions.
- Tests with `node --experimental-strip-types --test`.
- C# 5 compiled with `csc.exe` (.NET Framework 4) against the SimConnect managed DLL, through `tools/atis-lector/build.py`.

**Spec:** `docs/superpowers/specs/2026-11-22-atis-plan3-mundial-design.md` is the binding one. It extends `docs/superpowers/specs/2026-11-16-programa-atis-design.md`.

**This is plan 3.** Plans 1 and 2 are on main (`21cbf6a`). Plan 4 covers D-ATIS and PilotEdge; plan 5 covers teaching, the product page and the download.

## Rulings made while writing this plan (2026-11-22)

- **The spec's Anexo texts are rewritten in the style of today's pieces.** The plan's exact texts below are binding.
  - The airport name ends in a period, then «Information X.».
  - Every fixed piece keeps its own punctuation, as in plan 1.
  - Cost if wrong: the voice pauses slightly differently than in the Anexo. Erik checks by ear.
- **FAA reuses the MX English pieces**, with three changes:
  - the wind (`Wind two five zero at one zero.`);
  - the runway, which moves after the altimeter (`Landing and departing runway two five left.`);
  - no `Runway in use` part.
  - Visibility stays `Visibility, one zero miles or more.`.
- **Metric visibility is read from `rawOb`**, because aviationweather's `visib` field is converted to statute miles.
  - The first standalone 4-digit group after the wind group is the visibility.
  - A direction suffix (`4000NE`) is ignored in the voice and shown as text only.
- **Phonetic fallback** uses the existing `letra-X` pieces. The screen shows the MSFS name.
- **The reader keeps at most 4 facility requests open**, nearest first.
  - The cache has no cap. A long flight caches a few thousand small entries.
  - ponytail: add an LRU only if memory is measured to grow.
- **`--simulado` serves MMGL from a hard-coded copy** of its `MX.json` entry, because the reader has no site files.
- **Runway numbers outside 1–36 are skipped.** Those are the N, NE and similar codes, and water runways.
  - Designators: 1 → L, 2 → R, 3 → C; anything else gives no letter.

## Global Constraints

- Only MSFS 2020 and 2024. Do not touch X-Plane.
- The reader never ships SimConnect DLLs. It finds them as today (`Dlls.Preparar`) and builds with `python -I tools/atis-lector/build.py`.
- Facility definition, in this exact field order:
  - `OPEN AIRPORT`, `LATITUDE`, `LONGITUDE`, `ALTITUDE`, `NAME`, `N_RUNWAYS`, `N_FREQUENCIES`;
  - `OPEN FREQUENCY`, `TYPE`, `FREQUENCY`, `NAME`, `CLOSE FREQUENCY`;
  - `OPEN RUNWAY`, `LATITUDE`, `LONGITUDE`, `ALTITUDE`, `HEADING`, `LENGTH`, `PRIMARY_NUMBER`, `PRIMARY_DESIGNATOR`, `SECONDARY_NUMBER`, `SECONDARY_DESIGNATOR`, `CLOSE RUNWAY`;
  - `CLOSE AIRPORT`.
- Struct layout (`Pack = 1`), as verified in the spike `scratchpad/spike-fac/Spike.cs`:
  - airport: `double lat, lon, alt; char[32] name; int nRunways, nFreq`;
  - frequency: `int type, hz; char[64] name`;
  - runway: `double lat, lon, alt; float heading, length; int n1, d1, n2, d2`.
- ATIS = frequency `TYPE` 1. MHz = `hz / 1e6`, rounded to 3 decimals. `ALTITUDE` and `LENGTH` are in metres; convert to ft with `× 3.28084` and round. `HEADING` is the true heading of the primary end. The secondary end is `(heading + 180) % 360`. All headings are rounded to integers.
- Radius: 200 NM. Re-query after moving 10 NM or more.
- `GET /aeropuertos` (port 8767, same CORS handling as `/muestra`) returns an array of `{ icao, nombre, lat, lon, elevFt, atisMhz: number[], pistas: { ident, rumboV, largoFt }[] }`, limited to airports with ATIS within 200 NM of the last position.
  - With no sim or no position it returns `[]`.
  - `/muestra` does not change.
- Format by ICAO prefix:
  - `mx`: `MM`.
  - `latam`: `MG`, `MH`, `MN`, `MR`, `MS`, `MP`, `MU`, `MD`, `SK`, `SV`, `SE`, `SP`, `SL`, `SC`, `SA`, `SU`, `SG`.
  - `faa`: `K`, `PA`, `PH`, `PG`, `TJ`.
  - `oaci`: everything else.
- Languages: `mx` and `latam` are es then en; `faa` and `oaci` are en only. The format of the airport decides the ATIS text, not the screen language.
- New pieces, with exact es / en text (`null` = none in that language):

  | Key | es | en |
  |---|---|---|
  | `f-km-o-mas` | «diez kilómetros o más.» | «one zero kilometers or more.» |
  | `f-kilometros` | «kilómetros.» | «kilometers.» |
  | `f-metros` | «metros.» | «meters.» |
  | `f-cavok` | «CAVOK.» | «CAVOK.» |
  | `f-nsc` | «Sin nubes significativas.» | «No significant cloud.» |
  | `f-hpa` | «hectopascales.» | «hectopascals.» |
  | `f-nosig` | «Sin cambios significativos.» | «No significant change.» |
  | `f-faa-viento` | `null` | «Wind» |
  | `f-at` | `null` | «at» |
  | `f-faa-pista` | `null` | «Landing and departing runway» |

- The spoken name file is `public/data/atis/nombres.json`, shaped `Record<icao, { es?: string; en: string }>`. A missing entry means phonetic.
- Screen copy, Spanish then English (English when `navigator.language` does not start with `es`):

  | es | en |
  |---|---|
  | «Abre el lector ATIS» | «Open the ATIS reader» |
  | «Esperando a MSFS» | «Waiting for MSFS» |
  | «Sintoniza la frecuencia ATIS de un aeropuerto» | «Tune an airport's ATIS frequency» |
  | «Buscando aeropuertos…» | «Finding airports…» |
  | «Red» | «Network» |
  | «Sin red» | «No network» |
  | «Empezar» | «Start» |
  | «Silenciar» | «Mute» |
  | «Quitar silencio» | «Unmute» |
  | «Señal» | «Signal» |
  | «buena» | «good» |
  | «débil» | «weak» |
  | «fuera de alcance» | «out of range» |
  | «Sin METAR» | «No METAR» |
  | «METAR sin actualizar» | «METAR not updated» |
  | «Sin datos de la red» | «No network data» |
  | «Consultando la red…» | «Checking the network…» |
  | «ATIS de IVAO» / «ATIS de VATSIM» | «IVAO ATIS» / «VATSIM ATIS» |
  | «Generado sin letra: hay controlador en línea» | «Generated without letter: a controller is online» |
  | «Generado con el METAR de las HHMMZ» | «Generated from the HHMMZ METAR» |
  | «Escúchalo en tu cliente» | «Listen in your client» |
  | «Solo en texto» | «Text only» |
  | «Falta audio:» | «Missing audio:» |
  | «Información X» | «Information X» |
  | «Sin letra» | «No letter» |
  | «Solo para simulación» | «For simulation only» |

  «Próximamente» stays Spanish. It is the founder gate and is out of scope.
- `ACCESO_ATIS` stays `"fundador"`.
- Never say «oficial» or «certificado». The Azure key never passes through Claude: Erik runs the piece generator in his own PowerShell.
- Every test file you add goes into the `test` script in `package.json`.

## Review Focus

1. **8.33 kHz channels** (EGLL 121.935). `sintonizado` must match within `TOLERANCIA_MHZ`. A unit test covers 121.935 vs 121.933, and Task 7 checks it live.
2. **The same ATIS frequency at two airports within range** (SKBO and SAEZ are both on 127.800, but far apart). The nearest wins; that test already exists, so keep it.
3. **METARs from outside Mexico** must never throw. Cover `9999`, `CAVOK`, `NSC`, `VRB03KT`, `00000KT`, `4000NE`, `M02/M05`, `Q998` and a METAR without a visibility group. Anything not understood goes into a `soloTexto` part. Tests in Task 1.
4. **A long flight.** The reader re-queries only after 10 NM, never re-requests a cached ICAO, and keeps at most 4 requests open. Checked with `--probar` helpers in Task 4.
5. **MSFS closed and reopened while the reader keeps running.** The cache and the world list are cleared on each new connection, and `/aeropuertos` returns `[]` until a new position arrives. Task 4.

---

### Task 1: Country formats in the generator

**Files:**
- Create: `src/features/atis/formato.ts`, `src/features/atis/formato.test.ts`
- Modify: `src/features/atis/generado.ts`, `src/features/atis/frases.ts`, `src/features/atis/generado.test.ts`, `package.json`

**Interfaces:**
- Produces:
  - `export type Formato = "mx" | "latam" | "faa" | "oaci"`;
  - `export function formatoDe(icao: string): Formato`;
  - `export function armarAtis(metar: Metar, ap: AeropuertoAtis, opciones?: { conControlador?: boolean }): Atis`, which dispatches by `formatoDe(ap.icao)`;
  - `armarAtisMx` stays exported and unchanged for `MM`.
- `Atis.partes` holds only `en` parts for `faa` and `oaci`.

- [ ] **Step 1: Write the failing tests.**
  - In `formato.test.ts`, `formatoDe` returns:
    - `mx` for `MMGL`;
    - `latam` for `SKRG`, `SAEZ` and `MROC`;
    - `faa` for `KLAX`, `PANC`, `PHNL` and `TJSJ`;
    - `oaci` for `EGLL`, `LEMD`, `SBGR`, `CYVR`, `PKMJ` (a P prefix that is not US) and `SKXX`.
  - In `generado.test.ts`, the exact `oaci` text, with `ap` EGLL (one runway pair `09L` 90° / `27R` 270°, 12802 ft; `09R` 90° / `27L` 270°, 12008 ft), METAR `EGLL 221450Z 24012KT 9999 FEW030 BKN045 09/04 Q1013 NOSIG` and letter B. Use `obsTime` with hour index 1 mod 26:
    `"London Heathrow Airport. Information Bravo. One four five zero zulu weather. Runway in use, two seven right. Wind, two four zero degrees, one two knots. Visibility, one zero kilometers or more. Few clouds at three thousand. Broken, four thousand five hundred. Temperature, zero niner. Dewpoint, zero four. QNH, one zero one three hectopascals. No significant change. Advise on initial contact you have information Bravo."`
  - Exact `latam` text, Spanish part, for SKBO (`14L`/`32R` 127°/307°, 12467 ft; `14R`/`32L` 127°/307°, 12468 ft), METAR `SKBO 221500Z 33008KT 9999 SCT020 BKN080 15/09 Q1027 NOSIG` and letter C:
    `"Aeropuerto Internacional de Bogotá. Información Charlie. Observación de las uno cinco cero cero zulú. Pista en uso, tres dos izquierda. Viento, tres tres cero grados, ocho nudos. Visibilidad, diez kilómetros o más. Nubes dispersas a dos mil pies. Fragmentadas a ocho mil pies. Temperatura, uno cinco. Punto de rocío, cero nueve. QNH, uno cero dos siete hectopascales. Sin cambios significativos. Al primer contacto, notifique que tiene la información Charlie."`
    The English part follows and starts `"Bogota International Airport. Information Charlie."`.
  - Exact `faa` text for KLAX (`25L`/`07R` 263°/83°, 12923 ft; `25R`/`07L` 263°/83°, 11095 ft), METAR `KLAX 222253Z 25010KT 10SM FEW020 SCT250 19/12 A2992`, `visib: "10+"` and letter D:
    `"Los Angeles International Airport. Information Delta. Two two five three zulu weather. Wind two five zero at one zero. Visibility, one zero miles or more. Few clouds at two thousand. Scattered, two five thousand. Temperature, one niner. Dewpoint, one two. Altimeter, two niner niner two. Landing and departing runway two five left. Advise on initial contact you have information Delta."`
  - Visibility table (`oaci`, en text of the `visibilidad` part):
    - `8000` → `"Visibility, eight kilometers."`
    - `1500` → `"Visibility, one five zero zero meters."`
    - `4000NE` → `"Visibility, four zero zero zero meters."`, plus a `soloTexto` part `"4000NE"`.
    - `CAVOK` → one part `"CAVOK."`, and no visibility, weather or cloud parts.
    - No visibility group → no visibility part.
  - `NSC` → `"No significant cloud."` instead of `"Sky clear."`.
  - Robustness (Review Focus 3): `armarAtis` does not throw on `VRB03KT`, `00000KT`, `M02/M05`, `Q0998` or `Q998`.
  - A `faa` ATIS with `conControlador` has no `letra` part and no runway part, and ends with `f-confirme`.
  - A `latam` METAR in miles and `A` (`SKXX`… use `MROC` with `7SM` and `A3001`) uses the miles and altimeter wording of `mx`.
  - Update the existing «todas las piezas usadas están en el banco» test to build `oaci`, `latam` and `faa` samples too.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/atis/formato.test.ts src/features/atis/generado.test.ts`. Expect failures: `formato.ts` is missing, and so is `armarAtis`.
- [ ] **Step 3: Implement.**
  - `formatoDe` checks 2-letter prefixes first, then `K`.
  - Add the new pieces to `FIJAS` in `frases.ts`.
  - In `generado.ts`, generalize the `armar(idioma)` closure with a `formato` parameter rather than duplicating it.
  - `mx` output must stay byte-identical: the existing tests are the guard.
- [ ] **Step 4: Run** `npm test`. Expect PASS, with the existing MX tests unchanged.
- [ ] **Step 5: Commit** `Add the latam, FAA and ICAO ATIS formats`.

### Task 2: Spoken names with phonetic fallback

**Files:**
- Modify: `src/features/atis/datos.ts`, `src/features/atis/frases.ts`, `src/features/atis/generado.ts`, `src/features/atis/motorAudio.ts`, plus the tests next to them, and every caller of `AeropuertoAtis`.

**Interfaces:**
- `AeropuertoAtis` becomes `{ icao; nombreEs: string | null; nombreEn: string | null; nombreSim: string; lat; lon; elevFt; atisMhz; pistas }`.
  - `MX.json` entries get `nombreSim` equal to `nombreEn`. `armarAeropuertos` fills it.
- `export type Nombres = Record<string, { es?: string; en: string }>`, in `datos.ts`.
- `export function conNombres(aps: Omit<AeropuertoAtis, "nombreEs" | "nombreEn">[], nombres: Nombres): AeropuertoAtis[]` fills `nombreEs` and `nombreEn`, or `null` for both.
  - For `latam` and `mx`, `es` falls back to `en` when only `en` exists.
- `textoDePieza(p, aeropuertos)` is unchanged in signature.
- `todasLasPiezas(nombres: Nombres)` now takes the names map and emits `ap-XXXX` for `en`, and for `es` only where `es` exists.

- [ ] **Step 1: Write the failing tests.**
  - The airport part of an ATIS for `SKRG` with no name, in `oaci` style, has text `"Sierra Kilo Romeo Golf."` and pieces `letra-S`, `letra-K`, `letra-R`, `letra-G`.
  - In a `latam` Spanish part the same fallback reads `"Sierra Kilo Romeo Golf."`, using the letter pieces in `es`.
  - `conNombres` fills names, and leaves `null` when the airport is missing.
  - `todasLasPiezas({ SKRG: { es: "A", en: "B" }, EGLL: { en: "C" } })` holds `es/ap-SKRG`, `en/ap-SKRG` and `en/ap-EGLL`, but no `es/ap-EGLL`.
  - `radio.test.ts` (Review Focus 1): `sintonizado` with COM at `121.933` and at `121.935` finds an airport whose `atisMhz` is `[121.935]`.
- [ ] **Step 2: Run** the ATIS tests. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The opening part uses `ap-XXXX` when the name exists. Otherwise it uses the ICAO letters, joined with spaces and ending in a period.
  - Update `tools/atis-piezas/generar.ts` to read `public/data/atis/nombres.json` when it exists. Otherwise build the map from `MX.json`, so today's 302 pieces keep the same keys.
- [ ] **Step 4: Run** `npm test` and `npx tsc -b`. Expect PASS.
- [ ] **Step 5: Commit** `Say an airport's ICAO in phonetics when its name piece is missing`.

### Task 3: IVAO and VATSIM rules worldwide

**Files:**
- Modify: `src/features/atis/red.ts`, `src/features/atis/red.test.ts`, `functions/api/atis/red.ts`

**Interfaces:**
- `GET /api/atis/red?icao=XXXX&red=ivao|vatsim&lat=<deg>&lon=<deg>`.
  - It returns 400 unless `icao` is 4 letters, `lat` is a finite number in [-90, 90] and `lon` is one in [-180, 180].
  - It no longer imports `MX.json`.
- `estadoVatsim` and `estadoIvao` keep their signatures.

- [ ] **Step 1: Write the failing tests.**
  - VATSIM `LAX_TWR` counts at `KLAX` (`atc: true`). `ANC_TWR` counts at `PANC`.
  - VATSIM `LAX_CTR` (facility 6, visual range 600, transceiver about 50 NM away) counts at `KLAX`.
  - The existing Houston test at MMGL still gives `false`.
  - IVAO `CZVR_CTR` at about 100 NM counts at `CYVR`, because one-letter ICAO regions C, Y, Z and U compare only the first letter.
  - `MMFR_CTR` near `MGGT`, at about 100 NM with range 300, does not count, because the regions differ.
- [ ] **Step 2: Run** `node --experimental-strip-types --test src/features/atis/red.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement.**
  - `delAeropuerto` accepts `icao.slice(1) + "_"` for the `K`, `PA`, `PH` and `PG` prefixes.
  - `mismaRegion`:
    - for a US airport (`faa` format), a callsign whose prefix before `_` is not 4 letters also counts;
    - one-letter regions compare the first letter;
    - otherwise it compares 2 letters, as today.
  - Then **check the live feeds** for how US, Canadian and Australian stations are named:
    - `curl -s https://data.vatsim.net/v3/vatsim-data.json` and the IVAO whazzup;
    - list the callsign prefixes of stations online in those countries;
    - adjust the rules if a real station would not count, or would count at the wrong airport. When in doubt, count it.
    - Write what you saw, and any gap left, in your task report.
  - Update the function to take `lat` and `lon`.
- [ ] **Step 4: Run** `npm test`.
- [ ] **Step 5: Verify the Functions build** with `npx -y wrangler@3 pages functions build --outdir <scratchpad dir>`. Expect «Compiled Worker successfully».
- [ ] **Step 6: Commit** `Apply the network ATC rules to airports worldwide`.

### Task 4: Reader serves nearby ATIS airports from MSFS

**Files:**
- Modify: `tools/atis-lector/LectorAtis.cs`, `tools/atis-lector/LEEME.txt`

**Interfaces:**
- Produces `GET /aeropuertos`, shaped as in Global Constraints. The JSON uses invariant culture, 6 decimals for lat/lon and 3 for MHz, like `Muestra.Json`.
- `--simulado` serves MMGL, copied from `MX.json`: `20.523342, -103.310108`, elevation 5016, `[127.9]`, runways `11L` 114 11608, `29R` 294 11608, `11R` 113 13123, `29L` 293 13123, name `"Don Miguel Hidalgo Intl"`.

- [ ] **Step 1: Write the `--probar` checks first.** Each prints `OK` or `FALLA` and affects the exit code, like the existing ones:
  - `Ident(19, 0) == "19"`, `Ident(9, 1) == "09L"`, `Ident(27, 2) == "27R"`, `Ident(36, 3) == "36C"`, and `Ident(37, 0) == null`;
  - `Extremos(heading 114.0f, length 3538 m, 11, 2, 29, 1)` gives `11R` 114 11608 and `29L` 294 11608;
  - the JSON of the simulated MMGL equals an exact expected string;
  - `Cercanos(list, pos, 200)` keeps entries under 200 NM, sorted nearest first;
  - `DebeBuscar(lastQueryPos, pos)` is true at 10 NM and false at 9.
- [ ] **Step 2: Build and run** `python -I tools/atis-lector/build.py`, then `tools/atis-lector/out/VillanuevaAtisLector.exe --probar`. Expect the new checks to FAIL. They exist but are not implemented.
- [ ] **Step 3: Implement**, in `Sim.Correr`, the sim thread:
  - `RequestFacilitiesList(AIRPORT)` on connect, collecting all pages;
  - the facility definition and structs from Global Constraints;
  - the request queue, nearest first, at most 4 open, one `RequestID` per request;
  - the cache, keyed by ICAO, cleared on each connect;
  - `/aeropuertos` reads a snapshot under the existing lock.
  - Add a short line to `LEEME.txt` saying the reader now finds airports worldwide.
- [ ] **Step 4: Run** `--probar`. Expect all OK.
- [ ] **Step 5: Run it live.** MSFS is open; Erik is asked to sit at SKRG.
  - Run the reader with `--sin-ventana`.
  - `curl http://127.0.0.1:8767/aeropuertos` lists SKRG at 127.7 and SKBO at 127.8.
  - Repeat in MSFS 2024.
  - If MSFS is not open, report DONE_WITH_CONCERNS and say the live check is pending.
- [ ] **Step 6: Commit** `Read nearby ATIS airports from MSFS in the ATIS reader`.

### Task 5: Page uses the reader's airports, the formats and an English screen

**Files:**
- Modify: `src/pages/AtisPrograma.tsx`, `src/features/atis/useLectorAtis.ts`
- Create: `public/data/atis/nombres.json`, holding the 21 MX airports' names from `MX.json`, so MX keeps its names before Task 6.

**Interfaces:**
- `useLectorAtis()` also returns `aeropuertos: AeropuertoSim[] | null`, read from `/aeropuertos` every 30 s, and every 5 s while the list is empty. `AeropuertoSim` is the reader JSON type.
- Consumes `conNombres`, `armarAtis` and `formatoDe` from Tasks 1 and 2, and the `lat`/`lon` query from Task 3.

- [ ] **Step 1: Implement.**
  - Replace the `MX.json` fetch with the reader's list merged with `nombres.json`, which is fetched once. While the reader is connected but the list is still empty, show «Buscando aeropuertos…».
  - Use `armarAtis` instead of `armarAtisMx`.
  - Ask `/api/atis/red` with the airport's `lat` and `lon`.
  - Choose the screen language with `const en = !navigator.language.toLowerCase().startsWith("es")`. Put every string in Global Constraints in one `TEXTOS` object with `es` and `en`. The `h2` header uses «Information X» / «No letter» in English.
  - When the name is missing, the header shows the ICAO and the MSFS name: `SKRG · Jose Maria Cordova`.
- [ ] **Step 2: Run** `npx tsc -b` and `npm test`.
- [ ] **Step 3: Check in the browser pane.**
  - Run the dev server `atis-dev` (port 5180) and the reader in `--simulado --sin-ventana`. The page is founder-only; ask Erik to sign in in the pane if it shows «Próximamente».
  - MMGL plays exactly as before.
  - With `navigator.language` forced to `en-US` (DevTools sensors, or a temporary query override removed before commit), the UI shows English copy.
- [ ] **Step 4: Commit** `Use MSFS airports, country formats and an English screen in the ATIS program`.

### Task 6: Airport dump and the names file

**Files:**
- Modify: `tools/atis-lector/LectorAtis.cs`
- Create: `tools/atis-nombres/generar.ts`, `src/features/atis/nombres.ts`, `src/features/atis/nombres.test.ts`
- Modify: `public/data/atis/nombres.json`, generated; `package.json`

**Interfaces:**
- `VillanuevaAtisLector.exe --volcar <archivo.json>`:
  - connects;
  - requests facility data for every airport in the world list, at most 4 open at a time, printing progress every 1,000;
  - writes `[{ icao, nombre, lat, lon, region }]` for airports with ATIS;
  - exits with 0.
- `export function nombresAtis(volcado: { icao: string; nombre: string }[], ourAirports: Record<string, string>[]): { nombres: Nombres; repetidos: string[]; caracteres: number }`. This is the pure rule from spec section 3:
  - `mx`/`latam`: the city rule (`nombres()` + `NOMBRES_FIJOS`) only when no other dumped airport shares that municipality; otherwise the OurAirports `name` as it is, in both languages;
  - `faa`/`oaci`: the OurAirports `name` as it is;
  - not in OurAirports: the MSFS name with abbreviations expanded (`Intl` → `International`, `Rgnl` → `Regional`, `Muni` → `Municipal`, `AB` → `Air Base`; extend the list after looking at the dump), for `en`, plus `es` for `mx`/`latam`;
  - an airport already in `MX.json` keeps its `MX.json` names exactly. Its pieces are already recorded under `ap-XXXX`, and the generator skips existing files, so a new text would not match the audio;
  - `repetidos` lists names used by more than one ICAO;
  - `caracteres` sums all name texts with their final period.
- `tools/atis-nombres/generar.ts <volcado.json>` downloads OurAirports `airports.csv` (same `leerCsv` as `tools/atis-datos/generar.ts`; reuse it by moving it to a shared module), writes `nombres.json`, and prints `aeropuertos`, `repetidos` and `caracteres`.

- [ ] **Step 1: Write the failing tests** for `nombresAtis`:
  - `SAEZ` and `SABE`, both in municipality «Buenos Aires», get their OurAirports names;
  - `SKRG`, alone in «Rionegro», gets the city rule;
  - `MMGL` keeps «Aeropuerto Internacional de Guadalajara» from `MX.json`;
  - `EGLL` gets «London Heathrow Airport»;
  - an ICAO missing from OurAirports with MSFS name «Foo Intl» gets «Foo International»;
  - `caracteres` is the exact sum for a 2-airport fixture.
- [ ] **Step 2: Run** the test and expect FAIL. **Implement**, run again and expect PASS.
- [ ] **Step 3: Implement `--volcar`.** Build, then check `--probar` still passes.
- [ ] **Step 4: Run the dump.** Erik has MSFS open at the main menu. Run `--volcar <scratchpad>/volcado.json`, then `node --experimental-strip-types tools/atis-nombres/generar.ts <scratchpad>/volcado.json`.
  - Report the counts to the controller.
  - If `caracteres` × 1 (en) plus the es share exceeds 400,000, stop and report. The split into two months is Erik's call.
- [ ] **Step 5: Commit** `nombres.json`, the scripts and the tests: `Add the worldwide airport names for the ATIS voice`.

### Task 7: Erik records the pieces and tests live

This task is not code. The controller drives it with Erik, in Spanish.

- [ ] **Step 1:** Erik runs the piece generator in his own PowerShell, in the worktree folder, with his Azure variables set and without `--forzar`:
  `node --experimental-strip-types tools/atis-piezas/generar.ts --proveedor azure`.
  It records the Task 1 phrases and the names. Expected: «saltadas 304» and no failures. Then commit the mp3 files.
- [ ] **Step 2: Live checks.** Do each one in MSFS 2020 and again in MSFS 2024:
  - SKRG on 127.7: latam bilingual, spoken name.
  - EGLL on 121.935, the 8.33 kHz channel (Review Focus 1): oaci English.
  - KLAX on 133.8: FAA. With VATSIM selected while a LAX controller is online: «No letter».
  - MMGL on 127.9: unchanged.
  - An airport without a name piece, if any is left: phonetic.
  - The screen in English: Erik switches Windows or Edge to English, or the controller shows it in the pane.
  - If Erik has Navigraph, compare one airport's ATIS frequency with his Navigraph chart.
- [ ] **Step 3:** Record the results in the ledger. Merge to main only on Erik's explicit OK.
