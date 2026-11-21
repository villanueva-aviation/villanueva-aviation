# Revisión de Meteorología — ronda 1 (estilo Rise)

Fecha: 2026-11-18 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-18)**.

Qué se revisó:
- los 10 temas (texto, idea clave y puntos);
- los 2 juegos de términos (14 términos) y los 2 escenarios (tormenta en ruta, engelamiento);
- las 17 preguntas (práctica, evaluación y candados met-q3, met-q6, met-q9);
- las 8 imágenes de los temas y la portada del módulo (`infografia-metar-rmk.jpg`).

Fuentes: FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C, cap. 7, 12 y 13),
AC 00-45H *Aviation Weather Services*, AC 00-6B *Aviation Weather*, AC 91-74B (engelamiento), AIM cap. 7
y 14 CFR 91.155 / 91.151. Los METAR de México usan el formato de EUA (millas SM y altímetro A en inHg).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 2 (texto) | «FEW030 = nubes dispersas (few)» | FEW es **pocas** (1–2 octavos). «Dispersas» es SCT, y el mismo texto lo usa en la línea siguiente | «FEW030 = pocas nubes a 3,000 pies» | AC 00-45H |
| E2 | Tema 8 (texto, punto «Microburst») | La corriente descendente «primero empuja el avión hacia arriba y luego hacia abajo con pérdida repentina de sustentación» | No hay una corriente que suba el avión. Al entrar, el **viento de frente** aumenta: ganas velocidad y quedas alto. En el centro te empuja la descendente y luego el **viento de cola** te quita velocidad y te hunde | «Al entrar, el viento de frente te sube la velocidad y te deja alto; enseguida la descendente y el viento de cola te quitan velocidad y te hunden. Dura pocos minutos, mide alrededor de una milla y la descendente puede llegar a 6,000 pies por minuto» | AIM cap. 7, *Microbursts*; AC 00-6B |
| E3 | Escenario «Engelamiento», primera decisión | Opción correcta: salir de las nubes «ascendiendo o descendiendo hacia aire más cálido» | Al ascender, el aire normalmente es **más frío**. Para un piloto VFR que entró a una nube, la salida de manual es el **viraje de 180°** de vuelta a donde se veía | «Dar media vuelta hacia donde estabas en condiciones visuales y, si el terreno lo permite, bajar hacia aire más cálido» | AC 91-74B; AIM cap. 7 |
| E4 | met-q16 (evaluación) | «…por debajo de 3,000 ft AGL en espacio no controlado… nubes rotas a 800 ft probablemente incumplen el mínimo VFR» | En espacio no controlado bajo 1,200 ft AGL, de día, el mínimo es 1 milla y fuera de nubes: «incumple» no es seguro. Lo que sí es seguro: techo de 800 ft = categoría **IFR** | Pregunta: «¿cuál es peor para un vuelo VFR?». Respuesta: «El primero: un techo de 800 ft es categoría IFR (techo menor de 1,000 ft)». Mismo índice correcto | 14 CFR 91.155; AC 00-45H (categorías) |
| E5 | Imágenes de los 8 temas | Infografías | Generadas por IA, con texto roto («Altinunoia», «Aumendaven», «Viubes aumenta», «nube, cuya base es a 800 piet», «Millas Estatunidenses») y dibujos equivocados: aviones de reacción, un carburador que parece turbina, Toluca en la punta de una montaña, frente frío con tormentas «aisladas» (suele ser una línea) y un microburst con corriente que sube el avión (repite E2) | Clips de Remotion paso a paso, como en Fundamentos y Aerodinámica, con el póster del primero como portada | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 1 (texto, punto «Cada hora») | «cada hora (o cada 30 minutos en algunos casos especiales)» | «cada hora (en algunos aeropuertos, cada media hora); si el tiempo cambia mucho entre reportes, sale un reporte especial, el SPECI» | AC 00-45H |
| P2 | Tema 1 (punto «Idioma universal») | «el mismo código en cualquier país» | Agregar: «con variantes: en México y EUA la visibilidad va en millas (SM) y la presión en pulgadas (A3005); en casi todo el mundo, en metros y hectopascales (Q1013)». Sirve para volar en línea fuera de México | AC 00-45H; OACI Anexo 3 |
| P3 | Tema 2 (texto, punto «09008KT») | «viento del rumbo 090°» | «viento **desde** 090° a 8 nudos. En el METAR la dirección es respecto al norte verdadero; la que te da la torre o el ATIS es magnética» | AC 00-45H; AIM cap. 7 |
| P4 | Tema 3 (texto, punto «Grupos de cambio») | Solo BECMG y TEMPO | Agregar **FM** (a partir de tal hora, el más común) y **PROB30/40** (probabilidad). El TAF se corrige con **TAF AMD** cuando hace falta | AC 00-45H |
| P5 | Tema 5 (texto, punto «SKC o CLR»), término met2-1 y met-q15 | CLR = cielo despejado | SKC = despejado (lo reporta una persona). **CLR** lo pone una estación automática: no detectó nubes **por debajo de 12,000 ft** (puede haber arriba) | AC 00-45H |
| P6 | Tema 5 (texto, clave y punto «Cómo se lee la altura») | «La altura de la base de nubes decide si el vuelo es VFR o IFR» | Lo que falta: las alturas son **sobre el terreno (AGL)**, en cientos de pies; el **techo** es la capa BKN u OVC más baja (FEW y SCT no son techo); y la categoría la deciden **el techo y la visibilidad juntos**: VFR con techo de más de 3,000 ft y más de 5 millas; IFR con techo de menos de 1,000 ft o menos de 3 millas | AC 00-45H |
| P7 | Tema 5 (punto «Los tipos que importan») | «cúmulos de buen tiempo» | «cúmulos: aire inestable, turbulencia debajo de ellos; si crecen mucho, pueden volverse CB». Estratos: «aire estable y suave, pero techos y visibilidad bajos» | PHAK cap. 12 |
| P8 | Tema 7 (punto «De estela»), término met-5, met-q12 | «de aviones grandes» | «la genera todo avión que produce sustentación; es más fuerte detrás de los pesados, lentos y limpios (sin flaps), como al despegar y aterrizar» | AIM cap. 7, *Wake Turbulence* |
| P9 | Tema 9 (texto, punto «De dónde sale») | El agua superenfriada «se congela instantáneamente» | «las gotas chicas se congelan al instante (hielo opaco, *rime*); las grandes se extienden antes de congelarse (hielo claro, *clear*), que pesa más y cuesta más quitar» | PHAK cap. 12; AC 91-74B |
| P10 | Tema 9 (texto, punto «Hielo de carburador») | Por «el enfriamiento al expandirse el combustible vaporizado» | «por la evaporación del combustible y la caída de presión en el venturi. Pasa sobre todo por debajo de 21 °C con humedad alta, y puede pasar hasta con 38 °C. Se nota como pérdida de RPM y se corrige con la calefacción al carburador» | PHAK cap. 7 |
| P11 | Tema 10 (texto, punto «Toluca (MMTO)») | «uno de los aeropuertos comerciales más altos del mundo» | Hay varios más altos (El Alto, Cusco, Quito, Lhasa…). Propuesta: «el aeropuerto internacional más alto de México» — **por confirmar con Erik** | — |
| P12 | Capítulo 2 | Se llama «Nubes, frentes, turbulencia y hielo», pero las nubes están en el capítulo 1 y el capítulo trae wind shear y altitud de densidad | Ver D2 | — |
| P13 | Términos sin lección | Inversión térmica, virga, QNH y punto de rocío salen en el ejercicio, pero la lección no los explica (o casi) | Ver D3 | — |

Todo lo demás se revisó y está bien: qué es METAR y TAF, su vigencia (24 o 30 h, cada 6 h), las coberturas
en octavos, los frentes y sus símbolos, los tipos e intensidades de turbulencia, LLWS y LLWAS, el rango de
0 a −20 °C para el hielo estructural, la elevación de Toluca (8,466 ft) y su altitud de densidad en un día
caluroso (11,000–12,000 ft cuadra: ISA allá es −2 °C, a 25 °C da unos 11,700 ft), los 20 NM de separación de
un CB, y la reserva de combustible del escenario de la tormenta (25 min es menos de los 30 de VFR de día).

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 10 temas (unos 55), como en Aerodinámica,
  en lugar de las 8 infografías (E5). La portada del módulo (`infografia-metar-rmk.jpg`) es diseño propio y
  se queda.
- **D2 · Capítulos:** pasar de 2 a 3 capítulos, sin cambiar los temas ni el avance:
  1. «Leer METAR y TAF» (temas 1–5) · candado met-q3;
  2. «Lo que mueve el aire» (temas 6–8: frentes, turbulencia, wind shear) · candado met-q6;
  3. «Hielo y altitud de densidad» (temas 9–10) · candado met-q9.

  Los candados ya caen así (después de los temas 3, 6 y 9) y cada uno pregunta algo de su capítulo.
- **D3 · Términos:** acomodar los dos juegos por capítulo (mismos 14 términos, solo cambian de juego) y
  explicar en la lección los que faltan, con una línea cada uno:
  - juego 1, capítulo 1: METAR, TAF, BKN, SKC/CLR, punto de rocío, visibilidad, QNH. Tema 2: «22/12: si
    la temperatura y el rocío están a 2–3 °C, espera niebla o nubes bajas»; «A3005 es el QNH: con él, en
    tierra, el altímetro marca la elevación del aeropuerto»;
  - juego 2, capítulos 2 y 3: frente frío, estela, wind shear, inversión térmica, virga, engelamiento,
    altitud de densidad. Tema 8: «también hay wind shear en una inversión térmica, cuando el viento
    arriba de ella es fuerte»; «la virga debajo de una nube de tormenta puede anunciar un microburst».
- **D4 · Ejercicios por capítulo:** capítulo 1, términos (juego 1); capítulo 2, escenario de la tormenta;
  capítulo 3, escenario del engelamiento y términos (juego 2).
- **D5 · Toluca:** confirmar la frase de P11.

Efecto en el avance: ninguno. Siguen 10 lecturas y los mismos 4 ejercicios con los mismos ids.

## Cambios aplicados

Erik aprobó todas las correcciones y D1–D5 (2026-11-18), con Toluca como «el aeropuerto internacional más alto de
México».

- **E1–E4, P1–P11:** textos, ideas clave y puntos de los temas 1, 2, 3, 5, 7, 8, 9 y 10; términos met2-1 (SKC/CLR)
  y met-5 (estela); preguntas met-q12, met-q15 y met-q16 (mismo índice correcto); primera decisión del escenario
  de engelamiento.
- **E5 / D1:** 69 clips de Remotion, uno por paso (`remotion-video/src/Academia/Meteorologia/`), en
  `public/videos/academia/meteorologia-temaN-n.*`, con su escena en `src/data/escenas.ts`. La imagen de cada tema
  es el póster de su primer clip; las 8 infografías viejas ya no se usan. La portada del módulo se queda.
- **D2:** 3 capítulos: «Leer METAR y TAF» (temas 1–5, candado met-q3), «Lo que mueve el aire» (6–8, met-q6) y
  «Hielo y altitud de densidad» (9–10, met-q9).
- **D3:** juegos de términos acomodados por capítulo; la lección ahora explica punto de rocío y QNH (tema 2),
  inversión térmica y virga (tema 8).
- **D4:** ejercicios por capítulo: términos (1); tormenta en ruta (2); engelamiento y términos (3).
- **Efecto en el avance:** ninguno. Siguen 10 lecturas y los mismos 4 ejercicios con los mismos ids.
