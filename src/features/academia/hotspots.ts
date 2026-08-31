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
    id: "ala",
    label: "Ala",
    description: "Genera la mayor parte de la sustentación gracias a su perfil aerodinámico.",
    xPct: 20,
    yPct: 19,
  },
  {
    id: "aleron",
    label: "Alerón",
    description: "Superficie móvil en el borde de salida del ala que controla el alabeo (roll).",
    xPct: 90,
    yPct: 82,
  },
  {
    id: "fuselaje",
    label: "Fuselaje / Cabina",
    description: "Estructura principal que aloja la cabina, los pasajeros y la carga.",
    xPct: 40,
    yPct: 46,
  },
  {
    id: "estabilizador-vertical",
    label: "Estabilizador vertical",
    description: "Aloja el timón de dirección y da estabilidad direccional a la aeronave.",
    xPct: 76,
    yPct: 13,
  },
  {
    id: "estabilizador-horizontal",
    label: "Estabilizador horizontal",
    description: "Aloja el elevador y da estabilidad de cabeceo (pitch) a la aeronave.",
    xPct: 90,
    yPct: 33,
  },
  {
    id: "tren",
    label: "Tren de aterrizaje",
    description: "Soporta el peso de la aeronave en tierra y absorbe el impacto del aterrizaje.",
    xPct: 30,
    yPct: 71,
  },
];
