export interface Hotspot {
  id: string;
  label: string;
  description: string;
  /** Posición en porcentaje sobre la foto (public/images/cessna-topview.png). */
  xPct: number;
  yPct: number;
}

export const CESSNA_HOTSPOTS: Hotspot[] = [
  {
    id: "motor",
    label: "Motor / Hélice",
    description: "Produce el empuje que mueve la aeronave hacia adelante.",
    xPct: 24,
    yPct: 67.5,
  },
  {
    id: "tren",
    label: "Tren de aterrizaje",
    description: "Soporta el peso de la aeronave en tierra y absorbe el impacto del aterrizaje.",
    xPct: 53.4,
    yPct: 79.6,
  },
  {
    id: "cabina",
    label: "Cabina",
    description: "Espacio donde viajan el piloto y los pasajeros; aloja los instrumentos de vuelo.",
    xPct: 37.4,
    yPct: 53.3,
  },
  {
    id: "fuselaje",
    label: "Fuselaje",
    description: "Estructura principal que conecta la cabina con el empenaje y aloja la carga.",
    xPct: 43.9,
    yPct: 65.6,
  },
  {
    id: "ala",
    label: "Ala",
    description: "Genera la mayor parte de la sustentación gracias a su perfil aerodinámico.",
    xPct: 25.5,
    yPct: 25.2,
  },
  {
    id: "aleron",
    label: "Alerón",
    description: "Superficie móvil en el borde de salida, hacia la punta del ala, que controla el alabeo (roll).",
    xPct: 17.8,
    yPct: 10.6,
  },
  {
    id: "flaps",
    label: "Flaps",
    description: "Superficie móvil en el borde de salida, cerca del fuselaje, que aumenta la sustentación en despegue y aterrizaje.",
    xPct: 41.7,
    yPct: 32.2,
  },
  {
    id: "estabilizador-horizontal",
    label: "Estabilizador horizontal",
    description: "Superficie fija de la cola que da estabilidad de cabeceo (pitch) a la aeronave.",
    xPct: 77.8,
    yPct: 34.3,
  },
  {
    id: "elevador",
    label: "Elevador",
    description: "Superficie móvil en el borde de salida del estabilizador horizontal que controla el cabeceo (pitch).",
    xPct: 84.3,
    yPct: 32.2,
  },
  {
    id: "estabilizador-vertical",
    label: "Estabilizador vertical",
    description: "Superficie fija de la cola que da estabilidad direccional a la aeronave.",
    xPct: 75.8,
    yPct: 18.7,
  },
  {
    id: "timon",
    label: "Timón de dirección",
    description: "Superficie móvil en el borde de salida del estabilizador vertical que controla la guiñada (yaw).",
    xPct: 81.7,
    yPct: 10.3,
  },
];

/**
 * Los seis instrumentos analógicos básicos, en su distribución real: arriba
 * los tres de referencia primaria, abajo los tres de apoyo. Las descripciones
 * salen de los temas del módulo de Instrumentos, e incluyen de qué sistema se
 * alimenta cada uno — que es lo que explica cuáles se caen juntos cuando falla
 * el vacío, el pitot o la estática.
 */
export const SIXPACK_HOTSPOTS: Hotspot[] = [
  {
    id: "velocimetro",
    label: "Indicador de velocidad",
    description:
      "Mide la diferencia entre la presión dinámica del tubo pitot y la presión estática. Sus arcos de color marcan el rango de flaps (blanco), el de operación normal (verde), la zona de precaución (amarillo) y la Vne (línea roja). Sistema pitot-estático.",
    xPct: 20.0,
    yPct: 36.7,
  },
  {
    id: "horizonte",
    label: "Horizonte artificial",
    description:
      "Tu referencia primaria de actitud: muestra inclinación y cabeceo mediante un giroscopio que mantiene su orientación en el espacio. En IMC es la única referencia confiable sin visibilidad exterior. Accionado por vacío (o eléctrico en cabinas modernas).",
    xPct: 50.0,
    yPct: 36.7,
  },
  {
    id: "altimetro",
    label: "Altímetro",
    description:
      "Mide la altitud comparando la presión estática contra la referencia que ajustas en la ventana Kollsman. De alta a baja presión sin reajustar, te indica más altura de la que realmente tienes. Sistema pitot-estático (solo estática).",
    xPct: 80.0,
    yPct: 36.7,
  },
  {
    id: "coordinador",
    label: "Coordinador de giro",
    description:
      "Muestra la tasa de giro, no el ángulo de inclinación: el viraje estándar son 3° por segundo, 360° en dos minutos. La bola del inclinómetro indica si el viraje está coordinado, derrapando o resbalando. Alimentación eléctrica — por eso sobrevive a una falla de vacío.",
    xPct: 20.0,
    yPct: 75.6,
  },
  {
    id: "rumbo",
    label: "Indicador de rumbo",
    description:
      "Giroscopio direccional que muestra hacia dónde apunta la nariz, más estable que la brújula magnética porque no sufre errores de aceleración ni de viraje. Sufre precesión: hay que realinearlo con la brújula cada 15 minutos. Accionado por vacío.",
    xPct: 50.0,
    yPct: 75.6,
  },
  {
    id: "variometro",
    label: "Indicador de velocidad vertical",
    description:
      "Muestra la tasa de ascenso o descenso en pies por minuto, midiendo qué tan rápido cambia la presión estática. Responde con retraso de algunos segundos, así que sirve para confirmar una tendencia, no para perseguirla. Sistema pitot-estático (solo estática).",
    xPct: 80.0,
    yPct: 75.6,
  },
];

export interface HotspotSet {
  imagen: string;
  alt: string;
  puntos: Hotspot[];
}

export const HOTSPOT_SETS: Record<string, HotspotSet> = {
  cessna: {
    imagen: "/images/cessna-topview.png",
    alt: "Cessna 172 de Villanueva Aviation, vista superior",
    puntos: CESSNA_HOTSPOTS,
  },
  "six-pack": {
    imagen: "/images/temas/six-pack.svg",
    alt: "Panel con los seis instrumentos básicos de vuelo",
    puntos: SIXPACK_HOTSPOTS,
  },
  /** Solo las superficies que mueven la aeronave en sus tres ejes. Sirve para
   *  arrastrar etiquetas sin la ayuda del resto de la estructura. */
  superficies: {
    imagen: "/images/cessna-topview.png",
    alt: "Superficies de control del Cessna 172, vista superior",
    puntos: CESSNA_HOTSPOTS.filter((h) =>
      ["aleron", "flaps", "elevador", "timon", "estabilizador-horizontal", "estabilizador-vertical"].includes(h.id),
    ),
  },
};
