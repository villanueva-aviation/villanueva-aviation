// Pasa el texto del D-ATIS (abreviaturas FAA, JO 7340.2) a palabras que una voz de Azure dice bien.
import { LETRAS, WX } from "./frases.ts";

// Contracciones FAA -> palabra(s) en minúsculas. N/S/E/W sueltas no están: se tratan aparte.
export const CONTRACCIONES: Record<string, string> = {
  APCH: "approach", APCHS: "approaches", APPCHS: "approaches", ARPT: "airport", CLSD: "closed", OTS: "out of service",
  VCNTY: "vicinity", VICINTY: "vicinity", VCY: "vicinity", VC: "vicinity", DEPG: "departing", DEPTG: "departing", DEP: "departure",
  DEPS: "departures", DEPT: "departure", ARR: "arrival", ARRS: "arrivals", ARVNG: "arriving", INST: "instrument", INSTR: "instrument",
  SIMUL: "simultaneous", NUM: "numerous", CTC: "contact", GC: "ground control", CD: "clearance delivery", TWR: "tower",
  FREQ: "frequency", ACFT: "aircraft", ALT: "altitude", ASSGN: "assignment", ASGND: "assigned", BTN: "between", BTWN: "between",
  CLNC: "clearance", DLVRY: "delivery", DLVY: "delivery", GND: "ground", HLDG: "holding", INFO: "information", INTXN: "intersection",
  INT: "intersection", ISNS: "intersections", INSTXNS: "instructions", INSTRCNS: "instructions", HDSRT: "hold short",
  HLDSHRT: "hold short", LCL: "local", LGT: "light", LGTS: "lights", MIN: "minutes", NE: "northeast", NW: "northwest",
  SE: "southeast", SW: "southwest", NNW: "north northwest", ESE: "east southeast", SSW: "south southwest", PARL: "parallel",
  PROC: "procedure", RCVD: "received", RQRD: "required", TRSN: "transition", TFC: "traffic", UNAVBL: "unavailable",
  UNUSBL: "unusable", ADVS: "advise", ADZ: "advise", ADVZY: "advisory", ADZYS: "advisories", ADZD: "advised", PSBL: "possible",
  ADJ: "adjacent", PRCTN: "precaution", CONST: "construction", EQUIP: "equipment", TWY: "taxiway", TWYS: "taxiways",
  TXY: "taxiway", EFCT: "effect", EXP: "expect", XPECT: "expect", EXPC: "expect", AVBL: "available", AVL: "available",
  AVLB: "available", FM: "from", FT: "feet", NM: "nautical miles", ACTVTY: "activity", UNAUTH: "unauthorized", RPRTD: "reported",
  RPTD: "reported", OPNG: "opening", GS: "glide slope", OM: "outer marker", IM: "inner marker", LOC: "localizer", WX: "weather",
  SVC: "service", FLT: "flight", CNTR: "center", ATTN: "attention", CNVGG: "converging", CNVGING: "converging", LNDG: "landing",
  LDG: "landing", RGT: "right", BYD: "beyond", HAZD: "hazardous", IMDT: "immediately", OPS: "operations", SPD: "speed",
  SHRT: "short", MULT: "multiple", STD: "standard", RBCK: "readback", CTL: "control", CL: "centerline", CTN: "caution",
  TXG: "taxiing", COMB: "combined", "U/S": "unserviceable", RWY: "runway", RWYS: "runways", RY: "runway", RYS: "runways",
  "&": "and",
};

// Siglas que se dicen letra por letra (o con su forma propia); el resto de siglas se queda en minúsculas.
const SIGLAS: Record<string, string> = {
  ILS: "I L S", RNAV: "R NAV", MSL: "M S L", AGL: "A G L", ATC: "A T C", RVR: "R V R", VFR: "V F R", IFR: "I F R",
  PAPI: "PAPI", VOR: "VOR", DME: "DME", GPS: "GPS", LLWAS: "LLWAS", VASI: "VASI", ALS: "ALS",
};

const DIGITOS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const LADO: Record<string, string> = { L: "left", R: "right", C: "center" };
// El alfabeto de LETRAS, con «Alpha» (Azure dice mejor Alpha que Alfa).
const FONETICO = LETRAS.map((l) => (l === "Alfa" ? "Alpha" : l));

// Códigos de tiempo: los de WX (en inglés) más los que le faltan. Sin el punto final.
const TIEMPO: Record<string, string> = {
  SN: "snow", "-SN": "light snow", "+SN": "heavy snow", FZRA: "freezing rain", FZDZ: "freezing drizzle", PL: "ice pellets",
  GR: "hail", DZ: "drizzle", SG: "snow grains", UP: "unknown precipitation", BLSN: "blowing snow", FZFG: "freezing fog",
  ...Object.fromEntries(Object.entries(WX).map(([k, v]) => [k, v[1].replace(/\.$/, "").toLowerCase()])),
};

const digitos = (s: string) => [...s].map((c) => DIGITOS[+c]).join(" ");
const PISTAS = /^\d{1,2}[LRC]?(\/\d{1,2}[LRC]?)*$/;
const pista = (t: string) => {
  const m = /^(\d{1,2})([LRC])?$/.exec(t)!;
  return digitos(m[1]) + (m[2] ? " " + LADO[m[2]] : "");
};
// Alturas redondas ("3000" -> "three thousand"); lo demás, dígito por dígito.
function numero(s: string): string {
  const n = +s;
  if (s.length >= 3 && s.length <= 5 && n % 100 === 0 && s[0] !== "0") {
    const mil = Math.floor(n / 1000), cien = (n % 1000) / 100;
    return [mil && digitos(String(mil)) + " thousand", cien && DIGITOS[cien] + " hundred"].filter(Boolean).join(" ");
  }
  return digitos(s);
}

function palabra(T: string, sig: string | undefined): string {
  if (/^\d+\.\d+$/.test(T)) return T.split(".").map(digitos).join(" point ");
  if (/^\d{4}Z$/.test(T)) return digitos(T.slice(0, 4)) + " zulu";
  if (/^\d+$/.test(T)) return numero(T);
  if (T in SIGLAS) return SIGLAS[T];
  if (T in CONTRACCIONES) return CONTRACCIONES[T];
  if (/^[NSEW]$/.test(T) && sig?.toUpperCase() === "OF") return { N: "north", S: "south", E: "east", W: "west" }[T]!;
  if (T.length === 1) return T;
  if (/^[A-Z]+\d+$/.test(T)) return T; // identificadores como D4 o S5 se quedan como están
  return T.toLowerCase();
}

export function hablado(texto: string): string {
  const limpio = texto.replace(/\b(RWYS?|RYS?|TWYS?)(?=\d)/gi, "$1 ").replace(/'/g, "");
  const solo = limpio.trim().replace(/[\s;.]+$/, "").toUpperCase();
  const tokens = limpio.match(/\d+\.\d+|[+-]?[A-Z0-9]+(?:[/-][A-Z0-9]+)*|&|[,.]/gi) ?? [];
  const sal: string[] = [];
  let modo: "" | "pistas" | "calles" = ""; // tras RWY/TWY, los identificadores sueltos también son pistas/calles
  tokens.forEach((t, i) => {
    const T = t.toUpperCase();
    if (T === "," || T === ".") { sal.push(T); return; }
    const antes = modo;
    const esPista = (antes === "pistas" && PISTAS.test(T)) || /^d{1,2}[LRC]$/.test(T) /* 24L suelto es siempre una pista */, esCalle = antes === "calles" && /^[A-Z]\d{0,2}$/.test(T);
    if (/^(RWYS?|RYS?)$/.test(T)) modo = "pistas";
    else if (/^(TWYS?|TXY)$/.test(T)) modo = "calles";
    else if (T !== "AND" && !esPista && !esCalle) modo = "";
    if (esPista) sal.push(T.split("/").map(pista).join(" and "));
    else if (esCalle) sal.push(FONETICO[T.charCodeAt(0) - 65] + (T[1] ? " " + digitos(T.slice(1)) : ""));
    else if (T in CONTRACCIONES || T in SIGLAS || !/[/-]/.test(T.slice(1))) sal.push(palabra(T, tokens[i + 1]));
    else sal.push(T.split(/[/-]/).map((p) => palabra(p, undefined)).join(" "));
  });
  let s = sal.join(" ").replace(/\s+([,.])/g, "$1").replace(/[,.]+(?=\s*[,.])/g, "").replace(/\s+/g, " ").trim();
  if (solo in TIEMPO) s = TIEMPO[solo]; // frase que es solo un código de tiempo
  if (!/[.!?]$/.test(s)) s += ".";
  return s.replace(/(^|[.!?]\s+)([a-z])/g, (_, a, b) => a + b.toUpperCase());
}
