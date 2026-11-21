# Revisión de IFR — ronda 1 (estilo Rise)

Fecha: 2026-11-19 · Estado: **aprobada por Erik y correcciones aplicadas** (ver «Cambios aplicados» al final).

Qué se revisó:
- los 10 temas (texto, idea clave y puntos);
- los 2 juegos de términos (7 y 7 términos);
- los 2 escenarios («aproximación frustrada» y «sin referencias en el MDA»);
- las 17 preguntas (práctica, evaluación y los candados ifr-q7, ifr-q12 e ifr-q15);
- el proyecto final;
- las 10 imágenes de los temas.

Fuentes:
- OACI Anexo 2:
  - cap. 5 (reglas IFR, dentro y fuera del espacio controlado);
  - cap. 3.6 (servicio de control).
- OACI Anexo 11:
  - apéndice 1 (designadores de las rutas ATS);
  - apéndice 4 (clases de espacio y qué separación da cada una).
- OACI Doc 4444 (PANS-ATM): elementos de la autorización y colación.
- OACI Doc 8168 (PANS-OPS):
  - gradiente de diseño de 3.3 % en las salidas;
  - áreas protegidas y margen mínimo sobre obstáculos;
  - aproximaciones 2D y 3D y descenso continuo (CDFA);
  - esperas: sectores de entrada de 70° y 110°, y tramos de 1 minuto hasta 14,000 ft.
- `src/features/entrenador/esperas.ts`: las entradas a la espera del sitio, verificadas en 70 casos.
- FAA, solo para señalar lo que es de Estados Unidos:
  - AIM 5-2 (CRAFT);
  - 14 CFR 71 (aerovías Victor y rutas Jet; Clase A desde 18,000 ft);
  - 14 CFR 91.175(c)(3) (la regla de los 100 pies con las luces de aproximación).
- FAA SatNav News y OACI NAM/CAR 2026: la cobertura de SBAS (WAAS) en México.

El módulo explica bien los procedimientos (SID, STAR, ILS, MDA, frustrada). Los problemas son tres:
- repite la idea de que el IFR siempre está «bajo control continuo»;
- trae la estructura de aerovías de Estados Unidos;
- uno de los escenarios usa una regla de la FAA.

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Temas 1 y 10, sus puntos e idea clave del tema 1 | «Bajo IFR estás bajo control continuo de ATC durante todo el vuelo», «la separación la garantiza el sistema», y se elige IFR por «la prioridad de tránsito» | Fuera del espacio controlado (F y G) nadie te controla ni te separa. En Clase E el control separa a los IFR entre sí, pero no del VFR. Y el IFR no tiene prioridad sobre el VFR: lo que recibe es servicio de control | «En espacio controlado, el control te autoriza y te separa de los otros IFR (en E, no del VFR). Fuera de él vuelas con tu plan y el servicio de información, y la vigilancia es tuya». Se elige IFR con buen tiempo por la ruta estructurada y el servicio de control, no por prioridad. Idea clave: «En espacio controlado te separa el control; fuera de él, nadie: sigues vigilando afuera» | Anexo 2, cap. 5; Anexo 11, apéndice 4 |
| E2 | Tema 4, sus puntos e idea clave, preguntas ifr-q4 e ifr-q13 | «Aerovías Victor, hasta FL180, por radiales VOR; Rutas Jet, sobre FL180» | Es la estructura de Estados Unidos: su Clase A empieza a 18,000 ft y ahí cambian las rutas. La OACI nombra las rutas con una letra y un número. Las rutas superiores llevan la U delante, y las RNAV usan sus propias letras (L, M, N, P, Q, T, Y, Z). La frontera entre rutas inferiores y superiores, y la altitud de transición, las publica cada país en su AIP (en México, ENR 3) | «Rutas ATS inferiores y superiores, designadas con letra y número; las RNAV tienen sus letras; el AIP publica cuáles hay y dónde cambian. Victor, Jet y FL180 son de Estados Unidos». ifr-q4 e ifr-q13 se reescriben sobre esto. No se dan cifras de México que no pude confirmar en el AIP | Anexo 11, apéndice 1; 14 CFR 71 |
| E3 | Escenario «sin referencias en el MDA» (interactividad-4), el desenlace correcto | Con solo las luces de aproximación «puedes bajar hasta cien pies sobre la zona de toma» | Es la regla de la FAA (14 CFR 91.175(c)(3)(i)). La OACI no tiene esa cifra: pide la referencia visual requerida, la que te deja evaluar tu posición y tu trayectoria respecto a la pista | Segunda decisión: seguir nivelado en la MDA hasta el punto de frustrada y, si al llegar no tienes la pista o sus marcas a la vista, frustrar. El desenlace explica que la regla de los 100 pies es de la FAA | 14 CFR 91.175; Anexo 6 y Doc 8168 |
| E4 | Término ifr2-1 «Espacio protegido» | «Área garantizada libre de obstáculos» | No está libre de obstáculos: dentro hay obstáculos, y el procedimiento garantiza un margen mínimo sobre ellos (MOC) si vuelas dentro del área y a las altitudes publicadas | «Área alrededor del procedimiento donde tienes un margen mínimo sobre los obstáculos, si vuelas dentro de ella y a las altitudes publicadas» | Doc 8168 |
| E5 | Imágenes de los 10 temas | Infografías | Son generadas por IA y repiten el «control continuo de ATC» y la «separación garantizada». La del tema 1 ni siquiera es del tema: es una portada de «Bienvenido al módulo» | Reemplazarlas por clips (D1) | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 2, término ifr-1, pregunta ifr-q11 | CRAFT como «el formato» de la autorización | CRAFT es un mnemotécnico de Estados Unidos; sirve, y la OACI pide los mismos elementos (límite, ruta, niveles, frecuencia y código). Agregar media línea: «es un truco para recordarla; la OACI pide los mismos elementos». Así queda conectado con el Gimnasio de autorizaciones | Doc 4444; AIM 5-2 |
| P2 | Tema 3, punto «Su propósito de diseño», pregunta ifr-q12 | La SID «garantiza» la separación de obstáculos | Solo si cumples el gradiente de ascenso publicado (el estándar es 3.3 %, unos 200 pies por milla náutica). Agregarlo al texto y al punto | Doc 8168 |
| P3 | Tema 7, sus puntos y la idea clave, pregunta ifr-q8 | RNAV «usa GPS/GNSS»; «llevó aproximaciones de precisión» a aeropuertos sin ILS | RNAV puede usar GNSS, DME/DME u otros sensores; las aproximaciones RNAV usan GNSS. LPV y LNAV/VNAV son aproximaciones **con guía vertical** (3D), no de precisión en el sentido del ILS. LPV necesita SBAS (en Estados Unidos, WAAS); en México la cobertura existe pero es limitada en el sur, así que hay que confirmar en la carta si hay mínimos LPV | Doc 8168; FAA SatNav News; OACI NAM/CAR 2026 |
| P4 | Tema 8, punto «La diferencia práctica», pregunta ifr-q16 | Mantener la MDA nivelado hasta el punto de frustrada; «brevemente» en ifr-q16 | Es válido, pero la OACI recomienda hoy el descenso continuo (CDFA): bajar con una senda constante y decidir al llegar a la MDA, como si fuera una DA. Agregarlo como un punto. En ifr-q16, cambiar «brevemente» por «hasta el punto de aproximación frustrada» | Doc 8168 |
| P5 | Tema 9 y sus puntos | Las tres entradas, sin regla | Usar los nombres de la OACI (directa, paralela y desplazada o gota) y la regla del sitio (`esperas.ts`): gota en el sector de 70° del lado de la espera, paralela en los 110° del otro lado y directa en el resto. Y el tramo de alejamiento de 1 minuto hasta 14,000 ft | Doc 8168; `esperas.ts` |
| P6 | Término ifr2-7 «Minimums» y término ifr-4 «DA» | Mínimos = «techo y visibilidad»; DA «en una aproximación ILS» | Los mínimos de aproximación son la DA o la MDA y la visibilidad (o el RVR); el techo cuenta al planear. La DA también se usa en LPV y LNAV/VNAV, no solo en el ILS | Doc 8168 |

Todo lo demás se revisó y está bien:
- el plan de vuelo IFR con equipo, ruta, nivel, combustible y alterno (ifr-q2);
- colacionar la autorización;
- SID y STAR: qué conectan, sus restricciones y que la SID cambia con la pista (ifr-q3, ifr-q5, ifr-q17);
- el ILS con localizador y senda de unos 3° (ifr-q6);
- las categorías I, II y III;
- frustrar al llegar a la DA sin referencias (ifr-q7, el escenario del ILS);
- no repetir la misma aproximación si nada cambió;
- la MDA que no se cruza sin referencias (ifr-q9) y los step-down fixes;
- el holding como hipódromo (ifr-q10) y la gota (ifr-q15);
- LPV con mínimos parecidos a un ILS CAT I (ifr-q14);
- el flujo completo del tema 10, salvo el «control continuo».

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 10 temas, unos 65 en total (uno por paso), en lugar
  de las 10 imágenes (E5).
- **D2 · Ejercicios por capítulo.** El capítulo 1 enseña plan, SID, aerovías y STAR. El capítulo 2 enseña las
  aproximaciones y la espera. Hoy el reparto automático deja en el capítulo 1 el escenario del ILS y el primer juego
  de términos, que pregunta por DA, MDA, LPV y holding. Esos cuatro temas se enseñan en el capítulo 2. Propuesta:
  - capítulo 1: el primer juego de términos, rehecho con lo del capítulo 1: CRAFT, límite de autorización,
    colación, SID, STAR, ruta ATS y gradiente de ascenso;
  - capítulo 2: los dos escenarios y el segundo juego, que recibe DA, MDA, LPV y holding y suelta RNAV y
    «Minimums», que ya están en los textos (queda de 9 términos).

  Los candados y los id no cambian. La prueba del reparto automático pasa a otro módulo que todavía no declara sus
  ejercicios.
- **D3 · La altitud de transición y las rutas de México.** No pude confirmar en el AIP la altitud de transición de
  México ni los nombres de sus rutas (una fuente secundaria dice 18,500 ft). Propongo no dar cifras de México y
  mandar al AIP (ENR 3 y las cartas). Si tienes a la mano el AIP o las cartas de SENEAM, con eso lo agrego.

Efecto en el avance: ninguno. Siguen 10 lecturas y los mismos ejercicios, con los mismos id.

## Cambios aplicados

Erik aprobó todo con las recomendaciones (D1, D2 y D3 como se propusieron).

- **E1:** temas 1 y 10, sus puntos y la idea clave del tema 1 reescritos. En espacio controlado el control te separa
  de los otros IFR (en D y E, no del VFR); fuera de él nadie te separa; el IFR no tiene prioridad sobre el VFR.
- **E2:** tema 4 con las rutas ATS de la OACI (letra y número, U en las superiores, letras RNAV) y el AIP (ENR 3);
  Victor, Jet y FL180 señalados como de Estados Unidos. ifr-q4 e ifr-q13 reescritas.
- **E3:** segunda decisión del escenario «sin referencias en el MDA»: seguir nivelado hasta el punto de frustrada.
  El desenlace explica la referencia visual requerida de la OACI y que la regla de los cien pies es de la FAA. El
  desenlace equivocado (falla-2) ya no habla de «referencia intermedia».
- **E4:** ifr2-1 «Espacio protegido» con el margen mínimo sobre obstáculos.
- **E5 / D1:** 68 clips (uno por paso) en lugar de las 10 imágenes.
- **P1:** CRAFT como truco de Estados Unidos, con la colación (tema 2, ifr-1, ifr-q11).
- **P2:** gradiente de 3.3 % en el tema 3, su idea clave y ifr-q12 (ahora candado sobre el gradiente).
- **P3:** tema 7 con GNSS, DME/DME u otros sensores, LNAV, LNAV/VNAV y LPV con guía vertical, SBAS y la cobertura en
  México; ifr-q8 sobre las aproximaciones RNAV.
- **P4:** punto «Descenso continuo (CDFA)» en el tema 8; ifr-q16 sin «brevemente».
- **P5:** tema 9 con las entradas por sector (gota 70°, paralela 110°, directa 180°) y el tramo de 1 minuto hasta
  14,000 ft (1.5 arriba).
- **P6:** DA también en LPV y LNAV/VNAV; se quitó «Minimums».
- **D2:** capítulo 1 con interactividad-1 y el juego de términos rehecho (CRAFT, SID, STAR, límite de autorización,
  colación, ruta ATS y gradiente); capítulo 2 con interactividad-2, 3 y 4, y el segundo juego con DA, MDA, LPV y
  holding (9 términos). La prueba del reparto automático se cambió por una que exige que cada módulo armado por temas
  declare sus ejercicios por capítulo.
- **D3:** sin cifras de México para la altitud de transición ni nombres de rutas; se manda al AIP.
