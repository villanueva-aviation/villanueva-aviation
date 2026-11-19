# Revisión de Peso y Rendimiento — ronda 1 (estilo Rise)

Fecha: 2026-11-19 · Estado: **auditoría lista, esperando la decisión de Erik**.

Qué se revisó:
- los 7 temas (texto, idea clave y puntos);
- los 2 juegos de términos (14 términos);
- el simulador de altitud de densidad;
- el escenario de margen de despegue ajustado;
- las 17 preguntas (práctica, evaluación y candados ren-q16 y ren-q6);
- las 7 imágenes de los temas.

Fuentes:
- FAA *Pilot's Handbook of Aeronautical Knowledge* (PHAK, FAA-H-8083-25C), cap. 10 (*Weight and Balance*) y
  cap. 11 (*Aircraft Performance*);
- FAA *Aircraft Weight and Balance Handbook* (FAA-H-8083-1B);
- 14 CFR 1.2 (abreviaturas de las V-speeds);
- FAA SAIB CE-11-17 (velocidad de maniobra);
- *Pilot's Operating Handbook* del Cessna 172S, sección 5 (notas de viento de las tablas de despegue y aterrizaje);
- AOPA Air Safety Institute (margen de 50%).

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Pregunta ren-q15 | «La altitud de densidad afecta principalmente:» con las opciones «Más estable pero pesado de controlar», «Más ágil pero peligrosamente inestable»… y la «correcta» es «No afecta en nada al control» | Las opciones son de la pregunta del centro de gravedad: la pregunta no tiene respuesta correcta y la marcada enseña algo falso | Opciones: «El rendimiento del motor, la hélice y el ala» (correcta), «Solo la lectura del altímetro», «Únicamente el consumo en crucero», «Nada: solo importa la elevación de la pista» | PHAK cap. 11 |
| E2 | Tema 4 (texto, idea clave y punto «Viento»), preguntas ren-q4 y ren-q17, imagen del tema 4 | «Un viento de cola de solo 10 nudos puede aumentar la distancia de aterrizaje 20-30%» | Se queda corto. El manual del Cessna 172S pide sumar 10% por cada 2 nudos de cola: con 10 nudos son 50% más. Además ren-q4 habla de «distancia de frenado» y lo que sube es la distancia de aterrizaje completa | «En un Cessna 172 el manual pide sumar 10% por cada 2 nudos de cola: con 10 nudos, la distancia crece 50%. El dato cambia de un avión a otro: búscalo en tu manual». ren-q4 y ren-q17 con 50% y «distancia de aterrizaje» | POH C172S sec. 5 |
| E3 | Término ren2-1 «Peso vacío» | «Peso del avión sin combustible, **aceite utilizable**, tripulación ni carga» | Es la definición vieja (antes de 1975). En los manuales actuales el peso vacío incluye el aceite completo, el combustible no utilizable y los fluidos de operación. El tema 1 ya lo dice bien; el término lo contradice | «El avión con su equipo, el combustible no utilizable y los fluidos de operación (en manuales actuales, también el aceite completo); sin combustible utilizable, tripulación ni carga» | FAA-H-8083-1B cap. 2 |
| E4 | Tema 2 (texto y punto «CG atrasado») | El CG atrasado trae «riesgo de entrar en pérdida sin previo aviso claro» | El problema del CG atrasado no es el aviso de la pérdida: es que el avión es menos estable y **la recuperación de una pérdida o barrena puede volverse difícil o imposible**. Y falta lo del CG adelantado: sube la velocidad de pérdida | Adelantado: «más estable, pero pesado en cabeceo, sobre todo en el flare, y con mayor velocidad de pérdida». Atrasado: «menos estable, y la recuperación de una pérdida o barrena puede volverse difícil o imposible» | PHAK cap. 10 |
| E5 | Imágenes de los 7 temas | Infografías | Están generadas por IA, como las de los módulos anteriores. La del tema 4 repite el 20-30% (E2), la del tema 2 dice «pérdida sin previo aviso» (E4) y la del tema 7 trae un vector de viento mal rotulado | Reemplazarlas por clips (D1) | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 5 (texto y punto «El margen»), pregunta ren-q12 | Margen «comúnmente 30-50% extra» | La cifra que se recomienda es 50% (AOPA Air Safety Institute); no es una regla de la FAA. Propuesta: «una regla común es sumar 50% a la distancia calculada». ren-q12: «alrededor de 50% extra» | AOPA ASI |
| P2 | Tema 6 (texto y punto «Va»), término ren-5 | Va es «la máxima para aplicar controles bruscos sin dañar la estructura» | Vale para **un solo control llevado una vez a fondo**, no para combinarlos ni para invertirlos. Y **baja cuando el avión pesa menos**: la del manual es para el peso máximo | SAIB CE-11-17 |
| P3 | Tema 6 (texto y punto «Vfe, Vno y Vne») | Vno, «máxima estructural normal» | «Máxima de crucero estructural: por encima, solo en aire calmo» (es el arco amarillo del velocímetro) | 14 CFR 1.2 |
| P4 | Tema 6 (texto y punto «Vs y Vs0») | Vs, «pérdida en configuración limpia» | Lo de la configuración limpia es Vs1 (el inicio del arco verde). Propuesta: «Vs1, pérdida en configuración limpia; Vs0, en configuración de aterrizaje» | 14 CFR 1.2 |
| P5 | Tema 3 (texto y punto «La pista») | «Pista mojada, con pasto o con pendiente ascendente suma distancia» | En avionetas lo que más alarga el despegue es pasto, lodo, nieve o agua acumulada; una pista pavimentada solo mojada casi no cambia el despegue (sí el aterrizaje). Propuesta: «pasto, lodo, nieve, agua acumulada o pendiente ascendente» | PHAK cap. 11 |
| P6 | Escenario (retroalimentación final) | El viento de frente es «el único factor de rendimiento que mejora tus números gratis» | Una pendiente descendente también ayuda. Propuesta: «uno de los pocos factores que mejoran tus números sin costo» | PHAK cap. 11 |

Todo lo demás se revisó y está bien:
- peso máximo, peso bruto y carga útil; el peso máximo de rampa;
- momento = peso × brazo y el sobre de CG;
- peso, altitud de densidad y viento en las distancias;
- la interpolación y por qué las gráficas son optimistas;
- Vx, Vy, Vfe, Vne y Vr;
- el componente cruzado (máximo cerca de 90°), el máximo demostrado (no es un límite legal), el crab y el sideslip;
- la elevación de Toluca (8,466 ft) y su altitud de densidad en días calurosos;
- el resto del escenario y las otras 13 preguntas.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 7 temas, 42 en total (uno por paso), en lugar de
  las 7 infografías (E5).
- **D2 · Ejercicios por capítulo** (para que nada se pregunte antes de enseñarse). Hoy el primer juego de términos
  cae en el capítulo 1, pero pregunta Vx, Vy, Va y viento cruzado, que se enseñan en el capítulo 2. Propuesta:
  - capítulo 1 (temas 1–4): términos 2 (peso vacío, rampa, densidad, obstáculo de 50 ft, corrección por pista,
    sobre de peso y balance, sobrepeso) y el simulador de altitud de densidad;
  - capítulo 2 (temas 5–7): términos 1 (carga útil, CG, Vx, Vy, Va, interpolación, viento cruzado) y el escenario
    de margen de despegue.

  Los capítulos y los candados se quedan como están: ren-q16 (Toluca) después del tema 3 y ren-q6 (Vx) después
  del 6.
- **D3 · El simulador de altitud de densidad:** sus números (carrera de 450 a 850 m, ascenso de 700 a 350 fpm,
  «margen de seguridad» de 100 a 55%) no son de ningún avión y no dicen que son de ejemplo. El «margen de seguridad»
  en porcentaje no está definido en ningún lado. Propongo:
  - agregar en la nota: «Valores de ejemplo, no de un avión en particular: usa siempre las tablas de tu manual»;
  - cambiar el «margen de seguridad» por «Pista que necesitas, con 50% de margen» (de 675 a 1,275 m), que sale de
    la misma carrera y del margen del tema 5.

  Si prefieres, uso los números reales de las tablas del C172S, pero necesitaría que me confirmes la edición del
  manual que quieres citar.

Efecto en el avance: ninguno. Siguen 7 lecturas y los mismos ejercicios, con los mismos id.
