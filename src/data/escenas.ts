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

// Los 3 ejes, como flechas que salen del centro de gravedad hacia los dos lados (el eje no tiene sentido).
// Vista superior: nariz abajo a la izquierda, cola arriba a la derecha; se cruzan en la raíz del ala, cerca de [49, 48].
const CG: Punto = [49, 48];
const eje = (a: Punto, b: Punto): Marca[] => [
  { tipo: "flecha", desde: CG, hasta: a },
  { tipo: "flecha", desde: CG, hasta: b },
];
const LONGITUDINAL = [...eje([11, 76], [86, 21]), et([14, 88], "Eje longitudinal")];
const LATERAL = [...eje([8, 9], [92, 86]), et([24, 4], "Eje lateral")];
const VERTICAL_CG = et(CG, "Eje vertical");
// Vista de lado (foto de las fuerzas): perpendicular al fuselaje, que en la foto baja hacia la cola.
const CG_LADO: Punto = [46, 45];
const VERTICAL: Marca[] = [
  { tipo: "flecha", desde: CG_LADO, hasta: [50, 6] },
  { tipo: "flecha", desde: CG_LADO, hasta: [41, 92] },
  et([34, 8], "Eje vertical"),
];

// Clips de Remotion (Bernoulli y Newton, six pack): uno por paso, se reproducen una vez y quedan en su último cuadro.
const clip = (tema: string, n: number, alt: string): Visual => {
  const base = `/videos/academia/${tema}-${n}`;
  return { tipo: "clip", mp4: `${base}.mp4`, webm: `${base}.webm`, poster: `${base}.jpg`, alt };
};

/** Un clip por paso del tema, en orden (paso 0 = la idea clave). */
const clips = (tema: string, alts: string[]): Visual[] => alts.map((alt, n) => clip(tema, n, `Animación: ${alt}`));

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
    clip("fundamentos-tema3", 0, "Animación: la sustentación vista por Bernoulli y por Newton"),
    clip("fundamentos-tema3", 1, "Animación: el aire más rápido sobre el ala tiene menor presión"),
    clip("fundamentos-tema3", 2, "Animación: el ala desvía aire hacia abajo y el aire empuja el ala hacia arriba"),
    clip("fundamentos-tema3", 3, "Animación: Bernoulli y Newton describen la misma sustentación"),
    clip("fundamentos-tema3", 4, "Animación: el ángulo de ataque y la velocidad controlan la sustentación"),
  ],
  "fundamentos-tema5": [
    superficies([], "Cessna 172 visto desde arriba"),
    superficies([ALERON], "El alerón, en el borde de salida hacia la punta del ala"),
    superficies([ELEVADOR], "El elevador, en el borde de salida del estabilizador horizontal"),
    superficies([TIMON], "El timón de dirección, en el borde de salida del estabilizador vertical"),
    superficies([FLAPS], "Los flaps, en el borde de salida del ala cerca del fuselaje"),
    superficies([ALERON, ELEVADOR, TIMON, FLAPS], "Las superficies de control del Cessna 172 rotuladas"),
  ],
  "fundamentos-tema6": [
    superficies([...LONGITUDINAL, ...LATERAL, VERTICAL_CG], "Los tres ejes del avión se cruzan en su centro de gravedad"),
    superficies(LONGITUDINAL, "El eje longitudinal va de la nariz a la cola; el alabeo es el giro alrededor de él"),
    superficies(LATERAL, "El eje lateral va de punta a punta de ala; el cabeceo es el giro alrededor de él"),
    foto(C172, "El eje vertical atraviesa el avión de arriba abajo; la guiñada es el giro alrededor de él", VERTICAL),
    superficies([...LONGITUDINAL, ...LATERAL, VERTICAL_CG], "Los tres ejes rotulados sobre el Cessna 172"),
  ],
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
  "fundamentos-tema8": [
    clip("fundamentos-tema8", 0, "Animación: los seis instrumentos básicos del panel, en dos filas de tres"),
    clip("fundamentos-tema8", 1, "Animación: fila superior: velocidad, horizonte artificial y altímetro"),
    clip("fundamentos-tema8", 2, "Animación: fila inferior: coordinador de viraje, rumbo y variómetro"),
    clip("fundamentos-tema8", 3, "Animación: el scan recorre los instrumentos y siempre regresa al horizonte artificial"),
    clip("fundamentos-tema8", 4, "Animación: sin mirar afuera, los instrumentos muestran que el avión sube y vira a la derecha"),
  ],

  // ---------- Aerodinámica (clips de Remotion, revisados en docs/academia-rise/revision-aerodinamica.md) ----------
  "aerodinamica-tema1": clips("aerodinamica-tema1", [
    "la flecha de sustentación del ala crece y se achica: la ajustas en tiempo real",
    "al subir el ángulo de ataque crece la sustentación, hasta el punto crítico",
    "al doble de velocidad, la sustentación crece cuatro veces",
    "con aire menos denso, el ala genera menos sustentación",
    "el perfil y la superficie del ala, que vienen dados por tu avión",
    "el yoke cambia el ángulo de ataque; la potencia y la actitud, la velocidad",
  ]),
  "aerodinamica-tema2": clips("aerodinamica-tema2", [
    "el flujo se separa del ala: la pérdida es el ángulo, no la velocidad",
    "el ángulo de ataque se mide entre la cuerda y el viento relativo, no contra el horizonte",
    "la curva de sustentación sube hasta el ángulo crítico, entre 16 y 20 grados, y se desploma",
    "lento, rápido, pesado o ligero: la pérdida llega al mismo ángulo",
    "a 90 nudos y con el morro abajo, un tirón brusco lleva el ala al ángulo crítico",
  ]),
  "aerodinamica-tema3": clips("aerodinamica-tema3", [
    "la resistencia inducida y la parásita se suman en una curva en U",
    "los vórtices de punta de ala: la inducida es mayor a baja velocidad",
    "a baja velocidad domina la inducida y necesitas más potencia",
    "la parásita crece con el cuadrado de la velocidad: al doble, cuatro veces más",
    "el punto más bajo de la curva en U es la L/D máxima",
    "con el motor parado, el mejor planeo está en la L/D máxima",
  ]),
  "aerodinamica-tema4": clips("aerodinamica-tema4", [
    "al inclinar las alas sube el factor de carga, y con él la velocidad de pérdida",
    "el factor de carga es la sustentación dividida entre el peso",
    "en vuelo recto y nivelado la sustentación iguala al peso: 1 G",
    "en viraje, el ala genera más sustentación para no perder altura",
    "a 60 grados de inclinación el factor de carga es 2 G",
    "un viraje brusco y lento en el circuito sube la velocidad de pérdida",
  ]),
  "aerodinamica-tema5": clips("aerodinamica-tema5", [
    "al alabear, el morro se va al lado contrario y el pedal lo corrige",
    "un alerón sube y el otro baja: la diferencia de sustentación alabea el avión",
    "el ala con el alerón abajo tiene más resistencia y jala el morro",
    "el morro se va un momento al lado contrario y luego sigue el viraje",
    "pedal hacia el mismo lado del viraje, al iniciar el alabeo",
    "con la bola centrada, el vuelo va coordinado",
  ]),
  "aerodinamica-tema6": clips("aerodinamica-tema6", [
    "el elevador mueve el morro y el trim te quita la presión del yoke",
    "al tirar del yoke el elevador sube y el morro sube",
    "el trim, una superficie secundaria en el elevador",
    "con el trim ajustado, el avión mantiene la actitud sin presión en el yoke",
    "después de cambiar potencia, actitud o flaps, ajustas el trim",
  ]),
  "aerodinamica-tema7": clips("aerodinamica-tema7", [
    "los flaps bajan y el avión vuela más lento sin entrar en pérdida",
    "el flap curva el perfil del ala, y a veces le agrega área",
    "el flap simple, que solo pivota hacia abajo",
    "el flap ranurado: el aire pasa por la ranura sobre el flap",
    "el flap Fowler baja y se desliza hacia atrás, con más área alar",
    "con flaps, más sustentación y más resistencia a la misma velocidad",
    "flaps parciales para despegar y completos para aterrizar",
  ]),
  "aerodinamica-tema8": clips("aerodinamica-tema8", [
    "cerca de la pista el avión flota: la flotación larga y el despegue que no asciende",
    "el efecto suelo empieza a menos de una envergadura de altura",
    "el suelo achica los vórtices de punta de ala y baja la resistencia inducida",
    "al aterrizar se resiste a tocar; al despegar se levanta antes de tiempo",
    "con velocidad o potencia de más, el avión flota sobre la pista",
    "al salir del efecto suelo sin velocidad suficiente, el avión no sigue ascendiendo",
  ]),
};
