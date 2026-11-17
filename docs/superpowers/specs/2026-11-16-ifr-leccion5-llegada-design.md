# Lección IFR 5: vuelo mezclado como una llegada real

Fecha: 2026-11-16. Programa IFR del instructor virtual (spec madre: `2026-11-11-instructor-ifr-design.md`).

## Para qué

Erik enseñó a Álvaro con un método fijo: cada tema por separado (teoría, práctica y examen) y al final actividades
mezcladas para que no se le olvide lo aprendido. Las lecciones 1 a 4 ya cubren los temas sueltos (interceptación,
rutas pasadas, arcos DME y esperas). La lección 5 los junta en **un vuelo que se parece a una llegada real**, la que el
cadete se va a encontrar en la red con ATC: recibe una autorización completa, la copia o la recuerda, y la vuela de
principio a fin.

Es un éxito cuando el cadete vuela la autorización completa sin pedir ayuda: intercepta sin pasarse, sostiene el arco,
sale al radial final, sabe qué entrada le toca y vuela la espera, todo dentro de tolerancia.

## Qué sí (decidido por Erik)

- **Una llegada real, no un sorteo** de ejercicios sueltos. Las partes van siempre en este orden y cada una termina
  donde empieza la siguiente:
  1. **Interceptación** de un radial de acercamiento al VOR, **siempre normal** (Erik, tras la revisión: una ruta
     pasada deja el radial del otro lado de la estación y el cadete quedaría adentro del arco).
  2. **Arco DME** desde ese radial hasta otro, acercándose (como el arco de regreso de la IFR 3).
  3. **Acercamiento** por el radial final hasta el VOR.
  4. **Espera** en el VOR.
- **La autorización llega toda junta, como de ATC**, no por partes. Ejemplo:
  «Autorizado a GDL: intercepta el radial 240 acercándote, únete al arco de 8 millas hasta el radial 200, acércate a
  GDL y espera al noreste en el radial 040, virajes derechos, mantén 9,000.»
  El cadete la puede pedir otra vez: por voz («repite») y con un botón.
- **Las preguntas de identificación de siempre**, cada una al empezar su parte (sin la de «¿normal o ruta pasada?»,
  que en esta lección siempre sería «normal»; las rutas pasadas se quedan en la lección 2):
  - arco: «¿Hacia qué lado viras para entrar al arco?» (como IFR 3);
  - espera: «¿Qué entrada vas a hacer?» (como IFR 4).
  Se confirman en neutro («Anotado: …», tono que baja) y se califican al final de la parte.
- **Calificación:** cada parte con su hoja de siempre (interceptación, arco, espera). **La llegada se aprueba solo si
  aprueban sus tres partes**, como un checkride.
- **Cuántas:** la práctica son **2 llegadas** (sesión de una hora); el examen, **1**.
- **Lección 5 con recordatorios, lección 6 sin ellos:** en la 5, al empezar cada parte el instructor recuerda esa parte
  de la autorización (lo que hoy dice al armar cada maniobra) y da los consejos de siempre. La lección 6 (checkride) es
  el mismo vuelo sin recordatorios ni consejos; **se construye después**, no en este trabajo.

## Enfoque (Erik eligió la A)

- **A. Encadenar las tres maniobras que ya existen** (elegida). El vuelo es la lista `interceptar-radial, arco-dme,
  espera` repetida por cada llegada. Al llegar a la distancia de la autorización se sortea la llegada y cada maniobra se
  arma con su parte, igual que hoy los tramos de IFR 1 y 2 viajan en `ContextoArmado`. Se reutilizan evaluadores,
  hojas, mapa del debriefing, tracker y todo lo ya probado en vuelo.
- B. Una maniobra nueva «llegada» con un evaluador propio que llama a los tres. Descartada: hoja, debriefing y pruebas
  casi desde cero, y cada arreglo futuro del arco o la espera habría que cuidarlo en dos lugares.

## Cómo es el vuelo

1. **En tierra** (como hoy en IFR 1 a 4): sintoniza el VOR y la altitud de la lección. Además: «Después del despegue,
   aléjate por el radial X; a las 15 millas te doy la llegada.» X es el radial de la pista, como el primer arco de la
   IFR 3.
2. **A las 15 millas: la autorización completa** (voz y texto en pantalla, en el idioma del cadete).
3. **Interceptación** del radial de acercamiento R1. R1 es el radial de 10 en 10 de al lado del avión (a 5–15°),
   acercándose. Termina cuando el cadete lleva 30 s establecido en R1 (o, si no se establece, a 1 milla del arco).
   *Cambio tras el vuelo de Erik del 2026-11-16:* con R1 a 20–40° e interceptando a 30° desde 15 millas se llegaba a R1
   encima del arco o adentro (con 20°, a unas 5.6 millas); Erik se estableció 0.2 millas antes y el «aprobado» y la
   pregunta del arco llegaron ya en el arco.
4. **Arco** de radio 8 a 10 millas desde R1 hasta R2, 30 a 60° más allá (el sentido se sortea); más chico (mínimo 4) si
   interceptando a 30° no quedan 3 millas entre donde se establece y el arco. Arranca cuando la interceptación termina
   (y ahí pregunta hacia qué lado vira): entra directo en «hacia el arco», sin la espera de las 10 millas ni el «regresa a la
   estación» de la IFR 3. La salida al radial final es acercándose (`saleAlejandose: false`).
5. **Espera** en el VOR, llegando por R2 (`llegada` = R2, ya establecido; la fase «posicionando» se resuelve sola). La
   espera (radial de alejamiento, virajes) se sortea **sin ponerla sobre R2** para que la entrada no sea siempre directa;
   lo ideal es repartir las entradas (directa, paralela, de gota) entre las llegadas. La altitud es la de la lección.
   Sin formulario de carta: en la lección 5 la espera siempre es inventada.
6. **Fin de la llegada 1** (práctica): «Aléjate por el radial Y; a las 15 millas te doy la siguiente llegada.» Y es un
   radial distinto del de la primera llegada, para que la segunda no se repita.
7. **Fin:** «Terminamos las maniobras. Regresa al aeropuerto y aterriza», como hoy.

## Restricciones

- **Requiere VOR con DME** (por el arco), igual que la IFR 3 (`requiereDme: true`).
- No romper las lecciones 1 a 4: el arco y la espera conservan su comportamiento de hoy fuera de la lección 5.
- Los exámenes se califican en nivel medio como mínimo (regla del programa).
- Sin palabras prohibidas (oficial, certificado, licencia, etc.). La interfaz en inglés sin acentos ni ¿¡. En inglés la
  autorización usa la fraseología del Gimnasio de autorizaciones («Cleared to GDL via…, hold northeast on the 040 radial,
  right turns, maintain 9,000»).
- Pruebas automáticas como en las lecciones 1 a 4 (`node --test`), incluida la cadena completa de una llegada.

## Qué no

- La lección 6 (checkride): después.
- Abrir la siguiente lección al aprobar el examen: pendiente aparte.
- Esperas de carta real, aproximaciones (VOR, ILS) y cualquier cosa después de la espera.
- Calificar que el cadete repita la autorización por voz (readback). Buena idea para después.

## Anti-metas

- Que se sienta como tres ejercicios sueltos con pausas: cada parte tiene que empezar donde terminó la anterior.
- Que la espera caiga siempre en entrada directa.
- Que la autorización sea tan larga o rara que el cadete no la pueda copiar: una sola frase, en el orden en que se vuela.

## Decisiones mías (Claude), corregibles

- La autorización se da a las **15 millas** (no 12), para dejar margen entre donde se establece y el arco de 8 a 10.
- Si el cadete llega a la distancia del arco sin haberse establecido en R1, el arco arranca igual; la entrada se califica
  como en la IFR 3 y la interceptación termina con lo que voló.
- Si falla una parte, la llegada sigue (no se repite a media llegada); la hoja de cada parte dice qué pasó.
- **Interceptación cortada por el arco:** se califica como en la IFR 1, pero su límite («llegar al radial antes de…»)
  es la distancia del arco más 1 milla, no las 8 millas o el VOR. Llegar a esa distancia sin establecerse es error en ese
  criterio. El sobrepaso se vigila hasta esa distancia; ahí termina la interceptación y arranca el arco.
- **Parte anulada** (sin señal de VOR o DME más de 10 s, GPS, slew, tiempo): se anula **la llegada completa**, no solo la
  parte, porque rearmar un arco o una espera desde donde quede el avión rompe la cadena. En la práctica el instructor
  manda alejarse a 15 millas y da una autorización nueva (la llegada anulada no cuenta para las 2). En el examen queda
  anulado, sin calificación, como hoy cualquier examen anulado.
- El intento de cada maniobra se cuenta como hoy (6 en la práctica, 3 en el examen); en pantalla se lee
  «Llegada 1 de 2 · Arco».

## Lo que queda al constructor

- Cómo viaja la llegada sorteada (R1, tipo, arco, espera) en `ContextoArmado` y en lo que se guarda para retomar un
  vuelo a medias.
- Cómo se elige la espera para repartir entradas dada la llegada R2 (hoy `rutaEspera` hace lo inverso: elige la llegada
  para una entrada).
- Si «repite» por voz se escucha con el micrófono que ya existe o solo con el botón cuando el micrófono no está abierto.
- Textos exactos de la autorización y de los recordatorios, y la teoría de la lección 5 en `teoriaIfr.ts`.
