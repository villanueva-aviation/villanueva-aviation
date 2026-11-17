# Academia inmersiva — diseño (piloto: Fundamentos)

Fecha: 2026-11-16 · Aprobado el enfoque por Erik: «A con un toque de B».

## Qué y por qué

Erik quiere que **toda la academia** (14 módulos, ~139 temas, de Fundamentos a IFR) sea más
inmersiva e interactiva: imágenes lo más realistas posible, aviones bien hechos, animaciones, y
que la lección avance **haciendo scroll** en lugar de con botones.

Hoy cada tema es texto + una imagen fija, y avanza con «Siguiente lección». El embudo de
Fundamentos (2026-10-25, sin las cuentas de Erik) muestra dónde se pierde la gente leyendo:
21 abren tema1 → 17 llegan a las 4 fuerzas → 12 a Bernoulli/Newton → 11 a temas 5–8 → 3 terminan
el proyecto.

**Éxito:** más cadetes terminan las lecturas de Fundamentos que la base de arriba, sin que la
página se vuelva lenta en un celular.

## Metas, no-metas, anti-metas

- **Metas:** lecciones con scroll narrativo; visuales realistas sacados del simulador de Erik;
  animaciones que expliquen algo que el texto no puede; un avión 3D en el tema de ejes y superficies.
- **No-metas (por ahora):** los otros 13 módulos (van después, uno por uno, solo si Fundamentos
  mejora); el video de presentación por módulo (se hace aparte con Remotion); cambiar el
  contenido de los textos.
- **Anti-metas:** animación de adorno que no enseña; páginas pesadas que tardan en un celular;
  imágenes generadas por IA en contenido técnico (inventan detalles); perder el avance que los
  cadetes ya tienen.

## Enfoques considerados

| Enfoque | A favor | En contra | Decisión |
|---|---|---|---|
| **A. Capturas y clips de MSFS + dibujos animados encima** | Lo más realista; es el avión que el alumno vuela; ya hay fotos en `/flota` | Erik tiene que capturar las tomas | **Base** |
| **B. Avión 3D en la página** | Impresiona; el alumno lo gira | Necesita modelo con licencia; varios MB; lento en celulares baratos | **Solo en ejes y superficies** |
| C. Imágenes generadas por IA | Rápidas | Errores técnicos; peligroso para enseñar | Descartado para lo técnico |

## Cómo funciona

### Lección con scroll (reemplaza los botones de `LessonFlow`)

Dentro de cada misión, la tarjeta «Lo esencial» deja de ser un paso a paso con botones y se
vuelve un recorrido con scroll:

- **Escritorio:** a la izquierda el texto sube; a la derecha el visual se queda fijo (sticky) y
  cambia según el párrafo que está en pantalla.
- **Celular:** el visual queda fijo arriba (alrededor del 45 % de la pantalla) y el texto pasa
  por debajo.
- Cada tema se divide en **pasos** (un párrafo o un punto clave). Cada paso dice qué estado del
  visual mostrar.
- Un tema se marca completado cuando su último paso entra en pantalla, con el mismo id de
  actividad de siempre, así que el avance que ya tienen los cadetes se conserva.
- Las comprobaciones («Comprueba lo leído») quedan como **paradas**: el recorrido no deja
  marcar el siguiente tema hasta contestarla.
- El resto de la misión (gancho, video, interactivos, «En tu simulador», preguntas, «Siguiente
  misión») no cambia.

### Visuales (enfoque A)

- **Fotos:** capturas de Erik en MSFS, en `.webp` a 800 y 1600 px como en `/flota`.
- **Clips:** videos cortos en bucle sin sonido (`.mp4` H.264 + `.webm`, `muted loop playsInline`),
  de 3 a 6 s, a menos de 1.5 MB cada uno. No se usan GIF: pesan unas 10 veces más y se ven peor.
- **Dibujos encima:** SVG animado con framer-motion (ya instalado) sobre la foto o el clip:
  flechas de fuerzas, etiquetas que aparecen, resaltados. Se mueven según el avance del scroll.

### Avión 3D (toque de B) — reemplazado por la vuelta de 360° (ver lista de tomas)

- Solo en los temas 5 (superficies de control) y 6 (ejes de movimiento).
- El alumno lo gira con el dedo o el ratón. Al pasar cada paso del texto, se mueve la superficie
  que corresponde (alerón, elevador, timón) y aparece su eje.
- La librería 3D se carga solo en esos temas, para no hacer más pesado el resto del sitio.
- **Modelo:** Cessna 172 o 152 con licencia que permita uso comercial, con alerones, elevador y
  timón como piezas separadas que se puedan mover, y de menos de 3 MB.
- **Plan B si no aparece un modelo así:** una vuelta de 360° capturada en MSFS (secuencia de
  fotos) que el alumno gira arrastrando, más clips de cada superficie moviéndose. Se ve igual de
  real, pero no se puede girar a cualquier ángulo con la superficie en movimiento.

### Accesibilidad y rendimiento

- Con «reducir movimiento» activado en el sistema, todo se ve fijo y en orden: fotos en lugar de
  clips, sin animaciones, y el texto completo legible.
- Los clips y el 3D se cargan cuando el tema está por entrar en pantalla, no al abrir la página.
- Cada foto o clip lleva texto alternativo que describe lo que enseña.

## Lista de tomas para Fundamentos (la captura Erik en MSFS)

Actualizada 2026-11-16: el avión 3D se cambió por el plan B (vuelta de 360° en MSFS), elegido por
Erik por ser gratis y más realista. Exteriores en el C172 XB-VNA; cabina en el C152 XB-CDT, porque
el C172 tiene G1000 (sin six pack y con marca visible). Las fotos de partes salen de la vuelta de 360°.

| Archivo | Tema | Avión | Toma |
|---|---|---|---|
| `vuelo-lado.mp4` | 1 y 2 | C172 | En vuelo recto y nivelado, cámara fija de lado, cielo limpio, 10 s |
| `giro-360.mp4` | 4, 5 y 6 | C172 | En plataforma, motor apagado, controles al centro; vuelta completa a velocidad constante, cámara a la altura del ala, 20–30 s |
| `t3-ala.png` | 3 | C172 | En vuelo, el ala de cerca desde atrás de la cabina |
| `t3-rotacion.mp4` | 3 | C172 | Despegue visto de lado, del carreteo a la rotación, 10 s |
| `t5-alerones.mp4` | 5 | C172 | En tierra, de cerca: yoke a un lado y al otro, 2 veces |
| `t5-elevador.mp4` | 5 | C172 | En tierra, de cerca: yoke atrás y adelante, 2 veces |
| `t5-timon.mp4` | 5 | C172 | En tierra, de cerca: pedal izquierdo y derecho, 2 veces |
| `t5-flaps.mp4` | 5 | C172 | En tierra, de cerca: flaps de 0 a todo abajo y de regreso |
| `t6-alabeo.mp4` | 6 | C172 | En vuelo, cámara desde atrás: alabeo suave a un lado y al otro |
| `t6-cabeceo.mp4` | 6 | C172 | En vuelo, cámara de lado: nariz arriba y abajo, suave |
| `t6-guinada.mp4` | 6 | C172 | En vuelo, cámara desde arriba y atrás: pedal a un lado y al otro |
| `t7-yoke.mp4` | 7 | C152 | Cabina: yoke girando y luego jalando y empujando |
| `t7-pedales.mp4` | 7 | C152 | Cabina, vista a los pies: pedal izquierdo y derecho |
| `t7-potencia-mezcla.mp4` | 7 | C152 | Cabina, de cerca: acelerador y luego mezcla |
| `t8-panel.png` | 8 | C152 | Panel de frente, nítido, en vuelo recto y estable |
| `t8-panel-viraje.mp4` | 8 | C152 | El mismo encuadre, entrando en un viraje suave, 8 s |

## Medición

Volver a correr la consulta del embudo de Fundamentos (la misma de 2026-10-25) unas 3 semanas
después de publicar, y comparar los cadetes que llegan a cada tema y terminan las lecturas.

## Pendientes antes de publicar

- Revisar las reglas de uso de contenido del simulador de Microsoft para estas capturas
  (`/flota` ya las usa; la academia es contenido educativo del sitio).
- Elegir y, si cuesta, que Erik apruebe el modelo 3D.

## Decisiones de Claude (Erik puede corregirlas)

- El scroll reemplaza los botones solo en la lectura («Lo esencial»). La navegación entre las
  6 misiones sigue con su botón al final, para no perder el `?mision=N` ni el avance.
- `LessonFlow` sigue igual en los módulos que todavía no son inmersivos.
- Se construye primero con las imágenes que ya existen y se publica cuando estén las tomas de Erik.
- El 3D usa una librería nueva (three.js) cargada solo en esos dos temas.

## Lo que queda a criterio de quien lo construya

La división exacta de cada texto en pasos, las curvas y tiempos de animación, y el diseño de los
dibujos encima de cada visual, siempre que respeten la lista de tomas y las anti-metas.
