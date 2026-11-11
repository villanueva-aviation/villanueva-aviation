# Instructor virtual IFR — diseño

Fecha: 2026-11-11. Autor de las decisiones: Erik (fundador). Lo marcado **(mi decisión)** lo decidí yo y Erik puede cambiarlo.

## Para qué

Los cadetes se confunden con la navegación por instrumentos y olvidan lo que aprendieron. Erik enseñó a Álvaro (cadete en España) con un método fijo: cada tema pasa por **teoría, práctica y examen**, y al final hay actividades mezcladas. Este programa pone ese método en el instructor virtual, igual que el programa VFR de 14 lecciones: teoría por voz, ejercicio en el simulador, calificación en vivo con el lector y debriefing con mapa.

Se considera un éxito cuando un cadete puede abrir el programa en **su propio aeropuerto**, volar los cuatro temas con su VOR local (o el más cercano) y salir «filoso»: interceptando sin pasarse, sosteniendo arcos a ±0.5 NM y sabiendo qué entrada a la espera le toca antes de llegar al VOR.

## Qué sí

### Las 6 lecciones (orden de Erik; número de lecciones: mi decisión, Erik lo aprobó)

| # | Tema | Contenido |
|---|---|---|
| 1 | Interceptación de radiales | Teoría, 5 prácticas, examen |
| 2 | Rutas de acercamiento y alejamiento (TO/FROM) | Teoría, prácticas, examen |
| 3 | Arcos DME | Teoría, prácticas, examen |
| 4 | Patrones de espera | Teoría, entrada dicha por voz, espera con carta o inventada, examen |
| 5 | Vuelo mezclado | Interceptar, volar un arco y entrar a la espera en un solo vuelo |
| 6 | Checkride IFR | El vuelo mezclado sin consejos del instructor |

- Aprobar el examen de una lección abre la siguiente (Erik).
- Los exámenes y el checkride se califican en **nivel medio como mínimo**, aunque el cadete practique en fácil (Erik lo aprobó). El cadete puede elegir difícil.
- Niveles: los mismos tres del programa VFR (`nivel.ts`: Fácil, Medio, Difícil).

### Teoría (Erik)

Cada tema tiene dos partes:
- **Explicación por voz** del instructor antes de la práctica, corta, con la cola de voz que ya existe.
- **Una página con dibujos** del HSI en distintas posiciones respecto al VOR, del estilo de `/resumen-hsi` (reutilizar `src/features/landing/HSI.tsx`). Tiene versión imprimible gratis, como `/instructor/hojas` **(mi decisión)**.

Las entradas a la espera se dibujan con `src/features/entrenador/esperas.ts`, que ya está validado (70 de 70 casos). **No usar `guia-hsi.pdf`, que tiene los sectores mal.**

### Cualquier aeropuerto (Erik)

- El cadete vuela desde su aeropuerto. Si hay VOR, se practica con ese; si no, el sistema busca el más cercano.
- La página muestra los VOR cercanos con su distancia, frecuencia y si tienen DME. El cadete elige a cuál ir y puede volarlos uno por uno (Erik).
- Un VOR sin DME sirve para interceptación, rutas y esperas, pero no para arcos. El sistema lo avisa y propone el VOR con DME más cercano.

**De dónde salen los VOR (mi decisión, cambia lo que le dije a Erik en el chat).** En el chat propuse la base pública de OurAirports. Al revisar el código encontré que el lector **ya pide datos de aeropuertos al simulador** con la API de instalaciones de SimConnect (`OPEN AIRPORT…` en `LectorInstructor.cs`). Pedirle al simulador sus propios VOR es mejor:
- coinciden exactamente con lo que recibe el radio del avión;
- no hay que mantener una base de datos ni actualizarla cada ciclo AIRAC.

El lector agrega un pedido «VOR cercanos» que devuelve identificador, nombre, frecuencia, posición, declinación (para convertir radiales a verdadero) y si tiene DME. La página solo lista VOR cuando el lector está conectado; sin lector, el programa no se puede volar de todos modos.

### Lo que el lector agrega (lector v1.6)

De NAV1 **(mi decisión: solo NAV1, para que el instructor no tenga que adivinar qué radio usa el cadete)**:
- frecuencia activa, identificador y si hay señal;
- curso seleccionado (OBS);
- radial en el que está el avión;
- desviación de la barra en grados;
- TO/FROM;
- distancia DME y si el VOR tiene DME;
- si el GPS está manejando la barra. Si lo está, el instructor avisa y no califica, porque el ejercicio es con el VOR.

Un punto de la barra equivale a 2° en un VOR. Funciona igual con un HSI o con un VOR clásico, porque se lee la variable del simulador, no el instrumento.

### Ejercicios generados

Los ejercicios se calculan con la posición del VOR y la del avión, así que sirven en cualquier parte del mundo. El instructor los dicta por voz y los muestra en pantalla: «Intercepta el radial 270 de TLC alejándote».

**Las 5 prácticas de interceptación (Erik pidió 5; los casos son mi decisión).** Cubren los consejos de Erik sobre la distancia:
1. Alejándose del VOR, lejos (más de 15 NM).
2. Alejándose del VOR, cerca (menos de 5 NM).
3. Acercándose al VOR, lejos.
4. Acercándose al VOR, cerca.
5. Un radial que queda a la espalda: primero hay que virar más de 90° para ponerse a interceptar.

**Lección 2 (mi decisión, para que no repita la lección 1).** Volar hacia la estación en un curso (TO), pasar por ella (cambio de TO a FROM) y alejarse por otro radial, corrigiendo el viento.

### Calificación

**Interceptación** (Erik, con las medidas que propuse y él aprobó):
- **Quedar en el radial:** dentro de un punto en nivel medio.
- **Pasarse:** se mide cuánto cruza la barra al otro lado después de centrarse.
  - Medio: hasta ½ punto, bien; entre ½ y 1 punto, «bien, pero empieza a virar antes»; más de 1 punto, error.
  - Fácil: error a partir de 1.5 puntos.
  - Difícil: error a partir de ½ punto **(mi decisión)**.
- **Quedarse corto:** terminar el viraje con la barra a más de un punto y tardar en centrarla. Es error si dura más de 30 s en medio (60 s en fácil, 20 s en difícil) **(mi decisión)**.
- **Ángulo:** 30° de interceptación, como lo trabajó Erik con Álvaro. Salirse de 30° ±10° se anota como observación, no como error.
- **Sin tiempo límite** (Erik).
- **Consejos del instructor** (Erik):
  - Cerca de la estación, la barra se mueve rápido: hay que interceptar lo antes posible.
  - Lejos, la barra tarda en moverse: hay que tener paciencia antes de corregir.

**Arco DME** (Erik):
- **Distancia:** fácil ±1 NM, medio ±0.5 NM, difícil ±0.2 NM. Lo ideal es estar justo en el arco.
- **Errores:** cada tramo fuera del rango es un error con su peor distancia («llegaste a 10.8 NM»).
- **Entrada al arco:** empezar a virar antes de la distancia del arco. Pasarse al entrar es error, con las reglas de interceptación.
- **Salida al radial:** se califica con las reglas de interceptación.
- **Consejo:** ir corrigiendo unos 10° hacia la estación cuando la distancia empieza a crecer.

**Patrones de espera** (Erik; las medidas son mi decisión):
- **Elección del radial:** el cadete elige por qué radial llega al VOR (Erik).
- **Datos de la espera, antes de despegar:**
  - **Con carta:** el cadete escribe los datos de su carta IFR: curso de acercamiento, virajes a la derecha o a la izquierda y tiempo del tramo (Erik: deben contar con sus cartas).
  - **Sin carta:** botón «Inventar espera». El programa elige un curso y un sentido de viraje distintos cada vez (Erik). Usa `generarSituacion` de `esperas.ts` como base.
- **Pregunta por voz** (Erik): unos 2 minutos antes de llegar al VOR (calculado con la distancia y la velocidad sobre el suelo), el instructor pregunta «¿Qué entrada vas a hacer?» y el cadete responde por micrófono: directa, paralela o gota, en español o en inglés. Se usa el mismo reconocimiento de voz de las preguntas del programa VFR.
- **Entrada correcta:** la calcula `entradaEspera()` con el rumbo con el que el avión cruza el VOR.
- **Doble calificación:** se califica lo que dijo y también lo que voló. La entrada volada se deduce del recorrido después de cruzar el VOR.
- **La espera, en nivel medio:**
  - tramo de alejamiento de 1 minuto, ±10 s;
  - tramo de acercamiento en el radial dentro de un punto;
  - virajes a régimen estándar, de 3°/s ±1°/s;
  - no alejarse del VOR más de 4 NM.
  - Fácil y difícil abren o cierran estas tolerancias en proporción.
- **Duración:** la entrada más dos vueltas completas.

### Debriefing con mapa

Se reutiliza el debriefing que ya está en main (`DebriefingMapa`, `MapaVuelo`, `RepeticionVuelo`, tabla `recorridos_leccion`):
- **Dibujos sobre el mapa:**
  - el VOR;
  - el radial que se pidió, como una línea;
  - el arco ideal;
  - la espera ideal, con los sectores de entrada coloreados.
- **Errores:** cada error queda numerado en su punto, igual que en VFR.
- **Lecturas de la repetición:** se agregan el radial, la desviación en puntos y la distancia DME.

### Idiomas, acceso y avisos

- **Idiomas:** español e inglés, como el programa VFR. La interfaz en inglés no lleva acentos, ñ ni signos de apertura.
- **Acceso:** igual que el programa VFR. Al principio solo entra el fundador (`ACCESO_REPASO`) **(mi decisión)**.

## Qué no

- Aproximaciones ILS, VOR o RNAV, GPS como fuente de navegación, NDB/ADF.
- Una base de datos de esperas publicadas: el cadete trae las suyas de su carta.
- Torre o ATC por voz (Erik la canceló el 2026-11-08).
- NAV2.
- MSFS 2024 (el lector es para MSFS 2020).

## Lo que no debe pasar

- **Sectores de entrada equivocados:** el error de `guia-hsi.pdf` no se puede repetir. Toda entrada sale de `esperas.ts`.
- **Lenguaje prohibido** en ningún texto, voz ni página: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA». Tampoco «Garmin» visible.
- **Ejercicios imposibles:** un ejercicio que no se pueda volar con el VOR elegido (arco sin DME, radial fuera de alcance) nunca se dicta.
- **Calificar con datos malos:** sin señal del VOR, o con el GPS manejando la barra, el instructor lo dice y no califica.

## Decisiones menores (mías)

- **Rutas de la página:**
  - `/instructor/ifr`: menú de lecciones y lista de VOR;
  - `/instructor/ifr/:numero`: la lección;
  - `/instructor/ifr/teoria/:tema`: la página de teoría, con versión imprimible.
- **Sintonía:** si NAV1 no tiene el VOR elegido, el instructor dice «Sintoniza 115.20 en NAV1 y pon el curso 270», y espera a que el identificador coincida antes de empezar.
- **Altitud:** no se califica en las lecciones 1 a 4. El instructor solo avisa si el avión se sale ±300 ft de la altitud con la que empezó el ejercicio. El tema es la navegación.
- **Exámenes:**
  - Lección 1: dos interceptaciones, una acercándose y una alejándose, sorteadas entre los 5 casos.
  - Lecciones 2 y 3: un ejercicio.
  - Lección 4: entrada más dos vueltas.
  - Todos sin consejos del instructor.
- **Guardado:** cada lección se guarda en `intentos_maniobra` con clave `ifr-1` … `ifr-6`, y su recorrido en `recorridos_leccion`, sin migración nueva para la grabación.
- **Rumbo magnético y verdadero:** los radiales son magnéticos. Para dibujarlos en el mapa se usa la declinación que el simulador da para cada VOR.

## Pendiente para quien lo construye

- Cómo se separa en archivos y tareas: siguiendo el patrón de evaluadores puros con pruebas (`evaluadorX.ts` + `X.test.ts`) del programa VFR.
- El texto de las explicaciones por voz y de las páginas de teoría. Erik las revisa antes de publicar.
- Cómo se deduce la entrada volada a partir del recorrido.
- Los valores exactos de fácil y difícil en la espera, en proporción a los de medio.

## De rampa a rampa (Erik, 2026-11-11: «igual que las VFR»)

Cada lección IFR es un vuelo completo, como las VFR. Se reutiliza el mismo flujo (`repaso.ts`, `fasesVuelo.ts`, checklist por voz, debriefing de lección):
- **rampa:** checklist por voz, arranque, prueba de motor;
- **salida:** rodaje y despegue, calificados como en VFR;
- **navegación:** los ejercicios en el VOR. Ocupa el lugar de la zona de maniobras (maniobra o fuera de zona);
- **regreso:** aproximación, aterrizaje y rodaje, calificados como en VFR;
- **apagado y debriefing.**

Mis decisiones para encajarlo:
- **Inicio de los ejercicios:** al pasar 1,000 ft sobre el terreno después del despegue. El primero se genera desde la posición en ese momento, así que volar hacia el VOR ya forma parte del primer ejercicio.
- **Regreso:** cuando se terminan las prácticas o el examen, el instructor dice «Regresa al aeropuerto».
- **Lista de VOR:** muestra los que están a 60 NM o menos del aeropuerto. A más de 40 NM avisa «vuelo largo».
- **Sin zona:** no hay zona de práctica ni «fuera de zona». Lo que equivale es perder la señal del VOR: el instructor pide acercarse y no califica mientras no haya señal.
- **Anular la lección:** las mismas reglas que VFR (slew, pausa larga, etc.).
- **Debriefing:** las mismas partes que VFR (checklist, despegue, aterrizaje), y donde estaban «maniobras» va «navegación», con los errores de cada ejercicio en el mapa.
