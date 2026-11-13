# IFR lecciones 1 y 2: un vuelo encadenado — diseño

Fecha: 2026-11-13. Decisiones de Erik (fundador) salvo lo marcado **(mi decisión)**. Cambia la parte de lecciones 1 y 2 de `2026-11-11-instructor-ifr-design.md`; lo demás de esa spec sigue igual.

## Para qué

Hoy la lección 1 son 5 interceptaciones sueltas que se arman en el aire y terminan a los 30 s de estar establecido. Erik quiere que se parezca a una clase real con instructor o torre: **una instrucción exacta, el cadete decide cómo hacerla, y la siguiente instrucción llega cuando termina la anterior**, todo en un solo vuelo desde el despegue.

Lo que aprende el cadete, y lo que más importa: **identificar solo** si la instrucción es una interceptación normal o una ruta pasada, y aplicar la técnica de Álvaro que le toca (las 4 tarjetas de `/resumen-hsi`):

| | Normal (radial pedido a menos de 90° del suyo) | Ruta pasada (a más de 90°: queda atrás) |
|---|---|---|
| **Alejamiento** | CD45 | Regla de 45° |
| **Acercamiento** | DC30 | Regla de 1 minuto |

Ejemplo de Erik: alejándose por el radial 290, los radiales 200 a 020 son normales; el 150 queda atrás y es ruta pasada.

## Qué sí

### Las dos lecciones

- **Lección 1 · Interceptaciones normales:** tramos normales, de alejamiento y de acercamiento.
- **Lección 2 · Rutas pasadas** (reemplaza a «Rutas de acercamiento y alejamiento»; Erik): tramos de ruta pasada, de alejamiento y de acercamiento.
- Las lecciones 3 (arcos) y 4 (esperas) no cambian ni de número ni de contenido.

### El vuelo (Erik)

1. **En tierra**, al cerrar «Antes del despegue», el instructor dice la primera instrucción: «Después del despegue, aléjate por el radial 310 de GDL». Como hoy en la lección 4 con la ruta.
2. **Tramo 1, alejamiento:** termina y se califica **a las 8 NM** del VOR.
3. A las 8 NM, la siguiente instrucción: **tramo 2, acercamiento**. Termina y se califica **al pasar el VOR** **(mi decisión: Erik solo dijo «pasa el VOR»)**.
4. Al pasar el VOR: **tramo 3, alejamiento**, hasta las 8 NM. En la lección 2 esta instrucción llega **a las 3 NM del otro lado del VOR** (Erik, 2026-11-13): encima de la estación no hay espacio para el «al través» de la regla de 45°. En la lección 1 llega al pasar el VOR.
5. A las 8 NM: **tramo 4, acercamiento**, hasta pasar el VOR. Ahí termina la parte de navegación y sigue el regreso de rampa a rampa como hoy.

Práctica: 4 tramos. Examen: 2 tramos (alejamiento desde el despegue y acercamiento), sin consejos ni guía del HSI.

### La instrucción y la pregunta por voz (Erik)

- La instrucción dice solo **alejarse o acercarse y el radial**: «Aléjate por el radial 150», «Acércate por el radial 040». **Nunca dice si es normal o ruta pasada.**
- Justo después, el instructor pregunta «¿Interceptación normal o ruta pasada?» y el cadete contesta por micrófono, como la entrada de la lección 4. Hay botones si el navegador no reconoce voz.
- Se califica: es un elemento más del tramo. Si se equivoca, el instructor lo corrige con la razón («Es ruta pasada: el 150 queda a 140° de tu radial»).
- **La guía «Paso a paso en el HSI» aparece hasta que contesta** (o lo corrigen), con la tarjeta de Álvaro que toca y sus números. Antes de contestar, la pantalla solo muestra la instrucción.

### Para que identificar cuente (mi decisión)

En la lección 1 la respuesta siempre es «normal» y en la 2 siempre «ruta pasada», así que en práctica se acierta sin pensar. Se sigue preguntando en práctica para hacer el hábito, pero **el examen de la lección 2 mezcla un tramo normal y uno de ruta pasada** (cuál es cuál, al azar). El examen de la lección 1 sigue con normales.

### Cómo se eligen los radiales (mi decisión)

- **Referencia:** el radial donde está el avión cuando se da la instrucción. En el primer tramo, si el avión está a menos de 2 NM del VOR (VOR en el aeropuerto, como GDL en MMGL), la referencia es el **rumbo de pista**: así el radial queda «enfrente del avión», como pidió Erik.
- **Normal:** entre 20° y 60° de la referencia, a un lado u otro al azar, redondeado a la decena.
- **Ruta pasada:** entre 120° y 160° de la referencia, redondeado a la decena.
- Ninguno a menos de 10° de la frontera de 90°, para que no haya duda al identificar.

### Calificación de cada tramo

- **Identificación** (nuevo): lo que dijo contra lo que es.
- **Interceptación:** las medidas que ya existen (quedar en el radial, pasarse, quedarse corto, ángulo como observación), pero el tramo ya no termina a los 30 s de establecido: **sigue hasta las 8 NM o hasta pasar el VOR**.
- **No llegar al radial** antes de las 8 NM o antes de pasar el VOR: error de interceptación.
- En las rutas pasadas, el ángulo y el «quedarse corto» se miden desde que termina la maniobra de reposicionamiento (después del viraje de 45° o del viraje de 90° tras el minuto), no desde la instrucción **(mi decisión: antes de eso el avión va lejos del curso a propósito)**.

### Distancia sin DME (mi decisión)

La lección 1 no pide DME. Si el VOR no tiene, las 8 NM se calculan con la posición del avión y la del VOR (el lector ya da las dos). Así funciona con cualquier VOR.

## Qué no

- No se cambia la lección 4 ni la 3.
- No se agrega lección nueva ni se renumeran las URL: `ifr-1` e `ifr-2` siguen siendo las claves.
- No se dice nunca «normal» o «ruta pasada» en la instrucción.

## Lo que no debe pasar

- Que la guía del HSI o cualquier texto en pantalla delate el tipo antes de que el cadete conteste.
- Que la instrucción salga a menos de 10° de la frontera de 90°.
- Que el siguiente tramo se anuncie antes de que el anterior se califique.
- Que se pierdan los intentos viejos de la lección 2 (`ruta-vor`) guardados en la base: si hay algo que los muestra, debe seguir mostrándolos o ignorarlos sin romperse.

## Lo que se va

La lección 2 vieja (`ruta-vor`): `evaluadorRuta.ts`, `textosRuta.ts`, `HojaRuta.tsx`, `pasosRuta`, sus pruebas y su teoría. Su contenido (pasar el VOR y salir por otro radial) ya queda dentro de los tramos 2 y 3.

## Lo que hay que rehacer junto

- Teoría por voz y página de teoría de las lecciones 1 y 2 (`TeoriaIfr.tsx`), con las tarjetas de Álvaro.
- Hojas imprimibles: `HojaInterceptacion.tsx` y una nueva para rutas pasadas en lugar de `HojaRuta.tsx`.
- Debriefing y mapa: cada tramo con su nombre, como ya se hizo con las esperas («Interceptación · acercamiento», «Ruta pasada · alejamiento»).
- `lineaEjercicios` del briefing.

## Pendiente para quien lo construye

- Las palabras que acepta el micrófono, en español y en inglés **(mi decisión: «normal»; «ruta pasada», «pasada», «pasado»; en inglés «normal» y «passed», «behind»)**.
- Cómo marcar en la guía del HSI los pasos de la regla de 1 minuto (el cronómetro y el «al través» cuando cambia TO/FROM).
- Revisar que el examen de la lección 1 siga siendo de 2 tramos con el formato encadenado.
