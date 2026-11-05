import type { Guia } from "../../features/aeropuertos/GuiaAeropuerto";
import { ROUTES } from "../../lib/routes";

// Datos: cartas Jeppesen vía Navigraph leídas el 2026-11-05. Frecuencias por lado: plano 10-9 (26 sep 2025) y
// briefing 10-1P (Rodaje Norte para la Terminal 4, Rodaje Sur para las Terminales 1, 2 y 3). Salidas RNAV:
// 10-3D a 10-3G, del 29 ago 2025; salidas convencionales: 10-3 a 10-3C. Llegadas RNAV: 10-2 y 10-2A (29 ago 2025),
// 10-2B y 10-2C (14 mar 2025). ILS Z 12L (11-1) e ILS Z 12R (11-4), del 14 mar 2025.
// Sin puntos VFR: falta la carta de aproximación visual del AIP. Si una carta cambia, cambia aquí.

export const MMUN: Guia = {
  icao: "MMUN",
  ruta: ROUTES.aeropuertoMMUN,
  hero: {
    titulo: "Cancún MMUN: dos pistas paralelas sin trabarte en la radio",
    descripcion:
      "Cada llamada de la salida IFR en orden: a quién le hablas, qué te van a decir y qué contestas. Con las salidas de cada pista, las llegadas, los ILS y los errores que más vemos en la red.",
  },
  ficha: [
    { dato: "Elevación", valor: "22 ft" },
    { dato: "Pistas", valor: "12L/30R · 12R/30L" },
    { dato: "Altitud de transición", valor: "18 500 ft" },
    { dato: "VOR", valor: "CUN 113.6" },
  ],
  frecuencias: [
    { quien: "ATIS", mhz: "127.7", para: "Escuchas la letra, las pistas en uso y el QNH, que en MMUN se da en pulgadas. No se le habla." },
    { quien: "Autorizaciones", mhz: "122.1", para: "Pides tu autorización IFR. En el mundo real se pide 30 minutos antes de salir." },
    { quien: "Rodaje Norte", mhz: "121.0", para: "Si estás en la Terminal 4: te autoriza el remolque y te lleva al punto de espera." },
    { quien: "Rodaje Sur", mhz: "121.7", para: "Si estás en las Terminales 1, 2 o 3: te autoriza el remolque y te lleva al punto de espera." },
    { quien: "Torre", mhz: "118.1 · 118.6", para: "118.1 para la pista norte (12L/30R) y 118.6 para la sur (12R/30L). Te autoriza a entrar a la pista, a despegar y a aterrizar." },
    {
      quien: "Salidas",
      mhz: "124.2 · 123.5 · 120.8",
      para: "Cancún Aproximación te recibe al despegar: 124.2 si sales al norte, 123.5 al sur y 120.8 al oeste. La tuya viene en la autorización (la F de CRAFT).",
    },
    { quien: "Llegadas", mhz: "123.2", para: "Cancún Llegadas te baja por la llegada (STAR); luego Aproximación (124.7) y Final (122.7) te ponen en el ILS." },
  ],
  pasos: {
    intro:
      "Ejemplo con un Boeing 737 matrícula XA-VAA en la Terminal 4, pista 12L, rumbo a Ciudad de México. La salida, la altitud y el código son de ejemplo: los tuyos te los da el controlador.",
    items: [
      {
        titulo: "Escucha el ATIS",
        frecuencia: "127.7",
        nota: "Anota la letra, las pistas en uso y el QNH antes de hablar con nadie. Con dos pistas paralelas, fíjate cuál es para salir: la 12L es la del norte y la 12R, la del sur.",
        dialogo: [],
      },
      {
        titulo: "Pide tu autorización IFR",
        frecuencia: "122.1",
        nota: "Ten la libreta lista con C-R-A-F-T y escribe mientras te dictan. Al final lees todo de vuelta, en el mismo orden.",
        dialogo: [
          { de: "tu", texto: "Cancún Autorizaciones, XA-VAA, Boeing 737 en la posición [la tuya] de la Terminal 4, con información Alfa, solicito autorización IFR a Ciudad de México." },
          { de: "atc", texto: "XA-VAA, autorizado a Ciudad de México, salida UDGUV 2B, luego ruta del plan de vuelo, ascienda y mantenga 16 000 pies, frecuencia de salida 120.8, transpondedor 2361." },
          { de: "tu", texto: "Autorizado a Ciudad de México, salida UDGUV 2B, luego ruta del plan de vuelo, ascienda y mantenga 16 000 pies, frecuencia de salida 120.8, transpondedor 2361, XA-VAA." },
          { de: "atc", texto: "XA-VAA, colación correcta." },
        ],
      },
      {
        titulo: "Remolque y rodaje con Rodaje Norte",
        frecuencia: "121.0",
        nota: "La Terminal 4 está del lado norte, así que le hablas a Rodaje Norte. Si estuvieras en las Terminales 1, 2 o 3, sería Rodaje Sur en 121.7. Lo que nunca te puedes saltar en la colación: la pista y el punto de espera.",
        dialogo: [
          { de: "tu", texto: "Cancún Rodaje, XA-VAA, en la posición [la tuya] de la Terminal 4, con información Alfa, solicito remolque." },
          { de: "atc", texto: "XA-VAA, remolque aprobado, avise listo para rodar." },
          { de: "tu", texto: "Remolque aprobado, XA-VAA." },
          { de: "tu", texto: "Cancún Rodaje, XA-VAA, listo para rodar." },
          { de: "atc", texto: "XA-VAA, ruede a punto de espera pista 12L por [las calles que te asigne], QNH [el del ATIS]." },
          { de: "tu", texto: "Ruedo a punto de espera pista 12L por [las calles], QNH [valor], XA-VAA." },
        ],
      },
      {
        titulo: "Despega con Torre",
        frecuencia: "118.1",
        nota: "La 12L es la pista norte, así que es Torre en 118.1. Antes de entrar a la pista confirma que el GPS tiene la salida de esa misma pista: la UDGUV 2B, no la 2A de la 12R.",
        dialogo: [
          { de: "tu", texto: "Cancún Torre, XA-VAA, en punto de espera pista 12L, listo para salida." },
          { de: "atc", texto: "XA-VAA, viento 110 grados 10 nudos, pista 12L, autorizado a despegar." },
          { de: "tu", texto: "Pista 12L, autorizado a despegar, XA-VAA." },
        ],
      },
      {
        titulo: "Pasa con Salidas",
        frecuencia: "120.8",
        nota: "Como sales al oeste, es la frecuencia 120.8 que anotaste. Al primer contacto di tu altitud, a qué altitud subes y en qué salida vas.",
        dialogo: [
          { de: "atc", texto: "XA-VAA, contacte Cancún Aproximación en 120.8." },
          { de: "tu", texto: "120.8, XA-VAA." },
          { de: "tu", texto: "Cancún Aproximación, XA-VAA, pasando 3000 pies para 16 000, en la salida UDGUV 2B." },
        ],
      },
    ],
  },
  salidas: {
    titulo: "Las salidas, por dirección",
    intro:
      "Cada pista tiene su versión de cada salida RNAV, y la letra te dice de qué pista es: A para la 12R, B para la 12L, E para la 30R y F para la 30L (cartas 10-3D a 10-3G). La excepción es ALSUP desde la 12: 1C para la 12R y 1D para la 12L. Todas piden RNAV 1 con GNSS, y varias tienen un máximo de 230 kt en el primer viraje. Si tu avión no tiene GPS, hay salidas convencionales (cartas 10-3 a 10-3C).",
    tarjetas: [
      {
        nombre: "Al norte",
        etiqueta: "NOSUG · ROTGI",
        tipo: "12R: 2A · 12L: 2B · 30R: 2E · 30L: 2F",
        vigencia: "29 ago 2025",
        restricciones: ["Terminan en FL270", "Sin gradiente especial"],
      },
      {
        nombre: "Al este",
        etiqueta: "NUDAL",
        tipo: "12R: 1A · 12L: 1B · 30R: 1E · 30L: 1F",
        vigencia: "29 ago 2025",
        restricciones: ["Sin gradiente especial"],
      },
      {
        nombre: "Al sureste",
        etiqueta: "HECAT · TAKUX · AVSEB",
        tipo: "Desde la 12: HECAT y TAKUX (2A · 2B). Desde la 30: AVSEB (1E · 1F)",
        vigencia: "29 ago 2025",
        restricciones: ["HECAT y TAKUX solo salen de la 12; AVSEB, solo de la 30", "AVSEB: 5.8 % hasta 11 000 ft"],
      },
      {
        nombre: "Al sur, por Cozumel",
        etiqueta: "ALSUP",
        tipo: "12R: 1C · 12L: 1D · 30R: 1E · 30L: 1F",
        vigencia: "29 ago 2025",
        restricciones: ["Desde la 12: 5.3 % hasta 19 000 ft", "Desde la 30: 5.8 % hasta 11 000 ft"],
      },
      {
        nombre: "Al oeste",
        etiqueta: "UDGUV",
        tipo: "12R: 2A · 12L: 2B · 30R: 1E · 30L: 1F",
        vigencia: "29 ago 2025",
        restricciones: ["Desde la 12: 4.6 % hasta 16 000 ft", "Cruzas UDGUV entre 16 000 ft y FL200, a no más de 280 kt"],
      },
    ],
  },
  llegadas: {
    intro:
      "Hay seis puntos de entrada, y cada llegada RNAV (STAR) viene en una versión para las pistas 12 y otra para las 30. Todas piden RNAV 1 con GNSS. Las de la 12 terminan al noroeste del aeropuerto; las de la 30, al sureste.",
    puntos: [
      { punto: "NOSAT", desde: "Noreste" },
      { punto: "ILUBA", desde: "Este" },
      { punto: "SIGMA", desde: "Sur" },
      { punto: "PAULE", desde: "Suroeste" },
      { punto: "XUDUN", desde: "Oeste" },
      { punto: "VOMAR", desde: "Noroeste, sobre el Golfo" },
    ],
    notas: [
      {
        titulo: "Pistas 12L y 12R",
        texto:
          "ILUBA 1E o 1F, PAULE 3G o 3H y SIGMA 2G o 2H terminan en EBMIS; las dos versiones solo cambian la altitud ahí (2000 o 3000 ft) y ELINO, antes, se cruza a no más de 200 kt. VOMAR 1A termina en VIKSI (4000 ft), XUDUN 1A en KAROR (3000 ft) y NOSAT 1B en RIDUG (3000 ft). Cartas 10-2 y 10-2B.",
      },
      {
        titulo: "Pistas 30L y 30R",
        texto:
          "ILUBA 1G, PAULE 2K y SIGMA 2J terminan en SESLI (3000 ft, no más de 220 kt). VOMAR 1C y NOSAT 1D terminan en OTSOL (3000 ft), y XUDUN 1D o 1E, en LOPKA (2000 o 3000 ft). Cartas 10-2A y 10-2C.",
      },
    ],
    dialogo: [
      { de: "tu", texto: "Cancún Llegadas, XA-VAA, nivel de vuelo 210 en la llegada XUDUN 1A, con información Charlie." },
      { de: "atc", texto: "XA-VAA, identificado, descienda y mantenga 10 000 pies, QNH [el del ATIS], espere aproximación ILS Z pista 12R." },
      { de: "tu", texto: "Desciendo y mantengo 10 000 pies, QNH [valor], espero ILS Z pista 12R, XA-VAA." },
    ],
    pie: "Ejemplo de primer contacto. El nivel, la letra y la llegada dependen de tu vuelo.",
  },
  ils: {
    intro:
      "Solo las pistas 12L y 12R tienen ILS, cada una en tres versiones (Z, Y y X). La 30L y la 30R tienen aproximación RNP y VOR: si te dan la 30, no busques el ILS. Con las dos pistas en uso, revisa que sintonizaste el localizador de tu pista.",
    aproximaciones: [
      {
        nombre: "ILS Z pista 12L",
        carta: "11-1",
        vigencia: "14 mar 2025",
        localizador: "INCP 110.7",
        curso: "125°",
        minimo: "DA 250 ft (228 ft sobre la pista)",
        obligatorio: "D4.3 INCP (D5.9 NCP) a 1400 ft.",
        frustrada:
          "Vira a la izquierda saliendo por el radial 043 del VOR CUN, mantén 2000 ft hasta D8.0 CUN, sigue subiendo a 3000 ft y espera entre D13.0 y D17.0 CUN; luego, lo que indique el controlador.",
      },
      {
        nombre: "ILS Z pista 12R",
        carta: "11-4",
        vigencia: "14 mar 2025",
        localizador: "ICUN 111.1",
        curso: "125°",
        minimo: "DA 220 ft (200 ft sobre la pista)",
        obligatorio: "D4.0 ICUN (D6.0 CUN) a 1300 ft.",
        frustrada:
          "Vira a la derecha saliendo por el radial 231 del VOR CUN, mantén 2000 ft hasta D9.0 CUN, sigue subiendo a 4000 ft y espera entre D13.0 y D17.0 CUN; luego, lo que indique el controlador.",
      },
    ],
  },
  errores: [
    { error: "Llamar sin haber escuchado el ATIS.", mejor: "Primero 127.7. Sin la letra, el controlador te la tiene que dar y ya empezaste atrasado." },
    {
      error: "Confundir las dos pistas paralelas.",
      mejor: "La 12L/30R es la del norte (9186 ft) y la 12R/30L, la del sur (11 483 ft). Colaciona siempre la letra: «doce izquierda» no es «doce derecha».",
    },
    {
      error: "Cargar la salida de la otra pista.",
      mejor: "La letra manda: A para la 12R, B para la 12L, E para la 30R y F para la 30L. La excepción es ALSUP desde la 12: 1C para la 12R y 1D para la 12L.",
    },
    {
      error: "Llamar al Rodaje del otro lado.",
      mejor: "Rodaje Norte (121.0) es para la Terminal 4; Rodaje Sur (121.7), para las Terminales 1, 2 y 3. Lo mismo con Torre: 118.1 para la pista norte y 118.6 para la sur.",
    },
    {
      error: "Pedir la HECAT o la TAKUX desde la 30.",
      mejor: "Solo existen desde la 12. Si sales de la 30 hacia el sureste, la salida es la AVSEB.",
    },
    {
      error: "Creer que a nivel del mar no hay gradiente.",
      mejor:
        "La ALSUP desde la 12 pide 5.3 % hasta 19 000 ft: a 150 kt sobre el suelo son 805 ft por minuto durante toda la subida. Revisa la tabla de la carta y, si no llegas, contesta «imposible» antes de despegar.",
    },
    { error: "Intentar memorizar la autorización.", mejor: "Escríbela en orden CRAFT. Si te falta una parte, pídela antes de colacionar." },
    { error: "Cambiar a 29.92 al pasar 18 000 ft.", mejor: "La altitud de transición es 18 500 ft. Abajo de ella vuelas con el QNH del ATIS." },
    {
      error: "Bajar con 29.92 hasta la aproximación.",
      mejor: "Al descender, pon el QNH al cruzar el nivel de transición, FL195. En MMUN se da en pulgadas; en milibares, solo si lo pides.",
    },
    {
      error: "Esperar un ILS en la 30.",
      mejor: "La 30L y la 30R no tienen ILS: lleva lista la RNP (cartas 12-3 y 12-4) o el VOR. El ILS es solo de las 12.",
    },
    {
      error: "Virar al lado equivocado en la frustrada.",
      mejor:
        "Con las dos pistas en uso, las frustradas se separan: desde la 12L viras a la izquierda y desde la 12R, a la derecha. Repásala antes de empezar la aproximación, no cuando ya vas al aire.",
    },
    {
      error: "En IVAO o VATSIM, llamar a una frecuencia que nadie atiende.",
      mejor:
        "Revisa quién está conectado. Si no hay Autorizaciones, llama al siguiente que sí esté: Rodaje, Torre o Aproximación. Si no hay nadie, anuncia tus movimientos en Unicom 122.8.",
    },
  ],
  fuentes: "Procedimientos y frecuencias de las cartas Jeppesen vía Navigraph, consultadas el 5 de noviembre de 2026; cada tarjeta trae la fecha de su carta.",
};
