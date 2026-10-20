import type { PhraseologyCard } from "../features/academia/AudioPhraseology";

export const FRASEOLOGIA_RODAJE_DESPEGUE: PhraseologyCard[] = [
  {
    situacion: "Acabas de encender el motor y quieres solicitar la información meteorológica antes de pedir rodaje.",
    callout: "Guadalajara Torre, XB-VLA, solicito información Alfa.",
    audioUrl: "/audio/fraseologia/rodaje-1.mp3",
    elementos: [
      { descripcion: "A quién llamas (Torre)", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
      { descripcion: "Qué solicitas (información ATIS)", palabrasClave: ["información alfa", "informacion alfa", "solicito información", "solicito informacion"] },
    ],
  },
  {
    situacion: "Ya tienes la información ATIS y estás listo para pedir rodaje hacia la pista activa.",
    callout: "Guadalajara Torre, XB-VLA, plataforma de aviación general, solicito rodaje, con información Alfa.",
    audioUrl: "/audio/fraseologia/rodaje-2.mp3",
    elementos: [
      { descripcion: "A quién llamas", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
      { descripcion: "Tu posición", palabrasClave: ["plataforma", "aviación general", "aviacion general"] },
      { descripcion: "Qué necesitas (rodaje)", palabrasClave: ["rodaje"] },
      { descripcion: "Confirmas información recibida", palabrasClave: ["información alfa", "informacion alfa"] },
    ],
  },
  {
    situacion: "La torre te autoriza a rodar, indicando la ruta y un punto donde debes mantenerte corto.",
    callout: "XB-VLA, ruede a pista 20 por calle Alfa, mantenga corto de pista 02.",
    audioUrl: "/audio/fraseologia/rodaje-3.mp3",
    elementos: [
      { descripcion: "Repites la ruta exacta", palabrasClave: ["calle alfa", "pista 20", "pista veinte", "pista dos cero", "pista 2 cero", "pista 2 0"] },
      { descripcion: "Repites el punto de espera (hold short)", palabrasClave: ["corto de pista 02", "corto de pista cero dos", "mantenga corto"] },
      { descripcion: "Dices tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
    ],
  },
  {
    situacion: "Terminaste tu run-up y checklist previa, y estás listo para solicitar la pista.",
    callout: "Torre, XB-VLA, listo para despegue, pista 20.",
    audioUrl: "/audio/fraseologia/rodaje-4.mp3",
    elementos: [
      { descripcion: "A quién llamas", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
      { descripcion: "Qué solicitas", palabrasClave: ["listo para despegue"] },
      { descripcion: "Pista", palabrasClave: ["pista 20", "pista veinte", "pista dos cero", "pista 2 cero", "pista 2 0"] },
    ],
  },
  {
    situacion: "La torre te autoriza a despegar, indicando el viento actual.",
    callout: "Autorizado a despegar pista 20, XB-VLA.",
    audioUrl: "/audio/fraseologia/rodaje-5.mp3",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a despegar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte", "pista dos cero", "pista 2 cero", "pista 2 0"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
    ],
  },
];

export const FRASEOLOGIA_EMERGENCIAS_APROXIMACION: PhraseologyCard[] = [
  {
    situacion: "Aproximación te da vectores y una altitud para secuenciarte con tráfico al frente.",
    callout: "Vire rumbo 180, descienda y mantenga cinco mil pies, espere vectores para secuencia visual, XB-VLA.",
    audioUrl: "/audio/fraseologia/emergencia-1.mp3",
    elementos: [
      { descripcion: "Repites rumbo", palabrasClave: ["rumbo 180", "rumbo uno ochenta", "vire rumbo"] },
      { descripcion: "Repites altitud", palabrasClave: ["cinco mil pies", "5000 pies", "mantenga cinco mil"] },
      { descripcion: "Confirmas que entendiste la secuencia", palabrasClave: ["vectores", "secuencia visual", "espere vectores"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
    ],
  },
  {
    situacion: "El controlador te reporta tráfico y necesitas confirmar cuando lo tengas a la vista.",
    callout: "Tráfico a la vista, XB-VLA.",
    audioUrl: "/audio/fraseologia/emergencia-2.mp3",
    elementos: [
      { descripcion: "Confirmas que ves el tráfico", palabrasClave: ["tráfico a la vista", "trafico a la vista"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
    ],
  },
  {
    situacion: "Estás en tramo final y la torre te autoriza a aterrizar.",
    callout: "Autorizado a aterrizar pista 20, XB-VLA.",
    audioUrl: "/audio/fraseologia/emergencia-3.mp3",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a aterrizar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte", "pista dos cero", "pista 2 cero", "pista 2 0"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
    ],
  },
  {
    situacion: "Tienes un pasajero con un malestar que no representa peligro inmediato, pero quieres que control lo sepa.",
    callout: "PAN-PAN, PAN-PAN, PAN-PAN, XB-VLA, pasajero con malestar médico, solicito prioridad para aterrizar, posición 10 millas al sur de Guadalajara, cinco mil pies, dos almas a bordo.",
    audioUrl: "/audio/fraseologia/emergencia-4.mp3",
    elementos: [
      { descripcion: "PAN-PAN repetido 3 veces", palabrasClave: ["pan-pan", "pan pan"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
      { descripcion: "Naturaleza de la urgencia", palabrasClave: ["malestar médico", "malestar medico", "pasajero con malestar"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas al sur", "cinco mil pies"] },
      { descripcion: "Almas a bordo", palabrasClave: ["almas a bordo"] },
    ],
  },
  {
    situacion: "El motor falla en vuelo y necesitas declarar una emergencia grave e inminente.",
    callout: "MAYDAY, MAYDAY, MAYDAY, XB-VLA, falla de motor, posición 5 millas al norte de Manzanillo, tres mil pies, dos almas a bordo, combustible una hora, intento aterrizaje forzado en carretera.",
    audioUrl: "/audio/fraseologia/emergencia-5.mp3",
    elementos: [
      { descripcion: "MAYDAY repetido 3 veces", palabrasClave: ["mayday"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel", "exhebra", "extre", "extray"] },
      { descripcion: "Naturaleza de la emergencia", palabrasClave: ["falla de motor"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas al norte", "tres mil pies"] },
      { descripcion: "Almas a bordo", palabrasClave: ["almas a bordo"] },
      { descripcion: "Combustible restante", palabrasClave: ["combustible una hora", "combustible"] },
      { descripcion: "Tus intenciones", palabrasClave: ["aterrizaje forzado", "carretera"] },
    ],
  },
];

const XB_VNA = ["xb vna", "xb-vna", "xbvna", "x-ray bravo", "x ray bravo", "xray bravo", "victor november alfa", "victor noviembre alfa", "november alfa", "noviembre alfa"];

// Ruta "Listo para volar en red": SID reales de MMGL (Jeppesen 10-3D y 10-3E vía Navigraph).
// Frecuencia de salida, altitud y código son de ejemplo; GUADALAJARA Clearance 132.8 es real.
export const FRASEOLOGIA_AUTORIZACION_IFR: PhraseologyCard[] = [
  {
    situacion: "Estás en MMGL con el C172 XB-VNA, pista 11R en uso. En 132.8 (GUADALAJARA Clearance) te leen tu autorización IFR a Ciudad de México. Colaciónala completa, en orden CRAFT. Frecuencia de salida, altitud y código son de ejemplo.",
    callout: "Autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga 12 000 pies, frecuencia de salida 124.5, transpondedor 4521, XB-VNA.",
    elementos: [
      { descripcion: "Límite de la autorización (Ciudad de México)", palabrasClave: ["ciudad de mexico", "mexico", "mmmx"] },
      { descripcion: "Ruta: la SID LONKU 1D", palabrasClave: ["lonku 1d", "lonku uno delta", "lonku 1 delta", "uno delta", "1 delta", "1d"] },
      { descripcion: "Altitud: 12 000 pies", palabrasClave: ["12 000", "12000", "12,000", "doce mil"] },
      { descripcion: "Frecuencia de salida: 124.5", palabrasClave: ["124.5", "124 5", "1245", "uno dos cuatro decimal cinco", "ciento veinticuatro punto cinco"] },
      { descripcion: "Transpondedor: 4521", palabrasClave: ["4521", "45 21", "cuatro cinco dos uno"] },
      { descripcion: "Tu identificación", palabrasClave: XB_VNA },
    ],
  },
  {
    situacion: "Mismo vuelo en otro día: pista 11L en uso. La autorización cambia de altitud, frecuencia y código. Colaciónala completa. Frecuencia de salida, altitud y código son de ejemplo.",
    callout: "Autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga 11 000 pies, frecuencia de salida 120.8, transpondedor 3164, XB-VNA.",
    elementos: [
      { descripcion: "Límite de la autorización (Ciudad de México)", palabrasClave: ["ciudad de mexico", "mexico", "mmmx"] },
      { descripcion: "Ruta: la SID LONKU 1D", palabrasClave: ["lonku 1d", "lonku uno delta", "lonku 1 delta", "uno delta", "1 delta", "1d"] },
      { descripcion: "Altitud: 11 000 pies", palabrasClave: ["11 000", "11000", "11,000", "once mil"] },
      { descripcion: "Frecuencia de salida: 120.8", palabrasClave: ["120.8", "120 8", "1208", "uno dos cero decimal ocho", "ciento veinte punto ocho"] },
      { descripcion: "Transpondedor: 3164", palabrasClave: ["3164", "31 64", "tres uno seis cuatro"] },
      { descripcion: "Tu identificación", palabrasClave: XB_VNA },
    ],
  },
  {
    situacion: "Vuelas un jet (lección 6) desde MMGL con pistas 29L/R en uso; tu callsign de ejemplo es XB-VNA. Te autorizan con la SID de las pistas 29. Colaciónala completa. Frecuencia de salida, nivel y código son de ejemplo.",
    callout: "Autorizado a Ciudad de México, salida LONKU 1E, luego ruta del plan de vuelo, ascienda y mantenga nivel de vuelo 200, frecuencia de salida 124.5, transpondedor 5612, XB-VNA.",
    elementos: [
      { descripcion: "Límite de la autorización (Ciudad de México)", palabrasClave: ["ciudad de mexico", "mexico", "mmmx"] },
      { descripcion: "Ruta: la SID LONKU 1E", palabrasClave: ["lonku 1e", "lonku uno eco", "lonku 1 eco", "uno eco", "1 eco", "1e"] },
      { descripcion: "Nivel: nivel de vuelo 200", palabrasClave: ["nivel de vuelo 200", "nivel 200", "nivel de vuelo dos cero cero", "fl200"] },
      { descripcion: "Frecuencia de salida: 124.5", palabrasClave: ["124.5", "124 5", "1245", "uno dos cuatro decimal cinco", "ciento veinticuatro punto cinco"] },
      { descripcion: "Transpondedor: 5612", palabrasClave: ["5612", "56 12", "cinco seis uno dos"] },
      { descripcion: "Tu identificación", palabrasClave: XB_VNA },
    ],
  },
  {
    situacion: "De vuelta en el C172, pista 11R. El controlador te autoriza al aeropuerto de destino por su indicativo OACI y te pide esperar un nivel mayor más tarde. Colaciónala completa. Frecuencia de salida, altitudes y código son de ejemplo.",
    callout: "Autorizado a MMMX, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga 10 000 pies, espere 12 000 pies diez minutos después de la salida, frecuencia de salida 120.8, transpondedor 2207, XB-VNA.",
    elementos: [
      { descripcion: "Límite de la autorización (MMMX)", palabrasClave: ["mmmx", "mike mike mike x-ray", "ciudad de mexico", "mexico"] },
      { descripcion: "Ruta: la SID LONKU 1D", palabrasClave: ["lonku 1d", "lonku uno delta", "lonku 1 delta", "uno delta", "1 delta", "1d"] },
      { descripcion: "Altitud: 10 000 pies, y esperar 12 000", palabrasClave: ["10 000", "10000", "10,000", "diez mil"] },
      { descripcion: "Frecuencia de salida: 120.8", palabrasClave: ["120.8", "120 8", "1208", "uno dos cero decimal ocho", "ciento veinte punto ocho"] },
      { descripcion: "Transpondedor: 2207", palabrasClave: ["2207", "22 07", "dos dos cero siete"] },
      { descripcion: "Tu identificación", palabrasClave: XB_VNA },
    ],
  },
];

/** Tandas de fraseología que puede pedir una actividad de la Academia. */
export const AUDIO_SETS: Record<string, PhraseologyCard[]> = {
  "rodaje-despegue": FRASEOLOGIA_RODAJE_DESPEGUE,
  "emergencias-aproximacion": FRASEOLOGIA_EMERGENCIAS_APROXIMACION,
  "autorizacion-ifr": FRASEOLOGIA_AUTORIZACION_IFR,
};
