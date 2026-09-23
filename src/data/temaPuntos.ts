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

  // ---------- Operación de Aeronave ----------
  "operacion-tema1": {
    clave: "Siempre, con el mismo patrón, aunque hayas volado ese avión ayer.",
    puntos: [
      { titulo: "Por qué existe", texto: "es tu primera línea de defensa contra fallas mecánicas en el aire." },
      { titulo: "Mismo patrón cada vez", texto: "normalmente en sentido de las manecillas, para no saltarte ningún punto." },
      { titulo: "Qué revisas", texto: "superficies de control libres, aceite y combustible, llantas, estructura, luces y antenas." },
      { titulo: "El drenado", texto: "sacar el agua del sistema de combustible antes de que la encuentre el motor." },
      { titulo: "La excusa que no vale", texto: "ya la volé ayer: las condiciones cambian de un vuelo a otro, incluso de una hora a otra." },
    ],
  },
  "operacion-tema2": {
    clave: "La checklist no reemplaza tu conocimiento: verifica que lo aplicaste bien.",
    puntos: [
      { titulo: "Flujo y verificación", texto: "ejecutas la secuencia de memoria en un flujo lógico por la cabina y después lees la lista para confirmar." },
      { titulo: "Lo que no se hace", texto: "leer y ejecutar línea por línea desde cero." },
      { titulo: "Normales", texto: "para la operación de rutina." },
      { titulo: "Anormales", texto: "situaciones fuera de lo común que no son emergencia inmediata." },
      { titulo: "De emergencia", texto: "los primeros pasos críticos se memorizan; el resto se consulta." },
      { titulo: "Qué marca la diferencia", texto: "usarla en cada vuelo sin importar tu experiencia." },
    ],
  },
  "operacion-tema3": {
    clave: "Si la presión de aceite no sube en los primeros segundos, apagas de inmediato.",
    puntos: [
      { titulo: "La secuencia", texto: "sigue la del fabricante: mezcla y potencia en posición, cebado si el motor lo pide en frío, bomba de combustible si aplica." },
      { titulo: "DESPEJADO", texto: "en voz alta antes de girar la llave, para alertar a quien esté cerca de la hélice." },
      { titulo: "Lo primero que miras", texto: "la presión de aceite, apenas arranca." },
      { titulo: "Por qué tan rápido", texto: "operar sin lubricación adecuada daña el motor severamente en muy poco tiempo." },
    ],
  },
  "operacion-tema4": {
    clave: "El rodaje exige la misma atención que el vuelo mismo.",
    puntos: [
      { titulo: "La dirección", texto: "con los pedales de timón, que mueven la rueda de nariz en la mayoría de los entrenadores." },
      { titulo: "La potencia", texto: "la mínima necesaria para mantener movimiento, sin velocidades excesivas." },
      { titulo: "Prueba de frenos", texto: "un leve toque al iniciar el movimiento para confirmar respuesta antes de continuar." },
      { titulo: "Conciencia situacional", texto: "otro tráfico, vehículos de servicio e instrucciones de control si el aeropuerto es controlado." },
      { titulo: "Por qué importa tanto", texto: "es donde más incursiones de pista y colisiones en tierra ocurren por distracción." },
    ],
  },
  "operacion-tema5": {
    clave: "Aquí decides, en tierra, qué harás si el motor falla justo después de despegar.",
    puntos: [
      { titulo: "Dónde", texto: "en el punto designado cerca de la cabecera, contra el viento y con frenos firmes." },
      { titulo: "Magnetos", texto: "uno por uno: la caída de RPM debe estar en el rango del manual y ninguno debe apagar el motor." },
      { titulo: "Calentador de carburador", texto: "se prueba si el avión lo lleva." },
      { titulo: "Instrumentos del motor", texto: "temperaturas y presiones dentro de rango normal." },
      { titulo: "Antes de despegue", texto: "configuración final de flaps y trim, y el repaso mental de la falla en despegue." },
    ],
  },
  "operacion-tema6": {
    clave: "Si algo se ve mal en los primeros segundos, todavía tienes pista para abortar.",
    puntos: [
      { titulo: "Potencia y dirección", texto: "potencia completa suave pero sin demora, y pies activos para mantener la línea." },
      { titulo: "Los instrumentos", texto: "monitoreas los del motor en los primeros segundos para confirmar parámetros normales." },
      { titulo: "Vr", texto: "a la velocidad de rotación de tu avión, presión suave atrás para levantar la nariz." },
      { titulo: "La limpieza", texto: "retraer flaps a la altura y velocidad del POH, y el tren si el avión es retráctil." },
    ],
  },
  "operacion-tema7": {
    clave: "Vx es ángulo para librar obstáculos; Vy es tasa para ganar altura en tiempo.",
    puntos: [
      { titulo: "Vx", texto: "mejor ángulo: altura por distancia recorrida, para obstáculos cercanos." },
      { titulo: "Vy", texto: "mejor tasa: altura por tiempo, una vez pasados los obstáculos inmediatos." },
      { titulo: "Las temperaturas", texto: "las vigilas más que en crucero: potencia alta y velocidad baja dan menos flujo de enfriamiento." },
      { titulo: "La mezcla", texto: "muchos POH piden empobrecer ligeramente por encima de cierta altitud; en ascensos cortos y bajos suele mantenerse rica." },
    ],
  },
  "operacion-tema8": {
    clave: "Es el momento de menor carga de trabajo: aprovéchalo para navegar.",
    puntos: [
      { titulo: "Al nivelar", texto: "reduces potencia al ajuste del POH para esa configuración." },
      { titulo: "La mezcla", texto: "ajustas para optimizar consumo y rendimiento a esa altitud." },
      { titulo: "Por qué empobrecer", texto: "volar rico de más desperdicia combustible y puede ensuciar bujías." },
      { titulo: "Qué hacer con el tiempo libre", texto: "confirmar posición contra el plan, corregir deriva y hacer tus reportes." },
      { titulo: "Lo que no se descuida", texto: "el escaneo visual constante de tráfico." },
    ],
  },
  "operacion-tema9": {
    clave: "Multiplica por 3 la altitud a perder en miles de pies: esas son las millas de anticipación.",
    puntos: [
      { titulo: "Por qué planearlo", texto: "evita tener que descender abruptamente cerca del destino." },
      { titulo: "La regla del 3", texto: "altitud a perder en miles por 3, para bajar a una tasa razonable de unos 500 pies por minuto." },
      { titulo: "Antes de bajar", texto: "reduces potencia gradualmente." },
      { titulo: "Qué más se aprovecha", texto: "reajustar la mezcla hacia más rica, revisar el altímetro contra el reporte del destino." },
      { titulo: "El repaso mental", texto: "la configuración esperada de aproximación y aterrizaje." },
    ],
  },
  "operacion-tema10": {
    clave: "Una aproximación inestable es la señal más clara para irte al aire.",
    puntos: [
      { titulo: "La configuración", texto: "reduces potencia y extiendes flaps en las etapas y velocidades del POH." },
      { titulo: "Qué es estar estabilizado", texto: "velocidad correcta, tasa de descenso adecuada, alineado y configurado antes de cruzar el umbral." },
      { titulo: "Qué es estar inestable", texto: "muy rápido, muy alto, mal alineado o con la configuración incompleta." },
      { titulo: "La decisión", texto: "go-around, sin dudar y sin sentir vergüenza." },
    ],
  },
  "operacion-tema11": {
    clave: "El go-around sigue siendo la decisión correcta incluso a pocos pies del suelo.",
    puntos: [
      { titulo: "El flare", texto: "reduces la tasa de descenso y elevas la nariz para que toquen primero las llantas principales." },
      { titulo: "A qué velocidad", texto: "cerca de Vs0, la pérdida en configuración de aterrizaje." },
      { titulo: "Después de tocar", texto: "controles activos durante todo el rodaje, sobre todo en viento cruzado." },
      { titulo: "Hasta cuándo", texto: "hasta detenerte del todo o bajar a velocidad de rodaje segura." },
      { titulo: "Las señales de abortar", texto: "velocidad excesiva, deriva lateral sin corregir o un bote." },
    ],
  },
  "operacion-tema12": {
    clave: "El vuelo no termina al tocar: termina con el avión asegurado y la bitácora al día.",
    puntos: [
      { titulo: "Primero, fuera de la pista", texto: "cruzando completamente la línea de espera antes de tocar nada." },
      { titulo: "Checklist después de aterrizaje", texto: "retraer flaps, apagar luces de aterrizaje y ajustar la mezcla para el rodaje." },
      { titulo: "El apagado", texto: "mezcla a corte, magnetos apagados y todo en posición segura." },
      { titulo: "La inspección post-vuelo", texto: "anotar cualquier anomalía observada durante el vuelo." },
      { titulo: "Dejarlo listo", texto: "asegurar el avión con calzos y amarres, y la bitácora actualizada para el siguiente piloto o para mantenimiento." },
    ],
  },

  // ---------- Espacios Aéreos ----------
  "espacios-aereos-tema1": {
    clave: "Para un piloto VFR, la Clase A es simplemente un techo absoluto.",
    puntos: [
      { titulo: "Dónde vive", texto: "desde FL180, 18,000 pies de altitud de presión, hasta FL600." },
      { titulo: "Solo IFR", texto: "no se permite vuelo VFR bajo ninguna circunstancia." },
      { titulo: "Qué se necesita", texto: "plan IFR activo con autorización, transponder Modo C o S y comunicación bidireccional." },
      { titulo: "Bajo instrucciones", texto: "siguiendo indicaciones continuas del ATC." },
    ],
  },
  "espacios-aereos-tema2": {
    clave: "Un contacto por radio no basta: tienes que escuchar la autorización.",
    puntos: [
      { titulo: "Dónde vive", texto: "alrededor de los aeropuertos con mayor densidad de tráfico." },
      { titulo: "Su forma", texto: "pastel de bodas invertido: círculos concéntricos que se ensanchan con la altitud." },
      { titulo: "Autorización explícita", texto: "debes oír que te autorizan a entrar en espacio Clase B, o instrucción equivalente." },
      { titulo: "En la carta", texto: "líneas sólidas azules gruesas." },
      { titulo: "Equipo mínimo", texto: "transponder con Modo C y radio bidireccional operativo." },
    ],
  },
  "espacios-aereos-tema3": {
    clave: "Escuchar tu matrícula de vuelta confirma que ya puedes entrar.",
    puntos: [
      { titulo: "Dónde vive", texto: "aeropuertos de tráfico moderado a alto." },
      { titulo: "Su forma", texto: "un núcleo de unas 5 millas náuticas y una repisa exterior más amplia a mayor altitud." },
      { titulo: "Contacto bidireccional", texto: "no necesitas autorización explícita como en Clase B: basta con que control te conteste." },
      { titulo: "En la carta", texto: "círculos sólidos magenta." },
      { titulo: "Equipo mínimo", texto: "transponder Modo C y radio operativo, igual que en Clase B." },
    ],
  },
  "espacios-aereos-tema4": {
    clave: "Fuera del horario de la torre, la Clase D deja de ser Clase D.",
    puntos: [
      { titulo: "Dónde vive", texto: "aeropuertos con torre activa pero menos tráfico que B o C." },
      { titulo: "Dimensiones típicas", texto: "unas 4 millas náuticas de radio hasta 2,500 pies sobre el nivel del aeropuerto." },
      { titulo: "Contacto bidireccional", texto: "con la torre antes de entrar, igual que en Clase C." },
      { titulo: "El transponder", texto: "generalmente no exige Modo C obligatorio, aunque depende de la regulación local." },
      { titulo: "En la carta", texto: "líneas discontinuas azules." },
      { titulo: "Cuando cierra la torre", texto: "revierte a Clase E o G según lo indique la carta." },
    ],
  },
  "espacios-aereos-tema5": {
    clave: "Es el espacio controlado más extenso, y casi nunca te pide hablar.",
    puntos: [
      { titulo: "Qué es", texto: "espacio controlado que no encaja en las categorías A a D." },
      { titulo: "Dónde empieza", texto: "en superficie, a 700 pies AGL o a 1,200 pies AGL, según la ubicación." },
      { titulo: "En la carta", texto: "sombreado degradado magenta para el inicio a 700, líneas discontinuas azules para el de 1,200." },
      { titulo: "Para VFR", texto: "en la mayoría de los casos no exige contacto por radio obligatorio." },
      { titulo: "Lo que sí exige", texto: "visibilidad y separación de nubes más estrictas que en Clase G." },
    ],
  },
  "espacios-aereos-tema6": {
    clave: "No controlado no significa sin reglas: ver y evitar es la única separación que existe.",
    puntos: [
      { titulo: "Qué es", texto: "espacio no controlado: no hay ATC gestionando el tráfico." },
      { titulo: "Qué no se requiere", texto: "ni contacto por radio ni autorización de ningún tipo." },
      { titulo: "Dónde vive", texto: "a baja altitud en zonas rurales, por debajo del inicio de la Clase E correspondiente." },
      { titulo: "Lo que sí aplica", texto: "mínimos de visibilidad y separación de nubes, aunque más permisivos." },
      { titulo: "Tu responsabilidad", texto: "mantener separación visual con el otro tráfico, al cien por ciento." },
    ],
  },
  "espacios-aereos-tema7": {
    clave: "Cruzar una restringida activa no es solo una infracción: es riesgo físico real.",
    puntos: [
      { titulo: "Cómo se designan", texto: "con prefijo R y un número, por ejemplo R-401." },
      { titulo: "Qué contienen", texto: "entrenamiento militar, tiro con artillería y actividades similares." },
      { titulo: "No están prohibidas", texto: "se pueden cruzar con autorización del organismo que las controla." },
      { titulo: "Horarios publicados", texto: "solo están activas en ciertas horas; fuera de ellas suelen cruzarse libremente." },
      { titulo: "Antes de asumirlo", texto: "verificar NOTAMs, siempre." },
    ],
  },
  "espacios-aereos-tema8": {
    clave: "Aquí no hay horario activo: la prohibición es permanente y absoluta.",
    puntos: [
      { titulo: "Cómo se designan", texto: "con prefijo P y un número." },
      { titulo: "Qué significan", texto: "vuelo terminantemente prohibido, sin excepción ni proceso de autorización para vuelo civil." },
      { titulo: "Qué rodean", texto: "instalaciones de seguridad nacional, residencias presidenciales u otras zonas sensibles." },
      { titulo: "Las consecuencias", texto: "legales severas, además de posible interceptación militar." },
    ],
  },
  "espacios-aereos-tema9": {
    clave: "Legalmente puedes cruzarlas; operacionalmente, si están activas, las rodeas.",
    puntos: [
      { titulo: "Dónde suelen estar", texto: "frecuentemente sobre agua o costa." },
      { titulo: "Qué señalan", texto: "ejercicios militares, actividad de misiles o tráfico intenso de otro tipo." },
      { titulo: "La diferencia clave", texto: "no son legalmente restrictivas: no necesitas autorización para cruzarlas." },
      { titulo: "El costo", texto: "lo haces bajo tu propio riesgo, con actividad peligrosa posiblemente en curso." },
      { titulo: "La recomendación", texto: "evitarlas cuando estén activas, verificando NOTAMs." },
    ],
  },
  "espacios-aereos-tema10": {
    clave: "Por cada tramo: ¿tengo que hablar?, ¿qué equipo necesito?, ¿qué mínimos aplican?",
    puntos: [
      { titulo: "Comunicaciones", texto: "B pide autorización antes de entrar; C y D piden contacto establecido; E y G generalmente nada." },
      { titulo: "Equipo", texto: "transponder Modo C obligatorio en B y C, y por encima de ciertas altitudes incluso en E." },
      { titulo: "Mínimos", texto: "visibilidad y separación de nubes más estrictas en espacio controlado." },
      { titulo: "En Clase B sobre todo", texto: "entrar sin autorización puede costar una llamada de atención inmediata o la suspensión de licencia." },
      { titulo: "El peor caso", texto: "una situación de tráfico genuinamente peligrosa por falta de coordinación." },
    ],
  },

  // ---------- Vuelo IFR ----------
  "ifr-tema1": {
    clave: "Bajo IFR la separación la garantiza el sistema, no tus ojos.",
    puntos: [
      { titulo: "Qué permite", texto: "volar navegando solo por instrumentos, sin depender de referencia visual externa." },
      { titulo: "No solo por mal clima", texto: "muchos pilotos eligen IFR con buen tiempo, por la ruta estructurada y la prioridad de tránsito." },
      { titulo: "Control continuo", texto: "estás en contacto con ATC durante todo el vuelo." },
      { titulo: "Ruta y altitud", texto: "las autorizadas, específicas, no las que tú decidas sobre la marcha." },
      { titulo: "El cambio grande", texto: "la separación con otro tráfico IFR la da el sistema de control, no tu observación visual." },
    ],
  },
  "ifr-tema2": {
    clave: "CRAFT: Clearance limit, Route, Altitude, Frequency, Transponder.",
    puntos: [
      { titulo: "Qué lleva el plan", texto: "tipo de aeronave y equipo, ruta, altitud de crucero, combustible y aeropuerto alterno." },
      { titulo: "Clearance limit", texto: "hasta dónde llega la autorización." },
      { titulo: "Route y Altitude", texto: "la ruta autorizada, que puede diferir de la solicitada, y las altitudes inicial y final." },
      { titulo: "Frequency y Transponder", texto: "la frecuencia de salida a contactar y el código squawk asignado." },
      { titulo: "Antes de proceder", texto: "lees de vuelta la autorización completa." },
    ],
  },
  "ifr-tema3": {
    clave: "Existe para garantizar separación de obstáculos y terreno en el ascenso inicial.",
    puntos: [
      { titulo: "Qué conecta", texto: "el aeropuerto de salida con la estructura de aerovías en ruta." },
      { titulo: "Su propósito de diseño", texto: "la separación de obstáculos y terreno mientras asciendes." },
      { titulo: "El beneficio adicional", texto: "organiza el flujo de salida en aeropuertos de tráfico denso." },
      { titulo: "Las restricciones", texto: "de altitud y a veces de velocidad en puntos determinados; se cumplen salvo instrucción contraria." },
      { titulo: "Menos radio", texto: "gran parte de la ruta y sus restricciones ya vienen pre-autorizadas en el procedimiento." },
    ],
  },
  "ifr-tema4": {
    clave: "Victor hasta FL180 por radiales VOR; Rutas Jet por encima.",
    puntos: [
      { titulo: "Qué son", texto: "corredores publicados que conectan fixes y forman la estructura principal de rutas IFR." },
      { titulo: "Los fixes", texto: "generalmente VOR o puntos definidos por coordenadas." },
      { titulo: "Aerovías Victor", texto: "baja altitud, típicamente hasta FL180, definidas por radiales VOR." },
      { titulo: "Rutas Jet", texto: "alta altitud, sobre FL180, por radioayudas o RNAV." },
      { titulo: "Qué implica volarlas", texto: "seguir la línea publicada a la altitud asignada, con separación garantizada por el sistema ATC." },
    ],
  },
  "ifr-tema5": {
    clave: "Es la SID al revés: te ordena la llegada en la fase más ocupada del vuelo.",
    puntos: [
      { titulo: "Qué conecta", texto: "la estructura de aerovías en ruta con el área terminal de tu destino." },
      { titulo: "Qué organiza", texto: "el descenso y la entrada al espacio denso alrededor del aeropuerto." },
      { titulo: "Las restricciones", texto: "de altitud y velocidad en puntos específicos, igual que la SID." },
      { titulo: "Para qué", texto: "secuenciar el tráfico entrante y reducir la carga de comunicación." },
      { titulo: "Dónde termina", texto: "generalmente enlazando con el segmento inicial de una aproximación instrumental." },
    ],
  },
  "ifr-tema6": {
    clave: "La DA es un punto de decisión, no una zona de negociación.",
    puntos: [
      { titulo: "Es de precisión", texto: "da guía lateral con el Localizer y vertical con el Glideslope." },
      { titulo: "La senda", texto: "típicamente 3 grados hacia el umbral de la pista." },
      { titulo: "Las categorías", texto: "CAT I, II y III, según qué tan bajos son los mínimos; las altas piden más equipo y entrenamiento." },
      { titulo: "Al llegar a la DA", texto: "o tienes referencia visual suficiente para aterrizar, o ejecutas la frustrada de inmediato." },
    ],
  },
  "ifr-tema7": {
    clave: "LPV llega a mínimos comparables a un ILS categoría I, sin antena en tierra.",
    puntos: [
      { titulo: "La base", texto: "GPS o GNSS para volar entre waypoints por coordenadas, sin depender de estaciones terrestres." },
      { titulo: "LNAV", texto: "solo guía lateral, similar a una aproximación de no precisión." },
      { titulo: "LNAV/VNAV", texto: "suma guía vertical calculada, con mínimos más bajos." },
      { titulo: "LPV", texto: "Localizer Performance with Vertical guidance: la más precisa." },
      { titulo: "Lo que cambió", texto: "llevó aproximaciones de precisión a aeropuertos que nunca tuvieron un ILS instalado." },
    ],
  },
  "ifr-tema8": {
    clave: "Con MDA puedes volar nivelado; con DA decides en ese punto.",
    puntos: [
      { titulo: "Es de no precisión", texto: "usa un radial VOR como guía lateral; no hay guía vertical electrónica." },
      { titulo: "Dónde está el VOR", texto: "a menudo en el propio campo o cerca de él." },
      { titulo: "MDA", texto: "una altitud mínima que no puedes cruzar sin referencia visual." },
      { titulo: "La diferencia práctica", texto: "la mantienes nivelado hasta el punto de aproximación frustrada si no ves la pista." },
      { titulo: "Step-down fixes", texto: "descensos escalonados conforme confirmas tu posición sobre puntos publicados." },
    ],
  },
  "ifr-tema9": {
    clave: "Tres entradas, y cuál te toca depende de por dónde llegas al fix.",
    puntos: [
      { titulo: "Qué es", texto: "un patrón de espera en forma de hipódromo, para retrasar tu llegada de forma ordenada." },
      { titulo: "Cuándo", texto: "por instrucción de control cuando hay congestión, o como parte de un procedimiento publicado." },
      { titulo: "Cómo se define", texto: "por un fix, un rumbo de entrada y un lado de vueltas, generalmente a la derecha." },
      { titulo: "Directa", texto: "la más simple: entras derecho al patrón." },
      { titulo: "Paralela", texto: "vuelas paralelo al rumbo de entrada antes de virar." },
      { titulo: "Teardrop (gota)", texto: "te alejas en ángulo antes de virar hacia el fix." },
    ],
  },
  "ifr-tema10": {
    clave: "Practicar el flujo completo en simulador es la mejor preparación antes de volarlo en IMC.",
    puntos: [
      { titulo: "Antes de salir", texto: "presentas el plan con ruta, altitud y alterno, y recibes el clearance con formato CRAFT." },
      { titulo: "Despegue", texto: "vuelas la SID publicada con sus restricciones." },
      { titulo: "En ruta", texto: "la aerovía asignada, bajo control continuo y cambiando frecuencias por sector." },
      { titulo: "Descenso", texto: "la STAR hacia tu destino." },
      { titulo: "Aproximación", texto: "ILS, RNAV o VOR según disponibilidad y mínimos." },
      { titulo: "Si no ves la pista", texto: "frustrada, y holding si el tráfico o el clima lo requieren." },
    ],
  },

  // ---------- Comunicaciones ----------
  "comunicaciones-tema1": {
    clave: "La fraseología existe para eliminar ambigüedad, no para sonar profesional.",
    puntos: [
      { titulo: "Alfabeto fonético", texto: "Alfa, Bravo, Charlie, Delta: así se deletrean matrículas y letras sin confusión." },
      { titulo: "Números", texto: "dígito por dígito: tres cinco cero, no trescientos cincuenta." },
      { titulo: "Afirmativo y negativo", texto: "sí y no, sin lugar a interpretación." },
      { titulo: "Roger", texto: "recibido y entendido; no promete que vayas a cumplir nada." },
      { titulo: "Wilco", texto: "recibido y voy a cumplir la instrucción." },
      { titulo: "Por qué importa", texto: "reduce errores y acelera la comunicación en frecuencias congestionadas." },
    ],
  },
  "comunicaciones-tema2": {
    clave: "A quién llamas, quién eres y qué necesitas, en ese orden.",
    puntos: [
      { titulo: "La estructura", texto: "es fija para cualquier estación y cualquier llamada." },
      { titulo: "Un ejemplo", texto: "Guadalajara Torre, Cessna XB-VLA, en plataforma, solicito rodaje para salida local con información Bravo." },
      { titulo: "Matrícula completa", texto: "nunca la omitas en el primer contacto; después torre puede autorizarte a abreviarla." },
      { titulo: "La letra del ATIS", texto: "confirma que ya tienes los datos meteorológicos y evita que te los repitan." },
    ],
  },
  "comunicaciones-tema3": {
    clave: "Todo mantenga corto de pista se lee de vuelta, sin excepción.",
    puntos: [
      { titulo: "Qué te dan", texto: "la ruta exacta y los puntos donde debes detenerte y esperar." },
      { titulo: "Un ejemplo", texto: "XB-VLA, ruede a pista 20 por calle Alfa, mantenga corto de pista 02." },
      { titulo: "El readback obligatorio", texto: "es de las pocas instrucciones donde siempre se exige." },
      { titulo: "Por qué", texto: "un error ahí puede causar una incursión de pista." },
      { titulo: "Si dudas", texto: "pides que repitan la ruta antes de moverte." },
    ],
  },
  "comunicaciones-tema4": {
    clave: "Nunca cruzas el umbral sin autorización explícita, aunque la pista se vea despejada.",
    puntos: [
      { titulo: "Primero las listas", texto: "run-up y checklist previa, en la plataforma o el punto de espera designado." },
      { titulo: "La llamada", texto: "Torre, XB-VLA, listo para despegue, pista 20." },
      { titulo: "Salida o despegue", texto: "la OACI reserva despegue para la autorización y recomienda decir listo para salida; en la práctica se oyen las dos." },
      { titulo: "Lo que usan nuestras guías", texto: "las de Comunicaciones VFR e IFR de Descargas dicen listo para salida." },
      { titulo: "Instrucciones de espera", texto: "mantenga posición, o line up and wait, si hay tráfico en pista o en corta final." },
    ],
  },
  "comunicaciones-tema5": {
    clave: "Copiado o roger no son readback de una autorización.",
    puntos: [
      { titulo: "Cómo suena", texto: "XB-VLA, autorizado a despegar pista 20, viento 200 a 8 nudos." },
      { titulo: "Tu readback", texto: "tu matrícula y la confirmación de autorizado a despegar pista 20." },
      { titulo: "Si algo no cuadra", texto: "si menciona otra pista o no coincide con tu plan, pides confirmación antes de iniciar." },
      { titulo: "Lo que no se hace", texto: "asumir que fue un error de la torre sin confirmarlo." },
    ],
  },
  "comunicaciones-tema6": {
    clave: "Viento en cola, base y final: el orden en que realmente vuelas el circuito.",
    puntos: [
      { titulo: "El orden", texto: "los reportes siguen la secuencia del propio circuito." },
      { titulo: "Cómo suenan", texto: "Torre, XB-VLA, viento en cola pista 20; luego base; luego final." },
      { titulo: "Para qué sirven", texto: "la torre te secuencia y los demás pilotos saben dónde estás." },
      { titulo: "Sin torre", texto: "reportas igual en la frecuencia CTAF, aunque nadie te conteste: es para informar a otros pilotos." },
    ],
  },
  "comunicaciones-tema7": {
    clave: "Quién eres, dónde estás, a qué altitud y qué piensas hacer.",
    puntos: [
      { titulo: "Dónde estás", texto: "normalmente sobre un punto VFR o un radial de VOR." },
      { titulo: "Un ejemplo", texto: "XB-VLA, sobre el punto Vista Hermosa, seis mil quinientos pies, en tránsito hacia Guadalajara." },
      { titulo: "Cuándo importan más", texto: "cerca de espacio aéreo controlado o en zonas de tráfico denso." },
      { titulo: "Quién los usa", texto: "control, y también otros pilotos que monitorean la frecuencia para mantener separación." },
    ],
  },
  "comunicaciones-tema8": {
    clave: "Si te lo niegan, rodeas el espacio aéreo; no lo cruzas de todas formas.",
    puntos: [
      { titulo: "Cuándo se pide", texto: "para cruzar espacio Clase B, C o D sin aterrizar." },
      { titulo: "Antes de entrar", texto: "solicitas y recibes la autorización de tránsito VFR." },
      { titulo: "Cómo suena", texto: "Aproximación Guadalajara, Cessna XB-VLA, solicito tránsito VFR de norte a sur, seis mil pies, sobre la ciudad." },
      { titulo: "Qué puede responder control", texto: "autorizarlo tal cual, darte otra ruta o altitud, o negarlo si hay demasiado tráfico." },
    ],
  },
  "comunicaciones-tema9": {
    clave: "Aproximación te secuencia antes de pasarte a Torre.",
    puntos: [
      { titulo: "A quién contactas primero", texto: "a Aproximación, antes de que te transfieran a Torre." },
      { titulo: "Qué te da", texto: "vectores, altitudes y secuenciación respecto a otro tráfico." },
      { titulo: "Cómo suena", texto: "XB-VLA, vire rumbo 180, descienda y mantenga cinco mil pies, espere vectores para secuencia visual." },
      { titulo: "El aviso de tráfico", texto: "tráfico a las 10, dos millas, mismo nivel." },
      { titulo: "Qué debes hacer", texto: "reportar en cuanto lo tengas a la vista." },
    ],
  },
  "comunicaciones-tema10": {
    clave: "El silencio no es autorización.",
    puntos: [
      { titulo: "Cuándo llega", texto: "típicamente cuando ya estás en tramo final." },
      { titulo: "Cómo suena", texto: "XB-VLA, autorizado a aterrizar pista 20, viento 190 a 6 nudos." },
      { titulo: "Tu readback", texto: "tu matrícula y autorizado a aterrizar pista 20." },
      { titulo: "Toque y despegue", texto: "se solicita explícitamente y la autorización lo refleja." },
      { titulo: "Lo que nunca se asume", texto: "que estás autorizado solo porque no escuchaste instrucción contraria." },
    ],
  },
  "comunicaciones-tema11": {
    clave: "El readback correcto confirmado por control es lo que te autoriza a proceder.",
    puntos: [
      { titulo: "Qué recibes antes de salir", texto: "el clearance con ruta, altitud inicial, código squawk y frecuencia de salida." },
      { titulo: "Cómo se lee de vuelta", texto: "completo y palabra por palabra, sobre todo el squawk y las altitudes." },
      { titulo: "Si te equivocas", texto: "control te corrige y debes repetir la versión correcta antes de continuar." },
      { titulo: "Por qué es más crítico en IFR", texto: "hay menos margen de referencia visual para detectar un error a tiempo." },
    ],
  },
  "comunicaciones-tema12": {
    clave: "Es preferible declarar de más que de menos.",
    puntos: [
      { titulo: "PAN-PAN", texto: "repetido tres veces, para una urgencia sin peligro inmediato de vida, como un pasajero enfermo." },
      { titulo: "MAYDAY", texto: "repetido tres veces, para peligro grave e inminente: falla de motor, incendio a bordo." },
      { titulo: "El formato", texto: "matrícula, naturaleza de la emergencia, posición, altitud, almas a bordo, combustible restante e intenciones." },
      { titulo: "Qué te da", texto: "prioridad absoluta sobre cualquier otro tráfico." },
      { titulo: "Lo que hará control", texto: "todo lo posible por asistirte." },
    ],
  },
  "comunicaciones-tema13": {
    clave: "Cada elemento de la fraseología existe porque previene un error que ya causó incidentes.",
    puntos: [
      { titulo: "Omitir readback", texto: "sobre todo en mantenga corto y en autorizaciones de despegue o aterrizaje." },
      { titulo: "Abreviar antes de tiempo", texto: "usar matrícula incompleta antes de que torre te autorice a hacerlo." },
      { titulo: "Bloquear la frecuencia", texto: "transmitir encima de otra estación." },
      { titulo: "Asumir autorizaciones", texto: "dar por dada una que nunca se dijo explícitamente." },
      { titulo: "Lenguaje coloquial", texto: "usarlo en momentos críticos, en vez de fraseología estándar." },
      { titulo: "El fondo del asunto", texto: "la disciplina de radio no es sonar profesional: es una herramienta de seguridad." },
    ],
  },

  // ---------- Navegación ----------
  "navegacion-tema1": {
    clave: "Es la columna vertebral de la navegación tradicional, VFR e IFR.",
    puntos: [
      { titulo: "Qué es", texto: "una radioayuda terrestre que transmite información de rumbo en VHF, de 108.00 a 117.95 MHz." },
      { titulo: "Qué te dice", texto: "tu posición angular, el radial, respecto a la estación." },
      { titulo: "Cuántos cursos", texto: "360 posibles, uno por cada grado." },
      { titulo: "Sobre qué se construye todo", texto: "radiales, tracking, intercepción y fixes cruzados salen de aquí." },
    ],
  },
  "navegacion-tema2": {
    clave: "El VOR te dice en qué línea estás, no a cuántas millas.",
    puntos: [
      { titulo: "Dos señales", texto: "una de fase de referencia, igual en todas direcciones, y una variable que rota 30 veces por segundo." },
      { titulo: "Cómo se traduce", texto: "el receptor mide la diferencia de fase, y esa diferencia en grados es tu radial." },
      { titulo: "Lo que no te da", texto: "la distancia en millas a la estación." },
      { titulo: "Cómo conseguir la distancia", texto: "con un DME, o cruzando con otro VOR." },
    ],
  },
  "navegacion-tema3": {
    clave: "El radial siempre se mide DESDE el VOR hacia afuera, nunca hacia la estación.",
    puntos: [
      { titulo: "Qué son", texto: "las 360 líneas rectas imaginarias que salen del VOR en todas direcciones." },
      { titulo: "Cómo se numeran", texto: "según su rumbo magnético medido desde la estación." },
      { titulo: "Dos ejemplos", texto: "el radial 090 sale hacia el este; el 270, hacia el oeste." },
      { titulo: "El error de cadete", texto: "creer que el radial se mide hacia el VOR." },
      { titulo: "Lo que implica", texto: "si estás en el radial 090 estás al este de la estación, apunte donde apunte tu nariz." },
    ],
  },
  "navegacion-tema4": {
    clave: "El radial y el curso TO la estación difieren 180 grados.",
    puntos: [
      { titulo: "Qué te dice la bandera", texto: "si volando el curso seleccionado te acercas (TO) o te alejas (FROM) de la estación." },
      { titulo: "Con TO", texto: "volar ese rumbo con la aguja centrada te lleva hacia el VOR." },
      { titulo: "Con FROM", texto: "te lleva alejándote de él." },
      { titulo: "El ejemplo que aclara", texto: "para volar TO un VOR estando en el radial 090, tu curso es 270, no 090." },
      { titulo: "El hábito", texto: "verificar la bandera antes de asumir hacia dónde te lleva el curso." },
    ],
  },
  "navegacion-tema5": {
    clave: "Vuelas HACIA la aguja para interceptar, nunca te alejas de ella.",
    puntos: [
      { titulo: "Qué muestra", texto: "qué tan lejos estás del curso seleccionado en el OBS." },
      { titulo: "Cada punto", texto: "unos 2 grados de error angular respecto al VOR." },
      { titulo: "La escala", texto: "5 puntos a cada lado, es decir 10 grados a escala completa." },
      { titulo: "Cómo se lee", texto: "aguja a la izquierda significa que el curso está a tu izquierda." },
      { titulo: "Aguja centrada", texto: "estás exactamente sobre el curso seleccionado." },
    ],
  },
  "navegacion-tema6": {
    clave: "Girar el OBS no cambia tu posición ni tu rumbo: cambia la referencia del instrumento.",
    puntos: [
      { titulo: "Qué es", texto: "la perilla con la que seleccionas el curso o radial que quieres volar." },
      { titulo: "Qué mueve", texto: "la referencia interna del instrumento." },
      { titulo: "Qué cambia en pantalla", texto: "la posición de la aguja del CDI y la bandera FROM/TO." },
      { titulo: "Qué no cambia", texto: "nada de tu vuelo real: solo le dices al instrumento contra qué curso comparar." },
    ],
  },
  "navegacion-tema7": {
    clave: "Cuatro pasos: selecciona, observa, gira e intercepta.",
    puntos: [
      { titulo: "1. Selecciona", texto: "el radial deseado en el OBS." },
      { titulo: "2. Observa", texto: "hacia qué lado apunta la aguja del CDI: eso te dice de qué lado del radial estás." },
      { titulo: "3. Gira", texto: "a un rumbo que combine tu curso deseado con un ángulo extra hacia el lado de la aguja." },
      { titulo: "4. Mantén y alinea", texto: "ese rumbo hasta que la aguja se acerque al centro, y entonces giras al curso final." },
    ],
  },
  "navegacion-tema8": {
    clave: "Treinta grados es el equilibrio entre interceptar rápido y no pasarte.",
    puntos: [
      { titulo: "Con menos de 30", texto: "tardas mucho en cerrar la distancia al radial: intercepción lenta y gradual." },
      { titulo: "Con más de 30 o 45", texto: "te arriesgas a pasarte del curso, porque la aguja se mueve muy rápido cerca del centro." },
      { titulo: "Lo que te dan 30 grados", texto: "tiempo suficiente para anticipar el giro al curso final sin overshoot." },
      { titulo: "Y además", texto: "es el ángulo que se enseña y se evalúa en la mayoría de los programas de entrenamiento." },
    ],
  },
  "navegacion-tema9": {
    clave: "Vuela hacia donde apunta la aguja: esa es toda la regla.",
    puntos: [
      { titulo: "La fórmula", texto: "rumbo de intercepción es el curso deseado más o menos el ángulo de intercepción." },
      { titulo: "Aguja a la derecha", texto: "estás al oeste del curso: sumas. Con curso 360, interceptas con 030." },
      { titulo: "Aguja a la izquierda", texto: "estás al este del curso: restas. Con curso 360, interceptas con 330." },
      { titulo: "La regla práctica", texto: "aguja a la derecha, rumbo mayor que el curso; aguja a la izquierda, menor." },
    ],
  },
  "navegacion-tema10": {
    clave: "Tu rumbo real de tracking no es tu curso deseado: lleva la corrección por viento.",
    puntos: [
      { titulo: "Qué es", texto: "mantener el avión exactamente sobre el radial o curso durante todo el trayecto." },
      { titulo: "En qué se diferencia", texto: "no es apuntar la nariz a la estación: es corregir constantemente por el viento." },
      { titulo: "El WCA", texto: "un pequeño desvío del rumbo respecto al curso, hacia el lado de donde viene el viento." },
      { titulo: "Cómo se aplica", texto: "si el viento te empuja a la derecha, vuelas unos grados a la izquierda del curso." },
      { titulo: "Cómo sabes que funciona", texto: "la aguja se mantiene centrada." },
    ],
  },
  "navegacion-tema11": {
    clave: "Homing traza una curva; tracking traza una línea recta sobre el suelo.",
    puntos: [
      { titulo: "Homing", texto: "apuntar la nariz hacia la aguja o la estación, sin calcular corrección de viento." },
      { titulo: "Qué resulta", texto: "una trayectoria curva e ineficiente: corriges de forma reactiva en vez de anticipar." },
      { titulo: "Tracking", texto: "una línea recta real, con un ángulo de corrección calculado de antemano." },
      { titulo: "Qué ganas", texto: "una ruta más corta, predecible y profesional." },
      { titulo: "La regla", texto: "todo piloto instrumental domina tracking; homing solo sirve como aproximación inicial burda." },
    ],
  },
  "navegacion-tema12": {
    clave: "Donde se cruzan dos radiales está tu posición exacta, sin GPS.",
    puntos: [
      { titulo: "Qué necesitas", texto: "sintonizar dos VOR distintos y determinar en qué radial de cada uno estás." },
      { titulo: "Cómo se llama", texto: "fijación cruzada, o cross-fix." },
      { titulo: "Cómo se hace", texto: "trazas cada radial desde su VOR en la carta." },
      { titulo: "El resultado", texto: "la intersección de ambas líneas es tu ubicación real en ese momento." },
      { titulo: "Por qué importa", texto: "es de las formas más confiables de confirmar posición, y se espera que la ejecutes a mano." },
    ],
  },
  "navegacion-tema13": {
    clave: "Cerca de la estación y bajo, la distancia que marca no es tu distancia horizontal.",
    puntos: [
      { titulo: "Qué mide", texto: "la distancia real en línea recta, el slant range, en millas náuticas." },
      { titulo: "Cómo la mide", texto: "por el tiempo que tarda una señal en ir y regresar." },
      { titulo: "Dónde vive", texto: "muchas veces integrado con el VOR, o con el ILS." },
      { titulo: "Qué más te da", texto: "groundspeed de acercamiento y tiempo estimado a la estación." },
      { titulo: "El detalle a cuidar", texto: "a baja altura y muy cerca, el slant range difiere de la distancia horizontal por tu propia altura." },
    ],
  },
  "navegacion-tema14": {
    clave: "Integra en una imagen lo que antes había que leer en dos instrumentos.",
    puntos: [
      { titulo: "Qué combina", texto: "el indicador de rumbo giroscópico con la desviación de curso del VOR o ILS." },
      { titulo: "Y a veces", texto: "también la pendiente de planeo, el glideslope." },
      { titulo: "Cómo se ve", texto: "la rosa de compás gira mostrando tu rumbo real, y encima se superpone la barra del curso." },
      { titulo: "Qué ganas", texto: "una imagen mucho más intuitiva de tu situación respecto al curso." },
    ],
  },
  "navegacion-tema15": {
    clave: "Al ver rumbo y desviación juntos, es mucho más difícil equivocarte de lado.",
    puntos: [
      { titulo: "Cómo se opera", texto: "seleccionas el curso con el selector, similar al OBS." },
      { titulo: "Qué hace el instrumento", texto: "gira una barra sobre la rosa mostrando ese curso en relación a tu rumbo actual." },
      { titulo: "La desviación", texto: "funciona igual que en un CDI normal." },
      { titulo: "La ventaja", texto: "ves tu rumbo real al mismo tiempo, así que sabes de inmediato hacia dónde girar." },
      { titulo: "Los extras", texto: "muchos muestran el bug de rumbo para el piloto automático y la aguja de glideslope en ILS." },
    ],
  },
  "navegacion-tema16": {
    clave: "El HSI elimina la sensibilidad inversa que confunde a tantos estudiantes.",
    puntos: [
      { titulo: "Qué muestra el CDI", texto: "solo la desviación del curso, sin contexto de tu rumbo real." },
      { titulo: "El trabajo extra", texto: "mirar el indicador de rumbo aparte y combinar ambas lecturas mentalmente." },
      { titulo: "La sensibilidad inversa", texto: "aparece cuando vuelas en la dirección equivocada del curso seleccionado." },
      { titulo: "Cómo lo resuelve el HSI", texto: "la barra de curso siempre se muestra en su orientación real respecto a tu rumbo." },
      { titulo: "Por eso", texto: "es el estándar en cabinas más modernas y de instrumentos avanzados." },
    ],
  },
  "navegacion-tema17": {
    clave: "El ADF no da radiales: su aguja apunta a la estación y ya.",
    puntos: [
      { titulo: "Qué usa", texto: "estaciones NDB en tierra; es un sistema más antiguo que el VOR." },
      { titulo: "Qué muestra", texto: "el rumbo relativo medido desde la nariz de tu avión, apuntando siempre a la estación." },
      { titulo: "Su ventaja", texto: "es más simple." },
      { titulo: "Sus desventajas", texto: "menos preciso y más susceptible a tormentas eléctricas, terreno y hora del día." },
      { titulo: "Dónde sigue vivo", texto: "en regiones donde la infraestructura VOR es limitada." },
    ],
  },
  "navegacion-tema18": {
    clave: "Solo te da la dirección hacia la estación, no tu posición.",
    puntos: [
      { titulo: "Qué transmite", texto: "una señal en frecuencia baja o media, igual en todas direcciones." },
      { titulo: "Lo que no codifica", texto: "ninguna información de radial, a diferencia del VOR." },
      { titulo: "Qué hace el receptor", texto: "detecta de qué dirección relativa viene la señal más fuerte y apunta la aguja hacia allá." },
      { titulo: "Para saber dónde estás", texto: "hay que combinarlo con tu rumbo y, de preferencia, otra referencia cruzada." },
    ],
  },
  "navegacion-tema19": {
    clave: "Te da el rumbo magnético real a la estación, sin cálculos mentales.",
    puntos: [
      { titulo: "Qué combina", texto: "una rosa de compás giratoria con una o dos agujas hacia estaciones ADF o VOR." },
      { titulo: "La diferencia con el ADF simple", texto: "la rosa gira con tu avión, así que la aguja da el rumbo magnético real, no el relativo." },
      { titulo: "Qué te ahorra", texto: "sumar rumbo relativo más rumbo magnético de cabeza." },
      { titulo: "Qué permite", texto: "interpretar tu posición respecto a la estación de un vistazo." },
    ],
  },
  "navegacion-tema20": {
    clave: "Traen la rosa de compás impresa para trazar radiales directo sobre la carta.",
    puntos: [
      { titulo: "Espacio aéreo", texto: "ubicación y clasificación: Clase B, C, D, E y G." },
      { titulo: "Aeropuertos", texto: "con sus frecuencias." },
      { titulo: "Terreno y obstáculos", texto: "elevaciones, y la altura de cada obstáculo." },
      { titulo: "Estaciones VOR", texto: "su ubicación exacta, con rosa de compás para trazar radiales." },
      { titulo: "Por qué es la base", texto: "leerla con fluidez es indispensable antes de planear cualquier ruta." },
    ],
  },
  "navegacion-tema21": {
    clave: "Un minuto de latitud es una milla náutica: la carta es su propia regla.",
    puntos: [
      { titulo: "Lo estándar", texto: "la escala gráfica impresa en el margen, o un plotter de navegación." },
      { titulo: "El truco confiable", texto: "un minuto de latitud equivale a una milla náutica." },
      { titulo: "Dónde se mide", texto: "verticalmente, en los bordes izquierdo y derecho de la carta." },
      { titulo: "Dónde nunca", texto: "en los bordes horizontales de longitud." },
    ],
  },
  "navegacion-tema22": {
    clave: "Debes poder calcularla a mano, sin depender de la electrónica.",
    puntos: [
      { titulo: "Con DME o VOR/DME", texto: "el instrumento te da la distancia directa en millas náuticas." },
      { titulo: "Sin DME", texto: "navegación por estima: mides en la carta y divides entre tu groundspeed para saber el tiempo." },
      { titulo: "Con GPS", texto: "distancia y tiempo estimado aparecen directamente en pantalla." },
      { titulo: "Por qué a mano", texto: "como piloto en entrenamiento tienes que poder hacerlo sin ayuda del equipo." },
    ],
  },
  "navegacion-tema23": {
    clave: "Un plan bien hecho es la diferencia entre un vuelo tranquilo y estrés innecesario en el aire.",
    puntos: [
      { titulo: "Checkpoints", texto: "puntos de referencia visuales claramente identificables desde el aire." },
      { titulo: "Rumbo y distancia", texto: "magnéticos, entre cada par de checkpoints." },
      { titulo: "Tiempo y combustible", texto: "por tramo, considerando el viento pronosticado." },
      { titulo: "Espacio aéreo", texto: "cuál cruzarás y si necesitas autorización o comunicación con algún control." },
      { titulo: "La meteorología", texto: "NOTAMs y METAR/TAF de salida, ruta y destino." },
      { titulo: "El alterno", texto: "siempre definido, con reservas de combustible adecuadas." },
    ],
  },
  "navegacion-tema24": {
    clave: "Este tipo de ejercicio sobre una ruta real es exactamente lo que se evalúa en un checkride.",
    puntos: [
      { titulo: "La ruta", texto: "Guadalajara (MMGL) a Manzanillo (MMZO), como ejercicio integrador." },
      { titulo: "Los VOR", texto: "identificas los disponibles para usarlos como checkpoints o para tracking directo." },
      { titulo: "Las distancias", texto: "totales y por tramos, medidas en la carta VFR." },
      { titulo: "Los rumbos", texto: "el magnético inicial y cómo cambia si sigues radiales de un VOR intermedio." },
      { titulo: "El tiempo", texto: "estimado según tu velocidad de crucero y el viento pronosticado." },
      { titulo: "El alterno", texto: "por ejemplo Colima, por si las condiciones en Manzanillo no son favorables." },
    ],
  },
};
