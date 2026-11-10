import type { Muestra } from "./evaluador.ts";
import {
  CAMPOS_CIRCUITO, desvioCircuito, INCLINACION_MAX, PATRON_AGL, toleranciaCircuito, VEL_CIRCUITO,
  type CampoCircuito, type EvaluacionCircuito, type ResultadoCircuito,
} from "./evaluadorCircuito.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolCircuito, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en toques y despegues, el briefing y la explicación. Puro.

export type PasoCircuito = "despega" | "ascenso" | "cruzado" | "viento-cola" | "base" | "final" | "toque" | "terminado" | "invalido";

export function pasoCircuito(ev: EvaluacionCircuito | null, _m: Muestra | null): PasoCircuito | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  if (ev.fase === "armado" || ev.etapa === "carrera") return "despega";
  return ev.etapa;
}

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const { vr, cola } = VEL_CIRCUITO;
const [al, ah] = VEL_CIRCUITO.ascenso;
const [fl, fh] = VEL_CIRCUITO.final;

function texto(paso: PasoCircuito, ev: EvaluacionCircuito | null, idioma: Idioma): string {
  const en = idioma === "en";
  const p = pies((ev?.elevacion ?? 0) + PATRON_AGL);
  switch (paso) {
    case "despega": return en ? `Takeoff: rotate at ${vr} knots.` : `Despegue: rota a ${vr} nudos.`;
    case "ascenso": return en ? `Climb: between ${al} and ${ah} knots up to ${p} feet.` : `Ascenso: entre ${al} y ${ah} nudos hasta ${p} pies.`;
    case "cruzado": return en ? `Crosswind: keep climbing to ${p} feet.` : `Viento cruzado: sigue ascendiendo a ${p} pies.`;
    case "viento-cola": return en ? `Downwind: ${p} feet and ${cola} knots.` : `Viento en cola: ${p} pies y ${cola} nudos.`;
    case "base": return en ? `Base: power back and descend, no more than ${INCLINACION_MAX} degrees of bank.` : `Base: reduce y baja, sin pasar de ${INCLINACION_MAX} grados de inclinación.`;
    case "final": return en ? `Final: between ${fl} and ${fh} knots.` : `Final: entre ${fl} y ${fh} nudos.`;
    case "toque": return en ? "Touchdown." : "Toque.";
    case "terminado": return en ? "Circuit complete." : "Circuito terminado.";
    case "invalido": return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

/** El toque no se ordena: el repaso dice si sigue otro circuito o es el último. */
export function ordenCircuito(antes: PasoCircuito | null, ahora: PasoCircuito | null, ev: EvaluacionCircuito | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado" || ahora === "toque") return null;
  return texto(ahora, ev, idioma);
}

export function textoPasoCircuito(paso: PasoCircuito | null, ev: EvaluacionCircuito | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

type CampoAviso = Exclude<CampoCircuito, "rotacion" | "toque">;
const AVISOS: CampoAviso[] = ["inclinacion", "final", "ascenso", "altitud", "velocidad"];

function desviaciones(ev: EvaluacionCircuito | null, m: Muestra | null): Record<CampoCircuito, number | null> {
  return Object.fromEntries(CAMPOS_CIRCUITO.map((c) => [c, ev && m ? desvioCircuito(m, ev, c) : null])) as Record<CampoCircuito, number | null>;
}

export function semaforoCircuito(ev: EvaluacionCircuito | null, m: Muestra | null): Record<CampoAviso, Luz> {
  const d = desviaciones(ev, m);
  const tol = toleranciaCircuito(ev?.nivel);
  return Object.fromEntries(AVISOS.map((c) => [c, luz(d[c], tol[c])])) as Record<CampoAviso, Luz>;
}

const AVISO_TEXTOS: Record<Idioma, { corto: Record<CampoAviso, string>; nombre: Record<CampoAviso, string>; correccion: Record<CampoAviso, { mas: string; menos: string }> }> = {
  es: {
    corto: { ascenso: "Cuida la velocidad", altitud: "Cuida la altitud", velocidad: "Cuida la velocidad", inclinacion: "Cuida la inclinación", final: "Cuida la velocidad" },
    nombre: { ascenso: "velocidad", altitud: "altitud", velocidad: "velocidad", inclinacion: "inclinación", final: "velocidad" },
    correccion: {
      ascenso: { mas: "Vas rápido: sube un poco la nariz", menos: "Vas lento: baja un poco la nariz" },
      altitud: { mas: "Vas alto: regresa a la altitud del circuito", menos: "Vas bajo: regresa a la altitud del circuito" },
      velocidad: { mas: "Vas rápido: reduce un poco la potencia", menos: "Vas lento: agrega potencia" },
      inclinacion: { mas: `Te pasas de ${INCLINACION_MAX} grados: afloja la inclinación`, menos: `Te pasas de ${INCLINACION_MAX} grados: afloja la inclinación` },
      final: { mas: "Vas rápido en final: sube un poco la nariz", menos: "Vas lento en final: baja un poco la nariz" },
    },
  },
  en: {
    corto: { ascenso: "Watch your airspeed", altitud: "Watch your altitude", velocidad: "Watch your airspeed", inclinacion: "Watch your bank", final: "Watch your airspeed" },
    nombre: { ascenso: "airspeed", altitud: "altitude", velocidad: "airspeed", inclinacion: "bank", final: "airspeed" },
    correccion: {
      ascenso: { mas: "Fast: raise the nose a little", menos: "Slow: lower the nose a little" },
      altitud: { mas: "High: back to pattern altitude", menos: "Low: back to pattern altitude" },
      velocidad: { mas: "Fast: reduce power a little", menos: "Slow: add power" },
      inclinacion: { mas: `Past ${INCLINACION_MAX} degrees: shallow the bank`, menos: `Past ${INCLINACION_MAX} degrees: shallow the bank` },
      final: { mas: "Fast on final: raise the nose a little", menos: "Slow on final: lower the nose a little" },
    },
  },
};

export function avisoCircuito(ev: EvaluacionCircuito | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  return avisoDe(desviaciones(ev, m), toleranciaCircuito(ev?.nivel), AVISOS, AVISO_TEXTOS[idioma], modo, idioma);
}

export function briefingCircuito(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolCircuito(nivel);
  const mil = pies(PATRON_AGL);
  if (idioma === "en") {
    return [
      "Today you'll practice touch and goes in the Cessna 172: 5 traffic patterns, left or right.",
      `Takeoff: rotate at ${vr} kt and climb between ${al} and ${ah} kt (margin: ${T.velocidadKt} kt outside the band).`,
      `Pattern at ${mil} ft above the ground ±${T.altitudFt} ft, about ${cola} kt ±${T.velocidadKt} kt on downwind. Turns no steeper than ${INCLINACION_MAX}° (margin ${T.inclinacionGrados}°).`,
      `Final between ${fl} and ${fh} kt (margin ${T.velocidadKt} kt). Touch down descending no faster than ${T.toqueFpm} ft/min.`,
      "After each touchdown add full power and take off again; the last pattern ends with a full-stop landing. If you stop on the runway earlier, the lesson ends there.",
    ];
  }
  return [
    "Hoy vas a practicar toques y despegues en el Cessna 172: 5 circuitos de tránsito, por la izquierda o por la derecha.",
    `Despegue: rota a ${vr} kt y asciende entre ${al} y ${ah} kt (margen: ${T.velocidadKt} kt fuera de la banda).`,
    `Circuito a ${mil} ft sobre el terreno ±${T.altitudFt} ft, unos ${cola} kt ±${T.velocidadKt} kt en viento en cola. Virajes sin pasar de ${INCLINACION_MAX}° (margen ${T.inclinacionGrados}°).`,
    `Final entre ${fl} y ${fh} kt (margen ${T.velocidadKt} kt). Al tocar, desciende a no más de ${T.toqueFpm} ft/min.`,
    "Después de cada toque aplica potencia completa y despega otra vez; el último circuito termina con aterrizaje completo. Si te detienes antes en la pista, la lección termina ahí.",
  ];
}

const PASOS: PasoCircuito[] = ["despega", "ascenso", "cruzado", "viento-cola", "base", "final", "toque"];
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Despegue", "Ascenso", "Viento cruzado", "Viento en cola", "Base", "Final", "Toque"],
  en: ["Takeoff", "Climb", "Crosswind", "Downwind", "Base", "Final", "Touchdown"],
};

export function listaPasosCircuito(paso: PasoCircuito | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso && paso !== "invalido" ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerCircuito(paso: PasoCircuito | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "despega") return en ? "Full power, centerline, and lift the nose gently at rotation speed." : "Potencia completa, eje de la pista y sube la nariz con suavidad a la velocidad de rotación.";
  if (paso === "ascenso" || paso === "cruzado") return en ? "Pitch for the climb speed and right rudder." : "Actitud para la velocidad de ascenso y pie derecho.";
  if (paso === "viento-cola") return en ? "Level off, cruise power and trim; start down abeam the numbers." : "Nivela, potencia de crucero y compensa; empieza a bajar al través de los números.";
  if (paso === "base") return en ? "Power back, flaps as needed, and plan the turn to final." : "Reduce potencia, flaps según haga falta y planea el viraje a final.";
  if (paso === "final") return en ? "Stable approach: airspeed in the band, flare and let it settle." : "Aproximación estable: velocidad en la banda, endereza y deja que se asiente.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoCircuito, string>> = {
  es: {
    rotacion: "la rotación", ascenso: "el ascenso", altitud: "la altitud del circuito", velocidad: "la velocidad en viento en cola", inclinacion: "la inclinación",
    final: "la velocidad en final", toque: "el toque",
  },
  en: { rotacion: "rotation", ascenso: "climb", altitud: "pattern altitude", velocidad: "downwind airspeed", inclinacion: "bank", final: "final airspeed", toque: "touchdown" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;
/** «la rotación» → «Rotación», para la lista de lo que salió bien. */
const sinArticulo = (s: string) => s.replace(/^(el|la) /, "");

export function explicarCircuito(r: ResultadoCircuito, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const lim = tolCircuito(r.nivel).toqueFpm;
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  const banda = (lo: number, hi: number) => (en ? `${lo}-${hi}` : `${lo}–${hi}`);
  if (r.fuera.rotacion.length && r.rotacionKt !== null) {
    const kt = Math.round(r.rotacionKt);
    mal(r.peor.rotacion > 0
      ? en ? `You rotated at ${kt} kt: rotate at ${vr} kt, don't let it build that much speed on the runway.` : `Rotaste a ${kt} kt: rota a ${vr} kt, no dejes que acelere tanto en la pista.`
      : en ? `You rotated at ${kt} kt: wait for ${vr} kt before lifting the nose.` : `Rotaste a ${kt} kt: espera ${vr} kt antes de subir la nariz.`);
  }
  if (r.fuera.ascenso.length) {
    const kt = Math.round((r.peor.ascenso > 0 ? ah : al) + r.peor.ascenso);
    const nariz = r.peor.ascenso > 0 ? (en ? "raise the nose a little" : "sube un poco la nariz") : en ? "lower the nose a little" : "baja un poco la nariz";
    mal(en ? `You climbed at ${kt} kt: ${nariz} to stay between ${al} and ${ah}.` : `Ascendiste a ${kt} kt: ${nariz} para quedar entre ${al} y ${ah}.`);
  }
  if (r.fuera.altitud.length) {
    const alt = pies(r.patron + r.peor.altitud);
    const verbo = r.peor.altitud > 0 ? (en ? "come down" : "baja") : en ? "climb" : "sube";
    mal(en
      ? `On downwind you flew ${alt} feet and the pattern is ${pies(r.patron)}: ${verbo} and level at ${pies(PATRON_AGL)} ft above the ground.`
      : `En viento en cola volaste a ${alt} pies y el circuito es a ${pies(r.patron)}: ${verbo} y nivela a ${pies(PATRON_AGL)} ft sobre el terreno.`);
  }
  if (r.fuera.velocidad.length) {
    const kt = Math.round(cola + r.peor.velocidad);
    mal(en ? `On downwind you had ${kt} kt: set power for about ${cola}.` : `En viento en cola llevabas ${kt} kt: ajusta la potencia para unos ${cola}.`);
  }
  if (r.fuera.inclinacion.length) {
    const g = Math.round(INCLINACION_MAX + r.peor.inclinacion);
    mal(en ? `You banked up to ${g}°: in the pattern stay at ${INCLINACION_MAX}° or less.` : `Inclinaste hasta ${g}°: en el circuito no pases de ${INCLINACION_MAX}°.`);
  }
  if (r.fuera.final.length) {
    const kt = Math.round((r.peor.final > 0 ? fh : fl) + r.peor.final);
    const hacer = r.peor.final > 0 ? (en ? "raise the nose a little and reduce power" : "sube un poco la nariz y reduce potencia") : en ? "lower the nose a little" : "baja un poco la nariz";
    mal(en ? `On final you reached ${kt} kt and needed ${banda(fl, fh)}: ${hacer}.` : `En final llegaste a ${kt} kt, debías traer ${banda(fl, fh)}: ${hacer}.`);
  }
  if (r.fuera.toque.length && r.toqueFpm !== null) {
    const f = Math.round(r.toqueFpm);
    mal(en ? `You touched down at ${f} ft/min, the most is ${lim}: flare a little earlier and let it settle.` : `Tocaste a ${f} ft/min, el máximo es ${lim}: endereza un poco antes y deja que se asiente.`);
  }
  const limpios = CAMPOS_CIRCUITO.filter((k) => r.fuera[k].length === 0 && !(k === "rotacion" && r.rotacionKt === null)).map((k) => sinArticulo(ETIQUETA[idioma][k]));
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good." : ", bien."}` });
  }
  return lineas;
}

export function repetirCircuito(r: ResultadoCircuito, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: touch and goes" : "Repite: toques y despegues";
}

export function masFalladoCircuito(rs: ResultadoCircuito[], idioma: Idioma): string | null {
  let peor: CampoCircuito | null = null;
  let max = 0;
  for (const k of CAMPOS_CIRCUITO) {
    // Rotación y toque duran 0 s: cada vez fuera cuenta como un segundo.
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio + 1, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was your ${ETIQUETA.en[peor]}.` : `Lo que más se te salió fue ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como las lecciones 4 a 6. */
export function paraGuardarCircuito(r: ResultadoCircuito): Omit<ResultadoCircuito, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
