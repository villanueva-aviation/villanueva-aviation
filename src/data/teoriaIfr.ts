import type { Situacion } from "../features/entrenador/esperas.ts";
import type { Idioma } from "../features/instructor/idiomaInstructor.ts";

// La teoría del programa IFR, la misma que el instructor resume por voz. Erik la revisa antes de publicar.

export type TemaIfr = "interceptacion" | "rutas" | "arcos" | "esperas";
type Texto = Record<Idioma, string>;
export interface SeccionTeoria {
  titulo: Texto;
  texto: Texto;
  /** El HSI de la sección: `desviacion` en puntos de la barra (+ = a la derecha). */
  hsi?: { rumbo: number; curso: number; desviacion: number };
  /** La espera de la sección, dibujada con su entrada (rumbo de llegada al fijo). */
  espera?: Situacion;
}

export const TEORIA_IFR: Record<TemaIfr, { titulo: Texto; secciones: SeccionTeoria[] }> = {
  interceptacion: {
    titulo: { es: "Interceptación de radiales", en: "Radial interception" },
    secciones: [
      {
        titulo: { es: "Qué es un radial", en: "What a radial is" },
        texto: {
          es: "Un VOR emite 360 radiales, uno por cada grado magnético, que salen de la estación como los rayos de una rueda. El radial 090 sale del VOR hacia el este. El radial dice dónde estás respecto a la estación, no hacia dónde apunta la nariz.",
          en: "A VOR sends out 360 radials, one per magnetic degree, leaving the station like the spokes of a wheel. The 090 radial leaves the VOR toward the east. The radial tells you where you are from the station, not where the nose is pointing.",
        },
        hsi: { rumbo: 90, curso: 90, desviacion: 0 },
      },
      {
        titulo: { es: "TO y FROM", en: "TO and FROM" },
        texto: {
          es: "En el OBS pones un curso. Si ese curso te aleja del VOR, la bandera dice FROM y el curso es el mismo radial: alejándote por el radial 090, curso 090. Si te acerca, dice TO y el curso es el radial más 180: acercándote por el radial 090, curso 270.",
          en: "You set a course on the OBS. If that course takes you away from the VOR, the flag reads FROM and the course is the radial itself: outbound on the 090 radial, course 090. If it takes you toward the VOR, it reads TO and the course is the radial plus 180: inbound on the 090 radial, course 270.",
        },
        hsi: { rumbo: 270, curso: 270, desviacion: 0 },
      },
      {
        titulo: { es: "Leer la barra", en: "Reading the needle" },
        texto: {
          es: "Cada punto de la barra son 2 grados; la barra en el tope son 10 grados o más. Volando más o menos hacia el curso, si la barra está a la derecha, el curso está a tu derecha: vira hacia la barra.",
          en: "Each dot on the needle is 2 degrees; a needle pegged to the side is 10 degrees or more. Flying roughly along the course, if the needle is to the right, the course is to your right: turn toward the needle.",
        },
        hsi: { rumbo: 90, curso: 90, desviacion: 1.5 },
      },
      {
        titulo: { es: "Normal o ruta pasada: la regla de los 90°", en: "Normal intercept or passed route: the 90° rule" },
        texto: {
          es: "Antes de virar, compara el radial donde vas con el radial que te piden. Si están a 90° o menos, es una interceptación normal: el radial está adelante de ti. Si están a más de 90°, es una ruta pasada: el radial quedó atrás. Ejemplo: despegas y vas por el radial 290; del 200 al 020 es normal, pero el 150 está a 140°, atrás de ti: es ruta pasada (lección 2).",
          en: "Before turning, compare the radial you are on with the radial you are given. If they are 90° apart or less, it is a normal intercept: the radial is ahead of you. If they are more than 90° apart, it is a passed route: the radial is behind you. Example: you take off and you are on the 290 radial; from the 200 to the 020 it is normal, but the 150 is 140° away, behind you: that is a passed route (lesson 2).",
        },
      },
      {
        titulo: { es: "Acercándote: DC30", en: "Inbound: DC30" },
        texto: {
          es: "Para acercarte por un radial: Deseada, Cabeza y me paso 30°. Pon la mariposa en el rumbo deseado (el radial más 180). Mira la cabeza de la flecha del HSI: de la deseada ve hacia la cabeza y pásate 30° más; ese es tu rumbo de interceptación. Ejemplo: deseada 090, cabeza 060: vira al 030. Pon el CRS en 090 y, con el CDI vivo, vira hacia la estación, al 090.",
          en: "To fly inbound on a radial: Desired, Head, then 30° past. Set the heading bug on the desired heading (the radial plus 180). Look at the head of the HSI arrow: go from the desired heading toward the head and 30° past it; that is your intercept heading. Example: desired 090, head 060: turn to 030. Set the CRS on 090 and, when the CDI comes alive, turn toward the station, to 090.",
        },
        hsi: { rumbo: 30, curso: 90, desviacion: -5 },
      },
      {
        titulo: { es: "Alejándote: CD45", en: "Outbound: CD45" },
        texto: {
          es: "Para alejarte por un radial: Cola, Deseada y me paso 45°. Alejándote, el radial y el rumbo coinciden: pon la mariposa en el radial. Mira la cola de la flecha: de la cola ve hacia la deseada y pásate 45° más. Ejemplo: cola 060, deseada 090: vira al 135. Pon el CRS en 090 y, con el CDI vivo, vira al lado contrario de la estación, al 090.",
          en: "To fly outbound on a radial: Tail, Desired, then 45° past. Outbound, the radial and the heading match: set the heading bug on the radial. Look at the tail of the arrow: go from the tail toward the desired heading and 45° past it. Example: tail 060, desired 090: turn to 135. Set the CRS on 090 and, when the CDI comes alive, turn away from the station, to 090.",
        },
        hsi: { rumbo: 135, curso: 90, desviacion: 5 },
      },
      {
        titulo: { es: "Cerca y lejos de la estación", en: "Close to and far from the station" },
        texto: {
          es: "Cerca del VOR los radiales están juntos: la barra se mueve rápido y hay que interceptar pronto. Lejos están separados: la barra tarda en moverse; ten paciencia y no aumentes el ángulo antes de tiempo.",
          en: "Close to the VOR the radials are close together: the needle moves fast and you need to intercept early. Far out they are spread apart: the needle takes its time; be patient and don't increase the angle too soon.",
        },
      },
      {
        titulo: { es: "La lección: un vuelo de 4 tramos", en: "The lesson: a 4-leg flight" },
        texto: {
          es: "La lección es un solo vuelo. En tierra, al cerrar «Antes del despegue», el instructor te da el primer tramo: «Después del despegue, aléjate por el radial 310 de GDL». Tú dices en voz alta si es normal o ruta pasada; después sale la guía del HSI con los números. Alejándote, el tramo termina a las 8 millas; acercándote, al pasar el VOR. Luego viene el siguiente, alternando alejamiento y acercamiento. En el examen son 2 tramos y no hay guía.",
          en: "The lesson is one flight. On the ground, when you close the Before takeoff checklist, the instructor gives you the first leg: \"After takeoff, proceed outbound on the 310 radial of GDL.\" Say out loud whether it is a normal intercept or a passed route; then the HSI guide shows up with the numbers. Outbound, the leg ends at 8 miles; inbound, when you pass the VOR. Then comes the next one, alternating outbound and inbound. The checkride has 2 legs and no guide.",
        },
      },
    ],
  },
  rutas: {
    titulo: { es: "Rutas pasadas", en: "Passed routes" },
    secciones: [
      {
        titulo: { es: "Cuándo es ruta pasada", en: "When it is a passed route" },
        texto: {
          es: "Una ruta pasada es un radial que quedó atrás: está a más de 90° del radial donde vas. Interceptarlo directo sería un viraje de más de 90° hacia la estación. En vez de eso se usa una de dos reglas: alejándote, la regla de los 45°; acercándote, la regla de 1 minuto. El ejemplo de las dos: vas por el radial 290 y te piden el 150.",
          en: "A passed route is a radial that is behind you: more than 90° from the radial you are on. Intercepting it directly would mean a turn of more than 90° toward the station. Instead you use one of two rules: outbound, the 45° rule; inbound, the 1-minute rule. The example for both: you are on the 290 radial and you are given the 150.",
        },
      },
      {
        titulo: { es: "Alejándote: la regla de los 45°", en: "Outbound: the 45° rule" },
        texto: {
          es: "1. Mariposa y CRS al 150 (radial y rumbo coinciden). 2. Vira al 150. 3. Al través de la estación (cambia la flechita), mariposa a 45° del lado de la estación: 105. 4. Vira al 105. 5. Con el CDI vivo, vira al lado contrario de la estación, al 150.",
          en: "1. Heading bug and CRS on 150 (radial and heading match). 2. Turn to 150. 3. Abeam the station (the flag flips), heading bug 45° toward the station: 105. 4. Turn to 105. 5. When the CDI comes alive, turn away from the station, to 150.",
        },
        hsi: { rumbo: 105, curso: 150, desviacion: -4 },
      },
      {
        titulo: { es: "Acercándote: la regla de 1 minuto", en: "Inbound: the 1-minute rule" },
        texto: {
          es: "1. Mariposa al 150 (radial solicitado). 2. CRS al 330 (rumbo contrario). 3. Vira al 150. 4. Al través (cambia la flechita), cronómetro 1 minuto. 5. Pasado el minuto, vira 90° hacia el lado del CDI: 060. 6. Con el CDI vivo, vira hacia la estación, al 330.",
          en: "1. Heading bug on 150 (requested radial). 2. CRS on 330 (opposite heading). 3. Turn to 150. 4. Abeam (the flag flips), start a 1-minute timer. 5. After the minute, turn 90° toward the CDI side: 060. 6. When the CDI comes alive, turn toward the station, to 330.",
        },
        hsi: { rumbo: 60, curso: 330, desviacion: 5 },
      },
      {
        titulo: { es: "En la lección y en el examen", en: "In the lesson and the checkride" },
        texto: {
          es: "En la práctica de la lección 2 todos los tramos son rutas pasadas. Alejándote, el tramo termina a las 8 millas; acercándote, al pasar el VOR, y a las 3 millas de la estación te dan el siguiente. En el examen son 2 tramos: uno normal y una ruta pasada, sin decirte cuál. Por eso la regla de los 90° va primero: identifica y luego vuela la regla que toca.",
          en: "In lesson 2 practice every leg is a passed route. Outbound, the leg ends at 8 miles; inbound, when you pass the VOR, and 3 miles past the station you get the next one. The checkride has 2 legs: one normal intercept and one passed route, without telling you which. That is why the 90° rule comes first: identify, then fly the rule that fits.",
        },
      },
      {
        titulo: { es: "Corregir el viento", en: "Correcting for the wind" },
        texto: {
          es: "Si la barra se va hacia un lado con la nariz en el curso, el viento te está empujando. Vira unos 10 grados hacia la barra para regresar, y luego quédate con la mitad: si el viento viene del oeste, curso 180 con rumbo 185 o 190 puede mantenerla centrada.",
          en: "If the needle drifts to one side with the nose on the course, the wind is pushing you. Turn about 10 degrees toward the needle to get back, then keep half of that: with wind from the west, course 180 with heading 185 or 190 may keep it centered.",
        },
        hsi: { rumbo: 190, curso: 180, desviacion: 0 },
      },
    ],
  },
  arcos: {
    titulo: { es: "Arcos DME", en: "DME arcs" },
    secciones: [
      {
        titulo: { es: "Qué es un arco", en: "What an arc is" },
        texto: {
          es: "Un arco DME es un círculo alrededor del VOR a una distancia fija, por ejemplo 10 millas. Lo vuelas manteniendo el DME en esa distancia mientras cruzas los radiales, uno tras otro, hasta llegar al radial que te pidieron.",
          en: "A DME arc is a circle around the VOR at a fixed distance, for example 10 miles. You fly it by keeping the DME at that distance while you cross the radials, one after another, until you reach the radial you were given.",
        },
      },
      {
        titulo: { es: "Empezar a virar antes", en: "Start the turn early" },
        texto: {
          es: "Si vuelas un radial hacia el arco, empieza a virar como medio millas antes de llegar: a 100 nudos un viraje de 90 grados de tasa estándar recorre más o menos esa distancia. Si viras justo en la distancia del arco, te pasas.",
          en: "If you fly a radial toward the arc, start your turn about half a mile before reaching it: at 100 knots a 90 degree standard-rate turn covers about that distance. If you turn right at the arc distance, you overshoot.",
        },
      },
      {
        titulo: { es: "Los 10 grados hacia la estación", en: "Ten degrees toward the station" },
        texto: {
          es: "En el arco, la estación te queda a un lado, a 90 grados de la nariz. Vuela recto un momento: la distancia crece poco a poco. Cuando crezca, vira unos 10 grados hacia la estación; si baja, abre 10 grados. Así el arco se vuela en tramos rectos cortos.",
          en: "On the arc, the station is off to one side, 90 degrees from the nose. Fly straight for a moment: the distance slowly grows. When it grows, turn about 10 degrees toward the station; if it shrinks, open up 10 degrees. That way you fly the arc as a series of short straight legs.",
        },
      },
      {
        titulo: { es: "El radial de salida", en: "The exit radial" },
        texto: {
          es: "Antes de llegar al radial final, pon en el OBS su curso de acercamiento (el radial más 180) y mira la barra: empieza en el tope. Cuando empiece a moverse hacia el centro, vira al curso sin pasarte, como en una interceptación.",
          en: "Before you reach the final radial, set its inbound course (the radial plus 180) on the OBS and watch the needle: it starts pegged. When it starts moving toward center, turn onto the course without overshooting, like an interception.",
        },
        hsi: { rumbo: 230, curso: 330, desviacion: -5 },
      },
      {
        titulo: { es: "Paso a paso", en: "Step by step" },
        texto: {
          es: "1. Sintoniza un VOR con DME e identifícalo. 2. Vuela el radial hacia el arco y empieza a virar medio millas antes. 3. En el arco, corrige con 10 grados hacia la estación o hacia afuera según el DME. 4. Cerca del radial final, pon su curso de acercamiento en el OBS. 5. Vira al curso cuando la barra se mueva y acércate centrado.",
          en: "1. Tune and identify a VOR with DME. 2. Fly the radial toward the arc and start turning half a mile early. 3. On the arc, correct 10 degrees toward the station or away from it based on the DME. 4. Near the final radial, set its inbound course on the OBS. 5. Turn onto the course when the needle moves and fly inbound centered.",
        },
      },
    ],
  },
  esperas: {
    titulo: { es: "Patrones de espera", en: "Holding patterns" },
    secciones: [
      {
        titulo: { es: "Las partes de la espera", en: "The parts of a hold" },
        texto: {
          es: "La espera es un circuito en forma de pista de carreras sobre un fijo, aquí el VOR. Tiene el fijo, el curso de acercamiento que llega a él, un viraje de 180 grados, el tramo de alejamiento de un minuto y otro viraje de 180 grados que te regresa al acercamiento.",
          en: "A hold is a racetrack-shaped pattern over a fix, here the VOR. It has the fix, the inbound course that leads to it, a 180 degree turn, the one-minute outbound leg and another 180 degree turn that brings you back to the inbound course.",
        },
      },
      {
        titulo: { es: "Virajes a la derecha y a la izquierda", en: "Right and left turns" },
        texto: {
          es: "La espera estándar vira a la derecha; si vira a la izquierda, la instrucción lo dice. Los virajes son de tasa estándar, 3 grados por segundo, y el minuto de alejamiento se cuenta desde que nivelas las alas. Si el acercamiento dura más de un minuto, acorta el alejamiento; si dura menos, alárgalo.",
          en: "A standard hold turns right; if it turns left, the instruction says so. Turns are standard rate, 3 degrees per second, and the outbound minute starts when you roll wings level. If the inbound leg takes more than a minute, shorten the outbound leg; if it takes less, make it longer.",
        },
      },
      {
        titulo: { es: "La entrada directa", en: "The direct entry" },
        texto: {
          es: "Compara tu rumbo al llegar al fijo con el curso de alejamiento. Si llegas más o menos de frente al patrón, vuela al fijo y vira en el sentido de la espera para seguir el circuito. Es la entrada más común.",
          en: "Compare your heading when you reach the fix with the outbound course. If you arrive roughly facing the pattern, fly to the fix and turn in the direction of the hold to join it. It is the most common entry.",
        },
        espera: { alejamiento: 90, giros: "derecha", rumbo: 270 },
      },
      {
        titulo: { es: "La entrada paralela", en: "The parallel entry" },
        texto: {
          es: "Si llegas desde el lado contrario al de la espera, en el fijo toma el rumbo de alejamiento, paralelo al patrón y del lado de afuera, durante un minuto. Luego vira hacia el lado de la espera más de 180 grados para interceptar el acercamiento y regresar al fijo.",
          en: "If you arrive from the non-holding side, at the fix take the outbound heading, parallel to the pattern on the outside, for one minute. Then turn toward the holding side more than 180 degrees to intercept the inbound course and fly back to the fix.",
        },
        espera: { alejamiento: 90, giros: "derecha", rumbo: 150 },
      },
      {
        titulo: { es: "La entrada en gota", en: "The teardrop entry" },
        texto: {
          es: "Si llegas desde el lado de la espera, casi por el curso de alejamiento, en el fijo toma un rumbo 30 grados hacia el lado de la espera desde el alejamiento, durante un minuto. Luego vira en el sentido de la espera para interceptar el acercamiento.",
          en: "If you arrive from the holding side, nearly along the outbound course, at the fix take a heading 30 degrees off the outbound course toward the holding side, for one minute. Then turn in the direction of the hold to intercept the inbound course.",
        },
        espera: { alejamiento: 90, giros: "derecha", rumbo: 60 },
      },
      {
        titulo: { es: "Paso a paso", en: "Step by step" },
        texto: {
          es: "1. Con la instrucción, dibuja la espera: el curso de acercamiento, el sentido de los virajes y el lado de la espera. 2. Antes del fijo, compara tu rumbo con el curso de alejamiento y decide la entrada. 3. En el fijo, vuela la entrada. 4. En cada vuelta: viraje de tasa estándar, un minuto de alejamiento, viraje y acercamiento centrado hasta el fijo.",
          en: "1. From the instruction, picture the hold: the inbound course, the direction of the turns and the holding side. 2. Before the fix, compare your heading with the outbound course and pick the entry. 3. At the fix, fly the entry. 4. On each lap: a standard-rate turn, one minute outbound, a turn and a centered inbound course to the fix.",
        },
      },
    ],
  },
};
