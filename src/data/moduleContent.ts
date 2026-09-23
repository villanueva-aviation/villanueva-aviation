import type { QuizPregunta } from "../features/academia/quizData";
import type { ScenarioNode } from "../features/academia/ScenarioSimulator";
import type { SliderConfig } from "../features/academia/DragSlider";
import type { TermPair } from "../features/academia/TermMatch";

export interface Tema {
  id: string;
  titulo: string;
  texto: string;
  imagenes?: string[];
}

export interface LeccionContenido {
  titulo: string;
  temas: Tema[];
}

// ---------- Lecciones ----------

export const MODULE_LECCIONES: Record<string, LeccionContenido[]> = {
  "fundamentos": [
    {
      titulo: "¿Qué es un avión?",
      temas: [
      { id: "fundamentos-tema1", titulo: "¿Qué es un avión?", texto: "Un avión es una máquina más pesada que el aire, capaz de sostenerse y desplazarse por la atmósfera gracias a las fuerzas aerodinámicas que genera su propio movimiento. A diferencia de un globo o un dirigible, no flota: necesita generar activamente, con sus alas y su motor, la fuerza que lo mantiene en el aire. Antes de entrar en la física de cómo lo logra, conviene reconocer primero sus partes principales — cada una cumple una función específica en ese equilibrio, como verás a continuación." , imagenes: ["/images/temas/fundamentos-tema1.jpg"]},
      { id: "fundamentos-tema4", titulo: "Partes de un avión", texto: "Un avión típico de entrenamiento se compone de: el Fuselaje, la estructura central que aloja cabina, pasajeros y carga; las Alas, que generan la sustentación y suelen alojar combustible; el Empenaje (cola), formado por el estabilizador horizontal y vertical, que da estabilidad direccional y de cabeceo; el Tren de aterrizaje, que soporta el peso en tierra y absorbe el impacto del aterrizaje; y el Grupo motopropulsor (motor y hélice o turbina), que genera el empuje. Cada componente cumple una función estructural o aerodinámica específica, y conocer su nomenclatura correcta es esencial para la comunicación técnica con instructores, mecánicos y controladores." , imagenes: ["/images/temas/fundamentos-tema4.jpg"]},
      ],
    },
    {
      titulo: "Por qué vuela un avión: las 4 fuerzas y los principios físicos",
      temas: [
      { id: "fundamentos-tema2", titulo: "Las 4 fuerzas del vuelo", texto: "Todo avión en vuelo está sometido a 4 fuerzas fundamentales: Sustentación (Lift), generada por las alas, que se opone al Peso (Weight), la fuerza de gravedad sobre la masa total de la aeronave; y Empuje (Thrust), producido por el motor, que se opone a la Resistencia (Drag), la fricción del aire contra la aeronave. En vuelo recto y nivelado a velocidad constante, estas 4 fuerzas están en equilibrio: sustentación = peso y empuje = resistencia. Cualquier cambio de actitud, potencia o configuración rompe momentáneamente este equilibrio y produce una reacción — subir, bajar, acelerar o desacelerar.", imagenes: ["/images/fundamentos-4fuerzas.png"] },
      { id: "fundamentos-tema3", titulo: "Principios de Bernoulli y Newton", texto: "La sustentación se explica mediante dos principios físicos complementarios. El Principio de Bernoulli establece que, en un fluido en movimiento, a mayor velocidad menor presión: el perfil del ala hace que el aire viaje más rápido sobre la superficie superior, generando menor presión arriba y mayor presión abajo — esa diferencia empuja el ala hacia arriba. La Tercera Ley de Newton (acción-reacción) explica lo mismo desde otro ángulo: el ala desvía el aire hacia abajo, y como reacción, el aire empuja el ala hacia arriba. Ambos principios no compiten, se complementan: describen la misma sustentación desde la presión (Bernoulli) y desde el momentum del aire desviado (Newton). Como piloto no necesitas resolver ecuaciones, pero sí entender que el ángulo de ataque y la velocidad son las variables que controlas para generar más o menos sustentación.", imagenes: ["/images/fundamentos-pdb.png", "/images/fundamentos-tldn.png"] },
      ],
    },
    {
      titulo: "Superficies, ejes, controles e instrumentos básicos",
      temas: [
      { id: "fundamentos-tema5", titulo: "Superficies de control", texto: "Las superficies de control son partes móviles que el piloto mueve para cambiar la actitud del avión. Los Alerones, en el borde de salida de las alas, controlan el alabeo (roll) moviéndose en direcciones opuestas entre sí. El Elevador, en el estabilizador horizontal, controla el cabeceo (pitch) subiendo o bajando el morro. El Timón de dirección, en el estabilizador vertical, controla la guiñada (yaw). Además existen superficies secundarias como los Flaps, que aumentan la sustentación y resistencia para despegues y aterrizajes a baja velocidad, y en algunos aviones, spoilers o trim tabs que ayudan a reducir la carga de control. Cada superficie corresponde a un eje de movimiento específico — la relación superficie-eje-control es una de las primeras cosas que un instructor evalúa que domines." , imagenes: ["/images/temas/fundamentos-tema5.jpg"]},
      { id: "fundamentos-tema6", titulo: "Ejes de movimiento", texto: "Un avión se mueve alrededor de 3 ejes imaginarios que se cruzan en su centro de gravedad. El Eje longitudinal (nariz-cola) controla el Alabeo (roll), inclinando las alas mediante los alerones. El Eje lateral (ala-ala) controla el Cabeceo (pitch), subiendo o bajando el morro mediante el elevador. El Eje vertical controla la Guiñada (yaw), moviendo el morro a izquierda o derecha mediante el timón de dirección. Estos 3 ejes y sus 3 movimientos son la base de toda maniobra de vuelo, desde un viraje coordinado hasta una aproximación final." , imagenes: ["/images/temas/fundamentos-tema6.jpg"]},
      { id: "fundamentos-tema7", titulo: "Controles de vuelo (yoke, pedales, throttle, mezcla)", texto: "El piloto interactúa con el avión mediante controles primarios y secundarios. El Yoke (o bastón de control), al moverse adelante/atrás controla el elevador (cabeceo), y al girarlo controla los alerones (alabeo) — en aviones como el VL3 o el Cirrus SR22, esta misma función la cumple un Control Stick en vez de un yoke. Los Pedales de timón controlan el timón de dirección (guiñada) y, en tierra, el frenado diferencial y la dirección de la rueda de nariz. La Palanca de potencia (Throttle) regula la cantidad de combustible y aire hacia el motor, controlando directamente el empuje disponible; en aviones de hélice de paso variable, el control de Propeller ajusta por separado las RPM del motor. El Control de mezcla (Mixture) ajusta la proporción de combustible y aire según la densidad del aire (altitud), optimizando la combustión y evitando pérdida de potencia o daño al motor. En aviones con hélice de paso variable, throttle, propeller y mezcla se ajustan siempre en conjunto según la fase de vuelo, no de forma independiente. Dominar la coordinación entre estos controles — especialmente pedal-yoke en virajes — es una de las primeras destrezas motoras que un piloto desarrolla.", imagenes: [
        "/images/temas/fundamentos-tema7-1-yoke.jpg",
        "/images/temas/fundamentos-tema7-2-control-stick.jpg",
        "/images/temas/fundamentos-tema7-3-pedales.jpg",
        "/images/temas/fundamentos-tema7-4-throttle.jpg",
        "/images/temas/fundamentos-tema7-5-propeller.jpg",
        "/images/temas/fundamentos-tema7-6-mezcla.jpg",
        "/images/temas/fundamentos-tema7-7-palancas-juntas.jpg",
      ] },
      { id: "fundamentos-tema8", titulo: "Instrumentos básicos (Six Pack)", texto: "El \"Six Pack\" es el conjunto de 6 instrumentos analógicos básicos en la cabina, organizados en dos filas de tres. Fila superior: Indicador de velocidad (Airspeed Indicator), que muestra la velocidad del aire; Horizonte artificial (Attitude Indicator), que muestra la actitud respecto al horizonte real; y Altímetro, que muestra la altitud sobre el nivel del mar. Fila inferior: Indicador de viraje y resbalamiento (Turn Coordinator), que muestra la tasa de giro y coordinación; Indicador de rumbo (Heading Indicator), que muestra hacia dónde apunta la nariz; y Variómetro (Vertical Speed Indicator), que muestra la tasa de ascenso o descenso. Estos 6 instrumentos, leídos en conjunto (scan instrumental), dan al piloto una imagen completa del estado del avión en cualquier condición, incluso sin referencia visual externa." , imagenes: ["/images/temas/fundamentos-tema8.jpg"]},
      ],
    },
  ],
  "meteorologia": [
    {
      titulo: "Cómo leer METAR y TAF",
      temas: [
      { id: "meteorologia-tema1", titulo: "¿Qué es un METAR?", texto: "Un METAR (Meteorological Aerodrome Report) es un reporte de las condiciones meteorológicas ACTUALES observadas en un aeródromo, emitido cada hora (o cada 30 minutos en algunos casos especiales) por estaciones automáticas o personal capacitado. Es el lenguaje universal de la meteorología aeronáutica: usa un formato codificado y estandarizado internacionalmente para que cualquier piloto, en cualquier país, pueda leerlo sin importar el idioma local. Incluye viento, visibilidad, fenómenos meteorológicos presentes, cobertura de nubes, temperatura, punto de rocío y presión altimétrica. Es la primera fuente que consultas antes de cualquier vuelo para saber \"cómo está el clima ahora mismo\" en tu aeropuerto de salida, destino o alterno." , imagenes: ["/images/temas/meteorologia-tema1.jpg"]},
      { id: "meteorologia-tema2", titulo: "Cómo leer un METAR paso a paso", texto: "Tomemos un ejemplo real: METAR MMMX 171800Z 09008KT 8SM FEW030 SCT100 22/12 A3005. Se lee así: MMMX = identificador ICAO del aeropuerto (Ciudad de México); 171800Z = día 17 del mes, 18:00 UTC (Zulu); 09008KT = viento del rumbo 090° a 8 nudos; 8SM = visibilidad de 8 millas estatutarias; FEW030 = nubes dispersas (few) a 3,000 pies; SCT100 = nubes dispersas (scattered) a 10,000 pies; 22/12 = temperatura 22°C, punto de rocío 12°C; A3005 = presión altimétrica 30.05 pulgadas de mercurio (inHg). Practica descomponer cada METAR real en estos mismos bloques hasta que se vuelva automático — es una habilidad que usarás en cada vuelo." , imagenes: ["/images/temas/meteorologia-tema1.jpg"]},
      { id: "meteorologia-tema3", titulo: "¿Qué es un TAF?", texto: "Un TAF (Terminal Aerodrome Forecast) es un pronóstico del tiempo esperado en un aeropuerto, válido típicamente por 24 o 30 horas, actualizado cada 6 horas. A diferencia del METAR, que describe lo que ESTÁ pasando ahora, el TAF describe lo que SE ESPERA que pase en las próximas horas — viento, visibilidad, nubes y fenómenos previstos, incluyendo cambios de tendencia marcados con grupos como BECMG (becoming, cambio gradual) o TEMPO (temporary, cambio temporal). Es la herramienta clave para la planificación de vuelo: te dice si tu destino y tu alterno probablemente tendrán condiciones VFR o IFR a la hora estimada de tu llegada." , imagenes: ["/images/temas/meteorologia-tema3.jpg"]},
      { id: "meteorologia-tema4", titulo: "Diferencia entre METAR y TAF", texto: "La diferencia central es tiempo: el METAR es una fotografía del presente (observación actual, válida por esa hora específica), mientras que el TAF es una predicción del futuro (pronóstico válido por 24-30 horas). Usas el METAR para decidir si puedes despegar AHORA, y el TAF para decidir si tiene sentido planear el vuelo de aquí a varias horas, incluyendo si necesitarás un aeropuerto alterno. Ambos comparten el mismo lenguaje codificado (viento, visibilidad, nubes), así que si ya sabes leer un METAR, leer un TAF es prácticamente el mismo ejercicio, solo que interpretando períodos de tiempo y tendencias en vez de una sola observación." , imagenes: ["/images/temas/meteorologia-tema3.jpg"]},
      { id: "meteorologia-tema5", titulo: "Nubes y su significado", texto: "Las nubes se describen en METAR/TAF con abreviaturas de cobertura: SKC/CLR (cielo despejado), FEW (pocas, 1-2 octavos del cielo cubiertos), SCT (dispersas, 3-4 octavos), BKN (fragmentadas, 5-7 octavos) y OVC (cubierto, 8 octavos). Por tipo, las más relevantes para el piloto son: Cúmulos (buen tiempo, desarrollo vertical moderado), Estratos (capas planas, visibilidad reducida, típicas de neblina), Cirros (altas, hielo, buen tiempo pero anuncian cambio), y Cumulonimbos (CB, tormentas eléctricas, turbulencia severa, granizo — se evitan siempre). La altura de la base de nubes (ej. BKN008 = fragmentado a 800 pies) es crítica para decidir si las condiciones son VFR o IFR." , imagenes: ["/images/temas/meteorologia-tema5.jpg"]},
      ],
    },
    {
      titulo: "Nubes, frentes, turbulencia y hielo",
      temas: [
      { id: "meteorologia-tema6", titulo: "Frentes fríos y cálidos", texto: "Un frente es la frontera entre dos masas de aire con temperaturas distintas. El Frente frío ocurre cuando aire frío avanza y empuja al aire cálido hacia arriba rápidamente — genera clima violento pero de corta duración: cumulonimbos, tormentas intensas, turbulencia y visibilidad muy reducida durante su paso, seguido de cielos despejados y aire fresco. El Frente cálido ocurre cuando aire cálido avanza sobre aire frío de forma gradual — genera nubosidad estratiforme extensa, lluvia ligera pero prolongada, y techos bajos durante mucho más tiempo antes de que pase. En las cartas meteorológicas, el frente frío se marca con triángulos azules y el cálido con semicírculos rojos, ambos apuntando hacia donde se dirige el frente." , imagenes: ["/images/temas/meteorologia-tema6.jpg"]},
      { id: "meteorologia-tema7", titulo: "Turbulencia", texto: "La turbulencia es el movimiento irregular del aire que sacude la aeronave. Se clasifica por origen: Mecánica (aire chocando con obstáculos como montañas o edificios), Térmica (corrientes de aire ascendente por calentamiento desigual del suelo, común en tardes calurosas), Aire claro o CAT (Clear Air Turbulence, asociada a corrientes de chorro en altura, sin nubes que la anuncien), y de Estela (wake turbulence, generada por vórtices de las puntas de ala de aviones grandes). Por intensidad se clasifica en Ligera, Moderada, Severa y Extrema, según qué tanto desplazamiento vertical y dificultad de control genera. Los reportes PIREP de otros pilotos son la mejor fuente para saber qué turbulencia esperar en tu ruta." , imagenes: ["/images/temas/meteorologia-tema7.jpg"]},
      { id: "meteorologia-tema8", titulo: "Wind Shear", texto: "El Wind Shear (cizalladura de viento) es un cambio brusco de dirección y/o velocidad del viento en una distancia corta, y es especialmente peligroso cerca del suelo durante despegue y aterrizaje (Low-Level Wind Shear, LLWS). Su forma más severa es el microburst — una corriente descendente violenta y localizada, típica de tormentas, que primero empuja el avión hacia arriba y luego lo empuja bruscamente hacia abajo con pérdida repentina de sustentación, ocurriendo en segundos. Muchos aeropuertos grandes tienen sistemas de detección (LLWAS) que alertan a los controladores. Como piloto, la mejor defensa es evitar operar cerca de tormentas activas y estar atento a reportes de wind shear en el ATIS o de otros pilotos." , imagenes: ["/images/temas/meteorologia-tema8.jpg"]},
      { id: "meteorologia-tema9", titulo: "Formación de hielo", texto: "El hielo se forma en la aeronave cuando gotas de agua líquida en la atmósfera (a temperaturas bajo cero, conocidas como agua superenfriada) entran en contacto con superficies del avión y se congelan instantáneamente. El hielo estructural se acumula en alas, empenaje y otras superficies, alterando el perfil aerodinámico, aumentando peso y resistencia, y reduciendo la sustentación de forma peligrosa. El hielo de carburador ocurre dentro del sistema de admisión del motor, incluso con temperaturas exteriores positivas, por el enfriamiento al expandirse el combustible vaporizado. Las condiciones más favorables para hielo estructural son nubes con temperaturas entre 0°C y -20°C con gotas de agua líquida presentes — por eso revisar el pronóstico de nivel de congelamiento (freezing level) es esencial antes de volar en instrumentos." , imagenes: ["/images/temas/meteorologia-tema9.jpg"]},
      { id: "meteorologia-tema10", titulo: "Altitud de densidad (ejemplo de Toluca)", texto: "La Altitud de densidad es la altitud a la que el avión \"siente\" que está volando, ajustada por temperatura, presión y humedad — no es lo mismo que la altitud real sobre el nivel del mar. A mayor temperatura, menor presión o mayor humedad, el aire se vuelve menos denso y la altitud de densidad AUMENTA, reduciendo el rendimiento del motor, la sustentación de las alas y la eficiencia de la hélice. El aeropuerto de Toluca (MMTO) es el ejemplo perfecto en México: está a 8,466 pies de elevación real, uno de los aeropuertos comerciales más altos del mundo. En un día caluroso de verano, su altitud de densidad puede superar fácilmente los 11,000-12,000 pies — lo que significa carreras de despegue mucho más largas, tasas de ascenso reducidas, y menor margen de seguridad. Todo piloto que opera ahí debe calcular la altitud de densidad antes de cada despegue, no asumir que la pista de Toluca se comporta como una a nivel del mar." , imagenes: ["/images/temas/meteorologia-tema10.jpg"]},
      ],
    },
  ],
  "aerodinamica": [
    {
      titulo: "Las cuatro fuerzas del vuelo",
      temas: [
      { id: "aerodinamica-tema1", titulo: "Sustentación en profundidad", texto: "La sustentación no es un valor fijo: depende de cuatro variables que el piloto controla o debe considerar en cada vuelo — el ángulo de ataque (a mayor ángulo, más sustentación, hasta el punto crítico), la velocidad del aire sobre el ala (la sustentación crece con el cuadrado de la velocidad, así que volar al doble de rápido genera cuatro veces más sustentación con el mismo ángulo), la densidad del aire (menos densidad en altitud o calor significa menos sustentación con los mismos parámetros) y el área y forma del ala (perfil aerodinámico y superficie alar). En Fundamentos aprendiste que sustentación se opone a peso; aquí el punto clave es que esa sustentación es ajustable en tiempo real, y el piloto la controla principalmente con dos palancas: el ángulo de ataque (yoke) y la velocidad (potencia y actitud)." , imagenes: ["/images/temas/aerodinamica-tema1.jpg"]},
      { id: "aerodinamica-tema2", titulo: "Ángulo de ataque y pérdida (stall)", texto: "El ángulo de ataque es el ángulo entre la cuerda del ala y el viento relativo — no es lo mismo que la actitud del avión respecto al horizonte. Cada perfil de ala tiene un ángulo crítico de ataque, típicamente entre 16° y 20°, en el que el flujo de aire se separa de la superficie superior y la sustentación colapsa: eso es la pérdida (stall). El dato que más sorprende a un cadete nuevo: la pérdida ocurre siempre al mismo ángulo crítico, sin importar la velocidad, la actitud o el peso del avión — un avión puede entrar en pérdida en actitud de morro abajo, a alta velocidad, si el ángulo de ataque supera el crítico (por ejemplo, en un tirón brusco). Por eso el entrenamiento insiste en que la pérdida es un problema de ángulo de ataque, no de velocidad baja." , imagenes: ["/images/temas/aerodinamica-tema2.jpg"]},
      { id: "aerodinamica-tema3", titulo: "Resistencia inducida vs. parásita", texto: "La resistencia total de un avión se compone de dos tipos con comportamiento opuesto respecto a la velocidad. La resistencia inducida es un subproducto de generar sustentación (los vórtices en las puntas de ala) y es mayor a baja velocidad y ángulos de ataque altos — por eso un avión \"se siente pesado\" de controlar cerca de la pérdida. La resistencia parásita es la fricción del aire contra la estructura del avión (fuselaje, tren, antenas) y crece con el cuadrado de la velocidad — por eso ir muy rápido también cuesta más potencia. La suma de ambas forma una curva en U: existe una velocidad de resistencia mínima (L/D máximo) donde el avión vuela más eficientemente, usada por ejemplo para calcular el mejor planeo en caso de falla de motor." , imagenes: ["/images/temas/aerodinamica-tema3.jpg"]},
      { id: "aerodinamica-tema4", titulo: "Factor de carga y el viraje", texto: "El factor de carga (load factor, medido en \"G\") es la relación entre la sustentación total generada y el peso del avión. En vuelo recto y nivelado, el factor de carga es 1G (sustentación = peso). En un viraje con inclinación, una parte de la sustentación se usa para girar el avión en vez de sostener su peso, así que el ala debe generar más sustentación total para mantener la altitud — esto aumenta el factor de carga (en un viraje a 60° de inclinación, el factor de carga es 2G) y, como consecuencia directa, aumenta la velocidad de pérdida del avión en ese viraje. Este es el motivo por el que un viraje pronunciado y brusco a baja velocidad es una de las combinaciones más peligrosas en el patrón de tráfico." , imagenes: ["/images/temas/aerodinamica-tema4.jpg"]},
      ],
    },
    {
      titulo: "Superficies de control",
      temas: [
      { id: "aerodinamica-tema5", titulo: "Alerones y el adverse yaw", texto: "Los alerones se mueven en direcciones opuestas entre sí: cuando uno sube (reduciendo sustentación de esa ala), el otro baja (aumentándola), generando el alabeo (roll). Pero el ala que baja el alerón también genera más resistencia inducida que la que lo sube — este desbalance produce el adverse yaw (guiñada adversa): el morro del avión tiende a moverse momentáneamente hacia el lado contrario al viraje que se está iniciando. Por eso todo piloto aprende a aplicar pedal de timón en la misma dirección del viraje al iniciar un alabeo, coordinando el movimiento y evitando que la bola del coordinador de viraje se salga del centro." , imagenes: ["/images/temas/aerodinamica-tema5.jpg"]},
      { id: "aerodinamica-tema6", titulo: "Elevador y trim", texto: "El elevador, en el estabilizador horizontal, controla el cabeceo (pitch) cambiando el ángulo de ataque del avión: al tirar del yoke, el elevador sube y genera una fuerza hacia abajo en la cola, haciendo que el morro suba. El trim (compensador) es una superficie secundaria y más pequeña, parte del elevador, que ajusta la fuerza aerodinámica neutral necesaria para mantener una actitud sin que el piloto tenga que sostener presión constante en el yoke — no es un control de vuelo primario, es un ajuste de \"punto de equilibrio\" que reduce la fatiga del piloto en vuelos largos o en cambios sostenidos de velocidad." , imagenes: ["/images/temas/aerodinamica-tema6.jpg"]},
      { id: "aerodinamica-tema7", titulo: "Flaps: tipos y efecto", texto: "Los flaps son superficies del borde de salida del ala que se extienden para aumentar la curvatura (y a veces el área) del perfil alar. Los tipos más comunes en aviación general son el flap simple (plain flap, el más básico, solo pivota hacia abajo), el flap ranurado (slotted flap, con una ranura que dirige aire de alta energía sobre la superficie superior, más eficiente) y el flap Fowler (que además de bajar se desliza hacia atrás, aumentando el área alar). El efecto común a todos: más sustentación y más resistencia a la misma velocidad, lo que permite volar más lento sin entrar en pérdida — por eso se usan en despegue (configuración parcial, prioriza sustentación) y aterrizaje (configuración completa, prioriza también la resistencia para descender más pronunciado y lento)." , imagenes: ["/images/temas/aerodinamica-tema7.jpg"]},
      { id: "aerodinamica-tema8", titulo: "Efecto suelo (ground effect)", texto: "El efecto suelo ocurre cuando el avión vuela muy cerca del suelo (aproximadamente a una altura menor a la envergadura del ala) y la superficie interfiere con la formación normal de los vórtices de punta de ala, reduciendo la resistencia inducida. El resultado práctico que todo cadete experimenta: el avión parece \"flotar\" y resistirse a tocar tierra durante el aterrizaje, o acelera más de lo esperado justo después de despegar. Entender el efecto suelo explica por qué reducir potencia demasiado tarde en el aterrizaje produce un bote (float) largo, y por qué un despegue con poca pista puede parecer exitoso a baja altura pero el avión no logra seguir ascendiendo al salir del efecto suelo si no lleva suficiente velocidad." , imagenes: ["/images/temas/aerodinamica-tema8.jpg"]},
      ],
    },
  ],
  "vfr": [
    {
      titulo: "Mínimos meteorológicos VFR",
      temas: [
      { id: "vfr-tema1", titulo: "Qué son los mínimos VFR y por qué existen", texto: "Los mínimos meteorológicos VFR son la visibilidad mínima y la distancia mínima a las nubes que debes respetar para volar por referencias visuales. Existen porque todo el sistema VFR se basa en el principio de \"ver y evitar\": el piloto, y no el ATC, es responsable de detectar y separarse de otro tráfico y de obstáculos. Sin visibilidad suficiente o volando pegado a las nubes, ese principio deja de funcionar — no tendrías tiempo de reacción para ver a otra aeronave y maniobrar. Por eso los mínimos no son un capricho regulatorio: son la distancia física mínima que necesita un piloto para detectar un peligro y reaccionar a tiempo." , imagenes: ["/images/temas/reglamentacion-tema6.jpg"]},
      { id: "vfr-tema2", titulo: "Mínimos en espacio aéreo controlado vs. no controlado", texto: "Los mínimos de visibilidad y distancia a nubes varían según la clase de espacio aéreo y la altitud. Como regla general, cerca de un aeropuerto controlado (donde hay más tránsito y aeronaves más rápidas) los mínimos son más exigentes que en espacio no controlado y a baja altitud, donde suele bastar con mantenerse \"despejado de nubes\" (clear of clouds) con visibilidad reducida. La lógica es consistente con el resto del sistema: a más tránsito y velocidad de cierre, más margen visual necesitas para ver y evitar a tiempo. Memorizar la tabla completa de mínimos por clase de espacio aéreo es parte esencial de la preparación para cualquier examen de conocimientos VFR." , imagenes: ["/images/temas/reglamentacion-tema6.jpg"]},
      { id: "vfr-tema3", titulo: "VFR nocturno", texto: "Volar VFR de noche exige mínimos más estrictos que de día, porque la referencia visual del horizonte y del terreno se reduce drásticamente — es mucho más fácil perder la orientación espacial o no detectar tráfico a tiempo sin la luz del día. Además de los mínimos meteorológicos más altos, de noche se vuelve crítico identificar correctamente las luces de otras aeronaves (posición, anticolisión) y las luces del aeródromo, y mantener un escaneo instrumental más frecuente como respaldo de la referencia visual exterior, que es menos confiable en la oscuridad." , imagenes: ["/images/temas/vfr-tema3.jpg"]},
      { id: "vfr-tema4", titulo: "Special VFR", texto: "El Special VFR es una autorización especial que el ATC puede otorgar, bajo petición del piloto, para operar en espacio aéreo controlado con visibilidad o techo de nubes por debajo de los mínimos VFR normales, siempre que se mantenga despejado de nubes con una visibilidad mínima (típicamente 1 milla estatutaria) y de día. No es un derecho automático: el controlador puede negarlo si hay tránsito IFR que lo haga inseguro, y solo se autoriza aeronave por aeronave. Es una herramienta útil para casos límite (por ejemplo, entrar a un aeropuerto controlado justo cuando el techo de nubes baja), pero exige que el piloto ejerza un juicio conservador antes de solicitarlo." , imagenes: ["/images/temas/vfr-tema4.jpg"]},
      ],
    },
    {
      titulo: "Procedimientos de patrón de tráfico",
      temas: [
      { id: "vfr-tema5", titulo: "Entrada estándar al patrón de tráfico", texto: "La entrada recomendada a un patrón de tráfico, especialmente en un aeródromo no controlado, es a 45° hacia el tramo de viento en cola (downwind), a la altitud del patrón. Esta entrada te da una vista clara de todo el patrón antes de integrarte a él — puedes ver quién está en viento en cola, base y final antes de sumarte — y es predecible para el resto del tráfico, que espera ver llegar aeronaves por ese punto. Entrar directamente a base o a final sin pasar por esa entrada estándar es una de las causas más comunes de conflictos y sorpresas en el patrón, porque el resto del tráfico no te está buscando ahí." , imagenes: ["/images/temas/vfr-tema5.jpg"]},
      { id: "vfr-tema6", titulo: "Los tramos del patrón y su propósito", texto: "Cada tramo del patrón de tráfico cumple una función distinta en la secuencia de aterrizaje: el viento en cola (downwind) te da tiempo para completar el checklist de aterrizaje y espaciarte del tráfico que va adelante; el viraje a base marca el inicio del descenso y te da una última oportunidad de verificar la pista despejada; y el tramo final te alinea con la pista para el aterrizaje, con la configuración completa ya establecida. Pensar el patrón como una secuencia de decisiones (no solo una figura geométrica que volar) es lo que distingue a un piloto que gestiona bien la carga de trabajo de uno que solo sigue las líneas del circuito." , imagenes: ["/images/temas/vfr-tema6.jpg"]},
      { id: "vfr-tema7", titulo: "Reportes de posición en aeródromo no controlado", texto: "En un aeródromo sin torre, los pilotos se coordinan entre sí anunciando su posición por radio en una frecuencia común (CTAF), sin que nadie autorice sus movimientos — es información, no una instrucción. Un reporte típico sigue el formato: nombre del aeródromo, matrícula, posición en el patrón, y pista, por ejemplo: \"Tráfico [nombre del aeródromo], XB-VLA, entrando viento en cola pista 20\". Reportar en cada tramo (entrada, viento en cola, base, final) le da al resto del tráfico la información que necesita para autosepararse, especialmente cuando no todos pueden verse entre sí visualmente en todo momento." , imagenes: ["/images/temas/comunicaciones-tema7.jpg"]},
      { id: "vfr-tema8", titulo: "Separación y prioridad en el patrón", texto: "Cuando dos aeronaves convergen en el patrón, la regla general de prioridad es que la aeronave con menor altura o más cerca de aterrizar tiene preferencia — por ejemplo, una aeronave ya en final normalmente tiene prioridad sobre una que apenas está entrando al patrón. Sin embargo, esa prioridad nunca exime a nadie de la responsabilidad de \"ver y evitar\": si detectas un conflicto, la solución siempre es comunicarlo por radio y ajustar tu propia trayectoria (por ejemplo, extendiendo el viento en cola) en vez de asumir que el otro piloto cederá el paso. La cortesía y la comunicación clara evitan más incidentes en el patrón que cualquier regla de prioridad escrita." , imagenes: ["/images/temas/vfr-tema8.jpg"]},
      ],
    },
    {
      titulo: "Luces de la aeronave",
      temas: [
      { id: "vfr-tema9", titulo: "Luces de posición, anticolisión y aterrizaje", texto: "Todo avión lleva luces de posición obligatorias con el mismo esquema que usan los barcos: roja en la punta del ala izquierda, verde en la punta del ala derecha, y blanca en la cola. Ver ambas luces, roja y verde, de frente te dice que otra aeronave viene directo hacia ti; ver solo una de las dos te indica de qué lado tienes su trayectoria. A esto se suman las luces anticolisión: la baliza (beacon), una luz roja rotativa que se enciende en cuanto el motor arranca — por eso nunca te acercas a una hélice con la baliza encendida — y las luces estroboscópicas (strobes), destellos blancos de alta intensidad que se usan tanto de día como de noche para máxima visibilidad, aunque conviene apagarlas dentro de nubes porque el reflejo puede desorientar. Las luces de aterrizaje y rodaje, por su parte, mejoran tanto tu visibilidad ante otros como tu propia visión de la pista o plataforma. Por regla general, las luces de posición son obligatorias desde 30 minutos después de la puesta del sol hasta 30 minutos antes de su salida, y la anticolisión debe permanecer encendida siempre que el motor esté en marcha.", imagenes: ["/images/temas/vfr-tema9.svg"]},
      ],
    },
  ],
  "navegacion": [
    {
      titulo: "Radionavegación: VOR, CDI, DME, HSI y ADF",
      temas: [
      { id: "navegacion-tema1", titulo: "Qué es un VOR", texto: "El VOR (VHF Omnidirectional Range) es una radioayuda terrestre que transmite información de rumbo en la banda VHF (108.00–117.95 MHz), permitiendo que el avión determine su posición angular (radial) respecto a la estación. Es la columna vertebral de la navegación aérea tradicional, tanto VFR como IFR, y la base sobre la que se construyen todos los demás conceptos de este módulo: radiales, tracking, intercepción y fixes cruzados. Cada estación VOR transmite 360 cursos posibles (uno por cada grado), y el receptor a bordo interpreta esa señal para decirte exactamente en qué radial te encuentras." , imagenes: ["/images/temas/navegacion-tema1.jpg"]},
      { id: "navegacion-tema2", titulo: "Cómo funciona un VOR", texto: "Técnicamente, la estación VOR transmite dos señales simultáneas: una de fase de referencia (igual en todas direcciones) y una de fase variable (que rota electrónicamente 30 veces por segundo). El receptor del avión mide la diferencia de fase entre ambas señales, y esa diferencia en grados es exactamente tu radial respecto a la estación. No necesitas entender la electrónica a fondo, pero sí esta idea: el VOR no te dice dónde estás en millas, te dice en qué línea recta (radial) estás parado respecto a la estación — para saber la distancia exacta necesitas un DME o cruzar con otro VOR." , imagenes: ["/images/temas/navegacion-tema2.jpg"]},
      { id: "navegacion-tema3", titulo: "Radiales", texto: "Un radial es cada una de las 360 líneas rectas imaginarias que salen del VOR en todas direcciones, numeradas según su rumbo magnético MEDIDO DESDE la estación. El radial 090 es la línea que sale hacia el este de la estación; el radial 270 sale hacia el oeste. Un error común de cadete: el radial siempre se mide DESDE el VOR hacia afuera, nunca hacia la estación. Si estás parado en el radial 090 de un VOR, estás al este de esa estación, sin importar hacia dónde apunte la nariz de tu avión." , imagenes: ["/images/temas/navegacion-tema3.jpg"]},
      { id: "navegacion-tema4", titulo: "FROM vs TO", texto: "La bandera FROM/TO en tu indicador te dice si, volando el curso seleccionado en el OBS, te alejarías (FROM) o te acercarías (TO) a la estación. Si seleccionas un curso y la bandera dice TO, volar ese rumbo con la aguja centrada te lleva HACIA el VOR; si dice FROM, te lleva alejándote. Es fácil confundirse porque el radial y el curso TO la estación son opuestos entre sí (difieren 180°) — por ejemplo, para volar TO un VOR estando en el radial 090, tu curso sería 270, no 090. Siempre verifica la bandera antes de asumir hacia dónde te lleva el curso seleccionado." , imagenes: ["/images/temas/navegacion-tema4.jpg"]},
      { id: "navegacion-tema5", titulo: "Cómo leer un CDI", texto: "El CDI (Course Deviation Indicator) es la aguja vertical que te muestra qué tan lejos estás del curso seleccionado en el OBS. Cada punto (dot) de desviación representa aproximadamente 2° de error angular respecto al VOR, con un total de 5 puntos a cada lado (10° de escala completa). Si la aguja está a la izquierda, el curso seleccionado está a tu izquierda — vuelas HACIA la aguja para interceptarlo, nunca te alejas de ella. Una aguja centrada significa que estás exactamente sobre el curso seleccionado." , imagenes: ["/images/temas/navegacion-tema5.svg"]},
      { id: "navegacion-tema6", titulo: "Qué es un OBS", texto: "El OBS (Omni Bearing Selector) es la perilla que giras para seleccionar el curso o radial que quieres volar. Al girarla, mueves la referencia interna del instrumento, lo cual cambia tanto la posición de la aguja del CDI como la bandera FROM/TO. Seleccionar un curso en el OBS no cambia tu posición real ni tu rumbo — solo le dice al instrumento qué curso quieres usar como referencia para comparar contra tu posición actual." , imagenes: ["/images/temas/navegacion-tema6.jpg"]},
      { id: "navegacion-tema7", titulo: "Cómo interceptar una radial", texto: "Interceptar una radial significa maniobrar tu avión desde tu posición actual hasta quedar exactamente sobre el radial deseado. El proceso es: 1) selecciona el radial deseado en el OBS, 2) observa hacia qué lado apunta la aguja del CDI (eso te dice de qué lado del radial estás), 3) gira hacia un rumbo de intercepción que combine tu curso deseado con un ángulo extra hacia el lado donde está la aguja, y 4) mantén ese rumbo hasta que la aguja se acerque al centro, momento en el que giras para alinearte con el curso final." , imagenes: ["/images/temas/navegacion-tema7.jpg"]},
      { id: "navegacion-tema8", titulo: "¿Por qué se recomienda interceptar con 30°?", texto: "Un ángulo de intercepción de 30° es el estándar recomendado porque ofrece el mejor equilibrio entre velocidad de intercepción y control: con menos de 30° tardas mucho en cerrar la distancia al radial (intercepción muy lenta y gradual); con más de 30-45° te arriesgas a pasarte del curso (overshoot) porque la aguja se mueve muy rápido cerca del centro y es fácil no reaccionar a tiempo. 30° te da tiempo suficiente para anticipar el momento de girar hacia el curso final sin pasarte, y es el ángulo que se enseña y evalúa en la mayoría de programas de entrenamiento." , imagenes: ["/images/temas/navegacion-tema8.jpg"]},
      { id: "navegacion-tema9", titulo: "Cómo calcular el rumbo de interceptación", texto: "La fórmula general es: Rumbo de intercepción = Curso deseado ± Ángulo de intercepción, sumando o restando según de qué lado del curso te encuentres. Si tu curso deseado es 360° y la aguja del CDI está a la derecha (estás al oeste del curso), sumas el ángulo: intercepta con rumbo 030°. Si la aguja está a la izquierda (estás al este del curso), restas: intercepta con rumbo 330°. La regla práctica es \"vuela hacia donde apunta la aguja\": si la aguja está a la derecha, tu rumbo de intercepción debe ser mayor que el curso deseado; si está a la izquierda, menor." , imagenes: ["/images/temas/navegacion-tema9.jpg"]},
      { id: "navegacion-tema10", titulo: "Seguimiento de radiales (Tracking)", texto: "Tracking es mantener tu avión exactamente sobre el radial o curso deseado durante todo el trayecto, corrigiendo constantemente por el viento. A diferencia de simplemente apuntar la nariz hacia la estación, tracking requiere calcular un Ángulo de Corrección por Viento (WCA) — un pequeño desvío del rumbo respecto al curso, hacia el lado de donde viene el viento, para compensar la deriva. Si el viento te empuja hacia la derecha del curso, corriges volando unos grados a la izquierda del curso hasta que la aguja se mantenga centrada, y ese es tu rumbo real de tracking, no tu curso deseado." , imagenes: ["/images/temas/navegacion-tema10.jpg"]},
      { id: "navegacion-tema11", titulo: "Homing vs Tracking", texto: "Homing es la técnica (menos precisa) de simplemente apuntar constantemente la nariz del avión hacia la aguja o hacia la estación, sin calcular corrección de viento — el resultado es una trayectoria curva, ineficiente, porque el viento te va desviando y vas ajustando reactivamente en vez de anticipar. Tracking, en cambio, es mantener una línea recta real sobre el suelo usando un ángulo de corrección calculado de antemano, resultando en una ruta más corta, predecible y profesional. Todo piloto instrumental debe dominar tracking; homing es aceptable solo como aproximación inicial burda, nunca como técnica final." , imagenes: ["/images/temas/navegacion-tema11.jpg"]},
      { id: "navegacion-tema12", titulo: "Navegación con dos VOR", texto: "Cuando sintonizas dos estaciones VOR distintas y determinas en qué radial de cada una te encuentras, el punto donde esos dos radiales se cruzan en la carta es tu posición exacta — esta técnica se llama fijación cruzada (cross-fix) y es una de las formas más confiables de confirmar tu posición sin GPS. Se traza cada radial desde su VOR correspondiente en la carta, y la intersección de ambas líneas es tu ubicación real en ese momento. Es una habilidad clásica de navegación por radioayudas que todo piloto debe poder ejecutar manualmente." , imagenes: ["/images/temas/navegacion-tema12.jpg"]},
      { id: "navegacion-tema13", titulo: "Qué es un DME", texto: "El DME (Distance Measuring Equipment) mide la distancia real (en línea recta, \"slant range\") entre tu avión y la estación terrestre, en millas náuticas, usando el tiempo que tarda una señal en ir y regresar. Muchas veces está integrado con el VOR (VOR/DME) o con el ILS. Además de distancia, muchos DME calculan y muestran tu velocidad de acercamiento (groundspeed) y tiempo estimado a la estación, información clave para planificación en vuelo. Ojo: a baja altura y muy cerca de la estación, la distancia \"slant range\" no es exactamente igual a tu distancia horizontal real, por la altura del avión." , imagenes: ["/images/temas/navegacion-tema13.jpg"]},
      { id: "navegacion-tema14", titulo: "Qué es un HSI", texto: "El HSI (Horizontal Situation Indicator) combina en un solo instrumento el indicador de rumbo (brújula giroscópica) con la información de desviación de curso del VOR/ILS y, en muchos casos, la pendiente de planeo (glideslope). En vez de tener el CDI separado del indicador de rumbo, el HSI los integra visualmente: la rosa de compás gira mostrando tu rumbo real, y sobre ella se superpone la barra de curso seleccionado con su desviación — dándote una imagen mucho más intuitiva de tu situación real respecto al curso, en vez de tener que interpretar dos instrumentos por separado." , imagenes: ["/images/temas/navegacion-tema14.jpg"]},
      { id: "navegacion-tema15", titulo: "Cómo usar un HSI", texto: "Para usar el HSI, seleccionas el curso deseado con el selector de curso (similar al OBS), y el instrumento gira una barra sobre la rosa de compás mostrando ese curso en relación a tu rumbo actual. La desviación de la barra respecto al centro funciona igual que un CDI normal, pero con la ventaja de que ves simultáneamente tu rumbo real, así que es mucho más difícil confundirte sobre hacia qué lado debes girar. Muchos HSI también muestran el bug de rumbo deseado para acoplar con el piloto automático, y la aguja de glideslope si estás en una aproximación ILS." , imagenes: ["/images/temas/navegacion-tema15.jpg"]},
      { id: "navegacion-tema16", titulo: "Diferencias entre CDI y HSI", texto: "El CDI tradicional muestra solo la desviación del curso, sin contexto de tu rumbo real — tienes que mirar el indicador de rumbo por separado y mentalmente combinar ambas lecturas, lo cual genera el clásico problema de \"sensibilidad inversa\" (reverse sensing) cuando vuelas en la dirección equivocada del curso seleccionado, confundiendo a muchos estudiantes. El HSI resuelve este problema integrando rumbo y desviación en una sola imagen visual: la barra de curso siempre se muestra en su orientación real respecto a tu rumbo, eliminando la confusión de sensibilidad inversa y dándote conciencia situacional instantánea. Por eso el HSI es el estándar en cabinas más modernas y de instrumentos avanzados." , imagenes: ["/images/temas/navegacion-tema16.jpg"]},
      { id: "navegacion-tema17", titulo: "Navegación ADF", texto: "El ADF (Automatic Direction Finder) es un sistema de navegación más antiguo que usa estaciones NDB en tierra. A diferencia del VOR, el ADF no te da radiales — su aguja simplemente apunta directamente hacia la estación en todo momento, mostrando el rumbo relativo (relative bearing) medido desde la nariz de tu avión, sin importar hacia dónde estés volando. Esto lo hace más simple pero también menos preciso y más susceptible a interferencia (tormentas eléctricas, terreno, hora del día) que el VOR. Sigue usándose en algunas regiones del mundo donde la infraestructura VOR es limitada." , imagenes: ["/images/temas/navegacion-tema17.jpg"]},
      { id: "navegacion-tema18", titulo: "Cómo funciona un NDB", texto: "El NDB (Non-Directional Beacon) transmite una señal de radio en frecuencia baja/media (LF/MF) de forma igual en todas direcciones — a diferencia del VOR, no codifica información de radial alguna. El receptor ADF a bordo detecta hacia qué dirección relativa viene la señal más fuerte y mueve su aguja para apuntar directamente hacia la estación. Esto significa que el NDB por sí solo no te dice en qué radial estás, solo la dirección hacia la estación desde tu posición actual — para saber tu posición real necesitas combinarlo con tu rumbo y, idealmente, otra referencia cruzada." , imagenes: ["/images/temas/navegacion-tema18.jpg"]},
      { id: "navegacion-tema19", titulo: "RMI", texto: "El RMI (Radio Magnetic Indicator) combina una rosa de compás giratoria (mostrando tu rumbo magnético real) con una o dos agujas que apuntan hacia estaciones ADF y/o VOR — la diferencia clave frente al ADF simple es que el RMI te muestra el rumbo magnético REAL hacia la estación (no solo relativo a tu nariz), porque la rosa de compás gira junto con tu avión. Esto hace mucho más fácil interpretar tu posición respecto a la estación de un vistazo, sin tener que hacer cálculos mentales de rumbo relativo más rumbo magnético." , imagenes: ["/images/temas/navegacion-tema19.jpg"]},
      ],
    },
    {
      titulo: "Cartas VFR y planificación de ruta",
      temas: [
      { id: "navegacion-tema20", titulo: "Cartas VFR", texto: "Las cartas VFR (cartas de navegación visual, tipo sectional) muestran toda la información que necesitas para navegar visualmente: ubicación y clasificación de espacio aéreo (Clase B, C, D, E, G), aeropuertos con sus frecuencias, obstáculos y su altura, elevaciones del terreno, y la ubicación exacta de estaciones VOR con su rosa de compás impresa para poder trazar radiales directamente sobre la carta. Aprender a leer una carta VFR con fluidez —identificar símbolos, calcular elevaciones y reconocer espacio aéreo controlado— es una habilidad base indispensable antes de planear cualquier ruta." , imagenes: ["/images/temas/navegacion-tema20.jpg"]},
      { id: "navegacion-tema21", titulo: "Cómo medir distancias", texto: "En una carta VFR, mides distancias usando la escala gráfica impresa en el margen o un plotter de navegación, comparando la longitud de tu ruta trazada contra esa escala. Un truco práctico y confiable: en cualquier carta, un minuto de latitud (medido verticalmente en los bordes izquierdo/derecho de la carta) equivale a una milla náutica — así que puedes usar los bordes de la carta como regla de distancias sin necesitar un plotter especial, siempre midiendo verticalmente, nunca en los bordes horizontales de longitud." , imagenes: ["/images/temas/navegacion-tema21.jpg"]},
      { id: "navegacion-tema22", titulo: "Cómo saber la distancia a un aeropuerto", texto: "Tienes varias formas: si el aeropuerto tiene DME o VOR/DME cercano, tu instrumento te da la distancia directa en millas náuticas. Sin DME, puedes usar navegación por estima (dead reckoning): mide la distancia en la carta entre tu posición actual y el aeropuerto, y divide entre tu velocidad respecto al suelo (groundspeed) para saber cuánto tiempo falta. Si tu avión tiene GPS, la distancia y tiempo estimado aparecen directamente en la pantalla — pero como piloto en entrenamiento debes poder calcularlo manualmente sin depender de la electrónica." , imagenes: ["/images/temas/navegacion-tema22.jpg"]},
      { id: "navegacion-tema23", titulo: "Cómo planear una ruta VFR", texto: "Planear una ruta VFR involucra: seleccionar puntos de referencia visuales (checkpoints) claramente identificables desde el aire, calcular el rumbo magnético y distancia entre cada uno, estimar tiempo y consumo de combustible por tramo considerando el viento pronosticado, verificar el espacio aéreo que cruzarás y si necesitas autorización o comunicación con algún control, revisar NOTAMs y METAR/TAF de salida, ruta y destino, y siempre definir un aeropuerto alterno con reservas de combustible adecuadas. Un plan de vuelo VFR bien hecho es la diferencia entre un vuelo tranquilo y una situación de estrés innecesario en el aire." , imagenes: ["/images/temas/navegacion-tema23.jpg"]},
      { id: "navegacion-tema24", titulo: "Ejemplo MMGL → MMZO", texto: "Tomemos la ruta real Guadalajara (MMGL) a Manzanillo (MMZO) como ejercicio integrador de todo el módulo: identificas los VOR disponibles en la ruta para usarlos como checkpoints o para tracking directo, mides la distancia total y por tramos en la carta VFR, calculas el rumbo magnético inicial y cómo cambia si sigues radiales de un VOR intermedio, estimas tiempo total según tu velocidad de crucero y viento pronosticado, y planeas un alterno (por ejemplo Colima) por si las condiciones en Manzanillo no son favorables. Este tipo de ejercicio práctico, aplicando radiales, tracking y cálculo de distancias sobre una ruta real, es exactamente lo que se evalúa en un checkride de navegación." , imagenes: ["/images/temas/navegacion-tema24.jpg"]},
      ],
    },
  ],
  "cartografia": [
    {
      titulo: "Elementos y símbolos de la carta VFR",
      temas: [
      { id: "cartografia-tema1", titulo: "Tipos de cartas", texto: "Existen varios tipos de cartas aeronáuticas según su propósito. Las Cartas VFR (Sectional Charts) son las más usadas para vuelo visual, a escala 1:500,000, mostrando terreno, obstáculos, espacio aéreo y aeródromos con gran detalle. Las Cartas de Área Terminal (TAC) cubren zonas de espacio aéreo denso alrededor de grandes ciudades con más detalle aún. Para vuelo IFR existen las Cartas de Ruta de Baja Altitud (para aerovías bajo FL180) y Alta Altitud (para niveles superiores), mucho más simplificadas visualmente porque priorizan aerovías, fixes y frecuencias sobre el detalle del terreno. Las Cartas de Aproximación (approach plates) muestran el procedimiento detallado para aterrizar en un aeropuerto específico bajo IFR." , imagenes: ["/images/temas/cartografia-tema1.jpg"]},
      { id: "cartografia-tema2", titulo: "Símbolos", texto: "Cada carta usa una simbología estandarizada que debes memorizar: los aeropuertos con torre de control se dibujan con un círculo azul relleno, los no controlados en magenta; la longitud de las líneas que salen del círculo indica si la pista es dura (relleno sólido) o de superficie blanda (contorno abierto). Los obstáculos se marcan con un punto y una torre pequeña, acompañados de su altura. El terreno de mayor elevación se sombrea en tonos más oscuros de café/naranja según su altura. Aprender la leyenda de tu carta (impresa en los márgenes) es el primer paso — ahí están explicados todos los símbolos oficialmente." , imagenes: ["/images/temas/cartografia-tema2.jpg"]},
      { id: "cartografia-tema3", titulo: "Espacios aéreos", texto: "El espacio aéreo se divide en clases con distintos requisitos: Clase A (arriba de FL180, solo IFR), Clase B (alrededor de los aeropuertos más grandes, requiere autorización explícita de control para entrar, representada en la carta con círculos concéntricos sólidos azules), Clase C (aeropuertos medianos, requiere contacto por radio pero no autorización explícita, círculos magenta sólidos), Clase D (aeropuertos con torre, líneas discontinuas azules), Clase E (espacio controlado general, líneas discontinuas magenta o sombreado), y Clase G (espacio no controlado, sin marcado especial, generalmente a baja altura en zonas rurales). Reconocer estos límites en la carta antes de volar es obligatorio para evitar violaciones de espacio aéreo." , imagenes: ["/images/temas/cartografia-tema3.jpg"]},
      { id: "cartografia-tema4", titulo: "Obstáculos", texto: "Los obstáculos —torres de radio, antenas, edificios altos, grúas permanentes— se representan con un símbolo de torre y un punto en su base exacta. Junto al símbolo aparecen dos números: la altura sobre el nivel del mar (MSL) y, entre paréntesis, la altura sobre el terreno (AGL). Por ejemplo, un obstáculo marcado \"1500 (450)\" significa que su punta está a 1,500 pies MSL, de los cuales 450 pies son la estructura misma sobre el terreno local. Los obstáculos de más de 1,000 pies AGL suelen resaltarse con un símbolo más grande por su relevancia para la planificación de rutas y altitudes mínimas de seguridad." , imagenes: ["/images/temas/cartografia-tema4.jpg"]},
      ],
    },
    {
      titulo: "Elevaciones, frecuencias, puntos VFR y lectura completa",
      temas: [
      { id: "cartografia-tema5", titulo: "Elevaciones", texto: "Las cartas VFR muestran la elevación del terreno mediante sombreado en capas de color (más oscuro = más alto) y líneas de contorno en zonas montañosas. Además, cada cuadrante de la carta (delimitado por líneas de latitud/longitud) tiene impreso un número grande llamado MEF (Maximum Elevation Figure) — la altitud más alta redondeada hacia arriba al siguiente centenar o millar de pies dentro de ese cuadrante, incluyendo el obstáculo más alto conocido más un margen de seguridad. El MEF es tu referencia rápida para saber la altitud mínima segura de sobrevuelo en cualquier cuadrante sin necesidad de revisar cada elevación individual." , imagenes: ["/images/temas/cartografia-tema5.jpg"]},
      { id: "cartografia-tema6", titulo: "Frecuencias", texto: "Las frecuencias de radio relevantes se imprimen directamente junto a cada aeropuerto y límite de espacio aéreo en la carta: CTAF (frecuencia común de tráfico en aeropuertos no controlados), Torre, Aproximación/Salida, y ATIS, generalmente en pequeñas cajas de texto en azul o magenta según la clase de espacio aéreo asociado. Antes de acercarte a cualquier aeropuerto o zona de espacio aéreo controlado, debes identificar en la carta qué frecuencia necesitas contactar y en qué punto exacto de tu ruta debes hacerlo — normalmente indicado por el límite dibujado del espacio aéreo correspondiente." , imagenes: ["/images/temas/cartografia-tema6.jpg"]},
      { id: "cartografia-tema7", titulo: "Puntos VFR", texto: "Los Puntos de Notificación VFR son ubicaciones visuales específicas —cerros, cruces de carreteras, presas, poblados reconocibles— marcadas en la carta con un símbolo de estrella o triángulo magenta y un nombre corto, usados para comunicar tu posición a control de forma rápida y estandarizada cerca de aeropuertos con tráfico denso o espacio aéreo Clase B/C/D. En vez de dar coordenadas o describir tu ubicación, simplemente reportas \"sobre el punto Vista Hermosa\" y el controlador sabe exactamente dónde estás. Memorizar los puntos VFR de tus aeropuertos frecuentes agiliza mucho la comunicación." , imagenes: ["/images/temas/cartografia-tema7.jpg"]},
      { id: "cartografia-tema8", titulo: "Cómo leer una carta completa", texto: "Leer una carta completa es integrar todo lo anterior en un solo vistazo antes de volar: identifica tu ruta general y qué espacios aéreos vas a cruzar, revisa el MEF de cada cuadrante que atravesarás para definir tu altitud mínima segura, ubica los obstáculos relevantes en tu trayectoria, localiza los VOR y puntos VFR que usarás como checkpoints, y anota las frecuencias que necesitarás contactar en cada etapa. Un buen hábito es trazar tu ruta completa en la carta ANTES del vuelo con lápiz o marcador, marcando cada checkpoint con su rumbo, distancia y tiempo estimado — así en el aire solo confirmas contra el plan, en vez de estar interpretando la carta en tiempo real bajo presión." , imagenes: ["/images/temas/cartografia-tema8.jpg"]},
      ],
    },
  ],
  "comunicaciones": [
    {
      titulo: "Fraseología estándar: torre, rodaje y despegue",
      temas: [
      { id: "comunicaciones-tema1", titulo: "Fraseología básica", texto: "La fraseología aeronáutica es un lenguaje estandarizado a nivel mundial (basado en inglés OACI, adaptado al español en países hispanohablantes) diseñado para eliminar ambigüedad en la comunicación radio. Incluye el alfabeto fonético (Alfa, Bravo, Charlie, Delta...) para deletrear matrículas y letras sin confusión, pronunciación estándar de números (dígito por dígito: \"tres cinco cero\" en vez de \"trescientos cincuenta\"), y palabras clave con significado fijo: Afirmativo (sí), Negativo (no), Wilco (voy a cumplir la instrucción), Roger (recibido, entendido, sin implicar que cumplirás). Usar fraseología estándar —en vez de lenguaje coloquial— reduce errores y acelera la comunicación en frecuencias congestionadas." , imagenes: ["/images/temas/comunicaciones-tema1.jpg"]},
      { id: "comunicaciones-tema2", titulo: "Primer contacto con Torre", texto: "El primer contacto con cualquier estación sigue una estructura fija: a quién llamas, quién eres, y qué necesitas — en ese orden. Ejemplo: \"Guadalajara Torre, Cessna XB-VLA, en plataforma, solicito rodaje para salida local con información Bravo.\" Nunca omitas tu matrícula completa en el primer contacto (después, torre puede autorizarte a usar solo la última parte). Incluir la letra de información ATIS que recibiste confirma que tienes los datos meteorológicos actuales y evita que te los repitan innecesariamente." , imagenes: ["/images/temas/comunicaciones-tema2.jpg"]},
      { id: "comunicaciones-tema3", titulo: "Rodaje", texto: "La autorización de rodaje especifica la ruta exacta que debes seguir y cualquier punto donde debes detenerte y esperar (hold short). Ejemplo de instrucción: \"XB-VLA, ruede a pista 20 por calle Alfa, mantenga corto de pista 02.\" Debes leer de vuelta (readback) cualquier instrucción de \"mantener corto\" (hold short) de una pista, sin excepción — es una de las pocas instrucciones donde el readback es obligatorio siempre, porque un error aquí puede causar una incursión de pista. Si no tienes clara la ruta, pide que la repitan antes de moverte." , imagenes: ["/images/temas/comunicaciones-tema3.jpg"]},
      { id: "comunicaciones-tema4", titulo: "Antes del despegue", texto: "Antes de solicitar la pista, completas tus listas de verificación (run-up, checklist previa a despegue) en la plataforma de espera o punto de espera designado. Al estar listo, contactas: \"Torre, XB-VLA, listo para despegue, pista 20.\" Nota: la OACI recomienda reservar la palabra \"despegue\" (take-off) para la autorización y decir \"listo para salida\" (ready for departure) al reportar; en la práctica se oye \"listo para despegue\" y se entiende igual. Las guías de Comunicaciones VFR e IFR de Descargas usan \"listo para salida\". La torre puede darte instrucciones adicionales de espera (\"mantenga posición\", \"line up and wait\" en fraseología internacional) si hay tráfico en la pista o en corta final. Nunca cruces el umbral de la pista sin autorización explícita, incluso si la pista parece despejada — la autorización verbal es obligatoria, no opcional." , imagenes: ["/images/temas/comunicaciones-tema4.jpg"]},
      { id: "comunicaciones-tema5", titulo: "Autorización de despegue", texto: "La autorización de despegue tiene un formato específico que debes leer de vuelta completo: \"XB-VLA, autorizado a despegar pista 20, viento 200 a 8 nudos.\" Tu readback debe incluir tu matrícula y la confirmación de \"autorizado a despegar pista 20\" — no basta con decir \"copiado\" o \"roger\". Si la autorización menciona una pista distinta a la que esperas, o algo no coincide con tu plan, pide confirmación inmediata antes de iniciar el despegue; nunca asumas que fue un error de la torre sin confirmar." , imagenes: ["/images/temas/comunicaciones-tema5.jpg"]},
      { id: "comunicaciones-tema6", titulo: "En circuito", texto: "Dentro del circuito de tráfico (patrón), los reportes de posición siguen el orden del circuito: viento en cola (downwind), base, y final. Ejemplo: \"Torre, XB-VLA, viento en cola pista 20\" ... \"XB-VLA, base pista 20\" ... \"XB-VLA, final pista 20.\" Estos reportes le permiten a la torre secuenciar el tráfico y a otros pilotos en el circuito tener conciencia situacional de dónde estás, incluso en aeropuertos no controlados donde te reportas en la frecuencia CTAF sin que nadie te responda directamente, solo para informar a otros pilotos." , imagenes: ["/images/temas/comunicaciones-tema6.svg"]},
      { id: "comunicaciones-tema7", titulo: "Reportes de posición", texto: "Fuera del circuito, los reportes de posición en ruta siguen un formato estándar: quién eres, dónde estás (usualmente sobre un punto VFR o VOR/radial), tu altitud, y tus intenciones. Ejemplo: \"XB-VLA, sobre el punto Vista Hermosa, seis mil quinientos pies, en tránsito hacia Guadalajara.\" Estos reportes son especialmente importantes cerca de espacio aéreo controlado o en zonas de tráfico denso, donde control (o incluso otros pilotos monitoreando la frecuencia) necesitan saber tu posición exacta para mantener separación." , imagenes: ["/images/temas/comunicaciones-tema7.jpg"]},
      ],
    },
    {
      titulo: "Circuito, aproximación, IFR, emergencias y errores comunes",
      temas: [
      { id: "comunicaciones-tema8", titulo: "Tránsito VFR", texto: "Para cruzar espacio aéreo controlado sin aterrizar (Clase B, C o D) necesitas solicitar y recibir autorización de tránsito VFR antes de entrar. Ejemplo de solicitud: \"Aproximación Guadalajara, Cessna XB-VLA, solicito tránsito VFR de norte a sur, seis mil pies, sobre la ciudad.\" Control puede autorizarte tal cual la solicitud, darte una ruta específica, una altitud distinta, o negarte el tránsito si hay demasiado tráfico — en cuyo caso debes desviarte para rodear el espacio aéreo en vez de cruzarlo sin autorización." , imagenes: ["/images/temas/comunicaciones-tema8.jpg"]},
      { id: "comunicaciones-tema9", titulo: "Aproximación", texto: "Al acercarte a tu aeropuerto de destino dentro de espacio aéreo controlado, usualmente contactas primero a Aproximación (Approach) antes de que te transfieran a Torre. Aproximación te da vectores, altitudes y secuenciación respecto a otro tráfico: \"XB-VLA, vire rumbo 180, descienda y mantenga cinco mil pies, espere vectores para secuencia visual con tráfico Cessna al frente.\" Escucha con atención cualquier instrucción de tráfico a la vista (\"tráfico a las 10, dos millas, mismo nivel\") y reporta cuando lo tengas visualmente." , imagenes: ["/images/temas/comunicaciones-tema9.jpg"]},
      { id: "comunicaciones-tema10", titulo: "Aterrizaje", texto: "La autorización de aterrizaje llega típicamente cuando estás en tramo final: \"XB-VLA, autorizado a aterrizar pista 20, viento 190 a 6 nudos.\" Igual que con el despegue, tu readback debe confirmar \"autorizado a aterrizar pista 20\" con tu matrícula. Si vas a hacer un touch-and-go (toque y despegue) en vez de aterrizaje completo, debes solicitarlo explícitamente y la autorización lo reflejará: \"autorizado toque y despegue pista 20.\" Nunca asumas autorización de aterrizaje solo porque no escuchaste instrucción contraria — el silencio no es autorización." , imagenes: ["/images/temas/comunicaciones-tema10.jpg"]},
      { id: "comunicaciones-tema11", titulo: "Comunicaciones IFR", texto: "Bajo reglas IFR, las comunicaciones son más estructuradas y con mayor carga de información: recibes tu autorización de vuelo (clearance) antes de salir, incluyendo ruta, altitud inicial, código transpondedor (squawk) y frecuencia de salida — todo debe leerse de vuelta completo y correctamente, palabra por palabra, especialmente el código squawk y las altitudes. Un \"readback correcto\" confirmado por control es lo que te autoriza a proceder; si tu readback tiene un error, control te corregirá y debes repetir la versión correcta antes de continuar. La disciplina de readback es aún más crítica en IFR porque hay menos margen de referencia visual para detectar errores." , imagenes: ["/images/temas/comunicaciones-tema11.jpg"]},
      { id: "comunicaciones-tema12", titulo: "Emergencias", texto: "Existen dos niveles de llamada de emergencia por radio: PAN-PAN (repetido 3 veces) para una situación urgente que no representa peligro inmediato de vida (por ejemplo, un pasajero enfermo), y MAYDAY (repetido 3 veces) para peligro grave e inminente (falla de motor, incendio a bordo). El formato es: \"MAYDAY, MAYDAY, MAYDAY, [matrícula], [naturaleza de la emergencia], [posición], [altitud], [almas a bordo], [combustible restante], [intenciones].\" Declarar una emergencia te da prioridad absoluta sobre cualquier otro tráfico y control hará todo lo posible por asistirte — no dudes en declararla si la situación lo amerita, es preferible declarar de más que de menos." , imagenes: ["/images/temas/comunicaciones-tema12.jpg"]},
      { id: "comunicaciones-tema13", titulo: "Errores comunes", texto: "Los errores más frecuentes en comunicaciones incluyen: omitir el readback de instrucciones críticas (especialmente \"mantenga corto\" de pista y autorizaciones de despegue/aterrizaje), usar tu matrícula incompleta antes de que torre te autorice a abreviarla, bloquear la frecuencia hablando al mismo tiempo que otra estación (\"stepping on\" transmisiones), asumir una autorización que nunca se dio explícitamente, y usar lenguaje coloquial en vez de fraseología estándar en momentos críticos. La disciplina de radio no es cuestión de sonar profesional — es una herramienta de seguridad: cada elemento de la fraseología existe porque previene un tipo específico de error o malentendido que históricamente ha causado incidentes." , imagenes: ["/images/temas/comunicaciones-tema13.jpg"]},
      ],
    },
  ],
  "instrumentos": [
    {
      titulo: "Instrumentos de vuelo: altímetro, velocidad, actitud y viraje",
      temas: [
      { id: "instrumentos-tema1", titulo: "Altímetro", texto: "El altímetro mide tu altitud usando la presión estática del aire exterior, comparándola contra una referencia que ajustas manualmente en la ventana Kollsman (en pulgadas de mercurio, inHg). Existen varios tipos de altitud: Indicada (lo que lees directo), Verdadera (altura real sobre el nivel del mar, corregida por temperatura), de Presión (referencia estándar 29.92), y de Densidad (ajustada por temperatura y presión, la que afecta el rendimiento real del avión). Regla clave: 'de alta a baja presión, cuidado abajo' — si vuelas de una zona de alta presión hacia una de baja sin ajustar tu Kollsman, tu altímetro te muestra más altura de la que realmente tienes, un error peligroso cerca del terreno." , imagenes: ["/images/temas/instrumentos-tema1.jpg"]},
      { id: "instrumentos-tema2", titulo: "Velocidad indicada", texto: "El indicador de velocidad (Airspeed Indicator) mide la diferencia entre presión dinámica (captada por el tubo pitot, que enfrenta el viento relativo) y presión estática, traduciéndola en velocidad. El disco tiene arcos de color con significado operacional: blanco (rango de operación de flaps), verde (rango normal de operación), amarillo (precaución, solo en aire calmo), y una línea roja (Vne, velocidad nunca exceder). Es importante distinguir IAS (velocidad indicada, lo que lees), CAS (corregida por errores del instrumento), y TAS (verdadera, ajustada por densidad del aire a tu altitud) — a mayor altitud, tu TAS real es mayor que tu IAS indicada." , imagenes: ["/images/temas/instrumentos-tema2.jpg"]},
      { id: "instrumentos-tema3", titulo: "Horizonte artificial", texto: "El Horizonte Artificial (Attitude Indicator) es tu referencia primaria de actitud: muestra tu inclinación (bank) y cabeceo (pitch) respecto al horizonte real, usando un giroscopio que mantiene su orientación en el espacio independientemente del movimiento del avión. Tradicionalmente accionado por vacío (bomba de vacío) o eléctricamente en aviones más modernos. Es especialmente crítico en vuelo por instrumentos (IMC), donde es tu única referencia confiable de actitud sin visibilidad exterior. Como cualquier giróscopo mecánico, puede sufrir precesión (error gradual acumulado) y requiere revisión periódica contra otros instrumentos para confirmar que sigue siendo confiable." , imagenes: ["/images/temas/instrumentos-tema3.jpg"]},
      { id: "instrumentos-tema4", titulo: "Giro y viraje", texto: "El indicador de Giro y Viraje (Turn and Bank / Turn Needle) muestra tu TASA de giro —qué tan rápido estás virando en grados por segundo— no tu ángulo de inclinación. Un 'viraje estándar' (standard rate turn) es 3 grados por segundo, completando un giro de 360° en exactamente 2 minutos, y es la referencia que se enseña para procedimientos instrumentales. Junto a la aguja de tasa de giro va la bola inclinómetro, que indica si tu viraje está coordinado (bola centrada), derrapando hacia afuera (skidding, bola hacia el lado exterior del viraje) o resbalando hacia adentro (slipping, bola hacia el interior) — información clave para pisar el pedal correcto y corregir." , imagenes: ["/images/temas/instrumentos-tema4.jpg"]},
      { id: "instrumentos-tema5", titulo: "Coordinador de viraje", texto: "El Coordinador de Viraje (Turn Coordinator) es una evolución del indicador de giro y viraje: en vez de una aguja simple, usa un pequeño avión miniatura inclinado que muestra tanto tu velocidad de alabeo (roll rate) como tu tasa de giro combinadas en un solo movimiento. Mantiene la misma bola inclinómetro en la base para verificar coordinación. Es más intuitivo de leer en maniobras dinámicas porque responde más rápido al inicio de un viraje que el indicador de giro tradicional, dándote información antes en la maniobra." , imagenes: ["/images/temas/instrumentos-tema5.jpg"]},
      { id: "instrumentos-tema6", titulo: "VSI", texto: "El VSI (Vertical Speed Indicator, o Variómetro) muestra tu tasa de ascenso o descenso en pies por minuto (fpm), midiendo el cambio en la presión estática a través de un sistema de fuga calibrada. Su característica más importante es el retraso (lag) inherente de 6-9 segundos: no muestra tu tasa vertical instantánea, sino una tendencia con retraso, por lo que no debes usarlo como referencia primaria para maniobras rápidas de cabeceo — el horizonte artificial es más inmediato para eso. El VSI es excelente para mantener tasas constantes de ascenso/descenso durante tramos prolongados, como en una aproximación estabilizada." , imagenes: ["/images/temas/instrumentos-tema6.jpg"]},
      ],
    },
    {
      titulo: "VSI, compás, HSI, RMI, DME y transponder",
      temas: [
      { id: "instrumentos-tema7", titulo: "Compás", texto: "El compás magnético es el instrumento de rumbo más simple y el único que funciona sin electricidad ni vacío, pero sufre errores característicos que debes conocer: Variación (diferencia entre norte magnético y verdadero, varía por ubicación geográfica), Desviación (interferencia de componentes eléctricos/metálicos del propio avión), y errores dinámicos por la inclinación magnética (dip) — el más conocido es ANDS (Accelerate North, Decelerate South en el hemisferio norte): al acelerar volando hacia el norte el compás indica un giro hacia el norte que no existe, y al desacelerar volando hacia el sur ocurre lo opuesto. También oscila y se retrasa durante virajes, por lo que en maniobras se usa el indicador de rumbo giroscópico, recalibrado periódicamente contra el compás en vuelo recto y nivelado." , imagenes: ["/images/temas/instrumentos-tema7.jpg"]},
      { id: "instrumentos-tema8", titulo: "HSI", texto: "Como instrumento físico, el HSI combina un giro direccional (heading gyro) con la información de desviación de curso VOR/ILS en una sola carátula integrada. A diferencia del compás magnético, no sufre de los errores dinámicos de oscilación y ANDS porque su referencia de rumbo es giroscópica, no magnética directa — aunque debe sincronizarse periódicamente con el compás magnético para corregir la deriva natural del giróscopo (precesión). Es uno de los instrumentos de \"seis pack avanzado\" que reemplaza tanto al indicador de rumbo como al CDI tradicional en cabinas más equipadas." , imagenes: ["/images/temas/instrumentos-tema8.jpg"]},
      { id: "instrumentos-tema9", titulo: "RMI", texto: "Como instrumento físico, el RMI combina una carátula de compás giroscópico (igual que el indicador de rumbo) con una o dos agujas indicadoras que apuntan hacia estaciones ADF y/o VOR sintonizadas. La rosa completa gira con tu rumbo real, así que las agujas siempre muestran el rumbo magnético verdadero hacia la estación, no solo un rumbo relativo a tu nariz como el ADF simple. Es apreciado por su capacidad de dar orientación instantánea respecto a dos estaciones simultáneamente, útil para fixes cruzados sin cálculos mentales adicionales." , imagenes: ["/images/temas/navegacion-tema19.jpg"]},
      { id: "instrumentos-tema10", titulo: "DME", texto: "Como instrumento físico, el DME transmite un pulso de interrogación a la estación terrestre y mide el tiempo que tarda en recibir la respuesta, calculando la distancia por la velocidad conocida de la señal de radio. La carátula típica muestra tres datos simultáneos: distancia en millas náuticas, velocidad de acercamiento (groundspeed) calculada por el cambio de distancia en el tiempo, y tiempo estimado a la estación. Es común encontrarlo integrado físicamente con el receptor de NAV/VOR en el mismo panel, ya que ambos suelen sintonizar la misma frecuencia de estación." , imagenes: ["/images/temas/instrumentos-tema10.jpg"]},
      { id: "instrumentos-tema11", titulo: "Transponder", texto: "El Transponder es el equipo que responde automáticamente a las interrogaciones del radar de control de tráfico aéreo, transmitiendo un código de 4 dígitos (squawk) que identifica tu aeronave en la pantalla del controlador, junto con tu altitud si tienes Modo C o Modo S (que además transmite datos adicionales). Existen códigos de squawk universales de emergencia que nunca debes usar salvo la situación correspondiente: 7500 (secuestro/interferencia ilícita), 7600 (falla de comunicaciones), y 7700 (emergencia general). El botón IDENT resalta momentáneamente tu posición en la pantalla del controlador cuando te lo solicitan, útil para que te identifiquen entre tráfico denso." , imagenes: ["/images/temas/instrumentos-tema11.jpg"]},
      ],
    },
  ],
  "rendimiento": [
    {
      titulo: "Peso, balance y distancias de despegue/aterrizaje",
      temas: [
      { id: "rendimiento-tema1", titulo: "Peso y balance", texto: "Todo avión tiene un Peso Máximo de Despegue certificado (Max Gross Weight) que no puedes exceder bajo ninguna circunstancia — hacerlo compromete la estructura, el rendimiento de despegue, la tasa de ascenso, y la velocidad de pérdida real. El cálculo parte del Peso Vacío del avión (Empty Weight, incluye el avión y fluidos operativos), al que sumas tripulación, pasajeros, equipaje y combustible para obtener tu Peso Bruto de la operación (Gross Weight). La diferencia entre el peso máximo certificado y el peso vacío es tu Carga Útil (Useful Load) — lo que realmente puedes cargar entre personas, equipaje y combustible, sin exceder el límite." , imagenes: ["/images/temas/rendimiento-tema1.jpg"]},
      { id: "rendimiento-tema2", titulo: "Centro de gravedad", texto: "El Centro de Gravedad (CG) es el punto donde, teóricamente, se concentra todo el peso del avión — y debe mantenerse dentro de un rango certificado (el 'sobre' o envelope de CG) para que el avión sea controlable y estable. Se calcula mediante Momento = Peso × Brazo (distancia desde un punto de referencia), sumando los momentos de cada elemento (piloto, pasajeros, equipaje, combustible) y dividiendo entre el peso total para obtener la posición del CG. Un CG muy adelantado hace al avión más estable pero pesado de controlar en cabeceo (especialmente en el flare de aterrizaje); un CG muy atrasado lo hace más ágil pero peligrosamente inestable, con riesgo de entrar en pérdida sin previo aviso claro." , imagenes: ["/images/temas/rendimiento-tema2.jpg"]},
      { id: "rendimiento-tema3", titulo: "Distancia de despegue", texto: "La distancia de despegue depende de múltiples factores que debes calcular antes de cada vuelo usando las gráficas de rendimiento del manual (POH/AFM): peso de la aeronave (a mayor peso, mayor distancia), altitud de densidad (a mayor altitud de densidad, motor y alas rinden menos, mayor distancia), viento (viento de frente reduce la distancia, viento de cola la aumenta significativamente), y condición de la pista (pista mojada, con pasto, o con pendiente ascendente aumentan la distancia necesaria). Nunca asumas que 'siempre me ha alcanzado la pista' — cada combinación de peso, densidad y viento es distinta, y calcular mal puede significar no despegar a tiempo con obstáculos al final de la pista." , imagenes: ["/images/temas/rendimiento-tema3.jpg"]},
      { id: "rendimiento-tema4", titulo: "Distancia de aterrizaje", texto: "Similar al despegue, la distancia de aterrizaje se ve afectada por peso (mayor peso = mayor velocidad de aproximación = mayor distancia de frenado), altitud de densidad (afecta la velocidad real de touchdown aunque la indicada sea la misma), viento (de frente reduce distancia, de cola la aumenta drásticamente — un viento de cola de solo 10 nudos puede aumentar la distancia de aterrizaje 20-30%), y superficie de la pista (mojada o con contaminantes reduce la efectividad del frenado). Las gráficas de rendimiento del POH deben consultarse antes de cualquier aterrizaje en pista corta o con condiciones fuera de lo habitual, no solo confiar en la experiencia." , imagenes: ["/images/temas/rendimiento-tema4.jpg"]},
      ],
    },
    {
      titulo: "Performance, V-speeds y viento cruzado",
      temas: [
      { id: "rendimiento-tema5", titulo: "Performance", texto: "Las gráficas de rendimiento (performance charts) en el manual de tu avión son la herramienta central para todos los cálculos anteriores: te permiten entrar con condiciones específicas (peso, temperatura, altitud de presión, viento) y obtener distancias, tasas de ascenso, consumo de combustible o alcance esperado. La habilidad clave es la interpolación — cuando tus condiciones reales caen entre dos líneas o valores impresos en la gráfica, debes estimar proporcionalmente el valor intermedio, no simplemente redondear al valor más cercano. Siempre aplica un margen de seguridad adicional sobre el valor calculado (comúnmente 30-50% extra en distancia de pista), ya que las gráficas se hicieron con aviones nuevos y pilotos de prueba en condiciones ideales." , imagenes: ["/images/temas/rendimiento-tema5.jpg"]},
      { id: "rendimiento-tema6", titulo: "V-speeds", texto: "Las V-speeds son velocidades codificadas críticas para operar tu avión con seguridad: Vs (pérdida en configuración limpia), Vs0 (pérdida en configuración de aterrizaje), Vx (mejor ángulo de ascenso, para despejar obstáculos), Vy (mejor tasa de ascenso, para ganar altura más rápido en tiempo), Va (velocidad de maniobra, máxima para aplicar controles bruscos sin dañar estructura), Vfe (máxima con flaps extendidos), Vno (máxima estructural normal), Vne (nunca exceder), y Vr (rotación, velocidad a la que levantas la nariz en el despegue). Memorizar las V-speeds específicas de TU avión (no solo el concepto general) es examinable y, más importante, es lo que evita que dañes la estructura o entres en pérdida en el momento equivocado." , imagenes: ["/images/temas/rendimiento-tema6.jpg"]},
      { id: "rendimiento-tema7", titulo: "Viento cruzado", texto: "El componente de viento cruzado es la parte del viento que sopla perpendicular a la pista (no alineada con ella), y determina qué tan desafiante será tu despegue o aterrizaje. Se calcula usando el ángulo entre el viento reportado y el rumbo de la pista — cuanto más cerca de 90°, mayor el componente cruzado; cuanto más cerca de 0° (viento alineado con la pista), menor. Cada avión tiene un Viento Cruzado Máximo Demostrado (Max Demonstrated Crosswind) en su manual — no es un límite legal absoluto, pero operar por encima de ese valor está fuera de lo que el fabricante probó y documentó. Las dos técnicas principales para manejarlo son el Crab (apuntar la nariz contra el viento durante la aproximación, alineando justo antes del touchdown) y el Sideslip (bajar el ala hacia el viento con alerón mientras usas el timón opuesto para mantener la nariz alineada con la pista durante todo el aterrizaje)." , imagenes: ["/images/temas/rendimiento-tema7.jpg"]},
      ],
    },
  ],
  "operacion": [
    {
      titulo: "Inspección, arranque, taxi, run-up y despegue",
      temas: [
      { id: "operacion-tema1", titulo: "Inspección pre-vuelo", texto: "La inspección pre-vuelo (walk-around) es tu primera línea de defensa contra fallas mecánicas en el aire, y debe hacerse SIEMPRE de forma sistemática, siguiendo el mismo patrón cada vez (usualmente en sentido de las manecillas del reloj alrededor del avión) para no saltarte ningún punto. Revisas: superficies de control (movimiento libre, sin daño), niveles de fluidos (aceite, combustible visualmente en los tanques), presión y estado de las llantas, estructura general (sin abolladuras, grietas o corrosión visible), luces, antenas, y drenado de agua del sistema de combustible. Nunca te saltes la inspección por 'ya la volé ayer' — las condiciones cambian de un vuelo a otro, incluso de una hora a otra." , imagenes: ["/images/temas/operacion-tema1.jpg"]},
      { id: "operacion-tema2", titulo: "Checklist", texto: "Una checklist no reemplaza tu conocimiento del avión — verifica que aplicaste correctamente ese conocimiento. La técnica recomendada es 'flujo + verificación': primero ejecutas la secuencia de acciones de memoria en un flujo lógico por la cabina, y luego lees la checklist para CONFIRMAR que no omitiste nada, en vez de leer y ejecutar cada línea una por una desde cero. Existen checklists Normales (operación de rutina), Anormales (situaciones fuera de lo común pero no de emergencia inmediata), y de Emergencia (memorizables para los primeros pasos críticos, luego consultadas para el resto). La disciplina de usar checklist en cada vuelo, sin importar tu experiencia, es lo que distingue a un piloto profesional de uno que confía solo en su memoria." , imagenes: ["/images/temas/operacion-tema2.jpg"]},
      { id: "operacion-tema3", titulo: "Arranque del motor", texto: "El arranque de motor sigue una secuencia específica del fabricante, pero generalmente incluye: verificar mezcla y palanca de potencia en posición correcta, cebado (priming) si el motor lo requiere en frío, encendido de la bomba de combustible si aplica, y antes de girar la llave, la llamada de seguridad 'DESPEJADO' (clear prop) en voz alta para alertar a cualquiera cerca de la hélice. Una vez arrancado, monitoreas inmediatamente la presión de aceite — si no sube en los primeros segundos, apagas el motor de inmediato, ya que operar sin lubricación adecuada puede dañar el motor severamente en muy poco tiempo." , imagenes: ["/images/temas/operacion-tema3.jpg"]},
      { id: "operacion-tema4", titulo: "Taxi", texto: "Durante el rodaje controlas la dirección principalmente con los pedales de timón (que mueven la rueda de nariz en la mayoría de entrenadores) y usas potencia mínima necesaria para mantener movimiento, evitando velocidades excesivas. Verifica el funcionamiento de los frenos justo al iniciar el movimiento (un leve toque para confirmar respuesta antes de continuar). Mantén conciencia situacional constante de otro tráfico, vehículos de servicio, y instrucciones de control si estás en un aeropuerto controlado — el rodaje es quizás el momento donde más incursiones de pista y colisiones en tierra ocurren por distracción, así que exige la misma atención que el vuelo mismo." , imagenes: ["/images/temas/operacion-tema4.jpg"]},
      { id: "operacion-tema5", titulo: "Run-up", texto: "El run-up (prueba de motor antes de despegue) se hace generalmente en un punto designado cerca de la cabecera de pista, con el avión orientado contra el viento y frenos aplicados firmemente. Incluye: verificar cada magneto individualmente (la caída de RPM al cambiar de AMBOS a solo uno debe estar dentro del rango del manual, y ninguno debe apagar el motor completamente), probar el calentador de carburador si aplica, revisar instrumentos del motor (temperaturas, presiones dentro de rango normal), y completar la checklist 'antes de despegue' que incluye configuración final de flaps, trim, y repaso mental de qué harás si el motor falla justo después de despegar." , imagenes: ["/images/temas/operacion-tema5.jpg"]},
      { id: "operacion-tema6", titulo: "Despegue", texto: "Durante la carrera de despegue, mantienes la dirección con los pedales de timón mientras aplicas potencia completa suavemente pero sin demora, monitoreando los instrumentos del motor en los primeros segundos para confirmar parámetros normales — si algo se ve mal, todavía tienes pista para abortar. Al alcanzar la velocidad de rotación (Vr) específica de tu avión, aplicas presión suave hacia atrás en los controles para levantar la nariz y comenzar el ascenso inicial. Después del despegue, sigues el procedimiento de 'limpieza' de configuración: retraer flaps si los usaste (a la altura/velocidad segura indicada en tu POH) y, si tu avión tiene tren retráctil, retraerlo en el momento apropiado según el manual." , imagenes: ["/images/temas/operacion-tema6.jpg"]},
      ],
    },
    {
      titulo: "Ascenso, crucero, descenso, aproximación y aterrizaje",
      temas: [
      { id: "operacion-tema7", titulo: "Ascenso", texto: "Durante el ascenso eliges entre Vx (mejor ángulo, para despejar obstáculos cercanos rápidamente en altura por distancia recorrida) o Vy (mejor tasa, para ganar altitud más rápido en tiempo, una vez pasados los obstáculos inmediatos) según la situación. Monitoreas temperaturas del motor con más atención que en crucero, ya que el ascenso prolongado con potencia alta y velocidad relativamente baja genera menos flujo de aire de enfriamiento. En motores con mezcla ajustable, muchos POH recomiendan empobrecer ligeramente la mezcla por encima de cierta altitud para mantener la combustión eficiente, aunque en ascensos cortos a baja altitud generalmente se mantiene mezcla rica." , imagenes: ["/images/temas/operacion-tema7.jpg"]},
      { id: "operacion-tema8", titulo: "Crucero", texto: "Al nivelar en tu altitud de crucero, reduces potencia gradualmente al ajuste recomendado por el POH para esa configuración, y ajustas la mezcla de combustible (leaning) para optimizar consumo y rendimiento del motor a esa altitud específica — volar en crucero con mezcla completamente rica innecesariamente desperdicia combustible y puede ensuciar bujías. Este es también el momento de menor carga de trabajo relativo para tareas de navegación: confirmar tu posición contra el plan de vuelo, ajustar el rumbo por deriva de viento, y hacer tus reportes de posición si aplica, sin descuidar el escaneo visual constante de tráfico." , imagenes: ["/images/temas/operacion-tema8.jpg"]},
      { id: "operacion-tema9", titulo: "Descenso", texto: "Planear el punto de inicio de descenso con anticipación evita tener que descender abruptamente cerca del destino. Una regla práctica común: multiplica la altitud a perder (en miles de pies) por 3, y ese es aproximadamente cuántas millas antes del punto deseado debes iniciar el descenso a una tasa razonable (~500 fpm). Antes de descender, reduces potencia gradualmente, y muchos pilotos aprovechan este momento para reajustar la mezcla hacia más rica conforme bajan de altitud, revisar el altímetro contra el reporte meteorológico actual de destino, y repasar mentalmente la configuración esperada de aproximación y aterrizaje." , imagenes: ["/images/temas/operacion-tema9.jpg"]},
      { id: "operacion-tema10", titulo: "Aproximación", texto: "Al entrar al circuito de tráfico de tu destino, configuras progresivamente el avión: reduces potencia, extiendes flaps en las etapas y velocidades indicadas por tu POH, y estableces una aproximación estabilizada — mantenida en la velocidad correcta, con la tasa de descenso adecuada, alineado con la pista, configurado completamente, antes de cruzar el umbral. Una aproximación inestable (muy rápida, muy alta, mal alineada, o con configuración incompleta) es la señal más clara para ejecutar un go-around (motor y al aire) en vez de forzar el aterrizaje — decisión que siempre debe tomarse sin dudar ni sentir vergüenza." , imagenes: ["/images/temas/operacion-tema10.jpg"]},
      { id: "operacion-tema11", titulo: "Aterrizaje", texto: "El aterrizaje culmina con el flare (redondeo): reduces la tasa de descenso justo antes de tocar tierra, elevando gradualmente la nariz para que las llantas principales toquen primero suavemente, cerca de tu velocidad de pérdida en configuración de aterrizaje (Vs0). Mantén los controles activos durante todo el rodaje después de tocar tierra, especialmente en viento cruzado, hasta detenerte completamente o reducir a velocidad de rodaje segura. Si en cualquier momento del flare o aterrizaje algo no se siente correcto —velocidad excesiva, deriva lateral no corregida, bote (bounce)— la decisión correcta sigue siendo el go-around, incluso a pocos pies del suelo." , imagenes: ["/images/temas/operacion-tema11.jpg"]},
      { id: "operacion-tema12", titulo: "Después del aterrizaje", texto: "Una vez fuera de la pista activa (cruzando completamente la línea de espera), ejecutas la checklist 'después de aterrizaje': usualmente retraer flaps, apagar luces de aterrizaje si aplica, y ajustar la mezcla según el rodaje hacia la plataforma. Al llegar a tu posición de estacionamiento, sigues el procedimiento de apagado del motor (mezcla a corte, magnetos apagados, verificación de que todo quede en posición segura), y completas la inspección post-vuelo: anotar cualquier anomalía observada durante el vuelo, asegurar el avión (calzos, amarres si aplica), y dejar la bitácora actualizada para el siguiente piloto o para mantenimiento." , imagenes: ["/images/temas/operacion-tema12.jpg"]},
      ],
    },
  ],
  "espacios-aereos": [
    {
      titulo: "Espacio aéreo controlado: Clases A a E",
      temas: [
      { id: "espacios-aereos-tema1", titulo: "Clase A", texto: "El espacio aéreo Clase A abarca desde FL180 (18,000 pies de altitud de presión) hasta FL600, y es exclusivamente para operaciones IFR — no se permite vuelo VFR bajo ninguna circunstancia. Todo avión que opera aquí debe estar bajo un plan de vuelo IFR activo con autorización de control, equipado apropiadamente (transponder Modo C/S, comunicación bidireccional), y siguiendo instrucciones continuas de ATC. Para un piloto VFR, la Clase A es simplemente un techo absoluto: no puedes volar por encima de FL180 sin ser IFR, punto." , imagenes: ["/images/temas/espacios-aereos-tema1.jpg"]},
      { id: "espacios-aereos-tema2", titulo: "Clase B", texto: "La Clase B rodea los aeropuertos con mayor densidad de tráfico, con forma característica de 'pastel de bodas invertido' (círculos concéntricos que se ensanchan con la altitud). Requiere autorización EXPLÍCITA de control antes de entrar — un simple contacto por radio no es suficiente, debes escuchar literalmente 'autorizado a entrar en espacio Clase B' o instrucción equivalente. Se representa en cartas con líneas sólidas azules gruesas. El equipo mínimo requerido incluye transponder con Modo C (reporte de altitud) y radio bidireccional operativo. Es el espacio aéreo más restrictivo después de la Clase A para operación VFR." , imagenes: ["/images/temas/espacios-aereos-tema2.jpg"]},
      { id: "espacios-aereos-tema3", titulo: "Clase C", texto: "La Clase C rodea aeropuertos de tráfico moderado-alto, típicamente con un núcleo de 5 millas náuticas de radio y una 'repisa' (shelf) exterior más amplia a mayor altitud. A diferencia de la Clase B, aquí NO necesitas autorización explícita — basta con establecer contacto bidireccional con control (escuchar tu matrícula de vuelta confirma que te tienen identificado) antes de entrar. Se marca en cartas con círculos sólidos magenta. También requiere transponder Modo C y radio operativo, igual que Clase B." , imagenes: ["/images/temas/espacios-aereos-tema3.jpg"]},
      { id: "espacios-aereos-tema4", titulo: "Clase D", texto: "La Clase D rodea aeropuertos con torre de control activa pero de menor tráfico que Clase B/C, generalmente con un radio de 4 millas náuticas hasta 2,500 pies sobre el nivel del aeropuerto. Igual que Clase C, requiere establecer contacto bidireccional con la torre antes de entrar, pero generalmente no exige transponder Modo C obligatorio (depende de la regulación local). Se representa con líneas discontinuas (punteadas) azules en la carta. Fuera del horario de operación de la torre, el espacio Clase D típicamente revierte a Clase E o G según lo indicado en la carta." , imagenes: ["/images/temas/espacios-aereos-tema4.jpg"]},
      { id: "espacios-aereos-tema5", titulo: "Clase E", texto: "La Clase E es espacio aéreo controlado que no encaja en las categorías A-D — puede comenzar en superficie, a 700 pies AGL, o a 1,200 pies AGL dependiendo de la ubicación específica, indicado en la carta con sombreado degradado magenta (inicio a 700 ft) o líneas discontinuas azules (inicio a 1,200 ft). No requiere contacto por radio obligatorio para VFR en la mayoría de los casos, pero sí aplican requisitos de visibilidad y separación de nubes más estrictos que en Clase G. Es el tipo de espacio aéreo controlado más común y extenso en términos de área total cubierta." , imagenes: ["/images/temas/espacios-aereos-tema5.jpg"]},
      ],
    },
    {
      titulo: "Espacio aéreo Clase G y áreas especiales",
      temas: [
      { id: "espacios-aereos-tema6", titulo: "Clase G", texto: "La Clase G es espacio aéreo NO controlado — no hay ATC gestionando el tráfico, no se requiere contacto por radio ni autorización de ningún tipo. Generalmente existe a baja altitud en zonas rurales o alejadas de aeropuertos grandes, por debajo del inicio de la Clase E correspondiente. Aunque no hay control activo, sí aplican mínimos de visibilidad y separación de nubes VFR (aunque más permisivos que en espacio controlado), y sigue siendo tu responsabilidad total mantener separación visual con otro tráfico — 've y evita' es la única regla de separación disponible aquí." , imagenes: ["/images/temas/espacios-aereos-tema6.jpg"]},
      { id: "espacios-aereos-tema7", titulo: "Áreas restringidas", texto: "Las Áreas Restringidas (designadas con prefijo R- seguido de un número, ej. R-401) contienen actividades potencialmente peligrosas para aeronaves no participantes — típicamente entrenamiento militar, tiro con artillería, o actividades similares. No están prohibidas de forma absoluta, pero requieren autorización específica del organismo que las controla para poder cruzarlas, y solo están 'activas' en horarios publicados (fuera de esos horarios, generalmente pueden cruzarse libremente, aunque siempre debes verificar NOTAMs antes de asumir esto). Volar sin autorización dentro de una restringida activa puede exponerte a riesgo físico real, no solo una infracción regulatoria." , imagenes: ["/images/temas/espacios-aereos-tema7.jpg"]},
      { id: "espacios-aereos-tema8", titulo: "Áreas prohibidas", texto: "Las Áreas Prohibidas (designadas con prefijo P- seguido de un número) son zonas donde el vuelo está terminantemente prohibido para cualquier aeronave, sin excepción ni proceso de autorización disponible para vuelo civil — generalmente rodean instalaciones de seguridad nacional, residencias presidenciales, u otras instalaciones sensibles. A diferencia de las restringidas, aquí no hay 'horario activo': la prohibición es permanente y absoluta. Volar dentro de una prohibida sin autorización especial expone al piloto a consecuencias legales severas, además de posible interceptación militar." , imagenes: ["/images/temas/espacios-aereos-tema8.jpg"]},
      { id: "espacios-aereos-tema9", titulo: "Áreas peligrosas", texto: "Las Áreas de Peligro o Advertencia (Warning Areas, frecuentemente sobre agua/costa) señalan actividades que podrían ser peligrosas para aeronaves no participantes —ejercicios militares, actividad de misiles, tráfico intenso de otro tipo— pero, a diferencia de las restringidas, NO son legalmente restrictivas: puedes volar a través de ellas, pero bajo tu propio riesgo y con plena conciencia de que hay actividad potencialmente peligrosa ocurriendo. La recomendación operacional es evitarlas cuando estén activas, verificando NOTAMs, aunque legalmente no necesites autorización para cruzarlas." , imagenes: ["/images/temas/espacios-aereos-tema9.jpg"]},
      { id: "espacios-aereos-tema10", titulo: "Cómo afectan a un vuelo VFR", texto: "Al planear cualquier ruta VFR, el espacio aéreo determina: qué comunicaciones necesitas establecer y cuándo (Clase B requiere autorización antes de entrar; C y D requieren contacto establecido; E y G generalmente no requieren nada, aunque siempre es buena práctica), qué equipo debe llevar tu avión (transponder Modo C obligatorio en B/C y generalmente por encima de ciertas altitudes incluso en E), y qué mínimos de visibilidad/separación de nubes debes respetar (más estrictos en espacio controlado). Ignorar estos requisitos no solo es una infracción — en Clase B específicamente, entrar sin autorización puede resultar en una llamada de atención inmediata de control, suspensión de licencia, o en el peor caso, una situación de tráfico genuinamente peligrosa por falta de coordinación." , imagenes: ["/images/temas/espacios-aereos-tema10.jpg"]},
      ],
    },
  ],
  "reglamentacion": [
    {
      titulo: "Reglas VFR/IFR, licencias y horas de vuelo",
      temas: [
      { id: "reglamentacion-tema1", titulo: "Reglas VFR", texto: "El vuelo VFR (Visual Flight Rules) exige que el piloto mantenga referencia visual constante con el horizonte y el terreno para navegar y evitar tráfico y obstáculos — es la base regulatoria de todo vuelo bajo condiciones meteorológicas visuales (VMC). Incluye reglas de prioridad de paso (right-of-way): un avión que se aproxima de frente cede ambos a la derecha, quien va más lento tiene prioridad sobre quien alcanza por detrás, y las aeronaves menos maniobrables (globos, planeadores, dirigibles) tienen prioridad sobre las motorizadas. También exige respetar los mínimos de visibilidad y separación de nubes correspondientes a cada clase de espacio aéreo que cruces, y llevar a bordo la documentación requerida del avión y del piloto." , imagenes: ["/images/temas/reglamentacion-tema1.jpg"]},
      { id: "reglamentacion-tema2", titulo: "Reglas IFR", texto: "El vuelo IFR (Instrument Flight Rules) permite operar sin referencia visual externa, navegando exclusivamente por instrumentos y siguiendo instrucciones continuas de control de tránsito aéreo. Requiere presentar y recibir autorización de un plan de vuelo antes de salir, equipo específico a bordo (instrumentos de vuelo redundantes, navegación certificada), y seguir exactamente la ruta y altitud autorizadas — cualquier desviación necesita solicitar y recibir una nueva autorización, salvo emergencia. El piloto IFR también debe mantener su competencia (currency) mediante un mínimo de aproximaciones y procedimientos practicados en un período reciente, cuyo detalle exacto debes verificar contra la normativa vigente de tu autoridad aeronáutica." , imagenes: ["/images/temas/reglamentacion-tema2.jpg"]},
      { id: "reglamentacion-tema3", titulo: "Licencias", texto: "La progresión típica de licencias/certificados de piloto es: Alumno Piloto (Student Pilot, para entrenamiento con instructor), Piloto Privado (PPL, permite volar sin remuneración, con pasajeros, VFR), Piloto Comercial (CPL, permite volar por remuneración, generalmente requiere también la calificación de instrumentos para operar comercialmente en la práctica), y Piloto de Transporte de Línea Aérea (ATP, el nivel más alto, requerido para operar como comandante en aerolíneas). A esto se suman calificaciones adicionales (ratings) como Instrumentos, Multimotor, e Instructor de Vuelo. En México, la autoridad emisora es la AFAC (Agencia Federal de Aviación Civil), bajo el marco del RAC 61 — consulta siempre la versión vigente para los requisitos exactos actuales." , imagenes: ["/images/temas/reglamentacion-tema3.jpg"]},
      { id: "reglamentacion-tema4", titulo: "Horas de vuelo", texto: "Los requisitos mínimos de horas de vuelo varían según la autoridad aeronáutica de cada país, aunque suelen seguir referencias similares basadas en estándares OACI: como orden de magnitud ampliamente enseñado internacionalmente, un PPL típicamente requiere alrededor de 40 horas totales de vuelo (con mínimos específicos de instrucción dual y solo), y un CPL requiere considerablemente más, generalmente en el rango de 150-250 horas totales dependiendo del país y la vía de entrenamiento. Estos números son solo una referencia general — para tu examen y tu bitácora oficial, siempre debes confirmar las cifras exactas vigentes en el RAC 61 de la AFAC en México, ya que la regulación puede actualizarse." , imagenes: ["/images/temas/reglamentacion-tema4.jpg"]},
      ],
    },
    {
      titulo: "Requisitos, mínimos meteorológicos y combustible de reserva",
      temas: [
      { id: "reglamentacion-tema5", titulo: "Requisitos", texto: "Más allá de las horas de vuelo, obtener una licencia requiere: un Certificado Médico Aeronáutico vigente (de la clase correspondiente a la licencia que buscas), cumplir la edad mínima establecida por tu autoridad (generalmente 17 años para PPL, 18 para CPL como referencia común, aunque verifica el valor exacto vigente), aprobar un examen de conocimientos teóricos, y aprobar un examen práctico de vuelo (checkride) con un examinador designado. Para operaciones internacionales o radiocomunicación en inglés, también se exige demostrar un nivel de competencia en idioma inglés según la escala OACI, revalidado periódicamente." , imagenes: ["/images/temas/reglamentacion-tema5.jpg"]},
      { id: "reglamentacion-tema6", titulo: "Mínimos meteorológicos", texto: "Cada clase de espacio aéreo tiene mínimos específicos de visibilidad y distancia de separación respecto a las nubes para poder volar VFR legalmente — en general, el espacio aéreo controlado exige mínimos más estrictos (mayor visibilidad, mayor separación vertical/horizontal de nubes) que el espacio no controlado, y estos mínimos suelen ser aún más exigentes por encima de ciertas altitudes. Para vuelo IFR, cada aeropuerto de destino y alterno tiene mínimos meteorológicos publicados en sus cartas de aproximación (techo y visibilidad mínimos requeridos para intentar la aproximación) — si el pronóstico no alcanza esos mínimos, la regulación exige planificar un alterno adecuado. Consulta siempre la tabla oficial de mínimos VFR/IFR vigente de tu autoridad para los valores exactos por clase de espacio aéreo." , imagenes: ["/images/temas/reglamentacion-tema6.jpg"]},
      { id: "reglamentacion-tema7", titulo: "Combustible de reserva", texto: "La regulación exige llevar combustible suficiente no solo para completar el vuelo planeado, sino con una reserva adicional obligatoria por si surge un desvío, espera, o condición imprevista. Como referencia ampliamente usada en el estándar internacional: para vuelo VFR diurno se exige comúnmente una reserva mínima de 30 minutos de vuelo a velocidad de crucero normal más allá de tu destino planeado; para VFR nocturno o vuelo IFR, la reserva mínima común aumenta a 45 minutos. Estos números son la referencia general enseñada internacionalmente — confirma el valor exacto vigente en la normativa de tu autoridad antes de aplicarlo como regla absoluta en tu planificación real, ya que estos mínimos pueden variar y son de cumplimiento obligatorio, nunca opcional." , imagenes: ["/images/temas/reglamentacion-tema7.jpg"]},
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
  return lecciones?.flatMap((l) => l.temas);
}

// ---------- Términos (para el widget de relacionar) ----------

export const MODULE_TERMS: Record<string, TermPair[]> = {
  meteorologia: [
    { id: "met-1", term: "METAR", definition: "Reporte de las condiciones meteorológicas actuales de un aeródromo, emitido cada hora." },
    { id: "met-2", term: "TAF", definition: "Pronóstico del tiempo esperado en un aeropuerto, válido por 24 a 30 horas." },
    { id: "met-3", term: "BKN", definition: "Cobertura de nubes fragmentada, entre 5 y 7 octavos del cielo cubiertos." },
    { id: "met-4", term: "Frente frío", definition: "Aire frío que avanza y genera clima violento pero de corta duración." },
    { id: "met-5", term: "Turbulencia de estela", definition: "Generada por los vórtices de las puntas de ala de aviones grandes." },
    { id: "met-6", term: "Wind shear", definition: "Cambio brusco de dirección o velocidad del viento en una distancia corta." },
    { id: "met-7", term: "Altitud de densidad", definition: "Altitud a la que el avión 'siente' que vuela, ajustada por temperatura, presión y humedad." },
  ],
  navegacion: [
    { id: "nav-1", term: "VOR", definition: "Radioayuda terrestre que indica en qué radial te encuentras respecto a la estación." },
    { id: "nav-2", term: "Radial", definition: "Línea recta imaginaria medida DESDE el VOR hacia afuera, según su rumbo magnético." },
    { id: "nav-3", term: "CDI", definition: "Aguja que muestra qué tan lejos estás del curso seleccionado en el OBS." },
    { id: "nav-4", term: "OBS", definition: "Perilla que giras para seleccionar el curso o radial que quieres volar." },
    { id: "nav-5", term: "Tracking", definition: "Mantener el avión sobre el curso deseado corrigiendo constantemente por el viento." },
    { id: "nav-6", term: "DME", definition: "Mide la distancia real en línea recta entre el avión y la estación, en millas náuticas." },
    { id: "nav-7", term: "HSI", definition: "Combina el indicador de rumbo con la desviación de curso VOR/ILS en un solo instrumento." },
    { id: "nav-8", term: "Cross-fix", definition: "Cruzar dos radiales de distintos VOR para confirmar tu posición exacta." },
  ],
  cartografia: [
    { id: "cart-1", term: "Carta VFR (Sectional)", definition: "Carta a escala 1:500,000 usada para vuelo visual, con terreno, obstáculos y espacio aéreo." },
    { id: "cart-2", term: "Aeropuerto controlado", definition: "Se representa en la carta con un círculo azul relleno." },
    { id: "cart-3", term: "Espacio Clase B", definition: "Círculos concéntricos sólidos azules; requiere autorización explícita para entrar." },
    { id: "cart-4", term: "Obstáculo '1500 (450)'", definition: "1,500 pies MSL de altura total, de los cuales 450 pies son la estructura sobre el terreno." },
  ],
  "cartografia-2": [
    { id: "cart2-1", term: "MEF", definition: "Altitud más alta de seguridad dentro de un cuadrante de la carta." },
    { id: "cart2-2", term: "CTAF", definition: "Frecuencia común de tráfico en aeropuertos no controlados." },
    { id: "cart2-3", term: "Punto VFR", definition: "Ubicación visual marcada en la carta para reportar tu posición de forma estandarizada." },
    { id: "cart2-4", term: "Trazar la ruta", definition: "Buen hábito de marcar checkpoints, rumbo, distancia y tiempo ANTES del vuelo." },
  ],
  comunicaciones: [
    { id: "com-1", term: "Wilco", definition: "Significa 'voy a cumplir la instrucción recibida'." },
    { id: "com-2", term: "Roger", definition: "Significa 'recibido, entendido', sin implicar que cumplirás la instrucción." },
    { id: "com-3", term: "Readback obligatorio", definition: "Se exige siempre para instrucciones de 'mantener corto' de una pista." },
    { id: "com-4", term: "PAN-PAN", definition: "Llamada de urgencia (repetida 3 veces) sin peligro inmediato de vida." },
    { id: "com-5", term: "MAYDAY", definition: "Llamada de emergencia grave e inminente, repetida 3 veces." },
    { id: "com-6", term: "CTAF", definition: "Frecuencia para reportarte en aeropuertos no controlados, sin respuesta de control." },
    { id: "com-7", term: "Stepping on", definition: "Bloquear la frecuencia al transmitir al mismo tiempo que otra estación." },
  ],
  instrumentos: [
    { id: "ins-1", term: "Kollsman", definition: "Ventana del altímetro donde ajustas manualmente la presión de referencia." },
    { id: "ins-2", term: "Vne", definition: "Línea roja en el velocímetro: velocidad que nunca debe excederse." },
    { id: "ins-3", term: "Horizonte artificial", definition: "Instrumento primario de actitud, accionado por vacío o eléctricamente." },
    { id: "ins-4", term: "Viraje estándar", definition: "Tasa de giro de 3° por segundo; completa 360° en 2 minutos." },
    { id: "ins-5", term: "VSI", definition: "Muestra la tasa de ascenso o descenso, con un retraso de 6-9 segundos." },
    { id: "ins-6", term: "ANDS", definition: "Error del compás magnético al acelerar/desacelerar en rumbos norte-sur." },
    { id: "ins-7", term: "Squawk 7700", definition: "Código de transponder para emergencia general." },
  ],
  rendimiento: [
    { id: "ren-1", term: "Carga útil", definition: "Diferencia entre el peso máximo certificado y el peso vacío del avión." },
    { id: "ren-2", term: "Centro de gravedad", definition: "Punto donde se concentra el peso; debe mantenerse dentro de un rango certificado." },
    { id: "ren-3", term: "Vx", definition: "Mejor ángulo de ascenso, usada para despejar obstáculos." },
    { id: "ren-4", term: "Vy", definition: "Mejor tasa de ascenso, para ganar altitud más rápido en el tiempo." },
    { id: "ren-5", term: "Va", definition: "Velocidad de maniobra: máxima para aplicar controles bruscos sin dañar la estructura." },
    { id: "ren-6", term: "Interpolación", definition: "Estimar proporcionalmente un valor entre dos líneas de una gráfica de rendimiento." },
    { id: "ren-7", term: "Crosswind máx. demostrado", definition: "Valor máximo probado por el fabricante, no un límite legal absoluto." },
  ],
  operacion: [
    { id: "op-1", term: "Walk-around", definition: "Inspección pre-vuelo sistemática siguiendo siempre el mismo patrón." },
    { id: "op-2", term: "Flujo + verificación", definition: "Ejecutar acciones de memoria y luego confirmar con la checklist." },
    { id: "op-3", term: "Clear prop", definition: "Llamada de seguridad antes de arrancar el motor." },
    { id: "op-4", term: "Run-up", definition: "Prueba de motor antes de despegue, incluyendo verificación de cada magneto." },
    { id: "op-5", term: "Aproximación estabilizada", definition: "Velocidad, tasa de descenso y alineación correctas antes de cruzar el umbral." },
    { id: "op-6", term: "Go-around", definition: "Abortar el aterrizaje y volver a intentarlo; nunca debe dudarse." },
    { id: "op-7", term: "Flare", definition: "Redondeo final donde se reduce la tasa de descenso justo antes de tocar tierra." },
  ],
  "espacios-aereos": [
    { id: "esp-1", term: "Clase A", definition: "Desde FL180 hasta FL600, exclusivamente IFR." },
    { id: "esp-2", term: "Clase B", definition: "Requiere autorización EXPLÍCITA de control antes de entrar." },
    { id: "esp-3", term: "Clase C", definition: "Requiere solo contacto bidireccional establecido, sin autorización explícita." },
    { id: "esp-4", term: "Clase G", definition: "Espacio no controlado; 've y evita' es la única regla de separación." },
    { id: "esp-5", term: "Área restringida (R-)", definition: "Actividad peligrosa que requiere autorización, activa solo en horarios publicados." },
    { id: "esp-6", term: "Área prohibida (P-)", definition: "Vuelo terminantemente prohibido para civiles, sin excepción." },
  ],
  reglamentacion: [
    { id: "reg-1", term: "VFR", definition: "Exige referencia visual constante con el horizonte y el terreno." },
    { id: "reg-2", term: "IFR", definition: "Permite volar sin referencia visual, siguiendo instrucciones continuas de ATC." },
    { id: "reg-3", term: "PPL", definition: "Piloto Privado: permite volar sin remuneración, con pasajeros, VFR." },
    { id: "reg-4", term: "AFAC", definition: "Autoridad que emite licencias de piloto en México, bajo el RAC 61." },
  ],
  "reglamentacion-2": [
    { id: "reg2-1", term: "Checkride", definition: "Examen práctico de vuelo con un examinador designado." },
    { id: "reg2-2", term: "Reserva VFR diurna", definition: "Referencia mínima ampliamente enseñada: 30 minutos más allá del destino." },
    { id: "reg2-3", term: "Certificado médico", definition: "Documento vigente requerido según la clase de licencia buscada." },
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
    { id: "met2-1", term: "SKC / CLR", definition: "Cielo despejado, sin nubes reportadas." },
    { id: "met2-2", term: "Punto de rocío", definition: "Temperatura a la que el aire se satura de humedad; cuanto más cerca de la temperatura del aire, mayor probabilidad de niebla o nubes bajas." },
    { id: "met2-3", term: "Engelamiento (Icing)", definition: "Formación de hielo en las superficies del avión al volar en nubes con gotas de agua subenfriada." },
    { id: "met2-4", term: "Visibilidad", definition: "Distancia horizontal máxima a la que se pueden ver e identificar objetos." },
    { id: "met2-5", term: "QNH", definition: "Ajuste de presión del altímetro referido al nivel del mar." },
    { id: "met2-6", term: "Inversión térmica", definition: "Capa de la atmósfera donde la temperatura aumenta con la altitud, en vez de disminuir." },
    { id: "met2-7", term: "Virga", definition: "Precipitación visible que se evapora antes de llegar al suelo." },
  ],
  "navegacion-2": [
    { id: "nav2-1", term: "TO/FROM", definition: "Bandera del CDI que indica si, volando el curso seleccionado, te acercas o te alejas de la estación." },
    { id: "nav2-2", term: "Rumbo magnético", definition: "Dirección de la nariz del avión corregida por la variación magnética local." },
    { id: "nav2-3", term: "Deriva (Wind drift)", definition: "Desviación de tu trayectoria real respecto al rumbo que vuelas, causada por el viento." },
    { id: "nav2-4", term: "Triángulo de navegación", definition: "Relación entre rumbo, viento y trayectoria real sobre el terreno." },
    { id: "nav2-5", term: "ADF", definition: "Instrumento que apunta directamente hacia una estación NDB." },
    { id: "nav2-6", term: "Homing", definition: "Volar directo hacia una estación NDB sin corregir el viento; produce una trayectoria curva." },
    { id: "nav2-7", term: "Paso sobre la estación", definition: "Momento en que el avión sobrevuela justo el VOR, cuando la bandera cambia de TO a FROM." },
  ],
  "cartografia-3": [
    { id: "cart3-1", term: "Curvas de nivel", definition: "Líneas que conectan puntos de igual elevación del terreno." },
    { id: "cart3-2", term: "Aeropuerto no controlado", definition: "Se representa con un círculo magenta sin relleno, sin torre de control." },
    { id: "cart3-3", term: "Espacio Clase D", definition: "Círculo azul discontinuo; requiere contacto bidireccional con la torre antes de entrar." },
    { id: "cart3-4", term: "Altura de un obstáculo", definition: "El primer número de la etiqueta indica la altura MSL; el número entre paréntesis, la altura AGL." },
    { id: "cart3-5", term: "MOA", definition: "Zona de operación militar donde pueden operar aeronaves a alta velocidad; se recomienda extremar precaución." },
    { id: "cart3-6", term: "Vía aérea Víctor", definition: "Ruta de navegación de baja altitud definida entre estaciones VOR." },
    { id: "cart3-7", term: "Declinación magnética", definition: "Diferencia entre el norte verdadero y el norte magnético, marcada en la carta con líneas discontinuas." },
  ],
  "comunicaciones-2": [
    { id: "com2-1", term: "Fraseología estándar", definition: "Vocabulario y formato fijo usado en radio para evitar ambigüedad." },
    { id: "com2-2", term: "Say again", definition: "Solicitud para que la otra estación repita su último mensaje." },
    { id: "com2-3", term: "Standby", definition: "Espera; la estación necesita un momento antes de responder." },
    { id: "com2-4", term: "Negative", definition: "Significa 'no' o 'permiso no otorgado'; nunca se usa un simple 'no'." },
    { id: "com2-5", term: "Affirm", definition: "Significa 'sí'; se usa en vez de un simple 'sí' para evitar confusión con otras palabras." },
    { id: "com2-6", term: "Traffic in sight", definition: "Confirmación de que has visto visualmente el tráfico que te reportó el controlador." },
    { id: "com2-7", term: "Frequency change approved", definition: "Autorización del controlador para cambiar de frecuencia." },
  ],
  "instrumentos-2": [
    { id: "ins2-1", term: "Bomba de vacío", definition: "Sistema que energiza el horizonte artificial y el indicador de rumbo en muchos aviones." },
    { id: "ins2-2", term: "Tubo pitot", definition: "Mide la presión dinámica del aire para calcular la velocidad indicada." },
    { id: "ins2-3", term: "Toma estática", definition: "Mide la presión atmosférica ambiente, usada por altímetro, VSI y velocímetro." },
    { id: "ins2-4", term: "Bloqueo del pitot", definition: "Falla que hace que el velocímetro se comporte como un altímetro, con lecturas erróneas al cambiar de altitud." },
    { id: "ins2-5", term: "Giroscopio", definition: "Instrumento que mantiene su orientación en el espacio, base del horizonte artificial e indicador de rumbo." },
    { id: "ins2-6", term: "Precesión", definition: "Error del horizonte artificial durante virajes o aceleraciones prolongadas; se autocorrige en vuelo nivelado." },
    { id: "ins2-7", term: "Sistema pitot-estático", definition: "Conjunto de instrumentos (velocímetro, altímetro, VSI) que dependen de la presión del aire." },
  ],
  "rendimiento-2": [
    { id: "ren2-1", term: "Peso vacío", definition: "Peso del avión sin combustible, aceite utilizable, tripulación ni carga." },
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
    { id: "op2-4", term: "Hold short", definition: "Línea que no se puede cruzar sin autorización explícita de control." },
    { id: "op2-5", term: "Despegue rechazado", definition: "Decisión de abortar el despegue antes de alcanzar una velocidad de decisión predefinida." },
    { id: "op2-6", term: "Aproximación frustrada", definition: "Procedimiento para abandonar una aproximación que no se completó de forma segura." },
    { id: "op2-7", term: "Bitácora de vuelo", definition: "Registro oficial de horas y experiencia de vuelo del piloto." },
  ],
  "espacios-aereos-2": [
    { id: "esp2-1", term: "Clase E", definition: "Espacio controlado que no es A, B, C o D; comienza a menudo a 700 o 1,200 ft AGL." },
    { id: "esp2-2", term: "ADIZ", definition: "Zona donde se exige identificación de la aeronave por razones de defensa antes de entrar." },
    { id: "esp2-3", term: "TFR", definition: "Restricción temporal de vuelo, común en emergencias, eventos o visitas oficiales." },
    { id: "esp2-4", term: "Corredor VFR", definition: "Ruta definida que permite cruzar espacio controlado sin autorización, siguiendo procedimientos específicos." },
    { id: "esp2-5", term: "Techo de un espacio aéreo", definition: "Altitud superior hasta la cual aplica la clasificación de ese espacio." },
    { id: "esp2-6", term: "Transición VFR", definition: "Procedimiento para cruzar espacio Clase B/C sin aterrizar, bajo instrucciones de control." },
    { id: "esp2-7", term: "NOTAM de espacio aéreo", definition: "Aviso temporal que puede modificar o restringir un espacio aéreo normalmente disponible." },
  ],
  "reglamentacion-3": [
    { id: "reg3-1", term: "Currency", definition: "Vigencia reciente de experiencia (despegues/aterrizajes, IFR) requerida para ciertos privilegios." },
    { id: "reg3-2", term: "BFR", definition: "Revisión de vuelo bienal con instructor, requerida cada 24 meses para mantener vigentes los privilegios." },
    { id: "reg3-3", term: "Endoso", definition: "Autorización escrita de un instructor para una operación o calificación específica." },
    { id: "reg3-4", term: "ATP", definition: "Piloto de Transporte de Línea Aérea: el nivel más alto de licencia, requerido para ser comandante en aerolíneas." },
    { id: "reg3-5", term: "Rating", definition: "Calificación adicional a la licencia, como instrumentos, multimotor o instructor de vuelo." },
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
    { id: "aer-5", term: "Adverse yaw", definition: "Guiñada hacia el lado contrario al viraje, producida por el desbalance de resistencia entre alerones." },
    { id: "aer-6", term: "Trim", definition: "Ajuste del punto de equilibrio del elevador que reduce la fatiga del piloto." },
    { id: "aer-7", term: "Efecto suelo", definition: "Reducción de la resistencia inducida al volar muy cerca del suelo." },
  ],
  vfr: [
    { id: "vfrt-1", term: "Special VFR", definition: "Autorización del ATC para operar en espacio controlado por debajo de los mínimos VFR normales." },
    { id: "vfrt-2", term: "CTAF", definition: "Frecuencia común usada por los pilotos para coordinarse en un aeródromo no controlado." },
    { id: "vfrt-3", term: "Entrada a 45°", definition: "Entrada estándar recomendada hacia el tramo de viento en cola de un patrón de tráfico." },
    { id: "vfrt-4", term: "Viento en cola (Downwind)", definition: "Tramo del patrón paralelo a la pista, en dirección opuesta al aterrizaje." },
    { id: "vfrt-5", term: "Luces de posición", definition: "Roja en el ala izquierda, verde en la derecha, blanca en la cola." },
    { id: "vfrt-6", term: "Baliza (Beacon)", definition: "Luz roja rotativa anticolisión que se enciende con el motor en marcha." },
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
  { id: "met-q12", pregunta: "La turbulencia de estela (wake turbulence) es generada por:", opciones: ["Corrientes térmicas ascendentes generadas por el calor del suelo", "El viento chocando contra terreno montañoso irregular", "La lluvia intensa dentro de una tormenta activa", "Vórtices generados en las puntas de ala de aviones grandes"], correcta: 3 },
  { id: "met-q13", pregunta: "¿Qué sistema alerta a los controladores sobre wind shear de bajo nivel?", opciones: ["LLWAS", "METAR", "NOTAM", "TAF"], correcta: 0 },
  { id: "met-q14", pregunta: "El hielo de carburador puede ocurrir:", opciones: ["Solo bajo cero", "Incluso con temperaturas exteriores positivas", "Solo en vuelo IFR", "Nunca en motores de pistón"], correcta: 1 },
  { id: "met-q15", pregunta: "¿Qué código de cobertura indica cielo despejado?", opciones: ["BKN", "OVC", "SKC/CLR", "SCT"], correcta: 2 },
  { id: "met-q16", pregunta: "Comparando un METAR con 'BKN008' y visibilidad 3SM contra otro con 'SCT025' y visibilidad 10SM, ¿cuál representa mayor riesgo para un vuelo VFR por debajo de 3,000 ft AGL en espacio no controlado?", opciones: ["El segundo, porque SCT siempre indica más cobertura que cualquier BKN", "Ambos representan exactamente el mismo nivel de riesgo para el vuelo", "Ninguno de los dos reportes afecta la decisión de volar VFR", "El primero, porque nubes rotas a solo 800 ft probablemente incumplen el mínimo VFR"], correcta: 3 },
  { id: "met-q17", pregunta: "Un frente frío se acerca rápido y, el mismo día, un frente cálido se acerca lento por otra dirección. ¿Cuál exige una decisión de vuelo más urgente y por qué?", opciones: ["El frío, porque su avance rápido deja poco margen de tiempo para decidir", "El cálido, porque siempre trae un clima mucho peor que cualquier frente frío", "Ninguno de los dos frentes afecta realmente la planificación de un vuelo", "Se decide exactamente igual sin importar el tipo de frente que se acerque"], correcta: 0 },
];

const QUIZ_NAVEGACION: QuizPregunta[] = [
  { id: "nav-q1", pregunta: "Un radial se mide:", opciones: ["Hacia la estación", "Desde el VOR hacia afuera", "Solo de noche", "Desde el norte magnético del avión"], correcta: 1 },
  { id: "nav-q2", pregunta: "Si la bandera indica TO, volar el curso seleccionado con la aguja centrada te lleva:", opciones: ["Alejándote de la estación", "En círculos", "Hacia la estación", "No indica nada"], correcta: 2 },
  { id: "nav-q3", pregunta: "Cada punto de desviación del CDI representa aproximadamente:", opciones: ["10°", "45°", "90°", "2°"], correcta: 3 },
  { id: "nav-q4", pregunta: "El OBS sirve para:", opciones: ["Seleccionar el curso o radial deseado", "Medir la distancia hasta la estación", "Sintonizar las frecuencias de comunicación", "Encender el transponder del avión"], correcta: 0 },
  { id: "nav-q5", pregunta: "Tracking, a diferencia de Homing, se caracteriza por:", opciones: ["Apuntar siempre la nariz directo hacia la estación", "Calcular un ángulo de corrección por viento para mantener la línea recta", "Ignorar por completo el efecto del viento", "Usarse únicamente en vuelo bajo reglas IFR"], correcta: 1 },
  { id: "nav-q6", pregunta: "El DME mide:", opciones: ["Solo el rumbo magnético actual", "La velocidad del viento en la ruta", "La distancia real en línea recta a la estación", "La frecuencia de la estación VOR"], correcta: 2 },
  { id: "nav-q7", pregunta: "Una ventaja clave del HSI sobre el CDI tradicional es:", opciones: ["Es más barato de instalar y mantener", "No requiere ningún tipo de calibración", "Funciona incluso sin electricidad a bordo", "Integra rumbo y desviación, eliminando la sensibilidad inversa"], correcta: 3 },
  { id: "nav-q8", pregunta: "El ADF, a diferencia del VOR, muestra:", opciones: ["El rumbo relativo hacia la estación, sin dar radiales", "Radiales precisos medidos desde la estación", "La distancia exacta hasta la estación", "Solo funciona correctamente durante la noche"], correcta: 0 },
  { id: "nav-q9", pregunta: "La fijación cruzada (cross-fix) usa:", opciones: ["Un solo VOR sin ninguna otra referencia", "Dos radiales de VOR distintos que se cruzan en la carta", "Solo la señal del GPS a bordo", "El compás magnético usado únicamente"], correcta: 1 },
  { id: "nav-q10", pregunta: "En una carta VFR, la escala gráfica sirve para:", opciones: ["Calcular el viento en la ruta", "Sintonizar la frecuencia del VOR", "Medir distancias trazadas en la ruta", "Leer el reporte METAR actual"], correcta: 2 },
  { id: "nav-q11", pregunta: "Sin DME, para saber la distancia a un aeropuerto puedes usar:", opciones: ["Solo adivinar la distancia recorrida", "El transponder del avión", "El altímetro de a bordo", "Navegación por estima (dead reckoning)"], correcta: 3 },
  { id: "nav-q12", pregunta: "Planear una ruta VFR debe incluir siempre:", opciones: ["Un aeropuerto alterno con reservas de combustible adecuadas", "Solo la distancia total del tramo", "Únicamente el rumbo magnético calculado", "Nada relacionado con el clima esperado"], correcta: 0 },
  { id: "nav-q13", pregunta: "Si estás en el radial 090 de un VOR y quieres volar TO la estación, tu curso debe ser aproximadamente:", opciones: ["090°", "270°", "180°", "360°"], correcta: 1 },
  { id: "nav-q14", pregunta: "El ángulo de intercepción recomendado para interceptar un radial es de:", opciones: ["10°", "60°", "30°", "90°"], correcta: 2 },
  { id: "nav-q15", pregunta: "Un minuto de latitud medido verticalmente en una carta equivale aproximadamente a:", opciones: ["Una milla terrestre", "Diez millas náuticas", "No equivale a nada útil", "Una milla náutica"], correcta: 3 },
  { id: "nav-q16", pregunta: "Usas fijación cruzada con dos VOR: el radial A lo trazaste correctamente, pero el radial B lo leíste con 10° de error. ¿Qué le pasa a tu posición fijada en la carta?", opciones: ["Se desplaza a lo largo del radial B, alejándose más cuanto mayor sea la distancia", "No se ve afectada en absoluto, un solo radial con error nunca importa", "El error se cancela automáticamente entre ambos radiales sin dejar rastro", "Solo afecta la posición si ambos radiales tienen error al mismo tiempo"], correcta: 0 },
  { id: "nav-q17", pregunta: "Vuelas sin DME y necesitas confirmar tu distancia a un aeropuerto. Comparando la navegación por estima (dead reckoning) contra una fijación cruzada con dos VOR, ¿cuál te da mayor precisión y por qué?", opciones: ["Estima, porque no depende de ninguna señal externa que pueda llegar a fallar", "Fijación cruzada, porque ubica tu posición real con dos referencias externas, sin acumular error de tiempo y viento", "Ambas técnicas tienen exactamente la misma precisión en cualquier situación", "Ninguna de las dos es confiable si no cuentas con DME a bordo"], correcta: 1 },
];

const QUIZ_CARTOGRAFIA: QuizPregunta[] = [
  { id: "cart-q1", pregunta: "¿A qué escala están las Cartas VFR (Sectional Charts)?", opciones: ["1:100,000", "1:250,000", "1:500,000", "1:1,000,000"], correcta: 2 },
  { id: "cart-q2", pregunta: "Un aeropuerto con torre de control se representa en color:", opciones: ["Magenta", "Verde", "Rojo", "Azul"], correcta: 3 },
  { id: "cart-q3", pregunta: "¿Qué clase de espacio aéreo requiere autorización EXPLÍCITA para entrar?", opciones: ["Clase B", "Clase D", "Clase E", "Clase G"], correcta: 0 },
  { id: "cart-q4", pregunta: "En un obstáculo marcado '1500 (450)', ¿qué representa el número entre paréntesis?", opciones: ["Altura MSL", "Altura AGL (sobre el terreno)", "Distancia al aeropuerto más cercano", "Frecuencia de luces del obstáculo"], correcta: 1 },
  { id: "cart-q5", pregunta: "¿Qué es el MEF en una carta VFR?", opciones: ["La frecuencia de emergencia asignada", "El nombre del aeropuerto más cercano", "La altitud más alta de seguridad en ese cuadrante", "La velocidad máxima permitida ahí"], correcta: 2 },
  { id: "cart-q6", pregunta: "Las frecuencias de radio en la carta (CTAF, Torre, ATIS) se ubican:", opciones: ["Solo en un apéndice separado del mapa", "No aparecen nunca en las cartas VFR", "Solo aparecen en las cartas IFR", "Junto a cada aeropuerto y límite de espacio aéreo"], correcta: 3 },
  { id: "cart-q7", pregunta: "¿Para qué sirven los Puntos de Notificación VFR?", opciones: ["Para reportar tu posición de forma rápida y estandarizada", "Para marcar las zonas prohibidas de la carta", "Para indicar dónde recargar combustible", "No tienen ningún uso operacional real"], correcta: 0 },
  { id: "cart-q8", pregunta: "Antes de un vuelo, el mejor hábito al leer una carta completa es:", opciones: ["Improvisar la ruta en el aire", "Trazar la ruta completa con checkpoints, rumbos y tiempos", "Ignorar el espacio aéreo si el vuelo es corto", "Memorizar solo el destino"], correcta: 1 },
  { id: "cart-q9", pregunta: "¿Qué tipo de carta se usa para vuelo IFR en aerovías bajo FL180?", opciones: ["Cartas TAC de área terminal", "Cartas VFR de tipo sectional", "Cartas de Ruta de Baja Altitud", "Cartas de aproximación visual local"], correcta: 2 },
  { id: "cart-q10", pregunta: "En la simbología de cartas, la longitud de las líneas del círculo de un aeropuerto indica:", opciones: ["El precio del combustible local", "La cantidad total de hangares", "El horario de operación de la torre", "Si la pista es dura o de superficie blanda"], correcta: 3 },
  { id: "cart-q11", pregunta: "¿Qué clase de espacio aéreo se representa con líneas discontinuas azules?", opciones: ["Clase D", "Clase B", "Clase C", "Clase G"], correcta: 0 },
  { id: "cart-q12", pregunta: "¿Qué representa el sombreado en tonos más oscuros de café/naranja en una carta VFR?", opciones: ["Espacio aéreo prohibido", "Terreno de mayor elevación", "Zonas de tormenta", "Aeropuertos militares"], correcta: 1 },
  { id: "cart-q13", pregunta: "Antes de acercarte a espacio aéreo controlado, debes identificar en la carta:", opciones: ["El precio del combustible en ese aeropuerto", "El color del avión permitido ahí", "Qué frecuencia contactar y en qué punto de tu ruta", "Nada en particular que revisar"], correcta: 2 },
  { id: "cart-q14", pregunta: "¿Con qué símbolo se marcan los Puntos de Notificación VFR en la carta?", opciones: ["Un círculo azul relleno", "Una línea roja punteada", "Un cuadrado verde", "Una estrella o triángulo magenta"], correcta: 3 },
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
  { id: "ins-q7", pregunta: "El error ANDS del compás magnético ocurre principalmente:", opciones: ["En vuelo recto y nivelado sin cambios", "Únicamente durante los vuelos nocturnos", "Al acelerar/desacelerar en rumbos norte-sur en el hemisferio norte", "Solo con el transponder del avión encendido"], correcta: 2 },
  { id: "ins-q8", pregunta: "¿Qué ventaja tiene el HSI sobre el compás magnético en errores dinámicos?", opciones: ["No tiene ninguna ventaja real sobre el compás", "Es más barato de instalar en cabina", "Funciona incluso sin ninguna electricidad", "Su referencia giroscópica no sufre oscilación ni ANDS"], correcta: 3 },
  { id: "ins-q9", pregunta: "¿Qué squawk se usa para indicar secuestro o interferencia ilícita?", opciones: ["7500", "7600", "7700", "1200"], correcta: 0 },
  { id: "ins-q10", pregunta: "El botón IDENT en el transponder sirve para:", opciones: ["Apagar por completo el equipo transponder", "Resaltar tu posición en la pantalla del controlador", "Cambiar la frecuencia sintonizada actualmente", "Declarar una emergencia de forma automática"], correcta: 1 },
  { id: "ins-q11", pregunta: "El Coordinador de Viraje, a diferencia del indicador de giro tradicional, muestra:", opciones: ["Solo la altitud actual del avión", "La presión de aceite del motor", "Velocidad de alabeo y tasa de giro combinadas", "El rumbo magnético del avión en ese momento"], correcta: 2 },
  { id: "ins-q12", pregunta: "¿Qué distingue al RMI del ADF simple?", opciones: ["No tiene ninguna aguja indicadora visible", "Solo funciona correctamente estando en tierra", "Es un instrumento mucho más antiguo", "Muestra el rumbo magnético real hacia la estación, no solo relativo"], correcta: 3 },
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
  { id: "ren-q4", pregunta: "Un viento de cola de 10 nudos en el aterrizaje puede aumentar la distancia de frenado aproximadamente:", opciones: ["20-30%", "0-5%", "No afecta el aterrizaje", "100%"], correcta: 0 },
  { id: "ren-q5", pregunta: "Al usar gráficas de rendimiento, cuando tus condiciones caen entre dos valores impresos, debes:", opciones: ["Redondear siempre hacia abajo", "Interpolar proporcionalmente entre los valores", "Ignorar la gráfica y usar tu experiencia", "Usar siempre el valor más alto sin calcular"], correcta: 1 },
  { id: "ren-q6", pregunta: "¿Qué V-speed representa el mejor ángulo de ascenso, útil para despejar obstáculos?", opciones: ["Vy", "Vne", "Vx", "Va"], correcta: 2 },
  { id: "ren-q7", pregunta: "El Viento Cruzado Máximo Demostrado en el manual del avión es:", opciones: ["Un límite legal absoluto que nunca puede excederse", "Algo que solo aplica en aeropuertos internacionales grandes", "Un valor fijo que jamás varía entre modelos", "El valor máximo probado y documentado por el fabricante, sin ser límite legal"], correcta: 3 },
  { id: "ren-q8", pregunta: "En la técnica de Sideslip para viento cruzado, el piloto:", opciones: ["Baja el ala hacia el viento con alerón y usa timón opuesto", "Apunta la nariz completamente contra el viento hasta el touchdown", "Aumenta al doble la velocidad de aproximación normal planeada", "Aterriza siempre buscando tener viento de cola a favor"], correcta: 0 },
  { id: "ren-q9", pregunta: "La Carga Útil (Useful Load) es:", opciones: ["El peso del avión completamente vacío, sin nada", "La diferencia entre el peso máximo certificado y el vacío", "La velocidad máxima certificada del avión", "El combustible mínimo legal requerido siempre"], correcta: 1 },
  { id: "ren-q10", pregunta: "Un CG muy atrasado hace al avión:", opciones: ["Más estable pero pesado de controlar", "Imposible de despegar", "Más ágil pero peligrosamente inestable", "No afecta el control"], correcta: 2 },
  { id: "ren-q11", pregunta: "¿Qué V-speed es la máxima con flaps extendidos?", opciones: ["Vso", "Vr", "Vne", "Vfe"], correcta: 3 },
  { id: "ren-q12", pregunta: "El margen de seguridad recomendado sobre el valor calculado en distancia de pista es de aproximadamente:", opciones: ["30-50% extra", "0%", "200% extra", "No se aplica margen"], correcta: 0 },
  { id: "ren-q13", pregunta: "La velocidad de rotación se abrevia:", opciones: ["Vx", "Vr", "Va", "Vs0"], correcta: 1 },
  { id: "ren-q14", pregunta: "El componente de viento cruzado es mayor cuando el ángulo del viento respecto a la pista se acerca a:", opciones: ["0°", "45°", "90°", "180°"], correcta: 2 },
  { id: "ren-q15", pregunta: "La altitud de densidad afecta principalmente:", opciones: ["Más estable pero pesado de controlar", "Prácticamente imposible de hacer despegar", "Más ágil pero peligrosamente inestable", "No afecta en nada al control"], correcta: 3 },
  { id: "ren-q16", pregunta: "Dos despegues con el mismo peso: uno a nivel del mar en día fresco, otro en Toluca (8,466 ft) en día caluroso. ¿Cuál requiere mayor distancia de pista y qué dos factores se combinan para causarlo?", opciones: ["El de Toluca, porque la elevación y la temperatura combinadas aumentan la altitud de densidad", "El de nivel del mar, porque ahí hay más oxígeno disponible", "Ambos requieren exactamente la misma distancia de pista", "La temperatura no afecta en nada el rendimiento de despegue"], correcta: 0 },
  { id: "ren-q17", pregunta: "Comparando un aterrizaje con viento de cola de 10 nudos contra uno con viento en calma, ¿qué cambia y por qué NO deberías simplemente volar más lento para compensar?", opciones: ["No cambia absolutamente nada, el viento de cola no afecta el aterrizaje", "La distancia de frenado aumenta 20-30%; volar más lento con viento de cola aumenta el riesgo de pérdida", "Siempre debes aterrizar mucho más rápido con viento de cola", "El viento de cola en realidad reduce la distancia de aterrizaje"], correcta: 1 },
];

const QUIZ_OPERACION: QuizPregunta[] = [
  { id: "op-q1", pregunta: "La inspección pre-vuelo (walk-around) debe hacerse:", opciones: ["Solo la primera vez que vuelas el avión", "Únicamente si el clima está malo", "Siempre, de forma sistemática y en el mismo patrón", "Cada dos vuelos realizados en total"], correcta: 2 },
  { id: "op-q2", pregunta: "La técnica 'flujo + verificación' significa:", opciones: ["Leer la checklist línea por línea desde cero", "Ignorar la checklist si tienes experiencia", "Pedirle a otro piloto que la lea", "Ejecutar de memoria y luego confirmar con la checklist"], correcta: 3 },
  { id: "op-q3", pregunta: "La llamada 'DESPEJADO' (clear prop) se hace:", opciones: ["Antes de girar la llave de encendido", "Después de aterrizar en la pista", "Solo en aviones a reacción", "Durante el vuelo de crucero"], correcta: 0 },
  { id: "op-q4", pregunta: "Si la presión de aceite no sube en los primeros segundos tras el arranque, debes:", opciones: ["Seguir volando normal", "Apagar el motor de inmediato", "Aumentar potencia", "Ignorarlo si el motor suena bien"], correcta: 1 },
  { id: "op-q5", pregunta: "Durante el rodaje, la dirección se controla principalmente con:", opciones: ["El yoke", "La mezcla", "Los pedales de timón", "El trim"], correcta: 2 },
  { id: "op-q6", pregunta: "El run-up incluye verificar:", opciones: ["Solo el nivel de combustible restante", "El clima esperado en el destino", "Solo el estado de las luces", "Cada magneto individualmente y los instrumentos del motor"], correcta: 3 },
  { id: "op-q7", pregunta: "Durante el ascenso, Vy se usa para:", opciones: ["Mejor tasa de ascenso, ganando altitud más rápido", "Mejor ángulo de ascenso posible", "Velocidad óptima de crucero establecida", "Aterrizar con la configuración adecuada"], correcta: 0 },
  { id: "op-q8", pregunta: "Ajustar la mezcla en crucero (leaning) sirve para:", opciones: ["Aumentar el ruido del motor", "Optimizar consumo y rendimiento a esa altitud", "Apagar el motor gradualmente", "No tiene ningún efecto"], correcta: 1 },
  { id: "op-q9", pregunta: "Una regla práctica para el descenso es multiplicar la altitud a perder (en miles de pies) por:", opciones: ["1", "10", "3", "No existe tal regla"], correcta: 2 },
  { id: "op-q10", pregunta: "Una aproximación inestable debe resolverse con:", opciones: ["Forzar el aterrizaje de todas formas", "Reducir la velocidad al mínimo", "Pedir ayuda a la torre únicamente", "Un go-around, sin dudar"], correcta: 3 },
  { id: "op-q11", pregunta: "El flare (redondeo) ocurre:", opciones: ["Justo antes de tocar tierra, reduciendo la tasa de descenso", "Justo al iniciar el descenso inicial", "Durante el rodaje hacia la pista", "Al arrancar el motor del avión"], correcta: 0 },
  { id: "op-q12", pregunta: "¿Cuándo se ejecuta la checklist 'después de aterrizaje'?", opciones: ["Justo antes de tocar la pista", "Una vez fuera de la pista activa", "Durante el flare final", "Nunca es realmente necesaria"], correcta: 1 },
  { id: "op-q13", pregunta: "Existen checklists:", opciones: ["Solo de emergencia", "Solo normales", "Normales, Anormales y de Emergencia", "No existen categorías"], correcta: 2 },
  { id: "op-q14", pregunta: "Durante la carrera de despegue, si algo se ve mal en los instrumentos del motor:", opciones: ["Continuar siempre el despegue", "Ignorarlo y revisar después", "Aumentar potencia al máximo", "Aún hay pista disponible para abortar"], correcta: 3 },
  { id: "op-q15", pregunta: "Después de aterrizar y estacionar, el procedimiento de apagado incluye:", opciones: ["Mezcla a corte y magnetos apagados", "Dejar el motor encendido", "Solo cerrar la puerta", "Nada en particular"], correcta: 0 },
  { id: "op-q16", pregunta: "Durante el arranque, en un caso la presión de aceite no sube en los primeros segundos; en otro, sube normal pero las RPM son inestables. ¿Cuál exige apagar de inmediato y cuál permite observar brevemente?", opciones: ["Ambas exigen apagar el motor de inmediato sin ninguna excepción", "La falta de presión de aceite exige apagar de inmediato; las RPM inestables pueden observarse unos segundos", "Ninguna de las dos situaciones requiere ninguna acción inmediata", "Las RPM inestables siempre son más graves que la presión de aceite"], correcta: 1 },
  { id: "op-q17", pregunta: "Comparando una aproximación estabilizada contra una inestable a 200 pies de altura, ¿qué decisión corresponde a cada una y por qué la indecisión es el mayor riesgo en la segunda?", opciones: ["Continuar el aterrizaje en ambos casos exactamente por igual", "Siempre abortar el aterrizaje sin importar la estabilización real", "Si está estabilizada, continuar; si está inestable, ejecutar un go-around de inmediato sin dudar", "La estabilización de la aproximación no afecta la decisión final"], correcta: 2 },
];

const QUIZ_ESPACIOS: QuizPregunta[] = [
  { id: "esp-q1", pregunta: "El espacio Clase A comienza en:", opciones: ["El nivel del mar", "10,000 pies AGL", "Solo sobre aeropuertos grandes", "FL180 (18,000 pies)"], correcta: 3 },
  { id: "esp-q2", pregunta: "Para entrar en espacio Clase B necesitas:", opciones: ["Autorización EXPLÍCITA de control antes de entrar", "Solo establecer contacto por radio", "Nada, es espacio no controlado", "Solo un plan de vuelo IFR"], correcta: 0 },
  { id: "esp-q3", pregunta: "¿Qué diferencia principal hay entre Clase C y Clase B?", opciones: ["No hay ninguna diferencia real entre ambas", "Clase C solo requiere contacto bidireccional, no autorización explícita", "Clase C es mucho más restrictiva que la Clase B", "Clase C simplemente no existe en la aviación real"], correcta: 1 },
  { id: "esp-q4", pregunta: "La Clase D típicamente tiene un radio de:", opciones: ["50 millas náuticas de radio", "100 millas náuticas de radio", "4 millas náuticas hasta 2,500 pies sobre el aeropuerto", "No tiene ningún límite definido"], correcta: 2 },
  { id: "esp-q5", pregunta: "En espacio Clase G (no controlado):", opciones: ["No aplican reglas de ningún tipo en absoluto", "Se requiere autorización explícita de la torre de control", "Está completamente prohibido volar bajo reglas VFR", "Aún aplican mínimos de visibilidad y nubes, aunque más permisivos"], correcta: 3 },
  { id: "esp-q6", pregunta: "Un Área Restringida (prefijo R-) se caracteriza por:", opciones: ["Actividad peligrosa con autorización, activa en horarios publicados", "Una prohibición absoluta y permanente en todo momento", "Ser siempre clasificada como espacio aéreo Clase A", "No existir realmente en la práctica de vuelo"], correcta: 0 },
  { id: "esp-q7", pregunta: "Un Área Prohibida (prefijo P-) implica:", opciones: ["Se puede cruzar con autorización previa", "Vuelo terminantemente prohibido sin excepción para civiles", "Solo aplica de noche", "Es lo mismo que una restringida"], correcta: 1 },
  { id: "esp-q8", pregunta: "Un Área de Peligro/Advertencia (Warning Area):", opciones: ["Es tan legalmente restrictiva como una zona prohibida", "Solo existe sobre superficie de tierra firme", "No es legalmente restrictiva, pero señala actividad peligrosa", "Requiere autorización militar obligatoria en todo momento"], correcta: 2 },
  { id: "esp-q9", pregunta: "¿Qué equipo suele requerirse para operar en Clase B o C?", opciones: ["Solo un mapa impreso a bordo", "Ningún equipo especial requerido", "Solo un receptor GPS funcional", "Transponder Modo C y radio bidireccional operativo"], correcta: 3 },
  { id: "esp-q10", pregunta: "Al planear una ruta VFR, el espacio aéreo determina principalmente:", opciones: ["Qué comunicaciones, equipo y mínimos aplican en cada tramo", "Solo el color del avión que está permitido", "El precio del combustible en ese aeropuerto", "Nada relevante para la planificación VFR"], correcta: 0 },
  { id: "esp-q11", pregunta: "¿Qué forma característica tiene el espacio Clase B en las cartas?", opciones: ["Un cuadrado perfecto sin ninguna variación", "Círculos concéntricos que se ensanchan con la altitud", "Una línea recta sin ninguna curva", "No tiene ninguna forma definida realmente"], correcta: 1 },
  { id: "esp-q12", pregunta: "Fuera del horario de la torre, el espacio Clase D generalmente revierte a:", opciones: ["Clase A", "Clase B", "Clase E o G", "Sigue siendo Clase D siempre"], correcta: 2 },
  { id: "esp-q13", pregunta: "El espacio Clase E puede comenzar en superficie, a 700 pies AGL o a:", opciones: ["5,000 pies AGL", "18,000 pies", "No tiene otra opción", "1,200 pies AGL"], correcta: 3 },
  { id: "esp-q14", pregunta: "La única regla de separación en espacio Clase G es:", opciones: ["'Ve y evita'", "Autorización de control", "Contacto obligatorio por radio", "No existe ninguna regla"], correcta: 0 },
  { id: "esp-q15", pregunta: "Antes de asumir que una Restringida puede cruzarse libremente fuera de horario, debes:", opciones: ["Nada, simplemente cruzar", "Verificar los NOTAMs vigentes", "Pedir permiso a otro piloto", "Esperar la noche"], correcta: 1 },
  { id: "esp-q16", pregunta: "Tu ruta cruza primero espacio Clase C y luego Clase D fuera del horario de la torre (que revierte a E/G). ¿En cuál tramo necesitas contacto bidireccional establecido antes de entrar y en cuál no?", opciones: ["En ambos tramos necesitas autorización explícita antes de entrar", "En ninguno de los tramos se requiere contacto por radio", "En Clase C necesitas contacto bidireccional antes de entrar; en el tramo E/G no se requiere", "Solo el tramo Clase D requiere una autorización explícita"], correcta: 2 },
  { id: "esp-q17", pregunta: "Comparando un Área Restringida activa fuera de su horario publicado contra una Prohibida en cualquier momento, ¿qué verificación previa es indispensable antes de asumir que la Restringida está libre para cruzar?", opciones: ["Ninguna, si no está en horario siempre queda libre", "Preguntar a otro piloto en la misma frecuencia", "Ambas siempre están disponibles para cruzarse libremente", "Verificar los NOTAMs vigentes, ya que el horario puede cambiar; la Prohibida nunca es cruzable"], correcta: 3 },
];

const QUIZ_REGLAMENTACION: QuizPregunta[] = [
  { id: "reg-q1", pregunta: "El vuelo VFR se basa fundamentalmente en:", opciones: ["Referencia visual constante con el horizonte y el terreno", "Navegación exclusiva por instrumentos de vuelo", "Autorización obligatoria de control en todo momento", "No requiere ninguna regla de separación real"], correcta: 0 },
  { id: "reg-q2", pregunta: "En reglas de prioridad de paso VFR, ante un cruce frontal:", opciones: ["El más rápido tiene prioridad", "Ambos ceden a la derecha", "El de mayor tamaño siempre tiene prioridad", "No hay regla definida"], correcta: 1 },
  { id: "reg-q3", pregunta: "El vuelo IFR requiere:", opciones: ["Nunca presentar ningún plan de vuelo formal", "Solo referencia visual del terreno circundante", "Plan de vuelo autorizado y seguir instrucciones continuas de ATC", "No necesita ningún equipo especial a bordo"], correcta: 2 },
  { id: "reg-q4", pregunta: "La progresión típica de licencias es:", opciones: ["ATP, CPL, PPL, Alumno", "Solo existe una licencia universal", "Comercial, luego Privado", "Alumno, Privado (PPL), Comercial (CPL), ATP"], correcta: 3 },
  { id: "reg-q5", pregunta: "¿Qué autoridad emite licencias de piloto en México?", opciones: ["AFAC, bajo el marco del RAC 61 mexicano", "FAA, la autoridad estadounidense de aviación", "EASA, la autoridad europea de seguridad aérea", "OACI directamente a cada piloto individual"], correcta: 0 },
  { id: "reg-q6", pregunta: "Además de horas de vuelo, obtener una licencia requiere:", opciones: ["Solo pagar una cuota administrativa correspondiente", "Certificado médico vigente, examen teórico y checkride práctico", "Nada más que cumplir la edad mínima", "Solo aprobar un examen de manejo automotriz"], correcta: 1 },
  { id: "reg-q7", pregunta: "Como referencia general, la reserva mínima de combustible VFR diurno es aproximadamente:", opciones: ["5 minutos", "3 horas", "30 minutos", "No se requiere reserva en VFR diurno"], correcta: 2 },
  { id: "reg-q8", pregunta: "Los mínimos meteorológicos VFR generalmente son:", opciones: ["Iguales en absolutamente todo tipo de espacio aéreo", "Solo aplican durante los vuelos nocturnos", "No existen mínimos legales en ningún tipo de espacio", "Más estrictos en espacio controlado que en no controlado"], correcta: 3 },
  { id: "reg-q9", pregunta: "¿Qué calificación adicional (rating) se suma comúnmente a una licencia?", opciones: ["Instrumentos, Multimotor, Instructor de vuelo", "Ninguna, la licencia es fija", "Solo se permite una licencia por vida", "Únicamente vuelo acrobático"], correcta: 0 },
  { id: "reg-q10", pregunta: "Como referencia general, un PPL requiere aproximadamente:", opciones: ["10 horas totales", "40 horas totales de vuelo", "500 horas totales", "No tiene mínimo de horas"], correcta: 1 },
  { id: "reg-q11", pregunta: "Como referencia general, un CPL requiere aproximadamente:", opciones: ["10-20 horas", "1,000 horas mínimo siempre", "150-250 horas totales", "No requiere horas adicionales al PPL"], correcta: 2 },
  { id: "reg-q12", pregunta: "Para operaciones internacionales o radiocomunicación en inglés se exige:", opciones: ["Nada especial de parte del piloto", "Solo saber leer números en voz alta", "Un examen de un idioma completamente distinto", "Demostrar competencia en inglés según la escala OACI"], correcta: 3 },
  { id: "reg-q13", pregunta: "El vuelo IFR requiere mantener competencia (currency) mediante:", opciones: ["Un mínimo de aproximaciones y procedimientos practicados recientemente", "Nada adicional más allá de la licencia", "Solo volar una vez cada año", "Un examen médico de forma mensual"], correcta: 0 },
  { id: "reg-q14", pregunta: "Para VFR nocturno o vuelo IFR, la reserva mínima común de combustible aumenta a:", opciones: ["15 minutos", "45 minutos", "3 horas", "No cambia respecto al VFR diurno"], correcta: 1 },
  { id: "reg-q15", pregunta: "Si el pronóstico no alcanza los mínimos IFR publicados de destino, la regulación exige:", opciones: ["Volar de todas formas", "Cancelar toda la temporada de vuelos", "Planificar un alterno adecuado", "Ninguna acción especial"], correcta: 2 },
  { id: "reg-q16", pregunta: "Comparando la reserva VFR diurna (30 min) contra la nocturna (45 min), si tu ETA de un vuelo nocturno planeado al límite se recorre 20 minutos por viento en contra, ¿qué debiste haber hecho al planear?", opciones: ["Nada, la reserva mínima siempre alcanza sin importar cualquier retraso", "Volar mucho más rápido para compensar automáticamente el retraso", "El retraso nunca afecta en nada los requisitos de combustible", "Agregar un margen adicional de combustible más allá del mínimo legal, sobre todo de noche"], correcta: 3 },
  { id: "reg-q17", pregunta: "Comparando la progresión Alumno → PPL → CPL, si un cadete quiere volar de noche con pasajeros antes de tener 40 horas totales, ¿qué le falta y por qué importa el orden de los requisitos?", opciones: ["Le falta completar el PPL, ya que llevar pasajeros requiere una licencia vigente, no solo horas", "Nada, puede llevar pasajeros sin licencia si tiene experiencia suficiente", "Solo necesita aprobar el examen médico correspondiente", "El orden de los requisitos no importa realmente en la práctica"], correcta: 0 },
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
  { id: "fun-q6", pregunta: "El eje vertical controla principalmente:", opciones: ["Alabeo", "Cabeceo", "Ninguno de los anteriores", "Guiñada"], correcta: 3 },
  { id: "fun-q7", pregunta: "¿Qué control ajusta la proporción de combustible y aire según la altitud?", opciones: ["Mixture (mezcla)", "Yoke", "Pedales", "Throttle"], correcta: 0 },
  { id: "fun-q8", pregunta: "¿Cuál de estos NO forma parte del 'Six Pack' analógico?", opciones: ["Altímetro", "GPS", "Horizonte artificial", "Variómetro"], correcta: 1 },
  { id: "fun-q9", pregunta: "El Tren de aterrizaje tiene como función principal:", opciones: ["Generar sustentación adicional durante el vuelo", "Controlar la guiñada del avión en vuelo", "Soportar el peso en tierra y absorber el impacto", "Reducir el consumo total de combustible"], correcta: 2 },
  { id: "fun-q10", pregunta: "¿Qué superficie controla la guiñada (yaw)?", opciones: ["Alerones", "Flaps", "Elevador", "Timón de dirección"], correcta: 3 },
  { id: "fun-q11", pregunta: "El Eje longitudinal (nariz-cola) controla:", opciones: ["El alabeo (roll)", "El cabeceo", "La guiñada", "La velocidad"], correcta: 0 },
  { id: "fun-q12", pregunta: "¿Qué controla el Yoke al moverlo hacia adelante o atrás?", opciones: ["Los alerones", "El elevador (cabeceo)", "El timón de dirección", "La mezcla"], correcta: 1 },
  { id: "fun-q13", pregunta: "Además del timón de dirección, los pedales controlan en tierra:", opciones: ["La potencia del motor instalado", "Los flaps extendidos del ala", "El frenado diferencial y la dirección de la rueda", "El horizonte artificial de la cabina"], correcta: 2 },
  { id: "fun-q14", pregunta: "¿Qué instrumento muestra la actitud respecto al horizonte real?", opciones: ["Altímetro", "Indicador de rumbo", "Variómetro", "Horizonte artificial (Attitude Indicator)"], correcta: 3 },
  { id: "fun-q15", pregunta: "Volar es, en esencia:", opciones: ["Un equilibrio dinámico de fuerzas", "Un truco de velocidad pura", "Un efecto exclusivo del motor", "Un fenómeno sin explicación física"], correcta: 0 },
  { id: "fun-q16", pregunta: "Comparando dos aviones idénticos a la misma velocidad, uno con mayor ángulo de ataque que el otro, ¿cuál genera más sustentación y qué riesgo aumenta si ese ángulo sigue creciendo?", opciones: ["El de menor ángulo, porque el riesgo es quedarse sin combustible", "El de mayor ángulo genera más sustentación hasta el ángulo crítico, luego entra en pérdida", "Ambos generan exactamente la misma sustentación en cualquier caso", "El ángulo de ataque no afecta en nada la sustentación generada"], correcta: 1 },
  { id: "fun-q17", pregunta: "En un viraje, si aplicas solo alerón sin nada de timón, ¿qué efecto secundario no deseado aparece y por qué se usa el timón para corregirlo?", opciones: ["Ninguno, los alerones son suficientes por completo solos", "El avión pierde toda su sustentación de forma inmediata", "Aparece guiñada adversa porque el alerón que sube genera más resistencia; el timón la compensa", "El motor se apaga automáticamente al iniciar el viraje"], correcta: 2 },
];

const QUIZ_AERODINAMICA: QuizPregunta[] = [
  { id: "aero-q1", pregunta: "Para generar la misma sustentación a menor velocidad, el ala necesita:", opciones: ["Un ángulo de ataque menor", "La velocidad no se relaciona con el ángulo de ataque", "Solo depende de la potencia del motor", "Un ángulo de ataque mayor"], correcta: 3 },
  { id: "aero-q2", pregunta: "El factor de carga aproximado en un viraje coordinado con 60° de inclinación es:", opciones: ["2G", "1G", "1.4G", "4G"], correcta: 0 },
  { id: "aero-q3", pregunta: "¿Qué es la pérdida aerodinámica (stall)?", opciones: ["Cuando el motor se apaga por completo en pleno vuelo", "Cuando el flujo de aire se separa del ala al superar el ángulo crítico", "Cuando el avión vuela mucho más rápido de lo normal", "Cuando falla por completo el tren de aterrizaje"], correcta: 1 },
  { id: "aero-q4", pregunta: "La velocidad de pérdida aumenta cuando:", opciones: ["Disminuye considerablemente el peso de la aeronave", "Se extienden por completo los flaps del ala", "Aumenta el factor de carga, como en un viraje pronunciado", "El avión vuela en línea recta y nivelada"], correcta: 2 },
  { id: "aero-q5", pregunta: "El efecto suelo (ground effect) ocurre:", opciones: ["Solo durante el vuelo de crucero a gran altitud", "Únicamente con el tren de aterrizaje retraído", "Nunca afecta el rendimiento del avión", "Cerca del suelo, reduciendo la resistencia inducida del ala"], correcta: 3 },
  { id: "aero-q6", pregunta: "La resistencia inducida es mayor cuando:", opciones: ["El ángulo de ataque es alto, como a baja velocidad", "El avión vuela a una velocidad muy alta", "Los flaps están completamente retraídos hacia el ala", "El avión está en una picada pronunciada"], correcta: 0 },
  { id: "aero-q7", pregunta: "El P-factor (precesión asimétrica de la hélice), en un motor de giro horario visto desde la cabina, tiende a guiñar el avión hacia:", opciones: ["La derecha, sin importar la potencia que se aplique", "La izquierda, en ángulos de ataque altos y alta potencia", "Ninguna dirección en particular, no tiene efecto real", "Solo afecta a los motores de tipo turbohélice"], correcta: 1 },
  { id: "aero-q8", pregunta: "Las 'tendencias de giro a la izquierda' en un avión de hélice de un motor combinan:", opciones: ["Únicamente el efecto conocido como P-factor", "Solo el flujo espiral generado por la hélice", "Torque, precesión giroscópica, P-factor y el flujo espiral", "Ninguna tendencia relevante en los aviones modernos"], correcta: 2 },
  { id: "aero-q9", pregunta: "Una barrena (spin) ocurre cuando:", opciones: ["El avión vuela a una velocidad excesiva", "Se extienden los flaps durante el crucero", "El motor pierde potencia de forma muy gradual", "Una pérdida asimétrica hace que un ala se pierda antes, entrando en rotación autosostenida"], correcta: 3 },
  { id: "aero-q10", pregunta: "Al aumentar el ángulo de ataque, el centro de presión en un perfil convencional tiende a:", opciones: ["Moverse hacia adelante", "Moverse hacia atrás", "Permanecer siempre fijo", "Desaparecer por completo"], correcta: 0 },
  { id: "aero-q11", pregunta: "Los slots y slats en el borde de ataque del ala sirven para:", opciones: ["Aumentar la resistencia total sin ningún beneficio real", "Retrasar la separación del flujo de aire, permitiendo mayor ángulo antes de la pérdida", "Reducir la sustentación total generada por el ala", "Cumplir una función que es únicamente estética"], correcta: 1 },
  { id: "aero-q12", pregunta: "La velocidad de maniobra (Va) representa:", opciones: ["La velocidad máxima estructural permitida del avión", "La velocidad mínima de control direccional posible", "La velocidad por debajo de la cual el avión entra en pérdida antes de dañarse estructuralmente", "La velocidad óptima establecida para el crucero"], correcta: 2 },
  { id: "aero-q13", pregunta: "Un ala con mayor alargamiento (aspect ratio) generalmente tiene:", opciones: ["Mayor resistencia inducida en todos los casos posibles", "Menor sustentación total generada por el ala", "Ninguna ventaja aerodinámica relevante en la práctica", "Menor resistencia inducida y mejor eficiencia en planeo"], correcta: 3 },
  { id: "aero-q14", pregunta: "Durante un despegue con viento cruzado, ¿qué tendencia direccional se suma a las tendencias de giro a la izquierda normales?", opciones: ["El viento cruzado empuja la cola y el avión tiende a virar hacia el viento", "Ninguna tendencia, el viento cruzado no afecta la dirección en tierra", "El avión siempre vira en la dirección contraria al viento", "Solo afecta a la dirección una vez que está en el aire"], correcta: 0 },
  { id: "aero-q15", pregunta: "El trim (compensador) del elevador sirve para:", opciones: ["Aumentar la potencia disponible del motor instalado", "Reducir la fuerza que el piloto debe sostener para mantener una actitud", "Controlar la guiñada del avión durante el vuelo", "Retraer por completo el tren de aterrizaje"], correcta: 1 },
  { id: "aero-q16", pregunta: "Comparando un ala de mayor alargamiento (aspect ratio) contra una de menor alargamiento, a la misma velocidad y ángulo de ataque, ¿cuál tiene menor resistencia inducida y por qué eso mejora el planeo?", opciones: ["La de menor alargamiento, porque genera menos sustentación total", "Ambas tienen exactamente la misma resistencia inducida siempre", "La de mayor alargamiento, porque distribuye mejor el flujo cerca de las puntas, reduciendo los vórtices", "El alargamiento no guarda ninguna relación con la resistencia inducida"], correcta: 2 },
  { id: "aero-q17", pregunta: "Comparando un despegue a alta potencia y ángulo de ataque alto contra un crucero nivelado a potencia reducida, ¿en cuál las tendencias de giro a la izquierda (P-factor, torque, precesión, flujo espiral) son más pronunciadas?", opciones: ["En crucero, porque ahí la velocidad alcanzada es mayor", "Son idénticas en ambos casos, sin ninguna diferencia real", "Las tendencias de giro no dependen de la potencia ni el ángulo", "En el despegue, porque la alta potencia y el alto ángulo de ataque intensifican el P-factor y el torque"], correcta: 3 },
];

const QUIZ_VFR: QuizPregunta[] = [
  { id: "vfr-q1", pregunta: "En espacio aéreo controlado por debajo de 10,000 ft MSL, el mínimo de visibilidad VFR es:", opciones: ["3 millas", "1 milla", "5 millas", "No existe un mínimo definido"], correcta: 0 },
  { id: "vfr-q2", pregunta: "Los mínimos de separación de nubes en espacio controlado por debajo de 10,000 ft son:", opciones: ["Libre de nubes en todo momento sin excepción", "500 ft por debajo, 1,000 ft por encima y 2,000 ft horizontal", "100 ft de separación en cualquier dirección posible", "No se requiere ninguna separación de nubes"], correcta: 1 },
  { id: "vfr-q3", pregunta: "En espacio no controlado (Clase G) de día, por debajo de 1,200 ft AGL, el mínimo es:", opciones: ["5 millas de visibilidad siempre", "10 millas de visibilidad", "1 milla de visibilidad y libre de nubes", "No hay ningún mínimo en Clase G"], correcta: 2 },
  { id: "vfr-q4", pregunta: "La altura estándar del tramo de 'viento en cola' (downwind) en un patrón de tráfico es típicamente:", opciones: ["500 ft AGL", "3,000 ft AGL", "No existe una altura estándar", "1,000 ft AGL"], correcta: 3 },
  { id: "vfr-q5", pregunta: "El patrón de tráfico estándar utiliza virajes hacia:", opciones: ["La izquierda, salvo que se indique lo contrario", "La derecha siempre, sin excepción", "Alternando en cada vuelta al patrón", "Depende únicamente de la dirección del viento"], correcta: 0 },
  { id: "vfr-q6", pregunta: "El tramo 'base' del patrón de tráfico es:", opciones: ["Paralelo a la pista, en dirección de aterrizaje", "Perpendicular a la pista, justo antes de virar a 'final'", "El primer tramo justo después del despegue", "Exactamente lo mismo que el tramo 'final'"], correcta: 1 },
  { id: "vfr-q7", pregunta: "Al entrar a un patrón de tráfico no controlado, la entrada recomendada es:", opciones: ["Directa a 'final' sin anunciarse por radio", "Siempre desde el tramo de base establecido", "A 45° hacia el viento en cola, integrándose al circuito", "Cualquier ángulo, sin ninguna necesidad de comunicar"], correcta: 2 },
  { id: "vfr-q8", pregunta: "Si el techo de nubes reportado es de solo 900 ft AGL, ¿generalmente puedes operar con seguridad en el patrón de tráfico?", opciones: ["Sí, sin ninguna restricción particular a considerar", "Solo si el vuelo ocurre durante la noche", "Solo con autorización verbal de otro piloto cercano", "No, un techo tan bajo rara vez deja margen suficiente"], correcta: 3 },
  { id: "vfr-q9", pregunta: "El reporte de posición 'entrando en viento en cola' se hace generalmente:", opciones: ["Al establecerte en viento en cola, antes de virar a base", "Justo después de haber aterrizado por completo", "Solo si ese aeropuerto cuenta con torre", "Nunca es realmente necesario reportarlo"], correcta: 0 },
  { id: "vfr-q10", pregunta: "Antes de un vuelo VFR, además de verificar los mínimos meteorológicos, debes revisar:", opciones: ["Únicamente el color exterior del avión", "NOTAMs vigentes, combustible con reserva adecuada, y peso y balance", "Nada adicional si el clima ya está despejado", "Solo la hora programada para la salida"], correcta: 1 },
  { id: "vfr-q11", pregunta: "Comparando los mínimos VFR en espacio controlado contra los de Clase G por debajo de 1,200 ft AGL de día, ¿cuál es más permisivo y por qué existe esa diferencia?", opciones: ["El controlado es más permisivo porque tiene menos tráfico", "Ambos tienen exactamente los mismos mínimos siempre", "Clase G es más permisivo porque tiene menor tráfico y ATC no gestiona la separación", "No existe ninguna diferencia real entre ambos espacios"], correcta: 2 },
  { id: "vfr-q12", pregunta: "Entras a 'viento en cola' mientras otro avión reporta estar en 'final' del mismo patrón. ¿Qué debes hacer?", opciones: ["Acelerar para intentar aterrizar antes que él", "Ignorarlo, ya que estás dentro del patrón establecido", "Abandonar el aeropuerto y desviarte a otro sin evaluar", "Ceder el paso y ajustar tu posición para mantener separación segura"], correcta: 3 },
  { id: "vfr-q13", pregunta: "El tramo 'final' del patrón de tráfico es:", opciones: ["El tramo alineado con la pista, justo antes de aterrizar", "El primer tramo justo después del despegue inicial", "Exactamente lo mismo que el tramo de 'viento en cola'", "Un tramo opcional que se puede omitir"], correcta: 0 },
  { id: "vfr-q14", pregunta: "Un 'go-around' desde el patrón de tráfico se ejecuta cuando:", opciones: ["En cada aproximación realizada, sin ninguna excepción", "La aproximación no está estabilizada o la pista no está despejada", "Únicamente si lo indica la torre de control", "Nunca es necesario en aeropuertos sin torre"], correcta: 1 },
  { id: "vfr-q15", pregunta: "¿Qué diferencia principal hay entre los mínimos meteorológicos VFR de día y de noche?", opciones: ["No existe ninguna diferencia real entre ambos horarios", "Los mínimos diurnos son siempre más estrictos que los nocturnos", "Los mínimos nocturnos suelen ser más estrictos, porque la referencia visual es más limitada", "De noche no se requiere ningún mínimo meteorológico real"], correcta: 2 },
  { id: "vfr-q16", pregunta: "Comparando volar en espacio Clase G por debajo de 1,200 ft AGL de día contra hacerlo de noche en el mismo espacio, ¿qué cambia en los mínimos y por qué?", opciones: ["No cambia absolutamente nada entre el día y la noche", "De día los mínimos son más estrictos que de noche", "De noche no se permite volar VFR bajo ninguna circunstancia", "De noche los mínimos son más exigentes, porque la referencia visual es mucho más limitada"], correcta: 3 },
  { id: "vfr-q17", pregunta: "Comparando una entrada directa a 'final' sin anunciarte contra una entrada estándar a 45° hacia el viento en cola, ¿por qué la segunda reduce el riesgo de colisión en un aeropuerto sin torre?", opciones: ["La entrada a 45° te integra en la secuencia visible donde otros pilotos ya esperan verte", "Ambas son igual de seguras, es solo una preferencia personal", "La entrada directa a final siempre es preferible por ser más rápida", "El ángulo de entrada no afecta en nada el riesgo de colisión"], correcta: 0 },
];

export const MODULE_PRACTICA: Record<string, QuizPregunta[]> = {
  fundamentos: split(QUIZ_FUNDAMENTOS).practica,
  meteorologia: split(QUIZ_METEOROLOGIA).practica,
  aerodinamica: split(QUIZ_AERODINAMICA).practica,
  navegacion: split(QUIZ_NAVEGACION).practica,
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
  aerodinamica: ["aero-q16", "aero-q15"],
  navegacion: ["nav-q1", "nav-q3", "nav-q14", "nav-q9", "nav-q6", "nav-q8", "nav-q15", "nav-q12"],
  cartografia: ["cart-q17", "cart-q13"],
  comunicaciones: ["com-q3", "com-q12", "com-q13", "com-q6"],
  instrumentos: ["ins-q17", "ins-q6", "ins-q12"],
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
  meteorologia: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vuelas VFR y a 20 millas por delante observas una línea de cumulonimbos (CB) que crece rápidamente, bloqueando tu ruta directa.",
        options: [
          { label: "Intentar cruzar entre dos células para ganar tiempo", next: "mala" },
          { label: "Desviarte alrededor, manteniendo al menos 20 millas de distancia de la línea", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Cruzar entre células de tormenta expone a turbulencia severa, granizo y wind shear extremo. La separación mínima recomendada de un CB activo es de al menos 20 millas náuticas — 'cruzar rápido' nunca es una opción segura.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Mantener distancia generosa de las células convectivas — idealmente 20 NM o más — evita la turbulencia severa y el wind shear asociados, aunque signifique un desvío más largo.",
        },
      },
    },
  },
  instrumentos: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "En vuelo IFR en nubes, notas que el horizonte artificial y el indicador de rumbo comienzan a inclinarse lentamente sin motivo aparente — sospechas una falla de la bomba de vacío.",
        options: [
          { label: "Ignorar y seguir confiando en el horizonte artificial", next: "mala" },
          { label: "Reconocer la falla y volar 'panel parcial' con coordinador de viraje, altímetro y compás", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Seguir confiando en un horizonte artificial que ya falló lleva fácilmente a una actitud inusual no percibida — es una causa clásica de accidentes por desorientación espacial.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Ante una falla de vacío, el procedimiento estándar es reconocerla y recurrir al 'panel parcial': coordinador de viraje, altímetro, velocímetro y compás magnético para mantener control de actitud.",
        },
      },
    },
  },
  operacion: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt: "Durante el arranque del motor notas humo y llamas visibles saliendo del escape — fuego en tierra durante el arranque.",
        options: [
          { label: "Seguir intentando encender para 'quemar' el exceso de combustible", next: "mala" },
          { label: "Continuar girando el motor de arranque, cortar mezcla y combustible, y evacuar con extintor listo", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Insistir en encender con fuego activo alimenta el incendio en lugar de sofocarlo — el procedimiento de fuego en arranque exige cortar el combustible, no darle más.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. El procedimiento estándar es seguir girando el motor de arranque para que 'aspire' el fuego hacia el interior, cortar mezcla y magnetos, cerrar la válvula de combustible, y evacuar con extintor a la mano si persiste.",
        },
      },
    },
  },
  "espacios-aereos": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt: "Vuelas VFR y tu ruta cruza el espacio aéreo Clase C de un aeropuerto grande. Aún no has establecido contacto por radio.",
        options: [
          { label: "Entrar de todas formas, es solo un cruce rápido", next: "mala" },
          { label: "Contactar a control de aproximación antes de entrar y esperar contacto establecido", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Entrar a espacio Clase C sin haber establecido contacto por radio es una violación regulatoria y de seguridad — se requiere contacto bidireccional establecido antes de ingresar.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. El espacio Clase C exige comunicación bidireccional con control antes de ingresar. Escuchar tu identificación de vuelta confirma que fuiste aceptado en el espacio.",
        },
      },
    },
  },
  ifr: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt: "Estás en una aproximación ILS y llegas a la altitud de decisión (DA) sin tener la pista o sus referencias visuales a la vista.",
        options: [
          { label: "Descender un poco más 'por si acaso' aparece la pista", next: "mala" },
          { label: "Ejecutar el procedimiento de aproximación frustrada (missed approach) de inmediato", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Descender por debajo de la altitud de decisión sin referencias visuales elimina el margen de obstáculos garantizado por el procedimiento — es una causa de accidentes CFIT en aproximaciones instrumentales.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Al llegar a la DA/MDA sin las referencias visuales requeridas, el procedimiento es ejecutar la aproximación frustrada de inmediato y evaluar un nuevo intento o alterno.",
        },
      },
    },
  },
  "meteorologia-2": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vuelas VFR en un día frío, entras brevemente en nubes bajas por error y notas una fina capa de hielo formándose en el borde de ataque del ala.",
        options: [
          { label: "Continuar en las nubes esperando salir pronto a un área más cálida", next: "mala" },
          { label: "Salir de las nubes de inmediato (ascendiendo o descendiendo) hacia aire más cálido, y desviarte de la zona", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El engelamiento puede empeorar en segundos y degradar gravemente la aerodinámica del ala. Esperar 'a ver si mejora' dentro de la nube es exactamente lo que no debes hacer.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Ante cualquier indicio de engelamiento, la prioridad es salir de inmediato de las condiciones que lo producen — buscando aire más cálido o VMC — y evitar esa zona en el resto del vuelo.",
        },
      },
    },
  },
  navegacion: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vuelas siguiendo un radial del VOR con viento cruzado. Mantienes el rumbo constante, pero notas que la aguja del CDI se desvía lentamente hacia un lado.",
        options: [
          { label: "Ignorar la desviación, seguramente corriges al final del tramo", next: "mala" },
          { label: "Corregir el rumbo hacia el lado de la desviación y hacer tracking activo, ajustando conforme lo pida el viento", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Ignorar una desviación que crece te aleja cada vez más del curso — al final del tramo el error puede ser demasiado grande para corregir con margen.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. El tracking activo significa ajustar tu rumbo constantemente para compensar el viento y mantener la aguja centrada, no solo apuntar al rumbo original y esperar.",
        },
      },
    },
  },
  cartografia: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Planeas una ruta VFR que cruza justo el límite de un círculo azul discontinuo de espacio Clase D.",
        options: [
          { label: "Asumir que, al ser discontinuo, no necesitas contactar a nadie", next: "mala" },
          { label: "Contactar a la torre correspondiente antes de entrar y obtener autorización o instrucciones", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "El símbolo discontinuo indica el límite lateral de la Clase D, no que sea opcional contactarla — requiere contacto bidireccional establecido antes de entrar, igual que la Clase C.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Clase D exige contacto bidireccional con la torre antes de ingresar, sin importar que su símbolo en la carta sea una línea discontinua en vez de sólida.",
        },
      },
    },
  },
  comunicaciones: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Estás por hacer tu primer contacto con Torre para aterrizar, y otro piloto está transmitiendo justo cuando ibas a llamar.",
        options: [
          { label: "Transmitir de inmediato, tu mensaje es corto y seguro cabe", next: "mala" },
          { label: "Esperar a que la frecuencia quede libre antes de transmitir tu llamada", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Transmitir mientras otra estación habla produce 'stepping on' — ninguno de los dos mensajes se entiende bien, y puede ocultar información crítica de seguridad.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Nunca transmitas sobre otra estación, sin importar qué tan corto sea tu mensaje — espera a que la frecuencia esté libre.",
        },
      },
    },
  },
  "instrumentos-2": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "En vuelo, notas que el velocímetro empieza a comportarse de forma errática: sube y baja igual que el altímetro en vez de reflejar cambios reales de velocidad.",
        options: [
          { label: "Confiar en el velocímetro y ajustar la actitud según sus lecturas", next: "mala" },
          { label: "Sospechar un bloqueo del sistema pitot-estático, y usar actitud + potencia conocidas en vez del velocímetro", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Un velocímetro que se comporta como altímetro es el síntoma clásico de un bloqueo del sistema pitot-estático — confiar en él puede llevarte a una actitud peligrosa.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Ante indicaciones erráticas del sistema pitot-estático, la referencia segura es la combinación conocida de actitud y potencia para la fase de vuelo, no las lecturas del instrumento afectado.",
        },
      },
    },
  },
  rendimiento: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vas a despegar de una pista corta en un día caluroso, y tus cálculos de rendimiento muestran un margen muy ajustado para despejar los árboles al final de la pista.",
        options: [
          { label: "Despegar de todos modos, seguro el manual exagera un poco", next: "mala" },
          { label: "Reducir peso, esperar a que baje la temperatura, o buscar una pista más larga antes de despegar", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Los datos de rendimiento del manual ya asumen condiciones ideales de pilotaje — un margen ajustado en el papel casi nunca mejora en la práctica, y una altitud de densidad alta reduce aún más el rendimiento real.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Ante un margen ajustado de despegue, la decisión correcta es cambiar las condiciones a tu favor — menos peso, menor temperatura o más pista — nunca 'intentarlo y ver'.",
        },
      },
    },
  },
  "operacion-2": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Ya iniciaste el despegue y, antes de alcanzar la velocidad de rotación, notas una vibración anormal del motor.",
        options: [
          { label: "Continuar el despegue, seguro se estabiliza en el aire", next: "mala" },
          { label: "Cerrar la potencia de inmediato y abortar el despegue mientras aún hay pista suficiente para detenerte", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Una anomalía del motor antes de rotar es exactamente el escenario para un despegue rechazado — continuar con un problema conocido, a baja altura y baja velocidad, es la combinación más peligrosa.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Antes de alcanzar la velocidad de rotación, cualquier anomalía seria del motor debe resultar en cerrar potencia y frenar de inmediato, mientras la pista restante lo permita.",
        },
      },
    },
  },
  "espacios-aereos-2": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vuelas VFR y te acercas a un área marcada como TFR (restricción temporal de vuelo) que no conocías, activa por una visita oficial.",
        options: [
          { label: "Continuar tu ruta directa, seguramente ya expiró", next: "mala" },
          { label: "Desviarte de inmediato del área y verificar los NOTAMs vigentes antes de continuar", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Entrar a un TFR activo sin autorización puede resultar en interceptación y consecuencias legales severas — nunca asumas que 'ya expiró' sin verificarlo.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Ante cualquier TFR, la acción segura es evitarla de inmediato y confirmar su estado vigente contra los NOTAMs actuales antes de replantear tu ruta.",
        },
      },
    },
  },
  reglamentacion: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Un amigo te pide ser tu primer pasajero. Han pasado más de 90 días desde tu último despegue y aterrizaje.",
        options: [
          { label: "Llevarlo de todos modos, ya sabes volar", next: "mala" },
          { label: "Verificar tu currency de despegues y aterrizajes recientes antes de llevar pasajeros, y practicar solo si no la cumples", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Saber volar no es lo mismo que cumplir la currency legal requerida para llevar pasajeros — hacerlo sin ella, aunque te sientas capaz, es una violación reglamentaria.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. La regulación exige un mínimo de despegues y aterrizajes recientes para poder llevar pasajeros — si no la cumples, primero debes practicar solo (o con instructor) hasta recuperarla.",
        },
      },
    },
  },
  "ifr-2": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vuelas una aproximación de no precisión y llegas al MDA sin haber alcanzado el punto de aproximación frustrada ni tener las referencias visuales requeridas.",
        options: [
          { label: "Descender un poco más abajo del MDA para intentar verla mejor", next: "mala" },
          { label: "Nivelar en el MDA y continuar hasta el punto de aproximación frustrada, ejecutándola si no obtienes referencias", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Descender por debajo del MDA sin referencias visuales elimina el margen de obstáculos garantizado por el procedimiento — es una causa directa de accidentes CFIT.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. En una aproximación de no precisión, el MDA se mantiene nivelado hasta el punto de aproximación frustrada o hasta obtener referencias visuales — nunca se desciende por debajo 'para ver mejor'.",
        },
      },
    },
  },
  fundamentos: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Vuelas recto y nivelado a velocidad constante. Sin cambiar la actitud, reduces la potencia del motor de forma notable. ¿Qué ocurre primero?",
        options: [
          { label: "El avión se mantiene nivelado, solo pierde velocidad indefinidamente", next: "mala" },
          { label: "El empuje deja de igualar la resistencia, y al caer la sustentación por debajo del peso, el avión empieza a descender", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Las 4 fuerzas no se ajustan solas: si reduces el empuje sin cambiar la actitud, la velocidad cae, la sustentación ya no alcanza a igualar el peso, y el avión empieza a descender — no se queda nivelado indefinidamente.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Al reducir potencia sin cambiar la actitud, el empuje deja de igualar la resistencia (pierdes velocidad) y, con menos velocidad, la sustentación cae por debajo del peso — el avión entra en descenso hasta que ajustes potencia o actitud.",
        },
      },
    },
  },
  aerodinamica: {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Estás en el viraje de base a final, un poco bajo y lento, y para no pasarte de la línea de la pista aprietas el viraje con más alerón e inclinación. ¿Qué haces?",
        options: [
          { label: "Aumentar el ángulo de inclinación con más alerón para cerrar el viraje rápido", next: "mala" },
          { label: "Nivelar las alas, aceptar pasarte un poco de la línea, y ajustar con timón y potencia", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Apretar el viraje a baja velocidad aumenta el factor de carga y la velocidad de pérdida en ese preciso instante — es el clásico escenario de pérdida/barrena en el viraje base-final, una de las causas más comunes de accidentes fatales cerca del patrón.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Nunca aprietes un viraje a baja velocidad para corregir alineación. Es preferible pasarte un poco de la línea de la pista y hacer un ajuste amplio o un go-around, que arriesgar una pérdida asimétrica en un viraje pronunciado cerca del suelo.",
        },
      },
    },
  },
  "vfr-2": {
    startId: "inicio",
    tree: {
      inicio: {
        id: "inicio",
        prompt:
          "Te acercas a un aeródromo no controlado y ves a otro avión entrar directo a 'final' sin haber pasado por el tramo de viento en cola. Tú ya estás integrado en el patrón. ¿Qué haces?",
        options: [
          { label: "Acelerar para llegar tú primero a la pista, ya que entraste de forma correcta", next: "mala" },
          { label: "Comunicar tu posición por radio, ceder el paso si es necesario y ajustar tu trayectoria para mantener separación", next: "buena" },
        ],
      },
      mala: {
        id: "mala",
        prompt: "",
        options: [],
        outcome: {
          correct: false,
          feedback:
            "Tener la razón sobre quién entró 'correctamente' no evita una colisión. La prioridad reglamentaria existe, pero la responsabilidad de 'ver y evitar' siempre es de ambos pilotos — competir por la pista es exactamente lo que no debes hacer.",
        },
      },
      buena: {
        id: "buena",
        prompt: "",
        options: [],
        outcome: {
          correct: true,
          feedback:
            "Correcto. Ante cualquier conflicto en el patrón, la solución es comunicar tu posición y ajustar tu propia trayectoria (por ejemplo, extendiendo el viento en cola) — nunca forzar la situación asumiendo que el otro piloto cederá.",
        },
      },
    },
  },
};

// ---------- Sliders (para el widget de configuración numérica) ----------

export const MODULE_SLIDERS: Record<string, SliderConfig> = {
  navegacion: {
    title: "Efecto del viento en contra sobre tu navegación",
    description:
      "Mueve el control para simular viento en contra creciente en la ruta MMGL → MMZO y observa cómo cambian tu velocidad de tierra, tiempo de vuelo y combustible necesario.",
    minLabel: "Sin viento",
    maxLabel: "Viento en contra de 40 nudos",
    metrics: [
      { label: "Velocidad de tierra", unit: "kt", from: 110, to: 70 },
      { label: "Tiempo estimado", unit: "min", from: 45, to: 75 },
      { label: "Combustible requerido", unit: "L", from: 30, to: 50 },
    ],
    footnote:
      "A mayor viento en contra, tu velocidad de tierra baja, el vuelo tarda más y consumes más combustible — por eso el pronóstico de viento es tan importante al planear una ruta VFR.",
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
      { label: "Margen de seguridad", unit: "%", from: 100, to: 55 },
    ],
    footnote:
      "A mayor altitud de densidad, el motor y las alas rinden menos: la carrera de despegue se alarga y la tasa de ascenso cae — por eso Toluca exige recalcular el rendimiento en días calurosos, nunca asumir que la pista se comporta como una a nivel del mar.",
  },
};
