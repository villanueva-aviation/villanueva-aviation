# Circuito de tráfico: recorrido y práctica

## Contexto

El módulo de Academia "Comunicaciones" (`src/data/academia.ts`, slug `comunicaciones`) ya tiene contenido de texto sobre el circuito de tráfico (tema `comunicaciones-tema6`, "En circuito") con los reportes de radio de viento en cola/base/final, pero no tiene ninguna actividad interactiva sobre el tema — sus dos interactividades actuales son `audio` (fraseología) y `terminos`.

Se agrega una tercera actividad: un widget de circuito de tráfico con dos modos, "Aprende el recorrido" (narrativa paso a paso por las 5 piernas del circuito) y "Ponte a prueba" (identificar el tramo correcto dado una situación, haciendo clic en un tablero).

## Decisiones ya tomadas

- **Ubicación**: actividad nueva dentro del módulo "Comunicaciones" existente, no una página aparte.
- **Estilo visual del tablero**: "paradas numeradas" tipo tablero de juego — 5 puntos clicables conectados por el trazo del circuito, no un dibujo realista de carta FAA ni un óvalo esquemático.
- **Un solo widget, dos modos**: mismo tablero y mismos datos de las 5 piernas, alternando con botones tipo píldora debajo del tablero (mismo patrón visual que "Escuchar fraseología correcta" / "Practica hablando" en `AudioPhraseology`).
- **Contenido por tramo (modo Aprende)**: combina qué hace el piloto (altitud, checklist) y el reporte de radio correspondiente.
- **Formato del quiz (modo Prueba)**: preguntas aleatorias, sin límite fijo ni pantalla de resumen — práctica continua que el alumno detiene cuando quiere.
- **5 tramos, en este orden**: Viento en Cara (Upwind) → Viento Cruzado (Crosswind) → Viento en cola (Downwind) → Base → Final.

## Diseño

### 1. Modelo de datos

Nuevo archivo `src/data/circuitoTrafico.ts`:

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

`xPct`/`yPct` siguen el mismo patrón que `hotspots.ts` (posición porcentual dentro de su contenedor), pero aquí ubican los 5 puntos del tablero SVG en vez de puntos sobre una foto.

### 2. Componente

Nuevo archivo `src/features/academia/CircuitoTrafico.tsx`:

```tsx
export function CircuitoTrafico({ onComplete }: { onComplete?: () => void }) {
  const [modo, setModo] = useState<"aprende" | "prueba">("aprende");
  // tablero SVG compartido: 5 círculos en TRAMOS_CIRCUITO posiciones, conectados
  // por el trazo del circuito (misma forma rectangular del boceto aprobado)
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      {/* tablero SVG */}
      {/* botones píldora: "Aprende el recorrido" / "Ponte a prueba" */}
      {modo === "aprende" ? <ModoAprende ... /> : <ModoPrueba ... />}
    </div>
  );
}
```

El tablero se dibuja una sola vez; ambos modos comparten el mismo SVG y solo cambian qué punto se resalta y qué contenido aparece debajo. El punto activo/correcto se resalta igual que ya hace `AirplaneDiagram` con sus hotspots (punto dorado más grande + anillo de pulso vía `animate-ping`); el resto de los puntos quedan en gris tenue.

### 3. Modo "Aprende el recorrido"

- Estado `paradaActiva: number` (1 a 5), empieza en 1.
- Debajo del tablero, una tarjeta muestra el tramo activo: `nombre` + `(nombreIngles)`, `queHace`, y `reporteRadio`.
- Botones "Anterior" / "Siguiente" para moverse entre las 5 paradas en orden (deshabilitados en los extremos, como el patrón de `AudioPhraseology`/`Quiz`).
- Al pulsar "Siguiente" en la parada 5 (Final), se llama `onComplete?.()` si se proveyó, igual que hacen los demás widgets de interactividad.

### 4. Modo "Ponte a prueba"

- Estado `situacionActual: SituacionCircuito` (elegida al azar de `SITUACIONES_CIRCUITO` al entrar al modo), `resultado: "correcto" | "incorrecto" | null`, y contadores `aciertos`/`intentos`.
- Se muestra el `prompt` de la situación actual arriba del tablero.
- Al hacer clic en un punto del tablero:
  - Si `tramo.id === situacionActual.tramoCorrectoId`: el punto clicado se pone verde brevemente, mensaje corto de confirmación ("¡Correcto!"), incrementa `aciertos` e `intentos`, y tras ~1 segundo se carga automáticamente una nueva situación aleatoria (reseteando `resultado`).
  - Si no: el punto clicado se pone rojo, el punto correcto se resalta en dorado, mensaje explicando cuál era el tramo correcto y por qué (usa el `queHace`/`reporteRadio` del tramo correcto como contexto), incrementa `intentos` sin incrementar `aciertos`, y aparece un botón "Siguiente" — no avanza solo, para darle tiempo de leer la explicación.
- Contador `aciertos / intentos` visible arriba del tablero, solo informativo — no se guarda en `ProgressContext` ni afecta la finalización de la actividad.
- No hay límite de preguntas ni pantalla de resumen; es práctica continua.
- Cambiar de "Ponte a prueba" a "Aprende el recorrido" y volver reinicia el estado del quiz (nueva situación aleatoria, contadores en cero) — evita mostrar una situación a medias al volver.

### 5. Selección aleatoria de situaciones

Función simple, sin dependencias del DOM, en el mismo archivo del componente (no amerita un archivo aparte dado su tamaño):

```ts
function elegirSituacionAleatoria(excluirId?: string): SituacionCircuito {
  const opciones = excluirId
    ? SITUACIONES_CIRCUITO.filter((s) => s.id !== excluirId)
    : SITUACIONES_CIRCUITO;
  return opciones[Math.floor(Math.random() * opciones.length)];
}
```

Excluir el id de la situación actual evita repetir la misma pregunta dos veces seguidas (con 10 situaciones disponibles, la sensación de "aleatorio" se sostiene bien sin necesitar una cola barajada más compleja).

### 6. Conexión al módulo de Academia

- `src/data/academia.ts`: agregar `"circuito"` a `InteractividadTipo`, y una nueva actividad en `comunicaciones.actividades`:
  ```ts
  { id: "interactividad-3", tipo: "interactividad", titulo: "Circuito de tráfico: recorrido y práctica", widget: "circuito" }
  ```
- `src/pages/AcademiaModulo.tsx`: agregar entrada a `INTERACTIVIDAD_INTRO` (ej. `"Recorre el circuito de tráfico paso a paso, luego pon a prueba tu ubicación."`) y un caso `case "circuito": return <CircuitoTrafico onComplete={onComplete} />;` en `InteractividadWidget`, con su import.

## Manejo de errores

No hay llamadas de red ni entrada externa — todo el estado es local y síncrono. El único caso a cuidar es no dejar `resultado` o `situacionActual` en un estado inconsistente al alternar entre modos rápido; se resuelve reseteando el estado del quiz cada vez que se entra a "Ponte a prueba" (ver sección 4).

## Testing

`elegirSituacionAleatoria` es la única lógica no trivial (excluir repetidos). Dado su tamaño (una función de una línea envuelta en un filtro), y que el resto del componente es interacción de UI sin lógica de negocio compleja, se verifica manualmente en el navegador — mismo criterio que ya se usó para `ScenarioSimulator` y `TermMatch`, que tampoco tienen test dedicado en este proyecto.

## Archivos afectados

- `src/data/circuitoTrafico.ts` (nuevo) — `TRAMOS_CIRCUITO`, `SITUACIONES_CIRCUITO`.
- `src/features/academia/CircuitoTrafico.tsx` (nuevo) — el widget con sus dos modos.
- `src/data/academia.ts` — nuevo tipo `"circuito"` en `InteractividadTipo`, nueva actividad en el módulo `comunicaciones`.
- `src/pages/AcademiaModulo.tsx` — nueva entrada en `INTERACTIVIDAD_INTRO`, nuevo caso en `InteractividadWidget`, nuevo import.

## Fuera de alcance

- Guardar el desempeño del modo "Ponte a prueba" en `ProgressContext` o en Supabase — es práctica libre, no evaluación formal (ya existe una evaluación formal aparte en la etapa "Evaluación" del módulo).
- Animación del avión moviéndose de forma fluida entre paradas (solo se resalta el punto activo/correcto, sin trayectoria animada).
- Reutilizar este widget en otros módulos — vive únicamente en Comunicaciones por ahora.
