# Academia estilo Rise — diseño (los 14 módulos)

Fecha: 2026-11-17 · Enfoque elegido por Erik: **C** (motor automático para todos + rondas a mano por módulo).
Reemplaza el alcance de `2026-11-16-academia-inmersiva-design.md` (que era solo un piloto en Fundamentos);
lo construido en la rama `academia-inmersiva` (lectura con scroll, visual fijo, escenas) se reutiliza aquí.

## Qué y por qué

Erik siente que el diseño actual de los módulos no retiene a los cadetes: entran y se van. Quiere que
cada módulo atrape la atención: que no se avance con clics sino **bajando**, que las imágenes cambien al
bajar y que entre la lectura aparezcan actividades interactivas, **al estilo de Articulate Rise**.

Vio la maqueta «Misión 2 · Las cuatro fuerzas» (`.superpowers/brainstorm/…/leccion-rise.html`) y aprobó
**todos** los bloques: portada, imagen fija que cambia al bajar, video, tarjetas que voltean, imagen con
puntos, pregunta con candado, clasificar, práctica en el simulador, cierre, menú de puntos y barra de avance.
Pidió aplicarlo a los 14 módulos.

**Requisito expreso de Erik:** la información tiene que ser correcta en todos los temas (ver «Exactitud»).

Embudo base de Fundamentos (2026-10-25, sin las cuentas de Erik): 42 registrados → 21 abren algo →
17 llegan al tema 2 → 12 al tema 3 → 6 al primer interactivo → 3 terminan el proyecto. La mitad que nunca
abre una lección no la toca este rediseño; lo que sí toca es la caída de 21 a 3.

**Éxito:** más cadetes terminan las lecturas y llegan a la evaluación que en la base, en Fundamentos y en
los demás módulos, sin que la página se vuelva lenta en un celular.

## Metas, no-metas, anti-metas

- **Metas:** los 14 módulos con lectura continua por scroll y los bloques de la maqueta; los ejercicios
  interactivos que ya existen, metidos entre la lectura; contenido revisado y correcto.
- **No-metas:** cambiar Práctica, Evaluación y Proyecto (siguen después de la lectura, como hoy); grabar la
  voz de Erik (el botón «con la voz de Erik» aparece cuando exista el audio); videos de YouTube; la mitad
  que se registra y no entra (es otro problema: bienvenida y correos).
- **Anti-metas:** cualquier dato técnico incorrecto; animación de adorno que no enseña; páginas pesadas en
  celular; perder el avance que ya tienen los cadetes; un candado que deje atorado a alguien; imágenes
  generadas por IA en contenido técnico.

## Enfoques considerados

| Enfoque | A favor | En contra | Decisión |
|---|---|---|---|
| A. Todo automático desde el contenido que ya existe | Los 14 módulos cambian de una vez | Se siente igual en todos; sin flechas, puntos ni «clasificar» | Parte de C |
| B. Todo a mano, módulo por módulo | Lo más rico | 14 rondas; mientras, los demás siguen con el diseño viejo | Parte de C |
| **C. Motor automático para los 14 + rondas a mano** | El diseño nuevo llega a todos desde el inicio y cada ronda lo mejora | Al principio los módulos sin ronda se ven más sencillos | **Elegido** |

## Cómo funciona

### Estructura de un módulo

Las etapas quedan: **Introducción → Lección → Práctica → Evaluación → Proyecto**. «Lección» e
«Interactividad» se juntan en una sola etapa «Lección» en todos los módulos (como ya hacen las misiones de
Fundamentos), porque los interactivos ahora van dentro de la lectura.

La Lección se divide en **capítulos**. Cada capítulo es un recorrido por scroll, como una lección de Rise:
- En Fundamentos, los capítulos son sus 6 misiones (`misiones.ts`).
- En los demás módulos, los capítulos son los grupos que ya existen en `MODULE_LECCIONES` (cada
  `LeccionContenido` con su título y sus temas).
- Al terminar un capítulo, un botón lleva al siguiente; el capítulo actual va en la URL (`?capitulo=N`).
  Los enlaces viejos (`?etapa=leccion`, `?etapa=interactividad`, `?mision=N`) siguen funcionando.

### Los bloques

Cada capítulo es una lista de bloques. La versión automática (fase 1) se arma sola con el contenido que ya
existe; las rondas a mano (fase 2) agregan o reemplazan bloques.

| Bloque | Automático (fase 1) | A mano (fase 2) |
|---|---|---|
| Portada de pantalla completa | Título del capítulo, minutos estimados, la primera imagen de sus temas | Foto elegida o toma de MSFS |
| Idea clave | La `clave` de cada tema (`temaPuntos.ts`), en grande | — |
| Imagen fija que cambia al bajar | Los `puntos` del tema pasan como pasos; el visual fijo muestra las `imagenes` del tema | Escenas con flechas, rótulos y acercamientos (`escenas.ts`), clips |
| Explicación completa | El `texto` del tema, desplegable («Leer la explicación completa»), para no perder nada | — |
| Video | — | Clips de Remotion (ya hay de Fundamentos 3 y 8 y Aerodinámica 1–8) |
| Tarjetas que voltean | Repaso del capítulo: frente = título de un punto, reverso = su texto | Tarjetas escritas como pregunta y respuesta |
| Imagen con puntos | — | Puntos sobre una foto (se pueden reusar los juegos de `HotspotDiagram`) |
| Pregunta con candado | Las comprobaciones que ya existen (`MODULE_CHECKPOINTS`) y las preguntas de las misiones | Preguntas nuevas |
| Clasificar | — | Fichas a cajas (nuevo componente) |
| Ejercicios interactivos que ya existen | Cada uno después del capítulo que le corresponde (Fundamentos: según `misiones.ts`; demás: repartidos en orden) | Se reacomodan donde mejor enseñan |
| Práctica en el simulador | Fundamentos: `enSimulador` de las misiones | Pasos escritos para cada capítulo |
| Cierre del capítulo | Sello «Capítulo completo» y botón al siguiente | — |
| Menú de puntos y barra de avance | Siempre | — |

### Pregunta con candado (para no dejar a nadie atorado)

- Lo que sigue se ve borroso hasta contestar bien.
- Si falla, la opción se marca en rojo y puede volver a intentar. Al **segundo** fallo se le muestra la
  respuesta correcta y se desbloquea.
- No cuenta para el avance (igual que las comprobaciones de hoy).
- Si ya había leído todo antes (avance guardado), los candados de lo ya leído aparecen abiertos.

### Avance (no se pierde nada)

- Un tema se marca leído con el **mismo id de actividad de siempre** cuando su último paso pasa la mitad
  de la pantalla (`lecturaScroll.ts` de la rama `academia-inmersiva`).
- Los interactivos marcan su actividad igual que hoy, con su mismo id.
- La etapa Lección queda completa cuando están todos los temas e interactivos, como hoy; Práctica pide
  eso, como hoy.

### Dónde vive el contenido

- **Motor (puro, con pruebas):** una función que arma los capítulos de un módulo con sus bloques a partir
  de `MODULE_LECCIONES`, `temaPuntos.ts`, `MODULE_CHECKPOINTS`, `misiones.ts` y las actividades del módulo.
- **Capa a mano:** un archivo por módulo (por ejemplo `src/data/rise/fundamentos.ts`) que agrega o
  reemplaza bloques en puntos concretos («después del tema X»). Si no existe, el módulo usa solo el motor.

## Exactitud (requisito de Erik)

1. **Cada texto nuevo se revisa contra una fuente** antes de publicarse: tarjetas, rótulos de flechas y
   puntos, fichas de clasificar, preguntas nuevas, pasos en el simulador y textos de los videos.
   - Aerodinámica, maniobras, instrumentos, meteorología: FAA *Pilot's Handbook of Aeronautical
     Knowledge* (FAA-H-8083-25), *Airplane Flying Handbook* (FAA-H-8083-3), *Instrument Flying
     Handbook* (FAA-H-8083-15), *Aviation Weather Handbook* (FAA-H-8083-28).
   - México (reglamentación, espacios aéreos, procedimientos locales): Ley de Aviación Civil y su
     Reglamento, normas y circulares de la AFAC y la PIA de México (AIP); OACI (Anexos 2 y 11, Doc 4444)
     para reglas y fraseología internacionales.
   - Números de avión (velocidades, pesos, rendimientos): el POH del Cessna 172S, diciendo el avión y la
     condición (por ejemplo «C172S, peso máximo»).
2. **Cada ronda de un módulo empieza con una auditoría** de lo que ya tiene: idea clave, puntos, texto,
   preguntas de comprobación, práctica y evaluación. Lo que esté mal o dudoso se le lista a Erik con la
   fuente y la corrección propuesta, y se corrige con su visto bueno (él es el instructor y tiene la
   última palabra).
3. **Donde FAA y México difieren** (espacios aéreos, mínimos, reglamento), el módulo dice cuál aplica; se
   sabe que el módulo de espacios aéreos hoy está basado en la FAA y se revisa en su ronda.
4. **Si hay duda, se pregunta a Erik; no se inventa.**
5. Queda un registro por módulo en `docs/academia-rise/revision-<modulo>.md`: qué se revisó, contra qué
   fuente y qué cambió.
6. Las imágenes técnicas son fotos o capturas reales (MSFS, `/flota`, imágenes de los temas) o dibujos
   hechos a mano (SVG, Remotion); nunca imágenes generadas por IA.
7. La versión automática (fase 1) solo reacomoda contenido que ya existe; no escribe texto técnico nuevo.

## Visuales

- Imágenes de los temas que ya existen (137 de 139 temas tienen al menos una).
- Fotos de `/flota` y capturas de MSFS de Erik (lista de tomas de Fundamentos en el diseño de la academia
  inmersiva; cada ronda puede pedir sus tomas).
- Clips de Remotion, con el mismo estilo y sonidos que el Reel; se reproducen una vez al llegar, sin sonido,
  y se quedan en el último cuadro.

## Accesibilidad y rendimiento

- Con «reducir movimiento» del sistema: todo fijo y en orden, sin animaciones, videos con controles.
- Celular: el visual fijo arriba (unos 45 % de la pantalla) y el texto pasa por debajo.
- Tarjetas, puntos, clasificar y candado se usan con teclado y con el dedo (son botones, no solo arrastrar).
- Videos e imágenes grandes se cargan cuando están por entrar en pantalla.

## Fases

1. **Motor + versión automática en los 14 módulos.** Se publica de una vez, con el visto bueno de Erik
   después de verlo en el sitio.
2. **Rondas a mano, una por módulo:** auditoría → bloques especiales → Erik revisa → se publica. Orden
   propuesto: Fundamentos (ya tiene misiones, escenas y clips), Aerodinámica (ya tiene clips), Meteorología
   y luego el orden de la Academia.

## Medición

Antes de publicar la fase 1, correr la consulta del embudo (la de 2026-10-25) para **todos** los módulos;
repetirla unas 3 semanas después y comparar cuántos cadetes llegan a cada tema, terminan la lectura y
llegan a la evaluación.

## Decisiones de Claude (Erik puede corregirlas)

- Capítulos = misiones en Fundamentos y los grupos de `MODULE_LECCIONES` en los demás.
- El candado se abre solo al segundo fallo, mostrando la respuesta correcta.
- Las tarjetas automáticas usan los puntos del capítulo (repaso de lo que acaba de leer).
- Los interactivos de los módulos sin misiones se reparten en orden entre los capítulos hasta su ronda.
- «Lección» e «Interactividad» se juntan en una sola etapa en todos los módulos.
- Se construye sobre la rama `academia-inmersiva` (que se pone al día con `main` primero).
- Cada comprobación de `MODULE_CHECKPOINTS` va como candado justo después del tema que le toca
  (`despuesDeTema`), dentro del capítulo que contiene ese tema.
- En Fundamentos, el candado de cada capítulo son las 2 preguntas de su misión, al final (una tras otra);
  ahí no se usan las comprobaciones de `MODULE_CHECKPOINTS`, para no repetir.
- Las escenas de Fundamentos que ya existen en `escenas.ts` (flechas de las 4 fuerzas, etc.) entran desde
  la fase 1.
- La etapa «Introducción» queda como hoy; la portada del capítulo 1 es la entrada a la lectura.
- En celular, el menú de puntos se cambia por «Capítulo N de M» arriba, junto a la barra de avance.

## Lo que queda a criterio de quien lo construya

Tiempos y curvas de animación, el diseño fino de cada bloque (siguiendo la maqueta aprobada), cómo se
estiman los minutos de un capítulo y la división del texto en pasos, siempre que respeten las anti-metas y
la sección de Exactitud.
