// Datos de aeropuertos para el ATIS, armados desde OurAirports.
export type ExtremoPista = { ident: string; rumboV: number; largoFt: number }; // rumboV = rumbo verdadero, grados
export type AeropuertoAtis = {
  icao: string; nombreEs: string; nombreEn: string;
  lat: number; lon: number; elevFt: number;
  atisMhz: number[]; pistas: ExtremoPista[];
};
type Fila = Record<string, string>;

// El ATIS real dice la ciudad, no el nombre oficial.
export function nombres(nombreOurAirports: string, municipio: string): { es: string; en: string } {
  if (/International Airport$/i.test(nombreOurAirports.trim())) {
    return { es: `Aeropuerto Internacional de ${municipio}`, en: `${municipio} International Airport` };
  }
  return { es: `Aeropuerto de ${municipio}`, en: `${municipio} Airport` };
}

// Rumbo inicial de círculo máximo, entero 0–359.
function rumbo(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180;
  const dl = (lon2 - lon1) * r;
  const y = Math.sin(dl) * Math.cos(lat2 * r);
  const x = Math.cos(lat1 * r) * Math.sin(lat2 * r) - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dl);
  return Math.round(((Math.atan2(y, x) / r) + 360) % 360) % 360;
}

export function extremos(f: Fila): ExtremoPista[] {
  if (f.closed === "1" || !f.le_ident || !f.he_ident) return [];
  const largoFt = Number(f.length_ft) || 0;
  const lat1 = parseFloat(f.le_latitude_deg), lon1 = parseFloat(f.le_longitude_deg);
  const lat2 = parseFloat(f.he_latitude_deg), lon2 = parseFloat(f.he_longitude_deg);
  const hayCoord = [lat1, lon1, lat2, lon2].every(Number.isFinite);
  const calc = (dado: string, ida: boolean): number | null => {
    const n = parseFloat(dado);
    if (Number.isFinite(n)) return Math.round(n);
    if (!hayCoord) return null;
    return ida ? rumbo(lat1, lon1, lat2, lon2) : rumbo(lat2, lon2, lat1, lon1);
  };
  const a = calc(f.le_heading_degT, true), b = calc(f.he_heading_degT, false);
  if (a === null || b === null) return [];
  return [
    { ident: f.le_ident, rumboV: a, largoFt },
    { ident: f.he_ident, rumboV: b, largoFt },
  ];
}

export function armarAeropuertos(aeropuertos: Fila[], pistas: Fila[], frecuencias: Fila[], pais: string): AeropuertoAtis[] {
  const salida: AeropuertoAtis[] = [];
  for (const a of aeropuertos) {
    if (a.iso_country !== pais) continue;
    const atisMhz = frecuencias
      .filter((f) => f.airport_ident === a.ident && (f.type === "ATIS" || f.type === "D-ATIS"))
      .map((f) => Number(f.frequency_mhz))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (atisMhz.length === 0) continue;
    const n = nombres(a.name, a.municipality || a.name);
    salida.push({
      icao: a.ident, nombreEs: n.es, nombreEn: n.en,
      lat: Number(a.latitude_deg), lon: Number(a.longitude_deg), elevFt: Number(a.elevation_ft) || 0,
      atisMhz,
      pistas: pistas.filter((p) => p.airport_ident === a.ident).flatMap(extremos),
    });
  }
  return salida;
}
