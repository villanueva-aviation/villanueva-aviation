import type { Idioma } from "../features/instructor/idiomaInstructor.ts";

// La teoría del programa IFR, la misma que el instructor resume por voz. Erik la revisa antes de publicar.

export type TemaIfr = "interceptacion";
type Texto = Record<Idioma, string>;
export interface SeccionTeoria {
  titulo: Texto;
  texto: Texto;
  /** El HSI de la sección: `desviacion` en puntos de la barra (+ = a la derecha). */
  hsi?: { rumbo: number; curso: number; desviacion: number };
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
        titulo: { es: "Interceptar con 30 grados", en: "Intercepting at 30 degrees" },
        texto: {
          es: "Pon el curso en el OBS y vira para cortarlo con 30 grados: con curso 090 y la barra a la derecha, rumbo 120. Cuando la barra empiece a moverse hacia el centro, empieza a virar al curso para quedar centrado sin pasarte.",
          en: "Set the course on the OBS and turn to cut it at 30 degrees: with course 090 and the needle to the right, heading 120. When the needle starts moving toward center, start your turn onto the course so you end up centered without overshooting.",
        },
        hsi: { rumbo: 120, curso: 90, desviacion: 2 },
      },
      {
        titulo: { es: "Cerca y lejos de la estación", en: "Close to and far from the station" },
        texto: {
          es: "Cerca del VOR los radiales están juntos: la barra se mueve rápido y hay que interceptar pronto. Lejos están separados: la barra tarda en moverse; ten paciencia y no aumentes el ángulo antes de tiempo.",
          en: "Close to the VOR the radials are close together: the needle moves fast and you need to intercept early. Far out they are spread apart: the needle takes its time; be patient and don't increase the angle too soon.",
        },
      },
      {
        titulo: { es: "Paso a paso", en: "Step by step" },
        texto: {
          es: "1. Sintoniza e identifica el VOR en NAV1, con la barra en NAV y no en GPS. 2. Pon el curso en el OBS y revisa TO o FROM. 3. Mira de qué lado está la barra y vira hacia ella con 30 grados respecto al curso. 4. Mantén ese rumbo hasta que la barra se mueva. 5. Vira al curso y corrige poco a poco para mantenerla centrada.",
          en: "1. Tune and identify the VOR on NAV1, with the needle on NAV, not GPS. 2. Set the course on the OBS and check TO or FROM. 3. See which side the needle is on and turn toward it, 30 degrees off the course. 4. Hold that heading until the needle moves. 5. Turn onto the course and make small corrections to keep it centered.",
        },
      },
    ],
  },
};
