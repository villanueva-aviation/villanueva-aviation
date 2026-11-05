# Instructor virtual: viraje escarpado (C172) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A free site page that reads the cadet's C172 in MSFS 2020 through a small local reader and grades two 45° steep turns with checkride tolerances. It shows a checkride sheet, the instructor's explanation, graphs, and an exam-style report, saves each attempt to the account, and lets the cadet send approved checkrides to Erik for a badge.

**Architecture:** There are two pieces.
- A C# x64 reader (`tools/instructor-lector/`) reads SimConnect and serves the latest sample as JSON on `127.0.0.1:8766`.
- The React page polls the reader every 100 ms and feeds the samples to a pure evaluator (`src/features/instructor/evaluador.ts`), which is a state machine plus grading. It renders the result, stores attempts in Supabase table `intentos_maniobra`, and Erik reviews them in `/admin/maniobras`.

**Tech Stack:**
- Site: React 19, Vite, TypeScript, Tailwind v4, Supabase, Cloudflare Pages.
- Tests: `node --test --experimental-strip-types`.
- Reader: C# 5 compiled with `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe`.

**Spec:** `docs/superpowers/specs/2026-11-05-instructor-virtual-viraje-escarpado-design.md`

## Global Constraints

- **UI language:** all user-facing text in Spanish.
- **No "Garmin" anywhere.**
- **Report branding:** no FAA logo or forms, and no "certificado" or "licencia". The report footer is exactly: `Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica.`
- **Tolerances:** altitud ±100 ft, velocidad ±10 kt, inclinación 45° ±5, rumbo de salida ±10°. They come from ONE module (`src/features/instructor/virajeEscarpado.ts`), and `src/data/checkrideVuelo.ts` reads them from there.
- **Public repo:**
  - No keys or secrets.
  - `git add` only the files you changed, never `git add .`.
  - Never commit `simhub-sixpack/` or `g1000-prueba/`.
- **Pushing:**
  - Commit locally only. Push only after Erik writes "Sí, súbelo"; each approval covers one change.
  - Push command: `git fetch -q origin main; git merge-base --is-ancestor origin/main HEAD; if ($?) { git push -q origin HEAD:main }`.
- **Commit messages:**
  - End with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Write the message to a scratchpad file and run `git commit -q -F <file>` from PowerShell.
- **Test files:**
  - Imports inside tested modules use explicit `.ts` extensions, because node strip-types requires them (see `src/features/rutaRed/pruebasRed.ts`).
  - Every new `*.test.ts` is appended to the `"test"` script in `package.json`.
- **Checks before each commit:** `npx tsc -b --noEmit`, `npm.cmd test`, `npm.cmd run build`.
- **Dev server:** `http://localhost:5180`.
- **Founder identity:** `FOUNDER_EMAIL` from `src/lib/constants.ts` (`villanuevaaviation@gmail.com`). SQL policies use `auth.jwt() ->> 'email'`, as in migration 0019.
- **Migrations:** Erik runs them by hand in Supabase Dashboard → SQL Editor. Say so in the final report.
- **Access:** the steep turn is free with an account (`ProtectedRoute`) and not under `/premium`. Each maneuver entry carries `acceso: "gratis" | "exclusivo"` for future maneuvers.

## Review Focus

1. **Heading wraps through 360/0 mid-turn** (e.g. 350° → 10°). The turn angle must keep accumulating, and the rollout error must be computed on the circle. Task 2 test `rumbo cruza 360 sin romper el conteo`.
2. **Reader or sim disconnects mid-maneuver** (gap > 2 s between samples). The attempt is invalid ("se perdió la conexión con el simulador"), not graded on partial data. Task 2 test `hueco de muestras invalida`.
3. **Aborted entry**: bank > 30° for a moment, then wings level with < 90° turned. Go back to `armado` with no result and no penalty. Task 2 test `entrada abortada regresa a armado`.
4. **Arming on the ground, or flying a non-C172.** The ground case can't be armed; the other aircraft makes the attempt invalid, and each says why. Task 2 tests `no se arma en tierra` and `otro avion invalida`.
5. **Cadet clicks "Mandar a revisión" twice, or on a practice/failed attempt.** The database rejects it, not just the button. Task 5 trigger plus the `puedeMandar` tests.

---

### Task 1: Maneuver data and single source of tolerances

**Files:**
- Create: `src/features/instructor/virajeEscarpado.ts`
- Create: `src/features/instructor/virajeEscarpado.test.ts`
- Modify: `src/data/checkrideVuelo.ts:10-14` (the `virajes-pronunciados` text uses the constants)
- Modify: `package.json` (test script)

**Interfaces:**
- Produces:
  - `TOLERANCIAS = { altitudFt: 100, velocidadKt: 10, inclinacionGrados: 5, rumboSalidaGrados: 10 } as const`
  - `INCLINACION_OBJETIVO = 45`
  - `INCLINACION_ENTRADA = 30`: a turn starts when |bank| passes this.
  - `INCLINACION_ESTABLECIDA = 40`: bank tolerance is checked from here.
  - `INCLINACION_NIVELADO = 10`
  - `NS_SEGUNDOS = 3`, `NS_FACTOR = 1.5`
  - `LIMPIEZA = { ventanaSeg: 120, grados: 90 }`
  - `ALTURA_SEGURA_AGL = 1500`
  - `BOLA_TOLERANCIA = 0.25` (fraction of full deflection, `TURN COORDINATOR BALL` in "position" units, −1…1; tunable)
  - `HUECO_MAX_SEG = 2`
  - `vaPorPeso(pesoLb: number): number`
  - `type CodigoAcs = "PA.V.A.S1" | "PA.V.A.S2" | "PA.V.A.S3" | "PA.V.A.S4" | "PA.V.A.S5"`
  - `ELEMENTOS_ACS: { codigo: CodigoAcs; texto: string }[]`
  - `MANIOBRAS: { id: "viraje-escarpado"; avion: "C172"; nombre: string; acceso: "gratis" | "exclusivo" }[]`

- [ ] **Step 1: Verify the ACS codes.** Open the current Private Pilot ACS (FAA-S-ACS-6C) Area V Task A Steep Turns and confirm skill elements S1–S5. The spec's 6B values are:
  - S1 Clear the area
  - S2 Airspeed not to exceed VA
  - S3 Coordinated 360° at about 45°
  - S4 Opposite direction
  - S5 Altitude ±100 / airspeed ±10 / bank ±5 / rollout ±10

  If 6C renumbers or rewords them, use 6C's and note it in the commit message.

- [ ] **Step 2: Write the failing test**

```ts
test("Va interpola por peso y se limita en los extremos", () => {
  assert.equal(vaPorPeso(2550), 105);
  assert.equal(vaPorPeso(2200), 98);
  assert.equal(vaPorPeso(1900), 90);
  assert.equal(vaPorPeso(2375), 101.5);
  assert.equal(vaPorPeso(3000), 105);
  assert.equal(vaPorPeso(1500), 90);
});
test("los elementos ACS son cinco, S1 a S5", () => {
  assert.deepEqual(ELEMENTOS_ACS.map((e) => e.codigo), ["PA.V.A.S1", "PA.V.A.S2", "PA.V.A.S3", "PA.V.A.S4", "PA.V.A.S5"]);
});
test("el viraje escarpado es gratis", () => {
  assert.equal(MANIOBRAS.find((m) => m.id === "viraje-escarpado")?.acceso, "gratis");
});
```

- [ ] **Step 3:** Run `node --experimental-strip-types --test src/features/instructor/virajeEscarpado.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 4: Implement.**
  - `vaPorPeso` is linear interpolation between (1900, 90), (2200, 98) and (2550, 105), clamped outside.
  - `ELEMENTOS_ACS` texts, in Spanish:
    - S1: "Despejar el área"
    - S2: "Velocidad de entrada ≤ Va"
    - S3: "360° coordinado a ~45°"
    - S4: "Repetir al lado contrario"
    - S5: "Alt ±100 · Vel ±10 · Incl ±5 · Rumbo ±10"
  - In `checkrideVuelo.ts`, build the steep-turn `texto` with a template literal from `TOLERANCIAS` and `INCLINACION_OBJETIVO`, so the wording stays identical to today's.

- [ ] **Step 5:** Add the test file to `package.json`'s test script. Run `npm.cmd test`. Expected: all pass, including the 142 existing tests.

- [ ] **Step 6:** Commit `src/features/instructor/virajeEscarpado.ts src/features/instructor/virajeEscarpado.test.ts src/data/checkrideVuelo.ts package.json` with the message "Add the steep turn tolerances as the single source for grading".

---

### Task 2: Evaluator (state machine and grading)

**Files:**
- Create: `src/features/instructor/evaluador.ts`
- Create: `src/features/instructor/evaluador.test.ts`
- Create: `src/features/instructor/simular.ts` (synthetic sample generator, used by tests and by Task 6's preview)
- Modify: `package.json` (test script)

**Interfaces:**
- Consumes: Task 1 constants and `vaPorPeso`.
- Produces:

```ts
export interface Muestra {
  t: number;            // segundos, reloj del lector
  inclinacion: number;  // grados; el signo no importa, el lado sale del rumbo
  altitud: number;      // ft indicados
  velocidad: number;    // kt indicados
  rumbo: number;        // grados magnéticos 0–360
  bola: number;         // −1…1
  agl: number;          // ft sobre el terreno
  peso: number;         // lb
  enTierra: boolean;
  slew: boolean;
  tasa: number;         // velocidad de simulación
  pausa: boolean;
  titulo: string;       // título del avión
}
export type Fase = "armado" | "viraje1" | "entre" | "viraje2" | "terminado" | "invalido";
export type Lado = "izquierda" | "derecha";
export interface Tramo { inicio: number; fin: number; peor: number } // t en s; peor = desviación máxima con signo
export interface ResultadoLado {
  lado: Lado;
  entrada: { altitud: number; rumbo: number; velocidad: number; va: number };
  peor: { altitud: number; velocidad: number; inclinacion: number; bola: number };  // desviación máx con signo
  rumboSalida: number;  // error con signo, −180…180
  fuera: Record<"altitud" | "velocidad" | "inclinacion" | "bola", Tramo[]>;
  ns: Record<"altitud" | "velocidad" | "inclinacion" | "bola" | "rumbo", boolean>;
}
export interface Resultado {
  aprobado: boolean;
  calificacion: number;                  // 0–100 entero
  elementos: Record<CodigoAcs, "S" | "NS">;
  lados: ResultadoLado[];                // 1 o 2
  avisos: string[];                      // p. ej. altura bajo 1500 AGL
  muestras: Muestra[];                   // desde 120 s antes de la entrada hasta el final
}
export interface Evaluacion {
  fase: Fase;
  motivo?: string;                       // si fase === "invalido"
  resultado?: Resultado;                 // si fase === "terminado"
  /* estado interno libre */
}
export function crearEvaluacion(): Evaluacion;
export function armar(ev: Evaluacion, m: Muestra): Evaluacion; // en tierra → invalido con motivo "Despega primero: la maniobra se arma en el aire."
export function avanzar(ev: Evaluacion, m: Muestra): Evaluacion;  // pura, no muta ev
// simular.ts
export function simularManiobra(op?: {
  lados?: Lado[];                                 // por defecto ["izquierda", "derecha"]
  limpieza?: boolean;                             // por defecto true
  velocidadEntrada?: number;                      // por defecto 95
  caidaAltitud?: { lado: 0 | 1; ft: number; segundos: number; enGrados: number };
  sobreInclinacion?: { lado: 0 | 1; grados: number; segundos: number };
  hz?: number;                                    // por defecto 10
}): Muestra[]; // C172 en vuelo a 3500 ft, AGL 2500, 2550 lb, rumbo inicial 090
```

**Rules the tests pin:**
- **Turn start:** a turn starts when |inclinacion| > `INCLINACION_ENTRADA`. Entry altitude, heading and speed are the values at that sample. The side comes from the sign of the accumulated heading change; unwrap each step to −180…180.
- **Turn end:** a turn ends at the first sample where turned ≥ 330° and |inclinacion| < `INCLINACION_NIVELADO`. `rumboSalida` is the circular difference between the end heading and the entry heading.
- **Aborted entry:** if |inclinacion| < `INCLINACION_NIVELADO` with < 90° turned, go back to the previous phase (`armado` or `entre`). No result.
- **Second turn:** in `entre`, a turn to the same side as the first doesn't count, and the phase stays `entre`.
- **What is measured where:**
  - Altitude and speed: from entry to end.
  - Bank and ball: only while |inclinacion| ≥ `INCLINACION_ESTABLECIDA` and turned < 330°.
- **NS for a tolerance:** NS if any continuous stretch outside lasts > `NS_SEGUNDOS`, or any sample exceeds `NS_FACTOR` × tolerance.
- **Elements:**
  - S1 = S if in the `LIMPIEZA.ventanaSeg` before the first entry the summed |Δrumbo| ≥ `LIMPIEZA.grados`.
  - S2 = S if each side's entry speed ≤ `vaPorPeso(peso)`.
  - S3 = S if both sides have no ball NS and completed the turn.
  - S4 = S if there are two sides with opposite `lado`.
  - S5 = S if no side has NS in altitude, speed, bank or rumbo.
  - `aprobado` = all five are S.
- **Calificación:** start at 100, then subtract:
  - for each side and each of altitude, speed, bank and ball, `min(10, 2 × segundosFuera + 5 × max(0, |peor| / tol − 1))`;
  - 10 for each S1, S2 or S4 that is NS;
  - for each side, `min(10, max(0, |rumboSalida| − 10))`.

  Round, and floor at 0.
- **Invalid attempts** (`fase: "invalido"` with `motivo`):
  - any sample after arming with `pausa`, `slew` or `tasa !== 1`;
  - `titulo` without "172";
  - `t` jumping more than `HUECO_MAX_SEG`.
- **AGL warning:** if `agl < ALTURA_SEGURA_AGL` at any point after entry, add the warning `"Bajaste de 1500 ft sobre el terreno: haz la maniobra más alto."`. It doesn't change S/NS.

- [ ] **Step 1: Write the failing tests** in `evaluador.test.ts`. Use a helper `correr(muestras) = muestras.reduce(avanzar, armar(crearEvaluacion(), muestras[0]))`. Tests:
  - `maniobra perfecta aprueba con 100`: `simularManiobra()` gives `fase === "terminado"`, `aprobado`, `calificacion === 100`, all elements "S", `lados.map(l => l.lado)` is `["izquierda", "derecha"]`.
  - `caida de 130 ft por 6 s reprueba S5`: `caidaAltitud: { lado: 0, ft: 130, segundos: 6, enGrados: 90 }` gives `elementos["PA.V.A.S5"] === "NS"`, `lados[0].ns.altitud`, `lados[0].fuera.altitud.length === 1`, `Math.round(lados[0].peor.altitud) === -130`.
  - `exceso breve no reprueba`: 120 ft for 1 s gives S5 "S" and `calificacion < 100`.
  - `exceso mayor a 1.5 veces reprueba aunque sea breve`: 160 ft for 0.2 s gives S5 "NS".
  - `sin limpieza reprueba S1`: `limpieza: false` gives S1 "NS".
  - `entrada sobre Va reprueba S2`: `velocidadEntrada: 110` at 2550 lb gives S2 "NS".
  - `dos virajes al mismo lado no completan S4`: `lados: ["izquierda", "izquierda"]` ends with `fase === "entre"` and no result.
  - `sobreinclinacion 52 por 3.5 s reprueba`: `sobreInclinacion: { lado: 1, grados: 52, segundos: 3.5 }` gives `lados[1].ns.inclinacion`.
  - `rumbo cruza 360 sin romper el conteo`: start heading 350, left and right turns, ends `terminado` with |rumboSalida| < 1 on both sides.
  - `hueco de muestras invalida`: remove 3 s of samples mid-turn; `fase === "invalido"` and `motivo` matches /conexión/.
  - `slew invalida`: one sample with `slew: true` gives `invalido` and motivo matching /slew/i.
  - `entrada abortada regresa a armado`: bank 35° for 2 s (20° turned) then level gives `fase === "armado"`.
  - `no se arma en tierra`: `armar` with `enTierra: true` gives `invalido` and motivo matching /Despega/.
  - `otro avion invalida`: `titulo: "Cessna 152"` gives `invalido`.
  - `aviso bajo 1500 AGL`: `agl: 1200` throughout gives `avisos.length === 1` and `aprobado` true.

- [ ] **Step 2:** Run `node --experimental-strip-types --test src/features/instructor/evaluador.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `simular.ts` and then `evaluador.ts` to the rules above. The internal state may keep the raw samples, because one maneuver is under 5 minutes, about 3000 samples.
- [ ] **Step 4:** Add the test to `package.json`, then run `npm.cmd test`. Expected: all pass.
- [ ] **Step 5:** Commit the four files with the message "Grade the steep turn from simulator samples".

---

### Task 3: Instructor explanation and graph series

**Files:**
- Create: `src/features/instructor/explicacion.ts`
- Create: `src/features/instructor/explicacion.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Resultado`, `ResultadoLado` and `Muestra` from Task 2.
- Produces:
  - `explicar(r: Resultado): { tipo: "bien" | "mal"; texto: string }[]`
  - `repetir(r: Resultado): string | null` (e.g. `"Repite: viraje izquierdo"`; null if approved)
  - `serie(muestras: Muestra[], campo: "altitud" | "velocidad" | "inclinacion" | "bola", ref: number, maxPuntos?: number): { t: number; v: number }[]`. It returns deviation from `ref` (for inclinación, |bank| − 45), downsampled to at most `maxPuntos` (default 300) while keeping each bucket's extreme.

**Fixed phrases (Spanish; Erik can edit them later):**

| Error | Phrase |
| --- | --- |
| Lost altitude in the first 90° | "{Lado}: perdiste {n} ft al llegar a {g}°. Al entrar al viraje faltó presión atrás en el yugo para compensar la sustentación que se va de lado." |
| Gained altitude | "{Lado}: subiste {n} ft. Afloja un poco la presión atrás y usa el compensador." |
| Overbank | "{Lado}: te pasaste a {g}° unos {s} segundos. Detén el alabeo un poco antes de los 45°." |
| Underbank | "{Lado}: te quedaste en {g}°. Mete un poco más de alabeo y sostenlo." |
| Speed | "{Lado}: la velocidad llegó a {v} kt. Ajusta potencia al entrar: en el viraje la resistencia sube." |
| Ball | "{Lado}: el viraje no fue coordinado. Centra la bola con el pedal del lado al que se fue." |
| Rollout | "{Lado}: saliste {n}° {antes/después} del rumbo de entrada. Empieza a nivelar unos 20° antes." |
| No clearing | "No hiciste virajes de limpieza antes de entrar: busca tráfico con un viraje de al menos 90°." |
| S2 | "Entraste a {v} kt, arriba de Va ({va} kt) para tu peso." |

- One "bien" line lists the tolerances met on both sides: "Velocidad y rumbo de salida, bien en los dos."

- [ ] **Step 1: Write failing tests**, using `simularManiobra` and `avanzar` from Task 2:
  - The 130 ft drop produces a "mal" line containing "presión atrás" and "130".
  - A 52° overbank produces a line containing "Detén el alabeo".
  - The perfect maneuver gives only "bien" lines, and `repetir` returns null.
  - The left failure gives `repetir` = "Repite: viraje izquierdo".
  - `serie(..., "altitud", ref, 300)` has length ≤ 300 and includes the −130 extreme.
- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Add the test to `package.json`, then run `npm.cmd test`. Expected: PASS.
- [ ] **Step 5:** Commit with the message "Explain steep turn errors like an instructor".

---

### Task 4: Local reader (C#)

**Files:**
- Create: `tools/instructor-lector/LectorInstructor.cs`
- Create: `tools/instructor-lector/build.py`: compiles to `tools/instructor-lector/out/` and builds `public/downloads/villanueva-instructor-lector.zip`.
- Create: `tools/instructor-lector/LEEME.txt`: Spanish install steps.
- Create: `tools/instructor-lector/Iniciar con Windows.bat`: creates/removes a Startup shortcut.
- Modify: `.gitignore` (add `tools/instructor-lector/out/`)

**Interfaces:**
- Produces:
  - `GET http://127.0.0.1:8766/muestra` returns `{"conectado":bool,"muestra":Muestra|null}`, using exactly Task 2's `Muestra` keys. `t` = seconds since the reader started, as a double.
  - `OPTIONS` preflight on any path.

- [ ] **Step 1: License check.** Read the MSFS SDK license for redistributing `SimConnect.dll` and `Microsoft.FlightSimulator.SimConnect.dll`.
  - If it allows it, `build.py` takes them from the MSFS SDK (`C:\MSFS SDK\SimConnect SDK\lib\` and `lib\managed\`) when present, otherwise from SimHub's `_Addons\GamePlugins\FlightSimulator`.
  - If redistribution is not allowed, STOP and report to Erik before continuing.
- [ ] **Step 2: Implement `LectorInstructor.cs`.**
  - Base it on `simhub-sixpack/motor/MotorReader.cs` (read it; don't copy that folder into git). It uses the same retry loop and EventWaitHandle.
  - One numeric definition with:
    - `PLANE BANK DEGREES` degrees
    - `INDICATED ALTITUDE` feet
    - `AIRSPEED INDICATED` knots
    - `PLANE HEADING DEGREES MAGNETIC` degrees
    - `TURN COORDINATOR BALL` position
    - `PLANE ALT ABOVE GROUND` feet
    - `TOTAL WEIGHT` pounds
    - `SIM ON GROUND` bool
    - `IS SLEW ACTIVE` bool
    - `SIMULATION RATE` number
  - A separate `TITLE` STRING256 definition.
  - Request both on `SIMCONNECT_PERIOD.VISUAL_FRAME`, interval 4.
  - `SubscribeToSystemEvent("Pause")` for `pausa`.
  - HTTP: a `TcpListener` on `IPAddress.Loopback`, port 8766, with a minimal HTTP/1.1 responder. Don't use `HttpListener`, because it needs a URL ACL without admin. Thread-safe latest-sample field.
  - **CORS:** if the request `Origin` is `https://villanueva-aviation.pages.dev` or `http://localhost:5180`, echo it in `Access-Control-Allow-Origin`, plus `Vary: Origin` and `Access-Control-Allow-Private-Network: true` on preflight. Other origins get no CORS headers.
  - `--simulado`: no SimConnect; loops `simularManiobra`'s scenario in C#. It's the left turn with a 130 ft dip at 90°, then a clean right turn, repeating every 90 s, so the page can be previewed without MSFS.
  - `--simulado-limpio`: the same loop without the dip, so it passes. Task 7 uses it.
- [ ] **Step 3: Build and smoke test.** Run `python -I tools/instructor-lector/build.py`. Start `out/VillanuevaInstructorLector.exe --simulado` in the background, then:
  - `curl.exe -s http://127.0.0.1:8766/muestra`. Expected: JSON with `"conectado":true` and all 13 keys.
  - `curl.exe -s -i -X OPTIONS -H "Origin: http://localhost:5180" -H "Access-Control-Request-Private-Network: true" http://127.0.0.1:8766/muestra`. Expected: `Access-Control-Allow-Origin: http://localhost:5180` and `Access-Control-Allow-Private-Network: true`.
  - The same with `Origin: https://evil.example`. Expected: no `Access-Control-Allow-Origin`.

  Then stop the process.
- [ ] **Step 4:** Commit the `.cs`, `build.py`, `LEEME.txt`, `.bat` and `.gitignore` (not the zip yet; Task 7 adds it) with the message "Add the local simulator reader for the virtual instructor".

---

### Task 5: Attempts in Supabase

**Files:**
- Create: `supabase/migrations/0022_intentos_maniobra.sql`
- Create: `src/features/instructor/intentos.ts`
- Create: `src/features/instructor/reglasIntentos.ts`
- Create: `src/features/instructor/reglasIntentos.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Resultado` (Task 2).
- Produces:

```ts
export type Revision = "sin_mandar" | "mandado" | "aprobado" | "no_aprobado";
export interface IntentoManiobra {
  id: string; user_id: string; maniobra: string; avion: string;
  modo: "practica" | "checkride"; calificacion: number; aprobado: boolean;
  elementos: Record<CodigoAcs, "S" | "NS">; detalle: Resultado;
  revision: Revision; revisado_at: string | null; created_at: string;
}
// reglasIntentos.ts (puras)
export function puedeMandar(i: Pick<IntentoManiobra, "modo" | "aprobado" | "revision">): boolean;
export function insigniaManiobraGanada(intentos: Pick<IntentoManiobra, "maniobra" | "revision">[], maniobra: string): boolean;
export function folio(id: string): string;      // "VA-" + id[0..4] + "-" + id[4..8], en mayúsculas
export function resumenProgreso(intentos: IntentoManiobra[]): { intentos: { n: number; calificacion: number; modo: string }[]; mejor: number | null; masFallada: string | null };
// intentos.ts (Supabase; patrón de rutaRed/pruebasRed.ts: lanzar en lecturas, { error } en escrituras)
export async function guardarIntento(input: { maniobra: string; avion: string; modo: "practica" | "checkride"; resultado: Resultado }): Promise<{ id: string | null; error: string | null }>;
export async function fetchMisIntentosManiobra(maniobra: string): Promise<IntentoManiobra[]>;
export async function mandarARevision(id: string): Promise<{ error: string | null }>;
export async function fetchPorRevisar(): Promise<IntentoManiobra[]>;   // fundador
export async function contarPorRevisar(): Promise<number>;             // fundador
export async function revisarIntento(id: string, aprobado: boolean): Promise<{ error: string | null }>;
```

**Migration:**
- Table `public.intentos_maniobra` with the columns above.
  - `revision` defaults to `'sin_mandar'` with a check constraint.
  - `detalle` is jsonb. Store `Resultado` with `muestras` replaced by the Task 3 series of the four fields, to keep rows small.
- Index on `user_id`.
- RLS:
  - Owner select; founder select all.
  - Owner insert only with `revision = 'sin_mandar'`.
  - Owner update only `revision` from `sin_mandar` to `mandado`, and only when `modo = 'checkride' and aprobado`.
  - Founder update.
  - No delete.
- A `before update` trigger in the 0019 cancel-trigger style rejects any other column change by a non-founder `authenticated` user. It also sets `revisado_at = now()` when the founder sets `aprobado`/`no_aprobado`.
- The header comment says to run it in Dashboard → SQL Editor.

- [ ] **Step 1: Write failing tests** for the pure rules:
  - `puedeMandar` is true only for `{ modo: "checkride", aprobado: true, revision: "sin_mandar" }`; it's false for practice, failed, or already `mandado`.
  - `insigniaManiobraGanada` is true only when some attempt of that maneuver has `revision === "aprobado"`.
  - `folio("7f3k2611-aaaa-...")` gives `"VA-7F3K-2611"`.
  - `resumenProgreso` numbers attempts 1..n in date order, `mejor` is the max, and `masFallada` is the tolerance with most NS across attempts, in Spanish ("altitud", "velocidad", "inclinación", "coordinación", "rumbo de salida").
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement `reglasIntentos.ts`, `intentos.ts` and the migration.
- [ ] **Step 4:** Run `npm.cmd test` and `npx tsc -b --noEmit`. Expected: PASS.
- [ ] **Step 5:** Commit the five files with the message "Store steep turn attempts and their review state".

---

### Task 6: Instructor page

**Files:**
- Create: `src/features/instructor/useLector.ts`
- Create: `src/features/instructor/Grafica.tsx`
- Create: `src/features/instructor/HojaCheckride.tsx`
- Create: `src/features/instructor/ReporteExamen.tsx`
- Create: `src/features/instructor/Progreso.tsx`
- Create: `src/pages/InstructorVirajeEscarpado.tsx`
- Modify:
  - `src/lib/routes.ts` (`instructorVirajeEscarpado: "/instructor/viraje-escarpado"`)
  - `src/App.tsx` (lazy import, `TITULOS` entry "Instructor virtual: viraje escarpado del C172 — Villanueva Aviation", Route wrapped in `ProtectedRoute`)
  - `src/data/secciones.ts` (card in Aprende; image `/images/descargas-simhub-c172.jpg`)

**Interfaces:**
- Consumes: Tasks 1, 2, 3 and 5.
- Produces:
  - `useLector(): { estado: "sin-lector" | "sin-simulador" | "conectado"; muestra: Muestra | null }`. It polls `http://127.0.0.1:8766/muestra` every 100 ms with `fetch`; a failure gives `sin-lector`. Stop polling when the tab is hidden.
  - `<Grafica puntos={serie} tol={number} titulo={string} />`: plain SVG, no chart library. Green tolerance band, out-of-tolerance in red, and the worst point labeled. Same look as the approved mockup B.
  - `<HojaCheckride resultado={Resultado} />` (mockup A)
  - `<ReporteExamen resultado={Resultado} intento={IntentoManiobra} nombre={string} />` (the approved FAA-inspired report)
  - `<Progreso intentos={IntentoManiobra[]} />`

**Page behavior:**
1. **Connection banner.**
   - `sin-lector`: link to the Descargas entry plus one line about Chrome/Edge asking "acceso a la red local" the first time.
   - `sin-simulador`: "Abre MSFS 2020 y entra a un vuelo con el C172."
2. **Mode selector:** Práctica / Checkride. Then "Armar maniobra", which calls `armar`, and a visible `fase` with a short instruction per phase ("Haz tus virajes de limpieza y entra a 45°", "Ahora al lado contrario", …).
3. **Práctica:**
   - while a tolerance is out, a large warning naming it ("Estás perdiendo altitud");
   - a 440 Hz WebAudio beep, at most once per second;
   - a "Sonido" toggle remembered in `localStorage`, wrapped in try/catch.
4. **Checkride:** only "Checkride en curso" until the end.
5. **On `terminado` or `invalido`:**
   - Show the result in this order: HojaCheckride, the explanation (`explicar`/`repetir`, styled like mockup C, score out of 100), four Graficas per side, ReporteExamen. If invalid, show the reason instead.
   - Call `guardarIntento` once. If it fails, show the error and a "Reintentar guardar" button; never lose the result on screen.
6. **ReporteExamen:**
   - Title "AVISO DE NO APROBACIÓN" with "Áreas a re-examinar: …" listing the NS codes, or "EXAMEN PRÁCTICO APROBADO" with calificación and `folio(id)`.
   - "Revisó: Erik Villanueva" only when `revision === "aprobado"`.
   - The exact disclaimer footer.
   - "Descargar PDF" calls `window.print()` with `@media print` that hides everything except the report.
7. **"Mandar a revisión":** enabled only if `puedeMandar`. Then it shows "Mandado. Erik lo revisa para tu insignia."
8. **`<Progreso>`** below, from `fetchMisIntentosManiobra("viraje-escarpado")`.

- [ ] **Step 1:** Implement the components and the page.
- [ ] **Step 2:** Run `npx tsc -b --noEmit` and `npm.cmd run build`. Expected: no errors.
- [ ] **Step 3: Verify in the browser.**
  - Start the reader with `--simulado`, start the dev server (`preview_start`), sign in as Erik (he does it himself), and open `/instructor/viraje-escarpado`.
  - Arm in Práctica, wait for one simulated cycle (about 90 s), and confirm:
    - the warning appears during the left dip;
    - the result shows S5 NS, "presión atrás", the red stretch on the left altitude graph, and "AVISO DE NO APROBACIÓN";
    - the attempt appears in Progreso.
  - Check 375 px width with no horizontal scroll, and the print preview showing only the report.
  - Screenshot for Erik.
- [ ] **Step 4:** Commit the listed files with the message "Add the virtual instructor page for the C172 steep turn".

---

### Task 7: Founder review, badge, download

**Files:**
- Create: `src/pages/AdminManiobras.tsx`
- Modify:
  - `src/lib/routes.ts` (`adminManiobras: "/admin/maniobras"`)
  - `src/App.tsx` (route like `adminVuelosPractica`)
  - `src/features/admin/usePendientesFundador.ts` (add `maniobrasPendientes` from `contarPorRevisar` into `totalPendientes`)
  - `src/pages/Perfil.tsx` (a logro like `logroRed`)
  - `src/data/descargas.ts` (entry under "Herramientas")
  - the admin nav, wherever `adminVuelosPractica` is linked

**Interfaces:**
- Consumes: Task 5 (`fetchPorRevisar`, `revisarIntento`, `insigniaManiobraGanada`, `fetchMisIntentosManiobra`) and Task 6 (`ReporteExamen`).

**Details:**
- **AdminManiobras:** lists `mandado` attempts (cadet, date, score) and expands each to its `ReporteExamen`. Buttons "Aprobar insignia" and "No aprobar" call `revisarIntento`.
- **Perfil logro:**
  - `id: "maniobra-viraje-escarpado-c172"`, `titulo: "Viraje escarpado · C172"`, `icon: Plane`.
  - `descripcion: "Se gana cuando Erik revisa y aprueba tu checkride del instructor virtual. Práctica en simulador, no es una evaluación oficial."`
  - `desbloqueado` via `insigniaManiobraGanada`. A fetch error is treated as not earned, like `logroRed`.
- **Descargas entry:**
  - `id: "instructor-lector"`, `nombre: "Lector del instructor virtual"`, `version: "v1.0"`, date = commit date.
  - `archivoHref: "/downloads/villanueva-instructor-lector.zip"`, `imagen: "/images/descargas-simhub-c172.jpg"`.
  - Description: "Conecta tu MSFS 2020 con el instructor virtual del sitio. Gratis, no necesita SimHub."

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Run `python -I tools/instructor-lector/build.py` to produce the zip. Open it and list its contents: exe, the two SimConnect DLLs and their C++ runtime DLLs, `LEEME.txt`, and the `.bat`. Nothing else.
- [ ] **Step 3:** Run `npx tsc -b --noEmit`, `npm.cmd test` and `npm.cmd run build`. Then in the browser, as the founder: send the Task 6 attempt to review (only possible for a passed checkride, so run one `--simulado-limpio` cycle in Checkride mode). Approve it in `/admin/maniobras`, and confirm the badge shows in `/perfil` and "Revisó: Erik Villanueva" appears on the report.
- [ ] **Step 4:** Commit the listed files plus `public/downloads/villanueva-instructor-lector.zip` with the message "Let Erik review steep turn checkrides and award the badge".

---

## After all tasks

- Tell Erik to run `0022_intentos_maniobra.sql` in Supabase SQL Editor before testing on production.
- Ask for "Sí, súbelo" before pushing.
- Erik then flies it for real in MSFS. Tune `NS_SEGUNDOS`, `NS_FACTOR` and `BOLA_TOLERANCIA` from his feedback.
- Confirm pending item 4 of the spec: bank and ball read correctly in the classic C172 and in the G1000.
