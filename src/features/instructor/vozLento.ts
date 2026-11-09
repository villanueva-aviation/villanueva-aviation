import type { Muestra } from "./evaluador.ts";
import { CAMPOS_LENTO, desvioLento, toleranciaLento, type CampoLento, type EvaluacionLento } from "./evaluadorLento.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import { GIRO_GRADOS, INCLINACION_VIRAJE, OBJETIVO_KT, RECTO_SEG } from "./vueloLento.ts";
import { tolLento } from "./nivel.ts";
import { ANULADO, avisoDe, CORRECCION, CORTO, luz, NOMBRE, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en vuelo lento. Puro, como voz.ts.

export type PasoLento = "sube" | "reduce" | "recto" | "vira1" | "vira2" | "sal" | "terminado" | "invalido";

const PASO_DE_FASE = { recto: "recto", viraje1: "vira1", viraje2: "vira2", salida: "sal" } as const;

export function pasoLento(ev: EvaluacionLento | null, m: Muestra | null): PasoLento | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  if (ev.fase === "armado") return m && m.agl < ALTURA_SEGURA_AGL ? "sube" : "reduce";
  return PASO_DE_FASE[ev.fase];
}

const rumbo3 = (r: number) => String(Math.round(r) % 360 || 360).padStart(3, "0");
const ALTURA = ALTURA_SEGURA_AGL.toLocaleString("en-US");

function texto(paso: PasoLento, ev: EvaluacionLento | null, idioma: Idioma): string {
  const en = idioma === "en";
  const o = ev?.objetivo;
  switch (paso) {
    case "sube":
      return en ? `Climb to at least ${ALTURA} feet above the ground before you start.` : `Sube a ${ALTURA} pies sobre el terreno o más antes de empezar.`;
    case "reduce":
      return en
        ? `Full flaps, reduce power and hold your altitude as you slow to ${OBJETIVO_KT} knots.`
        : `Flaps completos, reduce la potencia y mantén la altitud mientras bajas a ${OBJETIVO_KT} nudos.`;
    case "recto": {
      if (!o) return "";
      const alt = (Math.round(o.altitud / 10) * 10).toLocaleString("en-US");
      const MAX_KT = OBJETIVO_KT + tolLento(ev?.nivel).velocidadMasKt;
      return en
        ? `Hold ${alt} feet, heading ${rumbo3(o.rumbo)} and ${OBJETIVO_KT} to ${MAX_KT} knots, straight and level, for about ${RECTO_SEG} seconds.`
        : `Mantén ${alt} pies, rumbo ${rumbo3(o.rumbo)} y de ${OBJETIVO_KT} a ${MAX_KT} nudos, recto y nivelado, unos ${RECTO_SEG} segundos.`;
    }
    case "vira1":
      return en
        ? `Gentle ${GIRO_GRADOS}-degree turn to either side, ${INCLINACION_VIRAJE} degrees of bank. Hold altitude and airspeed.`
        : `Viraje suave de ${GIRO_GRADOS} grados a cualquier lado, con ${INCLINACION_VIRAJE} grados de inclinación. Mantén la altitud y la velocidad.`;
    case "vira2": {
      const derecha = ev?.primerLado !== "derecha";
      return en
        ? `Now ${GIRO_GRADOS} degrees to the ${derecha ? "right" : "left"}, back to your heading.`
        : `Ahora ${GIRO_GRADOS} grados a la ${derecha ? "derecha" : "izquierda"}, de vuelta a tu rumbo.`;
    }
    case "sal":
      return en
        ? "Recover from slow flight: full power, pitch to hold altitude, and flaps up in stages."
        : "Sal del vuelo lento: potencia completa, nariz para mantener la altitud y flaps arriba por etapas.";
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

/** La orden al cambiar de paso; la lectura final va aparte. */
export function ordenLento(antes: PasoLento | null, ahora: PasoLento | null, ev: EvaluacionLento | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma) || null;
}

export function textoPasoLento(paso: PasoLento | null, ev: EvaluacionLento | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

/** Lo que se mide en cada fase, como el evaluador; lo demás va en null (gris). */
function desviaciones(ev: EvaluacionLento | null, m: Muestra | null): Record<CampoLento, number | null> {
  const nada = { altitud: null, rumbo: null, velocidad: null, inclinacion: null, bola: null };
  const o = ev?.objetivo;
  if (!ev || !m || !o) return nada;
  const d = (c: CampoLento) => desvioLento(m, o, c, ev.nivel);
  const giro = Math.abs(ev.giro);
  switch (ev.fase) {
    case "recto":
      return { ...nada, altitud: d("altitud"), rumbo: d("rumbo"), velocidad: d("velocidad"), bola: d("bola") };
    case "viraje1":
    case "viraje2":
      return {
        ...nada,
        altitud: d("altitud"),
        velocidad: d("velocidad"),
        inclinacion: giro > 15 && giro < GIRO_GRADOS - 15 ? d("inclinacion") : null,
        bola: d("bola"),
      };
    case "salida":
      return { ...nada, altitud: d("altitud") };
    default:
      return nada;
  }
}

export function semaforoLento(ev: EvaluacionLento | null, m: Muestra | null): Record<CampoLento, Luz> {
  const d = desviaciones(ev, m);
  return Object.fromEntries(CAMPOS_LENTO.map((c) => [c, luz(d[c], toleranciaLento(ev?.nivel)[c])])) as Record<CampoLento, Luz>;
}

const PROPIOS: Record<Idioma, { corto: { rumbo: string }; nombre: { rumbo: string }; correccion: Pick<Record<CampoLento, { mas: string; menos: string }>, "rumbo" | "velocidad" | "inclinacion"> }> = {
  es: {
    corto: { rumbo: "Cuida el rumbo" },
    nombre: { rumbo: "rumbo" },
    correccion: {
      rumbo: { mas: "Te vas a la derecha: regresa a tu rumbo", menos: "Te vas a la izquierda: regresa a tu rumbo" },
      velocidad: { mas: "Vas rápido para vuelo lento: sube un poco la nariz y reduce potencia", menos: "Vas muy lento: baja un poco la nariz y agrega potencia" },
      inclinacion: {
        mas: `Te pasas de ${INCLINACION_VIRAJE} grados: afloja la inclinación`,
        menos: `Te falta inclinación: lleva el avión a ${INCLINACION_VIRAJE} grados`,
      },
    },
  },
  en: {
    corto: { rumbo: "Watch your heading" },
    nombre: { rumbo: "heading" },
    correccion: {
      rumbo: { mas: "Drifting right: back to your heading", menos: "Drifting left: back to your heading" },
      velocidad: { mas: "Too fast for slow flight: raise the nose a little and reduce power", menos: "Too slow: lower the nose a little and add power" },
      inclinacion: { mas: `Past ${INCLINACION_VIRAJE} degrees: shallow the bank`, menos: `Not enough bank: roll to ${INCLINACION_VIRAJE} degrees` },
    },
  },
};
const PERDIDA: Record<Idioma, string> = { es: "Aviso de pérdida: baja la nariz y agrega potencia", en: "Stall warning: lower the nose and add power" };
const ORDEN_AVISOS: CampoLento[] = ["altitud", "velocidad", "rumbo", "inclinacion", "bola"];

/** El aviso de pérdida gana a todo y suena en los dos modos; luego los campos de la fase. */
export function avisoLento(ev: EvaluacionLento | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  if (ev && m?.perdida && ev.fase !== "terminado" && ev.fase !== "invalido") return { clave: "perdida", nivel: "rojo", texto: PERDIDA[idioma] };
  const p = PROPIOS[idioma];
  const textos = {
    corto: { ...CORTO[idioma], ...p.corto },
    correccion: { ...CORRECCION[idioma], ...p.correccion },
    nombre: { ...NOMBRE[idioma], ...p.nombre },
  };
  return avisoDe(desviaciones(ev, m), toleranciaLento(ev?.nivel), ORDEN_AVISOS, textos, modo, idioma);
}
