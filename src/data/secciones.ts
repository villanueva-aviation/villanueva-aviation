import { ROUTES } from "../lib/routes";
import { DISCORD_URL } from "../lib/constants";
import { ACADEMIA_MODULOS } from "./academia";
import { TOTAL_AVIONES, fotoFlota } from "./flota";

// Las cuatro secciones del sitio (casa del simulador, nov 2026). Las usan el menú, la portada y cada página de sección.
export interface Tarjeta {
  titulo: string;
  texto: string;
  to: string;
  img: { src: string; srcSet?: string };
  alt: string;
}

export interface Seccion {
  clave: "vuela" | "hangar" | "aprende" | "comunidad";
  nombre: string;
  to: string;
  titulo: string;
  descripcion: string;
  /** Una línea para la tarjeta de la portada. */
  resumen: string;
  img: { src: string; srcSet?: string };
  tarjetas: Tarjeta[];
}

export const SECCIONES: Seccion[] = [
  {
    clave: "vuela",
    nombre: "Vuela",
    to: ROUTES.vuela,
    titulo: "Todo para preparar y volar tu próximo vuelo",
    descripcion: "Rutas de México, el clima real decodificado y la planeación del vuelo, hechos para el simulador y en español.",
    resumen: "Rutas de México, briefing con el METAR real, plan de vuelo, peso y balance y bitácora.",
    img: fotoFlota("c172"),
    tarjetas: [
      {
        titulo: "Rutas de México",
        texto: "Rutas VFR entre aeropuertos mexicanos con rumbos, frecuencias, el terreno de abajo y un plan de vuelo listo para cargar en MSFS.",
        to: ROUTES.rutas,
        img: { src: "/images/descargas-rutas-mexico.jpg" },
        alt: "Mapa de rutas VFR entre aeropuertos de México",
      },
      {
        titulo: "Briefing del piloto",
        texto: "El METAR y el TAF de tu aeropuerto decodificados en español, con categoría de vuelo, viento cruzado y altitud de densidad.",
        to: ROUTES.briefing,
        img: { src: "/images/descargas-briefing-piloto.jpg" },
        alt: "Briefing con el METAR y el TAF decodificados",
      },
      {
        titulo: "Plan de vuelo VFR",
        texto: "Llena el formato en pantalla para planear tu vuelo tramo por tramo, y después imprímelo.",
        to: ROUTES.planVuelo,
        img: { src: "/images/descargas-guia-vfr-carta.jpg" },
        alt: "Carta VFR con una ruta trazada",
      },
      {
        titulo: "Peso y balance",
        texto: "Calcula el peso total y el centro de gravedad de tu vuelo antes de despegar.",
        to: ROUTES.pesoBalance,
        img: fotoFlota("c208"),
        alt: "Cessna 208 Caravan XB-CVN en vuelo, captura de simulador",
      },
      {
        titulo: "Bitácora de vuelo",
        texto: "Registra tus vuelos en pantalla e imprime tu bitácora.",
        to: ROUTES.bitacoraVuelo,
        img: fotoFlota("da40"),
        alt: "Diamond DA40 XB-NGD en vuelo, captura de simulador",
      },
    ],
  },
  {
    clave: "hangar",
    nombre: "Hangar",
    to: ROUTES.hangar,
    titulo: "Equipa tu cabina",
    descripcion: "Dashes, checklists, paneles y configuraciones para que tu simulador se sienta como un avión de verdad.",
    resumen: "Dashes de SimHub, checklists y guías, paneles, controles y la flota de la casa.",
    img: { src: "/images/descargas-simhub-c152.jpg" },
    tarjetas: [
      {
        titulo: "Dashes de SimHub",
        texto: "Los instrumentos de tu avión en una pantalla extra, con el valor exacto bajo cada uno. El del C152 es gratis; cinco aviones más vienen en Contenido Exclusivo.",
        to: ROUTES.descargas,
        img: { src: "/images/descargas-simhub-c152.jpg" },
        alt: "Dash de SimHub con los seis instrumentos del Cessna 152",
      },
      {
        titulo: "Descargas",
        texto: "Checklists, guías y plantillas en PDF para tener a la mano mientras vuelas.",
        to: ROUTES.descargas,
        img: { src: "/images/descargas-checklist-c172.jpg" },
        alt: "Checklist del Cessna 172 en PDF",
      },
      {
        titulo: "Paneles y segunda pantalla",
        texto: "Qué herramienta usar para ver tus instrumentos, datos y mapa en otra pantalla o una tablet, y cómo configurarla.",
        to: ROUTES.paneles,
        img: { src: "/images/paneles/c172-panel.webp" },
        alt: "Panel de instrumentos de un Cessna 172, captura de simulador",
      },
      {
        titulo: "Configura tus controles",
        texto: "Ejes, botones, zona muerta y sensibilidad para joystick o yoke con cuadrante, para que el avión no se vaya solo.",
        to: ROUTES.controles,
        img: { src: "/images/temas/fundamentos-tema7-1-yoke.jpg" },
        alt: "Yoke de un avión ligero",
      },
      {
        titulo: "La flota",
        texto: `${TOTAL_AVIONES} aviones con los colores de Villanueva Aviation, del Cessna 152 a los turbohélices, con sus matrículas XB.`,
        to: ROUTES.flota,
        img: fotoFlota("c90"),
        alt: "King Air C90 XB-KNG en vuelo, captura de simulador",
      },
    ],
  },
  {
    clave: "aprende",
    nombre: "Aprende",
    to: ROUTES.aprende,
    titulo: "Aprende aviación de verdad con tu simulador",
    descripcion: "La Academia gratis, prácticas cortas para la radio y la navegación y, si quieres ir más rápido, asesorías 1 a 1 con el fundador.",
    resumen: "La Academia gratis, el test de nivel, prácticas de radio y navegación y asesorías 1 a 1.",
    img: fotoFlota("seneca"),
    tarjetas: [
      {
        titulo: "Descubre tu nivel",
        texto: "Doce preguntas de seis áreas, unos tres minutos y sin crear cuenta. Ves por dónde te conviene seguir.",
        to: ROUTES.testNivel,
        img: fotoFlota("c152"),
        alt: "Cessna 152 XB-CDT en vuelo, captura de simulador",
      },
      {
        titulo: "La Academia",
        texto: `${ACADEMIA_MODULOS.length} módulos de Fundamentos a IFR, con lecciones, ejercicios interactivos y un proyecto final. Gratis con tu cuenta.`,
        to: ROUTES.academia,
        img: fotoFlota("c172"),
        alt: "Cessna 172 XB-VNA en vuelo, captura de simulador",
      },
      {
        titulo: "Listo para volar en red",
        texto: "Ocho lecciones para volar IFR de MMGL a MMMX en IVAO o VATSIM sin trabarte con la radio.",
        to: ROUTES.rutaRed,
        img: { src: "/images/msfs-volaris-climb.jpg" },
        alt: "Avión de línea en ascenso, captura de simulador",
      },
      {
        titulo: "Guía de Guadalajara (MMGL)",
        texto: "Cada llamada de la salida IFR en orden: qué te dice el control, qué contestas y los errores más comunes.",
        to: ROUTES.aeropuertoMMGL,
        img: { src: "/images/descargas-guia-comunicaciones-ifr.jpg" },
        alt: "Guía de comunicaciones IFR",
      },
      {
        titulo: "Guía de Ciudad de México (MMMX)",
        texto: "Las salidas y llegadas con su letra de pista, los ILS y cada llamada de radio en orden.",
        to: ROUTES.aeropuertoMMMX,
        img: { src: "/images/msfs-aeromexico-clouds.jpg" },
        alt: "Avión de línea sobre las nubes, captura de simulador",
      },
      {
        titulo: "Guía de Monterrey (MMMY)",
        texto: "Qué letra cargar en cada pista, el gradiente de cada salida, el ILS de la 30 y cada llamada de radio en orden.",
        to: ROUTES.aeropuertoMMMY,
        img: { src: "/images/msfs-sunset-wing.jpg" },
        alt: "Ala de un avión al atardecer, captura de simulador",
      },
      {
        titulo: "Guía de Cancún (MMUN)",
        texto: "Las dos pistas paralelas sin confundirte: qué salida, qué frecuencia y qué ILS van con cada una, y cada llamada en orden.",
        to: ROUTES.aeropuertoMMUN,
        img: { src: "/images/msfs-volaris-climb.jpg" },
        alt: "Avión de línea en ascenso, captura de simulador",
      },
      {
        titulo: "Gimnasio de autorizaciones",
        texto: "Escucha autorizaciones IFR en inglés a la velocidad que elijas, hasta que las copies a la primera.",
        to: ROUTES.gimnasioAutorizaciones,
        img: { src: "/images/msfs-aeromexico-clouds.jpg" },
        alt: "Avión de línea sobre las nubes, captura de simulador",
      },
      {
        titulo: "Entrenador de esperas",
        texto: "Te damos la espera y tu rumbo: elige la entrada directa, gota o paralela en menos de 15 segundos.",
        to: ROUTES.entrenadorEsperas,
        img: { src: "/images/descargas-guia-hsi.jpg" },
        alt: "Guía del HSI",
      },
      {
        titulo: "Asesorías 1 a 1",
        texto: "Un plan escrito para ti y sesiones en vivo por Discord con el fundador. Empiezas con un diagnóstico gratis.",
        to: ROUTES.asesorias,
        img: fotoFlota("a36"),
        alt: "Beechcraft Bonanza A36 XB-BNZ en vuelo, captura de simulador",
      },
    ],
  },
  {
    clave: "comunidad",
    nombre: "Comunidad",
    to: ROUTES.comunidad,
    titulo: "Vuela acompañado",
    descripcion: "Pilotos de simulador de todo el mundo hispano que vuelan, se ayudan y organizan eventos juntos.",
    resumen: "El Discord, la Aventura y Axolojet Virtual, nuestra aerolínea aliada.",
    img: { src: "/images/aventura-hero-2.webp" },
    tarjetas: [
      {
        titulo: "El Discord",
        texto: "Resuelve dudas, comparte tus vuelos y vuela con otros pilotos de simulador. Es gratis.",
        to: DISCORD_URL,
        img: { src: "/images/msfs-sunset-wing.jpg" },
        alt: "Ala de un avión al atardecer, captura de simulador",
      },
      {
        titulo: "Eventos de IVAO y VATSIM",
        texto: "Los próximos eventos con control en el mundo hispano, y el vuelo del mes que hacemos en grupo.",
        to: ROUTES.eventos,
        img: { src: "/images/msfs-volaris-climb.jpg" },
        alt: "Avión de línea en ascenso, captura de simulador",
      },
      {
        titulo: "La Aventura",
        texto: "Un viaje en Cessna 152 que sale de Guadalajara y no se salta ningún aeropuerto. Cada aterrizaje queda registrado con su video.",
        to: ROUTES.aventura,
        img: { src: "/images/aventura-hero-2.webp" },
        alt: "Vuelo de la Aventura, captura de simulador",
      },
      {
        titulo: "Axolojet Virtual",
        texto: "Nuestra aerolínea virtual aliada en IVAO, con base en Guadalajara: tours en grupo y eventos con ATC, del TBM al 747.",
        to: "https://axolojetva.com",
        img: { src: "/images/axolojet-737-max.webp" },
        alt: "Boeing 737 MAX con los colores de Axolojet Virtual, captura de simulador",
      },
      {
        titulo: "Overlay gratis para streamers",
        texto: "¿Transmites tus vuelos? Mapa en vivo, datos de IVAO o VATSIM, SimBrief y METAR en tu OBS, con tu marca.",
        to: ROUTES.overlayGratis,
        img: { src: "/images/msfs-xbvla-farmland-1280.jpg" },
        alt: "Cessna XB-VLA sobre campos de cultivo, captura de simulador",
      },
    ],
  },
];

export const seccion = (clave: Seccion["clave"]) => SECCIONES.find((s) => s.clave === clave)!;
