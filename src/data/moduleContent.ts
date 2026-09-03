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
      titulo: "Por qué vuela un avión: las 4 fuerzas y los principios físicos",
      temas: [
      { id: "fundamentos-tema1", titulo: "¿Qué es un avión y por qué vuela?", texto: "Un avión es una máquina más pesada que el aire capaz de sostenerse y desplazarse por la atmósfera gracias a fuerzas aerodinámicas generadas por su movimiento relativo al aire. Vuela porque genera sustentación suficiente para vencer su propio peso, usando alas con forma de perfil aerodinámico que, al moverse a través del aire, crean una diferencia de presión entre su superficie superior e inferior. Este principio, sumado al empuje que vence la resistencia del aire, permite que la aeronave se eleve, se mantenga en vuelo nivelado y regrese a tierra de forma controlada. Entender esta idea central — que volar es un equilibrio dinámico de fuerzas, no magia ni solo velocidad — es la base de todo lo demás que aprenderás como piloto." },
      { id: "fundamentos-tema2", titulo: "Las 4 fuerzas del vuelo", texto: "Todo avión en vuelo está sometido a 4 fuerzas fundamentales: Sustentación (Lift), generada por las alas, que se opone al Peso (Weight), la fuerza de gravedad sobre la masa total de la aeronave; y Empuje (Thrust), producido por el motor, que se opone a la Resistencia (Drag), la fricción del aire contra la aeronave. En vuelo recto y nivelado a velocidad constante, estas 4 fuerzas están en equilibrio: sustentación = peso y empuje = resistencia. Cualquier cambio de actitud, potencia o configuración rompe momentáneamente este equilibrio y produce una reacción — subir, bajar, acelerar o desacelerar. Este tema se profundiza con diagrama interactivo completo en tu módulo dedicado \"Fuerzas y Ejes\".", imagenes: ["/images/fundamentos-4fuerzas.png"] },
      { id: "fundamentos-tema3", titulo: "Principios de Bernoulli y Newton", texto: "La sustentación se explica mediante dos principios físicos complementarios. El Principio de Bernoulli establece que, en un fluido en movimiento, a mayor velocidad menor presión: el perfil del ala hace que el aire viaje más rápido sobre la superficie superior, generando menor presión arriba y mayor presión abajo — esa diferencia empuja el ala hacia arriba. La Tercera Ley de Newton (acción-reacción) explica lo mismo desde otro ángulo: el ala desvía el aire hacia abajo, y como reacción, el aire empuja el ala hacia arriba. Ambos principios no compiten, se complementan: describen la misma sustentación desde la presión (Bernoulli) y desde el momentum del aire desviado (Newton). Como piloto no necesitas resolver ecuaciones, pero sí entender que el ángulo de ataque y la velocidad son las variables que controlas para generar más o menos sustentación.", imagenes: ["/images/fundamentos-pdb.png", "/images/fundamentos-tldn.png"] },
      { id: "fundamentos-tema4", titulo: "Partes de un avión", texto: "Un avión típico de entrenamiento se compone de: el Fuselaje, la estructura central que aloja cabina, pasajeros y carga; las Alas, que generan la sustentación y suelen alojar combustible; el Empenaje (cola), formado por el estabilizador horizontal y vertical, que da estabilidad direccional y de cabeceo; el Tren de aterrizaje, que soporta el peso en tierra y absorbe el impacto del aterrizaje; y el Grupo motopropulsor (motor y hélice o turbina), que genera el empuje. Cada componente cumple una función estructural o aerodinámica específica, y conocer su nomenclatura correcta es esencial para la comunicación técnica con instructores, mecánicos y controladores." },
      ],
    },
    {
      titulo: "Superficies, ejes, controles e instrumentos básicos",
      temas: [
      { id: "fundamentos-tema5", titulo: "Superficies de control", texto: "Las superficies de control son partes móviles que el piloto mueve para cambiar la actitud del avión. Los Alerones, en el borde de salida de las alas, controlan el alabeo (roll) moviéndose en direcciones opuestas entre sí. El Elevador, en el estabilizador horizontal, controla el cabeceo (pitch) subiendo o bajando el morro. El Timón de dirección, en el estabilizador vertical, controla la guiñada (yaw). Además existen superficies secundarias como los Flaps, que aumentan la sustentación y resistencia para despegues y aterrizajes a baja velocidad, y en algunos aviones, spoilers o trim tabs que ayudan a reducir la carga de control. Cada superficie corresponde a un eje de movimiento específico — la relación superficie-eje-control es una de las primeras cosas que un instructor evalúa que domines." },
      { id: "fundamentos-tema6", titulo: "Ejes de movimiento", texto: "Un avión se mueve alrededor de 3 ejes imaginarios que se cruzan en su centro de gravedad. El Eje longitudinal (nariz-cola) controla el Alabeo (roll), inclinando las alas mediante los alerones. El Eje lateral (ala-ala) controla el Cabeceo (pitch), subiendo o bajando el morro mediante el elevador. El Eje vertical controla la Guiñada (yaw), moviendo el morro a izquierda o derecha mediante el timón de dirección. Estos 3 ejes y sus 3 movimientos son la base de toda maniobra de vuelo, desde un viraje coordinado hasta una aproximación final. Este tema se profundiza con diagrama interactivo completo en tu módulo dedicado \"Fuerzas y Ejes\"." },
      { id: "fundamentos-tema7", titulo: "Controles de vuelo (yoke, pedales, throttle, mezcla)", texto: "El piloto interactúa con el avión mediante controles primarios y secundarios. El Yoke (o bastón de control), al moverse adelante/atrás controla el elevador (cabeceo), y al girarlo controla los alerones (alabeo). Los Pedales de timón controlan el timón de dirección (guiñada) y, en tierra, el frenado diferencial y la dirección de la rueda de nariz. La Palanca de potencia (Throttle) regula la cantidad de combustible y aire hacia el motor, controlando directamente el empuje disponible. El Control de mezcla (Mixture) ajusta la proporción de combustible y aire según la densidad del aire (altitud), optimizando la combustión y evitando pérdida de potencia o daño al motor. Dominar la coordinación entre estos controles — especialmente pedal-yoke en virajes — es una de las primeras destrezas motoras que un piloto desarrolla." },
      { id: "fundamentos-tema8", titulo: "Instrumentos básicos (Six Pack)", texto: "El \"Six Pack\" es el conjunto de 6 instrumentos analógicos básicos en la cabina, organizados en dos filas de tres. Fila superior: Indicador de velocidad (Airspeed Indicator), que muestra la velocidad del aire; Horizonte artificial (Attitude Indicator), que muestra la actitud respecto al horizonte real; y Altímetro, que muestra la altitud sobre el nivel del mar. Fila inferior: Indicador de viraje y resbalamiento (Turn Coordinator), que muestra la tasa de giro y coordinación; Indicador de rumbo (Heading Indicator), que muestra hacia dónde apunta la nariz; y Variómetro (Vertical Speed Indicator), que muestra la tasa de ascenso o descenso. Estos 6 instrumentos, leídos en conjunto (scan instrumental), dan al piloto una imagen completa del estado del avión en cualquier condición, incluso sin referencia visual externa." },
      ],
    },
  ],
  "meteorologia": [
    {
      titulo: "Cómo leer METAR y TAF",
      temas: [
      { id: "meteorologia-tema1", titulo: "¿Qué es un METAR?", texto: "Un METAR (Meteorological Aerodrome Report) es un reporte de las condiciones meteorológicas ACTUALES observadas en un aeródromo, emitido cada hora (o cada 30 minutos en algunos casos especiales) por estaciones automáticas o personal capacitado. Es el lenguaje universal de la meteorología aeronáutica: usa un formato codificado y estandarizado internacionalmente para que cualquier piloto, en cualquier país, pueda leerlo sin importar el idioma local. Incluye viento, visibilidad, fenómenos meteorológicos presentes, cobertura de nubes, temperatura, punto de rocío y presión altimétrica. Es la primera fuente que consultas antes de cualquier vuelo para saber \"cómo está el clima ahora mismo\" en tu aeropuerto de salida, destino o alterno." },
      { id: "meteorologia-tema2", titulo: "Cómo leer un METAR paso a paso", texto: "Tomemos un ejemplo real: METAR MMMX 171800Z 09008KT 8SM FEW030 SCT100 22/12 A3005. Se lee así: MMMX = identificador ICAO del aeropuerto (Ciudad de México); 171800Z = día 17 del mes, 18:00 UTC (Zulu); 09008KT = viento del rumbo 090° a 8 nudos; 8SM = visibilidad de 8 millas estatutarias; FEW030 = nubes dispersas (few) a 3,000 pies; SCT100 = nubes dispersas (scattered) a 10,000 pies; 22/12 = temperatura 22°C, punto de rocío 12°C; A3005 = presión altimétrica 30.05 pulgadas de mercurio (inHg). Practica descomponer cada METAR real en estos mismos bloques hasta que se vuelva automático — es una habilidad que usarás en cada vuelo." },
      { id: "meteorologia-tema3", titulo: "¿Qué es un TAF?", texto: "Un TAF (Terminal Aerodrome Forecast) es un pronóstico del tiempo esperado en un aeropuerto, válido típicamente por 24 o 30 horas, actualizado cada 6 horas. A diferencia del METAR, que describe lo que ESTÁ pasando ahora, el TAF describe lo que SE ESPERA que pase en las próximas horas — viento, visibilidad, nubes y fenómenos previstos, incluyendo cambios de tendencia marcados con grupos como BECMG (becoming, cambio gradual) o TEMPO (temporary, cambio temporal). Es la herramienta clave para la planificación de vuelo: te dice si tu destino y tu alterno probablemente tendrán condiciones VFR o IFR a la hora estimada de tu llegada." },
      { id: "meteorologia-tema4", titulo: "Diferencia entre METAR y TAF", texto: "La diferencia central es tiempo: el METAR es una fotografía del presente (observación actual, válida por esa hora específica), mientras que el TAF es una predicción del futuro (pronóstico válido por 24-30 horas). Usas el METAR para decidir si puedes despegar AHORA, y el TAF para decidir si tiene sentido planear el vuelo de aquí a varias horas, incluyendo si necesitarás un aeropuerto alterno. Ambos comparten el mismo lenguaje codificado (viento, visibilidad, nubes), así que si ya sabes leer un METAR, leer un TAF es prácticamente el mismo ejercicio, solo que interpretando períodos de tiempo y tendencias en vez de una sola observación." },
      { id: "meteorologia-tema5", titulo: "Nubes y su significado", texto: "Las nubes se describen en METAR/TAF con abreviaturas de cobertura: SKC/CLR (cielo despejado), FEW (pocas, 1-2 octavos del cielo cubiertos), SCT (dispersas, 3-4 octavos), BKN (fragmentadas, 5-7 octavos) y OVC (cubierto, 8 octavos). Por tipo, las más relevantes para el piloto son: Cúmulos (buen tiempo, desarrollo vertical moderado), Estratos (capas planas, visibilidad reducida, típicas de neblina), Cirros (altas, hielo, buen tiempo pero anuncian cambio), y Cumulonimbos (CB, tormentas eléctricas, turbulencia severa, granizo — se evitan siempre). La altura de la base de nubes (ej. BKN008 = fragmentado a 800 pies) es crítica para decidir si las condiciones son VFR o IFR." },
      ],
    },
    {
      titulo: "Nubes, frentes, turbulencia y hielo",
      temas: [
      { id: "meteorologia-tema6", titulo: "Frentes fríos y cálidos", texto: "Un frente es la frontera entre dos masas de aire con temperaturas distintas. El Frente frío ocurre cuando aire frío avanza y empuja al aire cálido hacia arriba rápidamente — genera clima violento pero de corta duración: cumulonimbos, tormentas intensas, turbulencia y visibilidad muy reducida durante su paso, seguido de cielos despejados y aire fresco. El Frente cálido ocurre cuando aire cálido avanza sobre aire frío de forma gradual — genera nubosidad estratiforme extensa, lluvia ligera pero prolongada, y techos bajos durante mucho más tiempo antes de que pase. En las cartas meteorológicas, el frente frío se marca con triángulos azules y el cálido con semicírculos rojos, ambos apuntando hacia donde se dirige el frente." },
      { id: "meteorologia-tema7", titulo: "Turbulencia", texto: "La turbulencia es el movimiento irregular del aire que sacude la aeronave. Se clasifica por origen: Mecánica (aire chocando con obstáculos como montañas o edificios), Térmica (corrientes de aire ascendente por calentamiento desigual del suelo, común en tardes calurosas), Aire claro o CAT (Clear Air Turbulence, asociada a corrientes de chorro en altura, sin nubes que la anuncien), y de Estela (wake turbulence, generada por vórtices de las puntas de ala de aviones grandes). Por intensidad se clasifica en Ligera, Moderada, Severa y Extrema, según qué tanto desplazamiento vertical y dificultad de control genera. Los reportes PIREP de otros pilotos son la mejor fuente para saber qué turbulencia esperar en tu ruta." },
      { id: "meteorologia-tema8", titulo: "Wind Shear", texto: "El Wind Shear (cizalladura de viento) es un cambio brusco de dirección y/o velocidad del viento en una distancia corta, y es especialmente peligroso cerca del suelo durante despegue y aterrizaje (Low-Level Wind Shear, LLWS). Su forma más severa es el microburst — una corriente descendente violenta y localizada, típica de tormentas, que primero empuja el avión hacia arriba y luego lo empuja bruscamente hacia abajo con pérdida repentina de sustentación, ocurriendo en segundos. Muchos aeropuertos grandes tienen sistemas de detección (LLWAS) que alertan a los controladores. Como piloto, la mejor defensa es evitar operar cerca de tormentas activas y estar atento a reportes de wind shear en el ATIS o de otros pilotos." },
      { id: "meteorologia-tema9", titulo: "Formación de hielo", texto: "El hielo se forma en la aeronave cuando gotas de agua líquida en la atmósfera (a temperaturas bajo cero, conocidas como agua superenfriada) entran en contacto con superficies del avión y se congelan instantáneamente. El hielo estructural se acumula en alas, empenaje y otras superficies, alterando el perfil aerodinámico, aumentando peso y resistencia, y reduciendo la sustentación de forma peligrosa. El hielo de carburador ocurre dentro del sistema de admisión del motor, incluso con temperaturas exteriores positivas, por el enfriamiento al expandirse el combustible vaporizado. Las condiciones más favorables para hielo estructural son nubes con temperaturas entre 0°C y -20°C con gotas de agua líquida presentes — por eso revisar el pronóstico de nivel de congelamiento (freezing level) es esencial antes de volar en instrumentos." },
      { id: "meteorologia-tema10", titulo: "Altitud de densidad (ejemplo de Toluca)", texto: "La Altitud de densidad es la altitud a la que el avión \"siente\" que está volando, ajustada por temperatura, presión y humedad — no es lo mismo que la altitud real sobre el nivel del mar. A mayor temperatura, menor presión o mayor humedad, el aire se vuelve menos denso y la altitud de densidad AUMENTA, reduciendo el rendimiento del motor, la sustentación de las alas y la eficiencia de la hélice. El aeropuerto de Toluca (MMTO) es el ejemplo perfecto en México: está a 8,466 pies de elevación real, uno de los aeropuertos comerciales más altos del mundo. En un día caluroso de verano, su altitud de densidad puede superar fácilmente los 11,000-12,000 pies — lo que significa carreras de despegue mucho más largas, tasas de ascenso reducidas, y menor margen de seguridad. Todo piloto que opera ahí debe calcular la altitud de densidad antes de cada despegue, no asumir que la pista de Toluca se comporta como una a nivel del mar." },
      ],
    },
  ],
  "navegacion": [
    {
      titulo: "Radionavegación: VOR, CDI, DME, HSI y ADF",
      temas: [
      { id: "navegacion-tema1", titulo: "Qué es un VOR", texto: "El VOR (VHF Omnidirectional Range) es una radioayuda terrestre que transmite información de rumbo en la banda VHF (108.00–117.95 MHz), permitiendo que el avión determine su posición angular (radial) respecto a la estación. Es la columna vertebral de la navegación aérea tradicional, tanto VFR como IFR, y la base sobre la que se construyen todos los demás conceptos de este módulo: radiales, tracking, intercepción y fixes cruzados. Cada estación VOR transmite 360 cursos posibles (uno por cada grado), y el receptor a bordo interpreta esa señal para decirte exactamente en qué radial te encuentras." },
      { id: "navegacion-tema2", titulo: "Cómo funciona un VOR", texto: "Técnicamente, la estación VOR transmite dos señales simultáneas: una de fase de referencia (igual en todas direcciones) y una de fase variable (que rota electrónicamente 30 veces por segundo). El receptor del avión mide la diferencia de fase entre ambas señales, y esa diferencia en grados es exactamente tu radial respecto a la estación. No necesitas entender la electrónica a fondo, pero sí esta idea: el VOR no te dice dónde estás en millas, te dice en qué línea recta (radial) estás parado respecto a la estación — para saber la distancia exacta necesitas un DME o cruzar con otro VOR." },
      { id: "navegacion-tema3", titulo: "Radiales", texto: "Un radial es cada una de las 360 líneas rectas imaginarias que salen del VOR en todas direcciones, numeradas según su rumbo magnético MEDIDO DESDE la estación. El radial 090 es la línea que sale hacia el este de la estación; el radial 270 sale hacia el oeste. Un error común de cadete: el radial siempre se mide DESDE el VOR hacia afuera, nunca hacia la estación. Si estás parado en el radial 090 de un VOR, estás al este de esa estación, sin importar hacia dónde apunte la nariz de tu avión." },
      { id: "navegacion-tema4", titulo: "FROM vs TO", texto: "La bandera FROM/TO en tu indicador te dice si, volando el curso seleccionado en el OBS, te alejarías (FROM) o te acercarías (TO) a la estación. Si seleccionas un curso y la bandera dice TO, volar ese rumbo con la aguja centrada te lleva HACIA el VOR; si dice FROM, te lleva alejándote. Es fácil confundirse porque el radial y el curso TO la estación son opuestos entre sí (difieren 180°) — por ejemplo, para volar TO un VOR estando en el radial 090, tu curso sería 270, no 090. Siempre verifica la bandera antes de asumir hacia dónde te lleva el curso seleccionado." },
      { id: "navegacion-tema5", titulo: "Cómo leer un CDI", texto: "El CDI (Course Deviation Indicator) es la aguja vertical que te muestra qué tan lejos estás del curso seleccionado en el OBS. Cada punto (dot) de desviación representa aproximadamente 2° de error angular respecto al VOR, con un total de 5 puntos a cada lado (10° de escala completa). Si la aguja está a la izquierda, el curso seleccionado está a tu izquierda — vuelas HACIA la aguja para interceptarlo, nunca te alejas de ella. Una aguja centrada significa que estás exactamente sobre el curso seleccionado." },
      { id: "navegacion-tema6", titulo: "Qué es un OBS", texto: "El OBS (Omni Bearing Selector) es la perilla que giras para seleccionar el curso o radial que quieres volar. Al girarla, mueves la referencia interna del instrumento, lo cual cambia tanto la posición de la aguja del CDI como la bandera FROM/TO. Seleccionar un curso en el OBS no cambia tu posición real ni tu rumbo — solo le dice al instrumento qué curso quieres usar como referencia para comparar contra tu posición actual." },
      { id: "navegacion-tema7", titulo: "Cómo interceptar una radial", texto: "Interceptar una radial significa maniobrar tu avión desde tu posición actual hasta quedar exactamente sobre el radial deseado. El proceso es: 1) selecciona el radial deseado en el OBS, 2) observa hacia qué lado apunta la aguja del CDI (eso te dice de qué lado del radial estás), 3) gira hacia un rumbo de intercepción que combine tu curso deseado con un ángulo extra hacia el lado donde está la aguja, y 4) mantén ese rumbo hasta que la aguja se acerque al centro, momento en el que giras para alinearte con el curso final." },
      { id: "navegacion-tema8", titulo: "¿Por qué se recomienda interceptar con 30°?", texto: "Un ángulo de intercepción de 30° es el estándar recomendado porque ofrece el mejor equilibrio entre velocidad de intercepción y control: con menos de 30° tardas mucho en cerrar la distancia al radial (intercepción muy lenta y gradual); con más de 30-45° te arriesgas a pasarte del curso (overshoot) porque la aguja se mueve muy rápido cerca del centro y es fácil no reaccionar a tiempo. 30° te da tiempo suficiente para anticipar el momento de girar hacia el curso final sin pasarte, y es el ángulo que se enseña y evalúa en la mayoría de programas de entrenamiento." },
      { id: "navegacion-tema9", titulo: "Cómo calcular el rumbo de interceptación", texto: "La fórmula general es: Rumbo de intercepción = Curso deseado ± Ángulo de intercepción, sumando o restando según de qué lado del curso te encuentres. Si tu curso deseado es 360° y la aguja del CDI está a la derecha (estás al oeste del curso), sumas el ángulo: intercepta con rumbo 030°. Si la aguja está a la izquierda (estás al este del curso), restas: intercepta con rumbo 330°. La regla práctica es \"vuela hacia donde apunta la aguja\": si la aguja está a la derecha, tu rumbo de intercepción debe ser mayor que el curso deseado; si está a la izquierda, menor." },
      { id: "navegacion-tema10", titulo: "Seguimiento de radiales (Tracking)", texto: "Tracking es mantener tu avión exactamente sobre el radial o curso deseado durante todo el trayecto, corrigiendo constantemente por el viento. A diferencia de simplemente apuntar la nariz hacia la estación, tracking requiere calcular un Ángulo de Corrección por Viento (WCA) — un pequeño desvío del rumbo respecto al curso, hacia el lado de donde viene el viento, para compensar la deriva. Si el viento te empuja hacia la derecha del curso, corriges volando unos grados a la izquierda del curso hasta que la aguja se mantenga centrada, y ese es tu rumbo real de tracking, no tu curso deseado." },
      { id: "navegacion-tema11", titulo: "Homing vs Tracking", texto: "Homing es la técnica (menos precisa) de simplemente apuntar constantemente la nariz del avión hacia la aguja o hacia la estación, sin calcular corrección de viento — el resultado es una trayectoria curva, ineficiente, porque el viento te va desviando y vas ajustando reactivamente en vez de anticipar. Tracking, en cambio, es mantener una línea recta real sobre el suelo usando un ángulo de corrección calculado de antemano, resultando en una ruta más corta, predecible y profesional. Todo piloto instrumental debe dominar tracking; homing es aceptable solo como aproximación inicial burda, nunca como técnica final." },
      { id: "navegacion-tema12", titulo: "Navegación con dos VOR", texto: "Cuando sintonizas dos estaciones VOR distintas y determinas en qué radial de cada una te encuentras, el punto donde esos dos radiales se cruzan en la carta es tu posición exacta — esta técnica se llama fijación cruzada (cross-fix) y es una de las formas más confiables de confirmar tu posición sin GPS. Se traza cada radial desde su VOR correspondiente en la carta, y la intersección de ambas líneas es tu ubicación real en ese momento. Es una habilidad clásica de navegación por radioayudas que todo piloto debe poder ejecutar manualmente." },
      { id: "navegacion-tema13", titulo: "Qué es un DME", texto: "El DME (Distance Measuring Equipment) mide la distancia real (en línea recta, \"slant range\") entre tu avión y la estación terrestre, en millas náuticas, usando el tiempo que tarda una señal en ir y regresar. Muchas veces está integrado con el VOR (VOR/DME) o con el ILS. Además de distancia, muchos DME calculan y muestran tu velocidad de acercamiento (groundspeed) y tiempo estimado a la estación, información clave para planificación en vuelo. Ojo: a baja altura y muy cerca de la estación, la distancia \"slant range\" no es exactamente igual a tu distancia horizontal real, por la altura del avión." },
      { id: "navegacion-tema14", titulo: "Qué es un HSI", texto: "El HSI (Horizontal Situation Indicator) combina en un solo instrumento el indicador de rumbo (brújula giroscópica) con la información de desviación de curso del VOR/ILS y, en muchos casos, la pendiente de planeo (glideslope). En vez de tener el CDI separado del indicador de rumbo, el HSI los integra visualmente: la rosa de compás gira mostrando tu rumbo real, y sobre ella se superpone la barra de curso seleccionado con su desviación — dándote una imagen mucho más intuitiva de tu situación real respecto al curso, en vez de tener que interpretar dos instrumentos por separado." },
      { id: "navegacion-tema15", titulo: "Cómo usar un HSI", texto: "Para usar el HSI, seleccionas el curso deseado con el selector de curso (similar al OBS), y el instrumento gira una barra sobre la rosa de compás mostrando ese curso en relación a tu rumbo actual. La desviación de la barra respecto al centro funciona igual que un CDI normal, pero con la ventaja de que ves simultáneamente tu rumbo real, así que es mucho más difícil confundirte sobre hacia qué lado debes girar. Muchos HSI también muestran el bug de rumbo deseado para acoplar con el piloto automático, y la aguja de glideslope si estás en una aproximación ILS." },
      { id: "navegacion-tema16", titulo: "Diferencias entre CDI y HSI", texto: "El CDI tradicional muestra solo la desviación del curso, sin contexto de tu rumbo real — tienes que mirar el indicador de rumbo por separado y mentalmente combinar ambas lecturas, lo cual genera el clásico problema de \"sensibilidad inversa\" (reverse sensing) cuando vuelas en la dirección equivocada del curso seleccionado, confundiendo a muchos estudiantes. El HSI resuelve este problema integrando rumbo y desviación en una sola imagen visual: la barra de curso siempre se muestra en su orientación real respecto a tu rumbo, eliminando la confusión de sensibilidad inversa y dándote conciencia situacional instantánea. Por eso el HSI es el estándar en cabinas más modernas y de instrumentos avanzados." },
      { id: "navegacion-tema17", titulo: "Navegación ADF", texto: "El ADF (Automatic Direction Finder) es un sistema de navegación más antiguo que usa estaciones NDB en tierra. A diferencia del VOR, el ADF no te da radiales — su aguja simplemente apunta directamente hacia la estación en todo momento, mostrando el rumbo relativo (relative bearing) medido desde la nariz de tu avión, sin importar hacia dónde estés volando. Esto lo hace más simple pero también menos preciso y más susceptible a interferencia (tormentas eléctricas, terreno, hora del día) que el VOR. Sigue usándose en algunas regiones del mundo donde la infraestructura VOR es limitada." },
      { id: "navegacion-tema18", titulo: "Cómo funciona un NDB", texto: "El NDB (Non-Directional Beacon) transmite una señal de radio en frecuencia baja/media (LF/MF) de forma igual en todas direcciones — a diferencia del VOR, no codifica información de radial alguna. El receptor ADF a bordo detecta hacia qué dirección relativa viene la señal más fuerte y mueve su aguja para apuntar directamente hacia la estación. Esto significa que el NDB por sí solo no te dice en qué radial estás, solo la dirección hacia la estación desde tu posición actual — para saber tu posición real necesitas combinarlo con tu rumbo y, idealmente, otra referencia cruzada." },
      { id: "navegacion-tema19", titulo: "RMI", texto: "El RMI (Radio Magnetic Indicator) combina una rosa de compás giratoria (mostrando tu rumbo magnético real) con una o dos agujas que apuntan hacia estaciones ADF y/o VOR — la diferencia clave frente al ADF simple es que el RMI te muestra el rumbo magnético REAL hacia la estación (no solo relativo a tu nariz), porque la rosa de compás gira junto con tu avión. Esto hace mucho más fácil interpretar tu posición respecto a la estación de un vistazo, sin tener que hacer cálculos mentales de rumbo relativo más rumbo magnético." },
      ],
    },
    {
      titulo: "Cartas VFR y planificación de ruta",
      temas: [
      { id: "navegacion-tema20", titulo: "Cartas VFR", texto: "Las cartas VFR (cartas de navegación visual, tipo sectional) muestran toda la información que necesitas para navegar visualmente: ubicación y clasificación de espacio aéreo (Clase B, C, D, E, G), aeropuertos con sus frecuencias, obstáculos y su altura, elevaciones del terreno, y la ubicación exacta de estaciones VOR con su rosa de compás impresa para poder trazar radiales directamente sobre la carta. Aprender a leer una carta VFR con fluidez —identificar símbolos, calcular elevaciones y reconocer espacio aéreo controlado— es una habilidad base indispensable antes de planear cualquier ruta." },
      { id: "navegacion-tema21", titulo: "Cómo medir distancias", texto: "En una carta VFR, mides distancias usando la escala gráfica impresa en el margen o un plotter de navegación, comparando la longitud de tu ruta trazada contra esa escala. Un truco práctico y confiable: en cualquier carta, un minuto de latitud (medido verticalmente en los bordes izquierdo/derecho de la carta) equivale a una milla náutica — así que puedes usar los bordes de la carta como regla de distancias sin necesitar un plotter especial, siempre midiendo verticalmente, nunca en los bordes horizontales de longitud." },
      { id: "navegacion-tema22", titulo: "Cómo saber la distancia a un aeropuerto", texto: "Tienes varias formas: si el aeropuerto tiene DME o VOR/DME cercano, tu instrumento te da la distancia directa en millas náuticas. Sin DME, puedes usar navegación por estima (dead reckoning): mide la distancia en la carta entre tu posición actual y el aeropuerto, y divide entre tu velocidad respecto al suelo (groundspeed) para saber cuánto tiempo falta. Si tu avión tiene GPS, la distancia y tiempo estimado aparecen directamente en la pantalla — pero como piloto en entrenamiento debes poder calcularlo manualmente sin depender de la electrónica." },
      { id: "navegacion-tema23", titulo: "Cómo planear una ruta VFR", texto: "Planear una ruta VFR involucra: seleccionar puntos de referencia visuales (checkpoints) claramente identificables desde el aire, calcular el rumbo magnético y distancia entre cada uno, estimar tiempo y consumo de combustible por tramo considerando el viento pronosticado, verificar el espacio aéreo que cruzarás y si necesitas autorización o comunicación con algún control, revisar NOTAMs y METAR/TAF de salida, ruta y destino, y siempre definir un aeropuerto alterno con reservas de combustible adecuadas. Un plan de vuelo VFR bien hecho es la diferencia entre un vuelo tranquilo y una situación de estrés innecesario en el aire." },
      { id: "navegacion-tema24", titulo: "Ejemplo MMGL → MMZO", texto: "Tomemos la ruta real Guadalajara (MMGL) a Manzanillo (MMZO) como ejercicio integrador de todo el módulo: identificas los VOR disponibles en la ruta para usarlos como checkpoints o para tracking directo, mides la distancia total y por tramos en la carta VFR, calculas el rumbo magnético inicial y cómo cambia si sigues radiales de un VOR intermedio, estimas tiempo total según tu velocidad de crucero y viento pronosticado, y planeas un alterno (por ejemplo Colima) por si las condiciones en Manzanillo no son favorables. Este tipo de ejercicio práctico, aplicando radiales, tracking y cálculo de distancias sobre una ruta real, es exactamente lo que se evalúa en un checkride de navegación." },
      ],
    },
  ],
  "cartografia": [
    {
      titulo: "Elementos y símbolos de la carta VFR",
      temas: [
      { id: "cartografia-tema1", titulo: "Tipos de cartas", texto: "Existen varios tipos de cartas aeronáuticas según su propósito. Las Cartas VFR (Sectional Charts) son las más usadas para vuelo visual, a escala 1:500,000, mostrando terreno, obstáculos, espacio aéreo y aeródromos con gran detalle. Las Cartas de Área Terminal (TAC) cubren zonas de espacio aéreo denso alrededor de grandes ciudades con más detalle aún. Para vuelo IFR existen las Cartas de Ruta de Baja Altitud (para aerovías bajo FL180) y Alta Altitud (para niveles superiores), mucho más simplificadas visualmente porque priorizan aerovías, fixes y frecuencias sobre el detalle del terreno. Las Cartas de Aproximación (approach plates) muestran el procedimiento detallado para aterrizar en un aeropuerto específico bajo IFR." },
      { id: "cartografia-tema2", titulo: "Símbolos", texto: "Cada carta usa una simbología estandarizada que debes memorizar: los aeropuertos con torre de control se dibujan con un círculo azul relleno, los no controlados en magenta; la longitud de las líneas que salen del círculo indica si la pista es dura (relleno sólido) o de superficie blanda (contorno abierto). Los obstáculos se marcan con un punto y una torre pequeña, acompañados de su altura. El terreno de mayor elevación se sombrea en tonos más oscuros de café/naranja según su altura. Aprender la leyenda de tu carta (impresa en los márgenes) es el primer paso — ahí están explicados todos los símbolos oficialmente." },
      { id: "cartografia-tema3", titulo: "Espacios aéreos", texto: "El espacio aéreo se divide en clases con distintos requisitos: Clase A (arriba de FL180, solo IFR), Clase B (alrededor de los aeropuertos más grandes, requiere autorización explícita de control para entrar, representada en la carta con círculos concéntricos sólidos azules), Clase C (aeropuertos medianos, requiere contacto por radio pero no autorización explícita, círculos magenta sólidos), Clase D (aeropuertos con torre, líneas discontinuas azules), Clase E (espacio controlado general, líneas discontinuas magenta o sombreado), y Clase G (espacio no controlado, sin marcado especial, generalmente a baja altura en zonas rurales). Reconocer estos límites en la carta antes de volar es obligatorio para evitar violaciones de espacio aéreo." },
      { id: "cartografia-tema4", titulo: "Obstáculos", texto: "Los obstáculos —torres de radio, antenas, edificios altos, grúas permanentes— se representan con un símbolo de torre y un punto en su base exacta. Junto al símbolo aparecen dos números: la altura sobre el nivel del mar (MSL) y, entre paréntesis, la altura sobre el terreno (AGL). Por ejemplo, un obstáculo marcado \"1500 (450)\" significa que su punta está a 1,500 pies MSL, de los cuales 450 pies son la estructura misma sobre el terreno local. Los obstáculos de más de 1,000 pies AGL suelen resaltarse con un símbolo más grande por su relevancia para la planificación de rutas y altitudes mínimas de seguridad." },
      ],
    },
    {
      titulo: "Elevaciones, frecuencias, puntos VFR y lectura completa",
      temas: [
      { id: "cartografia-tema5", titulo: "Elevaciones", texto: "Las cartas VFR muestran la elevación del terreno mediante sombreado en capas de color (más oscuro = más alto) y líneas de contorno en zonas montañosas. Además, cada cuadrante de la carta (delimitado por líneas de latitud/longitud) tiene impreso un número grande llamado MEF (Maximum Elevation Figure) — la altitud más alta redondeada hacia arriba al siguiente centenar o millar de pies dentro de ese cuadrante, incluyendo el obstáculo más alto conocido más un margen de seguridad. El MEF es tu referencia rápida para saber la altitud mínima segura de sobrevuelo en cualquier cuadrante sin necesidad de revisar cada elevación individual." },
      { id: "cartografia-tema6", titulo: "Frecuencias", texto: "Las frecuencias de radio relevantes se imprimen directamente junto a cada aeropuerto y límite de espacio aéreo en la carta: CTAF (frecuencia común de tráfico en aeropuertos no controlados), Torre, Aproximación/Salida, y ATIS, generalmente en pequeñas cajas de texto en azul o magenta según la clase de espacio aéreo asociado. Antes de acercarte a cualquier aeropuerto o zona de espacio aéreo controlado, debes identificar en la carta qué frecuencia necesitas contactar y en qué punto exacto de tu ruta debes hacerlo — normalmente indicado por el límite dibujado del espacio aéreo correspondiente." },
      { id: "cartografia-tema7", titulo: "Puntos VFR", texto: "Los Puntos de Notificación VFR son ubicaciones visuales específicas —cerros, cruces de carreteras, presas, poblados reconocibles— marcadas en la carta con un símbolo de estrella o triángulo magenta y un nombre corto, usados para comunicar tu posición a control de forma rápida y estandarizada cerca de aeropuertos con tráfico denso o espacio aéreo Clase B/C/D. En vez de dar coordenadas o describir tu ubicación, simplemente reportas \"sobre el punto Vista Hermosa\" y el controlador sabe exactamente dónde estás. Memorizar los puntos VFR de tus aeropuertos frecuentes agiliza mucho la comunicación." },
      { id: "cartografia-tema8", titulo: "Cómo leer una carta completa", texto: "Leer una carta completa es integrar todo lo anterior en un solo vistazo antes de volar: identifica tu ruta general y qué espacios aéreos vas a cruzar, revisa el MEF de cada cuadrante que atravesarás para definir tu altitud mínima segura, ubica los obstáculos relevantes en tu trayectoria, localiza los VOR y puntos VFR que usarás como checkpoints, y anota las frecuencias que necesitarás contactar en cada etapa. Un buen hábito es trazar tu ruta completa en la carta ANTES del vuelo con lápiz o marcador, marcando cada checkpoint con su rumbo, distancia y tiempo estimado — así en el aire solo confirmas contra el plan, en vez de estar interpretando la carta en tiempo real bajo presión." },
      ],
    },
  ],
  "comunicaciones": [
    {
      titulo: "Fraseología estándar: torre, rodaje y despegue",
      temas: [
      { id: "comunicaciones-tema1", titulo: "Fraseología básica", texto: "La fraseología aeronáutica es un lenguaje estandarizado a nivel mundial (basado en inglés OACI, adaptado al español en países hispanohablantes) diseñado para eliminar ambigüedad en la comunicación radio. Incluye el alfabeto fonético (Alfa, Bravo, Charlie, Delta...) para deletrear matrículas y letras sin confusión, pronunciación estándar de números (dígito por dígito: \"tres cinco cero\" en vez de \"trescientos cincuenta\"), y palabras clave con significado fijo: Afirmativo (sí), Negativo (no), Wilco (voy a cumplir la instrucción), Roger (recibido, entendido, sin implicar que cumplirás). Usar fraseología estándar —en vez de lenguaje coloquial— reduce errores y acelera la comunicación en frecuencias congestionadas." },
      { id: "comunicaciones-tema2", titulo: "Primer contacto con Torre", texto: "El primer contacto con cualquier estación sigue una estructura fija: a quién llamas, quién eres, y qué necesitas — en ese orden. Ejemplo: \"Torre Guadalajara, Cessna XB-VLA, en plataforma, solicito rodaje para salida local con información Bravo.\" Nunca omitas tu matrícula completa en el primer contacto (después, torre puede autorizarte a usar solo la última parte). Incluir la letra de información ATIS que recibiste confirma que tienes los datos meteorológicos actuales y evita que te los repitan innecesariamente." },
      { id: "comunicaciones-tema3", titulo: "Rodaje", texto: "La autorización de rodaje especifica la ruta exacta que debes seguir y cualquier punto donde debes detenerte y esperar (hold short). Ejemplo de instrucción: \"XB-VLA, ruede a pista 20 por calle Alfa, mantenga corto de pista 02.\" Debes leer de vuelta (readback) cualquier instrucción de \"mantener corto\" (hold short) de una pista, sin excepción — es una de las pocas instrucciones donde el readback es obligatorio siempre, porque un error aquí puede causar una incursión de pista. Si no tienes clara la ruta, pide que la repitan antes de moverte." },
      { id: "comunicaciones-tema4", titulo: "Antes del despegue", texto: "Antes de solicitar la pista, completas tus listas de verificación (run-up, checklist previa a despegue) en la plataforma de espera o punto de espera designado. Al estar listo, contactas: \"Torre, XB-VLA, listo para despegue, pista 20.\" La torre puede darte instrucciones adicionales de espera (\"mantenga posición\", \"line up and wait\" en fraseología internacional) si hay tráfico en la pista o en corta final. Nunca cruces el umbral de la pista sin autorización explícita, incluso si la pista parece despejada — la autorización verbal es obligatoria, no opcional." },
      { id: "comunicaciones-tema5", titulo: "Autorización de despegue", texto: "La autorización de despegue tiene un formato específico que debes leer de vuelta completo: \"XB-VLA, autorizado a despegar pista 20, viento 200 a 8 nudos.\" Tu readback debe incluir tu matrícula y la confirmación de \"autorizado a despegar pista 20\" — no basta con decir \"copiado\" o \"roger\". Si la autorización menciona una pista distinta a la que esperas, o algo no coincide con tu plan, pide confirmación inmediata antes de iniciar el despegue; nunca asumas que fue un error de la torre sin confirmar." },
      { id: "comunicaciones-tema6", titulo: "En circuito", texto: "Dentro del circuito de tráfico (patrón), los reportes de posición siguen el orden del circuito: viento en cola (downwind), base, y final. Ejemplo: \"Torre, XB-VLA, viento en cola pista 20\" ... \"XB-VLA, base pista 20\" ... \"XB-VLA, final pista 20.\" Estos reportes le permiten a la torre secuenciar el tráfico y a otros pilotos en el circuito tener conciencia situacional de dónde estás, incluso en aeropuertos no controlados donde te reportas en la frecuencia CTAF sin que nadie te responda directamente, solo para informar a otros pilotos." },
      { id: "comunicaciones-tema7", titulo: "Reportes de posición", texto: "Fuera del circuito, los reportes de posición en ruta siguen un formato estándar: quién eres, dónde estás (usualmente sobre un punto VFR o VOR/radial), tu altitud, y tus intenciones. Ejemplo: \"XB-VLA, sobre el punto Vista Hermosa, seis mil quinientos pies, en tránsito hacia Guadalajara.\" Estos reportes son especialmente importantes cerca de espacio aéreo controlado o en zonas de tráfico denso, donde control (o incluso otros pilotos monitoreando la frecuencia) necesitan saber tu posición exacta para mantener separación." },
      ],
    },
    {
      titulo: "Circuito, aproximación, IFR, emergencias y errores comunes",
      temas: [
      { id: "comunicaciones-tema8", titulo: "Tránsito VFR", texto: "Para cruzar espacio aéreo controlado sin aterrizar (Clase B, C o D) necesitas solicitar y recibir autorización de tránsito VFR antes de entrar. Ejemplo de solicitud: \"Aproximación Guadalajara, Cessna XB-VLA, solicito tránsito VFR de norte a sur, seis mil pies, sobre la ciudad.\" Control puede autorizarte tal cual la solicitud, darte una ruta específica, una altitud distinta, o negarte el tránsito si hay demasiado tráfico — en cuyo caso debes desviarte para rodear el espacio aéreo en vez de cruzarlo sin autorización." },
      { id: "comunicaciones-tema9", titulo: "Aproximación", texto: "Al acercarte a tu aeropuerto de destino dentro de espacio aéreo controlado, usualmente contactas primero a Aproximación (Approach) antes de que te transfieran a Torre. Aproximación te da vectores, altitudes y secuenciación respecto a otro tráfico: \"XB-VLA, vire rumbo 180, descienda y mantenga cinco mil pies, espere vectores para secuencia visual con tráfico Cessna al frente.\" Escucha con atención cualquier instrucción de tráfico a la vista (\"tráfico a las 10, dos millas, mismo nivel\") y reporta cuando lo tengas visualmente." },
      { id: "comunicaciones-tema10", titulo: "Aterrizaje", texto: "La autorización de aterrizaje llega típicamente cuando estás en tramo final: \"XB-VLA, autorizado a aterrizar pista 20, viento 190 a 6 nudos.\" Igual que con el despegue, tu readback debe confirmar \"autorizado a aterrizar pista 20\" con tu matrícula. Si vas a hacer un touch-and-go (toque y despegue) en vez de aterrizaje completo, debes solicitarlo explícitamente y la autorización lo reflejará: \"autorizado toque y despegue pista 20.\" Nunca asumas autorización de aterrizaje solo porque no escuchaste instrucción contraria — el silencio no es autorización." },
      { id: "comunicaciones-tema11", titulo: "Comunicaciones IFR", texto: "Bajo reglas IFR, las comunicaciones son más estructuradas y con mayor carga de información: recibes tu autorización de vuelo (clearance) antes de salir, incluyendo ruta, altitud inicial, código transpondedor (squawk) y frecuencia de salida — todo debe leerse de vuelta completo y correctamente, palabra por palabra, especialmente el código squawk y las altitudes. Un \"readback correcto\" confirmado por control es lo que te autoriza a proceder; si tu readback tiene un error, control te corregirá y debes repetir la versión correcta antes de continuar. La disciplina de readback es aún más crítica en IFR porque hay menos margen de referencia visual para detectar errores." },
      { id: "comunicaciones-tema12", titulo: "Emergencias", texto: "Existen dos niveles de llamada de emergencia por radio: PAN-PAN (repetido 3 veces) para una situación urgente que no representa peligro inmediato de vida (por ejemplo, un pasajero enfermo), y MAYDAY (repetido 3 veces) para peligro grave e inminente (falla de motor, incendio a bordo). El formato es: \"MAYDAY, MAYDAY, MAYDAY, [matrícula], [naturaleza de la emergencia], [posición], [altitud], [almas a bordo], [combustible restante], [intenciones].\" Declarar una emergencia te da prioridad absoluta sobre cualquier otro tráfico y control hará todo lo posible por asistirte — no dudes en declararla si la situación lo amerita, es preferible declarar de más que de menos." },
      { id: "comunicaciones-tema13", titulo: "Errores comunes", texto: "Los errores más frecuentes en comunicaciones incluyen: omitir el readback de instrucciones críticas (especialmente \"mantenga corto\" de pista y autorizaciones de despegue/aterrizaje), usar tu matrícula incompleta antes de que torre te autorice a abreviarla, bloquear la frecuencia hablando al mismo tiempo que otra estación (\"stepping on\" transmisiones), asumir una autorización que nunca se dio explícitamente, y usar lenguaje coloquial en vez de fraseología estándar en momentos críticos. La disciplina de radio no es cuestión de sonar profesional — es una herramienta de seguridad: cada elemento de la fraseología existe porque previene un tipo específico de error o malentendido que históricamente ha causado incidentes." },
      ],
    },
  ],
  "instrumentos": [
    {
      titulo: "Instrumentos de vuelo: altímetro, velocidad, actitud y viraje",
      temas: [
      { id: "instrumentos-tema1", titulo: "Altímetro", texto: "El altímetro mide tu altitud usando la presión estática del aire exterior, comparándola contra una referencia que ajustas manualmente en la ventana Kollsman (en pulgadas de mercurio, inHg). Existen varios tipos de altitud: Indicada (lo que lees directo), Verdadera (altura real sobre el nivel del mar, corregida por temperatura), de Presión (referencia estándar 29.92), y de Densidad (ajustada por temperatura y presión, la que afecta el rendimiento real del avión). Regla clave: 'de alta a baja presión, cuidado abajo' — si vuelas de una zona de alta presión hacia una de baja sin ajustar tu Kollsman, tu altímetro te muestra más altura de la que realmente tienes, un error peligroso cerca del terreno." },
      { id: "instrumentos-tema2", titulo: "Velocidad indicada", texto: "El indicador de velocidad (Airspeed Indicator) mide la diferencia entre presión dinámica (captada por el tubo pitot, que enfrenta el viento relativo) y presión estática, traduciéndola en velocidad. El disco tiene arcos de color con significado operacional: blanco (rango de operación de flaps), verde (rango normal de operación), amarillo (precaución, solo en aire calmo), y una línea roja (Vne, velocidad nunca exceder). Es importante distinguir IAS (velocidad indicada, lo que lees), CAS (corregida por errores del instrumento), y TAS (verdadera, ajustada por densidad del aire a tu altitud) — a mayor altitud, tu TAS real es mayor que tu IAS indicada." },
      { id: "instrumentos-tema3", titulo: "Horizonte artificial", texto: "El Horizonte Artificial (Attitude Indicator) es tu referencia primaria de actitud: muestra tu inclinación (bank) y cabeceo (pitch) respecto al horizonte real, usando un giroscopio que mantiene su orientación en el espacio independientemente del movimiento del avión. Tradicionalmente accionado por vacío (bomba de vacío) o eléctricamente en aviones más modernos. Es especialmente crítico en vuelo por instrumentos (IMC), donde es tu única referencia confiable de actitud sin visibilidad exterior. Como cualquier giróscopo mecánico, puede sufrir precesión (error gradual acumulado) y requiere revisión periódica contra otros instrumentos para confirmar que sigue siendo confiable." },
      { id: "instrumentos-tema4", titulo: "Giro y viraje", texto: "El indicador de Giro y Viraje (Turn and Bank / Turn Needle) muestra tu TASA de giro —qué tan rápido estás virando en grados por segundo— no tu ángulo de inclinación. Un 'viraje estándar' (standard rate turn) es 3 grados por segundo, completando un giro de 360° en exactamente 2 minutos, y es la referencia que se enseña para procedimientos instrumentales. Junto a la aguja de tasa de giro va la bola inclinómetro, que indica si tu viraje está coordinado (bola centrada), derrapando hacia afuera (skidding, bola hacia el lado exterior del viraje) o resbalando hacia adentro (slipping, bola hacia el interior) — información clave para pisar el pedal correcto y corregir." },
      { id: "instrumentos-tema5", titulo: "Coordinador de viraje", texto: "El Coordinador de Viraje (Turn Coordinator) es una evolución del indicador de giro y viraje: en vez de una aguja simple, usa un pequeño avión miniatura inclinado que muestra tanto tu velocidad de alabeo (roll rate) como tu tasa de giro combinadas en un solo movimiento. Mantiene la misma bola inclinómetro en la base para verificar coordinación. Es más intuitivo de leer en maniobras dinámicas porque responde más rápido al inicio de un viraje que el indicador de giro tradicional, dándote información antes en la maniobra." },
      { id: "instrumentos-tema6", titulo: "VSI", texto: "El VSI (Vertical Speed Indicator, o Variómetro) muestra tu tasa de ascenso o descenso en pies por minuto (fpm), midiendo el cambio en la presión estática a través de un sistema de fuga calibrada. Su característica más importante es el retraso (lag) inherente de 6-9 segundos: no muestra tu tasa vertical instantánea, sino una tendencia con retraso, por lo que no debes usarlo como referencia primaria para maniobras rápidas de cabeceo — el horizonte artificial es más inmediato para eso. El VSI es excelente para mantener tasas constantes de ascenso/descenso durante tramos prolongados, como en una aproximación estabilizada." },
      ],
    },
    {
      titulo: "VSI, compás, HSI, RMI, DME y transponder",
      temas: [
      { id: "instrumentos-tema7", titulo: "Compás", texto: "El compás magnético es el instrumento de rumbo más simple y el único que funciona sin electricidad ni vacío, pero sufre errores característicos que debes conocer: Variación (diferencia entre norte magnético y verdadero, varía por ubicación geográfica), Desviación (interferencia de componentes eléctricos/metálicos del propio avión), y errores dinámicos por la inclinación magnética (dip) — el más conocido es ANDS (Accelerate North, Decelerate South en el hemisferio norte): al acelerar volando hacia el norte el compás indica un giro hacia el norte que no existe, y al desacelerar volando hacia el sur ocurre lo opuesto. También oscila y se retrasa durante virajes, por lo que en maniobras se usa el indicador de rumbo giroscópico, recalibrado periódicamente contra el compás en vuelo recto y nivelado." },
      { id: "instrumentos-tema8", titulo: "HSI", texto: "Como instrumento físico, el HSI combina un giro direccional (heading gyro) con la información de desviación de curso VOR/ILS en una sola carátula integrada. A diferencia del compás magnético, no sufre de los errores dinámicos de oscilación y ANDS porque su referencia de rumbo es giroscópica, no magnética directa — aunque debe sincronizarse periódicamente con el compás magnético para corregir la deriva natural del giróscopo (precesión). Es uno de los instrumentos de \"seis pack avanzado\" que reemplaza tanto al indicador de rumbo como al CDI tradicional en cabinas más equipadas." },
      { id: "instrumentos-tema9", titulo: "RMI", texto: "Como instrumento físico, el RMI combina una carátula de compás giroscópico (igual que el indicador de rumbo) con una o dos agujas indicadoras que apuntan hacia estaciones ADF y/o VOR sintonizadas. La rosa completa gira con tu rumbo real, así que las agujas siempre muestran el rumbo magnético verdadero hacia la estación, no solo un rumbo relativo a tu nariz como el ADF simple. Es apreciado por su capacidad de dar orientación instantánea respecto a dos estaciones simultáneamente, útil para fixes cruzados sin cálculos mentales adicionales." },
      { id: "instrumentos-tema10", titulo: "DME", texto: "Como instrumento físico, el DME transmite un pulso de interrogación a la estación terrestre y mide el tiempo que tarda en recibir la respuesta, calculando la distancia por la velocidad conocida de la señal de radio. La carátula típica muestra tres datos simultáneos: distancia en millas náuticas, velocidad de acercamiento (groundspeed) calculada por el cambio de distancia en el tiempo, y tiempo estimado a la estación. Es común encontrarlo integrado físicamente con el receptor de NAV/VOR en el mismo panel, ya que ambos suelen sintonizar la misma frecuencia de estación." },
      { id: "instrumentos-tema11", titulo: "Transponder", texto: "El Transponder es el equipo que responde automáticamente a las interrogaciones del radar de control de tráfico aéreo, transmitiendo un código de 4 dígitos (squawk) que identifica tu aeronave en la pantalla del controlador, junto con tu altitud si tienes Modo C o Modo S (que además transmite datos adicionales). Existen códigos de squawk universales de emergencia que nunca debes usar salvo la situación correspondiente: 7500 (secuestro/interferencia ilícita), 7600 (falla de comunicaciones), y 7700 (emergencia general). El botón IDENT resalta momentáneamente tu posición en la pantalla del controlador cuando te lo solicitan, útil para que te identifiquen entre tráfico denso." },
      ],
    },
  ],
  "rendimiento": [
    {
      titulo: "Peso, balance y distancias de despegue/aterrizaje",
      temas: [
      { id: "rendimiento-tema1", titulo: "Peso y balance", texto: "Todo avión tiene un Peso Máximo de Despegue certificado (Max Gross Weight) que no puedes exceder bajo ninguna circunstancia — hacerlo compromete la estructura, el rendimiento de despegue, la tasa de ascenso, y la velocidad de pérdida real. El cálculo parte del Peso Vacío del avión (Empty Weight, incluye el avión y fluidos operativos), al que sumas tripulación, pasajeros, equipaje y combustible para obtener tu Peso Bruto de la operación (Gross Weight). La diferencia entre el peso máximo certificado y el peso vacío es tu Carga Útil (Useful Load) — lo que realmente puedes cargar entre personas, equipaje y combustible, sin exceder el límite." },
      { id: "rendimiento-tema2", titulo: "Centro de gravedad", texto: "El Centro de Gravedad (CG) es el punto donde, teóricamente, se concentra todo el peso del avión — y debe mantenerse dentro de un rango certificado (el 'sobre' o envelope de CG) para que el avión sea controlable y estable. Se calcula mediante Momento = Peso × Brazo (distancia desde un punto de referencia), sumando los momentos de cada elemento (piloto, pasajeros, equipaje, combustible) y dividiendo entre el peso total para obtener la posición del CG. Un CG muy adelantado hace al avión más estable pero pesado de controlar en cabeceo (especialmente en el flare de aterrizaje); un CG muy atrasado lo hace más ágil pero peligrosamente inestable, con riesgo de entrar en pérdida sin previo aviso claro." },
      { id: "rendimiento-tema3", titulo: "Distancia de despegue", texto: "La distancia de despegue depende de múltiples factores que debes calcular antes de cada vuelo usando las gráficas de rendimiento del manual (POH/AFM): peso de la aeronave (a mayor peso, mayor distancia), altitud de densidad (a mayor altitud de densidad, motor y alas rinden menos, mayor distancia), viento (viento de frente reduce la distancia, viento de cola la aumenta significativamente), y condición de la pista (pista mojada, con pasto, o con pendiente ascendente aumentan la distancia necesaria). Nunca asumas que 'siempre me ha alcanzado la pista' — cada combinación de peso, densidad y viento es distinta, y calcular mal puede significar no despegar a tiempo con obstáculos al final de la pista." },
      { id: "rendimiento-tema4", titulo: "Distancia de aterrizaje", texto: "Similar al despegue, la distancia de aterrizaje se ve afectada por peso (mayor peso = mayor velocidad de aproximación = mayor distancia de frenado), altitud de densidad (afecta la velocidad real de touchdown aunque la indicada sea la misma), viento (de frente reduce distancia, de cola la aumenta drásticamente — un viento de cola de solo 10 nudos puede aumentar la distancia de aterrizaje 20-30%), y superficie de la pista (mojada o con contaminantes reduce la efectividad del frenado). Las gráficas de rendimiento del POH deben consultarse antes de cualquier aterrizaje en pista corta o con condiciones fuera de lo habitual, no solo confiar en la experiencia." },
      ],
    },
    {
      titulo: "Performance, V-speeds y viento cruzado",
      temas: [
      { id: "rendimiento-tema5", titulo: "Performance", texto: "Las gráficas de rendimiento (performance charts) en el manual de tu avión son la herramienta central para todos los cálculos anteriores: te permiten entrar con condiciones específicas (peso, temperatura, altitud de presión, viento) y obtener distancias, tasas de ascenso, consumo de combustible o alcance esperado. La habilidad clave es la interpolación — cuando tus condiciones reales caen entre dos líneas o valores impresos en la gráfica, debes estimar proporcionalmente el valor intermedio, no simplemente redondear al valor más cercano. Siempre aplica un margen de seguridad adicional sobre el valor calculado (comúnmente 30-50% extra en distancia de pista), ya que las gráficas se hicieron con aviones nuevos y pilotos de prueba en condiciones ideales." },
      { id: "rendimiento-tema6", titulo: "V-speeds", texto: "Las V-speeds son velocidades codificadas críticas para operar tu avión con seguridad: Vs (pérdida en configuración limpia), Vs0 (pérdida en configuración de aterrizaje), Vx (mejor ángulo de ascenso, para despejar obstáculos), Vy (mejor tasa de ascenso, para ganar altura más rápido en tiempo), Va (velocidad de maniobra, máxima para aplicar controles bruscos sin dañar estructura), Vfe (máxima con flaps extendidos), Vno (máxima estructural normal), Vne (nunca exceder), y Vr (rotación, velocidad a la que levantas la nariz en el despegue). Memorizar las V-speeds específicas de TU avión (no solo el concepto general) es examinable y, más importante, es lo que evita que dañes la estructura o entres en pérdida en el momento equivocado." },
      { id: "rendimiento-tema7", titulo: "Viento cruzado", texto: "El componente de viento cruzado es la parte del viento que sopla perpendicular a la pista (no alineada con ella), y determina qué tan desafiante será tu despegue o aterrizaje. Se calcula usando el ángulo entre el viento reportado y el rumbo de la pista — cuanto más cerca de 90°, mayor el componente cruzado; cuanto más cerca de 0° (viento alineado con la pista), menor. Cada avión tiene un Viento Cruzado Máximo Demostrado (Max Demonstrated Crosswind) en su manual — no es un límite legal absoluto, pero operar por encima de ese valor está fuera de lo que el fabricante probó y documentó. Las dos técnicas principales para manejarlo son el Crab (apuntar la nariz contra el viento durante la aproximación, alineando justo antes del touchdown) y el Sideslip (bajar el ala hacia el viento con alerón mientras usas el timón opuesto para mantener la nariz alineada con la pista durante todo el aterrizaje)." },
      ],
    },
  ],
  "operacion": [
    {
      titulo: "Inspección, arranque, taxi, run-up y despegue",
      temas: [
      { id: "operacion-tema1", titulo: "Inspección pre-vuelo", texto: "La inspección pre-vuelo (walk-around) es tu primera línea de defensa contra fallas mecánicas en el aire, y debe hacerse SIEMPRE de forma sistemática, siguiendo el mismo patrón cada vez (usualmente en sentido de las manecillas del reloj alrededor del avión) para no saltarte ningún punto. Revisas: superficies de control (movimiento libre, sin daño), niveles de fluidos (aceite, combustible visualmente en los tanques), presión y estado de las llantas, estructura general (sin abolladuras, grietas o corrosión visible), luces, antenas, y drenado de agua del sistema de combustible. Nunca te saltes la inspección por 'ya la volé ayer' — las condiciones cambian de un vuelo a otro, incluso de una hora a otra." },
      { id: "operacion-tema2", titulo: "Checklist", texto: "Una checklist no reemplaza tu conocimiento del avión — verifica que aplicaste correctamente ese conocimiento. La técnica recomendada es 'flujo + verificación': primero ejecutas la secuencia de acciones de memoria en un flujo lógico por la cabina, y luego lees la checklist para CONFIRMAR que no omitiste nada, en vez de leer y ejecutar cada línea una por una desde cero. Existen checklists Normales (operación de rutina), Anormales (situaciones fuera de lo común pero no de emergencia inmediata), y de Emergencia (memorizables para los primeros pasos críticos, luego consultadas para el resto). La disciplina de usar checklist en cada vuelo, sin importar tu experiencia, es lo que distingue a un piloto profesional de uno que confía solo en su memoria." },
      { id: "operacion-tema3", titulo: "Arranque del motor", texto: "El arranque de motor sigue una secuencia específica del fabricante, pero generalmente incluye: verificar mezcla y palanca de potencia en posición correcta, cebado (priming) si el motor lo requiere en frío, encendido de la bomba de combustible si aplica, y antes de girar la llave, la llamada de seguridad 'DESPEJADO' (clear prop) en voz alta para alertar a cualquiera cerca de la hélice. Una vez arrancado, monitoreas inmediatamente la presión de aceite — si no sube en los primeros segundos, apagas el motor de inmediato, ya que operar sin lubricación adecuada puede dañar el motor severamente en muy poco tiempo." },
      { id: "operacion-tema4", titulo: "Taxi", texto: "Durante el rodaje controlas la dirección principalmente con los pedales de timón (que mueven la rueda de nariz en la mayoría de entrenadores) y usas potencia mínima necesaria para mantener movimiento, evitando velocidades excesivas. Verifica el funcionamiento de los frenos justo al iniciar el movimiento (un leve toque para confirmar respuesta antes de continuar). Mantén conciencia situacional constante de otro tráfico, vehículos de servicio, y instrucciones de control si estás en un aeropuerto controlado — el rodaje es quizás el momento donde más incursiones de pista y colisiones en tierra ocurren por distracción, así que exige la misma atención que el vuelo mismo." },
      { id: "operacion-tema5", titulo: "Run-up", texto: "El run-up (prueba de motor antes de despegue) se hace generalmente en un punto designado cerca de la cabecera de pista, con el avión orientado contra el viento y frenos aplicados firmemente. Incluye: verificar cada magneto individualmente (la caída de RPM al cambiar de AMBOS a solo uno debe estar dentro del rango del manual, y ninguno debe apagar el motor completamente), probar el calentador de carburador si aplica, revisar instrumentos del motor (temperaturas, presiones dentro de rango normal), y completar la checklist 'antes de despegue' que incluye configuración final de flaps, trim, y repaso mental de qué harás si el motor falla justo después de despegar." },
      { id: "operacion-tema6", titulo: "Despegue", texto: "Durante la carrera de despegue, mantienes la dirección con los pedales de timón mientras aplicas potencia completa suavemente pero sin demora, monitoreando los instrumentos del motor en los primeros segundos para confirmar parámetros normales — si algo se ve mal, todavía tienes pista para abortar. Al alcanzar la velocidad de rotación (Vr) específica de tu avión, aplicas presión suave hacia atrás en los controles para levantar la nariz y comenzar el ascenso inicial. Después del despegue, sigues el procedimiento de 'limpieza' de configuración: retraer flaps si los usaste (a la altura/velocidad segura indicada en tu POH) y, si tu avión tiene tren retráctil, retraerlo en el momento apropiado según el manual." },
      ],
    },
    {
      titulo: "Ascenso, crucero, descenso, aproximación y aterrizaje",
      temas: [
      { id: "operacion-tema7", titulo: "Ascenso", texto: "Durante el ascenso eliges entre Vx (mejor ángulo, para despejar obstáculos cercanos rápidamente en altura por distancia recorrida) o Vy (mejor tasa, para ganar altitud más rápido en tiempo, una vez pasados los obstáculos inmediatos) según la situación. Monitoreas temperaturas del motor con más atención que en crucero, ya que el ascenso prolongado con potencia alta y velocidad relativamente baja genera menos flujo de aire de enfriamiento. En motores con mezcla ajustable, muchos POH recomiendan empobrecer ligeramente la mezcla por encima de cierta altitud para mantener la combustión eficiente, aunque en ascensos cortos a baja altitud generalmente se mantiene mezcla rica." },
      { id: "operacion-tema8", titulo: "Crucero", texto: "Al nivelar en tu altitud de crucero, reduces potencia gradualmente al ajuste recomendado por el POH para esa configuración, y ajustas la mezcla de combustible (leaning) para optimizar consumo y rendimiento del motor a esa altitud específica — volar en crucero con mezcla completamente rica innecesariamente desperdicia combustible y puede ensuciar bujías. Este es también el momento de menor carga de trabajo relativo para tareas de navegación: confirmar tu posición contra el plan de vuelo, ajustar el rumbo por deriva de viento, y hacer tus reportes de posición si aplica, sin descuidar el escaneo visual constante de tráfico." },
      { id: "operacion-tema9", titulo: "Descenso", texto: "Planear el punto de inicio de descenso con anticipación evita tener que descender abruptamente cerca del destino. Una regla práctica común: multiplica la altitud a perder (en miles de pies) por 3, y ese es aproximadamente cuántas millas antes del punto deseado debes iniciar el descenso a una tasa razonable (~500 fpm). Antes de descender, reduces potencia gradualmente, y muchos pilotos aprovechan este momento para reajustar la mezcla hacia más rica conforme bajan de altitud, revisar el altímetro contra el reporte meteorológico actual de destino, y repasar mentalmente la configuración esperada de aproximación y aterrizaje." },
      { id: "operacion-tema10", titulo: "Aproximación", texto: "Al entrar al circuito de tráfico de tu destino, configuras progresivamente el avión: reduces potencia, extiendes flaps en las etapas y velocidades indicadas por tu POH, y estableces una aproximación estabilizada — mantenida en la velocidad correcta, con la tasa de descenso adecuada, alineado con la pista, configurado completamente, antes de cruzar el umbral. Una aproximación inestable (muy rápida, muy alta, mal alineada, o con configuración incompleta) es la señal más clara para ejecutar un go-around (motor y al aire) en vez de forzar el aterrizaje — decisión que siempre debe tomarse sin dudar ni sentir vergüenza." },
      { id: "operacion-tema11", titulo: "Aterrizaje", texto: "El aterrizaje culmina con el flare (redondeo): reduces la tasa de descenso justo antes de tocar tierra, elevando gradualmente la nariz para que las llantas principales toquen primero suavemente, cerca de tu velocidad de pérdida en configuración de aterrizaje (Vs0). Mantén los controles activos durante todo el rodaje después de tocar tierra, especialmente en viento cruzado, hasta detenerte completamente o reducir a velocidad de rodaje segura. Si en cualquier momento del flare o aterrizaje algo no se siente correcto —velocidad excesiva, deriva lateral no corregida, bote (bounce)— la decisión correcta sigue siendo el go-around, incluso a pocos pies del suelo." },
      { id: "operacion-tema12", titulo: "Después del aterrizaje", texto: "Una vez fuera de la pista activa (cruzando completamente la línea de espera), ejecutas la checklist 'después de aterrizaje': usualmente retraer flaps, apagar luces de aterrizaje si aplica, y ajustar la mezcla según el rodaje hacia la plataforma. Al llegar a tu posición de estacionamiento, sigues el procedimiento de apagado del motor (mezcla a corte, magnetos apagados, verificación de que todo quede en posición segura), y completas la inspección post-vuelo: anotar cualquier anomalía observada durante el vuelo, asegurar el avión (calzos, amarres si aplica), y dejar la bitácora actualizada para el siguiente piloto o para mantenimiento." },
      ],
    },
  ],
  "espacios-aereos": [
    {
      titulo: "Espacio aéreo controlado: Clases A a E",
      temas: [
      { id: "espacios-aereos-tema1", titulo: "Clase A", texto: "El espacio aéreo Clase A abarca desde FL180 (18,000 pies de altitud de presión) hasta FL600, y es exclusivamente para operaciones IFR — no se permite vuelo VFR bajo ninguna circunstancia. Todo avión que opera aquí debe estar bajo un plan de vuelo IFR activo con autorización de control, equipado apropiadamente (transponder Modo C/S, comunicación bidireccional), y siguiendo instrucciones continuas de ATC. Para un piloto VFR, la Clase A es simplemente un techo absoluto: no puedes volar por encima de FL180 sin ser IFR, punto." },
      { id: "espacios-aereos-tema2", titulo: "Clase B", texto: "La Clase B rodea los aeropuertos con mayor densidad de tráfico, con forma característica de 'pastel de bodas invertido' (círculos concéntricos que se ensanchan con la altitud). Requiere autorización EXPLÍCITA de control antes de entrar — un simple contacto por radio no es suficiente, debes escuchar literalmente 'autorizado a entrar en espacio Clase B' o instrucción equivalente. Se representa en cartas con líneas sólidas azules gruesas. El equipo mínimo requerido incluye transponder con Modo C (reporte de altitud) y radio bidireccional operativo. Es el espacio aéreo más restrictivo después de la Clase A para operación VFR." },
      { id: "espacios-aereos-tema3", titulo: "Clase C", texto: "La Clase C rodea aeropuertos de tráfico moderado-alto, típicamente con un núcleo de 5 millas náuticas de radio y una 'repisa' (shelf) exterior más amplia a mayor altitud. A diferencia de la Clase B, aquí NO necesitas autorización explícita — basta con establecer contacto bidireccional con control (escuchar tu matrícula de vuelta confirma que te tienen identificado) antes de entrar. Se marca en cartas con círculos sólidos magenta. También requiere transponder Modo C y radio operativo, igual que Clase B." },
      { id: "espacios-aereos-tema4", titulo: "Clase D", texto: "La Clase D rodea aeropuertos con torre de control activa pero de menor tráfico que Clase B/C, generalmente con un radio de 4 millas náuticas hasta 2,500 pies sobre el nivel del aeropuerto. Igual que Clase C, requiere establecer contacto bidireccional con la torre antes de entrar, pero generalmente no exige transponder Modo C obligatorio (depende de la regulación local). Se representa con líneas discontinuas (punteadas) azules en la carta. Fuera del horario de operación de la torre, el espacio Clase D típicamente revierte a Clase E o G según lo indicado en la carta." },
      { id: "espacios-aereos-tema5", titulo: "Clase E", texto: "La Clase E es espacio aéreo controlado que no encaja en las categorías A-D — puede comenzar en superficie, a 700 pies AGL, o a 1,200 pies AGL dependiendo de la ubicación específica, indicado en la carta con sombreado degradado magenta (inicio a 700 ft) o líneas discontinuas azules (inicio a 1,200 ft). No requiere contacto por radio obligatorio para VFR en la mayoría de los casos, pero sí aplican requisitos de visibilidad y separación de nubes más estrictos que en Clase G. Es el tipo de espacio aéreo controlado más común y extenso en términos de área total cubierta." },
      ],
    },
    {
      titulo: "Espacio aéreo Clase G y áreas especiales",
      temas: [
      { id: "espacios-aereos-tema6", titulo: "Clase G", texto: "La Clase G es espacio aéreo NO controlado — no hay ATC gestionando el tráfico, no se requiere contacto por radio ni autorización de ningún tipo. Generalmente existe a baja altitud en zonas rurales o alejadas de aeropuertos grandes, por debajo del inicio de la Clase E correspondiente. Aunque no hay control activo, sí aplican mínimos de visibilidad y separación de nubes VFR (aunque más permisivos que en espacio controlado), y sigue siendo tu responsabilidad total mantener separación visual con otro tráfico — 've y evita' es la única regla de separación disponible aquí." },
      { id: "espacios-aereos-tema7", titulo: "Áreas restringidas", texto: "Las Áreas Restringidas (designadas con prefijo R- seguido de un número, ej. R-401) contienen actividades potencialmente peligrosas para aeronaves no participantes — típicamente entrenamiento militar, tiro con artillería, o actividades similares. No están prohibidas de forma absoluta, pero requieren autorización específica del organismo que las controla para poder cruzarlas, y solo están 'activas' en horarios publicados (fuera de esos horarios, generalmente pueden cruzarse libremente, aunque siempre debes verificar NOTAMs antes de asumir esto). Volar sin autorización dentro de una restringida activa puede exponerte a riesgo físico real, no solo una infracción regulatoria." },
      { id: "espacios-aereos-tema8", titulo: "Áreas prohibidas", texto: "Las Áreas Prohibidas (designadas con prefijo P- seguido de un número) son zonas donde el vuelo está terminantemente prohibido para cualquier aeronave, sin excepción ni proceso de autorización disponible para vuelo civil — generalmente rodean instalaciones de seguridad nacional, residencias presidenciales, u otras instalaciones sensibles. A diferencia de las restringidas, aquí no hay 'horario activo': la prohibición es permanente y absoluta. Volar dentro de una prohibida sin autorización especial expone al piloto a consecuencias legales severas, además de posible interceptación militar." },
      { id: "espacios-aereos-tema9", titulo: "Áreas peligrosas", texto: "Las Áreas de Peligro o Advertencia (Warning Areas, frecuentemente sobre agua/costa) señalan actividades que podrían ser peligrosas para aeronaves no participantes —ejercicios militares, actividad de misiles, tráfico intenso de otro tipo— pero, a diferencia de las restringidas, NO son legalmente restrictivas: puedes volar a través de ellas, pero bajo tu propio riesgo y con plena conciencia de que hay actividad potencialmente peligrosa ocurriendo. La recomendación operacional es evitarlas cuando estén activas, verificando NOTAMs, aunque legalmente no necesites autorización para cruzarlas." },
      { id: "espacios-aereos-tema10", titulo: "Cómo afectan a un vuelo VFR", texto: "Al planear cualquier ruta VFR, el espacio aéreo determina: qué comunicaciones necesitas establecer y cuándo (Clase B requiere autorización antes de entrar; C y D requieren contacto establecido; E y G generalmente no requieren nada, aunque siempre es buena práctica), qué equipo debe llevar tu avión (transponder Modo C obligatorio en B/C y generalmente por encima de ciertas altitudes incluso en E), y qué mínimos de visibilidad/separación de nubes debes respetar (más estrictos en espacio controlado). Ignorar estos requisitos no solo es una infracción — en Clase B específicamente, entrar sin autorización puede resultar en una llamada de atención inmediata de control, suspensión de licencia, o en el peor caso, una situación de tráfico genuinamente peligrosa por falta de coordinación." },
      ],
    },
  ],
  "reglamentacion": [
    {
      titulo: "Reglas VFR/IFR, licencias y horas de vuelo",
      temas: [
      { id: "reglamentacion-tema1", titulo: "Reglas VFR", texto: "El vuelo VFR (Visual Flight Rules) exige que el piloto mantenga referencia visual constante con el horizonte y el terreno para navegar y evitar tráfico y obstáculos — es la base regulatoria de todo vuelo bajo condiciones meteorológicas visuales (VMC). Incluye reglas de prioridad de paso (right-of-way): un avión que se aproxima de frente cede ambos a la derecha, quien va más lento tiene prioridad sobre quien alcanza por detrás, y las aeronaves menos maniobrables (globos, planeadores, dirigibles) tienen prioridad sobre las motorizadas. También exige respetar los mínimos de visibilidad y separación de nubes correspondientes a cada clase de espacio aéreo que cruces, y llevar a bordo la documentación requerida del avión y del piloto." },
      { id: "reglamentacion-tema2", titulo: "Reglas IFR", texto: "El vuelo IFR (Instrument Flight Rules) permite operar sin referencia visual externa, navegando exclusivamente por instrumentos y siguiendo instrucciones continuas de control de tránsito aéreo. Requiere presentar y recibir autorización de un plan de vuelo antes de salir, equipo específico a bordo (instrumentos de vuelo redundantes, navegación certificada), y seguir exactamente la ruta y altitud autorizadas — cualquier desviación necesita solicitar y recibir una nueva autorización, salvo emergencia. El piloto IFR también debe mantener su competencia (currency) mediante un mínimo de aproximaciones y procedimientos practicados en un período reciente, cuyo detalle exacto debes verificar contra la normativa vigente de tu autoridad aeronáutica." },
      { id: "reglamentacion-tema3", titulo: "Licencias", texto: "La progresión típica de licencias/certificados de piloto es: Alumno Piloto (Student Pilot, para entrenamiento con instructor), Piloto Privado (PPL, permite volar sin remuneración, con pasajeros, VFR), Piloto Comercial (CPL, permite volar por remuneración, generalmente requiere también la calificación de instrumentos para operar comercialmente en la práctica), y Piloto de Transporte de Línea Aérea (ATP, el nivel más alto, requerido para operar como comandante en aerolíneas). A esto se suman calificaciones adicionales (ratings) como Instrumentos, Multimotor, e Instructor de Vuelo. En México, la autoridad emisora es la AFAC (Agencia Federal de Aviación Civil), bajo el marco del RAC 61 — consulta siempre la versión vigente para los requisitos exactos actuales." },
      { id: "reglamentacion-tema4", titulo: "Horas de vuelo", texto: "Los requisitos mínimos de horas de vuelo varían según la autoridad aeronáutica de cada país, aunque suelen seguir referencias similares basadas en estándares OACI: como orden de magnitud ampliamente enseñado internacionalmente, un PPL típicamente requiere alrededor de 40 horas totales de vuelo (con mínimos específicos de instrucción dual y solo), y un CPL requiere considerablemente más, generalmente en el rango de 150-250 horas totales dependiendo del país y la vía de entrenamiento. Estos números son solo una referencia general — para tu examen y tu bitácora oficial, siempre debes confirmar las cifras exactas vigentes en el RAC 61 de la AFAC en México, ya que la regulación puede actualizarse." },
      ],
    },
    {
      titulo: "Requisitos, mínimos meteorológicos y combustible de reserva",
      temas: [
      { id: "reglamentacion-tema5", titulo: "Requisitos", texto: "Más allá de las horas de vuelo, obtener una licencia requiere: un Certificado Médico Aeronáutico vigente (de la clase correspondiente a la licencia que buscas), cumplir la edad mínima establecida por tu autoridad (generalmente 17 años para PPL, 18 para CPL como referencia común, aunque verifica el valor exacto vigente), aprobar un examen de conocimientos teóricos, y aprobar un examen práctico de vuelo (checkride) con un examinador designado. Para operaciones internacionales o radiocomunicación en inglés, también se exige demostrar un nivel de competencia en idioma inglés según la escala OACI, revalidado periódicamente." },
      { id: "reglamentacion-tema6", titulo: "Mínimos meteorológicos", texto: "Cada clase de espacio aéreo tiene mínimos específicos de visibilidad y distancia de separación respecto a las nubes para poder volar VFR legalmente — en general, el espacio aéreo controlado exige mínimos más estrictos (mayor visibilidad, mayor separación vertical/horizontal de nubes) que el espacio no controlado, y estos mínimos suelen ser aún más exigentes por encima de ciertas altitudes. Para vuelo IFR, cada aeropuerto de destino y alterno tiene mínimos meteorológicos publicados en sus cartas de aproximación (techo y visibilidad mínimos requeridos para intentar la aproximación) — si el pronóstico no alcanza esos mínimos, la regulación exige planificar un alterno adecuado. Consulta siempre la tabla oficial de mínimos VFR/IFR vigente de tu autoridad para los valores exactos por clase de espacio aéreo." },
      { id: "reglamentacion-tema7", titulo: "Combustible de reserva", texto: "La regulación exige llevar combustible suficiente no solo para completar el vuelo planeado, sino con una reserva adicional obligatoria por si surge un desvío, espera, o condición imprevista. Como referencia ampliamente usada en el estándar internacional: para vuelo VFR diurno se exige comúnmente una reserva mínima de 30 minutos de vuelo a velocidad de crucero normal más allá de tu destino planeado; para VFR nocturno o vuelo IFR, la reserva mínima común aumenta a 45 minutos. Estos números son la referencia general enseñada internacionalmente — confirma el valor exacto vigente en la normativa de tu autoridad antes de aplicarlo como regla absoluta en tu planificación real, ya que estos mínimos pueden variar y son de cumplimiento obligatorio, nunca opcional." },
      ],
    },
  ],
  "ifr": [
    {
      titulo: "Plan de vuelo IFR: SID, aerovías y STAR",
      temas: [
      { id: "ifr-tema1", titulo: "¿Qué es IFR?", texto: "IFR (Instrument Flight Rules) es el conjunto de reglas que permite volar navegando exclusivamente por instrumentos, sin depender de referencia visual externa —ya sea porque las condiciones meteorológicas lo requieren (IMC) o porque el piloto elige operar bajo IFR incluso con buen clima (VMC) para aprovechar rutas estructuradas y prioridad de tránsito. A diferencia de VFR, bajo IFR estás en contacto y bajo control continuo de ATC durante todo el vuelo, siguiendo una ruta y altitud autorizadas específicas, con separación garantizada respecto a otro tráfico IFR por el propio sistema de control, no por tu propia observación visual." },
      { id: "ifr-tema2", titulo: "Plan de vuelo IFR", texto: "Un plan de vuelo IFR incluye: tipo de aeronave y equipo a bordo (códigos estandarizados de navegación/vigilancia), ruta específica (aerovías o directos entre fixes), altitud de crucero solicitada, combustible a bordo, y aeropuerto alterno con sus requisitos. Antes de salir, recibes tu autorización (clearance) de control, que sigue el formato mnemotécnico CRAFT: Clearance limit (hasta dónde llega la autorización), Route (ruta autorizada, puede diferir de lo solicitado), Altitude (altitud inicial y final), Frequency (frecuencia de salida a contactar), y Transponder (código squawk asignado). Debes leer de vuelta la autorización completa antes de proceder." },
      { id: "ifr-tema3", titulo: "Salidas SID", texto: "Una SID (Standard Instrument Departure) es un procedimiento publicado que conecta el aeropuerto de salida con la estructura de aerovías en ruta, diseñado específicamente para garantizar separación de obstáculos y terreno durante el ascenso inicial, además de organizar el flujo de salida en aeropuertos de tráfico denso. Incluye restricciones específicas de altitud y a veces de velocidad en puntos determinados de la ruta, que debes cumplir salvo instrucción contraria de control. Volar una SID reduce significativamente la carga de comunicación por radio, ya que gran parte de la ruta y restricciones ya están pre-autorizadas en el propio procedimiento publicado." },
      { id: "ifr-tema4", titulo: "Aerovías", texto: "Las aerovías son corredores aéreos publicados que conectan puntos fijos (generalmente VOR o fixes definidos por coordenadas) formando la estructura principal de rutas IFR. Se dividen en Aerovías Victor (baja altitud, típicamente hasta FL180, definidas por radiales VOR) y Rutas Jet (alta altitud, sobre FL180, igualmente basadas en navegación por radioayudas o RNAV). Volar una aerovía significa seguir la línea recta publicada entre los fixes que la componen, a la altitud asignada por control, con separación garantizada respecto a otros aviones en la misma estructura por parte del sistema ATC." },
      { id: "ifr-tema5", titulo: "STAR", texto: "Una STAR (Standard Terminal Arrival Route) es el procedimiento inverso a la SID: conecta la estructura de aerovías en ruta con el área terminal de tu aeropuerto de destino, organizando el descenso y la entrada al espacio aéreo denso alrededor del aeropuerto de forma estructurada. Al igual que la SID, incluye restricciones de altitud y velocidad en puntos específicos, diseñadas para secuenciar el tráfico entrante de forma ordenada y reducir la carga de comunicación de control durante una de las fases más ocupadas del vuelo. Generalmente termina conectando con el segmento inicial de una aproximación instrumental." },
      ],
    },
    {
      titulo: "Aproximaciones: ILS, RNAV, VOR y holding",
      temas: [
      { id: "ifr-tema6", titulo: "Aproximaciones ILS", texto: "El ILS (Instrument Landing System) es una aproximación de precisión que provee guía tanto lateral (Localizer, alineación con el eje de pista) como vertical (Glideslope, ángulo de descenso hacia el umbral, típicamente 3°), permitiéndote descender con gran precisión incluso en visibilidad muy reducida. Se clasifica en categorías (CAT I, II, III) según qué tan bajos son los mínimos de techo y visibilidad permitidos, requiriendo equipo y entrenamiento adicional para las categorías más exigentes. El punto crítico de decisión se llama DA (Decision Altitude): al llegar a esa altitud, debes tener referencia visual suficiente para aterrizar, o ejecutar inmediatamente el procedimiento de aproximación frustrada (missed approach)." },
      { id: "ifr-tema7", titulo: "RNAV", texto: "RNAV (Area Navigation) es un método de navegación que usa GPS/GNSS para volar directamente entre waypoints definidos por coordenadas, sin depender de estaciones terrestres como VOR. Las aproximaciones RNAV pueden tener distintos niveles de precisión y mínimos asociados: LNAV (guía lateral únicamente, similar a una aproximación no de precisión), LNAV/VNAV (guía lateral y vertical calculada, mínimos más bajos), y LPV (Localizer Performance with Vertical guidance, la más precisa, con mínimos comparables a un ILS categoría I en muchos casos). RNAV ha expandido enormemente el acceso a aproximaciones de precisión en aeropuertos que nunca tuvieron ILS instalado físicamente." },
      { id: "ifr-tema8", titulo: "VOR Approach", texto: "Una aproximación VOR es una aproximación de no precisión que usa un radial de una estación VOR (a menudo ubicada en el propio campo o cerca de él) como guía lateral únicamente — no hay guía vertical electrónica como en el ILS. En vez de una Decision Altitude, usa una MDA (Minimum Descent Altitude): una altitud mínima que no puedes cruzar sin referencia visual, y que puedes mantener volando nivelado (en vez de en descenso continuo) hasta el punto de aproximación frustrada si no adquieres la pista visualmente. Frecuentemente incluye fixes de descenso escalonado (step-down fixes) que te permiten bajar progresivamente conforme confirmas tu posición sobre puntos específicos de la aproximación." },
      { id: "ifr-tema9", titulo: "Holding", texto: "Un holding (espera) es un patrón de vuelo hipódromo (forma de pista de carreras) que usas para retrasar tu llegada de forma ordenada — ya sea por instrucción de control debido a congestión de tráfico, o como parte de un procedimiento publicado de aproximación. Se define por un fix, un rumbo de entrada (inbound course), y un lado de vueltas (generalmente a la derecha). Existen tres tipos de entrada según tu rumbo de llegada al fix: Directa (la más simple, entras derecho al patrón), Paralela (vuelas paralelo al rumbo de entrada antes de virar), y en Teardrop (gota, vuelas alejándote en ángulo antes de virar hacia el fix) — el tipo correcto depende geométricamente de desde qué dirección te aproximas al fix." },
      { id: "ifr-tema10", titulo: "Vuelo IFR completo", texto: "Un vuelo IFR real integra todos los elementos anteriores en secuencia: presentas tu plan de vuelo con ruta, altitud y alterno, recibes tu autorización (clearance) siguiendo el formato CRAFT, despegas siguiendo una SID publicada con sus restricciones, vuelas la aerovía asignada bajo control continuo de ATC con cambios de frecuencia conforme cruzas sectores, desciendes siguiendo una STAR hacia tu destino, y ejecutas una aproximación instrumental (ILS, RNAV o VOR según disponibilidad y mínimos) hasta aterrizar o ejecutar una aproximación frustrada con posible holding si el tráfico o el clima lo requieren. Practicar este flujo completo, de principio a fin, en simulador es la mejor preparación posible antes de volarlo en condiciones reales de IMC." },
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
};

// ---------- Quizzes (práctica: 5, evaluación: 10) ----------

function split(all: QuizPregunta[]) {
  return { practica: all.slice(0, 5), evaluacion: all.slice(5) };
}

const QUIZ_METEOROLOGIA: QuizPregunta[] = [
  { id: "met-q1", pregunta: "¿Qué describe un METAR?", opciones: ["Un pronóstico a 24 horas", "Las condiciones meteorológicas actuales observadas", "Solo la velocidad del viento", "Las rutas de vuelo recomendadas"], correcta: 1 },
  { id: "met-q2", pregunta: "En el METAR '09008KT', ¿qué representa el número 08?", opciones: ["Rumbo del viento en grados", "Velocidad del viento en nudos", "Visibilidad en millas", "Altura de las nubes"], correcta: 1 },
  { id: "met-q3", pregunta: "¿Cuál es la validez típica de un TAF?", opciones: ["1 hora", "6 horas", "24 a 30 horas", "1 semana"], correcta: 2 },
  { id: "met-q4", pregunta: "La diferencia principal entre METAR y TAF es:", opciones: ["El idioma en que se emiten", "METAR es observación actual, TAF es pronóstico futuro", "METAR es solo para aeropuertos grandes", "No hay diferencia real"], correcta: 1 },
  { id: "met-q5", pregunta: "¿Qué código de cobertura de nubes indica cielo totalmente cubierto?", opciones: ["FEW", "SCT", "BKN", "OVC"], correcta: 3 },
  { id: "met-q6", pregunta: "¿Qué tipo de frente suele generar clima violento pero de corta duración?", opciones: ["Frente cálido", "Frente frío", "Frente estacionario", "Ninguno genera clima significativo"], correcta: 1 },
  { id: "met-q7", pregunta: "¿Qué tipo de turbulencia ocurre en altura sin nubes que la anuncien?", opciones: ["Mecánica", "Térmica", "Aire claro (CAT)", "De estela"], correcta: 2 },
  { id: "met-q8", pregunta: "Un microburst es:", opciones: ["Un tipo de nube alta", "Una corriente descendente violenta asociada a tormentas", "Un instrumento de navegación", "Un tipo de niebla"], correcta: 1 },
  { id: "met-q9", pregunta: "¿En qué rango de temperatura es más probable el hielo estructural?", opciones: ["0°C a -20°C con agua líquida presente", "Por debajo de -40°C siempre", "Solo a temperaturas positivas", "Solo en verano"], correcta: 0 },
  { id: "met-q10", pregunta: "¿Por qué Toluca es un ejemplo clave de altitud de densidad?", opciones: ["Está al nivel del mar", "Tiene una elevación muy alta (8,466 pies), lo que reduce el rendimiento en días calurosos", "Nunca tiene viento", "Es el aeropuerto más grande de México"], correcta: 1 },
  { id: "met-q11", pregunta: "¿Qué tipo de nube se evita siempre por su turbulencia severa y granizo?", opciones: ["Cirros", "Estratos", "Cumulonimbo (CB)", "Cúmulos de buen tiempo"], correcta: 2 },
  { id: "met-q12", pregunta: "La turbulencia de estela (wake turbulence) es generada por:", opciones: ["Corrientes térmicas", "Vórtices de las puntas de ala de aviones grandes", "El viento cerca de montañas", "La lluvia"], correcta: 1 },
  { id: "met-q13", pregunta: "¿Qué sistema alerta a los controladores sobre wind shear de bajo nivel?", opciones: ["LLWAS", "METAR", "NOTAM", "TAF"], correcta: 0 },
  { id: "met-q14", pregunta: "El hielo de carburador puede ocurrir:", opciones: ["Solo bajo cero", "Incluso con temperaturas exteriores positivas", "Solo en vuelo IFR", "Nunca en motores de pistón"], correcta: 1 },
  { id: "met-q15", pregunta: "¿Qué código de cobertura indica cielo despejado?", opciones: ["SKC/CLR", "BKN", "OVC", "SCT"], correcta: 0 },
  { id: "met-q16", pregunta: "Comparando un METAR con 'BKN008' y visibilidad 3SM contra otro con 'SCT025' y visibilidad 10SM, ¿cuál representa mayor riesgo para un vuelo VFR por debajo de 3,000 ft AGL en espacio no controlado?", opciones: ["El segundo, porque SCT indica más nubes que BKN", "El primero, porque nubes rotas a solo 800 ft probablemente incumplan el mínimo de separación vertical VFR", "Ambos son igual de seguros para volar", "Ninguno afecta la decisión de volar VFR"], correcta: 1 },
  { id: "met-q17", pregunta: "Un frente frío se acerca rápido y, el mismo día, un frente cálido se acerca lento por otra dirección. ¿Cuál exige una decisión de vuelo más urgente y por qué?", opciones: ["El cálido, porque siempre trae peor clima que el frío", "El frío, porque su avance rápido puede traer clima violento con poco margen de tiempo para decidir antes de que llegue", "Ninguno afecta la planificación del vuelo", "Se decide igual sin importar qué tipo de frente sea"], correcta: 1 },
];

const QUIZ_NAVEGACION: QuizPregunta[] = [
  { id: "nav-q1", pregunta: "Un radial se mide:", opciones: ["Hacia la estación", "Desde el VOR hacia afuera", "Solo de noche", "Desde el norte magnético del avión"], correcta: 1 },
  { id: "nav-q2", pregunta: "Si la bandera indica TO, volar el curso seleccionado con la aguja centrada te lleva:", opciones: ["Alejándote de la estación", "Hacia la estación", "En círculos", "No indica nada"], correcta: 1 },
  { id: "nav-q3", pregunta: "Cada punto de desviación del CDI representa aproximadamente:", opciones: ["10°", "2°", "45°", "90°"], correcta: 1 },
  { id: "nav-q4", pregunta: "El OBS sirve para:", opciones: ["Medir distancia", "Seleccionar el curso o radial deseado", "Sintonizar frecuencias de comunicación", "Encender el transponder"], correcta: 1 },
  { id: "nav-q5", pregunta: "Tracking, a diferencia de Homing, se caracteriza por:", opciones: ["Apuntar siempre la nariz a la estación", "Calcular un ángulo de corrección por viento para mantener una línea recta", "Ignorar el viento", "Solo usarse en IFR"], correcta: 1 },
  { id: "nav-q6", pregunta: "El DME mide:", opciones: ["Solo el rumbo", "La distancia real en línea recta a la estación", "La velocidad del viento", "La frecuencia VOR"], correcta: 1 },
  { id: "nav-q7", pregunta: "Una ventaja clave del HSI sobre el CDI tradicional es:", opciones: ["Es más barato", "Integra rumbo y desviación, eliminando la sensibilidad inversa", "No requiere calibración", "Funciona sin electricidad"], correcta: 1 },
  { id: "nav-q8", pregunta: "El ADF, a diferencia del VOR, muestra:", opciones: ["Radiales precisos", "El rumbo relativo hacia la estación, sin dar radiales", "La distancia exacta", "Solo funciona de noche"], correcta: 1 },
  { id: "nav-q9", pregunta: "La fijación cruzada (cross-fix) usa:", opciones: ["Un solo VOR", "Dos radiales de VOR distintos que se cruzan en la carta", "Solo el GPS", "El compás magnético únicamente"], correcta: 1 },
  { id: "nav-q10", pregunta: "En una carta VFR, la escala gráfica sirve para:", opciones: ["Medir distancias trazadas en la ruta", "Calcular el viento", "Sintonizar VOR", "Leer el METAR"], correcta: 0 },
  { id: "nav-q11", pregunta: "Sin DME, para saber la distancia a un aeropuerto puedes usar:", opciones: ["Solo adivinar", "Navegación por estima (dead reckoning)", "El transponder", "El altímetro"], correcta: 1 },
  { id: "nav-q12", pregunta: "Planear una ruta VFR debe incluir siempre:", opciones: ["Solo la distancia total", "Un aeropuerto alterno con reservas de combustible adecuadas", "Únicamente el rumbo magnético", "Nada relacionado al clima"], correcta: 1 },
  { id: "nav-q13", pregunta: "Si estás en el radial 090 de un VOR y quieres volar TO la estación, tu curso debe ser aproximadamente:", opciones: ["090°", "180°", "270°", "360°"], correcta: 2 },
  { id: "nav-q14", pregunta: "El ángulo de intercepción recomendado para interceptar un radial es de:", opciones: ["10°", "30°", "60°", "90°"], correcta: 1 },
  { id: "nav-q15", pregunta: "Un minuto de latitud medido verticalmente en una carta equivale aproximadamente a:", opciones: ["Una milla náutica", "Una milla terrestre", "Diez millas náuticas", "No equivale a nada útil"], correcta: 0 },
  { id: "nav-q16", pregunta: "Usas fijación cruzada con dos VOR: el radial A lo trazaste correctamente, pero el radial B lo leíste con 10° de error. ¿Qué le pasa a tu posición fijada en la carta?", opciones: ["No se ve afectada, un solo radial con error no importa", "Se desplaza a lo largo del radial B, tanto más lejos del punto real cuanto mayor sea tu distancia a esa estación", "El error se cancela automáticamente entre los dos radiales", "Solo afecta si ambos radiales tienen error simultáneamente"], correcta: 1 },
  { id: "nav-q17", pregunta: "Vuelas sin DME y necesitas confirmar tu distancia a un aeropuerto. Comparando la navegación por estima (dead reckoning) contra una fijación cruzada con dos VOR, ¿cuál te da mayor precisión y por qué?", opciones: ["Estima, porque no depende de señales externas que puedan fallar", "Fijación cruzada, porque ubica tu posición real con dos referencias externas en vez de acumular el error de tiempo y viento estimado", "Ambas tienen exactamente la misma precisión", "Ninguna es confiable si no tienes DME a bordo"], correcta: 1 },
];

const QUIZ_CARTOGRAFIA: QuizPregunta[] = [
  { id: "cart-q1", pregunta: "¿A qué escala están las Cartas VFR (Sectional Charts)?", opciones: ["1:100,000", "1:250,000", "1:500,000", "1:1,000,000"], correcta: 2 },
  { id: "cart-q2", pregunta: "Un aeropuerto con torre de control se representa en color:", opciones: ["Magenta", "Azul", "Verde", "Rojo"], correcta: 1 },
  { id: "cart-q3", pregunta: "¿Qué clase de espacio aéreo requiere autorización EXPLÍCITA para entrar?", opciones: ["Clase D", "Clase E", "Clase B", "Clase G"], correcta: 2 },
  { id: "cart-q4", pregunta: "En un obstáculo marcado '1500 (450)', ¿qué representa el número entre paréntesis?", opciones: ["Altura MSL", "Altura AGL (sobre el terreno)", "Distancia al aeropuerto más cercano", "Frecuencia de luces del obstáculo"], correcta: 1 },
  { id: "cart-q5", pregunta: "¿Qué es el MEF en una carta VFR?", opciones: ["La frecuencia de emergencia", "La altitud más alta de seguridad en ese cuadrante", "El nombre del aeropuerto más cercano", "La velocidad máxima permitida"], correcta: 1 },
  { id: "cart-q6", pregunta: "Las frecuencias de radio en la carta (CTAF, Torre, ATIS) se ubican:", opciones: ["Solo en un apéndice separado", "Junto a cada aeropuerto y límite de espacio aéreo", "No aparecen en las cartas VFR", "Solo en cartas IFR"], correcta: 1 },
  { id: "cart-q7", pregunta: "¿Para qué sirven los Puntos de Notificación VFR?", opciones: ["Para marcar zonas prohibidas", "Para reportar tu posición de forma rápida y estandarizada", "Para indicar gasolineras", "No tienen uso operacional"], correcta: 1 },
  { id: "cart-q8", pregunta: "Antes de un vuelo, el mejor hábito al leer una carta completa es:", opciones: ["Improvisar la ruta en el aire", "Trazar la ruta completa con checkpoints, rumbos y tiempos", "Ignorar el espacio aéreo si el vuelo es corto", "Memorizar solo el destino"], correcta: 1 },
  { id: "cart-q9", pregunta: "¿Qué tipo de carta se usa para vuelo IFR en aerovías bajo FL180?", opciones: ["Cartas de Ruta de Baja Altitud", "Cartas TAC", "Cartas VFR", "Cartas de aproximación visual"], correcta: 0 },
  { id: "cart-q10", pregunta: "En la simbología de cartas, la longitud de las líneas del círculo de un aeropuerto indica:", opciones: ["El precio del combustible", "Si la pista es dura o de superficie blanda", "La cantidad de hangares", "El horario de la torre"], correcta: 1 },
  { id: "cart-q11", pregunta: "¿Qué clase de espacio aéreo se representa con líneas discontinuas azules?", opciones: ["Clase B", "Clase C", "Clase D", "Clase G"], correcta: 2 },
  { id: "cart-q12", pregunta: "¿Qué representa el sombreado en tonos más oscuros de café/naranja en una carta VFR?", opciones: ["Espacio aéreo prohibido", "Terreno de mayor elevación", "Zonas de tormenta", "Aeropuertos militares"], correcta: 1 },
  { id: "cart-q13", pregunta: "Antes de acercarte a espacio aéreo controlado, debes identificar en la carta:", opciones: ["El precio del combustible local", "Qué frecuencia contactar y en qué punto de tu ruta", "El color del avión permitido", "Nada en particular"], correcta: 1 },
  { id: "cart-q14", pregunta: "¿Con qué símbolo se marcan los Puntos de Notificación VFR en la carta?", opciones: ["Un círculo azul relleno", "Una estrella o triángulo magenta", "Una línea roja punteada", "Un cuadrado verde"], correcta: 1 },
  { id: "cart-q15", pregunta: "Las Cartas de Área Terminal (TAC) se usan principalmente para:", opciones: ["Vuelo oceánico", "Zonas de espacio aéreo denso alrededor de grandes ciudades", "Solo aterrizajes de emergencia", "Rutas de alta altitud exclusivamente"], correcta: 1 },
  { id: "cart-q16", pregunta: "Tu ruta cruza primero una zona con MEF de 4,500 ft y luego otra con MEF de 6,800 ft. Si mantienes una sola altitud de crucero de 5,000 ft en toda la ruta, ¿qué tramo representa un riesgo?", opciones: ["Ninguno, 5,000 ft siempre es seguro en cualquier cuadrante", "El segundo tramo, porque 5,000 ft queda por debajo del MEF de 6,800 ft de esa zona", "El primer tramo, porque el MEF es un límite máximo, no mínimo", "Debes descender antes de llegar al segundo tramo"], correcta: 1 },
  { id: "cart-q17", pregunta: "Comparando un aeropuerto marcado en magenta contra uno en azul en la carta, si tu ruta pasa cerca de ambos, ¿qué diferencia en tus comunicaciones debes anticipar?", opciones: ["Ninguna, el color no tiene relación con las comunicaciones", "El azul (con torre) probablemente exige contacto por radio antes de acercarte; el magenta (sin torre) usa CTAF sin autorización obligatoria", "El magenta siempre requiere autorización explícita de control", "Ambos son operacionalmente idénticos"], correcta: 1 },
];

const QUIZ_COMUNICACIONES: QuizPregunta[] = [
  { id: "com-q1", pregunta: "'Wilco' significa:", opciones: ["No voy a cumplir", "Voy a cumplir la instrucción", "Repita el mensaje", "Cambio y fuera"], correcta: 1 },
  { id: "com-q2", pregunta: "El primer contacto por radio debe incluir, en orden:", opciones: ["Qué necesitas, quién eres, a quién llamas", "A quién llamas, quién eres, qué necesitas", "Solo tu matrícula", "Solo el nombre del aeropuerto"], correcta: 1 },
  { id: "com-q3", pregunta: "El readback de 'mantener corto' (hold short) de una pista es:", opciones: ["Opcional", "Obligatorio siempre, sin excepción", "Solo necesario de noche", "Solo en aeropuertos grandes"], correcta: 1 },
  { id: "com-q4", pregunta: "La autorización de despegue debe leerse de vuelta incluyendo:", opciones: ["Solo 'copiado'", "Tu matrícula y la confirmación de la pista autorizada", "Nada, basta con despegar", "Solo el viento reportado"], correcta: 1 },
  { id: "com-q5", pregunta: "Para cruzar espacio aéreo Clase B/C/D sin aterrizar necesitas:", opciones: ["Nada especial", "Solicitar y recibir autorización de tránsito VFR", "Solo avisar por CTAF", "Aterrizar primero"], correcta: 1 },
  { id: "com-q6", pregunta: "PAN-PAN se usa para:", opciones: ["Peligro grave e inminente", "Una situación urgente sin peligro inmediato de vida", "Confirmar una autorización", "Solicitar el clima"], correcta: 1 },
  { id: "com-q7", pregunta: "MAYDAY se repite:", opciones: ["Una vez", "Dos veces", "Tres veces", "No se repite"], correcta: 2 },
  { id: "com-q8", pregunta: "Un error común en comunicaciones es:", opciones: ["Usar fraseología estándar", "Omitir el readback de instrucciones críticas", "Confirmar la matrícula completa", "Escuchar antes de transmitir"], correcta: 1 },
  { id: "com-q9", pregunta: "En comunicaciones IFR, el readback debe ser especialmente preciso en:", opciones: ["El nombre del piloto", "El código squawk y las altitudes", "El color del avión", "La hora del día"], correcta: 1 },
  { id: "com-q10", pregunta: "'Stepping on' una transmisión significa:", opciones: ["Confirmar correctamente", "Bloquear la frecuencia hablando al mismo tiempo que otra estación", "Usar el alfabeto fonético", "Declarar una emergencia"], correcta: 1 },
  { id: "com-q11", pregunta: "El primer contacto con Torre debe incluir tu matrícula:", opciones: ["Abreviada siempre", "Completa, hasta que torre te autorice a abreviarla", "Nunca es necesaria", "Solo si te la piden"], correcta: 1 },
  { id: "com-q12", pregunta: "Dentro del circuito de tráfico, los reportes de posición siguen el orden:", opciones: ["Final, base, viento en cola", "Viento en cola, base, final", "Solo se reporta al aterrizar", "No hay un orden estándar"], correcta: 1 },
  { id: "com-q13", pregunta: "Al acercarte a un destino en espacio aéreo controlado, usualmente contactas primero a:", opciones: ["Torre", "Aproximación", "CTAF", "Ninguna estación"], correcta: 1 },
  { id: "com-q14", pregunta: "'Roger' significa:", opciones: ["Voy a cumplir la instrucción", "Recibido, entendido, sin implicar que cumplirás", "Repita el mensaje", "Autorizado a proceder"], correcta: 1 },
  { id: "com-q15", pregunta: "La disciplina de radio existe principalmente para:", opciones: ["Sonar profesional", "Prevenir errores y malentendidos que históricamente causan incidentes", "Llenar tiempo en la frecuencia", "Impresionar a otros pilotos"], correcta: 1 },
  { id: "com-q16", pregunta: "Comparando 'Wilco' con 'Roger' en respuesta a una instrucción de ATC, ¿en qué situación responder solo 'Roger' podría generar un malentendido peligroso?", opciones: ["Nunca genera problema, son sinónimos exactos", "Si ATC da una instrucción que requiere una acción (como mantener una altitud) y respondes 'Roger', dejas ambigüedad sobre si vas a cumplirla", "'Roger' siempre implica más autoridad que 'Wilco'", "'Wilco' solo se usa en emergencias"], correcta: 1 },
  { id: "com-q17", pregunta: "Dos aeronaves llaman a la torre casi al mismo tiempo y sus transmisiones se traslapan (stepping on). Comparando transmitir de inmediato de nuevo contra esperar unos segundos, ¿cuál es la práctica correcta y por qué?", opciones: ["Transmitir de inmediato para no perder el turno", "Esperar y confirmar que la frecuencia esté libre, ya que retransmitir de inmediato puede volver a bloquearla con otra transmisión", "Ambas opciones son igual de válidas", "Cambiar de frecuencia sin avisar a nadie"], correcta: 1 },
];

const QUIZ_INSTRUMENTOS: QuizPregunta[] = [
  { id: "ins-q1", pregunta: "El altímetro mide la altitud usando:", opciones: ["Velocidad del viento", "Presión estática del aire", "Temperatura únicamente", "Señales de radio"], correcta: 1 },
  { id: "ins-q2", pregunta: "'De alta a baja presión, cuidado abajo' se refiere a:", opciones: ["Un error del velocímetro", "El riesgo de indicar más altitud de la real si no ajustas el Kollsman", "Una regla de radiocomunicación", "El funcionamiento del VSI"], correcta: 1 },
  { id: "ins-q3", pregunta: "¿Qué mide la línea roja (Vne) en el indicador de velocidad?", opciones: ["Velocidad mínima de pérdida", "Velocidad nunca exceder", "Velocidad óptima de crucero", "Velocidad de flaps"], correcta: 1 },
  { id: "ins-q4", pregunta: "El horizonte artificial funciona mediante:", opciones: ["GPS", "Un giróscopo que mantiene orientación en el espacio", "El compás magnético", "El transponder"], correcta: 1 },
  { id: "ins-q5", pregunta: "Un 'viraje estándar' completa 360° en:", opciones: ["30 segundos", "1 minuto", "2 minutos", "5 minutos"], correcta: 2 },
  { id: "ins-q6", pregunta: "El retraso característico del VSI es de aproximadamente:", opciones: ["Sin retraso, instantáneo", "6-9 segundos", "1 minuto", "No tiene retraso relevante"], correcta: 1 },
  { id: "ins-q7", pregunta: "El error ANDS del compás magnético ocurre principalmente:", opciones: ["En vuelo recto y nivelado", "Al acelerar/desacelerar en rumbos norte-sur en el hemisferio norte", "Solo de noche", "Solo con el transponder encendido"], correcta: 1 },
  { id: "ins-q8", pregunta: "¿Qué ventaja tiene el HSI sobre el compás magnético en errores dinámicos?", opciones: ["No tiene ninguna ventaja", "Su referencia giroscópica no sufre oscilación ni ANDS", "Es más barato", "Funciona sin electricidad"], correcta: 1 },
  { id: "ins-q9", pregunta: "¿Qué squawk se usa para indicar secuestro o interferencia ilícita?", opciones: ["7600", "7700", "7500", "1200"], correcta: 2 },
  { id: "ins-q10", pregunta: "El botón IDENT en el transponder sirve para:", opciones: ["Apagar el equipo", "Resaltar momentáneamente tu posición en la pantalla del controlador", "Cambiar de frecuencia", "Declarar una emergencia automáticamente"], correcta: 1 },
  { id: "ins-q11", pregunta: "El Coordinador de Viraje, a diferencia del indicador de giro tradicional, muestra:", opciones: ["Solo la altitud", "Velocidad de alabeo y tasa de giro combinadas", "La presión de aceite", "El rumbo magnético"], correcta: 1 },
  { id: "ins-q12", pregunta: "¿Qué distingue al RMI del ADF simple?", opciones: ["No tiene aguja", "Muestra el rumbo magnético real hacia la estación, no solo relativo a la nariz", "Solo funciona en tierra", "Es más antiguo"], correcta: 1 },
  { id: "ins-q13", pregunta: "El DME calcula la distancia mediante:", opciones: ["El consumo de combustible", "El tiempo que tarda la señal en ir y regresar", "La velocidad del viento", "El ángulo de la aguja del ADF"], correcta: 1 },
  { id: "ins-q14", pregunta: "IAS, CAS y TAS se diferencian en que:", opciones: ["Son exactamente lo mismo", "TAS es la velocidad verdadera, ajustada por la densidad del aire a tu altitud", "CAS solo se usa en tierra", "IAS es siempre mayor que TAS"], correcta: 1 },
  { id: "ins-q15", pregunta: "¿Qué error puede sufrir un giróscopo mecánico como el del horizonte artificial?", opciones: ["Precesión", "Oxidación", "Sobrecarga eléctrica", "Ninguno, es infalible"], correcta: 0 },
  { id: "ins-q16", pregunta: "Comparando el retraso del VSI (6-9 segundos) contra el horizonte artificial (prácticamente instantáneo), ¿por qué al corregir una actitud debes confiar primero en el horizonte artificial?", opciones: ["Porque el VSI nunca funciona correctamente", "Porque el VSI reacciona con retraso a los cambios de actitud; corregir basado solo en él produce sobre-corrección, mientras el horizonte muestra la actitud real de inmediato", "Porque el horizonte artificial mide presión estática", "No hay diferencia práctica entre ambos instrumentos"], correcta: 1 },
  { id: "ins-q17", pregunta: "Tu horizonte artificial falla por una bomba de vacío dañada, pero el coordinador de viraje (eléctrico) sigue funcionando. ¿Qué combinación de instrumentos usarías y por qué es más confiable que uno solo?", opciones: ["Solo el altímetro, ignorando los demás instrumentos", "Coordinador de viraje + altímetro + compás, porque juntos dan tasa de giro, tendencia de altitud y rumbo, compensando la pérdida del giróscopo de vacío", "Ninguna combinación sirve sin el horizonte artificial", "Solo el velocímetro es suficiente para mantener control"], correcta: 1 },
];

const QUIZ_RENDIMIENTO: QuizPregunta[] = [
  { id: "ren-q1", pregunta: "El Peso Máximo de Despegue certificado (Max Gross Weight) es:", opciones: ["Un límite opcional según el piloto", "Un límite que nunca debe excederse", "Solo aplica para aviones comerciales", "Cambia libremente según el clima"], correcta: 1 },
  { id: "ren-q2", pregunta: "El Centro de Gravedad se calcula mediante:", opciones: ["Solo el peso total del avión", "Momento = Peso × Brazo, sumado para cada elemento", "La velocidad de crucero", "El nivel de combustible únicamente"], correcta: 1 },
  { id: "ren-q3", pregunta: "¿Cómo afecta un viento de cola a la distancia de despegue?", opciones: ["La reduce", "La aumenta significativamente", "No tiene ningún efecto", "Solo afecta el aterrizaje"], correcta: 1 },
  { id: "ren-q4", pregunta: "Un viento de cola de 10 nudos en el aterrizaje puede aumentar la distancia de frenado aproximadamente:", opciones: ["0-5%", "20-30%", "No afecta el aterrizaje", "100%"], correcta: 1 },
  { id: "ren-q5", pregunta: "Al usar gráficas de rendimiento, cuando tus condiciones caen entre dos valores impresos, debes:", opciones: ["Redondear siempre hacia abajo", "Interpolar proporcionalmente entre los valores", "Ignorar la gráfica y usar tu experiencia", "Usar siempre el valor más alto sin calcular"], correcta: 1 },
  { id: "ren-q6", pregunta: "¿Qué V-speed representa el mejor ángulo de ascenso, útil para despejar obstáculos?", opciones: ["Vy", "Vne", "Vx", "Va"], correcta: 2 },
  { id: "ren-q7", pregunta: "El Viento Cruzado Máximo Demostrado en el manual del avión es:", opciones: ["Un límite legal absoluto", "El valor máximo probado y documentado por el fabricante, no necesariamente un límite legal", "Solo aplica en aeropuertos internacionales", "Un valor que no varía entre modelos"], correcta: 1 },
  { id: "ren-q8", pregunta: "En la técnica de Sideslip para viento cruzado, el piloto:", opciones: ["Apunta la nariz completamente contra el viento hasta el touchdown", "Baja el ala hacia el viento con alerón y usa timón opuesto", "Aumenta la velocidad de aproximación al doble", "Aterriza siempre con viento de cola"], correcta: 1 },
  { id: "ren-q9", pregunta: "La Carga Útil (Useful Load) es:", opciones: ["El peso del avión vacío", "La diferencia entre el peso máximo certificado y el peso vacío", "La velocidad máxima del avión", "El combustible mínimo legal"], correcta: 1 },
  { id: "ren-q10", pregunta: "Un CG muy atrasado hace al avión:", opciones: ["Más estable pero pesado de controlar", "Más ágil pero peligrosamente inestable", "Imposible de despegar", "No afecta el control"], correcta: 1 },
  { id: "ren-q11", pregunta: "¿Qué V-speed es la máxima con flaps extendidos?", opciones: ["Vfe", "Vso", "Vr", "Vne"], correcta: 0 },
  { id: "ren-q12", pregunta: "El margen de seguridad recomendado sobre el valor calculado en distancia de pista es de aproximadamente:", opciones: ["0%", "30-50% extra", "200% extra", "No se aplica margen"], correcta: 1 },
  { id: "ren-q13", pregunta: "La velocidad de rotación se abrevia:", opciones: ["Vr", "Vx", "Va", "Vs0"], correcta: 0 },
  { id: "ren-q14", pregunta: "El componente de viento cruzado es mayor cuando el ángulo del viento respecto a la pista se acerca a:", opciones: ["0°", "45°", "90°", "180°"], correcta: 2 },
  { id: "ren-q15", pregunta: "La altitud de densidad afecta principalmente:", opciones: ["Solo la temperatura de cabina", "El rendimiento real del motor y las alas", "El color del combustible", "Nada relevante para el despegue"], correcta: 1 },
  { id: "ren-q16", pregunta: "Dos despegues con el mismo peso: uno a nivel del mar en día fresco, otro en Toluca (8,466 ft) en día caluroso. ¿Cuál requiere mayor distancia de pista y qué dos factores se combinan para causarlo?", opciones: ["El de nivel del mar, porque hay más oxígeno disponible ahí", "El de Toluca, porque la alta elevación y la alta temperatura se combinan para aumentar la altitud de densidad, reduciendo el rendimiento del motor y las alas", "Ambos requieren exactamente la misma distancia", "La temperatura no afecta el rendimiento de despegue"], correcta: 1 },
  { id: "ren-q17", pregunta: "Comparando un aterrizaje con viento de cola de 10 nudos contra uno con viento en calma, ¿qué cambia y por qué NO deberías simplemente volar más lento para compensar?", opciones: ["No cambia nada, el viento de cola no afecta aterrizajes", "La distancia de frenado aumenta 20-30% por la mayor velocidad de tierra; volar más lento con viento de cola aumenta el riesgo de pérdida antes de tocar tierra", "Siempre debes aterrizar más rápido con viento de cola sin excepción", "El viento de cola reduce la distancia de aterrizaje"], correcta: 1 },
];

const QUIZ_OPERACION: QuizPregunta[] = [
  { id: "op-q1", pregunta: "La inspección pre-vuelo (walk-around) debe hacerse:", opciones: ["Solo la primera vez que vuelas el avión", "Siempre, de forma sistemática y en el mismo patrón", "Solo si el clima es malo", "Cada dos vuelos"], correcta: 1 },
  { id: "op-q2", pregunta: "La técnica 'flujo + verificación' significa:", opciones: ["Leer la checklist línea por línea desde cero", "Ejecutar de memoria y luego confirmar con la checklist", "Ignorar la checklist si tienes experiencia", "Pedirle a otro piloto que la lea"], correcta: 1 },
  { id: "op-q3", pregunta: "La llamada 'DESPEJADO' (clear prop) se hace:", opciones: ["Después de aterrizar", "Antes de girar la llave de encendido", "Solo en aviones a reacción", "Durante el crucero"], correcta: 1 },
  { id: "op-q4", pregunta: "Si la presión de aceite no sube en los primeros segundos tras el arranque, debes:", opciones: ["Seguir volando normal", "Apagar el motor de inmediato", "Aumentar potencia", "Ignorarlo si el motor suena bien"], correcta: 1 },
  { id: "op-q5", pregunta: "Durante el rodaje, la dirección se controla principalmente con:", opciones: ["El yoke", "Los pedales de timón", "La mezcla", "El trim"], correcta: 1 },
  { id: "op-q6", pregunta: "El run-up incluye verificar:", opciones: ["Solo el nivel de combustible", "Cada magneto individualmente y los instrumentos del motor", "El clima del destino", "Solo las luces"], correcta: 1 },
  { id: "op-q7", pregunta: "Durante el ascenso, Vy se usa para:", opciones: ["Mejor ángulo de ascenso", "Mejor tasa de ascenso (ganar altitud más rápido en tiempo)", "Velocidad de crucero", "Aterrizar"], correcta: 1 },
  { id: "op-q8", pregunta: "Ajustar la mezcla en crucero (leaning) sirve para:", opciones: ["Aumentar el ruido del motor", "Optimizar consumo y rendimiento a esa altitud", "Apagar el motor gradualmente", "No tiene ningún efecto"], correcta: 1 },
  { id: "op-q9", pregunta: "Una regla práctica para el descenso es multiplicar la altitud a perder (en miles de pies) por:", opciones: ["1", "3", "10", "No existe tal regla"], correcta: 1 },
  { id: "op-q10", pregunta: "Una aproximación inestable debe resolverse con:", opciones: ["Forzar el aterrizaje de todas formas", "Un go-around, sin dudar", "Reducir la velocidad al mínimo", "Pedir ayuda a la torre únicamente"], correcta: 1 },
  { id: "op-q11", pregunta: "El flare (redondeo) ocurre:", opciones: ["Al iniciar el descenso", "Justo antes de tocar tierra, reduciendo la tasa de descenso", "Durante el rodaje", "Al arrancar el motor"], correcta: 1 },
  { id: "op-q12", pregunta: "¿Cuándo se ejecuta la checklist 'después de aterrizaje'?", opciones: ["Antes de tocar la pista", "Una vez fuera de la pista activa", "Durante el flare", "Nunca es necesaria"], correcta: 1 },
  { id: "op-q13", pregunta: "Existen checklists:", opciones: ["Solo de emergencia", "Normales, Anormales y de Emergencia", "Solo normales", "No existen categorías"], correcta: 1 },
  { id: "op-q14", pregunta: "Durante la carrera de despegue, si algo se ve mal en los instrumentos del motor:", opciones: ["Continuar siempre el despegue", "Aún hay pista disponible para abortar", "Ignorarlo y revisar después", "Aumentar potencia al máximo"], correcta: 1 },
  { id: "op-q15", pregunta: "Después de aterrizar y estacionar, el procedimiento de apagado incluye:", opciones: ["Mezcla a corte y magnetos apagados", "Dejar el motor encendido", "Solo cerrar la puerta", "Nada en particular"], correcta: 0 },
  { id: "op-q16", pregunta: "Durante el arranque, en un caso la presión de aceite no sube en los primeros segundos; en otro, sube normal pero las RPM son inestables. ¿Cuál exige apagar de inmediato y cuál permite observar brevemente?", opciones: ["Ambas exigen apagar de inmediato sin excepción", "La falta de presión de aceite exige apagar de inmediato por riesgo de daño al motor; unas RPM inestables pueden observarse unos segundos antes de decidir", "Ninguna de las dos requiere acción inmediata", "Las RPM inestables siempre son más graves que la falta de presión de aceite"], correcta: 1 },
  { id: "op-q17", pregunta: "Comparando una aproximación estabilizada contra una inestable a 200 pies de altura, ¿qué decisión corresponde a cada una y por qué la indecisión es el mayor riesgo en la segunda?", opciones: ["Continuar el aterrizaje en ambos casos por igual", "Si está estabilizada, continuar; si está inestable, ejecutar un go-around sin dudar — dudar mientras se acerca el suelo reduce el margen para corregir o abortar con seguridad", "Siempre abortar sin importar la estabilización", "La estabilización no afecta la decisión de aterrizar"], correcta: 1 },
];

const QUIZ_ESPACIOS: QuizPregunta[] = [
  { id: "esp-q1", pregunta: "El espacio Clase A comienza en:", opciones: ["El nivel del mar", "FL180 (18,000 pies)", "10,000 pies AGL", "Solo sobre aeropuertos grandes"], correcta: 1 },
  { id: "esp-q2", pregunta: "Para entrar en espacio Clase B necesitas:", opciones: ["Solo establecer contacto por radio", "Autorización EXPLÍCITA de control antes de entrar", "Nada, es espacio no controlado", "Solo un plan de vuelo IFR"], correcta: 1 },
  { id: "esp-q3", pregunta: "¿Qué diferencia principal hay entre Clase C y Clase B?", opciones: ["No hay diferencia", "Clase C solo requiere contacto bidireccional establecido, no autorización explícita", "Clase C es más restrictiva que Clase B", "Clase C no existe en aviación"], correcta: 1 },
  { id: "esp-q4", pregunta: "La Clase D típicamente tiene un radio de:", opciones: ["50 millas náuticas", "4 millas náuticas hasta 2,500 pies sobre el aeropuerto", "100 millas náuticas", "No tiene límite definido"], correcta: 1 },
  { id: "esp-q5", pregunta: "En espacio Clase G (no controlado):", opciones: ["No aplican reglas de ningún tipo", "Aún aplican mínimos de visibilidad y separación de nubes, más permisivos", "Se requiere autorización de control", "Está prohibido volar VFR"], correcta: 1 },
  { id: "esp-q6", pregunta: "Un Área Restringida (prefijo R-) se caracteriza por:", opciones: ["Prohibición absoluta y permanente", "Actividad peligrosa que requiere autorización, activa solo en horarios publicados", "Ser siempre espacio Clase A", "No existir en la práctica"], correcta: 1 },
  { id: "esp-q7", pregunta: "Un Área Prohibida (prefijo P-) implica:", opciones: ["Se puede cruzar con autorización previa", "Vuelo terminantemente prohibido sin excepción para civiles", "Solo aplica de noche", "Es lo mismo que una restringida"], correcta: 1 },
  { id: "esp-q8", pregunta: "Un Área de Peligro/Advertencia (Warning Area):", opciones: ["Es legalmente restrictiva como una prohibida", "No es legalmente restrictiva, pero señala actividad potencialmente peligrosa", "Solo existe en tierra", "Requiere autorización militar obligatoria"], correcta: 1 },
  { id: "esp-q9", pregunta: "¿Qué equipo suele requerirse para operar en Clase B o C?", opciones: ["Solo un mapa impreso", "Transponder Modo C y radio bidireccional operativo", "Ningún equipo especial", "Solo GPS"], correcta: 1 },
  { id: "esp-q10", pregunta: "Al planear una ruta VFR, el espacio aéreo determina principalmente:", opciones: ["Solo el color del avión permitido", "Qué comunicaciones, equipo y mínimos meteorológicos aplican en cada tramo", "El precio del combustible", "Nada relevante para VFR"], correcta: 1 },
  { id: "esp-q11", pregunta: "¿Qué forma característica tiene el espacio Clase B en las cartas?", opciones: ["Círculos concéntricos que se ensanchan con la altitud", "Un cuadrado perfecto", "Una línea recta", "No tiene forma definida"], correcta: 0 },
  { id: "esp-q12", pregunta: "Fuera del horario de la torre, el espacio Clase D generalmente revierte a:", opciones: ["Clase A", "Clase E o G", "Clase B", "Sigue siendo Clase D siempre"], correcta: 1 },
  { id: "esp-q13", pregunta: "El espacio Clase E puede comenzar en superficie, a 700 pies AGL o a:", opciones: ["1,200 pies AGL", "5,000 pies AGL", "18,000 pies", "No tiene otra opción"], correcta: 0 },
  { id: "esp-q14", pregunta: "La única regla de separación en espacio Clase G es:", opciones: ["Autorización de control", "'Ve y evita'", "Contacto obligatorio por radio", "No existe ninguna regla"], correcta: 1 },
  { id: "esp-q15", pregunta: "Antes de asumir que una Restringida puede cruzarse libremente fuera de horario, debes:", opciones: ["Nada, simplemente cruzar", "Verificar los NOTAMs vigentes", "Pedir permiso a otro piloto", "Esperar la noche"], correcta: 1 },
  { id: "esp-q16", pregunta: "Tu ruta cruza primero espacio Clase C y luego Clase D fuera del horario de la torre (que revierte a E/G). ¿En cuál tramo necesitas contacto bidireccional establecido antes de entrar y en cuál no?", opciones: ["En ambos tramos necesitas autorización explícita", "En el tramo Clase C necesitas contacto bidireccional establecido antes de entrar; en el tramo ahora E/G no se requiere autorización", "En ninguno se requiere contacto por radio", "Solo el tramo Clase D requiere autorización explícita"], correcta: 1 },
  { id: "esp-q17", pregunta: "Comparando un Área Restringida activa fuera de su horario publicado contra una Prohibida en cualquier momento, ¿qué verificación previa es indispensable antes de asumir que la Restringida está libre para cruzar?", opciones: ["Ninguna, si no está en horario siempre está libre", "Verificar los NOTAMs vigentes, ya que el horario publicado puede cambiar o extenderse; una Prohibida nunca es cruzable para civiles", "Preguntar a otro piloto en la frecuencia", "Ambas siempre están disponibles para cruzar libremente"], correcta: 1 },
];

const QUIZ_REGLAMENTACION: QuizPregunta[] = [
  { id: "reg-q1", pregunta: "El vuelo VFR se basa fundamentalmente en:", opciones: ["Navegación exclusiva por instrumentos", "Referencia visual constante con el horizonte y el terreno", "Autorización obligatoria de control en todo momento", "No requiere ninguna regla de separación"], correcta: 1 },
  { id: "reg-q2", pregunta: "En reglas de prioridad de paso VFR, ante un cruce frontal:", opciones: ["Ambos ceden a la derecha", "El más rápido tiene prioridad", "El de mayor tamaño siempre tiene prioridad", "No hay regla definida"], correcta: 0 },
  { id: "reg-q3", pregunta: "El vuelo IFR requiere:", opciones: ["Nunca presentar plan de vuelo", "Plan de vuelo autorizado y seguir instrucciones continuas de ATC", "Solo referencia visual", "No necesita ningún equipo especial"], correcta: 1 },
  { id: "reg-q4", pregunta: "La progresión típica de licencias es:", opciones: ["ATP, CPL, PPL, Alumno", "Alumno, Privado (PPL), Comercial (CPL), ATP", "Solo existe una licencia universal", "Comercial, luego Privado"], correcta: 1 },
  { id: "reg-q5", pregunta: "¿Qué autoridad emite licencias de piloto en México?", opciones: ["FAA", "AFAC (bajo el marco del RAC 61)", "EASA", "OACI directamente a pilotos individuales"], correcta: 1 },
  { id: "reg-q6", pregunta: "Además de horas de vuelo, obtener una licencia requiere:", opciones: ["Solo pagar una cuota", "Certificado médico vigente, examen teórico y examen práctico (checkride)", "Nada más que la edad mínima", "Solo un examen de manejo de automóvil"], correcta: 1 },
  { id: "reg-q7", pregunta: "Como referencia general, la reserva mínima de combustible VFR diurno es aproximadamente:", opciones: ["5 minutos", "30 minutos", "3 horas", "No se requiere reserva en VFR diurno"], correcta: 1 },
  { id: "reg-q8", pregunta: "Los mínimos meteorológicos VFR generalmente son:", opciones: ["Iguales en todo tipo de espacio aéreo", "Más estrictos en espacio aéreo controlado que en no controlado", "Solo aplican de noche", "No existen mínimos legales en ningún espacio"], correcta: 1 },
  { id: "reg-q9", pregunta: "¿Qué calificación adicional (rating) se suma comúnmente a una licencia?", opciones: ["Ninguna, la licencia es fija", "Instrumentos, Multimotor, Instructor de vuelo", "Solo se permite una licencia por vida", "Únicamente vuelo acrobático"], correcta: 1 },
  { id: "reg-q10", pregunta: "Como referencia general, un PPL requiere aproximadamente:", opciones: ["10 horas totales", "40 horas totales de vuelo", "500 horas totales", "No tiene mínimo de horas"], correcta: 1 },
  { id: "reg-q11", pregunta: "Como referencia general, un CPL requiere aproximadamente:", opciones: ["10-20 horas", "150-250 horas totales", "1,000 horas mínimo siempre", "No requiere horas adicionales al PPL"], correcta: 1 },
  { id: "reg-q12", pregunta: "Para operaciones internacionales o radiocomunicación en inglés se exige:", opciones: ["Nada especial", "Demostrar competencia en inglés según la escala OACI", "Solo saber leer números", "Un examen de otro idioma distinto"], correcta: 1 },
  { id: "reg-q13", pregunta: "El vuelo IFR requiere mantener competencia (currency) mediante:", opciones: ["Nada adicional a la licencia", "Un mínimo de aproximaciones y procedimientos practicados recientemente", "Solo volar una vez al año", "Un examen médico mensual"], correcta: 1 },
  { id: "reg-q14", pregunta: "Para VFR nocturno o vuelo IFR, la reserva mínima común de combustible aumenta a:", opciones: ["15 minutos", "45 minutos", "3 horas", "No cambia respecto al VFR diurno"], correcta: 1 },
  { id: "reg-q15", pregunta: "Si el pronóstico no alcanza los mínimos IFR publicados de destino, la regulación exige:", opciones: ["Volar de todas formas", "Planificar un alterno adecuado", "Cancelar toda la temporada de vuelos", "Ninguna acción especial"], correcta: 1 },
  { id: "reg-q16", pregunta: "Comparando la reserva VFR diurna (30 min) contra la nocturna (45 min), si tu ETA de un vuelo nocturno planeado al límite se recorre 20 minutos por viento en contra, ¿qué debiste haber hecho al planear?", opciones: ["Nada, la reserva mínima siempre alcanza sin importar el retraso", "Agregar un margen adicional de combustible más allá del mínimo legal, anticipando retrasos, sobre todo de noche donde el margen ya es más ajustado", "Volar más rápido para compensar automáticamente el retraso", "El retraso no afecta los requisitos de combustible"], correcta: 1 },
  { id: "reg-q17", pregunta: "Comparando la progresión Alumno → PPL → CPL, si un cadete quiere volar de noche con pasajeros antes de tener 40 horas totales, ¿qué le falta y por qué importa el orden de los requisitos?", opciones: ["Nada, puede llevar pasajeros sin licencia si tiene suficiente experiencia", "Le falta completar el PPL (que exige aproximadamente 40 horas), ya que llevar pasajeros requiere una licencia vigente, no solo horas acumuladas como alumno", "Solo necesita aprobar el examen médico", "El orden de los requisitos no importa en la práctica"], correcta: 1 },
];

const QUIZ_IFR: QuizPregunta[] = [
  { id: "ifr-q1", pregunta: "IFR permite volar:", opciones: ["Solo con buen clima", "Navegando exclusivamente por instrumentos, sin referencia visual externa", "Sin ningún contacto con ATC", "Solo de día"], correcta: 1 },
  { id: "ifr-q2", pregunta: "Un plan de vuelo IFR incluye:", opciones: ["Solo el nombre del piloto", "Ruta, altitud de crucero, combustible y alterno", "Nada relacionado al combustible", "Solo se presenta en el aire"], correcta: 1 },
  { id: "ifr-q3", pregunta: "Una SID sirve para:", opciones: ["Conectar el aeropuerto de destino con la aproximación", "Conectar el aeropuerto de salida con la estructura de aerovías", "Solo se usa en VFR", "Reemplazar el plan de vuelo"], correcta: 1 },
  { id: "ifr-q4", pregunta: "Las Aerovías Victor operan:", opciones: ["Sobre FL180 únicamente", "En baja altitud, típicamente hasta FL180", "Solo sobre el océano", "Sin relación con VOR"], correcta: 1 },
  { id: "ifr-q5", pregunta: "Una STAR es el procedimiento inverso a:", opciones: ["El aterrizaje", "La SID", "El holding", "El plan de vuelo"], correcta: 1 },
  { id: "ifr-q6", pregunta: "El ILS provee guía:", opciones: ["Solo lateral", "Lateral (Localizer) y vertical (Glideslope)", "Solo vertical", "Ninguna guía electrónica"], correcta: 1 },
  { id: "ifr-q7", pregunta: "Al llegar a la DA sin referencias visuales suficientes, debes:", opciones: ["Descender un poco más por si acaso", "Ejecutar de inmediato la aproximación frustrada", "Esperar en el aire indefinidamente", "Aterrizar de todas formas"], correcta: 1 },
  { id: "ifr-q8", pregunta: "RNAV usa como referencia principal:", opciones: ["Estaciones VOR terrestres", "GPS/GNSS", "El compás magnético", "Radiales NDB"], correcta: 1 },
  { id: "ifr-q9", pregunta: "Una aproximación VOR usa, en vez de DA, una:", opciones: ["MDA (Minimum Descent Altitude)", "STAR", "SID", "Holding altitude"], correcta: 0 },
  { id: "ifr-q10", pregunta: "Un holding es:", opciones: ["Un tipo de aterrizaje", "Un patrón de espera en forma de hipódromo", "Una autorización de despegue", "Un tipo de carta VFR"], correcta: 1 },
  { id: "ifr-q11", pregunta: "El formato CRAFT de una autorización IFR incluye:", opciones: ["Solo la ruta", "Clearance limit, Route, Altitude, Frequency, Transponder", "Solo el squawk", "El nombre del controlador"], correcta: 1 },
  { id: "ifr-q12", pregunta: "Una SID garantiza principalmente:", opciones: ["Menor consumo de combustible", "Separación de obstáculos y terreno durante el ascenso inicial", "Un aterrizaje más suave", "Comunicación en español únicamente"], correcta: 1 },
  { id: "ifr-q13", pregunta: "Las Aerovías Victor se definen por:", opciones: ["Coordenadas GPS únicamente", "Radiales VOR, hasta FL180", "Rutas Jet sobre FL450", "No tienen definición estándar"], correcta: 1 },
  { id: "ifr-q14", pregunta: "¿Qué nivel de aproximación RNAV ofrece los mínimos más bajos, comparables a un ILS CAT I?", opciones: ["LNAV", "LNAV/VNAV", "LPV", "VOR Approach"], correcta: 2 },
  { id: "ifr-q15", pregunta: "En un holding, la entrada donde te alejas en ángulo antes de virar hacia el fix se llama:", opciones: ["Directa", "Paralela", "Teardrop", "No existe ese tipo de entrada"], correcta: 2 },
  { id: "ifr-q16", pregunta: "Comparando una aproximación ILS (con DA) contra una VOR (con MDA), si llegas a tu altitud mínima sin referencias visuales en ambos casos, ¿qué diferencia hay en cuánto tiempo puedes permanecer en esa altitud antes de decidir?", opciones: ["Ninguna diferencia, ambas son idénticas en este aspecto", "En la DA debes iniciar la aproximación frustrada de inmediato al alcanzarla; en la MDA puedes continuar nivelado brevemente hasta el punto de aproximación frustrada, buscando referencias", "La MDA siempre exige acción inmediata y la DA no", "Puedes descender por debajo de cualquiera de las dos sin problema"], correcta: 1 },
  { id: "ifr-q17", pregunta: "Comparando una SID con una STAR, si ATC te cambia de pista antes del despegue después de asignarte una SID, ¿qué parte de tu briefing original ya no es válida?", opciones: ["Nada cambia, las SID son iguales sin importar la pista", "La ruta y las restricciones de altitud de la SID pueden cambiar según la pista de salida; debes revisar la nueva SID asignada antes de rodar", "Solo el código squawk cambia con la pista", "El cambio de pista nunca afecta el procedimiento de salida"], correcta: 1 },
];

const QUIZ_FUNDAMENTOS: QuizPregunta[] = [
  { id: "fun-q1", pregunta: "¿Qué hace que un avión se mantenga en el aire?", opciones: ["Únicamente la velocidad", "La sustentación generada por las alas venciendo el peso", "El tamaño del avión", "Únicamente la potencia del motor"], correcta: 1 },
  { id: "fun-q2", pregunta: "En vuelo recto y nivelado a velocidad constante, ¿qué fuerzas están en equilibrio?", opciones: ["Solo peso y sustentación", "Solo empuje y resistencia", "Sustentación = Peso y Empuje = Resistencia", "Ninguna, siempre hay aceleración"], correcta: 2 },
  { id: "fun-q3", pregunta: "¿Qué principio explica la sustentación por diferencia de presión sobre el ala?", opciones: ["Tercera Ley de Newton", "Principio de Bernoulli", "Principio de Arquímedes", "Ley de Pascal"], correcta: 1 },
  { id: "fun-q4", pregunta: "¿Qué parte del avión incluye el estabilizador horizontal y vertical?", opciones: ["Fuselaje", "Alas", "Empenaje (cola)", "Tren de aterrizaje"], correcta: 2 },
  { id: "fun-q5", pregunta: "¿Qué movimiento controlan los alerones?", opciones: ["Cabeceo", "Alabeo", "Guiñada", "Potencia"], correcta: 1 },
  { id: "fun-q6", pregunta: "El eje vertical controla principalmente:", opciones: ["Alabeo", "Cabeceo", "Guiñada", "Ninguno de los anteriores"], correcta: 2 },
  { id: "fun-q7", pregunta: "¿Qué control ajusta la proporción de combustible y aire según la altitud?", opciones: ["Yoke", "Pedales", "Throttle", "Mixture (mezcla)"], correcta: 3 },
  { id: "fun-q8", pregunta: "¿Cuál de estos NO forma parte del 'Six Pack' analógico?", opciones: ["Altímetro", "Horizonte artificial", "GPS", "Variómetro"], correcta: 2 },
  { id: "fun-q9", pregunta: "El Tren de aterrizaje tiene como función principal:", opciones: ["Generar sustentación", "Soportar el peso en tierra y absorber el impacto del aterrizaje", "Controlar la guiñada", "Reducir el consumo de combustible"], correcta: 1 },
  { id: "fun-q10", pregunta: "¿Qué superficie controla la guiñada (yaw)?", opciones: ["Alerones", "Flaps", "Timón de dirección", "Elevador"], correcta: 2 },
  { id: "fun-q11", pregunta: "El Eje longitudinal (nariz-cola) controla:", opciones: ["El cabeceo", "El alabeo (roll)", "La guiñada", "La velocidad"], correcta: 1 },
  { id: "fun-q12", pregunta: "¿Qué controla el Yoke al moverlo hacia adelante o atrás?", opciones: ["Los alerones", "El elevador (cabeceo)", "El timón de dirección", "La mezcla"], correcta: 1 },
  { id: "fun-q13", pregunta: "Además del timón de dirección, los pedales controlan en tierra:", opciones: ["La potencia del motor", "El frenado diferencial y la dirección de la rueda de nariz", "Los flaps", "El horizonte artificial"], correcta: 1 },
  { id: "fun-q14", pregunta: "¿Qué instrumento muestra la actitud respecto al horizonte real?", opciones: ["Altímetro", "Horizonte artificial (Attitude Indicator)", "Indicador de rumbo", "Variómetro"], correcta: 1 },
  { id: "fun-q15", pregunta: "Volar es, en esencia:", opciones: ["Un truco de velocidad pura", "Un equilibrio dinámico de fuerzas", "Un efecto exclusivo del motor", "Un fenómeno sin explicación física"], correcta: 1 },
  { id: "fun-q16", pregunta: "Comparando dos aviones idénticos a la misma velocidad, uno con mayor ángulo de ataque que el otro, ¿cuál genera más sustentación y qué riesgo aumenta si ese ángulo sigue creciendo?", opciones: ["El de menor ángulo, y el riesgo es quedarse sin combustible", "El de mayor ángulo genera más sustentación hasta el ángulo crítico, después del cual el ala entra en pérdida", "Ambos generan exactamente la misma sustentación siempre", "El ángulo de ataque no afecta la sustentación generada"], correcta: 1 },
  { id: "fun-q17", pregunta: "En un viraje, si aplicas solo alerón sin nada de timón, ¿qué efecto secundario no deseado aparece y por qué se usa el timón para corregirlo?", opciones: ["Ninguno, los alerones son suficientes por sí solos", "Aparece guiñada adversa porque el alerón que sube genera más resistencia que el que baja; el timón la compensa", "El avión pierde toda su sustentación de inmediato", "El motor se apaga automáticamente al virar"], correcta: 1 },
];

export const MODULE_PRACTICA: Record<string, QuizPregunta[]> = {
  fundamentos: split(QUIZ_FUNDAMENTOS).practica,
  meteorologia: split(QUIZ_METEOROLOGIA).practica,
  navegacion: split(QUIZ_NAVEGACION).practica,
  cartografia: split(QUIZ_CARTOGRAFIA).practica,
  comunicaciones: split(QUIZ_COMUNICACIONES).practica,
  instrumentos: split(QUIZ_INSTRUMENTOS).practica,
  rendimiento: split(QUIZ_RENDIMIENTO).practica,
  operacion: split(QUIZ_OPERACION).practica,
  "espacios-aereos": split(QUIZ_ESPACIOS).practica,
  reglamentacion: split(QUIZ_REGLAMENTACION).practica,
  ifr: split(QUIZ_IFR).practica,
};

export const MODULE_EVALUACION: Record<string, QuizPregunta[]> = {
  fundamentos: split(QUIZ_FUNDAMENTOS).evaluacion,
  meteorologia: split(QUIZ_METEOROLOGIA).evaluacion,
  navegacion: split(QUIZ_NAVEGACION).evaluacion,
  cartografia: split(QUIZ_CARTOGRAFIA).evaluacion,
  comunicaciones: split(QUIZ_COMUNICACIONES).evaluacion,
  instrumentos: split(QUIZ_INSTRUMENTOS).evaluacion,
  rendimiento: split(QUIZ_RENDIMIENTO).evaluacion,
  operacion: split(QUIZ_OPERACION).evaluacion,
  "espacios-aereos": split(QUIZ_ESPACIOS).evaluacion,
  reglamentacion: split(QUIZ_REGLAMENTACION).evaluacion,
  ifr: split(QUIZ_IFR).evaluacion,
};

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
