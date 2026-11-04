import type { Guia } from "../../features/aeropuertos/GuiaAeropuerto";
import { ROUTES } from "../../lib/routes";

// Datos: salidas, los mismos de la ruta "Listo para volar en red" (cartas Jeppesen vía Navigraph, confirmadas por
// el fundador el 2026-10-19; ver CARTAS_RED en src/data/rutaRed.ts). Frecuencias, llegadas (10-2B a 10-2E) y
// aproximaciones ILS Z (11-1 y 11-3): leídas en Navigraph el 2026-11-03. Puntos VFR: carta de aproximación visual
// MMGL-VAC-2/VAC-3 del AIP de México (SENEAM, AIRAC 10/15); el fundador confirmó con IVAO y VATSIM el 2026-11-04 que
// siguen en uso. Rumbo y distancia de cada punto: medidos sobre la carta, aproximados. Si una carta cambia, cambia aquí.

export const MMGL: Guia = {
  icao: "MMGL",
  ruta: ROUTES.aeropuertoMMGL,
  hero: {
    titulo: "Guadalajara MMGL: sal y llega sin trabarte en la radio",
    descripcion:
      "Cada llamada de la salida IFR en orden: a quién le hablas, qué te van a decir y qué contestas. Con las salidas, las llegadas, las aproximaciones ILS, los puntos VFR y los errores que más vemos en la red.",
  },
  ficha: [
    { dato: "Elevación", valor: "5013 ft" },
    { dato: "Pistas", valor: "11L/29R · 11R/29L" },
    { dato: "Altitud de transición", valor: "18 500 ft" },
    { dato: "VOR", valor: "GDL 117.3" },
  ],
  frecuencias: [
    { quien: "ATIS", mhz: "127.9", para: "Escuchas la letra, la pista en uso y el QNH. No se le habla." },
    { quien: "Autorizaciones", mhz: "132.8", para: "Pides tu autorización IFR. En la carta: GUADALAJARA Clearance." },
    { quien: "Rampa", mhz: "134.1", para: "Para moverte dentro de la plataforma o salir de ella." },
    { quien: "Rodaje", mhz: "121.9", para: "Te lleva de la plataforma al punto de espera de la pista." },
    { quien: "Torre", mhz: "118.1", para: "Te autoriza a entrar a la pista y a despegar." },
    {
      quien: "Aproximación",
      mhz: "119.3 · 120.8 · 128.9",
      para: "Guadalajara Aproximación te recibe al despegar y te trae al llegar. Cuál de las tres usas viene en tu autorización (la F de CRAFT).",
    },
  ],
  pasos: {
    intro:
      "Ejemplo con el Cessna 172 XB-VNA, pista 11R, rumbo a Ciudad de México. La altitud, la frecuencia de salida y el código son de ejemplo: los tuyos te los da el controlador.",
    items: [
      {
        titulo: "Escucha el ATIS",
        frecuencia: "127.9",
        nota: "Anota la letra, la pista en uso y el QNH antes de hablar con nadie. Con la pista ya sabes qué salida esperar: pistas 11, LONKU 1D; pistas 29, LONKU 1E.",
        dialogo: [],
      },
      {
        titulo: "Pide tu autorización IFR",
        frecuencia: "132.8",
        nota: "Ten la libreta lista con C-R-A-F-T y escribe mientras te dictan. Al final lees todo de vuelta, en el mismo orden.",
        dialogo: [
          { de: "tu", texto: "Guadalajara Autorizaciones, XB-VNA, Cessna 172 en plataforma de aviación general, con información Alfa, solicito autorización IFR a Ciudad de México." },
          { de: "atc", texto: "XB-VNA, autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga 12 000 pies, frecuencia de salida 120.8, transpondedor 4521." },
          { de: "tu", texto: "Autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga 12 000 pies, frecuencia de salida 120.8, transpondedor 4521, XB-VNA." },
          { de: "atc", texto: "XB-VNA, colación correcta." },
        ],
      },
      {
        titulo: "Sal de la plataforma con Rampa",
        frecuencia: "134.1",
        nota: "En la plataforma comercial los aviones salen remolcados: en el simulador usa el remolque. Rampa te deja en la orilla y te pasa con Rodaje.",
        dialogo: [
          { de: "tu", texto: "Guadalajara Rampa, XB-VNA, en plataforma de aviación general, listo para rodar." },
          { de: "atc", texto: "XB-VNA, autorizado a salir de la plataforma, contacte Rodaje en 121.9." },
          { de: "tu", texto: "Rodaje en 121.9, XB-VNA." },
        ],
      },
      {
        titulo: "Rueda a la pista con Rodaje",
        frecuencia: "121.9",
        nota: "Lo que nunca te puedes saltar en la colación: la pista y el punto de espera. Si no entendiste las calles, pídelas otra vez antes de moverte.",
        dialogo: [
          { de: "tu", texto: "Guadalajara Rodaje, XB-VNA, con información Alfa, listo para rodar." },
          { de: "atc", texto: "XB-VNA, ruede a punto de espera pista 11R por [las calles que te asigne], QNH [el del ATIS]." },
          { de: "tu", texto: "Ruedo a punto de espera pista 11R por [las calles], QNH [valor], XB-VNA." },
        ],
      },
      {
        titulo: "Despega con Torre",
        frecuencia: "118.1",
        nota: "Llama ya detenido en el punto de espera. Antes de entrar a la pista confirma que el GPS tiene cargada la salida de esa misma pista.",
        dialogo: [
          { de: "tu", texto: "Guadalajara Torre, XB-VNA, en punto de espera pista 11R, listo para salida." },
          { de: "atc", texto: "XB-VNA, viento 110 grados 8 nudos, pista 11R, autorizado a despegar." },
          { de: "tu", texto: "Pista 11R, autorizado a despegar, XB-VNA." },
        ],
      },
      {
        titulo: "Pasa con Aproximación",
        frecuencia: "La de tu autorización",
        nota: "Torre te pasa con la frecuencia de salida que anotaste: es Guadalajara Aproximación. Al primer contacto di tu altitud, a qué altitud subes y en qué salida vas.",
        dialogo: [
          { de: "atc", texto: "XB-VNA, contacte Aproximación en 120.8." },
          { de: "tu", texto: "120.8, XB-VNA." },
          { de: "tu", texto: "Guadalajara Aproximación, XB-VNA, pasando 6500 pies para 12 000, en la salida LONKU 1D." },
        ],
      },
    ],
  },
  salidas: {
    titulo: "Tres salidas, a fondo",
    intro:
      "MMGL tiene más salidas: RNAV a EMIRI, FEISE, KELVA, OTOKI, NOTUP y SEDEM, y una omnidireccional. Aquí van las dos LONKU, que son las de la ruta a Ciudad de México, y OVALI 1, la convencional, con lo esencial para saber si tu avión las puede volar. Vuela siempre con la carta del ciclo vigente.",
    tarjetas: [
      {
        nombre: "LONKU 1D",
        etiqueta: "Pistas 11L y 11R",
        tipo: "RNAV 1 · GNSS · radar",
        vigencia: "11 jul 2024",
        recorrido: "Derrota 108° durante 16.2 NM hasta GL405 y luego 098° durante 35 NM hasta LONKU.",
        restricciones: ["GL405: 9000 ft o más, máximo 220 kt", "Gradiente 3.6 % hasta 7000 ft"],
      },
      {
        nombre: "LONKU 1E",
        etiqueta: "Pistas 29L y 29R",
        tipo: "RNAV 1 · GNSS · radar",
        vigencia: "11 jul 2024",
        recorrido: "Pasa por GL710, GL720 y GL726 y termina en LONKU. Es la más exigente de estas tres.",
        restricciones: [
          "GL710: 7800 ft o más, máximo 220 kt",
          "GL720: 12 000 ft o más · GL726: 15 000 ft o más",
          "Gradiente 4.0 % hasta 7400 ft y 5.1 % hasta 12 000 ft",
        ],
      },
      {
        nombre: "OVALI 1",
        etiqueta: "Pistas 11L y 11R",
        tipo: "Convencional · VOR GDL 117.3",
        vigencia: "4 sep 2025",
        recorrido: "Radial 108 de GDL hasta 16.0 DME, viraje a la izquierda a rumbo 084° hasta interceptar el radial 101, y por él hasta OVALI.",
        restricciones: ["Gradiente 280 ft por milla (4.6 %) hasta 11 000 ft", "Sin puntos de GPS: tú corriges el viento"],
      },
    ],
  },
  llegadas: {
    intro:
      "Hay siete llegadas RNAV (STAR), una por cada punto de entrada. Todas piden RNAV 1 con GNSS y radar. Cuál te toca depende de por dónde llegas; SimBrief la propone y el controlador la confirma.",
    puntos: [
      { punto: "AMULA", desde: "Norte" },
      { punto: "MEZCA", desde: "Noreste" },
      { punto: "MUTEM", desde: "Este" },
      { punto: "IGSON", desde: "Sureste" },
      { punto: "USBIM", desde: "Suroeste" },
      { punto: "VOLAT", desde: "Oeste" },
      { punto: "KASUP", desde: "Oeste" },
    ],
    notas: [
      {
        titulo: "Pistas 11: la que termina en 1A",
        texto:
          "AMULA 1A, MEZCA 1A, MUTEM 1A, IGSON 1A, KASUP 1A, VOLAT 1A y USBIM 1C. Todas terminan en OLAVA, donde empieza la aproximación: cruzas a 11 000 ft y a no más de 190 kt. Cartas 10-2B y 10-2D.",
      },
      {
        titulo: "Pistas 29: la que termina en 1B",
        texto:
          "AMULA 1B, MEZCA 1B, MUTEM 1B, IGSON 1B, KASUP 1B, VOLAT 1B y USBIM 1D. Te llevan al este del aeropuerto para la final de la 29. Cartas 10-2C y 10-2E.",
      },
    ],
    dialogo: [
      { de: "tu", texto: "Guadalajara Aproximación, XB-VNA, nivel de vuelo 210 en la llegada MUTEM 1A, con información Bravo." },
      { de: "atc", texto: "XB-VNA, identificado, descienda y mantenga 11 000 pies, QNH [el del ATIS], espere aproximación ILS Z pista 11R." },
      { de: "tu", texto: "Desciendo y mantengo 11 000 pies, QNH [valor], espero ILS Z pista 11R, XB-VNA." },
    ],
    pie: "Ejemplo de primer contacto. El nivel, la letra y la llegada dependen de tu vuelo.",
  },
  ils: {
    intro:
      "Solo la pista principal, 11R/29L (13 123 ft de largo), tiene ILS. Las cuatro pistas tienen aproximación RNP y VOR, y la 11R/29L tiene además ILS Y y X y aproximación radar.",
    aproximaciones: [
      {
        nombre: "ILS Z pista 11R",
        carta: "11-1",
        vigencia: "11 jul 2024",
        localizador: "IAIG 110.1",
        curso: "108°",
        minimo: "DA 5210 ft (200 ft sobre la pista)",
        frustrada:
          "Asciende por el radial 108 de GDL hasta 8 DME, vira a la izquierda sin pasar de 10 NM e intercepta el radial 084 de regreso al VOR GDL, a la altitud mínima de espera.",
      },
      {
        nombre: "ILS Z pista 29L",
        carta: "11-3",
        vigencia: "11 jul 2024",
        localizador: "IGDL 111.3",
        curso: "288°",
        minimo: "DA 5310 ft (300 ft sobre la pista)",
        frustrada: "Asciende por el radial 288 de GDL hasta 8 DME, vira a la derecha sin pasar de 10 NM y regresa al VOR GDL, a la altitud mínima de espera.",
      },
    ],
  },
  vfr: {
    intro:
      "Guadalajara tiene 15 puntos de notificación VFR. Los controladores de IVAO y VATSIM los siguen usando. Al primer contacto di sobre cuál estás; el control te va pasando de uno a otro hasta el aeropuerto.",
    // Del más lejano al más cercano. "nm" es aproximado, medido sobre la carta visual.
    puntos: [
      { nombre: "Ocotlán", donde: "Este-sureste", nm: 31 },
      { nombre: "Ixtlahuacán del Río", donde: "Norte", nm: 20 },
      { nombre: "Presa de Valencia", donde: "Oeste", nm: 18 },
      { nombre: "Chapala", donde: "Sur-sureste", nm: 15 },
      { nombre: "Zapotlanejo", donde: "Este-noreste", nm: 14 },
      { nombre: "Sta. Cruz de las Flores", donde: "Oeste", nm: 10 },
      { nombre: "Cd. Granja", donde: "Noroeste", nm: 10 },
      { nombre: "Estadio", donde: "Norte", nm: 9 },
      { nombre: "Tlajomulco", donde: "Oeste-suroeste", nm: 7 },
      { nombre: "Tonalá", donde: "Norte-noreste", nm: 7 },
      { nombre: "Cerro del Cuatro", donde: "Noroeste", nm: 5 },
      { nombre: "Cajititlán", donde: "Sur", nm: 5 },
      { nombre: "Hotel Tapatío", donde: "Norte", nm: 5 },
      { nombre: "Pirámide", donde: "Sur", nm: 4 },
      { nombre: "Club de Golf Atlas", donde: "Norte", nm: 3 },
    ],
    rutas: [
      { desde: "Por el norte", ruta: ["Estadio", "Hotel Tapatío", "Club de Golf Atlas"] },
      { desde: "Por el noroeste", ruta: ["Cd. Granja", "Hotel Tapatío", "Club de Golf Atlas"] },
      { desde: "Por el este", ruta: ["Ocotlán", "Zapotlanejo", "Club de Golf Atlas"] },
      { desde: "Por el sur", ruta: ["Chapala", "Cajititlán", "Pirámide"] },
      { desde: "Por el oeste", ruta: ["Sta. Cruz de las Flores", "Tlajomulco", "Pirámide"] },
    ],
    notas: [
      {
        titulo: "Dos áreas restringidas",
        texto:
          "Al oeste (radiales 265° a 305° del VOR) y al este (085° a 125°) del aeropuerto. No las cruces: por eso las rutas entran por el norte, hasta Club de Golf Atlas, o por el sur, hasta Pirámide.",
      },
      {
        titulo: "Respeta la altitud de cada sector",
        texto:
          "La carta marca en rojo una altitud por sector: 7000 a 7500 ft cerca del aeropuerto y hasta 10 500 ft al suroeste, por los cerros. Al norte está la base aérea de Zapopan, con su propia torre en 118.45.",
      },
    ],
    dialogo: [
      { de: "tu", texto: "Guadalajara Aproximación, XB-VNA, VFR sobre Chapala, 9000 pies, con información Bravo, para aterrizar." },
      { de: "atc", texto: "XB-VNA, identificado, proceda a Cajititlán y Pirámide, notifique Pirámide." },
      { de: "tu", texto: "Procedo a Cajititlán y Pirámide, notifico Pirámide, XB-VNA." },
    ],
    pie: "Ejemplo de entrada por el sur. Carta de aproximación visual MMGL-VAC-2 y VAC-3, AIP de México (SENEAM), AIRAC 10/15.",
  },
  errores: [
    { error: "Llamar sin haber escuchado el ATIS.", mejor: "Primero 127.9. Sin la letra, el controlador te la tiene que dar y ya empezaste atrasado." },
    { error: "Pedirle rodaje a Torre desde la plataforma.", mejor: "En MMGL son tres llamadas en tierra: Rampa (134.1), Rodaje (121.9) y Torre (118.1)." },
    { error: "Intentar memorizar la autorización.", mejor: "Escríbela en orden CRAFT. Si te falta una parte, pídela antes de colacionar." },
    {
      error: "Volar la SID que cargó SimBrief y no la que te autorizaron.",
      mejor: "Si te dan la LONKU 1E desde la 29R, cámbiala en el GPS antes de rodar y revisa punto por punto contra la carta.",
    },
    {
      error: "Aceptar una salida que tu avión no puede subir.",
      mejor: "MMGL está a 5013 ft y en tarde caliente subes menos. Si no cumples el gradiente o una restricción, contesta «imposible» antes de despegar.",
    },
    {
      error: "Saltarse GL405 porque te autorizaron a 12 000 ft.",
      mejor: "Las restricciones de la salida siguen valiendo: cruzas GL405 a 9000 ft o más y a no más de 220 kt.",
    },
    { error: "Cambiar a 29.92 al pasar 18 000 ft.", mejor: "En MMGL la altitud de transición es 18 500 ft. Abajo de ella vuelas con el QNH del ATIS." },
    {
      error: "Cargar la llegada de la otra pista.",
      mejor: "Las que terminan en 1A (USBIM 1C) son para las pistas 11; las que terminan en 1B (USBIM 1D), para las 29. Revisa la pista en el ATIS antes de cargarla.",
    },
    { error: "Bajar con 29.92 hasta la aproximación.", mejor: "Al descender, pon el QNH al cruzar el nivel de transición, FL195. Pídelo si no lo tienes." },
    {
      error: "En IVAO o VATSIM, llamar a una frecuencia que nadie atiende.",
      mejor:
        "Revisa quién está conectado. Si no hay Autorizaciones, llama al siguiente que sí esté: Rodaje, Torre o Aproximación. Si no hay nadie, anuncia tus movimientos en Unicom 122.8.",
    },
  ],
  fuentes:
    "Procedimientos y frecuencias de las cartas Jeppesen vía Navigraph, con la fecha de cada una; llegadas y aproximaciones consultadas el 3 de noviembre de 2026. Puntos VFR de la carta de aproximación visual del AIP de México (SENEAM).",
};
