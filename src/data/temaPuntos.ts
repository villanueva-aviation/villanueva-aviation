/**
 * Versión escaneable de cada lección: una idea clave y tres a cinco puntos.
 *
 * El párrafo completo sigue viviendo en `texto` (moduleContent.ts) y se puede
 * desplegar desde la lección. Esto NO lo sustituye: lo antepone, porque un
 * párrafo de cien palabras justificado es un muro y la mayoría de los cadetes
 * lo saltan. Un tema sin entrada aquí se muestra como siempre.
 *
 * Al escribir puntos: fieles al texto, sin dato nuevo que no esté ahí.
 * El `titulo` es una etiqueta de dos a cuatro palabras; el `texto`, una frase.
 */

export interface TemaPunto {
  titulo: string;
  texto: string;
}

export interface TemaDestacado {
  /** Lo que debe quedarse aunque olviden todo lo demás. Una frase. */
  clave: string;
  puntos: TemaPunto[];
}

export const TEMA_PUNTOS: Record<string, TemaDestacado> = {
  // ---------- Fundamentos ----------
  "fundamentos-tema1": {
    clave: "Un avión no flota: genera activamente la fuerza que lo sostiene.",
    puntos: [
      { titulo: "Más pesado que el aire", texto: "se sostiene por las fuerzas aerodinámicas que produce su propio movimiento." },
      { titulo: "No es un globo", texto: "un dirigible flota; un avión tiene que fabricar su sustentación todo el tiempo." },
      { titulo: "El ala hace la fuerza", texto: "la sustentación nace del aire moviéndose sobre el perfil del ala." },
      { titulo: "El motor da el movimiento", texto: "sin velocidad no hay sustentación: por eso las dos cosas van juntas." },
    ],
  },
  "fundamentos-tema4": {
    clave: "Cinco grupos, y cada uno cumple una función en el equilibrio del vuelo.",
    puntos: [
      { titulo: "Fuselaje", texto: "la estructura central; aloja cabina, pasajeros y carga." },
      { titulo: "Alas", texto: "generan la sustentación y suelen alojar el combustible." },
      { titulo: "Empenaje (cola)", texto: "estabilizador horizontal y vertical: estabilidad de cabeceo y de dirección." },
      { titulo: "Tren de aterrizaje", texto: "soporta el peso en tierra y absorbe el impacto del aterrizaje." },
      { titulo: "Grupo motopropulsor", texto: "motor y hélice o turbina: es lo que genera el empuje." },
      { titulo: "Por qué los nombres", texto: "es el idioma con el que hablas con instructores, mecánicos y controladores." },
    ],
  },
  "fundamentos-tema2": {
    clave: "En vuelo recto y nivelado a velocidad constante, las cuatro se cancelan.",
    puntos: [
      { titulo: "Sustentación", texto: "la generan las alas y se opone al peso." },
      { titulo: "Peso", texto: "la gravedad actuando sobre la masa total de la aeronave." },
      { titulo: "Empuje", texto: "lo produce el motor y se opone a la resistencia." },
      { titulo: "Resistencia", texto: "la fricción del aire contra la aeronave." },
      { titulo: "El equilibrio se rompe a propósito", texto: "cambiar actitud, potencia o configuración produce una reacción: subir, bajar, acelerar o frenar." },
    ],
  },
  "fundamentos-tema3": {
    clave: "Bernoulli y Newton no compiten: describen la misma sustentación desde dos ángulos.",
    puntos: [
      { titulo: "Bernoulli", texto: "a mayor velocidad, menor presión: el aire va más rápido arriba del ala y la diferencia la empuja hacia arriba." },
      { titulo: "Newton", texto: "el ala desvía aire hacia abajo y, como reacción, el aire empuja el ala hacia arriba." },
      { titulo: "Se complementan", texto: "uno lo mira desde la presión, el otro desde el momentum del aire desviado." },
      { titulo: "Lo que tú controlas", texto: "ángulo de ataque y velocidad. No necesitas resolver ecuaciones para volar." },
    ],
  },
  "fundamentos-tema5": {
    clave: "Cada superficie mueve el avión alrededor de un eje distinto.",
    puntos: [
      { titulo: "Alerones", texto: "en el borde de salida de las alas; controlan el alabeo moviéndose en direcciones opuestas." },
      { titulo: "Elevador", texto: "en el estabilizador horizontal; controla el cabeceo subiendo o bajando el morro." },
      { titulo: "Timón de dirección", texto: "en el estabilizador vertical; controla la guiñada." },
      { titulo: "Flaps y secundarias", texto: "aumentan sustentación y resistencia para despegar y aterrizar más lento; algunos aviones suman spoilers o trim tabs." },
      { titulo: "La relación que se evalúa", texto: "superficie, eje y control: es de lo primero que un instructor comprueba que domines." },
    ],
  },
  "fundamentos-tema6": {
    clave: "Tres ejes que se cruzan en el centro de gravedad, y tres movimientos.",
    puntos: [
      { titulo: "Longitudinal (nariz-cola)", texto: "controla el alabeo, con los alerones." },
      { titulo: "Lateral (ala-ala)", texto: "controla el cabeceo, con el elevador." },
      { titulo: "Vertical", texto: "controla la guiñada, con el timón de dirección." },
      { titulo: "Son la base de todo", texto: "desde un viraje coordinado hasta una aproximación final." },
    ],
  },
  "fundamentos-tema7": {
    clave: "Esto es lo que tocas con las manos y con los pies, y qué mueve cada cosa.",
    puntos: [
      { titulo: "Yoke o stick", texto: "adelante y atrás mueve el elevador; al girarlo, los alerones." },
      { titulo: "Pedales", texto: "el timón de dirección en vuelo; en tierra, frenado diferencial y rueda de nariz." },
      { titulo: "Potencia (throttle)", texto: "regula combustible y aire hacia el motor, y con eso el empuje disponible." },
      { titulo: "Mezcla (mixture)", texto: "ajusta la proporción de combustible y aire según la altitud, para no perder potencia ni dañar el motor." },
      { titulo: "Se mueven en conjunto", texto: "en hélice de paso variable, throttle, propeller y mezcla se ajustan juntos según la fase de vuelo." },
    ],
  },
  "fundamentos-tema8": {
    clave: "Seis instrumentos que, leídos en conjunto, te dan el estado completo del avión.",
    puntos: [
      { titulo: "Fila superior", texto: "velocidad, horizonte artificial y altímetro." },
      { titulo: "Fila inferior", texto: "viraje y resbalamiento, rumbo y variómetro." },
      { titulo: "El scan", texto: "ninguno se lee solo: la imagen sale de recorrerlos juntos." },
      { titulo: "Para qué sirve", texto: "te dan el estado del avión incluso sin referencia visual externa." },
    ],
  },

  // ---------- Meteorología ----------
  "meteorologia-tema1": {
    clave: "El METAR describe lo que hay ahora mismo, no lo que se espera.",
    puntos: [
      { titulo: "Es una observación", texto: "condiciones actuales medidas en el aeródromo, no un pronóstico." },
      { titulo: "Cada hora", texto: "y cada 30 minutos en algunos casos especiales." },
      { titulo: "Idioma universal", texto: "el mismo código estandarizado en cualquier país, sin importar el idioma local." },
      { titulo: "Qué trae", texto: "viento, visibilidad, fenómenos, nubes, temperatura, punto de rocío y presión." },
      { titulo: "Cuándo lo usas", texto: "es la primera fuente que consultas antes de cualquier vuelo." },
    ],
  },
  "meteorologia-tema2": {
    clave: "METAR MMMX 171800Z 09008KT 8SM FEW030 SCT100 22/12 A3005, bloque por bloque.",
    puntos: [
      { titulo: "MMMX", texto: "identificador ICAO del aeropuerto: Ciudad de México." },
      { titulo: "171800Z", texto: "día 17 del mes, 18:00 UTC (Zulu). Nunca hora local." },
      { titulo: "09008KT", texto: "viento del rumbo 090 grados a 8 nudos: tres dígitos de rumbo, dos de velocidad." },
      { titulo: "8SM y las nubes", texto: "visibilidad de 8 millas; FEW030 a 3,000 pies y SCT100 a 10,000 pies." },
      { titulo: "22/12 y A3005", texto: "temperatura 22 °C y rocío 12 °C; presión 30.05 inHg." },
      { titulo: "Cómo se aprende", texto: "descomponiendo METAR reales en estos mismos bloques hasta que salga automático." },
    ],
  },
  "meteorologia-tema3": {
    clave: "El TAF dice lo que se espera en las próximas horas, no lo que hay.",
    puntos: [
      { titulo: "Es un pronóstico", texto: "del tiempo esperado en un aeropuerto." },
      { titulo: "Vigencia", texto: "típicamente 24 o 30 horas, y se actualiza cada 6." },
      { titulo: "Qué anticipa", texto: "viento, visibilidad, nubes y fenómenos previstos." },
      { titulo: "Grupos de cambio", texto: "BECMG para un cambio gradual y TEMPO para uno temporal." },
      { titulo: "Para qué sirve", texto: "te dice si tu destino y tu alterno estarán VFR o IFR a tu hora estimada de llegada." },
    ],
  },
  "meteorologia-tema4": {
    clave: "Mismo código, distinto tiempo verbal: el METAR es el presente, el TAF el futuro.",
    puntos: [
      { titulo: "METAR", texto: "una fotografía: observación válida para esa hora específica." },
      { titulo: "TAF", texto: "una predicción válida por 24 a 30 horas." },
      { titulo: "Qué decides con cada uno", texto: "con el METAR, si puedes despegar ahora; con el TAF, si tiene sentido planear el vuelo." },
      { titulo: "El alterno sale del TAF", texto: "es lo que te dice si vas a necesitar uno." },
      { titulo: "La buena noticia", texto: "si ya sabes leer un METAR, el TAF es el mismo ejercicio con períodos y tendencias." },
    ],
  },
  "meteorologia-tema5": {
    clave: "La altura de la base de nubes es lo que decide si tu vuelo es VFR o IFR.",
    puntos: [
      { titulo: "SKC o CLR", texto: "cielo despejado." },
      { titulo: "FEW y SCT", texto: "pocas, 1 a 2 octavos; dispersas, 3 a 4 octavos." },
      { titulo: "BKN y OVC", texto: "fragmentadas, 5 a 7 octavos; cubierto, 8 octavos." },
      { titulo: "Los tipos que importan", texto: "cúmulos de buen tiempo, estratos con visibilidad reducida, cirros que anuncian cambio." },
      { titulo: "CB, el que se evita", texto: "cumulonimbo: tormenta eléctrica, turbulencia severa y granizo." },
      { titulo: "Cómo se lee la altura", texto: "BKN008 es fragmentado a 800 pies." },
    ],
  },
  "meteorologia-tema6": {
    clave: "El frente frío es violento y corto; el cálido, suave y largo.",
    puntos: [
      { titulo: "Qué es un frente", texto: "la frontera entre dos masas de aire con temperaturas distintas." },
      { titulo: "Frente frío", texto: "el aire frío empuja al cálido hacia arriba de golpe: cumulonimbos, tormentas y turbulencia, y detrás cielo despejado." },
      { titulo: "Frente cálido", texto: "el aire cálido sube gradualmente: nubosidad extensa, lluvia ligera y techos bajos durante horas." },
      { titulo: "En la carta", texto: "triángulos azules el frío, semicírculos rojos el cálido, apuntando hacia donde va el frente." },
    ],
  },
  "meteorologia-tema7": {
    clave: "Cuatro orígenes distintos, y cada uno se evita de una manera distinta.",
    puntos: [
      { titulo: "Mecánica", texto: "el aire chocando con montañas o edificios." },
      { titulo: "Térmica", texto: "corrientes ascendentes por calentamiento desigual del suelo; típica de tardes calurosas." },
      { titulo: "Aire claro (CAT)", texto: "asociada a corrientes de chorro en altura, sin nubes que la anuncien." },
      { titulo: "De estela", texto: "los vórtices de las puntas de ala de un avión grande." },
      { titulo: "Por intensidad", texto: "ligera, moderada, severa y extrema." },
      { titulo: "La mejor fuente", texto: "los reportes PIREP de otros pilotos en tu ruta." },
    ],
  },
  "meteorologia-tema8": {
    clave: "Duele cerca del suelo, en despegue y aterrizaje, y ocurre en segundos.",
    puntos: [
      { titulo: "Qué es", texto: "un cambio brusco de dirección o velocidad del viento en poca distancia." },
      { titulo: "Dónde es peligroso", texto: "cerca del suelo: es el Low-Level Wind Shear, LLWS." },
      { titulo: "Microburst", texto: "corriente descendente violenta de tormenta: primero te sube y enseguida te hunde, con pérdida repentina de sustentación." },
      { titulo: "LLWAS", texto: "sistema de detección en aeropuertos grandes que alerta a los controladores." },
      { titulo: "Tu defensa", texto: "no operar cerca de tormentas activas y escuchar los reportes del ATIS y de otros pilotos." },
    ],
  },
  "meteorologia-tema9": {
    clave: "El de carburador es el que sorprende: ocurre con temperatura exterior positiva.",
    puntos: [
      { titulo: "De dónde sale", texto: "agua líquida a temperatura bajo cero que se congela al tocar el avión." },
      { titulo: "Hielo estructural", texto: "se acumula en alas y empenaje: cambia el perfil, suma peso y resistencia, y quita sustentación." },
      { titulo: "Hielo de carburador", texto: "dentro del sistema de admisión, por el enfriamiento al expandirse el combustible vaporizado." },
      { titulo: "Condiciones favorables", texto: "nubes entre 0 y −20 °C con gotas de agua líquida presentes." },
      { titulo: "Qué revisas antes", texto: "el pronóstico de nivel de congelamiento (freezing level)." },
    ],
  },
  "meteorologia-tema10": {
    clave: "Es la altitud que el avión siente, no la que dice el altímetro.",
    puntos: [
      { titulo: "Qué la sube", texto: "más calor, menos presión o más humedad: el aire se vuelve menos denso." },
      { titulo: "Qué te quita", texto: "rendimiento del motor, sustentación del ala y eficiencia de la hélice." },
      { titulo: "Toluca (MMTO)", texto: "8,466 pies de elevación real, uno de los aeropuertos comerciales más altos del mundo." },
      { titulo: "En un día caluroso", texto: "su altitud de densidad puede superar los 11,000 o 12,000 pies." },
      { titulo: "Lo que eso significa", texto: "carreras de despegue mucho más largas, menos ascenso y menor margen de seguridad." },
      { titulo: "La regla", texto: "ahí se calcula antes de cada despegue; no se asume que la pista se comporta como una a nivel del mar." },
    ],
  },

  // ---------- Aerodinámica ----------
  "aerodinamica-tema1": {
    clave: "La sustentación no es un valor fijo: la ajustas en tiempo real.",
    puntos: [
      { titulo: "Ángulo de ataque", texto: "a mayor ángulo, más sustentación, hasta llegar al punto crítico." },
      { titulo: "Velocidad", texto: "crece con el cuadrado: al doble de rápido, cuatro veces más sustentación con el mismo ángulo." },
      { titulo: "Densidad del aire", texto: "menos densidad por altitud o calor significa menos sustentación con los mismos parámetros." },
      { titulo: "Área y forma del ala", texto: "el perfil aerodinámico y la superficie alar, que vienen dados por el avión." },
      { titulo: "Tus dos palancas", texto: "ángulo de ataque con el yoke, y velocidad con potencia y actitud." },
    ],
  },
  "aerodinamica-tema2": {
    clave: "La pérdida es un problema de ángulo de ataque, no de velocidad baja.",
    puntos: [
      { titulo: "Qué es el ángulo de ataque", texto: "el ángulo entre la cuerda del ala y el viento relativo, no la actitud respecto al horizonte." },
      { titulo: "El ángulo crítico", texto: "típicamente entre 16 y 20 grados: ahí el flujo se separa y la sustentación colapsa." },
      { titulo: "Siempre el mismo ángulo", texto: "sin importar velocidad, actitud ni peso del avión." },
      { titulo: "Lo que sorprende", texto: "se puede entrar en pérdida con el morro abajo y a alta velocidad, en un tirón brusco." },
    ],
  },
  "aerodinamica-tema3": {
    clave: "Dos resistencias con comportamiento opuesto, y una curva en U entre las dos.",
    puntos: [
      { titulo: "Inducida", texto: "subproducto de generar sustentación; mayor a baja velocidad y ángulos de ataque altos." },
      { titulo: "Por qué se siente pesado", texto: "cerca de la pérdida la inducida domina y el avión cuesta de controlar." },
      { titulo: "Parásita", texto: "la fricción del aire contra fuselaje, tren y antenas; crece con el cuadrado de la velocidad." },
      { titulo: "La curva en U", texto: "la suma de ambas tiene un mínimo: la velocidad de L/D máximo." },
      { titulo: "Para qué la usas", texto: "es la del mejor planeo si se te para el motor." },
    ],
  },
  "aerodinamica-tema4": {
    clave: "Al inclinarte, el ala trabaja más y la velocidad de pérdida sube con ella.",
    puntos: [
      { titulo: "Qué es el factor de carga", texto: "la relación entre la sustentación generada y el peso del avión, medida en G." },
      { titulo: "Recto y nivelado", texto: "1G: la sustentación iguala al peso." },
      { titulo: "En viraje", texto: "parte de la sustentación se va en girar, así que el ala debe generar más para mantener la altitud." },
      { titulo: "A 60 grados", texto: "el factor de carga es 2G." },
      { titulo: "La consecuencia", texto: "sube la velocidad de pérdida; por eso un viraje brusco y lento en el patrón es de lo más peligroso." },
    ],
  },
  "aerodinamica-tema5": {
    clave: "El morro tiende a irse al lado contrario del viraje, y el pedal lo corrige.",
    puntos: [
      { titulo: "Cómo trabajan los alerones", texto: "uno sube y el otro baja, y esa diferencia de sustentación produce el alabeo." },
      { titulo: "De dónde sale la guiñada adversa", texto: "el ala del alerón bajado genera más resistencia inducida que la otra." },
      { titulo: "Qué se siente", texto: "el morro se mueve momentáneamente hacia el lado contrario al viraje que inicias." },
      { titulo: "La corrección", texto: "pedal de timón en la misma dirección del viraje, al iniciar el alabeo." },
      { titulo: "Cómo lo compruebas", texto: "la bola del coordinador de viraje se mantiene centrada." },
    ],
  },
  "aerodinamica-tema6": {
    clave: "El elevador vuela el avión; el trim solo te quita la presión de encima.",
    puntos: [
      { titulo: "Qué hace el elevador", texto: "cambia el ángulo de ataque: al tirar del yoke sube, empuja la cola hacia abajo y el morro sube." },
      { titulo: "Qué es el trim", texto: "una superficie secundaria y más pequeña, parte del elevador." },
      { titulo: "Para qué sirve", texto: "fija el punto de equilibrio para mantener una actitud sin sostener presión en el yoke." },
      { titulo: "No es control primario", texto: "es un ajuste que reduce la fatiga en vuelos largos o en cambios sostenidos de velocidad." },
    ],
  },
  "aerodinamica-tema7": {
    clave: "Los flaps te dejan volar más lento sin entrar en pérdida.",
    puntos: [
      { titulo: "Qué son", texto: "superficies del borde de salida que aumentan la curvatura, y a veces el área, del perfil alar." },
      { titulo: "Flap simple", texto: "el más básico: solo pivota hacia abajo." },
      { titulo: "Flap ranurado", texto: "una ranura dirige aire de alta energía sobre la superficie superior; más eficiente." },
      { titulo: "Flap Fowler", texto: "además de bajar se desliza hacia atrás, aumentando el área alar." },
      { titulo: "El efecto común", texto: "más sustentación y más resistencia a la misma velocidad." },
      { titulo: "Por eso", texto: "parcial en despegue, donde priorizas sustentación; completo en aterrizaje, donde también quieres la resistencia." },
    ],
  },
  "aerodinamica-tema8": {
    clave: "Cerca del suelo el avión flota, y eso explica el bote y el despegue que no asciende.",
    puntos: [
      { titulo: "Cuándo ocurre", texto: "a una altura menor que la envergadura del ala." },
      { titulo: "Qué pasa", texto: "el suelo interfiere con los vórtices de punta de ala y reduce la resistencia inducida." },
      { titulo: "Qué se siente", texto: "el avión flota y se resiste a tocar, o acelera de más justo después de despegar." },
      { titulo: "El bote largo", texto: "reducir potencia demasiado tarde en el aterrizaje produce ese float." },
      { titulo: "El riesgo al despegar", texto: "puede parecer exitoso a baja altura y no seguir ascendiendo al salir del efecto suelo sin velocidad suficiente." },
    ],
  },

  // ---------- Cartografía ----------
  "cartografia-tema1": {
    clave: "Cada carta existe para un propósito distinto; usa la que corresponde al vuelo.",
    puntos: [
      { titulo: "Carta VFR (Sectional)", texto: "la más usada para vuelo visual, a escala 1:500,000, con terreno, obstáculos, espacio aéreo y aeródromos." },
      { titulo: "Carta de Área Terminal (TAC)", texto: "más detalle aún, para el espacio denso alrededor de grandes ciudades." },
      { titulo: "Cartas de ruta IFR", texto: "de baja altitud bajo FL180 y de alta altitud arriba; priorizan aerovías, fixes y frecuencias sobre el terreno." },
      { titulo: "Cartas de aproximación", texto: "el procedimiento detallado para aterrizar en un aeropuerto específico bajo IFR." },
    ],
  },
  "cartografia-tema2": {
    clave: "La leyenda impresa en los márgenes es la fuente oficial de todo símbolo.",
    puntos: [
      { titulo: "Aeropuertos", texto: "círculo azul relleno si tiene torre de control; magenta si no está controlado." },
      { titulo: "Tipo de pista", texto: "relleno sólido para pista dura, contorno abierto para superficie blanda." },
      { titulo: "Obstáculos", texto: "un punto y una torre pequeña, acompañados de su altura." },
      { titulo: "Terreno", texto: "tonos más oscuros de café y naranja conforme sube la elevación." },
      { titulo: "Por dónde empezar", texto: "aprendiendo la leyenda de tu propia carta: ahí están todos los símbolos explicados." },
    ],
  },
  "cartografia-tema3": {
    clave: "Reconocer estos límites en la carta antes de volar es obligatorio, no opcional.",
    puntos: [
      { titulo: "Clase A", texto: "arriba de FL180, solo IFR." },
      { titulo: "Clase B", texto: "los aeropuertos más grandes; autorización explícita para entrar, círculos concéntricos sólidos azules." },
      { titulo: "Clase C", texto: "aeropuertos medianos; contacto por radio sin autorización explícita, círculos magenta sólidos." },
      { titulo: "Clase D", texto: "aeropuertos con torre, líneas discontinuas azules." },
      { titulo: "Clase E", texto: "espacio controlado general, líneas discontinuas magenta o sombreado." },
      { titulo: "Clase G", texto: "no controlado, sin marcado especial, a baja altura en zonas rurales." },
    ],
  },
  "cartografia-tema4": {
    clave: "Los dos números de un obstáculo dicen cosas distintas: MSL y AGL.",
    puntos: [
      { titulo: "Qué son", texto: "torres de radio, antenas, edificios altos y grúas permanentes." },
      { titulo: "Cómo se dibujan", texto: "un símbolo de torre y un punto en su base exacta." },
      { titulo: "Los dos números", texto: "la altura sobre el nivel del mar y, entre paréntesis, la altura sobre el terreno." },
      { titulo: "El ejemplo", texto: "1500 (450) es punta a 1,500 pies MSL, de los cuales 450 son la estructura sobre el terreno." },
      { titulo: "Los que resaltan", texto: "los de más de 1,000 pies AGL llevan símbolo más grande por su peso en la planificación." },
    ],
  },
  "cartografia-tema5": {
    clave: "El MEF de cada cuadrante es tu referencia rápida de altitud mínima segura.",
    puntos: [
      { titulo: "Cómo se ve el terreno", texto: "sombreado por capas de color, más oscuro cuanto más alto, y líneas de contorno en zonas montañosas." },
      { titulo: "Qué es el MEF", texto: "Maximum Elevation Figure: el número grande impreso en cada cuadrante de la carta." },
      { titulo: "Qué incluye", texto: "la elevación más alta redondeada hacia arriba, con el obstáculo más alto conocido y un margen de seguridad." },
      { titulo: "Para qué sirve", texto: "saber la altitud mínima de sobrevuelo sin revisar cada elevación una por una." },
    ],
  },
  "cartografia-tema6": {
    clave: "Antes de acercarte, ya debes saber qué frecuencia usar y en qué punto.",
    puntos: [
      { titulo: "Dónde están", texto: "impresas junto a cada aeropuerto y límite de espacio aéreo, en pequeñas cajas de texto." },
      { titulo: "Cuáles aparecen", texto: "CTAF en aeropuertos no controlados, Torre, Aproximación y Salida, y ATIS." },
      { titulo: "El color", texto: "azul o magenta según la clase de espacio aéreo asociado." },
      { titulo: "El punto de contacto", texto: "normalmente lo marca el límite dibujado del espacio aéreo correspondiente." },
    ],
  },
  "cartografia-tema7": {
    clave: "Un punto VFR reemplaza toda una descripción de dónde estás.",
    puntos: [
      { titulo: "Qué son", texto: "ubicaciones visuales reconocibles: cerros, cruces de carreteras, presas, poblados." },
      { titulo: "Cómo se marcan", texto: "con una estrella o triángulo magenta y un nombre corto." },
      { titulo: "Dónde se usan", texto: "cerca de aeropuertos con tráfico denso o espacio Clase B, C y D." },
      { titulo: "Cómo suena", texto: "reportas estar sobre el punto por su nombre y el controlador sabe exactamente dónde estás." },
      { titulo: "El hábito", texto: "memorizar los de tus aeropuertos frecuentes agiliza mucho la radio." },
    ],
  },
  "cartografia-tema8": {
    clave: "Traza la ruta en la carta antes del vuelo; en el aire solo confirmas.",
    puntos: [
      { titulo: "Primero la ruta", texto: "identifica el trazo general y qué espacios aéreos vas a cruzar." },
      { titulo: "Después la altitud", texto: "revisa el MEF de cada cuadrante que atravesarás." },
      { titulo: "Luego los riesgos", texto: "ubica los obstáculos relevantes en tu trayectoria." },
      { titulo: "Tus referencias", texto: "localiza los VOR y puntos VFR que usarás como checkpoints." },
      { titulo: "Las frecuencias", texto: "anota cuáles necesitarás contactar en cada etapa." },
      { titulo: "Por qué antes y no durante", texto: "interpretar la carta en tiempo real y bajo presión es donde se cometen los errores." },
    ],
  },

  // ---------- Peso y Rendimiento ----------
  "rendimiento-tema1": {
    clave: "La carga útil es lo que queda para personas, equipaje y combustible.",
    puntos: [
      { titulo: "Peso máximo de despegue", texto: "está certificado y no se excede bajo ninguna circunstancia." },
      { titulo: "Qué compromete excederlo", texto: "la estructura, el despegue, la tasa de ascenso y la velocidad de pérdida real." },
      { titulo: "Peso vacío", texto: "el avión y sus fluidos operativos: el punto de partida del cálculo." },
      { titulo: "Peso bruto", texto: "el vacío más tripulación, pasajeros, equipaje y combustible." },
      { titulo: "Carga útil", texto: "la diferencia entre el máximo certificado y el peso vacío." },
    ],
  },
  "rendimiento-tema2": {
    clave: "No basta con cuánto pesa: importa dónde va ese peso.",
    puntos: [
      { titulo: "Qué es el CG", texto: "el punto donde teóricamente se concentra todo el peso del avión." },
      { titulo: "El sobre de CG", texto: "debe caer dentro del rango certificado para que el avión sea controlable y estable." },
      { titulo: "Cómo se calcula", texto: "momento es peso por brazo; sumas los momentos y divides entre el peso total." },
      { titulo: "CG adelantado", texto: "más estable, pero pesado de controlar en cabeceo, sobre todo en el flare." },
      { titulo: "CG atrasado", texto: "más ágil, pero peligrosamente inestable y con riesgo de pérdida sin aviso claro." },
    ],
  },
  "rendimiento-tema3": {
    clave: "Cada combinación de peso, densidad y viento es distinta: se calcula, no se recuerda.",
    puntos: [
      { titulo: "Peso", texto: "a mayor peso, mayor distancia necesaria." },
      { titulo: "Altitud de densidad", texto: "cuanto más alta, menos rinden el motor y el ala, y más pista necesitas." },
      { titulo: "Viento", texto: "de frente acorta la distancia; de cola la alarga de forma significativa." },
      { titulo: "La pista", texto: "mojada, con pasto o con pendiente ascendente suma distancia." },
      { titulo: "El error clásico", texto: "asumir que siempre ha alcanzado; con obstáculos al final de la pista, ese cálculo se paga caro." },
    ],
  },
  "rendimiento-tema4": {
    clave: "Un viento de cola de solo 10 nudos puede alargar el aterrizaje entre 20 y 30 por ciento.",
    puntos: [
      { titulo: "Peso", texto: "más peso es más velocidad de aproximación, y eso es más distancia de frenado." },
      { titulo: "Altitud de densidad", texto: "afecta la velocidad real de toma, aunque la indicada sea la misma." },
      { titulo: "Viento", texto: "de frente acorta; de cola alarga drásticamente." },
      { titulo: "Superficie", texto: "mojada o con contaminantes reduce la efectividad del frenado." },
      { titulo: "Cuándo consultar el POH", texto: "en pista corta o con condiciones fuera de lo habitual, sin confiar solo en la experiencia." },
    ],
  },
  "rendimiento-tema5": {
    clave: "Saber interpolar y saber agregar margen: eso es leer una gráfica de rendimiento.",
    puntos: [
      { titulo: "Qué te dan", texto: "entras con peso, temperatura, altitud de presión y viento, y sales con distancias, ascenso, consumo o alcance." },
      { titulo: "Interpolar", texto: "cuando tus condiciones caen entre dos líneas, estimas el valor proporcional; no redondeas al más cercano." },
      { titulo: "El margen", texto: "comúnmente un 30 a 50 por ciento extra sobre la distancia calculada." },
      { titulo: "Por qué el margen", texto: "las gráficas se hicieron con aviones nuevos y pilotos de prueba en condiciones ideales." },
    ],
  },
  "rendimiento-tema6": {
    clave: "Con el concepto no basta: hay que memorizar las de TU avión.",
    puntos: [
      { titulo: "Vs y Vs0", texto: "pérdida en configuración limpia y en configuración de aterrizaje." },
      { titulo: "Vx y Vy", texto: "mejor ángulo de ascenso para librar obstáculos; mejor tasa para ganar altura en tiempo." },
      { titulo: "Va", texto: "velocidad de maniobra: la máxima para aplicar controles bruscos sin dañar la estructura." },
      { titulo: "Vfe, Vno y Vne", texto: "máxima con flaps extendidos, máxima estructural normal y la que nunca se excede." },
      { titulo: "Vr", texto: "rotación: la velocidad a la que levantas la nariz en el despegue." },
      { titulo: "Por qué importan", texto: "son materia de examen, y antes que eso son lo que evita dañar la estructura o entrar en pérdida a destiempo." },
    ],
  },
  "rendimiento-tema7": {
    clave: "El máximo demostrado no es un límite legal, pero salirte de él es salirte de lo probado.",
    puntos: [
      { titulo: "Qué es", texto: "la parte del viento que sopla perpendicular a la pista." },
      { titulo: "Cómo se calcula", texto: "por el ángulo entre el viento reportado y el rumbo de pista: cerca de 90 grados es máximo, cerca de 0 es mínimo." },
      { titulo: "Máximo demostrado", texto: "viene en el manual; es lo que el fabricante probó y documentó." },
      { titulo: "Técnica de crab", texto: "apuntas la nariz contra el viento en la aproximación y alineas justo antes de tocar." },
      { titulo: "Técnica de sideslip", texto: "bajas el ala hacia el viento con alerón y mantienes la nariz alineada con timón opuesto durante todo el aterrizaje." },
    ],
  },

  // ---------- Instrumentos de Vuelo ----------
  "instrumentos-tema1": {
    clave: "De alta a baja presión, cuidado abajo: el altímetro te miente a tu favor.",
    puntos: [
      { titulo: "Cómo mide", texto: "usa la presión estática exterior contra la referencia que ajustas en la ventana Kollsman, en inHg." },
      { titulo: "Indicada y verdadera", texto: "la que lees directo, y la altura real sobre el nivel del mar corregida por temperatura." },
      { titulo: "De presión y de densidad", texto: "contra la referencia estándar 29.92, y ajustada por temperatura y presión." },
      { titulo: "El error peligroso", texto: "si vuelas hacia baja presión sin reajustar, el altímetro marca más altura de la que tienes." },
    ],
  },
  "instrumentos-tema2": {
    clave: "Los arcos de color no son decoración: cada uno marca un rango de operación.",
    puntos: [
      { titulo: "Cómo mide", texto: "la diferencia entre la presión dinámica del tubo pitot y la presión estática." },
      { titulo: "Arco blanco y verde", texto: "rango de operación de flaps, y rango normal de operación." },
      { titulo: "Arco amarillo y línea roja", texto: "precaución, solo en aire calmo; y Vne, la que nunca se excede." },
      { titulo: "IAS, CAS y TAS", texto: "la indicada, la corregida por errores del instrumento y la verdadera, ajustada por densidad." },
      { titulo: "En altura", texto: "tu TAS real es mayor que la IAS que estás leyendo." },
    ],
  },
  "instrumentos-tema3": {
    clave: "En IMC es tu única referencia confiable de actitud.",
    puntos: [
      { titulo: "Qué muestra", texto: "inclinación y cabeceo respecto al horizonte real." },
      { titulo: "Cómo funciona", texto: "un giroscopio que mantiene su orientación en el espacio sin importar cómo se mueva el avión." },
      { titulo: "De qué se alimenta", texto: "de vacío por bomba, o eléctricamente en aviones más modernos." },
      { titulo: "Su punto débil", texto: "como todo giróscopo mecánico puede sufrir precesión, un error que se acumula poco a poco." },
      { titulo: "El hábito", texto: "contrastarlo periódicamente con otros instrumentos para confirmar que sigue siendo confiable." },
    ],
  },
  "instrumentos-tema4": {
    clave: "Muestra la tasa de giro, no el ángulo de inclinación.",
    puntos: [
      { titulo: "Qué mide", texto: "qué tan rápido estás virando, en grados por segundo." },
      { titulo: "Viraje estándar", texto: "3 grados por segundo: un giro completo de 360 en exactamente 2 minutos." },
      { titulo: "La bola", texto: "el inclinómetro te dice si el viraje está coordinado, centrada." },
      { titulo: "Derrape y resbale", texto: "bola hacia el exterior es skidding; hacia el interior, slipping." },
      { titulo: "Para qué sirve", texto: "te dice qué pedal pisar para corregir." },
    ],
  },
  "instrumentos-tema5": {
    clave: "Te da la información antes que el indicador de giro tradicional.",
    puntos: [
      { titulo: "Qué cambia", texto: "en vez de una aguja simple usa un avión miniatura inclinado." },
      { titulo: "Qué muestra", texto: "velocidad de alabeo y tasa de giro combinadas en un solo movimiento." },
      { titulo: "La bola sigue ahí", texto: "en la base, para verificar la coordinación igual que siempre." },
      { titulo: "Por qué se prefiere", texto: "responde más rápido al inicio del viraje, así que te avisa antes en la maniobra." },
    ],
  },
  "instrumentos-tema6": {
    clave: "Tiene entre 6 y 9 segundos de retraso: no es para maniobras rápidas.",
    puntos: [
      { titulo: "Qué muestra", texto: "la tasa de ascenso o descenso en pies por minuto." },
      { titulo: "Cómo lo mide", texto: "por el cambio de presión estática a través de una fuga calibrada." },
      { titulo: "El retraso", texto: "no da la tasa instantánea, sino una tendencia que llega tarde." },
      { titulo: "Qué usar en su lugar", texto: "para cabeceo rápido, el horizonte artificial es inmediato." },
      { titulo: "Donde sí brilla", texto: "manteniendo tasas constantes en tramos largos, como una aproximación estabilizada." },
    ],
  },
  "instrumentos-tema7": {
    clave: "Es el único que funciona sin electricidad ni vacío, y el que más miente en maniobra.",
    puntos: [
      { titulo: "Variación", texto: "la diferencia entre norte magnético y verdadero; cambia según dónde estés." },
      { titulo: "Desviación", texto: "la interferencia de los componentes eléctricos y metálicos del propio avión." },
      { titulo: "ANDS", texto: "en el hemisferio norte, al acelerar hacia el norte marca un giro que no existe; al desacelerar hacia el sur, lo contrario." },
      { titulo: "En virajes", texto: "oscila y se retrasa, así que no sirve como referencia durante la maniobra." },
      { titulo: "Cómo se usa bien", texto: "vuelas por el indicador de rumbo giroscópico y lo recalibras contra el compás en vuelo recto y nivelado." },
    ],
  },
  "instrumentos-tema8": {
    clave: "Junta el rumbo y la desviación de curso en una sola carátula.",
    puntos: [
      { titulo: "Qué combina", texto: "un giro direccional con la información de desviación de curso VOR o ILS." },
      { titulo: "Su ventaja", texto: "al ser giroscópico no sufre la oscilación ni el error ANDS del compás magnético." },
      { titulo: "Lo que sí necesita", texto: "sincronizarse cada tanto con el compás para corregir la precesión del giróscopo." },
      { titulo: "A quién reemplaza", texto: "al indicador de rumbo y al CDI tradicional, en cabinas más equipadas." },
    ],
  },
  "instrumentos-tema9": {
    clave: "Sus agujas dan rumbo magnético real a la estación, no un rumbo relativo a tu nariz.",
    puntos: [
      { titulo: "Qué combina", texto: "una carátula de compás giroscópico con una o dos agujas hacia estaciones ADF o VOR." },
      { titulo: "Por qué es distinto del ADF simple", texto: "la rosa gira con tu rumbo real, así que la aguja ya te da el rumbo magnético." },
      { titulo: "Su gran ventaja", texto: "orientación instantánea respecto a dos estaciones al mismo tiempo." },
      { titulo: "Para qué sirve eso", texto: "para fijaciones cruzadas sin cálculos mentales adicionales." },
    ],
  },
  "instrumentos-tema10": {
    clave: "Te da tres datos a la vez: distancia, velocidad de acercamiento y tiempo.",
    puntos: [
      { titulo: "Cómo mide", texto: "envía un pulso a la estación y cronometra la respuesta, usando la velocidad conocida de la señal." },
      { titulo: "Distancia", texto: "en millas náuticas hasta la estación." },
      { titulo: "Groundspeed", texto: "calculada por el cambio de distancia en el tiempo." },
      { titulo: "Tiempo estimado", texto: "a la estación, derivado de los dos anteriores." },
      { titulo: "Dónde vive", texto: "suele venir integrado con el receptor de NAV o VOR, porque comparten frecuencia de estación." },
    ],
  },
  "instrumentos-tema11": {
    clave: "Tres códigos de emergencia que nunca se usan fuera de su situación.",
    puntos: [
      { titulo: "Qué hace", texto: "responde automáticamente al radar de control y te identifica en la pantalla del controlador." },
      { titulo: "Modo C y Modo S", texto: "añaden tu altitud, y el S además transmite datos adicionales." },
      { titulo: "7500", texto: "secuestro o interferencia ilícita." },
      { titulo: "7600", texto: "falla de comunicaciones." },
      { titulo: "7700", texto: "emergencia general." },
      { titulo: "El botón IDENT", texto: "resalta tu posición un momento en la pantalla cuando te lo piden, útil entre tráfico denso." },
    ],
  },

  // ---------- VFR ----------
  "vfr-tema1": {
    clave: "No son capricho: son la distancia física que necesitas para ver y reaccionar.",
    puntos: [
      { titulo: "Qué definen", texto: "la visibilidad mínima y la distancia mínima a las nubes para volar por referencias visuales." },
      { titulo: "De dónde salen", texto: "del principio de ver y evitar, la base de todo el sistema VFR." },
      { titulo: "Quién es responsable", texto: "el piloto, no el ATC, de detectar y separarse de otro tráfico y de obstáculos." },
      { titulo: "Qué pasa sin ellos", texto: "sin visibilidad o pegado a las nubes no tienes tiempo de ver a otra aeronave y maniobrar." },
    ],
  },
  "vfr-tema2": {
    clave: "A más tránsito y más velocidad de cierre, más margen visual te exigen.",
    puntos: [
      { titulo: "De qué dependen", texto: "de la clase de espacio aéreo y de la altitud." },
      { titulo: "Cerca de un aeropuerto controlado", texto: "más tránsito y aeronaves más rápidas, así que los mínimos son más exigentes." },
      { titulo: "En no controlado y bajo", texto: "suele bastar con mantenerse despejado de nubes, con visibilidad reducida." },
      { titulo: "Para el examen", texto: "memorizar la tabla completa por clase de espacio aéreo es parte esencial de la preparación." },
    ],
  },
  "vfr-tema3": {
    clave: "De noche la referencia exterior es menos confiable, y los mínimos suben con eso.",
    puntos: [
      { titulo: "Por qué son más estrictos", texto: "la referencia visual del horizonte y del terreno se reduce drásticamente." },
      { titulo: "El riesgo", texto: "es mucho más fácil perder la orientación espacial o no detectar tráfico a tiempo." },
      { titulo: "Qué se vuelve crítico", texto: "identificar bien las luces de otras aeronaves y las del aeródromo." },
      { titulo: "El respaldo", texto: "un escaneo instrumental más frecuente, porque afuera ves menos." },
    ],
  },
  "vfr-tema4": {
    clave: "No es un derecho: se pide, y el controlador puede negarlo.",
    puntos: [
      { titulo: "Qué es", texto: "una autorización del ATC para operar en espacio controlado por debajo de los mínimos VFR normales." },
      { titulo: "Las condiciones", texto: "mantenerse despejado de nubes, con una visibilidad mínima, típicamente 1 milla estatutaria, y de día." },
      { titulo: "Cuándo lo niegan", texto: "si hay tránsito IFR que lo haga inseguro; se autoriza aeronave por aeronave." },
      { titulo: "Para qué sirve", texto: "casos límite, como entrar a un aeropuerto controlado justo cuando baja el techo." },
      { titulo: "La condición real", texto: "que el piloto ejerza un juicio conservador antes de siquiera solicitarlo." },
    ],
  },
  "vfr-tema5": {
    clave: "Entrar directo a base o a final es de las causas más comunes de conflicto.",
    puntos: [
      { titulo: "La entrada recomendada", texto: "a 45 grados hacia el viento en cola, a la altitud del patrón." },
      { titulo: "Qué te da", texto: "vista clara de todo el patrón antes de integrarte: quién va en cola, en base y en final." },
      { titulo: "Por qué es segura", texto: "es predecible: el resto del tráfico espera ver llegar aeronaves justo por ahí." },
      { titulo: "El riesgo de saltársela", texto: "nadie te está buscando donde apareces, y ahí vienen las sorpresas." },
    ],
  },
  "vfr-tema6": {
    clave: "El patrón es una secuencia de decisiones, no una figura geométrica que volar.",
    puntos: [
      { titulo: "Viento en cola", texto: "te da tiempo para el checklist de aterrizaje y para espaciarte del tráfico de adelante." },
      { titulo: "Viraje a base", texto: "marca el inicio del descenso y es tu última oportunidad de verificar la pista despejada." },
      { titulo: "Final", texto: "te alinea con la pista, con la configuración completa ya establecida." },
      { titulo: "Qué distingue a un buen piloto", texto: "gestionar la carga de trabajo en cada tramo, en vez de solo seguir las líneas del circuito." },
    ],
  },
  "vfr-tema7": {
    clave: "En la CTAF nadie autoriza nada: es información, no instrucción.",
    puntos: [
      { titulo: "Cómo se coordina", texto: "los pilotos se anuncian entre sí en una frecuencia común, sin que nadie autorice movimientos." },
      { titulo: "El formato", texto: "nombre del aeródromo, matrícula, posición en el patrón y pista." },
      { titulo: "Un ejemplo", texto: "Tráfico [aeródromo], XB-VLA, entrando viento en cola pista 20." },
      { titulo: "Dónde reportar", texto: "en entrada, viento en cola, base y final." },
      { titulo: "Para qué", texto: "para que el resto pueda autosepararse cuando no todos se ven entre sí." },
    ],
  },
  "vfr-tema8": {
    clave: "La prioridad no exime a nadie de ver y evitar.",
    puntos: [
      { titulo: "La regla general", texto: "la aeronave con menor altura o más cerca de aterrizar tiene preferencia." },
      { titulo: "El caso típico", texto: "quien ya está en final normalmente tiene prioridad sobre quien apenas entra al patrón." },
      { titulo: "Lo que la prioridad no hace", texto: "no te libera de detectar el conflicto y resolverlo." },
      { titulo: "Qué hacer si lo ves", texto: "comunicarlo por radio y ajustar tu propia trayectoria, por ejemplo extendiendo el viento en cola." },
      { titulo: "Lo que de verdad evita incidentes", texto: "la cortesía y la comunicación clara, más que cualquier regla escrita." },
    ],
  },
  "vfr-tema9": {
    clave: "Roja y verde de frente significa que viene directo hacia ti.",
    puntos: [
      { titulo: "Las de posición", texto: "roja en el ala izquierda, verde en la derecha y blanca en la cola, igual que los barcos." },
      { titulo: "Cómo se leen", texto: "ver las dos de frente es rumbo de colisión; ver solo una te dice de qué lado va su trayectoria." },
      { titulo: "La baliza (beacon)", texto: "roja rotativa, se enciende al arrancar el motor: nunca te acerques a una hélice con la baliza prendida." },
      { titulo: "Los estrobos", texto: "destellos blancos de alta intensidad, de día y de noche; conviene apagarlos dentro de nubes porque el reflejo desorienta." },
      { titulo: "Aterrizaje y rodaje", texto: "mejoran tu visibilidad ante otros y tu propia visión de la pista o plataforma." },
      { titulo: "Cuándo van encendidas", texto: "las de posición desde 30 minutos después del ocaso hasta 30 antes del orto; la anticolisión, siempre que el motor esté en marcha." },
    ],
  },

  // ---------- Reglamentación ----------
  "reglamentacion-tema1": {
    clave: "Quien tiene menos capacidad de esquivar, tiene el derecho de paso.",
    puntos: [
      { titulo: "La base", texto: "referencia visual constante con el horizonte y el terreno para navegar y evitar tráfico y obstáculos." },
      { titulo: "De frente", texto: "ambas aeronaves ceden a la derecha." },
      { titulo: "Alcance", texto: "quien va adelante tiene prioridad sobre quien lo alcanza por detrás." },
      { titulo: "Menos maniobrables, primero", texto: "globos, planeadores y dirigibles tienen prioridad sobre los motorizados." },
      { titulo: "Lo demás que exige", texto: "respetar los mínimos de cada clase de espacio y llevar a bordo la documentación del avión y del piloto." },
    ],
  },
  "reglamentacion-tema2": {
    clave: "Ruta y altitud exactas: cualquier desviación necesita una nueva autorización.",
    puntos: [
      { titulo: "Qué permite", texto: "operar sin referencia visual externa, navegando solo por instrumentos." },
      { titulo: "Bajo control continuo", texto: "siguiendo instrucciones de control de tránsito aéreo durante todo el vuelo." },
      { titulo: "Antes de salir", texto: "presentar el plan de vuelo y recibir su autorización." },
      { titulo: "El equipo", texto: "instrumentos de vuelo redundantes y navegación certificada." },
      { titulo: "Currency", texto: "un mínimo de aproximaciones y procedimientos practicados recientemente, según la normativa vigente de tu autoridad." },
    ],
  },
  "reglamentacion-tema3": {
    clave: "Alumno, Privado, Comercial y ATP; los ratings se suman, no reemplazan.",
    puntos: [
      { titulo: "Alumno Piloto", texto: "para entrenamiento con instructor." },
      { titulo: "Privado (PPL)", texto: "volar con pasajeros, sin remuneración, VFR." },
      { titulo: "Comercial (CPL)", texto: "volar por remuneración; en la práctica suele pedir también la calificación de instrumentos." },
      { titulo: "ATP", texto: "el nivel más alto, requerido para ser comandante en aerolínea." },
      { titulo: "Los ratings", texto: "instrumentos, multimotor e instructor de vuelo, sobre la licencia que ya tengas." },
      { titulo: "En México", texto: "emite la AFAC bajo el marco del RAC 61; consulta siempre la versión vigente." },
    ],
  },
  "reglamentacion-tema4": {
    clave: "Son órdenes de magnitud, no cifras para un trámite: confírmalas en el RAC 61 vigente.",
    puntos: [
      { titulo: "Varían por país", texto: "cada autoridad fija las suyas, siguiendo referencias OACI similares." },
      { titulo: "PPL, como referencia", texto: "alrededor de 40 horas totales, con mínimos específicos de instrucción dual y de solo." },
      { titulo: "CPL, como referencia", texto: "bastante más: del orden de 150 a 250 horas según el país y la vía de entrenamiento." },
      { titulo: "Dónde confirmarlas", texto: "en el RAC 61 vigente de la AFAC, porque la regulación se actualiza." },
    ],
  },
  "reglamentacion-tema5": {
    clave: "Las horas son solo una parte: faltan el médico, la edad y dos exámenes.",
    puntos: [
      { titulo: "Certificado médico", texto: "vigente y de la clase que corresponde a la licencia que buscas." },
      { titulo: "Edad mínima", texto: "como referencia común, 17 años para PPL y 18 para CPL; verifica el valor vigente." },
      { titulo: "Examen teórico", texto: "de conocimientos aeronáuticos." },
      { titulo: "Examen práctico", texto: "el checkride, con un examinador designado." },
      { titulo: "Inglés OACI", texto: "para operación internacional o radiocomunicación en inglés, con revalidación periódica." },
    ],
  },
  "reglamentacion-tema6": {
    clave: "Si el pronóstico no alcanza los mínimos publicados, la regulación te obliga a planear un alterno.",
    puntos: [
      { titulo: "Por clase de espacio", texto: "cada clase tiene sus mínimos de visibilidad y de separación de nubes." },
      { titulo: "Controlado, más estricto", texto: "más visibilidad y más separación que en el no controlado." },
      { titulo: "Y más arriba", texto: "los mínimos suelen ser aún más exigentes por encima de ciertas altitudes." },
      { titulo: "En IFR", texto: "cada destino y alterno tiene techo y visibilidad mínimos publicados en sus cartas de aproximación." },
      { titulo: "Dónde están los valores exactos", texto: "en la tabla oficial vigente de tu autoridad." },
    ],
  },
  "reglamentacion-tema7": {
    clave: "Es de cumplimiento obligatorio, nunca opcional.",
    puntos: [
      { titulo: "Qué es", texto: "combustible adicional al del vuelo planeado, por si surge desvío, espera o imprevisto." },
      { titulo: "VFR diurno, referencia", texto: "30 minutos de vuelo a crucero normal más allá del destino." },
      { titulo: "VFR nocturno o IFR", texto: "la reserva mínima común sube a 45 minutos." },
      { titulo: "Antes de aplicarlo", texto: "confirma el valor exacto vigente en la normativa de tu autoridad, porque puede variar." },
    ],
  },
};
