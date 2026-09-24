// La prueba de 20 segundos de la página /empieza: una pregunta del módulo de
// Navegación, con la respuesta simulada en el CDI. Va separada de la interfaz
// para poder probar que la aguja se comporta como el instrumento real.

export type Eleccion = "izquierda" | "derecha" | "obs";

export interface Opcion {
  clave: Eleccion;
  texto: string;
  correcta: boolean;
  titulo: string;
  explicacion: string;
}

/** Cada punto del CDI son 2° y la escala llega a 5 puntos por lado. */
export const PUNTOS_POR_LADO = 5;

/** La aguja arranca desviada dos puntos a la derecha. */
export const DESVIACION_INICIAL = 2;

export const SITUACION =
  "Vuelas hacia una estación VOR con el curso 360 seleccionado. La bandera marca TO y la aguja del CDI está desviada a la derecha.";

export const OPCIONES: Opcion[] = [
  {
    clave: "izquierda",
    texto: "Viro a la izquierda",
    correcta: false,
    titulo: "Casi, pero te alejas",
    explicacion:
      "La aguja indica de qué lado está el curso. Si viras en sentido contrario te alejas de él, y por eso la aguja se acerca al tope. Se vira hacia la aguja.",
  },
  {
    clave: "derecha",
    texto: "Viro a la derecha",
    correcta: true,
    titulo: "Correcto",
    explicacion:
      "La aguja te dice de qué lado está el curso: viras hacia ella y se centra. Ojo, esto vale mientras vuelas en el sentido del curso seleccionado; si vuelas al revés, la aguja se comporta al contrario (sensibilidad inversa). Eso lo trabajas en la lección.",
  },
  {
    clave: "obs",
    texto: "Giro el OBS hasta centrar la aguja",
    correcta: false,
    titulo: "Eso no te mueve de sitio",
    explicacion:
      "El OBS elige el curso, no cambia dónde vuelas. Girarlo puede centrar la aguja, pero sigues fuera del curso 360. La desviación se corrige con el rumbo, no con el OBS.",
  },
];

/** Puntos de desviación de la aguja después de la decisión del piloto. */
export function desviacionTras(eleccion: Eleccion | null): number {
  if (eleccion === null) return DESVIACION_INICIAL;
  if (eleccion === "derecha") return 0;
  if (eleccion === "izquierda") return PUNTOS_POR_LADO - 1;
  return DESVIACION_INICIAL; // el OBS no mueve al avión
}
