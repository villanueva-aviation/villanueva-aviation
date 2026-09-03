# Circuito de tráfico: recorrido y práctica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-mode interactive widget to the "Comunicaciones" Academia module: "Aprende el recorrido" (step through the 5 traffic-pattern legs) and "Ponte a prueba" (click the correct leg on a board given a random situation).

**Architecture:** A data file holds the 5 legs and the quiz question pool. A single React component renders a shared SVG/positioned-points board and switches between the two modes with local state — no backend, no persistence, mirrors the existing `AudioPhraseology`/`ScenarioSimulator` widget patterns already in this codebase.

**Tech Stack:** React 19 + TypeScript + Vite, Tailwind v4 utility classes, inline SVG (percentage-based `viewBox="0 0 100 100"` matching the existing `xPct`/`yPct` hotspot convention from `AirplaneDiagram.tsx`).

**Spec:** [docs/superpowers/specs/2026-09-03-circuito-trafico-design.md](../specs/2026-09-03-circuito-trafico-design.md)

## Global Constraints

- 5 legs, in this exact order: Viento en Cara (Upwind) → Viento Cruzado (Crosswind) → Viento en cola (Downwind) → Base → Final.
- One widget, two modes, switched with pill-style buttons below the board (same visual pattern as `AudioPhraseology`'s "Escuchar"/"Practica hablando" buttons).
- "Ponte a prueba" is unlimited/random with no end screen and no score persistence — practice only, never written to `ProgressContext` or Supabase.
- No automated test for the widget itself (UI-only, matches the existing no-test precedent for `ScenarioSimulator`/`TermMatch` in this codebase).

---

## Task 1: Traffic pattern data

**Files:**
- Create: `src/data/circuitoTrafico.ts`

**Interfaces:**
- Produces: `TramoCircuito { id, numero, nombre, nombreIngles, xPct, yPct, queHace, reporteRadio }`, `SituacionCircuito { id, prompt, tramoCorrectoId }`, `TRAMOS_CIRCUITO: TramoCircuito[]` (5 entries), `SITUACIONES_CIRCUITO: SituacionCircuito[]` (10 entries) — Task 2's component imports all four names directly from this file.

- [ ] **Step 1: Create the data file**

Create `src/data/circuitoTrafico.ts`:

```ts
export interface TramoCircuito {
  id: string;
  numero: number;
  nombre: string;
  nombreIngles: string;
  xPct: number;
  yPct: number;
  queHace: string;
  reporteRadio: string;
}

export interface SituacionCircuito {
  id: string;
  prompt: string;
  tramoCorrectoId: string;
}

export const TRAMOS_CIRCUITO: TramoCircuito[] = [
  {
    id: "viento-en-cara",
    numero: 1,
    nombre: "Viento en Cara",
    nombreIngles: "Upwind",
    xPct: 50,
    yPct: 35,
    queHace: "Mantén el rumbo de pista y sigue ascendiendo hasta acercarte a la altitud de circuito (usualmente 1000 pies AGL), preparándote para el primer viraje de 90° hacia viento cruzado.",
    reporteRadio: "No suele haber un reporte de radio aquí — ya despegaste con autorización de torre o anunciaste tu salida en la frecuencia CTAF.",
  },
  {
    id: "viento-cruzado",
    numero: 2,
    nombre: "Viento Cruzado",
    nombreIngles: "Crosswind",
    xPct: 50,
    yPct: 15,
    queHace: "Viras 90° al llegar cerca de la altitud de circuito y continúas ascendiendo hasta alcanzarla por completo antes del siguiente viraje.",
    reporteRadio: "Torre, XB-VLA, viento cruzado pista 20.",
  },
  {
    id: "viento-en-cola",
    numero: 3,
    nombre: "Viento en cola",
    nombreIngles: "Downwind",
    xPct: 81,
    yPct: 15,
    queHace: "Vuelas paralelo a la pista, en sentido contrario a tu despegue, manteniendo la altitud de circuito — aquí completas tu checklist previo a aterrizaje (mezcla, mandos, luces).",
    reporteRadio: "Torre, XB-VLA, viento en cola pista 20.",
  },
  {
    id: "base",
    numero: 4,
    nombre: "Base",
    nombreIngles: "Base",
    xPct: 81,
    yPct: 73,
    queHace: "Viras 90° hacia la pista, inicias el descenso y ajustas flaps según tu procedimiento, buscando alinear tu tramo final con el eje de pista.",
    reporteRadio: "Torre, XB-VLA, base pista 20.",
  },
  {
    id: "final",
    numero: 5,
    nombre: "Final",
    nombreIngles: "Final",
    xPct: 50,
    yPct: 73,
    queHace: "Alineado con el eje de pista, en descenso estabilizado hacia el punto de aterrizaje, confirmas autorización de aterrizaje antes de cruzar el umbral.",
    reporteRadio: "Torre, XB-VLA, final pista 20.",
  },
];

export const SITUACIONES_CIRCUITO: SituacionCircuito[] = [
  { id: "sit-1", prompt: "Acabas de despegar y sigues alineado con el eje de pista, ganando altitud antes del primer viraje. ¿En qué tramo estás?", tramoCorrectoId: "viento-en-cara" },
  { id: "sit-2", prompt: "Estás a la altitud de despegue, todavía sin haber virado, justo después de cruzar el umbral de pista. ¿Qué tramo es este?", tramoCorrectoId: "viento-en-cara" },
  { id: "sit-3", prompt: "Escuchas: \"Torre, XB-VLA, viento cruzado pista 20.\" ¿En qué tramo está ese avión?", tramoCorrectoId: "viento-cruzado" },
  { id: "sit-4", prompt: "Acabas de virar 90° tras el despegue y sigues ascendiendo hacia la altitud de circuito. ¿Qué tramo es?", tramoCorrectoId: "viento-cruzado" },
  { id: "sit-5", prompt: "Escuchas: \"Torre, XB-VLA, viento en cola pista 20.\" ¿En qué tramo está?", tramoCorrectoId: "viento-en-cola" },
  { id: "sit-6", prompt: "Vuelas paralelo a la pista, en sentido contrario a tu despegue, completando tu checklist previo a aterrizaje. ¿Qué tramo es?", tramoCorrectoId: "viento-en-cola" },
  { id: "sit-7", prompt: "Escuchas: \"Torre, XB-VLA, base pista 20.\" ¿En qué tramo está?", tramoCorrectoId: "base" },
  { id: "sit-8", prompt: "Acabas de virar hacia la pista y comienzas a descender, bajando flaps. ¿Qué tramo es?", tramoCorrectoId: "base" },
  { id: "sit-9", prompt: "Escuchas: \"Torre, XB-VLA, final pista 20.\" ¿En qué tramo está?", tramoCorrectoId: "final" },
  { id: "sit-10", prompt: "Estás alineado con el eje de pista, en descenso estabilizado, a punto de cruzar el umbral. ¿Qué tramo es?", tramoCorrectoId: "final" },
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: PASS, zero errors (this file has no consumers yet, so it can only fail on its own syntax/types).

- [ ] **Step 3: Commit**

```bash
git add src/data/circuitoTrafico.ts
git commit -m "feat: add traffic pattern legs and quiz situations data"
```

---

## Task 2: The CircuitoTrafico widget

**Files:**
- Create: `src/features/academia/CircuitoTrafico.tsx`

**Interfaces:**
- Consumes: `TRAMOS_CIRCUITO`, `SITUACIONES_CIRCUITO`, `SituacionCircuito` from `../../data/circuitoTrafico` (Task 1).
- Produces: `CircuitoTrafico({ onComplete }: { onComplete?: () => void })` — a default-exportable-by-name component (named export, matching every other widget in this codebase) — Task 3 imports and renders it with no other props.

- [ ] **Step 1: Create the component**

Create `src/features/academia/CircuitoTrafico.tsx`:

```tsx
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { SITUACIONES_CIRCUITO, TRAMOS_CIRCUITO, type SituacionCircuito } from "../../data/circuitoTrafico";

function elegirSituacionAleatoria(excluirId?: string): SituacionCircuito {
  const opciones = excluirId
    ? SITUACIONES_CIRCUITO.filter((s) => s.id !== excluirId)
    : SITUACIONES_CIRCUITO;
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function TableroCircuito({
  tramoActivoId,
  tramoCorrectoId,
  tramoIncorrectoId,
  onClickTramo,
}: {
  tramoActivoId?: string;
  tramoCorrectoId?: string;
  tramoIncorrectoId?: string;
  onClickTramo?: (id: string) => void;
}) {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect x="44" y="35" width="12" height="38" className="fill-white/10" />
        <polyline points="50,35 50,15 81,15 81,73 50,73" fill="none" className="stroke-white/20" strokeWidth="1" />
        <line x1="50" y1="73" x2="50" y2="35" className="stroke-white/10" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
      {TRAMOS_CIRCUITO.map((tramo) => {
        const esActivo = tramo.id === tramoActivoId;
        const esCorrecto = tramo.id === tramoCorrectoId;
        const esIncorrecto = tramo.id === tramoIncorrectoId;
        return (
          <button
            key={tramo.id}
            onClick={() => onClickTramo?.(tramo.id)}
            aria-label={tramo.nombre}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${tramo.xPct}%`, top: `${tramo.yPct}%` }}
          >
            {(esActivo || esCorrecto) && (
              <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-gold-500/50" />
            )}
            <span
              className={`relative block h-5 w-5 rounded-full border-2 border-navy-950 transition-colors duration-200 ${
                esCorrecto
                  ? "bg-emerald-400"
                  : esIncorrecto
                    ? "bg-red-400"
                    : esActivo
                      ? "bg-gold-500"
                      : "bg-gold-500/40 hover:bg-gold-400/70"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function CircuitoTrafico({ onComplete }: { onComplete?: () => void }) {
  const [modo, setModo] = useState<"aprende" | "prueba">("aprende");

  const [paradaActiva, setParadaActiva] = useState(1);
  const tramoActivo = TRAMOS_CIRCUITO.find((t) => t.numero === paradaActiva)!;

  const [situacionActual, setSituacionActual] = useState<SituacionCircuito>(() => elegirSituacionAleatoria());
  const [tramoElegidoId, setTramoElegidoId] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [intentos, setIntentos] = useState(0);

  const respondioCorrecto = tramoElegidoId !== null && tramoElegidoId === situacionActual.tramoCorrectoId;
  const respondioIncorrecto = tramoElegidoId !== null && !respondioCorrecto;

  function cambiarModo(nuevo: "aprende" | "prueba") {
    setModo(nuevo);
    if (nuevo === "prueba") {
      setSituacionActual(elegirSituacionAleatoria());
      setTramoElegidoId(null);
      setAciertos(0);
      setIntentos(0);
    }
  }

  function siguienteParada() {
    if (paradaActiva >= TRAMOS_CIRCUITO.length) {
      onComplete?.();
      return;
    }
    setParadaActiva((p) => p + 1);
  }

  function anteriorParada() {
    setParadaActiva((p) => Math.max(1, p - 1));
  }

  function elegirTramo(id: string) {
    if (tramoElegidoId !== null) return;
    setTramoElegidoId(id);
    setIntentos((i) => i + 1);
    if (id === situacionActual.tramoCorrectoId) {
      setAciertos((a) => a + 1);
      setTimeout(() => {
        setSituacionActual((actual) => elegirSituacionAleatoria(actual.id));
        setTramoElegidoId(null);
      }, 1000);
    }
  }

  function siguienteSituacion() {
    setSituacionActual((actual) => elegirSituacionAleatoria(actual.id));
    setTramoElegidoId(null);
  }

  const tramoCorrectoInfo = TRAMOS_CIRCUITO.find((t) => t.id === situacionActual.tramoCorrectoId)!;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      {modo === "prueba" && (
        <p className="mb-3 text-xs text-white/50">
          {aciertos} de {intentos} correctas
        </p>
      )}

      {modo === "aprende" ? (
        <p className="mb-4 text-sm leading-relaxed text-white/80">
          Parada {tramoActivo.numero} de {TRAMOS_CIRCUITO.length}
        </p>
      ) : (
        <p className="mb-4 text-sm leading-relaxed text-white/80">{situacionActual.prompt}</p>
      )}

      <TableroCircuito
        tramoActivoId={modo === "aprende" ? tramoActivo.id : undefined}
        tramoCorrectoId={modo === "prueba" && tramoElegidoId !== null ? situacionActual.tramoCorrectoId : undefined}
        tramoIncorrectoId={modo === "prueba" && respondioIncorrecto ? (tramoElegidoId ?? undefined) : undefined}
        onClickTramo={modo === "prueba" ? elegirTramo : undefined}
      />

      {modo === "aprende" && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="font-display text-sm font-semibold text-white">
            {tramoActivo.nombre} <span className="text-white/40">({tramoActivo.nombreIngles})</span>
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{tramoActivo.queHace}</p>
          <p className="mt-2 text-xs text-gold-400">{tramoActivo.reporteRadio}</p>
        </div>
      )}

      {modo === "prueba" && tramoElegidoId !== null && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          {respondioCorrecto ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">{respondioCorrecto ? "¡Correcto!" : "No era ese tramo"}</p>
            {respondioIncorrecto && (
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                Era {tramoCorrectoInfo.nombre}: {tramoCorrectoInfo.queHace}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => cambiarModo("aprende")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              modo === "aprende"
                ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Aprende el recorrido
          </button>
          <button
            onClick={() => cambiarModo("prueba")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              modo === "prueba"
                ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Ponte a prueba
          </button>
        </div>

        {modo === "aprende" && (
          <div className="flex gap-2">
            <button
              onClick={anteriorParada}
              disabled={paradaActiva === 1}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Anterior
            </button>
            <button
              onClick={siguienteParada}
              className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Siguiente <ChevronRight size={15} />
            </button>
          </div>
        )}

        {modo === "prueba" && respondioIncorrecto && (
          <button
            onClick={siguienteSituacion}
            className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: PASS, zero errors. This component has no consumers yet, so this only checks its own syntax/types are sound (unused-export warnings, if any, are expected until Task 3 wires it in — `noUnusedLocals`/`noUnusedParameters` in this project's tsconfig apply to locals and parameters, not to an unused named export, so this should compile clean).

- [ ] **Step 3: Commit**

```bash
git add src/features/academia/CircuitoTrafico.tsx
git commit -m "feat: add CircuitoTrafico widget with Aprende/Prueba modes"
```

---

## Task 3: Wire into the Comunicaciones module

**Files:**
- Modify: `src/data/academia.ts:21` (the `InteractividadTipo` union)
- Modify: `src/data/academia.ts:131-137` (the `comunicaciones` module's `actividades` array)
- Modify: `src/pages/AcademiaModulo.tsx:1-37` (imports and `INTERACTIVIDAD_INTRO`)
- Modify: `src/pages/AcademiaModulo.tsx:56-77` (the `InteractividadWidget` switch)

**Interfaces:**
- Consumes: `CircuitoTrafico` from `../features/academia/CircuitoTrafico` (Task 2).

- [ ] **Step 1: Add "circuito" to the InteractividadTipo union**

In `src/data/academia.ts`, replace:

```ts
export type InteractividadTipo = "diagrama" | "dragdrop" | "escenario" | "slider" | "audio" | "terminos";
```

with:

```ts
export type InteractividadTipo = "diagrama" | "dragdrop" | "escenario" | "slider" | "audio" | "terminos" | "circuito";
```

- [ ] **Step 2: Add the new activity to the comunicaciones module**

In `src/data/academia.ts`, replace:

```ts
    actividades: [
      ...leccionesDeTemas("comunicaciones"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Práctica de fraseología con audio", widget: "audio" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: simulacro de llamadas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Comunicaciones" },
    ],
```

with:

```ts
    actividades: [
      ...leccionesDeTemas("comunicaciones"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Práctica de fraseología con audio", widget: "audio" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-3", tipo: "interactividad", titulo: "Circuito de tráfico: recorrido y práctica", widget: "circuito" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: simulacro de llamadas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Comunicaciones" },
    ],
```

(This block appears once in the file, inside the `comunicaciones` module object — locate it by its unique `"Práctica de fraseología con audio"` line if line numbers have drifted from earlier edits to this file.)

- [ ] **Step 3: Import CircuitoTrafico and add its intro text**

In `src/pages/AcademiaModulo.tsx`, replace:

```tsx
import { AudioPhraseology } from "../features/academia/AudioPhraseology";
import { TermMatch } from "../features/academia/TermMatch";
```

with:

```tsx
import { AudioPhraseology } from "../features/academia/AudioPhraseology";
import { CircuitoTrafico } from "../features/academia/CircuitoTrafico";
import { TermMatch } from "../features/academia/TermMatch";
```

Then replace:

```ts
const INTERACTIVIDAD_INTRO: Record<InteractividadTipo, string> = {
  diagrama: "Explora el diagrama y haz clic en cada componente para conocer su función.",
  dragdrop: "Practica una vez más, esta vez arrastrando el nombre correcto a su lugar en la aeronave.",
  escenario: "Toma decisiones en un escenario de vuelo y descubre las consecuencias de cada una.",
  slider: "Mueve el control y observa en vivo cómo cambian las variables involucradas.",
  audio: "Escucha la fraseología correcta y compárala con lo que tú dirías en cada situación.",
  terminos: "Relaciona cada término con su definición correcta.",
};
```

with:

```ts
const INTERACTIVIDAD_INTRO: Record<InteractividadTipo, string> = {
  diagrama: "Explora el diagrama y haz clic en cada componente para conocer su función.",
  dragdrop: "Practica una vez más, esta vez arrastrando el nombre correcto a su lugar en la aeronave.",
  escenario: "Toma decisiones en un escenario de vuelo y descubre las consecuencias de cada una.",
  slider: "Mueve el control y observa en vivo cómo cambian las variables involucradas.",
  audio: "Escucha la fraseología correcta y compárala con lo que tú dirías en cada situación.",
  terminos: "Relaciona cada término con su definición correcta.",
  circuito: "Recorre el circuito de tráfico paso a paso, luego pon a prueba tu ubicación.",
};
```

- [ ] **Step 4: Add the switch case**

In `src/pages/AcademiaModulo.tsx`, replace:

```tsx
    case "audio":
      return <AudioPhraseology onComplete={onComplete} />;
    case "terminos": {
      const pairs = MODULE_TERMS[actividad.termSetId ?? modulo.slug] ?? [];
      return <TermMatch pairs={pairs} onComplete={onComplete} />;
    }
    case "diagrama":
    default:
      return <AirplaneDiagram />;
```

with:

```tsx
    case "audio":
      return <AudioPhraseology onComplete={onComplete} />;
    case "terminos": {
      const pairs = MODULE_TERMS[actividad.termSetId ?? modulo.slug] ?? [];
      return <TermMatch pairs={pairs} onComplete={onComplete} />;
    }
    case "circuito":
      return <CircuitoTrafico onComplete={onComplete} />;
    case "diagrama":
    default:
      return <AirplaneDiagram />;
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run build`
Expected: PASS, zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/data/academia.ts src/pages/AcademiaModulo.tsx
git commit -m "feat: wire CircuitoTrafico into the Comunicaciones module"
```

---

## Task 4: Manual verification in the browser

**Files:** none (verification only)

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`, sign in as a test cadet (needed — `/academia/:slug` is behind `ProtectedRoute`), and navigate to `/academia/comunicaciones`.

- [ ] **Step 2: Reach the new activity**

Go through the module stepper to the "Interactividad" stage. Confirm three interactividad cards appear: "Práctica de fraseología con audio", "Relaciona los términos clave", and the new "Circuito de tráfico: recorrido y práctica" with its intro text ("Recorre el circuito de tráfico paso a paso, luego pon a prueba tu ubicación.").

- [ ] **Step 3: Verify "Aprende el recorrido"**

Confirm it opens on "Aprende el recorrido" by default, showing parada 1 de 5 with "Viento en Cara (Upwind)" and its `queHace`/`reporteRadio` text, and the first board point highlighted gold with a pulse. Click "Siguiente" through all 5 paradas, confirming the highlighted point and card content update each time and "Anterior" is disabled only on parada 1. Confirm clicking "Siguiente" on parada 5 does not error (no visible change is expected beyond marking the activity complete internally).

- [ ] **Step 4: Verify "Ponte a prueba"**

Click "Ponte a prueba". Confirm a random situation prompt appears above the board and the "0 de 0 correctas" counter shows. Click a board point:
- On a correct click: confirm the point turns green briefly, "¡Correcto!" appears, and after about a second a new random situation loads automatically with the counter now "1 de 1 correctas".
- On an incorrect click: confirm the clicked point turns red, the correct point turns green, an explanation appears ("Era <tramo>: <queHace>"), and a "Siguiente" button appears that loads a new situation only when clicked.

- [ ] **Step 5: Verify mode switching resets state**

While mid-quiz (after answering at least one question), click back to "Aprende el recorrido", then click "Ponte a prueba" again. Confirm the counter resets to "0 de 0 correctas" and a fresh situation loads.

- [ ] **Step 6: Report back**

Summarize what was checked and any issues found — no commit for this task, it's verification only.
