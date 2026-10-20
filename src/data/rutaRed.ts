// Ruta "Listo para volar en red" · Etapa 1 (español): las 8 lecciones gratuitas.
// Procedimientos: solo los de CARTAS_RED (Jeppesen vía Navigraph, confirmados por el fundador
// el 2026-10-19). Si una carta cambia de ciclo, se actualiza aquí y en el texto que la cita.
import type { Tema } from "./moduleContent.ts";
import type { QuizPregunta } from "../features/academia/quizData.ts";

export const SLUG_RUTA_RED = "listo-para-red";

export interface LeccionRed {
  id: string;
  numero: number;
  titulo: string;
  resumen: string;
  videoId: string | null;
  temas: Tema[];
  practica: QuizPregunta[];
  audioSetId?: "autorizacion-ifr";
}

export const CARTAS_RED: { procedimiento: string; aeropuerto: "MMGL" | "MMMX"; tipo: "SID" | "STAR" | "APP"; vigencia: string; fuente: string }[] = [
  { procedimiento: "LONKU 1D", aeropuerto: "MMGL", tipo: "SID", vigencia: "11 jul 2024", fuente: "Jeppesen vía Navigraph (carta 10-3D), confirmada por el fundador" },
  { procedimiento: "LONKU 1E", aeropuerto: "MMGL", tipo: "SID", vigencia: "11 jul 2024", fuente: "Jeppesen vía Navigraph (carta 10-3E), confirmada por el fundador" },
  { procedimiento: "OVALI 1", aeropuerto: "MMGL", tipo: "SID", vigencia: "4 sep 2025", fuente: "Jeppesen vía Navigraph (carta 10-3), confirmada por el fundador" },
  { procedimiento: "DARAN 3A", aeropuerto: "MMMX", tipo: "STAR", vigencia: "12 jun 2025", fuente: "Jeppesen vía Navigraph (carta 10-2), confirmada por el fundador" },
  { procedimiento: "RNP Y Rwy 05R", aeropuerto: "MMMX", tipo: "APP", vigencia: "27 mar 2026", fuente: "Jeppesen vía Navigraph (carta 12-2B), confirmada por el fundador" },
];

/** Leyenda que acompaña cada cita de carta en las lecciones. */
const carta = (procedimiento: string) => {
  const c = CARTAS_RED.find((x) => x.procedimiento === procedimiento)!;
  return `Carta ${procedimiento}, vigente desde el ${c.vigencia}. Solo para simulación: confirma la fecha en tu carta del ciclo actual.`;
};

export const LECCIONES_RED: LeccionRed[] = [
  {
    id: "antes-de-conectarte",
    numero: 1,
    titulo: "Antes de conectarte",
    resumen: "Qué son IVAO y VATSIM, cómo te conectas, qué esperar de un controlador real y cómo dejar tu vuelo visible para la prueba.",
    videoId: null,
    temas: [
      {
        id: "red-1-1",
        titulo: "IVAO y VATSIM",
        clave: "Son redes gratuitas donde personas reales hacen de controladores: ahí practicas el vuelo IFR con tránsito y radio de verdad.",
        texto: "IVAO y VATSIM son dos redes de simulación gratuitas. Te conectas con tu simulador y apareces en un mapa junto a otros pilotos; controladores voluntarios, personas reales, te dan autorizaciones, rodaje, vectores y aproximaciones por radio. Cada red tiene su código de conducta, sus centros de formación y sus eventos. Ninguna es aviación real, pero las reglas y la fraseología se parecen mucho. Puedes tener cuenta en las dos; para esta ruta basta con una.",
      },
      {
        id: "red-1-2",
        titulo: "La cuenta y el programa para conectarte",
        clave: "Primero la cuenta y la orientación que pida la red; luego el programa piloto de tu simulador.",
        texto: "Regístrate en el sitio de la red que elijas y sigue los pasos que te pida antes de tu primera conexión (por ejemplo, un curso o examen de orientación). Después instala el programa piloto: en VATSIM, vPilot para MSFS o xPilot para X-Plane; en IVAO, Altitude. Ese programa envía tu posición, maneja la radio por voz y te deja presentar el plan de vuelo. Haz una conexión de prueba en tierra: revisa que tu callsign aparezca bien, que el micrófono y el botón para transmitir funcionen y que escuchas la frecuencia.",
        puntos: [
          { titulo: "VATSIM", texto: "vPilot (MSFS) o xPilot (X-Plane)." },
          { titulo: "IVAO", texto: "Altitude." },
          { titulo: "Prueba en tierra", texto: "Callsign, micrófono, botón para transmitir y audio, antes de tu primer vuelo." },
        ],
      },
      {
        id: "red-1-3",
        titulo: "Qué esperar de un controlador real",
        clave: "Escucha antes de hablar, di solo lo necesario y, si no entendiste, pide que repita.",
        texto: "El controlador atiende a varios pilotos a la vez, así que escucha la frecuencia antes de transmitir y no interrumpas. Habla corto: quién llamas, quién eres y qué necesitas. Si no entendiste algo, di «repita» y lo que te faltó; es mucho mejor que adivinar. A veces no hay nadie controlando tu zona: entonces anuncias tus movimientos en la frecuencia común UNICOM 122.800. Y recuerda que el controlador también es voluntario: un error se corrige con calma.",
      },
      {
        id: "red-1-4",
        titulo: "Que tu vuelo se vea en la prueba",
        clave: "Para la prueba, Erik tiene que ver tu vuelo: conéctate a IVAO o VATSIM con tu callsign o comparte tu vuelo en vivo con Volanta.",
        texto: "En la prueba final Erik hace de controlador por Discord y sigue tu vuelo en un mapa. Tienes dos caminos: volar conectado a IVAO o VATSIM, y Erik te encuentra por tu callsign en el mapa de la red (Webeye en IVAO o un mapa de VATSIM como VATSIM Radar); o volar con Volanta y compartir el enlace de tu vuelo en vivo. Al agendar te pedimos el callsign o el enlace de Volanta. Ensaya antes: conéctate, busca tu avión en el mapa y revisa que se mueve. La prueba es de Villanueva Aviation y no es una evaluación oficial de IVAO, VATSIM ni la AFAC.",
      },
    ],
    practica: [
      { id: "red-q1-1", pregunta: "¿Quién te da las instrucciones en IVAO y VATSIM?", opciones: ["Un programa automático", "El simulador", "Controladores voluntarios, personas reales", "Nadie, solo hay tránsito"], correcta: 2 },
      { id: "red-q1-2", pregunta: "No hay controlador en tu zona. ¿Qué haces?", opciones: ["Anuncias tus movimientos en UNICOM 122.800", "Te desconectas", "Vuelas sin decir nada", "Llamas a la torre de otro aeropuerto"], correcta: 0 },
      { id: "red-q1-3", pregunta: "¿Qué necesitas para que Erik vea tu vuelo en la prueba?", opciones: ["Mandarle capturas de pantalla", "Grabar el vuelo y subirlo después", "Nada, basta con la radio", "Tu callsign en IVAO/VATSIM o el enlace de Volanta en vivo"], correcta: 3 },
      { id: "red-q1-4", pregunta: "¿Qué es la prueba final de la ruta?", opciones: ["Una evaluación oficial de VATSIM", "Una prueba de Villanueva Aviation con Erik de controlador, sin valor oficial", "Un trámite de la AFAC", "Un examen de IVAO"], correcta: 1 },
    ],
  },
  {
    id: "plan-de-vuelo",
    numero: 2,
    titulo: "Tu plan de vuelo IFR",
    resumen: "Arma el plan MMGL → MMMX en SimBrief y entiende cada pieza de la ruta, no solo la cargues.",
    videoId: null,
    temas: [
      {
        id: "red-2-1",
        titulo: "Armarlo en SimBrief",
        clave: "SimBrief propone la ruta; tú revisas que tenga sentido con las cartas del mismo ciclo.",
        texto: "En SimBrief pon origen MMGL, destino MMMX, el avión que vas a volar (para las lecciones, el C172) y un alterno. SimBrief propone una ruta con aerovías del ciclo AIRAC actual. Antes de generar, revisa que tu simulador y tus cartas usen el mismo ciclo: si no coinciden, puede que un punto o una SID no existan en tu GPS. Revisa también el equipo del avión: las SID LONKU piden RNAV 1 con GNSS, así que el plan debe decir que tienes GPS.",
      },
      {
        id: "red-2-2",
        titulo: "Leer la ruta pieza por pieza",
        clave: "SID hasta LONKU, ruta en crucero, STAR desde DARAN y aproximación desde UKTEN.",
        texto: "El vuelo de esta ruta es: salida LONKU 1D (pistas 11L/R) o LONKU 1E (pistas 29L/R) hasta el punto LONKU; luego la parte en ruta que arma SimBrief, con aerovías o directos, hasta DARAN; de ahí la llegada DARAN 3A hasta UKTEN, y desde UKTEN la aproximación RNP Y Rwy 05R a Ciudad de México. En el plan y en el GPS los nombres aparecen abreviados: LONK1D, LONK1E, DARA3A. Lee cada tramo de la ruta en ruta: una aerovía va de un punto a otro, y debes saber dónde entras y dónde sales de ella.",
        puntos: [
          { titulo: "Salida", texto: "LONKU 1D o LONKU 1E, según la pista en uso; termina en LONKU." },
          { titulo: "En ruta", texto: "Aerovías o directos de LONKU a DARAN; los elige SimBrief y tú los revisas." },
          { titulo: "Llegada", texto: "DARAN 3A, de DARAN a UKTEN." },
          { titulo: "Aproximación", texto: "RNP Y Rwy 05R, que empieza en UKTEN." },
        ],
      },
      {
        id: "red-2-3",
        titulo: "Altitudes y el C172",
        clave: "Si tu avión no puede cumplir las altitudes de una llegada, no puedes aceptarla.",
        texto: "La llegada DARAN 3A está hecha para jets: cruza DARAN entre FL210 y FL230. Un C172 no llega ahí, y esas altitudes existen por el terreno: alrededor de MMMX las altitudes mínimas de sector son de 12 100, 14 800 y 19 400 ft, y el controlador no puede llevarte por debajo de ellas. Si tu avión no puede cumplir las restricciones de una llegada, no puedes aceptarla: contestas «imposible». Recuerda que en MMGL la altitud de transición es 18 500 ft y en MMMX el nivel de transición es FL195: abajo de eso vuelas con el altímetro en QNH. En la prueba eliges tu avión; si es un jet, vuelas la STAR con sus altitudes publicadas.",
      },
      {
        id: "red-2-4",
        titulo: "Entenderla, no solo cargarla",
        clave: "Si el controlador cambia algo, tienes que saber dónde estás y a dónde vas.",
        texto: "Cargar el plan sin leerlo funciona hasta que el controlador te cambia la salida, la pista o te manda directo a un punto. Ahí es cuando muchos se pierden. Antes de conectarte, recorre la ruta en el mapa de SimBrief o en tu GPS y ubica los cuatro puntos que mandan en este vuelo: LONKU, DARAN, UKTEN y la pista 05R. Si sabes dónde están, cualquier cambio se vuelve una corrección pequeña.",
      },
    ],
    practica: [
      { id: "red-q2-1", pregunta: "¿Dónde termina la salida LONKU 1D?", opciones: ["En el punto LONKU", "En DARAN", "En UKTEN", "En la pista 05R"], correcta: 0 },
      { id: "red-q2-2", pregunta: "En el plan aparece «DARA3A». ¿Qué es?", opciones: ["Un error de SimBrief", "El alterno", "Una aerovía", "La llegada DARAN 3A abreviada"], correcta: 3 },
      { id: "red-q2-3", pregunta: "¿Por qué el ciclo AIRAC de tu simulador debe coincidir con el de tus cartas?", opciones: ["No importa", "Para que los puntos y procedimientos existan igual en tu GPS", "Para que SimBrief cobre menos", "Para que el controlador te vea"], correcta: 1 },
      { id: "red-q2-4", pregunta: "Vuelas un C172 y la llegada pide FL210 en DARAN. ¿Qué haces?", opciones: ["Intentas subir de todos modos", "Pides que te bajen de las altitudes mínimas", "Contestas «imposible»: no puedes aceptar esa llegada", "No presentas plan"], correcta: 2 },
    ],
  },
  {
    id: "carta-sid",
    numero: 3,
    titulo: "Leer la carta de la SID",
    resumen: "Lee la salida LONKU 1D de MMGL: encabezado, recorrido, altitudes, velocidades y gradiente, y compárala con la salida convencional OVALI 1.",
    videoId: null,
    temas: [
      {
        id: "red-3-1",
        titulo: "El encabezado de la carta",
        clave: "Antes del dibujo: nombre, pistas, requisitos y fecha de vigencia.",
        texto: `Arriba de la carta está lo que decide si puedes volarla: el nombre (LONKU 1D, abreviado LONK1D), las pistas desde donde se usa (11L y 11R) y los requisitos: RNAV 1, GNSS y radar. También trae la fecha: si la tuya es distinta, manda la tuya, porque es la del ciclo vigente. Las cartas oficiales de México las publica SENEAM en la PIA; en la red se usan mucho las de Navigraph. ${carta("LONKU 1D")}`,
      },
      {
        id: "red-3-2",
        titulo: "El recorrido y sus restricciones",
        clave: "En GL405: a 9000 ft o más y a 220 kt o menos.",
        texto: "La LONKU 1D sale de la pista 11L o 11R con derrota 108° durante 16.2 NM hasta el punto GL405. Ahí hay dos restricciones: cruzarlo a 9000 ft o más y a no más de 220 kt. Luego sigue con derrota 098° durante 35 NM hasta LONKU, donde termina la salida. «A o arriba de» marca una altitud mínima; «MAX» marca una velocidad máxima. Las restricciones publicadas se cumplen aunque el controlador te haya autorizado a una altitud mayor, salvo que él mismo las cancele.",
        puntos: [
          { titulo: "Pista 11L/R → GL405", texto: "Derrota 108°, 16.2 NM. Cruzar a 9000 ft o más, máximo 220 kt." },
          { titulo: "GL405 → LONKU", texto: "Derrota 098°, 35 NM. Fin de la salida." },
        ],
      },
      {
        id: "red-3-3",
        titulo: "El gradiente de ascenso",
        clave: "3.6 % hasta 7000 ft: unos 220 ft por milla; a 80 kt de velocidad sobre el terreno son unos 290 ft/min.",
        texto: "La carta pide un gradiente de 3.6 % hasta 7000 ft. Un gradiente es cuántos pies subes por cada milla: 3.6 % son unos 220 ft por milla náutica. Para pasarlo a pies por minuto multiplicas por tu velocidad sobre el terreno y divides entre 60: a 80 kt son unos 290 ft/min; a 90 kt, unos 330 ft/min. Las cartas suelen traer una tabla con estos valores. MMGL está a 5013 ft de elevación, así que en un día caluroso tu avión sube menos: revisa con el manual de tu avión que puedes cumplirlo antes de aceptar la salida.",
      },
      {
        id: "red-3-4",
        titulo: "Climb via: ascender por la SID",
        clave: "Subes hasta la altitud autorizada respetando cada restricción de la salida.",
        texto: "Cuando te autorizan una SID con una altitud, subes hasta esa altitud cumpliendo las restricciones publicadas en el camino; en inglés se le dice «climb via SID». Si el controlador te dice que asciendas sin restricciones, entonces sí puedes ignorarlas. Si sabes que no vas a cumplir una restricción (por ejemplo, no llegar a 9000 ft en GL405), avisa antes: «imposible» es una respuesta válida y mucho mejor que salirte de la salida.",
      },
      {
        id: "red-3-5",
        titulo: "Contraste: la salida convencional OVALI 1",
        clave: "La RNAV sigue puntos del GPS; la convencional sigue radiales y distancias de un VOR.",
        texto: `La OVALI 1, también de las pistas 11L/R, se vuela con el VOR GDL (117.3): asciendes por el radial 108 de GDL hasta 16.0 DME, viras a la izquierda y mantienes rumbo 084°, tal cual, hasta interceptar el radial 101 de GDL, y lo sigues hasta OVALI. Pide 280 ft por milla (4.6 %) hasta 11 000 ft. Aquí no hay puntos de GPS que seguir: mientras vuelas los radiales 108 y 101, tú corriges el viento para mantenerte sobre ellos. Por eso la RNAV es más fácil de volar con precisión, pero la convencional te obliga a entender dónde estás. ${carta("OVALI 1")}`,
      },
    ],
    practica: [
      { id: "red-q3-1", pregunta: "En la LONKU 1D, ¿cómo cruzas GL405?", opciones: ["Exactamente a 9000 ft y 250 kt", "Abajo de 9000 ft", "A 9000 ft o más y a 220 kt o menos", "Como quieras, es solo una referencia"], correcta: 2 },
      { id: "red-q3-2", pregunta: "Un gradiente de 3.6 % a 90 kt sobre el terreno equivale más o menos a:", opciones: ["330 ft/min", "90 ft/min", "1000 ft/min", "3600 ft/min"], correcta: 0 },
      { id: "red-q3-3", pregunta: "¿Qué guía usa la salida OVALI 1?", opciones: ["Puntos RNAV", "El ILS de la pista 11", "Vectores de radar", "El radial y la distancia del VOR GDL"], correcta: 3 },
      { id: "red-q3-4", pregunta: "Te autorizaron a 12 000 ft por la LONKU 1D. ¿Qué haces con la restricción de GL405?", opciones: ["La ignoras porque ya tienes altitud", "La cumples, salvo que el controlador la cancele", "Te detienes en 9000 ft", "Pides otra salida"], correcta: 1 },
    ],
  },
  {
    id: "autorizacion",
    numero: 4,
    titulo: "La autorización (CRAFT)",
    resumen: "Pide tu autorización IFR en MMGL, anótala en orden CRAFT y colaciónala completa, con audios de práctica.",
    videoId: null,
    audioSetId: "autorizacion-ifr",
    temas: [
      {
        id: "red-4-1",
        titulo: "Pedir la autorización",
        clave: "Primero el ATIS (127.9), luego GUADALAJARA Clearance en 132.8.",
        texto: "En MMGL escucha primero el ATIS en 127.9 y anota la letra, la pista en uso y el QNH. Luego llama a autorizaciones en 132.8 (en la carta aparece como GUADALAJARA Clearance) con lo que necesita saber: tu callsign, tu avión, dónde estás, la letra del ATIS, tu destino y que pides autorización IFR. Por ejemplo: «Guadalajara Autorizaciones, XB-VNA, Cessna 172 en plataforma de aviación general, con información Alfa, solicito autorización IFR a Ciudad de México».",
      },
      {
        id: "red-4-2",
        titulo: "CRAFT, letra por letra",
        clave: "Límite, Ruta, Altitud, Frecuencia y Transpondedor: siempre en ese orden.",
        texto: "La autorización llega casi siempre en el mismo orden, y CRAFT te ayuda a esperarlo: C, el límite de la autorización (Ciudad de México o MMMX); R, la ruta, que empieza con la salida (por ejemplo LONKU 1D) y sigue «ruta del plan de vuelo»; A, la altitud inicial y, a veces, cuándo esperar una mayor; F, la frecuencia de salida; T, el código del transpondedor. Si una parte no llega, pregúntala antes de colacionar.",
        puntos: [
          { titulo: "C · Límite", texto: "Hasta dónde vas autorizado: Ciudad de México (MMMX)." },
          { titulo: "R · Ruta", texto: "La SID (LONKU 1D o LONKU 1E) y luego la ruta del plan." },
          { titulo: "A · Altitud", texto: "La altitud inicial y, si la dan, cuándo esperar una mayor." },
          { titulo: "F · Frecuencia", texto: "A quién llamas después de despegar." },
          { titulo: "T · Transpondedor", texto: "El código de cuatro dígitos." },
        ],
      },
      {
        id: "red-4-3",
        titulo: "Anotarla",
        clave: "Prepara la hoja CRAFT antes de llamar y escribe con abreviaturas.",
        texto: "Imprime la hoja ATIS/CRAFT de Descargas o dibuja cinco renglones con C, R, A, F y T. Antes de llamar ya puedes llenar lo que esperas (destino, la SID probable según la pista del ATIS); así solo escuchas lo que cambia. Usa abreviaturas (los valores son de ejemplo): «MMMX», «LONK1D», «12000», «124.5», «4521». No transmitas mientras te leen la autorización y no intentes memorizarla: escribe.",
      },
      {
        id: "red-4-4",
        titulo: "Colacionar",
        clave: "Repite todo en el mismo orden y termina con tu callsign.",
        texto: "Colacionar es leer de vuelta la autorización completa, en el mismo orden, para que el controlador confirme que la copiaste bien. Termina con tu callsign: «Autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga 12 000 pies, frecuencia de salida 124.5, transpondedor 4521, XB-VNA» (altitud, frecuencia y código de ejemplo). El controlador responde «colación correcta» o te corrige. Si dudaste de un dato, pídelo: «repita la frecuencia de salida». En la prueba final, colacionar mal la autorización es uno de los tres motivos de no aprobar.",
      },
    ],
    practica: [
      { id: "red-q4-1", pregunta: "¿En qué frecuencia pides la autorización IFR en MMGL?", opciones: ["132.8", "121.9", "118.1", "127.9"], correcta: 0 },
      { id: "red-q4-2", pregunta: "En CRAFT, ¿qué es la «A»?", opciones: ["El aeropuerto alterno", "La aerovía", "El ATIS", "La altitud"], correcta: 3 },
      { id: "red-q4-3", pregunta: "¿Cómo terminas la colación?", opciones: ["Con «cambio»", "Con tu callsign", "Con la letra del ATIS", "No hace falta terminarla"], correcta: 1 },
      { id: "red-q4-4", pregunta: "No entendiste la frecuencia de salida. ¿Qué haces?", opciones: ["Colacionas una al azar", "La buscas después en el aire", "Pides «repita la frecuencia de salida»", "Omites esa parte"], correcta: 2 },
    ],
  },
  {
    id: "sid-garmin",
    numero: 5,
    titulo: "Volar la SID con el G1000",
    resumen: "En el C172 XB-VNA: carga la salida en el GPS, revísala contra la carta y vuélala con y sin piloto automático.",
    videoId: null,
    temas: [
      {
        id: "red-5-1",
        titulo: "Del ATIS a la pista",
        clave: "Rampa al moverte en la plataforma, Rodaje para ir a la pista y Torre para despegar.",
        texto: "Con la autorización colacionada, el transpondedor con tu código y la salida cargada, pides moverte. En MMGL se llama a Rampa (134.1) al entrar o salir de las plataformas; en la plataforma comercial los aviones salen remolcados, así que en el simulador usa el remolque. Luego Rodaje (121.9) te lleva a la pista y Torre (118.1) te autoriza a despegar. MMGL tiene dos pistas paralelas: 11L/29R y 11R/29L. Revisa que la pista de tu autorización sea la misma que cargaste en el GPS.",
      },
      {
        id: "red-5-2",
        titulo: "Cargar la salida y revisarla contra la carta",
        clave: "Carga la LONKU 1D para tu pista y compara cada punto, rumbo, distancia y restricción con la carta.",
        texto: "En el G1000, desde el menú de procedimientos eliges salida, el aeropuerto MMGL, la LONK1D y la pista que te asignaron (11L u 11R), y la cargas en el plan de vuelo. Después la revisas contra la carta: que aparezca GL405 y luego LONKU, con derrota 108° y luego 098°, y las distancias de 16.2 y 35 NM. Compara la restricción de altitud de GL405 (9000 ft o más); el GPS no te avisa de la velocidad máxima de 220 kt, así que anótala tú (el C172 vuela muy por debajo, pero en un jet importa). Antes de despegar, la fuente de navegación debe ser GPS, no VOR.",
      },
      {
        id: "red-5-3",
        titulo: "El gradiente en un C172",
        clave: "Si tu avión no cumple el gradiente o las restricciones, di «imposible» antes de salir.",
        texto: `La LONKU 1D pide 3.6 % hasta 7000 ft y cruzar GL405 a 9000 ft o más. Desde 5013 ft de elevación, eso son casi 4000 ft en 16 millas. Con la tabla de la carta y tu velocidad sobre el terreno calcula los pies por minuto que necesitas y compáralos con lo que sube tu C172 ese día con su peso y temperatura. La LONKU 1E, de las pistas 29, es mucho más exigente: 4.0 % hasta 7400 ft, 5.1 % hasta 12 000 ft y cruzar GL710 a 7800 ft o más (máximo 220 kt), GL720 a 12 000 ft o más y GL726 a 15 000 ft o más. Eso queda fuera de lo que hace un C172. Si te la asignan, contesta «imposible» y pide otra salida o vectores. ${carta("LONKU 1E")}`,
      },
      {
        id: "red-5-4",
        titulo: "Volarla a mano",
        clave: "Sigue la aguja magenta, sube con Vy y vigila GL405.",
        texto: "Después del despegue, mantén el avión centrado en la derrota de 108° siguiendo la aguja del GPS, y sube a la velocidad de mejor ascenso (Vy) de tu manual. Si el gradiente te queda justo, usa la velocidad de mejor ángulo (Vx), que da más altura por milla, hasta librar la restricción. Vigila la distancia a GL405 y tu altitud: tienes que pasar 9000 ft antes de llegar. Si ves que no vas a llegar, avísale al controlador de inmediato. Al pasar GL405 el GPS cambia solo al tramo de 098° hacia LONKU; anticipa el viraje y corrige el viento para mantener la aguja centrada.",
      },
      {
        id: "red-5-5",
        titulo: "Volarla con piloto automático",
        clave: "Modo NAV con fuente GPS para la ruta y la altitud autorizada en el selector.",
        texto: "Cuando ya vas estable y a una altura segura, conecta el piloto automático en modo NAV con la fuente en GPS para que siga la salida. Para subir usa el modo de velocidad vertical o de velocidad de ascenso, con la altitud autorizada en el selector. El piloto automático sube hasta esa altitud, no hasta la restricción de GL405: tú vigilas que cruces GL405 a 9000 ft o más. Si el controlador te da un rumbo, cambia a modo HDG; si te manda directo a un punto, usa la función directo del GPS y vuelve a NAV.",
      },
    ],
    practica: [
      { id: "red-q5-1", pregunta: "¿Qué fuente de navegación debes tener antes de despegar en la LONKU 1D?", opciones: ["VOR 1", "ADF", "GPS", "Ninguna"], correcta: 2 },
      { id: "red-q5-2", pregunta: "Te asignan la LONKU 1E y vuelas un C172. ¿Qué haces?", opciones: ["Contestas «imposible» y pides otra salida o vectores", "La aceptas y ves qué pasa", "Vuelas la LONKU 1D sin decir nada", "Despegas sin salida"], correcta: 0 },
      { id: "red-q5-3", pregunta: "Con piloto automático y 12 000 ft en el selector, ¿quién vigila la restricción de GL405?", opciones: ["El piloto automático", "Nadie, no aplica", "El controlador", "Tú"], correcta: 3 },
      { id: "red-q5-4", pregunta: "¿A quién llamas para salir de la plataforma en MMGL?", opciones: ["Torre, 118.1", "Rampa, 134.1", "Autorizaciones, 132.8", "ATIS, 127.9"], correcta: 1 },
    ],
  },
  {
    id: "sid-fms",
    numero: 6,
    titulo: "Lo mismo en un FMS",
    resumen: "Para quien vuela jets: carga la salida a mano en el CDU/FMC con la lógica común a todos y revisa lo que SimBrief carga solo.",
    videoId: null,
    temas: [
      {
        id: "red-6-1",
        titulo: "La lógica común de un FMS",
        clave: "Todos piden lo mismo: origen y destino, ruta, salida y llegada; cambian los nombres de las páginas.",
        texto: "Fenix, PMDG y casi cualquier jet de simulador siguen la misma lógica: primero origen, destino y ruta; luego la salida y la llegada en una página de procedimientos (en Boeing se llama DEP/ARR; en Airbus entras desde el aeropuerto de origen en el plan de vuelo); al final revisas la lista de puntos del plan (LEGS en Boeing, el F-PLN en Airbus). Aquí no hay un tutorial por avión: aprende el orden y lo aplicas en el tuyo con su manual.",
      },
      {
        id: "red-6-2",
        titulo: "Pista, salida y transición",
        clave: "Elige primero la pista asignada, luego la SID y, si existe, la transición que conecta con tu ruta.",
        texto: "En la página de salidas elige primero la pista que te asignaron (11L, 11R, 29L o 29R): así el FMS solo te muestra las salidas válidas para ella. Luego elige la SID de tu autorización (LONK1D para las 11, LONK1E para las 29) y, si la salida tiene transiciones, la que conecta con tu ruta. Confirma el cambio (EXEC en Boeing, INSERT en Airbus). Si la pista o la SID cambian en tierra, repites este paso; no basta con cambiar solo una de las dos.",
      },
      {
        id: "red-6-3",
        titulo: "Revisar los puntos contra la carta",
        clave: "Punto por punto: nombre, derrota, distancia, altitud y velocidad; y ninguna discontinuidad sin revisar.",
        texto: "Ahora abre la lista de puntos y compárala con la carta. En la LONKU 1D: GL405 con 9000 ft o más y máximo 220 kt, luego LONKU. En la LONKU 1E: GL710 con 7800 ft o más y máximo 220 kt, GL720 con 12 000 ft o más, GL726 con 15 000 ft o más, luego LONKU. Si aparece una discontinuidad (un hueco en el plan), no la borres sin pensar: revisa qué punto sigue y si de verdad conecta con la ruta. Pon la altitud autorizada en el panel del piloto automático, no la de crucero.",
      },
      {
        id: "red-6-4",
        titulo: "Cuando SimBrief lo carga solo",
        clave: "SimBrief carga lo que eligió él; el controlador manda.",
        texto: "Al importar el plan de SimBrief, el FMS puede traer ya una pista y una salida. Esa fue la elección de SimBrief, no la del controlador. Revisa cuatro cosas: que la pista y la SID sean las de tu autorización; que el ciclo de navegación del FMS coincida con tus cartas; que la ruta no tenga puntos repetidos ni discontinuidades raras al final de la salida; y que la llegada no esté cargada antes de tiempo con una pista que no es la del ATIS de destino.",
      },
    ],
    practica: [
      { id: "red-q6-1", pregunta: "¿Qué eliges primero en la página de salidas?", opciones: ["La pista asignada", "La transición", "La llegada", "El nivel de crucero"], correcta: 0 },
      { id: "red-q6-2", pregunta: "Aparece una discontinuidad al final de la salida. ¿Qué haces?", opciones: ["La borras sin mirar", "La dejas y despegas", "Apagas el FMS", "Revisas qué punto sigue y si conecta con la ruta"], correcta: 3 },
      { id: "red-q6-3", pregunta: "SimBrief cargó la LONKU 1D, pero te autorizaron la LONKU 1E desde la 29R. ¿Qué haces?", opciones: ["Vuelas la que cargó SimBrief", "Cambias pista y salida a las de la autorización y revisas los puntos", "Solo cambias la pista", "Pides que te cambien la autorización"], correcta: 1 },
      { id: "red-q6-4", pregunta: "¿Qué altitud pones en el panel del piloto automático al salir?", opciones: ["La de crucero", "La de la restricción de GL405", "La autorizada", "La elevación del aeropuerto"], correcta: 2 },
    ],
  },
  {
    id: "ruta-llegada",
    numero: 7,
    titulo: "En ruta y llegada",
    resumen: "Cambios de frecuencia, la llegada DARAN 3A a MMMX y qué hacer cuando el controlador te da vectores o cambia algo.",
    videoId: null,
    temas: [
      {
        id: "red-7-1",
        titulo: "Cambios de frecuencia",
        clave: "Colaciona la frecuencia y, en la nueva, di quién eres y tu altitud.",
        texto: "En ruta pasas de un controlador a otro. Cuando te digan «contacte a México Control en…», colaciona la frecuencia con tu callsign, cámbiala y, en la nueva, haz tu primera llamada: a quién llamas, tu callsign y tu altitud o nivel (y el autorizado, si vas subiendo o bajando). Si nadie contesta en la nueva frecuencia, vuelve a la anterior y avisa. Antes de llegar escucha el ATIS de MMMX en 127.65 para saber la pista en uso y el QNH.",
      },
      {
        id: "red-7-2",
        titulo: "La llegada DARAN 3A",
        clave: "De DARAN a UKTEN, bajando y frenando punto por punto.",
        texto: `La DARAN 3A sirve a las pistas 05L/R de MMMX y pide RNAV 1, GNSS y radar. Empieza en DARAN, que se cruza entre FL210 y FL230. Sigue a MX750 (máximo 250 kt, 17 000 ft), MX752 (máximo 230 kt, 17 000 ft), MX754 y MX756 (17 000 ft), ALMIS (máximo 210 kt, 14 000 ft) y termina en UKTEN (máximo 210 kt, 12 500 ft), donde empieza la aproximación. En la carta revisa si cada altitud es «a», «a o arriba» o «a o abajo». ${carta("DARAN 3A")}`,
        puntos: [
          { titulo: "DARAN", texto: "Entre FL210 y FL230." },
          { titulo: "MX750 · MX752", texto: "17 000 ft; máximo 250 kt y luego 230 kt." },
          { titulo: "MX754 · MX756", texto: "17 000 ft." },
          { titulo: "ALMIS", texto: "14 000 ft, máximo 210 kt." },
          { titulo: "UKTEN", texto: "12 500 ft, máximo 210 kt. Inicio de la aproximación." },
        ],
      },
      {
        id: "red-7-3",
        titulo: "Altímetro y nivel de transición",
        clave: "Al bajar del FL195 en MMMX, pon el QNH en pulgadas.",
        texto: "En México el nivel de transición de MMMX es FL195: arriba vuelas con 29.92, y al bajar de ese nivel pones el QNH del ATIS. En MMMX el altímetro se da en pulgadas de mercurio (en milibares solo si lo pides). Ciudad de México está a 7297 ft de elevación: si olvidas el QNH, tu altitud puede estar varios cientos de pies equivocada justo donde el terreno está más cerca.",
      },
      {
        id: "red-7-4",
        titulo: "Vectores y cambios del controlador",
        clave: "Con vectores vuelas el rumbo exacto y no regresas a la llegada hasta que te lo digan.",
        texto: "La carta de la DARAN 3A dibuja una zona de posibles trayectorias hacia ALMIS: ahí el controlador puede sacarte de la llegada con vectores para ordenar el tránsito. Si te da un rumbo, colaciónalo, vuélalo exacto (en el piloto automático, modo HDG) y mantén la altitud asignada. No vuelvas a la llegada por tu cuenta: espera «proceda directo a ALMIS» o que te diga que reanudes la llegada. En un C172 no llegas a las altitudes de la DARAN 3A, y esas altitudes existen por el terreno (altitudes mínimas de sector de 12 100, 14 800 y 19 400 ft): el controlador no puede darte vectores por debajo de las altitudes mínimas. Si tu avión no puede cumplir las restricciones, contestas «imposible» y no puedes aceptar esa llegada.",
      },
    ],
    practica: [
      { id: "red-q7-1", pregunta: "¿Entre qué niveles se cruza DARAN?", opciones: ["Entre FL100 y FL120", "Exactamente FL195", "Entre FL210 y FL230", "Abajo de 17 000 ft"], correcta: 2 },
      { id: "red-q7-2", pregunta: "Te dan vectores dentro de la zona hacia ALMIS. ¿Cuándo regresas a la llegada?", opciones: ["Cuando el controlador te mande directo o te diga que la reanudes", "Cuando tú quieras", "Al llegar a 17 000 ft", "Nunca"], correcta: 0 },
      { id: "red-q7-3", pregunta: "¿Cuándo pones el QNH bajando hacia MMMX?", opciones: ["Al despegar de MMGL", "Al aterrizar", "En UKTEN", "Al bajar del nivel de transición, FL195"], correcta: 3 },
      { id: "red-q7-4", pregunta: "¿En qué frecuencia escuchas el ATIS de MMMX?", opciones: ["127.9", "127.65", "132.8", "118.55"], correcta: 1 },
    ],
  },
  {
    id: "aproximacion",
    numero: 8,
    titulo: "La aproximación sin ILS",
    resumen: "Vuela la RNP Y Rwy 05R a MMMX: recorrido, altitud obligatoria, mínimos LNAV/VNAV y LNAV, y la aproximación frustrada.",
    videoId: null,
    temas: [
      {
        id: "red-8-1",
        titulo: "Qué es la RNP Y Rwy 05R",
        clave: "Una aproximación por GPS a la 05R, sin ILS; su guía vertical LNAV/VNAV se calcula con el altímetro.",
        texto: `La RNP Y Rwy 05R es una aproximación por satélite a la pista 05R de MMMX. Pide GNSS y tramos curvos (RF), y no usa antenas de ILS en la pista: la guía lateral sale del GPS. La guía vertical de los mínimos LNAV/VNAV es baro-VNAV: el sistema la calcula con el altímetro, así que depende de que tengas el QNH correcto y de la temperatura. En el simulador el GPS puede mostrarte una senda igual; la regla de la carta es la que manda. La «Y» indica que hay otra aproximación del mismo tipo a esa pista. En el C172 la cargas desde el menú de procedimientos, en la opción de aproximación: MMMX, RNP Y Rwy 05R, con UKTEN como punto de inicio, y la revisas contra la carta igual que la salida. ${carta("RNP Y Rwy 05R")}`,
      },
      {
        id: "red-8-2",
        titulo: "El recorrido",
        clave: "UKTEN a 12 500 ft, MX960 a 10 000 ft, y MX900 a 8900 ft obligatorios.",
        texto: "Desde UKTEN (inicio de la aproximación, máximo 210 kt, 12 500 ft) vas con derrota 175° a MX960 (máximo 185 kt, 10 000 ft); revisa en la carta si esas dos altitudes son «a» o «a o arriba». Ahí viras a la derrota final de 055° y vuelas 4.6 NM a MX962, que se cruza entre 8900 y 9300 ft y a 160 kt o más. 1.4 NM después está MX900, el punto de aproximación final, a 8900 ft: la altitud es obligatoria. De ahí faltan 4.7 NM a la pista con una senda de 3.09°. Si tu avión no puede cumplir una velocidad (un C172 no llega a 160 kt), avísale al controlador.",
        puntos: [
          { titulo: "UKTEN", texto: "12 500 ft, máximo 210 kt. Derrota 175°." },
          { titulo: "MX960", texto: "10 000 ft, máximo 185 kt. Viraje a 055°." },
          { titulo: "MX962", texto: "Entre 8900 y 9300 ft, mínimo 160 kt." },
          { titulo: "MX900", texto: "8900 ft obligatorios. Punto de aproximación final." },
          { titulo: "Pista 05R", texto: "4.7 NM después, senda de 3.09°." },
        ],
      },
      {
        id: "red-8-3",
        titulo: "Mínimos: LNAV/VNAV y LNAV",
        clave: "LNAV/VNAV: decides a 7800 ft. Solo LNAV: no bajas de 7920 ft.",
        texto: "La carta trae dos mínimos. Con guía vertical (LNAV/VNAV) bajas por la senda hasta la altitud de decisión de 7800 ft (511 ft sobre la pista): si ahí no ves la pista, frustras. Esa senda es baro-VNAV, calculada con el altímetro: con mucho frío la senda real queda más baja que la publicada, y con mucho calor, más alta. Por eso el mínimo LNAV/VNAV solo vale con temperatura entre 0 °C y 34 °C; fuera de ese rango usas el LNAV. Sin guía vertical (LNAV) bajas hasta la altitud mínima de descenso de 7920 ft (631 ft sobre la pista) y te mantienes nivelado hasta ver la pista o llegar al punto de frustrada. Para revisar la senda, la carta da altitudes de control: 8670 ft a 4.0 NM, 8340 ft a 3.0 NM y 8010 ft a 2.0 NM de la pista.",
      },
      {
        id: "red-8-4",
        titulo: "La aproximación frustrada",
        clave: "Sube con derrota 055° a MX949 y sigue la frustrada hasta EPRIM.",
        texto: "Si no ves la pista en el mínimo, frustras de inmediato: potencia, actitud de ascenso y avisas «frustrando». La carta dice que asciendas con derrota 055° hasta MX949 y sigas la frustrada hasta EPRIM, y luego lo que diga el controlador. El recorrido pasa por MX949, MX950 (máximo 185 kt), MX740 y MX951 hasta EPRIM (12 500 ft, máximo 210 kt), que también es inicio de aproximación desde el sur. Cárgala en tu cabeza antes de empezar la aproximación: es el peor momento para leer la carta por primera vez.",
      },
      {
        id: "red-8-5",
        titulo: "Las frecuencias de MMMX",
        clave: "ATIS 127.65; Llegadas, Aproximación y Radar; Torre 118.55 o 118.7.",
        texto: "En MMMX hay varias posiciones: ATIS en 127.65; México Llegadas (norte 129.65, sur 119.1); México Aproximación (121.2 o 119.75); México Radar (119.25); Torre (118.55 o 118.7) y Rodaje (norte 121.85, sur 121.0). En la red solo estarán las que tenga conectadas el controlador; si una no está, la siguiente de arriba atiende su espacio. Escríbelas en tu hoja antes de empezar el descenso.",
      },
    ],
    practica: [
      { id: "red-q8-1", pregunta: "¿Cómo cruzas MX900?", opciones: ["A 8900 ft: la altitud es obligatoria", "A 8900 ft o más", "Abajo de 8900 ft", "A 12 500 ft"], correcta: 0 },
      { id: "red-q8-2", pregunta: "Hace 36 °C en MMMX. ¿Qué mínimo usas?", opciones: ["LNAV/VNAV, 7800 ft", "El de ILS", "Ninguno, no importa", "LNAV, 7920 ft"], correcta: 3 },
      { id: "red-q8-3", pregunta: "Llegas a 7800 ft con LNAV/VNAV y no ves la pista. ¿Qué haces?", opciones: ["Sigues bajando un poco", "Frustras: derrota 055° hacia MX949", "Te nivelas y esperas", "Viras a la izquierda"], correcta: 1 },
      { id: "red-q8-4", pregunta: "A 3.0 NM de la pista, ¿a qué altitud deberías ir en la senda?", opciones: ["8010 ft", "8670 ft", "8340 ft", "8900 ft"], correcta: 2 },
    ],
  },
];

export function leccionRed(id: string): LeccionRed | undefined {
  return LECCIONES_RED.find((l) => l.id === id);
}
