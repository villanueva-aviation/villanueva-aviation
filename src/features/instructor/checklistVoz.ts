// Sigue el checklist leído en voz alta: el cadete dice cada punto mientras lo hace (lectura y acción a la vez).
// `oir` avanza con lo que se oyó; `avanzarChecklist` revisa en el simulador los puntos dichos, igual que avanzarVuelo.
import type { Muestra } from "./evaluador.ts";
import { normalizar } from "./preguntas.ts";
import { revisar, ventana, type ContextoRevision } from "./revisionSim.ts";
import type { SeccionId, SeccionVoz } from "../../data/checklistVozC172.ts";
import type { TipoPieza } from "./colaVoz.ts";

export type EstadoPunto = "pendiente" | "revisando" | "hecho" | "dicho" | "no-hecho" | "saltado";
export type Punto = { estado: EstadoPunto; t?: number; detalle?: string };
export interface Checklist {
  secciones: SeccionVoz[];
  abierta: SeccionId | null;
  siguiente: number; // índice en la sección abierta
  puntos: Record<SeccionId, Punto[]>;
  leidas: SeccionId[]; // abiertas alguna vez
  muestras: Muestra[]; // últimos BUFFER_SEG
}

/** El tipo de pieza del aviso de sección: un «aviso» de la cola sin clave vigente se descarta y no sonaría. */
export const PIEZA_AVISO: TipoPieza = "orden";
export const ADELANTE = 3; // puntos que se buscan desde el siguiente
export const BUFFER_SEG = 60;

const COMANDO = ["checklist", "check list"];
const COMPLETO = ["completo", "completa", "terminado"];

const pendientes = (s: SeccionVoz): Punto[] => s.puntos.map(() => ({ estado: "pendiente" }));
const reto = (dicho: string) => dicho.split(" — ")[0];
const copiar = (cl: Checklist): Checklist => ({
  ...cl,
  puntos: Object.fromEntries(Object.entries(cl.puntos).map(([k, v]) => [k, v.map((p) => ({ ...p }))])) as Checklist["puntos"],
  leidas: [...cl.leidas],
});

export function crearChecklist(secciones: SeccionVoz[]): Checklist {
  return {
    secciones,
    abierta: null,
    siguiente: 0,
    puntos: Object.fromEntries(secciones.map((s) => [s.id, pendientes(s)])) as Checklist["puntos"],
    leidas: [],
    muestras: [],
  };
}

/** La coincidencia de alguna clave desde `pos`: la que empieza antes y, si empatan, la más larga. */
function buscar(d: string, claves: string[], pos: number): { inicio: number; fin: number } | null {
  let mejor: { inicio: number; fin: number } | null = null;
  for (const c of claves) {
    const n = normalizar(c, "es");
    if (!n) continue;
    const i = d.indexOf(` ${n} `, pos);
    if (i < 0) continue;
    const fin = i + n.length + 1; // queda en el espacio, que sirve de inicio a la siguiente
    if (!mejor || i < mejor.inicio || (i === mejor.inicio && fin > mejor.fin)) mejor = { inicio: i, fin };
  }
  return mejor;
}

/** Cierra la sección abierta (muta `cl`, que ya es copia): lo que faltaba queda saltado. */
function cerrar(cl: Checklist) {
  if (!cl.abierta) return;
  for (const p of cl.puntos[cl.abierta]) if (p.estado === "pendiente") p.estado = "saltado";
  cl.abierta = null;
  cl.siguiente = 0;
}

/** Puntos dichos en `d` desde `pos` (muta `cl`). */
function puntosDichos(cl: Checklist, d: string, pos: number, t: number) {
  while (cl.abierta) {
    const sec = cl.secciones.find((s) => s.id === cl.abierta)!;
    const estado = cl.puntos[sec.id];
    // El punto recién dicho también se busca: repetirlo no debe saltar los que comparten palabra con él.
    // Gana la coincidencia que empieza antes en la frase; si empatan, el anterior (es repetición) y luego el más cercano.
    let hallado: { k: number; inicio: number; fin: number } | null = null;
    for (let k = Math.max(0, cl.siguiente - 1); k < Math.min(sec.puntos.length, cl.siguiente + ADELANTE); k++) {
      if (k < cl.siguiente && estado[k].estado === "pendiente") continue;
      const b = buscar(d, sec.puntos[k].claves, pos);
      if (b && (!hallado || b.inicio < hallado.inicio)) hallado = { k, ...b };
    }
    if (!hallado) return;
    if (hallado.k < cl.siguiente) {
      pos = hallado.fin;
      continue;
    }
    for (let k = cl.siguiente; k < hallado.k; k++) estado[k] = { estado: "saltado" };
    estado[hallado.k] = sec.puntos[hallado.k].revisa ? { estado: "revisando", t } : { estado: "dicho", t };
    pos = hallado.fin;
    cl.siguiente = hallado.k + 1;
    if (cl.siguiente >= sec.puntos.length) {
      cl.abierta = null;
      cl.siguiente = 0;
    }
  }
}

/** t: reloj del lector (la última muestra), para que las ventanas cuadren. */
export function oir(cl0: Checklist, texto: string, t: number): Checklist {
  const cl = copiar(cl0);
  const d = ` ${normalizar(texto, "es")} `;
  const cmd = buscar(d, COMANDO, 0);
  if (cmd) {
    if (buscar(d, COMPLETO, cmd.fin)) {
      cerrar(cl);
      return cl;
    }
    let mejor: { s: SeccionVoz; fin: number; largo: number } | null = null;
    for (const s of cl.secciones)
      for (const c of s.claves) {
        const b = buscar(d, [c], cmd.fin);
        if (b && (!mejor || b.fin - b.inicio > mejor.largo)) mejor = { s, fin: b.fin, largo: b.fin - b.inicio };
      }
    if (mejor) {
      cerrar(cl);
      cl.abierta = mejor.s.id;
      cl.siguiente = 0;
      cl.puntos[mejor.s.id] = pendientes(mejor.s);
      if (!cl.leidas.includes(mejor.s.id)) cl.leidas.push(mejor.s.id);
      puntosDichos(cl, d, mejor.fin, t);
      return cl;
    }
  }
  puntosDichos(cl, d, 0, t);
  return cl;
}

export function avanzarChecklist(cl0: Checklist, m: Muestra, ctx: ContextoRevision): Checklist {
  const cl = copiar(cl0);
  cl.muestras = [...cl0.muestras, m].filter((x) => x.t >= m.t - BUFFER_SEG);
  for (const s of cl.secciones)
    s.puntos.forEach((punto, k) => {
      const p = cl.puntos[s.id][k];
      if (p.estado !== "revisando" || !punto.revisa || p.t === undefined) return;
      const v = ventana(punto.revisa);
      const enVentana = cl.muestras.filter((x) => x.t >= p.t! - v.antes && x.t <= p.t! + v.despues);
      const vencido = m.t > p.t + v.despues;
      if (!enVentana.length) {
        if (vencido) p.estado = "dicho"; // nunca llegaron muestras: no se pudo ver
        return;
      }
      const r = revisar(punto.revisa, enVentana, ctx);
      if (r === null) p.estado = "dicho";
      else if (r.ok) p.estado = "hecho";
      else if (vencido) {
        p.estado = "no-hecho";
        if (r.detalle) p.detalle = r.detalle;
      }
    });
  return cl;
}

const lista = (s: SeccionVoz, ps: Punto[], estado: EstadoPunto) =>
  s.puntos.flatMap((p, k) => (ps[k].estado === estado ? [ps[k].detalle ? `${reto(p.dicho)} (${ps[k].detalle})` : reto(p.dicho)] : []));

/** Lo que dice el instructor al cerrar la sección; null mientras siga abierta o tenga puntos revisando. */
export function avisoSeccion(cl: Checklist, id: SeccionId): string | null {
  const s = cl.secciones.find((x) => x.id === id);
  if (!s || cl.abierta === id || !cl.leidas.includes(id)) return null;
  const ps = cl.puntos[id];
  if (ps.some((p) => p.estado === "revisando")) return null;
  const saltados = lista(s, ps, "saltado");
  const noHechos = lista(s, ps, "no-hecho");
  if (!saltados.length && !noHechos.length) return `${s.titulo}: completo.`;
  return [s.titulo + ".", saltados.length ? `Te faltó: ${saltados.join(", ")}.` : "", noHechos.length ? `No vi hecho: ${noHechos.join(", ")}.` : ""]
    .filter(Boolean)
    .join(" ");
}

/** Los avisos listos que no se han dicho. Esperan a que no haya sección abierta, para no hablar encima del cadete. */
export function avisosPorDecir(cl: Checklist, dichos: ReadonlySet<SeccionId>): { id: SeccionId; texto: string }[] {
  if (cl.abierta) return [];
  return cl.secciones.flatMap((s) => {
    const texto = dichos.has(s.id) ? null : avisoSeccion(cl, s.id);
    return texto ? [{ id: s.id, texto }] : [];
  });
}

export function resumenChecklist(cl: Checklist): { enOrden: number; saltados: string[]; noHechos: string[]; noLeidas: string[] } {
  let enOrden = 0;
  const saltados: string[] = [];
  const noHechos: string[] = [];
  for (const s of cl.secciones) {
    const ps = cl.puntos[s.id];
    enOrden += ps.filter((p) => p.estado === "hecho" || p.estado === "dicho").length;
    saltados.push(...lista(s, ps, "saltado").map((r) => `${s.titulo}: ${r}`));
    noHechos.push(...lista(s, ps, "no-hecho").map((r) => `${s.titulo}: ${r}`));
  }
  const noLeidas = cl.secciones.filter((s) => !cl.leidas.includes(s.id)).map((s) => s.titulo);
  return { enOrden, saltados, noHechos, noLeidas };
}
