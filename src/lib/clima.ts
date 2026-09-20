// Datos y cálculos del Briefing del piloto. Los reportes vienen de aviationweather.gov (vía /api/wx).

export interface Nube {
  cover: string;
  base: number | null;
  type?: string | null;
}

export interface Metar {
  icaoId: string;
  name?: string;
  rawOb: string;
  obsTime: number; // segundos Unix
  temp: number | null;
  dewp: number | null;
  wdir: number | string | null; // "VRB" cuando es variable
  wspd: number | null;
  wgst?: number | null;
  visib: number | string | null; // "10+" cuando es 10 SM o más
  altim: number | null; // hPa
  elev: number | null; // metros
  wxString?: string | null;
  clouds: Nube[];
  fltCat?: string | null;
}

export interface PeriodoTaf {
  timeFrom: number;
  timeTo: number;
  timeBec?: number | null;
  fcstChange: string | null; // null = pronóstico base
  probability?: number | null;
  wdir: number | string | null;
  wspd: number | null;
  wgst?: number | null;
  visib: number | string | null;
  wxString?: string | null;
  clouds: Nube[];
}

export interface Taf {
  icaoId: string;
  name?: string;
  rawTAF: string;
  validTimeFrom: number;
  validTimeTo: number;
  fcsts: PeriodoTaf[];
}

export type Categoria = "VFR" | "MVFR" | "IFR" | "LIFR";

async function pedir<T>(tipo: "metar" | "taf", icao: string): Promise<T[]> {
  const r = await fetch(`/api/wx/${tipo}?ids=${encodeURIComponent(icao)}&format=json`);
  if (!r.ok) throw new Error("servicio");
  const datos = await r.json();
  return Array.isArray(datos) ? (datos as T[]) : [];
}

export async function consultarClima(icao: string) {
  const [m, t] = await Promise.allSettled([pedir<Metar>("metar", icao), pedir<Taf>("taf", icao)]);
  if (m.status === "rejected" && t.status === "rejected") throw new Error("servicio");
  return {
    metar: m.status === "fulfilled" ? (m.value[0] ?? null) : null,
    taf: t.status === "fulfilled" ? (t.value[0] ?? null) : null,
  };
}

// ---------- cálculos ----------

/** "10+" -> 10, "1 1/2" -> 1.5, 6 -> 6. */
export function visibilidadSM(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  const partes = v.replace("+", "").trim().split(/\s+/);
  let total = 0;
  for (const p of partes) {
    if (p.includes("/")) {
      const [a, b] = p.split("/").map(Number);
      total += b ? a / b : 0;
    } else {
      total += Number(p) || 0;
    }
  }
  return total;
}

/** Techo = base más baja de una capa BKN u OVC (FEW y SCT no cuentan). En pies AGL. */
export function techoFt(nubes: Nube[]): number | null {
  const bases = nubes
    .filter((n) => (n.cover === "BKN" || n.cover === "OVC" || n.cover === "OVX") && n.base !== null)
    .map((n) => n.base as number);
  return bases.length ? Math.min(...bases) : null;
}

/** Categoría por la peor de las dos condiciones: techo (ft) y visibilidad (SM). */
export function categoriaVuelo(techo: number | null, visSM: number | null): Categoria | null {
  if (techo === null && visSM === null) return null;
  const t = techo ?? Infinity;
  const v = visSM ?? Infinity;
  if (t < 500 || v < 1) return "LIFR";
  if (t < 1000 || v < 3) return "IFR";
  if (t <= 3000 || v <= 5) return "MVFR";
  return "VFR";
}

/** Componentes del viento respecto a la pista. Positivo "frente" = viento de frente; negativo = de cola. */
export function componentesViento(dir: number, vel: number, pista: number) {
  const rumboPista = pista * 10;
  const ang = ((((dir - rumboPista) % 360) + 540) % 360) - 180; // -180..180; positivo = viene por la derecha
  const rad = (ang * Math.PI) / 180;
  return {
    cruzado: Math.abs(vel * Math.sin(rad)),
    frente: vel * Math.cos(rad),
    lado: ang >= 0 ? "derecha" : "izquierda",
  };
}

/** Altitud de presión y de densidad (ft) a partir de elevación (m), altímetro (hPa) y temperatura (°C). */
export function altitudDensidad(elevM: number, altimHpa: number, tempC: number) {
  const inHg = altimHpa * 0.02953;
  const presion = elevM * 3.28084 + (29.92 - inHg) * 1000;
  const isa = 15 - 2 * (presion / 1000);
  return { presion, densidad: presion + 120 * (tempC - isa), desviacionIsa: tempC - isa };
}

// ---------- textos en español ----------

const DESCRIPTORES: Record<string, string> = {
  TS: "tormenta", SH: "chubasco", FZ: "engelante", BL: "levantada", DR: "baja desplazada",
  MI: "baja", BC: "en bancos", PR: "parcial",
};
const FENOMENOS: Record<string, string> = {
  RA: "lluvia", DZ: "llovizna", SN: "nieve", SG: "granos de nieve", IC: "cristales de hielo",
  PL: "gránulos de hielo", GR: "granizo", GS: "granizo pequeño", UP: "precipitación desconocida",
  BR: "neblina", FG: "niebla", FU: "humo", VA: "ceniza volcánica", DU: "polvo", SA: "arena",
  HZ: "calima", PO: "remolinos de polvo", SQ: "turbonada", FC: "nube en embudo",
  SS: "tormenta de arena", DS: "tormenta de polvo",
};

function mayuscula(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "-SHRA" -> "Chubasco de lluvia, intensidad ligera". Códigos desconocidos se devuelven tal cual. */
export function fenomeno(codigo: string): string {
  let c = codigo;
  let cercania = false;
  let intensidad = "";
  if (c.startsWith("VC")) { cercania = true; c = c.slice(2); }
  if (c.startsWith("-")) { intensidad = "ligera"; c = c.slice(1); }
  else if (c.startsWith("+")) { intensidad = "fuerte"; c = c.slice(1); }

  const desc: string[] = [];
  const fen: string[] = [];
  for (let i = 0; i < c.length; i += 2) {
    const par = c.slice(i, i + 2);
    if (DESCRIPTORES[par]) desc.push(par);
    else if (FENOMENOS[par]) fen.push(FENOMENOS[par]);
    else return codigo;
  }

  const f = fen.join(" y ");
  let texto: string;
  if (desc.includes("TS")) texto = f ? `tormenta con ${f}` : "tormenta";
  else if (desc.includes("SH")) texto = f ? `chubasco de ${f}` : "chubasco";
  else if (desc.includes("FZ")) texto = `${f} engelante`;
  else if (desc.length) texto = `${f} ${desc.map((d) => DESCRIPTORES[d]).join(" ")}`.trim();
  else texto = f;

  if (cercania) texto += " en las cercanías";
  if (intensidad) texto += `, intensidad ${intensidad}`;
  return mayuscula(texto);
}

export function fenomenos(wx: string | null | undefined): string[] {
  return wx ? wx.split(/\s+/).filter(Boolean).map(fenomeno) : [];
}

const COBERTURA: Record<string, string> = {
  FEW: "Pocas nubes", SCT: "Nubes dispersas", BKN: "Nublado", OVC: "Cielo cerrado",
  OVX: "Cielo oscurecido", CLR: "Despejado", SKC: "Despejado", NSC: "Sin nubes significativas",
};
const TIPO_NUBE: Record<string, string> = { CB: "cumulonimbo", TCU: "cúmulo en torre" };

export function textoNube(n: Nube): string {
  const nombre = COBERTURA[n.cover] ?? n.cover;
  if (n.base === null) return nombre;
  const tipo = n.type ? ` (${TIPO_NUBE[n.type] ?? n.type})` : "";
  return `${nombre} a ${n.base.toLocaleString("es-MX")} ft${tipo}`;
}

export function textoViento(dir: number | string | null, vel: number | null, rafaga?: number | null): string {
  if (vel === null || vel === undefined) return "Sin dato";
  if (vel === 0) return "Calma";
  const d = dir === "VRB" || dir === null ? "Variable" : `de ${String(dir).padStart(3, "0")}°`;
  return `${d} a ${vel} kt${rafaga ? `, ráfagas de ${rafaga} kt` : ""}`;
}

export function textoVisibilidad(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return "Sin dato";
  const s = String(v);
  return s.endsWith("+") ? `Más de ${s.replace("+", "")} SM` : `${s} SM`;
}
