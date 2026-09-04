# Simulador de radiocomunicaciones ATC con reconocimiento de voz

## Contexto

`AudioPhraseology` (`src/features/academia/AudioPhraseology.tsx`) ya existe: presenta tarjetas de situación con un `callout` (fraseología correcta) que el sistema puede leer en voz alta (`speechSynthesis`), y una lista de `elementos` que describe qué debía incluir la respuesta. Es usado por 3 páginas (`AudioRodajeDespegue`, `AudioEmergenciasAproximacion`, y dentro de `SimulacroOral`) con contenido en `src/data/fraseologiaATC.ts` y `src/data/checkrideOral.ts`.

Falta la dirección inversa: el alumno habla su respuesta, el sistema la transcribe (Web Speech API) y evalúa si mencionó los elementos clave esperados.

## Objetivo

Agregar un modo opcional de práctica hablada dentro de `AudioPhraseology`: el alumno graba su respuesta antes de ver la solución, el sistema transcribe y marca qué elementos dijo correctamente.

## Decisiones ya tomadas

- **Motor de voz**: Web Speech API del navegador (`SpeechRecognition`/`webkitSpeechRecognition`), gratis, sin backend. Acepta que no funcione en todos los navegadores.
- **Evaluación**: por elementos clave (checklist), no por similitud de texto completo.
- **Palabras clave**: escritas a mano por el desarrollador/usuario en los datos de cada tarjeta, no derivadas automáticamente del `callout`.
- **Integración UI**: nuevo modo dentro del mismo componente `AudioPhraseology`, no un widget separado.
- **Sin soporte del navegador**: el botón de práctica hablada simplemente no se muestra (mismo patrón que ya usan con `!supported` para `speechSynthesis`).
- **Grabar es opcional**: no bloquea el flujo existente de "mostrar texto" / "siguiente situación".

## Diseño

### 1. Modelo de datos

`PhraseologyCard.elementos` cambia de `string[]` a `PhraseologyElement[]`:

```ts
export interface PhraseologyElement {
  descripcion: string;      // texto humano ya existente, ej. "A quién llamas (Torre)"
  palabrasClave: string[];  // variantes que cuentan como "lo dijiste", ej. ["torre"]
}

export interface PhraseologyCard {
  situacion: string;
  callout: string;
  elementos: PhraseologyElement[];
}
```

Es un cambio incompatible con el formato actual. Se migran todas las tarjetas existentes en `src/data/fraseologiaATC.ts` (y cualquier otro dataset que use `PhraseologyCard`, incluyendo contenido embebido en `checkrideOral.ts` si aplica) al nuevo formato, agregando `palabrasClave` por elemento.

### 2. Hook de reconocimiento de voz

Nuevo archivo `src/features/academia/useSpeechRecognition.ts`:

- Envuelve `window.SpeechRecognition ?? window.webkitSpeechRecognition`.
- Expone: `{ supported: boolean, listening: boolean, transcript: string, error: string | null, start(): void, stop(): void, reset(): void }`.
- Configuración: `lang: "es-MX"`, `continuous: false`, `interimResults: true` (para transcript en vivo).
- Maneja eventos `onresult` (actualiza `transcript`), `onerror` (setea `error`, distingue `not-allowed` y `no-speech` para mensajes específicos), `onend` (setea `listening: false`).

### 3. Motor de evaluación

Nuevo archivo `src/features/academia/phraseologyEvaluator.ts`:

```ts
export interface EvaluationResult {
  elemento: PhraseologyElement;
  dicho: boolean;
}

export function evaluarRespuesta(
  transcript: string,
  elementos: PhraseologyElement[]
): EvaluationResult[]
```

- Normaliza `transcript` y cada `palabraClave`: minúsculas, sin acentos (`normalize("NFD").replace(/[̀-ͯ]/g, "")`), trim.
- Un elemento se marca `dicho: true` si **alguna** de sus `palabrasClave` normalizadas aparece como substring del transcript normalizado.
- Es una función pura, sin dependencias del DOM — testeable de forma aislada.
- Transcript vacío → todos los elementos `dicho: false` (no se llama en la práctica porque la UI no corre evaluación sin transcript, pero la función debe manejarlo sin lanzar error).

### 4. Flujo UI/UX

Dentro de `AudioPhraseology`, junto al botón "Escuchar fraseología correcta":

- Nuevo botón **"🎙 Practica hablando"**, visible solo si `useSpeechRecognition().supported === true`.
- Estados nuevos en el componente: `transcript`, `escuchando` (booleano derivado de `listening` del hook), `resultado: EvaluationResult[] | null`.

Secuencia:
1. Alumno pulsa "Practica hablando" → `start()`, botón cambia a "Escuchando..." con indicador visual de grabación activa, transcript en vivo se muestra debajo.
2. Alumno pulsa "Detener" (o termina solo, por `continuous: false` + silencio) → `stop()`.
3. Al recibir `onend` con un `transcript` no vacío, se corre `evaluarRespuesta(transcript, card.elementos)` y se guarda en `resultado`.
4. El bloque que hoy se muestra al pulsar "Mostrar texto y elementos clave" (`revealed`) se extiende: si `resultado` existe, cada elemento de la lista muestra ✓/✗ según `dicho` en vez de solo el ícono neutro de check; si no hay `resultado`, se comporta exactamente igual que hoy (lista neutra).
5. El transcript del alumno se muestra arriba del callout de referencia: `Dijiste: "..."`.
6. Contador `N de M elementos correctos` sobre la lista cuando hay `resultado`.
7. "Siguiente situación" no depende de haber grabado — sigue solo requiriendo `revealed`.
8. Al avanzar de tarjeta (`next()`), se resetean `transcript`, `resultado`, y se llama `reset()` del hook, igual que ya se resetea `revealed`.

### 5. Manejo de errores

- Navegador sin soporte → botón oculto, resto del flujo intacto.
- Permiso de micrófono denegado (`error: "not-allowed"`) → mensaje corto bajo el botón: "No se pudo acceder al micrófono — revisa los permisos del navegador." No afecta el resto de la tarjeta.
- Sin audio detectado (`error: "no-speech"`) → mensaje "No se detectó audio, intenta de nuevo." No se corre `evaluarRespuesta` (no hay transcript).
- Cualquier otro error de la API → mismo tratamiento que `no-speech`, mensaje genérico de reintentar.

### 6. Testing

- `phraseologyEvaluator.ts` es lógica pura: un test (`phraseologyEvaluator.test.ts`) cubre coincidencia total, parcial, mayúsculas/acentos, y transcript vacío.
- `useSpeechRecognition` y la integración en `AudioPhraseology` se verifican manualmente en Chrome/Edge (la Web Speech API no tiene un mock razonable para el volumen de esta feature).

## Archivos afectados

- `src/features/academia/AudioPhraseology.tsx` — modo de grabación, nuevo tipo `PhraseologyElement`.
- `src/features/academia/useSpeechRecognition.ts` (nuevo).
- `src/features/academia/phraseologyEvaluator.ts` (nuevo) + `phraseologyEvaluator.test.ts` (nuevo).
- `src/data/fraseologiaATC.ts` — migración de `elementos` al nuevo formato con `palabrasClave`.
- Cualquier otro dataset que use `PhraseologyCard` (revisar `checkrideOral.ts` durante implementación).

## Fuera de alcance

- Backend/API externa de voz a texto.
- Puntuación acumulada, progreso guardado, o gamificación sobre estos resultados (posible extensión futura, no parte de esta spec).
- Soporte de navegadores sin Web Speech API nativa.
