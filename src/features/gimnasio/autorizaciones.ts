// Gimnasio de autorizaciones: arma autorizaciones IFR al estilo de la FAA, el texto que lee la voz
// y la revisión de lo que copió el piloto (pura, para poder probarla con `npm test`).

export type Subida = { tipo: "via" } | { tipo: "mantener"; pies: number };

export interface Sid {
  /** Como está en la carta, ej. "ORCKA5". */
  nombre: string;
  /** Como lo dice el controlador, ej. "Orcka five". */
  dicho: string;
  subida: Subida;
  /** Minutos para el "expect" que imprime la carta (3, 5 o 10). */
  minutos: number;
  /** Frecuencias de Departure que imprime la carta, ej. "124.3". */
  frecuencias: string[];
  transiciones: { fijo: string; dicho: string }[];
}

export interface Salida {
  icao: string;
  ciudad: string;
  sids: Sid[];
}

export interface Destino {
  icao: string;
  /** Como lo dice el controlador en el límite de la autorización, ej. "Mexico City". */
  dicho: string;
}

export interface Autorizacion {
  salida: Salida;
  indicativo: { codigo: string; dicho: string };
  destino: Destino;
  sid: Sid;
  transicion: { fijo: string; dicho: string };
  /** Nivel de vuelo que esperas (ej. 350 = FL350). */
  esperar: number;
  frecuencia: string;
  squawk: string;
}

export const CAMPOS = ["limite", "sid", "transicion", "altitud", "esperar", "frecuencia", "squawk"] as const;
export type Campo = (typeof CAMPOS)[number];

export const VELOCIDADES = [
  { id: "despacio", etiqueta: "Despacio", rate: 0.8 },
  { id: "vatsim", etiqueta: "Como en VATSIM", rate: 1.1 },
  { id: "pico", etiqueta: "Hora pico", rate: 1.4 },
] as const;

export const DESTINOS: Destino[] = [
  { icao: "MMMX", dicho: "Mexico City" },
  { icao: "MMGL", dicho: "Guadalajara" },
  { icao: "MMMY", dicho: "Monterrey" },
  { icao: "MMUN", dicho: "Cancun" },
];

const AEROLINEAS = [
  { icao: "AMX", dicho: "Aeromexico" },
  { icao: "VOI", dicho: "Volaris" },
  { icao: "VIV", dicho: "Aerobus" },
];

const DIGITO = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "niner"];
const UNIDAD = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const DIEZ_A_19 = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const DECENA = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ALFABETO: Record<string, string> = {
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf", H: "Hotel", I: "India",
  J: "Juliett", K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee", Z: "Zulu",
};

/** Dígito por dígito, con "niner" como en la radio: "124.3" → "one two four point three". */
export function digitos(texto: string): string {
  return [...texto].map((c) => (c === "." ? "point" : DIGITO[Number(c)])).join(" ");
}

/** Un número de 10 a 99 como se dice en grupo: 12 → "twelve", 41 → "forty-one". */
function par(n: number): string {
  if (n < 20) return DIEZ_A_19[n - 10];
  return n % 10 ? `${DECENA[Math.floor(n / 10)]}-${UNIDAD[n % 10]}` : DECENA[n / 10];
}

/** Número de vuelo de aerolínea en grupos, como en EE. UU.: 412 → "four twelve", 1241 → "twelve forty-one". */
export function vueloEnGrupos(n: number): string {
  return n >= 1000 ? `${par(Math.floor(n / 100))} ${par(n % 100)}` : `${UNIDAD[Math.floor(n / 100)]} ${par(n % 100)}`;
}

/** Altitud en pies como la dice el controlador: 5000 → "five thousand", 10000 → "one zero thousand". */
export function altitud(pies: number): string {
  const miles = Math.floor(pies / 1000);
  const cientos = (pies % 1000) / 100;
  const m = miles >= 10 ? digitos(String(miles)) : DIGITO[miles];
  return `${m} thousand${cientos ? ` ${DIGITO[cientos]} hundred` : ""}`;
}

export const nivel = (fl: number) => `flight level ${digitos(String(fl))}`;

const elegir = <T,>(lista: readonly T[], azar: () => number): T => lista[Math.floor(azar() * lista.length)];
const entre = (min: number, max: number, azar: () => number) => min + Math.floor(azar() * (max - min + 1));

function generarIndicativo(azar: () => number) {
  if (azar() < 0.25) {
    // Matrícula mexicana, letra por letra: XB-VNA → "X-ray Bravo Victor November Alpha".
    const letras = `X${elegir(["A", "B"], azar)}${Array.from({ length: 3 }, () => String.fromCharCode(65 + entre(0, 25, azar))).join("")}`;
    return { codigo: `${letras.slice(0, 2)}-${letras.slice(2)}`, dicho: [...letras].map((l) => ALFABETO[l]).join(" ") };
  }
  const aerolinea = elegir(AEROLINEAS, azar);
  // Sin ceros en los grupos ("four oh five"): así cada número se dice de una sola forma.
  const numero = azar() < 0.7 ? entre(1, 9, azar) * 100 + entre(10, 99, azar) : entre(10, 99, azar) * 100 + entre(10, 99, azar);
  return { codigo: `${aerolinea.icao}${numero}`, dicho: `${aerolinea.dicho} ${vueloEnGrupos(numero)}` };
}

/** Código de transpondedor: octal, sin 7xxx (emergencias) ni 1200 (VFR). */
function generarSquawk(azar: () => number) {
  const s = `${entre(1, 6, azar)}${Array.from({ length: 3 }, () => entre(0, 7, azar)).join("")}`;
  return s === "1200" ? "1201" : s;
}

export function generarAutorizacion(salidas: Salida[], azar: () => number = Math.random, icaoSalida?: string): Autorizacion {
  const salida = salidas.find((s) => s.icao === icaoSalida) ?? elegir(salidas, azar);
  const sid = elegir(salida.sids, azar);
  return {
    salida,
    indicativo: generarIndicativo(azar),
    destino: elegir(DESTINOS, azar),
    sid,
    transicion: elegir(sid.transiciones, azar),
    esperar: elegir([230, 250, 270, 290, 310, 330, 350, 370], azar),
    frecuencia: elegir(sid.frecuencias, azar),
    squawk: generarSquawk(azar),
  };
}

const textoSubida = (s: Subida) => (s.tipo === "via" ? "climb via SID" : `maintain ${altitud(s.pies)}`);

/** Lo que dice el controlador, listo para la voz. */
export function textoAutorizacion(a: Autorizacion): string {
  return (
    `${a.indicativo.dicho}, cleared to ${a.destino.dicho} airport via the ${a.sid.dicho} departure, ` +
    `${a.transicion.dicho} transition, then as filed. ${cap(textoSubida(a.sid.subida))}, expect ${nivel(a.esperar)} ` +
    `${digitos(String(a.sid.minutos))} minutes after departure. Departure frequency ${digitos(a.frecuencia)}, squawk ${digitos(a.squawk)}.`
  );
}

/** El readback que harías tú, escrito como se ve en la carta. */
export function readback(a: Autorizacion): string {
  const subida = a.sid.subida.tipo === "via" ? "climb via SID" : `maintain ${a.sid.subida.pies.toLocaleString("en-US")}`;
  return (
    `Cleared to ${a.destino.icao} via the ${a.sid.nombre} departure, ${a.transicion.fijo} transition, then as filed, ` +
    `${subida}, expect FL${a.esperar} ${a.sid.minutos} minutes after, departure ${a.frecuencia}, squawk ${a.squawk}, ${a.indicativo.codigo}.`
  );
}

/** La respuesta correcta de cada campo, para mostrarla al revisar. */
export function respuestas(a: Autorizacion): Record<Campo, string> {
  return {
    limite: `${a.destino.icao} (${a.destino.dicho})`,
    sid: a.sid.nombre,
    transicion: a.transicion.fijo,
    altitud: a.sid.subida.tipo === "via" ? "Climb via SID" : `${a.sid.subida.pies.toLocaleString("en-US")} ft`,
    esperar: `FL${a.esperar}`,
    frecuencia: a.frecuencia,
    squawk: a.squawk,
  };
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const PALABRA_A_DIGITO: Record<string, string> = { ...Object.fromEntries(DIGITO.map((p, i) => [p, String(i)])), nine: "9" };
/** Minúsculas, sin acentos, con "five" → "5", y sin espacios ni signos: "Orcka Five" → "orcka5". */
function compacto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[a-z]+/g, (p) => PALABRA_A_DIGITO[p] ?? p)
    .replace(/[^a-z0-9]/g, "");
}
const numero = (texto: string) => Number(texto.replace(/[^0-9]/g, "") || NaN);

/** Revisa lo que copió el piloto: acepta las formas en que alguien lo anota en su libreta. */
export function revisar(a: Autorizacion, copia: Record<Campo, string>): Record<Campo, boolean> {
  const sub = a.sid.subida;
  const alt = numero(copia.altitud);
  const esp = numero(copia.esperar);
  const frec = Number(copia.frecuencia.replace(",", ".").replace(/[^0-9.]/g, ""));
  return {
    limite: [a.destino.icao, a.destino.dicho].some((v) => compacto(copia.limite) === compacto(v)),
    // Sin la carta a la mano solo oyes "Zoo four": vale el código (ZZOOO4) o como suena.
    sid: [a.sid.nombre, a.sid.dicho].some((v) => compacto(copia.sid) === compacto(v)),
    transicion: [a.transicion.fijo, a.transicion.dicho].some((v) => compacto(copia.transicion) === compacto(v)),
    altitud: sub.tipo === "via" ? /via|sid|cvs/.test(compacto(copia.altitud)) : [sub.pies, sub.pies / 100, sub.pies / 1000].includes(alt),
    esperar: [a.esperar, a.esperar * 100].includes(esp),
    frecuencia: frec > 0 && Math.abs(frec - Number(a.frecuencia)) < 0.001,
    squawk: copia.squawk.replace(/\D/g, "") === a.squawk,
  };
}
