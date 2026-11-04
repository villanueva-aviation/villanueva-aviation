import type { Guia } from "../../features/aeropuertos/GuiaAeropuerto";
import { ROUTES } from "../../lib/routes";

// Datos: cartas Jeppesen vía Navigraph leídas el 2026-11-04. Frecuencias y pistas: pestaña Info. Salidas RNAV:
// 10-3 (pistas 05) y 10-3A (pistas 23), del 6 jun 2025. Llegadas: 10-2 a 10-2E, del 6 jun 2025. ILS Z 05R (11-1)
// e ILS Z 23L (11-2), del 27 mar 2026. La DARAN 3A y la RNP Y 05R también están en CARTAS_RED (src/data/rutaRed.ts).
// Sin puntos VFR: falta la carta de aproximación visual del AIP. Si una carta cambia, cambia aquí.

export const MMMX: Guia = {
  icao: "MMMX",
  ruta: ROUTES.aeropuertoMMMX,
  hero: {
    titulo: "Ciudad de México MMMX: sal y llega sin trabarte en la radio",
    descripcion:
      "Cada llamada de la salida IFR en orden: a quién le hablas, qué te van a decir y qué contestas. Con las salidas, las llegadas, las aproximaciones ILS y los errores que más vemos en la red.",
  },
  ficha: [
    { dato: "Elevación", valor: "7293 ft" },
    { dato: "Pistas", valor: "05L/23R · 05R/23L" },
    { dato: "Altitud de transición", valor: "18 500 ft" },
    { dato: "VOR", valor: "MEX 115.9" },
  ],
  frecuencias: [
    { quien: "ATIS", mhz: "127.65", para: "Escuchas la letra, la pista en uso y el QNH, que en MMMX se da en pulgadas. No se le habla." },
    { quien: "Autorizaciones", mhz: "122.1", para: "Pides tu autorización IFR." },
    { quien: "Rampa", mhz: "122.8", para: "Para salir de tu posición en la plataforma. Si no hay Rampa conectada, pides todo a Rodaje." },
    { quien: "Rodaje", mhz: "121.85 · 121.0", para: "Norte en 121.85 y sur en 121.0. Te lleva al punto de espera de la pista." },
    { quien: "Torre", mhz: "118.55 · 118.7", para: "Te autoriza a entrar a la pista, a despegar y a aterrizar." },
    {
      quien: "Salidas",
      mhz: "120.5 · 121.4 · 129.1",
      para: "México Aproximación en su posición de salidas te recibe al despegar. Cuál de las tres usas viene en tu autorización (la F de CRAFT).",
    },
    { quien: "Llegadas", mhz: "129.65 · 119.1", para: "México Llegadas, norte en 129.65 y sur en 119.1: te bajan por la llegada (STAR)." },
    { quien: "Aproximación", mhz: "121.2 · 119.75", para: "Te ponen en la aproximación final. México Radar, en 119.25, también puede atenderte." },
  ],
  pasos: {
    intro:
      "Ejemplo con el C408 SkyCourier XB-SKY, pista 05L, rumbo a Guadalajara. La salida, la altitud, la frecuencia de salida y el código son de ejemplo: los tuyos te los da el controlador.",
    items: [
      {
        titulo: "Escucha el ATIS",
        frecuencia: "127.65",
        nota: "Anota la letra, la pista en uso y el QNH antes de hablar con nadie. La pista te dice qué letra lleva tu salida: pistas 05, la que termina en A; pistas 23, la que termina en B.",
        dialogo: [],
      },
      {
        titulo: "Pide tu autorización IFR",
        frecuencia: "122.1",
        nota: "Ten la libreta lista con C-R-A-F-T y escribe mientras te dictan. Al final lees todo de vuelta, en el mismo orden.",
        dialogo: [
          { de: "tu", texto: "México Autorizaciones, XB-SKY, C408 en la posición [la tuya], con información Alfa, solicito autorización IFR a Guadalajara." },
          { de: "atc", texto: "XB-SKY, autorizado a Guadalajara, salida SEBON 3A, luego ruta del plan de vuelo, ascienda y mantenga 15 000 pies, frecuencia de salida 120.5, transpondedor 4372." },
          { de: "tu", texto: "Autorizado a Guadalajara, salida SEBON 3A, luego ruta del plan de vuelo, ascienda y mantenga 15 000 pies, frecuencia de salida 120.5, transpondedor 4372, XB-SKY." },
          { de: "atc", texto: "XB-SKY, colación correcta." },
        ],
      },
      {
        titulo: "Sal de la plataforma con Rampa",
        frecuencia: "122.8",
        nota: "En la plataforma comercial los aviones salen remolcados: en el simulador usa el remolque. Rampa te deja en la orilla y te pasa con Rodaje.",
        dialogo: [
          { de: "tu", texto: "México Rampa, XB-SKY, en la posición [la tuya], listo para salir." },
          { de: "atc", texto: "XB-SKY, autorizado a salir de la plataforma, contacte Rodaje en 121.85." },
          { de: "tu", texto: "Rodaje en 121.85, XB-SKY." },
        ],
      },
      {
        titulo: "Rueda a la pista con Rodaje",
        frecuencia: "121.85 · 121.0",
        nota: "Lo que nunca te puedes saltar en la colación: la pista y el punto de espera. Si no entendiste las calles, pídelas otra vez antes de moverte.",
        dialogo: [
          { de: "tu", texto: "México Rodaje, XB-SKY, con información Alfa, listo para rodar." },
          { de: "atc", texto: "XB-SKY, ruede a punto de espera pista 05L por [las calles que te asigne], QNH [el del ATIS]." },
          { de: "tu", texto: "Ruedo a punto de espera pista 05L por [las calles], QNH [valor], XB-SKY." },
        ],
      },
      {
        titulo: "Despega con Torre",
        frecuencia: "118.55 · 118.7",
        nota: "Llama ya detenido en el punto de espera. Antes de entrar a la pista confirma que el GPS tiene la salida de esa misma pista: la SEBON 3A, no la 3B.",
        dialogo: [
          { de: "tu", texto: "México Torre, XB-SKY, en punto de espera pista 05L, listo para salida." },
          { de: "atc", texto: "XB-SKY, viento 050 grados 10 nudos, pista 05L, autorizado a despegar." },
          { de: "tu", texto: "Pista 05L, autorizado a despegar, XB-SKY." },
        ],
      },
      {
        titulo: "Pasa con Salidas",
        frecuencia: "La de tu autorización",
        nota: "Torre te pasa con la frecuencia de salida que anotaste. Al primer contacto di tu altitud, a qué altitud subes y en qué salida vas.",
        dialogo: [
          { de: "atc", texto: "XB-SKY, contacte México Aproximación en 120.5." },
          { de: "tu", texto: "120.5, XB-SKY." },
          { de: "tu", texto: "México Aproximación, XB-SKY, pasando 8500 pies para 15 000, en la salida SEBON 3A." },
        ],
      },
    ],
  },
  salidas: {
    titulo: "Las salidas, por dirección",
    intro:
      "MMMX tiene diez salidas RNAV, cada una en dos versiones: la que termina en A es para las pistas 05 (carta 10-3) y la que termina en B, para las 23 (carta 10-3A). Todas piden RNAV 1 con GNSS y radar. MMMX está a 7293 ft y los gradientes son altos: el primero de cada renglón es el mínimo y el segundo lo pide la carta por razones operativas.",
    tarjetas: [
      {
        nombre: "Al norte",
        etiqueta: "ATURO · AXIRI · IKLAN",
        tipo: "Pistas 05: 2A · pistas 23: 3B",
        vigencia: "12 jun 2025",
        restricciones: ["Pistas 05: 3.9 % hasta 10 000 ft y 4.7 % hasta 16 000 ft", "Pistas 23: 3.9 % hasta 11 000 ft y 5.4 % hasta 10 000 ft"],
      },
      {
        nombre: "Al este",
        etiqueta: "ILETO · NOXOS · UKUNO",
        tipo: "Pistas 05: 3A · pistas 23: 2B",
        vigencia: "12 jun 2025",
        restricciones: ["Pistas 05: 3.9 % hasta 10 000 ft y 4.5 % hasta 18 000 ft", "Pistas 23: 3.6 % hasta 11 000 ft y 5.6 % hasta 9000 ft"],
      },
      {
        nombre: "Al oeste",
        etiqueta: "OVAGO · SEBON · ULEBA",
        tipo: "Pistas 05: 3A · pistas 23: 3B",
        vigencia: "12 jun 2025",
        restricciones: ["Pistas 05: 3.9 % hasta 10 000 ft y 4.9 % hasta 15 000 ft", "Pistas 23: 5.3 % hasta 13 000 ft y 5.4 % hasta 10 000 ft"],
      },
      {
        nombre: "Al sur",
        etiqueta: "TEVOS",
        tipo: "Pistas 05: 2A · pistas 23: 2B",
        vigencia: "12 jun 2025",
        restricciones: ["Pistas 05: 3.9 % hasta 10 000 ft y 5.2 % hasta FL210", "Pistas 23: 3.6 % hasta 11 000 ft y 5.6 % hasta 9000 ft"],
      },
    ],
  },
  llegadas: {
    intro:
      "Hay cuatro puntos de entrada, y cada llegada RNAV (STAR) viene en dos versiones, igual que las salidas: la que termina en A para las pistas 05 y la que termina en B para las 23. Todas piden RNAV 1 con GNSS y radar.",
    puntos: [
      { punto: "DARAN", desde: "Noroeste" },
      { punto: "ENAGA", desde: "Noreste" },
      { punto: "ESPOS", desde: "Suroeste" },
      { punto: "LARLO", desde: "Sureste" },
    ],
    notas: [
      {
        titulo: "Pistas 05: la que termina en A",
        texto:
          "DARAN 3A, ENAGA 3A, ESPOS 3A y LARLO 4A. Las del norte terminan en UKTEN y las del sur en EPRIM; en los dos empieza la aproximación y los cruzas a 12 500 ft y a no más de 210 kt. Cartas 10-2 y 10-2B.",
      },
      {
        titulo: "Pistas 23: la que termina en B",
        texto:
          "DARAN 3B, ENAGA 3B, ESPOS 4B y LARLO 3B. Todas pasan al este del aeropuerto, cruzan SESTA (12 000 ft, máximo 200 kt) y terminan en ESTIN, a 10 000 ft y a no más de 190 kt. Cartas 10-2A, 10-2C, 10-2D y 10-2E.",
      },
    ],
    dialogo: [
      { de: "tu", texto: "México Llegadas, XB-SKY, nivel de vuelo 210 en la llegada DARAN 3A, con información Charlie." },
      { de: "atc", texto: "XB-SKY, identificado, descienda y mantenga 17 000 pies, QNH [el del ATIS], espere aproximación ILS Z pista 05R." },
      { de: "tu", texto: "Desciendo y mantengo 17 000 pies, QNH [valor], espero ILS Z pista 05R, XB-SKY." },
    ],
    pie: "Ejemplo de primer contacto. El nivel, la letra y la llegada dependen de tu vuelo.",
  },
  ils: {
    intro:
      "Solo la 05R y la 23L tienen ILS: la 05R en cuatro versiones (Z, Y, X y W) y la 23L en tres (Z, Y y X). Las cuatro pistas tienen aproximación RNP y VOR; la RNP Y de la 05R la vuelas paso a paso en la ruta «Listo para volar en red». Fíjate en el mínimo de cada ILS: no es de 200 ft.",
    aproximaciones: [
      {
        nombre: "ILS Z pista 05R",
        carta: "11-1",
        vigencia: "27 mar 2026",
        localizador: "IMWX 109.1",
        curso: "055°",
        minimo: "DA 7566 ft (279 ft sobre la pista)",
        obligatorio: "MX900 a 8900 ft.",
        frustrada: "Asciende con derrota 055° hasta MX949 y sigue la frustrada publicada hasta EPRIM; luego, lo que indique el controlador.",
      },
      {
        nombre: "ILS Z pista 23L",
        carta: "11-2",
        vigencia: "27 mar 2026",
        localizador: "IMEX 109.7",
        curso: "235°",
        minimo: "DA 7512 ft (219 ft sobre la pista)",
        obligatorio: "MX402 a 9000 ft.",
        frustrada: "Asciende con derrota 235° hasta MX415 y sigue la frustrada publicada hasta VIKSA; luego, lo que indique el controlador.",
      },
    ],
  },
  errores: [
    { error: "Llamar sin haber escuchado el ATIS.", mejor: "Primero 127.65. Sin la letra, el controlador te la tiene que dar y ya empezaste atrasado." },
    {
      error: "Cargar la salida o la llegada de la otra pista.",
      mejor: "En MMMX la letra manda: A para las pistas 05 y B para las 23, en salidas y en llegadas. El número puede cambiar (ESPOS 3A, ESPOS 4B): fíjate en la letra.",
    },
    {
      error: "Aceptar una salida que tu avión no puede subir.",
      mejor:
        "A 7293 ft, y más con calor, se sube poco. Algunas salidas piden 5.6 %: a 100 kt sobre el suelo son 567 ft por minuto. Revisa la tabla de la carta con tu velocidad y, si no llegas, contesta «imposible» antes de despegar.",
    },
    { error: "Intentar memorizar la autorización.", mejor: "Escríbela en orden CRAFT. Si te falta una parte, pídela antes de colacionar." },
    { error: "Cambiar a 29.92 al pasar 18 000 ft.", mejor: "En MMMX la altitud de transición es 18 500 ft. Abajo de ella vuelas con el QNH del ATIS." },
    {
      error: "Bajar con 29.92 hasta la aproximación.",
      mejor: "Al descender, pon el QNH al cruzar el nivel de transición, FL195. En MMMX se da en pulgadas; en milibares, solo si lo pides.",
    },
    {
      error: "Llegar rápido al final de la llegada.",
      mejor: "Las llegadas bajan la velocidad por tramos: máximo 210 kt en UKTEN y EPRIM, y 190 kt en ESTIN. Reduce antes, no encima del punto.",
    },
    {
      error: "Esperar una DA de 200 ft.",
      mejor: "En el ILS Z de la 05R la DA queda 279 ft sobre la pista, y en el de la 23L, 219 ft. Usa la de tu carta, no la de memoria.",
    },
    {
      error: "En IVAO o VATSIM, llamar a una frecuencia que nadie atiende.",
      mejor:
        "Revisa quién está conectado. Si no hay Autorizaciones, llama al siguiente que sí esté: Rodaje, Torre, Salidas o Aproximación. Si no hay nadie, anuncia tus movimientos en Unicom 122.8.",
    },
  ],
  fuentes: "Procedimientos y frecuencias de las cartas Jeppesen vía Navigraph, consultadas el 4 de noviembre de 2026; cada tarjeta trae la fecha de su carta.",
};
