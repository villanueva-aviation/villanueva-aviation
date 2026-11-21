# Revisión de Fundamentos — ronda 1 (estilo Rise)

Fecha: 2026-11-17 · Estado: **correcciones aplicadas**.

Qué se revisó: los 8 temas (texto, idea clave y puntos), las 6 misiones (gancho, pasos en el simulador y
preguntas), la práctica y la evaluación (fun-q1 a fun-q17), los términos, el escenario «reduces potencia»,
los puntos del diagrama del Cessna (`hotspots.ts`), las escenas (`escenas.ts`) y las imágenes de los temas.

Fuentes: FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C) y *Airplane Flying
Handbook* (AFH, FAA-H-8083-3C).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | fun-q17 (evaluación) | La guiñada adversa aparece «porque el alerón que sube genera más resistencia» | Es al revés: el alerón que **baja** (en el ala que sube) produce más sustentación y más resistencia inducida, y jala la nariz hacia fuera del viraje | «…porque el ala que sube, con su alerón abajo, genera más resistencia inducida; el timón la compensa» | PHAK cap. 6, *Adverse Yaw* |
| E2 | Tema 2 (texto y punto), término «Resistencia» en la escena | Resistencia = «la fricción del aire contra la aeronave» | La fricción es solo una parte. La resistencia es la fuerza que se opone al avance: parásita (forma, interferencia y fricción) e inducida (la que cuesta producir sustentación) | «Resistencia: la fuerza que se opone al avance; viene de la forma y la fricción del avión y de producir sustentación» | PHAK cap. 5, *Drag* |
| E3 | Misión 2 (paso 3 en el simulador) y pregunta mis-fun-2b | «Reduce la potencia **sin mover el yugo**: la velocidad baja y el avión desciende» | Con el avión compensado, si no mueves el yugo la nariz baja sola y el avión desciende **más o menos a la misma velocidad**: el cadete verá en el simulador lo contrario de lo que le dijimos. Lo que sí baja la velocidad es **sostener la misma actitud** (como dice el escenario del módulo) | Paso: «Reduce un poco la potencia y sostén la nariz en la misma actitud: la velocidad baja y el avión empieza a descender». Pregunta: «Si reduces la potencia y sostienes la misma actitud, el avión:» | AFH cap. 3 (compensador; descensos) |
| E4 | Tema 5 (texto y punto «Flaps y secundarias») | «spoilers o trim tabs que ayudan a reducir la carga de control»; «algunos aviones suman spoilers o trim tabs» | Los spoilers **quitan** sustentación y suman resistencia; el compensador (trim) es el que quita presión del control, y lo traen casi todos los aviones (el C172 tiene compensador de elevador) | «…los flaps; algunos aviones tienen spoilers, que quitan sustentación; y casi todos tienen compensador (trim), que quita la presión que sientes en los controles» | PHAK cap. 6, controles secundarios |
| E5 | Imagen `fundamentos-tema7-6-mezcla.jpg` | La perilla de mezcla jalada hasta afuera dice «Mezcla al ralentí (Idle Mixture)» | Jalada hasta afuera es **corte (idle cutoff)**: corta el combustible y apaga el motor. «Idle mixture» es un ajuste del carburador, no una posición de la perilla | Rótulo «Corte de mezcla (Idle Cutoff): apaga el motor»; o usar la captura sin rótulos y poner los rótulos encima como escena | PHAK cap. 7, *Mixture Control* |
| E6 | Escenario «reduces potencia» (paso 2) | «la velocidad se estabiliza un poco **por encima** de la anterior» | Con menos potencia y la misma actitud, la velocidad se estabiliza **por debajo** de la que tenías | «…la velocidad se estabiliza por debajo de la que tenías, con un régimen de descenso constante» | AFH cap. 3 |
| E7 | Imágenes de los temas 4 y 5 | Faltas («estabilizadr», «vertticalo», «EMPENAGE», «Pitoh», «Roil»); en el tema 5, las líneas de **elevador** y **timón de dirección** apuntan a la superficie equivocada; «Giro lateral» para la guiñada | Enseñan mal la ubicación de las superficies. Además parecen generadas por IA (el spec las prohíbe en contenido técnico) | Reemplazar por la foto real del C172 (`/flota`) y la vista superior (`cessna-topview.png`) con rótulos dibujados encima (escenas); sin imágenes nuevas | PHAK cap. 2 y 6 |
| E8 | Imagen del tema 1 | Líneas de flujo que **atraviesan la cabina**; «aumento de presión» señalando el fuselaje, no el ala; además es contenido de Bernoulli en el tema «¿Qué es un avión?» | El flujo y la presión se dibujan sobre el ala, no a través del avión | Foto limpia del XB-VLA en vuelo; Bernoulli queda en el tema 3 con el clip de Remotion | PHAK cap. 4 |
| E9 | Imagen de Newton (tema 3) | «IDEA CLAVE: El avión no vuela porque el aire "empuje" el ala» y en la frase siguiente dice que sí lo empuja; flecha hacia abajo en un ala y hacia arriba en la otra | Se contradice, y las flechas sugieren un alabeo | Usar el clip de Remotion `fundamentos-tema3` (ya existe) en lugar de las dos infografías | PHAK cap. 4 |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 6, fun-q6, fun-q11 | «El eje longitudinal **controla** el alabeo» | Los ejes no controlan nada: «El alabeo es el giro alrededor del eje longitudinal». Preguntas: «El giro alrededor del eje vertical se llama:» | PHAK cap. 5, *Axes of an Aircraft* |
| P2 | Tema 8, `six-pack.svg`, misión 6 | «Indicador de viraje y resbalamiento (Turn Coordinator)», «coordinador de giro», «coordinador de viraje» | Son dos instrumentos distintos (el de viraje y resbalamiento no muestra el alabeo). Usar «coordinador de viraje» en todo el módulo | PHAK cap. 8 |
| P3 | Tema 7 (texto, punto, imagen «Las 3 palancas trabajan juntas») | «se ajustan siempre en conjunto… no son controles independientes» | Son controles independientes que se mueven **en un orden**: para subir potencia, mezcla → hélice → acelerador; para reducir, al revés | PHAK cap. 7, hélice de velocidad constante |
| P4 | Tema 4 (texto y punto «Empenaje») | Empenaje = estabilizador horizontal y vertical | Incluye también sus superficies móviles: elevador, timón de dirección y compensador | PHAK cap. 2, *Empennage* |
| P5 | Tema 7 | «el Cirrus SR22… un Control Stick» | El SR22 usa un *side yoke* (bastón lateral), no un stick; dejar solo el VL3 como ejemplo de stick | Manual del SR22 |
| P6 | Misión 3 (pasos 2 y 3) | La velocidad baja «porque aumenta la resistencia»; la bocina avisa que «el ala está cerca de dejar de sustentar» | «baja porque el avión empieza a subir y, con más ángulo de ataque, también hay más resistencia»; «la bocina avisa que estás cerca de la pérdida (en el C172 suena unos 5 a 10 nudos antes)» | AFH cap. 5; POH C172S |
| P7 | Diagrama del Cessna (`hotspots.ts`, Fuselaje) | «Estructura principal que conecta la cabina con el empenaje» | Contradice al tema 4 (la cabina va dentro del fuselaje): «Estructura central: aloja la cabina y une las alas con el empenaje» | PHAK cap. 2 |
| P8 | Misión 6 (paso 1) | «Si el tuyo trae G1000…» | Nombre de marca visible: «Si el tuyo trae pantallas digitales…» | Regla del sitio |
| P9 | Infografía de Bernoulli (tema 3) | Flecha roja «PRESIÓN» hacia abajo bajo el perfil; ejemplo del «papel curvo» | La flecha sugiere que la presión empuja hacia abajo. Queda resuelto si se usa el clip (E9) | PHAK cap. 4 |

## Lo que está bien

Las 4 fuerzas y su equilibrio en vuelo recto y nivelado; Bernoulli y Newton como explicaciones
complementarias (sin el error de «tiempo de tránsito igual»); qué superficie mueve qué eje; las funciones
de las partes; el six pack y su orden; los controles y la mezcla según la altitud; las preguntas fun-q1 a
fun-q16 (salvo las de P1); los términos; las flechas de las 4 fuerzas en la escena (empuje hacia adelante,
resistencia hacia atrás, sustentación y peso opuestos); las capturas reales del tema 7 (salvo E5 y P3).

## Cambios aplicados

Erik aprobó todas las correcciones (2026-11-17). Se aplicaron así:

- **Texto** (E1–E4, E6, P1–P8): `moduleContent.ts`, `temaPuntos.ts`, `misiones.ts`, `hotspots.ts` y
  `six-pack.svg`, con la redacción propuesta en las tablas de arriba.
- **Imágenes** (E5, E7, E8, E9, P9): sin imágenes nuevas generadas.
  - Tema 1: foto real del C172 (`/images/flota/c172-1600.webp`).
  - Tema 3: los 5 clips de Remotion `fundamentos-tema3-0..4` (mp4 + webm + póster en `public/videos/academia/`),
    uno por paso; se reproducen una vez, sin repetir.
  - Tema 4: la misma foto con rótulos dibujados encima (fuselaje, alas, empenaje, tren, motor y hélice), uno por paso.
  - Tema 5: `cessna-topview.png` con rótulos de alerón, elevador, timón de dirección y flaps.
  - Tema 7: capturas recortadas sin los rótulos viejos (`-mezcla-foto.jpg`, `-palancas-foto.jpg`); la mezcla
    lleva los rótulos «Hacia afuera: pobre → corte» y «Adentro: rica».
- Revisado en el navegador (escritorio y 375 px): rótulos en su lugar, clips cambian con cada paso, sin scroll lateral.

Queda pendiente: la imagen de los ejes del tema 6 también parece hecha con IA y usa «balance / transversal /
direccional», que no coincide con el texto; se propone cambiarla en la siguiente ronda. Los archivos de las
imágenes viejas siguen en `public/` sin usarse.
