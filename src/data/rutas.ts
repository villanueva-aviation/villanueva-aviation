import datos from "./rutas.json";

// El archivo rutas.json lo genera automation/rutas/generar.py con datos públicos (NOAA, WMM-2025, Open-Meteo).
export interface AeropuertoRuta {
  icao: string;
  iata: string | null;
  nombre: string;
  lat: number;
  lon: number;
  elevFt: number;
  torre: boolean;
  pistas: { id: string; largoFt: number; anchoFt: number }[];
  frecuencias: { tipo: string; mhz: string }[];
}

export interface RutaMexico {
  id: string;
  region: string;
  origen: string;
  destino: string;
  distanciaNm: number;
  rumboVerdaderoIni: number;
  rumboVerdaderoFin: number;
  variacionMagnetica: number; // positivo = este
  rumboMagneticoIni: number;
  tiempoMin100kt: number;
  tiempoMin140kt: number;
  terrenoMaxFt: number;
  terrenoMaxKmDesdeSalidaNm: number;
  sobreAguaPct: number;
  nivelMinimoFt: number;
  nivelSugeridoFt: number;
  advertencias: string[];
  perfil: [number, number][]; // [NM desde la salida, terreno más alto del corredor en ft]
  plan: string;
}

export const RUTAS_MEXICO = datos as unknown as {
  generado: string;
  modeloMagnetico: string;
  aeropuertos: Record<string, AeropuertoRuta>;
  rutas: RutaMexico[];
};
