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
};
