import type { Muestra } from "./evaluador.ts";
import { CAMPOS_ARCO, type CampoArco, type EvaluacionArco, type ResultadoArco } from "./evaluadorArco.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { norm180, norm360, type EjercicioArco } from "./navIfr.ts";
import { tolArco, type Nivel } from "./nivel.ts";
import { explicarInterceptacion, semaforoInterceptacion } from "./textosInterceptacion.ts";
import { ANULADO, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en los arcos DME (programa IFR, lección 3). Puro.

export type PasoArco = "radial" | "entra" | "arco" | "sal" | "terminado" | "invalido";

export function pasoArco(e: EvaluacionArco | null, _m: Muestra | null): PasoArco | null {
  if (!e) return null;
  if (e.fase === "terminado" || e.fase === "invalido") return e.fase;
  return e.fase === "hacia-arco" ? "radial" : e.fase === "entrando" ? "entra" : e.fase === "en-arco" ? "arco" : "sal";
}

const tres = (r: number) => String(Math.round(norm360(r)) || 360).padStart(3, "0");
const uno = (x: number) => String(Math.round(x * 10) / 10);

/** Hacia dónde vira al llegar al arco: depende del sentido y de si llega alejándose o acercándose. */
export const viraALaDerecha = (ej: EjercicioArco) => (ej.sentido > 0) === ej.alejandose;

function texto(paso: PasoArco, e: EvaluacionArco | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (!e) return "";
  const ej = e.ejercicio;
  const derecha = viraALaDerecha(ej);
  switch (paso) {
    case "radial": {
      const de = e.vor ? ` ${en ? "from" : "de"} ${e.vor}` : "";
      return en
        ? `Fly the ${tres(ej.desde)} radial to the ${ej.radioNm} mile arc${de}; turn ${derecha ? "right" : "left"} onto the arc, follow it to the ${tres(ej.hasta)} radial and fly inbound on it: course ${tres(ej.hasta + 180)}.`
        : `Vuela el radial ${tres(ej.desde)} hasta el arco de ${ej.radioNm} millas${de}; vira a la ${derecha ? "derecha" : "izquierda"} al arco, síguelo hasta el radial ${tres(ej.hasta)} y acércate por él: curso ${tres(ej.hasta + 180)}.`;
    }
    case "entra":
      return en ? `On the arc: ${ej.radioNm} miles.` : `En el arco: ${ej.radioNm} millas.`;
    case "arco":
      return en ? `Hold ${ej.radioNm} miles to the ${tres(ej.hasta)} radial.` : `Mantén ${ej.radioNm} millas hasta el radial ${tres(ej.hasta)}.`;
    case "sal":
      return en ? `${tres(ej.hasta)} radial: turn to course ${tres(ej.hasta + 180)}.` : `Radial ${tres(ej.hasta)}: vira al curso ${tres(ej.hasta + 180)}.`;
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(e.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenArco(antes: PasoArco | null, ahora: PasoArco | null, e: EvaluacionArco | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado" || ahora === "arco") return null;
  return texto(ahora, e, idioma) || null;
}

export function textoPasoArco(paso: PasoArco | null, e: EvaluacionArco | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, e, idioma);
}

const PASOS: PasoArco[] = ["radial", "entra", "arco", "sal"];
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Vuela el radial", "Entra al arco", "Mantén el arco", "Sal al radial"],
  en: ["Fly the radial", "Turn onto the arc", "Hold the arc", "Turn onto the radial"],
};

export function listaPasosArco(paso: PasoArco | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerArco(paso: PasoArco | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "radial") return en ? "Start the turn onto the arc about half a mile before it." : "Empieza a virar al arco como medio millas antes de llegar.";
  if (paso === "entra" || paso === "arco")
    return en ? "If the distance grows, turn about 10 degrees toward the station; if it shrinks, open up 10 degrees." : "Si la distancia crece, vira unos 10° hacia la estación; si baja, abre unos 10°.";
  if (paso === "sal") return en ? "Set the inbound course on the OBS and center the needle without overshooting." : "Pon el curso de acercamiento en el OBS y centra la barra sin pasarte.";
  return "";
}

export function semaforoArco(e: EvaluacionArco | null, m: Muestra | null): Record<CampoArco, Luz> {
  const gris: Record<CampoArco, Luz> = { entrada: "gris", distancia: "gris", salida: "gris" };
  if (!e || !m || m.navDme === undefined) return gris;
  const T = tolArco(e.nivel);
  const v = m.navDme - e.ejercicio.radioNm;
  if (e.fase === "entrando") return { ...gris, entrada: luz(Math.max(0, e.ejercicio.alejandose ? v : -v), T.distanciaNm) };
  if (e.fase === "en-arco") return { ...gris, distancia: luz(Math.abs(v), T.distanciaNm) };
  if (e.fase === "saliendo" && e.salida) return { ...gris, salida: semaforoInterceptacion(e.salida, m).sobrepaso };
  return gris;
}

/** El consejo de los 10° (solo práctica), el OBS al salir y la altitud (no se califica, spec). */
export function avisoArco(e: EvaluacionArco | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  if (!e || !m) return null;
  const en = idioma === "en";
  const ej = e.ejercicio;
  if (e.fase === "saliendo" && m.navObs !== undefined && Math.abs(norm180(m.navObs - (ej.hasta + 180))) > 5)
    return { clave: "obs", nivel: "ambar", texto: en ? `Set course ${tres(ej.hasta + 180)} on the OBS` : `Pon el curso ${tres(ej.hasta + 180)} en el OBS` };
  if (modo === "practica" && e.fase === "en-arco" && m.navDme !== undefined) {
    const v = m.navDme - ej.radioNm;
    if (v > 0.2) return { clave: "arco-afuera", nivel: "ambar", texto: en ? "Turn about 10 degrees toward the station." : "Corrige unos 10° hacia la estación." };
    if (v < -0.2) return { clave: "arco-adentro", nivel: "ambar", texto: en ? "Open up about 10 degrees, you're cutting inside." : "Abre unos 10°, te estás metiendo." };
  }
  if (e.fase !== "invalido" && e.fase !== "terminado" && Math.abs(m.altitud - e.inicio.altitud) > 300) {
    const alt = (Math.round(e.inicio.altitud / 100) * 100).toLocaleString("en-US");
    return { clave: "altitud", nivel: "ambar", texto: en ? `Hold ${alt} feet` : `Mantén ${alt} pies` };
  }
  return null;
}

export function briefingArco(idioma: Idioma, nivel: Nivel = 2): string[] {
  const T = tolArco(nivel);
  if (idioma === "en") {
    return [
      "Today you'll fly DME arcs: a circle around the VOR at a fixed distance.",
      "Fly the radial toward the arc and start your turn about half a mile before reaching it.",
      `On the arc, keep the distance within ${uno(T.distanciaNm)} miles. If it grows, turn about 10 degrees toward the station; if it shrinks, open up 10 degrees.`,
      "Near the final radial, set the inbound course on the OBS and turn onto it without overshooting.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a volar arcos DME: un círculo alrededor del VOR a una distancia fija.",
    "Vuela el radial hacia el arco y empieza a virar como medio millas antes de llegar.",
    `En el arco, mantén la distancia dentro de ${uno(T.distanciaNm)} millas. Si crece, vira unos 10° hacia la estación; si baja, abre unos 10°.`,
    "Cerca del radial final, pon el curso de acercamiento en el OBS y vira a él sin pasarte.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

export function explicarArco(r: ResultadoArco, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.entrada.length)
    mal(en
      ? `Turning onto the arc you went ${uno(r.sobrepasoEntrada)} miles past it: start the turn about half a mile earlier.`
      : `Al entrar al arco te pasaste ${uno(r.sobrepasoEntrada)} millas: empieza a virar como medio millas antes.`);
  for (const x of r.extremos)
    mal(en ? `You got to ${uno(x)} miles on the ${r.ejercicio.radioNm} mile arc.` : `Llegaste a ${uno(x)} millas en el arco de ${r.ejercicio.radioNm}.`);
  if (r.fuera.salida.length) {
    const s = r.salida ? explicarInterceptacion(r.salida, idioma).filter((l) => l.tipo === "mal") : [];
    if (s.length) lineas.push(...s);
    else mal(en ? "You didn't reach the final radial in time." : "No llegaste al radial final a tiempo.");
  }
  if (!lineas.length) lineas.push({ tipo: "bien", texto: en ? "Clean arc: on the distance and onto the radial without overshooting." : "Arco limpio: en la distancia y al radial sin pasarte." });
  return lineas;
}

export function repetirArco(r: ResultadoArco, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: DME arc" : "Repite: arco DME";
}

const ETIQUETA: Record<Idioma, Record<CampoArco, string>> = {
  es: { entrada: "la entrada al arco", distancia: "mantener la distancia del arco", salida: "la salida al radial" },
  en: { entrada: "turning onto the arc", distancia: "holding the arc distance", salida: "turning onto the final radial" },
};

export function masFalladoArco(rs: ResultadoArco[], idioma: Idioma): string | null {
  let peor: CampoArco | null = null;
  let max = 0;
  for (const c of CAMPOS_ARCO) {
    const n = rs.filter((r) => r.fuera[c].length).length;
    if (n > max) [peor, max] = [c, n];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was ${ETIQUETA.en[peor]}.` : `Lo que más se te complicó fue ${ETIQUETA.es[peor]}.`;
}

export function paraGuardarArco(r: ResultadoArco): object {
  const { muestras: _, salida, ...resto } = r;
  return { ...resto, salida: salida ? { ...salida, muestras: [] } : null };
}
