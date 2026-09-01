import type { QuizPregunta } from "../features/academia/quizData";
import type { ScenarioNode } from "../features/academia/ScenarioSimulator";
import type { SliderConfig } from "../features/academia/DragSlider";
import type { TermPair } from "../features/academia/TermMatch";

export interface LeccionContenido {
  titulo: string;
  contenido: string[];
  /** Imágenes de apoyo mostradas al final de la lección, cuando aplica. */
  imagenes?: string[];
}

// ---------- Lecciones ----------

export const MODULE_LECCIONES: Record<string, LeccionContenido[]> = {
  fundamentos: [
    {
      titulo: "Por qué vuela un avión: las 4 fuerzas y los principios físicos",
      contenido: [
        "Un avión es una máquina más pesada que el aire capaz de sostenerse y desplazarse por la atmósfera gracias a fuerzas aerodinámicas generadas por su movimiento relativo al aire. Vuela porque genera sustentación suficiente para vencer su propio peso, usando alas con forma de perfil aerodinámico que crean una diferencia de presión entre su superficie superior e inferior. Entender esta idea central —que volar es un equilibrio dinámico de fuerzas, no magia ni solo velocidad— es la base de todo lo demás que aprenderás como piloto.",
        "Todo avión en vuelo está sometido a 4 fuerzas fundamentales: Sustentación (Lift), generada por las alas, que se opone al Peso (Weight); y Empuje (Thrust), producido por el motor, que se opone a la Resistencia (Drag). En vuelo recto y nivelado a velocidad constante, estas 4 fuerzas están en equilibrio: sustentación = peso y empuje = resistencia. Cualquier cambio de actitud, potencia o configuración rompe momentáneamente este equilibrio y produce una reacción — subir, bajar, acelerar o desacelerar.",
        "La sustentación se explica mediante dos principios físicos complementarios. El Principio de Bernoulli establece que, en un fluido en movimiento, a mayor velocidad menor presión: el perfil del ala hace que el aire viaje más rápido sobre la superficie superior, generando menor presión arriba y mayor presión abajo — esa diferencia empuja el ala hacia arriba. La Tercera Ley de Newton (acción-reacción) explica lo mismo desde otro ángulo: el ala desvía el aire hacia abajo, y como reacción, el aire empuja el ala hacia arriba. Ambos principios no compiten, se complementan.",
        "Un avión típico de entrenamiento se compone de: el Fuselaje, la estructura central que aloja cabina, pasajeros y carga; las Alas, que generan la sustentación y suelen alojar combustible; el Empenaje (cola), formado por el estabilizador horizontal y vertical; el Tren de aterrizaje, que soporta el peso en tierra y absorbe el impacto del aterrizaje; y el Grupo motopropulsor (motor y hélice o turbina), que genera el empuje.",
      ],
      imagenes: ["/images/fundamentos-4fuerzas.png", "/images/fundamentos-pdb.png", "/images/fundamentos-tldn.png"],
    },
    {
      titulo: "Superficies, ejes, controles e instrumentos básicos",
      contenido: [
        "Las superficies de control son partes móviles que el piloto mueve para cambiar la actitud del avión. Los Alerones controlan el alabeo (roll) moviéndose en direcciones opuestas entre sí. El Elevador, en el estabilizador horizontal, controla el cabeceo (pitch). El Timón de dirección, en el estabilizador vertical, controla la guiñada (yaw). Además existen superficies secundarias como los Flaps, que aumentan la sustentación y resistencia para despegues y aterrizajes a baja velocidad.",
        "Un avión se mueve alrededor de 3 ejes imaginarios que se cruzan en su centro de gravedad. El Eje longitudinal (nariz-cola) controla el Alabeo, inclinando las alas mediante los alerones. El Eje lateral (ala-ala) controla el Cabeceo, subiendo o bajando el morro mediante el elevador. El Eje vertical controla la Guiñada, moviendo el morro mediante el timón de dirección.",
        "El piloto interactúa con el avión mediante controles primarios y secundarios. El Yoke, al moverse adelante/atrás controla el elevador, y al girarlo controla los alerones. Los Pedales de timón controlan el timón de dirección y, en tierra, el frenado diferencial. La Palanca de potencia (Throttle) regula el empuje disponible. El Control de mezcla (Mixture) ajusta la proporción de combustible y aire según la altitud.",
        "El 'Six Pack' es el conjunto de 6 instrumentos analógicos básicos en la cabina, organizados en dos filas de tres. Fila superior: Indicador de velocidad, Horizonte artificial y Altímetro. Fila inferior: Indicador de viraje y resbalamiento, Indicador de rumbo y Variómetro. Estos 6 instrumentos, leídos en conjunto (scan instrumental), dan al piloto una imagen completa del estado del avión en cualquier condición.",
      ],
    },
  ],
  meteorologia: [
    {
      titulo: "Cómo leer METAR y TAF",
      contenido: [
        "Un METAR (Meteorological Aerodrome Report) es un reporte de las condiciones meteorológicas ACTUALES observadas en un aeródromo, emitido cada hora (o cada 30 minutos en algunos casos especiales) por estaciones automáticas o personal capacitado. Es el lenguaje universal de la meteorología aeronáutica: usa un formato codificado y estandarizado internacionalmente para que cualquier piloto, en cualquier país, pueda leerlo sin importar el idioma local. Incluye viento, visibilidad, fenómenos meteorológicos presentes, cobertura de nubes, temperatura, punto de rocío y presión altimétrica.",
        "Tomemos un ejemplo real: METAR MMMX 171800Z 09008KT 8SM FEW030 SCT100 22/12 A3005. Se lee así: MMMX = identificador ICAO del aeropuerto (Ciudad de México); 171800Z = día 17 del mes, 18:00 UTC; 09008KT = viento del rumbo 090° a 8 nudos; 8SM = visibilidad de 8 millas estatutarias; FEW030 = nubes dispersas a 3,000 pies; SCT100 = nubes dispersas a 10,000 pies; 22/12 = temperatura 22°C, punto de rocío 12°C; A3005 = presión altimétrica 30.05 inHg.",
        "Un TAF (Terminal Aerodrome Forecast) es un pronóstico del tiempo esperado en un aeropuerto, válido típicamente por 24 o 30 horas, actualizado cada 6 horas. A diferencia del METAR, describe lo que SE ESPERA que pase, incluyendo cambios de tendencia marcados con grupos como BECMG (cambio gradual) o TEMPO (cambio temporal).",
        "La diferencia central entre ambos es el tiempo: el METAR es una fotografía del presente, mientras que el TAF es una predicción del futuro. Usas el METAR para decidir si puedes despegar AHORA, y el TAF para planear el vuelo con horas de anticipación, incluyendo si necesitarás un alterno.",
        "Las nubes se describen con abreviaturas de cobertura: SKC/CLR (despejado), FEW (pocas), SCT (dispersas), BKN (fragmentadas) y OVC (cubierto). Las más relevantes por tipo son Cúmulos (buen tiempo), Estratos (visibilidad reducida), Cirros (buen tiempo pero anuncian cambio) y Cumulonimbos (tormentas eléctricas y turbulencia severa — se evitan siempre).",
      ],
    },
    {
      titulo: "Nubes, frentes, turbulencia y hielo",
      contenido: [
        "Un frente es la frontera entre dos masas de aire con temperaturas distintas. El Frente frío genera clima violento pero de corta duración: cumulonimbos, tormentas intensas y visibilidad muy reducida durante su paso. El Frente cálido genera nubosidad estratiforme extensa y lluvia ligera pero prolongada, con techos bajos por mucho más tiempo.",
        "La turbulencia se clasifica por origen: Mecánica (obstáculos), Térmica (corrientes ascendentes), Aire claro o CAT (asociada a corrientes de chorro, sin nubes que la anuncien), y de Estela (generada por los vórtices de las puntas de ala de aviones grandes). Por intensidad va de Ligera a Extrema.",
        "El Wind Shear es un cambio brusco de dirección y/o velocidad del viento en una distancia corta, especialmente peligroso cerca del suelo (LLWS). Su forma más severa es el microburst, una corriente descendente violenta típica de tormentas. Muchos aeropuertos grandes tienen sistemas de detección (LLWAS) que alertan a los controladores.",
        "El hielo estructural se forma cuando gotas de agua superenfriada se congelan al contacto con el avión, alterando el perfil aerodinámico y reduciendo la sustentación. El hielo de carburador ocurre dentro del sistema de admisión del motor, incluso con temperaturas exteriores positivas. Las condiciones más favorables para hielo estructural son nubes entre 0°C y -20°C con agua líquida presente.",
        "La Altitud de densidad es la altitud a la que el avión 'siente' que vuela, ajustada por temperatura, presión y humedad. Toluca (MMTO), a 8,466 pies de elevación real, es el ejemplo perfecto en México: en un día caluroso su altitud de densidad puede superar los 11,000-12,000 pies, con carreras de despegue más largas y tasas de ascenso reducidas.",
      ],
    },
  ],
  navegacion: [
    {
      titulo: "Radionavegación: VOR, CDI, DME, HSI y ADF",
      contenido: [
        "El VOR (VHF Omnidirectional Range) es una radioayuda terrestre que transmite información de rumbo en la banda VHF, permitiendo que el avión determine su posición angular (radial) respecto a la estación. Es la columna vertebral de la navegación aérea tradicional, tanto VFR como IFR.",
        "Un radial es cada una de las 360 líneas rectas imaginarias que salen del VOR, numeradas según su rumbo magnético MEDIDO DESDE la estación. El radial 090 sale hacia el este; el radial 270 sale hacia el oeste. El radial siempre se mide desde el VOR hacia afuera, nunca hacia la estación.",
        "La bandera FROM/TO te dice si, volando el curso seleccionado, te alejarías (FROM) o te acercarías (TO) a la estación. El radial y el curso TO la estación son opuestos entre sí (difieren 180°) — para volar TO un VOR estando en el radial 090, tu curso sería 270, no 090.",
        "El CDI (Course Deviation Indicator) es la aguja que muestra qué tan lejos estás del curso seleccionado en el OBS. Cada punto de desviación representa aproximadamente 2° de error angular. Si la aguja está a la izquierda, vuelas HACIA la aguja para interceptar el curso, nunca te alejas de ella.",
        "El OBS (Omni Bearing Selector) es la perilla que giras para seleccionar el curso o radial que quieres volar. Interceptar una radial implica: seleccionar el radial en el OBS, observar hacia qué lado apunta la aguja, girar hacia un rumbo de intercepción (idealmente con un ángulo de 30°, el estándar recomendado) y mantenerlo hasta acercarte al centro.",
        "Tracking es mantener el avión exactamente sobre el radial deseado corrigiendo constantemente por el viento, calculando un Ángulo de Corrección por Viento (WCA). Homing, en cambio, es simplemente apuntar la nariz hacia la estación sin corregir el viento — resulta en una trayectoria curva e ineficiente.",
        "El DME (Distance Measuring Equipment) mide la distancia real en línea recta entre el avión y la estación, en millas náuticas, y muchas veces está integrado con el VOR o el ILS. El HSI (Horizontal Situation Indicator) combina el indicador de rumbo con la desviación de curso VOR/ILS en un solo instrumento, eliminando el problema de 'sensibilidad inversa' del CDI tradicional.",
        "El ADF (Automatic Direction Finder) usa estaciones NDB en tierra y, a diferencia del VOR, no da radiales: su aguja apunta directamente hacia la estación mostrando el rumbo relativo. El RMI mejora esto mostrando el rumbo magnético real hacia la estación, porque su rosa de compás gira junto con el avión.",
      ],
    },
    {
      titulo: "Cartas VFR y planificación de ruta",
      contenido: [
        "Las cartas VFR (tipo sectional) muestran toda la información necesaria para navegar visualmente: clasificación de espacio aéreo, aeropuertos con sus frecuencias, obstáculos y su altura, elevaciones del terreno, y la ubicación de estaciones VOR con su rosa de compás impresa.",
        "Para medir distancias en una carta VFR usas la escala gráfica o un plotter. Un truco práctico: un minuto de latitud (medido verticalmente en los bordes de la carta) equivale a una milla náutica, así que puedes usar los bordes de la carta como regla de distancias.",
        "Para saber la distancia a un aeropuerto puedes usar DME/VOR-DME si está disponible, o navegación por estima (dead reckoning): mide la distancia en la carta y divide entre tu velocidad respecto al suelo. Un GPS te da la distancia y tiempo estimado directamente, pero como piloto en entrenamiento debes poder calcularlo manualmente.",
        "Planear una ruta VFR involucra: seleccionar checkpoints visuales identificables, calcular rumbo y distancia entre cada uno, estimar tiempo y consumo considerando el viento pronosticado, verificar el espacio aéreo a cruzar, revisar NOTAMs y METAR/TAF, y definir siempre un alterno con reservas de combustible adecuadas.",
        "Tomando la ruta Guadalajara (MMGL) a Manzanillo (MMZO) como ejercicio integrador: identificas los VOR disponibles como checkpoints, mides la distancia total y por tramos, calculas el rumbo magnético inicial, estimas el tiempo total según tu velocidad de crucero y el viento, y planeas un alterno (por ejemplo Colima) por si el clima en Manzanillo no es favorable. Este tipo de ejercicio es exactamente lo que se evalúa en un checkride de navegación.",
      ],
    },
  ],
  cartografia: [
    {
      titulo: "Elementos y símbolos de la carta VFR",
      contenido: [
        "Existen varios tipos de cartas aeronáuticas según su propósito. Las Cartas VFR (Sectional Charts) son las más usadas para vuelo visual, a escala 1:500,000. Las Cartas de Área Terminal (TAC) cubren zonas de espacio aéreo denso alrededor de grandes ciudades. Para IFR existen las Cartas de Ruta de Baja y Alta Altitud, y las Cartas de Aproximación (approach plates) muestran el procedimiento detallado para aterrizar bajo IFR.",
        "Cada carta usa una simbología estandarizada: los aeropuertos con torre de control se dibujan con un círculo azul relleno, los no controlados en magenta; la longitud de las líneas que salen del círculo indica si la pista es dura o de superficie blanda. Los obstáculos se marcan con un punto y una torre pequeña. El terreno de mayor elevación se sombrea en tonos más oscuros de café/naranja.",
        "El espacio aéreo se divide en clases: Clase A (arriba de FL180, solo IFR), Clase B (círculos concéntricos sólidos azules, requiere autorización explícita), Clase C (círculos magenta sólidos, requiere contacto por radio), Clase D (líneas discontinuas azules), Clase E (líneas discontinuas magenta o sombreado) y Clase G (sin marcado especial). Reconocer estos límites es obligatorio antes de volar.",
        "Los obstáculos —torres, antenas, edificios altos— se representan con un símbolo de torre y un punto en su base exacta. Junto al símbolo aparecen dos números: la altura MSL y, entre paréntesis, la altura AGL. Por ejemplo, '1500 (450)' significa que la punta está a 1,500 pies MSL, de los cuales 450 pies son la estructura sobre el terreno local.",
      ],
    },
    {
      titulo: "Elevaciones, frecuencias, puntos VFR y lectura completa",
      contenido: [
        "Las cartas VFR muestran la elevación del terreno mediante sombreado en capas de color y líneas de contorno. Cada cuadrante tiene impreso un número llamado MEF (Maximum Elevation Figure) — la altitud más alta redondeada hacia arriba, incluyendo el obstáculo más alto conocido más un margen de seguridad. El MEF es tu referencia rápida de altitud mínima segura de sobrevuelo.",
        "Las frecuencias de radio relevantes (CTAF, Torre, Aproximación/Salida, ATIS) se imprimen junto a cada aeropuerto y límite de espacio aéreo. Antes de acercarte a cualquier espacio aéreo controlado debes identificar en la carta qué frecuencia contactar y en qué punto exacto de tu ruta.",
        "Los Puntos de Notificación VFR son ubicaciones visuales específicas —cerros, cruces de carreteras, poblados reconocibles— marcadas con un símbolo de estrella o triángulo magenta y un nombre corto, usados para reportar tu posición de forma rápida cerca de aeropuertos con tráfico denso.",
        "Leer una carta completa es integrar todo en un solo vistazo antes de volar: identificar tu ruta y los espacios aéreos que cruzarás, revisar el MEF de cada cuadrante, ubicar obstáculos relevantes, localizar VOR y puntos VFR como checkpoints, y anotar las frecuencias necesarias. Un buen hábito es trazar la ruta completa ANTES del vuelo con sus checkpoints, rumbo, distancia y tiempo estimado.",
      ],
    },
  ],
  comunicaciones: [
    {
      titulo: "Fraseología estándar: torre, rodaje y despegue",
      contenido: [
        "La fraseología aeronáutica es un lenguaje estandarizado mundialmente diseñado para eliminar ambigüedad. Incluye el alfabeto fonético (Alfa, Bravo, Charlie...) para deletrear matrículas, pronunciación estándar de números dígito por dígito, y palabras clave con significado fijo: Afirmativo, Negativo, Wilco (voy a cumplir) y Roger (recibido, entendido, sin implicar que cumplirás).",
        "El primer contacto con cualquier estación sigue una estructura fija: a quién llamas, quién eres, y qué necesitas. Ejemplo: 'Torre Guadalajara, Cessna XB-VLA, en plataforma, solicito rodaje para salida local con información Bravo.' Nunca omitas tu matrícula completa en el primer contacto.",
        "La autorización de rodaje especifica la ruta exacta y cualquier punto de espera (hold short). Debes leer de vuelta (readback) cualquier instrucción de 'mantener corto' de una pista, sin excepción — es una de las pocas instrucciones donde el readback es obligatorio siempre, porque un error aquí puede causar una incursión de pista.",
        "Antes de solicitar la pista completas tus listas de verificación. La autorización de despegue tiene un formato específico que debes leer de vuelta completo: 'XB-VLA, autorizado a despegar pista 20, viento 200 a 8 nudos.' Nunca cruces el umbral de la pista sin autorización explícita, incluso si parece despejada.",
      ],
    },
    {
      titulo: "Circuito, aproximación, IFR, emergencias y errores comunes",
      contenido: [
        "Dentro del circuito de tráfico, los reportes de posición siguen el orden: viento en cola (downwind), base y final. Fuera del circuito, los reportes en ruta indican quién eres, dónde estás, tu altitud y tus intenciones. Para cruzar espacio aéreo controlado sin aterrizar necesitas solicitar y recibir autorización de tránsito VFR antes de entrar.",
        "Al acercarte a tu destino usualmente contactas primero a Aproximación, que te da vectores, altitudes y secuenciación. La autorización de aterrizaje llega en tramo final y tu readback debe confirmarla con tu matrícula. El silencio nunca es autorización.",
        "Bajo reglas IFR, recibes tu autorización de vuelo (clearance) antes de salir, y debes leerla de vuelta completa y correctamente, especialmente el squawk y las altitudes. La disciplina de readback es aún más crítica en IFR porque hay menos referencia visual para detectar errores.",
        "Existen dos niveles de emergencia por radio: PAN-PAN (repetido 3 veces) para una situación urgente sin peligro inmediato de vida, y MAYDAY (repetido 3 veces) para peligro grave e inminente. Declarar una emergencia te da prioridad absoluta sobre cualquier otro tráfico.",
        "Los errores más frecuentes incluyen: omitir el readback de instrucciones críticas, usar matrícula incompleta antes de que torre lo autorice, bloquear la frecuencia hablando al mismo tiempo que otra estación, asumir una autorización que nunca se dio, y usar lenguaje coloquial en momentos críticos. La disciplina de radio es una herramienta de seguridad, no solo una cuestión de sonar profesional.",
      ],
    },
  ],
  instrumentos: [
    {
      titulo: "Instrumentos de vuelo: altímetro, velocidad, actitud y viraje",
      contenido: [
        "El altímetro mide tu altitud usando la presión estática del aire exterior, comparándola contra una referencia que ajustas en la ventana Kollsman. Regla clave: 'de alta a baja presión, cuidado abajo' — si vuelas hacia una zona de menor presión sin ajustar tu Kollsman, el altímetro te muestra más altura de la que realmente tienes.",
        "El indicador de velocidad mide la diferencia entre presión dinámica y estática. El disco tiene arcos de color: blanco (rango de flaps), verde (operación normal), amarillo (precaución) y una línea roja (Vne, nunca exceder). Es importante distinguir IAS (indicada), CAS (corregida) y TAS (verdadera, ajustada por la densidad del aire a tu altitud).",
        "El Horizonte Artificial muestra tu inclinación y cabeceo respecto al horizonte real usando un giróscopo. Es especialmente crítico en vuelo por instrumentos, donde es tu única referencia confiable de actitud. Como cualquier giróscopo mecánico, puede sufrir precesión y requiere revisión periódica contra otros instrumentos.",
        "El indicador de Giro y Viraje muestra tu tasa de giro, no tu ángulo de inclinación. Un 'viraje estándar' es de 3° por segundo, completando 360° en 2 minutos. El Coordinador de Viraje es una evolución que muestra la velocidad de alabeo y la tasa de giro combinadas, respondiendo más rápido al inicio de un viraje.",
      ],
    },
    {
      titulo: "VSI, compás, HSI, RMI, DME y transponder",
      contenido: [
        "El VSI (Variómetro) muestra tu tasa de ascenso o descenso en pies por minuto. Su característica más importante es el retraso inherente de 6-9 segundos, por lo que no debe usarse como referencia primaria para maniobras rápidas de cabeceo.",
        "El compás magnético es el único instrumento de rumbo que funciona sin electricidad ni vacío, pero sufre errores como la Variación, la Desviación, y el error dinámico ANDS (al acelerar hacia el norte indica un giro que no existe, y lo opuesto al desacelerar hacia el sur en el hemisferio norte).",
        "El HSI combina un giro direccional con la desviación de curso VOR/ILS en una sola carátula, sin los errores dinámicos del compás magnético, aunque debe sincronizarse periódicamente. El RMI combina una rosa de compás giroscópica con agujas que apuntan hacia estaciones ADF y/o VOR, dando el rumbo magnético real hacia la estación.",
        "El DME mide la distancia por el tiempo que tarda un pulso en ir y regresar de la estación, mostrando distancia, velocidad de acercamiento y tiempo estimado. El Transponder responde a las interrogaciones del radar con un código squawk de 4 dígitos; los códigos de emergencia universales son 7500 (secuestro), 7600 (falla de comunicaciones) y 7700 (emergencia general).",
      ],
    },
  ],
  rendimiento: [
    {
      titulo: "Peso, balance y distancias de despegue/aterrizaje",
      contenido: [
        "Todo avión tiene un Peso Máximo de Despegue certificado que no puede excederse. El Peso Vacío más la tripulación, pasajeros, equipaje y combustible da el Peso Bruto de la operación. La diferencia entre el peso máximo certificado y el peso vacío es la Carga Útil (Useful Load).",
        "El Centro de Gravedad (CG) debe mantenerse dentro de un rango certificado (el 'sobre' de CG) para que el avión sea controlable. Se calcula mediante Momento = Peso × Brazo. Un CG muy adelantado hace al avión más estable pero pesado de controlar en cabeceo; uno muy atrasado lo hace más ágil pero peligrosamente inestable.",
        "La distancia de despegue depende del peso, la altitud de densidad, el viento (de frente reduce la distancia, de cola la aumenta significativamente) y la condición de la pista. Nunca debe asumirse que 'siempre me ha alcanzado la pista' — cada combinación de condiciones es distinta.",
        "La distancia de aterrizaje se ve afectada por los mismos factores: un viento de cola de solo 10 nudos puede aumentar la distancia de frenado entre 20 y 30%. Las gráficas de rendimiento del POH deben consultarse antes de cualquier aterrizaje en pista corta o con condiciones fuera de lo habitual.",
      ],
    },
    {
      titulo: "Performance, V-speeds y viento cruzado",
      contenido: [
        "Las gráficas de rendimiento del manual permiten calcular distancias, tasas de ascenso y consumo entrando con condiciones específicas. La habilidad clave es la interpolación: cuando tus condiciones caen entre dos valores impresos, debes estimar proporcionalmente, no redondear. Siempre se aplica un margen de seguridad adicional (comúnmente 30-50% extra en distancia de pista).",
        "Las V-speeds críticas incluyen: Vs (pérdida limpia), Vs0 (pérdida en aterrizaje), Vx (mejor ángulo de ascenso), Vy (mejor tasa de ascenso), Va (velocidad de maniobra), Vfe (máxima con flaps), Vno (máxima estructural normal) y Vne (nunca exceder). Memorizar las V-speeds específicas de tu avión es examinable y evita dañar la estructura.",
        "El componente de viento cruzado es la parte del viento perpendicular a la pista; cuanto más cerca de 90° esté el ángulo del viento, mayor el componente. Cada avión tiene un Viento Cruzado Máximo Demostrado — no es un límite legal absoluto, pero volar por encima está fuera de lo documentado por el fabricante.",
        "Las dos técnicas para manejar viento cruzado son el Crab (apuntar la nariz contra el viento, alineando justo antes del touchdown) y el Sideslip (bajar el ala hacia el viento con alerón mientras se usa el timón opuesto para mantener la nariz alineada durante todo el aterrizaje).",
      ],
    },
  ],
  operacion: [
    {
      titulo: "Inspección, arranque, taxi, run-up y despegue",
      contenido: [
        "La inspección pre-vuelo (walk-around) debe hacerse siempre de forma sistemática, siguiendo el mismo patrón cada vez. Se revisan superficies de control, niveles de fluidos, llantas, estructura general, luces, antenas y drenado de agua del sistema de combustible. Nunca debe saltarse por 'ya la volé ayer'.",
        "Una checklist no reemplaza el conocimiento del avión, verifica que se aplicó correctamente. La técnica recomendada es 'flujo + verificación': ejecutar la secuencia de memoria y luego leer la checklist para confirmar. Existen checklists Normales, Anormales y de Emergencia.",
        "El arranque del motor incluye verificar mezcla y potencia, cebado si aplica, y la llamada de seguridad 'DESPEJADO' antes de girar la llave. Una vez arrancado, si la presión de aceite no sube en los primeros segundos, el motor debe apagarse de inmediato.",
        "Durante el rodaje se controla la dirección con los pedales de timón, usando potencia mínima necesaria. El run-up se hace en un punto designado, verificando cada magneto individualmente y los instrumentos del motor antes de la carrera de despegue, donde se mantiene dirección con los pedales hasta alcanzar la velocidad de rotación (Vr).",
      ],
    },
    {
      titulo: "Ascenso, crucero, descenso, aproximación y aterrizaje",
      contenido: [
        "Durante el ascenso se elige entre Vx (mejor ángulo, para despejar obstáculos) o Vy (mejor tasa, para ganar altitud más rápido). Se monitorean las temperaturas del motor con más atención que en crucero, ya que hay menos flujo de aire de enfriamiento.",
        "En crucero se reduce potencia gradualmente y se ajusta la mezcla (leaning) para optimizar consumo y rendimiento a esa altitud. Es también el momento de menor carga de trabajo para confirmar posición y hacer reportes.",
        "Una regla práctica para el descenso: multiplicar la altitud a perder (en miles de pies) por 3 para saber cuántas millas antes iniciar el descenso a una tasa razonable (~500 fpm). En la aproximación se configura progresivamente el avión buscando una aproximación estabilizada — mantenida en velocidad, tasa de descenso y alineación correctas antes de cruzar el umbral.",
        "Una aproximación inestable es la señal más clara para ejecutar un go-around sin dudar. El aterrizaje culmina con el flare, reduciendo la tasa de descenso justo antes de tocar tierra. Después de aterrizar, una vez fuera de la pista activa, se ejecuta la checklist correspondiente y se completa la inspección post-vuelo.",
      ],
    },
  ],
  "espacios-aereos": [
    {
      titulo: "Espacio aéreo controlado: Clases A a E",
      contenido: [
        "El espacio Clase A abarca desde FL180 hasta FL600 y es exclusivamente para operaciones IFR — no se permite vuelo VFR bajo ninguna circunstancia. Es, para un piloto VFR, un techo absoluto.",
        "La Clase B rodea los aeropuertos de mayor tráfico, con forma de 'pastel de bodas invertido'. Requiere autorización EXPLÍCITA de control antes de entrar — un simple contacto por radio no es suficiente. Requiere transponder Modo C y radio bidireccional operativo.",
        "La Clase C rodea aeropuertos de tráfico moderado-alto. A diferencia de la Clase B, aquí NO se necesita autorización explícita: basta con establecer contacto bidireccional con control antes de entrar.",
        "La Clase D rodea aeropuertos con torre activa pero menor tráfico, generalmente hasta 4 millas náuticas y 2,500 pies sobre el nivel del aeropuerto. Fuera del horario de la torre, típicamente revierte a Clase E o G.",
        "La Clase E es espacio controlado que no encaja en A-D, y puede comenzar en superficie, a 700 o a 1,200 pies AGL según la ubicación. No requiere contacto por radio obligatorio para VFR en la mayoría de los casos, pero sí mínimos de visibilidad más estrictos que en Clase G.",
      ],
    },
    {
      titulo: "Espacio aéreo Clase G y áreas especiales",
      contenido: [
        "La Clase G es espacio no controlado — no hay ATC gestionando el tráfico ni se requiere contacto por radio. Aunque no hay control activo, aplican mínimos de visibilidad y separación de nubes, y 've y evita' es la única regla de separación disponible.",
        "Las Áreas Restringidas (prefijo R-) contienen actividades potencialmente peligrosas, típicamente entrenamiento militar. Requieren autorización específica y solo están activas en horarios publicados, aunque siempre debe verificarse el NOTAM correspondiente.",
        "Las Áreas Prohibidas (prefijo P-) son zonas donde el vuelo está terminantemente prohibido, sin excepción para vuelo civil, generalmente rodeando instalaciones de seguridad nacional. A diferencia de las restringidas, la prohibición es permanente.",
        "Las Áreas de Peligro/Advertencia señalan actividad potencialmente peligrosa pero no son legalmente restrictivas: se puede volar a través de ellas bajo el propio riesgo del piloto.",
        "Al planear una ruta VFR, el espacio aéreo determina qué comunicaciones son necesarias, qué equipo debe llevar el avión y qué mínimos meteorológicos aplican en cada tramo. Ignorar estos requisitos, en Clase B específicamente, puede resultar en suspensión de licencia o una situación genuinamente peligrosa por falta de coordinación.",
      ],
    },
  ],
  reglamentacion: [
    {
      titulo: "Reglas VFR/IFR, licencias y horas de vuelo",
      contenido: [
        "El vuelo VFR exige que el piloto mantenga referencia visual constante con el horizonte y el terreno. Incluye reglas de prioridad de paso: un avión que se aproxima de frente cede ambos a la derecha, quien va más lento tiene prioridad sobre quien alcanza por detrás, y las aeronaves menos maniobrables tienen prioridad sobre las motorizadas.",
        "El vuelo IFR permite operar sin referencia visual externa, siguiendo instrucciones continuas de ATC. Requiere presentar y recibir autorización de un plan de vuelo antes de salir, equipo específico a bordo, y seguir exactamente la ruta y altitud autorizadas.",
        "La progresión típica de licencias es: Alumno Piloto, Piloto Privado (PPL, sin remuneración, con pasajeros, VFR), Piloto Comercial (CPL, con remuneración) y Piloto de Transporte de Línea Aérea (ATP). Se suman calificaciones adicionales como Instrumentos, Multimotor e Instructor de Vuelo. En México la autoridad emisora es la AFAC, bajo el RAC 61.",
        "Como orden de magnitud ampliamente enseñado internacionalmente, un PPL requiere alrededor de 40 horas totales de vuelo, y un CPL generalmente entre 150 y 250 horas, dependiendo del país y la vía de entrenamiento. Siempre debe confirmarse la cifra exacta vigente en la normativa de tu autoridad.",
      ],
    },
    {
      titulo: "Requisitos, mínimos meteorológicos y combustible de reserva",
      contenido: [
        "Obtener una licencia requiere un Certificado Médico Aeronáutico vigente, cumplir la edad mínima establecida, aprobar un examen de conocimientos teóricos y aprobar un examen práctico de vuelo (checkride). Para operaciones internacionales también se exige demostrar competencia en inglés según la escala OACI.",
        "Cada clase de espacio aéreo tiene mínimos específicos de visibilidad y separación de nubes para volar VFR legalmente; el espacio controlado exige mínimos más estrictos que el no controlado. Para IFR, cada aeropuerto tiene mínimos meteorológicos publicados en sus cartas de aproximación.",
        "La regulación exige llevar combustible con una reserva adicional obligatoria. Como referencia ampliamente usada: para VFR diurno se exige comúnmente una reserva mínima de 30 minutos más allá del destino planeado; para VFR nocturno o IFR, la reserva mínima común aumenta a 45 minutos. Estos mínimos son de cumplimiento obligatorio, nunca opcional.",
      ],
    },
  ],
  ifr: [
    {
      titulo: "Plan de vuelo IFR: SID, aerovías y STAR",
      contenido: [
        "IFR es el conjunto de reglas que permite volar navegando exclusivamente por instrumentos. A diferencia de VFR, bajo IFR se está en contacto y bajo control continuo de ATC durante todo el vuelo, con separación garantizada respecto a otro tráfico IFR por el propio sistema de control.",
        "Un plan de vuelo IFR incluye tipo de aeronave y equipo, ruta específica, altitud de crucero solicitada, combustible y alterno. La autorización (clearance) sigue el formato mnemotécnico CRAFT: Clearance limit, Route, Altitude, Frequency y Transponder. Debe leerse de vuelta completa antes de proceder.",
        "Una SID (Standard Instrument Departure) conecta el aeropuerto de salida con la estructura de aerovías, garantizando separación de obstáculos durante el ascenso inicial. Las aerovías son corredores publicados que conectan fixes, divididos en Aerovías Victor (baja altitud, hasta FL180) y Rutas Jet (alta altitud).",
        "Una STAR (Standard Terminal Arrival Route) es el procedimiento inverso a la SID: conecta la ruta con el área terminal de destino, organizando el descenso y la entrada al espacio aéreo denso, generalmente conectando con el segmento inicial de una aproximación instrumental.",
      ],
    },
    {
      titulo: "Aproximaciones: ILS, RNAV, VOR y holding",
      contenido: [
        "El ILS (Instrument Landing System) es una aproximación de precisión con guía lateral (Localizer) y vertical (Glideslope). El punto crítico se llama DA (Decision Altitude): al llegar ahí, debe haber referencia visual suficiente para aterrizar o ejecutar de inmediato la aproximación frustrada.",
        "RNAV usa GPS/GNSS para volar directamente entre waypoints. Las aproximaciones RNAV tienen distintos niveles: LNAV (guía lateral), LNAV/VNAV (lateral y vertical calculada) y LPV (la más precisa, con mínimos comparables a un ILS CAT I en muchos casos).",
        "Una aproximación VOR es de no precisión, usando un radial como guía lateral únicamente. En vez de una DA usa una MDA (Minimum Descent Altitude), una altitud mínima que puede mantenerse nivelada hasta el punto de aproximación frustrada si no se adquiere la pista visualmente.",
        "Un holding es un patrón de vuelo hipódromo usado para retrasar la llegada de forma ordenada, definido por un fix, un rumbo de entrada y un lado de vueltas. Existen tres tipos de entrada: Directa, Paralela y en Teardrop, según la dirección de llegada al fix.",
      ],
    },
  ],
};

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
  return { practica: all.slice(0, 5), evaluacion: all.slice(5, 15) };
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
