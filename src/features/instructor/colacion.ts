// Califica lo que dice el cadete por radio, por elementos (pista, QNH, código, punto de espera, matrícula, punto VFR, frecuencia),
// y aplica el comportamiento del ATC en práctica: la frecuencia del COM1 decide quién contesta, pide lo que falta una vez y,
// si no entiende nada, dice «repita» (a la segunda sigue como si hubiera oído lo esperado). Puro, igual que checklistVoz.ts.
import type { Muestra } from "./evaluador.ts";
import { normalizar } from "./preguntas.ts";
import { aNm } from "../home/navGeo.ts";
import {
  adelantarATorre, alMuestrear, ALFABETO, completarEtapa, esperado, FREQ, frecuenciaCerca, frecuenciaDeEtapa, ininteligible,
  matriculaHablada, quienDeEtapa, REPORTE_LEJOS_NM,
  type ContextoAtc, type Elemento, type EstadoAtc, type Etapa, type Mensaje, type TipoElemento,
} from "./atcMmgl.ts";

export interface Calificacion {
  ok: Elemento[];
  faltan: Elemento[];
}

const norm = (t: string) => normalizar(t, "es");
const hay = (d: string, frase: string) => ` ${d} `.includes(` ${frase} `);
/** «134» → /1 ?3 ?4/: los dígitos pueden venir pegados («134») o de uno en uno («1 3 4»). */
const digitos = (n: string) => [...n].join(" ?");

/** Las rachas de números seguidos, cada una pegada: «3 0 0 2», «tres cero cero dos» y «30 02» dan «3002». */
function rachas(d: string): string[] {
  const r: string[] = [];
  let actual = "";
  for (const w of d.split(" ")) {
    if (/^\d+$/.test(w)) actual += w;
    else {
      if (actual) r.push(actual);
      actual = "";
    }
  }
  if (actual) r.push(actual);
  return r;
}

const ALIAS_LETRA: Record<string, string[]> = {
  A: ["alpha", "alfa"], J: ["juliet", "juliett"], Q: ["quebec", "quebeck"], W: ["whiskey", "whisky", "wiskey"], X: ["x ray", "xray"],
};
const palabrasLetra = (ch: string): string[] => (ALIAS_LETRA[ch] ?? [ALFABETO[ch] ?? ch]).map(norm);

/** La matrícula completa o sus últimas tres letras («Victor November Alpha»), con las palabras seguidas. */
function matriculaDicha(d: string, id: string): boolean {
  const letras = [...id.toUpperCase()].filter((c) => /[A-Z]/.test(c)).slice(-3);
  const texto = `${d} `;
  const probar = (k: number, pos: number): boolean =>
    k === letras.length || palabrasLetra(letras[k]).some((p) => texto.startsWith(`${p} `, pos) && probar(k + 1, pos + p.length + 1));
  for (let i = 0; i < texto.length; i++) if ((i === 0 || texto[i - 1] === " ") && probar(0, i)) return true;
  return false;
}

const ZONAS = ["cajititlan", "chapala"];
const AREA = ["area de trabajo", "zona de trabajo", "area trabajo"];
/** «Cajititlán» y «Chapala» valen una por otra (el reporte es de donde está); «área de trabajo» vale cualquiera de los puntos del vuelo. */
function puntoVfrDicho(d: string, valor: string): boolean {
  const v = norm(valor);
  const nombres = ZONAS.includes(v) ? ZONAS : AREA.includes(v) ? [...ZONAS, "piramide", ...AREA] : [v];
  return nombres.some((n) => hay(d, n));
}

/** «Papa 1»: la letra (en alfabeto o sola) y el número seguidos. */
function calleDicha(d: string, valor: string): boolean {
  const m = /^([A-Za-z])(\d*)$/.exec(valor);
  if (!m) return hay(d, norm(valor));
  const letra = m[1].toUpperCase();
  return [norm(ALFABETO[letra] ?? letra), letra.toLowerCase()].some((n) => hay(d, m[2] ? `${n} ${m[2]}` : n));
}

function frecuenciaDicha(d: string, valor: string): boolean {
  const [ent, dec] = valor.split(".");
  return new RegExp(`(^| )${digitos(ent)}( punto)? ?${dec}( |$)`).test(d);
}

function pistaDicha(d: string, valor: string): boolean {
  const m = /^(\d{2})([LRC]?)$/.exec(valor);
  if (!m) return hay(d, norm(valor));
  const lado = { L: "izquierda|izq|l|left", R: "derecha|der|r|right", C: "centro|c|center" }[m[2] as "L" | "R" | "C"];
  return new RegExp(`(^| )${digitos(m[1])}${lado ? ` (${lado})` : ""}( |$)`).test(d);
}

function dicho(el: Elemento, d: string): boolean {
  switch (el.tipo) {
    case "pista": return pistaDicha(d, el.valor);
    case "qnh":
    case "codigo": return rachas(d).some((r) => r.includes(el.valor));
    case "punto-espera": return calleDicha(d, el.valor);
    case "matricula": return matriculaDicha(d, el.valor);
    case "punto-vfr": return puntoVfrDicho(d, el.valor);
    case "frecuencia": return frecuenciaDicha(d, el.valor);
  }
}

export function calificar(esperados: Elemento[], texto: string): Calificacion {
  const d = norm(texto);
  const ok: Elemento[] = [];
  const faltan: Elemento[] = [];
  for (const el of esperados) (dicho(el, d) ? ok : faltan).push(el);
  return { ok, faltan };
}

/** La zona de trabajo que nombra el cadete en su llamada a Terrestre. */
export function zonaDicha(texto: string): ContextoAtc["zona"] | null {
  const d = norm(texto);
  return hay(d, "cajititlan") ? "Cajititlán" : hay(d, "chapala") ? "Chapala" : null;
}

// Rumbo verdadero aproximado y distancia de los puntos VFR respecto al aeropuerto (de «donde» y «nm» en src/data/aeropuertos/mmgl.ts,
// medidos sobre la carta visual: aproximados). La posición del aeropuerto también es aproximada.
const ARP = { lat: 20.5218, lon: -103.3111 };
const PUNTOS_VFR: Record<string, { rumbo: number; nm: number }> = {
  pirámide: { rumbo: 180, nm: 4 },
  cajititlán: { rumbo: 180, nm: 5 },
  chapala: { rumbo: 157.5, nm: 15 },
};

/** Distancia en NM del avión al punto VFR que nombra el reporte; null si no nombra ninguno. */
export function distanciaAlPunto(texto: string, zona: ContextoAtc["zona"], pos: { lat: number; lon: number }): { punto: string; nm: number } | null {
  const d = norm(texto);
  const punto = hay(d, "piramide") ? "Pirámide" : zonaDicha(texto) ?? (AREA.some((a) => hay(d, a)) ? zona : null);
  const ref = punto && PUNTOS_VFR[punto.toLowerCase()];
  if (!punto || !ref) return null;
  const r = (ref.rumbo * Math.PI) / 180;
  const p = aNm(pos.lat, pos.lon, ARP.lat, ARP.lon);
  return { punto, nm: Math.hypot(p.x - ref.nm * Math.sin(r), p.y - ref.nm * Math.cos(r)) };
}

export interface EstadoHabla {
  atc: EstadoAtc;
  etapa: Etapa; // la etapa a la que corresponden los contadores
  yaDichos: TipoElemento[];
  pidio: boolean; // ya se pidió lo que faltaba (solo se pide una vez)
  repeticiones: number; // veces que no se entendió nada
  zona: ContextoAtc["zona"] | null; // la que pidió el cadete
}
export const crearHabla = (atc: EstadoAtc): EstadoHabla => ({ atc, etapa: atc.etapa, yaDichos: [], pidio: false, repeticiones: 0, zona: null });

const ETIQUETA: Record<TipoElemento, string> = {
  pista: "pista", qnh: "QNH", codigo: "código", "punto-espera": "punto de espera", matricula: "matrícula", "punto-vfr": "punto de reporte", frecuencia: "frecuencia",
};
const lista = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);
const esColacion = (e: Etapa) => e.endsWith("-colacion") || e === "regreso-colacion";

const sincronizar = (h: EstadoHabla): EstadoHabla =>
  h.etapa === h.atc.etapa ? h : { ...h, etapa: h.atc.etapa, yaDichos: [], pidio: false, repeticiones: 0 };
const conCtx = (c: ContextoAtc, h: EstadoHabla): ContextoAtc => (h.zona ? { ...c, zona: h.zona } : c);

/**
 * Lo que dijo el cadete con el botón apretado. `com1` decide quién contesta; `t` es el reloj del lector (la última muestra).
 * En práctica: lo que falta se pide una vez; si no se entiende nada, «repita» y a la segunda sigue.
 */
export function hablar(h0: EstadoHabla, texto: string, com1: number | null, c0: ContextoAtc, t: number): { habla: EstadoHabla; decir: Mensaje[] } {
  let h = sincronizar(h0);
  if (!norm(texto)) return { habla: h, decir: [] }; // botón apretado sin palabras
  // Ya rodando y en 118.1: el cadete llama a Torre aunque Rampa no lo haya pasado todavía.
  if (h.atc.etapa === "rodando" && com1 !== null && frecuenciaCerca(com1, FREQ.torre)) h = sincronizar({ ...h, atc: adelantarATorre(h.atc) });
  const etapa = h.atc.etapa;
  if (etapa === "terrestre-llamada") h = { ...h, zona: zonaDicha(texto) ?? h.zona };
  const c = conCtx(c0, h);
  const esp = esperado(etapa, c);
  if (!esp.length) return { habla: h, decir: [] };
  const f = frecuenciaDeEtapa(etapa);
  if (f !== null && !frecuenciaCerca(com1, f)) {
    const atc = { ...h.atc, notas: [...h.atc.notas, { etapa, tipo: "fuera-de-frecuencia" as const, detalle: String(com1), t }] };
    return { habla: { ...h, atc }, decir: [] }; // en otra frecuencia nadie contesta
  }
  const mat = matriculaHablada(c.matricula);
  const quien = quienDeEtapa(etapa);
  const pendientes = esp.filter((el) => !h.yaDichos.includes(el.tipo));
  const cal = calificar(pendientes, texto);
  const nuevosOk = [...h.yaDichos, ...cal.ok.map((x) => x.tipo)];
  const avanzar = (faltan: Elemento[], sin_oir: boolean) => {
    const s = sin_oir ? ininteligible(h.atc, c, t) : completarEtapa(h.atc, c, faltan, t);
    if (!sin_oir && h.atc.pos && ["zona", "regreso-llamada", "piramide"].includes(etapa)) {
      const dist = distanciaAlPunto(texto, c.zona, h.atc.pos);
      if (dist && dist.nm > REPORTE_LEJOS_NM) s.estado.notas.push({ etapa, tipo: "reporte-lejos", detalle: `${dist.punto}: ${dist.nm.toFixed(1)} NM`, t });
    }
    return { habla: { ...crearHabla(s.estado), zona: h.zona }, decir: s.decir };
  };
  if (!cal.faltan.length) return avanzar([], false);
  if (!nuevosOk.length) {
    if (h.repeticiones === 0) return { habla: { ...h, repeticiones: 1 }, decir: [{ quien, texto: `${mat}, repita.` }] };
    return avanzar([], true);
  }
  if (!h.pidio)
    return {
      habla: { ...h, yaDichos: nuevosOk, pidio: true },
      decir: [{ quien, texto: `${mat}, ${esColacion(etapa) ? "colacione" : "indique"} ${lista(cal.faltan.map((x) => ETIQUETA[x.tipo]))}.` }],
    };
  return avanzar(cal.faltan, false);
}

/** Cada muestra del lector, con los contadores de habla al día (el ATC avanza solo con la posición, el COM1 y la toma). */
export function muestrearHabla(h0: EstadoHabla, m: Muestra, c: ContextoAtc): { habla: EstadoHabla; decir: Mensaje[] } {
  const h = sincronizar(h0);
  const s = alMuestrear(h.atc, m, conCtx(c, h));
  return { habla: sincronizar({ ...h, atc: s.estado }), decir: s.decir };
}
