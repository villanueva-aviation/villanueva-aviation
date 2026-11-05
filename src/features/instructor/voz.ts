import { difRumbo, TOLERANCIA, type Campo, type Evaluacion, type Muestra, type Resultado } from "./evaluador.ts";
import { explicar, repetir } from "./explicacion.ts";
import {
  ALTURA_SEGURA_AGL,
  AVISO_FRACCION,
  INCLINACION_ESTABLECIDA,
  INCLINACION_OBJETIVO,
  LIMPIEZA,
  REPETIR_AVISO_SEG,
} from "./virajeEscarpado.ts";

// Qué dice el instructor y cuándo. Puro: la vista solo lo reproduce.

export type CampoAviso = Campo;
export type Luz = "gris" | "verde" | "ambar" | "rojo";
export type Aviso = { clave: string; nivel: "ambar" | "rojo"; texto: string };
type Modo = "practica" | "checkride";

const ASENTAR_SEG = 2;
const CAMPOS: CampoAviso[] =["altitud", "velocidad", "inclinacion", "bola"];
const NOMBRE: Record<CampoAviso, string> = { altitud: "altitud", velocidad: "velocidad", inclinacion: "inclinación", bola: "coordinación" };
const CORTO: Record<CampoAviso, string> = {
  altitud: "Ojo con tu altitud",
  velocidad: "Revisa tu velocidad",
  inclinacion: "Cuida la inclinación",
  bola: "Centra la bola",
};
const CORRECCION: Record<CampoAviso, { mas: string; menos: string }> = {
  altitud: { mas: "Estás subiendo: menos presión atrás", menos: "Estás perdiendo altitud: más presión atrás" },
  velocidad: { mas: "Vas muy rápido: reduce potencia", menos: "Vas muy lento: agrega potencia" },
  inclinacion: { mas: "Te estás pasando de 45 grados: afloja la inclinación", menos: "Te falta inclinación: lleva el avión a 45 grados" },
  bola: { mas: "Centra la bola con el pedal", menos: "Centra la bola con el pedal" },
};

/** Desviación de cada campo contra la entrada, o null si ese campo no se está midiendo ahora. */
function desviaciones(ev: Evaluacion | null, m: Muestra | null): Record<CampoAviso, number | null> {
  const nada = { altitud: null, velocidad: null, inclinacion: null, bola: null };
  const giro = ev?.interno.giro;
  if (!m || !giro) return nada;
  // Inclinación y bola: en la ventana que se califica, pero ASENTAR_SEG después de llegar a 40°,
  // para no avisar mientras el cadete todavía está entrando a 45°.
  const llego = [...giro.muestras, m].find((x) => Math.abs(x.inclinacion) >= INCLINACION_ESTABLECIDA);
  const ventana = !!llego && m.t - llego.t >= ASENTAR_SEG && Math.abs(giro.girado) < 330;
  return {
    altitud: m.altitud - giro.ref.altitud,
    velocidad: m.velocidad - giro.ref.velocidad,
    inclinacion: ventana ? Math.abs(m.inclinacion) - INCLINACION_OBJETIVO : null,
    bola: ventana ? m.bola : null,
  };
}

function luz(d: number | null, tol: number): Luz {
  if (d === null) return "gris";
  if (Math.abs(d) > tol) return "rojo";
  if (Math.abs(d) > AVISO_FRACCION * tol) return "ambar";
  return "verde";
}

export function semaforo(ev: Evaluacion | null, m: Muestra | null): Record<CampoAviso, Luz> {
  const d = desviaciones(ev, m);
  return { altitud: luz(d.altitud, TOLERANCIA.altitud), velocidad: luz(d.velocidad, TOLERANCIA.velocidad), inclinacion: luz(d.inclinacion, TOLERANCIA.inclinacion), bola: luz(d.bola, TOLERANCIA.bola) };
}

/** El aviso más importante ahora: altitud, velocidad, inclinación, bola. */
export function avisoVoz(ev: Evaluacion | null, m: Muestra | null, modo: Modo): Aviso | null {
  const d = desviaciones(ev, m);
  for (const campo of CAMPOS) {
    const nivel = luz(d[campo], TOLERANCIA[campo]);
    if (nivel !== "ambar" && nivel !== "rojo") continue;
    const signo = d[campo]! > 0 ? "+" : "-";
    const practica = CORRECCION[campo][signo === "+" ? "mas" : "menos"];
    const texto =
      nivel === "ambar"
        ? modo === "checkride" ? CORTO[campo] : practica
        : modo === "checkride" ? `Fuera de tolerancia: ${NOMBRE[campo]}` : `Fuera de tolerancia. ${practica}`;
    return { clave: `${campo}-${nivel}-${signo}`, nivel, texto };
  }
  return null;
}

export type MemoriaAviso = { clave: string | null; desde: number; libreDesde: number | null };
export const MEMORIA_VACIA: MemoriaAviso = { clave: null, desde: 0, libreDesde: null };
/** Tanto tiempo dentro de la banda para que el mismo aviso se pueda volver a decir de inmediato. */
const LIBRE_SEG = 2;

/** Cada aviso se dice una vez; se repite tras REPETIR_AVISO_SEG o tras volver a la banda por LIBRE_SEG. */
export function filtrarAviso(mem: MemoriaAviso, aviso: Aviso | null, t: number): { decir: string | null; mem: MemoriaAviso } {
  if (!aviso) {
    const libreDesde = mem.libreDesde ?? t;
    if (t - libreDesde >= LIBRE_SEG) return { decir: null, mem: MEMORIA_VACIA };
    return { decir: null, mem: { ...mem, libreDesde } };
  }
  if (aviso.clave !== mem.clave || t - mem.desde >= REPETIR_AVISO_SEG) {
    return { decir: aviso.texto, mem: { clave: aviso.clave, desde: t, libreDesde: null } };
  }
  return { decir: null, mem: { ...mem, libreDesde: null } };
}

export type PasoVoz = "bajo" | "limpieza" | "despejado" | "viraje1" | "nivelar1" | "entre" | "viraje2" | "nivelar2" | "terminado" | "invalido";

function limpiezaHecha(ev: Evaluacion, m: Muestra): boolean {
  const ventana = ev.interno.historial.filter((x) => x.t >= m.t - LIMPIEZA.ventanaSeg);
  let grados = 0;
  for (let k = 1; k < ventana.length; k++) grados += Math.abs(difRumbo(ventana[k].rumbo, ventana[k - 1].rumbo));
  return grados >= LIMPIEZA.grados;
}

export function pasoVoz(ev: Evaluacion | null, m: Muestra | null): PasoVoz | null {
  if (!ev) return null;
  if (ev.fase === "invalido" || ev.fase === "terminado") return ev.fase;
  if (ev.fase === "entre") return "entre";
  const girado = Math.abs(ev.interno.giro?.girado ?? 0);
  if (ev.fase === "viraje1") return girado >= 300 ? "nivelar1" : "viraje1";
  if (ev.fase === "viraje2") return girado >= 300 ? "nivelar2" : "viraje2";
  if (!m) return "limpieza";
  if (m.agl < ALTURA_SEGURA_AGL) return "bajo";
  return limpiezaHecha(ev, m) ? "despejado" : "limpieza";
}

const ORDEN: Partial<Record<PasoVoz, string>> = {
  bajo: "Suba a 1,500 pies sobre el terreno.",
  limpieza: "Despeje el área con sus virajes de limpieza.",
  despejado: "Área despejada. Inicie el viraje de 360 grados.",
  nivelar1: "Nivele en su rumbo de entrada.",
  nivelar2: "Nivele en su rumbo de entrada.",
  entre: "Ahora al lado contrario.",
};

/** La orden del examinador al cambiar de paso; la lectura final va aparte. */
export function ordenVoz(antes: PasoVoz | null, ahora: PasoVoz | null, ev: Evaluacion | null): string | null {
  if (!ahora || ahora === antes) return null;
  if (ahora === "invalido") return `Intento anulado. ${ev?.motivo ?? ""}`.trim();
  return ORDEN[ahora] ?? null;
}

const PASO: Record<PasoVoz, string> = {
  bajo: "Suba a 1,500 pies sobre el terreno.",
  limpieza: "Despeje el área con sus virajes de limpieza.",
  despejado: "Inicia el viraje de 360° a 45°.",
  viraje1: "Sostén 45°, la altitud y la velocidad.",
  nivelar1: "Nivela en tu rumbo de entrada.",
  entre: "Ahora al lado contrario.",
  viraje2: "Sostén 45° y nivela en tu rumbo de entrada.",
  nivelar2: "Nivela en tu rumbo de entrada.",
  terminado: "Maniobra terminada.",
  invalido: "",
};

export function textoPaso(paso: PasoVoz | null): string {
  return paso ? PASO[paso] : "";
}

/** Qué falta para que el instructor empiece solo. */
export function textoEspera(m: Muestra | null): string {
  if (m && !/172/.test(m.titulo)) return `Esta maniobra es para el C172 y tu avión es «${m.titulo}».`;
  if (m?.enTierra) return "Despega: el instructor empieza solo cuando vueles nivelado.";
  if (m && (m.pausa || m.slew || m.tasa !== 1)) return "Quita la pausa, el slew o la velocidad acelerada y el instructor empieza solo.";
  return "Nivela las alas y el instructor empieza solo.";
}

/** Lo que lee la voz al terminar: resultado, explicación, avisos y qué repetir. */
export function lecturaFinal(r: Resultado): string[] {
  const rep = repetir(r);
  return [
    `${r.aprobado ? "Aprobado" : "No aprobado"}. Calificación: ${r.calificacion} de 100.`,
    ...explicar(r).map((l) => l.texto),
    ...r.avisos,
    ...(rep ? [rep] : []),
  ].map(paraVoz);
}

/** Unidades y símbolos como se dicen en voz alta. */
export function paraVoz(texto: string): string {
  return texto
    .replace(/[✓✗]/g, "")
    .replace(/(\d)\s?ft\b/g, "$1 pies")
    .replace(/(\d)\s?kt\b/g, "$1 nudos")
    .replace(/°/g, " grados")
    .replace(/±/g, "más menos ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}
