# Revisión de Cartografía Aeronáutica — ronda 1 (estilo Rise)

Fecha: 2026-11-18 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-18)**.

Qué se revisó:
- los 8 temas (texto, idea clave y puntos);
- los 3 juegos de términos (18 términos) y el escenario de la Clase D y la cifra de elevación máxima;
- las 17 preguntas (práctica, evaluación y candados cart-q17 y cart-q13);
- las 8 imágenes de los temas.

Fuentes: FAA *Aeronautical Chart User's Guide* (sección VFR: leyenda de la carta sectional, aeropuertos,
obstáculos, MEF, puntos de control VFR); FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C,
cap. 15 espacio aéreo y cap. 16 navegación); AIM 3-2 (clases de espacio aéreo); OACI Anexo 11, 2.6 (clases de
espacio aéreo) y Anexo 4 (símbolos de puntos de notificación); 14 CFR 91.119 (altitudes mínimas).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 2 (texto y puntos «Aeropuertos» y «Tipo de pista»), términos cart-2 y cart3-2, pregunta cart-q10 | Con torre: «círculo azul **relleno**»; las **líneas** que salen del círculo dicen si la pista es dura (relleno sólido) o blanda (contorno abierto) | Revuelto. El **color** dice si hay torre (azul) o no (magenta). El **círculo relleno** es pista que **no** es dura; el círculo abierto con la pista dibujada adentro es pista dura de 1,500 a 8,069 ft; con más de 8,069 ft se dibuja solo la pista. Las **marquitas alrededor** del círculo significan combustible y servicio en horario normal, no el tipo de pista | Texto: «azul si tiene torre, magenta si no; círculo abierto con la pista adentro si es pista dura, círculo relleno si no lo es; las marquitas alrededor indican combustible y servicio». cart-2: «Se dibuja en azul». cart3-2: «Se dibuja en magenta». cart-q10 nueva: «Las marquitas alrededor del círculo de un aeropuerto indican:» → «Combustible y servicio en horario normal» (mismo índice correcto) | Chart User's Guide, *Airports* |
| E2 | Tema 5 (texto, idea clave y punto «Para qué sirve»), término cart2-1, pregunta cart-q5 | El MEF es «la altitud mínima segura de sobrevuelo» / «altitud más alta de seguridad» | El MEF **no** es una altitud segura: es la elevación de lo más alto del cuadrante (terreno u obstáculo) con un pequeño margen por error vertical y obstáculos no cartografiados. Volar justo a la cifra te deja casi sin separación; encima van los márgenes de 91.119 (500 o 1,000 ft) o los que uses tú | Texto y clave: «el MEF es lo más alto que hay en ese cuadrante; tu altitud segura va **por encima** de él, con margen». cart2-1: «Cifra de la elevación más alta dentro de un cuadrante, con margen por obstáculos». cart-q5, opción correcta: «La elevación más alta del cuadrante, terreno u obstáculos» | Chart User's Guide, *MEF*; 14 CFR 91.119 |
| E3 | Pregunta cart-q3 | «¿Qué clase requiere autorización EXPLÍCITA para entrar?» Correcta: Clase B (también ofrece Clase D) | El propio tema 3 dice que con reglas OACI la **D también** pide autorización de la torre. Con el texto del módulo, B y D son correctas | Cambiar la opción «Clase D» por «Ninguna: basta con escuchar la frecuencia» (mismo índice correcto, Clase B sigue siendo la única) | Tema 3; OACI Anexo 11, 2.6 |
| E4 | Imágenes de los 8 temas | Infografías | Generadas por IA y con errores: la del tema 2 repite E1; la del tema 3 dice que la Clase C pide «contacto por radio, pero no autorización explícita», al revés del texto; la del tema 8 muestra un «MEF #5303» que no existe; las cartas del tema 1 son inventadas | Reemplazarlas por clips (D1) | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 5 (texto y punto «Qué incluye») | El MEF se redondea «al siguiente centenar o millar de pies» | Se redondea hacia arriba al siguiente **centenar**; se lee con los miles en grande y los cientos en chico (12 y 4 = 12,400 ft) | Chart User's Guide, *MEF* |
| P2 | Escenario, nodo «falla-2» | «Esa cifra es la Elevación Máxima del cuadrante, en cientos de pies… estarías novecientos pies por debajo de algo que está ahí» | La cifra no está «en cientos de pies»: son miles en grande y cientos en chico. Y lo más alto del cuadrante puede estar un poco por debajo de la cifra. Propuesta: «Esa cifra es la elevación máxima del cuadrante: 12 en grande y 4 en chico son 12,400 ft. Ya trae un pequeño margen, así que lo más alto que hay ahí está apenas debajo de ella. A 11,500 estarías bajo el terreno o los obstáculos de ese cuadrante» | Chart User's Guide, *MEF* |
| P3 | Tema 7 (texto y punto «Cómo se marcan»), pregunta cart-q14 | Los puntos VFR se marcan con «estrella o triángulo magenta» | En las cartas de EUA, el punto de control VFR es una **banderita** magenta, y el waypoint VFR una estrella de cuatro puntas. En las cartas OACI, el punto de notificación es un **triángulo**: relleno si es obligatorio, vacío si es a solicitud. Propuesta: «una banderita o una estrella magenta en las cartas de EUA; un triángulo en las cartas OACI (relleno si el reporte es obligatorio)». cart-q14: «Una banderita o estrella magenta (o un triángulo en cartas OACI)» | Chart User's Guide, *VFR Checkpoints*; OACI Anexo 4 |
| P4 | Tema 6 (texto y punto «El color») | Las cajas de frecuencias van «en azul o magenta según la clase de espacio aéreo asociado» | El color de los datos del aeropuerto sigue al aeropuerto: azul si tiene torre, magenta si no. Propuesta: «del mismo color que el aeropuerto: azul con torre, magenta sin torre; las de aproximación de las Clases B y C van en recuadros junto a su límite» | Chart User's Guide, *Airports* |
| P5 | Tema 3 (texto y punto «Clase E») | Clase E: «líneas discontinuas magenta o sombreado» | Precisar el sombreado: «líneas discontinuas magenta si empieza en la superficie; franja difuminada magenta si empieza a 700 ft sobre el terreno, y azul si empieza a 1,200 ft» | Chart User's Guide, *Airspace*; PHAK cap. 15 |
| P6 | Tema 2 (punto «Terreno») y pregunta cart-q12 | «tonos más oscuros de café/naranja» | Las capas van del verde (bajo) al café (alto). Propuesta: «del verde en lo bajo al café en lo alto, más oscuro cuanto más sube» | Chart User's Guide, *Terrain* |
| P7 | Término cart-3 «Espacio Clase B» | «Círculos concéntricos sólidos azules» | Rara vez son círculos: es un «pastel invertido» de varias capas con forma propia. Propuesta: «Líneas azules sólidas, en capas con su altura mínima y máxima; requiere autorización explícita para entrar» | PHAK cap. 15 |

Todo lo demás se revisó y está bien: los tipos de carta y la escala 1:500,000 de la sectional (y 1:250,000 de la
TAC, «más detalle»); las cartas de ruta IFR bajo y sobre FL180; el obstáculo «1500 (450)» como MSL y AGL, y el
símbolo más grande arriba de 1,000 ft AGL; las clases A, B, C, D y G; las frecuencias junto a cada aeropuerto y el
punto de contacto en el límite; para qué sirven los puntos VFR; el hábito de trazar la ruta antes; la decisión de
la Clase D del escenario; y las preguntas cart-q1, cart-q2, cart-q4, cart-q6 a cart-q9, cart-q11, cart-q13,
cart-q15 a cart-q17.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 8 temas, unos 46 (uno por paso), en lugar de
  las 8 infografías (E4). Los símbolos se dibujan como en la leyenda real: aeropuertos, obstáculos, MEF, clases de
  espacio aéreo y puntos VFR.
- **D2 · Capítulos:** pasar de 2 a 3 capítulos sin cambiar los temas ni el avance. Los candados caen después de
  los temas 3 y 6, justo al final de los dos primeros capítulos:
  1. «Cartas, símbolos y espacio aéreo» (temas 1–3) · candado cart-q17 (aeropuerto azul contra magenta);
  2. «Obstáculos, elevaciones y frecuencias» (4–6) · candado cart-q13 (qué frecuencia y dónde);
  3. «Puntos VFR y lectura completa» (7–8) · sin candado; cierra con el escenario.
- **D3 · Lo que falta explicar:** el juego 3 pregunta tres cosas que la lección no enseña: **MOA**, **vía aérea
  Víctor** y **declinación magnética** (líneas isogónicas). Opciones: agregar un punto corto a la lección (MOA en
  el tema 3; aerovías Víctor e isogónicas en el tema 2, porque se ven en la sectional) o quitar esos términos del
  juego. Recomiendo agregarlos: aparecen en cualquier carta y el cadete los va a ver.
- **D4 · Ejercicios por capítulo:**
  - capítulo 1: juego 1 (sectional, aeropuerto con torre, Clase B y, en lugar del obstáculo, **Clase D**);
  - capítulo 2: juego 2 (MEF, CTAF y, en lugar de punto VFR y trazar la ruta, **obstáculo «1500 (450)»** y
    **curvas de nivel**);
  - capítulo 3: juego 3 (el resto: punto VFR, trazar la ruta, aeropuerto sin torre, MOA, vía Víctor, declinación)
    y el escenario.
- **D5 · El ejemplo «Vista Hermosa»:** el tema 7 lo usa como punto VFR de ejemplo, pero no sé si existe. Opciones:
  que me digas un punto VFR real de un aeropuerto que conozcas (por ejemplo de MMGL), o dejarlo genérico
  («reportas "sobre el punto" por su nombre»). No voy a inventar uno.

Efecto en el avance: ninguno. Siguen 8 lecturas y los mismos 4 ejercicios con los mismos ids.

## Cambios aplicados

Erik aprobó todo el 2026-11-18 («Sí, apruébalas todas; déjalo genérico»).

- **E1–E3 y P1–P7:** textos, puntos, términos, preguntas cart-q3, cart-q5, cart-q10, cart-q12 y cart-q14, y el
  escenario (falla-2 y éxito) corregidos como se propuso.
- **E4 y D1:** las 8 infografías se reemplazaron por 50 clips de Remotion, uno por paso (5, 7, 8, 6, 6, 5, 6 y 7),
  dibujados como la leyenda real. Las frecuencias de los clips son de ejemplo y lo dicen.
- **D2:** 3 capítulos con los candados cart-q17 y cart-q13 al final de los dos primeros.
- **D3:** se agregó MOA al tema 3 y aerovías Víctor e isogónicas al tema 2.
- **D4:** los términos se repartieron por capítulo como se propuso; se quitó el término sobrante cart3-4.
- **D5:** genérico. Ni «Vista Hermosa» ni ningún otro nombre de punto real; el ejemplo es «sobre la presa».
