# Simulador de radiocomunicaciones ATC con voz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in "practice speaking" mode to `AudioPhraseology`: the student records their radio call, the browser transcribes it (Web Speech API), and the checklist of expected elements is marked ✓/✗ based on keyword matches.

**Architecture:** A pure evaluation function (`evaluarRespuesta`) compares a transcript against per-element keyword lists. A React hook (`useSpeechRecognition`) wraps the browser's `SpeechRecognition` API. Both are wired into the existing `AudioPhraseology` component as additive UI — nothing about the current read/reveal flow changes when the student doesn't use the mic.

**Tech Stack:** React 19 + TypeScript, Web Speech API (browser-native, no new dependency), Node's built-in `node:test` runner for the one pure-function test (no test framework exists in this repo yet — adding vitest/jest for a single test file would be a new dependency for something the stdlib already covers).

**Spec:** [docs/superpowers/specs/2026-09-02-atc-voice-phraseology-design.md](../specs/2026-09-02-atc-voice-phraseology-design.md)

## Global Constraints

- Web Speech API only — no backend, no external voice-to-text API.
- Evaluation is by keyword presence per element, not whole-text similarity scoring.
- Keyword lists are hand-written per card, not derived automatically from `callout`.
- Voice mode is additive: hidden entirely when `SpeechRecognition` isn't supported; never blocks "mostrar texto" / "siguiente situación".
- `lang: "es-MX"` for both speech synthesis (existing) and recognition (new).

---

## Task 1: Migrate `PhraseologyCard.elementos` to a structured type

**Files:**
- Modify: `src/features/academia/AudioPhraseology.tsx`

**Interfaces:**
- Produces: `PhraseologyElement { descripcion: string; palabrasClave: string[] }`, and `PhraseologyCard.elementos: PhraseologyElement[]` (previously `string[]`) — every later task and every data file importing `PhraseologyCard` depends on this shape.

This task only changes the type and the minimal rendering needed to keep the app compiling — it does **not** add the voice mode yet. `DEFAULT_CARDS` (the fallback data baked into this file) is migrated as part of this task since it lives in the same file.

- [ ] **Step 1: Add the `PhraseologyElement` type and update `PhraseologyCard`**

In `src/features/academia/AudioPhraseology.tsx`, replace lines 4-8:

```ts
export interface PhraseologyCard {
  situacion: string;
  callout: string;
  elementos: string[];
}
```

with:

```ts
export interface PhraseologyElement {
  descripcion: string;
  palabrasClave: string[];
}

export interface PhraseologyCard {
  situacion: string;
  callout: string;
  elementos: PhraseologyElement[];
}
```

- [ ] **Step 2: Migrate `DEFAULT_CARDS` to the new shape**

Replace the `DEFAULT_CARDS` array (lines 10-26) with:

```ts
const DEFAULT_CARDS: PhraseologyCard[] = [
  {
    situacion: "Estás en la plataforma de MMGL, listo para solicitar rodaje hacia la pista activa.",
    callout: "Guadalajara Torre, XB-VLA, plataforma de aviación general, solicito rodaje, con información Alfa.",
    elementos: [
      { descripcion: "A quién llamas (Torre)", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación (XB-VLA)", palabrasClave: ["xb vla", "xb-vla", "equis be uve ele a"] },
      { descripcion: "Tu posición", palabrasClave: ["plataforma", "aviación general", "aviacion general"] },
      { descripcion: "Qué necesitas (rodaje)", palabrasClave: ["rodaje", "solicito rodaje"] },
    ],
  },
  {
    situacion: "Vas a ingresar a la frecuencia de un aeródromo no controlado para anunciar tu llegada.",
    callout: "Tráfico Manzanillo, XB-VLA, a 10 millas al norte, descendiendo para entrar al circuito de tráfico, Manzanillo.",
    elementos: [
      { descripcion: "A quién llamas (tráfico en la frecuencia)", palabrasClave: ["tráfico", "trafico"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas", "norte"] },
      { descripcion: "Tu intención", palabrasClave: ["circuito de tráfico", "circuito de trafico", "entrar al circuito"] },
    ],
  },
  {
    situacion: "El controlador te autoriza a despegar. Debes confirmar la instrucción (read-back).",
    callout: "Autorizado a despegar pista 20, XB-VLA.",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a despegar", "autorizado despegar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
    ],
  },
];
```

- [ ] **Step 3: Update the checklist rendering to use `.descripcion`**

Replace lines 103-109 (the `<ul>` inside the revealed block):

```tsx
          <ul className="mt-3 flex flex-col gap-1.5">
            {card.elementos.map((el) => (
              <li key={el} className="flex items-center gap-2 text-xs text-white/60">
                <Check size={12} className="shrink-0 text-gold-400" /> {el}
              </li>
            ))}
          </ul>
```

with:

```tsx
          <ul className="mt-3 flex flex-col gap-1.5">
            {card.elementos.map((el) => (
              <li key={el.descripcion} className="flex items-center gap-2 text-xs text-white/60">
                <Check size={12} className="shrink-0 text-gold-400" /> {el.descripcion}
              </li>
            ))}
          </ul>
```

- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: fails on `src/data/fraseologiaATC.ts` and `src/data/checkrideOral.ts` (still using `elementos: string[]`) — this is expected until Tasks 2 and 3 migrate them. Confirm the *only* errors are in those two files, not in `AudioPhraseology.tsx` itself.

- [ ] **Step 5: Commit**

```bash
git add src/features/academia/AudioPhraseology.tsx
git commit -m "feat: add PhraseologyElement type with keyword support"
```

---

## Task 2: Migrate `fraseologiaATC.ts` to the new element format

**Files:**
- Modify: `src/data/fraseologiaATC.ts`

**Interfaces:**
- Consumes: `PhraseologyElement` from Task 1.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/data/fraseologiaATC.ts` with:

```ts
import type { PhraseologyCard } from "../features/academia/AudioPhraseology";

export const FRASEOLOGIA_RODAJE_DESPEGUE: PhraseologyCard[] = [
  {
    situacion: "Acabas de encender el motor y quieres solicitar la información meteorológica antes de pedir rodaje.",
    callout: "Guadalajara Torre, XB-VLA, solicito información Alfa.",
    elementos: [
      { descripcion: "A quién llamas (Torre)", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Qué solicitas (información ATIS)", palabrasClave: ["información alfa", "informacion alfa", "solicito información", "solicito informacion"] },
    ],
  },
  {
    situacion: "Ya tienes la información ATIS y estás listo para pedir rodaje hacia la pista activa.",
    callout: "Guadalajara Torre, XB-VLA, plataforma de aviación general, solicito rodaje, con información Alfa.",
    elementos: [
      { descripcion: "A quién llamas", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Tu posición", palabrasClave: ["plataforma", "aviación general", "aviacion general"] },
      { descripcion: "Qué necesitas (rodaje)", palabrasClave: ["rodaje"] },
      { descripcion: "Confirmas información recibida", palabrasClave: ["información alfa", "informacion alfa"] },
    ],
  },
  {
    situacion: "La torre te autoriza a rodar, indicando la ruta y un punto donde debes mantenerte corto.",
    callout: "XB-VLA, ruede a pista 20 por calle Alfa, mantenga corto de pista 02.",
    elementos: [
      { descripcion: "Repites la ruta exacta", palabrasClave: ["calle alfa", "pista 20", "pista veinte"] },
      { descripcion: "Repites el punto de espera (hold short)", palabrasClave: ["corto de pista 02", "corto de pista cero dos", "mantenga corto"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
    ],
  },
  {
    situacion: "Terminaste tu run-up y checklist previa, y estás listo para solicitar la pista.",
    callout: "Torre, XB-VLA, listo para despegue, pista 20.",
    elementos: [
      { descripcion: "A quién llamas", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Qué solicitas", palabrasClave: ["listo para despegue"] },
      { descripcion: "Pista", palabrasClave: ["pista 20", "pista veinte"] },
    ],
  },
  {
    situacion: "La torre te autoriza a despegar, indicando el viento actual.",
    callout: "Autorizado a despegar pista 20, XB-VLA.",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a despegar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
    ],
  },
];

export const FRASEOLOGIA_EMERGENCIAS_APROXIMACION: PhraseologyCard[] = [
  {
    situacion: "Aproximación te da vectores y una altitud para secuenciarte con tráfico al frente.",
    callout: "Vire rumbo 180, descienda y mantenga cinco mil pies, espere vectores para secuencia visual, XB-VLA.",
    elementos: [
      { descripcion: "Repites rumbo", palabrasClave: ["rumbo 180", "rumbo uno ochenta", "vire rumbo"] },
      { descripcion: "Repites altitud", palabrasClave: ["cinco mil pies", "5000 pies", "mantenga cinco mil"] },
      { descripcion: "Confirmas que entendiste la secuencia", palabrasClave: ["vectores", "secuencia visual", "espere vectores"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
    ],
  },
  {
    situacion: "El controlador te reporta tráfico y necesitas confirmar cuando lo tengas a la vista.",
    callout: "Tráfico a la vista, XB-VLA.",
    elementos: [
      { descripcion: "Confirmas que ves el tráfico", palabrasClave: ["tráfico a la vista", "trafico a la vista"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
    ],
  },
  {
    situacion: "Estás en tramo final y la torre te autoriza a aterrizar.",
    callout: "Autorizado a aterrizar pista 20, XB-VLA.",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a aterrizar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
    ],
  },
  {
    situacion: "Tienes un pasajero con un malestar que no representa peligro inmediato, pero quieres que control lo sepa.",
    callout: "PAN-PAN, PAN-PAN, PAN-PAN, XB-VLA, pasajero con malestar médico, solicito prioridad para aterrizar, posición 10 millas al sur de Guadalajara, cinco mil pies, dos almas a bordo.",
    elementos: [
      { descripcion: "PAN-PAN repetido 3 veces", palabrasClave: ["pan-pan", "pan pan"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Naturaleza de la urgencia", palabrasClave: ["malestar médico", "malestar medico", "pasajero con malestar"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas al sur", "cinco mil pies"] },
      { descripcion: "Almas a bordo", palabrasClave: ["almas a bordo"] },
    ],
  },
  {
    situacion: "El motor falla en vuelo y necesitas declarar una emergencia grave e inminente.",
    callout: "MAYDAY, MAYDAY, MAYDAY, XB-VLA, falla de motor, posición 5 millas al norte de Manzanillo, tres mil pies, dos almas a bordo, combustible una hora, intento aterrizaje forzado en carretera.",
    elementos: [
      { descripcion: "MAYDAY repetido 3 veces", palabrasClave: ["mayday"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Naturaleza de la emergencia", palabrasClave: ["falla de motor"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas al norte", "tres mil pies"] },
      { descripcion: "Almas a bordo", palabrasClave: ["almas a bordo"] },
      { descripcion: "Combustible restante", palabrasClave: ["combustible una hora", "combustible"] },
      { descripcion: "Tus intenciones", palabrasClave: ["aterrizaje forzado", "carretera"] },
    ],
  },
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: no more errors referencing `fraseologiaATC.ts`. Remaining errors (if any) should only be in `checkrideOral.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/data/fraseologiaATC.ts
git commit -m "feat: migrate fraseologiaATC cards to keyword-based elements"
```

---

## Task 3: Migrate `checkrideOral.ts` to the new element format

**Files:**
- Modify: `src/data/checkrideOral.ts`

**Interfaces:**
- Consumes: `PhraseologyElement` from Task 1.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/data/checkrideOral.ts` with:

```ts
import type { PhraseologyCard } from "../features/academia/AudioPhraseology";

/**
 * Preguntas al estilo de un examen oral de PPL, agrupadas por área de
 * conocimiento típica de un checkride. La respuesta modelo es una guía de
 * referencia, no la única forma correcta de contestar.
 */
export const CHECKRIDE_ORAL: PhraseologyCard[] = [
  {
    situacion: "Aerodinámica — ¿Qué es la pérdida aerodinámica (stall) y qué la causa?",
    callout:
      "La pérdida ocurre cuando se excede el ángulo crítico de ataque del ala, sin importar la velocidad o actitud — el flujo de aire se separa de la superficie superior y la sustentación colapsa.",
    elementos: [
      { descripcion: "Se excede el ángulo crítico de ataque, no depende solo de la velocidad", palabrasClave: ["ángulo crítico", "angulo critico", "ángulo de ataque"] },
      { descripcion: "El flujo de aire se separa de la superficie superior del ala", palabrasClave: ["flujo de aire", "se separa", "superficie superior"] },
      { descripcion: "Puede ocurrir a cualquier velocidad y actitud", palabrasClave: ["cualquier velocidad", "cualquier actitud"] },
    ],
  },
  {
    situacion: "Meteorología — ¿Cuál es la diferencia entre un METAR y un TAF?",
    callout:
      "El METAR es una observación de las condiciones actuales, válida para el momento en que se emitió. El TAF es un pronóstico, válido típicamente por 24 a 30 horas.",
    elementos: [
      { descripcion: "METAR: observación actual, válida para esa hora específica", palabrasClave: ["observación actual", "observacion actual", "metar"] },
      { descripcion: "TAF: pronóstico, válido típicamente 24-30 horas", palabrasClave: ["pronóstico", "pronostico", "taf"] },
      { descripcion: "Ambos usan el mismo lenguaje codificado", palabrasClave: ["lenguaje codificado", "código", "codigo"] },
    ],
  },
  {
    situacion: "Reglamentación — ¿Qué documentos debe llevar la aeronave a bordo en todo vuelo?",
    callout:
      "El certificado de matrícula, el certificado de aeronavegabilidad, el manual de vuelo (POH/AFM) y las bitácoras de la aeronave.",
    elementos: [
      { descripcion: "Certificado de matrícula", palabrasClave: ["matrícula", "matricula"] },
      { descripcion: "Certificado de aeronavegabilidad", palabrasClave: ["aeronavegabilidad"] },
      { descripcion: "Manual de vuelo (POH/AFM)", palabrasClave: ["manual de vuelo", "poh", "afm"] },
      { descripcion: "Bitácoras de la aeronave", palabrasClave: ["bitácoras", "bitacoras"] },
    ],
  },
  {
    situacion: "Espacios aéreos — ¿Qué diferencia hay entre el espacio aéreo Clase B y Clase C?",
    callout:
      "La Clase B requiere autorización EXPLÍCITA de control antes de entrar. La Clase C solo requiere establecer contacto bidireccional — basta con que el controlador confirme tu matrícula de vuelta.",
    elementos: [
      { descripcion: "Clase B requiere autorización explícita antes de entrar", palabrasClave: ["autorización explícita", "autorizacion explicita", "clase b"] },
      { descripcion: "Clase C solo requiere contacto bidireccional establecido", palabrasClave: ["contacto bidireccional", "clase c"] },
      { descripcion: "Ambos suelen requerir transponder Modo C", palabrasClave: ["transponder", "modo c"] },
    ],
  },
  {
    situacion: "Peso y balance — ¿Qué pasa si vuelas con el centro de gravedad fuera de límites hacia atrás?",
    callout:
      "El avión se vuelve más ágil pero peligrosamente inestable en cabeceo, con riesgo real de entrar en pérdida sin previo aviso claro y, en casos extremos, sin poder recuperarla.",
    elementos: [
      { descripcion: "Más ágil pero peligrosamente inestable", palabrasClave: ["inestable", "ágil", "agil"] },
      { descripcion: "Riesgo de pérdida sin previo aviso claro", palabrasClave: ["pérdida", "perdida", "sin previo aviso"] },
      { descripcion: "Puede volverse irrecuperable en casos extremos", palabrasClave: ["irrecuperable"] },
    ],
  },
  {
    situacion: "Sistemas de la aeronave — ¿Cómo funciona el sistema de combustible de tu aeronave de entrenamiento?",
    callout:
      "Hay un tanque en cada ala, con un selector que permite elegir izquierdo, derecho o ambos. Antes de volar se drenan los sumps para revisar que no haya agua ni sedimento.",
    elementos: [
      { descripcion: "Tanques en cada ala", palabrasClave: ["tanque", "cada ala"] },
      { descripcion: "Selector de combustible: IZQUIERDO / DERECHO / AMBOS", palabrasClave: ["izquierdo", "derecho", "ambos", "selector"] },
      { descripcion: "Drenados (sumps) antes del vuelo", palabrasClave: ["sumps", "drenado", "drenados"] },
    ],
  },
  {
    situacion: "Procedimientos de emergencia — Si el motor falla en vuelo, ¿cuáles son tus prioridades en orden?",
    callout:
      "Primero establecer la velocidad de mejor planeo, luego seleccionar un área de aterrizaje dentro del alcance, después intentar restablecer potencia, y declarar la emergencia si el tiempo lo permite.",
    elementos: [
      { descripcion: "Velocidad de mejor planeo de inmediato", palabrasClave: ["mejor planeo", "velocidad de planeo"] },
      { descripcion: "Área de aterrizaje dentro del alcance", palabrasClave: ["área de aterrizaje", "area de aterrizaje", "alcance"] },
      { descripcion: "Intentar restablecer potencia (combustible, mezcla, magnetos)", palabrasClave: ["restablecer potencia", "mezcla", "magnetos"] },
      { descripcion: "Declarar emergencia si el tiempo lo permite", palabrasClave: ["declarar emergencia"] },
    ],
  },
  {
    situacion: "Operaciones de aeródromo — ¿Cómo determinas la pista activa y el circuito de tráfico en un aeródromo no controlado?",
    callout:
      "Revisando la manga de viento, escuchando reportes de otros pilotos en la frecuencia CTAF, y asumiendo un patrón estándar con virajes a la izquierda salvo que se indique lo contrario.",
    elementos: [
      { descripcion: "Manga de viento y frecuencia CTAF", palabrasClave: ["manga de viento", "ctaf"] },
      { descripcion: "Reportes de otros pilotos en la frecuencia", palabrasClave: ["reportes", "otros pilotos"] },
      { descripcion: "Patrón estándar (virajes a la izquierda) salvo indicación contraria", palabrasClave: ["patrón estándar", "patron estandar", "virajes a la izquierda"] },
    ],
  },
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: PASS, no TypeScript errors anywhere in the project.

- [ ] **Step 3: Commit**

```bash
git add src/data/checkrideOral.ts
git commit -m "feat: migrate checkrideOral cards to keyword-based elements"
```

---

## Task 4: Pure evaluation function + test

**Files:**
- Create: `src/features/academia/phraseologyEvaluator.ts`
- Create: `src/features/academia/phraseologyEvaluator.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `PhraseologyElement` from `./AudioPhraseology` (Task 1).
- Produces: `EvaluationResult { elemento: PhraseologyElement; dicho: boolean }` and `evaluarRespuesta(transcript: string, elementos: PhraseologyElement[]): EvaluationResult[]` — Task 6 calls this directly.

- [ ] **Step 1: Write the failing test**

Create `src/features/academia/phraseologyEvaluator.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluarRespuesta } from "./phraseologyEvaluator.ts";

test("marca dicho:true cuando la palabra clave aparece en el transcript", () => {
  const elementos = [{ descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] }];
  const resultado = evaluarRespuesta("torre xb vla listo para despegar", elementos);
  assert.equal(resultado[0].dicho, true);
});

test("marca dicho:false cuando ninguna palabra clave aparece", () => {
  const elementos = [{ descripcion: "Pista", palabrasClave: ["pista 20", "pista veinte"] }];
  const resultado = evaluarRespuesta("torre xb vla listo para despegar", elementos);
  assert.equal(resultado[0].dicho, false);
});

test("ignora mayúsculas y acentos al comparar", () => {
  const elementos = [{ descripcion: "Posición", palabrasClave: ["posición"] }];
  const resultado = evaluarRespuesta("TORRE XB VLA POSICION DIEZ MILLAS", elementos);
  assert.equal(resultado[0].dicho, true);
});

test("transcript vacío marca todos los elementos como no dichos, sin lanzar error", () => {
  const elementos = [
    { descripcion: "Torre", palabrasClave: ["torre"] },
    { descripcion: "Identificación", palabrasClave: ["xb vla"] },
  ];
  const resultado = evaluarRespuesta("", elementos);
  assert.deepEqual(resultado.map((r) => r.dicho), [false, false]);
});
```

- [ ] **Step 2: Add a `test` script to run it and confirm the test fails**

In `package.json`, add to `"scripts"`:

```json
"test": "node --experimental-strip-types --test src/features/academia/phraseologyEvaluator.test.ts"
```

Run: `npm test`
Expected: FAIL — `phraseologyEvaluator.ts` does not exist yet (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/features/academia/phraseologyEvaluator.ts`:

```ts
import type { PhraseologyElement } from "./AudioPhraseology";

export interface EvaluationResult {
  elemento: PhraseologyElement;
  dicho: boolean;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function evaluarRespuesta(
  transcript: string,
  elementos: PhraseologyElement[]
): EvaluationResult[] {
  const transcriptNormalizado = normalizar(transcript);
  return elementos.map((elemento) => ({
    elemento,
    dicho: elemento.palabrasClave.some((palabra) =>
      transcriptNormalizado.includes(normalizar(palabra))
    ),
  }));
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test`
Expected: PASS — 4 tests, 0 failures. (Requires Node 22.6+ for `--experimental-strip-types`; if the installed Node is older, upgrade Node rather than adding a TS test runner dependency.)

- [ ] **Step 5: Commit**

```bash
git add src/features/academia/phraseologyEvaluator.ts src/features/academia/phraseologyEvaluator.test.ts package.json
git commit -m "feat: add keyword-matching evaluator for spoken phraseology"
```

---

## Task 5: Speech recognition hook

**Files:**
- Create: `src/features/academia/useSpeechRecognition.ts`

**Interfaces:**
- Produces: `useSpeechRecognition(lang?: string): { supported: boolean; listening: boolean; transcript: string; error: string | null; start(): void; stop(): void; reset(): void }` — Task 6 consumes this directly.

- [ ] **Step 1: Create the hook**

Create `src/features/academia/useSpeechRecognition.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "No se pudo acceder al micrófono — revisa los permisos del navegador.",
  "no-speech": "No se detectó audio, intenta de nuevo.",
};

export function useSpeechRecognition(lang = "es-MX"): UseSpeechRecognitionResult {
  const SpeechRecognitionCtor =
    typeof window !== "undefined" ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const texto = Array.from(event.results)
        .map((resultado) => resultado[0]?.transcript ?? "")
        .join(" ");
      setTranscript(texto);
    };
    recognition.onerror = (event) => {
      setError(ERROR_MESSAGES[event.error] ?? "No se pudo procesar el audio, intenta de nuevo.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionCtor, lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setError(null);
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setListening(false);
  }, []);

  return { supported: !!SpeechRecognitionCtor, listening, transcript, error, start, stop, reset };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/academia/useSpeechRecognition.ts
git commit -m "feat: add useSpeechRecognition hook wrapping the Web Speech API"
```

---

## Task 6: Wire the voice practice mode into `AudioPhraseology`

**Files:**
- Modify: `src/features/academia/AudioPhraseology.tsx`

**Interfaces:**
- Consumes: `evaluarRespuesta`, `EvaluationResult` from Task 4; `useSpeechRecognition` from Task 5.

- [ ] **Step 1: Add imports and new state**

In `src/features/academia/AudioPhraseology.tsx`, replace the import lines (lines 1-2):

```ts
import { useState } from "react";
import { Check, ChevronRight, Volume2 } from "lucide-react";
```

with:

```ts
import { useEffect, useState } from "react";
import { Check, ChevronRight, Mic, Volume2, X } from "lucide-react";
import { evaluarRespuesta, type EvaluationResult } from "./phraseologyEvaluator";
import { useSpeechRecognition } from "./useSpeechRecognition";
```

Then, inside the `AudioPhraseology` component (after the existing `const [revealed, setRevealed] = useState(false);` line), add:

```ts
  const speech = useSpeechRecognition();
  const [resultado, setResultado] = useState<EvaluationResult[] | null>(null);

  useEffect(() => {
    if (!speech.listening && speech.transcript && !resultado) {
      setResultado(evaluarRespuesta(speech.transcript, card.elementos));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening, speech.transcript]);
```

(`card` and `resultado` are read but intentionally not full dependencies here — the effect must run exactly once per finished recording, not re-run when `resultado` itself changes.)

- [ ] **Step 2: Reset voice state when moving to the next card**

Replace the `next()` function (lines 59-66):

```ts
  function next() {
    if (index + 1 >= cards.length) {
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }
```

with:

```ts
  function next() {
    if (index + 1 >= cards.length) {
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
    setResultado(null);
    speech.reset();
  }

  function handleStart() {
    setResultado(null);
    speech.start();
  }
```

- [ ] **Step 3: Add the "Practica hablando" button and live transcript**

After the existing "Escuchar fraseología correcta" button block (after the `{!supported && (...)}` paragraph, i.e. after line 91 in the original file), add:

```tsx
      {speech.supported && (
        <button
          onClick={speech.listening ? speech.stop : handleStart}
          className="mt-3 ml-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          <Mic size={16} className={speech.listening ? "animate-pulse text-red-400" : undefined} />
          {speech.listening ? "Detener" : "Practica hablando"}
        </button>
      )}

      {speech.listening && (
        <p className="mt-2 text-xs text-white/50">Escuchando… {speech.transcript}</p>
      )}

      {speech.error && <p className="mt-2 text-xs text-red-400">{speech.error}</p>}
```

- [ ] **Step 4: Show ✓/✗ per element and the spoken transcript in the revealed block**

Replace the entire revealed block (originally lines 100-111):

```tsx
      ) : (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="font-display text-sm text-white">"{card.callout}"</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {card.elementos.map((el) => (
              <li key={el.descripcion} className="flex items-center gap-2 text-xs text-white/60">
                <Check size={12} className="shrink-0 text-gold-400" /> {el.descripcion}
              </li>
            ))}
          </ul>
        </div>
      )}
```

with:

```tsx
      ) : (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          {resultado && (
            <>
              <p className="text-xs text-white/50">Dijiste: "{speech.transcript}"</p>
              <p className="mt-1 text-xs font-semibold text-gold-400">
                {resultado.filter((r) => r.dicho).length} de {resultado.length} elementos correctos
              </p>
            </>
          )}
          <p className="mt-3 font-display text-sm text-white">"{card.callout}"</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {card.elementos.map((el, i) => {
              const dicho = resultado?.[i]?.dicho;
              return (
                <li key={el.descripcion} className="flex items-center gap-2 text-xs text-white/60">
                  {resultado ? (
                    dicho ? (
                      <Check size={12} className="shrink-0 text-emerald-400" />
                    ) : (
                      <X size={12} className="shrink-0 text-red-400" />
                    )
                  ) : (
                    <Check size={12} className="shrink-0 text-gold-400" />
                  )}
                  {el.descripcion}
                </li>
              );
            })}
          </ul>
        </div>
      )}
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/academia/AudioPhraseology.tsx
git commit -m "feat: add voice practice mode to AudioPhraseology"
```

---

## Task 7: Manual verification in the browser

**Files:** none (verification only)

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`, open one of the pages that renders `AudioPhraseology` (e.g. the route backing `AudioRodajeDespegue`).

- [ ] **Step 2: Verify the existing flow is unchanged**

In Chrome or Edge: confirm "Escuchar fraseología correcta" still speaks the callout, "Mostrar texto y elementos clave" still reveals the callout and element list with gold checkmarks when no recording has happened, and "Siguiente situación" advances normally.

- [ ] **Step 3: Verify the voice practice mode**

Click "Practica hablando", allow microphone access when prompted, say a phrase close to the card's `callout` out loud. Confirm: the button shows "Detener" and pulses while listening, the live transcript appears under the button, and after stopping, the revealed block shows "Dijiste: ...", the N of M count, and the correct/incorrect (✓/✗) marks per element.

- [ ] **Step 4: Verify permission-denied handling**

In the browser's site settings, block microphone access for the dev server's origin, reload, click "Practica hablando" again. Confirm the message "No se pudo acceder al micrófono — revisa los permisos del navegador." appears and the rest of the card (read/reveal/next) still works.

- [ ] **Step 5: Verify unsupported-browser fallback**

Open the same page in Firefox (no native `SpeechRecognition`). Confirm the "Practica hablando" button does not appear at all, and the rest of the flow works exactly as before this feature existed.

- [ ] **Step 6: Report back**

Summarize what was checked and any issues found — no commit for this task, it's verification only.
