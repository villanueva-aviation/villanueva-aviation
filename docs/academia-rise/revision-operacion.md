# Revisión de Operación de Aeronave — ronda 1 (estilo Rise)

Fecha: 2026-11-19 · Estado: **correcciones aplicadas (aprobadas por Erik el 2026-11-19)**.

Qué se revisó:
- los 12 temas (texto, idea clave y puntos);
- los 2 juegos de términos (7 y 7 términos);
- el circuito de tráfico (8 situaciones);
- los 2 escenarios («fuego en el arranque» y «despegue rechazado»);
- las 17 preguntas (práctica, evaluación y candados op-q4, op-q14, op-q9 y op-q15);
- las 12 imágenes de los temas.

Fuentes:
- Cessna 172S *Pilot's Operating Handbook*: cap. 3 (emergencias: fuego en el arranque) y cap. 4 (inspección, arranque,
  run-up y apagado);
- FAA *Airplane Flying Handbook* (FAA-H-8083-3C): cap. 2 (operaciones en tierra), cap. 3 (nivelar desde un ascenso),
  cap. 5 (despegue) y cap. 9 (aproximación y aterrizaje);
- FAA AC 120-71B (procedimientos estándar y uso de checklists);
- FAA AIM 4-1-13 (ATIS) y 4-3-18 (rodaje y *hold short*);
- Flight Safety Foundation, ALAR *Briefing Note* 7.1 (aproximación estabilizada).

Las cifras de motor (tiempos, caídas de RPM, altitudes de mezcla) cambian de un avión a otro. El módulo no da casi
ninguna y está bien así: remite al POH. Donde propongo una cifra, digo que es del C172S, que es el avión de ejemplo de
la Academia.

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Escenario «fuego en el arranque», opción equivocada y su explicación | La opción mala es «seguir intentando encender para quemar el exceso de combustible», y la explicación dice que «insistir en encender con fuego activo alimenta el incendio» | Es justo lo contrario de lo que pide el POH: el primer paso es **seguir girando el arranque** para que el motor aspire las llamas y el combustible acumulado. La opción correcta del mismo escenario también lo dice, así que el escenario se contradice | Cambiar la opción mala por un error real: «Soltar la llave y bombear el acelerador para ayudar a que arranque». Explicación: «Bombear el acelerador mete más combustible al carburador, que es justo lo que suele provocar el fuego. El POH pide seguir girando el arranque para que el motor aspire las llamas» | POH C172S, cap. 3 |
| E2 | Tema 1 (texto y punto «Mismo patrón cada vez») | La vuelta se da «usualmente en el sentido de las manecillas del reloj» | En el C172 es al revés: el POH empieza en la cabina, sigue a la cola, el ala derecha, la nariz y el ala izquierda, es decir, contra las manecillas vista desde arriba. Lo que importa no es el sentido sino seguir **el orden del POH**, siempre el mismo | «Siempre en el mismo orden, el que marca el POH de tu avión. En el C172: cabina, cola, ala derecha, nariz y ala izquierda» | POH C172S, cap. 4 |
| E3 | Tema 10 (texto y punto «Qué es estar estabilizado»), término op-5 | Estabilizado (velocidad, tasa, alineación y configuración) «antes de cruzar el umbral» | Configurarse al llegar al umbral es demasiado tarde. El criterio de uso común es estar estabilizado a más tardar **a 500 ft sobre la pista en vuelo visual** (1,000 ft en instrumentos); si no lo estás ahí, motor y al aire | Tema: «a más tardar a 500 pies sobre la pista en vuelo visual; si no lo estás ahí, te vas al aire». Término op-5: «Velocidad, tasa de descenso, alineación y configuración correctas a más tardar a 500 ft sobre la pista» | FSF ALAR 7.1; AFH cap. 9 |
| E4 | Imágenes de los 12 temas | Infografías | Son generadas por IA, como las de los módulos anteriores. La del tema 1 dibuja un avión de línea de cuatro motores alrededor de flechas en sentido de las manecillas (E2). Las de los temas 10 y 9 repiten E3 y la tasa sin aclarar (P6) | Reemplazarlas por clips (D1) | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 2 (texto y punto «Lo que no se hace») | «Flujo y verificación» en vez de «leer y ejecutar cada línea»; y el punto dice que leer y ejecutar «no se hace» | Los dos métodos existen. Flujo y verificación es para las fases de rutina; **leer y ejecutar** se usa en los procedimientos poco frecuentes, en los anormales y en el resto de una emergencia después de los pasos de memoria (y es como trabaja el copiloto por voz de la Academia). Propuesta: cambiar el punto por «Leer y ejecutar: para lo poco frecuente, lo anormal y la emergencia, después de los pasos de memoria» | AC 120-71B |
| P2 | Tema 3 (texto y puntos), pregunta op-q16 | La presión de aceite debe subir «en los primeros segundos» | Darle una cifra y agregar la baliza. Propuesta: «en el C172S, al arco verde en 30 a 60 segundos; si no sube, apagas». Y en la secuencia: «frenos puestos y baliza encendida» antes del DESPEJADO, igual que en VFR | POH C172S, cap. 4 |
| P3 | Tema 4 (texto y puntos), términos op2-3 y op2-4 | El rodaje solo habla de pedales, potencia, frenos y atención | Los términos del capítulo preguntan por la autorización de rodaje y el *hold short*, que el módulo nunca explica. Propuesta: agregar «en un aeropuerto controlado ruedas con autorización y nunca cruzas la línea de espera de una pista sin que te lo autoricen», y «con viento, los mandos se colocan para que no te levante el ala» | AIM 4-3-18; AFH cap. 2 |
| P4 | Tema 6 (texto, idea clave y punto «Los instrumentos»), pregunta op-q14 | «Si algo se ve mal, todavía tienes pista para abortar». op-q14, respuesta correcta: «Aún hay pista disponible para abortar» | Tener pista no está garantizado: hay que decidir **antes** en qué punto de la pista abortarías. Y la respuesta de op-q14 es una afirmación, no una acción. Propuesta: «decide antes del despegue en qué punto abortarías; si algo va mal antes, cierras potencia y frenas». op-q14, correcta: «Abortar: cerrar potencia y frenar mientras quede pista para detenerte» | AFH cap. 5 |
| P5 | Tema 8 (texto y punto «Al nivelar») | Al nivelar «reduces potencia» | Primero bajas la nariz y dejas que acelere a la velocidad de crucero; luego reduces potencia y compensas. Si reduces de inmediato, el avión se queda lento | AFH cap. 3 |
| P6 | Tema 9 (texto y punto «La regla del 3»), término op2-2 | La regla del 3 da «una tasa razonable de unos 500 pies por minuto»; antes de bajar, revisar el altímetro «contra el reporte meteorológico» | La tasa depende de la velocidad: para seguir la regla del 3 bajas a unas 5 veces tu velocidad sobre el terreno (100 nudos dan unos 500 pies por minuto). Y el reporte del destino se oye en el **ATIS**, que el juego de términos pregunta. Propuesta: «la tasa es unas 5 veces tu velocidad sobre el terreno: a 100 nudos, unos 500 pies por minuto» y «escuchas el ATIS del destino y ajustas el altímetro» | AIM 4-1-13 |
| P7 | Términos op2-4 y op2-5 | *Hold short*: «línea que no se puede cruzar»; despegue rechazado: «antes de alcanzar una velocidad de decisión predefinida» | *Hold short* es la instrucción de detenerte antes de la línea de espera. La velocidad de decisión (V1) es de los aviones grandes; en un monomotor se decide por un punto de la pista. Propuestas: «Instrucción de detenerte antes de la línea de espera de una pista» y «Abortar el despegue cerrando potencia y frenando mientras quede pista para detenerte» | AIM 4-3-18; AFH cap. 5 |
| P8 | Situación ope-2 del circuito | Base: «empiezas a configurar la aeronave para el descenso final, después de virar 90° hacia la pista» | Con la corrección de VFR, el descenso empieza en viento en cola, y el viraje a base es desde el viento en cola, no «hacia la pista». Propuesta: «Acabas de virar 90° desde el viento en cola: sigues descendiendo y pones más flaps. ¿Qué tramo es?» | AFH cap. 9 |

Todo lo demás se revisó y está bien:
- la inspección siempre, el drenado y «ya la volé ayer»;
- los tres tipos de checklist y los pasos de memoria;
- el DESPEJADO antes de girar la llave (op-q3) y apagar si no sube la presión de aceite (op-q4);
- el rodaje con los pedales (op-q5) y la prueba de frenos;
- el run-up contra el viento, magneto por magneto, el calentador de carburador si lo lleva (op-q6);
- la potencia suave pero sin demora, Vr y la limpieza de la configuración;
- Vx y Vy (op-q7), las temperaturas en ascenso y la mezcla;
- la mezcla en crucero (op-q8) y la regla del 3 (op-q9);
- el go-around sin dudar (op-q10, op-q17), el flare cerca de Vs0 (op-q11) y abortar ante un bote;
- la checklist después de aterrizar fuera de la pista (op-q12), el apagado (op-q15) y la post-vuelo;
- el escenario del despegue rechazado y las otras situaciones del circuito.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 12 temas, unos 70 en total (uno por paso), en lugar
  de las 12 imágenes (E4). Es el módulo más largo hasta ahora; si prefieres, lo hago en dos tandas, una por capítulo.
- **D2 · Ejercicios por capítulo** (para que nada se pregunte antes de enseñarse). Hoy el reparto automático deja:
  - en el capítulo 1, el primer juego de términos, que pregunta por la aproximación estabilizada, el go-around y el
    flare (se enseñan en el capítulo 2);
  - en el capítulo 2, el escenario del despegue rechazado (se enseña en el capítulo 1).

  Propuesta:
  - capítulo 1 (de la inspección al despegue): los dos escenarios, fuego en el arranque y despegue rechazado;
  - capítulo 2 (del ascenso al apagado): los dos juegos de términos y el circuito de tráfico.

  Los capítulos y los candados se quedan como están.
- **D3 · Cifras del C172S:** donde el texto pide una cifra (la presión de aceite en P2, el orden de la inspección en E2),
  propongo dar la del C172S y decir siempre «según el POH de tu avión». No agrego cifras del run-up (caída máxima por
  magneto) porque cambian mucho de un avión a otro; el texto ya remite al manual.

Efecto en el avance: ninguno. Siguen 12 lecturas y los mismos ejercicios, con los mismos id.

## Cambios aplicados

Erik aprobó todo el 2026-11-19: «Adelante».

- E1 a E3 y P1 a P8: textos, ideas clave, puntos, los términos op-5, op2-4 y op2-5, las preguntas op-q4, op-q14 y
  op-q16, el escenario del fuego en el arranque y la situación ope-2 del circuito corregidos como se propuso.
- E4 y D1: 69 clips de Remotion (uno por paso) reemplazan las 12 imágenes, en una sola tanda. Los pasos por tema no
  cambiaron.
- D2: el capítulo 1 lleva los dos escenarios; el capítulo 2, los dos juegos de términos y el circuito. Los capítulos,
  los candados y los id no cambian.
- D3: las cifras que se agregaron son del C172S y van con «según el POH de tu avión».
- La prueba del reparto automático de ejercicios usaba Operación de ejemplo; ahora usa Espacios aéreos, que todavía no
  declara sus ejercicios por capítulo.
- Pruebas nuevas:
  - los ejercicios y candados de cada capítulo;
  - los textos sin los errores de la revisión;
  - el fuego en el arranque: bombear el acelerador es la opción equivocada y la explicación pide seguir girando;
  - op-q14 aborta el despegue;
  - estabilizado a 500 ft (op-5), *hold short* como instrucción y el despegue rechazado sin V1;
  - en base sigues descendiendo (ope-2);
  - la presión de aceite en el tiempo del POH (op-q16);
  - un clip por paso.
