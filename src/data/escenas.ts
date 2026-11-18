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

// Partes del avión, rotuladas a mano sobre la misma foto del C172 (revisión de Fundamentos, E7).
const et = (en: Punto, texto: string): Marca => ({ tipo: "etiqueta", en, texto });
const FUSELAJE = et([41, 53], "Fuselaje");
const ALAS = et([74, 16], "Alas");
const EMPENAJE = et([76, 40], "Empenaje (cola)");
const TREN = et([43, 76], "Tren de aterrizaje");
const MOTOR = et([19, 30], "Motor y hélice");
const partes = (marcas: Marca[], alt: string) => foto(C172, alt, marcas);

// Superficies de control sobre la vista superior; mismas posiciones que el diagrama interactivo (hotspots.ts).
const VISTA_SUPERIOR = "/images/cessna-topview.png";
const ALERON = et([17.8, 10.6], "Alerón");
const ELEVADOR = et([84.3, 32.2], "Elevador");
const TIMON = et([81.7, 10.3], "Timón de dirección");
const FLAPS = et([41.7, 32.2], "Flaps");
const superficies = (marcas: Marca[], alt: string) => foto(VISTA_SUPERIOR, alt, marcas);

// Clips de Remotion de Bernoulli y Newton: uno por paso, se reproducen una vez y quedan en su último cuadro.
const clipTema3 = (n: number, alt: string): Visual => {
  const base = `/videos/academia/fundamentos-tema3-${n}`;
  return { tipo: "clip", mp4: `${base}.mp4`, webm: `${base}.webm`, poster: `${base}.jpg`, alt };
};

export const ESCENAS: Record<string, Visual[]> = {
  "fundamentos-tema1": repetir(5, foto(C172, "Cessna 172 en vuelo, sostenido por la sustentación de sus alas")),
  "fundamentos-tema4": [
    partes([], "Cessna 172 en vuelo, visto de lado"),
    partes([FUSELAJE], "El fuselaje, la estructura central donde va la cabina"),
    partes([ALAS], "Las alas, que generan la sustentación"),
    partes([EMPENAJE], "El empenaje o cola, con sus estabilizadores y superficies móviles"),
    partes([TREN], "El tren de aterrizaje, que soporta el avión en tierra"),
    partes([MOTOR], "El motor y la hélice, que generan el empuje"),
    partes([FUSELAJE, ALAS, EMPENAJE, TREN, MOTOR], "Las cinco partes principales del avión rotuladas"),
  ],
  "fundamentos-tema2": [
    fuerzas([], "Cessna 172 en vuelo recto y nivelado"),
    fuerzas([SUSTENTACION], "La sustentación empuja el avión hacia arriba desde las alas"),
    fuerzas([SUSTENTACION, PESO], "El peso tira hacia abajo, opuesto a la sustentación"),
    fuerzas([SUSTENTACION, PESO, EMPUJE], "El empuje del motor lleva el avión hacia adelante"),
    fuerzas([SUSTENTACION, PESO, EMPUJE, RESISTENCIA], "Las cuatro fuerzas: sustentación, peso, empuje y resistencia"),
    fuerzas([SUSTENTACION, PESO, EMPUJE, RESISTENCIA], "Las cuatro fuerzas en equilibrio en vuelo recto y nivelado"),
  ],
  "fundamentos-tema3": [
    clipTema3(0, "Animación: la sustentación vista por Bernoulli y por Newton"),
    clipTema3(1, "Animación: el aire más rápido sobre el ala tiene menor presión"),
    clipTema3(2, "Animación: el ala desvía aire hacia abajo y el aire empuja el ala hacia arriba"),
    clipTema3(3, "Animación: Bernoulli y Newton describen la misma sustentación"),
    clipTema3(4, "Animación: el ángulo de ataque y la velocidad controlan la sustentación"),
  ],
  "fundamentos-tema5": [
    superficies([], "Cessna 172 visto desde arriba"),
    superficies([ALERON], "El alerón, en el borde de salida hacia la punta del ala"),
    superficies([ELEVADOR], "El elevador, en el borde de salida del estabilizador horizontal"),
    superficies([TIMON], "El timón de dirección, en el borde de salida del estabilizador vertical"),
    superficies([FLAPS], "Los flaps, en el borde de salida del ala cerca del fuselaje"),
    superficies([ALERON, ELEVADOR, TIMON, FLAPS], "Las superficies de control del Cessna 172 rotuladas"),
  ],
  "fundamentos-tema6": repetir(5, foto("/images/temas/fundamentos-tema6.jpg", "Los tres ejes del avión: longitudinal, lateral y vertical")),
  "fundamentos-tema7": [
    foto(TEMA7("1-yoke"), "Yoke del avión, el control de las manos"),
    foto(TEMA7("1-yoke"), "El yoke mueve el elevador y los alerones"),
    foto(TEMA7("3-pedales"), "Pedales del timón de dirección"),
    foto(TEMA7("4-throttle"), "Palanca de potencia (throttle)"),
    foto(TEMA7("6-mezcla-foto"), "Control de mezcla: hacia afuera empobrece y hasta el fondo corta el motor; adentro es rica", [
      et([24, 90], "Hacia afuera: pobre → corte"),
      et([75, 90], "Adentro: rica"),
    ]),
    foto(TEMA7("7-palancas-foto"), "Acelerador, hélice y mezcla en la consola de un avión con hélice de paso variable"),
  ],
  "fundamentos-tema8": repetir(5, foto("/images/temas/six-pack.svg", "Los seis instrumentos básicos del panel")),
};
