import type { Muestra } from "./evaluador.ts";
import { CAMPOS_RECTO, desvioRecto, toleranciaRecto, type CampoRecto, type EvaluacionRecto } from "./evaluadorRecto.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolRecto } from "./nivel.ts";
import { ANULADO, avisoDe, CORRECCION, CORTO, luz, NOMBRE, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en recto y nivelado. Puro, como voz.ts.

export type PasoRecto = "estabiliza" | "manten" | "mitad" | "terminado" | "invalido";

export function pasoRecto(ev: EvaluacionRecto | null, m: Muestra | null): PasoRecto | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  if (ev.fase === "armado" || !ev.objetivo) return "estabiliza";
  const t = (m ?? ev.previo ?? ev.objetivo).t;
  return t - ev.objetivo.t >= tolRecto(ev.nivel).duracionSeg / 2 ? "mitad" : "manten";
}

const rumbo3 = (r: number) => String(Math.round(r) % 360 || 360).padStart(3, "0");

/** Texto de cada paso; el de mantener lleva los números del objetivo. */
function texto(paso: PasoRecto, ev: EvaluacionRecto | null, idioma: Idioma): string {
  const en = idioma === "en";
  const o = ev?.objetivo;
  switch (paso) {
    case "estabiliza":
      return en ? "Level off and stabilize: wings level, constant altitude and airspeed." : "Nivela y estabiliza: alas niveladas, altitud y velocidad constantes.";
    case "manten": {
      if (!o) return "";
      const alt = (Math.round(o.altitud / 10) * 10).toLocaleString("en-US");
      const kt = Math.round(o.velocidad);
      return en
        ? `Hold ${alt} feet, heading ${rumbo3(o.rumbo)} and ${kt} knots for two minutes.`
        : `Mantén ${alt} pies, rumbo ${rumbo3(o.rumbo)} y ${kt} nudos durante dos minutos.`;
    }
    case "mitad":
      return en ? "One minute. Keep it up." : "Un minuto. Sigue así.";
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

/** La orden al cambiar de paso; la lectura final va aparte. */
export function ordenRecto(antes: PasoRecto | null, ahora: PasoRecto | null, ev: EvaluacionRecto | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma) || null;
}

export function textoPasoRecto(paso: PasoRecto | null, ev: EvaluacionRecto | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

/** Desviación contra el objetivo, solo mientras se mantiene. */
function desviaciones(ev: EvaluacionRecto | null, m: Muestra | null): Record<CampoRecto, number | null> {
  const o = ev?.fase === "manteniendo" ? ev.objetivo : null;
  return Object.fromEntries(CAMPOS_RECTO.map((c) => [c, m && o ? desvioRecto(m, o, c) : null])) as Record<CampoRecto, number | null>;
}

export function semaforoRecto(ev: EvaluacionRecto | null, m: Muestra | null): Record<CampoRecto, Luz> {
  const d = desviaciones(ev, m);
  return Object.fromEntries(CAMPOS_RECTO.map((c) => [c, luz(d[c], toleranciaRecto(ev?.nivel)[c])])) as Record<CampoRecto, Luz>;
}

const RUMBO: Record<Idioma, { corto: string; nombre: string; correccion: { mas: string; menos: string } }> = {
  es: {
    corto: "Cuida el rumbo",
    nombre: "rumbo",
    correccion: { mas: "Te vas a la derecha: regresa a tu rumbo", menos: "Te vas a la izquierda: regresa a tu rumbo" },
  },
  en: {
    corto: "Watch your heading",
    nombre: "heading",
    correccion: { mas: "Drifting right: back to your heading", menos: "Drifting left: back to your heading" },
  },
};

export function avisoRecto(ev: EvaluacionRecto | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  const r = RUMBO[idioma];
  const textos = {
    corto: { ...CORTO[idioma], rumbo: r.corto },
    correccion: { ...CORRECCION[idioma], rumbo: r.correccion },
    nombre: { ...NOMBRE[idioma], rumbo: r.nombre },
  };
  return avisoDe(desviaciones(ev, m), toleranciaRecto(ev?.nivel), CAMPOS_RECTO, textos, modo, idioma);
}
