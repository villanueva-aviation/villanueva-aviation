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
