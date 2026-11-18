# Revisión de Aerodinámica — ronda 1 (estilo Rise)

Fecha: 2026-11-17 · Estado: **correcciones aplicadas; tema 9 en borrador para que Erik lo revise**.

Qué se revisó:
- los 8 temas (texto, idea clave y puntos);
- los términos, el escenario «viraje base-final» y el control deslizante de configuración;
- las 17 preguntas (práctica, evaluación y candados);
- las 8 imágenes de los temas;
- los 48 clips de Remotion ya hechos (`remotion-video/out/academia/aerodinamica-tema1..8-*`), uno por paso.

Fuentes: FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C), *Airplane Flying
Handbook* (AFH, FAA-H-8083-3C) y el POH del C172S.

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 3 (texto y punto «Parásita») | Parásita = «la fricción del aire contra la estructura» | Igual que en Fundamentos: la fricción es solo una parte. La parásita es de forma, de interferencia y de fricción | «La parásita es la que produce el avión al moverse por el aire: su forma, la interferencia entre sus piezas y la fricción; crece con el cuadrado de la velocidad» | PHAK cap. 5, *Parasite Drag* |
| E2 | Tema 3 (texto, punto «Por qué se siente pesado») y clip 3-2 | Cerca de la pérdida el avión «se siente pesado» porque domina la inducida | La resistencia no hace pesados los controles: se sienten blandos porque pasa menos aire por ellos. Lo que causa la inducida es que necesitas más potencia para sostener la altitud | Punto «Cerca de la pérdida»: «domina la inducida y necesitas más potencia para sostener la altitud; además los controles se sienten blandos». Clip: «Domina la inducida: más potencia» | PHAK cap. 5; AFH cap. 5 (vuelo lento) |
| E3 | aero-q7 (evaluación) | «El P-factor (precesión asimétrica de la hélice)» | El P-factor es la **carga** asimétrica de la hélice. La precesión giroscópica es otra tendencia distinta (la misma q8 las separa) | «El P-factor (carga asimétrica de la hélice)…» | PHAK cap. 5, *Left Turning Tendencies* |
| E4 | Tema 8 (texto y punto «El bote largo») y clips 8-0 y 8-4 | «produce un bote (float) largo» | En español «bote» es rebotar (*bounce*), otro error de aterrizaje. *Float* es flotar, y su causa principal es llegar con velocidad de más | «Llegar con velocidad de más, o reducir potencia tarde, te deja **flotando** sobre la pista (*float*)». Clips: «La flotación larga» | PHAK cap. 5; AFH cap. 9 |
| E5 | Control deslizante «Configuración vs. resistencia» | Al sacar tren y flaps, el consumo sube de 9.5 a 13.2 gph | El consumo por hora depende de la potencia, no de la resistencia: con la misma potencia, el gasto por hora no cambia. Lo que sube es el combustible **por milla**. Además el C172 no tiene tren retráctil | Misma potencia: velocidad 110 → 75 kt, combustible por cada 100 NM 8.6 → 12.7 gal, resistencia sube. Valores marcados como ilustrativos, «avión de tren retráctil». Nota: «se usa para aproximar y aterrizar, y los flaps solo debajo de su velocidad máxima (tope del arco blanco)» | PHAK cap. 5 y 11 |
| E6 | Clip 2-4 «Lo que sorprende» | «140 kt, morro abajo» → ángulo de 18° → pérdida | En un C172, 140 kt está muy por encima de la velocidad de maniobra (Va, unos 99–105 kt). Un tirón así rompe la estructura antes de la pérdida (cerca de 8 G) | «90 kt, morro abajo» (unos 3.5 G, dentro del límite de 3.8 G) | PHAK cap. 5 (Va); POH C172S |
| E7 | Primer candado (después del tema 3) | Pregunta aero-q16, sobre el alargamiento del ala | La lección nunca habla del alargamiento: el cadete no lo puede contestar con lo que leyó (la regla de los candados dice que solo se pregunta lo leído) | Usar aero-q6 («La resistencia inducida es mayor cuando…»), que sale del tema 3 | — |
| E8 | Imágenes de los 8 temas | Infografías de texto | Parecen generadas por IA: íconos de avión de reacción, texto cortado («falla de motor»), y repiten E1 y E4 | Usar los clips de Remotion paso a paso (ya existen, 48, revisados aquí), y el póster del primero como portada | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 2 (texto y punto «Siempre el mismo ángulo») | La pérdida ocurre al mismo ángulo «sin importar velocidad, actitud ni peso» | Agregar: «con la misma configuración: los flaps, el hielo o la escarcha lo cambian» | PHAK cap. 5 |
| P2 | Tema 2 (texto y punto «Lo que sorprende») | «puede entrar en pérdida… a alta velocidad» | «a cualquier velocidad; por encima de Va, un tirón así puede dañar la estructura antes» (va con E6) | PHAK cap. 5 |
| P3 | Tema 6 (texto, punto «No es control primario») y clip 6-4 | El trim «reduce la fatiga en vuelos largos o en cambios sostenidos de velocidad» | «Se ajusta después de cada cambio de potencia, actitud o flaps: así no sostienes presión y vuelas más preciso». Clip: «Cambias potencia · actitud · flaps → trim» | AFH cap. 3 |
| P4 | Tema 8 (texto y punto «Qué se siente») y clip 8-3 | Al despegar, el avión «acelera de más» | «puede despegar antes de la velocidad recomendada». Clip: «Despegando: se levanta antes de tiempo» | PHAK cap. 5, *Ground Effect* |
| P5 | Término «Adverse yaw» | «desbalance de resistencia entre alerones» | «entre las alas: la que sube, con su alerón abajo, tiene más resistencia inducida» | PHAK cap. 6 |
| P6 | Capítulo 1 | Se llama «Las cuatro fuerzas del vuelo» y trata sustentación, pérdida, resistencia y factor de carga | «Sustentación, pérdida y resistencia» | — |
| P7 | Orden de los ejercicios | El escenario del viraje base-final (factor de carga, capítulo 1) cae en el capítulo 2, y el de flaps (capítulo 2) cae en el 1 | Cambiar el orden para que cada uno quede con su tema (no cambia el avance de nadie) | — |

## Para que Erik decida

**La evaluación pregunta lo que la lección no enseña.** De las 12 preguntas de la evaluación (aero-q6 a q17),
10 son de temas que no están en la lección:
- P-factor y tendencias a la izquierda (q7, q8, q17);
- barrena (q9);
- centro de presión (q10);
- slots (q11);
- velocidad de maniobra (q12);
- alargamiento (q13, q16);
- viento cruzado (q14).

Las preguntas en sí están bien (salvo E3), pero un cadete que solo leyó la lección no las puede contestar.
Opciones:
- **A.** Cambiar esas 10 preguntas por otras de los 8 temas que sí se enseñan.
- **B.** Agregar a la lección un tema 9, «Tendencias a la izquierda, barrena y Va», que cubra la mayoría, y
  cambiar solo las que queden fuera (centro de presión, slots, alargamiento).

## Lo que está bien

- Sustentación: las cuatro variables y el cuadrado de la velocidad.
- Ángulo de ataque contra actitud.
- El ángulo crítico de 16 a 20°.
- Factor de carga: 1.41 G a 45°, 2 G a 60° y la pérdida a 68 kt a 60° (48 × √2).
- Mejor planeo del C172: 68 kt.
- Guiñada adversa y su corrección, al derecho.
- Elevador, y el compensador que se mueve al revés del elevador.
- Los tipos de flaps y la pérdida a 40 kt con flaps 30°.
- El efecto suelo a una envergadura.
- Las preguntas q1 a q6 y q8 a q17 (salvo E3).
- El escenario del viraje base-final.
- En los 48 clips, todo lo demás: el sentido de las flechas, los alerones vistos desde atrás, el horizonte
  en el viraje y el ranurado del flap.

## Cambios aplicados

Erik aprobó todas las correcciones y la opción B (2026-11-17).

- **E1–E5, P1–P5:** textos de los temas 2, 3, 6 y 8, sus puntos, los términos «Adverse yaw» y «Trim», la q7 y el
  control deslizante (misma potencia: 110 → 75 kt y 8.6 → 12.7 gal por cada 100 NM, ilustrativo, tren retráctil).
- **E6, P3, P4 y E2, E4 en los clips:** se volvieron a sacar 2-4 (90 kt), 3-2 («Cerca de la pérdida»), 6-4
  (potencia, actitud, flaps → trim), 8-0, 8-3 (se levanta antes de tiempo, 44 → 50 kt) y 8-4 («La flotación larga»).
- **E7:** el primer candado ahora es aero-q6.
- **E8:** los 47 clips (uno por paso) van en `public/videos/academia/aerodinamica-temaN-n.*`, con su escena en
  `src/data/escenas.ts`; la imagen de cada tema es el póster de su primer clip. Las 8 infografías viejas ya no se usan.
- **P6:** el capítulo 1 se llama «Sustentación, pérdida y resistencia».
- **P7:** ejercicios en orden términos, viraje base-final (capítulo 1), configuración y superficies (capítulo 2).
- **Opción B, primera parte:** q10, q11, q13 y q16 (centro de presión, slots y alargamiento) se cambiaron por
  preguntas de flaps, efecto suelo al despegar, guiñada adversa y factor de carga en viraje. Misma posición de la
  respuesta correcta.
- **Opción B, pendiente:** el tema 9 «Tendencias a la izquierda, barrena y Va» (cubre q7, q8, q9, q12, q14 y q17),
  sus clips y un tercer candado. Borrador del texto enviado a Erik para revisión.
