// Lo que se graba del vuelo para el debriefing con mapa: un punto por segundo, las fases y lo que dijo el instructor. Puro.
import { toleranciaViraje, type Muestra } from "./evaluador.ts";
import type { EstadoRepaso } from "./repaso.ts";
import type { Checklist } from "./checklistVoz.ts";
import { debriefingRepaso } from "./debriefingRepaso.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { MANIOBRAS, type Figuras, type ManiobraId, type ResultadoComun } from "./maniobras.ts";
import { tolArco, tolEspera, tolInterceptacion, tolRuta, type Nivel } from "./nivel.ts";
import { LIMITE_SEG } from "./evaluadorInterceptacion.ts";
import { toleranciaRecto } from "./evaluadorRecto.ts";
import { toleranciaLento } from "./evaluadorLento.ts";
import { toleranciaRumbos } from "./evaluadorRumbos.ts";
import { toleranciaAltitud } from "./evaluadorAltitud.ts";
import { toleranciaCombinado } from "./evaluadorCombinado.ts";
import { toleranciaCircuito } from "./evaluadorCircuito.ts";
import { toleranciaFalla } from "./evaluadorFalla.ts";
import { toleranciaS } from "./evaluadorS.ts";
import { toleranciaOcho } from "./evaluadorOcho.ts";
import { toleranciaAlrededor } from "./evaluadorAlrededor.ts";

/**
 * [t, lat, lon, altitud, velocidad, rumbo, inclinación, bola, agl]: arreglo y no objeto para que una hora pese poco.
 * IFR agrega [radial, barra en puntos, DME] al final.
 */
export type Punto = [
  t: number, lat: number, lon: number, altitud: number, velocidad: number, rumbo: number, inclinacion: number, bola: number, agl: number,
  radial?: number, desv?: number, dme?: number,
];
export const CAMPO_PUNTO = { t: 0, lat: 1, lon: 2, altitud: 3, velocidad: 4, rumbo: 5, inclinacion: 6, bola: 7, agl: 8, radial: 9, desv: 10, dme: 11 } as const;

export type FaseMapa = "rodaje" | "despegue" | "zona" | "circuitos" | "aterrizaje" | "rodaje-regreso";
export type TramoFase = { fase: FaseMapa; inicio: number; fin: number };

export interface Grabador {
  puntos: Punto[];
  fases: TramoFase[];
  voz: { t: number; texto: string }[];
  /** IFR: también el radio NAV1 en cada punto. */
  nav?: boolean;
}

export const crearGrabador = (nav = false): Grabador => ({ puntos: [], fases: [], voz: [], ...(nav ? { nav } : {}) });

const CADA_SEG = 1;
const r = (x: number, d = 0) => Math.round(x * 10 ** d) / 10 ** d;

/** null mientras no hay vuelo o si la lección se anuló: el grabador deja las fases como estaban. */
export function faseMapa(e: EstadoRepaso): FaseMapa | null {
  const f = e.vuelo?.fase;
  if (!f) return null;
  switch (e.etapa) {
    case "rampa":
      return f === "carrera-despegue" ? "despegue" : "rodaje";
    case "salida":
      return "despegue";
    case "maniobra":
    case "fuera-de-zona":
      return e.sorteo[0] === "toques-despegues" ? "circuitos" : "zona";
    case "regreso":
      return f === "rodaje-regreso" || f === "terminado" ? "rodaje-regreso" : "aterrizaje";
    case "terminado":
      return "rodaje-regreso";
    default:
      return null;
  }
}

/** Muta `g`: un punto por segundo y la fase extendida (o una nueva que empieza donde acabó la anterior). */
export function grabarMuestra(g: Grabador, m: Muestra, e: EstadoRepaso): void {
  const fase = faseMapa(e);
  if (fase) {
    const ultimo = g.fases[g.fases.length - 1];
    if (ultimo?.fase === fase) ultimo.fin = m.t;
    else {
      if (ultimo) ultimo.fin = m.t;
      g.fases.push({ fase, inicio: m.t, fin: m.t });
    }
  }
  if (m.lat === undefined || m.lon === undefined) return;
  const previo = g.puntos[g.puntos.length - 1];
  // El t guardado va redondeado a 0.1 s: sin el margen, un reloj en x.37 grabaría cada 2 s.
  if (previo && m.t - previo[0] < CADA_SEG - 0.05) return;
  const p: Punto = [r(m.t, 1), r(m.lat, 5), r(m.lon, 5), r(m.altitud), r(m.velocidad), r(m.rumbo), r(m.inclinacion), r(m.bola, 2), r(m.agl)];
  // La barra en puntos (uno = 2°), como la califica la interceptación.
  if (g.nav && m.navRadial !== undefined) p.push(r(m.navRadial), r((m.navDesv ?? 0) / 2, 1), r(m.navDme ?? 0, 1));
  g.puntos.push(p);
}

export function grabarVoz(g: Grabador, t: number, textos: string[]): void {
  for (const texto of textos) g.voz.push({ t, texto });
}

/** El punto con t más cercano; fuera del vuelo, el extremo. */
export function puntoEn(puntos: Punto[], t: number): Punto | null {
  if (!puntos.length) return null;
  let a = 0;
  let b = puntos.length - 1;
  while (b - a > 1) {
    const k = (a + b) >> 1;
    if (puntos[k][0] <= t) a = k;
    else b = k;
  }
  return Math.abs(puntos[a][0] - t) <= Math.abs(puntos[b][0] - t) ? puntos[a] : puntos[b];
}

// ── Los errores, cada uno con su momento ──

/** La tolerancia de cada campo de `fuera`, por maniobra y nivel. */
export const TOLERANCIAS: Record<ManiobraId, (n: Nivel) => Record<string, number>> = {
  "viraje-escarpado": toleranciaViraje,
  "recto-nivelado": toleranciaRecto,
  "vuelo-lento": toleranciaLento,
  "virajes-rumbos": toleranciaRumbos,
  "ascensos-descensos": toleranciaAltitud,
  "virajes-ascendiendo": toleranciaCombinado,
  "toques-despegues": toleranciaCircuito,
  "falla-motor": toleranciaFalla,
  "s-camino": toleranciaS,
  "ocho-pilones": toleranciaOcho,
  "ocho-alrededor": toleranciaAlrededor,
  familiarizacion: () => ({}),
  "interceptar-radial": (n) => ({ sobrepaso: tolInterceptacion(n).sobrepasoPuntos, corto: tolInterceptacion(n).cortoSeg, interceptar: LIMITE_SEG }),
  "ruta-vor": (n) => ({ acercamiento: tolRuta(n).puntos, alejamiento: tolRuta(n).puntos }),
  "arco-dme": (n) => ({ entrada: tolArco(n).distanciaNm, distancia: tolArco(n).distanciaNm, salida: tolInterceptacion(n).sobrepasoPuntos }),
  espera: (n) => ({ dicha: 0, volada: 0, tramo: tolEspera(n).tramoSeg, acercamiento: tolEspera(n).puntos, virajes: tolEspera(n).tasaGrados, distancia: tolEspera(n).maxNm, altitud: tolEspera(n).altitudFt }),
};

/** Unidad de `peor` por campo; "maniobra.campo" cuando una maniobra usa el mismo nombre con otra unidad. */
export const UNIDAD: Record<string, string> = {
  altitud: "ft", velocidad: "kt", inclinacion: "°", rumbo: "°", bola: "", ala: "°", alas: "°", radio: "%", simetria: "%", cruce: "s",
  rotacion: "kt", ascenso: "kt", final: "kt", toque: "ft/min", reaccion: "s", planeo: "kt", checklist: "", recuperacion: "s",
  "interceptar-radial.sobrepaso": " puntos", "interceptar-radial.corto": "s", "interceptar-radial.interceptar": "s",
  "ruta-vor.acercamiento": " puntos", "ruta-vor.alejamiento": " puntos",
  "arco-dme.entrada": " NM", "arco-dme.distancia": " NM", "arco-dme.salida": " puntos",
  "espera.tramo": "s", "espera.acercamiento": " puntos", "espera.virajes": "°/s", "espera.distancia": " NM",
};
export const unidadDe = (_id: ManiobraId, campo: string): string => UNIDAD[`${_id}.${campo}`] ?? UNIDAD[campo] ?? "";

type TramoCampo = { campo: string; inicio: number; fin: number; peor: number };
const esTramo = (x: unknown): x is { inicio: number; fin: number; peor: number } =>
  !!x && typeof (x as { inicio?: unknown }).inicio === "number" && typeof (x as { fin?: unknown }).fin === "number" && typeof (x as { peor?: unknown }).peor === "number";

/** Todos los tramos fuera de tolerancia del resultado, también los anidados por lado (viraje escarpado). Las muestras no se recorren. */
export function tramosFuera(r: unknown): TramoCampo[] {
  const out: TramoCampo[] = [];
  const visitar = (x: unknown) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) return x.forEach(visitar);
    for (const [k, v] of Object.entries(x)) {
      if (k === "muestras") continue;
      if (k === "fuera" && v && typeof v === "object" && !Array.isArray(v)) {
        for (const [campo, tramos] of Object.entries(v)) if (Array.isArray(tramos)) for (const tr of tramos) if (esTramo(tr)) out.push({ campo, inicio: tr.inicio, fin: tr.fin, peor: tr.peor });
      } else visitar(v);
    }
  };
  visitar(r);
  return out;
}

export type IntentoVuelo = { n: number; maniobra: ManiobraId; calificacion: number; aprobado: boolean; inicio: number; fin: number };
export type ErrorVuelo = {
  n: number;
  fase: FaseMapa | "checklist";
  inicio: number | null;
  fin: number | null;
  intento?: number;
  maniobra?: ManiobraId;
  campo?: string;
  peor?: number;
  tol?: number;
  texto?: Record<Idioma, string>;
};
export interface Grabacion {
  version: 1;
  leccion: number;
  puntos: Punto[];
  fases: TramoFase[];
  voz: { t: number; texto: string }[];
  intentos: IntentoVuelo[];
  errores: ErrorVuelo[];
  explicaciones: { intento: number; lineas: Record<Idioma, string[]> }[];
  bien: Record<Idioma, string[]>;
  zona: { lat: number; lon: number; radioNm: number; poligono?: [number, number][] } | null;
  anulada: { t: number; motivo: string } | null;
  /** IFR: el VOR de la lección; `decl` para dibujar los radiales (magnéticos) en el mapa (verdadero). */
  vor?: { ident: string; lat: number; lon: number; decl: number };
  /** IFR: los radiales pedidos en cada intento, y los arcos y esperas. */
  radiales?: { intento: number; radial: number; desde: boolean }[];
  arcos?: ({ intento: number } & NonNullable<Figuras["arco"]>)[];
  esperas?: ({ intento: number } & NonNullable<Figuras["espera"]>)[];
}

const IDIOMAS: Idioma[] = ["es", "en"];

/** Al terminar (o anularse) la lección: los errores ya ubicados, para que la página de un vuelo guardado solo los lea. */
export function cerrarGrabacion(
  g: Grabador,
  x: { leccion: number; e: EstadoRepaso; cl: Checklist; resultados: { maniobra: ManiobraId; resultado: ResultadoComun }[] },
): Grabacion {
  const { e } = x;
  const faseEn = (t: number): FaseMapa => g.fases.find((f) => t >= f.inicio && t <= f.fin)?.fase ?? "zona";
  const sinNumero: Omit<ErrorVuelo, "n">[] = [];

  const intentos: IntentoVuelo[] = x.resultados.map(({ maniobra, resultado: r }, i) => ({
    n: i + 1, maniobra, calificacion: r.calificacion, aprobado: r.aprobado, inicio: r.muestras[0]?.t ?? 0, fin: r.muestras[r.muestras.length - 1]?.t ?? 0,
  }));
  x.resultados.forEach(({ maniobra, resultado: r }, i) => {
    const tol = TOLERANCIAS[maniobra](r.nivel ?? 3);
    for (const tr of tramosFuera(r)) {
      sinNumero.push({ fase: faseEn(tr.inicio), inicio: tr.inicio, fin: tr.fin, intento: i + 1, maniobra, campo: tr.campo, peor: tr.peor, tol: tol[tr.campo] });
    }
  });
  const explicaciones = x.resultados
    .map(({ maniobra, resultado: r }, i) => ({
      intento: i + 1,
      lineas: Object.fromEntries(IDIOMAS.map((idioma) => [idioma, MANIOBRAS[maniobra].explicar(r, idioma).filter((l) => l.tipo === "mal").map((l) => l.texto)])) as Record<Idioma, string[]>,
    }))
    .filter((x) => x.lineas.es.length > 0);

  // El debriefing de la lección: despegue y aterrizaje en su evento; el checklist en un solo renglón (en inglés solo cuenta).
  const deb = { es: debriefingRepaso(e, x.cl, "es"), en: debriefingRepaso(e, x.cl, "en") };
  const parte = (idioma: Idioma, id: string) => deb[idioma].partes.find((p) => p.id === id)!;
  const eventos = e.vuelo?.eventos ?? [];
  const momento = { despegue: eventos.find((v) => v.tipo === "despegue")?.t ?? null, aterrizaje: eventos.filter((v) => v.tipo === "aterrizaje").at(-1)?.t ?? null };
  for (const id of ["despegue", "aterrizaje"] as const) {
    parte("es", id).repetir.forEach((texto, k) =>
      sinNumero.push({ fase: id, inicio: momento[id], fin: momento[id], texto: { es: texto, en: parte("en", id).repetir[k] ?? texto } }),
    );
  }
  const cl = { es: parte("es", "checklist").repetir, en: parte("en", "checklist").repetir };
  if (cl.es.length) sinNumero.push({ fase: "checklist", inicio: null, fin: null, texto: { es: cl.es.join("; "), en: cl.en.join("; ") } });

  const errores = sinNumero
    .sort((a, b) => (a.inicio ?? Number.MAX_VALUE) - (b.inicio ?? Number.MAX_VALUE))
    .map((err, k) => ({ n: k + 1, ...err }));
  const bien = Object.fromEntries(IDIOMAS.map((idioma) => [idioma, deb[idioma].partes.flatMap((p) => p.bien)])) as Record<Idioma, string[]>;
  const z = e.zona;
  const v = e.vor;
  const figuras = x.resultados.map(({ maniobra, resultado }, i) => ({ intento: i + 1, f: MANIOBRAS[maniobra].figuras?.(resultado) ?? {} }));
  const radiales = figuras.flatMap(({ intento, f }) => (f.radiales ?? []).map((r) => ({ intento, ...r })));
  const arcos = figuras.flatMap(({ intento, f }) => (f.arco ? [{ intento, ...f.arco }] : []));
  const esperas = figuras.flatMap(({ intento, f }) => (f.espera ? [{ intento, ...f.espera }] : []));
  return {
    version: 1,
    leccion: x.leccion,
    puntos: g.puntos,
    fases: g.fases,
    voz: g.voz,
    intentos,
    errores,
    explicaciones,
    bien,
    zona: z ? { lat: z.lat, lon: z.lon, radioNm: z.radioNm, ...(z.poligono ? { poligono: z.poligono } : {}) } : null,
    anulada: e.etapa === "invalido" ? { t: g.puntos[g.puntos.length - 1]?.[0] ?? 0, motivo: e.motivo ?? "" } : null,
    // Solo en IFR: una grabación VFR queda igual.
    ...(v ? { vor: { ident: v.ident, lat: v.lat, lon: v.lon, decl: v.decl }, radiales } : {}),
    ...(v && arcos.length ? { arcos } : {}),
    ...(v && esperas.length ? { esperas } : {}),
  };
}

/** Un marcador por punto del mapa: errores que caen en el mismo segundo (rotar y ascender) van juntos para no taparse. */
export function marcasErrores(g: Grabacion): { punto: Punto; ns: number[] }[] {
  const marcas = new Map<Punto, number[]>();
  for (const e of g.errores) {
    const p = e.inicio === null ? null : puntoEn(g.puntos, e.inicio);
    if (p) marcas.set(p, [...(marcas.get(p) ?? []), e.n]);
  }
  return [...marcas].map(([punto, ns]) => ({ punto, ns }));
}
