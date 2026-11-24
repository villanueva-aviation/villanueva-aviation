// Lectura del D-ATIS real de EE. UU. (atis.info): encabezado, METAR y oraciones.

export type EntradaDatis = {
  airport: string;
  type: "combined" | "arr" | "dep";
  code: string;
  datis: string;
  time: string;
  updatedAt: string;
};

export type DatisLeido = {
  letra: string;
  hora: string;
  especial: boolean;
  metar: string | null;
  rmk: string | null;
  resto: string[];
};

const ENCABEZADO = /^\s*\w{3} (?:ATIS|ARR|DEP) INFO ([A-Z]) (\d{4})Z( SPECIAL)?\./;
const CIERRE = /\.{0,3}\s*ADVS YOU HAVE INFO [A-Z]\.?\s*$/;
const ALTIMETRO = /\bA\d{4}\b/;

export function leerDatis(e: EntradaDatis): DatisLeido {
  const h = ENCABEZADO.exec(e.datis);
  const cuerpo = e.datis.slice(h ? h[0].length : 0).replace(CIERRE, "");
  // Oraciones: se corta en ". " o al final; las vacías y los "." sueltos se descartan.
  const oraciones = cuerpo
    .split(/\.(?:\s+|$)/)
    .map((o) => o.trim().replace(/[,\s]+$/, ""))
    .filter((o) => o && o !== ";")
    .map((o) => o + ".");
  const i = oraciones.findIndex((o) => ALTIMETRO.test(o));
  let metar: string | null = null;
  let rmk: string | null = null;
  if (i >= 0) {
    const bloque = oraciones.slice(0, i + 1).join(" ").replace(/\.$/, "");
    const [clima, ...nota] = bloque.split(/\s+RMK\s+/);
    metar = clima.replace(/\s*\([^)]*\)/g, "").trim();
    rmk = nota.length ? nota.join(" RMK ").trim() : null;
  }
  return {
    letra: h ? h[1] : e.code,
    hora: h ? h[2] : e.time,
    especial: !!h?.[3],
    metar,
    rmk,
    resto: oraciones.slice(i + 1),
  };
}

const MIN_MS = 60_000;

// La hora HHMM Zulu más reciente que no esté en el futuro.
export function emitidoMs(time: string, ahoraMs: number): number {
  const d = new Date(ahoraMs);
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), +time.slice(0, 2), +time.slice(2, 4));
  return t > ahoraMs ? t - 24 * 60 * MIN_MS : t;
}

// Vigente si se emitió hace 90 minutos o menos.
export function vigenteDatis(e: EntradaDatis, ahoraMs: number): boolean {
  return ahoraMs - emitidoMs(e.time, ahoraMs) <= 90 * MIN_MS;
}

export function datisPara(entradas: EntradaDatis[], nombreFrec: string | null): EntradaDatis | null {
  const combinada = entradas.find((e) => e.type === "combined");
  if (combinada) return combinada;
  const tipo = nombreFrec?.toUpperCase().includes("DEP") ? "dep" : "arr";
  return entradas.find((e) => e.type === tipo) ?? null;
}

// FNV-1a de 32 bits en hex (síncrono: lo usan la página y la Function).
export function huella(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0");
}
