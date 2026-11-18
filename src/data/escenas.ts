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
  "aerodinamica-tema9": clips("aerodinamica-tema9", [
    "con mucha potencia el morro se va a la izquierda y el pedal derecho lo corrige",
    "torque, flujo espiral, precesión giroscópica y P-factor llevan el morro a la izquierda",
    "la pala que baja, del lado derecho, da más empuje que la que sube",
    "al despegar, el avión se va a la izquierda y el pedal derecho mantiene la línea",
    "el viento cruzado empuja la cola y el morro gira hacia el viento, como una veleta",
    "con un ala más en pérdida que la otra, el avión entra en barrena",
    "los cinco pasos para salir de la barrena, mientras la rotación se detiene",
    "debajo de Va el ala entra en pérdida antes de llegar al límite de 3.8 G",
  ]),
  // ---------- Meteorología (clips de Remotion, revisados en docs/academia-rise/revision-meteorologia.md) ----------
  "meteorologia-tema1": clips("meteorologia-tema1", [
    "el METAR completo de la Ciudad de México: lo que hay ahora, no lo que se espera",
    "la veleta y el termómetro de la estación miden el tiempo en el aeródromo",
    "un METAR cada hora y, si el tiempo cambia mucho entre reportes, un SPECI",
    "el mismo METAR en México, con millas y pulgadas, y en Madrid, con metros y hectopascales",
    "los bloques del METAR: viento, visibilidad, fenómenos, nubes, temperatura con punto de rocío y presión",
    "antes de volar, consultas el METAR de salida, de destino y del alterno",
  ]),
  "meteorologia-tema2": clips("meteorologia-tema2", [
    "el METAR de la Ciudad de México se resalta bloque por bloque, en orden",
    "MMMX es el identificador OACI de la Ciudad de México",
    "171800Z: día 17 a las 18:00 UTC, las 12:00 en el centro de México",
    "la rosa de los vientos con viento desde 090 grados a 8 nudos",
    "8 millas de visibilidad, pocas nubes a 3,000 pies y dispersas a 10,000, sobre el terreno",
    "la temperatura y el punto de rocío se acercan hasta que aparece la niebla",
    "con el QNH de 30.05 puesto, el altímetro en tierra marca la elevación de MMMX",
    "los bloques de un METAR real se resaltan uno tras otro",
  ]),
  "meteorologia-tema3": clips("meteorologia-tema3", [
    "una línea de tiempo hacia adelante: el TAF pronostica las próximas horas",
    "un TAF de la Ciudad de México con su encabezado",
    "la vigencia de 24 a 30 horas, un TAF nuevo cada 6 y el TAF AMD si falla",
    "un grupo del TAF con viento, visibilidad, tormenta y nubes previstos",
    "una gráfica de los grupos de cambio FM, BECMG, TEMPO y PROB30",
    "a tu hora de llegada, el destino está IFR y el alterno VFR",
  ]),
  "meteorologia-tema4": clips("meteorologia-tema4", [
    "un METAR y un TAF lado a lado: el presente y el futuro",
    "el METAR como una fotografía de esa hora",
    "el TAF como una línea de tiempo de 24 a 30 horas",
    "el METAR decide si despegas ahora; el TAF, si planeas el vuelo",
    "el TAF anuncia techo bajo en el destino y el avión necesita un alterno",
    "los bloques del TAF son los mismos que los del METAR",
  ]),
  "meteorologia-tema5": clips("meteorologia-tema5", [
    "una capa de nubes que baja y la categoría cambia de VFR a IFR",
    "SKC con el cielo vacío y CLR de una estación automática",
    "los octavos de FEW y SCT: no forman techo",
    "los octavos de BKN y OVC: la capa más baja es el techo",
    "BKN008: una capa fragmentada a 800 pies sobre el terreno",
    "la tabla de VFR, MVFR e IFR con techo y visibilidad",
    "cúmulos, estratos y cirros, y lo que dice cada uno del aire",
    "un cumulonimbo con lluvia y rayos que se rodea, nunca se cruza",
  ]),
  "meteorologia-tema6": clips("meteorologia-tema6", [
    "un cumulonimbo del frente frío y las capas del frente cálido",
    "la frontera entre una masa de aire frío y una cálida",
    "la cuña de aire frío levanta de golpe al cálido y se forma un cumulonimbo",
    "el aire cálido sube poco a poco sobre el frío, con capas de nubes y lluvia ligera",
    "en la carta, triángulos azules para el frente frío y semicírculos rojos para el cálido",
  ]),
  "meteorologia-tema7": clips("meteorologia-tema7", [
    "un avión que se sacude y los cuatro orígenes de la turbulencia",
    "el viento choca con una montaña y forma remolinos del otro lado",
    "el sol calienta el suelo desigual y suben corrientes térmicas",
    "la corriente de chorro sacude al avión en aire sin nubes",
    "los vórtices de las puntas de ala bajan y se abren detrás del avión",
    "la escala ligera, moderada, severa y extrema, con el avión cada vez más sacudido",
    "un piloto adelante reporta turbulencia a otro con un PIREP",
  ]),
  "meteorologia-tema8": clips("meteorologia-tema8", [
    "un avión en aproximación, cerca del suelo, donde la cizalladura pega",
    "el viento cambia de dirección en poca distancia",
    "una inversión con viento fuerte arriba y suave abajo",
    "en un microburst la velocidad sube y el avión queda alto; luego baja y se hunde",
    "una descendente de hasta 6,000 pies por minuto en alrededor de una milla",
    "la virga: lluvia que se evapora antes de tocar el suelo",
    "los sensores del LLWAS detectan la cizalladura y alertan a la torre",
    "lejos de las tormentas y atento al ATIS",
  ]),
  "meteorologia-tema9": clips("meteorologia-tema9", [
    "hielo en el ala y un termómetro positivo: el del carburador sorprende",
    "gotas de agua superenfriada que se congelan al tocar el ala",
    "hielo rime, opaco, contra hielo clear, claro y más pesado",
    "el hielo deforma el perfil: menos sustentación y más resistencia",
    "una nube entre 0 y menos 20 grados con agua líquida",
    "el nivel de congelamiento separa el aire bajo cero del de arriba",
    "el venturi del carburador se enfría y se forma hielo en la garganta",
    "las RPM bajan y la calefacción al carburador las recupera",
  ]),
  "meteorologia-tema10": clips("meteorologia-tema10", [
    "la altitud del altímetro contra la altitud que siente el avión en Toluca",
    "con calor, menos presión o humedad, el aire tiene menos moléculas",
    "el motor, el ala y la hélice rinden menos a la vez",
    "Toluca a 8,466 pies, el aeropuerto internacional más alto de México",
    "en un día caluroso, la altitud de densidad de Toluca pasa de 11,000 pies",
    "la carrera de despegue en Toluca contra una pista a nivel del mar",
    "la altitud de densidad se calcula antes de cada despegue",
  ]),
  "navegacion-tema1": clips("navegacion-tema1", [
    "un VOR en el centro con radiales que salen en todas direcciones: la base de la navegación VFR e IFR",
    "la estación VOR en tierra transmite en VHF, de 108.00 a 117.95 MHz",
    "el avión está en el radial 060: su posición angular respecto a la estación",
    "los radiales aparecen uno por grado hasta llegar a 360",
    "un avión alto recibe la señal; uno bajo y lejos queda tapado por la curvatura de la Tierra",
    "primero sintonizas la frecuencia y luego identificas la estación por su código Morse",
  ]),
  "navegacion-tema2": clips("navegacion-tema2", [
    "el avión se aleja por el radial 060: la línea es la misma, la distancia no",
    "una señal de referencia igual en todas direcciones y otra que gira, mostrada en cámara lenta",
    "las ondas de referencia y variable, desfasadas 60 grados: el avión está en el radial 060",
    "dos aviones en el mismo radial a distinta distancia: el VOR no dice cuántas millas",
    "la distancia con un DME, o la posición cruzando los radiales de dos VOR",
  ]),
  "navegacion-tema3": clips("navegacion-tema3", [
    "el radial sale del VOR hacia afuera; una flecha hacia la estación aparece tachada",
    "36 radiales que salen del VOR sobre la rosa de rumbos",
    "el radial 045 forma 45 grados con el norte magnético, medido desde la estación",
    "el radial 090 sale hacia el este y el 270 hacia el oeste",
    "un avión al este del VOR con rumbo 270: no está en el radial 270, está en el 090",
    "el avión gira sobre sí mismo en el radial 090 y sigue al este de la estación",
  ]),
  "navegacion-tema4": clips("navegacion-tema4", [
    "el radial 090 sale del VOR hasta el avión; el curso 270 TO regresa a la estación",
    "dos indicadores: bandera TO con curso 270 y bandera FROM con curso 090",
    "el avión vuela con curso 270 y bandera TO hacia el VOR",
    "el avión se aleja del VOR con curso 270 y bandera FROM",
    "en el radial 090, el OBS en 090 marca FROM y en 270 marca TO",
    "el indicador con la bandera resaltada: se revisa antes de girar",
  ]),
  "navegacion-tema5": clips("navegacion-tema5", [
    "con la aguja a la izquierda, el avión vira hacia ella y la centra sobre el curso",
    "el avión se mueve a los lados del curso y la aguja del CDI lo sigue",
    "la aguja avanza punto por punto: cada punto son 2 grados, 5 puntos son 10",
    "volando al norte con curso 360, la aguja a la izquierda muestra el curso a la izquierda",
    "en la misma posición, al seleccionar 180 la aguja se va al lado contrario",
    "el avión vuela sobre el curso y la aguja queda centrada",
    "con la misma desviación de 4 puntos, el avión cerca de la estación está mucho más pegado al curso",
  ]),
  "navegacion-tema6": clips("navegacion-tema6", [
    "el OBS gira y el avión en el mapa no se mueve",
    "la perilla del OBS gira y cambia el curso seleccionado arriba",
    "la tarjeta del instrumento gira y el curso seleccionado queda arriba",
    "al girar el OBS, la aguja cruza el centro y la bandera pasa de FROM a TO",
    "con el OBS girando, el avión sigue con rumbo 040 en el radial 090",
  ]),
  "navegacion-tema7": clips("navegacion-tema7", [
    "el avión selecciona, observa, gira con 030 e intercepta el radial 360",
    "el OBS gira hasta el curso 360",
    "con rumbo 360, la aguja a la derecha dice que el radial queda a la derecha",
    "el avión gira de 360 a 030: el curso más 30 grados hacia la aguja",
    "con rumbo 030 la aguja se acerca al centro y el avión gira al curso 360",
  ]),
  "navegacion-tema8": clips("navegacion-tema8", [
    "una intercepción con 30 grados llega al curso sin pasarse",
    "con 10 grados el avión casi no se acerca al curso; con 30 ya habría llegado",
    "con 90 grados cerca de la estación, el avión cruza el curso y tiene que regresar",
    "con 30 grados hay tiempo para empezar el giro antes de llegar al curso",
    "lejos de la estación se intercepta con 45 grados; 90 es el máximo",
  ]),
  "navegacion-tema9": clips("navegacion-tema9", [
    "aguja a la derecha en el CDI: el avión gira hacia la derecha",
    "rumbo de intercepción igual a curso más o menos ángulo: 030 o 330 para el curso 360",
    "al oeste del curso, con la aguja a la derecha, el avión intercepta con 030",
    "al este del curso, con la aguja a la izquierda, el avión intercepta con 330",
    "aguja a la derecha, rumbo mayor que el curso; aguja a la izquierda, rumbo menor",
  ]),
  "navegacion-tema10": clips("navegacion-tema10", [
    "con viento del oeste, el avión sigue el curso 360 con rumbo 350",
    "sin corregir, el viento saca al avión del curso; corrigiendo, sigue sobre el radial",
    "el WCA es el ángulo entre el curso y el rumbo, hacia el lado del viento",
    "el viento empuja al avión a la derecha y este corrige unos grados a la izquierda",
    "con la corrección correcta, la aguja del CDI se queda centrada",
    "sobre la estación, en el cono de confusión, la aguja oscila y la bandera pasa de TO a FROM",
  ]),
  "navegacion-tema11": clips("navegacion-tema11", [
    "con viento cruzado, homing traza una curva y tracking una línea recta hasta la estación",
    "en homing la nariz apunta siempre a la estación y el viento curva la trayectoria",
    "la curva del homing junto a la recta que se pudo volar",
    "en tracking la nariz apunta un poco hacia el viento y la trayectoria es recta",
    "la recta del tracking es más corta que la curva del homing",
    "tracking resaltado como la técnica que todo piloto instrumental domina",
  ]),
  "navegacion-tema12": clips("navegacion-tema12", [
    "los radiales de dos VOR se cruzan donde está el avión",
    "dos estaciones, VOR A y VOR B, y un radial de cada una",
    "dos radiales que se cruzan: la fijación cruzada o cross-fix",
    "se traza el radial de cada VOR en la carta y el cruce es la ubicación",
    "con el mismo error de lectura, el cruce cerca de 90 grados deja una zona chica y el cruce cerrado una grande",
    "la fijación cruzada confirma la posición sin GPS",
  ]),
};
