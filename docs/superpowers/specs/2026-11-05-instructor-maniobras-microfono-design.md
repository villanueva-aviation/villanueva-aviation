# Instructor virtual: menú de maniobras y preguntas por micrófono

Fecha: 2026-11-05. Sigue a la sesión de una hora (`docs/superpowers/specs/2026-11-05-instructor-sesion-hora-design.md`, commits 8f5f7ca..ae3e351, en main). Sale de la prueba de Erik con MSFS real: la sesión del viraje escarpado funcionó completa.

## Intención

El programa del instructor solo enseña el viraje escarpado. Erik quiere que cubra las maniobras que un cadete practica para ir sumando horas, empezando por las de las primeras lecciones, y que el instructor también lo prepare en teoría: mientras vuela, le hace preguntas en voz alta y el cadete contesta por micrófono, como en un vuelo con instructor de verdad.

Momento que lo explica: el cadete está en vuelo lento y el instructor le pregunta «¿Cuál es la Vs0 del C172?». Él contesta en voz alta y sigue volando.

Éxito: Erik abre el programa, elige idioma, escoge "Clase completa" en el menú y el instructor lo lleva por recto y nivelado, vuelo lento y pérdidas, haciéndole preguntas en el camino. El debriefing le dice cómo le fue en cada maniobra y cuántas preguntas acertó.

## Lo que decidió Erik

- **Menú después del idioma.** El cadete escoge qué hacer y el briefing es el de lo que eligió.
- **En el menú van la clase completa y cada maniobra suelta.** La clase lleva al cadete por las tres maniobras en orden: recto y nivelado, vuelo lento y pérdidas.
- **Primeras maniobras: recto y nivelado, vuelo lento y pérdidas.** El viraje escarpado se queda como opción.
- **Acceso:** recto y nivelado y el viraje escarpado son gratis con cuenta. Vuelo lento, pérdidas y la clase completa son del Exclusivo.
- **Preguntas por micrófono durante la práctica**, sobre el avión, la maniobra y teoría.
- **Si contesta mal o no contesta**, el instructor dice la respuesta correcta y la maniobra sigue.
- **Las respuestas cuentan en el debriefing**, no en la calificación de la maniobra.
- **Se califican por ideas clave**: cada pregunta guarda lo que debe aparecer en la respuesta. La IA queda para después, dentro de la suscripción de voz IA.
- **Claude escribe el banco de preguntas y Erik lo revisa** antes de publicarlo.
- **Para después**, en maniobras con referencia en tierra (S sobre un camino, ochos), el cadete dirá por el micrófono «Tengo mi referencia, estoy listo» para empezar. Va en este documento solo como dirección; no se construye aquí.

## Metas

1. Menú de actividades después del idioma, con candado y la invitación al Exclusivo donde aplique.
2. Preguntas por micrófono en cualquier maniobra, calificadas por ideas clave, en español y en inglés.
3. Banco de preguntas de respuesta corta: unas 15–20 por maniobra más generales del C172, en los dos idiomas.
4. Tres maniobras nuevas calificadas por el lector: recto y nivelado, vuelo lento y pérdidas.
5. La clase completa: una sesión de una hora por las tres maniobras.
6. Debriefing que cubre varias maniobras y las preguntas.

## No metas

- Maniobras con referencia en tierra, emergencias, aterrizajes, ochos perezosos y familiarización. Son las siguientes, cada una con su diseño.
- Calificar respuestas con IA.
- Páginas web nuevas para las maniobras. La página `/instructor/viraje-escarpado` se queda igual, y las maniobras nuevas viven solo en el programa.
- Guardar las respuestas en la base de datos o mostrarlas en `/admin/maniobras` *(decisión de Claude: Erik pidió el debriefing; se agrega si lo quiere en el panel)*.
- Otros aviones que no sean el C172.

## Anti-metas (fallaría aunque funcione)

- Que una pregunta interrumpa una orden o un aviso, o llegue en el peor momento de la maniobra, como a media recuperación de una pérdida.
- Que el micrófono tome la voz del propio instructor como respuesta del cadete.
- Que una respuesta correcta dicha de forma normal («cuarenta nudos», «son 40») se califique mal. Una pregunta que se presta a eso no entra al banco.
- Que algo del texto sugiera certificación oficial. Siguen las reglas de siempre: nada de "certificado", "CFI", "licencia" ni "certified", y el aviso del reporte no cambia.
- Que cambie la sesión del viraje escarpado que ya funciona, salvo por el menú y las preguntas.

## Restricciones

- Todo lo que ya existe se reutiliza: el lector local en 127.0.0.1:8766, la voz con su cola sin cortes, el idioma, la sesión por bloques, el guardado en `intentos_maniobra` (ya tiene la columna `maniobra`) y la revisión de Erik para la insignia.
- Acceso al Exclusivo con `usePremiumAccess` (`src/features/payments/`), igual que el resto del sitio.
- El reconocimiento de voz es el del navegador. La Academia ya lo usa en `src/features/academia/useSpeechRecognition.ts`. En Edge necesita internet y el permiso del micrófono la primera vez.
- Tolerancias en un solo lugar por maniobra, como `virajeEscarpado.ts`, para afinarlas después de un vuelo real.
- Las maniobras nuevas necesitan datos que el lector no lee hoy: actitud de cabeceo, régimen vertical, aviso de pérdida, posición de flaps y RPM. Eso pide una versión nueva del lector. Si un cadete trae el lector viejo, el programa le dice que lo actualice en vez de calificar mal.

## Cómo funciona

### Menú

Después del idioma aparecen cinco opciones, cada una con una línea de qué es y cuánto dura:

| Opción | Acceso |
|---|---|
| Clase completa: recto y nivelado → vuelo lento → pérdidas | Exclusivo |
| Recto y nivelado | Gratis |
| Vuelo lento | Exclusivo |
| Pérdidas | Exclusivo |
| Viraje escarpado | Gratis |

Una opción del Exclusivo sin acceso se ve con candado. Al tocarla se explica qué trae y hay un enlace a `/contenido-exclusivo`. La elección no se guarda entre sesiones *(decisión de Claude)*.

### Sesión de una sola maniobra

Funciona igual que la del viraje escarpado: briefing, preparación, práctica, intento calificado, debriefing y cierre. El briefing, los pasos, las órdenes, los avisos, la explicación y el reporte son los de la maniobra elegida.

De la práctica al intento calificado se pasa con el mismo botón que hoy, tanto en la sesión suelta como en cada maniobra de la clase. Vuelo lento, pérdidas y el viraje escarpado llaman "Checkride" al intento calificado. Recto y nivelado no es una tarea del ACS, así que lo llama "Intento calificado" *(decisión de Claude)*.

### Clase completa

Los bloques son briefing, preparación, recto y nivelado, vuelo lento, pérdidas, debriefing y cierre. Cada maniobra tiene sus intentos de práctica y luego uno calificado. Los minutos guía son briefing 5, preparación 5, recto y nivelado 10, vuelo lento 15, pérdidas 15, debriefing 5 y cierre 5 *(decisión de Claude)*. Entre una maniobra y otra, el instructor pide volver a la altitud de seguridad y estabilizarse antes de seguir.

### Las maniobras

Las tolerancias son las de un checkride, como en el viraje escarpado; los valores de partida son *decisión de Claude* y se afinan después de un vuelo real. Vuelo lento y pérdidas se hacen a 1,500 ft sobre el terreno o más, igual que el viraje escarpado.

**Recto y nivelado** (gratis, práctica; no es una tarea del ACS)
- Altitud, rumbo y velocidad objetivo: los que el cadete tenga al armarse el intento, así practica a cualquier potencia.
- Mantenerlos unos 2 minutos: altitud ±100 ft, rumbo ±10°, velocidad ±10 kt y la bola centrada.
- Solo usa los datos que el lector ya lee, así que funciona con el lector actual.

**Vuelo lento** (Exclusivo, ACS Área VII Tarea A)
- Pasos: reducir a la velocidad de vuelo lento, mantenerla en recto unos 30 s, hacer un viraje suave de 90° a cada lado y salir con potencia.
- Altitud ±100 ft, rumbo ±10° en los tramos rectos e inclinación ±10° de la indicada en los virajes. Velocidad +10/−0 kt de la objetivo, que es una constante por afinar.
- Si suena el aviso de pérdida, el intento no pasa.

**Pérdidas** (Exclusivo, ACS Área VII Tareas B y C)
- Hay dos: sin potencia, con flaps de aterrizaje y descendiendo, y con potencia, en configuración de despegue y ascendiendo. En la clase y en la sesión suelta se hacen las dos.
- Se califica:
  - que llegue a la pérdida (suena el aviso y baja la nariz);
  - que recupere rápido: baja el ángulo, alas niveladas y potencia;
  - la altitud que pierde;
  - que no entre en una segunda pérdida;
  - inclinación ±10° de la indicada.
- Cómo se detectan exactamente la pérdida y el fin de la recuperación lo decide quien construya, con las señales del lector nuevo.

Para cada maniobra nueva va: su archivo de tolerancias, su evaluador, sus pasos y órdenes de voz en los dos idiomas, sus avisos, su explicación, su hoja en el reporte (con su código del ACS, o "Práctica" en recto y nivelado) y su insignia. Erik la otorga por el mismo flujo de "Mandar a revisión".

### Preguntas por micrófono

- **Cuándo:** una pregunta por intento, en un momento tranquilo de la maniobra. Nunca se pregunta mientras suena una orden o un aviso, ni en la parte crítica (a media recuperación de una pérdida o en pleno viraje escarpado). Cada maniobra define cuál es su momento tranquilo; en pérdidas es entre un intento y otro.
- **Cómo:** el instructor lee la pregunta. Cuando termina de hablar, el micrófono escucha unos 8 segundos y en pantalla se ve "Escuchando…". Así no se toma la voz del instructor.
- **Respuesta:**
  - Si es correcta, el instructor dice «Correcto».
  - Si no, dice «La respuesta es…».
  - Si no contestó, también dice «La respuesta es…».
  - Con eso sigue la maniobra; nada se anula ni se detiene.
- **Calificación por ideas clave:** cada pregunta tiene una o más respuestas aceptadas por idioma. Se compara sin acentos ni mayúsculas, y los números dichos con palabras se convierten a cifras («cuarenta» → 40). Basta con que la respuesta contenga una de las aceptadas.
- **Ajustes:** un interruptor "Preguntas por micrófono" en el panel de voz. Si no hay micrófono, se niega el permiso o el navegador no reconoce voz, las preguntas se apagan solas con un aviso.
- **Idioma:** el reconocimiento usa es-MX o en-US según la sesión.

### Banco de preguntas

- Hay unas 15–20 preguntas por maniobra, más un grupo general del C172: velocidades, límites y sistemas.
- Todas son de respuesta corta (un número, un nombre o una acción) y vienen en español y en inglés.
- Cada una lleva la pregunta, la respuesta que dice el instructor y las respuestas aceptadas.
- Salen de la Academia y de los datos del C172 que ya usan las checklists.
- **Erik las revisa antes de publicarlas.** Las recibe en un documento fácil de leer, no en el código.
- Durante una sesión no se repite una pregunta mientras queden otras.

### Debriefing

Por cada maniobra: el mejor intento, cómo le fue en el calificado y lo que más se le salió. Al final: «Preguntas: 4 de 6 correctas», y la lista de las que falló, con su respuesta. En "Solo lo necesario" la voz lee el resumen de cada maniobra y el total de preguntas.

## Orden de construcción *(decisión de Claude: cada fase se puede subir sola)*

1. Menú y preguntas por micrófono con el viraje escarpado, más el banco del viraje y el general del C172. Lo primero es una prueba rápida de si el reconocimiento de voz de Edge funciona con la ventana detrás de MSFS en pantalla completa.
2. Recto y nivelado (gratis), con el lector actual.
3. Lector nuevo, con cabeceo, régimen vertical, aviso de pérdida, flaps y RPM, y vuelo lento.
4. Pérdidas.
5. Clase completa.

## Riesgos

- **El micrófono con MSFS en pantalla completa.** No sabemos si Edge sigue escuchando cuando su ventana no tiene el foco; se prueba primero. Si no funciona, la alternativa es un botón del joystick o una tecla leída por el lector.
- **El reconocimiento necesita internet.** Sin conexión, las preguntas se apagan.
- **El lector nuevo hay que repartirlo.** Los cadetes que ya lo tienen deben bajarlo otra vez para vuelo lento y pérdidas.
- **Detectar la pérdida en MSFS 2020.** El modelo de vuelo del C172 de MSFS puede dar señales distintas a un avión real. Las constantes se afinan con el vuelo de Erik.

## Lo que queda a quien construya

- Cómo generalizar el evaluador para varias maniobras sin romper el viraje escarpado.
- Las señales exactas para detectar la pérdida y el fin de la recuperación.
- El momento tranquilo de cada maniobra.
- Los nombres de archivos, las rutas y el aspecto del menú, siguiendo el estilo actual de la ventana.
