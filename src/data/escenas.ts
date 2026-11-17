// Escenas de la lectura con scroll: un visual por paso de cada tema (ver pasosDeTema en
// features/academia/lecturaScroll.ts). Un tema sin escena usa sus imágenes (visualesDeTema en features/academia/rise/motor.ts).
// Provisional: usan las imágenes que ya existen; se cambian por las tomas de Erik en MSFS
// (lista en docs/superpowers/specs/2026-11-16-academia-inmersiva-design.md).

/** [x, y] en porcentaje (0–100) del visual. */
export type Punto = [x: number, y: number];

export type Marca = { tipo: "flecha"; desde: Punto; hasta: Punto; texto?: string } | { tipo: "etiqueta"; en: Punto; texto: string };

export type Superficie = "alerones" | "elevador" | "timon" | "flaps";
export type Eje = "longitudinal" | "lateral" | "vertical";

export type Visual =
  | { tipo: "foto"; src: string; alt: string; marcas?: Marca[] }
  | { tipo: "clip"; mp4: string; webm: string; poster: string; alt: string; marcas?: Marca[] }
  | { tipo: "avion3d"; superficie: Superficie | null; eje: Eje | null; poster: string; alt: string };

const foto = (src: string, alt: string, marcas?: Marca[]): Visual => ({ tipo: "foto", src, alt, ...(marcas ? { marcas } : {}) });
const repetir = (n: number, v: Visual): Visual[] => Array.from({ length: n }, () => v);

// Las 4 fuerzas sobre el C172 XB-VNA de /flota (el avión mira a la izquierda).
const C172 = "/images/flota/c172-1600.webp";
const SUSTENTACION: Marca = { tipo: "flecha", desde: [50, 42], hasta: [50, 8], texto: "Sustentación" };
const PESO: Marca = { tipo: "flecha", desde: [50, 58], hasta: [50, 92], texto: "Peso" };
const EMPUJE: Marca = { tipo: "flecha", desde: [20, 40], hasta: [3, 40], texto: "Empuje" };
const RESISTENCIA: Marca = { tipo: "flecha", desde: [80, 60], hasta: [97, 60], texto: "Resistencia" };
const fuerzas = (marcas: Marca[], alt: string) => foto(C172, alt, marcas);

const TEMA7 = (n: string) => `/images/temas/fundamentos-tema7-${n}.jpg`;

export const ESCENAS: Record<string, Visual[]> = {
  "fundamentos-tema1": repetir(5, foto("/images/temas/fundamentos-tema1.jpg", "Avión de entrenamiento en vuelo, sostenido por sus alas")),
  "fundamentos-tema4": repetir(7, foto("/images/temas/fundamentos-tema4.jpg", "Partes de un avión: fuselaje, alas, empenaje, tren y motor")),
  "fundamentos-tema2": [
    fuerzas([], "Cessna 172 en vuelo recto y nivelado"),
    fuerzas([SUSTENTACION], "La sustentación empuja el avión hacia arriba desde las alas"),
    fuerzas([SUSTENTACION, PESO], "El peso tira hacia abajo, opuesto a la sustentación"),
    fuerzas([SUSTENTACION, PESO, EMPUJE], "El empuje del motor lleva el avión hacia adelante"),
    fuerzas([SUSTENTACION, PESO, EMPUJE, RESISTENCIA], "Las cuatro fuerzas: sustentación, peso, empuje y resistencia"),
    fuerzas([SUSTENTACION, PESO, EMPUJE, RESISTENCIA], "Las cuatro fuerzas en equilibrio en vuelo recto y nivelado"),
  ],
  "fundamentos-tema3": [
    foto("/images/fundamentos-pdb.png", "Principio de Bernoulli aplicado al perfil del ala"),
    foto("/images/fundamentos-pdb.png", "El aire más rápido sobre el ala tiene menor presión"),
    foto("/images/fundamentos-tldn.png", "Tercera ley de Newton: el ala desvía aire hacia abajo"),
    foto("/images/fundamentos-tldn.png", "Bernoulli y Newton describen la misma sustentación"),
    foto("/images/fundamentos-pdb.png", "Ángulo de ataque y velocidad controlan la sustentación"),
  ],
  "fundamentos-tema5": repetir(6, foto("/images/temas/fundamentos-tema5.jpg", "Superficies de control: alerones, elevador, timón y flaps")),
  "fundamentos-tema6": repetir(5, foto("/images/temas/fundamentos-tema6.jpg", "Los tres ejes del avión: longitudinal, lateral y vertical")),
  "fundamentos-tema7": [
    foto(TEMA7("1-yoke"), "Yoke del avión, el control de las manos"),
    foto(TEMA7("1-yoke"), "El yoke mueve el elevador y los alerones"),
    foto(TEMA7("3-pedales"), "Pedales del timón de dirección"),
    foto(TEMA7("4-throttle"), "Palanca de potencia (throttle)"),
    foto(TEMA7("6-mezcla"), "Control de mezcla (mixture)"),
    foto(TEMA7("7-palancas-juntas"), "Potencia, hélice y mezcla juntas en la consola"),
  ],
  "fundamentos-tema8": repetir(5, foto("/images/temas/six-pack.svg", "Los seis instrumentos básicos del panel")),
};
