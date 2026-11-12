// Debriefing por fases del repaso general y el renglón que se guarda. Puro.
import { resumenChecklist, type Checklist } from "./checklistVoz.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { nombreManiobra, type EstadoRepaso } from "./repaso.ts";
import { calificarTomas, VEL_C172 as V } from "./tomas.ts";
import { tolFinal } from "./nivel.ts";

export interface Parte {
  id: "checklist" | "despegue" | "maniobras" | "aterrizaje";
  titulo: string;
  bien: string[];
  repetir: string[];
  /** Lo que no se califica, para que se sepa por qué. */
  notas?: string[];
}

const kt = (x: number) => Math.round(x);

// El checklist es en español (lo reconoce el micrófono en español): en inglés solo se cuentan los puntos.
const T = {
  es: {
    titulos: { checklist: "Checklist", despegue: "Despegue", maniobras: "Maniobras", aterrizaje: "Aterrizaje" },
    navegacion: "Navegación",
    enOrden: (n: number) => `${n} puntos en orden`,
    saltados: (l: string[]) => l.map((s) => `Saltaste: ${s}`),
    noHechos: (l: string[]) => l.map((s) => `Dijiste pero no hiciste: ${s}`),
    noLeidas: (l: string[]) => l.map((s) => `No leíste: ${s}`),
    rotacion: (ok: boolean, v: number) => (ok ? `Rotaste a ${v} kt (Vr ${V.vr})` : `Rotaste a ${v} kt: rota a ${V.vr} kt`),
    vy: (ok: boolean, v: number) => (ok ? `Ascenso a ${v} kt (Vy ${V.vy})` : `Ascendiste a ${v} kt: sube a Vy, ${V.vy} kt`),
    final: (ok: boolean, a: number, b: number, f: string) => (ok ? `Final entre ${a} y ${b} kt (${V.aprox} ${f})` : `Final entre ${a} y ${b} kt: mantén ${V.aprox} kt, ${f}`),
    pista: (ok: boolean) => (ok ? "Tocaste en la pista" : "Tocaste fuera de la pista"),
    noVolada: "No se voló",
    sinVelocidades: "Velocidades: sin datos de este avión",
  },
  en: {
    titulos: { checklist: "Checklist", despegue: "Takeoff", maniobras: "Maneuvers", aterrizaje: "Landing" },
    navegacion: "Navigation",
    enOrden: (n: number) => `${n} items in order`,
    saltados: (l: string[]) => (l.length ? [`${l.length} items skipped`] : []),
    noHechos: (l: string[]) => (l.length ? [`${l.length} items called but not done`] : []),
    noLeidas: (l: string[]) => (l.length ? [`${l.length} sections not read`] : []),
    rotacion: (ok: boolean, v: number) => (ok ? `Rotated at ${v} kt (Vr ${V.vr})` : `Rotated at ${v} kt: rotate at ${V.vr} kt`),
    vy: (ok: boolean, v: number) => (ok ? `Climb at ${v} kt (Vy ${V.vy})` : `Climbed at ${v} kt: climb at Vy, ${V.vy} kt`),
    final: (ok: boolean, a: number, b: number, f: string) => (ok ? `Final between ${a} and ${b} kt (${V.aprox} ${f})` : `Final between ${a} and ${b} kt: hold ${V.aprox} kt, ${f}`),
    pista: (ok: boolean) => (ok ? "Touched down on the runway" : "Touched down off the runway"),
    noVolada: "Not flown",
    sinVelocidades: "Speeds: no data for this aircraft",
  },
};

/** Pone `texto` en bien o en repetir según `ok`; null = no se midió, no va en ningún lado. */
const poner = (p: Parte, ok: boolean | null, texto: string) => {
  if (ok !== null) (ok ? p.bien : p.repetir).push(texto);
};

export function debriefingRepaso(e: EstadoRepaso, cl: Checklist, idioma: Idioma): { partes: Parte[]; aprobado: boolean | null } {
  const t = T[idioma];
  const nueva = (id: Parte["id"]): Parte => ({ id, titulo: t.titulos[id], bien: [], repetir: [] });
  const r = resumenChecklist(cl);
  const c = calificarTomas(e.tomas, undefined, e.nivel);
  const tf = tolFinal(e.nivel);

  const checklist = nueva("checklist");
  checklist.bien.push(t.enOrden(r.enOrden));
  checklist.repetir.push(...t.saltados(r.saltados), ...t.noHechos(r.noHechos), ...t.noLeidas(r.noLeidas));

  // Otro avión (solo IFR): sin su checklist no hay parte de checklist, y las velocidades del C172 no se le aplican.
  const conChecklist = !e.avion || e.avion.voz !== null;
  const velocidades = !e.avion || e.avion.c172;
  const despegue = nueva("despegue");
  if (velocidades) {
    poner(despegue, c.despegue.rotacion, t.rotacion(!!c.despegue.rotacion, kt(e.tomas.rotacionKt ?? 0)));
    poner(despegue, c.despegue.vy, t.vy(!!c.despegue.vy, kt(e.tomas.vy.suma / Math.max(1, e.tomas.vy.n))));
  } else despegue.notas = [t.sinVelocidades];

  const maniobras = { ...nueva("maniobras"), ...(e.programa === "ifr" ? { titulo: t.navegacion } : {}) };
  for (const h of e.hechas) {
    const nombre = nombreManiobra(h.id, idioma);
    if (!h.resultado) maniobras.repetir.push(`${nombre}: ${t.noVolada}`);
    else (h.resultado.aprobado ? maniobras.bien : maniobras.repetir).push(`${nombre}: ${h.resultado.calificacion}/100`);
  }

  const aterrizaje = nueva("aterrizaje");
  if (velocidades) poner(aterrizaje, c.aterrizaje.final, t.final(!!c.aterrizaje.final, kt(e.tomas.final.min), kt(e.tomas.final.max), `-${tf.menos}/+${tf.mas}`));
  poner(aterrizaje, c.aterrizaje.enPista, t.pista(!!c.aterrizaje.enPista));

  const aprobado =
    e.modo === "practica" ? null : e.hechas.every((h) => h.resultado?.aprobado) && (!conChecklist || (r.saltados.length === 0 && r.noLeidas.length === 0));
  return { partes: [...(conChecklist ? [checklist] : []), despegue, maniobras, aterrizaje], aprobado };
}

const ESPERA_APAGADO_SEG = 60;

/** Después de cortar la mezcla todavía faltan puntos del «Apagado»: se espera a que cierre la sección, hasta 60 s. */
export function esperaApagado(cl: Checklist, segDesdeFin: number): boolean {
  if (segDesdeFin >= ESPERA_APAGADO_SEG) return false;
  return !cl.leidas.includes("apagado") || cl.abierta === "apagado";
}

/** El renglón de intentos_maniobra con maniobra «repaso-general». */
export function paraGuardarRepaso(e: EstadoRepaso, cl: Checklist) {
  const { partes, aprobado } = debriefingRepaso(e, cl, "es");
  const calificadas = e.hechas.flatMap((h) => (h.resultado ? [h.resultado.calificacion] : []));
  return {
    calificacion: calificadas.length ? Math.round(calificadas.reduce((a, b) => a + b, 0) / calificadas.length) : 0,
    aprobado: aprobado === true,
    elementos: Object.fromEntries(partes.map((p) => [p.id, p.repetir.length ? "NS" : "S"])) as Record<Parte["id"], "S" | "NS">,
    detalle: {
      zona: e.zona?.nombre.es ?? null,
      aeropuerto: e.vuelo?.aeropuerto?.icao ?? null,
      maniobras: e.hechas.map(({ id, resultado, intentoId }) => ({
        id, calificacion: resultado?.calificacion ?? null, aprobado: resultado?.aprobado ?? null, intentoId,
      })),
      checklist: resumenChecklist(cl),
      tomas: calificarTomas(e.tomas, undefined, e.nivel),
      nivel: e.nivel,
    },
  };
}
