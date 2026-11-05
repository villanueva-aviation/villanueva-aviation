import type { Guia } from "../../features/aeropuertos/GuiaAeropuerto";
import { ROUTES } from "../../lib/routes";

// Datos: cartas Jeppesen vía Navigraph leídas el 2026-11-05. Frecuencias: plano 10-9 (8 may 2026) y briefing de
// salida 10-1P1 (1 ago 2025): Control de Plataforma lleva al avión a un punto de transferencia y de ahí pasa a Torre.
// Salidas RNAV: 10-3A (pista 04, 31 jul 2026) y 10-3B (pista 22, 28 ago 2026); convencionales: 10-3, 10-3C y 10-3D.
// Llegadas RNAV: 10-2 (pista 22) y 10-2A (pista 04), del 9 may 2025. Sin ILS: RNP 04 (12-1) y RNP 22 (12-2), del
// 9 may 2025. Sin puntos VFR: falta la carta de aproximación visual del AIP. Si una carta cambia, cambia aquí.

export const MMPR: Guia = {
  icao: "MMPR",
  ruta: ROUTES.aeropuertoMMPR,
  hero: {
    titulo: "Puerto Vallarta MMPR: entre la sierra y el mar, sin trabarte en la radio",
    descripcion:
      "Cada llamada de la salida IFR en orden: a quién le hablas, qué te van a decir y qué contestas. Con las salidas, las llegadas, las aproximaciones RNP y los errores que más vemos en la red.",
  },
  ficha: [
    { dato: "Elevación", valor: "23 ft" },
    { dato: "Pista", valor: "04/22" },
    { dato: "Altitud de transición", valor: "18 500 ft" },
    { dato: "VOR", valor: "PVR 116.5" },
  ],
  frecuencias: [
    { quien: "ATIS", mhz: "127.5", para: "Escuchas la letra, la pista en uso y el QNH, que en MMPR se da en pulgadas. No se le habla." },
    { quien: "Autorizaciones", mhz: "121.9", para: "Pides tu autorización IFR. En el mundo real se pide dentro de los 15 minutos antes de salir." },
    {
      quien: "Control de Plataforma",
      mhz: "134.1",
      para: "En MMPR no hay Rodaje: Plataforma te autoriza el encendido y el remolque, y te deja en un punto de transferencia (R1 a R7). Si sales del FBO, la plataforma es AEROTRON en 130.65.",
    },
    { quien: "Torre", mhz: "118.5", para: "Desde el punto de transferencia te lleva al punto de espera, y te autoriza a despegar y a aterrizar." },
    {
      quien: "Aproximación",
      mhz: "119.0 · 121.3",
      para: "Vallarta Aproximación te recibe al despegar y te baja en la llegada. La frecuencia de salida viene en tu autorización (la F de CRAFT).",
    },
  ],
  pasos: {
    intro:
      "Ejemplo con un Boeing 737 matrícula XA-VAA en la posición 9 de la plataforma comercial, pista 22, rumbo a Guadalajara. La salida, la altitud y el código son de ejemplo: los tuyos te los da el controlador.",
    items: [
      {
        titulo: "Escucha el ATIS",
        frecuencia: "127.5",
        nota: "Anota la letra, la pista en uso y el QNH antes de hablar con nadie. La pista te dice qué letra lleva tu salida: en la 04, A o C; en la 22, B o D.",
        dialogo: [],
      },
      {
        titulo: "Pide tu autorización IFR",
        frecuencia: "121.9",
        nota: "Ten la libreta lista con C-R-A-F-T y escribe mientras te dictan. Al final lees todo de vuelta, en el mismo orden.",
        dialogo: [
          { de: "tu", texto: "Vallarta Autorizaciones, XA-VAA, Boeing 737 en la posición 9, con información Bravo, solicito autorización IFR a Guadalajara." },
          { de: "atc", texto: "XA-VAA, autorizado a Guadalajara, salida KASUP 1D, luego ruta del plan de vuelo, ascienda y mantenga 17 000 pies, frecuencia de salida 119.0, transpondedor 3145." },
          { de: "tu", texto: "Autorizado a Guadalajara, salida KASUP 1D, luego ruta del plan de vuelo, ascienda y mantenga 17 000 pies, frecuencia de salida 119.0, transpondedor 3145, XA-VAA." },
          { de: "atc", texto: "XA-VAA, colación correcta." },
        ],
      },
      {
        titulo: "Encendido y remolque con Plataforma",
        frecuencia: "134.1",
        nota: "Plataforma te saca de la posición y te deja en un punto de transferencia; ahí termina su parte. No sigas rodando sin hablar con Torre.",
        dialogo: [
          { de: "tu", texto: "Vallarta Plataforma, XA-VAA, en la posición 9, con información Bravo, solicito encendido y remolque." },
          { de: "atc", texto: "XA-VAA, encendido y remolque aprobados hacia el punto de transferencia R5, ahí contacte Torre en 118.5." },
          { de: "tu", texto: "Encendido y remolque aprobados hacia R5, luego Torre en 118.5, XA-VAA." },
        ],
      },
      {
        titulo: "Rodaje y despegue con Torre",
        frecuencia: "118.5",
        nota: "Torre hace el trabajo de Rodaje y el de Torre. Lo que nunca te puedes saltar en la colación: la pista y el punto de espera. Antes de entrar a la pista confirma que el GPS tiene la KASUP 1D, no la 1C de la 04.",
        dialogo: [
          { de: "tu", texto: "Vallarta Torre, XA-VAA, en el punto de transferencia R5, listo para rodar." },
          { de: "atc", texto: "XA-VAA, ruede a punto de espera pista 22 por [las calles que te asigne], QNH [el del ATIS]." },
          { de: "tu", texto: "Ruedo a punto de espera pista 22 por [las calles], QNH [valor], XA-VAA." },
          { de: "tu", texto: "Vallarta Torre, XA-VAA, en punto de espera pista 22, listo para salida." },
          { de: "atc", texto: "XA-VAA, viento 230 grados 8 nudos, pista 22, autorizado a despegar." },
          { de: "tu", texto: "Pista 22, autorizado a despegar, XA-VAA." },
        ],
      },
      {
        titulo: "Pasa con Aproximación",
        frecuencia: "119.0",
        nota: "Torre te pasa con la frecuencia de salida que anotaste. Al primer contacto di tu altitud, a qué altitud subes y en qué salida vas.",
        dialogo: [
          { de: "atc", texto: "XA-VAA, contacte Vallarta Aproximación en 119.0." },
          { de: "tu", texto: "119.0, XA-VAA." },
          { de: "tu", texto: "Vallarta Aproximación, XA-VAA, pasando 3000 pies para 17 000, en la salida KASUP 1D." },
        ],
      },
    ],
  },
  salidas: {
    titulo: "Las salidas, por dirección",
    intro:
      "MMPR tiene cuatro salidas RNAV, cada una en dos versiones: la de la pista 04 termina en A o C (carta 10-3A) y la de la 22, en B o D (carta 10-3B). Todas piden RNAV 1 con GNSS y radar, y todas el mismo gradiente: 6.3 %, por la sierra que está al este. Si tu avión no tiene GPS, hay salidas convencionales (cartas 10-3, 10-3C y 10-3D).",
    tarjetas: [
      {
        nombre: "Al noroeste, sobre el mar",
        etiqueta: "BOBDI",
        tipo: "Pista 04: 1A · pista 22: 2B",
        vigencia: "31 jul / 28 ago 2026",
        restricciones: ["Pista 04: 6.3 % hasta 16 000 ft", "Pista 22: 6.3 % hasta 13 000 ft", "Termina en FL200"],
      },
      {
        nombre: "Al norte",
        etiqueta: "XUDED",
        tipo: "Pista 04: 1A · pista 22: 2B",
        vigencia: "31 jul / 28 ago 2026",
        restricciones: ["Pista 04: 6.3 % hasta 16 000 ft", "Pista 22: 6.3 % hasta 13 000 ft", "Termina en FL220"],
      },
      {
        nombre: "Al este",
        etiqueta: "KASUP",
        tipo: "Pista 04: 1C · pista 22: 1D",
        vigencia: "31 jul / 28 ago 2026",
        restricciones: ["Pista 04: 6.3 % hasta 16 000 ft", "Pista 22: 6.3 % hasta 13 000 ft", "Termina en FL200"],
      },
      {
        nombre: "Al sureste",
        etiqueta: "VOLAT",
        tipo: "Pista 04: 1C · pista 22: 1D",
        vigencia: "31 jul / 28 ago 2026",
        restricciones: ["Pista 04: 6.3 % hasta 16 000 ft", "Pista 22: 6.3 % hasta 13 000 ft", "Termina en FL200"],
      },
    ],
  },
  llegadas: {
    intro:
      "Hay seis puntos de entrada. Cada llegada RNAV (STAR) es de una sola pista, y no todas existen para las dos: desde ESVEL y LIPEP solo hay llegada a la 22. Todas piden RNAV 1.",
    puntos: [
      { punto: "OBRUG", desde: "Noroeste, sobre el mar" },
      { punto: "KEDIX", desde: "Oeste, sobre el mar" },
      { punto: "KEDMA", desde: "Norte, por el VOR de Tepic" },
      { punto: "ESVEL", desde: "Noreste" },
      { punto: "NOTUP", desde: "Este" },
      { punto: "LIPEP", desde: "Sureste" },
    ],
    notas: [
      {
        titulo: "Pista 04",
        texto:
          "KEDIX 1A, KEDMA 1A y OBRUG 1A terminan en RORPO, sobre la bahía; NOTUP 1A termina en MAYTE, al sur. Las dos se cruzan a 4000 ft y a no más de 220 kt. Carta 10-2A.",
      },
      {
        titulo: "Pista 22",
        texto:
          "KEDIX 1B y OBRUG 1B terminan en MUVBA (5500 ft); ESVEL 1, KEDMA 1B, LIPEP 1E y NOTUP 1B, en VETKA (5000 ft). Las dos están al noreste del aeropuerto, junto a la sierra, y se cruzan a no más de 220 kt. Carta 10-2.",
      },
    ],
    dialogo: [
      { de: "tu", texto: "Vallarta Aproximación, XA-VAA, nivel de vuelo 200 en la llegada NOTUP 1B, con información Charlie." },
      { de: "atc", texto: "XA-VAA, identificado, descienda y mantenga 9000 pies, QNH [el del ATIS], espere aproximación RNP pista 22." },
      { de: "tu", texto: "Desciendo y mantengo 9000 pies, QNH [valor], espero RNP pista 22, XA-VAA." },
    ],
    pie: "Ejemplo de primer contacto. El nivel, la letra y la llegada dependen de tu vuelo.",
  },
  ils: {
    titulo: "Las aproximaciones",
    etiquetaGuia: "Navegación",
    intro:
      "MMPR no tiene ILS. Cada pista tiene una aproximación RNP y varias VOR (cuatro a la 04 y tres a la 22). Las RNP son solo LNAV: tienen MDA, no DA, y la senda de 3.10° es de referencia. Si tu avión no tiene GPS, usa una VOR con el VOR PVR 116.5.",
    aproximaciones: [
      {
        nombre: "RNP pista 04",
        carta: "12-1",
        vigencia: "9 may 2025",
        localizador: "RNP (GNSS)",
        curso: "040°",
        minimo: "MDA 560 ft (549 ft sobre la pista), solo LNAV",
        obligatorio: "PR400 a 1700 ft.",
        frustrada:
          "Sube por el rumbo de la pista hasta PR409 y sigue la frustrada hasta VIMSO, donde esperas a 6000 ft; luego, lo que indique el controlador.",
      },
      {
        nombre: "RNP pista 22",
        carta: "12-2",
        vigencia: "9 may 2025",
        localizador: "RNP (GNSS)",
        curso: "220°",
        minimo: "MDA 720 ft (697 ft sobre la pista), solo LNAV",
        obligatorio: "PR404 a 1700 ft.",
        frustrada:
          "Sube por el rumbo de la pista hasta PR557 y sigue la frustrada hasta VIMSO, donde esperas a 6000 ft; luego, lo que indique el controlador.",
      },
    ],
  },
  errores: [
    { error: "Llamar sin haber escuchado el ATIS.", mejor: "Primero 127.5. Sin la letra, el controlador te la tiene que dar y ya empezaste atrasado." },
    {
      error: "Buscar a Rodaje.",
      mejor: "En MMPR no hay Rodaje. El encendido y el remolque te los da Plataforma en 134.1, y el rodaje a la pista, Torre en 118.5.",
    },
    {
      error: "Seguir rodando después del punto de transferencia.",
      mejor: "Plataforma te deja en un punto de transferencia (R1 a R7) y ahí termina su parte. Detente y llama a Torre antes de moverte.",
    },
    { error: "Cargar la salida de la otra pista.", mejor: "La letra manda: A o C para la 04, B o D para la 22. BOBDI 1A y BOBDI 2B no son la misma salida." },
    {
      error: "Creer que por estar a nivel del mar, cualquier avión sube.",
      mejor:
        "Todas las salidas piden 6.3 % hasta 16 000 ft desde la 04 y hasta 13 000 ft desde la 22: a 150 kt sobre el suelo son 957 ft por minuto. Revisa la tabla de la carta y, si no llegas, contesta «imposible» antes de despegar.",
    },
    {
      error: "Llegar rápido al primer viraje.",
      mejor: "Desde la 22, los primeros puntos de la salida se cruzan a no más de 200 kt; desde la 04, PR502 a no más de 220 kt. Revísalo en la carta antes de despegar.",
    },
    { error: "Esperar un ILS.", mejor: "MMPR no tiene ILS. Lleva lista la RNP de tu pista o, sin GPS, una VOR." },
    {
      error: "Tratar la MDA como si fuera una DA.",
      mejor: "En la RNP bajas hasta la MDA y te nivelas. Si al llegar al punto de frustrada no ves la pista, frustras; no sigues bajando.",
    },
    {
      error: "Bajar antes de tiempo en la llegada.",
      mejor: "La sierra está pegada al aeropuerto: MUVBA se cruza a 5500 ft y VETKA a 5000. Respeta cada altitud de la llegada aunque ya veas el mar.",
    },
    { error: "Pedir una llegada desde ESVEL o LIPEP a la 04.", mejor: "Esas dos solo existen para la 22. Si te dan la 04, pide la llegada desde NOTUP, KEDMA, KEDIX u OBRUG." },
    {
      error: "Cambiar el altímetro en el lugar equivocado.",
      mejor: "Al subir, pon 29.92 al pasar 18 500 ft; al bajar, el QNH al cruzar FL195. En MMPR se da en pulgadas; en milibares, solo si lo pides.",
    },
    {
      error: "En IVAO o VATSIM, llamar a una frecuencia que nadie atiende.",
      mejor:
        "Revisa quién está conectado. Si no hay Autorizaciones, llama al siguiente que sí esté: Torre o Aproximación. Si no hay nadie, anuncia tus movimientos en Unicom 122.8.",
    },
  ],
  fuentes: "Procedimientos y frecuencias de las cartas Jeppesen vía Navigraph, consultadas el 5 de noviembre de 2026; cada tarjeta trae la fecha de su carta.",
};
