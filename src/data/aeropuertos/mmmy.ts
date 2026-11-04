import type { Guia } from "../../features/aeropuertos/GuiaAeropuerto";
import { ROUTES } from "../../lib/routes";

// Datos: cartas Jeppesen vía Navigraph leídas el 2026-11-04. Frecuencias y pistas: pestaña Info. Salidas RNP:
// 10-3 (pista 12) y 10-3A (pista 30), del 6 jun 2025; salidas convencionales por el VOR MTY: 10-3B y 10-3C.
// Llegadas RNP: 10-2 (pista 12) y 10-2A (pista 30), del 6 jun 2025. ILS Z 30 (11-1), del 18 jul 2025.
// Sin puntos VFR: falta la carta de aproximación visual del AIP. Si una carta cambia, cambia aquí.

export const MMMY: Guia = {
  icao: "MMMY",
  ruta: ROUTES.aeropuertoMMMY,
  hero: {
    titulo: "Monterrey MMMY: sal y llega sin trabarte en la radio",
    descripcion:
      "Cada llamada de la salida IFR en orden: a quién le hablas, qué te van a decir y qué contestas. Con las salidas, las llegadas, el ILS y los errores que más vemos en la red.",
  },
  ficha: [
    { dato: "Elevación", valor: "1276 ft" },
    { dato: "Pistas", valor: "12/30 · 16/34" },
    { dato: "Altitud de transición", valor: "18 500 ft" },
    { dato: "VOR", valor: "MTY 114.7" },
  ],
  frecuencias: [
    { quien: "ATIS", mhz: "127.7", para: "Escuchas la letra, la pista en uso y el QNH, que en MMMY se da en pulgadas. No se le habla." },
    { quien: "Autorizaciones", mhz: "121.65", para: "Pides tu autorización IFR." },
    { quien: "Rodaje", mhz: "121.9", para: "En MMMY no hay Rampa: Rodaje te autoriza el remolque y te lleva al punto de espera." },
    { quien: "Torre", mhz: "118.1", para: "Te autoriza a entrar a la pista, a despegar y a aterrizar." },
    { quien: "Salidas", mhz: "119.75", para: "Monterrey Aproximación te recibe al despegar. La frecuencia viene en tu autorización (la F de CRAFT)." },
    { quien: "Llegadas", mhz: "120.4", para: "Monterrey Llegadas te baja por la llegada (STAR) y te pone en la aproximación final." },
  ],
  pasos: {
    intro:
      "Ejemplo con el C408 SkyCourier XB-SKY, pista 12, rumbo a Ciudad de México. La salida, la altitud y el código son de ejemplo: los tuyos te los da el controlador.",
    items: [
      {
        titulo: "Escucha el ATIS",
        frecuencia: "127.7",
        nota: "Anota la letra, la pista en uso y el QNH antes de hablar con nadie. La pista te dice qué letra lleva tu salida: pista 12, la que termina en A; pista 30, la que termina en B.",
        dialogo: [],
      },
      {
        titulo: "Pide tu autorización IFR",
        frecuencia: "121.65",
        nota: "Ten la libreta lista con C-R-A-F-T y escribe mientras te dictan. Al final lees todo de vuelta, en el mismo orden.",
        dialogo: [
          { de: "tu", texto: "Monterrey Autorizaciones, XB-SKY, C408 en la posición [la tuya], con información Alfa, solicito autorización IFR a Ciudad de México." },
          { de: "atc", texto: "XB-SKY, autorizado a Ciudad de México, salida KERGA 1A, luego ruta del plan de vuelo, ascienda y mantenga 17 000 pies, frecuencia de salida 119.75, transpondedor 4251." },
          { de: "tu", texto: "Autorizado a Ciudad de México, salida KERGA 1A, luego ruta del plan de vuelo, ascienda y mantenga 17 000 pies, frecuencia de salida 119.75, transpondedor 4251, XB-SKY." },
          { de: "atc", texto: "XB-SKY, colación correcta." },
        ],
      },
      {
        titulo: "Remolque y rodaje con Rodaje",
        frecuencia: "121.9",
        nota: "Como no hay Rampa, el remolque también se lo pides a Rodaje. Lo que nunca te puedes saltar en la colación: la pista y el punto de espera.",
        dialogo: [
          { de: "tu", texto: "Monterrey Rodaje, XB-SKY, en la posición [la tuya], con información Alfa, solicito remolque." },
          { de: "atc", texto: "XB-SKY, remolque aprobado, avise listo para rodar." },
          { de: "tu", texto: "Remolque aprobado, XB-SKY." },
          { de: "tu", texto: "Monterrey Rodaje, XB-SKY, listo para rodar." },
          { de: "atc", texto: "XB-SKY, ruede a punto de espera pista 12 por [las calles que te asigne], QNH [el del ATIS]." },
          { de: "tu", texto: "Ruedo a punto de espera pista 12 por [las calles], QNH [valor], XB-SKY." },
        ],
      },
      {
        titulo: "Despega con Torre",
        frecuencia: "118.1",
        nota: "Llama ya detenido en el punto de espera. Antes de entrar a la pista confirma que el GPS tiene la salida de esa misma pista: la KERGA 1A, no la 1B.",
        dialogo: [
          { de: "tu", texto: "Monterrey Torre, XB-SKY, en punto de espera pista 12, listo para salida." },
          { de: "atc", texto: "XB-SKY, viento 120 grados 12 nudos, pista 12, autorizado a despegar." },
          { de: "tu", texto: "Pista 12, autorizado a despegar, XB-SKY." },
        ],
      },
      {
        titulo: "Pasa con Salidas",
        frecuencia: "119.75",
        nota: "Torre te pasa con la frecuencia de salida que anotaste. Al primer contacto di tu altitud, a qué altitud subes y en qué salida vas.",
        dialogo: [
          { de: "atc", texto: "XB-SKY, contacte Monterrey Aproximación en 119.75." },
          { de: "tu", texto: "119.75, XB-SKY." },
          { de: "tu", texto: "Monterrey Aproximación, XB-SKY, pasando 3500 pies para 17 000, en la salida KERGA 1A." },
        ],
      },
    ],
  },
  salidas: {
    titulo: "Las salidas, por dirección",
    intro:
      "MMMY tiene cuatro salidas RNP, cada una en dos versiones: la que termina en A es para la pista 12 (carta 10-3) y la que termina en B, para la 30 (carta 10-3A). Todas piden RNP 1 con GNSS y terminan en FL200. Si tu avión no tiene GPS, hay salidas convencionales por el VOR MTY (cartas 10-3B y 10-3C). El aeropuerto está bajo, pero rodeado de sierra: fíjate en el gradiente de cada una.",
    tarjetas: [
      {
        nombre: "Al noroeste",
        etiqueta: "GRALA",
        tipo: "Pista 12: 1A · pista 30: 1B",
        vigencia: "12 jun 2025",
        restricciones: ["Pista 12: 6.1 % hasta 15 000 ft", "Pista 30: 5.6 % hasta 15 000 ft"],
      },
      {
        nombre: "Al noreste",
        etiqueta: "DAJOR",
        tipo: "Pista 12: 1A · pista 30: 1B",
        vigencia: "12 jun 2025",
        restricciones: ["Pista 12: 6.1 % hasta 15 000 ft", "Pista 30: 5.6 % hasta 15 000 ft"],
      },
      {
        nombre: "Al este",
        etiqueta: "DOTOR",
        tipo: "Pista 12: 1A · pista 30: 1B",
        vigencia: "12 jun 2025",
        restricciones: ["Pista 12: 4.6 % hasta 10 000 ft", "Pista 30: 6.4 % hasta 13 000 ft"],
      },
      {
        nombre: "Al sur",
        etiqueta: "KERGA",
        tipo: "Pista 12: 1A · pista 30: 1B",
        vigencia: "12 jun 2025",
        restricciones: ["Pista 12: 5.9 % hasta 8000 ft", "Pista 30: 6.4 % hasta 13 000 ft"],
      },
    ],
  },
  llegadas: {
    intro:
      "Hay cuatro puntos de entrada, y cada llegada RNP (STAR) viene en dos versiones, una por pista. Todas piden RNP 1 con GNSS. Ojo con la de Saltillo: no sigue la letra de las demás.",
    puntos: [
      { punto: "NOTAL", desde: "Norte" },
      { punto: "ITPIS", desde: "Este" },
      { punto: "RETOS", desde: "Sureste" },
      { punto: "SLW", desde: "Oeste (VOR Saltillo)" },
    ],
    notas: [
      {
        titulo: "Pista 12",
        texto:
          "ITPIS 1A, NOTAL 1A, RETOS 1A y SLW 1B. Todas terminan en TASNA, al noroeste del aeropuerto, donde empieza la aproximación: la cruzas a 4800 ft y a no más de 180 kt. Carta 10-2.",
      },
      {
        titulo: "Pista 30",
        texto:
          "ITPIS 1B, NOTAL 1B, RETOS 1B y SLW 1C. Todas terminan en OKOTO, al sureste del aeropuerto, donde empieza la aproximación: la cruzas a 4400 ft y a no más de 180 kt. Carta 10-2A.",
      },
    ],
    dialogo: [
      { de: "tu", texto: "Monterrey Llegadas, XB-SKY, nivel de vuelo 220 en la llegada RETOS 1B, con información Charlie." },
      { de: "atc", texto: "XB-SKY, identificado, descienda y mantenga 11 000 pies, QNH [el del ATIS], espere aproximación ILS Z pista 30." },
      { de: "tu", texto: "Desciendo y mantengo 11 000 pies, QNH [valor], espero ILS Z pista 30, XB-SKY." },
    ],
    pie: "Ejemplo de primer contacto. El nivel, la letra y la llegada dependen de tu vuelo.",
  },
  ils: {
    intro:
      "Solo la pista 30 tiene ILS, en cinco versiones (Z, Y, X, W y V). La 12 tiene aproximación RNP y VOR, y la 16, solo VOR: si te dan la 12, no busques el ILS.",
    aproximaciones: [
      {
        nombre: "ILS Z pista 30",
        carta: "11-1",
        vigencia: "18 jul 2025",
        localizador: "IMTY 111.1",
        curso: "296°",
        minimo: "DA 1497 ft (250 ft sobre la pista)",
        obligatorio: "D5.5 IMTY (D6.0 MTY) a 3000 ft.",
        frustrada:
          "Asciende saliendo por el radial 268 del VOR MTY hasta 5 NM y vira a la izquierda, dentro de 8 NM, de regreso al VOR MTY a la altitud mínima de espera; luego, lo que indique el controlador.",
      },
    ],
  },
  errores: [
    { error: "Llamar sin haber escuchado el ATIS.", mejor: "Primero 127.7. Sin la letra, el controlador te la tiene que dar y ya empezaste atrasado." },
    {
      error: "Cargar la salida o la llegada de la otra pista.",
      mejor: "La letra manda: A para la pista 12 y B para la 30, en las salidas y en las llegadas de ITPIS, NOTAL y RETOS. La de Saltillo es la excepción: SLW 1B para la 12 y SLW 1C para la 30.",
    },
    {
      error: "Creer que por estar bajo, cualquier avión sube.",
      mejor:
        "MMMY está a 1276 ft, pero la sierra está cerca. La DOTOR 1B y la KERGA 1B piden 6.4 % hasta 13 000 ft: a 150 kt sobre el suelo son 972 ft por minuto. Revisa la tabla de la carta y, si no llegas, contesta «imposible» antes de despegar.",
    },
    { error: "Intentar memorizar la autorización.", mejor: "Escríbela en orden CRAFT. Si te falta una parte, pídela antes de colacionar." },
    { error: "Buscar a Rampa.", mejor: "En MMMY no hay Rampa: el remolque y el rodaje se los pides a Rodaje en 121.9." },
    {
      error: "Cargar Del Norte en vez de Escobedo.",
      mejor: "Monterrey tiene dos aeropuertos y están a pocas millas. El internacional es MMMY (Escobedo); MMAN es Del Norte. Revisa el código al armar el plan de vuelo.",
    },
    { error: "Cambiar a 29.92 al pasar 18 000 ft.", mejor: "La altitud de transición es 18 500 ft. Abajo de ella vuelas con el QNH del ATIS." },
    {
      error: "Bajar con 29.92 hasta la aproximación.",
      mejor: "Al descender, pon el QNH al cruzar el nivel de transición, FL195. En MMMY se da en pulgadas; en milibares, solo si lo pides.",
    },
    {
      error: "Esperar un ILS en la pista 12.",
      mejor: "La 12 no tiene ILS: lleva lista la RNP RWY 12 (carta 12-1) o el VOR. El ILS es solo de la 30.",
    },
    {
      error: "Llegar rápido al final de la llegada.",
      mejor: "TASNA y OKOTO se cruzan a no más de 180 kt. Reduce antes, no encima del punto.",
    },
    {
      error: "Esperar una DA de 200 ft.",
      mejor: "En el ILS Z de la 30 la DA es 1497 ft, 250 ft sobre la pista. Usa la de tu carta, no la de memoria.",
    },
    {
      error: "En IVAO o VATSIM, llamar a una frecuencia que nadie atiende.",
      mejor:
        "Revisa quién está conectado. Si no hay Autorizaciones, llama al siguiente que sí esté: Rodaje, Torre o Aproximación. Si no hay nadie, anuncia tus movimientos en Unicom 122.8.",
    },
  ],
  fuentes: "Procedimientos y frecuencias de las cartas Jeppesen vía Navigraph, consultadas el 4 de noviembre de 2026; cada tarjeta trae la fecha de su carta.",
};
