# Instructor virtual, paso 3: torre por voz con botón de radio

Parte del programa de 14 lecciones (`2026-11-06-instructor-programa-lecciones-design.md`, sección «Torre por voz»). Este documento manda sobre aquel donde no coinciden. Los cambios que trae están en «Qué cambia del diseño anterior».

## Para qué

En la escuela real el cadete habla con Terrestre, Rampa y Torre de principio a fin del vuelo, y eso es lo que más nervios da al llegar a una red con ATC. El instructor virtual ya lee el checklist por voz y califica las maniobras. Lo que falta es que el cadete hable por radio con un botón, como en el avión, y que una torre le conteste con la fraseología mexicana real de MMGL. El programa califica las colaciones y los cambios de frecuencia.

Éxito: Erik, en /admin/vuelo y en Edge, vuela de la plataforma de aviación general de MMGL a Cajititlán o Chapala y de regreso, hablando con ATIS, Terrestre, Rampa y Torre con su botón de radio, sin tocar el teclado de la página. Al final ve qué llamadas y colaciones estuvieron completas y en cuáles le faltó algo.

## Metas

- **Este paso es solo MMGL y en español** (decisión de Erik). El modo general (cualquier aeropuerto) y el inglés vienen después, sobre la misma base.

- El cadete asigna su propio botón de radio, de cualquier joystick o del teclado, como en VATSIM e IVAO. Funciona con MSFS al frente.
- Mientras el botón está apretado, la página escucha y lo dicho va al ATC. Sin el botón, lo dicho no va al ATC. El checklist por voz sigue escuchando sin botón, como hoy.
- ATC con voz propia, distinta de la del instructor y la del copiloto.
- Rutas de rodaje sacadas de los datos de calles del propio simulador, no escritas a mano.
- El programa revisa en el COM1 que el cadete sí cambió a la frecuencia que le dieron.
- Cada colación se califica por sus elementos obligatorios.

## Fuera de alcance

- IA. Lo oído se califica por elementos y palabras clave, como las preguntas orales y el checklist. No se anuncia «con IA».
- Leer cartas de Navigraph. La carta de Erik solo sirvió para comprobar las rutas y no se guarda ni se publica.
- Otros aeropuertos preparados además de MMGL.
- Tráfico, esperas, órdenes de extender el tramo o de hacer un 360, y emergencias.
- Número de posición en plataforma. Rampa dice «plataforma de aviación general». *(Decisión de Claude: Erik no lo pidió y se puede agregar después.)*
- La pista 11R en MMGL. Erik pidió usar siempre la 29L para estas prácticas.
- El modo general y el ATC en inglés. Quedan para después de este paso, por decisión de Erik.

## Lo que decidió Erik

### El vuelo en MMGL, frecuencias de la carta 10-9

ATIS 127.9 · Terrestre 121.9 · Rampa 134.1 · Torre 118.1. El simulador anuncia otra frecuencia de ATIS (122.35), pero manda la carta.

**Salida**

1. **ATIS 127.9.** El cadete lo escucha y no le habla.
2. **Terrestre 121.9.** El cadete pide vuelo VFR local a la zona de trabajo (Cajititlán, 5 NM al sur, o Chapala, 15 NM al sur-sureste) con la letra del ATIS. Terrestre lo autoriza, le da el código de transponder y lo pasa a Rampa. El cadete colaciona.
3. **Rampa 134.1.** Rampa da pista y calles: «X-ray Bravo Victor November Alpha, pista 2-9 izquierda, ruede vía Papa 2, Papa, Papa 1». El cadete colaciona y empieza a rodar. La salida es por la intersección P1 y no cruza ninguna pista.
4. **Rampa pasa a Torre al acercarse a P1.** Cuando el avión se acerca al punto de espera de P1 antes de la 29L, Rampa dice «contacte Torre uno uno ocho punto uno». No lo hace al salir de la plataforma.
5. **Torre 118.1.** El cadete se reporta en el punto de espera. Torre lo autoriza a despegar con salida por el Sierra Eco: «notifique establecido en el área de trabajo».
6. **Zona de trabajo.** El cadete se reporta establecido en el área de trabajo.

**Regreso.** Erik lo aprobó tal cual:

> **Cadete:** Torre Guadalajara, X-ray Bravo Victor November Alpha, nos encontramos en Cajititlán, 5 millas al sur, solicitando datos de aproximación y aterrizaje. *(o «en Chapala, 15 millas al Sierra Eco»)*
> **Torre:** X-ray Bravo Victor November Alpha, pista 2-9 izquierda, viento [dirección] grados [velocidad] nudos, QNH [QNH], proceda a Pirámide, notifique Pirámide.
> **Cadete:** colación de pista, QNH y «notifico Pirámide».
> **Cadete (en Pirámide):** X-ray Bravo Victor November Alpha, Pirámide.
> **Torre:** incorpórese a viento en cola izquierdo pista 2-9 izquierda, notifique viento en cola.
> Después Torre da «vire a base», «vire a final» y «autorizado a aterrizar pista 2-9 izquierda, viento …».

El circuito es izquierdo: la carta prohíbe el derecho para 29L/R abajo de 6000 ft.

**Después de aterrizar.** Torre lo pasa **directo a Rampa** sin Terrestre: «abandone pista vía Papa 1, contacte Rampa uno tres cuatro punto uno». Rampa lo rueda a la plataforma de aviación general por Papa 1, Papa y Papa 2. El vuelo termina con el checklist de apagado.

### Rutas de rodaje del simulador

Una prueba del 2026-11-07 con el MSFS de Erik pidió a SimConnect los datos de calles de MMGL (TAXI_PARKING, TAXI_POINT, TAXI_PATH, TAXI_NAME). Llegaron completos: 130 estacionamientos, 915 puntos, 1,144 tramos y 35 nombres de calle (A, A1–A15, C1–C4, E1–E11, P, P1–P3). La ruta más corta desde **todos** los estacionamientos de aviación general al punto de espera de P1 salió «P2, P, P1», igual a lo que dice Rampa en la vida real.

- La ruta es la más corta por tramos de rodaje y de estacionamiento, sin pasar por tramos de pista, hasta el punto de espera elegido. Se dicen los nombres de calle sin repetir los seguidos y sin los tramos sin nombre.
- MMGL: el destino es el punto de espera de P1 para la 29L. De regreso: de P1 a la plataforma de aviación general.
- Modo general, para cuando llegue: el destino es el punto de espera más cercano a la cabecera de la pista en uso. Si no hay datos de calles o no se encuentra ruta, ATC dice «ruede a punto de espera pista [X]» sin calles.
- La prueba está en el scratchpad (`calles/Calles.cs` y `calles/analizar.py`) y no va al repo.

### Botón de radio

- El cadete asigna su botón desde la página: aprieta «Asignar botón» y luego el botón del joystick o la tecla que quiera. Se guarda en su navegador. Puede ser el mismo que usa en VATSIM o IVAO.
- Lo capta el lector, porque con MSFS al frente la página no recibe teclas. El lector manda el estado del botón en cada muestra.
- Mientras está apretado, la página escucha. Al soltarlo, lo oído va al ATC.

### Comportamiento del ATC *(decisiones de Claude, salvo lo marcado)*

- **Si falta algo en la colación:** en práctica, el ATC pide lo que faltó una vez («colacione QNH»). Si vuelve a faltar, sigue adelante y queda anotado para el debriefing. Así el cadete nunca se queda atorado, aunque el reconocimiento de voz falle con la matrícula. El modo checkride, en el que el ATC no corrige, llega con las lecciones (paso 4). En /admin/vuelo se usa práctica.
- **Si no le entiende nada:** «X-ray Bravo Victor November Alpha, repita». A la segunda, el ATC sigue como si hubiera oído la llamada esperada y lo anota.
- **La frecuencia manda, como en un radio real.** El ATC solo contesta si el COM1 está en su frecuencia. El ATIS suena en ciclo mientras el COM1 está en 127.9. Si el cadete habla en otra frecuencia, nadie contesta. Si a los 20 s de una orden de cambio no ha cambiado, el instructor (no el ATC) le dice «revisa tu frecuencia», y queda anotado. *(Así se practica el cambio de frecuencia, que es para lo que Erik quiso conservar a Rampa.)*
- **Matrícula:** la del avión en el simulador (ATC ID, campo nuevo del lector v1.6), dicha con el alfabeto fonético. Si viene vacía, usa XB-VNA.
- **QNH:** en pulgadas, dígito por dígito, como en el guion que aprobó Erik: «QNH 3-0-0-2». La colación busca esos cuatro dígitos.
- **Reportes de posición:** el ATC acepta el reporte de Pirámide, Cajititlán, Chapala o del área de trabajo cuando el cadete lo dice. Si el avión estaba a más de 2 NM del punto, el debriefing lo anota. Las coordenadas salen del rumbo y la distancia de `mmgl.ts` respecto al aeropuerto.
- **«Vire a base» y «vire a final»** salen de la geometría del circuito: base al pasar unas 0.5 NM después de la cabecera 29L en viento en cola, y final al acercarse a la prolongación del eje.
- **Si sale de la pista por otro lado que no sea P1:** Rampa arma la ruta desde donde está el avión, con los datos del simulador. No es un error.

## Qué cambia del diseño anterior

- El orden de salida en MMGL es **Terrestre → Rampa → Torre**, no Rampa → Rodaje → Torre. De regreso es **Torre → Rampa**.
- La frecuencia 121.9 se llama «Terrestre» en lo que dice el ATC, como la llama Erik.
- La ruta de rodaje la da **Rampa**.
- En MMGL la pista es siempre 29L por la intersección P1. Se quita «la pista en uso sale del viento» para MMGL; sigue igual en modo general.

Nota aparte: la guía publicada `/aeropuertos/mmgl` (`src/data/aeropuertos/mmgl.ts`) describe una salida IFR con Rampa → Rodaje. No se toca en este paso. Es otro tipo de vuelo, y Erik decide si se ajusta.

## Restricciones

- No usar «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial» ni «examen de la AFAC». Tampoco «con IA».
- Los textos del ATC usan la fraseología mexicana (y la de la FAA cuando llegue el inglés). Erik revisa todos los textos del ATC antes de publicar, como el banco de preguntas.
- La interfaz en inglés no lleva acentos, eñes ni ¿¡.
- Los descargos de los reportes se quedan exactos.
- Un lector viejo, sin datos de calles ni botón, anula la lección y pide bajar el nuevo de Descargas, como hoy con el vuelo lento.
- El repo es público. La carta de Navigraph no se guarda ni se publica.
- Lo prueba primero Erik en /admin/vuelo, en Edge, como el checklist por voz.

## Lo que queda al constructor

- Cómo capta el lector el botón con MSFS al frente: winmm `joyGetPosEx`, DirectInput, SimConnect u otro.
- La forma del JSON de calles y del estado del botón en el lector v1.6.
- La distancia a la que Rampa pasa a Torre antes de P1.
- Los elementos obligatorios exactos de cada llamada, dentro de lo que pide el diseño anterior: pista, QNH, código, punto de espera, matrícula, punto VFR y frecuencia.
- Las palabras de Terrestre y de la autorización de despegue. Lo que Erik dictó se usa tal cual. Lo demás lo propone el constructor y Erik lo revisa.
- El código de transponder: uno de 4 dígitos octales que no sea 1200, 7500, 7600 ni 7700. *(Decisión de Claude.)*
- La letra del ATIS y su contenido: pista, viento y QNH del simulador.
