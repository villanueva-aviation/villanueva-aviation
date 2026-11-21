# Revisión de VFR — ronda 1 (estilo Rise)

Fecha: 2026-11-19 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-19)**.

Qué se revisó:
- los 9 temas (texto, idea clave y puntos);
- el juego de términos (7 términos);
- el circuito de tráfico (8 situaciones);
- los 2 escenarios («clima cambiante» y «conflicto en el patrón»);
- las 17 preguntas (práctica, evaluación y candados vfr-q16, vfr-q6 y vfr-q12);
- las 9 imágenes de los temas.

Fuentes:
- 14 CFR 91.155 (mínimos VFR), 91.157 (Special VFR), 91.113 (derecho de paso), 91.126 (virajes del circuito),
  91.209 (luces) y 1.1 (definición de noche);
- FAA AIM 4-1-9 (avisos en la CTAF) y 4-3-23 (uso de las luces);
- FAA AC 90-66C (circuito en aeródromos sin torre);
- FAA *Airplane Flying Handbook* (FAA-H-8083-3C), cap. 8 (aproximación y aterrizaje).

Las cifras del módulo (3 millas, 500/1,000/2,000 ft, 1 milla en Clase G) son las de la FAA, aunque el módulo no lo
dice. Ver D3.

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 9 (texto y punto «La baliza»), término vfrt-6 | La baliza «se enciende en cuanto el motor arranca» / «con el motor en marcha» | Es al revés: la baliza se enciende **antes** de arrancar, para avisar en plataforma que la hélice va a girar, y se queda encendida mientras el motor esté en marcha | Tema: «se enciende antes de arrancar el motor y se queda encendida mientras esté en marcha». Término: «Luz roja anticolisión: se enciende antes de arrancar y mientras el motor está en marcha» | AIM 4-3-23 |
| E2 | Tema 9 (texto y punto «Cuándo van encendidas») | Las luces de posición van «desde 30 minutos después de la puesta del sol hasta 30 minutos antes de su salida» | La FAA las exige **de la puesta a la salida del sol**. Los 30 minutos (el crepúsculo civil) son la definición de *noche* para la experiencia reciente, no para las luces | «Las de posición, de la puesta a la salida del sol; la anticolisión, siempre que el avión opere, salvo que el piloto la apague por seguridad (por ejemplo, dentro de nubes)» | 91.209, 1.1 |
| E3 | Tema 3 (texto, idea clave y punto «Por qué son más estrictos»), pregunta vfr-q15 | De noche los mínimos VFR son más estrictos, en general | En espacio controlado los mínimos de la FAA son **iguales de día y de noche**. Lo que cambia es la Clase G: de día basta 1 milla y libre de nubes; de noche, 3 millas y 500/1,000/2,000 ft. vfr-q15 enseña la regla equivocada | Tema: «En espacio controlado los mínimos son los mismos; en Clase G suben de noche». vfr-q15, correcta: «En espacio controlado son iguales; en Clase G son más estrictos de noche» | 91.155(a) |
| E4 | Tema 6 (texto y punto «Viraje a base»), situación vfr-3 del circuito, imagen del tema 6 | «El viraje a base marca el inicio del descenso»; vfr-3: «acabas de dejar la altitud de circuito e iniciaste el descenso, perpendicular al eje de pista» | El descenso empieza en **viento en cola, a la altura del punto de toque** (al reducir potencia), no en base. En base ya vas descendiendo | Tema: «a la altura del punto de toque, en viento en cola, reduces potencia y empiezas a descender; en base sigues bajando y revisas la pista y la final». vfr-3: «Vas perpendicular al eje de pista, ya en descenso, entre el viento en cola y la final. ¿En qué tramo vas?» | AFH cap. 8; AC 90-66C |
| E5 | Imágenes de los 9 temas | Infografías | 8 son generadas por IA, como las de los módulos anteriores. La de los temas 1 y 2 es de Reglamentación (habla de IFR y alternos). La del tema 4 da 1,500 m de la OACI mientras el texto dice 1 milla. La del tema 6 repite E4. La del tema 7 es un reporte en ruta («sobre el punto Vista Hermosa, seis mil quinientos pies»), no un reporte de circuito, y usa el punto que en Comunicaciones se quitó | Reemplazarlas por clips (D1) | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 1 (texto y punto «Quién es responsable») | «El piloto, y no el ATC, es responsable de detectar y separarse» | En Clase B el ATC sí separa al VFR, y en C lo separa del IFR. Propuesta: «el piloto **siempre** es responsable de ver y evitar, aunque el ATC le dé separación o avisos de tráfico» | 91.113(b) |
| P2 | Tema 2 (texto y punto «Para el examen») | Pide memorizar «la tabla completa», pero el módulo nunca la muestra | Mostrar la tabla en el clip: Clase B, 3 millas y libre de nubes; C, D y E, 3 millas y 500/1,000/2,000 ft; G de día bajo 1,200 ft AGL, 1 milla y libre de nubes. Y cambiar el punto por «la tabla está en el clip; apréndela por clase» | 91.155(a) |
| P3 | Pregunta vfr-q2 | «En espacio controlado», 500 ft abajo, 1,000 arriba y 2,000 horizontal | En Clase B basta con libre de nubes. Propuesta: «En Clase C, D o E por debajo de 10,000 ft» | 91.155(a) |
| P4 | Pregunta vfr-q8 | Techo de 900 ft: «No, un techo tan bajo rara vez deja margen suficiente» | No es cuestión de margen: con el circuito a 1,000 ft AGL no puedes quedar 500 ft bajo las nubes, y dentro de la zona de superficie de un aeropuerto controlado no se vuela VFR bajo un techo de menos de 1,000 ft sin Special VFR. Propuesta de correcta: «No: con techo bajo 1,000 ft, en un aeropuerto controlado necesitas Special VFR» | 91.155(c) |
| P5 | Tema 4 (texto y punto «Las condiciones») | Special VFR «de día» y «en espacio controlado» | Es dentro de la **zona de superficie** de un aeropuerto controlado. De noche también se puede, si el piloto tiene habilitación de instrumentos y el avión está equipado para IFR. Propuesta: «libre de nubes, 1 milla de visibilidad, dentro de la zona de superficie del aeropuerto; de noche, solo con habilitación y avión IFR» | 91.157 |
| P6 | Tema 7 (texto y punto «Dónde reportar») | Reportar en entrada, viento en cola, base y final | La FAA recomienda además avisar a unas 10 millas y al librar la pista, y nombrar el aeródromo al principio y al final del aviso. Propuesta: «a unas 10 millas, al entrar, en viento en cola, base, final y al librar la pista» | AIM 4-1-9 |
| P7 | Tema 8 (texto y punto «La regla general») | La aeronave más baja o más cerca de aterrizar tiene preferencia | Falta la otra mitad de la regla: **no puedes usar** esa preferencia para meterte delante de quien ya está en final ni para rebasarlo. Propuesta: agregarlo | 91.113(g) |
| P8 | Tema 9 (texto y punto «Cómo se leen») | «Todo avión lleva luces de posición obligatorias»; «ver solo una te dice de qué lado va su trayectoria» | Son obligatorias para volar de noche, no para todo avión. Y conviene decir qué significa cada una: si ves su **roja**, el otro va de tu derecha a tu izquierda y tiene el paso; si ves su **verde**, va de izquierda a derecha y el paso es tuyo; si ves solo la **blanca**, se aleja | 91.209, 91.113(d) |

Todo lo demás se revisó y está bien:
- el principio de ver y evitar y por qué existen los mínimos;
- 3 millas en espacio controlado (vfr-q1) y 1 milla libre de nubes en Clase G de día bajo 1,200 ft (vfr-q3);
- la Clase G de día contra la de noche (vfr-q16, el candado);
- que el Special VFR se pide, no es automático, y el ATC puede negarlo;
- la entrada a 45° al viento en cola, a la altitud del circuito;
- virajes a la izquierda salvo indicación (vfr-q5) y el circuito a 1,000 ft AGL (vfr-q4);
- que en la CTAF nadie autoriza: es información;
- base, final, motor y al aire, y las otras situaciones del circuito;
- los colores de las luces de posición y los estrobos (apagarlos dentro de nubes);
- los 2 escenarios y las otras preguntas.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 9 temas, 50 en total (uno por paso), en lugar
  de las 9 imágenes (E5).
- **D2 · Ejercicios por capítulo** (para que nada se pregunte antes de enseñarse). Hoy el reparto automático deja:
  - en el capítulo 2, el juego de términos, que pregunta luces y baliza (se enseñan en el capítulo 3);
  - en el capítulo 3 (luces), el circuito y el escenario del patrón (se enseñan en el capítulo 2).

  Propuesta:
  - capítulo 1 (mínimos): el escenario de clima cambiante;
  - capítulo 2 (circuito): el circuito de tráfico y el escenario del conflicto en el patrón;
  - capítulo 3 (luces): el juego de términos, que ya cubre todo el módulo.

  Los capítulos y los candados se quedan como están.
- **D3 · Reglas de la FAA o de México:** las cifras son de la FAA y el módulo no lo dice. Propongo:
  - decirlo una vez en el tema 2: «Estas son las cifras de la FAA (EUA), las que usan la mayoría de los cursos de
    simulador; en México consulta el AIP (ENR 1.2) para las vigentes»;
  - dejar las preguntas con las cifras de la FAA, como en Espacios aéreos.

  Si prefieres las de México, necesito que me digas la fuente que quieres citar; no las voy a escribir de memoria.

Efecto en el avance: ninguno. Siguen 9 lecturas y los mismos ejercicios, con los mismos id.

## Cambios aplicados

Erik aprobó todo el 2026-11-19: «Adelante».

- E1 a E4 y P1 a P8: textos, ideas clave, puntos, el término de la baliza, las preguntas vfr-q2, vfr-q8 y vfr-q15
  y la situación vfr-3 del circuito corregidos como se propuso.
- E4 también estaba en piezas compartidas del circuito de tráfico (las usan Comunicaciones y Operación): la
  descripción del viento en cola ahora dice que ahí empieza el descenso, la de base dice «sigues descendiendo», y
  la situación sit-8 de Comunicaciones también.
- E5 y D1: 52 clips de Remotion (uno por paso) reemplazan las 9 imágenes. Los temas 2 y 3 ganaron un paso cada uno,
  porque ahora muestran la tabla de mínimos.
- D2: el capítulo 1 lleva el escenario de clima cambiante; el capítulo 2, el circuito y el escenario del patrón;
  el capítulo 3, los términos. Los capítulos, los candados y los id no cambian.
- D3: el tema 2 dice que las cifras son de la FAA y remite al AIP de México (ENR 1.2); el tema 3 y vfr-q15 dicen
  «con las reglas de la FAA».
- La prueba del reparto automático de ejercicios usaba VFR de ejemplo; ahora usa Operación, que todavía no declara
  sus ejercicios por capítulo.
- Pruebas nuevas:
  - los ejercicios de cada capítulo;
  - los textos sin los errores de la revisión;
  - de noche solo cambia la Clase G (vfr-q15);
  - 500/1,000/2,000 ft para las Clases C, D y E (vfr-q2);
  - el Special VFR con techo bajo 1,000 ft (vfr-q8);
  - la baliza antes de arrancar;
  - el descenso desde el viento en cola (vfr-3);
  - un clip por paso.
