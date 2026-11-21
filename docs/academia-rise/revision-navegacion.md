# Revisión de Navegación I — ronda 1 (estilo Rise)

Fecha: 2026-11-18 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-18)**.

Qué se revisó:
- los 12 temas (texto, idea clave y puntos);
- los 2 juegos de términos (9 términos) y el escenario de deriva por viento;
- las 15 preguntas (práctica, evaluación y candados nav-q1, nav-q3, nav-q14, nav-q9);
- las 12 imágenes de los temas (11 infografías y el SVG del CDI del tema 5).

Fuentes: FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C, cap. 16), *Instrument Flying
Handbook* (IFH, FAA-H-8083-15B, cap. 9), AIM 1-1-2 (NDB) y 1-1-3 (VOR).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | nav-q16 (evaluación) | Radial A bien trazado, radial B con 10° de error: la posición «se desplaza a lo largo del radial B» | Al revés. Tu posición real sigue sobre el radial A (el bueno), así que el cruce con el B equivocado se corre **a lo largo del radial A**. El error crece cuanto más lejos estés del VOR B | Respuesta: «Se desplaza a lo largo del radial A, y más cuanto más lejos estés del VOR B». Mismo índice correcto | PHAK cap. 16 (fijación con dos VOR) |
| E2 | Imágenes de 11 temas | Infografías | Generadas por IA, con dibujos equivocados: una rosa de compás con números que no existen o fuera de lugar (tema 3: «390», «220» y «310» donde no les toca), jets y aviones de línea en lugar de una avioneta (temas 1, 3, 7, 8, 10 y 11), texto repetido («diferencia diferencia», tema 2) y un *homing* dibujado como una espiral que le da vueltas a la estación (tema 11; en realidad es una curva que termina en la estación) | Clips de Remotion paso a paso, como en Fundamentos, Aerodinámica y Meteorología, con el póster del primero como portada. El SVG del tema 5 no es de IA y está bien, pero se cambia por clips para que todo el módulo se vea igual | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 5 (texto y punto «Cómo se lee»), tema 7 (paso 3) y tema 9 (puntos y regla práctica) | «Aguja a la izquierda = el curso está a tu izquierda»; «vuela hacia donde apunta la aguja» | Es cierto **solo si tu rumbo se parece al curso seleccionado**. Si seleccionas el curso recíproco, el CDI indica al revés (sensibilidad inversa). Agregar en el tema 5: «siempre que vueles con un rumbo parecido al curso seleccionado; si seleccionas el recíproco, la aguja indica al revés». Lo pregunta nav-q23 y hoy no se explica en el módulo | PHAK cap. 16 (*reverse sensing*) |
| P2 | Tema 8 (texto y punto «Y además») | 30° «es el ángulo que se enseña y evalúa en la mayoría de los programas» | No hay un ángulo obligatorio. El IFH duplica la diferencia entre el radial en que estás y el que quieres, con un mínimo de 20° y un máximo de 90°. En la práctica, 30° cerca de la estación o con el curso cerca, y 45° si estás lejos o con la aguja a escala completa. Propuesta: «30° es un buen punto de partida: rápido sin pasarte. Lejos de la estación puedes usar 45°; nunca más de 90°». nav-q14 pasa a «El ángulo de intercepción más usado…» (mismo índice) | IFH cap. 9 (*Course Interception*) |
| P3 | Tema 8 (punto «Con más de 30 o 45») | La aguja se mueve muy rápido «cerca del centro» | Lo que la hace moverse rápido es estar **cerca de la estación**: la misma desviación es menos distancia lateral (nav-q22). Propuesta: «con ángulos grandes, y más cerca de la estación, la aguja se centra de golpe y es fácil pasarte» | PHAK cap. 16 |
| P4 | Tema 12 (texto y puntos) | El cruce de dos radiales es tu posición | Agregar: «la fijación es más precisa cuando los radiales se cruzan cerca de 90°; si se cruzan en ángulo cerrado, un error chico mueve mucho el punto». Sirve para nav-q16 | PHAK cap. 16 |
| P5 | Término nav2-6 «Homing» | «Volar directo hacia una estación NDB sin corregir el viento» | El tema 11 lo explica con el VOR. Propuesta: «Volar con la nariz siempre hacia la estación, sin corregir el viento; produce una trayectoria curva» | PHAK cap. 16 (*homing*) |
| P6 | Escenario, primera decisión | «Corregir el rumbo hacia el lado de la desviación» | Ambiguo. Propuesta: «Corregir el rumbo unos grados hacia la aguja y dejar esa corrección mientras la aguja se mantenga centrada» | PHAK cap. 16 |
| P7 | Temas sin explicación de lo que se pregunta | nav-q20 (línea de vista), nav-q21 (identificar por Morse), nav-q22 (sensibilidad cerca de la estación), nav-q23 (curso recíproco) y nav-q25 y el escenario (cono de confusión y paso de estación) preguntan cosas que ninguna lección explica | Ver D3 | — |

Todo lo demás se revisó y está bien: la banda del VOR (108.00–117.95 MHz), la fase variable a 30 vueltas por
segundo, que el radial se mide desde la estación y en grados magnéticos, TO/FROM y la diferencia de 180°, cada
punto del CDI ≈ 2° (10° a escala completa), lo que hace y no hace el OBS, la fórmula del rumbo de intercepción
(curso ± ángulo) con el ejemplo de 030 y 330, el WCA hacia el lado del viento, homing contra tracking y las
preguntas nav-q1 a nav-q5, nav-q9, nav-q13 y nav-q20 a nav-q25.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 12 temas, unos 66 (uno por paso), en lugar
  de las 11 infografías y el SVG (E2).
- **D2 · Capítulos:** pasar de 1 a 4 capítulos de 3 temas, sin cambiar los temas ni el avance. Los candados ya
  caen después de los temas 3, 6, 9 y 12, así que queda uno por capítulo y cada uno pregunta algo de su capítulo:
  1. «El VOR y sus radiales» (temas 1–3) · candado nav-q1 (el radial se mide desde el VOR);
  2. «TO/FROM, CDI y OBS» (temas 4–6) · candado nav-q3 (cada punto del CDI);
  3. «Interceptar un radial» (temas 7–9) · candado nav-q14 (ángulo de intercepción);
  4. «Tracking y fijación cruzada» (temas 10–12) · candado nav-q9 (fijación cruzada).
- **D3 · Lo que falta explicar:** una línea en la lección por cada cosa que hoy se pregunta sin enseñarse:
  - tema 1: «la señal viaja en línea de vista: a más altura, más alcance»; «antes de usarlo, sintonízalo e
    identifícalo por su código Morse»;
  - tema 5: «cerca de la estación, la misma desviación es menos distancia lateral: la aguja se vuelve más
    sensible»; más la línea de sensibilidad inversa de P1;
  - tema 10: «al pasar sobre la estación entras al cono de confusión: la aguja oscila y la bandera cambia de TO
    a FROM; mantén el rumbo hasta que se estabilice».
- **D4 · Ejercicios por capítulo:** capítulo 2, términos (juego 1: VOR, radial, TO/FROM, CDI, OBS); capítulo 4,
  términos (juego 2: tracking, homing, paso sobre la estación, cross-fix) y el escenario de deriva por viento.
  Los capítulos 1 y 3 quedan solo con lectura y candado.

Efecto en el avance: ninguno. Siguen 12 lecturas y los mismos 3 ejercicios con los mismos ids.

## Cambios aplicados

Erik aprobó todas las correcciones y D1–D4 (2026-11-18).

- **E1, P1–P7:** textos, ideas clave y puntos de los temas 1, 5, 7, 8, 9, 10 y 12; término nav2-6 (homing);
  preguntas nav-q14 («más usado», mismo índice) y nav-q16 (mismo índice correcto); primera decisión del
  escenario.
- **E2 / D1:** 68 clips de Remotion, uno por paso (`remotion-video/src/Academia/Navegacion/`), en
  `public/videos/academia/navegacion-temaN-n.*`, con su escena en `src/data/escenas.ts`. En los mapas el norte
  va arriba; el CDI calcula aguja y bandera desde la posición del avión, y el homing es una trayectoria simulada
  con viento. La imagen de cada tema es el póster de su primer clip; las 11 infografías y el SVG ya no se usan.
- **D2:** 4 capítulos: «El VOR y sus radiales» (temas 1–3, candado nav-q1), «TO/FROM, CDI y OBS» (4–6, nav-q3),
  «Interceptar un radial» (7–9, nav-q14) y «Tracking y fijación cruzada» (10–12, nav-q9).
- **D3:** la lección ahora explica línea de vista y Morse (tema 1), curso recíproco y sensibilidad cerca de la
  estación (tema 5), cono de confusión (tema 10) y precisión del cruce cerca de 90° (tema 12).
- **D4:** ejercicios por capítulo: términos (2); términos y escenario de deriva (4).
- **Efecto en el avance:** ninguno. Siguen 12 lecturas y los mismos 3 ejercicios con los mismos ids.
