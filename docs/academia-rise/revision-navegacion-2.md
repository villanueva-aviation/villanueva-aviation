# Revisión de Navegación II — ronda 1 (estilo Rise)

Fecha: 2026-11-18 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-18)**.

Qué se revisó:
- los 14 temas (13 a 26: texto, idea clave y puntos);
- los 2 juegos de términos (10 términos), el slider de viento en contra y el escenario del arco DME;
- las 15 preguntas (práctica, evaluación y candados nav-q6, nav-q8, nav-q15, nav-q12);
- las 12 imágenes de los temas 13 a 24 (los temas 25 y 26 no tienen).

Fuentes: FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C, cap. 16), *Instrument Flying
Handbook* (IFH, FAA-H-8083-15B, cap. 9, *DME Arcs*), AIM 1-1-2 (NDB), 1-1-7 (DME) y 5-3-8 (esperas), y
`src/features/entrenador/esperas.ts` (sectores de entrada ya verificados).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 13 (texto, idea clave y punto «El detalle a cuidar») | El slant range difiere de la distancia horizontal «a baja altura y muy cerca de la estación» | Al revés: la diferencia es mayor cuanto **más alto** y más cerca estás. Contradice a nav-q27, que tiene la respuesta correcta («muy alto y muy cerca») | «Cuanto más alto y más cerca de la estación, más se separa el slant range de tu distancia horizontal. Es despreciable si estás a 1 NM o más de la estación por cada 1,000 ft de altura sobre ella.» Idea clave: «Alto y cerca de la estación, la distancia que marca no es tu distancia horizontal.» | AIM 1-1-7 |
| E2 | Slider «viento en contra» MMGL → MMZO | 110 kt → 45 min; 70 kt → 75 min | Las cuentas no cuadran con la ruta: 45 min a 110 kt son 82 NM y 75 min a 70 kt son 87 NM. MMGL–MMZO mide unas **109 NM** en línea recta | Tiempo: de **59 a 93 min**. Combustible, con el mismo consumo que ya usa (40 L/h): de **39 a 62 L** | Coordenadas de los dos aeropuertos |
| E3 | Imágenes de los temas 13 a 24 | Infografías | Generadas por IA, con errores: la del tema 13 repite el error E1; la del tema 21 marca la escala de latitud en **grados** (35°, 34°…) cuando el truco es con **minutos**; dibujan jets y aviones de línea, e instrumentos que no existen | Clips de Remotion paso a paso, como en los módulos anteriores, con el póster del primero como portada. También para los temas 25 y 26, que hoy no tienen imagen | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 13 (texto y punto «Qué más te da») | El DME muestra groundspeed y tiempo a la estación | Agregar: «solo son exactos si vuelas directo hacia la estación o alejándote de ella» | PHAK cap. 16 |
| P2 | Tema 22 (texto y puntos) | «Con DME… te da la distancia directa»; «sin DME: mides en la carta y divides entre tu groundspeed» | El DME da la distancia **a la estación**, no al aeropuerto (coinciden casi solo si la estación está en el aeropuerto). Y la navegación por estima no es medir en la carta: es **estimar dónde estás** con rumbo, velocidad y tiempo desde el último punto conocido; con esa posición mides la distancia que falta y la divides entre tu groundspeed. Mencionar también la fijación con dos VOR (Navegación I) | PHAK cap. 16 |
| P3 | Tema 24 (texto e idea clave) | «es exactamente lo que se evalúa en un checkride de navegación» | Afirma de más. Propuesta: «es el tipo de ejercicio que se practica antes de una travesía». Idea clave nueva: «Junta todo el módulo en una ruta real: radiales, distancias, tiempo y alterno.» | — |
| P4 | Tema 25 (texto y punto «Girar y torcer») | «de ahí el nombre coloquial de "girar y torcer" (turn and twist)» | Ese nombre no aparece en el IFH. Propuesta: quitarlo y describir la técnica tal cual: «cuando el radial avanza unos 10°, giras unos 10° hacia la estación y adelantas el OBS otros 10°; si te acercas de más, giras hacia afuera» | IFH cap. 9 |
| P5 | Tema 26 (punto «Los tramos») y nav-q29 | «tramos de un minuto»; nav-q29: «tramo de **alejamiento** de un minuto» | El minuto (14,000 ft MSL o menos) es el del tramo de **acercamiento**. El de alejamiento se ajusta para lograrlo, como ya dice el propio tema. nav-q29, opción correcta: «A la derecha, con tramo de acercamiento de un minuto». Mismo índice | AIM 5-3-8 |
| P6 | Término nav2-gota «Entrada de gota» | «corresponde cuando llegas al fijo por el sector opuesto al tramo de alejamiento» | Vago, y también describe a la paralela. Propuesta: «corresponde cuando llegas al fijo con un rumbo parecido al de alejamiento, hasta 70° hacia el lado de la espera» | AIM 5-3-8 · esperas.ts |
| P7 | Tema 18 | El receptor detecta «hacia qué dirección relativa viene la señal más fuerte» | El ADF no busca la señal más fuerte. Propuesta: «detecta de qué dirección llega la señal» | AIM 1-1-2 |
| P8 | Tema 21 (texto y punto «Dónde se mide») | El minuto de latitud se mide «en los bordes izquierdo y derecho» | También en cualquier meridiano de la carta. Propuesta: «sobre un meridiano o en los bordes izquierdo y derecho» | PHAK cap. 16 |
| P9 | Términos nav2-2 y nav2-espera | «Rumbo magnético: dirección de la nariz corregida por la variación»; «circuito ovalado **sobre** un fijo» | «Rumbo verdadero corregido por la variación magnética: la dirección de la nariz respecto al norte magnético.»; «circuito en forma de hipódromo **basado en** un fijo…» | PHAK cap. 16 · AIM 5-3-8 |

Todo lo demás se revisó y está bien: el DME mide por el tiempo de ida y vuelta y viene con el VOR o el ILS; lo
que integra el HSI y por qué no tiene sensibilidad inversa; el ADF muestra el rumbo relativo desde la nariz y
sufre por tormentas, terreno y efecto nocturno; el NDB transmite en LF/MF sin radiales; el RMI da el rumbo
magnético a la estación; la escala gráfica y el minuto de latitud; los pasos del plan VFR; el arco DME, su
posición base y la media milla de anticipación; la espera a la derecha, 1 o 1.5 min, tasa estándar, tres
entradas y el triple de corrección al alejarte; el escenario del arco; y las preguntas nav-q6 a nav-q8,
nav-q10 a nav-q12, nav-q15, nav-q17 a nav-q19, nav-q26 a nav-q28 y nav-q30.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 14 temas, unos 85 (uno por paso), en lugar
  de las 12 infografías (E3).
- **D2 · Capítulos:** pasar de 3 a 4 capítulos sin cambiar los temas ni el avance. Los candados caen después de
  los temas 15, 18, 21 y 24, y cada uno sigue preguntando algo de su capítulo:
  1. «DME y HSI» (temas 13–16) · candado nav-q6 (qué mide el DME);
  2. «ADF, NDB y RMI» (17–19) · candado nav-q8 (qué muestra el ADF);
  3. «Cartas y planificación de ruta» (20–24) · candados nav-q15 (minuto de latitud) y nav-q12 (alterno);
  4. «Arco DME y patrón de espera» (25–26) · sin candado; cierra con el escenario.
- **D3 · Lo que falta explicar:** hoy se pregunta o se usa sin enseñarse:
  - tema 17: «rumbo magnético + rumbo relativo = rumbo magnético a la estación» (lo pregunta nav-q26);
  - tema 19: «con una aguja de VOR, la cola marca el radial en el que estás»;
  - tema 23: «en la carta mides el curso verdadero; con el viento sacas el rumbo, y con la variación pasas a
    magnético». Hace falta para los términos «rumbo magnético», «deriva» y «triángulo de navegación».
- **D4 · Ejercicios por capítulo:**
  - capítulo 2: juego 1 (DME, HSI, ADF, RMI y **NDB**, que entra en lugar de «arco DME»);
  - capítulo 3: el slider de viento en contra;
  - capítulo 4: juego 2 (rumbo magnético, deriva, triángulo de navegación, patrón de espera, entrada de gota
    y **arco DME**) y el escenario del arco.
- **D5 · Slider:** el control interpola en línea recta, así que los valores intermedios salen un poco altos
  (con 20 kt de viento marca 76 min; la cuenta real da 72). Opciones: dejarlo y aclarar «valores aproximados»
  en la nota, o hacer que el slider calcule tiempo = distancia ÷ velocidad. Recomiendo lo segundo: es poco
  código y así el ejercicio no enseña una cuenta que no cuadra.

Efecto en el avance: ninguno. Siguen 14 lecturas y los mismos 4 ejercicios con los mismos ids.

## Cambios aplicados

Erik aprobó todas las correcciones y D1–D5 (2026-11-18).

- **E1, P1–P9:** textos, ideas clave y puntos de los temas 13, 18, 21, 22, 24, 25 y 26; términos «rumbo
  magnético», «patrón de espera» y «entrada de gota»; pregunta nav-q29 («tramo de acercamiento de un minuto»,
  mismo índice correcto).
- **E2 / D5:** el slider usa la ruta real (unas 109 NM, 110 kt y 40 L/h, sin reserva): de 59 a 93 min y de 39 a
  62 L. Ahora calcula tiempo = distancia ÷ velocidad (`sliderValor.ts`), así que con 20 kt de viento marca 72 min.
- **E3 / D1:** 87 clips de Remotion, uno por paso (`remotion-video/src/Academia/Navegacion2/`), en
  `public/videos/academia/navegacion-temaN-n.*`, con su escena en `src/data/escenas.ts`. El DME va a escala
  real de lado; el HSI, el ADF y el RMI calculan sus agujas desde el mapa; la ruta MMGL → MMZO y el alterno
  MMIA están en sus posiciones reales; la espera usa curso de entrada 360 con virajes a la derecha. La imagen de
  cada tema es el póster de su primer clip; las infografías generadas por IA ya no se usan en este módulo.
- **D2:** 4 capítulos: «DME y HSI» (temas 13–16, candado nav-q6), «ADF, NDB y RMI» (17–19, nav-q8), «Cartas y
  planificación de ruta» (20–24, nav-q15 y nav-q12) y «Arco DME y patrón de espera» (25–26, sin candado).
- **D3:** la lección ahora explica rumbo magnético + rumbo relativo (tema 17), la cola de la aguja de VOR en el
  RMI (tema 19) y el paso de curso verdadero a rumbo magnético (tema 23).
- **D4:** ejercicios por capítulo: términos con NDB (2); slider (3); términos con arco DME y escenario del arco (4).
- **Efecto en el avance:** ninguno. Siguen 14 lecturas y los mismos 4 ejercicios con los mismos ids.
