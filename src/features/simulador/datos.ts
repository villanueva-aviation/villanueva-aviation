// Datos de navegación del simulador, sacados de OurAirports (dominio público).
// `scripts/datos-simulador.ts` convierte los CSV a un JSON por país en public/data/sim/.

export type Vor = { ident: string; nombre: string; lat: number; lon: number; mhz: number; dme: boolean; decl: number; elevFt: number };
export type PistaSim = { a: string; b: string; latA: number; lonA: number; latB: number; lonB: number; anchoFt: number };
export type AeropuertoSim = {
  icao: string;
  nombre: string;
  lat: number;
  lon: number;
  elevFt: number;
  helipuerto: boolean;
  pistas: PistaSim[];
  com: { tipo: string; mhz: number }[];
};
export type DatosPais = { vors: Vor[]; aeropuertos: AeropuertoSim[] };
export type Pais = { iso: string; vors: number };

type Fila = Record<string, string>;

/** CSV con comillas dobles ("" escapa una comilla), como los de OurAirports. */
export function parsearCsv(texto: string): Fila[] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let entre = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entre) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') entre = false;
      else campo += c;
    } else if (c === '"') entre = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      filas.push(fila); fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto
    .filter((f) => f.length > 1 || f[0] !== "")
    .map((f) => Object.fromEntries(cab.map((k, j) => [k, f[j] ?? ""])));
}

const num = (s: string | undefined) => (s ? Number(s) : 0);
const TIPOS_VOR = new Set(["VOR", "VOR-DME", "VORTAC"]);
const TIPOS_AEROPUERTO = new Set(["large_airport", "medium_airport", "small_airport"]);

export function convertirPais(iso: string, navaids: Fila[], aeropuertos: Fila[], pistas: Fila[], frecuencias: Fila[]): DatosPais {
  const vors = navaids
    .filter((n) => n.iso_country === iso && TIPOS_VOR.has(n.type) && n.frequency_khz)
    .map((n) => ({
      ident: n.ident,
      nombre: n.name,
      lat: num(n.latitude_deg),
      lon: num(n.longitude_deg),
      mhz: Math.round(num(n.frequency_khz) / 10) / 100,
      dme: n.type !== "VOR" || !!n.dme_frequency_khz,
      decl: num(n.magnetic_variation_deg),
      elevFt: num(n.elevation_ft),
    }));

  const pistasDe = new Map<string, PistaSim[]>();
  for (const p of pistas) {
    if (!p.le_latitude_deg || !p.he_latitude_deg || !p.le_longitude_deg || !p.he_longitude_deg) continue;
    const lista = pistasDe.get(p.airport_ref) ?? [];
    lista.push({
      a: p.le_ident, b: p.he_ident,
      latA: num(p.le_latitude_deg), lonA: num(p.le_longitude_deg),
      latB: num(p.he_latitude_deg), lonB: num(p.he_longitude_deg),
      anchoFt: num(p.width_ft),
    });
    pistasDe.set(p.airport_ref, lista);
  }
  const comDe = new Map<string, { tipo: string; mhz: number }[]>();
  for (const f of frecuencias) {
    const lista = comDe.get(f.airport_ref) ?? [];
    lista.push({ tipo: f.type, mhz: num(f.frequency_mhz) });
    comDe.set(f.airport_ref, lista);
  }

  const lista: AeropuertoSim[] = [];
  for (const a of aeropuertos) {
    if (a.iso_country !== iso) continue;
    const helipuerto = a.type === "heliport";
    const codigo = a.icao_code || a.gps_code || (/^[A-Z]{4}$/.test(a.ident) ? a.ident : "");
    if (!helipuerto && !(TIPOS_AEROPUERTO.has(a.type) && codigo)) continue;
    lista.push({
      icao: codigo || a.ident,
      nombre: a.name,
      lat: num(a.latitude_deg),
      lon: num(a.longitude_deg),
      elevFt: num(a.elevation_ft),
      helipuerto,
      pistas: pistasDe.get(a.id) ?? [],
      com: comDe.get(a.id) ?? [],
    });
  }
  return { vors, aeropuertos: lista };
}

export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function ordenar<T>(items: T[], q: string, ident: (t: T) => string, nombre: (t: T) => string): T[] {
  const n = normalizar(q.trim());
  if (!n) return items.slice(0, 20);
  const nivel = (t: T) => {
    const i = normalizar(ident(t));
    if (i === n) return 0;
    if (i.startsWith(n)) return 1;
    const nom = normalizar(nombre(t));
    if (nom.startsWith(n)) return 2;
    if (i.includes(n) || nom.includes(n)) return 3;
    return 9;
  };
  return items
    .map((t) => [nivel(t), t] as const)
    .filter(([k]) => k < 9)
    .sort((a, b) => a[0] - b[0])
    .slice(0, 20)
    .map(([, t]) => t);
}

export function buscar(datos: DatosPais, q: string): { vors: Vor[]; aeropuertos: AeropuertoSim[] } {
  return {
    vors: ordenar(datos.vors, q, (v) => v.ident, (v) => v.nombre),
    aeropuertos: ordenar(datos.aeropuertos, q, (a) => a.icao, (a) => a.nombre),
  };
}

export async function cargarPais(iso: string): Promise<DatosPais> {
  const r = await fetch(`/data/sim/${iso}.json`);
  if (!r.ok) throw new Error(`No se pudieron cargar los datos de ${iso}`);
  return r.json();
}
