import type { QuizPregunta } from "../features/academia/quizData";
import type { ScenarioNode } from "../features/academia/ScenarioSimulator";
import type { SliderConfig } from "../features/academia/DragSlider";
import type { TermPair } from "../features/academia/TermMatch";
import { TEMA_PUNTOS, type TemaPunto } from "./temaPuntos.ts";

export interface Tema {
  id: string;
  titulo: string;
  texto: string;
  imagenes?: string[];
  /** Idea clave del tema, cuando hay versión escaneable (ver temaPuntos.ts). */
  clave?: string;
  /** Puntos escaneables; el párrafo de `texto` queda desplegable debajo. */
  puntos?: TemaPunto[];
}

export interface LeccionContenido {
  titulo: string;
  temas: Tema[];
  /** Ids de los ejercicios de este capítulo; si falta, se reparten en orden entre los capítulos. */
  interactivos?: string[];
}

// ---------- Lecciones ----------

export const MODULE_LECCIONES: Record<string, LeccionContenido[]> = {
  "fundamentos": [
    {
      titulo: "¿Qué es un avión?",
      temas: [
      { id: "fundamentos-tema1", titulo: "¿Qué es un avión?", texto: "Un avión es una máquina más pesada que el aire, capaz de sostenerse y desplazarse por la atmósfera gracias a las fuerzas aerodinámicas que genera su propio movimiento. A diferencia de un globo o un dirigible, no flota: necesita generar activamente, con sus alas y su motor, la fuerza que lo mantiene en el aire. Antes de entrar en la física de cómo lo logra, conviene reconocer primero sus partes principales — cada una cumple una función específica en ese equilibrio, como verás a continuación." , imagenes: ["/images/flota/c172-1600.webp"]},
      { id: "fundamentos-tema4", titulo: "Partes de un avión", texto: "Un avión típico de entrenamiento se compone de: el Fuselaje, la estructura central que aloja cabina, pasajeros y carga; las Alas, que generan la sustentación y suelen alojar combustible; el Empenaje (cola), formado por el estabilizador horizontal y el vertical con sus superficies móviles (elevador, timón de dirección y compensador), que da estabilidad direccional y de cabeceo; el Tren de aterrizaje, que soporta el peso en tierra y absorbe el impacto del aterrizaje; y el Grupo motopropulsor (motor y hélice o turbina), que genera el empuje. Cada componente cumple una función estructural o aerodinámica específica, y conocer su nomenclatura correcta es esencial para la comunicación técnica con instructores, mecánicos y controladores." , imagenes: ["/images/flota/c172-1600.webp"]},
      ],
    },
    {
      titulo: "Por qué vuela un avión: las 4 fuerzas y los principios físicos",
      temas: [
      { id: "fundamentos-tema2", titulo: "Las 4 fuerzas del vuelo", texto: "Todo avión en vuelo está sometido a 4 fuerzas fundamentales: Sustentación (Lift), generada por las alas, que se opone al Peso (Weight), la fuerza de gravedad sobre la masa total de la aeronave; y Empuje (Thrust), producido por el motor, que se opone a la Resistencia (Drag), la fuerza que se opone al avance y que viene tanto de la forma y la fricción del avión (resistencia parásita) como de producir sustentación (resistencia inducida). En vuelo recto y nivelado a velocidad constante, estas 4 fuerzas están en equilibrio: sustentación = peso y empuje = resistencia. Cualquier cambio de actitud, potencia o configuración rompe momentáneamente este equilibrio y produce una reacción — subir, bajar, acelerar o desacelerar.", imagenes: ["/images/fundamentos-4fuerzas.png"] },
      { id: "fundamentos-tema3", titulo: "Principios de Bernoulli y Newton", texto: "La sustentación se explica mediante dos principios físicos complementarios. El Principio de Bernoulli establece que, en un fluido en movimiento, a mayor velocidad menor presión: el perfil del ala hace que el aire viaje más rápido sobre la superficie superior, generando menor presión arriba y mayor presión abajo — esa diferencia empuja el ala hacia arriba. La Tercera Ley de Newton (acción-reacción) explica lo mismo desde otro ángulo: el ala desvía el aire hacia abajo, y como reacción, el aire empuja el ala hacia arriba. Ambos principios no compiten, se complementan: describen la misma sustentación desde la presión (Bernoulli) y desde el momentum del aire desviado (Newton). Como piloto no necesitas resolver ecuaciones, pero sí entender que el ángulo de ataque y la velocidad son las variables que controlas para generar más o menos sustentación.", imagenes: ["/videos/academia/fundamentos-tema3-3.jpg"] },
      ],
    },
    {
      titulo: "Superficies, ejes, controles e instrumentos básicos",
      temas: [
      { id: "fundamentos-tema5", titulo: "Superficies de control", texto: "Las superficies de control son partes móviles que el piloto mueve para cambiar la actitud del avión. Los Alerones, en el borde de salida de las alas, controlan el alabeo (roll) moviéndose en direcciones opuestas entre sí. El Elevador, en el estabilizador horizontal, controla el cabeceo (pitch) subiendo o bajando el morro. El Timón de dirección, en el estabilizador vertical, controla la guiñada (yaw). Además existen superficies secundarias como los Flaps, que aumentan la sustentación y resistencia para despegues y aterrizajes a baja velocidad, en algunos aviones, spoilers, que reducen la sustentación; y en casi todos, compensadores (trim tabs), que quitan la presión que el piloto siente en los controles. Cada superficie corresponde a un eje de movimiento específico — la relación superficie-eje-control es una de las primeras cosas que un instructor evalúa que domines." , imagenes: ["/images/cessna-topview.png"]},
      { id: "fundamentos-tema6", titulo: "Ejes de movimiento", texto: "Un avión se mueve alrededor de 3 ejes imaginarios que se cruzan en su centro de gravedad. El Alabeo (roll) es el giro alrededor del Eje longitudinal (nariz-cola): inclina las alas y se produce con los alerones. El Cabeceo (pitch) es el giro alrededor del Eje lateral (ala-ala): sube o baja el morro y se produce con el elevador. La Guiñada (yaw) es el giro alrededor del Eje vertical: mueve el morro a izquierda o derecha y se produce con el timón de dirección. Estos 3 ejes y sus 3 movimientos son la base de toda maniobra de vuelo, desde un viraje coordinado hasta una aproximación final." , imagenes: ["/images/cessna-topview.png"]},
      { id: "fundamentos-tema7", titulo: "Controles de vuelo (yoke, pedales, throttle, mezcla)", texto: "El piloto interactúa con el avión mediante controles primarios y secundarios. El Yoke (o bastón de control), al moverse adelante/atrás controla el elevador (cabeceo), y al girarlo controla los alerones (alabeo) — en aviones como el VL3, esta misma función la cumple un Control Stick (bastón) en vez de un yoke. Los Pedales de timón controlan el timón de dirección (guiñada) y, en tierra, el frenado diferencial y la dirección de la rueda de nariz. La Palanca de potencia (Throttle) regula la cantidad de combustible y aire hacia el motor, controlando directamente el empuje disponible; en aviones de hélice de paso variable, el control de Propeller ajusta por separado las RPM del motor. El Control de mezcla (Mixture) ajusta la proporción de combustible y aire según la densidad del aire (altitud), optimizando la combustión y evitando pérdida de potencia o daño al motor. En aviones con hélice de paso variable, throttle, propeller y mezcla son controles independientes que se mueven en un orden según la fase de vuelo: para aumentar potencia, primero la mezcla, luego la hélice y al final el acelerador; para reducirla, al revés. Dominar la coordinación entre estos controles — especialmente pedal-yoke en virajes — es una de las primeras destrezas motoras que un piloto desarrolla.", imagenes: [
        "/images/temas/fundamentos-tema7-1-yoke.jpg",
        "/images/temas/fundamentos-tema7-2-control-stick.jpg",
        "/images/temas/fundamentos-tema7-3-pedales.jpg",
        "/images/temas/fundamentos-tema7-4-throttle.jpg",
        "/images/temas/fundamentos-tema7-5-propeller.jpg",
        "/images/temas/fundamentos-tema7-6-mezcla-foto.jpg",
        "/images/temas/fundamentos-tema7-7-palancas-foto.jpg",
      ] },
      { id: "fundamentos-tema8", titulo: "Instrumentos básicos (Six Pack)", texto: "El \"Six Pack\" es el conjunto de 6 instrumentos analógicos básicos en la cabina, organizados en dos filas de tres. Fila superior: Indicador de velocidad (Airspeed Indicator), que muestra la velocidad del aire; Horizonte artificial (Attitude Indicator), que muestra la actitud respecto al horizonte real; y Altímetro, que muestra la altitud sobre el nivel del mar. Fila inferior: Coordinador de viraje (Turn Coordinator), que muestra la tasa de giro y la coordinación; Indicador de rumbo (Heading Indicator), que muestra hacia dónde apunta la nariz; y Variómetro (Vertical Speed Indicator), que muestra la tasa de ascenso o descenso. Estos 6 instrumentos, leídos en conjunto (scan instrumental), dan al piloto una imagen completa del estado del avión en cualquier condición, incluso sin referencia visual externa." , imagenes: ["/images/temas/six-pack.svg"]},
      ],
    },
  ],
  "meteorologia": [
    {
      titulo: "Leer METAR y TAF",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "meteorologia-tema1", titulo: "¿Qué es un METAR?", texto: "Un METAR (Meteorological Aerodrome Report) es un reporte de las condiciones meteorológicas ACTUALES observadas en un aeródromo. Sale cada hora (en algunos aeropuertos, cada media hora), y si el tiempo cambia mucho entre un reporte y otro se emite uno especial, el SPECI. Usa un código estandarizado para que cualquier piloto, en cualquier país, pueda leerlo sin importar el idioma local, con variantes: en México y EUA la visibilidad va en millas (SM) y la presión en pulgadas de mercurio (A3005); en casi todo el mundo, en metros y hectopascales (Q1013). Incluye viento, visibilidad, fenómenos presentes, nubes, temperatura, punto de rocío y presión altimétrica. Es la primera fuente que consultas antes de cualquier vuelo para saber cómo está el clima ahora mismo en tu aeropuerto de salida, destino o alterno." , imagenes: ["/videos/academia/meteorologia-tema1-0.jpg"]},
      { id: "meteorologia-tema2", titulo: "Cómo leer un METAR paso a paso", texto: "Tomemos un ejemplo: METAR MMMX 171800Z 09008KT 8SM FEW030 SCT100 22/12 A3005. Se lee así: MMMX = identificador OACI del aeropuerto (Ciudad de México); 171800Z = día 17 del mes, 18:00 UTC (Zulu); 09008KT = viento desde 090° a 8 nudos (en el METAR la dirección es respecto al norte verdadero; la que te dan la torre o el ATIS es magnética); 8SM = visibilidad de 8 millas; FEW030 = pocas nubes a 3,000 pies sobre el terreno; SCT100 = nubes dispersas a 10,000 pies; 22/12 = temperatura 22 °C y punto de rocío 12 °C (si quedan a 2 o 3 grados uno del otro, espera niebla o nubes bajas); A3005 = presión altimétrica (QNH) de 30.05 pulgadas de mercurio: con ella puesta, en tierra, el altímetro marca la elevación del aeropuerto. Practica descomponer METAR reales en estos mismos bloques hasta que se vuelva automático: es una habilidad que usarás en cada vuelo." , imagenes: ["/videos/academia/meteorologia-tema2-0.jpg"]},
      { id: "meteorologia-tema3", titulo: "¿Qué es un TAF?", texto: "Un TAF (Terminal Aerodrome Forecast) es un pronóstico del tiempo esperado en un aeropuerto, válido típicamente por 24 o 30 horas. Sale cada 6 horas y, si el pronóstico falla, se corrige con un TAF AMD (enmendado). A diferencia del METAR, que describe lo que ESTÁ pasando ahora, el TAF describe lo que SE ESPERA que pase en las próximas horas: viento, visibilidad, nubes y fenómenos previstos, con grupos de cambio como FM (from, a partir de tal hora; el más común), BECMG (becoming, cambio gradual), TEMPO (temporary, cambio temporal) y PROB30 o PROB40 (probabilidad del 30 o 40 %). Es la herramienta clave para planear el vuelo: te dice si tu destino y tu alterno probablemente estarán en condiciones VFR o IFR a tu hora estimada de llegada." , imagenes: ["/videos/academia/meteorologia-tema3-0.jpg"]},
      { id: "meteorologia-tema4", titulo: "Diferencia entre METAR y TAF", texto: "La diferencia central es tiempo: el METAR es una fotografía del presente (observación actual, válida por esa hora específica), mientras que el TAF es una predicción del futuro (pronóstico válido por 24-30 horas). Usas el METAR para decidir si puedes despegar AHORA, y el TAF para decidir si tiene sentido planear el vuelo de aquí a varias horas, incluyendo si necesitarás un aeropuerto alterno. Ambos comparten el mismo lenguaje codificado (viento, visibilidad, nubes), así que si ya sabes leer un METAR, leer un TAF es prácticamente el mismo ejercicio, solo que interpretando períodos de tiempo y tendencias en vez de una sola observación." , imagenes: ["/videos/academia/meteorologia-tema4-0.jpg"]},
      { id: "meteorologia-tema5", titulo: "Nubes y su significado", texto: "Las nubes se describen en METAR y TAF con abreviaturas de cobertura: SKC (cielo despejado; lo reporta una persona), CLR (una estación automática no detectó nubes por debajo de 12,000 pies; puede haber más arriba), FEW (pocas, 1 a 2 octavos del cielo), SCT (dispersas, 3 a 4 octavos), BKN (fragmentadas, 5 a 7 octavos) y OVC (cubierto, 8 octavos). La altura va en cientos de pies sobre el terreno: BKN008 es fragmentado a 800 pies. El techo es la capa BKN u OVC más baja; FEW y SCT no son techo. La categoría del vuelo la deciden el techo y la visibilidad juntos: VFR con techo de más de 3,000 pies y más de 5 millas; IFR con techo de menos de 1,000 pies o menos de 3 millas; en medio, VFR marginal (MVFR). Por tipo, las más relevantes para el piloto son los cúmulos (aire inestable, con turbulencia debajo; si crecen mucho, pueden volverse CB), los estratos (aire estable y suave, pero techos y visibilidad bajos), los cirros (altos, de hielo; suelen anunciar un cambio de tiempo) y los cumulonimbos (CB: tormenta eléctrica, turbulencia severa y granizo; se evitan siempre)." , imagenes: ["/videos/academia/meteorologia-tema5-0.jpg"]},
      ],
    },
    {
      titulo: "Lo que mueve el aire",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "meteorologia-tema6", titulo: "Frentes fríos y cálidos", texto: "Un frente es la frontera entre dos masas de aire con temperaturas distintas. El Frente frío ocurre cuando aire frío avanza y empuja al aire cálido hacia arriba rápidamente — genera clima violento pero de corta duración: cumulonimbos, tormentas intensas, turbulencia y visibilidad muy reducida durante su paso, seguido de cielos despejados y aire fresco. El Frente cálido ocurre cuando aire cálido avanza sobre aire frío de forma gradual — genera nubosidad estratiforme extensa, lluvia ligera pero prolongada, y techos bajos durante mucho más tiempo antes de que pase. En las cartas meteorológicas, el frente frío se marca con triángulos azules y el cálido con semicírculos rojos, ambos apuntando hacia donde se dirige el frente." , imagenes: ["/videos/academia/meteorologia-tema6-0.jpg"]},
      { id: "meteorologia-tema7", titulo: "Turbulencia", texto: "La turbulencia es el movimiento irregular del aire que sacude la aeronave. Se clasifica por origen: Mecánica (aire chocando con obstáculos como montañas o edificios), Térmica (corrientes de aire ascendente por calentamiento desigual del suelo, común en tardes calurosas), Aire claro o CAT (Clear Air Turbulence, asociada a corrientes de chorro en altura, sin nubes que la anuncien), y de Estela (wake turbulence: los vórtices que deja en las puntas de ala todo avión que produce sustentación, más fuertes detrás de los pesados, lentos y limpios, como al despegar y aterrizar). Por intensidad se clasifica en Ligera, Moderada, Severa y Extrema, según qué tanto desplazamiento vertical y dificultad de control genera. Los reportes PIREP de otros pilotos son la mejor fuente para saber qué turbulencia esperar en tu ruta." , imagenes: ["/videos/academia/meteorologia-tema7-0.jpg"]},
      { id: "meteorologia-tema8", titulo: "Wind Shear", texto: "El wind shear (cizalladura de viento) es un cambio brusco de dirección o velocidad del viento en poca distancia, y es especialmente peligroso cerca del suelo, al despegar y aterrizar (Low-Level Wind Shear, LLWS). Aparece con tormentas y frentes, y también en una inversión térmica cuando el viento arriba de ella es fuerte. Su forma más severa es el microburst, una corriente descendente violenta y localizada que sale de una tormenta: al entrar, el viento de frente te sube la velocidad y te deja alto; enseguida la descendente y el viento de cola te quitan velocidad y te hunden. Dura pocos minutos, mide alrededor de una milla y la descendente puede llegar a 6,000 pies por minuto. La virga (lluvia que se evapora antes de tocar el suelo) debajo de una nube de tormenta puede anunciar uno. Muchos aeropuertos grandes tienen sistemas de detección (LLWAS) que alertan a los controladores. Como piloto, la mejor defensa es no operar cerca de tormentas activas y estar atento a los reportes de wind shear en el ATIS o de otros pilotos." , imagenes: ["/videos/academia/meteorologia-tema8-0.jpg"]},
      ],
    },
    {
      titulo: "Hielo y altitud de densidad",
      interactivos: ["interactividad-4", "interactividad-3"],
      temas: [
      { id: "meteorologia-tema9", titulo: "Formación de hielo", texto: "El hielo se forma en la aeronave cuando gotas de agua líquida a temperatura bajo cero (agua superenfriada) tocan el avión y se congelan. Las gotas chicas se congelan al instante y forman hielo opaco (rime); las grandes se extienden antes de congelarse y forman hielo claro (clear), que pesa más y cuesta más quitar. Este hielo estructural se acumula en alas, empenaje y otras superficies: altera el perfil aerodinámico, aumenta peso y resistencia, y reduce la sustentación de forma peligrosa. Las condiciones más favorables son nubes entre 0 °C y −20 °C con gotas de agua líquida; por eso revisar el pronóstico del nivel de congelamiento (freezing level) es esencial antes de volar en instrumentos. El hielo de carburador es otra cosa: se forma dentro del carburador por la evaporación del combustible y la caída de presión en el venturi, incluso con temperatura exterior positiva. Pasa sobre todo por debajo de 21 °C con humedad alta, y puede pasar hasta con 38 °C. Se nota como una pérdida de RPM y se corrige con la calefacción al carburador." , imagenes: ["/videos/academia/meteorologia-tema9-0.jpg"]},
      { id: "meteorologia-tema10", titulo: "Altitud de densidad (ejemplo de Toluca)", texto: "La Altitud de densidad es la altitud a la que el avión \"siente\" que está volando, ajustada por temperatura, presión y humedad — no es lo mismo que la altitud real sobre el nivel del mar. A mayor temperatura, menor presión o mayor humedad, el aire se vuelve menos denso y la altitud de densidad AUMENTA, reduciendo el rendimiento del motor, la sustentación de las alas y la eficiencia de la hélice. El aeropuerto de Toluca (MMTO) es el ejemplo perfecto en México: está a 8,466 pies de elevación real, el aeropuerto internacional más alto de México. En un día caluroso de verano, su altitud de densidad puede superar fácilmente los 11,000-12,000 pies — lo que significa carreras de despegue mucho más largas, tasas de ascenso reducidas, y menor margen de seguridad. Todo piloto que opera ahí debe calcular la altitud de densidad antes de cada despegue, no asumir que la pista de Toluca se comporta como una a nivel del mar." , imagenes: ["/videos/academia/meteorologia-tema10-0.jpg"]},
      ],
    },
  ],
  "aerodinamica": [
    {
      titulo: "Sustentación, pérdida y resistencia",
      interactivos: ["interactividad-4"],
      temas: [
      { id: "aerodinamica-tema1", titulo: "Sustentación en profundidad", texto: "La sustentación no es un valor fijo: depende de cuatro variables que el piloto controla o debe considerar en cada vuelo — el ángulo de ataque (a mayor ángulo, más sustentación, hasta el punto crítico), la velocidad del aire sobre el ala (la sustentación crece con el cuadrado de la velocidad, así que volar al doble de rápido genera cuatro veces más sustentación con el mismo ángulo), la densidad del aire (menos densidad en altitud o calor significa menos sustentación con los mismos parámetros) y el área y forma del ala (perfil aerodinámico y superficie alar). En Fundamentos aprendiste que sustentación se opone a peso; aquí el punto clave es que esa sustentación es ajustable en tiempo real, y el piloto la controla principalmente con dos palancas: el ángulo de ataque (yoke) y la velocidad (potencia y actitud)." , imagenes: ["/videos/academia/aerodinamica-tema1-0.jpg"]},
      { id: "aerodinamica-tema2", titulo: "Ángulo de ataque y pérdida (stall)", texto: "El ángulo de ataque es el ángulo entre la cuerda del ala y el viento relativo — no es lo mismo que la actitud del avión respecto al horizonte. Cada perfil de ala tiene un ángulo crítico de ataque, típicamente entre 16° y 20°, en el que el flujo de aire se separa de la superficie superior y la sustentación colapsa: eso es la pérdida (stall). El dato que más sorprende a un cadete nuevo: la pérdida ocurre siempre al mismo ángulo crítico, sin importar la velocidad, la actitud o el peso del avión, siempre que la configuración sea la misma (los flaps, el hielo o la escarcha lo cambian) — un avión puede entrar en pérdida en actitud de morro abajo y a cualquier velocidad si el ángulo de ataque supera el crítico (por ejemplo, en un tirón brusco); por encima de la velocidad de maniobra, un tirón así puede dañar la estructura antes de llegar a la pérdida. Por eso el entrenamiento insiste en que la pérdida es un problema de ángulo de ataque, no de velocidad baja." , imagenes: ["/videos/academia/aerodinamica-tema2-0.jpg"]},
      { id: "aerodinamica-tema3", titulo: "Resistencia inducida vs. parásita", texto: "La resistencia total de un avión se compone de dos tipos con comportamiento opuesto respecto a la velocidad. La resistencia inducida es un subproducto de generar sustentación (los vórtices en las puntas de ala) y es mayor a baja velocidad y ángulos de ataque altos — por eso cerca de la pérdida necesitas más potencia para sostener la altitud. La resistencia parásita es la que produce el avión al moverse por el aire: su forma (fuselaje, tren, antenas), la interferencia entre sus piezas y la fricción del aire contra su superficie; crece con el cuadrado de la velocidad — por eso ir muy rápido también cuesta más potencia. La suma de ambas forma una curva en U: existe una velocidad de resistencia mínima (L/D máximo) donde el avión vuela más eficientemente, usada por ejemplo para calcular el mejor planeo en caso de falla de motor." , imagenes: ["/videos/academia/aerodinamica-tema3-0.jpg"]},
      { id: "aerodinamica-tema4", titulo: "Factor de carga y el viraje", texto: "El factor de carga (load factor, medido en \"G\") es la relación entre la sustentación total generada y el peso del avión. En vuelo recto y nivelado, el factor de carga es 1G (sustentación = peso). En un viraje con inclinación, una parte de la sustentación se usa para girar el avión en vez de sostener su peso, así que el ala debe generar más sustentación total para mantener la altitud — esto aumenta el factor de carga (en un viraje a 60° de inclinación, el factor de carga es 2G) y, como consecuencia directa, aumenta la velocidad de pérdida del avión en ese viraje. Este es el motivo por el que un viraje pronunciado y brusco a baja velocidad es una de las combinaciones más peligrosas en el patrón de tráfico." , imagenes: ["/videos/academia/aerodinamica-tema4-0.jpg"]},
      ],
    },
    {
      titulo: "Superficies de control",
      interactivos: ["interactividad-1", "interactividad-3"],
      temas: [
      { id: "aerodinamica-tema5", titulo: "Alerones y el adverse yaw", texto: "Los alerones se mueven en direcciones opuestas entre sí: cuando uno sube (reduciendo sustentación de esa ala), el otro baja (aumentándola), generando el alabeo (roll). Pero el ala que baja el alerón también genera más resistencia inducida que la que lo sube — este desbalance produce el adverse yaw (guiñada adversa): el morro del avión tiende a moverse momentáneamente hacia el lado contrario al viraje que se está iniciando. Por eso todo piloto aprende a aplicar pedal de timón en la misma dirección del viraje al iniciar un alabeo, coordinando el movimiento y evitando que la bola del coordinador de viraje se salga del centro." , imagenes: ["/videos/academia/aerodinamica-tema5-0.jpg"]},
      { id: "aerodinamica-tema6", titulo: "Elevador y trim", texto: "El elevador, en el estabilizador horizontal, controla el cabeceo (pitch) cambiando el ángulo de ataque del avión: al tirar del yoke, el elevador sube y genera una fuerza hacia abajo en la cola, haciendo que el morro suba. El trim (compensador) es una superficie secundaria y más pequeña, parte del elevador, que ajusta la fuerza aerodinámica neutral necesaria para mantener una actitud sin que el piloto tenga que sostener presión constante en el yoke — no es un control de vuelo primario, es un ajuste de \"punto de equilibrio\" que se ajusta después de cada cambio de potencia, actitud o flaps: así no sostienes presión en el yoke y vuelas más preciso." , imagenes: ["/videos/academia/aerodinamica-tema6-0.jpg"]},
      { id: "aerodinamica-tema7", titulo: "Flaps: tipos y efecto", texto: "Los flaps son superficies del borde de salida del ala que se extienden para aumentar la curvatura (y a veces el área) del perfil alar. Los tipos más comunes en aviación general son el flap simple (plain flap, el más básico, solo pivota hacia abajo), el flap ranurado (slotted flap, con una ranura que dirige aire de alta energía sobre la superficie superior, más eficiente) y el flap Fowler (que además de bajar se desliza hacia atrás, aumentando el área alar). El efecto común a todos: más sustentación y más resistencia a la misma velocidad, lo que permite volar más lento sin entrar en pérdida — por eso se usan en despegue (configuración parcial, prioriza sustentación) y aterrizaje (configuración completa, prioriza también la resistencia para descender más pronunciado y lento)." , imagenes: ["/videos/academia/aerodinamica-tema7-0.jpg"]},
      { id: "aerodinamica-tema8", titulo: "Efecto suelo (ground effect)", texto: "El efecto suelo ocurre cuando el avión vuela muy cerca del suelo (aproximadamente a una altura menor a la envergadura del ala) y la superficie interfiere con la formación normal de los vórtices de punta de ala, reduciendo la resistencia inducida. El resultado práctico que todo cadete experimenta: el avión parece \"flotar\" y resistirse a tocar tierra durante el aterrizaje, o se levanta antes de la velocidad recomendada al despegar. Entender el efecto suelo explica por qué llegar con velocidad de más, o reducir potencia demasiado tarde, te deja flotando largo sobre la pista (float), y por qué un despegue con poca pista puede parecer exitoso a baja altura pero el avión no logra seguir ascendiendo al salir del efecto suelo si no lleva suficiente velocidad." , imagenes: ["/videos/academia/aerodinamica-tema8-0.jpg"]},
      ],
    },
    {
      titulo: "Tendencias, barrena y Va",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "aerodinamica-tema9", titulo: "Tendencias a la izquierda, barrena y Va", texto: "En un avión cuya hélice gira a la derecha vista desde la cabina, como el C172, cuatro efectos llevan el morro a la izquierda: el torque (la reacción al giro de la hélice), el flujo espiral (el aire que sale de la hélice gira alrededor del fuselaje y empuja la cola), la precesión giroscópica y el P-factor (carga asimétrica de la hélice: con ángulo de ataque alto, la pala que baja, del lado derecho, muerde más aire que la que sube, y el empuje se carga a la derecha). Se notan sobre todo con potencia alta, velocidad baja y ángulo de ataque alto, como al despegar y ascender, y se corrigen con pedal derecho. En tierra, el viento cruzado empuja la cola y el avión tiende a girar hacia el viento, como una veleta; también se corrige con los pedales. Si el ala está en pérdida y además el avión guiña, un ala queda más en pérdida que la otra y el avión puede entrar en barrena: una rotación que se sostiene sola. Se evita volando coordinado cerca de la pérdida. En la mayoría de los aviones ligeros se recupera con potencia a ralentí, alerones neutrales, pedal contrario a la rotación y yoke adelante hasta romper la pérdida; al parar la rotación, pedales al centro y sales de la picada con suavidad (lo que manda es el POH de tu avión). Por último, la velocidad de maniobra (Va) es la máxima a la que puedes usar todo el recorrido de un control de golpe: por debajo de ella, el ala entra en pérdida antes de pasar su límite de carga. Va baja cuando el avión pesa menos: en el C172S, unos 105 nudos al peso máximo y unos 90 con poco peso.", imagenes: ["/videos/academia/aerodinamica-tema9-0.jpg"]},
      ],
    },
  ],
  "vfr": [
    {
      titulo: "Mínimos meteorológicos VFR",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "vfr-tema1", titulo: "Qué son los mínimos VFR y por qué existen", texto: "Los mínimos meteorológicos VFR son la visibilidad mínima y la distancia mínima a las nubes que debes respetar para volar por referencias visuales. Existen porque todo el sistema VFR se basa en el principio de \"ver y evitar\": el piloto siempre es responsable de detectar y separarse de otro tráfico y de obstáculos, aunque el ATC le dé separación o avisos de tráfico. Sin visibilidad suficiente o volando pegado a las nubes, ese principio deja de funcionar — no tendrías tiempo de reacción para ver a otra aeronave y maniobrar. Por eso los mínimos no son un capricho regulatorio: son la distancia física mínima que necesita un piloto para detectar un peligro y reaccionar a tiempo." , imagenes: ["/videos/academia/vfr-tema1-0.jpg"]},
      { id: "vfr-tema2", titulo: "Mínimos en espacio aéreo controlado vs. no controlado", texto: "Los mínimos de visibilidad y distancia a nubes varían según la clase de espacio aéreo y la altitud. Estas son las cifras de la FAA (EUA), las que usan la mayoría de los cursos de simulador; en México consulta el AIP (ENR 1.2) para las vigentes. La tabla de la OACI, que es la que usa México, está en el módulo Espacios aéreos. Por debajo de 10,000 ft: en Clase B, 3 millas de visibilidad y libre de nubes; en Clases C, D y E, 3 millas y 500 ft por debajo, 1,000 ft por encima y 2,000 ft horizontal de las nubes; en Clase G, de día y por debajo de 1,200 ft AGL, basta 1 milla y libre de nubes. La lógica es consistente con el resto del sistema: a más tránsito y velocidad de cierre, más margen visual necesitas para ver y evitar a tiempo." , imagenes: ["/videos/academia/vfr-tema2-0.jpg"]},
      { id: "vfr-tema3", titulo: "VFR nocturno", texto: "De noche, la referencia visual del horizonte y del terreno se reduce drásticamente — es mucho más fácil perder la orientación espacial o no detectar tráfico a tiempo sin la luz del día. Con las reglas de la FAA, en espacio controlado los mínimos son los mismos de día y de noche; lo que cambia es la Clase G: de día, por debajo de 1,200 ft AGL, basta 1 milla y libre de nubes, pero de noche se piden 3 millas y 500 ft por debajo, 1,000 por encima y 2,000 horizontal de las nubes. Además, de noche se vuelve crítico identificar correctamente las luces de otras aeronaves (posición, anticolisión) y las luces del aeródromo, y mantener un escaneo instrumental más frecuente como respaldo de la referencia visual exterior, que es menos confiable en la oscuridad." , imagenes: ["/videos/academia/vfr-tema3-0.jpg"]},
      { id: "vfr-tema4", titulo: "Special VFR", texto: "El Special VFR es una autorización especial que el ATC puede otorgar, bajo petición del piloto, para operar dentro de la zona de superficie de un aeropuerto controlado con visibilidad o techo de nubes por debajo de los mínimos VFR normales, siempre que se mantenga libre de nubes y con al menos 1 milla de visibilidad. De noche solo se puede si el piloto tiene habilitación de instrumentos y el avión está equipado para IFR. No es un derecho automático: el controlador puede negarlo si hay tránsito IFR que lo haga inseguro, y solo se autoriza aeronave por aeronave. Es una herramienta útil para casos límite (por ejemplo, entrar a un aeropuerto controlado justo cuando el techo de nubes baja), pero exige que el piloto ejerza un juicio conservador antes de solicitarlo." , imagenes: ["/videos/academia/vfr-tema4-0.jpg"]},
      ],
    },
    {
      titulo: "Procedimientos de patrón de tráfico",
      interactivos: ["interactividad-3", "interactividad-4"],
      temas: [
      { id: "vfr-tema5", titulo: "Entrada estándar al patrón de tráfico", texto: "La entrada recomendada a un patrón de tráfico, especialmente en un aeródromo no controlado, es a 45° hacia el tramo de viento en cola (downwind), a la altitud del patrón. Esta entrada te da una vista clara de todo el patrón antes de integrarte a él — puedes ver quién está en viento en cola, base y final antes de sumarte — y es predecible para el resto del tráfico, que espera ver llegar aeronaves por ese punto. Entrar directamente a base o a final sin pasar por esa entrada estándar es una de las causas más comunes de conflictos y sorpresas en el patrón, porque el resto del tráfico no te está buscando ahí." , imagenes: ["/videos/academia/vfr-tema5-0.jpg"]},
      { id: "vfr-tema6", titulo: "Los tramos del patrón y su propósito", texto: "Cada tramo del patrón de tráfico cumple una función distinta en la secuencia de aterrizaje: el viento en cola (downwind) te da tiempo para completar el checklist de aterrizaje y espaciarte del tráfico que va adelante, y a la altura del punto de toque reduces potencia y empiezas a descender; en base sigues descendiendo y tienes una última oportunidad de verificar la pista despejada y la final libre; y el tramo final te alinea con la pista para el aterrizaje, con la configuración completa ya establecida. Pensar el patrón como una secuencia de decisiones (no solo una figura geométrica que volar) es lo que distingue a un piloto que gestiona bien la carga de trabajo de uno que solo sigue las líneas del circuito." , imagenes: ["/videos/academia/vfr-tema6-0.jpg"]},
      { id: "vfr-tema7", titulo: "Reportes de posición en aeródromo no controlado", texto: "En un aeródromo sin torre, los pilotos se coordinan entre sí anunciando su posición por radio en una frecuencia común (CTAF), sin que nadie autorice sus movimientos — es información, no una instrucción. Un reporte típico sigue el formato: nombre del aeródromo, matrícula, posición en el patrón, pista y otra vez el nombre del aeródromo, por ejemplo: \"Tráfico [nombre del aeródromo], XB-VLA, entrando viento en cola pista 20, [nombre del aeródromo]\". Avisar a unas 10 millas, al entrar, en cada tramo (viento en cola, base, final) y al librar la pista le da al resto del tráfico la información que necesita para autosepararse, especialmente cuando no todos pueden verse entre sí visualmente en todo momento." , imagenes: ["/videos/academia/vfr-tema7-0.jpg"]},
      { id: "vfr-tema8", titulo: "Separación y prioridad en el patrón", texto: "Cuando dos aeronaves convergen en el patrón, la regla general de prioridad es que la aeronave con menor altura o más cerca de aterrizar tiene preferencia — por ejemplo, una aeronave ya en final normalmente tiene prioridad sobre una que apenas está entrando al patrón. Eso sí, la preferencia no te permite meterte delante de quien ya está en final ni rebasarlo. Además, esa prioridad nunca exime a nadie de la responsabilidad de \"ver y evitar\": si detectas un conflicto, la solución siempre es comunicarlo por radio y ajustar tu propia trayectoria (por ejemplo, extendiendo el viento en cola) en vez de asumir que el otro piloto cederá el paso. La cortesía y la comunicación clara evitan más incidentes en el patrón que cualquier regla de prioridad escrita." , imagenes: ["/videos/academia/vfr-tema8-0.jpg"]},
      ],
    },
    {
      titulo: "Luces de la aeronave",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "vfr-tema9", titulo: "Luces de posición, anticolisión y aterrizaje", texto: "Los aviones que vuelan de noche deben llevar luces de posición, con el mismo esquema que usan los barcos: roja en la punta del ala izquierda, verde en la punta del ala derecha, y blanca en la cola. Ver ambas luces, roja y verde, de frente te dice que otra aeronave viene directo hacia ti. Si van convergiendo y ves solo su roja, va de tu derecha a tu izquierda y tiene el paso; si ves solo su verde, va de tu izquierda a tu derecha y el paso es tuyo; si ves solo la blanca, se aleja de ti. A esto se suman las luces anticolisión: la baliza (beacon), una luz roja rotativa que se enciende antes de arrancar el motor, para avisar en plataforma que la hélice va a girar, y se queda encendida mientras el motor esté en marcha — por eso nunca te acercas a una hélice con la baliza encendida — y las luces estroboscópicas (strobes), destellos blancos de alta intensidad que se usan tanto de día como de noche para máxima visibilidad, aunque conviene apagarlas dentro de nubes porque el reflejo puede desorientar. Las luces de aterrizaje y rodaje, por su parte, mejoran tanto tu visibilidad ante otros como tu propia visión de la pista o plataforma. Con las reglas de la FAA, las luces de posición van encendidas de la puesta a la salida del sol, y la anticolisión siempre que el avión opere, salvo que el piloto la apague por seguridad (por ejemplo, dentro de nubes).", imagenes: ["/videos/academia/vfr-tema9-0.jpg"]},
      ],
    },
  ],
  "navegacion": [
    {
      titulo: "El VOR y sus radiales",
      interactivos: [],
      temas: [
      { id: "navegacion-tema1", titulo: "Qué es un VOR", texto: "El VOR (VHF Omnidirectional Range) es una radioayuda terrestre que transmite información de rumbo en la banda VHF (108.00–117.95 MHz), permitiendo que el avión determine su posición angular (radial) respecto a la estación. Es la columna vertebral de la navegación aérea tradicional, tanto VFR como IFR, y la base sobre la que se construyen todos los demás conceptos de este módulo: radiales, tracking, intercepción y fixes cruzados. Cada estación VOR transmite 360 cursos posibles (uno por cada grado), y el receptor a bordo interpreta esa señal para decirte exactamente en qué radial te encuentras. La señal viaja en línea de vista: a más altura, más alcance. Antes de usarlo, sintonízalo e identifícalo por su código Morse." , imagenes: ["/videos/academia/navegacion-tema1-0.jpg"]},
      { id: "navegacion-tema2", titulo: "Cómo funciona un VOR", texto: "Técnicamente, la estación VOR transmite dos señales simultáneas: una de fase de referencia (igual en todas direcciones) y una de fase variable (que rota electrónicamente 30 veces por segundo). El receptor del avión mide la diferencia de fase entre ambas señales, y esa diferencia en grados es exactamente tu radial respecto a la estación. No necesitas entender la electrónica a fondo, pero sí esta idea: el VOR no te dice dónde estás en millas, te dice en qué línea recta (radial) estás parado respecto a la estación — para saber la distancia exacta necesitas un DME o cruzar con otro VOR." , imagenes: ["/videos/academia/navegacion-tema2-0.jpg"]},
      { id: "navegacion-tema3", titulo: "Radiales", texto: "Un radial es cada una de las 360 líneas rectas imaginarias que salen del VOR en todas direcciones, numeradas según su rumbo magnético MEDIDO DESDE la estación. El radial 090 es la línea que sale hacia el este de la estación; el radial 270 sale hacia el oeste. Un error común de cadete: el radial siempre se mide DESDE el VOR hacia afuera, nunca hacia la estación. Si estás parado en el radial 090 de un VOR, estás al este de esa estación, sin importar hacia dónde apunte la nariz de tu avión." , imagenes: ["/videos/academia/navegacion-tema3-0.jpg"]},
      ],
    },
    {
      titulo: "TO/FROM, CDI y OBS",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "navegacion-tema4", titulo: "FROM vs TO", texto: "La bandera FROM/TO en tu indicador te dice si, volando el curso seleccionado en el OBS, te alejarías (FROM) o te acercarías (TO) a la estación. Si seleccionas un curso y la bandera dice TO, volar ese rumbo con la aguja centrada te lleva HACIA el VOR; si dice FROM, te lleva alejándote. Es fácil confundirse porque el radial y el curso TO la estación son opuestos entre sí (difieren 180°) — por ejemplo, para volar TO un VOR estando en el radial 090, tu curso sería 270, no 090. Siempre verifica la bandera antes de asumir hacia dónde te lleva el curso seleccionado." , imagenes: ["/videos/academia/navegacion-tema4-0.jpg"]},
      { id: "navegacion-tema5", titulo: "Cómo leer un CDI", texto: "El CDI (Course Deviation Indicator) es la aguja vertical que te muestra qué tan lejos estás del curso seleccionado en el OBS. Cada punto (dot) de desviación representa aproximadamente 2° de error angular respecto al VOR, con un total de 5 puntos a cada lado (10° de escala completa). Si la aguja está a la izquierda, el curso seleccionado está a tu izquierda — vuelas HACIA la aguja para interceptarlo, nunca te alejas de ella. Esto vale siempre que vueles con un rumbo parecido al curso seleccionado; si seleccionas el recíproco, la aguja indica al revés. Una aguja centrada significa que estás exactamente sobre el curso seleccionado. Y cerca de la estación, la misma desviación es menos distancia lateral: la aguja se vuelve más sensible." , imagenes: ["/videos/academia/navegacion-tema5-0.jpg"]},
      { id: "navegacion-tema6", titulo: "Qué es un OBS", texto: "El OBS (Omni Bearing Selector) es la perilla que giras para seleccionar el curso o radial que quieres volar. Al girarla, mueves la referencia interna del instrumento, lo cual cambia tanto la posición de la aguja del CDI como la bandera FROM/TO. Seleccionar un curso en el OBS no cambia tu posición real ni tu rumbo — solo le dice al instrumento qué curso quieres usar como referencia para comparar contra tu posición actual." , imagenes: ["/videos/academia/navegacion-tema6-0.jpg"]},
      ],
    },
    {
      titulo: "Interceptar un radial",
      interactivos: [],
      temas: [
      { id: "navegacion-tema7", titulo: "Cómo interceptar una radial", texto: "Interceptar una radial significa maniobrar tu avión desde tu posición actual hasta quedar exactamente sobre el radial deseado. El proceso es: 1) selecciona el radial deseado en el OBS, 2) con un rumbo parecido al curso seleccionado, observa hacia qué lado apunta la aguja del CDI (eso te dice hacia qué lado queda el radial), 3) gira hacia un rumbo de intercepción que combine tu curso deseado con un ángulo extra hacia el lado donde está la aguja, y 4) mantén ese rumbo hasta que la aguja se acerque al centro, momento en el que giras para alinearte con el curso final." , imagenes: ["/videos/academia/navegacion-tema7-0.jpg"]},
      { id: "navegacion-tema8", titulo: "¿Por qué se recomienda interceptar con 30°?", texto: "No hay un ángulo obligatorio, pero 30° es un buen punto de partida: rápido sin pasarte. Con menos de 30° tardas mucho en cerrar la distancia al radial (intercepción muy lenta y gradual). Con ángulos grandes, y más cerca de la estación, la aguja se centra de golpe y es fácil pasarte del curso (overshoot). 30° te da tiempo suficiente para anticipar el momento de girar hacia el curso final sin pasarte. Lejos de la estación puedes usar 45°; nunca más de 90°." , imagenes: ["/videos/academia/navegacion-tema8-0.jpg"]},
      { id: "navegacion-tema9", titulo: "Cómo calcular el rumbo de interceptación", texto: "La fórmula general es: Rumbo de intercepción = Curso deseado ± Ángulo de intercepción, sumando o restando según de qué lado del curso te encuentres. Si tu curso deseado es 360° y la aguja del CDI está a la derecha (estás al oeste del curso), sumas el ángulo: intercepta con rumbo 030°. Si la aguja está a la izquierda (estás al este del curso), restas: intercepta con rumbo 330°. La regla práctica es \"vuela hacia donde apunta la aguja\": si la aguja está a la derecha, tu rumbo de intercepción debe ser mayor que el curso deseado; si está a la izquierda, menor. Vale siempre que vueles con un rumbo parecido al curso seleccionado; si seleccionas el recíproco, la aguja indica al revés." , imagenes: ["/videos/academia/navegacion-tema9-0.jpg"]},
      ],
    },
    {
      titulo: "Tracking y fijación cruzada",
      interactivos: ["interactividad-2", "interactividad-3"],
      temas: [
      { id: "navegacion-tema10", titulo: "Seguimiento de radiales (Tracking)", texto: "Tracking es mantener tu avión exactamente sobre el radial o curso deseado durante todo el trayecto, corrigiendo constantemente por el viento. A diferencia de simplemente apuntar la nariz hacia la estación, tracking requiere calcular un Ángulo de Corrección por Viento (WCA) — un pequeño desvío del rumbo respecto al curso, hacia el lado de donde viene el viento, para compensar la deriva. Si el viento te empuja hacia la derecha del curso, corriges volando unos grados a la izquierda del curso hasta que la aguja se mantenga centrada, y ese es tu rumbo real de tracking, no tu curso deseado. Al pasar sobre la estación entras al cono de confusión: la aguja oscila y la bandera cambia de TO a FROM; mantén el rumbo hasta que se estabilice." , imagenes: ["/videos/academia/navegacion-tema10-0.jpg"]},
      { id: "navegacion-tema11", titulo: "Homing vs Tracking", texto: "Homing es la técnica (menos precisa) de simplemente apuntar constantemente la nariz del avión hacia la aguja o hacia la estación, sin calcular corrección de viento — el resultado es una trayectoria curva, ineficiente, porque el viento te va desviando y vas ajustando reactivamente en vez de anticipar. Tracking, en cambio, es mantener una línea recta real sobre el suelo usando un ángulo de corrección calculado de antemano, resultando en una ruta más corta, predecible y profesional. Todo piloto instrumental debe dominar tracking; homing es aceptable solo como aproximación inicial burda, nunca como técnica final." , imagenes: ["/videos/academia/navegacion-tema11-0.jpg"]},
      { id: "navegacion-tema12", titulo: "Navegación con dos VOR", texto: "Cuando sintonizas dos estaciones VOR distintas y determinas en qué radial de cada una te encuentras, el punto donde esos dos radiales se cruzan en la carta es tu posición exacta — esta técnica se llama fijación cruzada (cross-fix) y es una de las formas más confiables de confirmar tu posición sin GPS. Se traza cada radial desde su VOR correspondiente en la carta, y la intersección de ambas líneas es tu ubicación real en ese momento. La fijación es más precisa cuando los radiales se cruzan cerca de 90°; si se cruzan en ángulo cerrado, un error chico mueve mucho el punto. Es una habilidad clásica de navegación por radioayudas que todo piloto debe poder ejecutar manualmente." , imagenes: ["/videos/academia/navegacion-tema12-0.jpg"]},
      ],
    },
  ],
  "navegacion-2": [
    {
      titulo: "DME y HSI",
      interactivos: [],
      temas: [
      { id: "navegacion-tema13", titulo: "Qué es un DME", texto: "El DME (Distance Measuring Equipment) mide la distancia real (en línea recta, \"slant range\") entre tu avión y la estación terrestre, en millas náuticas, usando el tiempo que tarda una señal en ir y regresar. Muchas veces está integrado con el VOR (VOR/DME) o con el ILS. Además de distancia, muchos DME calculan y muestran tu velocidad de acercamiento (groundspeed) y tiempo estimado a la estación, información clave para planificación en vuelo; esos dos datos solo son exactos si vuelas directo hacia la estación o alejándote de ella. Ojo: la distancia \"slant range\" incluye tu altura, así que cuanto más alto y más cerca de la estación estés, más se separa de tu distancia horizontal. Es despreciable si estás a 1 NM o más de la estación por cada 1,000 ft de altura sobre ella." , imagenes: ["/videos/academia/navegacion-tema13-0.jpg"]},
      { id: "navegacion-tema14", titulo: "Qué es un HSI", texto: "El HSI (Horizontal Situation Indicator) combina en un solo instrumento el indicador de rumbo (brújula giroscópica) con la información de desviación de curso del VOR/ILS y, en muchos casos, la pendiente de planeo (glideslope). En vez de tener el CDI separado del indicador de rumbo, el HSI los integra visualmente: la rosa de compás gira mostrando tu rumbo real, y sobre ella se superpone la barra de curso seleccionado con su desviación — dándote una imagen mucho más intuitiva de tu situación real respecto al curso, en vez de tener que interpretar dos instrumentos por separado." , imagenes: ["/videos/academia/navegacion-tema14-0.jpg"]},
      { id: "navegacion-tema15", titulo: "Cómo usar un HSI", texto: "Para usar el HSI, seleccionas el curso deseado con el selector de curso (similar al OBS), y el instrumento gira una barra sobre la rosa de compás mostrando ese curso en relación a tu rumbo actual. La desviación de la barra respecto al centro funciona igual que un CDI normal, pero con la ventaja de que ves simultáneamente tu rumbo real, así que es mucho más difícil confundirte sobre hacia qué lado debes girar. Muchos HSI también muestran el bug de rumbo deseado para acoplar con el piloto automático, y la aguja de glideslope si estás en una aproximación ILS." , imagenes: ["/videos/academia/navegacion-tema15-0.jpg"]},
      { id: "navegacion-tema16", titulo: "Diferencias entre CDI y HSI", texto: "El CDI tradicional muestra solo la desviación del curso, sin contexto de tu rumbo real — tienes que mirar el indicador de rumbo por separado y mentalmente combinar ambas lecturas, lo cual genera el clásico problema de \"sensibilidad inversa\" (reverse sensing) cuando vuelas en la dirección equivocada del curso seleccionado, confundiendo a muchos estudiantes. El HSI resuelve este problema integrando rumbo y desviación en una sola imagen visual: la barra de curso siempre se muestra en su orientación real respecto a tu rumbo, eliminando la confusión de sensibilidad inversa y dándote conciencia situacional instantánea. Por eso el HSI es el estándar en cabinas más modernas y de instrumentos avanzados." , imagenes: ["/videos/academia/navegacion-tema16-0.jpg"]},
      ],
    },
    {
      titulo: "ADF, NDB y RMI",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "navegacion-tema17", titulo: "Navegación ADF", texto: "El ADF (Automatic Direction Finder) es un sistema de navegación más antiguo que usa estaciones NDB en tierra. A diferencia del VOR, el ADF no te da radiales — su aguja simplemente apunta directamente hacia la estación en todo momento, mostrando el rumbo relativo (relative bearing) medido desde la nariz de tu avión, sin importar hacia dónde estés volando. Esto lo hace más simple pero también menos preciso y más susceptible a interferencia (tormentas eléctricas, terreno, hora del día) que el VOR. Sigue usándose en algunas regiones del mundo donde la infraestructura VOR es limitada. Para saber el rumbo magnético hacia la estación sumas: rumbo magnético + rumbo relativo = rumbo magnético a la estación (si pasa de 360, le restas 360)." , imagenes: ["/videos/academia/navegacion-tema17-0.jpg"]},
      { id: "navegacion-tema18", titulo: "Cómo funciona un NDB", texto: "El NDB (Non-Directional Beacon) transmite una señal de radio en frecuencia baja/media (LF/MF) de forma igual en todas direcciones — a diferencia del VOR, no codifica información de radial alguna. El receptor ADF a bordo detecta de qué dirección llega la señal y mueve su aguja para apuntar directamente hacia la estación. Esto significa que el NDB por sí solo no te dice en qué radial estás, solo la dirección hacia la estación desde tu posición actual — para saber tu posición real necesitas combinarlo con tu rumbo y, idealmente, otra referencia cruzada." , imagenes: ["/videos/academia/navegacion-tema18-0.jpg"]},
      { id: "navegacion-tema19", titulo: "RMI", texto: "El RMI (Radio Magnetic Indicator) combina una rosa de compás giratoria (mostrando tu rumbo magnético real) con una o dos agujas que apuntan hacia estaciones ADF y/o VOR — la diferencia clave frente al ADF simple es que el RMI te muestra el rumbo magnético REAL hacia la estación (no solo relativo a tu nariz), porque la rosa de compás gira junto con tu avión. Esto hace mucho más fácil interpretar tu posición respecto a la estación de un vistazo, sin tener que hacer cálculos mentales de rumbo relativo más rumbo magnético. Con una aguja de VOR, la punta marca el rumbo magnético a la estación y la cola el radial en el que estás." , imagenes: ["/videos/academia/navegacion-tema19-0.jpg"]},
      ],
    },
    {
      titulo: "Cartas y planificación de ruta",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "navegacion-tema20", titulo: "Cartas VFR", texto: "Las cartas VFR (cartas de navegación visual, tipo sectional) muestran toda la información que necesitas para navegar visualmente: ubicación y clasificación de espacio aéreo (Clase B, C, D, E, G), aeropuertos con sus frecuencias, obstáculos y su altura, elevaciones del terreno, y la ubicación exacta de estaciones VOR con su rosa de compás impresa para poder trazar radiales directamente sobre la carta. Aprender a leer una carta VFR con fluidez —identificar símbolos, calcular elevaciones y reconocer espacio aéreo controlado— es una habilidad base indispensable antes de planear cualquier ruta." , imagenes: ["/videos/academia/navegacion-tema20-0.jpg"]},
      { id: "navegacion-tema21", titulo: "Cómo medir distancias", texto: "En una carta VFR, mides distancias usando la escala gráfica impresa en el margen o un plotter de navegación, comparando la longitud de tu ruta trazada contra esa escala. Un truco práctico y confiable: en cualquier carta, un minuto de latitud (medido verticalmente sobre un meridiano o en los bordes izquierdo y derecho de la carta) equivale a una milla náutica — así que puedes usar los bordes de la carta como regla de distancias sin necesitar un plotter especial, siempre midiendo verticalmente, nunca en los bordes horizontales de longitud." , imagenes: ["/videos/academia/navegacion-tema21-0.jpg"]},
      { id: "navegacion-tema22", titulo: "Cómo saber la distancia a un aeropuerto", texto: "Tienes varias formas. Con DME, el instrumento te da la distancia en millas náuticas hasta la estación; si la estación está en el aeropuerto, es casi tu distancia al aeropuerto. Sin DME, te ubicas con una fijación de dos VOR o por navegación por estima (dead reckoning): estimas dónde estás con tu rumbo, tu velocidad y el tiempo desde el último punto conocido. Con esa posición mides en la carta lo que falta hasta el aeropuerto y lo divides entre tu velocidad respecto al suelo (groundspeed) para saber cuánto tiempo falta. Si tu avión tiene GPS, la distancia y el tiempo estimado aparecen directamente en la pantalla, pero como piloto en entrenamiento debes poder calcularlo sin depender de la electrónica." , imagenes: ["/videos/academia/navegacion-tema22-0.jpg"]},
      { id: "navegacion-tema23", titulo: "Cómo planear una ruta VFR", texto: "Planear una ruta VFR involucra: seleccionar puntos de referencia visuales (checkpoints) claramente identificables desde el aire, medir en la carta el curso verdadero y la distancia entre cada uno y convertirlo en rumbo magnético (con el viento sacas el rumbo y con la variación pasas a magnético), estimar tiempo y consumo de combustible por tramo considerando el viento pronosticado, verificar el espacio aéreo que cruzarás y si necesitas autorización o comunicación con algún control, revisar NOTAMs y METAR/TAF de salida, ruta y destino, y siempre definir un aeropuerto alterno con reservas de combustible adecuadas. Un plan de vuelo VFR bien hecho es la diferencia entre un vuelo tranquilo y una situación de estrés innecesario en el aire." , imagenes: ["/videos/academia/navegacion-tema23-0.jpg"]},
      { id: "navegacion-tema24", titulo: "Ejemplo MMGL → MMZO", texto: "Tomemos la ruta real Guadalajara (MMGL) a Manzanillo (MMZO) como ejercicio integrador de todo el módulo: identificas los VOR disponibles en la ruta para usarlos como checkpoints o para tracking directo, mides la distancia total y por tramos en la carta VFR, calculas el rumbo magnético inicial y cómo cambia si sigues radiales de un VOR intermedio, estimas tiempo total según tu velocidad de crucero y viento pronosticado, y planeas un alterno (por ejemplo Colima) por si las condiciones en Manzanillo no son favorables. Este tipo de ejercicio práctico, aplicando radiales, tracking y cálculo de distancias sobre una ruta real, es el tipo de ejercicio que se practica antes de una travesía." , imagenes: ["/videos/academia/navegacion-tema24-0.jpg"]},
      ],
    },
    {
      titulo: "Arco DME y patrón de espera",
      interactivos: ["interactividad-3", "interactividad-4"],
      temas: [
      { id: "navegacion-tema25", titulo: "Arco DME", texto: "Un arco DME es una trayectoria curva que vuelas manteniendo una distancia constante respecto a una estación — por ejemplo, el arco de 12 millas náuticas alrededor de un VOR/DME. Sirve para conectar una aerovía o un radial con el tramo inicial de una aproximación sin tener que sobrevolar la estación, y es de las pocas maniobras de radionavegación en las que no vuelas en línea recta. La técnica estándar consiste en volar perpendicular a la estación (90° respecto al radial en el que te encuentras) y corregir en pequeños incrementos: cuando el radial avanza unos 10°, giras unos 10° hacia la estación y adelantas el OBS otros 10°; si te acercas de más, giras unos grados hacia afuera. El viraje para entrar al arco se anticipa un poco antes de alcanzar la distancia objetivo; como referencia se usa alrededor de media milla náutica a velocidades de aviación general, valor que conviene ajustar según tu velocidad respecto al suelo.", imagenes: ["/videos/academia/navegacion-tema25-0.jpg"] },
      { id: "navegacion-tema26", titulo: "Patrón de espera", texto: "Un patrón de espera (holding) es un circuito en forma de hipódromo que vuelas alrededor de un fix para retrasar tu llegada de forma ordenada, ya sea porque control te lo asigna por congestión de tráfico o porque forma parte de un procedimiento publicado. Se define por cuatro datos: el fix, el curso de entrada (inbound), el lado de los virajes (a la derecha por convención estándar, salvo que se publique lo contrario) y la duración del tramo. Como referencia ampliamente enseñada, el tramo de acercamiento dura un minuto a 14,000 pies MSL o menos y minuto y medio por encima, volados con virajes de tasa estándar (3° por segundo) — confirma los valores exactos en la publicación vigente. La entrada que te corresponde se determina por el ángulo entre tu rumbo de llegada y el curso de entrada, que divide el espacio alrededor del fix en tres sectores: directa, paralela y en gota (teardrop). El viento se corrige en el tramo de alejamiento, donde se aplica aproximadamente el triple del ángulo de corrección usado en el tramo de acercamiento, ajustando además el tiempo de alejamiento para que el de acercamiento dure lo previsto.", imagenes: ["/videos/academia/navegacion-tema26-0.jpg"] },
      ],
    },
  ],
  "cartografia": [
    {
      titulo: "Cartas, símbolos y espacio aéreo",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "cartografia-tema1", titulo: "Tipos de cartas", texto: "Existen varios tipos de cartas aeronáuticas según su propósito. Las Cartas VFR (Sectional Charts) son las más usadas para vuelo visual, a escala 1:500,000, mostrando terreno, obstáculos, espacio aéreo y aeródromos con gran detalle. Las Cartas de Área Terminal (TAC) cubren zonas de espacio aéreo denso alrededor de grandes ciudades con más detalle aún. Para vuelo IFR existen las Cartas de Ruta de Baja Altitud (para aerovías bajo FL180) y Alta Altitud (para niveles superiores), mucho más simplificadas visualmente porque priorizan aerovías, fixes y frecuencias sobre el detalle del terreno. Las Cartas de Aproximación (approach plates) muestran el procedimiento detallado para aterrizar en un aeropuerto específico bajo IFR.", imagenes: ["/videos/academia/cartografia-tema1-0.jpg"] },
      { id: "cartografia-tema2", titulo: "Símbolos", texto: "Cada carta usa una simbología estandarizada que debes conocer. En los aeropuertos, el color dice si hay torre: azul si tiene torre de control, magenta si no. La forma dice cómo es la pista: un círculo abierto con la pista dibujada adentro es pista dura de 1,500 a 8,069 pies; si es más larga, se dibuja solo la pista; un círculo relleno es una pista que no es dura, de tierra o pasto. Las marquitas alrededor del círculo indican que hay combustible y servicio en horario normal. Los obstáculos se marcan con un punto y una torre pequeña, acompañados de su altura. El terreno se colorea por capas, del verde en lo bajo al café en lo alto. También verás las aerovías Víctor, en azul entre los VOR, y las líneas isogónicas, discontinuas en magenta, que marcan la declinación magnética: la diferencia entre el norte verdadero y el magnético. Aprender la leyenda de tu carta (impresa en los márgenes) es el primer paso: ahí están explicados todos los símbolos oficialmente.", imagenes: ["/videos/academia/cartografia-tema2-0.jpg"] },
      { id: "cartografia-tema3", titulo: "Espacios aéreos", texto: "El espacio aéreo se divide en clases con distintos requisitos: Clase A (solo IFR), Clase B (alrededor de los aeropuertos más grandes, requiere autorización explícita de control para entrar), Clase C (aeropuertos medianos, también requiere autorización con reglas OACI), Clase D (aeropuertos con torre, requiere autorización de la torre), Clase E (espacio controlado general) y Clase G (espacio no controlado, sin marcado especial, generalmente a baja altura en zonas rurales). Los colores y trazos cambian según la carta: en las seccionales de Estados Unidos la B va en azul sólido, la C en magenta sólido y la D en azul discontinuo; la E va en línea discontinua magenta si empieza en la superficie, en franja difuminada magenta si empieza a 700 pies sobre el terreno y en franja azul si empieza a 1,200. Además hay espacio de uso especial, como las MOA (zonas de operaciones militares), con borde rayado magenta: no están prohibidas, pero ahí puede haber aviones militares a alta velocidad, así que se cruzan con precaución y preguntando a control si están activas. Cada carta trae su leyenda. Reconocer estos límites en la carta antes de volar es obligatorio para evitar violaciones de espacio aéreo.", imagenes: ["/videos/academia/cartografia-tema3-0.jpg"] },
      ],
    },
    {
      titulo: "Obstáculos, elevaciones y frecuencias",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "cartografia-tema4", titulo: "Obstáculos", texto: "Los obstáculos —torres de radio, antenas, edificios altos, grúas permanentes— se representan con un símbolo de torre y un punto en su base exacta. Junto al símbolo aparecen dos números: la altura sobre el nivel del mar (MSL) y, entre paréntesis, la altura sobre el terreno (AGL). Por ejemplo, un obstáculo marcado \"1500 (450)\" significa que su punta está a 1,500 pies MSL, de los cuales 450 pies son la estructura misma sobre el terreno local. Los obstáculos de más de 1,000 pies AGL suelen resaltarse con un símbolo más grande por su relevancia para la planificación de rutas y altitudes mínimas de seguridad.", imagenes: ["/videos/academia/cartografia-tema4-0.jpg"] },
      { id: "cartografia-tema5", titulo: "Elevaciones", texto: "Las cartas VFR muestran la elevación del terreno con capas de color, del verde en lo bajo al café en lo alto, y con curvas de nivel: líneas que unen puntos de la misma elevación. Además, cada cuadrante de la carta (delimitado por líneas de latitud y longitud) tiene impreso un número grande llamado MEF (Maximum Elevation Figure): la elevación de lo más alto que hay dentro del cuadrante, terreno u obstáculo, con un pequeño margen por error vertical y por obstáculos no cartografiados, redondeada hacia arriba al siguiente centenar de pies. Se lee con los miles en grande y los cientos en chico: un 12 grande con un 4 chico son 12,400 pies. El MEF no es una altitud segura: es lo más alto que hay ahí. Tu altitud segura va por encima de él, con margen.", imagenes: ["/videos/academia/cartografia-tema5-0.jpg"] },
      { id: "cartografia-tema6", titulo: "Frecuencias", texto: "Las frecuencias de radio relevantes se imprimen directamente junto a cada aeropuerto y límite de espacio aéreo en la carta: CTAF (frecuencia común de tráfico en aeropuertos no controlados), Torre, Aproximación/Salida, y ATIS. Los datos de cada aeropuerto van del mismo color que el aeropuerto: azul con torre, magenta sin torre; las frecuencias de aproximación de las Clases B y C van en recuadros junto a su límite. Antes de acercarte a cualquier aeropuerto o zona de espacio aéreo controlado, debes identificar en la carta qué frecuencia necesitas contactar y en qué punto exacto de tu ruta debes hacerlo — normalmente indicado por el límite dibujado del espacio aéreo correspondiente.", imagenes: ["/videos/academia/cartografia-tema6-0.jpg"] },
      ],
    },
    {
      titulo: "Puntos VFR y lectura completa",
      interactivos: ["interactividad-3", "interactividad-4"],
      temas: [
      { id: "cartografia-tema7", titulo: "Puntos VFR", texto: "Los Puntos de Notificación VFR son ubicaciones visuales específicas —cerros, cruces de carreteras, presas, poblados reconocibles— marcadas en la carta con un nombre corto y un símbolo: en las cartas de Estados Unidos, una banderita magenta (o una estrella magenta si es un waypoint VFR); en las cartas OACI, un triángulo, relleno si el reporte es obligatorio y vacío si es a solicitud. Se usan para comunicar tu posición a control de forma rápida y estandarizada cerca de aeropuertos con tráfico denso o espacio aéreo Clase B, C o D. En vez de dar coordenadas o describir tu ubicación, reportas que estás sobre el punto, por su nombre, y el controlador sabe exactamente dónde estás. Memorizar los puntos VFR de tus aeropuertos frecuentes agiliza mucho la comunicación.", imagenes: ["/videos/academia/cartografia-tema7-0.jpg"] },
      { id: "cartografia-tema8", titulo: "Cómo leer una carta completa", texto: "Leer una carta completa es integrar todo lo anterior en un solo vistazo antes de volar: identifica tu ruta general y qué espacios aéreos vas a cruzar, revisa el MEF de cada cuadrante que atravesarás para volar por encima de él con margen, ubica los obstáculos relevantes en tu trayectoria, localiza los VOR y puntos VFR que usarás como checkpoints, y anota las frecuencias que necesitarás contactar en cada etapa. Un buen hábito es trazar tu ruta completa en la carta ANTES del vuelo con lápiz o marcador, marcando cada checkpoint con su rumbo, distancia y tiempo estimado — así en el aire solo confirmas contra el plan, en vez de estar interpretando la carta en tiempo real bajo presión.", imagenes: ["/videos/academia/cartografia-tema8-0.jpg"] },
      ],
    },
  ],
  "comunicaciones": [
    {
      titulo: "Fraseología, primer contacto y rodaje",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "comunicaciones-tema1", titulo: "Fraseología básica", texto: "La fraseología aeronáutica es un lenguaje estandarizado a nivel mundial (basado en inglés OACI, adaptado al español en países hispanohablantes) diseñado para eliminar ambigüedad en la comunicación radio. Incluye el alfabeto fonético (Alfa, Bravo, Charlie, Delta...) para deletrear matrículas y letras sin confusión, la pronunciación estándar de números (dígito por dígito en rumbos, pistas, frecuencias y códigos: \"rumbo tres cinco cero\" en vez de \"trescientos cincuenta\"; las altitudes, en miles y cientos: \"seis mil quinientos pies\"), y palabras clave con significado fijo: Afirmativo (sí), Negativo (no), Wilco (voy a cumplir la instrucción), Roger (recibido, entendido, sin implicar que cumplirás). Usar fraseología estándar —en vez de lenguaje coloquial— reduce errores y acelera la comunicación en frecuencias congestionadas.", imagenes: ["/videos/academia/comunicaciones-tema1-0.jpg"] },
      { id: "comunicaciones-tema2", titulo: "Primer contacto con Torre", texto: "El primer contacto con cualquier estación sigue una estructura fija: a quién llamas, quién eres, y qué necesitas — en ese orden. Ejemplo: \"Guadalajara Torre, Cessna XB-VLA, en plataforma, solicito rodaje para salida local con información Bravo.\" En aeropuertos grandes, el rodaje puede ir a una frecuencia aparte de la torre: la carta del aeropuerto te dice cuál usar. En el primer contacto siempre das tu matrícula completa; solo cuando la estación te llama con la forma abreviada (el primer carácter y los dos últimos: X-LA) puedes usarla tú también. Incluir la letra de información ATIS que escuchaste confirma que tienes los datos meteorológicos actuales y evita que te los repitan innecesariamente.", imagenes: ["/videos/academia/comunicaciones-tema2-0.jpg"] },
      { id: "comunicaciones-tema3", titulo: "Rodaje", texto: "La autorización de rodaje especifica la ruta exacta que debes seguir y cualquier punto donde debes detenerte y esperar (mantener corto, o hold short). Ejemplo de instrucción: \"XB-VLA, ruede a punto de espera pista 20 por calle Alfa, mantenga corto de pista 20.\" Toda instrucción de mantener corto de una pista se colaciona, sin excepción, igual que cualquier instrucción para entrar, cruzar, despegar o aterrizar en una pista: un error ahí puede causar una incursión de pista. Si no tienes clara la ruta, pide que la repitan antes de moverte.", imagenes: ["/videos/academia/comunicaciones-tema3-0.jpg"] },
      ],
    },
    {
      titulo: "Despegue y circuito",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "comunicaciones-tema4", titulo: "Antes del despegue", texto: "Antes de solicitar la pista, completas tus listas de verificación (run-up, checklist previa a despegue) en el punto de espera o la zona designada. Al estar listo, contactas: \"Torre, XB-VLA, listo para salida, pista 20.\" La OACI reserva la palabra \"despegue\" para la autorización y recomienda decir \"listo para salida\" al reportar; en la práctica también se oye \"listo para despegue\". Las guías de Comunicaciones VFR e IFR de Descargas usan \"listo para salida\". La torre puede pedirte que esperes: \"mantenga posición\" significa que te quedas donde estás, sin entrar a la pista; \"line up and wait\" significa que entras a la pista, te alineas y esperas ahí la autorización de despegue. Nunca cruces el punto de espera ni entres a la pista sin autorización explícita, aunque se vea despejada: la autorización verbal es obligatoria, no opcional.", imagenes: ["/videos/academia/comunicaciones-tema4-0.jpg"] },
      { id: "comunicaciones-tema5", titulo: "Autorización de despegue", texto: "La autorización de despegue tiene un formato específico que debes leer de vuelta completo: \"XB-VLA, autorizado a despegar pista 20, viento 200 a 8 nudos.\" Tu readback debe incluir tu matrícula y la confirmación de \"autorizado a despegar pista 20\" — no basta con decir \"copiado\" o \"roger\". Si la autorización menciona una pista distinta a la que esperas, o algo no coincide con tu plan, pide confirmación inmediata antes de iniciar el despegue; nunca asumas que fue un error de la torre sin confirmar.", imagenes: ["/videos/academia/comunicaciones-tema5-0.jpg"] },
      { id: "comunicaciones-tema6", titulo: "En circuito", texto: "Dentro del circuito de tráfico (patrón), los reportes de posición siguen el orden del circuito: viento en cola (downwind), base, y final. Ejemplo: \"Torre, XB-VLA, viento en cola pista 20\" ... \"XB-VLA, base pista 20\" ... \"XB-VLA, final pista 20.\" Estos reportes le permiten a la torre secuenciar el tráfico y a otros pilotos en el circuito tener conciencia situacional de dónde estás, incluso en aeropuertos no controlados donde te reportas en la frecuencia CTAF sin que nadie te responda directamente, solo para informar a otros pilotos.", imagenes: ["/videos/academia/comunicaciones-tema6-0.jpg"] },
      ],
    },
    {
      titulo: "En ruta y llegada",
      interactivos: ["interactividad-3"],
      temas: [
      { id: "comunicaciones-tema7", titulo: "Reportes de posición", texto: "Fuera del circuito, los reportes de posición en ruta siguen un formato estándar: quién eres, dónde estás (usualmente sobre un punto VFR o un radial de VOR), tu altitud, y tus intenciones. Ejemplo: \"XB-VLA, sobre la presa, siete mil quinientos pies, en tránsito hacia Guadalajara.\" Estos reportes son especialmente importantes cerca de espacio aéreo controlado o en zonas de tráfico denso, donde control (o incluso otros pilotos monitoreando la frecuencia) necesitan saber tu posición exacta para mantener separación.", imagenes: ["/videos/academia/comunicaciones-tema7-0.jpg"] },
      { id: "comunicaciones-tema8", titulo: "Tránsito VFR", texto: "Para cruzar espacio aéreo controlado sin aterrizar (Clase B, C o D) necesitas solicitar y recibir autorización de tránsito VFR antes de entrar. Ejemplo de solicitud: \"Aproximación Guadalajara, Cessna XB-VLA, solicito tránsito VFR de norte a sur, ocho mil quinientos pies, sobre la ciudad.\" Guadalajara está a unos 5,000 pies de elevación, así que esa altitud te deja unos 3,500 pies sobre la ciudad; las altitudes de los ejemplos son ilustrativas. Control puede autorizarte tal cual la solicitud, darte una ruta específica, una altitud distinta, o negarte el tránsito si hay demasiado tráfico — en cuyo caso debes desviarte para rodear el espacio aéreo en vez de cruzarlo sin autorización.", imagenes: ["/videos/academia/comunicaciones-tema8-0.jpg"] },
      { id: "comunicaciones-tema9", titulo: "Aproximación", texto: "Al acercarte a tu aeropuerto de destino dentro de espacio aéreo controlado, usualmente contactas primero a Aproximación (Approach) antes de que te transfieran a Torre. Aproximación te da vectores, altitudes y secuenciación respecto a otro tráfico: \"XB-VLA, vire rumbo 180, descienda y mantenga nueve mil pies, espere vectores para secuencia visual con tráfico Cessna al frente.\" (Altitud de ejemplo: en Guadalajara el aeropuerto está a unos 5,000 pies.) Escucha con atención cualquier instrucción de tráfico a la vista (\"tráfico a las 10, dos millas, mismo nivel\") y reporta cuando lo tengas visualmente.", imagenes: ["/videos/academia/comunicaciones-tema9-0.jpg"] },
      ],
    },
    {
      titulo: "Aterrizaje, IFR, emergencias y errores",
      interactivos: ["interactividad-4", "interactividad-5", "interactividad-6"],
      temas: [
      { id: "comunicaciones-tema10", titulo: "Aterrizaje", texto: "La autorización de aterrizaje llega típicamente cuando estás en tramo final: \"XB-VLA, autorizado a aterrizar pista 20, viento 190 a 6 nudos.\" Igual que con el despegue, tu readback debe confirmar \"autorizado a aterrizar pista 20\" con tu matrícula. Si vas a hacer un touch-and-go (toque y despegue) en vez de aterrizaje completo, debes solicitarlo explícitamente y la autorización lo reflejará: \"autorizado toque y despegue pista 20.\" Nunca asumas autorización de aterrizaje solo porque no escuchaste instrucción contraria — el silencio no es autorización.", imagenes: ["/videos/academia/comunicaciones-tema10-0.jpg"] },
      { id: "comunicaciones-tema11", titulo: "Comunicaciones IFR", texto: "Bajo reglas IFR, las comunicaciones son más estructuradas y con mayor carga de información. Antes de salir recibes tu autorización (clearance) en el orden CRAFT: el límite de la autorización (normalmente tu destino), la ruta, la altitud inicial, la frecuencia de salida y el código del transpondedor (squawk). La colacionas completa, con todos sus elementos, sobre todo el código y las altitudes. El controlador escucha tu colación: si algo está mal, te corrige y repites la versión correcta antes de continuar. Lo que te autoriza es la autorización misma; la colación solo confirma que la entendiste bien. La disciplina de colación es aún más crítica en IFR porque hay menos referencias visuales para detectar un error a tiempo.", imagenes: ["/videos/academia/comunicaciones-tema11-0.jpg"] },
      { id: "comunicaciones-tema12", titulo: "Emergencias", texto: "Existen dos niveles de llamada de emergencia por radio: PAN-PAN (repetido 3 veces) para una situación urgente que no representa peligro inmediato de vida (por ejemplo, un pasajero enfermo), y MAYDAY (repetido 3 veces) para peligro grave e inminente (falla de motor, incendio a bordo). El formato es: \"MAYDAY, MAYDAY, MAYDAY, [estación a la que llamas, si hay tiempo], [matrícula], [naturaleza de la emergencia], [posición], [altitud], [almas a bordo], [combustible restante], [intenciones].\" Un MAYDAY tiene prioridad sobre cualquier otra comunicación; un PAN-PAN, sobre todas menos un MAYDAY. Control hará todo lo posible por asistirte — no dudes en declararla si la situación lo amerita, es preferible declarar de más que de menos.", imagenes: ["/videos/academia/comunicaciones-tema12-0.jpg"] },
      { id: "comunicaciones-tema13", titulo: "Errores comunes", texto: "Los errores más frecuentes en comunicaciones incluyen: omitir el readback de instrucciones críticas (especialmente \"mantenga corto\" de pista y autorizaciones de despegue/aterrizaje), usar tu matrícula incompleta antes de que torre te autorice a abreviarla, bloquear la frecuencia hablando al mismo tiempo que otra estación (\"stepping on\" transmisiones), asumir una autorización que nunca se dio explícitamente, y usar lenguaje coloquial en vez de fraseología estándar en momentos críticos. La disciplina de radio no es cuestión de sonar profesional — es una herramienta de seguridad: cada elemento de la fraseología existe porque previene un tipo específico de error o malentendido que históricamente ha causado incidentes.", imagenes: ["/videos/academia/comunicaciones-tema13-0.jpg"] },
      ],
    },
  ],
  "instrumentos": [
    {
      titulo: "Altímetro, velocidad y actitud",
      interactivos: ["interactividad-5"],
      temas: [
      { id: "instrumentos-tema1", titulo: "Altímetro", texto: "El altímetro mide tu altitud usando la presión estática del aire exterior, comparándola contra una referencia que ajustas manualmente en la ventana Kollsman (en México y EUA, en pulgadas de mercurio, inHg; en muchos otros países, en hectopascales). Existen varios tipos de altitud: Indicada (lo que lees directo), Verdadera (altura real sobre el nivel del mar, corregida por temperatura), de Presión (referencia estándar 29.92) y de Densidad (la de presión corregida por temperatura, la que afecta el rendimiento real del avión). Regla clave: 'de alta a baja presión, cuidado abajo' — si vuelas de una zona de alta presión hacia una de baja sin ajustar tu Kollsman, tu altímetro te muestra más altura de la que realmente tienes, un error peligroso cerca del terreno. Con la temperatura pasa igual: en aire más frío que el estándar estás más bajo de lo que indica." , imagenes: ["/videos/academia/instrumentos-tema1-0.jpg"]},
      { id: "instrumentos-tema2", titulo: "Velocidad indicada", texto: "El indicador de velocidad (Airspeed Indicator) compara la presión total que capta el tubo pitot, que enfrenta el viento relativo, con la presión estática: la diferencia es la presión dinámica, y eso es tu velocidad. El disco tiene arcos de color con significado operacional: blanco (rango de operación de flaps), verde (rango normal de operación), amarillo (precaución, solo en aire calmo), y una línea roja (Vne, velocidad nunca exceder). Es importante distinguir IAS (velocidad indicada, lo que lees), CAS (corregida por errores de instalación y del instrumento), y TAS (verdadera, ajustada por densidad del aire a tu altitud) — a mayor altitud, tu TAS real es mayor que tu IAS indicada." , imagenes: ["/videos/academia/instrumentos-tema2-0.jpg"]},
      { id: "instrumentos-tema3", titulo: "Horizonte artificial", texto: "El Horizonte Artificial (Attitude Indicator) es tu referencia primaria de actitud: muestra tu inclinación (bank) y cabeceo (pitch) respecto al horizonte real, usando un giroscopio que mantiene su orientación en el espacio independientemente del movimiento del avión. Tradicionalmente accionado por vacío (bomba de vacío) o eléctricamente en aviones más modernos. Es especialmente crítico en vuelo por instrumentos (IMC): es el único que te muestra la actitud directamente, y los demás instrumentos lo confirman. Como cualquier giróscopo mecánico, puede sufrir precesión (error gradual acumulado) y requiere revisión periódica contra otros instrumentos para confirmar que sigue siendo confiable." , imagenes: ["/videos/academia/instrumentos-tema3-0.jpg"]},
      ],
    },
    {
      titulo: "Viraje y velocidad vertical",
      interactivos: ["interactividad-1", "interactividad-4"],
      temas: [
      { id: "instrumentos-tema4", titulo: "Giro y viraje", texto: "El indicador de Giro y Viraje (Turn and Bank / Turn Needle) muestra tu TASA de giro —qué tan rápido estás virando en grados por segundo— no tu ángulo de inclinación. Un 'viraje estándar' (standard rate turn) es 3 grados por segundo, completando un giro de 360° en exactamente 2 minutos, y es la referencia que se enseña para procedimientos instrumentales. Junto a la aguja de tasa de giro va la bola inclinómetro, que indica si tu viraje está coordinado (bola centrada), derrapando hacia afuera (skidding, bola hacia el lado exterior del viraje) o resbalando hacia adentro (slipping, bola hacia el interior) — información clave para pisar el pedal correcto y corregir." , imagenes: ["/videos/academia/instrumentos-tema4-0.jpg"]},
      { id: "instrumentos-tema5", titulo: "Coordinador de viraje", texto: "El Coordinador de Viraje (Turn Coordinator) es una evolución del indicador de giro y viraje: en vez de una aguja simple, usa un pequeño avión miniatura inclinado que muestra tanto tu velocidad de alabeo (roll rate) como tu tasa de giro combinadas en un solo movimiento. Mantiene la misma bola inclinómetro en la base para verificar coordinación. Es más intuitivo de leer en maniobras dinámicas porque responde más rápido al inicio de un viraje que el indicador de giro tradicional, dándote información antes en la maniobra." , imagenes: ["/videos/academia/instrumentos-tema5-0.jpg"]},
      { id: "instrumentos-tema6", titulo: "VSI", texto: "El VSI (Vertical Speed Indicator, o Variómetro) muestra tu tasa de ascenso o descenso en pies por minuto (fpm), midiendo el cambio en la presión estática a través de un sistema de fuga calibrada. Su característica más importante es el retraso (lag): la tendencia —si subes o bajas— aparece casi de inmediato, pero la tasa exacta tarda entre 6 y 9 segundos en estabilizarse, por lo que no debes usarlo como referencia primaria para maniobras rápidas de cabeceo — el horizonte artificial es más inmediato para eso. El VSI es excelente para mantener tasas constantes de ascenso/descenso durante tramos prolongados, como en una aproximación estabilizada." , imagenes: ["/videos/academia/instrumentos-tema6-0.jpg"]},
      ],
    },
    {
      titulo: "Rumbo: compás, HSI y RMI",
      interactivos: ["interactividad-3"],
      temas: [
      { id: "instrumentos-tema7", titulo: "Compás", texto: "El compás magnético es el instrumento de rumbo más simple y el único indicador de rumbo que funciona sin electricidad ni vacío, pero sufre errores característicos que debes conocer: Variación (diferencia entre norte magnético y verdadero, varía por ubicación geográfica), Desviación (interferencia de componentes eléctricos/metálicos del propio avión), y errores dinámicos por la inclinación magnética (dip) — el más conocido es ANDS (Accelerate North, Decelerate South en el hemisferio norte): al acelerar en rumbo este u oeste, el compás marca un viraje hacia el norte que no existe, y al desacelerar marca uno hacia el sur; en rumbo norte o sur no aparece. También oscila y se retrasa durante virajes, por lo que en maniobras se usa el indicador de rumbo giroscópico, recalibrado periódicamente contra el compás en vuelo recto y nivelado." , imagenes: ["/videos/academia/instrumentos-tema7-0.jpg"]},
      { id: "instrumentos-tema8", titulo: "HSI", texto: "Como instrumento físico, el HSI combina un giro direccional (heading gyro) con la información de desviación de curso VOR/ILS en una sola carátula integrada. A diferencia del compás magnético, no sufre de los errores dinámicos de oscilación y ANDS porque su referencia de rumbo es giroscópica, no magnética directa. Si está esclavizado a un compás remoto, se mantiene sincronizado solo; si no, debe sincronizarse periódicamente con el compás magnético para corregir la deriva natural del giróscopo (precesión). Reemplaza tanto al indicador de rumbo como al CDI tradicional en cabinas más equipadas." , imagenes: ["/videos/academia/instrumentos-tema8-0.jpg"]},
      { id: "instrumentos-tema9", titulo: "RMI", texto: "Como instrumento físico, el RMI combina una carátula de compás giroscópico (igual que el indicador de rumbo) con una o dos agujas indicadoras que apuntan hacia estaciones ADF y/o VOR sintonizadas. La rosa completa gira con tu rumbo, así que la punta de cada aguja te da directamente el rumbo magnético hacia la estación, no solo un rumbo relativo a tu nariz como el ADF simple. Es apreciado por su capacidad de dar orientación instantánea respecto a dos estaciones simultáneamente, útil para fixes cruzados sin cálculos mentales adicionales." , imagenes: ["/videos/academia/instrumentos-tema9-0.jpg"]},
      ],
    },
    {
      titulo: "DME y transponder",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "instrumentos-tema10", titulo: "DME", texto: "Como instrumento físico, el DME transmite un pulso de interrogación a la estación terrestre y mide el tiempo que tarda en recibir la respuesta, calculando la distancia por la velocidad conocida de la señal de radio. Esa distancia es oblicua, en línea recta hasta la antena: sobre la estación a 6,000 pies marca cerca de 1 milla. La carátula típica muestra tres datos simultáneos: distancia en millas náuticas, velocidad respecto al suelo (groundspeed) calculada por el cambio de distancia en el tiempo —exacta solo si vuelas directo hacia la estación o desde ella—, y tiempo estimado a la estación. Es común encontrarlo integrado físicamente con el receptor de NAV/VOR en el mismo panel, ya que la frecuencia del DME va pareada con la del VOR." , imagenes: ["/videos/academia/instrumentos-tema10-0.jpg"]},
      { id: "instrumentos-tema11", titulo: "Transponder", texto: "El Transponder es el equipo que responde automáticamente a las interrogaciones del radar de control de tráfico aéreo, transmitiendo un código de 4 dígitos (squawk) que identifica tu aeronave en la pantalla del controlador, junto con tu altitud si tienes Modo C o Modo S (que además transmite datos adicionales). Existen códigos de squawk universales de emergencia que nunca debes usar salvo la situación correspondiente: 7500 (secuestro/interferencia ilícita), 7600 (falla de comunicaciones), y 7700 (emergencia general). El botón IDENT resalta momentáneamente tu posición en la pantalla del controlador cuando te lo solicitan, útil para que te identifiquen entre tráfico denso." , imagenes: ["/videos/academia/instrumentos-tema11-0.jpg"]},
      ],
    },
  ],
  "rendimiento": [
    {
      titulo: "Peso, balance y distancias de despegue/aterrizaje",
      interactivos: ["interactividad-3", "interactividad-2"],
      temas: [
      { id: "rendimiento-tema1", titulo: "Peso y balance", texto: "Todo avión tiene un Peso Máximo de Despegue certificado (Max Gross Weight) que no puedes exceder bajo ninguna circunstancia — hacerlo compromete la estructura, el rendimiento de despegue, la tasa de ascenso, y la velocidad de pérdida real. El cálculo parte del Peso Vacío del avión (Empty Weight, incluye el avión y fluidos operativos), al que sumas tripulación, pasajeros, equipaje y combustible para obtener tu Peso Bruto de la operación (Gross Weight). La diferencia entre el peso máximo certificado y el peso vacío es tu Carga Útil (Useful Load) — lo que realmente puedes cargar entre personas, equipaje y combustible, sin exceder el límite." , imagenes: ["/videos/academia/rendimiento-tema1-0.jpg"]},
      { id: "rendimiento-tema2", titulo: "Centro de gravedad", texto: "El Centro de Gravedad (CG) es el punto donde, teóricamente, se concentra todo el peso del avión — y debe mantenerse dentro de un rango certificado (el 'sobre' o envelope de CG) para que el avión sea controlable y estable. Se calcula mediante Momento = Peso × Brazo (distancia desde un punto de referencia), sumando los momentos de cada elemento (piloto, pasajeros, equipaje, combustible) y dividiendo entre el peso total para obtener la posición del CG. Un CG muy adelantado hace al avión más estable pero pesado de controlar en cabeceo (especialmente en el flare de aterrizaje) y sube su velocidad de pérdida; un CG muy atrasado lo hace menos estable, y la recuperación de una pérdida o barrena puede volverse difícil o imposible." , imagenes: ["/videos/academia/rendimiento-tema2-0.jpg"]},
      { id: "rendimiento-tema3", titulo: "Distancia de despegue", texto: "La distancia de despegue depende de múltiples factores que debes calcular antes de cada vuelo usando las gráficas de rendimiento del manual (POH/AFM): peso de la aeronave (a mayor peso, mayor distancia), altitud de densidad (a mayor altitud de densidad, motor y alas rinden menos, mayor distancia), viento (viento de frente reduce la distancia, viento de cola la aumenta significativamente), y condición de la pista (pasto, lodo, nieve, agua acumulada o pendiente ascendente aumentan la distancia necesaria). Nunca asumas que 'siempre me ha alcanzado la pista' — cada combinación de peso, densidad y viento es distinta, y calcular mal puede significar no despegar a tiempo con obstáculos al final de la pista." , imagenes: ["/videos/academia/rendimiento-tema3-0.jpg"]},
      { id: "rendimiento-tema4", titulo: "Distancia de aterrizaje", texto: "Similar al despegue, la distancia de aterrizaje se ve afectada por peso (mayor peso = mayor velocidad de aproximación = mayor distancia de frenado), altitud de densidad (afecta la velocidad real de touchdown aunque la indicada sea la misma), viento (de frente reduce distancia, de cola la aumenta drásticamente — en un Cessna 172 el manual pide sumar 10% por cada 2 nudos de cola: con 10 nudos, la distancia crece 50%; el dato cambia de un avión a otro, así que búscalo en el manual del tuyo), y superficie de la pista (mojada o con contaminantes reduce la efectividad del frenado). Las gráficas de rendimiento del POH deben consultarse antes de cualquier aterrizaje en pista corta o con condiciones fuera de lo habitual, no solo confiar en la experiencia." , imagenes: ["/videos/academia/rendimiento-tema4-0.jpg"]},
      ],
    },
    {
      titulo: "Performance, V-speeds y viento cruzado",
      interactivos: ["interactividad-1", "interactividad-4"],
      temas: [
      { id: "rendimiento-tema5", titulo: "Performance", texto: "Las gráficas de rendimiento (performance charts) en el manual de tu avión son la herramienta central para todos los cálculos anteriores: te permiten entrar con condiciones específicas (peso, temperatura, altitud de presión, viento) y obtener distancias, tasas de ascenso, consumo de combustible o alcance esperado. La habilidad clave es la interpolación — cuando tus condiciones reales caen entre dos líneas o valores impresos en la gráfica, debes estimar proporcionalmente el valor intermedio, no simplemente redondear al valor más cercano. Siempre aplica un margen de seguridad adicional sobre el valor calculado (una regla común es sumar 50% a la distancia de pista calculada), ya que las gráficas se hicieron con aviones nuevos y pilotos de prueba en condiciones ideales." , imagenes: ["/videos/academia/rendimiento-tema5-0.jpg"]},
      { id: "rendimiento-tema6", titulo: "V-speeds", texto: "Las V-speeds son velocidades codificadas críticas para operar tu avión con seguridad: Vs1 (pérdida en configuración limpia), Vs0 (pérdida en configuración de aterrizaje), Vx (mejor ángulo de ascenso, para despejar obstáculos), Vy (mejor tasa de ascenso, para ganar altura más rápido en tiempo), Va (velocidad de maniobra: hasta ella puedes llevar un solo control a fondo, una vez, sin dañar la estructura, pero no combinarlos ni invertirlos; y baja cuando el avión pesa menos), Vfe (máxima con flaps extendidos), Vno (máxima de crucero estructural: por encima, solo en aire calmo), Vne (nunca exceder), y Vr (rotación, velocidad a la que levantas la nariz en el despegue). Memorizar las V-speeds específicas de TU avión (no solo el concepto general) es examinable y, más importante, es lo que evita que dañes la estructura o entres en pérdida en el momento equivocado." , imagenes: ["/videos/academia/rendimiento-tema6-0.jpg"]},
      { id: "rendimiento-tema7", titulo: "Viento cruzado", texto: "El componente de viento cruzado es la parte del viento que sopla perpendicular a la pista (no alineada con ella), y determina qué tan desafiante será tu despegue o aterrizaje. Se calcula usando el ángulo entre el viento reportado y el rumbo de la pista — cuanto más cerca de 90°, mayor el componente cruzado; cuanto más cerca de 0° (viento alineado con la pista), menor. Cada avión tiene un Viento Cruzado Máximo Demostrado (Max Demonstrated Crosswind) en su manual — no es un límite legal absoluto, pero operar por encima de ese valor está fuera de lo que el fabricante probó y documentó. Las dos técnicas principales para manejarlo son el Crab (apuntar la nariz contra el viento durante la aproximación, alineando justo antes del touchdown) y el Sideslip (bajar el ala hacia el viento con alerón mientras usas el timón opuesto para mantener la nariz alineada con la pista durante todo el aterrizaje)." , imagenes: ["/videos/academia/rendimiento-tema7-0.jpg"]},
      ],
    },
  ],
  "operacion": [
    {
      titulo: "Inspección, arranque, taxi, run-up y despegue",
      interactivos: ["interactividad-2", "interactividad-4"],
      temas: [
      { id: "operacion-tema1", titulo: "Inspección pre-vuelo", texto: "La inspección pre-vuelo (walk-around) es tu primera línea de defensa contra fallas mecánicas en el aire, y debe hacerse SIEMPRE de forma sistemática, siguiendo cada vez el mismo orden, el que marca el POH de tu avión, para no saltarte ningún punto (en el C172: cabina, cola, ala derecha, nariz y ala izquierda). Revisas: superficies de control (movimiento libre, sin daño), niveles de fluidos (aceite, combustible visualmente en los tanques), presión y estado de las llantas, estructura general (sin abolladuras, grietas o corrosión visible), luces, antenas, y drenado de agua del sistema de combustible. Nunca te saltes la inspección por 'ya la volé ayer' — las condiciones cambian de un vuelo a otro, incluso de una hora a otra." , imagenes: ["/videos/academia/operacion-tema1-0.jpg"]},
      { id: "operacion-tema2", titulo: "Checklist", texto: "Una checklist no reemplaza tu conocimiento del avión — verifica que aplicaste correctamente ese conocimiento. Hay dos maneras de usarla. En las fases de rutina se usa 'flujo + verificación': primero ejecutas la secuencia de memoria en un flujo lógico por la cabina, y luego lees la checklist para CONFIRMAR que no omitiste nada. En lo poco frecuente, lo anormal y el resto de una emergencia se usa 'leer y ejecutar': lees cada línea y la haces antes de pasar a la siguiente. Existen checklists Normales (operación de rutina), Anormales (situaciones fuera de lo común pero no de emergencia inmediata), y de Emergencia (memorizables para los primeros pasos críticos, luego consultadas para el resto). La disciplina de usar checklist en cada vuelo, sin importar tu experiencia, es lo que distingue a un piloto profesional de uno que confía solo en su memoria." , imagenes: ["/videos/academia/operacion-tema2-0.jpg"]},
      { id: "operacion-tema3", titulo: "Arranque del motor", texto: "El arranque de motor sigue una secuencia específica del fabricante, pero generalmente incluye: frenos puestos, baliza encendida, mezcla y palanca de potencia en posición correcta, cebado (priming) si el motor lo requiere en frío, encendido de la bomba de combustible si aplica, y antes de girar la llave, la llamada de seguridad 'DESPEJADO' (clear prop) en voz alta para alertar a cualquiera cerca de la hélice. Una vez arrancado, monitoreas inmediatamente la presión de aceite — si no sube en el tiempo que marca el POH (en el C172S, al arco verde en 30 a 60 segundos), apagas el motor de inmediato, ya que operar sin lubricación adecuada puede dañar el motor severamente en muy poco tiempo." , imagenes: ["/videos/academia/operacion-tema3-0.jpg"]},
      { id: "operacion-tema4", titulo: "Taxi", texto: "Durante el rodaje controlas la dirección principalmente con los pedales de timón (que mueven la rueda de nariz en la mayoría de entrenadores) y usas potencia mínima necesaria para mantener movimiento, evitando velocidades excesivas. Verifica el funcionamiento de los frenos justo al iniciar el movimiento (un leve toque para confirmar respuesta antes de continuar). Con viento, colocas los mandos para que no te levante un ala ni la cola. En un aeropuerto controlado ruedas con autorización, por la ruta que te dan, y nunca cruzas la línea de espera de una pista sin que te lo autoricen (hold short). Mantén conciencia situacional constante de otro tráfico, vehículos de servicio, y instrucciones de control si estás en un aeropuerto controlado — el rodaje es quizás el momento donde más incursiones de pista y colisiones en tierra ocurren por distracción, así que exige la misma atención que el vuelo mismo." , imagenes: ["/videos/academia/operacion-tema4-0.jpg"]},
      { id: "operacion-tema5", titulo: "Run-up", texto: "El run-up (prueba de motor antes de despegue) se hace generalmente en un punto designado cerca de la cabecera de pista, con el avión orientado contra el viento y frenos aplicados firmemente. Incluye: verificar cada magneto individualmente (la caída de RPM al cambiar de AMBOS a solo uno debe estar dentro del rango del manual, y ninguno debe apagar el motor completamente), probar el calentador de carburador si aplica, revisar instrumentos del motor (temperaturas, presiones dentro de rango normal), y completar la checklist 'antes de despegue' que incluye configuración final de flaps, trim, y repaso mental de qué harás si el motor falla justo después de despegar." , imagenes: ["/videos/academia/operacion-tema5-0.jpg"]},
      { id: "operacion-tema6", titulo: "Despegue", texto: "Durante la carrera de despegue, mantienes la dirección con los pedales de timón mientras aplicas potencia completa suavemente pero sin demora, monitoreando los instrumentos del motor en los primeros segundos para confirmar parámetros normales. Antes de alinearte decides en qué punto de la pista abortarías: si algo va mal antes de ese punto, cierras potencia y frenas. Al alcanzar la velocidad de rotación (Vr) específica de tu avión, aplicas presión suave hacia atrás en los controles para levantar la nariz y comenzar el ascenso inicial. Después del despegue, sigues el procedimiento de 'limpieza' de configuración: retraer flaps si los usaste (a la altura/velocidad segura indicada en tu POH) y, si tu avión tiene tren retráctil, retraerlo en el momento apropiado según el manual." , imagenes: ["/videos/academia/operacion-tema6-0.jpg"]},
      ],
    },
    {
      titulo: "Ascenso, crucero, descenso, aproximación y aterrizaje",
      interactivos: ["interactividad-1", "interactividad-3", "interactividad-5"],
      temas: [
      { id: "operacion-tema7", titulo: "Ascenso", texto: "Durante el ascenso eliges entre Vx (mejor ángulo, para despejar obstáculos cercanos rápidamente en altura por distancia recorrida) o Vy (mejor tasa, para ganar altitud más rápido en tiempo, una vez pasados los obstáculos inmediatos) según la situación. Monitoreas temperaturas del motor con más atención que en crucero, ya que el ascenso prolongado con potencia alta y velocidad relativamente baja genera menos flujo de aire de enfriamiento. En motores con mezcla ajustable, muchos POH recomiendan empobrecer ligeramente la mezcla por encima de cierta altitud para mantener la combustión eficiente, aunque en ascensos cortos a baja altitud generalmente se mantiene mezcla rica." , imagenes: ["/videos/academia/operacion-tema7-0.jpg"]},
      { id: "operacion-tema8", titulo: "Crucero", texto: "Al nivelar en tu altitud de crucero, bajas la nariz y dejas que el avión acelere a la velocidad de crucero; después reduces potencia al ajuste recomendado por el POH y compensas con el trim, y ajustas la mezcla de combustible (leaning) para optimizar consumo y rendimiento del motor a esa altitud específica — volar en crucero con mezcla completamente rica innecesariamente desperdicia combustible y puede ensuciar bujías. Este es también el momento de menor carga de trabajo relativo para tareas de navegación: confirmar tu posición contra el plan de vuelo, ajustar el rumbo por deriva de viento, y hacer tus reportes de posición si aplica, sin descuidar el escaneo visual constante de tráfico." , imagenes: ["/videos/academia/operacion-tema8-0.jpg"]},
      { id: "operacion-tema9", titulo: "Descenso", texto: "Planear el punto de inicio de descenso con anticipación evita tener que descender abruptamente cerca del destino. Una regla práctica común: multiplica la altitud a perder (en miles de pies) por 3, y ese es aproximadamente cuántas millas antes del punto deseado debes iniciar el descenso. Para seguir esa pendiente, la tasa de descenso es unas 5 veces tu velocidad sobre el terreno: a 100 nudos, unos 500 pies por minuto. Antes de descender, reduces potencia gradualmente, y muchos pilotos aprovechan este momento para reajustar la mezcla hacia más rica conforme bajan de altitud, escuchar el ATIS (o el reporte meteorológico) del destino y ajustar el altímetro, y repasar mentalmente la configuración esperada de aproximación y aterrizaje." , imagenes: ["/videos/academia/operacion-tema9-0.jpg"]},
      { id: "operacion-tema10", titulo: "Aproximación", texto: "Al entrar al circuito de tráfico de tu destino, configuras progresivamente el avión: reduces potencia, extiendes flaps en las etapas y velocidades indicadas por tu POH, y estableces una aproximación estabilizada — mantenida en la velocidad correcta, con la tasa de descenso adecuada, alineado con la pista, configurado completamente, a más tardar a 500 pies sobre la pista en vuelo visual (1,000 en instrumentos). Una aproximación inestable (muy rápida, muy alta, mal alineada, o con configuración incompleta) es la señal más clara para ejecutar un go-around (motor y al aire) en vez de forzar el aterrizaje — decisión que siempre debe tomarse sin dudar ni sentir vergüenza." , imagenes: ["/videos/academia/operacion-tema10-0.jpg"]},
      { id: "operacion-tema11", titulo: "Aterrizaje", texto: "El aterrizaje culmina con el flare (redondeo): reduces la tasa de descenso justo antes de tocar tierra, elevando gradualmente la nariz para que las llantas principales toquen primero suavemente, cerca de tu velocidad de pérdida en configuración de aterrizaje (Vs0). Mantén los controles activos durante todo el rodaje después de tocar tierra, especialmente en viento cruzado, hasta detenerte completamente o reducir a velocidad de rodaje segura. Si en cualquier momento del flare o aterrizaje algo no se siente correcto —velocidad excesiva, deriva lateral no corregida, bote (bounce)— la decisión correcta sigue siendo el go-around, incluso a pocos pies del suelo." , imagenes: ["/videos/academia/operacion-tema11-0.jpg"]},
      { id: "operacion-tema12", titulo: "Después del aterrizaje", texto: "Una vez fuera de la pista activa (cruzando completamente la línea de espera), ejecutas la checklist 'después de aterrizaje': usualmente retraer flaps, apagar luces de aterrizaje si aplica, y ajustar la mezcla según el rodaje hacia la plataforma. Al llegar a tu posición de estacionamiento, sigues el procedimiento de apagado del motor (mezcla a corte, magnetos apagados, verificación de que todo quede en posición segura), y completas la inspección post-vuelo: anotar cualquier anomalía observada durante el vuelo, asegurar el avión (calzos, amarres si aplica), y dejar la bitácora actualizada para el siguiente piloto o para mantenimiento." , imagenes: ["/videos/academia/operacion-tema12-0.jpg"]},
      ],
    },
  ],
  "espacios-aereos": [
    {
      titulo: "Espacio aéreo controlado: Clases A a E",
      interactivos: ["interactividad-2"],
      temas: [
      { id: "espacios-aereos-tema1", titulo: "Clase A", texto: "La Clase A es espacio aéreo solo para vuelos IFR: el vuelo VFR no está permitido. Todo vuelo necesita autorización del control, y el control separa a todos los aviones entre sí. En qué nivel empieza depende de cada país y lo publica su AIP; en México se consulta en la sección ENR 1.4. Ojo con el material de Estados Unidos: allá la Clase A empieza en FL180, pero ese número es de la FAA y no aplica en México. Para un piloto VFR hay otra regla que funciona como techo: la OACI no permite vuelo VFR por encima de FL200 salvo autorización.", imagenes: ["/videos/academia/espacios-aereos-tema1-0.jpg"] },
      { id: "espacios-aereos-tema2", titulo: "Clase B", texto: "En la Clase B vuelan IFR y VFR, y el control separa a todos los vuelos entre sí, incluidos los VFR. Para entrar necesitas autorización explícita: hacer la llamada no basta, tienes que escuchar que te autorizan a ingresar. Se usa alrededor de los aeropuertos con más tránsito, con forma escalonada como un pastel de bodas de cabeza: angosta abajo y más ancha con la altura. Necesitas radio para hablar en ambos sentidos con el control, y normalmente transpondedor con reporte de altitud; el AIP dice dónde es obligatorio. Para el VFR es el espacio más restrictivo, porque la A ni siquiera lo admite.", imagenes: ["/videos/academia/espacios-aereos-tema2-0.jpg"] },
      { id: "espacios-aereos-tema3", titulo: "Clase C", texto: "En la Clase C vuelan IFR y VFR. El control separa a los IFR de todos los demás; al VFR lo separa de los IFR y le da información de tránsito sobre otros VFR. Con las reglas de la OACI, que son las de México, necesitas autorización del control para entrar, igual que en la B. Esta es la diferencia más confusa con el material de Estados Unidos, donde para la C basta con establecer contacto por radio. Los VFR tienen un límite de 250 nudos por debajo de 10,000 pies, y necesitas radio operativo y el transpondedor que pida el AIP.", imagenes: ["/videos/academia/espacios-aereos-tema3-0.jpg"] },
      { id: "espacios-aereos-tema4", titulo: "Clase D", texto: "La Clase D es la que más se usa en las zonas de control (CTR) de aeropuertos con torre. Vuelan IFR y VFR, pero el control solo separa a los IFR entre sí: el VFR recibe información de tránsito y la separación con otros vuelos es su responsabilidad. Con reglas OACI necesitas autorización de la torre para entrar, y aplica el límite de 250 nudos por debajo de 10,000 pies. La OACI recomienda que una CTR se extienda al menos 5 millas náuticas (9.3 km) desde el centro del aeródromo en las direcciones de aproximación; las medidas reales de cada una están en el AIP. Cuando la torre cierra, el espacio cambia a lo que publique el AIP para ese horario, muchas veces espacio no controlado.", imagenes: ["/videos/academia/espacios-aereos-tema4-0.jpg"] },
      { id: "espacios-aereos-tema5", titulo: "Clase E", texto: "La Clase E es espacio controlado, pero solo para los IFR: ellos necesitan autorización y el control los separa entre sí. El VFR puede entrar sin autorización y sin radio, y recibe información de tránsito cuando es posible. Como en C y D, el VFR vuela a 250 nudos o menos por debajo de 10,000 pies. Aunque no hables con nadie, aplican los mínimos VMC de espacio controlado: 5 km de visibilidad por debajo de 10,000 pies, y 1,500 metros horizontal y 1,000 pies vertical de las nubes. Dónde empieza y dónde termina lo publica el AIP. Las alturas de 700 y 1,200 pies sobre el terreno que aparecen en muchos videos son de las cartas de Estados Unidos.", imagenes: ["/videos/academia/espacios-aereos-tema5-0.jpg"] },
      ],
    },
    {
      titulo: "Espacio aéreo Clase G y áreas especiales",
      interactivos: ["interactividad-1", "interactividad-3", "interactividad-4"],
      temas: [
      { id: "espacios-aereos-tema6", titulo: "Clase G", texto: "La Clase G es espacio no controlado: el control no separa a nadie y solo da información de vuelo. El VFR no necesita autorización ni radio; el IFR sí debe llevar radio. Los mínimos son más permisivos que en espacio controlado: hasta 3,000 pies sobre el nivel del mar o 1,000 pies sobre el terreno, lo que quede más alto, basta con 5 km de visibilidad, mantenerte libre de nubes y ver la superficie. En el altiplano cuenta el terreno: en el valle de México, con el suelo a unos 7,300 pies, eso llega hasta unos 8,300 pies. La separación con otros aviones depende por completo de ti: ver y evitar. La OACI también define la Clase F, con un servicio de asesoramiento para IFR, pero es poco común.", imagenes: ["/videos/academia/espacios-aereos-tema6-0.jpg"] },
      { id: "espacios-aereos-tema7", titulo: "Áreas restringidas", texto: "Una zona restringida (R) es un espacio con límites definidos donde solo se puede volar cumpliendo ciertas condiciones, porque ahí hay actividad peligrosa para otros aviones: entrenamiento militar, tiro o actividades parecidas. Se designa con el prefijo del país, la letra R y un número; en México el formato es MM R seguido del número, y la lista está en el AIP (ENR 5.1). No es una prohibición absoluta: se puede cruzar con autorización de quien la controla, y muchas solo están activas en horarios publicados. Fuera de ese horario pueden quedar libres, pero confírmalo siempre en los NOTAM. Cruzar una restringida activa sin permiso no es solo una infracción: es un riesgo físico real.", imagenes: ["/videos/academia/espacios-aereos-tema7-0.jpg"] },
      { id: "espacios-aereos-tema8", titulo: "Áreas prohibidas", texto: "Una zona prohibida (P) es un espacio donde el vuelo está prohibido. Se designa con el prefijo del país, la letra P y un número; en México, MM P seguido del número. Suele proteger instalaciones estratégicas, de seguridad nacional o de gobierno. A diferencia de las restringidas, no tiene horario activo: la prohibición es permanente. La prohibición es para cualquier avión y no se levanta pidiendo autorización por radio: entrar expone al piloto a consecuencias legales graves y a una posible interceptación.", imagenes: ["/videos/academia/espacios-aereos-tema8-0.jpg"] },
      { id: "espacios-aereos-tema9", titulo: "Áreas peligrosas", texto: "Una zona peligrosa (D) avisa que ahí puede haber actividad riesgosa para los aviones: ejercicios militares, disparos o paracaidismo. En México se designa MM D seguido de un número. A diferencia de la restringida, no está prohibido entrar ni necesitas autorización, pero lo haces bajo tu propio riesgo. Muchas están sobre aguas internacionales, donde ningún país puede cerrar el paso: por eso se avisan en lugar de prohibirse. La recomendación es evitarlas cuando estén activas y revisar los NOTAM antes del vuelo. En el material de Estados Unidos verás algo parecido con el nombre de Warning Area.", imagenes: ["/videos/academia/espacios-aereos-tema9-0.jpg"] },
      { id: "espacios-aereos-tema10", titulo: "Cómo afectan a un vuelo VFR", texto: "Al planear una ruta VFR, en cada tramo te preguntas tres cosas. Primero, comunicaciones: en B, C y D necesitas autorización del control antes de entrar; en E y G no. Segundo, equipo: radio en ambos sentidos donde necesites autorización, y el transpondedor que pida el AIP. Tercero, mínimos: por debajo de 10,000 pies, 5 km de visibilidad y 1,500 metros horizontal y 1,000 pies vertical de las nubes; a 10,000 pies o más, 8 km. En espacio no controlado y a baja altura basta con 5 km, libre de nubes y viendo la superficie. Y por debajo de 10,000 pies vuelas a 250 nudos o menos en C, D, E y G. Además revisas el techo de cada espacio, es decir, hasta qué altitud aplica su clase; las rutas VFR que publica el AIP para cruzar o rodear un espacio controlado, que en B, C y D siguen pidiendo autorización; los NOTAM que cambian un espacio o crean restricciones temporales; y si cruzas una ADIZ (zona de identificación de defensa aérea), que pide procedimientos extra como plan de vuelo y transpondedor. Al volar a Estados Unidos cruzas la suya. Entrar a un espacio sin autorización puede costarte una llamada de atención, una sanción o, en el peor caso, una situación de tránsito peligrosa por falta de coordinación.", imagenes: ["/videos/academia/espacios-aereos-tema10-0.jpg"] },
      ],
    },
  ],
  "reglamentacion": [
    {
      titulo: "Reglas VFR/IFR, licencias y horas de vuelo",
      interactivos: ["interactividad-1"],
      temas: [
      { id: "reglamentacion-tema1", titulo: "Reglas VFR", texto: "El vuelo VFR (Visual Flight Rules) se hace en condiciones meteorológicas visuales (VMC): con la visibilidad y la distancia de las nubes que pide cada clase de espacio aéreo, y mirando afuera para ver y evitar el tránsito, el terreno y los obstáculos. Las reglas de derecho de paso dicen quién se aparta. Si dos aviones se acercan de frente, ambos viran a su derecha. Si sus rutas convergen, cede el que tiene al otro a su derecha. Al alcanzar a otro avión, el alcanzado tiene prioridad y quien lo alcanza lo pasa por la derecha. El avión que aterriza o está en final tiene prioridad sobre los que vuelan o están en tierra. Y las aeronaves menos maniobrables (globos, planeadores, dirigibles) tienen prioridad sobre los aviones con motor. Además, hay que llevar a bordo la documentación del avión y del piloto. Por encima de todo, el piloto al mando es el responsable final del vuelo y de cumplir estas reglas." , imagenes: ["/videos/academia/reglamentacion-tema1-0.jpg"]},
      { id: "reglamentacion-tema2", titulo: "Reglas IFR", texto: "El vuelo IFR (Instrument Flight Rules) permite volar sin referencia visual externa, navegando por instrumentos. Antes de salir hay que presentar un plan de vuelo. En espacio controlado, además, recibes la autorización del control y sigues exactamente la ruta y la altitud autorizadas: cualquier desviación necesita una nueva autorización, salvo emergencia. Fuera del espacio controlado nadie te da instrucciones: vuelas con tu plan de vuelo y el servicio de información de vuelo. El avión debe llevar el equipo que la regulación exige para IFR (instrumentos de vuelo y radios de navegación aprobados), y el piloto necesita la capacidad de vuelo por instrumentos inscrita en su licencia y experiencia reciente, con aproximaciones y procedimientos practicados; confirma el detalle con tu autoridad." , imagenes: ["/videos/academia/reglamentacion-tema2-0.jpg"]},
      { id: "reglamentacion-tema3", titulo: "Licencias", texto: "En México, la AFAC (Agencia Federal de Aviación Civil) expide las licencias con el Reglamento para la Expedición de Permisos, Licencias y Certificados de Capacidad del Personal Técnico Aeronáutico. No lo confundas con el RAC 61, que es el reglamento de Colombia. La progresión empieza con el permiso para formación como piloto, para volar con instructor y practicar solo; no permite vuelo internacional ni llevar pasajeros. Sigue el piloto privado (PPL), para el servicio privado no comercial en aviones de hasta 5,700 kg. Luego el piloto comercial (CPL), que vuela para terceros y en transporte público como piloto al mando hasta 5,700 kg, o como copiloto de cualquier avión; se examina ya con instrumentos y multimotor y pide título profesional de piloto. Al final, el piloto de transporte público ilimitado (TPI, el ATPL de la OACI), obligatorio para ser piloto al mando de transporte público en aviones de más de 5,700 kg. A la licencia se le suman capacidades o habilitaciones (ratings), como instrumentos, multimotor o instructor de vuelo." , imagenes: ["/videos/academia/reglamentacion-tema3-0.jpg"]},
      { id: "reglamentacion-tema4", titulo: "Horas de vuelo", texto: "En México, las horas mínimas están en el reglamento de licencias. Piloto privado (art. 50): 40 horas, con al menos 20 con instructor, 5 solo, 5 de travesía con una ruta de al menos 150 millas náuticas y dos aterrizajes en puntos distintos, y 5 en los dos meses anteriores a la solicitud. Piloto comercial (art. 54): 180 horas de instrucción, con 100 como piloto al mando, 20 solo, 5 de noche, 10 en multimotor, 15 reales bajo reglas IFR y 10 en los dos meses anteriores. TPI (art. 56): 1,500 horas. Como comparación, la OACI pide 40, 200 y 1,500 horas; cada país fija las suyas. El reglamento se reforma (la última vez, en agosto de 2023), así que antes de un trámite confirma la versión vigente con la AFAC." , imagenes: ["/videos/academia/reglamentacion-tema4-0.jpg"]},
      ],
    },
    {
      titulo: "Requisitos, mínimos meteorológicos y combustible de reserva",
      interactivos: ["interactividad-2", "interactividad-3", "interactividad-4"],
      temas: [
      { id: "reglamentacion-tema5", titulo: "Requisitos", texto: "Además de las horas, una licencia pide el certificado de aptitud psicofísica vigente, que es como se llama en México el certificado médico, de la clase que corresponde a la licencia (en la OACI, clase 2 para privado y clase 1 para comercial y TPI). Pide la edad mínima: en México, 18 años para comercial y 21 años para TPI; para privado, el permiso de formación pide ser mayor de edad al terminar su vigencia, y la OACI pide 17. Pide aprobar los exámenes teóricos y el examen práctico de vuelo con un examinador designado, y la bitácora de vuelo con tus horas certificadas por la AFAC. La licencia dura tres años y se revalida con horas recientes en la bitácora (para privado, 3 horas en los últimos dos meses) y el certificado de aptitud psicofísica vigente. Para radiocomunicación en inglés se pide la competencia lingüística de la escala OACI: el nivel 4 dura tres años, el nivel 5 dura seis años y el nivel 6 ya no se vuelve a evaluar." , imagenes: ["/videos/academia/reglamentacion-tema5-0.jpg"]},
      { id: "reglamentacion-tema6", titulo: "Mínimos meteorológicos", texto: "Para volar VFR, cada clase de espacio aéreo tiene mínimos de visibilidad y de distancia de las nubes. Con la tabla de la OACI, que es la que usa México, dependen sobre todo de la altitud. Por debajo de 10,000 pies se piden 5 km de visibilidad, y 1,500 m horizontales y 1,000 pies verticales de las nubes. Por encima, la visibilidad sube a 8 km. Solo cerca del suelo, en espacio F y G, basta con 5 km, libre de nubes y con la superficie a la vista. La tabla completa está en el módulo Espacios aéreos. En IFR, cada aeropuerto publica techo y visibilidad mínimos en sus cartas de aproximación. El plan IFR lleva un aeropuerto alterno, salvo que el pronóstico del destino sea claramente bueno, y no sales si ni el destino ni el alterno tienen un pronóstico igual o mejor que los mínimos a tu hora de llegada." , imagenes: ["/videos/academia/reglamentacion-tema6-0.jpg"]},
      { id: "reglamentacion-tema7", titulo: "Combustible de reserva", texto: "La regulación exige llevar combustible para completar el vuelo planeado y, además, una reserva por si surge un desvío, una espera o un imprevisto. La referencia de la OACI para la aviación general (Anexo 6, Parte II) es esta. En VFR de día, combustible hasta el destino y 30 minutos más a velocidad de crucero normal. En VFR de noche, hasta el destino y 45 minutos más. En IFR, hasta el destino, luego hasta el aeropuerto alterno, y después 45 minutos más. Confirma el valor vigente con la AFAC antes de aplicarlo a un vuelo real. Son mínimos de cumplimiento obligatorio, nunca opcionales, y no son un objetivo: con viento en contra o de noche, conviene cargar más." , imagenes: ["/videos/academia/reglamentacion-tema7-0.jpg"]},
      ],
    },
  ],
  "ifr": [
    {
      titulo: "Plan de vuelo IFR: SID, aerovías y STAR",
      temas: [
      { id: "ifr-tema1", titulo: "¿Qué es IFR?", texto: "IFR (Instrument Flight Rules) es el conjunto de reglas que permite volar navegando exclusivamente por instrumentos, sin depender de referencia visual externa —ya sea porque las condiciones meteorológicas lo requieren (IMC) o porque el piloto elige operar bajo IFR incluso con buen clima (VMC) para aprovechar rutas estructuradas y prioridad de tránsito. A diferencia de VFR, bajo IFR estás en contacto y bajo control continuo de ATC durante todo el vuelo, siguiendo una ruta y altitud autorizadas específicas, con separación garantizada respecto a otro tráfico IFR por el propio sistema de control, no por tu propia observación visual." , imagenes: ["/images/temas/ifr-tema1.jpg"]},
      { id: "ifr-tema2", titulo: "Plan de vuelo IFR", texto: "Un plan de vuelo IFR incluye: tipo de aeronave y equipo a bordo (códigos estandarizados de navegación/vigilancia), ruta específica (aerovías o directos entre fixes), altitud de crucero solicitada, combustible a bordo, y aeropuerto alterno con sus requisitos. Antes de salir, recibes tu autorización (clearance) de control, que sigue el formato mnemotécnico CRAFT: Clearance limit (hasta dónde llega la autorización), Route (ruta autorizada, puede diferir de lo solicitado), Altitude (altitud inicial y final), Frequency (frecuencia de salida a contactar), y Transponder (código squawk asignado). Debes leer de vuelta la autorización completa antes de proceder." , imagenes: ["/images/temas/ifr-tema2.jpg"]},
      { id: "ifr-tema3", titulo: "Salidas SID", texto: "Una SID (Standard Instrument Departure) es un procedimiento publicado que conecta el aeropuerto de salida con la estructura de aerovías en ruta, diseñado específicamente para garantizar separación de obstáculos y terreno durante el ascenso inicial, además de organizar el flujo de salida en aeropuertos de tráfico denso. Incluye restricciones específicas de altitud y a veces de velocidad en puntos determinados de la ruta, que debes cumplir salvo instrucción contraria de control. Volar una SID reduce significativamente la carga de comunicación por radio, ya que gran parte de la ruta y restricciones ya están pre-autorizadas en el propio procedimiento publicado." , imagenes: ["/images/temas/ifr-tema3.jpg"]},
      { id: "ifr-tema4", titulo: "Aerovías", texto: "Las aerovías son corredores aéreos publicados que conectan puntos fijos (generalmente VOR o fixes definidos por coordenadas) formando la estructura principal de rutas IFR. Se dividen en Aerovías Victor (baja altitud, típicamente hasta FL180, definidas por radiales VOR) y Rutas Jet (alta altitud, sobre FL180, igualmente basadas en navegación por radioayudas o RNAV). Volar una aerovía significa seguir la línea recta publicada entre los fixes que la componen, a la altitud asignada por control, con separación garantizada respecto a otros aviones en la misma estructura por parte del sistema ATC." , imagenes: ["/images/temas/ifr-tema4.jpg"]},
      { id: "ifr-tema5", titulo: "STAR", texto: "Una STAR (Standard Terminal Arrival Route) es el procedimiento inverso a la SID: conecta la estructura de aerovías en ruta con el área terminal de tu aeropuerto de destino, organizando el descenso y la entrada al espacio aéreo denso alrededor del aeropuerto de forma estructurada. Al igual que la SID, incluye restricciones de altitud y velocidad en puntos específicos, diseñadas para secuenciar el tráfico entrante de forma ordenada y reducir la carga de comunicación de control durante una de las fases más ocupadas del vuelo. Generalmente termina conectando con el segmento inicial de una aproximación instrumental." , imagenes: ["/images/temas/ifr-tema5.jpg"]},
      ],
    },
    {
      titulo: "Aproximaciones: ILS, RNAV, VOR y holding",
      temas: [
      { id: "ifr-tema6", titulo: "Aproximaciones ILS", texto: "El ILS (Instrument Landing System) es una aproximación de precisión que provee guía tanto lateral (Localizer, alineación con el eje de pista) como vertical (Glideslope, ángulo de descenso hacia el umbral, típicamente 3°), permitiéndote descender con gran precisión incluso en visibilidad muy reducida. Se clasifica en categorías (CAT I, II, III) según qué tan bajos son los mínimos de techo y visibilidad permitidos, requiriendo equipo y entrenamiento adicional para las categorías más exigentes. El punto crítico de decisión se llama DA (Decision Altitude): al llegar a esa altitud, debes tener referencia visual suficiente para aterrizar, o ejecutar inmediatamente el procedimiento de aproximación frustrada (missed approach)." , imagenes: ["/images/temas/ifr-tema6.jpg"]},
      { id: "ifr-tema7", titulo: "RNAV", texto: "RNAV (Area Navigation) es un método de navegación que usa GPS/GNSS para volar directamente entre waypoints definidos por coordenadas, sin depender de estaciones terrestres como VOR. Las aproximaciones RNAV pueden tener distintos niveles de precisión y mínimos asociados: LNAV (guía lateral únicamente, similar a una aproximación no de precisión), LNAV/VNAV (guía lateral y vertical calculada, mínimos más bajos), y LPV (Localizer Performance with Vertical guidance, la más precisa, con mínimos comparables a un ILS categoría I en muchos casos). RNAV ha expandido enormemente el acceso a aproximaciones de precisión en aeropuertos que nunca tuvieron ILS instalado físicamente." , imagenes: ["/images/temas/ifr-tema7.jpg"]},
      { id: "ifr-tema8", titulo: "VOR Approach", texto: "Una aproximación VOR es una aproximación de no precisión que usa un radial de una estación VOR (a menudo ubicada en el propio campo o cerca de él) como guía lateral únicamente — no hay guía vertical electrónica como en el ILS. En vez de una Decision Altitude, usa una MDA (Minimum Descent Altitude): una altitud mínima que no puedes cruzar sin referencia visual, y que puedes mantener volando nivelado (en vez de en descenso continuo) hasta el punto de aproximación frustrada si no adquieres la pista visualmente. Frecuentemente incluye fixes de descenso escalonado (step-down fixes) que te permiten bajar progresivamente conforme confirmas tu posición sobre puntos específicos de la aproximación." , imagenes: ["/images/temas/ifr-tema8.jpg"]},
      { id: "ifr-tema9", titulo: "Holding", texto: "Un holding (espera) es un patrón de vuelo hipódromo (forma de pista de carreras) que usas para retrasar tu llegada de forma ordenada — ya sea por instrucción de control debido a congestión de tráfico, o como parte de un procedimiento publicado de aproximación. Se define por un fix, un rumbo de entrada (inbound course), y un lado de vueltas (generalmente a la derecha). Existen tres tipos de entrada según tu rumbo de llegada al fix: Directa (la más simple, entras derecho al patrón), Paralela (vuelas paralelo al rumbo de entrada antes de virar), y en Teardrop (gota, vuelas alejándote en ángulo antes de virar hacia el fix) — el tipo correcto depende geométricamente de desde qué dirección te aproximas al fix." , imagenes: ["/images/temas/ifr-tema9.jpg"]},
      { id: "ifr-tema10", titulo: "Vuelo IFR completo", texto: "Un vuelo IFR real integra todos los elementos anteriores en secuencia: presentas tu plan de vuelo con ruta, altitud y alterno, recibes tu autorización (clearance) siguiendo el formato CRAFT, despegas siguiendo una SID publicada con sus restricciones, vuelas la aerovía asignada bajo control continuo de ATC con cambios de frecuencia conforme cruzas sectores, desciendes siguiendo una STAR hacia tu destino, y ejecutas una aproximación instrumental (ILS, RNAV o VOR según disponibilidad y mínimos) hasta aterrizar o ejecutar una aproximación frustrada con posible holding si el tráfico o el clima lo requieren. Practicar este flujo completo, de principio a fin, en simulador es la mejor preparación posible antes de volarlo en condiciones reales de IMC." , imagenes: ["/images/temas/ifr-tema10.jpg"]},
      ],
    },
  ],
};

/** Aplana las lecciones de un módulo en su lista de temas (subtemas → lecciones individuales). */
export function flattenTemas(slug: string): Tema[] | undefined {
  const lecciones = MODULE_LECCIONES[slug];
  return lecciones?.flatMap((l) => l.temas.map((t) => ({ ...t, ...TEMA_PUNTOS[t.id] })));
}

// ---------- Términos (para el widget de relacionar) ----------

export const MODULE_TERMS: Record<string, TermPair[]> = {
  meteorologia: [
    { id: "met-1", term: "METAR", definition: "Reporte de las condiciones meteorológicas actuales de un aeródromo, emitido cada hora." },
    { id: "met-2", term: "TAF", definition: "Pronóstico del tiempo esperado en un aeropuerto, válido por 24 a 30 horas." },
    { id: "met-3", term: "BKN", definition: "Cobertura de nubes fragmentada, entre 5 y 7 octavos del cielo cubiertos." },
    { id: "met2-1", term: "SKC / CLR", definition: "SKC: cielo despejado. CLR: la estación automática no detectó nubes por debajo de 12,000 pies." },
    { id: "met2-2", term: "Punto de rocío", definition: "Temperatura a la que el aire se satura de humedad; cuanto más cerca de la temperatura del aire, mayor probabilidad de niebla o nubes bajas." },
    { id: "met2-4", term: "Visibilidad", definition: "Distancia horizontal máxima a la que se pueden ver e identificar objetos." },
    { id: "met2-5", term: "QNH", definition: "Ajuste de presión del altímetro referido al nivel del mar." },
  ],
  "navegacion": [
    { id: "nav-1", term: "VOR", definition: "Radioayuda terrestre que indica en qué radial te encuentras respecto a la estación." },
    { id: "nav-2", term: "Radial", definition: "Línea recta imaginaria medida DESDE el VOR hacia afuera, según su rumbo magnético." },
    { id: "nav2-1", term: "TO/FROM", definition: "Bandera del CDI que indica si, volando el curso seleccionado, te acercas o te alejas de la estación." },
    { id: "nav-3", term: "CDI", definition: "Aguja que muestra qué tan lejos estás del curso seleccionado en el OBS." },
    { id: "nav-4", term: "OBS", definition: "Perilla que giras para seleccionar el curso o radial que quieres volar." },
  ],
  "navegacion-1b": [
    { id: "nav-5", term: "Tracking", definition: "Mantener el avión sobre el curso deseado corrigiendo constantemente por el viento." },
    { id: "nav2-6", term: "Homing", definition: "Volar con la nariz siempre hacia la estación, sin corregir el viento; produce una trayectoria curva." },
    { id: "nav2-7", term: "Paso sobre la estación", definition: "Momento en que el avión sobrevuela justo el VOR, cuando la bandera cambia de TO a FROM." },
    { id: "nav-8", term: "Cross-fix", definition: "Cruzar dos radiales de distintos VOR para confirmar tu posición exacta." },
  ],
  "navegacion-2": [
    { id: "nav-6", term: "DME", definition: "Mide la distancia real en línea recta entre el avión y la estación, en millas náuticas." },
    { id: "nav-7", term: "HSI", definition: "Combina el indicador de rumbo con la desviación de curso VOR/ILS en un solo instrumento." },
    { id: "nav2-5", term: "ADF", definition: "Instrumento que apunta directamente hacia una estación NDB." },
    { id: "nav2-rmi", term: "RMI", definition: "Indicador que combina la rosa de rumbos giratoria con una aguja que apunta a la estación: da el rumbo magnético directo, sin sumar ni restar nada." },
    { id: "nav2-ndb", term: "NDB", definition: "Estación en tierra que transmite en frecuencia baja o media igual en todas direcciones; el ADF apunta hacia ella." },
  ],
  "navegacion-2b": [
    { id: "nav2-2", term: "Rumbo magnético", definition: "Rumbo verdadero corregido por la variación magnética: la dirección de la nariz respecto al norte magnético." },
    { id: "nav2-3", term: "Deriva (Wind drift)", definition: "Desviación de tu trayectoria real respecto al rumbo que vuelas, causada por el viento." },
    { id: "nav2-4", term: "Triángulo de navegación", definition: "Relación entre rumbo, viento y trayectoria real sobre el terreno." },
    { id: "nav2-espera", term: "Patrón de espera", definition: "Circuito en forma de hipódromo basado en un fijo que permite mantener la aeronave en una posición conocida mientras se resuelve una demora." },
    { id: "nav2-gota", term: "Entrada de gota", definition: "Una de las tres formas de incorporarse a una espera; corresponde cuando llegas al fijo con un rumbo parecido al de alejamiento, hasta 70° hacia el lado de la espera." },
    { id: "nav2-arco", term: "Arco DME", definition: "Trayectoria curva a distancia constante de una estación DME; se mantiene con virajes cortos hacia la estación cada vez que la distancia empieza a crecer." },
  ],
  cartografia: [
    { id: "cart-1", term: "Carta VFR (Sectional)", definition: "Carta a escala 1:500,000 usada para vuelo visual, con terreno, obstáculos y espacio aéreo." },
    { id: "cart-2", term: "Aeropuerto controlado", definition: "Tiene torre de control y se dibuja en azul en la carta." },
    { id: "cart-3", term: "Espacio Clase B", definition: "Líneas azules sólidas, en capas con su altura mínima y máxima; requiere autorización explícita para entrar." },
    { id: "cart3-3", term: "Espacio Clase D", definition: "Línea azul discontinua en las cartas de EUA; con reglas OACI pide autorización de la torre para entrar." },
  ],
  "cartografia-2": [
    { id: "cart2-1", term: "MEF", definition: "Cifra de la elevación más alta dentro de un cuadrante de la carta, con margen por obstáculos." },
    { id: "cart2-2", term: "CTAF", definition: "Frecuencia común de tráfico en aeropuertos no controlados." },
    { id: "cart-4", term: "Obstáculo '1500 (450)'", definition: "1,500 pies MSL de altura total, de los cuales 450 pies son la estructura sobre el terreno." },
    { id: "cart3-1", term: "Curvas de nivel", definition: "Líneas que conectan puntos de igual elevación del terreno." },
  ],
  comunicaciones: [
    { id: "com-1", term: "Wilco", definition: "Significa 'voy a cumplir la instrucción recibida'." },
    { id: "com-2", term: "Roger", definition: "Significa 'recibido, entendido', sin implicar que cumplirás la instrucción." },
    { id: "com2-5", term: "Affirm", definition: "Significa 'sí'; se usa en vez de un simple 'sí' para evitar confusión con otras palabras." },
    { id: "com2-4", term: "Negative", definition: "Significa 'no' o 'permiso no otorgado'; nunca se usa un simple 'no'." },
    { id: "com2-2", term: "Say again", definition: "Solicitud para que la otra estación repita su último mensaje." },
    { id: "com2-3", term: "Standby", definition: "Espera; la estación necesita un momento antes de responder." },
    { id: "com-3", term: "Readback obligatorio", definition: "Se exige siempre para mantener corto y para entrar, cruzar, despegar o aterrizar en una pista." },
  ],
  instrumentos: [
    { id: "ins-1", term: "Kollsman", definition: "Ventana del altímetro donde ajustas manualmente la presión de referencia." },
    { id: "ins-2", term: "Vne", definition: "Línea roja en el velocímetro: velocidad que nunca debe excederse." },
    { id: "ins-3", term: "Horizonte artificial", definition: "Instrumento primario de actitud, accionado por vacío o eléctricamente." },
    { id: "ins-4", term: "Viraje estándar", definition: "Tasa de giro de 3° por segundo; completa 360° en 2 minutos." },
    { id: "ins-5", term: "VSI", definition: "Muestra la tasa de ascenso o descenso; la tasa exacta tarda 6-9 segundos en estabilizarse." },
    { id: "ins-6", term: "ANDS", definition: "Error del compás magnético al acelerar o desacelerar en rumbos este-oeste." },
    { id: "ins-7", term: "Squawk 7700", definition: "Código de transponder para emergencia general." },
  ],
  rendimiento: [
    { id: "ren-1", term: "Carga útil", definition: "Diferencia entre el peso máximo certificado y el peso vacío del avión." },
    { id: "ren-2", term: "Centro de gravedad", definition: "Punto donde se concentra el peso; debe mantenerse dentro de un rango certificado." },
    { id: "ren-3", term: "Vx", definition: "Mejor ángulo de ascenso, usada para despejar obstáculos." },
    { id: "ren-4", term: "Vy", definition: "Mejor tasa de ascenso, para ganar altitud más rápido en el tiempo." },
    { id: "ren-5", term: "Va", definition: "Velocidad de maniobra: hasta ella puedes llevar un solo control a fondo una vez sin dañar la estructura; baja con menos peso." },
    { id: "ren-6", term: "Interpolación", definition: "Estimar proporcionalmente un valor entre dos líneas de una gráfica de rendimiento." },
    { id: "ren-7", term: "Crosswind máx. demostrado", definition: "Valor máximo probado por el fabricante, no un límite legal absoluto." },
  ],
  operacion: [
    { id: "op-1", term: "Walk-around", definition: "Inspección pre-vuelo sistemática siguiendo siempre el mismo patrón." },
    { id: "op-2", term: "Flujo + verificación", definition: "Ejecutar acciones de memoria y luego confirmar con la checklist." },
    { id: "op-3", term: "Clear prop", definition: "Llamada de seguridad antes de arrancar el motor." },
    { id: "op-4", term: "Run-up", definition: "Prueba de motor antes de despegue, incluyendo verificación de cada magneto." },
    { id: "op-5", term: "Aproximación estabilizada", definition: "Velocidad, tasa de descenso, alineación y configuración correctas a más tardar a 500 ft sobre la pista." },
    { id: "op-6", term: "Go-around", definition: "Abortar el aterrizaje y volver a intentarlo; nunca debe dudarse." },
    { id: "op-7", term: "Flare", definition: "Redondeo final donde se reduce la tasa de descenso justo antes de tocar tierra." },
  ],
  "espacios-aereos": [
    { id: "esp-1", term: "Clase A", definition: "Solo IFR; el VFR no está permitido. Dónde empieza lo publica el AIP de cada país." },
    { id: "esp-2", term: "Clase B", definition: "IFR y VFR; el control separa a todos los vuelos, incluso a los VFR entre sí." },
    { id: "esp-3", term: "Clase C", definition: "El control separa al VFR de los IFR y le da información de otros VFR." },
    { id: "esp-4", term: "Clase G", definition: "Espacio no controlado; 've y evita' es la única regla de separación." },
    { id: "esp-5", term: "Área restringida (R-)", definition: "Actividad peligrosa; se cruza con autorización, y muchas solo se activan en horarios publicados o por NOTAM." },
    { id: "esp-6", term: "Área prohibida (P-)", definition: "Vuelo prohibido para cualquier avión, sin horario." },
  ],
  reglamentacion: [
    { id: "reg-1", term: "VFR", definition: "Vuelo en condiciones visuales (VMC), con los mínimos de cada espacio, viendo y evitando." },
    { id: "reg-2", term: "IFR", definition: "Vuelo por instrumentos, con plan de vuelo y, en espacio controlado, autorización del control." },
    { id: "reg-3", term: "PPL", definition: "Piloto privado: servicio privado no comercial, en aviones de hasta 5,700 kg." },
    { id: "reg-4", term: "AFAC", definition: "Autoridad que expide las licencias de piloto en México, con su Reglamento de licencias." },
  ],
  "reglamentacion-2": [
    { id: "reg2-1", term: "Checkride", definition: "Examen práctico de vuelo con un examinador designado." },
    { id: "reg2-2", term: "Reserva VFR diurna", definition: "Referencia mínima ampliamente enseñada: 30 minutos más allá del destino." },
    { id: "reg2-3", term: "Aptitud psicofísica", definition: "Certificado médico vigente que pide toda licencia, de la clase que le corresponde." },
  ],
  ifr: [
    { id: "ifr-1", term: "CRAFT", definition: "Formato de la autorización: Clearance, Route, Altitude, Frequency, Transponder." },
    { id: "ifr-2", term: "SID", definition: "Procedimiento de salida que conecta el aeropuerto con la estructura de aerovías." },
    { id: "ifr-3", term: "STAR", definition: "Procedimiento que conecta la ruta en aerovía con el área terminal de destino." },
    { id: "ifr-4", term: "DA", definition: "Altitud de decisión en una aproximación ILS." },
    { id: "ifr-5", term: "MDA", definition: "Altitud mínima de descenso en una aproximación de no precisión (VOR)." },
    { id: "ifr-6", term: "LPV", definition: "Aproximación RNAV más precisa, con mínimos comparables a un ILS CAT I." },
    { id: "ifr-7", term: "Holding", definition: "Patrón de espera en forma de hipódromo para retrasar la llegada de forma ordenada." },
  ],
  "meteorologia-2": [
    { id: "met-4", term: "Frente frío", definition: "Aire frío que avanza y genera clima violento pero de corta duración." },
    { id: "met-5", term: "Turbulencia de estela", definition: "Vórtices que deja en las puntas de ala todo avión que produce sustentación; más fuertes detrás de los pesados, lentos y limpios." },
    { id: "met-6", term: "Wind shear", definition: "Cambio brusco de dirección o velocidad del viento en una distancia corta." },
    { id: "met2-6", term: "Inversión térmica", definition: "Capa de la atmósfera donde la temperatura aumenta con la altitud, en vez de disminuir." },
    { id: "met2-7", term: "Virga", definition: "Precipitación visible que se evapora antes de llegar al suelo." },
    { id: "met2-3", term: "Engelamiento (Icing)", definition: "Formación de hielo en las superficies del avión al volar en nubes con gotas de agua subenfriada." },
    { id: "met-7", term: "Altitud de densidad", definition: "Altitud a la que el avión 'siente' que vuela, ajustada por temperatura, presión y humedad." },
  ],
  "cartografia-3": [
    { id: "cart2-3", term: "Punto VFR", definition: "Ubicación visual marcada en la carta para reportar tu posición de forma estandarizada." },
    { id: "cart2-4", term: "Trazar la ruta", definition: "Buen hábito de marcar checkpoints, rumbo, distancia y tiempo ANTES del vuelo." },
    { id: "cart3-2", term: "Aeropuerto no controlado", definition: "No tiene torre de control y se dibuja en magenta en la carta." },
    { id: "cart3-5", term: "MOA", definition: "Zona de operaciones militares: no está prohibida, pero puede haber aviones militares a alta velocidad; se cruza con precaución." },
    { id: "cart3-6", term: "Vía aérea Víctor", definition: "Ruta de navegación de baja altitud definida entre estaciones VOR." },
    { id: "cart3-7", term: "Declinación magnética", definition: "Diferencia entre el norte verdadero y el norte magnético, marcada en la carta con líneas isogónicas discontinuas magenta." },
  ],
  "comunicaciones-2": [
    { id: "com2-1", term: "Fraseología estándar", definition: "Vocabulario y formato fijo usado en radio para evitar ambigüedad." },
    { id: "com-6", term: "CTAF", definition: "Frecuencia para reportarte en aeropuertos no controlados, sin respuesta de control." },
    { id: "com2-6", term: "Traffic in sight", definition: "Confirmación de que has visto visualmente el tráfico que te reportó el controlador." },
    { id: "com2-7", term: "Frequency change approved", definition: "Autorización del controlador para cambiar de frecuencia." },
    { id: "com-4", term: "PAN-PAN", definition: "Llamada de urgencia (repetida 3 veces) sin peligro inmediato de vida." },
    { id: "com-5", term: "MAYDAY", definition: "Llamada de emergencia grave e inminente, repetida 3 veces." },
    { id: "com-7", term: "Stepping on", definition: "Bloquear la frecuencia al transmitir al mismo tiempo que otra estación." },
  ],
  "instrumentos-2": [
    { id: "ins2-1", term: "Bomba de vacío", definition: "Sistema que energiza el horizonte artificial y el indicador de rumbo en muchos aviones." },
    { id: "ins2-2", term: "Tubo pitot", definition: "Capta la presión total (de impacto) del aire; el velocímetro la compara con la estática." },
    { id: "ins2-3", term: "Toma estática", definition: "Mide la presión atmosférica ambiente, usada por altímetro, VSI y velocímetro." },
    { id: "ins2-4", term: "Bloqueo del pitot", definition: "Si se tapan la entrada y el drenaje, el velocímetro se comporta como altímetro; si solo se tapa la entrada, cae a cero." },
    { id: "ins2-5", term: "Giroscopio", definition: "Instrumento que mantiene su orientación en el espacio, base del horizonte artificial e indicador de rumbo." },
    { id: "ins2-6", term: "Precesión", definition: "Error del horizonte artificial durante virajes o aceleraciones prolongadas; se autocorrige en vuelo nivelado." },
    { id: "ins2-7", term: "Sistema pitot-estático", definition: "Conjunto de instrumentos (velocímetro, altímetro, VSI) que dependen de la presión del aire." },
  ],
  "rendimiento-2": [
    { id: "ren2-1", term: "Peso vacío", definition: "El avión con su equipo, el combustible no utilizable y los fluidos de operación (en manuales actuales, también el aceite completo); sin combustible utilizable, tripulación ni carga." },
    { id: "ren2-2", term: "Peso máximo de rampa", definition: "Peso máximo permitido antes de iniciar el rodaje, incluye el combustible que se quemará en tierra." },
    { id: "ren2-3", term: "Densidad del aire", definition: "Disminuye con la altitud y la temperatura; afecta directamente el rendimiento del motor y las alas." },
    { id: "ren2-4", term: "Distancia sobre obstáculo de 50 ft", definition: "Distancia total requerida para despegar y despejar un obstáculo estándar de 50 pies." },
    { id: "ren2-5", term: "Factor de corrección por pista", definition: "Ajuste aplicado a la distancia de despegue/aterrizaje por pasto, pendiente o superficie contaminada." },
    { id: "ren2-6", term: "Envelope de peso y balance", definition: "Gráfica que muestra el rango permitido de peso y centro de gravedad." },
    { id: "ren2-7", term: "Sobrepeso", definition: "Volar por encima del peso máximo certificado; invalida los datos de rendimiento del manual." },
  ],
  "operacion-2": [
    { id: "op2-1", term: "Checklist de emergencia", definition: "Lista de memoria para los primeros pasos críticos, verificada después con el impreso." },
    { id: "op2-2", term: "ATIS", definition: "Grabación automática con información del aeropuerto: viento, pista activa, altímetro y NOTAMs relevantes." },
    { id: "op2-3", term: "Autorización de rodaje", definition: "Instrucción del controlador de tierra que indica la ruta permitida hacia la pista." },
    { id: "op2-4", term: "Hold short", definition: "Instrucción de detenerte antes de la línea de espera de una pista; no la cruzas sin autorización." },
    { id: "op2-5", term: "Despegue rechazado", definition: "Abortar el despegue cerrando potencia y frenando mientras quede pista para detenerte." },
    { id: "op2-6", term: "Aproximación frustrada", definition: "Procedimiento para abandonar una aproximación que no se completó de forma segura." },
    { id: "op2-7", term: "Bitácora de vuelo", definition: "Registro oficial de horas y experiencia de vuelo del piloto." },
  ],
  "espacios-aereos-2": [
    { id: "esp2-1", term: "Clase E", definition: "Espacio controlado donde el VFR no necesita autorización ni radio." },
    { id: "esp2-2", term: "ADIZ", definition: "Zona donde se exige identificación de la aeronave por razones de defensa antes de entrar." },
    { id: "esp2-3", term: "Restricción temporal (NOTAM)", definition: "Zona restringida o prohibida por un tiempo, por una emergencia, un evento o una visita oficial; se publica por NOTAM. En Estados Unidos se llama TFR." },
    { id: "esp2-4", term: "Corredor VFR", definition: "Ruta VFR publicada en el AIP para cruzar o rodear un espacio controlado; en B, C y D sigues necesitando autorización." },
    { id: "esp2-5", term: "Techo de un espacio aéreo", definition: "Altitud superior hasta la cual aplica la clasificación de ese espacio." },
    { id: "esp2-6", term: "Transición VFR", definition: "Cruce de un espacio controlado sin aterrizar, con autorización e instrucciones del control." },
    { id: "esp2-7", term: "NOTAM de espacio aéreo", definition: "Aviso temporal que puede modificar o restringir un espacio aéreo normalmente disponible." },
  ],
  "reglamentacion-3": [
    { id: "reg3-1", term: "Experiencia reciente", definition: "Horas y procedimientos volados hace poco, que se piden para revalidar y para ciertos privilegios." },
    { id: "reg3-2", term: "Revalidación", definition: "Cada 3 años, con horas recientes en la bitácora y la aptitud psicofísica vigente." },
    { id: "reg3-3", term: "Bitácora de vuelo", definition: "Registro de tus horas, que la AFAC certifica y pide para cada licencia y revalidación." },
    { id: "reg3-4", term: "TPI", definition: "Piloto de transporte público ilimitado: obligatorio para ser piloto al mando de transporte público de más de 5,700 kg." },
    { id: "reg3-5", term: "Capacidad (rating)", definition: "Lo que se suma a la licencia, como instrumentos, multimotor o instructor de vuelo." },
    { id: "reg3-6", term: "NOTAM", definition: "Aviso a los aviadores sobre cambios temporales relevantes para la seguridad del vuelo." },
    { id: "reg3-7", term: "Responsabilidad del PIC", definition: "El piloto al mando es el responsable final de la seguridad y legalidad del vuelo, sin excepción." },
  ],
  "ifr-2": [
    { id: "ifr2-1", term: "Espacio protegido", definition: "Área garantizada libre de obstáculos alrededor de un procedimiento IFR." },
    { id: "ifr2-2", term: "Aproximación de precisión", definition: "Aproximación que provee guía vertical y lateral, como el ILS." },
    { id: "ifr2-3", term: "Aproximación de no precisión", definition: "Aproximación que solo provee guía lateral, como el VOR o NDB." },
    { id: "ifr2-4", term: "Circling approach", definition: "Maniobra visual para alinearse con una pista distinta a la del procedimiento de aproximación." },
    { id: "ifr2-5", term: "Missed approach point", definition: "Punto donde, sin referencias visuales, debes ejecutar la aproximación frustrada." },
    { id: "ifr2-6", term: "RNAV", definition: "Navegación de área basada en GPS u otros sensores, sin depender de estaciones terrestres." },
    { id: "ifr2-7", term: "Minimums", definition: "Techo y visibilidad mínimos requeridos para intentar o continuar una aproximación." },
  ],
  fundamentos: [
    { id: "fun-1", term: "Sustentación (Lift)", definition: "Fuerza generada por las alas que se opone al peso y mantiene al avión en el aire." },
    { id: "fun-2", term: "Empuje (Thrust)", definition: "Fuerza que produce el motor para mover al avión hacia adelante." },
    { id: "fun-3", term: "Alerones", definition: "Superficies en el borde de salida del ala que controlan el alabeo (roll)." },
    { id: "fun-4", term: "Elevador", definition: "Superficie en el estabilizador horizontal que controla el cabeceo (pitch)." },
    { id: "fun-5", term: "Timón de dirección", definition: "Superficie en el estabilizador vertical que controla la guiñada (yaw)." },
    { id: "fun-6", term: "Six Pack", definition: "Los 6 instrumentos analógicos básicos de la cabina, organizados en dos filas de tres." },
    { id: "fun-7", term: "Mezcla (Mixture)", definition: "Control que ajusta la proporción de combustible y aire según la altitud." },
  ],
  aerodinamica: [
    { id: "aer-1", term: "Ángulo de ataque", definition: "Ángulo entre la cuerda del ala y el viento relativo; determina cuándo ocurre la pérdida." },
    { id: "aer-2", term: "Pérdida (Stall)", definition: "Colapso de la sustentación cuando se supera el ángulo crítico de ataque." },
    { id: "aer-3", term: "Resistencia inducida", definition: "Subproducto de generar sustentación; mayor a baja velocidad y ángulos de ataque altos." },
    { id: "aer-4", term: "Factor de carga", definition: "Relación entre la sustentación total generada y el peso del avión, medida en G." },
    { id: "aer-5", term: "Guiñada adversa (adverse yaw)", definition: "Guiñada hacia el lado contrario al viraje, porque el ala que sube, con su alerón abajo, tiene más resistencia inducida que la otra." },
    { id: "aer-6", term: "Trim", definition: "Ajuste del punto de equilibrio del elevador para mantener una actitud sin sostener presión en el yoke." },
    { id: "aer-7", term: "Efecto suelo", definition: "Reducción de la resistencia inducida al volar muy cerca del suelo." },
    { id: "aer-8", term: "P-factor", definition: "Carga asimétrica de la hélice: con ángulo de ataque alto, la pala que baja da más empuje y el morro se va a la izquierda." },
    { id: "aer-9", term: "Barrena (spin)", definition: "Pérdida en la que un ala queda más en pérdida que la otra y el avión entra en una rotación que se sostiene sola." },
    { id: "aer-10", term: "Velocidad de maniobra (Va)", definition: "La máxima a la que puedes usar todo el recorrido de un control de golpe sin pasar el límite de carga." },
  ],
  vfr: [
    { id: "vfrt-1", term: "Special VFR", definition: "Autorización del ATC para operar en espacio controlado por debajo de los mínimos VFR normales." },
    { id: "vfrt-2", term: "CTAF", definition: "Frecuencia común usada por los pilotos para coordinarse en un aeródromo no controlado." },
    { id: "vfrt-3", term: "Entrada a 45°", definition: "Entrada estándar recomendada hacia el tramo de viento en cola de un patrón de tráfico." },
    { id: "vfrt-4", term: "Viento en cola (Downwind)", definition: "Tramo del patrón paralelo a la pista, en dirección opuesta al aterrizaje." },
    { id: "vfrt-5", term: "Luces de posición", definition: "Roja en el ala izquierda, verde en la derecha, blanca en la cola." },
    { id: "vfrt-6", term: "Baliza (Beacon)", definition: "Luz roja anticolisión: se enciende antes de arrancar y se queda encendida mientras el motor está en marcha." },
    { id: "vfrt-7", term: "Reporte de posición", definition: "Anuncio por radio de tu ubicación en el patrón, en un aeródromo sin torre." },
  ],
};

// ---------- Quizzes (práctica: 5, evaluación: 10) ----------

function split(all: QuizPregunta[]) {
  return { practica: all.slice(0, 5), evaluacion: all.slice(5) };
}

const QUIZ_METEOROLOGIA: QuizPregunta[] = [
  { id: "met-q1", pregunta: "¿Qué describe un METAR?", opciones: ["Las condiciones meteorológicas actuales observadas", "Un pronóstico a 24 horas", "Solo la velocidad del viento", "Las rutas de vuelo recomendadas"], correcta: 0 },
  { id: "met-q2", pregunta: "En el METAR '09008KT', ¿qué representa el número 08?", opciones: ["Rumbo del viento en grados", "Velocidad del viento en nudos", "Visibilidad en millas", "Altura de las nubes"], correcta: 1 },
  { id: "met-q3", pregunta: "¿Cuál es la validez típica de un TAF?", opciones: ["1 hora", "6 horas", "24 a 30 horas", "1 semana"], correcta: 2 },
  { id: "met-q4", pregunta: "La diferencia principal entre METAR y TAF es:", opciones: ["El idioma en que se emiten", "METAR es solo para aeropuertos grandes", "No hay diferencia real", "METAR es observación actual, TAF es pronóstico futuro"], correcta: 3 },
  { id: "met-q5", pregunta: "¿Qué código de cobertura de nubes indica cielo totalmente cubierto?", opciones: ["OVC", "FEW", "SCT", "BKN"], correcta: 0 },
  { id: "met-q6", pregunta: "¿Qué tipo de frente suele generar clima violento pero de corta duración?", opciones: ["Frente cálido", "Frente frío", "Frente estacionario", "Ninguno genera clima significativo"], correcta: 1 },
  { id: "met-q7", pregunta: "¿Qué tipo de turbulencia ocurre en altura sin nubes que la anuncien?", opciones: ["Mecánica", "Térmica", "Aire claro (CAT)", "De estela"], correcta: 2 },
  { id: "met-q8", pregunta: "Un microburst es:", opciones: ["Un tipo de nube alta", "Un instrumento de navegación", "Un tipo de niebla", "Una corriente descendente violenta asociada a tormentas"], correcta: 3 },
  { id: "met-q9", pregunta: "¿En qué rango de temperatura es más probable el hielo estructural?", opciones: ["0°C a -20°C con agua líquida presente", "Únicamente por debajo de los -40°C bajo cualquier condición", "Solo con temperaturas positivas dentro de la cabina", "Solo durante los meses más calurosos del verano"], correcta: 0 },
  { id: "met-q10", pregunta: "¿Por qué Toluca es un ejemplo clave de altitud de densidad?", opciones: ["Está prácticamente al nivel del mar todo el año", "Tiene una elevación muy alta que reduce el rendimiento del motor", "Nunca presenta viento ni cambios de presión atmosférica", "Es el aeropuerto comercial más grande de todo México"], correcta: 1 },
  { id: "met-q11", pregunta: "¿Qué tipo de nube se evita siempre por su turbulencia severa y granizo?", opciones: ["Cirros", "Estratos", "Cumulonimbo (CB)", "Cúmulos de buen tiempo"], correcta: 2 },
  { id: "met-q12", pregunta: "La turbulencia de estela (wake turbulence) es generada por:", opciones: ["Corrientes térmicas ascendentes generadas por el calor del suelo", "El viento chocando contra terreno montañoso irregular", "La lluvia intensa dentro de una tormenta activa", "Vórtices que se forman en las puntas de ala de todo avión que produce sustentación"], correcta: 3 },
  { id: "met-q13", pregunta: "¿Qué sistema alerta a los controladores sobre wind shear de bajo nivel?", opciones: ["LLWAS", "METAR", "NOTAM", "TAF"], correcta: 0 },
  { id: "met-q14", pregunta: "El hielo de carburador puede ocurrir:", opciones: ["Solo bajo cero", "Incluso con temperaturas exteriores positivas", "Solo en vuelo IFR", "Nunca en motores de pistón"], correcta: 1 },
  { id: "met-q15", pregunta: "¿Qué código pone una persona en el METAR cuando el cielo está despejado?", opciones: ["BKN", "OVC", "SKC", "SCT"], correcta: 2 },
  { id: "met-q16", pregunta: "Comparando un METAR con 'BKN008' y visibilidad 3SM contra otro con 'SCT025' y visibilidad 10SM, ¿cuál es peor para un vuelo VFR?", opciones: ["El segundo, porque SCT siempre indica más cobertura que cualquier BKN", "Ambos representan exactamente el mismo nivel de riesgo para el vuelo", "Ninguno de los dos reportes afecta la decisión de volar VFR", "El primero: un techo de 800 ft es categoría IFR (techo menor de 1,000 ft)"], correcta: 3 },
  { id: "met-q17", pregunta: "Un frente frío se acerca rápido y, el mismo día, un frente cálido se acerca lento por otra dirección. ¿Cuál exige una decisión de vuelo más urgente y por qué?", opciones: ["El frío, porque su avance rápido deja poco margen de tiempo para decidir", "El cálido, porque siempre trae un clima mucho peor que cualquier frente frío", "Ninguno de los dos frentes afecta realmente la planificación de un vuelo", "Se decide exactamente igual sin importar el tipo de frente que se acerque"], correcta: 0 },
];

const QUIZ_NAVEGACION: QuizPregunta[] = [
  { id: "nav-q1", pregunta: "Un radial se mide:", opciones: ["Hacia la estación", "Desde el VOR hacia afuera", "Solo de noche", "Desde el norte magnético del avión"], correcta: 1 },
  { id: "nav-q2", pregunta: "Si la bandera indica TO, volar el curso seleccionado con la aguja centrada te lleva:", opciones: ["Alejándote de la estación", "En círculos", "Hacia la estación", "No indica nada"], correcta: 2 },
  { id: "nav-q3", pregunta: "Cada punto de desviación del CDI representa aproximadamente:", opciones: ["10°", "45°", "90°", "2°"], correcta: 3 },
  { id: "nav-q4", pregunta: "El OBS sirve para:", opciones: ["Seleccionar el curso o radial deseado", "Medir la distancia hasta la estación", "Sintonizar las frecuencias de comunicación", "Encender el transponder del avión"], correcta: 0 },
  { id: "nav-q5", pregunta: "Tracking, a diferencia de Homing, se caracteriza por:", opciones: ["Apuntar siempre la nariz directo hacia la estación", "Calcular un ángulo de corrección por viento para mantener la línea recta", "Ignorar por completo el efecto del viento", "Usarse únicamente en vuelo bajo reglas IFR"], correcta: 1 },
  { id: "nav-q9", pregunta: "La fijación cruzada (cross-fix) usa:", opciones: ["Un solo VOR sin ninguna otra referencia", "Dos radiales de VOR distintos que se cruzan en la carta", "Solo la señal del GPS a bordo", "El compás magnético usado únicamente"], correcta: 1 },
  { id: "nav-q13", pregunta: "Si estás en el radial 090 de un VOR y quieres volar TO la estación, tu curso debe ser aproximadamente:", opciones: ["090°", "270°", "180°", "360°"], correcta: 1 },
  { id: "nav-q14", pregunta: "El ángulo de intercepción más usado para interceptar un radial es de:", opciones: ["10°", "60°", "30°", "90°"], correcta: 2 },
  { id: "nav-q16", pregunta: "Usas fijación cruzada con dos VOR: el radial A lo trazaste correctamente, pero el radial B lo leíste con 10° de error. ¿Qué le pasa a tu posición fijada en la carta?", opciones: ["Se desplaza a lo largo del radial A, y más cuanto más lejos estés del VOR B", "No se ve afectada en absoluto, un solo radial con error nunca importa", "El error se cancela automáticamente entre ambos radiales sin dejar rastro", "Solo afecta la posición si ambos radiales tienen error al mismo tiempo"], correcta: 0 },
  { id: "nav-q20", pregunta: "La señal de un VOR viaja en línea de vista, lo que significa que:", opciones: ["Su alcance es el mismo a cualquier altitud", "Tu alcance útil depende de tu altitud y del terreno entre tú y la estación", "Solo funciona de día", "Solo se recibe dentro de espacio aéreo controlado"], correcta: 1 },
  { id: "nav-q21", pregunta: "Antes de usar un VOR para navegar, lo primero que debes hacer es:", opciones: ["Centrar la aguja del CDI", "Identificar la estación por su código Morse", "Seleccionar tu rumbo actual en el OBS", "Confirmar que la bandera indique TO"], correcta: 1 },
  { id: "nav-q22", pregunta: "Conforme te acercas a la estación, la misma desviación del CDI representa:", opciones: ["Cada vez más distancia lateral respecto al curso", "Cada vez menos distancia lateral respecto al curso", "Siempre la misma distancia lateral", "Una distancia que depende solo de tu velocidad"], correcta: 1 },
  { id: "nav-q23", pregunta: "Si seleccionas en el OBS el curso recíproco al que realmente vuelas, el CDI:", opciones: ["Deja de funcionar y aparece la bandera", "Indica al revés: corregir hacia la aguja te aleja del curso", "Sigue indicando correctamente", "Se centra automáticamente"], correcta: 1 },
  { id: "nav-q24", pregunta: "Vuelas TO la estación con el curso 360 seleccionado y el CDI se desvía a la derecha. Para volver al curso debes:", opciones: ["Virar a la izquierda, en sentido contrario a la aguja", "Virar a la derecha, hacia la aguja", "Mantener el rumbo y esperar a que se centre", "Mover el OBS hasta centrar la aguja"], correcta: 1 },
  { id: "nav-q25", pregunta: "Justo al pasar sobre la estación la aguja oscila rápido de un lado a otro y la bandera cambia de TO a FROM. Esto se debe a:", opciones: ["Una falla del receptor", "El cono de confusión que hay sobre la vertical de la estación", "Interferencia de otra estación", "Que el OBS quedó mal seleccionado"], correcta: 1 },
];

const QUIZ_NAVEGACION_2: QuizPregunta[] = [
  { id: "nav-q6", pregunta: "El DME mide:", opciones: ["Solo el rumbo magnético actual", "La velocidad del viento en la ruta", "La distancia real en línea recta a la estación", "La frecuencia de la estación VOR"], correcta: 2 },
  { id: "nav-q7", pregunta: "Una ventaja clave del HSI sobre el CDI tradicional es:", opciones: ["Es más barato de instalar y mantener", "No requiere ningún tipo de calibración", "Funciona incluso sin electricidad a bordo", "Integra rumbo y desviación, eliminando la sensibilidad inversa"], correcta: 3 },
  { id: "nav-q8", pregunta: "El ADF, a diferencia del VOR, muestra:", opciones: ["El rumbo relativo hacia la estación, sin dar radiales", "Radiales precisos medidos desde la estación", "La distancia exacta hasta la estación", "Solo funciona correctamente durante la noche"], correcta: 0 },
  { id: "nav-q10", pregunta: "En una carta VFR, la escala gráfica sirve para:", opciones: ["Calcular el viento en la ruta", "Sintonizar la frecuencia del VOR", "Medir distancias trazadas en la ruta", "Leer el reporte METAR actual"], correcta: 2 },
  { id: "nav-q11", pregunta: "Sin DME, para saber la distancia a un aeropuerto puedes usar:", opciones: ["Solo adivinar la distancia recorrida", "El transponder del avión", "El altímetro de a bordo", "Navegación por estima (dead reckoning)"], correcta: 3 },
  { id: "nav-q12", pregunta: "Planear una ruta VFR debe incluir siempre:", opciones: ["Un aeropuerto alterno con reservas de combustible adecuadas", "Solo la distancia total del tramo", "Únicamente el rumbo magnético calculado", "Nada relacionado con el clima esperado"], correcta: 0 },
  { id: "nav-q15", pregunta: "Un minuto de latitud medido verticalmente en una carta equivale aproximadamente a:", opciones: ["Una milla terrestre", "Diez millas náuticas", "No equivale a nada útil", "Una milla náutica"], correcta: 3 },
  { id: "nav-q17", pregunta: "Vuelas sin DME y necesitas confirmar tu distancia a un aeropuerto. Comparando la navegación por estima (dead reckoning) contra una fijación cruzada con dos VOR, ¿cuál te da mayor precisión y por qué?", opciones: ["Estima, porque no depende de ninguna señal externa que pueda llegar a fallar", "Fijación cruzada, porque ubica tu posición real con dos referencias externas, sin acumular error de tiempo y viento", "Ambas técnicas tienen exactamente la misma precisión en cualquier situación", "Ninguna de las dos es confiable si no cuentas con DME a bordo"], correcta: 1 },
  { id: "nav-q18", pregunta: "Para volar un arco DME, tu posición base respecto a la estación es:", opciones: ["Perpendicular a la estación, a 90° del radial en el que te encuentras", "Directamente hacia la estación en todo momento", "Alejándote por el radial de entrada", "No existe una posición de referencia definida"], correcta: 0 },
  { id: "nav-q19", pregunta: "En un patrón de espera, ¿qué determina cuál de las tres entradas te corresponde?", opciones: ["La altitud a la que vuelas en ese momento", "El ángulo entre tu rumbo de llegada y el curso de entrada", "El tipo de aeronave que estás volando", "Siempre se usa la entrada directa"], correcta: 1 },
  { id: "nav-q26", pregunta: "El RMI, a diferencia de un ADF de tarjeta fija, te muestra:", opciones: ["La distancia a la estación", "El rumbo magnético directo hacia la estación, sin sumar nada", "El rumbo relativo, que debes sumar a tu rumbo", "La desviación respecto a un curso seleccionado"], correcta: 1 },
  { id: "nav-q27", pregunta: "La distancia que indica el DME es inclinada (slant range). Ese error es mayor cuando estás:", opciones: ["Muy lejos y muy bajo", "Muy alto y muy cerca de la estación", "A la misma altitud que la estación", "Volando en alejamiento"], correcta: 1 },
  { id: "nav-q28", pregunta: "Vuelas un arco DME de 12 millas y el DME empieza a marcar 12.6 y subiendo. Debes:", opciones: ["Mantener el rumbo: el arco se corrige solo", "Virar unos grados hacia la estación hasta recuperar las 12 millas", "Virar alejándote de la estación", "Aumentar la velocidad"], correcta: 1 },
  { id: "nav-q29", pregunta: "En un patrón de espera estándar, los virajes y el tramo de alejamiento son:", opciones: ["A la izquierda, con tramos de dos minutos", "A la derecha, con tramo de acercamiento de un minuto", "A la derecha, con tramos de tres minutos", "Indistintos, los elige el piloto"], correcta: 1 },
  { id: "nav-q30", pregunta: "Al planear una ruta VFR, los checkpoints deben elegirse:", opciones: ["Lo más juntos posible, aunque sean difíciles de ver", "Como rasgos del terreno fáciles de identificar desde el aire, separados por tramos manejables", "Solo sobre aeropuertos", "Únicamente donde haya estaciones VOR"], correcta: 1 },
];

const QUIZ_CARTOGRAFIA: QuizPregunta[] = [
  { id: "cart-q1", pregunta: "¿A qué escala están las Cartas VFR (Sectional Charts)?", opciones: ["1:100,000", "1:250,000", "1:500,000", "1:1,000,000"], correcta: 2 },
  { id: "cart-q2", pregunta: "Un aeropuerto con torre de control se representa en color:", opciones: ["Magenta", "Verde", "Rojo", "Azul"], correcta: 3 },
  { id: "cart-q3", pregunta: "¿Qué clase de espacio aéreo requiere autorización EXPLÍCITA para entrar?", opciones: ["Clase B", "Ninguna: basta con escuchar la frecuencia", "Clase E", "Clase G"], correcta: 0 },
  { id: "cart-q4", pregunta: "En un obstáculo marcado '1500 (450)', ¿qué representa el número entre paréntesis?", opciones: ["Altura MSL", "Altura AGL (sobre el terreno)", "Distancia al aeropuerto más cercano", "Frecuencia de luces del obstáculo"], correcta: 1 },
  { id: "cart-q5", pregunta: "¿Qué es el MEF en una carta VFR?", opciones: ["La frecuencia de emergencia asignada", "El nombre del aeropuerto más cercano", "La elevación más alta del cuadrante, terreno u obstáculos", "La velocidad máxima permitida ahí"], correcta: 2 },
  { id: "cart-q6", pregunta: "Las frecuencias de radio en la carta (CTAF, Torre, ATIS) se ubican:", opciones: ["Solo en un apéndice separado del mapa", "No aparecen nunca en las cartas VFR", "Solo aparecen en las cartas IFR", "Junto a cada aeropuerto y límite de espacio aéreo"], correcta: 3 },
  { id: "cart-q7", pregunta: "¿Para qué sirven los Puntos de Notificación VFR?", opciones: ["Para reportar tu posición de forma rápida y estandarizada", "Para marcar las zonas prohibidas de la carta", "Para indicar dónde recargar combustible", "No tienen ningún uso operacional real"], correcta: 0 },
  { id: "cart-q8", pregunta: "Antes de un vuelo, el mejor hábito al leer una carta completa es:", opciones: ["Improvisar la ruta en el aire", "Trazar la ruta completa con checkpoints, rumbos y tiempos", "Ignorar el espacio aéreo si el vuelo es corto", "Memorizar solo el destino"], correcta: 1 },
  { id: "cart-q9", pregunta: "¿Qué tipo de carta se usa para vuelo IFR en aerovías bajo FL180?", opciones: ["Cartas TAC de área terminal", "Cartas VFR de tipo sectional", "Cartas de Ruta de Baja Altitud", "Cartas de aproximación visual local"], correcta: 2 },
  { id: "cart-q10", pregunta: "En la simbología de cartas, las marquitas alrededor del círculo de un aeropuerto indican:", opciones: ["La cantidad de pistas", "La cantidad total de hangares", "El horario de operación de la torre", "Que hay combustible y servicio en horario normal"], correcta: 3 },
  { id: "cart-q11", pregunta: "¿Qué clase de espacio aéreo se representa con líneas discontinuas azules?", opciones: ["Clase D", "Clase B", "Clase C", "Clase G"], correcta: 0 },
  { id: "cart-q12", pregunta: "En las capas de color de una carta VFR, ¿qué representa el café más oscuro?", opciones: ["Espacio aéreo prohibido", "Terreno de mayor elevación", "Zonas de tormenta", "Aeropuertos militares"], correcta: 1 },
  { id: "cart-q13", pregunta: "Antes de acercarte a espacio aéreo controlado, debes identificar en la carta:", opciones: ["El precio del combustible en ese aeropuerto", "El color del avión permitido ahí", "Qué frecuencia contactar y en qué punto de tu ruta", "Nada en particular que revisar"], correcta: 2 },
  { id: "cart-q14", pregunta: "¿Con qué símbolo se marcan los Puntos de Notificación VFR en la carta?", opciones: ["Un círculo azul relleno", "Una línea roja punteada", "Un cuadrado verde", "Una banderita o estrella magenta (o un triángulo en cartas OACI)"], correcta: 3 },
  { id: "cart-q15", pregunta: "Las Cartas de Área Terminal (TAC) se usan principalmente para:", opciones: ["Zonas de espacio aéreo denso alrededor de grandes ciudades", "Vuelo oceánico de larga distancia", "Solo para aterrizajes de emergencia", "Rutas de alta altitud exclusivamente"], correcta: 0 },
  { id: "cart-q16", pregunta: "Tu ruta cruza primero una zona con MEF de 4,500 ft y luego otra con MEF de 6,800 ft. Si mantienes una sola altitud de crucero de 5,000 ft en toda la ruta, ¿qué tramo representa un riesgo?", opciones: ["Ninguno, 5,000 ft es siempre seguro sin importar el cuadrante que sea", "El segundo tramo, porque 5,000 ft queda por debajo del MEF de esa zona", "El primer tramo, porque el MEF funciona como límite máximo permitido", "Debes descender antes de llegar al segundo tramo de la ruta"], correcta: 1 },
  { id: "cart-q17", pregunta: "Comparando un aeropuerto marcado en magenta contra uno en azul en la carta, si tu ruta pasa cerca de ambos, ¿qué diferencia en tus comunicaciones debes anticipar?", opciones: ["Ninguna, el color no guarda relación alguna con las comunicaciones requeridas", "El magenta siempre requiere autorización explícita de control antes de acercarte", "El azul (con torre) exige contacto por radio antes de acercarte; el magenta usa CTAF sin autorización", "Ambos son operacionalmente idénticos sin ninguna diferencia real entre ellos"], correcta: 2 },
];

const QUIZ_COMUNICACIONES: QuizPregunta[] = [
  { id: "com-q1", pregunta: "'Wilco' significa:", opciones: ["No voy a cumplir", "Repita el mensaje", "Cambio y fuera", "Voy a cumplir la instrucción"], correcta: 3 },
  { id: "com-q2", pregunta: "El primer contacto por radio debe incluir, en orden:", opciones: ["A quién llamas, quién eres, qué necesitas", "Qué necesitas, quién eres, a quién llamas", "Solo tu matrícula", "Solo el nombre del aeropuerto"], correcta: 0 },
  { id: "com-q3", pregunta: "El readback de 'mantener corto' (hold short) de una pista es:", opciones: ["Opcional", "Obligatorio siempre, sin excepción", "Solo necesario de noche", "Solo en aeropuertos grandes"], correcta: 1 },
  { id: "com-q4", pregunta: "La autorización de despegue debe leerse de vuelta incluyendo:", opciones: ["Solo decir 'copiado' y nada más", "Nada, basta con simplemente despegar", "Tu matrícula y la confirmación de la pista autorizada", "Solo repetir el viento reportado"], correcta: 2 },
  { id: "com-q5", pregunta: "Para cruzar espacio aéreo Clase B/C/D sin aterrizar necesitas:", opciones: ["Nada especial de parte del piloto", "Solo avisar tu posición por CTAF", "Aterrizar primero en ese aeropuerto", "Solicitar y recibir autorización de tránsito VFR"], correcta: 3 },
  { id: "com-q6", pregunta: "PAN-PAN se usa para:", opciones: ["Una situación urgente sin peligro inmediato de vida", "Un peligro grave e inminente para la aeronave", "Confirmar una autorización recibida previamente", "Solicitar el reporte de clima actual"], correcta: 0 },
  { id: "com-q7", pregunta: "MAYDAY se repite:", opciones: ["Una vez", "Tres veces", "Dos veces", "No se repite"], correcta: 1 },
  { id: "com-q8", pregunta: "Un error común en comunicaciones es:", opciones: ["Usar fraseología estándar", "Confirmar la matrícula completa", "Omitir el readback de instrucciones críticas", "Escuchar antes de transmitir"], correcta: 2 },
  { id: "com-q9", pregunta: "En comunicaciones IFR, el readback debe ser especialmente preciso en:", opciones: ["El nombre del piloto", "El color del avión", "La hora del día", "El código squawk y las altitudes"], correcta: 3 },
  { id: "com-q10", pregunta: "'Stepping on' una transmisión significa:", opciones: ["Bloquear la frecuencia hablando al mismo tiempo que otra estación", "Confirmar correctamente una instrucción recibida", "Usar el alfabeto fonético estándar", "Declarar una emergencia a bordo"], correcta: 0 },
  { id: "com-q11", pregunta: "El primer contacto con Torre debe incluir tu matrícula:", opciones: ["Abreviada desde el primer contacto", "Completa, hasta que torre te autorice a abreviarla", "Nunca es necesaria realmente", "Solo si te la piden expresamente"], correcta: 1 },
  { id: "com-q12", pregunta: "Dentro del circuito de tráfico, los reportes de posición siguen el orden:", opciones: ["Final, base, viento en cola", "Solo se reporta al aterrizar", "Viento en cola, base, final", "No hay un orden estándar"], correcta: 2 },
  { id: "com-q13", pregunta: "Al acercarte a un destino en espacio aéreo controlado, usualmente contactas primero a:", opciones: ["Torre", "CTAF", "Ninguna estación", "Aproximación"], correcta: 3 },
  { id: "com-q14", pregunta: "'Roger' significa:", opciones: ["Recibido, entendido, sin implicar que cumplirás", "Voy a cumplir la instrucción", "Repita el mensaje", "Autorizado a proceder"], correcta: 0 },
  { id: "com-q15", pregunta: "La disciplina de radio existe principalmente para:", opciones: ["Sonar profesional frente a otros pilotos", "Prevenir errores y malentendidos que históricamente causan incidentes", "Llenar el tiempo libre en la frecuencia", "Impresionar a otros pilotos en la torre"], correcta: 1 },
  { id: "com-q16", pregunta: "Comparando 'Wilco' con 'Roger' en respuesta a una instrucción de ATC, ¿en qué situación responder solo 'Roger' podría generar un malentendido peligroso?", opciones: ["Nunca genera ningún problema real, ambas son sinónimos exactos", "'Roger' siempre implica más autoridad y jerarquía que 'Wilco'", "Si ATC da una instrucción de acción y respondes 'Roger', dejas ambigüedad sobre si vas a cumplirla", "'Wilco' se usa exclusivamente durante situaciones de emergencia real"], correcta: 2 },
  { id: "com-q17", pregunta: "Dos aeronaves llaman a la torre casi al mismo tiempo y sus transmisiones se traslapan (stepping on). Comparando transmitir de inmediato de nuevo contra esperar unos segundos, ¿cuál es la práctica correcta y por qué?", opciones: ["Transmitir de inmediato para no perder tu turno en la frecuencia", "Ambas opciones son igual de válidas en cualquier situación", "Cambiar de frecuencia de inmediato sin avisar absolutamente a nadie", "Esperar y confirmar que la frecuencia esté libre antes de retransmitir de nuevo"], correcta: 3 },
];

const QUIZ_INSTRUMENTOS: QuizPregunta[] = [
  { id: "ins-q1", pregunta: "El altímetro mide la altitud usando:", opciones: ["Presión estática del aire", "Velocidad del viento", "Temperatura únicamente", "Señales de radio"], correcta: 0 },
  { id: "ins-q2", pregunta: "'De alta a baja presión, cuidado abajo' se refiere a:", opciones: ["Un error típico y conocido del velocímetro del avión", "El riesgo de indicar más altitud de la real sin ajustar el Kollsman", "Una regla estándar usada en radiocomunicación aeronáutica", "El funcionamiento normal del instrumento VSI a bordo"], correcta: 1 },
  { id: "ins-q3", pregunta: "¿Qué mide la línea roja (Vne) en el indicador de velocidad?", opciones: ["Velocidad mínima de pérdida", "Velocidad óptima de crucero", "Velocidad nunca exceder", "Velocidad de flaps"], correcta: 2 },
  { id: "ins-q4", pregunta: "El horizonte artificial funciona mediante:", opciones: ["Señales GPS recibidas por satélite", "El compás magnético del avión", "El transponder instalado a bordo", "Un giróscopo que mantiene orientación en el espacio"], correcta: 3 },
  { id: "ins-q5", pregunta: "Un 'viraje estándar' completa 360° en:", opciones: ["2 minutos", "30 segundos", "1 minuto", "5 minutos"], correcta: 0 },
  { id: "ins-q6", pregunta: "El retraso característico del VSI es de aproximadamente:", opciones: ["Sin retraso, instantáneo", "6-9 segundos", "1 minuto", "No tiene retraso relevante"], correcta: 1 },
  { id: "ins-q7", pregunta: "El error ANDS del compás magnético ocurre principalmente:", opciones: ["En vuelo recto y nivelado sin cambios", "Únicamente durante los vuelos nocturnos", "Al acelerar/desacelerar en rumbos este-oeste en el hemisferio norte", "Solo con el transponder del avión encendido"], correcta: 2 },
  { id: "ins-q8", pregunta: "¿Qué ventaja tiene el HSI sobre el compás magnético en errores dinámicos?", opciones: ["No tiene ninguna ventaja real sobre el compás", "Es más barato de instalar en cabina", "Funciona incluso sin ninguna electricidad", "Su referencia giroscópica no sufre oscilación ni ANDS"], correcta: 3 },
  { id: "ins-q9", pregunta: "¿Qué squawk se usa para indicar secuestro o interferencia ilícita?", opciones: ["7500", "7600", "7700", "1200"], correcta: 0 },
  { id: "ins-q10", pregunta: "El botón IDENT en el transponder sirve para:", opciones: ["Apagar por completo el equipo transponder", "Resaltar tu posición en la pantalla del controlador", "Cambiar la frecuencia sintonizada actualmente", "Declarar una emergencia de forma automática"], correcta: 1 },
  { id: "ins-q11", pregunta: "El Coordinador de Viraje, a diferencia del indicador de giro tradicional, muestra:", opciones: ["Solo la altitud actual del avión", "La presión de aceite del motor", "Velocidad de alabeo y tasa de giro combinadas", "El rumbo magnético del avión en ese momento"], correcta: 2 },
  { id: "ins-q12", pregunta: "¿Qué distingue al RMI del ADF simple?", opciones: ["No tiene ninguna aguja indicadora visible", "Solo funciona correctamente estando en tierra", "Es un instrumento mucho más antiguo", "Muestra el rumbo magnético hacia la estación, no solo el relativo"], correcta: 3 },
  { id: "ins-q13", pregunta: "El DME calcula la distancia mediante:", opciones: ["El tiempo que tarda la señal en ir y regresar", "El consumo de combustible del motor", "La velocidad del viento en ruta", "El ángulo de la aguja del ADF"], correcta: 0 },
  { id: "ins-q14", pregunta: "IAS, CAS y TAS se diferencian en que:", opciones: ["Son exactamente lo mismo sin ninguna diferencia real", "TAS es la velocidad verdadera, ajustada por la densidad del aire", "CAS solo se usa mientras el avión está en tierra", "IAS es siempre mayor que TAS en cualquier caso"], correcta: 1 },
  { id: "ins-q15", pregunta: "¿Qué error puede sufrir un giróscopo mecánico como el del horizonte artificial?", opciones: ["Oxidación", "Sobrecarga eléctrica", "Precesión", "Ninguno, es infalible"], correcta: 2 },
  { id: "ins-q16", pregunta: "Comparando el retraso del VSI (6-9 segundos) contra el horizonte artificial (prácticamente instantáneo), ¿por qué al corregir una actitud debes confiar primero en el horizonte artificial?", opciones: ["Porque el VSI nunca funciona correctamente en ningún vuelo", "Porque el horizonte artificial mide la presión estática del aire", "No hay ninguna diferencia práctica real entre ambos instrumentos", "Porque el VSI reacciona con retraso, y corregir solo con él produce sobre-corrección"], correcta: 3 },
  { id: "ins-q17", pregunta: "Tu horizonte artificial falla por una bomba de vacío dañada, pero el coordinador de viraje (eléctrico) sigue funcionando. ¿Qué combinación de instrumentos usarías y por qué es más confiable que uno solo?", opciones: ["Coordinador de viraje, altímetro y compás, para compensar la pérdida del giróscopo de vacío", "Solo el altímetro, ignorando por completo los demás instrumentos disponibles", "Ninguna combinación de instrumentos sirve sin el horizonte artificial", "Solo el velocímetro es suficiente para mantener el control total"], correcta: 0 },
];

const QUIZ_RENDIMIENTO: QuizPregunta[] = [
  { id: "ren-q1", pregunta: "El Peso Máximo de Despegue certificado (Max Gross Weight) es:", opciones: ["Un límite opcional según el piloto", "Un límite que nunca debe excederse", "Solo aplica para aviones comerciales", "Cambia libremente según el clima"], correcta: 1 },
  { id: "ren-q2", pregunta: "El Centro de Gravedad se calcula mediante:", opciones: ["Solo el peso total del avión", "La velocidad de crucero establecida", "Momento = Peso × Brazo, sumado para cada elemento", "El nivel de combustible únicamente a bordo"], correcta: 2 },
  { id: "ren-q3", pregunta: "¿Cómo afecta un viento de cola a la distancia de despegue?", opciones: ["La reduce", "No tiene ningún efecto", "Solo afecta el aterrizaje", "La aumenta significativamente"], correcta: 3 },
  { id: "ren-q4", pregunta: "En un Cessna 172, un viento de cola de 10 nudos aumenta la distancia de aterrizaje en:", opciones: ["50%: el manual suma 10% por cada 2 nudos", "0-5%", "No afecta el aterrizaje", "200%"], correcta: 0 },
  { id: "ren-q5", pregunta: "Al usar gráficas de rendimiento, cuando tus condiciones caen entre dos valores impresos, debes:", opciones: ["Redondear siempre hacia abajo", "Interpolar proporcionalmente entre los valores", "Ignorar la gráfica y usar tu experiencia", "Usar siempre el valor más alto sin calcular"], correcta: 1 },
  { id: "ren-q6", pregunta: "¿Qué V-speed representa el mejor ángulo de ascenso, útil para despejar obstáculos?", opciones: ["Vy", "Vne", "Vx", "Va"], correcta: 2 },
  { id: "ren-q7", pregunta: "El Viento Cruzado Máximo Demostrado en el manual del avión es:", opciones: ["Un límite legal absoluto que nunca puede excederse", "Algo que solo aplica en aeropuertos internacionales grandes", "Un valor fijo que jamás varía entre modelos", "El valor máximo probado y documentado por el fabricante, sin ser límite legal"], correcta: 3 },
  { id: "ren-q8", pregunta: "En la técnica de Sideslip para viento cruzado, el piloto:", opciones: ["Baja el ala hacia el viento con alerón y usa timón opuesto", "Apunta la nariz completamente contra el viento hasta el touchdown", "Aumenta al doble la velocidad de aproximación normal planeada", "Aterriza siempre buscando tener viento de cola a favor"], correcta: 0 },
  { id: "ren-q9", pregunta: "La Carga Útil (Useful Load) es:", opciones: ["El peso del avión completamente vacío, sin nada", "La diferencia entre el peso máximo certificado y el vacío", "La velocidad máxima certificada del avión", "El combustible mínimo legal requerido siempre"], correcta: 1 },
  { id: "ren-q10", pregunta: "Un CG muy atrasado hace al avión:", opciones: ["Más estable pero pesado de controlar", "Imposible de despegar", "Más ágil pero peligrosamente inestable", "No afecta el control"], correcta: 2 },
  { id: "ren-q11", pregunta: "¿Qué V-speed es la máxima con flaps extendidos?", opciones: ["Vso", "Vr", "Vne", "Vfe"], correcta: 3 },
  { id: "ren-q12", pregunta: "El margen de seguridad recomendado sobre el valor calculado en distancia de pista es de aproximadamente:", opciones: ["Alrededor de 50% extra", "0%", "200% extra", "No se aplica margen"], correcta: 0 },
  { id: "ren-q13", pregunta: "La velocidad de rotación se abrevia:", opciones: ["Vx", "Vr", "Va", "Vs0"], correcta: 1 },
  { id: "ren-q14", pregunta: "El componente de viento cruzado es mayor cuando el ángulo del viento respecto a la pista se acerca a:", opciones: ["0°", "45°", "90°", "180°"], correcta: 2 },
  { id: "ren-q15", pregunta: "La altitud de densidad afecta principalmente:", opciones: ["El rendimiento del motor, la hélice y el ala", "Solo la lectura del altímetro", "Únicamente el consumo de combustible en crucero", "Nada: solo importa la elevación de la pista"], correcta: 0 },
  { id: "ren-q16", pregunta: "Dos despegues con el mismo peso: uno a nivel del mar en día fresco, otro en Toluca (8,466 ft) en día caluroso. ¿Cuál requiere mayor distancia de pista y qué dos factores se combinan para causarlo?", opciones: ["El de Toluca, porque la elevación y la temperatura combinadas aumentan la altitud de densidad", "El de nivel del mar, porque ahí hay más oxígeno disponible", "Ambos requieren exactamente la misma distancia de pista", "La temperatura no afecta en nada el rendimiento de despegue"], correcta: 0 },
  { id: "ren-q17", pregunta: "Comparando un aterrizaje con viento de cola de 10 nudos contra uno con viento en calma, ¿qué cambia y por qué NO deberías simplemente volar más lento para compensar?", opciones: ["No cambia absolutamente nada, el viento de cola no afecta el aterrizaje", "La distancia de aterrizaje crece mucho (50% en un C172); volar más lento con viento de cola aumenta el riesgo de pérdida", "Siempre debes aterrizar mucho más rápido con viento de cola", "El viento de cola en realidad reduce la distancia de aterrizaje"], correcta: 1 },
];

const QUIZ_OPERACION: QuizPregunta[] = [
  { id: "op-q1", pregunta: "La inspección pre-vuelo (walk-around) debe hacerse:", opciones: ["Solo la primera vez que vuelas el avión", "Únicamente si el clima está malo", "Siempre, de forma sistemática y en el mismo patrón", "Cada dos vuelos realizados en total"], correcta: 2 },
  { id: "op-q2", pregunta: "La técnica 'flujo + verificación' significa:", opciones: ["Leer la checklist línea por línea desde cero", "Ignorar la checklist si tienes experiencia", "Pedirle a otro piloto que la lea", "Ejecutar de memoria y luego confirmar con la checklist"], correcta: 3 },
  { id: "op-q3", pregunta: "La llamada 'DESPEJADO' (clear prop) se hace:", opciones: ["Antes de girar la llave de encendido", "Después de aterrizar en la pista", "Solo en aviones a reacción", "Durante el vuelo de crucero"], correcta: 0 },
  { id: "op-q4", pregunta: "Si la presión de aceite no sube en el tiempo que marca el POH tras el arranque, debes:", opciones: ["Seguir volando normal", "Apagar el motor de inmediato", "Aumentar potencia", "Ignorarlo si el motor suena bien"], correcta: 1 },
  { id: "op-q5", pregunta: "Durante el rodaje, la dirección se controla principalmente con:", opciones: ["El yoke", "La mezcla", "Los pedales de timón", "El trim"], correcta: 2 },
  { id: "op-q6", pregunta: "El run-up incluye verificar:", opciones: ["Solo el nivel de combustible restante", "El clima esperado en el destino", "Solo el estado de las luces", "Cada magneto individualmente y los instrumentos del motor"], correcta: 3 },
  { id: "op-q7", pregunta: "Durante el ascenso, Vy se usa para:", opciones: ["Mejor tasa de ascenso, ganando altitud más rápido", "Mejor ángulo de ascenso posible", "Velocidad óptima de crucero establecida", "Aterrizar con la configuración adecuada"], correcta: 0 },
  { id: "op-q8", pregunta: "Ajustar la mezcla en crucero (leaning) sirve para:", opciones: ["Aumentar el ruido del motor", "Optimizar consumo y rendimiento a esa altitud", "Apagar el motor gradualmente", "No tiene ningún efecto"], correcta: 1 },
  { id: "op-q9", pregunta: "Una regla práctica para el descenso es multiplicar la altitud a perder (en miles de pies) por:", opciones: ["1", "10", "3", "No existe tal regla"], correcta: 2 },
  { id: "op-q10", pregunta: "Una aproximación inestable debe resolverse con:", opciones: ["Forzar el aterrizaje de todas formas", "Reducir la velocidad al mínimo", "Pedir ayuda a la torre únicamente", "Un go-around, sin dudar"], correcta: 3 },
  { id: "op-q11", pregunta: "El flare (redondeo) ocurre:", opciones: ["Justo antes de tocar tierra, reduciendo la tasa de descenso", "Justo al iniciar el descenso inicial", "Durante el rodaje hacia la pista", "Al arrancar el motor del avión"], correcta: 0 },
  { id: "op-q12", pregunta: "¿Cuándo se ejecuta la checklist 'después de aterrizaje'?", opciones: ["Justo antes de tocar la pista", "Una vez fuera de la pista activa", "Durante el flare final", "Nunca es realmente necesaria"], correcta: 1 },
  { id: "op-q13", pregunta: "Existen checklists:", opciones: ["Solo de emergencia", "Solo normales", "Normales, Anormales y de Emergencia", "No existen categorías"], correcta: 2 },
  { id: "op-q14", pregunta: "Durante la carrera de despegue, si algo se ve mal en los instrumentos del motor:", opciones: ["Continuar siempre el despegue", "Ignorarlo y revisar después", "Aumentar potencia al máximo", "Abortar: cerrar potencia y frenar mientras quede pista para detenerte"], correcta: 3 },
  { id: "op-q15", pregunta: "Después de aterrizar y estacionar, el procedimiento de apagado incluye:", opciones: ["Mezcla a corte y magnetos apagados", "Dejar el motor encendido", "Solo cerrar la puerta", "Nada en particular"], correcta: 0 },
  { id: "op-q16", pregunta: "Durante el arranque, en un caso la presión de aceite no sube en el tiempo que marca el POH; en otro, sube normal pero las RPM son inestables. ¿Cuál exige apagar de inmediato y cuál permite observar brevemente?", opciones: ["Ambas exigen apagar el motor de inmediato sin ninguna excepción", "La falta de presión de aceite exige apagar de inmediato; las RPM inestables pueden observarse unos segundos", "Ninguna de las dos situaciones requiere ninguna acción inmediata", "Las RPM inestables siempre son más graves que la presión de aceite"], correcta: 1 },
  { id: "op-q17", pregunta: "Comparando una aproximación estabilizada contra una inestable a 200 pies de altura, ¿qué decisión corresponde a cada una y por qué la indecisión es el mayor riesgo en la segunda?", opciones: ["Continuar el aterrizaje en ambos casos exactamente por igual", "Siempre abortar el aterrizaje sin importar la estabilización real", "Si está estabilizada, continuar; si está inestable, ejecutar un go-around de inmediato sin dudar", "La estabilización de la aproximación no afecta la decisión final"], correcta: 2 },
];

const QUIZ_ESPACIOS: QuizPregunta[] = [
  { id: "esp-q1", pregunta: "En la clasificación OACI, el espacio Clase A es:", opciones: ["Espacio no controlado para vuelos de entrenamiento", "Espacio solo para vuelos IFR, donde el VFR no está permitido", "Espacio donde al VFR le basta con contacto por radio", "Espacio que empieza en FL180 en todos los países"], correcta: 1 },
  { id: "esp-q2", pregunta: "Para entrar en espacio Clase B necesitas:", opciones: ["Autorización EXPLÍCITA de control antes de entrar", "Solo establecer contacto por radio", "Nada, es espacio no controlado", "Solo un plan de vuelo IFR"], correcta: 0 },
  { id: "esp-q3", pregunta: "Según la OACI, ¿qué diferencia hay entre Clase B y Clase C para un vuelo VFR?", opciones: ["Ninguna, en ambas el control separa a todos los vuelos", "En B el control separa al VFR de todos; en C solo de los IFR, y de los otros VFR le da información", "En C no se necesita autorización para entrar", "La Clase C no existe en la clasificación OACI"], correcta: 1 },
  { id: "esp-q4", pregunta: "La OACI recomienda que una zona de control (CTR) se extienda, desde el centro del aeródromo, al menos:", opciones: ["5 NM (9.3 km) en las direcciones de aproximación", "50 NM en todas direcciones", "1 NM alrededor de la pista", "No tiene ningún límite recomendado"], correcta: 0 },
  { id: "esp-q5", pregunta: "En espacio Clase G (no controlado):", opciones: ["No aplican reglas de ningún tipo en absoluto", "Se requiere autorización explícita de la torre de control", "Está completamente prohibido volar bajo reglas VFR", "Aún aplican mínimos de visibilidad y nubes, aunque más permisivos"], correcta: 3 },
  { id: "esp-q6", pregunta: "Un Área Restringida (prefijo R-) se caracteriza por:", opciones: ["Actividad peligrosa; se cruza con autorización y a menudo solo está activa en horarios publicados", "Una prohibición absoluta y permanente en todo momento", "Ser siempre clasificada como espacio aéreo Clase A", "No existir realmente en la práctica de vuelo"], correcta: 0 },
  { id: "esp-q7", pregunta: "Un Área Prohibida (prefijo P-) implica:", opciones: ["Se cruza pidiendo autorización por radio al control", "El vuelo está prohibido, a cualquier hora", "Solo aplica de noche", "Es lo mismo que una restringida"], correcta: 1 },
  { id: "esp-q8", pregunta: "Una zona peligrosa (D):", opciones: ["Es tan restrictiva como una zona prohibida", "Solo existe sobre tierra firme", "No es legalmente restrictiva, pero señala actividad peligrosa", "Requiere autorización militar en todo momento"], correcta: 2 },
  { id: "esp-q9", pregunta: "¿Qué necesitas como mínimo para entrar en VFR a espacio Clase B, C o D?", opciones: ["Solo un mapa impreso a bordo", "Ningún equipo especial", "Solo un receptor GPS", "Radio para hablar en ambos sentidos con el control, y el transpondedor que pida el AIP"], correcta: 3 },
  { id: "esp-q10", pregunta: "Al planear una ruta VFR, el espacio aéreo determina principalmente:", opciones: ["Qué comunicaciones, equipo y mínimos aplican en cada tramo", "Solo el color del avión que está permitido", "El precio del combustible en ese aeropuerto", "Nada relevante para la planificación VFR"], correcta: 0 },
  { id: "esp-q11", pregunta: "¿Qué forma suele tener el espacio controlado alrededor de un aeropuerto con mucho tránsito?", opciones: ["Un cuadrado perfecto", "Escalonada: angosta abajo y más ancha con la altura", "Una línea recta", "No tiene una forma definida"], correcta: 1 },
  { id: "esp-q12", pregunta: "Cuando cierra la torre, el espacio Clase D alrededor del aeropuerto:", opciones: ["Pasa a Clase A", "Pasa a Clase B", "Cambia a lo que publique el AIP para ese horario, a menudo espacio no controlado", "Sigue siendo Clase D siempre"], correcta: 2 },
  { id: "esp-q13", pregunta: "En espacio Clase E, un vuelo VFR:", opciones: ["Necesita autorización del control para entrar", "No necesita autorización ni radio, pero debe cumplir los mínimos VMC", "No puede volar", "Solo puede volar de noche"], correcta: 1 },
  { id: "esp-q14", pregunta: "La única regla de separación en espacio Clase G es:", opciones: ["'Ve y evita'", "Autorización de control", "Contacto obligatorio por radio", "No existe ninguna regla"], correcta: 0 },
  { id: "esp-q15", pregunta: "Antes de asumir que una Restringida puede cruzarse libremente fuera de horario, debes:", opciones: ["Nada, simplemente cruzar", "Verificar los NOTAMs vigentes", "Pedir permiso a otro piloto", "Esperar la noche"], correcta: 1 },
  { id: "esp-q16", pregunta: "Tu ruta cruza primero espacio Clase C y luego el de un aeródromo Clase D cuya torre ya cerró y que, según el AIP, pasa a Clase G. ¿Qué necesitas en cada tramo?", opciones: ["Autorización del control en los dos tramos", "Nada en ninguno de los dos", "Autorización del control antes de entrar a la Clase C; en el tramo G no se requiere", "Solo en el tramo de la torre cerrada"], correcta: 2 },
  { id: "esp-q17", pregunta: "Comparando un Área Restringida activa fuera de su horario publicado contra una Prohibida en cualquier momento, ¿qué verificación previa es indispensable antes de asumir que la Restringida está libre para cruzar?", opciones: ["Ninguna, si no está en horario siempre queda libre", "Preguntar a otro piloto en la misma frecuencia", "Ambas siempre están disponibles para cruzarse libremente", "Verificar los NOTAMs vigentes, ya que el horario puede cambiar; la Prohibida no se cruza a ninguna hora"], correcta: 3 },
];

const QUIZ_REGLAMENTACION: QuizPregunta[] = [
  { id: "reg-q1", pregunta: "El vuelo VFR se basa en:", opciones: ["Volar en condiciones visuales (VMC), viendo y evitando", "Navegación exclusiva por instrumentos de vuelo", "Autorización obligatoria de control en todo momento", "No requiere ninguna regla de separación real"], correcta: 0 },
  { id: "reg-q2", pregunta: "Si dos aviones se acercan de frente, según el derecho de paso:", opciones: ["El más rápido tiene prioridad", "Ambos viran a su derecha", "El de mayor tamaño siempre tiene prioridad", "No hay regla definida"], correcta: 1 },
  { id: "reg-q3", pregunta: "El vuelo IFR requiere:", opciones: ["Nunca presentar ningún plan de vuelo formal", "Solo referencia visual del terreno circundante", "Plan de vuelo y, en espacio controlado, autorización del control", "No necesita ningún equipo especial a bordo"], correcta: 2 },
  { id: "reg-q4", pregunta: "La progresión de licencias en México es:", opciones: ["TPI, comercial, privado, formación", "Solo existe una licencia universal", "Comercial, luego privado", "Permiso de formación, privado, comercial y TPI"], correcta: 3 },
  { id: "reg-q5", pregunta: "¿Quién expide las licencias de piloto en México, y con qué reglamento?", opciones: ["La AFAC, con su Reglamento de licencias del personal técnico aeronáutico", "La AFAC, con el RAC 61", "La FAA, la autoridad estadounidense de aviación", "La OACI, directamente a cada piloto"], correcta: 0 },
  { id: "reg-q6", pregunta: "Además de horas de vuelo, obtener una licencia requiere:", opciones: ["Solo pagar una cuota administrativa correspondiente", "Certificado médico vigente, examen teórico y checkride práctico", "Nada más que cumplir la edad mínima", "Solo aprobar un examen de manejo automotriz"], correcta: 1 },
  { id: "reg-q7", pregunta: "Como referencia general, la reserva mínima de combustible VFR diurno es aproximadamente:", opciones: ["5 minutos", "3 horas", "30 minutos", "No se requiere reserva en VFR diurno"], correcta: 2 },
  { id: "reg-q8", pregunta: "Con la tabla de la OACI, los mínimos meteorológicos VFR:", opciones: ["Son iguales en todas partes y a cualquier altitud", "Solo aplican durante los vuelos nocturnos", "No existen mínimos legales en ningún tipo de espacio", "Dependen de la clase de espacio y de la altitud"], correcta: 3 },
  { id: "reg-q9", pregunta: "¿Qué calificación adicional (rating) se suma comúnmente a una licencia?", opciones: ["Instrumentos, Multimotor, Instructor de vuelo", "Ninguna, la licencia es fija", "Solo se permite una licencia por vida", "Únicamente vuelo acrobático"], correcta: 0 },
  { id: "reg-q10", pregunta: "En México, la licencia de piloto privado pide un mínimo de:", opciones: ["10 horas totales", "40 horas de vuelo", "500 horas totales", "No tiene mínimo de horas"], correcta: 1 },
  { id: "reg-q11", pregunta: "En México, la licencia de piloto comercial pide un mínimo de:", opciones: ["10 a 20 horas", "1,500 horas", "180 horas de instrucción", "No pide horas adicionales al privado"], correcta: 2 },
  { id: "reg-q12", pregunta: "El nivel 4 de competencia lingüística OACI, que se pide para radiocomunicación en inglés:", opciones: ["No vence nunca", "Dura un mes", "Solo vale para vuelos nacionales", "Dura tres años y se vuelve a evaluar"], correcta: 3 },
  { id: "reg-q13", pregunta: "El piloto IFR mantiene su experiencia reciente con:", opciones: ["Un mínimo de aproximaciones y procedimientos practicados recientemente", "Nada adicional más allá de la licencia", "Solo volar una vez cada año", "Un examen médico de forma mensual"], correcta: 0 },
  { id: "reg-q14", pregunta: "En VFR de noche, la reserva mínima de combustible de la OACI es:", opciones: ["15 minutos", "45 minutos", "3 horas", "No cambia respecto al VFR diurno"], correcta: 1 },
  { id: "reg-q15", pregunta: "Si el pronóstico del destino no alcanza los mínimos IFR publicados:", opciones: ["Volar de todas formas y decidir al llegar", "Cancelar toda la temporada de vuelos", "Llevar un alterno cuyo pronóstico sí alcance los mínimos; si ninguno los alcanza, no salir", "Ninguna acción especial"], correcta: 2 },
  { id: "reg-q16", pregunta: "Comparando la reserva VFR diurna (30 min) contra la nocturna (45 min), si tu ETA de un vuelo nocturno planeado al límite se recorre 20 minutos por viento en contra, ¿qué debiste haber hecho al planear?", opciones: ["Nada, la reserva mínima siempre alcanza sin importar cualquier retraso", "Volar mucho más rápido para compensar automáticamente el retraso", "El retraso nunca afecta en nada los requisitos de combustible", "Agregar un margen adicional de combustible más allá del mínimo legal, sobre todo de noche"], correcta: 3 },
  { id: "reg-q17", pregunta: "Comparando la progresión formación → privado → comercial, si un cadete quiere llevar pasajeros antes de tener 40 horas totales, ¿qué le falta y por qué importa el orden de los requisitos?", opciones: ["Le falta la licencia de piloto privado, ya que llevar pasajeros requiere una licencia vigente, no solo horas", "Nada, puede llevar pasajeros sin licencia si tiene experiencia suficiente", "Solo necesita aprobar el examen médico correspondiente", "El orden de los requisitos no importa realmente en la práctica"], correcta: 0 },
];

const QUIZ_IFR: QuizPregunta[] = [
  { id: "ifr-q1", pregunta: "IFR permite volar:", opciones: ["Solo con buen clima despejado", "Navegando exclusivamente por instrumentos, sin referencia visual externa", "Sin ningún tipo de contacto con ATC", "Solo durante las horas de día"], correcta: 1 },
  { id: "ifr-q2", pregunta: "Un plan de vuelo IFR incluye:", opciones: ["Solo el nombre del piloto", "Nada relacionado al combustible", "Ruta, altitud de crucero, combustible y alterno", "Solo se presenta en el aire"], correcta: 2 },
  { id: "ifr-q3", pregunta: "Una SID sirve para:", opciones: ["Conectar el aeropuerto de destino con la aproximación final", "Solo se usa durante vuelos VFR diurnos", "Reemplazar por completo el plan de vuelo", "Conectar el aeropuerto de salida con la estructura de aerovías"], correcta: 3 },
  { id: "ifr-q4", pregunta: "Las Aerovías Victor operan:", opciones: ["En baja altitud, típicamente hasta FL180", "Sobre FL180 únicamente", "Solo sobre el océano", "Sin relación con VOR"], correcta: 0 },
  { id: "ifr-q5", pregunta: "Una STAR es el procedimiento inverso a:", opciones: ["El aterrizaje", "La SID", "El holding", "El plan de vuelo"], correcta: 1 },
  { id: "ifr-q6", pregunta: "El ILS provee guía:", opciones: ["Solo lateral", "Solo vertical", "Lateral (Localizer) y vertical (Glideslope)", "Ninguna guía electrónica"], correcta: 2 },
  { id: "ifr-q7", pregunta: "Al llegar a la DA sin referencias visuales suficientes, debes:", opciones: ["Descender un poco más por si acaso", "Esperar en el aire indefinidamente", "Aterrizar de todas formas", "Ejecutar de inmediato la aproximación frustrada"], correcta: 3 },
  { id: "ifr-q8", pregunta: "RNAV usa como referencia principal:", opciones: ["GPS/GNSS", "Estaciones VOR terrestres", "El compás magnético", "Radiales NDB"], correcta: 0 },
  { id: "ifr-q9", pregunta: "Una aproximación VOR usa, en vez de DA, una:", opciones: ["STAR", "MDA (Minimum Descent Altitude)", "SID", "Holding altitude"], correcta: 1 },
  { id: "ifr-q10", pregunta: "Un holding es:", opciones: ["Un tipo de aterrizaje de emergencia", "Una autorización de despegue especial", "Un patrón de espera en forma de hipódromo", "Un tipo de carta de navegación VFR"], correcta: 2 },
  { id: "ifr-q11", pregunta: "El formato CRAFT de una autorización IFR incluye:", opciones: ["Solo la ruta", "Solo el squawk", "El nombre del controlador", "Clearance limit, Route, Altitude, Frequency, Transponder"], correcta: 3 },
  { id: "ifr-q12", pregunta: "Una SID garantiza principalmente:", opciones: ["Separación de obstáculos y terreno durante el ascenso inicial", "Un menor consumo de combustible en ruta", "Un aterrizaje mucho más suave", "Comunicación exclusivamente en idioma español"], correcta: 0 },
  { id: "ifr-q13", pregunta: "Las Aerovías Victor se definen por:", opciones: ["Coordenadas GPS únicamente", "Radiales VOR, hasta FL180", "Rutas Jet sobre FL450", "No tienen definición estándar"], correcta: 1 },
  { id: "ifr-q14", pregunta: "¿Qué nivel de aproximación RNAV ofrece los mínimos más bajos, comparables a un ILS CAT I?", opciones: ["LNAV", "LNAV/VNAV", "LPV", "VOR Approach"], correcta: 2 },
  { id: "ifr-q15", pregunta: "En un holding, la entrada donde te alejas en ángulo antes de virar hacia el fix se llama:", opciones: ["Directa", "Paralela", "No existe ese tipo de entrada", "Teardrop"], correcta: 3 },
  { id: "ifr-q16", pregunta: "Comparando una aproximación ILS (con DA) contra una VOR (con MDA), si llegas a tu altitud mínima sin referencias visuales en ambos casos, ¿qué diferencia hay en cuánto tiempo puedes permanecer en esa altitud antes de decidir?", opciones: ["En la DA debes iniciar la aproximación frustrada de inmediato; en la MDA puedes continuar nivelado brevemente", "Ninguna diferencia real, ambas son idénticas en este aspecto", "La MDA siempre exige una acción inmediata, y la DA no", "Puedes descender por debajo de cualquiera de las dos sin ningún problema"], correcta: 0 },
  { id: "ifr-q17", pregunta: "Comparando una SID con una STAR, si ATC te cambia de pista antes del despegue después de asignarte una SID, ¿qué parte de tu briefing original ya no es válida?", opciones: ["Nada cambia, las SID son iguales sin importar la pista asignada", "La ruta y restricciones de la SID cambian según la pista; revisa la nueva SID antes de rodar", "Solo el código squawk cambia según la pista asignada", "El cambio de pista nunca afecta al procedimiento de salida"], correcta: 1 },
];

const QUIZ_FUNDAMENTOS: QuizPregunta[] = [
  { id: "fun-q1", pregunta: "¿Qué hace que un avión se mantenga en el aire?", opciones: ["Únicamente la velocidad alcanzada en vuelo", "El tamaño total del avión en sí", "La sustentación de las alas venciendo el peso", "Únicamente la potencia del motor instalado"], correcta: 2 },
  { id: "fun-q2", pregunta: "En vuelo recto y nivelado a velocidad constante, ¿qué fuerzas están en equilibrio?", opciones: ["Solo el peso y la sustentación", "Solo el empuje y la resistencia", "Ninguna, siempre existe cierta aceleración", "Sustentación = Peso y Empuje = Resistencia"], correcta: 3 },
  { id: "fun-q3", pregunta: "¿Qué principio explica la sustentación por diferencia de presión sobre el ala?", opciones: ["Principio de Bernoulli", "Tercera Ley de Newton", "Principio de Arquímedes", "Ley de Pascal"], correcta: 0 },
  { id: "fun-q4", pregunta: "¿Qué parte del avión incluye el estabilizador horizontal y vertical?", opciones: ["Fuselaje", "Empenaje (cola)", "Alas", "Tren de aterrizaje"], correcta: 1 },
  { id: "fun-q5", pregunta: "¿Qué movimiento controlan los alerones?", opciones: ["Cabeceo", "Guiñada", "Alabeo", "Potencia"], correcta: 2 },
  { id: "fun-q6", pregunta: "El giro alrededor del eje vertical se llama:", opciones: ["Alabeo", "Cabeceo", "Ninguno de los anteriores", "Guiñada"], correcta: 3 },
  { id: "fun-q7", pregunta: "¿Qué control ajusta la proporción de combustible y aire según la altitud?", opciones: ["Mixture (mezcla)", "Yoke", "Pedales", "Throttle"], correcta: 0 },
  { id: "fun-q8", pregunta: "¿Cuál de estos NO forma parte del 'Six Pack' analógico?", opciones: ["Altímetro", "GPS", "Horizonte artificial", "Variómetro"], correcta: 1 },
  { id: "fun-q9", pregunta: "El Tren de aterrizaje tiene como función principal:", opciones: ["Generar sustentación adicional durante el vuelo", "Controlar la guiñada del avión en vuelo", "Soportar el peso en tierra y absorber el impacto", "Reducir el consumo total de combustible"], correcta: 2 },
  { id: "fun-q10", pregunta: "¿Qué superficie controla la guiñada (yaw)?", opciones: ["Alerones", "Flaps", "Elevador", "Timón de dirección"], correcta: 3 },
  { id: "fun-q11", pregunta: "El giro alrededor del eje longitudinal (nariz-cola) se llama:", opciones: ["Alabeo (roll)", "Cabeceo", "Guiñada", "Velocidad"], correcta: 0 },
  { id: "fun-q12", pregunta: "¿Qué controla el Yoke al moverlo hacia adelante o atrás?", opciones: ["Los alerones", "El elevador (cabeceo)", "El timón de dirección", "La mezcla"], correcta: 1 },
  { id: "fun-q13", pregunta: "Además del timón de dirección, los pedales controlan en tierra:", opciones: ["La potencia del motor instalado", "Los flaps extendidos del ala", "El frenado diferencial y la dirección de la rueda", "El horizonte artificial de la cabina"], correcta: 2 },
  { id: "fun-q14", pregunta: "¿Qué instrumento muestra la actitud respecto al horizonte real?", opciones: ["Altímetro", "Indicador de rumbo", "Variómetro", "Horizonte artificial (Attitude Indicator)"], correcta: 3 },
  { id: "fun-q15", pregunta: "Volar es, en esencia:", opciones: ["Un equilibrio dinámico de fuerzas", "Un truco de velocidad pura", "Un efecto exclusivo del motor", "Un fenómeno sin explicación física"], correcta: 0 },
  { id: "fun-q16", pregunta: "Comparando dos aviones idénticos a la misma velocidad, uno con mayor ángulo de ataque que el otro, ¿cuál genera más sustentación y qué riesgo aumenta si ese ángulo sigue creciendo?", opciones: ["El de menor ángulo, porque el riesgo es quedarse sin combustible", "El de mayor ángulo genera más sustentación hasta el ángulo crítico, luego entra en pérdida", "Ambos generan exactamente la misma sustentación en cualquier caso", "El ángulo de ataque no afecta en nada la sustentación generada"], correcta: 1 },
  { id: "fun-q17", pregunta: "En un viraje, si aplicas solo alerón sin nada de timón, ¿qué efecto secundario no deseado aparece y por qué se usa el timón para corregirlo?", opciones: ["Ninguno, los alerones son suficientes por completo solos", "El avión pierde toda su sustentación de forma inmediata", "Aparece guiñada adversa: el ala que sube, con su alerón abajo, genera más resistencia inducida; el timón la compensa", "El motor se apaga automáticamente al iniciar el viraje"], correcta: 2 },
];

const QUIZ_AERODINAMICA: QuizPregunta[] = [
  { id: "aero-q1", pregunta: "Para generar la misma sustentación a menor velocidad, el ala necesita:", opciones: ["Un ángulo de ataque menor", "La velocidad no se relaciona con el ángulo de ataque", "Solo depende de la potencia del motor", "Un ángulo de ataque mayor"], correcta: 3 },
  { id: "aero-q2", pregunta: "El factor de carga aproximado en un viraje coordinado con 60° de inclinación es:", opciones: ["2G", "1G", "1.4G", "4G"], correcta: 0 },
  { id: "aero-q3", pregunta: "¿Qué es la pérdida aerodinámica (stall)?", opciones: ["Cuando el motor se apaga por completo en pleno vuelo", "Cuando el flujo de aire se separa del ala al superar el ángulo crítico", "Cuando el avión vuela mucho más rápido de lo normal", "Cuando falla por completo el tren de aterrizaje"], correcta: 1 },
  { id: "aero-q4", pregunta: "La velocidad de pérdida aumenta cuando:", opciones: ["Disminuye considerablemente el peso de la aeronave", "Se extienden por completo los flaps del ala", "Aumenta el factor de carga, como en un viraje pronunciado", "El avión vuela en línea recta y nivelada"], correcta: 2 },
  { id: "aero-q5", pregunta: "El efecto suelo (ground effect) ocurre:", opciones: ["Solo durante el vuelo de crucero a gran altitud", "Únicamente con el tren de aterrizaje retraído", "Nunca afecta el rendimiento del avión", "Cerca del suelo, reduciendo la resistencia inducida del ala"], correcta: 3 },
  { id: "aero-q6", pregunta: "La resistencia inducida es mayor cuando:", opciones: ["El ángulo de ataque es alto, como a baja velocidad", "El avión vuela a una velocidad muy alta", "Los flaps están completamente retraídos hacia el ala", "El avión está en una picada pronunciada"], correcta: 0 },
  { id: "aero-q7", pregunta: "El P-factor (carga asimétrica de la hélice), en un motor de giro horario visto desde la cabina, tiende a guiñar el avión hacia:", opciones: ["La derecha, sin importar la potencia que se aplique", "La izquierda, en ángulos de ataque altos y alta potencia", "Ninguna dirección en particular, no tiene efecto real", "Solo afecta a los motores de tipo turbohélice"], correcta: 1 },
  { id: "aero-q8", pregunta: "Las 'tendencias de giro a la izquierda' en un avión de hélice de un motor combinan:", opciones: ["Únicamente el efecto conocido como P-factor", "Solo el flujo espiral generado por la hélice", "Torque, precesión giroscópica, P-factor y el flujo espiral", "Ninguna tendencia relevante en los aviones modernos"], correcta: 2 },
  { id: "aero-q9", pregunta: "Una barrena (spin) ocurre cuando:", opciones: ["El avión vuela a una velocidad excesiva", "Se extienden los flaps durante el crucero", "El motor pierde potencia de forma muy gradual", "Una pérdida asimétrica hace que un ala se pierda antes, entrando en rotación autosostenida"], correcta: 3 },
  { id: "aero-q10", pregunta: "Al extender los flaps, a la misma velocidad, el ala genera:", opciones: ["Más sustentación y más resistencia", "Menos sustentación y menos resistencia", "Más sustentación y menos resistencia", "La misma sustentación y la misma resistencia"], correcta: 0 },
  { id: "aero-q11", pregunta: "En un despegue, el efecto suelo levanta el avión antes de la velocidad recomendada. ¿Qué riesgo hay al seguir subiendo?", opciones: ["Ninguno: si ya vuela, seguirá ascendiendo igual", "Al salir del efecto suelo sube la resistencia inducida y, sin velocidad suficiente, puede no seguir ascendiendo", "El motor pierde potencia al alejarse de la pista", "Los flaps se retraen solos al ganar altura"], correcta: 1 },
  { id: "aero-q12", pregunta: "La velocidad de maniobra (Va) representa:", opciones: ["La velocidad máxima estructural permitida del avión", "La velocidad mínima de control direccional posible", "La velocidad por debajo de la cual el avión entra en pérdida antes de dañarse estructuralmente", "La velocidad óptima establecida para el crucero"], correcta: 2 },
  { id: "aero-q13", pregunta: "Inicias un viraje a la izquierda solo con alerones, sin pedal. Al principio, el morro tiende a irse:", opciones: ["A la izquierda, más rápido de lo normal", "Hacia arriba, por el cambio de sustentación", "A ningún lado: los alerones no producen guiñada", "A la derecha, por la guiñada adversa"], correcta: 3 },
  { id: "aero-q14", pregunta: "Durante un despegue con viento cruzado, ¿qué tendencia direccional se suma a las tendencias de giro a la izquierda normales?", opciones: ["El viento cruzado empuja la cola y el avión tiende a virar hacia el viento", "Ninguna tendencia, el viento cruzado no afecta la dirección en tierra", "El avión siempre vira en la dirección contraria al viento", "Solo afecta a la dirección una vez que está en el aire"], correcta: 0 },
  { id: "aero-q15", pregunta: "El trim (compensador) del elevador sirve para:", opciones: ["Aumentar la potencia disponible del motor instalado", "Reducir la fuerza que el piloto debe sostener para mantener una actitud", "Controlar la guiñada del avión durante el vuelo", "Retraer por completo el tren de aterrizaje"], correcta: 1 },
  { id: "aero-q16", pregunta: "Comparando un viraje nivelado a 30° contra uno a 60° a la misma velocidad, ¿en cuál estás más cerca de la pérdida y por qué?", opciones: ["En el de 30°, porque el ala trabaja menos y pierde sustentación", "En los dos igual, porque la velocidad es la misma", "En el de 60°, porque el factor de carga sube a 2 G y con él la velocidad de pérdida", "En ninguno: la inclinación no cambia la velocidad de pérdida"], correcta: 2 },
  { id: "aero-q17", pregunta: "Comparando un despegue a alta potencia y ángulo de ataque alto contra un crucero nivelado a potencia reducida, ¿en cuál las tendencias de giro a la izquierda (P-factor, torque, precesión, flujo espiral) son más pronunciadas?", opciones: ["En crucero, porque ahí la velocidad alcanzada es mayor", "Son idénticas en ambos casos, sin ninguna diferencia real", "Las tendencias de giro no dependen de la potencia ni el ángulo", "En el despegue, porque la alta potencia y el alto ángulo de ataque intensifican el P-factor y el torque"], correcta: 3 },
];

const QUIZ_VFR: QuizPregunta[] = [
  { id: "vfr-q1", pregunta: "En espacio aéreo controlado por debajo de 10,000 ft MSL, el mínimo de visibilidad VFR es:", opciones: ["3 millas", "1 milla", "5 millas", "No existe un mínimo definido"], correcta: 0 },
  { id: "vfr-q2", pregunta: "Los mínimos de separación de nubes en Clase C, D o E por debajo de 10,000 ft son:", opciones: ["Libre de nubes en todo momento sin excepción", "500 ft por debajo, 1,000 ft por encima y 2,000 ft horizontal", "100 ft de separación en cualquier dirección posible", "No se requiere ninguna separación de nubes"], correcta: 1 },
  { id: "vfr-q3", pregunta: "En espacio no controlado (Clase G) de día, por debajo de 1,200 ft AGL, el mínimo es:", opciones: ["5 millas de visibilidad siempre", "10 millas de visibilidad", "1 milla de visibilidad y libre de nubes", "No hay ningún mínimo en Clase G"], correcta: 2 },
  { id: "vfr-q4", pregunta: "La altura estándar del tramo de 'viento en cola' (downwind) en un patrón de tráfico es típicamente:", opciones: ["500 ft AGL", "3,000 ft AGL", "No existe una altura estándar", "1,000 ft AGL"], correcta: 3 },
  { id: "vfr-q5", pregunta: "El patrón de tráfico estándar utiliza virajes hacia:", opciones: ["La izquierda, salvo que se indique lo contrario", "La derecha siempre, sin excepción", "Alternando en cada vuelta al patrón", "Depende únicamente de la dirección del viento"], correcta: 0 },
  { id: "vfr-q6", pregunta: "El tramo 'base' del patrón de tráfico es:", opciones: ["Paralelo a la pista, en dirección de aterrizaje", "Perpendicular a la pista, justo antes de virar a 'final'", "El primer tramo justo después del despegue", "Exactamente lo mismo que el tramo 'final'"], correcta: 1 },
  { id: "vfr-q7", pregunta: "Al entrar a un patrón de tráfico no controlado, la entrada recomendada es:", opciones: ["Directa a 'final' sin anunciarse por radio", "Siempre desde el tramo de base establecido", "A 45° hacia el viento en cola, integrándose al circuito", "Cualquier ángulo, sin ninguna necesidad de comunicar"], correcta: 2 },
  { id: "vfr-q8", pregunta: "Si el techo de nubes reportado es de solo 900 ft AGL, ¿generalmente puedes operar con seguridad en el patrón de tráfico?", opciones: ["Sí, sin ninguna restricción particular a considerar", "Solo si el vuelo ocurre durante la noche", "Solo con autorización verbal de otro piloto cercano", "No: con techo bajo 1,000 ft, en un aeropuerto controlado necesitas Special VFR"], correcta: 3 },
  { id: "vfr-q9", pregunta: "El reporte de posición 'entrando en viento en cola' se hace generalmente:", opciones: ["Al establecerte en viento en cola, antes de virar a base", "Justo después de haber aterrizado por completo", "Solo si ese aeropuerto cuenta con torre", "Nunca es realmente necesario reportarlo"], correcta: 0 },
  { id: "vfr-q10", pregunta: "Antes de un vuelo VFR, además de verificar los mínimos meteorológicos, debes revisar:", opciones: ["Únicamente el color exterior del avión", "NOTAMs vigentes, combustible con reserva adecuada, y peso y balance", "Nada adicional si el clima ya está despejado", "Solo la hora programada para la salida"], correcta: 1 },
  { id: "vfr-q11", pregunta: "Comparando los mínimos VFR en espacio controlado contra los de Clase G por debajo de 1,200 ft AGL de día, ¿cuál es más permisivo y por qué existe esa diferencia?", opciones: ["El controlado es más permisivo porque tiene menos tráfico", "Ambos tienen exactamente los mismos mínimos siempre", "Clase G es más permisivo porque tiene menor tráfico y ATC no gestiona la separación", "No existe ninguna diferencia real entre ambos espacios"], correcta: 2 },
  { id: "vfr-q12", pregunta: "Entras a 'viento en cola' mientras otro avión reporta estar en 'final' del mismo patrón. ¿Qué debes hacer?", opciones: ["Acelerar para intentar aterrizar antes que él", "Ignorarlo, ya que estás dentro del patrón establecido", "Abandonar el aeropuerto y desviarte a otro sin evaluar", "Ceder el paso y ajustar tu posición para mantener separación segura"], correcta: 3 },
  { id: "vfr-q13", pregunta: "El tramo 'final' del patrón de tráfico es:", opciones: ["El tramo alineado con la pista, justo antes de aterrizar", "El primer tramo justo después del despegue inicial", "Exactamente lo mismo que el tramo de 'viento en cola'", "Un tramo opcional que se puede omitir"], correcta: 0 },
  { id: "vfr-q14", pregunta: "Un 'go-around' desde el patrón de tráfico se ejecuta cuando:", opciones: ["En cada aproximación realizada, sin ninguna excepción", "La aproximación no está estabilizada o la pista no está despejada", "Únicamente si lo indica la torre de control", "Nunca es necesario en aeropuertos sin torre"], correcta: 1 },
  { id: "vfr-q15", pregunta: "Con las reglas de la FAA, ¿qué diferencia hay entre los mínimos meteorológicos VFR de día y de noche?", opciones: ["No existe ninguna diferencia real entre ambos horarios", "Los mínimos diurnos son siempre más estrictos que los nocturnos", "En espacio controlado son iguales; en Clase G son más estrictos de noche", "De noche no se requiere ningún mínimo meteorológico real"], correcta: 2 },
  { id: "vfr-q16", pregunta: "Comparando volar en espacio Clase G por debajo de 1,200 ft AGL de día contra hacerlo de noche en el mismo espacio, ¿qué cambia en los mínimos y por qué?", opciones: ["No cambia absolutamente nada entre el día y la noche", "De día los mínimos son más estrictos que de noche", "De noche no se permite volar VFR bajo ninguna circunstancia", "De noche los mínimos son más exigentes, porque la referencia visual es mucho más limitada"], correcta: 3 },
  { id: "vfr-q17", pregunta: "Comparando una entrada directa a 'final' sin anunciarte contra una entrada estándar a 45° hacia el viento en cola, ¿por qué la segunda reduce el riesgo de colisión en un aeropuerto sin torre?", opciones: ["La entrada a 45° te integra en la secuencia visible donde otros pilotos ya esperan verte", "Ambas son igual de seguras, es solo una preferencia personal", "La entrada directa a final siempre es preferible por ser más rápida", "El ángulo de entrada no afecta en nada el riesgo de colisión"], correcta: 0 },
];

export const MODULE_PRACTICA: Record<string, QuizPregunta[]> = {
  fundamentos: split(QUIZ_FUNDAMENTOS).practica,
  meteorologia: split(QUIZ_METEOROLOGIA).practica,
  aerodinamica: split(QUIZ_AERODINAMICA).practica,
  navegacion: split(QUIZ_NAVEGACION).practica,
  "navegacion-2": split(QUIZ_NAVEGACION_2).practica,
  cartografia: split(QUIZ_CARTOGRAFIA).practica,
  comunicaciones: split(QUIZ_COMUNICACIONES).practica,
  instrumentos: split(QUIZ_INSTRUMENTOS).practica,
  rendimiento: split(QUIZ_RENDIMIENTO).practica,
  vfr: split(QUIZ_VFR).practica,
  operacion: split(QUIZ_OPERACION).practica,
  "espacios-aereos": split(QUIZ_ESPACIOS).practica,
  reglamentacion: split(QUIZ_REGLAMENTACION).practica,
  ifr: split(QUIZ_IFR).practica,
};

export const MODULE_EVALUACION: Record<string, QuizPregunta[]> = {
  fundamentos: split(QUIZ_FUNDAMENTOS).evaluacion,
  meteorologia: split(QUIZ_METEOROLOGIA).evaluacion,
  aerodinamica: split(QUIZ_AERODINAMICA).evaluacion,
  navegacion: split(QUIZ_NAVEGACION).evaluacion,
  "navegacion-2": split(QUIZ_NAVEGACION_2).evaluacion,
  cartografia: split(QUIZ_CARTOGRAFIA).evaluacion,
  comunicaciones: split(QUIZ_COMUNICACIONES).evaluacion,
  instrumentos: split(QUIZ_INSTRUMENTOS).evaluacion,
  rendimiento: split(QUIZ_RENDIMIENTO).evaluacion,
  vfr: split(QUIZ_VFR).evaluacion,
  operacion: split(QUIZ_OPERACION).evaluacion,
  "espacios-aereos": split(QUIZ_ESPACIOS).evaluacion,
  reglamentacion: split(QUIZ_REGLAMENTACION).evaluacion,
  ifr: split(QUIZ_IFR).evaluacion,
};

// ---------- Comprobaciones dentro de la lección ----------

/**
 * Una pregunta de repaso cada tres temas, para que el cadete recupere lo leído
 * en vez de acumular diez lecciones seguidas antes del primer ejercicio.
 * Cada entrada es el id de una pregunta del banco del módulo, en orden: la
 * primera aparece tras el tema 3, la segunda tras el 6, y así. Todas preguntan
 * sobre material ya leído en ese punto.
 */
export const MODULE_CHECKPOINTS: Record<string, string[]> = {
  fundamentos: ["fun-q2", "fun-q11"],
  meteorologia: ["met-q3", "met-q6", "met-q9"],
  aerodinamica: ["aero-q6", "aero-q15", "aero-q8"],
  navegacion: ["nav-q1", "nav-q3", "nav-q14", "nav-q9"],
  "navegacion-2": ["nav-q6", "nav-q8", "nav-q15", "nav-q12"],
  cartografia: ["cart-q17", "cart-q13"],
  comunicaciones: ["com-q3", "com-q12", "com-q13", "com-q6"],
  instrumentos: ["ins-q4", "ins-q6", "ins-q12"],
  rendimiento: ["ren-q16", "ren-q6"],
  vfr: ["vfr-q16", "vfr-q6", "vfr-q12"],
  operacion: ["op-q4", "op-q14", "op-q9", "op-q15"],
  "espacios-aereos": ["esp-q3", "esp-q5", "esp-q8"],
  reglamentacion: ["reg-q5", "reg-q15"],
  ifr: ["ifr-q12", "ifr-q7", "ifr-q15"],
};

/** Cada cuántos temas aparece una comprobación. */
export const TEMAS_POR_CHECKPOINT = 3;

export interface Checkpoint {
  /** Índice (0-based) del tema tras el cual se muestra la pregunta. */
  despuesDeTema: number;
  pregunta: QuizPregunta;
}

/** Resuelve los ids de MODULE_CHECKPOINTS contra el banco completo del módulo. */
export function checkpointsDeModulo(slug: string): Checkpoint[] {
  const ids = MODULE_CHECKPOINTS[slug];
  if (!ids) return [];
  const banco = [...(MODULE_PRACTICA[slug] ?? []), ...(MODULE_EVALUACION[slug] ?? [])];
  return ids.flatMap((id, i) => {
    const pregunta = banco.find((p) => p.id === id);
    if (!pregunta) return [];
    return [{ despuesDeTema: (i + 1) * TEMAS_POR_CHECKPOINT - 1, pregunta }];
  });
}

// ---------- Escenarios (para el widget de decisión) ----------

export const MODULE_SCENARIOS: Record<string, { tree: Record<string, ScenarioNode>; startId: string }> = {
  "meteorologia": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas VFR y a 20 millas por delante observas una línea de cumulonimbos (CB) que crece rápidamente, bloqueando tu ruta directa.",
        options: [
          { label: "Intentar cruzar entre dos células para ganar tiempo", next: "falla-1" },
          { label: "Desviarte alrededor, manteniendo al menos 20 millas de distancia de la línea", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Cruzar entre células de tormenta expone a turbulencia severa, granizo y wind shear extremo. La separación mínima recomendada de un CB activo es de al menos 20 millas náuticas — 'cruzar rápido' nunca es una opción segura.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Mantener distancia generosa de las células convectivas — idealmente 20 NM o más — evita la turbulencia severa y el wind shear asociados, aunque signifique un desvío más largo.\n\nEl desvío te agrega 25 minutos de vuelo. Tu destino ahora reporta el techo bajando a 1,200 pies, y el viento de frente durante el rodeo te comió más combustible del previsto: te quedan 50 minutos a bordo. El alterno, con cielo despejado, está a 25 minutos.",
        options: [
          { label: "Continuar al destino: 25 minutos de vuelo y te quedan 25 de reserva", next: "falla-2" },
          { label: "Desviarte al alterno ahora, mientras el combustible todavía está de tu lado", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Llegarías con 25 minutos de combustible a un aeropuerto con el techo bajando, sin margen para un motor y al aire ni para buscar otra opción. La reserva no es un número que se negocia en el aire: es lo que te permite equivocarte una vez más.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Exacto. Desviarte temprano cuesta un vuelo incompleto; desviarte tarde cuesta el avión. La decisión correcta se toma cuando todavía tienes combustible para tomarla, no cuando ya no queda alternativa.",
        },
      },
    },
  },
  "instrumentos": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "En vuelo IFR en nubes, notas que el horizonte artificial se inclina lentamente y el indicador de rumbo gira aunque no estás virando. El indicador de succión marca bajo: sospechas una falla de la bomba de vacío.",
        options: [
          { label: "Ignorar y seguir confiando en el horizonte artificial", next: "falla-1" },
          { label: "Reconocer la falla y volar 'panel parcial' con coordinador de viraje, altímetro y compás", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Seguir confiando en un horizonte artificial que ya falló lleva fácilmente a una actitud inusual no percibida — es una causa clásica de accidentes por desorientación espacial.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Ante una falla de vacío, el procedimiento estándar es reconocerla y recurrir al 'panel parcial': coordinador de viraje, altímetro, velocímetro y compás magnético para mantener control de actitud.\n\nCubres el horizonte y el direccional, y vuelas con coordinador, altímetro y compás. Llevas diez minutos así, en IMC, y el control te pregunta intenciones. Tu destino está a 15 millas pero exige una aproximación ILS completa; un aeropuerto con techo alto y aproximación directa está a 30.",
        options: [
          { label: "Seguir al destino y volar el ILS en panel parcial", next: "falla-2" },
          { label: "Declarar tu situación, pedir vectores e ir al campo con mejor clima", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Un ILS exige seguimiento fino de rumbo y senda justo cuando perdiste los dos instrumentos que te dan esa precisión. Estarías eligiendo la aproximación más demandante con la mitad del panel, para ahorrar quince millas.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Declarar la falla no es admitir un error: es lo que hace que el control te dé vectores, te libere el espacio y te quite carga de trabajo. Y cambiar a una aproximación más simple con mejor clima convierte una emergencia en un aterrizaje.",
        },
      },
    },
  },
  "operacion": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Durante el arranque del motor notas humo y llamas visibles saliendo del escape — fuego en tierra durante el arranque.",
        options: [
          { label: "Soltar la llave y bombear el acelerador para ayudar a que arranque", next: "falla-1" },
          { label: "Continuar girando el motor de arranque, cortar mezcla y combustible, y evacuar con extintor listo", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Bombear el acelerador mete más combustible al carburador, que es justo lo que suele provocar este fuego. El POH pide seguir girando el arranque para que el motor aspire las llamas y el combustible acumulado.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. El procedimiento estándar es seguir girando el motor de arranque para que 'aspire' el fuego hacia el interior, cortar mezcla y magnetos, cerrar la válvula de combustible, y evacuar con extintor a la mano si persiste.\n\nEl fuego se apaga y la aeronave queda segura en plataforma. Al revisar encuentras restos de combustible quemado en el escape y hollín en el carenado inferior, pero nada se ve roto a simple vista.",
        options: [
          { label: "Purgar el motor, volver a arrancar y hacer el vuelo: ya no hay fuego", next: "falla-2" },
          { label: "Dejar la aeronave en tierra y reportarlo a mantenimiento para inspección", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Un fuego en el arranque deja daño que no se ve desde afuera: mangueras de combustible resecas, cableado con el aislante comprometido, sellos vencidos. La aeronave dejó de ser aeronavegable en el momento en que hubo llamas, y solo mantenimiento puede devolverle esa condición.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Así es. Apagar el fuego resolvió la emergencia, no la causa. Reportarlo y dejar que mantenimiento inspeccione es lo que evita que el mismo fuego vuelva a aparecer en el aire, donde no hay extintor ni por dónde evacuar.",
        },
      },
    },
  },
  "espacios-aereos": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas VFR y tu ruta cruza el espacio aéreo Clase C de un aeropuerto grande. Llamas a aproximación y te contestan con tu matrícula: \"mantenga fuera del espacio aéreo, espere\".",
        options: [
          { label: "Entrar: ya te contestaron con tu matrícula, eso basta", next: "falla-1" },
          { label: "Mantenerte fuera y esperar hasta escuchar que te autorizan a ingresar", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Con las reglas de la OACI, que son las de México, en B, C y D necesitas autorización para entrar. Que el control te conteste no es una autorización, y aquí además te pidió esperar fuera.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. En Clase C necesitas autorización del control antes de ingresar; en el material de Estados Unidos verás que basta con el contacto por radio, pero esa es la regla de la FAA.\n\nUnos minutos después te autorizan a ingresar, te dan código de transponder y entras. A mitad del espacio, el control te instruye: \"mantenga 3,500 y vire a rumbo 090\" para separarte de un tráfico comercial en aproximación. El rumbo te saca bastante de tu ruta planeada.",
        options: [
          { label: "Seguir tu ruta: en Clase C las instrucciones a un VFR son sugerencias", next: "falla-2" },
          { label: "Cumplir la instrucción, colacionarla, y pedir regresar a ruta cuando el tráfico lo permita", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Dentro de Clase C el control provee separación entre el tráfico VFR y el IFR, y para eso sus instrucciones son obligatorias. Desviarte de una instrucción sin avisar deja al controlador resolviendo una separación con datos falsos.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Aceptar el servicio de Clase C incluye aceptar sus instrucciones. Colacionarlas confirma al controlador que te tiene, y pedir el regreso a ruta cuando el tráfico pase es lo que convierte el desvío en una pausa y no en un problema.",
        },
      },
    },
  },
  "ifr": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Estás en una aproximación ILS y llegas a la altitud de decisión (DA) sin tener la pista o sus referencias visuales a la vista.",
        options: [
          { label: "Descender un poco más 'por si acaso' aparece la pista", next: "falla-1" },
          { label: "Ejecutar el procedimiento de aproximación frustrada (missed approach) de inmediato", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Descender por debajo de la altitud de decisión sin referencias visuales elimina el margen de obstáculos garantizado por el procedimiento — es una causa de accidentes CFIT en aproximaciones instrumentales.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Al llegar a la DA/MDA sin las referencias visuales requeridas, el procedimiento es ejecutar la aproximación frustrada de inmediato y evaluar un nuevo intento o alterno.\n\nEjecutas la frustrada y el control te pregunta intenciones. Tu combustible alcanza para un intento más y después el alterno, que está a 20 minutos y reporta buen clima.",
        options: [
          { label: "Pedir otro intento del mismo ILS de inmediato", next: "falla-2" },
          { label: "Preguntar si el clima cambió; si no, dirigirte al alterno", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Repetir la misma aproximación con el mismo clima gasta tu única opción restante para obtener el mismo resultado. Un segundo intento solo se justifica si algo cambió: una mejoría reportada, un cambio de viento, otra pista disponible.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Exacto. La pregunta correcta antes de un segundo intento es qué cambió. Si la respuesta es nada, el alterno deja de ser un plan de respaldo y pasa a ser el plan, todavía con combustible para ejecutarlo con calma.",
        },
      },
    },
  },
  "meteorologia-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas VFR en un día frío, entras brevemente en nubes bajas por error y notas una fina capa de hielo formándose en el borde de ataque del ala.",
        options: [
          { label: "Continuar en las nubes esperando salir pronto a un área más cálida", next: "falla-1" },
          { label: "Dar media vuelta hacia donde estabas en condiciones visuales y, si el terreno lo permite, bajar hacia aire más cálido", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El engelamiento puede empeorar en segundos y degradar gravemente la aerodinámica del ala. Esperar 'a ver si mejora' dentro de la nube es exactamente lo que no debes hacer.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Volver por donde venías te saca a condiciones visuales lo antes posible y el hielo deja de crecer. Al subir, el aire normalmente está más frío; bajar solo ayuda si abajo está más cálido y el terreno lo permite.\n\nSales de las nubes y el hielo deja de acumularse, pero la capa que ya tienes no se desprende. Necesitas más potencia para sostener la velocidad y los mandos se sienten pesados. Vas a aterrizar así.",
        options: [
          { label: "Aterrizar con tu velocidad y flaps de aproximación normales", next: "falla-2" },
          { label: "Aterrizar más rápido de lo normal y con flaps reducidos o sin flaps", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Un ala contaminada con hielo entra en pérdida a una velocidad mayor y con menos aviso que un ala limpia, y los flaps completos pueden agravar el comportamiento del empenaje. Volar la aproximación de siempre es volar con márgenes que el hielo ya se llevó.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Con el ala contaminada se aterriza rápido y con flaps reducidos: aceptas usar más pista a cambio de mantener margen sobre una velocidad de pérdida que subió y que ya no sabes exactamente dónde está.",
        },
      },
    },
  },
  "navegacion-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vas a interceptar un arco DME de 12 millas. Vuelas directo a la estación y el DME baja: marca 14 millas y sigue acercándose.",
        options: [
          { label: "Esperar a que el DME marque 12.0 exactas para empezar el viraje", next: "falla-1" },
          { label: "Empezar el viraje media milla antes, para quedar tangente al arco", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Un viraje no es instantáneo: si empiezas justo en la distancia del arco, terminas por dentro y tienes que salir a buscarlo. Por eso se adelanta el viraje aproximadamente media milla, que es lo que el avión recorre mientras gira.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Adelantar el viraje es lo que te deja tangente al arco en vez de cruzarlo por dentro.\n\nQuedas establecido en las 12 millas. A mitad del arco el DME empieza a marcar 12.6 y sigue subiendo, aunque no has cambiado el rumbo.",
        options: [
          { label: "Mantener el rumbo: en un arco la distancia oscila sola", next: "falla-2" },
          { label: "Virar unos grados hacia la estación hasta recuperar las 12 millas", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "En un arco la distancia no se corrige sola: un rumbo constante te lleva por una tangente, alejándote cada vez más. El viento acelera ese alejamiento. Si no corriges, terminas volando una recta en vez de un arco.",
        },
      },
      "exito": {
        id: "exito",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Exacto. Un arco DME se vuela como una sucesión de tramos rectos cortos: cada vez que la distancia crece, se vira unos grados hacia la estación; cuando se acerca de más, unos grados hacia afuera. No es una curva, es una cadena de correcciones pequeñas.",
        },
      },
    },
  },
  "navegacion": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas siguiendo un radial del VOR con viento cruzado. Mantienes el rumbo constante, pero notas que la aguja del CDI se desvía lentamente hacia un lado.",
        options: [
          { label: "Ignorar la desviación, seguramente corriges al final del tramo", next: "falla-1" },
          { label: "Corregir el rumbo unos grados hacia la aguja y dejar esa corrección mientras la aguja se mantenga centrada", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Ignorar una desviación que crece te aleja cada vez más del curso — al final del tramo el error puede ser demasiado grande para corregir con margen.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. El tracking activo significa ajustar tu rumbo constantemente para compensar el viento y mantener la aguja centrada, no solo apuntar al rumbo original y esperar.\n\nCorriges y el CDI se centra. Veinte minutos después la aguja empieza a oscilar de un lado a otro en pocos segundos y la bandera cambia de TO a FROM, sin que hayas tocado nada.",
        options: [
          { label: "Perseguir la aguja con virajes en cada oscilación", next: "falla-2" },
          { label: "Reconocer el paso de estación: mantener rumbo hasta que la aguja se estabilice", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Estás en el cono de confusión, justo encima de la estación, donde el VOR no puede darte información útil. Perseguir la aguja ahí te hace virar a ambos lados por un dato que no significa nada, y sales del cono desalineado.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Exacto. El cambio de TO a FROM es el paso de estación, y la oscilación dura lo que tardas en cruzar el cono. Se mantiene el rumbo, se deja que el instrumento se recupere, y se continúa en el tramo de salida.",
        },
      },
    },
  },
  "cartografia": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Planeas una ruta VFR que cruza justo el límite de un círculo azul discontinuo de espacio Clase D.",
        options: [
          { label: "Asumir que, al ser discontinuo, no necesitas contactar a nadie", next: "falla-1" },
          { label: "Contactar a la torre correspondiente antes de entrar y obtener autorización o instrucciones", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El símbolo discontinuo indica el límite lateral de la Clase D, no que sea opcional contactarla. Con reglas OACI necesitas autorización de la torre antes de entrar, igual que en la B y la C.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Con reglas OACI, la Clase D exige autorización de la torre antes de ingresar, sin importar que su símbolo en la carta sea una línea discontinua en vez de sólida.\n\nLa torre te responde con tu matrícula y te autoriza a cruzar. Más adelante, tu ruta entra en un cuadrante de la carta marcado con una cifra grande y clara: 12 en grande y 4 en pequeño. Vuelas a 11,500 pies.",
        options: [
          { label: "Mantener 11,500: esa cifra es solo referencia informativa", next: "falla-2" },
          { label: "Ascender por encima de esa cifra, o rodear el cuadrante, antes de entrar", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Esa cifra es la elevación máxima del cuadrante: 12 en grande y 4 en chico son 12,400 pies. Ya trae un pequeño margen, así que lo más alto que hay ahí está apenas debajo de ella. A 11,500 estarías por debajo del terreno o de los obstáculos de ese cuadrante.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. La elevación máxima del cuadrante se lee con los miles en grande y los cientos en chico, y marca lo más alto que hay dentro de ese rectángulo. Cruzarlo exige estar por encima con margen, y si no tienes el desempeño para ascender, se rodea.",
        },
      },
    },
  },
  "comunicaciones": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Estás por hacer tu primer contacto con Torre para aterrizar, y otro piloto está transmitiendo justo cuando ibas a llamar.",
        options: [
          { label: "Transmitir de inmediato, tu mensaje es corto y seguro cabe", next: "falla-1" },
          { label: "Esperar a que la frecuencia quede libre antes de transmitir tu llamada", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Transmitir mientras otra estación habla produce 'stepping on' — ninguno de los dos mensajes se entiende bien, y puede ocultar información crítica de seguridad.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Nunca transmitas sobre otra estación, sin importar qué tan corto sea tu mensaje — espera a que la frecuencia esté libre.\n\nLa frecuencia queda libre y haces tu llamada. La torre responde: \"XB-VLA, reporte viento en cola pista 20, número dos detrás de un Cessna en base.\"",
        options: [
          { label: "Responder \"copiado\" y seguir volando tu circuito", next: "falla-2" },
          { label: "Colacionar la instrucción con tu matrícula y reportar cuando tengas al Cessna a la vista", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "\"Copiado\" no le dice al controlador qué entendiste. Te asignó una posición en la secuencia y un tráfico que debes localizar, y ninguna de las dos cosas queda confirmada. Si no ves al Cessna, la torre necesita saberlo ahora, no en final.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Así es. El colacionado con matrícula cierra el circuito de la comunicación, y reportar el tráfico a la vista es lo que le permite a la torre pasarte la responsabilidad de la separación visual. Si no lo ves, se dice: \"negativo contacto\".",
        },
      },
    },
  },
  "instrumentos-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Subiendo en nubes, el altímetro se queda fijo, el VSI marca cero y el velocímetro marca cada vez menos aunque no cambiaste ni la actitud ni la potencia.",
        options: [
          { label: "Bajar la nariz para recuperar la velocidad indicada", next: "falla-1" },
          { label: "Sospechar un bloqueo de la toma estática y volar por actitud y potencia conocidas", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El altímetro fijo y el VSI en cero delatan una toma estática bloqueada. Por encima de la altitud del bloqueo, el velocímetro marca menos de lo que realmente vuelas: bajar la nariz persiguiendo esa lectura te lleva a exceso de velocidad real.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Con la toma estática bloqueada, la referencia segura es la combinación conocida de actitud y potencia para la fase de vuelo, no los instrumentos que dependen de ella.\n\nSigues volando por actitud y potencia. ¿Qué haces con la falla?",
        options: [
          { label: "Encender la calefacción del pitot y seguir con el velocímetro", next: "falla-2" },
          { label: "Abrir la fuente de estática alterna", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "La calefacción del pitot no destapa la toma estática: lo bloqueado es la estática, como delatan el altímetro fijo y el VSI en cero. El velocímetro seguiría mintiendo.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. La estática alterna, que toma presión del interior de la cabina, devuelve lecturas utilizables aunque ligeramente altas en altitud y velocidad. Y mientras tanto, la actitud y la potencia conocidas siguen siendo la referencia que no depende de tuberías bloqueadas.",
        },
      },
    },
  },
  "rendimiento": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vas a despegar de una pista corta en un día caluroso, y tus cálculos de rendimiento muestran un margen muy ajustado para despejar los árboles al final de la pista.",
        options: [
          { label: "Despegar de todos modos, seguro el manual exagera un poco", next: "falla-1" },
          { label: "Reducir peso, esperar a que baje la temperatura, o buscar una pista más larga antes de despegar", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Los datos de rendimiento del manual ya asumen condiciones ideales de pilotaje — un margen ajustado en el papel casi nunca mejora en la práctica, y una altitud de densidad alta reduce aún más el rendimiento real.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Ante un margen ajustado de despegue, la decisión correcta es cambiar las condiciones a tu favor — menos peso, menor temperatura o más pista — nunca 'intentarlo y ver'.\n\nEsperas a la tarde, la temperatura baja ocho grados y tus números cierran con margen. Al hacer el cálculo final notas que el viento también cambió: ahora sopla ocho nudos por la cola en la pista que pensabas usar.",
        options: [
          { label: "Despegar igual: ocho nudos de cola son poca cosa", next: "falla-2" },
          { label: "Despegar por la pista opuesta, con el viento de frente, aunque implique más rodaje", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El viento de cola alarga la carrera de despegue mucho más de lo que la intuición sugiere, y acabas de recuperar tu margen a punta de esperar horas. Ocho nudos de cola se comen buena parte de lo que ganaste con la temperatura.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Exacto. El viento de frente es uno de los pocos factores que mejoran tus números sin costo, y lo eliges con solo rodar al otro extremo. En pista corta, esa elección vale más que cualquier técnica de despegue.",
        },
      },
    },
  },
  "operacion-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Ya iniciaste el despegue y, antes de alcanzar la velocidad de rotación, notas una vibración anormal del motor.",
        options: [
          { label: "Continuar el despegue, seguro se estabiliza en el aire", next: "falla-1" },
          { label: "Cerrar la potencia de inmediato y abortar el despegue mientras aún hay pista suficiente para detenerte", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Una anomalía del motor antes de rotar es exactamente el escenario para un despegue rechazado — continuar con un problema conocido, a baja altura y baja velocidad, es la combinación más peligrosa.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Antes de alcanzar la velocidad de rotación, cualquier anomalía seria del motor debe resultar en cerrar potencia y frenar de inmediato, mientras la pista restante lo permita.\n\nAbortas y te detienes con pista de sobra. El motor sigue funcionando y en ralentí la vibración ya no se nota.",
        options: [
          { label: "Alinearte otra vez e intentarlo: probablemente fue basura en el combustible", next: "falla-2" },
          { label: "Liberar la pista, informar a la torre y revisar el motor en plataforma", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Que la vibración desaparezca en ralentí no dice nada: a esa potencia el motor casi no trabaja. Volver a intentarlo es apostar a que el problema no reaparezca justo cuando ya no queda pista para abortar por segunda vez.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Un despegue abortado por causa desconocida termina en plataforma, no en un segundo intento. El aborto ya fue la decisión difícil; repetir el despegue sin saber qué pasó la desperdicia.",
        },
      },
    },
  },
  "espacios-aereos-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas VFR y te acercas a una zona restringida temporal que no conocías, publicada por NOTAM por una visita oficial.",
        options: [
          { label: "Continuar tu ruta directa, seguramente ya expiró", next: "falla-1" },
          { label: "Desviarte de inmediato y confirmar por radio, con el control o el servicio de información de vuelo, si está activa", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Entrar a una zona restringida temporal activa sin autorización puede terminar en una interceptación y en consecuencias legales graves. Nunca asumas que «ya expiró» sin verificarlo.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Ante cualquier restricción temporal, lo seguro es alejarte de inmediato y confirmar si está activa: en vuelo, por radio; en tierra, en los NOTAM. Revisarlos antes de despegar es lo que evita la sorpresa.\n\nTe desvías y lo confirmas por radio: está activa. Al reconstruir tu trayectoria te das cuenta de que rozaste el borde del área restringida durante unos segundos antes de virar. Nadie te llamó por radio.",
        options: [
          { label: "No decir nada: fueron segundos y nadie se dio cuenta", next: "falla-2" },
          { label: "Contactar a la dependencia ATC de la zona, informar lo ocurrido y seguir sus instrucciones", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El radar sí se dio cuenta, aunque nadie te haya llamado en ese momento. Una incursión detectada y no reportada deja de ser un error de planificación y pasa a parecer un ocultamiento, que es lo que convierte un incidente en una sanción seria.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Así es. Reportarlo tú mismo cambia por completo cómo se trata el asunto: el control puede pedirte que te reportes al aterrizar, y la disposición a informar es lo que suele distinguir una corrección de una acción administrativa.",
        },
      },
    },
  },
  "reglamentacion": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Un amigo te pide ser tu primer pasajero. Al preparar el vuelo revisas tus documentos y ves que tu certificado de aptitud psicofísica venció la semana pasada.",
        options: [
          { label: "Volar de todos modos: te sientes bien y la licencia sigue vigente", next: "falla-1" },
          { label: "No volar: sin la aptitud psicofísica vigente no puedes ejercer tu licencia; primero la renuevas", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "La licencia solo se puede ejercer con el certificado de aptitud psicofísica vigente. Sentirte bien no lo sustituye: volar así es una violación reglamentaria, y con un pasajero a bordo.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Toda licencia pide el certificado de aptitud psicofísica vigente; sin él no puedes ejercerla.\n\nTu amigo insiste: «Es solo una vuelta al circuito, diez minutos, nadie se va a enterar».",
        options: [
          { label: "Dar la vuelta: es corta y conoces bien el aeródromo", next: "falla-2" },
          { label: "Decirle que no, renovar el certificado y llevarlo cuando esté vigente", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "La regla no cambia con la duración del vuelo: diez minutos sin certificado vigente siguen siendo un vuelo sin poder ejercer tu licencia, y con un pasajero a bordo.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Renuevas el certificado y lo llevas en cuanto esté vigente. Revisar la vigencia de tu licencia y de tu aptitud psicofísica antes de cada vuelo es parte de la planeación.",
        },
      },
    },
  },
  "ifr-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas una aproximación de no precisión y llegas al MDA sin haber alcanzado el punto de aproximación frustrada ni tener las referencias visuales requeridas.",
        options: [
          { label: "Descender un poco más abajo del MDA para intentar verla mejor", next: "falla-1" },
          { label: "Nivelar en el MDA y continuar hasta el punto de aproximación frustrada, ejecutándola si no obtienes referencias", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Descender por debajo del MDA sin referencias visuales elimina el margen de obstáculos garantizado por el procedimiento — es una causa directa de accidentes CFIT.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. En una aproximación de no precisión, el MDA se mantiene nivelado hasta el punto de aproximación frustrada o hasta obtener referencias visuales — nunca se desciende por debajo 'para ver mejor'.\n\nNivelas en el MDA. A media milla del punto de aproximación frustrada alcanzas a ver las luces de aproximación, pero todavía no la pista ni sus marcas.",
        options: [
          { label: "Descender hacia la pista: ya tienes referencias visuales", next: "falla-2" },
          { label: "Descender solo hasta cien pies sobre la zona de toma, y frustrar si la pista no aparece", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Las luces de aproximación por sí solas no autorizan a descender hasta la pista. Son una referencia intermedia, y tratarlas como si fueran la pista es descender a ciegas los últimos cientos de pies.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Exacto. Con las luces de aproximación a la vista puedes bajar hasta cien pies sobre la elevación de la zona de toma; por debajo de eso hacen falta la pista o sus marcas. Si a esa altura no aparecen, se frustra.",
        },
      },
    },
  },
  "fundamentos": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas recto y nivelado a velocidad constante. Sin cambiar la actitud, reduces la potencia del motor de forma notable. ¿Qué ocurre primero?",
        options: [
          { label: "El avión se mantiene nivelado, solo pierde velocidad indefinidamente", next: "falla-1" },
          { label: "El empuje deja de igualar la resistencia, y al caer la sustentación por debajo del peso, el avión empieza a descender", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Las 4 fuerzas no se ajustan solas: si reduces el empuje sin cambiar la actitud, la velocidad cae, la sustentación ya no alcanza a igualar el peso, y el avión empieza a descender — no se queda nivelado indefinidamente.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Al reducir potencia sin cambiar la actitud, el empuje deja de igualar la resistencia (pierdes velocidad) y, con menos velocidad, la sustentación cae por debajo del peso — el avión entra en descenso hasta que ajustes potencia o actitud.\n\nEl avión desciende. Mantienes la actitud y la velocidad se estabiliza por debajo de la que tenías, con un régimen de descenso constante. Quieres volver a la altitud que tenías.",
        options: [
          { label: "Tirar del bastón para dejar de descender", next: "falla-2" },
          { label: "Devolver la potencia, y usar la actitud para sostener la velocidad", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Sin potencia, tirar del bastón solo cambia velocidad por altura: subes unos segundos, pierdes velocidad, y terminas más lento en el mismo descenso o entrando en pérdida. La altura que ganaste la pagaste con la energía que te quedaba.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto, y ese es el resumen de todo el módulo: la potencia gobierna si subes o bajas, y la actitud gobierna qué tan rápido vas. Cuando se confunden los dos papeles es cuando el avión hace lo contrario de lo que esperabas.",
        },
      },
    },
  },
  "aerodinamica": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Estás en el viraje de base a final, un poco bajo y lento, y para no pasarte de la línea de la pista aprietas el viraje con más alerón e inclinación. ¿Qué haces?",
        options: [
          { label: "Aumentar el ángulo de inclinación con más alerón para cerrar el viraje rápido", next: "falla-1" },
          { label: "Nivelar las alas, aceptar pasarte un poco de la línea, y ajustar con timón y potencia", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Apretar el viraje a baja velocidad aumenta el factor de carga y la velocidad de pérdida en ese preciso instante — es el clásico escenario de pérdida/barrena en el viraje base-final, una de las causas más comunes de accidentes fatales cerca del patrón.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Nunca aprietes un viraje a baja velocidad para corregir alineación. Es preferible pasarte un poco de la línea de la pista y hacer un ajuste amplio o un go-around, que arriesgar una pérdida asimétrica en un viraje pronunciado cerca del suelo.\n\nNivelas las alas y te pasas de la línea de la pista. Ahora estás a quinientos pies, desalineado, y con la velocidad cinco nudos por debajo de la de aproximación.",
        options: [
          { label: "Alinearte con el timón, sin inclinar más las alas", next: "falla-2" },
          { label: "Aplicar potencia, ir al aire y volver a integrarte al circuito", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Cruzar con timón a baja velocidad y baja altura es exactamente la secuencia que produce la pérdida con barrena en el viraje base-final. El ala de adentro se frena, entra en pérdida primero, y a quinientos pies no hay altura para recuperar.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Así es. Desde una aproximación desalineada, lenta y baja no se rescata nada: se va al aire. Un circuito de más cuesta cinco minutos, y es la maniobra que más accidentes ha evitado en la historia de la aviación general.",
        },
      },
    },
  },
  "vfr-2": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Te acercas a un aeródromo no controlado y ves a otro avión entrar directo a 'final' sin haber pasado por el tramo de viento en cola. Tú ya estás integrado en el patrón. ¿Qué haces?",
        options: [
          { label: "Acelerar para llegar tú primero a la pista, ya que entraste de forma correcta", next: "falla-1" },
          { label: "Comunicar tu posición por radio, ceder el paso si es necesario y ajustar tu trayectoria para mantener separación", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Tener la razón sobre quién entró 'correctamente' no evita una colisión. La prioridad reglamentaria existe, pero la responsabilidad de 'ver y evitar' siempre es de ambos pilotos — competir por la pista es exactamente lo que no debes hacer.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Correcto. Ante cualquier conflicto en el patrón, la solución es comunicar tu posición y ajustar tu propia trayectoria (por ejemplo, extendiendo el viento en cola) — nunca forzar la situación asumiendo que el otro piloto cederá.\n\nCedes el paso y el otro avión aterriza sin novedad. Ya en final corto, ves que un tercer avión se alinea en la pista para despegar, sin haber anunciado nada en la frecuencia.",
        options: [
          { label: "Continuar el aterrizaje: tienes preferencia porque estás aterrizando", next: "falla-2" },
          { label: "Ir al aire, anunciarlo por radio y reintegrarte al circuito", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "La preferencia no despeja la pista. Ese avión no te ha escuchado y no te está viendo, y tu derecho de paso no sirve de nada si los dos terminan en el mismo lugar. En un aeródromo no controlado, la separación depende de que alguien ceda.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. El motor y al aire es gratis y siempre está disponible. En un aeródromo sin torre, el piloto que ve el conflicto es el que tiene que resolverlo, sin importar a quién le tocaba el paso.",
        },
      },
    },
  },
  "vfr": {
    startId: "inicio",
    tree: {
      "inicio": {
        id: "inicio",
        prompt:
          "Vuelas VFR de MMGL a MMZO. A 30 millas de tu destino notas que la visibilidad empieza a bajar y el techo de nubes desciende.",
        options: [
          { label: "Continuar el plan original, seguro que mejora", next: "falla-1" },
          { label: "Consultar el clima actualizado de MMZO y alternos", next: "segunda" },
        ],
      },
      "falla-1": {
        id: "falla-1",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Continuar sin más información es el error más común que lleva a VFR-en-IMC. Siempre reevalúa cuando las condiciones cambian, no asumas que van a mejorar.",
        },
      },
      "segunda": {
        id: "segunda",
        prompt:
          "Bien: pedir información antes de decidir es lo que te deja opciones.\n\nEl METAR de MMZO reporta techo bajo y visibilidad por debajo de mínimos VFR. Tienes combustible para 40 minutos adicionales.",
        options: [
          { label: "Intentar aterrizar de todas formas, ya casi llegas", next: "falla-2" },
          { label: "Desviarte a un aeropuerto alterno con mejor clima", next: "exito" },
        ],
      },
      "falla-2": {
        id: "falla-2",
        prompt:
          "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Intentar aterrizar por debajo de mínimos VFR es una de las causas principales de accidentes de vuelo controlado contra el terreno. La proximidad al destino nunca justifica romper los mínimos.",
        },
      },
      "exito": {
        id: "exito",
        prompt:
          "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Desviarte a tiempo, con combustible de sobra y antes de quedar en una situación sin salidas, es exactamente la decisión que se espera de un piloto VFR.",
        },
      },
    },
  },
};

// ---------- Sliders (para el widget de configuración numérica) ----------

export const MODULE_SLIDERS: Record<string, SliderConfig> = {
  aerodinamica: {
    title: "Configuración de tren y flaps vs. resistencia (drag)",
    description:
      "Mueve el control de configuración limpia a configuración de aterrizaje, con la misma potencia, y observa cómo cambian la resistencia, la velocidad y el combustible que gastas por cada 100 millas. Valores ilustrativos de un avión de tren retráctil.",
    minLabel: "Configuración limpia (tren y flaps arriba)",
    maxLabel: "Configuración de aterrizaje (tren y flaps abajo)",
    metrics: [
      { label: "Velocidad", unit: "kt", from: 110, to: 75 },
      { label: "Combustible por 100 NM", unit: "gal", from: 8.6, to: 12.7, decimals: 1 },
      { label: "Resistencia (drag)", unit: "%", from: 15, to: 90, warnAbove: 60 },
    ],
    footnote:
      "Con la misma potencia, el motor gasta lo mismo por hora, pero la resistencia te frena: tardas más en recorrer la misma distancia y gastas más combustible por milla. Por eso esta configuración se usa para aproximar y aterrizar, y los flaps solo se extienden debajo de su velocidad máxima (el tope del arco blanco).",
  },
  "navegacion-2": {
    title: "Efecto del viento en contra sobre tu navegación",
    description:
      "Mueve el control para simular viento en contra creciente en la ruta MMGL → MMZO (unas 109 NM) y observa cómo cambian tu velocidad de tierra, tiempo de vuelo y combustible necesario.",
    minLabel: "Sin viento",
    maxLabel: "Viento en contra de 40 nudos",
    metrics: [
      { label: "Velocidad de tierra", unit: "kt", from: 110, to: 70 },
      { label: "Tiempo estimado", unit: "min", from: 59, to: 93, inversa: true },
      { label: "Combustible requerido", unit: "L", from: 39, to: 62, inversa: true },
    ],
    footnote:
      "A mayor viento en contra, tu velocidad de tierra baja, el vuelo tarda más y consumes más combustible — por eso el pronóstico de viento es tan importante al planear una ruta VFR. Cuenta hecha con 110 kt de velocidad verdadera y 40 L/h, sin reserva.",
  },
  rendimiento: {
    title: "Altitud de densidad vs. rendimiento de despegue",
    description:
      "Mueve el control de nivel del mar en un día fresco a una elevación alta en un día caluroso (como Toluca) y observa el efecto en tu despegue.",
    minLabel: "Nivel del mar, día fresco",
    maxLabel: "Alta elevación, día caluroso",
    metrics: [
      { label: "Carrera de despegue", unit: "m", from: 450, to: 850 },
      { label: "Tasa de ascenso", unit: "fpm", from: 700, to: 350 },
      { label: "Pista que necesitas, con 50% de margen", unit: "m", from: 675, to: 1275 },
    ],
    footnote:
      "A mayor altitud de densidad, el motor y las alas rinden menos: la carrera de despegue se alarga y la tasa de ascenso cae — por eso Toluca exige recalcular el rendimiento en días calurosos, nunca asumir que la pista se comporta como una a nivel del mar. Valores de ejemplo, no de un avión en particular: usa siempre las tablas de tu manual.",
  },
};
