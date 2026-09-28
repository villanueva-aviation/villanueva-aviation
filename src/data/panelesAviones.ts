export interface PanelMarcador {
  numero: number;
  xPct: number;
  yPct: number;
  titulo: string;
  nota: string;
}

export interface PanelDiagramaData {
  imagen: string;
  alt: string;
  marcadores: PanelMarcador[];
}

export const PANEL_C172: PanelDiagramaData = {
  imagen: "/images/paneles/c172-panel.webp",
  alt: "Panel de instrumentos del Cessna 172S con aviónica G1000",
  marcadores: [
    { numero: 1, xPct: 5, yPct: 52.3, titulo: "MASTER ALT/BAT", nota: "Enciende la batería y el alternador — el primer paso de todo arranque." },
    { numero: 2, xPct: 10.2, yPct: 52.3, titulo: "AVIONICS BUS 1/2", nota: "Energizan las pantallas Garmin. Se dejan OFF hasta después de encender el master." },
    { numero: 3, xPct: 7.3, yPct: 44.3, titulo: "STBY BATT (ARM/TEST)", nota: "Batería de respaldo para el PFD si falla la eléctrica principal; se prueba antes del vuelo." },
    { numero: 4, xPct: 14.1, yPct: 69.9, titulo: "FUEL PUMP", nota: "Bomba eléctrica auxiliar: ceba el motor de inyección y sirve de respaldo en vuelo." },
    { numero: 5, xPct: 18, yPct: 69.9, titulo: "PITOT HEAT", nota: "Calienta el tubo pitot para evitar que se congele en instrumentos o hielo." },
    { numero: 6, xPct: 48.7, yPct: 74, titulo: "ALT STATIC AIR", nota: "Fuente alterna de presión estática si el puerto principal se obstruye." },
    { numero: 7, xPct: 32.6, yPct: 26.6, titulo: "PFD — pantalla primaria", nota: "Garmin G1000: velocidad, actitud, altitud y rumbo." },
    { numero: 8, xPct: 75.4, yPct: 26.6, titulo: "MFD — pantalla multifunción", nota: "Mapas, motor, combustible y plan de vuelo." },
    { numero: 9, xPct: 54.2, yPct: 27.5, titulo: "Panel de radios COM/NAV", nota: "Frecuencias de comunicación y navegación." },
    { numero: 10, xPct: 55.3, yPct: 58.6, titulo: "Velocímetro de respaldo", nota: "Instrumento mecánico independiente de las pantallas Garmin." },
    { numero: 11, xPct: 65.7, yPct: 58.6, titulo: "Horizonte de respaldo", nota: "Actitud de respaldo si se pierde el PFD." },
    { numero: 12, xPct: 75.1, yPct: 58.6, titulo: "Altímetro de respaldo", nota: "Altitud de respaldo si se pierde el PFD." },
    { numero: 13, xPct: 19, yPct: 60, titulo: "Luces (BCN/LAND/TAXI/NAV/STROBE)", nota: "El beacon es obligatorio antes de arrancar el motor." },
    { numero: 14, xPct: 6.3, yPct: 87, titulo: "Magnetos / arranque", nota: "OFF / R / L / BOTH / START — selecciona magnetos y arranca el motor." },
    { numero: 15, xPct: 31.3, yPct: 79.8, titulo: "Panel de breakers", nota: "Protección eléctrica de cada sistema; ninguno debe estar disparado." },
    { numero: 16, xPct: 60, yPct: 78.4, titulo: "THROTTLE", nota: "Control de potencia del motor." },
    { numero: 17, xPct: 64.7, yPct: 78.4, titulo: "MIXTURE", nota: "Mezcla aire-combustible — perilla roja, se hala para cortar." },
    { numero: 18, xPct: 78.9, yPct: 70.5, titulo: "WING FLAPS", nota: "Posiciones UP / 10° / 20° / FULL." },
    { numero: 19, xPct: 97.8, yPct: 9.5, titulo: "ELT", nota: "Localizador de emergencia — se verifica en TEST durante el preflight." },
    { numero: 20, xPct: 93.1, yPct: 2.4, titulo: "Cantidad de combustible", nota: "Lectura digital de los tanques izquierdo y derecho." },
  ],
};
