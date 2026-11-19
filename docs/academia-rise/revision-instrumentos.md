# Revisión de Instrumentos — ronda 1 (estilo Rise)

Fecha: 2026-11-18 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-18)**.

Qué se revisó:
- los 11 temas (texto, idea clave y puntos);
- los 2 juegos de términos (14 términos), el diagrama del Six Pack y los 2 escenarios (falla de vacío y bloqueo
  pitot-estático);
- las 17 preguntas (práctica, evaluación y candados ins-q17, ins-q6 e ins-q12);
- las 11 imágenes de los temas.

Fuentes: FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C, cap. 8, *Flight Instruments*);
FAA *Instrument Flying Handbook* (IFH, FAA-H-8083-15B, cap. 5 y 9); FAA AIM 1-1-7 (DME), 4-1-20 (transpondedor) y
6-2-2 (códigos de emergencia).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 7 (texto y punto «ANDS»), término ins-6, pregunta ins-q7 | El error ANDS ocurre «al acelerar volando hacia el norte» y «en rumbos norte-sur» | Es al revés: el error de aceleración es máximo en rumbos **este u oeste** y no existe en rumbo norte o sur. En el hemisferio norte, acelerar en rumbo este u oeste hace que el compás marque un viraje hacia el norte; desacelerar, hacia el sur. La respuesta «correcta» de ins-q7 está mal | Texto: «al acelerar en rumbo este u oeste, el compás marca un viraje hacia el norte que no existe; al desacelerar, hacia el sur». Término: «…al acelerar o desacelerar en rumbos este-oeste». ins-q7: «al acelerar o desacelerar en rumbos este-oeste» | PHAK cap. 8 (*Acceleration error*) |
| E2 | Tema 2 (texto y punto «Cómo mide») | Mide «la diferencia entre presión dinámica (captada por el tubo pitot) y presión estática» | El pitot capta la presión **total** (de impacto). La diferencia entre la total y la estática **es** la presión dinámica, que el velocímetro convierte en velocidad. Como está, la presión dinámica aparece dos veces | «Compara la presión total del tubo pitot con la presión estática: la diferencia es la presión dinámica, y eso es tu velocidad» (igual que ya dice el diagrama del Six Pack) | PHAK cap. 8 |
| E3 | Tema 1 (idea clave) | «El altímetro te miente **a tu favor**» | Te miente **en tu contra**: marca más altura de la que tienes, que es lo peligroso cerca del terreno | «De alta a baja presión, cuidado abajo: el altímetro marca más altura de la que tienes» | PHAK cap. 8 |
| E4 | Escenario «bloqueo del sistema pitot-estático» (segunda decisión y su retroalimentación) | Con la toma estática bloqueada, al descender «el velocímetro marca cada vez menos» y bajar la nariz te lleva a exceso de velocidad | Es al revés. Con la estática bloqueada, por debajo de la altitud del bloqueo el velocímetro marca **más** de lo real y por encima marca **menos**. Además, la primera decisión describe un pitot bloqueado (el velocímetro «se comporta como altímetro») y la segunda una estática bloqueada: son dos fallas distintas mezcladas | Reescribirlo como una sola falla de la estática (ver D5) | PHAK cap. 8 (*Blockage of the Static System*) |
| E5 | Tema 7 (idea clave y texto) | El compás es «el único que funciona sin electricidad ni vacío» | El altímetro, el velocímetro y el VSI tampoco usan electricidad ni vacío. El compás es el único **indicador de rumbo** que no los necesita | «El único indicador de rumbo que funciona sin electricidad ni vacío…» | PHAK cap. 8 |
| E6 | Módulo (actividades) | Dos ejercicios tienen el mismo id `interactividad-3`: el escenario de falla de vacío y el segundo juego de términos | Completar uno marca los dos como hechos en tu avance, y el motor los trata como uno solo | Darle al segundo juego de términos su propio id (`interactividad-5`). Quien ya completó `interactividad-3` lo sigue teniendo; solo ese juego aparecerá pendiente | — |
| E7 | Imágenes de los 11 temas | Infografías | Generadas por IA: el velocímetro tiene la escala y los arcos inventados, el VSI trae una escala inventada, la de giro y viraje dibuja un coordinador de viraje y la del RMI tiene la rosa mal rotulada. El tema 9 usa la imagen del RMI del módulo de Navegación | Reemplazarlas por clips (D1) | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 6 (texto y punto «El retraso») | El VSI da «una tendencia con retraso» | Es al revés: la **tendencia** (si subes o bajas) aparece casi de inmediato; la **tasa** exacta tarda 6 a 9 segundos en estabilizarse | PHAK cap. 8 |
| P2 | Tema 3 (texto e idea clave) | En IMC es «tu única referencia confiable de actitud» | Es el único que muestra la actitud **directamente**; los demás la confirman. Como está, contradice el escenario de panel parcial, donde se vuela sin él | IFH cap. 5 |
| P3 | Tema 1 (texto) | La ventana Kollsman va «en pulgadas de mercurio» | En México y EUA se usan inHg; en muchos países, hectopascales. Y la regla también vale para la temperatura: de caliente a frío, cuidado abajo | PHAK cap. 8 |
| P4 | Tema 2 (punto «IAS, CAS y TAS») | CAS = IAS «corregida por errores del instrumento» | Corregida por errores **de instalación y del instrumento** | PHAK cap. 8 |
| P5 | Término ins2-2 y término ins2-4 | El pitot «mide la presión dinámica»; el bloqueo del pitot hace que el velocímetro se comporte como altímetro | El pitot capta la presión total. El velocímetro se comporta como altímetro cuando se tapan **la entrada y el drenaje** del pitot; si solo se tapa la entrada, cae a cero | PHAK cap. 8 |
| P6 | Tema 9 (texto y punto «Por qué es distinto») | Las agujas dan «el rumbo magnético verdadero» | Magnético y verdadero son cosas distintas. Propuesta: «la punta de la aguja te da el rumbo magnético hacia la estación» | IFH cap. 9 |
| P7 | Tema 10 (texto) | Distancia y groundspeed sin matices | El DME mide distancia **oblicua** (en línea recta hasta la antena): sobre la estación a 6,000 ft marca cerca de 1 NM. Y la groundspeed solo es exacta volando directo hacia la estación o desde ella | AIM 1-1-7 |
| P8 | Tema 8 (texto) | El HSI «debe sincronizarse periódicamente con el compás» | Los HSI esclavizados a un compás remoto se sincronizan solos; el ajuste a mano es para los que no lo están | IFH cap. 5 |
| P9 | Escenario de falla de vacío (inicio) | El horizonte y el indicador de rumbo «comienzan a inclinarse» | El horizonte se inclina, pero el indicador de rumbo gira sin que vires. Agregar que el indicador de succión marca bajo, que es como se confirma | PHAK cap. 8 |

Todo lo demás se revisó y está bien: las altitudes indicada, verdadera, de presión y de densidad; los arcos de color
y la Vne; TAS mayor que IAS en altura; el giróscopo y la precesión; el viraje estándar a 3° por segundo y la bola
(derrape hacia afuera, resbale hacia adentro); el coordinador de viraje con alabeo y tasa de giro; el VSI y su fuga
calibrada; la variación y la desviación; el HSI sin errores de oscilación ni ANDS; el RMI con dos agujas; el DME y sus
tres datos; el transponder con Modo C y S, 7500, 7600, 7700 e IDENT; el diagrama del Six Pack; el escenario de falla
de vacío (panel parcial y desviarse al campo con mejor clima); y las otras 16 preguntas.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 11 temas, unos 63 (uno por paso), en lugar de las
  11 infografías (E7). Se pueden reusar los instrumentos que ya dibujé para Navegación (HSI, RMI, ADF y la pantalla
  del DME) y dibujar los que faltan: altímetro, velocímetro, horizonte, giro y viraje, coordinador, VSI y compás.
- **D2 · Capítulos:** pasar de 2 a 4 capítulos sin cambiar los temas ni el avance. Hoy el título del primer capítulo
  no menciona el VSI y el del segundo sí, aunque el VSI está en el primero. Los candados caen después de los temas 3,
  6 y 9:
  1. «Altímetro, velocidad y actitud» (temas 1–3);
  2. «Viraje y velocidad vertical» (4–6);
  3. «Rumbo: compás, HSI y RMI» (7–9);
  4. «DME y transponder» (10–11).
- **D3 · Candados:** hoy el primero es ins-q17 (panel parcial con coordinador y compás), pero cae después del tema 3,
  antes de enseñar el coordinador (tema 5) y el compás (tema 7). Propuesta: ins-q4 (el giróscopo del horizonte)
  después del tema 3; ins-q6 (retraso del VSI) después del 6, como hoy; ins-q12 (RMI) después del 9, como hoy.
  ins-q17 se queda en la evaluación.
- **D4 · Ejercicios por capítulo** (para que nada se pregunte antes de enseñarse):
  - capítulo 1: términos 2 (vacío, pitot, estática, bloqueo del pitot, giróscopo, precesión, sistema pitot-estático);
  - capítulo 2: el diagrama del Six Pack y el escenario de bloqueo de la estática;
  - capítulo 3: el escenario de falla de vacío (usa el coordinador y el compás);
  - capítulo 4: términos 1 (Kollsman, Vne, horizonte, viraje estándar, VSI, ANDS y 7700).
- **D5 · El escenario pitot-estático (E4):** propongo dejarlo como una sola falla de la toma estática, que es la que
  tiene la estática alterna como respuesta:
  - inicio: «Subiendo en nubes, el altímetro se queda fijo, el VSI marca cero y el velocímetro marca cada vez menos
    aunque no cambiaste ni actitud ni potencia». Opciones: bajar la nariz para recuperar la velocidad indicada (mal:
    por encima de la altitud del bloqueo el velocímetro marca menos de lo real) o sospechar la toma estática y volar
    por actitud y potencia conocidas (bien);
  - segunda: abrir la estática alterna (bien: lecturas usables, un poco altas) o encender la calefacción del pitot y
    seguir con el velocímetro (mal: lo bloqueado es la estática; el altímetro fijo y el VSI en cero lo delatan).
  Si prefieres la historia del pitot con hielo, la respuesta sería la calefacción del pitot en vez de la estática
  alterna.

Efecto en el avance: ninguno, salvo E6. Siguen 11 lecturas y los mismos ejercicios.

## Cambios aplicados

Erik aprobó todo el 2026-11-18: «Sí, apruébalas todas; usa la falla de la estática».

- E1 a E5 y P1 a P9: textos, ideas clave, puntos, términos y la pregunta ins-q7 corregidos como se propuso.
- E4 y D5: el escenario pitot-estático quedó como una sola falla de la toma estática; la respuesta correcta es abrir
  la estática alterna.
- E6: el segundo juego de términos ahora es `interactividad-5`. El escenario de falla de vacío conserva
  `interactividad-3`, así que quien ya lo completó no pierde nada.
- E7 y D1: 63 clips de Remotion (uno por paso) reemplazan las 11 infografías generadas por IA. El tema 9 ya no usa
  la imagen del RMI de Navegación.
- D2, D3 y D4: 4 capítulos, candados ins-q4, ins-q6 e ins-q12, y cada ejercicio en el capítulo donde ya se enseñó
  lo que pregunta.
- Pruebas nuevas: cuatro capítulos y sus ejercicios, textos sin los errores de la revisión, ANDS en rumbos
  este-oeste, pitot con presión total, escenario de la estática, ningún id de actividad repetido y un clip por paso.
